// logic test of the v7 systems (rendering stubbed)
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, hasTouch: true, isMobile: true });
  const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', e => errs.push('PAGEERR ' + e.message + ' ' + (e.stack || '').split('\n').slice(1, 4).join(' | ')));
  page.on('console', m => { if (m.type() === 'error' && !m.text().includes('TUNNEL')) errs.push(m.text().slice(0, 300)); });
  await page.addInitScript(() => { localStorage.setItem('genesisSettings', JSON.stringify({ quality: 'low' })); });
  await page.goto('file:///home/claude/genesis/test.html'); await page.waitForTimeout(1500);
  const res = await page.evaluate(async () => {
    const G = __G, Game = G.Game, UI = G.UI, $ = id => document.getElementById(id), log = []; G.R.render = () => { };
    const sleep = ms => new Promise(r => setTimeout(r, ms)); const S = () => Game.S(), P = Game.P;
    let t = performance.now(); const run = (sec) => { for (let i = 0; i < sec * 30; i++) { t += 33.3; Game.frame(t); } };
    try {
    G.Main.play('jacob', true); await sleep(1200);
    log.push('opening shown ' + !$('opening').hidden + ' busy ' + UI.busy());
    $('opSkip').click(); await sleep(700); log.push('setup ' + !$('opSetup').hidden); $('opGo').click(); await sleep(900);
    log.push('cine ' + G.Cine.on); for (let i = 0; i < 4 && G.Cine.on; i++) { G.Cine.t = 99; G.Cine.skip(); await sleep(50); }
    await sleep(200); log.push('narr ' + !$('narr').hidden); if (!$('narr').hidden) { UI.nextCard(); await sleep(500); UI.nextCard(); }
    log.push('busy after opening ' + UI.busy() + ' step ' + S().step);
    // ---- features through steps
    Game.go('j1_deborah'); await sleep(50); log.push('surv ' + Game.feat('surv') + ' bread ' + Game.inv('bread'));
    Game.go('j1_goats'); log.push('ride ' + Game.feat('ride') + ' mounts ' + S().mounts.length + ' loan ' + (S().mounts[0] && S().mounts[0].loan));
    // ---- riding
    const clr=()=>{for(let i=0;i<40&&UI.busy();i++){try{UI.advance();UI.closePanel&&UI.closePanel()}catch(e){} run(0.5);}}; clr(); const r = G.Ride.list[0]; Game.teleport(r.x + 1.2, r.z, 0); run(0.2); const c = Game.ctx(); log.push('ctx ' + (c && c.label) + ' busy ' + UI.busy() + ' act ' + P.act + ' near ' + !!G.Ride.near() + ' lock ' + P.lock + ' d ' + Math.hypot(r.x-P.x,r.z-P.z).toFixed(1) + ' mode ' + Game.mode); Game.pressAction(); log.push('riding ' + !!P.ride);
    Game.INPUT.my = -1; P.sprint = true; run(2); log.push('ride speed ' + P.spd.toFixed(2)); Game.INPUT.my = 0; P.sprint = false; run(1);
    G.UI.rideBtn(); log.push('after dismount ride ' + !!P.ride + ' mount at ' + r.x.toFixed(1));
    G.Ride.call(); run(3); log.push('called mount dist ' + Math.hypot(r.x - P.x, r.z - P.z).toFixed(1));
    Game.go('j1_grow'); log.push('build ' + Game.feat('build'));
    // ---- build basic campfire
    Game.give('stone', 10, true); Game.give('branch', 20, true);
    Game.teleport(30, 140, 0); run(0.2); G.Build.start('campfire'); run(0.5); log.push('placing msg ' + G.Build.placing.msg);
    const c2 = Game.ctx(); log.push('build ctx ' + (c2 && c2.label)); Game.pressAction(); run(2.5); log.push('bld ' + S().bld.length + ' st ' + Game.EP().stations.filter(s => s.bld).length);
    // ---- leaving Beersheba drops the loan donkey
    Game.go('j3_start'); run(0.6); log.push('mounts after j3 ' + S().mounts.length + ' warm ' + Game.feat('warm'));
    // ---- survival
    S().surv.food = 5; S().surv.warm = 5; S().time = 23; run(1); log.push('surv mul ' + G.Surv.mul.toFixed(2) + ' regen ' + G.Surv.regen.toFixed(2) + ' shiver ' + G.Surv.shiver.toFixed(2));
    Game.give('bread', 2, true); G.Surv.quickEat(); log.push('food after eat ' + S().surv.food.toFixed(0));
    // ---- Haran: build2, house, pen, buy animals & mount
    Game.go('j5_camp'); Game.go('j5_year'); log.push('build2 ' + Game.feat('build2') + ' herd2 ' + Game.feat('herd2'));
    for (const [k, n] of [['brick', 40], ['wood', 20], ['straw', 20], ['stone', 40], ['cloth', 4], ['clay', 20], ['reed', 10]]) Game.give(k, n, true);
    Game.teleport(30, -60, 0); run(0.3);
    const tryBuild = async (k) => { clr(); G.Build.start(k); run(0.4); const pl = G.Build.placing; if (!pl) return 'no-placing'; let tries = 0; while (pl.msg && tries < 12) { Game.teleport(P.x + 9, P.z + 3, P.face); run(0.4); tries++; } if (pl.msg) { G.Build.cancel(); return 'fail ' + pl.msg; } run(0.2); const cc=Game.ctx(); const b0=S().bld.length; Game.pressAction(); run(3); const dbg=' ctx='+(cc&&cc.label)+' busy='+UI.busy()+' bld '+b0+'->'+S().bld.length+' msg='+pl.msg+' placing='+!!G.Build.placing; G.Build.cancel(); return 'ok'+dbg; };
    log.push('house ' + await tryBuild('house')); log.push('pen ' + await tryBuild('pen')); log.push('field ' + await tryBuild('field')); log.push('stable ' + await tryBuild('stable')); log.push('well ' + await tryBuild('well'));
    log.push('bld kinds ' + S().bld.map(b => b.k).join(','));
    Game.silver(500); const shop = Game.EP().shops.animals; const sheep = shop.buy.find(x => x.animal === 'sheep' && x.pen); const ok1 = Game.buy(sheep); const ok2 = Game.buy(shop.buy.find(x => x.mount === 'camel'));
    log.push('bought sheep ' + ok1 + ' camel ' + ok2 + ' homePen ' + G.Build.homePens(S()).map(p => S().herds[p.id].list.length).join('/') + ' mounts ' + S().mounts.map(m => m.sp).join(','));
    const hp = G.Build.homePens(S())[0]; UI.pen(hp.id); await sleep(50); log.push('pen panel ' + !$('panelWrap').hidden); UI.closePanel();
    // ---- shelter & warmth at house
    const house = S().bld.find(b => b.k === 'house'); const bed = Game.EP().stations.find(s => s.bld === house.id); Game.teleport(bed.x, bed.z + 0.5, 0); run(0.3); log.push('shelter src ' + G.Surv.src + ' heat ' + G.Surv.heat.toFixed(1));
    // ---- save & reload keeps buildings, pens, mounts
    Game.save(true); Game.start('jacob', false); await sleep(100); run(0.5);
    log.push('reload bld ' + S().bld.length + ' pens ' + G.Build.homePens(S()).length + ' rideRT ' + G.Ride.list.length + ' herd ' + S().herds[hp.id].list.length);
    // ---- Shechem villagers
    Game.go('ep_start'); Game.go('ep_life'); S().time = Math.floor(S().time / 24) * 24 + 10; G.Weather.set('clear', 9); Game.teleport(104, 89, 0); run(4);
    const folk = Object.values(Game.ENT.npcs).filter(n => n.d.folk && n.d.village && n.d.village.id === 'shechem'); log.push('shechem folk ' + folk.length + ' visible ' + folk.filter(n => n.vis && !n.schedHidden).length + ' walking ' + folk.filter(n => n.walk).length);
    run(25); log.push('after 25s: hidden ' + folk.filter(n => n.schedHidden).length + ' acting ' + folk.filter(n => n.act).length + ' sitting ' + folk.filter(n => n.sit).length);
    S().time = Math.floor(S().time / 24) * 24 + 21.5; run(30); log.push('night hidden ' + folk.filter(n => n.schedHidden).length + '/' + folk.length);
    S().time = Math.floor(S().time / 24) * 24 + 11; G.Weather.set('rain', 9); run(30); log.push('rain hidden ' + folk.filter(n => n.schedHidden).length + ' sheltered ' + folk.filter(n => !n.schedHidden && !n.walk).length);
    G.Weather.set('clear', 9); run(20);
    // talk to a villager
    const f0 = folk.find(n => n.vis && !n.schedHidden); Game.talkTo(f0.id); await sleep(100); log.push('folk dialog ' + !$('dialog').hidden + ' name ' + $('dName').textContent);
    for (let i = 0; i < 8 && !$('dialog').hidden; i++) { UI.advance(); await sleep(60); const ch = [...$('dChoices').querySelectorAll('button')]; if (ch.length) { const b = ch.find(x => x.textContent.includes('도울 일')) || ch[ch.length - 1]; b.click(); await sleep(80); } }
    for (let i = 0; i < 10 && !$('dialog').hidden; i++) { const ch = [...$('dChoices').querySelectorAll('button')]; if (ch.length) { (ch.find(x => x.textContent.startsWith('맡을게요')) || ch[ch.length - 1]).click(); } else UI.advance(); await sleep(80); }
    log.push('dq ' + Object.keys(S().dq || {}).length + ' active ' + G.Life.active(S()).join(','));
    const dqid = Object.keys(S().dq || {})[0]; if (dqid) { const d = S().dq[dqid]; if (d.item) Game.give(d.item, d.n, true); else S().hero.kills[d.kill] = (S().hero.kills[d.kill] || 0) + d.n; const s0 = S().silver; Game.talkTo(d.giver); await sleep(80); for (let i = 0; i < 8 && !$('dialog').hidden; i++) { UI.advance(); await sleep(60); } log.push('dq done silver +' + (S().silver - s0) + ' left ' + Object.keys(S().dq).length); }
    // approach
    UI.lastTalk = 0; Game.SET.chatty = 'often'; G.NpcAI._approach(); Game.teleport(104, 92, 0); run(0.1); run(8); log.push('approach busy ' + G.NpcAI.busyId() + ' dialog ' + !$('dialog').hidden);
    for (let i = 0; i < 16 && UI.busy(); i++) { const ch = [...$('dChoices').querySelectorAll('button')]; if (ch.length) ch[ch.length - 1].click(); else UI.advance(); await sleep(70); }
    // free talk fallback
    const f1 = folk.find(n => n.vis && !n.schedHidden); G.NpcAI.freeTalk(f1); await sleep(50); $('chIn').value = '하나님을 믿어요?'; $('chForm').requestSubmit(); await sleep(150); log.push('chat msgs ' + $('chLog').children.length + ' last ' + $('chLog').lastChild.textContent.slice(0, 40)); $('chX').click();
    // ---- strangers
    Game.teleport(20, 40, 0); run(0.5); let sp = 0; for (let i = 0; i < 12 && G.NpcAI.strangers.length < 2; i++) { G.NpcAI._spawn(S()); sp++; Game.teleport(P.x + 30, P.z, 0); run(0.2); }
    log.push('strangers ' + G.NpcAI.strangers.map(s => s.type).join(',') + ' tries ' + sp);
    for (const s of G.NpcAI.strangers.slice()) { const n = Game.npc(s.id); Game.teleport(n.x + 1.5, n.z, 0); run(0.1); Game.talkTo(s.id); await sleep(80); const txt = $('dText').textContent; for (let i = 0; i < 10 && UI.busy(); i++) { const ch = [...$('dChoices').querySelectorAll('button')]; if (ch.length) ch[0].click(); else UI.advance(); await sleep(70); if (!$('panelWrap').hidden) UI.closePanel(); if (!$('narr').hidden) UI.nextCard(); } log.push('talk ' + s.type + ': ' + txt.slice(0, 30)); }
    for (const ty of Object.keys(G.NpcAI.ST)) { /* force each type once */ }
    // ---- big map
    UI.bigMap(); await sleep(50); run(0.2); log.push('bigmap ' + !$('bigmap').hidden); $('bmX').click();
    // ---- weather kinds
    for (const k of Object.keys(G.Weather.K)) { G.Weather.set(k, 2); run(1); } log.push('weather ok ' + G.Weather.kind(S()));
    } catch (e) { log.push('EXC ' + e.message + ' ' + (e.stack || '').split('\n').slice(0, 3).join(' | ')); }
    return log;
  });
  console.log(res.join('\n')); console.log(errs.slice(0, 20).join('\n') || 'no errors');
  await browser.close();
})();
