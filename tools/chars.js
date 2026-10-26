// usage: node chars.js out.png '[looks]' '{opt}'
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const page = await browser.newPage(); const errs = [];
  page.on('pageerror', e => errs.push('PAGEERR ' + e.message)); page.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 300)); });
  await page.goto('file:///home/claude/genesis/viewer.html'); await page.waitForTimeout(500);
  const looks = eval('(' + process.argv[3] + ')'), opt = eval('(' + (process.argv[4] || '{}') + ')');
  await page.evaluate(([l, o]) => window.show(l, o), [looks, opt]);
  const el = await page.$('#out'); await el.screenshot({ path: process.argv[2] });
  console.log(errs.join('\n') || 'ok'); await browser.close();
})();
