// s03-probe.mjs: where the s03 drafting board, the sheet and the DOM text sit on screen (1440×900), at given s03
// progress values; optional shot with the board hidden (is the sheet behind it?).
// node work/scripts/web/s03-probe.mjs [outDir] [p1,p2,...] [--hide-board]
import { launch } from './launch.mjs';
import { mkdirSync } from 'node:fs';
const out = process.argv[2] || 'work/screenshots/build/t10-probe';
const ps = (process.argv[3] || '2,6').split(',').map(Number);
const hide = process.argv.includes('--hide-board');
mkdirSync(out, { recursive: true });
const browser = await launch();
const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 })).newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(String(e).slice(0, 200)));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 200)); });
await page.goto('http://localhost:8080/?nointro', { waitUntil: 'load', timeout: 120000 });
for (let i = 0; i < 400; i++) { if (await page.evaluate(() => !!(window.__aviva && window.__aviva.ready)).catch(() => false)) break; await page.waitForTimeout(100); }
for (const p of ps) {
  await page.evaluate((p) => { const S = window.__aviva.scroll; S.scrollTo(S.yOf(S.byKey('s03'), p), { immediate: true }); }, p);
  await page.waitForTimeout(3500);
  const info = await page.evaluate(() => {
    const W = window.__aviva.world, st = W.stage, b = st.scene.getObjectByName('paper.board');
    const pr = (o, x, y, z = 0) => { const v = o.localToWorld(new (o.position.constructor)(x, y, z)); const r = {}; st.toScreen(v, r); return [Math.round(r.x), Math.round(r.y)]; };
    const rect = (s) => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top), Math.round(r.right), Math.round(r.bottom), getComputedStyle(e.closest('[data-at]') || e).opacity]; };
    const P = [{}, {}, {}, {}]; W.heroCorners(P, false);
    const A = W.debug().A.object, cam = st.camera.position;
    return {
      board: b && b.visible ? { tl: pr(b, -0.37, 0.29), tr: pr(b, 0.37, 0.29), bl: pr(b, -0.37, -0.25), br: pr(b, 0.37, -0.25), ruleTop: pr(b, 0, b.getObjectByName('board.rule').position.y + 0.017), ruleBot: pr(b, 0, b.getObjectByName('board.rule').position.y - 0.017) } : 'hidden',
      sheet: P.map((q) => [Math.round(q.x), Math.round(q.y)]),
      dist: { sheet: +A.position.distanceTo(cam).toFixed(3), board: b ? +b.position.distanceTo(cam).toFixed(3) : null },
      body: rect('.s03__body'), status: rect('#s03-status'), tools: rect('.s03__tools'), dm: rect('.s03__dm'), uv: window.__aviva.E.uv.k,
    };
  });
  console.log('p', p, JSON.stringify(info));
  await page.screenshot({ path: `${out}/p${p}.jpg`, quality: 80 });
  if (hide) {
    // the choreo sets board.object.visible every frame, so hide its materials instead
    const set = (v) => page.evaluate((v) => { const b = window.__aviva.world.stage.scene.getObjectByName('paper.board'); b.traverse((o) => { if (o.material) [].concat(o.material).forEach((m) => { m.visible = v; }); }); window.__aviva.world.markDirty(); }, v);
    await set(false); await page.waitForTimeout(1500);
    await page.screenshot({ path: `${out}/p${p}-noboard.jpg`, quality: 80 });
    await set(true);
  }
}
console.log('errors:', errors.length ? errors : 'none');
await browser.close();
