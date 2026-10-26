
// ------------------------------------------------------------------ ITEMS / RECIPES / NODES registered at load
Object.assign(GG.Game.ITEMS, { mandrake: { n: '합환채', cat: 'key', p: 0, ic: 'herb', c: '#d8b040' } });
GG.Game.TOOLS.fishrod = '낚싯대';
for (const k in NODEX) { GG.Game.NODE[k] = Object.assign({ key: k }, NODEX[k]); }
GG.Game.RECIPES.push(
  { id: 'leather', n: '무두질한 가죽', out: { leather: 1 }, in: { hide: 2, branch: 1 }, st: 'tan', d: '가죽 장인의 작업대에서 무두질해요' },
  { id: 'roast', n: '구운 고기', out: { roast: 1 }, in: { meat: 1, branch: 1 }, st: 'fire', d: '체력과 기력을 채워요' },
  { id: 'roastfish', n: '구운 잉어', out: { roastfish: 1 }, in: { carp: 1, branch: 1 }, st: 'fire' },
  { id: 'roastfish2', n: '구운 생선', out: { roastfish: 1 }, in: { barbel: 1, branch: 1 }, st: 'fire' },
  { id: 'roastfish3', n: '구운 틸라피아', out: { roastfish: 2 }, in: { tilapia: 1, branch: 1 }, st: 'fire' },
  { id: 'arrow', n: '화살 ×5', out: { arrow: 5 }, in: { branch: 2, feather: 1, stone: 1 }, d: '깃털을 단 사냥 화살' },
  { id: 'fishrod', n: '낚싯대', tool: 'fishrod', in: { branch: 2, thread: 1 }, d: '물가에서 낚시해요' },
);
const H24 = S => S.day * 24 + S.time % 24;
GG.Game.heart = function (n) { const S = GG.Game.S(); S.q.heart = clamp((S.q.heart || 0) + n, 0, 10); GG.UI.toast(`라헬의 마음 ${'♥'.repeat(S.q.heart)} (${S.q.heart})`); GG.Game.sfx('insight', { pitch: 1.3 }); GG.UI.quest(); };
GG.Game.trust = function (n) { SERVE(GG.Game.S(), n); };

// ------------------------------------------------------------------ RUNTIME STATE
const RT = { angels: [], flock: [], tw: [], raidT: 30 };
const BOSS = { on: false };

// special animals & followers for quests
function spawnSpecial(sp, x, z, o) { const C = CB(); if (C.wild().some(a => a.special && a.sp === sp && a.st !== 'gone' && a.st !== 'dead')) return; const a = C.spawn(sp, x, z, Object.assign({ special: 1, scale: 1.12, hpMul: 1.2 }, o || {})); a.home = [x, z]; }
function spawnLamb() { const Gm = GG.Game; if (Gm.npc('lostLamb')) return; Gm.spawnNPC({ id: 'lostLamb', name: '길 잃은 어린 양', animal: 'sheep', pattern: 'plain', scale: 0.55, x: -58, z: -142, wander: 2, label: '안아 데려가기' }); }
function spawnGraze(st) { const Gm = GG.Game; for (let i = 1; i <= 6; i++) { const id = 'gs' + i; if (Gm.npc(id)) continue; Gm.spawnNPC({ id, name: '라반의 양', animal: 'sheep', pattern: i === 3 ? 'spotted' : 'plain', x: 113 + (i % 3) - 1, z: -118 + Math.floor(i / 3), noTag: true, label: '몰기' }); Gm.npcFollow(id, true); } }
talk.lostLamb = (S, G) => { G.npcFollow('lostLamb', true); const st = S.side && S.side.act && S.side.act.rachelLamb; if (st) st.found = 1; G.UI.toast('어린 양이 야곱을 따라온다'); G.UI.quest(); };
for (let i = 1; i <= 6; i++) talk['gs' + i] = (S, G) => { G.npcFollow('gs' + i, true); };
steps.j5_year.talk = { laban(S, G) { if (S.q.year !== 4 || S.q.paid4) return false;
  if (S.silver >= 100) say([N('laban', '은 백 세겔이라! 장터에서 잘 팔았구나.'), J('외삼촌의 집이 번성하기를 바랍니다.')], () => { G.silver(-100); S.q.paid4 = 1; G.checkStep(); });
  else say([N('laban', `장터에서 은 100을 마련해 오너라. (지금 은 ${S.silver}) 양털, 치즈, 사냥한 가죽을 팔면 돼.`)]); } };
steps.j1_goats.talk = {}; ['goatA', 'goatB', 'goatC', 'goatD'].forEach(k => { steps.j1_goats.talk[k] = (S, G) => { G.npcFollow(k, true); G.sfx('goat'); G.UI.toast('염소가 야곱을 따라온다 · 우리까지 천천히 걸어가세요'); }; });

function refreshKids(S, G) { for (const id in KIDLOOK) { const n = G.npc(id); if (n) n.scale = kidScale(S, id); } }

