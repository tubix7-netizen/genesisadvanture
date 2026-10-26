/* 약속의 길 — camp life: NPC daily schedules, NPC-to-NPC chatter bubbles, NPCs who walk up and talk to you,
   passing travelers, side quests ("부탁"), and simple camera cutscenes. Content comes from the episode (EP.*). */
'use strict';
(function (G) {
const Game = G.Game, PI = Math.PI;
const L = G.Life = {};
const sfx = (n, o) => G.Audio && G.Audio.sfx(n, o);
const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// =================================================================== SPEECH BUBBLES
const bubbles = [];
L.bubble = function (who, text, dur) {
  const el = document.createElement('div'); el.className = 'bub'; el.textContent = text; $('bubbles').appendChild(el);
  bubbles.push({ who, el, t: dur || Math.min(5.5, 2.2 + text.length * 0.07) });
};
function drawBubbles(dt) {
  const R = G.R, UI = G.UI;
  for (let i = bubbles.length - 1; i >= 0; i--) { const b = bubbles[i]; b.t -= dt; const n = typeof b.who === 'string' ? Game.ENT.npcs[b.who] : b.who;
    if (b.t <= 0 || !n || (n.vis === false) || UI.busy()) { b.el.remove(); bubbles.splice(i, 1); continue; }
    const s = R.project(n.x, n.y + 2.55 * (n.scale || 1), n.z, UI.W, UI.H); if (!s || Math.hypot(n.x - Game.P.x, n.z - Game.P.z) > 30) { b.el.hidden = true; continue; }
    b.el.hidden = false; b.el.style.transform = `translate(${s[0]}px,${s[1]}px) translate(-50%,-100%) scale(var(--uik,1))`; b.el.style.opacity = Math.min(1, b.t * 2); }
}
L.clearBubbles = () => { bubbles.forEach(b => b.el.remove()); bubbles.length = 0; };

// =================================================================== CHATTER (NPC ↔ NPC)
const chat = { t: 4, cool: {}, run: null };
function chatter(dt, S) {
  const EP = Game.EP(), P = Game.P, ENT = Game.ENT;
  if (chat.run) { const r = chat.run; r.t -= dt; if (r.t <= 0) { if (r.i >= r.lines.length) { chat.run = null; return; } const [who, txt] = r.lines[r.i]; const id = who === 0 ? r.a : who === 1 ? r.b : who; L.bubble(id, txt, 3.4); const n = ENT.npcs[id], o = ENT.npcs[id === r.a ? r.b : r.a]; if (n && o && !n.walk) n.face = Math.atan2(o.x - n.x, o.z - n.z); r.i++; r.t = 3.3; } return; }
  chat.t -= dt; if (chat.t > 0 || !EP.chatter) return; chat.t = 6 + Math.random() * 8;
  const pool = EP.chatter.filter((c, i) => { if ((chat.cool[i] || 0) > S.day * 24 + S.time % 24) return false; if (c.when && !c.when(S, Game)) return false;
    const a = ENT.npcs[c.a], b = c.b ? ENT.npcs[c.b] : null; if (!a || !a.vis || a.talking || (c.b && (!b || !b.vis || b.talking))) return false;
    if (Math.hypot(a.x - P.x, a.z - P.z) > 24) return false; if (b && Math.hypot(a.x - b.x, a.z - b.z) > (c.r || 9)) return false; return true; });
  if (!pool.length) return; const c = pool[Math.floor(Math.random() * pool.length)], idx = EP.chatter.indexOf(c);
  chat.cool[idx] = S.day * 24 + S.time % 24 + (c.cool || 8); // cooldown in game hours
  chat.run = { a: c.a, b: c.b, lines: typeof c.lines === 'function' ? c.lines(S, Game) : c.lines, i: 0, t: 0 };
}

// =================================================================== NPCs WHO COME TO YOU
const appr = { t: 25, cur: null, cool: {} };
function approach(dt, S) {
  const EP = Game.EP(), P = Game.P, ENT = Game.ENT; if (!EP.approach) return;
  if (appr.cur) { const a = appr.cur, n = ENT.npcs[a.id]; if (!n || !n.vis) { appr.cur = null; return; } a.t -= dt;
    const d = Math.hypot(n.x - P.x, n.z - P.z);
    if (G.UI.busy() || (G.Combat && G.Combat.inCombat) || a.t <= 0 || d > 40) { n.walk = null; giveUp(n, a); return; }
    if (d < 2.3) { n.walk = null; appr.cur = null; n.face = Math.atan2(P.x - n.x, P.z - n.z); P.face = Math.atan2(n.x - P.x, n.z - P.z); n.talking = true;
      const r = a.def.say(S, Game, n); if (Array.isArray(r)) G.UI.say(r, () => back(n, a)); else if (typeof r === 'function') r(() => back(n, a)); else back(n, a); return; }
    a.rt -= dt; if (a.rt <= 0) { a.rt = 0.6; const k = 1.6 / Math.max(1, d); Game.npcWalk(a.id, P.x + (n.x - P.x) * k, P.z + (n.z - P.z) * k, null, a.def.speed || 2.6); delete S.npcPos[a.id]; }
    return; }
  appr.t -= dt; if (appr.t > 0) return; appr.t = 12 + Math.random() * 14;
  if (G.UI.busy() || P.spd > 5 || P.act || (G.Combat && G.Combat.inCombat) || Game.cineOn || (G.Build && G.Build.placing) || Game.SET.chatty === 'off') return;
  const now = S.day * 24 + S.time;
  const pool = EP.approach.filter(a => { if (a.once && S.flags['ap:' + a.key]) return false; if ((appr.cool[a.key] || 0) > now) return false; if (a.when && !a.when(S, Game)) return false; const n = ENT.npcs[a.id]; if (!n || !n.vis || n.walk || n.talking || n.follow) return false; const d = Math.hypot(n.x - P.x, n.z - P.z); return d < (a.range || 20) && d > 3.2; });
  if (!pool.length) return; const def = pool[Math.floor(Math.random() * pool.length)], n = ENT.npcs[def.id];
  appr.cool[def.key] = now + (def.cool || 6); if (def.once) S.flags['ap:' + def.key] = 1;
  appr.cur = { id: def.id, def, t: 25, rt: 0, home: [n.x, n.z, n.homeFace] }; L.bubble(def.id, def.call || '야곱!', 2.6); sfx('blip', { vol: 0.6, pitch: 1.3 });
}
function back(n, a) { n.talking = false; if (a.def.stay) return; giveUp(n, a); }
function giveUp(n, a) { appr.cur = null; const h = a.home; if (n.d.sched) { n.schedSlot = -1; return; } Game.npcWalk(n.id, h[0], h[1], () => { n.face = n.homeFace = h[2]; }, 1.8); }

// =================================================================== DAILY SCHEDULES
function schedules(S) {
  const ENT = Game.ENT, hr = S.time % 24;
  for (const id in ENT.npcs) { const n = ENT.npcs[id], sc = n.d.sched; if (!sc || n.follow || n.talking || n.pass || (appr.cur && appr.cur.id === id) || (G.NpcAI && G.NpcAI.busyId && G.NpcAI.busyId() === id) || n.d.show && !n.d.show(S, Game)) continue;
    const list = typeof sc === 'function' ? sc(S, Game) : sc; if (!list || !list.length) continue;
    let k = list.length - 1; for (let i = 0; i < list.length; i++) if (hr >= list[i][0]) k = i; // last slot whose hour has passed (wraps from previous day)
    const key = list[k].join(','); if (n.schedSlot === k && n.schedKey === key) continue; n.schedSlot = k; n.schedKey = key;
    const [h, x, z, face, mode] = list[k]; n.sit = false; n.act = null; n.schedHidden = false; n.wander = null;
    const arrive = () => { n.face = n.homeFace = face || 0; if (mode === 'sit') n.sit = true; else if (mode === 'hide') n.schedHidden = true; else if (mode && mode.startsWith('act:')) n.act = mode.slice(4); else if (mode && mode.startsWith('wander')) n.wander = { r: +(mode.split(':')[1] || 4), cx: x, cz: z, tx: null, wait: 1 }; };
    const d = Math.hypot(n.x - x, n.z - z);
    if (d < 0.6 || Game.Q.firstFrame) { Game.npcTo(id, x, z, face, false); arrive(); } else Game.npcWalk(id, x, z, arrive, n.d.walkSp || 1.7, n.d.route ? n.d.route(n, x, z) : null);
    delete S.npcPos[id];
  }
}

// =================================================================== TRAVELERS
const trav = { t: 60, cur: null, n: 0 };
function travelers(dt, S) {
  const EP = Game.EP(), P = Game.P; if (!EP.travelers) return;
  if (trav.cur) { const c = trav.cur, n = Game.ENT.npcs[c.id]; if (!n) { trav.cur = null; return; } c.life -= dt;
    if (c.st === 'come' && !n.walk) { c.st = 'wait'; c.wt = 40; }
    if (c.st === 'wait') { c.wt -= dt; const d = Math.hypot(n.x - P.x, n.z - P.z); if (!c.met && d < 26 && !G.UI.busy() && !appr.cur && !(G.Combat && G.Combat.inCombat)) { c.met = true; appr.cur = { id: c.id, def: { say: (S2, G2, nn) => c.def.say(S2, G2, nn, c), call: c.def.call || '여보시오, 젊은이!', stay: true }, t: 30, rt: 0, home: [n.x, n.z, n.face] }; L.bubble(c.id, c.def.call || '여보시오, 젊은이!', 2.6); }
      if (c.wt <= 0 || c.done) { c.st = 'leave'; Game.npcWalk(c.id, c.from[0], c.from[1], () => { c.st = 'gone'; }, 2.2); } }
    if (c.st === 'gone' || c.life <= 0) { Game.removeNPC(c.id); trav.cur = null; }
    return; }
  trav.t -= dt; if (trav.t > 0) return; trav.t = 70 + Math.random() * 90;
  if (G.UI.busy()) return; const now = S.day * 24 + S.time;
  const pool = EP.travelers.filter(t => (!t.when || t.when(S, Game)) && !(t.once && S.flags['tv:' + t.key]) && ((S.q.tvCool || {})[t.key] || 0) <= now);
  if (!pool.length) return; const def = pool[Math.floor(Math.random() * pool.length)];
  const spot = typeof def.at === 'function' ? def.at(S, Game) : def.at; if (!spot) return; const [fx, fz, tx, tz] = spot; if (Math.hypot(tx - P.x, tz - P.z) > 70) return;
  S.q.tvCool = S.q.tvCool || {}; S.q.tvCool[def.key] = now + (def.cool || 30); if (def.once) S.flags['tv:' + def.key] = 1;
  const id = 'trv' + (++trav.n); Game.spawnNPC({ id, name: def.name, look: def.look, x: fx, z: fz, face: 0, prop: def.prop, noTalk: false, trav: true });
  Game.npcWalk(id, tx, tz, null, 2.1); trav.cur = { id, def, from: [fx, fz], st: 'come', life: 260, met: false };
}
L.travelerDone = () => { if (trav.cur) trav.cur.done = true; };
L.approaching = () => !!appr.cur;

// =================================================================== SIDE QUESTS
const QS = () => Game.EP().quests || {};
const side = S => S.side || (S.side = { act: {}, done: {}, track: null });
L.active = S => Object.keys(side(S).act).filter(id => QS()[id]);
L.qOk = (S, id) => { const q = QS()[id]; const st = side(S).act[id]; return q.obj.every(o => o.ok(S, Game, st)); };
L.avail = (S, id) => { const q = QS()[id], sd = side(S); if (sd.act[id]) return false; const dn = sd.done[id]; if (dn !== undefined && !(q.repeat && S.day - dn >= q.repeat)) return false; return !q.when || q.when(S, Game); };
L.mark = function (id) { const S = Game.S(); if (!S || !Game.EP().quests) return null; for (const qid of L.active(S)) if (QS()[qid].giver === id && L.qOk(S, qid)) return '?'; for (const qid in QS()) if (QS()[qid].giver === id && L.avail(S, qid)) return '!'; return null; };
L.accept = function (id) { const S = Game.S(), q = QS()[id], st = { day: S.day, kills: Object.assign({}, S.hero.kills), fish: Object.assign({}, S.hero.fish), got: Object.assign({}, S.stats.got), stats: { fish: S.stats.fish || 0, butchered: S.stats.butchered || 0 } };
  side(S).act[id] = st; side(S).track = id; if (q.start) q.start(S, Game, st); sfx('quest'); G.UI.toast(`부탁을 맡았다 · ${q.title}`); G.UI.quest(); };
L.complete = function (id) {
  const S = Game.S(), q = QS()[id], rw = q.reward || {}, sd = side(S);
  if (q.take) for (const k in q.take) Game.take(k, q.take[k]);
  delete sd.act[id]; sd.done[id] = S.day; if (sd.track === id) sd.track = L.active(S)[0] || null;
  if (rw.silver) Game.silver(rw.silver); if (rw.items) for (const k in rw.items) Game.give(k, rw.items[k]); if (rw.gear) G.Combat.giveGear(rw.gear);
  if (rw.xp) Game.addXP(rw.xp); if (rw.trust) Game.trust && Game.trust(rw.trust); if (rw.heart) Game.heart && Game.heart(rw.heart);
  if (rw.insight) setTimeout(() => Game.insight(rw.insight, q.title), 400);
  if (q.finish) q.finish(S, Game); Game.stat('quests'); sfx('quest'); G.UI.quest(); Game.save(true); Game.checkStep();
};
L.talk = function (npcId) {
  const S = Game.S(), N = Game.ENT.npcs[npcId], nm = N ? N.name : '';
  const done = () => { if (N) N.talking = false; };
  const mine = L.active(S).filter(qid => QS()[qid].giver === npcId);
  // 1) hand in finished requests
  for (const qid of mine) { const q = QS()[qid]; if (L.qOk(S, qid)) { G.UI.say((typeof q.done === 'function' ? q.done(S, Game) : q.done).map(l => fix(l, nm)), () => { L.complete(qid); done(); }); return true; } }
  // 2) offer: story-critical requests first, then a reminder of one in progress, then other requests
  const avail = Object.keys(QS()).filter(qid => QS()[qid].giver === npcId && L.avail(S, qid)).sort((a, b) => (QS()[b].main ? 1 : 0) - (QS()[a].main ? 1 : 0));
  const offer = qid => { const q = QS()[qid]; const lines = (typeof q.offer === 'function' ? q.offer(S, Game) : q.offer).map(l => fix(l, nm));
    const other = Game.EP().talk && Game.EP().talk[npcId];
    lines.push({ n: Game.EP().hero, t: '어떻게 할까?', choices: [{ t: `맡겠습니다 · ${q.title}`, then: () => L.accept(qid) }, { t: '다음에 하겠습니다' }].concat(other ? [{ t: '다른 이야기를 나눈다', then: () => setTimeout(() => other(S, Game), 40) }] : []) });
    G.UI.say(lines, done); return true; };
  if (avail.length && QS()[avail[0]].main) return offer(avail[0]);
  for (const qid of mine) { const q = QS()[qid]; if (q.prog) { G.UI.say([fix(typeof q.prog === 'function' ? q.prog(S, Game) : q.prog, nm)], done); return true; } }
  if (avail.length) return offer(avail[0]);
  return false;
};
function fix(l, nm) { return typeof l === 'string' ? { n: nm, t: l } : l; }
L.tracked = function (S) { const sd = side(S); const id = sd.track && sd.act[sd.track] ? sd.track : L.active(S)[0]; return id ? { id, q: QS()[id], st: sd.act[id] } : null; };
L.track = id => { side(Game.S()).track = id; G.UI.quest(); };
L.onKill = function () { G.UI.quest(); };
// counters relative to when the quest was accepted
L.killsSince = (st, sp) => { const S = Game.S(); const sps = Array.isArray(sp) ? sp : [sp]; let n = 0; for (const k of sps) n += (S.hero.kills[k] || 0) - ((st && st.kills[k]) || 0); return n; };
L.fishSince = (st) => (Game.S().stats.fish || 0) - ((st && st.stats.fish) || 0);
L.gotSince = (st, k) => (Game.S().stats.got[k] || 0) - ((st && st.got[k]) || 0);

// =================================================================== CUTSCENES
const Cine = G.Cine = { on: false };
Cine.play = function (shots, done, opt) {
  opt = opt || {}; Cine.on = true; Game.cineOn = true; Cine.shots = shots; Cine.i = -1; Cine.done = done; Cine.opt = opt;
  document.body.classList.add('cine'); $('cine').hidden = false; next();
};
function next() {
  Cine.i++; const sh = Cine.shots[Cine.i];
  if (!sh) { Cine.on = false; Game.cineOn = false; Game.cineCam = null; document.body.classList.remove('cine'); $('cine').hidden = true; const d = Cine.done; Cine.done = null; if (G.Combat) G.Combat.busy = false; Game.snapCam && Game.snapCam(); d && d(); return; }
  Cine.t = 0; if (sh.fn) sh.fn(Game.S(), Game); if (sh.hour !== undefined) Game.S().time = Math.floor(Game.S().time / 24) * 24 + sh.hour;
  $('cineN').textContent = sh.n || ''; $('cineN').hidden = !sh.n; $('cineT').textContent = sh.t || ''; $('cineR').textContent = sh.ref || ''; $('cineBox').hidden = !sh.t;
  if (sh.t) sfx(sh.n ? 'blip' : 'page', { vol: 0.5 });
}
Cine.skip = function () { if (!Cine.on) return; const sh = Cine.shots[Cine.i]; if (Cine.t < (sh && sh.min !== undefined ? sh.min : 0.7)) return; next(); };
Cine.update = function (dt) {
  if (!Cine.on) return; const sh = Cine.shots[Cine.i]; if (!sh) return; Cine.t += dt; const k = Math.min(1, Cine.t / (sh.dur || 4)), e = k * k * (3 - 2 * k);
  const c0 = typeof sh.cam === 'function' ? sh.cam(Cine.t) : sh.cam, c1 = sh.cam2 || c0, l0 = typeof sh.look === 'function' ? sh.look(Cine.t) : sh.look, l1 = sh.look2 || l0;
  Game.cineCam = { x: c0[0] + (c1[0] - c0[0]) * e, y: c0[1] + (c1[1] - c0[1]) * e, z: c0[2] + (c1[2] - c0[2]) * e, lx: l0[0] + (l1[0] - l0[0]) * e, ly: l0[1] + (l1[1] - l0[1]) * e, lz: l0[2] + (l1[2] - l0[2]) * e, fov: sh.fov || 0.9 };
  if (sh.each) sh.each(Cine.t, Game.S(), Game);
  if (Cine.t >= (sh.dur || 4) && !sh.hold) next();
};

// =================================================================== MAIN HOOKS
L.update = function (dt, t) {
  const S = Game.S(); if (!S || Game.mode !== 'play') return;
  drawBubbles(dt); Cine.update(dt);
  if (Cine.on) return;
  L.schT = (L.schT || 0) - dt; if (L.schT <= 0) { L.schT = 0.5; schedules(S); }
  chatter(dt, S); approach(dt, S); travelers(dt, S);
};
L.reset = function () { L.clearBubbles(); chat.run = null; chat.t = 5; appr.cur = null; appr.t = 30; if (trav.cur) { try { Game.removeNPC(trav.cur.id); } catch (e) { } } trav.cur = null; trav.t = 50; for (const id in Game.ENT.npcs) Game.ENT.npcs[id].schedSlot = -1; };
L.esc = esc;
})(window.G);
