// s08-gens.mjs (T34): the generations stage at 1440×900: the hand-over from s07, mid-s08, a generation hovered, and the
// balance's jar pan hovered. node work/scripts/web/s08-gens.mjs [outDir]
import { launch } from './launch.mjs';
import { mkdirSync } from 'node:fs';
const out = process.argv[2] || 'work/screenshots/build/t34';
mkdirSync(out, { recursive: true });
const browser = await launch();
const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 })).newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(String(e).slice(0, 200)));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 200)); });
await page.goto('http://localhost:8080/?nointro', { waitUntil: 'load', timeout: 120000 });
for (let i = 0; i < 400; i++) { if (await page.evaluate(() => !!(window.__aviva && window.__aviva.ready)).catch(() => false)) break; await page.waitForTimeout(100); }
const go = (k, p) => page.evaluate(([k, p]) => { const S = window.__aviva.scroll; S.scrollTo(S.yOf(S.byKey(k), p), { immediate: true }); }, [k, p]);
await page.mouse.move(20, 880);
await go('s07', 4.3); await page.waitForTimeout(3000);
await page.screenshot({ path: `${out}/s07-p4.3.jpg`, quality: 80 });
await go('s08', 0.3); await page.waitForTimeout(3000);
await page.screenshot({ path: `${out}/s08-p0.3.jpg`, quality: 80 });
await go('s08', 1.3); await page.waitForTimeout(3500);
await page.screenshot({ path: `${out}/s08-p1.3.jpg`, quality: 82 });
// hover GEN 4's sheet
const G = await page.evaluate(() => { const g = window.__aviva.world.ctx.gens; return { d: g.dom, bal: g.bal }; });
await page.mouse.move(G.d[3].x, G.d[3].y - 120, { steps: 4 });
await page.waitForTimeout(1500);
console.log('lit', await page.evaluate(() => window.__aviva.world.ctx.gens.lit.map((v) => v.toFixed(2)).join(' ')));
await page.screenshot({ path: `${out}/s08-hover-gen4.jpg`, quality: 82 });
// hover the jar's pan (the balance tips toward it)
await go('s08', 1.8); await page.waitForTimeout(2500);
const b = await page.evaluate(() => window.__aviva.world.ctx.gens.pans.jar);
console.log('jar pan at', JSON.stringify(b));
for (let i = 0; i < 6; i++) await page.mouse.move(b.x - 10 + i * 4, b.y - 14, { steps: 2 });
await page.waitForTimeout(2500);
console.log('tilt', await page.evaluate(() => window.__aviva.world.ctx.gens.tilt));
await page.screenshot({ path: `${out}/s08-hover-pan.jpg`, quality: 82 });
console.log('errors:', errors.length ? errors : 'none');
await browser.close();