// ------------------------------------------------------------------ CUTSCENES
const hAt = (x, z) => GG.Game.W().heightAt(x, z);
function dreamCine(S, G) {
  const sx = SPOTS.sleep[0], sz = SPOTS.sleep[1], h = hAt(sx, sz), bx = STAIR.x, bz = STAIR.z, by = hAt(bx, bz), top = by + STAIR.n * STAIR.dy, tz = bz - STAIR.n * STAIR.dz;
  G.UI.fade(() => { G.P.carry = null; G.P.carryArms = false; G.teleport(sx, sz, 0); G.P.sleeping = true; S.time = 23.6; S.q.dream = 1; }, () => GG.Cine.play([
    { cam: [sx + 3.2, h + 1.3, sz + 2.6], cam2: [sx + 2.4, h + 1.8, sz + 3.4], look: [sx, h + 0.3, sz], dur: 4.5, t: '야곱이 돌을 베고 누워 잠이 들었습니다. 그리고 꿈을 꾸었습니다.', ref: '창세기 28:11–12' },
    { cam: [bx + 1.5, by + 1.6, bz + 10], cam2: [bx + 4, by + 16, bz + 4], look: [bx, by + 4, bz - 4], look2: [bx, top * 0.8, tz + 4], dur: 7, t: '보니, 사닥다리가 땅 위에 서 있는데 그 꼭대기가 하늘에 닿았고, 하나님의 사자들이 그 위에서 오르락내리락하고 있었습니다.', ref: '창세기 28:12' },
    { cam: [bx + 18, by + 18, bz - 6], cam2: [bx + 14, by + 26, bz - 12], look: [bx, by + 20, bz - 14], dur: 6 },
    { cam: [bx + 3, top - 8, tz + 9], look: [bx, top + 6, tz - 6], dur: 9, n: '여호와', t: '나는 여호와니 너의 조부 아브라함의 하나님이요 이삭의 하나님이라. 네가 누워 있는 땅을 내가 너와 네 자손에게 주리니, 네 자손이 땅의 티끌 같이 되어 동서남북으로 퍼져 나갈지며, 땅의 모든 족속이 너와 네 자손으로 말미암아 복을 받으리라.', ref: '창세기 28:13–14' },
    { cam: [bx - 2, top - 14, tz + 14], cam2: [sx + 2, h + 2.2, sz + 3], look: [bx, top, tz], look2: [sx, h + 0.3, sz], dur: 9, n: '여호와', t: '내가 너와 함께 있어 네가 어디로 가든지 너를 지키며 너를 이끌어 이 땅으로 돌아오게 할지라. 내가 네게 허락한 것을 다 이루기까지 너를 떠나지 아니하리라.', ref: '창세기 28:15' },
    { fn: (S2, G2) => { S2.q.dream = 0; S2.time = 6.1; G2.P.sleeping = false; G2.P.kneel = true; }, cam: [sx + 3, h + 1.5, sz + 3], cam2: [sx + 2.4, h + 1.7, sz + 2.2], look: [sx, h + 0.8, sz], dur: 5, n: '야곱', t: '여호와께서 과연 여기 계시거늘 내가 알지 못하였도다.', ref: '창세기 28:16' },
    { cam: [sx - 3, h + 2, sz + 4], look: [sx, h + 1, sz - 3], dur: 5, n: '야곱', t: '두렵도다 이곳이여! 이것은 다른 것이 아니라 하나님의 집이요 이는 하늘의 문이로다.', ref: '창세기 28:17' },
  ], () => { G.P.kneel = false; G.snapCam(); G.go('j3_pillar'); }));
}
function feast(S, G) {
  const fx = 86, fz = -154, h = hAt(fx, fz);
  G.UI.fade(() => { S.q.feast = 1; S.time = 19.6; GG.Game.musicOverride = 'festival';
    G.npcTo('laban', fx + 2.4, fz + 2.2, -2.3, false); G.npcTo('leah', fx - 2.6, fz + 2.6, 2.4, false); G.npcTo('musician', fx - 3.6, fz - 1.4, 1.2, false); G.npcTo('shep1', fx + 2.8, fz - 2.6, -0.8, false); G.npcTo('shep2', fx, fz - 3.6, 0, false); G.npcTo('shep3', fx - 1.6, fz - 3.2, 0.4, false);
    const L = G.npc('musician'); if (L) L.act = 'gather'; G.teleport(fx, fz + 3.4, Math.PI); },
  () => GG.Cine.play([
    { cam: [fx + 10, h + 5, fz + 9], cam2: [fx + 7, h + 3.5, fz + 7], look: [fx, h + 1, fz], dur: 6, t: '라반이 그곳 사람들을 다 모아 잔치를 베풀었습니다.', ref: '창세기 29:22' },
    { cam: [fx - 5, h + 1.8, fz + 1], look: [fx + 1, h + 1.3, fz], dur: 5, t: '수금과 소고 소리가 밤늦도록 하란 들판에 울렸습니다. 야곱은 일곱 해 동안 기다린 날을 맞았습니다.' },
    { cam: [fx - 1, h + 1.7, fz + 6], look: [fx - 2.6, h + 1.4, fz + 2.6], dur: 6, t: '저녁에 라반이 그의 딸 레아를 야곱에게로 데려갔습니다. 신부는 얼굴을 가리고 있었습니다. 라반은 또 그의 여종 실바를 딸 레아에게 시녀로 주었습니다.', ref: '창세기 29:23–24' },
    { fn: (S2, G2) => { S2.time = 6.4; S2.q.feast = 0; GG.Game.musicOverride = null; G2.npcTo('leah', 79.6, -150.4, 0.8, false); G2.npcTo('laban', 83, -147.6, -2.4, false); G2.teleport(78.2, -148.6, 2.6); ['shep1', 'shep2', 'shep3'].forEach((k, i) => G2.npcTo(k, [52, 38, 54][i], [-118, -130, -131][i], 0, false)); },
      cam: [81, h + 1.8, -146], look: [79, h + 1.2, -150.6], dur: 5, t: '아침에 보니 레아라!', ref: '창세기 29:25' },
  ], () => say([J('외삼촌이 어찌하여 내게 이같이 행하셨나이까? 내가 라헬을 위하여 외삼촌을 섬기지 아니하였나이까? 외삼촌이 나를 속이심은 어찌됨이니이까?', '창세기 29:25'),
    N('laban', '언니보다 아우를 먼저 주는 것은 우리 지방에서 하지 아니하는 바이라.', '창세기 29:26'), N('laban', '이를 위하여 칠 일을 채우라. 우리가 그도 네게 주리니, 네가 또 나와 함께 칠 년 동안 섬길지니라.', '창세기 29:27'),
    T('아버지의 눈을 속였던 야곱이, 이번에는 어둠 속에서 속았습니다.'), N('leah', '…미안해요, 야곱.')], () => G.go('j5_more'))));
}
function finaleCine(S, G) {
  const fx = 151, fz = 128, h = hAt(fx, fz);
  G.UI.fade(() => { S.time = Math.max(19.6, S.time % 24); FAMF.concat(['simeon', 'levi', 'dan', 'naphtali', 'gad', 'asher', 'issachar', 'zebulun', 'dinah']).forEach((id, i, arr) => { const a = i / arr.length * Math.PI * 2; G.npcTo(id, fx + Math.cos(a) * 3.4, fz + Math.sin(a) * 3.4, Math.atan2(-Math.cos(a), -Math.sin(a)), false); const n = G.npc(id); if (n) n.sit = true; });
    G.teleport(fx + 0.4, fz - 3.2, 0); G.P.sit = true; GG.Game.musicOverride = 'epilogue'; },
  () => GG.Cine.play([
    { cam: [fx + 14, h + 7, fz + 12], cam2: [fx + 8, h + 4, fz + 8], look: [fx, h + 1, fz], dur: 6, t: '그날 밤, 이스라엘의 장막 앞에 모닥불이 피어올랐습니다.' },
    { cam: [fx + 3.5, h + 1.5, fz + 1], look: [fx, h + 1.1, fz - 2.6], dur: 5, n: '요셉', t: '아버지, 벧엘의 사다리 이야기 해 주세요!' },
    { cam: [fx - 2.6, h + 1.4, fz - 0.6], look: [fx + 0.4, h + 1.2, fz - 3.2], dur: 7, n: '이스라엘', t: '나는 형을 피해 도망치던 사람이었단다. 지팡이 하나만 들고, 돌을 베고 잠들었지. 그런데 하나님이 거기 계셨어.' },
    { cam: [fx - 1.6, h + 2.4, fz + 3], look: [fx, h + 1, fz - 1], dur: 7, n: '이스라엘', t: '"내가 너와 함께 있어 네가 어디로 가든지 너를 지키며 너를 이끌어 이 땅으로 돌아오게 할지라." 그 약속을, 하나님은 한 번도 잊지 않으셨단다.', ref: '창세기 28:15' },
    { cam: [fx + 3, h + 1.6, fz - 4], look: [fx - 1, h + 1, fz + 2], dur: 5, n: '르우벤', t: '아버지 다리는 그때 다치신 거예요?' },
    { cam: [fx - 3.2, h + 1.5, fz - 4.6], look: [fx + 0.4, h + 1.3, fz - 3.2], dur: 7, n: '이스라엘', t: '그건 얍복 강에서였지. 나는 그날 밤 그분을 붙들고 놓지 않았단다. 그리고 새 이름을 받았지. 이스라엘.', ref: '창세기 32:28' },
    { cam: [fx, h + 2, fz + 6], cam2: [fx, h + 3, fz + 7], look: [fx, h + 30, fz - 30], dur: 8, t: '야곱의 아들들은 훗날 이스라엘 열두 지파의 조상이 되었습니다. 열두째 아들 베냐민은 가나안으로 가는 길, 베들레헴 근처에서 태어나게 됩니다.', ref: '창세기 35:16–18; 49:28' },
    { cam: [fx + 2, h + 1.4, fz - 1.4], look: [fx + 3.4, h + 0.9, fz], dur: 7, t: '그리고 모닥불 곁에서 별을 올려다보던 소년 요셉의 이야기가, 이제 곧 시작됩니다.', ref: '창세기 37장' },
  ], () => { G.P.sit = false; FAMF.concat(Object.keys(KIDLOOK)).forEach(id => { const n = G.npc(id); if (n) { n.sit = false; n.schedSlot = -1; } });
    const H = S.hero; narr([{ kick: '야곱 편 끝', title: '이스라엘', t: '발꿈치를 잡던 자 야곱은 하나님을 붙들고 놓지 않는 자 이스라엘이 되었습니다. 팥죽 한 그릇에서 시작된 이야기가, 열두 지파의 시작이 되었습니다.', ref: '창세기 25–33장' },
      { kick: '나의 여정', title: `${S.day}일의 기록`, t: `깨달음 ${H.insight} · 체력 Lv ${H.lvl} · 사냥 ${Object.values(H.kills).reduce((a, b) => a + b, 0)}마리 · 물고기 ${S.stats.fish || 0}마리 · 마친 부탁 ${S.stats.quests || 0}개 · 자녀 ${(S.q.kidsBorn || []).length}명`, ref: '' },
      { kick: '계속', title: '자유롭게 지내기', t: '야곱 편의 이야기는 여기까지예요. 하지만 약속의 길은 계속됩니다. 집을 짓고, 가축을 키우고, 세겜 사람들과 어울리며 이스라엘의 가족과 마음껏 살아 보세요.', ref: '' }], () => { GG.Game.musicOverride = null; G.go('j_end'); }); }));
}

