// gpu-probe.mjs: measure real (gl.finish) render time of parts of the scene in software WebGL.
import { launch } from './launch.mjs';
const url = process.argv[2] || 'http://localhost:8080/?debug';
const browser = await launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
const page = await ctx.newPage();
page.on('console', (m) => { if (m.type() !== 'log' || /probe/.test(m.text())) console.log(m.text().slice(0, 300)); });
await page.goto(url, { waitUntil: 'load' });
for (let i = 0; i < 80; i++) { if (await page.evaluate(() => window.__aviva && window.__aviva.ready)) break; await page.waitForTimeout(250); }
await page.waitForTimeout(6000);
const r = await page.evaluate(() => {
  const w = window.__aviva.world, W = w.debug(), st = w.stage, R = st.renderer, gl = R.getContext();
  const time = (fn, n = 3) => { fn(); gl.finish(); const t = performance.now(); for (let i = 0; i < n; i++) fn(); gl.finish(); return Math.round((performance.now() - t) / n); };
  const full = time(() => w.render());
  const vis = [];
  st.scene.traverse((o) => { if (o.isMesh && o.visible) vis.push(o.name || o.type); });
  const bd = W.paper.raw.backdrop;
  bd.visible = false; const noBackdrop = time(() => w.render()); bd.visible = true;
  const sheets = [W.A, W.B, W.F, ...W.O].map((s) => s.object);
  const was = sheets.map((o) => o.visible); sheets.forEach((o) => (o.visible = false));
  const noSheets = time(() => w.render()); sheets.forEach((o, i) => (o.visible = was[i]));
  const upd = time(() => W.paper.update(st.scene, st.camera, 1 / 60), 2);
  return { full, noBackdrop, noSheets, paperUpdate: upd, programs: R.info.programs.length, calls: R.info.render.calls, tris: R.info.render.triangles, vis: vis.slice(0, 30), dpr: R.getPixelRatio(), aa: gl.getContextAttributes().antialias, size: [st.size.w, st.size.h] };
});
console.log('probe', JSON.stringify(r));
await browser.close();
