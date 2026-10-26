// node poses.js out.png 'look' '[[label, st], ...]' '{opt}'
const { chromium } = require('playwright'); const fs = require('fs');
(async () => {
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const page = await browser.newPage(); const errs = [];
  page.on('pageerror', e => errs.push('PAGEERR ' + e.message)); page.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 300)); });
  await page.goto('file:///home/claude/genesis/viewer.html'); await page.waitForTimeout(400);
  const look = eval('(' + process.argv[3] + ')'), list = eval('(' + process.argv[4] + ')'), opt = eval('(' + (process.argv[5] || '{}') + ')');
  const urls = [];
  for (const [label, st] of list) {
    const u = await page.evaluate(([l, s, o]) => { window.show([l], Object.assign({ views: [0.7], w: 200, h: 260, dist: 3.0 }, o, { st: s })); return document.getElementById('out').toDataURL(); }, [look, st, opt]);
    urls.push([label, u]);
  }
  fs.writeFileSync('/tmp/claude-poses.json', JSON.stringify(urls));
  console.log(errs.join('\n') || 'ok'); await browser.close();
})();