// ------------------------------------------------------------------ BOSS · 얍복 강의 씨름
const ARENA = { x: 190, z: 95, r: 13 };
function bossIntro(S, G) {
  if (S.q.bossWon) return; G.npcShow('man', true); G.npcTo('man', ARENA.x - 4, ARENA.z - 2, 0.9, false); S.time = Math.max(S.time % 24 < 6 ? 23.6 : S.time, 23.6);
  setTimeout(() => say([T('야곱은 홀로 남았더니, 어떤 사람이 날이 새도록 야곱과 씨름하였습니다.', '창세기 32:24'),
    T('씨름 안내 · 그가 몸을 낮추고 빛나면 곧 달려들어요. 점프 버튼(구르기)으로 피하면 그가 비틀거려요. 그때 A 버튼(붙잡기)! 붙잡은 동안 A를 계속 누르면 동이 터 와요. 빨간 공격 버튼도 붙잡기로 쓸 수 있어요.')], () => bossStart(S, G)), 120);
}
function bossStart(S, G) {
  const q = S.q.boss || (S.q.boss = { dawn: 0 }); q.on = 1; Object.assign(BOSS, { on: true, st: 'circle', t: 2.2, ang: Math.atan2(G.P.x - ARENA.x, G.P.z - ARENA.z), dawn: q.dawn || 0, hold: 0, hitDone: false, lim: !!S.flags.limp });
  if (!S.q.bossDay) { S.q.bossDay = 1; S.day++; } GG.Game.musicOverride = 'boss'; bossBar(true); G.UI.quest();
}
function bossBar(on) {
  let el = document.getElementById('bossBar');
  if (!el && on) { el = document.createElement('div'); el.id = 'bossBar'; el.innerHTML = '<div>어떤 사람 · 날이 새도록</div><div class="bb"><i id="bbFill"></i></div><small id="bbHint"></small>'; document.body.appendChild(el); }
  if (el) el.hidden = !on; document.body.classList.toggle('boss', !!on); RT.bar = !!on;
}
function bossHint(t) { const e = document.getElementById('bbHint'); if (e && e.textContent !== t) e.textContent = t; }
function bossPress() {
  if (!BOSS.on) return false; const P = GG.Game.P, n = GG.Game.npc('man'); if (!n) return false; const d = Math.hypot(n.x - P.x, n.z - P.z);
  if (BOSS.st === 'open' && d < 3.8) { BOSS.st = 'hold'; BOSS.t = 3.4; P.lock = true; P.face = Math.atan2(n.x - P.x, n.z - P.z); GG.Game.sfx('grunt', { pitch: 0.9 }); GG.Game.CAM.shake = 0.4; return true; }
  if (BOSS.st === 'hold') { BOSS.dawn += BOSS.lim ? 2.0 : 2.4; GG.Game.sfx('hit', { pitch: 0.6 + Math.random() * 0.2, vol: 0.5 }); GG.FX.burst(P.x + Math.sin(P.face) * 0.5, P.y + 1.2, P.z + Math.cos(P.face) * 0.5, 6, { c: [1, 0.9, 0.6], sp: 1.6, up: 1 }); return true; }
  return BOSS.st === 'open';
}
{ const _pa = GG.Game.pressAction; GG.Game.pressAction = function () { if (BOSS.on && !GG.UI.busy() && !(GG.Cine && GG.Cine.on) && bossPress()) return; _pa(); }; }
{ const _atk = GG.Combat.attack; GG.Combat.attack = function () { if (BOSS.on) { if (!GG.UI.busy()) bossPress(); return; } _atk(); }; }
{ const _ft = GG.Combat.faint; GG.Combat.faint = function () { if (BOSS.on) { const S = GG.Game.S(); BOSS.st = 'recover'; BOSS.t = 3; BOSS.dawn = Math.max(0, BOSS.dawn - 12); GG.Game.P.lock = false;
  say([T('야곱이 땅에 쓰러졌다… 그러나 다시 일어나 그를 붙들었다. (동틀 녘 −12)')], () => { S.hero.hp = Math.round(S.hero.hpMax * 0.6); GG.UI.hud(); }); return; } _ft(); }; }
