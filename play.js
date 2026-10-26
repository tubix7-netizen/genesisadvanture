// full scripted playthrough of the Jacob episode (logic only; rendering stubbed for speed)
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, hasTouch: true, isMobile: true });
  const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', e => errs.push('PAGEERR ' + e.message + ' ' + (e.stack || '').split('\n').slice(1, 3).join(' | ')));
  page.on('console', m => { if (m.type() === 'error' && !m.text().includes('TUNNEL')) errs.push(m.text().slice(0, 300)); if (m.type() === 'warning') errs.push('WARN ' + m.text().slice(0, 200)); });
  await page.addInitScript(() => { localStorage.setItem('genesisSettings', JSON.stringify({ quality: 'low' })); });
  await page.goto('file:///home/claude/genesis/test.html'); await page.waitForTimeout(1500);
  const res = await page.evaluate(async (stopAt) => {
    const G = __G, Game = G.Game, UI = G.UI, $ = id => document.getElementById(id); G.R.render = () => { };
    const log = []; const sleep = ms => new Promise(r => setTimeout(r, ms));
    const S = () => Game.S(), EP = () => Game.EP();
    let skipOn = true; const skipper = setInterval(() => { if (!skipOn) return; try {
      if (!$('opening').hidden) { const go = document.getElementById('opGo'); if (go) go.click(); else $('opSkip').click(); return; }
      if (!$('chat').hidden) { $('chX').click(); return; }
      if (G.Cine.on) { G.Cine.t = 99; G.Cine.skip(); return; }
      if (!$('narr').hidden) { UI.advance(); return; }
      if (!$('dialog').hidden) { const ch = $('dChoices'); if (!ch.hidden && ch.querySelector('button')) ch.querySelector('button').click(); else UI.advance(); return; }
      if (!$('mg').hidden) { const b = $('mgBtn'); if (b) b.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); }
      if (!$('panel') || $('panel').hidden) { } } catch (e) { log.push('SKIPERR ' + e.message); } }, 60);
    const idle = async (ms) => { const t0 = performance.now(); await sleep(80); while ((UI.busy() || G.Cine.on) && performance.now() - t0 < (ms || 30000)) await sleep(60); await sleep(60); };
    const talk = async id => { await idle(); if (!Game.npc(id)) { log.push('NO NPC ' + id); return; } Game.talkTo(id); await idle(); };
    const tp = async (x, z) => { await idle(); Game.teleport(x, z, 0); await sleep(250); Game.checkStep(); await idle(); };
    const sp = async id => { await idle(); const s = EP().specials.find(s => s.id === id); if (!s.on || s.on(S(), Game)) s.use(S(), Game); else log.push('special off ' + id + ' @' + S().step); await idle(); };
    const give = (k, n) => Game.give(k, n, true);
    const craft = async id => { const r = Game.RECIPES.find(r => r.id === id); return Game.craft(r); };
    const build = async id => { await idle(); const s = EP().sites.find(s => s.id === id); for (const k in s.cost || {}) give(k, s.cost[k]); if (s.silver) Game.silver(s.silver); const ok = Game.build(s); if (!ok) log.push('build fail ' + id); await idle(); };
    const wait = async (step, ms) => { const t0 = performance.now(); while (S().step !== step && performance.now() - t0 < (ms || 8000)) { Game.checkStep(); await sleep(100); } if (S().step !== step) log.push(`STUCK want ${step} at ${S().step} obj="${$('qObj').textContent}"`); return S().step === step; };
    const plots = (f, n, v) => { let k = 0; const F = EP().fields.find(x => x.id === f); for (let i = 0; i < F.cols && k < n; i++) for (let j = 0; j < F.rows && k < n; j++, k++) { const id = f + ':' + i + ',' + j; S().plots[id] = Object.assign({}, S().plots[id] || {}, v); } Game.ENT.plotsDirty = true; };
    const kill = (sp, n) => { S().hero.kills[sp] = (S().hero.kills[sp] || 0) + n; };
    const quest = async (giver, id, fill) => { await talk(giver); if (!(S().side && S().side.act[id])) { log.push('quest not accepted ' + id + ' from ' + giver); } if (fill) await fill(); await talk(giver); if (!(S().side.done[id] !== undefined)) log.push('quest not done ' + id); };
    const serveTo = n => { S().q.bonusServe = (S().q.bonusServe || 0) + Math.max(0, n - ((S().q.serve || 0) - (S().q.serve0 || 0))) + 1; };
    Game.deleteSave('jacob'); G.Main.play('jacob', true); await sleep(1200); await idle();
    try {
      // ===== ch1
      await talk('rebekah'); await wait('j1_deborah');
      await talk('deborah'); await wait('j1_gather');
      give('branch', 3); give('stone', 2); await wait('j1_hoe');
      await craft('hoe'); await wait('j1_till');
      plots('lentil', 6, { s: 1 }); await wait('j1_plant');
      plots('lentil', 6, { s: 2, c: 'lentil', st: 0, g: 0, w: 0 }); Game.take('s_lentil', 6); await wait('j1_water');
      plots('lentil', 6, { w: 1 }); await wait('j1_goats');
      for (const k of ['goatA', 'goatB', 'goatC', 'goatD']) { Game.talkTo(k); await idle(); }
      log.push('followers ' + Game.P.follow.length); await tp(-22, 161.5); await sleep(800); await wait('j1_milk');
      await idle(); Game.penAction('isaacGoats', 'milk'); await wait('j1_figs');
      give('fig', 2); await talk('isaac'); await wait('j1_sleep');
      // sleep via bed station UI flow
      await tp(30, 169.5); { const c = Game.ctx(); log.push('bed ctx ' + (c && c.label)); UI.sleepAsk(); await sleep(400); await idle(); await sleep(2500); await idle(); }
      await wait('j1_grow', 9000); log.push('lentil mature ' + JSON.stringify(Game.plotStats('lentil')));
      S().stats.harvest.lentil = 8; give('lentil', 8); give('branch', 2); await wait('j1_stew');
      await tp(10, 168); S().water = 5; await craft('stew'); await wait('j1_esau');
      await talk('esau'); await wait('j2_start', 12000);
      // ===== ch2
      await talk('rebekah'); await wait('j2_kids');
      Game.talkTo('kid1'); await idle(); Game.talkTo('kid2'); await idle(); const rb = Game.npc('rebekah'); await tp(rb.x + 1.5, rb.z + 1.5); await wait('j2_isaac', 9000);
      await talk('isaac'); await wait('j2_pack', 12000);
      await talk('rebekah'); await wait('j3_start');
      // ===== ch3
      await tp(-44, 26); await wait('j3_stone', 9000);
      await sp('pillow'); await wait('j3_sleep');
      await sp('sleep'); await sleep(3000); await idle(60000); await wait('j3_pillar', 30000);
      await sp('pillar'); await wait('j4_start', 12000);
      // ===== ch4
      await tp(45, -112); await wait('j4_shep', 9000);
      await talk('shep1'); await wait('j4_stone');
      await sp('wellStone'); await sleep(9000); await idle(); await wait('j4_water', 20000);
      for (let i = 0; i < 4; i++) { S().water = 12; await sp('wellTrough'); await sleep(200); }
      await wait('j4_laban', 9000);
      await talk('laban'); await sleep(2500); await idle(); await wait('j5_start', 12000);
      // ===== ch5 tycoon
      await talk('laban'); await wait('j5_camp');
      await talk('hunter'); await talk('smith'); await talk('rachel'); await wait('j5_year', 9000);
      log.push('sling ' + !!S().hero.gear.sling + ' stones ' + Game.inv('stone'));
      // side quests sampling
      await quest('fisher', 'fisherRod', async () => give('reed', 4)); log.push('fishrod ' + Game.tool('fishrod'));
      await quest('hunter', 'hareHunt', async () => kill('hare', 3));
      await quest('tanner', 'tannerVest', async () => give('hide', 3)); log.push('vest ' + !!S().hero.gear.vest);
      for (let y = 1; y <= 7; y++) {
        if (S().step !== 'j5_year' || S().q.year !== y) { log.push('year mismatch ' + y + ' ' + S().step + ' ' + S().q.year); break; }
        if (y === 1) { await build('trough2'); await quest('rachel', 'rachelLamb', async () => { await sleep(300); Game.talkTo('lostLamb'); await idle(); await tp(113, -118); await sleep(900); }); }
        if (y === 2) { await build('loom'); await build('hireShep'); }
        if (y === 3) { await build('newfield'); await quest('laban', 'wolves', async () => kill('wolf', 4)); }
        if (y === 4) { await build('granary'); Game.silver(100); await talk('laban'); log.push('paid4 ' + S().q.paid4); }
        if (y === 5) { await quest('hunter', 'lion', async () => { log.push('lion spawned ' + G.Combat.wild().some(a => a.sp === 'lion' && a.special)); kill('lion', 1); }); }
        if (y === 6) { await build('fold2'); await build('hireHand'); }
        if (y === 7) { const n = 62 - Game.herdCount('laban'); for (let i = 0; i < n; i++) Game.addAnimal('laban', i % 2 ? 'sheep' : 'goat', 'plain', i % 3 ? 0 : 1, 10); while ((S().q.heart || 0) < 6) Game.heart(1); await idle(); }
        Game.UI.quest(); log.push(`Y${y} list: ` + EP().steps.j5_year.list(S(), Game).map(l => (l.ok ? '✓' : '·') + l.t).join(' | '));
        serveTo(EP().steps.j5_year && 80); await sleep(700); await idle(); await sleep(300);
        if (y < 7) { const t0 = performance.now(); while (S().q.year === y && performance.now() - t0 < 6000) { Game.checkStep(); await sleep(150); await idle(); } if (S().q.year === y) log.push('year stuck ' + y + ' ' + $('qObj').textContent); }
      }
      await wait('j5_wedding', 9000);
      await talk('laban'); await sleep(3000); await idle(30000); await wait('j5_more', 30000); log.push('leah pos ' + JSON.stringify([Game.npc('leah').x | 0, Game.npc('leah').z | 0]));
      await talk('rachel'); await wait('j6_start', 9000);
      // ===== ch6 family years
      for (let fy = 1; fy <= 7; fy++) {
        if (S().q.fy !== fy) { log.push('fy mismatch ' + fy + ' ' + S().q.fy); break; }
        if (fy === 1) await build('tents');
        if (fy === 2) await quest('leah', 'leahClothes', async () => give('cloth', 2));
        if (fy === 3) await build('hireWeaver');
        if (fy === 4) await quest('reuben', 'mandrakes', async () => { await sp('mandrake'); });
        if (fy === 5) await build('stall');
        if (fy === 6) await quest('laban', 'bear', async () => kill('bear', 1));
        if (fy === 7) { const n = 82 - Game.herdCount('laban'); for (let i = 0; i < n; i++) Game.addAnimal('laban', 'sheep', 'plain', 0, 10); }
        log.push(`F${fy} list: ` + EP().steps.j6_start.list(S(), Game).map(l => (l.ok ? '✓' : '·') + l.t).join(' | '));
        serveTo(80); const t0 = performance.now(); while (S().q.fy === fy && S().step === 'j6_start' && performance.now() - t0 < 7000) { Game.checkStep(); await sleep(150); await idle(); }
        if (S().q.fy === fy && S().step === 'j6_start') log.push('fy stuck ' + fy);
      }
      log.push('kids ' + (S().q.kidsBorn || []).join(',') + ' joseph scale ' + (Game.npc('joseph') && Game.npc('joseph').scale.toFixed(2)) + ' reuben ' + Game.npc('reuben').scale.toFixed(2));
      await wait('j7_wage', 9000);
      // ===== ch7
      await talk('laban'); await wait('j7_fold');
      await build('jacobFold'); await wait('j7_rods', 9000);
      give('branch', 3); await craft('rod'); Game.penAction('laban', 'rods'); await wait('j7_grow1', 9000);
      for (let i = 0; i < 21; i++) Game.addAnimal('jacob', i % 2 ? 'sheep' : 'goat', 'speckled', 0, 10); await wait('j7_grow2', 9000);
      for (let i = 0; i < 16; i++) Game.addAnimal('jacob', i % 2 ? 'sheep' : 'goat', 'streaked', 0, 10); Game.silver(400);
      for (const n of ['낙타', '낙타', '나귀', '나귀']) Game.buy(EP().shops.animals.buy.find(e => e.n === n));
      await wait('j7_call', 9000);
      await talk('rachel'); await wait('j8_start', 9000);
      // ===== ch8
      log.push('followers ' + Game.P.follow.map(f => f.id).join(','));
      await tp(166, -10); await wait('j8_laban', 9000);
      await talk('laban'); await wait('j8_heap');
      await build('heap'); await wait('j8_mahanaim', 12000);
      await tp(178, 42); await sleep(500); await idle(); await wait('j8_gift', 12000);
      await sp('gift'); await wait('j8_ford', 9000);
      await tp(226, 100); await wait('j8_alone', 9000);
      await tp(190, 95); await wait('j8_boss', 9000); await sleep(600); await idle();
      const B = EP()._dbg.BOSS; log.push('boss on ' + B.on + ' st ' + B.st);
      // exercise the mechanic: wait for a lunge, dodge it, grab, mash
      skipOn = false; let t0 = performance.now(); while (B.st !== 'lunge' && performance.now() - t0 < 12000) await sleep(30);
      Game.P.dodgeT = 0.4; t0 = performance.now(); while (B.st === 'lunge' && performance.now() - t0 < 2000) await sleep(16);
      log.push('after dodge ' + B.st); const d0 = B.dawn; if (B.st === 'open') { const n = Game.npc('man'); Game.teleport(n.x - 1, n.z - 1, 0); Game.pressAction(); log.push('grab -> ' + B.st); for (let i = 0; i < 6; i++) { Game.pressAction(); await sleep(60); } log.push('dawn +' + (B.dawn - d0).toFixed(1)); }
      skipOn = true; B.dawn = 56; await sleep(500); await idle(); log.push('limp ' + S().flags.limp + ' P.limp ' + Game.P.limp);
      B.dawn = 100; await sleep(500); await idle(60000); await sleep(500); await idle(60000);
      await wait('j8_esau', 30000); log.push('outfit ' + S().outfit);
      await tp(226, 100); await wait('j8_meet', 9000);
      await talk('esau'); await sleep(2000); await idle(); await sleep(1800); await idle(30000); await sleep(2500); await idle(30000);
      await wait('ep_start', 30000); log.push('epi herd ' + Game.herdCount('israel') + ' P ' + [Game.P.x | 0, Game.P.z | 0]);
      // ===== epilogue
      await build('altarS'); await wait('ep_life', 9000);
      await build('booths');
      await quest('joseph', 'epJoseph', async () => { S().time = 21; await tp(176, 152); await sp('starHill'); });
      await quest('reuben', 'epReuben', async () => kill('wolf', 2));
      await quest('dinah', 'epDinah', async () => give('flower', 5));
      await quest('hamor', 'buyField', async () => Game.silver(100)); log.push('garden ' + !!S().unlocked.garden);
      await wait('ep_fire', 9000); S().time = 20; await tp(151, 125); await sp('epFire'); await sleep(2000); await idle(60000); await sleep(800); await idle(60000);
      await wait('j_end', 30000);
    } catch (e) { log.push('EXC ' + e.message + ' ' + (e.stack || '').split('\n')[1]); }
    clearInterval(skipper);
    log.push('final step ' + S().step + ' day ' + S().day + ' insight ' + S().hero.insight + ' quests ' + S().stats.quests);
    return log;
  });
  console.log(res.join('\n')); console.log(errs.slice(0, 30).join('\n') || 'no errors');
  await browser.close();
})();
