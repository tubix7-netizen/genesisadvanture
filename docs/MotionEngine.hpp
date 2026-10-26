#pragma once
/* =====================================================================================================
   MotionEngine.hpp — C++ reference of the 「약속의 길」 v8 motion layer (js/motion.js)
   Builds on the CharacterMotionController spec (RDR2 weight / BotW response) and fills in the two parts
   that were left as stubs:
     1. BlendTree   — lower-body locomotion blend space + upper-body action slot merged with a bone mask,
                      with a move-weight that hands the legs back to locomotion while the character walks.
     2. FootIK      — analytic two-bone IK per leg (law of cosines) + pelvis adjuster, driven by two
                      ground raycasts. Solves in the leg's sagittal plane, keeps the knee direction.
   Header-only, depends on glm. Angles in radians. Bind pose: character faces +Z, Y up.
   ===================================================================================================== */
#include <algorithm>
#include <array>
#include <cmath>
#include <functional>
#include <vector>
#include <glm/glm.hpp>
#include <glm/gtc/quaternion.hpp>

namespace GameEngine {

inline float Smoothstep(float a, float b, float x) { float t = std::clamp((x - a) / (b - a), 0.0f, 1.0f); return t * t * (3.0f - 2.0f * t); }
inline float ExpDecay(float rate, float dt) { return 1.0f - std::exp(-rate * dt); } // frame-rate independent lerp factor

// ------------------------------------------------------------------------------------------------ pose
enum Bone : int { Pelvis, Chest, Head, UpperArmL, ForeArmL, UpperArmR, ForeArmR, ThighL, ShinL, ThighR, ShinR, BoneCount };

struct Pose {
    std::array<glm::quat, BoneCount> rot;  // local rotations
    glm::vec3 rootOffset{0.0f};            // pelvis translation from the bind height
    Pose() { rot.fill(glm::quat(1, 0, 0, 0)); }
};

// per-bone weights: 0 = keep the base layer, 1 = take the overlay
struct BoneMask {
    std::array<float, BoneCount> w{};
    float root = 0.0f;
    static BoneMask UpperBody() { BoneMask m; m.w.fill(1.0f); for (int b : {Pelvis, ThighL, ShinL, ThighR, ShinR}) m.w[b] = 0.0f; m.w[Chest] = 0.7f; return m; } // chest keeps some of the gait twist
    static BoneMask FullBody() { BoneMask m; m.w.fill(1.0f); m.root = 1.0f; return m; }
};

inline Pose Blend(const Pose& a, const Pose& b, float t) {
    Pose o; for (int i = 0; i < BoneCount; ++i) o.rot[i] = glm::slerp(a.rot[i], b.rot[i], t);
    o.rootOffset = glm::mix(a.rootOffset, b.rootOffset, t); return o;
}
inline Pose BlendMasked(const Pose& base, const Pose& overlay, const BoneMask& m, float weight) {
    Pose o; for (int i = 0; i < BoneCount; ++i) o.rot[i] = glm::slerp(base.rot[i], overlay.rot[i], m.w[i] * weight);
    o.rootOffset = glm::mix(base.rootOffset, overlay.rootOffset, m.root * weight); return o;
}

// ------------------------------------------------------------------------------------------------ 1. blend tree
/* Locomotion blend space: samples placed on a speed axis (idle 0, walk 1.6, run 4.8, sprint 7.6 m/s).
   Action slot: an action clip either owns the whole body (pick up, kneel) or only the upper body (attack,
   wave, play the pipe). For upper-body actions the overlay weight on the legs fades out with speed:
       wMove = smoothstep(0.06, 0.45, speed / 2.2)
       legs  = mix(actionLegs, locomotionLegs, wMove)
   so standing attacks use their own stance and walking attacks keep the stride. */
struct LocomotionSample { float speed; std::function<Pose(float phase)> clip; };

class BlendTree {
public:
    std::vector<LocomotionSample> samples; // sorted by speed

    Pose EvaluateLocomotion(float speed, float phase) const {
        if (samples.empty()) return Pose{};
        if (speed <= samples.front().speed) return samples.front().clip(phase);
        for (size_t i = 1; i < samples.size(); ++i) {
            if (speed <= samples[i].speed) {
                float t = (speed - samples[i - 1].speed) / (samples[i].speed - samples[i - 1].speed);
                return Blend(samples[i - 1].clip(phase), samples[i].clip(phase), t);
            }
        }
        return samples.back().clip(phase);
    }