function bossUpdate(dt, S, G, t) {
  const P = G.P, n = G.npc('man'); if (!n) return; const C = CB(); C.inCombat = true;
  if (GG.UI.busy() || GG.Cine.on) { n.walk = null; return; }
  const dx = P.x - n.x, dz = P.z - n.z, d = Math.hypot(dx, dz) || 0.01, face = Math.atan2(dx, dz);
  const CAM = G.CAM; if (CAM.last > 0.6 && d > 0.8) CAM.yaw += G.angDiff(CAM.yaw, Math.atan2(dx, dz)) * Math.min(1, dt * 2.6); // soft lock-on: keep him in view
  BOSS.dawn += dt * 0.22; BOSS.t -= dt; const lim = BOSS.lim;
  S.time = 0.2 + Math.min(1, BOSS.dawn / 100) * 5.2; S.q.boss.dawn = BOSS.dawn; n.tint = null;
  if (BOSS.st === 'circle') { n.act = null; BOSS.ang += dt * (lim ? 0.9 : 0.65); const R0 = 3.8; const tx = P.x + Math.sin(BOSS.ang) * R0, tz = P.z + Math.cos(BOSS.ang) * R0;
    n.walk = { x: tx, z: tz, sp: Math.min(5.5, 2.4 + Math.hypot(tx - n.x, tz - n.z) * 0.9) }; bossHint('그가 빙빙 돌며 틈을 노린다…');
    if (BOSS.t <= 0 && d < 5.4) { BOSS.st = 'windup'; BOSS.t = lim ? 0.55 : 0.75; BOSS.dodged = false; BOSS.hurt = false; n.walk = null; GG.Game.sfx('grunt', { pitch: 0.7 }); } }
  else if (BOSS.st === 'windup') { n.walk = null; n.face += G.angDiff(n.face, face) * Math.min(1, dt * 12); n.act = 'push'; n.tint = [1.7, 1.55, 1.2]; bossHint('몸을 낮췄다 — 구르기!');
    if (P.dodgeT > 0 && BOSS.t < 0.28) BOSS.dodged = true;
    if (BOSS.t <= 0) { BOSS.st = 'lunge'; BOSS.t = clamp((d + 1.0) / (lim ? 12 : 10.5), 0.3, 0.62); BOSS.dir = [dx / d, dz / d]; BOSS.hitDone = false; } }
  else if (BOSS.st === 'lunge') { const sp = lim ? 12 : 10.5; n.walk = null; n.act = 'grab'; n.x += BOSS.dir[0] * sp * dt; n.z += BOSS.dir[1] * sp * dt; n.face = Math.atan2(BOSS.dir[0], BOSS.dir[1]);
    if (P.dodgeT > 0) BOSS.dodged = true;
    if (!BOSS.hitDone && d < 1.35) { BOSS.hitDone = true; if (!BOSS.dodged) { BOSS.hurt = true; const dmg = Math.round(10 + S.hero.hpMax * (lim ? 0.1 : 0.08)); C.hurtPlayer(dmg, { x: n.x - BOSS.dir[0], z: n.z - BOSS.dir[1] }); } }
    if (BOSS.t <= 0) { if (BOSS.dodged && !BOSS.hurt) { BOSS.st = 'open'; BOSS.t = lim ? 1.4 : 1.7; GG.UI.dmg && GG.UI.dmg(P.x, P.y + 2, P.z, 0, 'dodge'); GG.Game.sfx('dodge'); } else { BOSS.st = 'recover'; BOSS.t = 0.7; } } }
  else if (BOSS.st === 'open') { n.walk = null; n.act = 'bow'; bossHint('비틀거린다 — 지금 A로 붙잡기!'); if (BOSS.t <= 0) { BOSS.st = 'circle'; BOSS.t = 1.6 + Math.random() * 1.6; } }
  else if (BOSS.st === 'hold') { n.walk = null; n.act = 'grab'; P.act = null; P.lock = true; P.atkPose = 'grab'; BOSS.dawn += dt * 1.0; const fx = Math.sin(P.face), fz = Math.cos(P.face); n.x = P.x + fx * 0.95; n.z = P.z + fz * 0.95; n.face = P.face + Math.PI;
    P.x += Math.sin(t * 2.2) * 0.004; bossHint('붙잡았다! A를 연타해 버티기'); if (BOSS.t <= 0) { BOSS.st = 'thrown'; BOSS.t = 0.4; P.lock = false; P.atkPose = null; P.vx = -fx * 7; P.vz = -fz * 7; GG.Game.CAM.shake = 0.5; GG.Game.sfx('grunt', { pitch: 0.75 }); } }
  else if (BOSS.st === 'thrown' || BOSS.st === 'recover') { n.act = null; n.walk = null; if (BOSS.t <= 0) { BOSS.st = 'circle'; BOSS.t = 1.8 + Math.random() * 1.5; } }
  n.y = G.W().heightAt(n.x, n.z); const ad = Math.hypot(n.x - ARENA.x, n.z - ARENA.z); if (ad > ARENA.r + 1) { n.x = ARENA.x + (n.x - ARENA.x) / ad * (ARENA.r + 1); n.z = ARENA.z + (n.z - ARENA.z) / ad * (ARENA.r + 1); }
  const f = document.getElementById('bbFill'); if (f) f.style.width = Math.min(100, BOSS.dawn).toFixed(1) + '%';
  // phase: the hip
  if (BOSS.dawn >= 55 && !S.flags.limp) { S.flags.limp = 1; BOSS.lim = true; BOSS.st = 'recover'; BOSS.t = 2; P.lock = false; P.atkPose = null; G.refreshLook(); GG.Game.CAM.shake = 1; GG.Game.sfx('hurt');
    say([T('그 사람이 자기가 야곱을 이기지 못함을 보고 야곱의 허벅지 관절을 치매, 야곱의 허벅지 관절이 그 사람과 씨름할 때에 어긋났더라.', '창세기 32:25'), J('(다리가… 그래도 놓을 수 없다!)')]); }
  if (BOSS.dawn >= 100) bossWin(S, G);
}
function bossWin(S, G) {
  BOSS.on = false; S.q.boss.on = 0; const P = G.P, n = G.npc('man'); P.lock = false; P.atkPose = 'grab'; if (n) { n.walk = null; n.act = 'grab'; n.x = P.x + Math.sin(P.face) * 0.95; n.z = P.z + Math.cos(P.face) * 0.95; n.face = P.face + Math.PI; }
  S.time = 5.4; bossHint('');
  say([N('man', '날이 새려 하니 나로 가게 하라.', '창세기 32:26'), J('당신이 내게 축복하지 아니하면 가게 하지 아니하겠나이다.', '창세기 32:26')], () =>
    G.UI.minigame('count', { title: '붙들고 놓지 않기', hint: '축복하기 전에는 놓지 않아요. 버튼을 계속 누르세요!', need: 14, btn: '붙들기', onPress: () => { GG.Game.CAM.shake = 0.25; GG.Game.sfx('hit', { pitch: 0.55, vol: 0.4 }); } }, () =>
      say([N('man', '네 이름이 무엇이냐?', '창세기 32:27'), J('야곱이니이다.', '창세기 32:27'), N('man', '네 이름을 다시는 야곱이라 부를 것이 아니요 이스라엘이라 부를 것이니, 이는 네가 하나님과 및 사람들과 겨루어 이겼음이니라.', '창세기 32:28'),
        J('청하건대 당신의 이름을 알려 주소서.', '창세기 32:29'), N('man', '어찌하여 내 이름을 묻느냐?', '창세기 32:29'), T('그가 거기서 야곱에게 축복하였습니다.', '창세기 32:29')], () => peniel(S, G))));
}
function peniel(S, G) {
  const h = hAt(ARENA.x, ARENA.z); bossBar(false); G.P.atkPose = null;
  GG.Cine.play([
    { fn: (S2, G2) => { G2.npcShow('man', false); S2.time = 5.5; GG.Game.musicOverride = 'dream'; G2.P.kneel = true; }, cam: [ARENA.x - 6, h + 2.2, ARENA.z + 5], cam2: [ARENA.x - 7, h + 3.5, ARENA.z + 6], look: [ARENA.x + 20, h + 3, ARENA.z - 2], dur: 7, t: '야곱이 그 곳 이름을 브니엘이라 하였으니, "내가 하나님과 대면하여 보았으나 내 생명이 보전되었다" 함이더라.', ref: '창세기 32:30' },
    { fn: (S2) => { S2.time = 6.2; }, cam: [ARENA.x + 6, h + 1.6, ARENA.z + 3], look: [ARENA.x, h + 1.2, ARENA.z], dur: 6, t: '그가 브니엘을 지날 때에 해가 돋았고, 그의 허벅다리로 말미암아 절었더라.', ref: '창세기 32:31' },
  ], () => { G.P.kneel = false; S.q.bossWon = 1; GameMusic(null); G.setOutfit('israel');
    narr([{ kick: '이스라엘', title: '하나님과 겨루어 이긴 자', t: '발꿈치를 잡던 자 야곱은, 이제 하나님을 붙들고 놓지 않는 자 이스라엘이 되었습니다.', ref: '창세기 32:28' }], () => { G.insight(3, '이스라엘'); G.go('j8_esau'); }); });
}
const GameMusic = m => { GG.Game.musicOverride = m; };
steps.j8_boss.list = S => [{ t: `동틀 녘 ${Math.min(100, Math.round((S.q.boss && S.q.boss.dawn) || 0))}%`, ok: false }, { t: '달려들 때 구르기 → 비틀거리면 A로 붙잡기 → A 연타' }];

