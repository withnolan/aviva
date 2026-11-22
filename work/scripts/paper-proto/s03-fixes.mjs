// s03-fixes.mjs: s03 stills at 1440x900 for the paper-side fixes (lamp head, taped thinking curl, UV room pool):
// normal at p 2.0 and the dark-mode coda at p 6.0, each after a stroke, shot at the peak of the "thinking" curl.
// node work/scripts/paper-proto/s03-fixes.mjs [outDir] [baseUrl]
import { launch } from '../web/launch.mjs';
import { mkdirSync } from 'node:fs';
const out = process.argv[2] || 'work/screenshots/build/s03-fixes';
const base = process.argv[3] || 'http://localhost:8091/';
mkdirSync(out, { recursive: true });
const browser = await launch();
const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 })).newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(String(e).slice(0, 200)));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 200)); });
await page.goto(base + '?nointro', { waitUntil: 'load', timeout: 120000 });
for (let i = 0; i < 400; i++) { if (await page.evaluate(() => !!(window.__aviva && window.__aviva.ready)).catch(() => false)) break; await page.waitForTimeout(100); }
const go = async (p, wait) => { await page.evaluate((p) => { const S = window.__aviva.scroll; S.scrollTo(S.yOf(S.byKey('s03'), p), { immediate: true }); }, p); await page.waitForTimeout(wait); };
const stroke = async () => {
  const P = await page.evaluate(() => { const P = [{}, {}, {}, {}]; window.__aviva.world.heroCorners(P, false); return P; });
  const cx = (P[0].x + P[2].x) / 2, cy = (P[0].y + P[2].y) / 2;
  await page.mouse.move(cx - 60, cy); await page.mouse.down();
  for (let i = 0; i <= 30; i++) await page.mouse.move(cx - 60 + i * 4, cy + Math.sin(i / 3) * 18);
  await page.mouse.up(); await page.mouse.move(40, 860);
};
const peak = async () => { for (let i = 0; i < 120; i++) { if (await page.evaluate(() => window.__aviva.E.think.curl > 0.92)) return true; await page.waitForTimeout(40); } return false; };
const lamp = () => page.evaluate(() => {
  const st = window.__aviva.world.stage, L = st.scene.getObjectByName('board.lamp'); if (!L) return null;
  const V = L.position.constructor, r = {}, s = {}, c = L.localToWorld(new V(0, -0.04, 0)), e = L.localToWorld(new V(0.056, -0.072, 0));
  st.toScreen(c, r); st.toScreen(e, s); return { centre: [Math.round(r.x), Math.round(r.y)], lipPx: Math.round(Math.hypot(s.x - r.x, s.y - r.y)) };
});
for (const [name, p, wait] of [['s03-normal', 2.0, 3500], ['s03-uv', 6.0, 4000]]) {
  await go(p, wait); await stroke();
  const hit = await peak();
  await page.screenshot({ path: `${out}/${name}.jpg`, quality: 85 });
  console.log(name, JSON.stringify({ curlPeak: hit, uv: await page.evaluate(() => window.__aviva.E.uv.k), lamp: await lamp() }));
}
console.log('errors:', errors.length ? errors : 'none');
await browser.close();