    struct ActionSlot { std::function<Pose(float progress)> clip; bool upperBodyOnly = false; float progress = 0.0f; float weight = 1.0f; };

    Pose Evaluate(float speed, float phase, const ActionSlot* action) const {
        Pose loco = EvaluateLocomotion(speed, phase);
        if (!action || !action->clip || action->weight <= 0.0f) return loco;
        Pose act = action->clip(action->progress);
        if (!action->upperBodyOnly) return BlendMasked(loco, act, BoneMask::FullBody(), action->weight);
        const float A = std::min(1.0f, speed / 2.2f), wMove = Smoothstep(0.06f, 0.45f, A);
        BoneMask m = BoneMask::FullBody();
        for (int b : {Pelvis, ThighL, ShinL, ThighR, ShinR}) m.w[b] = 1.0f - wMove; // legs go back to the stride
        m.root = 1.0f - 0.85f * wMove;
        m.w[Chest] = 1.0f - 0.3f * wMove;                                          // keep a little shoulder counter-twist
        return BlendMasked(loco, act, m, action->weight);
    }
};

// inertialization on a state change: keep the old pose as an offset that decays with a critically damped spring
struct InertialBlend {
    float offset = 0.0f, vel = 0.0f, halfLifeW = 13.0f;
    void Begin(float oldValue, float newValue) { offset = oldValue - newValue; }
    float Apply(float target, float dt) { const float k = halfLifeW * halfLifeW, d = 2.0f * halfLifeW; vel += (-k * offset - d * vel) * dt; offset += vel * dt; return target + offset; }
};

// ------------------------------------------------------------------------------------------------ 2. foot IK
/* Two-bone leg in its sagittal plane (y up, z forward). Thigh pitch θ1 (negative = hip flexion), knee θ2 (positive = bend).
   dir(θ) = (−cosθ, −sinθ) in (y, z), ankle = L1·dir(θ1) + L2·dir(θ1+θ2).
   Given a target ankle (ay, az): D = |target| clamped to [0.14, L1+L2−ε]
       knee  θ2 = π − acos((L1² + L2² − D²) / (2·L1·L2))
       thigh θ1 = atan2(−az, −ay) − acos((L1² + D² − L2²) / (2·L1·D))     (knee stays in front) */
struct LegChain { float thighLen = 0.43f, shinLen = 0.44f; float thighPitch = 0.0f, kneeBend = 0.0f; };

inline glm::vec2 AnkleFromAngles(const LegChain& l) {
    const float a = l.thighPitch, b = l.thighPitch + l.kneeBend;
    return { -l.thighLen * std::cos(a) - l.shinLen * std::cos(b), -l.thighLen * std::sin(a) - l.shinLen * std::sin(b) }; // (y, z) from the hip
}
inline void SolveTwoBoneIK(LegChain& l, glm::vec2 target) {
    const float L1 = l.thighLen, L2 = l.shinLen;
    const float D = std::clamp(glm::length(target), 0.14f, L1 + L2 - 0.003f);
    const float phi = std::atan2(-target.y, -target.x);
    const float knee = glm::pi<float>() - std::acos(std::clamp((L1 * L1 + L2 * L2 - D * D) / (2.0f * L1 * L2), -1.0f, 1.0f));
    const float alpha = std::acos(std::clamp((L1 * L1 + D * D - L2 * L2) / (2.0f * L1 * D), -1.0f, 1.0f));
    l.thighPitch = phi - alpha; l.kneeBend = knee;
}

/* Pelvis adjuster: rays from above each ankle give the ground height relative to the root (positive = higher).
   The pelvis drops to the lower foot (never more than maxDrop), the higher leg is shortened by IK, and the weight
   shifts sideways over the lower foot. Heights are smoothed so stepping onto a ledge does not pop.
   Weight fades with speed (1 − 0.55·A): while running the stride owns the feet and only the pelvis follows. */
class FootIKSolver {
public:
    float smoothRate = 14.0f, maxDrop = 0.22f, maxRaise = 0.12f, maxReach = 0.35f;
    float leftH = 0.0f, rightH = 0.0f, weight = 0.0f;