// ------------------------------------------------------------------ ESAU · EPILOGUE TRANSITION
steps.j8_meet.talk = { esau(S, G) {
  G.UI.minigame('count', { title: '일곱 번 절하기', hint: '형에게 가까이 가며 일곱 번 땅에 굽혀 절해요.', need: 7, btn: '절하기', onPress: () => { G.P.act = 'bow'; G.P.actT = 0; G.P.actDur = 0.6; G.P.actHits = 1; G.P.fired = true; } }, () => {
    T0(() => say([T('야곱이 앞서 나아가되 그의 형에게 가까이 가기까지 일곱 번 땅에 굽혔더니, 에서가 달려와서 그를 맞이하여 안고 목을 어긋맞추어 그와 입 맞추고 서로 울었습니다.', '창세기 33:3–4'), N('esau', '너와 함께 한 이들은 누구냐?', '창세기 33:5'), J('하나님이 주의 종에게 은혜로 주신 자식들이니이다.', '창세기 33:5'),
      N('esau', '내 동생아, 내게 있는 것이 족하니 네 소유는 네게 두라.', '창세기 33:9'), J('아니니이다. 내가 형님의 얼굴을 뵈온즉 하나님의 얼굴을 본 것 같사오며, 형님도 나를 기뻐하심이니이다. 하나님이 내게 은혜를 베푸셨으니 청하건대 내가 형님께 드리는 예물을 받으소서.', '창세기 33:10–11'),
      T('야곱이 강권하매 에서가 받았습니다. 그 날에 에서는 세일로 돌아갔습니다.', '창세기 33:11, 16')], () => { G.npcWalk('esau', 262, 104, () => G.npcShow('esau', false), 2); for (let i = 1; i <= 6; i++) G.npcWalk('sold' + i, 262 + i, 100 + i, null, 2);
        G.insight(2, '형제의 화해'); toEpilogue(S, G); }), G.npcWalk('esau', G.P.x + 1.2, G.P.z + 0.4, null, 5));
  });
} };
function T0(fn, pre) { setTimeout(fn, 1500); }
function toEpilogue(S, G) {
  narr([{ kick: '창세기 33:17–18', title: '숙곳과 세겜', t: '야곱은 숙곳에 이르러 자기를 위하여 집을 짓고 가축을 위하여 우릿간을 지었습니다. 그리고 가나안 땅 세겜 성읍에 평안히 이르러 그 성 앞에 장막을 쳤습니다.', ref: '창세기 33:17–18' }], () => G.UI.fade(() => {
    S.q.epi = 1; S.q.flock = 0; RT.flock.length = 0; const hj = G.herd('jacob'), hi = G.herd('israel'); if (hj && hi) { hi.list = hi.list.concat(hj.list); hj.list = []; } G.refreshAnimals();
    FAMF.forEach(k => G.npcFollow(k, false)); for (const id in KIDLOOK) { const n = G.npc(id); if (n) n.schedSlot = -1; } ['rachel', 'leah', 'bilhah', 'zilpah'].forEach(k => { const n = G.npc(k); if (n) n.schedSlot = -1; });
    refreshKids(S, G); G.teleport(156, 132, -2.2); S.time = 8; G.unlock('garden');
  }, () => G.go('ep_start')));
}
npcs.push({ id: 'hamor', name: '하몰의 아들', look: Object.assign({}, LOOK.merchant, { clothCol: 0xe8dcc0, stripes: [0x6a3a2a, 0xe0c070], stripesB: [0x6a3a2a, 0xe0c070] }), x: 170, z: 134, face: -1.8, show: epi, sched: S => epi(S) ? [[7, 170, 134, -1.8, 'wander:3'], [19, 186, 140, 0, 'hide']] : null });

// ------------------------------------------------------------------ WORLD RUNTIME
const wildZones = [
  { id: 'south', x: 20, z: 112, r: 48, sp: [['gazelle', 3], ['hare', 4], ['partridge', 3]], max: 5, on: S => before(S, 'j3_start') || epi(S) },
  { id: 'road', x: -12, z: -10, r: 46, sp: [['hare', 3], ['partridge', 3], ['gazelle', 2]], max: 4, on: S => between(S, 'j3_start', 'j7_call') },
  { id: 'eastPlain', x: 172, z: -160, r: 32, sp: [['gazelle', 4], ['hare', 3], ['partridge', 3], ['wolf', 4, 'night']], max: 6, nightMax: 5, on: inHaran },
  { id: 'reeds', x: 22, z: -150, r: 22, sp: [['boar', 3], ['partridge', 2], ['hare', 2]], max: 4, on: inHaran },
  { id: 'grove', x: 35, z: -218, r: 24, sp: [['deer', 4], ['hare', 2], ['boar', 2], ['wolf', 3, 'night']], max: 5, on: inHaran },
  { id: 'ibex', x: -72, z: -150, r: 26, sp: [['ibex', 4], ['partridge', 2], ['hare', 1]], max: 4, on: inHaran },
  { id: 'thicket', x: 195, z: -205, r: 16, sp: [['boar', 2], ['hare', 2], ['wolf', 1, 'night']], max: 3, on: inHaran },
  { id: 'gilead', x: 182, z: 0, r: 40, sp: [['deer', 2], ['gazelle', 2], ['hare', 2], ['partridge', 2], ['wolf', 2, 'night']], max: 4, on: S => between(S, 'j8_start', 'j8_gift') },
  { id: 'succoth', x: 172, z: 158, r: 40, sp: [['gazelle', 3], ['hare', 3], ['partridge', 2], ['boar', 1], ['wolf', 2, 'night']], max: 5, on: epi },
];
function wildOk(x, z) { if (PADS.some(p => p.set && Math.hypot(x - p.x, z - p.z) < p.r + 8)) return false; if (Math.abs(x - 110) < 16 && Math.abs(z + 130) < 12) return false; return roadD(x, z) > 2; }
function fishAt(x, z) {
  if (Math.abs(x - riverX(z)) < 16) return [['tilapia', 5], ['barbel', 3], ['catfish', 2], ['gfish', 0.25]];
  if (Math.hypot(x - POND.x, z - POND.z) < POND.r + 4) return [['carp', 6], ['catfish', 1.4], ['barbel', 1], ['gfish', 0.6]];
  return [['carp', 6], ['barbel', 4], ['catfish', 1.5], ['gfish', 0.2]];
}
function music(S, G, hr) {
  if (S.q.dream) return 'dream'; if (BOSS.on || S.step === 'j8_boss') return 'boss'; if (S.q.feast) return 'festival';
  if (CB().inCombat) return 'combat'; if (S.q.angels) return 'dream';
  if (hr < 5.2 || hr > 20.6) return 'night'; if (epi(S)) return 'epilogue';
  if (G.P.z > 60) return before(S, 'j3_start') && G.dist(8, 166) < 45 ? 'camp' : 'desert';
  if (inHaran(S) && S.q.phase === 'family' && G.dist(150, -108) < 26) return 'camp';
  return 'haran';
}
function ledger(S, G) {
  const rows = []; const Y = S.q.phase === 'family' ? FYEARS[(S.q.fy || 1) - 1] : YEARS[(S.q.year || 1) - 1];
  if ((S.step === 'j5_year' || S.step === 'j6_start') && Y) rows.push([S.q.phase === 'family' ? `다시 칠 년 · ${S.q.fy}년째 섬김` : `라헬을 위한 ${S.q.year}년째 섬김`, `${Math.min(Y.serve, serveY(S))}/${Y.serve}`, serveY(S) / Y.serve]);
  rows.push(['라헬의 마음', '♥'.repeat(heart(S)) || '·']); rows.push(['라반의 가축', labanN(G)]); if (built(S, 'jacobFold')) rows.push(['야곱의 가축', jacobN(G)]);
  rows.push(['일꾼', ['hireShep', 'hireHand', 'hireWeaver', 'stall'].filter(k => built(S, k)).length + '명']); rows.push(['자녀', (S.q.kidsBorn || []).length + '명']); rows.push(['마친 부탁', S.stats.quests || 0]);
  return { title: epi(S) ? '이스라엘의 장막' : '라반 집안 장부', rows };
}
function onDay(S, G) {
  const msgs = [];
  if (inHaran(S)) {
    const h = G.herd('laban');
    if (built(S, 'hireShep') && h) { h.trough = 12; S.stats.troughFill = (S.stats.troughFill || 0) + 1; SERVE(S, 1); }
    if (built(S, 'hireHand')) { for (const id in S.plots) { const p = S.plots[id]; if (p.s === 2 && (id.startsWith('barleyL:') || id.startsWith('wheatL:'))) p.w = 1; } SERVE(S, 2); }
    if (built(S, 'hireWeaver')) { const n = Math.min(4, Math.floor(G.inv('wool') / 2)); if (n) { G.take('wool', n * 2); G.give('thread', n, true); msgs.push(`직조공이 실 ${n}타래를 자았다`); } SERVE(S, 2); }
    if (built(S, 'stall')) { const e = 6 + Math.floor(labanN(G) / 8); G.silver(e); msgs.push(`장터 좌판에서 은 ${e}을 벌었다`); SERVE(S, 1); }
    if (built(S, 'granary')) SERVE(S, 2);
    if (h && h.list.length > 16 && !built(S, 'hireShep') && Math.random() < 0.18) { G.removeAnimals('laban', 1); msgs.push('밤사이 들짐승이 양 한 마리를 물어 갔다… "물려 찢긴 것은 내가 물어냈으며" (창 31:39)'); }
  }
  if (msgs.length) setTimeout(() => { let i = 0; const nx = () => { if (i < msgs.length) { G.UI.toast(msgs[i++]); setTimeout(nx, 2700); } }; nx(); }, 2200);
}
function onLoad(S, G) {
  if (!steps[S.step]) { S.step = { j1: 'j1_start', j2: 'j2_start', j3: 'j3_start', j4: 'j4_start', j5: 'j5_start', j6: 'j7_wage', j7: 'j8_start' }[String(S.step).slice(0, 2)] || 'j1_start'; S.q.migrated = 1; } // saves from the older story layout
  G.CROPS.lentil.days = [1];
  if (S.day === 1 && !S.q.milkInit) { S.q.milkInit = 1; const h = G.herd('isaacGoats'); if (h) h.milk = true; }
  S.q.feast = 0; GG.Game.musicOverride = null; BOSS.on = false; bossBar(false); RT.flock.length = 0; RT.angels.length = 0; RT.tw.length = 0;
  const act = (S.side && S.side.act) || {};
  if (act.rachelLamb && !act.rachelLamb.home) { spawnLamb(); if (act.rachelLamb.found) G.npcFollow('lostLamb', true); }
  if (act.rachelGraze && !act.rachelGraze.back) spawnGraze(act.rachelGraze);
  if (act.lion) spawnSpecial('lion', SPOTS.thicket[0], SPOTS.thicket[1], { name: '덤불의 늙은 사자' }); if (act.bear) spawnSpecial('bear', SPOTS.bearDen[0], SPOTS.bearDen[1] + 4, { name: '굴의 큰곰' });
  if (act.epJoseph) G.npcFollow('joseph', true); if (act.epReuben) G.npcFollow('reuben', true);
  if (between(S, 'j8_start', 'j8_ford') && S.step !== 'j8_ford' || S.step === 'j8_ford') { FAMF.forEach(k => G.npcFollow(k, true)); S.q.flock = 1; }
  refreshKids(S, G); dropLoan(S, G);
}
function dropLoan(S, G) { if (!before(S, 'j3_start') && GG.Ride) for (const m of (S.mounts || []).filter(m => m.loan)) GG.Ride.remove(m.id); }
function canSleep(S) { return S.step === 'j1_sleep'; }
function bounds(P, S) { if (!BOSS.on) return; const d = Math.hypot(P.x - ARENA.x, P.z - ARENA.z); if (d > ARENA.r) { P.x = ARENA.x + (P.x - ARENA.x) / d * ARENA.r; P.z = ARENA.z + (P.z - ARENA.z) / d * ARENA.r; } }
function context(S, G) { if (!BOSS.on || BOSS.st !== 'open') return null; const n = G.npc('man'); if (!n || G.dist(n.x, n.z) > 3.8) return null; return [{ d: -9, label: '붙잡기!', x: n.x, z: n.z, y: 2.2, use: () => bossPress(), key: 'boss' }]; }
function mood(S, G) {
  if (S.q.dream) return { mod(e) { e.skyTop = [0.08, 0.06, 0.22]; e.skyHor = [0.55, 0.38, 0.5]; e.fogCol = [0.28, 0.2, 0.36]; e.sunCol = [1.0, 0.85, 0.6]; e.skyAmb = [0.5, 0.42, 0.6]; e.gndAmb = [0.25, 0.18, 0.3]; e.night = 1; e.sunDir = [0.2, 0.75, -0.6]; e.fogDen = 1 / 160; e.cloudCol = [0.6, 0.45, 0.7]; } };
  if (BOSS.on || S.step === 'j8_boss') return { mod(e) { const k = 1 - Math.min(1, (BOSS.dawn || 0) / 100) * 0.6; e.skyAmb = e.skyAmb.map((v, i) => v * (1 + 1.1 * k) + [0.05, 0.06, 0.1][i] * k); e.gndAmb = e.gndAmb.map((v, i) => v * (1 + 0.9 * k) + [0.04, 0.04, 0.07][i] * k); e.sunCol = e.sunCol.map((v, i) => v + [0.08, 0.1, 0.16][i] * k); } };
  return null;
}

