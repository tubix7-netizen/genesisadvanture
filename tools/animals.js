const { chromium } = require('playwright'); const fs = require('fs');
(async () => {
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const page = await browser.newPage(); const errs = [];
  page.on('pageerror', e => errs.push('PAGEERR ' + e.message)); page.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 300)); });
  await page.goto('file:///home/claude/genesis/viewer.html'); await page.waitForTimeout(400);
  const list = eval('(' + process.argv[2] + ')'); const urls = [];
  for (const [label, sp, st, frames] of list) {
    const u = await page.evaluate(([sp, st, frames]) => {
      const { R, Rig, AB, animal, animAnimal, m4, m4trs, envAt } = G; const c = document.getElementById('c'); const W = 240, H = 200; c.width = W; c.height = H;
      const gb = animal(sp, { seed: 7 }).gb; const mesh = R.meshIdx(gb); const rig = new Rig(AB[sp]);
      const s = Object.assign({ speed: 0, phase: 0, seed: 1 }, st); const n = frames || 60;
      for (let i = 0; i <= n; i++) { s.phase = (st.phase || 0) + i / 60 * (s.speed || 0) * 3.2; animAnimal(rig, s, i / 60); }
      rig.update(m4trs(m4(), 0, 0, 0, 0)); const h = AB[sp][0][3];
      const S = { cam: [3.2 * h * 2.2, h * 1.2, 1.2 * h * 2.2], target: [0, h * 0.8, 0], fov: 0.7, env: envAt(11), time: 0, focus: [0, 0, 0], shadowOn: false, terrain: [], statics: [], insts: [], dyn: [], skinned: [{ mesh, bones: rig.bones, outline: true }], grass: { on: false }, water: null, flats: [], pts: { n: 0 } };
      R.render(S, W, H); return c.toDataURL(); }, [sp, st, frames]);
    urls.push([label, u]);
  }
  fs.writeFileSync('/tmp/claude-poses.json', JSON.stringify(urls)); console.log(errs.join('\n') || 'ok'); await browser.close();
})();
