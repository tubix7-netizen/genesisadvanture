const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, hasTouch: true, isMobile: true });
  const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', e => errs.push('PAGEERR ' + e.message)); page.on('console', m => { if (m.type() === 'error' && !m.text().includes('TUNNEL')) errs.push(m.text().slice(0, 300)); });
  await page.addInitScript(() => { localStorage.setItem('genesisSettings', JSON.stringify({ quality: 'low' })); });
  await page.goto('file:///home/claude/genesis/test.html'); await page.waitForTimeout(1500);
  await page.evaluate(require('fs').readFileSync('play.txt', 'utf8')); await page.waitForTimeout(3000);
  const r = await page.evaluate(() => { const G = __G, Game = G.Game, steps = Object.keys(Game.EP().steps), out = []; let t = performance.now();
    for (const s of steps) { try { Game.go(s); for (let i = 0; i < 3; i++) { t += 33; Game.frame(t); } const n = Object.values(Game.ENT.npcs).filter(n => n.vis).length; out.push(s + ':' + n); } catch (e) { out.push(s + ' ERR ' + e.message); } }
    return out; });
  console.log(r.join(' ')); console.log(errs.slice(0, 20).join('\n') || 'no errors');
  await browser.close();
})();