function update(dt, S, G, t) {
  const P = G.P, W = G.W(), hr = S.time % 24, night = hr > 20.2 || hr < 5.2;
  if (inHaran(S)) S.q.serve = Math.floor(serveMetric(S));
  if (S.step === 'j3_start' && (S.mounts || []).some(m => m.loan)) { if (G.P.ride && G.P.ride.m.loan) GG.Ride.dismount(true); dropLoan(S, G); G.UI.toast('이삭의 나귀는 브엘세바에 두고 지팡이 하나만 들고 떠나요 (창 32:10)'); }
  if (RT.bar && !BOSS.on && !GG.UI.busy()) bossBar(false);
  // ch1: goats into Isaac's pen
  if (S.step === 'j1_goats') for (const f of P.follow.slice()) { if (!/^goat[A-D]$/.test(f.id)) continue; if (Math.hypot(f.x + 22, f.z - 161.5) < 5.5) { G.npcFollow(f.id, false); (S.q.gin = S.q.gin || {})[f.id] = 1; S.q.goatsIn = (S.q.goatsIn || 0) + 1; G.addAnimal('isaacGoats', 'goat', f.d.pattern || 'plain', 0, 12); G.sfx('goat'); G.UI.toast(`염소가 우리로 들어갔다 (${S.q.goatsIn}/4)`); G.UI.quest(); G.checkStep(); } }
  // quests with followers
  const act = (S.side && S.side.act) || {};
  if (act.rachelLamb && G.npc('lostLamb') && G.npc('lostLamb').follow && Math.hypot(G.npc('lostLamb').x - 113, G.npc('lostLamb').z + 120.6) < 6) { G.removeNPC('lostLamb'); G.addAnimal('laban', 'sheep', 'plain', 0, 3); act.rachelLamb.home = 1; G.sfx('bleat'); G.UI.quest(); }
  if (act.rachelGraze && !act.rachelGraze.back) { const st = act.rachelGraze, fl = P.follow.filter(f => /^gs\d$/.test(f.id));
    if (!st.drank && fl.length && fl.every(f => Math.hypot(f.x - 43, f.z + 121) < 10)) { st.drank = 1; G.sfx('bleat'); GG.Life.bubble(fl[0].id, '매애~', 2); G.UI.toast('양들이 구유의 물을 마셨다'); G.UI.quest(); }
    if (st.drank && fl.length && Math.hypot(P.x - 113, P.z + 120.6) < 6) { fl.forEach(f => G.removeNPC(f.id)); st.back = 1; G.UI.quest(); }
    for (const f of fl) if (Math.hypot(f.x - P.x, f.z - P.z) > 30) { f.x = P.x - 2; f.z = P.z - 2; } }
  // night wolf raids on Laban's fold
  if (inHaran(S) && night && yr(S) >= 2 && G.dist(110, -125) < 130 && !GG.UI.busy()) { RT.raidT -= dt;
    if (RT.raidT <= 0) { RT.raidT = (built(S, 'hireShep') ? 150 : 80) * (S.q.wolfQ ? 0.6 : 1) * (0.7 + Math.random() * 0.6);
      const live = CB().wild().filter(a => a.raid && a.st !== 'dead' && a.st !== 'gone').length;
      if (live < 2) { const a0 = Math.random() * 6.28; const x = 113 + Math.cos(a0) * 46, z = -120 + Math.sin(a0) * 46; if (W.heightAt(x, z) > (W.water ? W.water.level + 0.2 : -9)) { const n = 1 + (Math.random() < 0.5 ? 1 : 0); for (let i = 0; i < n; i++) { const w = CB().spawn('wolf', x + i * 1.6, z + i, { zone: 'raid' }); w.raid = 1; } G.sfx('howl'); G.UI.toast('늑대가 라반의 양 떼를 노린다! 우리로 달려가세요'); } } } }
  for (const a of CB().wild()) { if (!a.raid || a.st === 'dead' || a.st === 'gone') continue;
    if (a.st === 'idle' || a.st === 'wander') { a.st = 'wander'; a.tx = 113; a.tz = -117; a.t = 8; const dx = 113 - a.x, dz = -117 - a.z, d = Math.hypot(dx, dz) || 1; a.x += dx / d * 1.6 * dt; a.z += dz / d * 1.6 * dt;
      if (d < 4.5) { if (G.removeAnimals('laban', 1)) G.UI.toast('늑대가 양 한 마리를 물어 갔다… (창 31:39)'); a.st = 'gone'; } }
    if (!night && a.st !== 'chase') a.st = 'gone'; }
  // tumbleweeds in the southern desert
  tumble(dt, S, G, t);
  // angels (dream & Mahanaim)
  if (S.q.dream || S.q.angels) {
    if (!RT.angels.length) for (let i = 0; i < (S.q.dream ? 10 : 8); i++) RT.angels.push({ rig: new Rig(HB), k: i / 10, sp: (i % 2 ? 1 : -1) * 0.028, mesh: G.lookMesh(LOOK.angel), st: { phase: 0, long: true, speed: 1.1 } });
    const by = W.heightAt(STAIR.x, STAIR.z);
    for (const a of RT.angels) { a.k = (a.k + a.sp * dt + 1) % 1; let x, y, z, face;
      if (S.q.dream) { const i = a.k * STAIR.n; x = STAIR.x + (a.sp > 0 ? 0.65 : -0.65); z = STAIR.z - i * STAIR.dz; y = by + 0.42 + Math.floor(i) * STAIR.dy; face = a.sp > 0 ? Math.PI : 0; }
      else { const ang = a.k * Math.PI * 2 * (a.sp > 0 ? 1 : -1); x = 178 + Math.cos(ang) * 9; z = 40 + Math.sin(ang) * 9; y = W.heightAt(x, z) + 0.2 + Math.sin(t * 2 + a.k * 9) * 0.15; face = ang + Math.PI / 2 * (a.sp > 0 ? 1 : -1); }
      a.st.phase += dt * 3; a.st.face = face; animHuman(a.rig, a.st, t); a.rig.update(m4trs(a.M || (a.M = m4()), x, y, z, face)); }
  } else if (RT.angels.length) RT.angels.length = 0;
  // following flock (ch8)
  if (S.q.flock) {
    if (!RT.flock.length) { const list = G.herd('jacob') ? G.herd('jacob').list : []; const n = Math.min(14, list.length); for (let i = 0; i < n; i++) { const a = list[Math.floor(i * list.length / n)]; RT.flock.push({ sp: a[0], rig: new Rig(AB[a[0]]), mesh: G.animalMesh(a[0], a[1], a[0] === 'camel' ? { saddle: 0xb3472e } : null), x: P.x - 4 - Math.random() * 6, z: P.z + Math.random() * 6 - 3, face: 0, ph: 0, off: [Math.random() * 7 - 3.5, -6 - Math.random() * 8] }); } }
    for (const f of RT.flock) { const tx = P.x - Math.sin(P.face) * (-f.off[1]) + Math.cos(P.face) * f.off[0], tz = P.z - Math.cos(P.face) * (-f.off[1]) - Math.sin(P.face) * f.off[0];
      const dx = tx - f.x, dz = tz - f.z, d = Math.hypot(dx, dz); let sp = 0; if (d > 0.6) { sp = Math.min(d * 1.4, 5.5); f.x += dx / d * sp * dt; f.z += dz / d * sp * dt; f.face += G.angDiff(f.face, Math.atan2(dx, dz)) * Math.min(1, dt * 5); } if (d > 40) { f.x = tx; f.z = tz; }
      f.ph += sp * dt * 3.5; animAnimal(f.rig, { speed: sp, phase: f.ph, graze: !sp && Math.sin(t + f.off[0]) > 0 }, t); f.rig.update(m4trs(f.M || (f.M = m4()), f.x, W.heightAt(f.x, f.z), f.z, f.face)); }
  } else if (RT.flock.length) RT.flock.length = 0;
  if (BOSS.on) bossUpdate(dt, S, G, t);
}
function tumble(dt, S, G, t) {
  const P = G.P, W = G.W(); const want = aridAt(P.x, P.z) > 0.45 && !S.q.dream ? 7 : 0;
  while (RT.tw.length < want) { const a = Math.random() * 6.28, r = 18 + Math.random() * 30; RT.tw.push({ x: P.x + Math.cos(a) * r - 25, z: P.z + Math.sin(a) * r, y: 0, vy: 0, rot: Math.random() * 6, s: 0.7 + Math.random() * 0.7, ph: Math.random() * 6 }); }
  if (!want) { RT.tw.length = 0; return; }
  for (let i = RT.tw.length - 1; i >= 0; i--) { const w = RT.tw[i]; const gust = 1.6 + Math.sin(t * 0.4 + w.ph) * 1.1 + Math.max(0, Math.sin(t * 1.3 + w.ph * 2)) * 1.4;
    w.x += gust * dt; w.z += Math.sin(t * 0.3 + w.ph) * 0.5 * dt; w.rot += gust * dt / (0.42 * w.s); const g = W.heightAt(w.x, w.z) + 0.42 * w.s; w.vy -= 14 * dt; w.y += w.vy * dt; if (w.y < g) { w.y = g; w.vy = Math.random() < 0.04 ? 2.5 + Math.random() * 2 : Math.abs(w.vy) * 0.25; }
    if (Math.hypot(w.x - P.x, w.z - P.z) > 60 || aridAt(w.x, w.z) < 0.3) RT.tw.splice(i, 1); }
}
let twMesh = null, stairMesh = null, stairM = null;
function skinned(list, S, G) {
  for (const a of RT.angels) list.push({ mesh: a.mesh, bones: a.rig.bones, emis: [0.55, 0.5, 0.35], outline: false });
  for (const f of RT.flock) { if (Math.hypot(f.x - G.CAM.x, f.z - G.CAM.z) < 0.9) continue; list.push({ mesh: f.mesh, bones: f.rig.bones, outline: true }); }
}
function dyn(list, S, G, t) {
  const W = G.W();
  if (S.q.dream) { if (!stairMesh) { const g = new GG.GB(4); for (let i = 0; i < STAIR.n; i++) g.box(2.6, 0.18, 0.5, { at: [0, 0.3 + i * STAIR.dy, -i * STAIR.dz], c: 0xfff0c0, j: 0 });
      for (let i = 0; i < STAIR.n; i += 3) for (const s of [1, -1]) g.cyl(0.06, 0.06, 1.6, 6, { at: [1.35 * s, 1.0 + i * STAIR.dy, -i * STAIR.dz], c: 0xffe6a0 });
      for (const s of [1, -1]) for (let i = 0; i < STAIR.n; i += 2) g.cyl(0.07, 0.07, Math.hypot(STAIR.dy, STAIR.dz) * 2.05, 5, { at: [1.35 * s, 1.75 + i * STAIR.dy + STAIR.dy, -i * STAIR.dz - STAIR.dz], rx: -Math.atan2(STAIR.dz, STAIR.dy), c: 0xfff4c8 });
      stairMesh = R.mesh(g); stairM = m4trs(m4(), STAIR.x, W.heightAt(STAIR.x, STAIR.z), STAIR.z, 0); } list.push({ mesh: stairMesh, m: stairM, emis: [0.55, 0.48, 0.25], shadow: false }); }
  if (S.flags.pillar) { if (!RT.pillar) { const g = new GG.GB(4); GG.env.pillar(g, m4()); RT.pillar = R.mesh(g); RT.pillarM = m4trs(m4(), SPOTS.sleep[0], W.heightAt(SPOTS.sleep[0], SPOTS.sleep[1] - 1), SPOTS.sleep[1] - 1, 0.3); } list.push({ mesh: RT.pillar, m: RT.pillarM, outline: true }); }
  else if (!between(S, 'j3_sleep')) { if (!RT.pstone) { const g = new GG.GB(4); g.sph(0.3, 7, 5, { s: [1.3, 0.8, 1], at: [0, 0.2, 0], c: 0xb8ac98, flat: true }); RT.pstone = R.mesh(g); RT.pstoneM = m4trs(m4(), SPOTS.pillow[0], W.heightAt(SPOTS.pillow[0], SPOTS.pillow[1]), SPOTS.pillow[1], 0); } list.push({ mesh: RT.pstone, m: RT.pstoneM, emis: S.step === 'j3_stone' ? [0.25, 0.2, 0.08] : null }); }
  if (!RT.wstone) { const g = new GG.GB(6); g.cyl(1.6, 1.7, 0.45, 14, { at: [0, 0.22, 0], c: 0xa89c88, flat: true }); RT.wstone = R.mesh(g); }
  const ws = S.flags.stoneRolled ? [48.5, -124.8] : [45, -125]; const wy = S.flags.stoneRolled ? W.heightAt(ws[0], ws[1]) : W.heightAt(45, -125) + 0.8;
  RT.wsM = m4trs(RT.wsM || m4(), ws[0], wy, ws[1], S.flags.stoneRolled ? 0.4 : 0, 0, S.flags.stoneRolled ? 0.1 : 0); list.push({ mesh: RT.wstone, m: RT.wsM, outline: true });
  if (S.step === 'j8_gift' && !S.q.gift) { if (!RT.post) { const g = new GG.GB(3); g.cyl(0.08, 0.1, 2, 6, { at: [0, 1, 0], c: 0x7a5a3a }); g.box(0.9, 0.5, 0.05, { at: [0, 1.7, 0.06], c: 0xd8c8a0 }); RT.post = R.mesh(g); } list.push({ mesh: RT.post, m: m4trs(RT.postM || (RT.postM = m4()), 182, W.heightAt(182, 46), 46, 0) }); }
  if (S.side && S.side.act && S.side.act.mandrakes && !G.have('mandrake')) { if (!RT.mand) { const g = new GG.GB(5); for (let i = 0; i < 7; i++) g.sph(0.12, 6, 4, { at: [Math.cos(i) * 0.22, 0.08, Math.sin(i) * 0.22], s: [1.6, 0.4, 0.7], ry: i, c: 0x5a8a3a }); for (let i = 0; i < 4; i++) g.sph(0.06, 6, 5, { at: [Math.cos(i * 1.6) * 0.1, 0.14, Math.sin(i * 1.6) * 0.1], c: 0xe8b830 }); RT.mand = R.mesh(g); } list.push({ mesh: RT.mand, m: m4trs(RT.mandM || (RT.mandM = m4()), 70, W.heightAt(70, -199), -199, 0), emis: [0.2, 0.16, 0.04] }); }
  if (RT.tw.length) { if (!twMesh) { const g = new GG.GB(9); GG.env.tumbleweed(g, m4trs(m4(), 0, -0.42, 0, 0), rng(9), 1); twMesh = R.mesh(g); }
    for (const w of RT.tw) list.push({ mesh: twMesh, m: m4trs(w.m || (w.m = m4()), w.x, w.y, w.z, Math.PI / 2, w.rot, 0, w.s, w.s, w.s), outline: true }); }
}

