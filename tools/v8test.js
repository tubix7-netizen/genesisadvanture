const { chromium } = require('playwright'); const fs = require('fs');
(async () => {
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, hasTouch: true, isMobile: true });
  const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', e => errs.push('PAGEERR ' + e.message)); page.on('console', m => { if (m.type() === 'error' && !m.text().includes('TUNNEL')) errs.push(m.text().slice(0, 300)); });
  await page.addInitScript(() => { localStorage.setItem('genesisSettings', JSON.stringify({ quality: 'low' })); });
  await page.goto('file:///home/claude/genesis/test.html'); await page.waitForTimeout(1500);
  await page.evaluate(fs.readFileSync('/home/claude/genesis/play.txt', 'utf8')); await page.waitForTimeout(3000);
  const r = await page.evaluate(() => {
    const GG = __G, G = GG.Game, P = G.P, out = {}; let t = performance.now();
    if (GG.Cine.on) { GG.Cine.i = GG.Cine.shots.length - 1; GG.Cine.t = 99; GG.Cine.skip(); }
    clearInterval(window.__skip); while (GG.UI.busy()) { GG.UI.advance(); if (GG.UI.busy() && document.getElementById('dialog').hidden && document.getElementById('narr').hidden) break; }
    const run = n => { for (let i = 0; i < n; i++) { t += 33; G.frame(t); } };
    G.go('j5_year'); run(5); for (let k = 0; k < 20 && GG.UI.busy(); k++) { GG.UI.advance(); run(2); }
    out.busy = GG.UI.busy();
    // ---- locomotion feel: run then release, record brake
    for (const feel of ['heavy', 'bal', 'snappy']) { G.SET.feel = feel; P.vx = P.vz = 0; G.INPUT.my = -1; run(45); const top = P.spd; G.INPUT.my = 0; let maxB = 0, stopF = 0; for (let i = 0; i < 60; i++) { run(1); maxB = Math.max(maxB, P.rig.brk || 0); if (P.spd < 0.3 && !stopF) stopF = i; } out['feel_' + feel] = { top: +top.toFixed(2), brake: +maxB.toFixed(2), stopFrames: stopF }; }
    G.SET.feel = 'bal';
    // ---- emotes
    out.sit = GG.Acts.play('sitg', { quiet: true }); run(10); out.resting = P.resting; out.pstAct = P.pst.act;
    G.INPUT.my = -1; run(3); out.afterMove = P.emote ? P.emote.k : null; G.INPUT.my = 0; run(10);
    // wave near villagers -> reactions
    const ns = Object.values(G.ENT.npcs).filter(n => n.vis && !n.d.animal && !n.schedHidden && !n.talking); const n0 = ns[0]; if (n0) { G.teleport(n0.x + 2.5, n0.z + 2.5, 0); run(5); }
    GG.Acts.play('wave'); run(40); out.reacting = Object.values(G.ENT.npcs).filter(n => n.emote).map(n => n.id + ':' + n.emote.k).slice(0, 6); out.waveWalk = (() => { G.INPUT.my = -1; run(3); const k = P.emote && P.emote.k; G.INPUT.my = 0; return k; })();
    run(60);
    // eat -> eat emote
    G.give('fig', 2); G.eat('fig'); run(3); out.eatEmote = P.emote && P.emote.k; run(80);
    // combos
    const C = GG.Combat; G.S().hero.weapon = G.S().hero.weapon || 'staff'; G.give && G.give('staff', 1); const S = G.S(); S.tools = S.tools || {}; S.tools.staff = 1;
    const anims = []; for (let i = 0; i < 4; i++) { C.attack(); anims.push(P.atk ? P.atk.anim : 'none'); for (let k = 0; k < 40 && P.atk; k++) run(1); run(3); }
    out.combo = anims;
    // flute / pet / lie at night
    out.flute = GG.Acts.play('flute', { quiet: true }); run(60); GG.Acts.stop();
    const a = G.ENT.animals[0]; if (a) { G.teleport(a.x + 1.2, a.z, 0); run(2); out.pet = GG.Acts.play('pet', { quiet: true }); run(50); out.petted = S.flags.petted || 0; }
    S.time = Math.floor(S.time / 24) * 24 + 21.5; out.lie0 = GG.Acts.play('lie', { quiet: true }); run(30); out.lieE = P.emote && JSON.stringify(P.emote); out.hr = G.hour(); run(90); out.sleepAsk = [GG.UI.busy(), document.getElementById('dialog').hidden, document.getElementById('dialog').textContent.slice(0, 60), P.emote && P.emote.slept];
    while (GG.UI.busy()) { GG.UI.advance(); run(1); if (!document.getElementById('dialog').hidden) { const b = document.querySelector('#dialog .d-choices button:last-child'); if (b) b.click(); } run(2); if (document.getElementById('dialog').hidden) break; }
    out.uiK = GG.UI.uiK;
    return out; });
  console.log(JSON.stringify(r, null, 1)); console.log(errs.slice(0, 20).join('\n') || 'no errors'); await browser.close();
})();
