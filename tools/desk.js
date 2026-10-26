// slope / IK / gait screenshots in the real game
const { chromium } = require('playwright'); const fs = require('fs');
(async () => {
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 760 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', e => errs.push('PAGEERR ' + e.message)); page.on('console', m => { if (m.type() === 'error' && !m.text().includes('TUNNEL')) errs.push(m.text().slice(0, 300)); });
  await page.addInitScript(() => { localStorage.setItem('genesisSettings', JSON.stringify({ quality: 'mid' })); });
  await page.goto('file:///home/claude/genesis/test.html'); await page.waitForTimeout(1500);
  await page.evaluate(fs.readFileSync('/home/claude/genesis/play.txt', 'utf8')); await page.evaluate(() => { window.__cineSkip = setInterval(() => { if (__G.Cine && __G.Cine.on) __G.Cine.skip(); }, 150); }); await page.waitForTimeout(6000);
  const steps = JSON.parse(process.argv[2]);
  for (const [name, code, wait] of steps) {
    await page.evaluate(code); await page.waitForTimeout(wait || 2500);
    await page.screenshot({ path: '/home/claude/tools/' + name + '.png' });
  }
  console.log(errs.slice(0, 20).join('\n') || 'no errors'); await browser.close();
})();