// ------------------------------------------------------------------ REGISTER
G.EP.jacob = {
  id: 'jacob', title: '야곱 편 · 이스라엘이 되기까지', hero: '야곱', sub: '창세기 25–33장',
  blurb: '발꿈치를 잡고 태어난 아이, 팥죽 한 그릇, 벧엘의 꿈, 하란에서의 이십 년. 집을 짓고 가축을 키우며 마을 사람들과 어울려 살다가, 얍복 강에서 이스라엘이 되기까지.',
  chapters: [{ t: '1장 · 팥죽 한 그릇', r: '창 25' }, { t: '2장 · 이삭의 축복', r: '창 27–28:5' }, { t: '3장 · 벧엘의 꿈', r: '창 28:10–22' }, { t: '4장 · 하란의 우물', r: '창 29:1–14' }, { t: '5장 · 라헬을 위한 칠 년', r: '창 29:15–30' },
    { t: '6장 · 열한 아들', r: '창 29:31–30:24' }, { t: '7장 · 점 있고 아롱진 양', r: '창 30:25–31:16' }, { t: '8장 · 얍복 강의 새벽', r: '창 31:17–33:16' }, { t: '에필로그 · 이스라엘의 장막', r: '창 33:17–20' }],
  spec: { size: SIZE, cell: 2, seed: 7, height, color, water: { level: -0.35, shallow: [0.36, 0.66, 0.62], deep: [0.12, 0.34, 0.4] } },
  build, npcs, pens, fields, sites, specials, shops, stations, spots: SPOTS, steps, talk, quests: QUESTS, chatter, approach, travelers, envx: ENVX,
  outfits: { default: LOOK.jacob, jacob: LOOK.jacob, esauGarb: LOOK.esauGarb, jacobH: LOOK.jacobH, israel: LOOK.israel },
  start: { step: 'j1_start', x: 18, z: 164, face: Math.PI * 0.9, time: 7.5, silver: 10, inv: {}, tools: {}, outfit: 'jacob' },
  recipes: ['hoe', 'staff', 'sickle', 'axe', 'hammer', 'shears', 'jar', 'rod', 'stew', 'bread', 'bbread', 'cheese', 'thread', 'cloth', 'linen', 'hay', 'grain', 'grainW', 'leather', 'roast', 'roastfish', 'roastfish2', 'roastfish3', 'arrow', 'fishrod', 'brick', 'oil', 'cloak'],
  rods: true, rain: 0.1, showStaff: true, sleepFrom: 16, titleCam: { x: 8, z: 166, r: 34, h: 9, ty: 1.5 }, titleTime: 17.4,
  mood, update, skinned, dyn, bounds, context, onDay, onLoad, canSleep, music, ledger, wildZones, wildOk, fishAt, aridAt, waterDist,
  timeScale: 1,
  villages, strangers, featAt, featText, onFeat, opening: OPENING, places: PLACES, roads: ROADS, roadD, rumors, worldFacts, villageChat, canBuild, quiet: quietEP, calmWeather, calmSurv,
  heroName: S => between(S, 'j8_esau') ? '이스라엘' : '야곱', settled: (x, z) => PADS.some(p => p.set && Math.hypot(x - p.x, z - p.z) < p.r + 10),
  rodPattern(sp, S) { const w = S.q.wage || []; const opts = sp === 'goat' ? w.filter(p => p !== 'brown') : w; if (!opts.length) return null; return Math.random() < 0.72 ? opts[Math.floor(Math.random() * opts.length)] : null; },
  birthDest(pen, baby, S) { if (pen.id !== 'laban' || !S.built.jacobFold || !S.q.wage) return pen.id; return S.q.wage.includes(baby[1]) ? 'jacob' : pen.id; },
  _dbg: { BOSS, RT },
  onKill(a, S, G) { if (a.special) G.UI.toast(`${a.name}을(를) 쓰러뜨렸다! 가까이 가서 손질하세요`); },
};
GG.NpcAI && GG.NpcAI.register(G.EP.jacob);
})(window.G);
