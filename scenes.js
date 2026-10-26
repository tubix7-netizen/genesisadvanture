const { chromium } = require('playwright');
const scenes = JSON.parse(process.argv[2]);
(async () => {
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, hasTouch: true, isMobile: true });
  const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', e => errs.push('PAGEERR ' + e.message)); page.on('console', m => { if (m.type() === 'error' && !m.text().includes('TUNNEL')) errs.push(m.text().slice(0, 300)); });
  await page.addInitScript(() => { localStorage.setItem('genesisSettings', JSON.stringify({ quality: 'mid' })); });
  await page.goto('file:///home/claude/genesis/test.html'); await page.waitForTimeout(1500);
  await page.evaluate(require('fs').readFileSync('play.txt', 'utf8')); await page.waitForTimeout(3000);
  for (const [name, step, x, z, face, hour, extra] of scenes) {
    await page.evaluate(([step, x, z, face, hour, extra]) => { const G = __G.Game; G.go(step); G.teleport(x, z, face); if (hour) G.S().time = Math.floor(G.S().time / 24) * 24 + hour; if (extra) eval(extra); }, [step, x, z, face, hour, extra]);
    await page.waitForTimeout(+(process.env.SW || 4000));
    for (let k = 0; k < 4; k++) { await page.screenshot({ path: 'shots/sc_' + name + '.png' }); if (require('fs').statSync('shots/sc_' + name + '.png').size > 40000) break; await page.waitForTimeout(2000); }
  }
  console.log(errs.slice(0, 20).join('\n') || 'no errors');
  await browser.close();
})();
