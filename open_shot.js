const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, hasTouch: true, isMobile: true });
  const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', e => errs.push('PAGEERR ' + e.message + ' ' + (e.stack||'').split('\n').slice(1,3).join('|'))); page.on('console', m => { if (m.type() === 'error' && !m.text().includes('TUNNEL')) errs.push(m.text().slice(0, 300)); });
  await page.addInitScript(() => { localStorage.setItem('genesisSettings', JSON.stringify({ quality: 'mid' })); });
  await page.goto('file:///home/claude/genesis/test.html'); await page.waitForTimeout(1500);
  await page.evaluate(() => __G.Main.play('jacob', true)); await page.waitForTimeout(2500);
  await page.screenshot({ path: 'shots7/op0.png' }); await page.click('#opSkip'); await page.waitForTimeout(1500);
  await page.screenshot({ path: 'shots7/op_setup.png' });
  await page.click('#opGo'); await page.waitForTimeout(2500); await page.screenshot({ path: 'shots7/op_cine1.png' });
  await page.waitForTimeout(4000); await page.screenshot({ path: 'shots7/op_cine2.png' });
  await page.waitForTimeout(5000); await page.screenshot({ path: 'shots7/op_after.png' });
  console.log(errs.slice(0, 20).join('\n') || 'no errors');
  await browser.close();
})();