    // groundHeight(localX, localZ) → terrain height under that point relative to the character root
    template <class GroundFn>
    void Update(LegChain& left, LegChain& right, glm::vec3& rootOffset, float& chestRoll, float speedA, bool grounded, float dt, GroundFn groundHeight, float hipX = 0.095f) {
        const bool onTerrain = std::fabs(groundHeight(0.0f, 0.0f)) < 0.08f; // standing on a floor / deck: leave the legs alone
        weight += ((grounded && onTerrain ? 1.0f - 0.55f * speedA : 0.0f) - weight) * ExpDecay(8.0f, dt);
        if (weight < 0.01f) return;
        const glm::vec2 al = AnkleFromAngles(left), ar = AnkleFromAngles(right);
        const float hl = std::clamp(groundHeight(+hipX, al.y), -maxReach, maxReach), hr = std::clamp(groundHeight(-hipX, ar.y), -maxReach, maxReach);
        const float k = ExpDecay(smoothRate, dt); leftH += (hl - leftH) * k; rightH += (hr - rightH) * k;
        const float pelvisDrop = std::clamp(std::min({leftH, rightH, maxRaise}), -maxDrop, maxRaise);
        rootOffset.y += pelvisDrop * weight;
        const float eL = (leftH - pelvisDrop) * weight, eR = (rightH - pelvisDrop) * weight;
        if (eL > 0.004f) SolveTwoBoneIK(left, AnkleFromAngles(left) + glm::vec2(eL, 0.0f));
        if (eR > 0.004f) SolveTwoBoneIK(right, AnkleFromAngles(right) + glm::vec2(eR, 0.0f));
        const float tilt = std::clamp((leftH - rightH) * 0.5f, -0.1f, 0.1f) * weight;
        chestRoll -= tilt * 0.6f; rootOffset.x += tilt * 0.25f; // shoulders stay level, hips move over the low foot
    }
};

// ------------------------------------------------------------------------------------------------ locomotion feel
struct LocomotionFeel { float accel, decel, turn, airControl, brakePose; };
inline constexpr LocomotionFeel kFeelHeavy  {  8.5f,  6.5f,  6.5f,  4.5f, 1.3f }; // RDR2: momentum, skid stop, wide arcs
inline constexpr LocomotionFeel kFeelBalanced{ 20.0f, 16.0f, 12.0f,  8.0f, 1.0f };
inline constexpr LocomotionFeel kFeelSnappy {42.0f, 36.0f, 24.0f, 12.0f, 0.5f };  // BotW: instant pivot

struct LocomotionState { glm::vec3 velocity{0.0f}; float facing = 0.0f; float smoothedAccel = 0.0f; float brake = 0.0f; };

inline void UpdateLocomotion(LocomotionState& s, const LocomotionFeel& f, glm::vec3 wishDir, float wishSpeed, bool grounded, float dt) {
    const glm::vec3 target = (glm::length(wishDir) > 1e-4f ? glm::normalize(wishDir) : glm::vec3(0.0f)) * wishSpeed;
    const float before = glm::length(s.velocity);
    const float rate = wishSpeed > before ? (grounded ? f.accel : f.airControl) : f.decel;
    s.velocity = glm::mix(s.velocity, target, ExpDecay(rate / 3.0f, dt));
    const float speed = glm::length(s.velocity);
    if (speed > 0.25f && wishSpeed > 0.0f) {
        float want = std::atan2(s.velocity.x, s.velocity.z), d = std::remainder(want - s.facing, glm::two_pi<float>());
        s.facing += d * std::min(1.0f, dt * (grounded ? f.turn : 5.0f));
    }
    const float acc = std::clamp((speed - before) / std::max(dt, 1e-4f), -12.0f, 12.0f);
    s.smoothedAccel += (acc - s.smoothedAccel) * std::min(1.0f, dt * 6.0f);
    const float brakeTarget = std::clamp((-s.smoothedAccel - 3.2f) / 6.0f, 0.0f, 1.0f) * Smoothstep(0.8f, 3.0f, speed) * f.brakePose;
    s.brake += (brakeTarget - s.brake) * std::min(1.0f, dt * 10.0f); // drives the skid pose: lead leg planted, torso back
}

} // namespace GameEngine
