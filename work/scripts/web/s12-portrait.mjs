// s12-portrait.mjs (T24): the family portrait at 1440×900: default (AVIVA), Notebook Pro chosen in the dialog, and the
// ream's riffle under the cursor. node work/scripts/web/s12-portrait.mjs [outDir] [p]
import { launch } from './launch.mjs';
import { mkdirSync } from 'node:fs';
const out = process.argv[2] || 'work/screenshots/build/t24';
const P = +(process.argv[3] || 2.95);
mkdirSync(out, { recursive: true });
const browser = await launch();
const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 })).newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(String(e).slice(0, 200)));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 200)); });
await page.goto('http://localhost:8080/?nointro', { waitUntil: 'load', timeout: 120000 });
for (let i = 0; i < 400; i++) { if (await page.evaluate(() => !!(window.__aviva && window.__aviva.ready)).catch(() => false)) break; await page.waitForTimeout(100); }
const go = (p) => page.evaluate((p) => { const S = window.__aviva.scroll; S.scrollTo(S.yOf(S.byKey('s12'), p), { immediate: true }); }, p);
await page.mouse.move(30, 880);
await go(P); await page.waitForTimeout(3500);
await page.screenshot({ path: `${out}/s12-p${P}-base.jpg`, quality: 82 });
// choose Notebook Pro in the print dialog (scroll up to it, click, come back)
await go(1.0); await page.waitForTimeout(1500);
await page.click('#s12-model input[value="pro"]', { force: true });
await page.waitForTimeout(600);
await go(P); await page.waitForTimeout(3500);
console.log('model', await page.evaluate(() => window.__aviva.E.size.model));
await page.screenshot({ path: `${out}/s12-p${P}-pro.jpg`, quality: 82 });
// the riffle: the cursor along the ream's front edge
const d = await page.evaluate(() => window.__aviva.world.ctx.port.dom[2]);
await page.mouse.move(d.x - 150, d.y + 40);
for (let i = 0; i <= 10; i++) await page.mouse.move(d.x - 150 + i * 13, d.y + 6, { steps: 2 });
await page.waitForTimeout(700);
console.log('riffle', await page.evaluate(() => window.__aviva.world.ctx.port.rk.toFixed(2)));
await page.screenshot({ path: `${out}/s12-p${P}-riffle.jpg`, quality: 85, clip: { x: Math.max(0, d.x - 380), y: Math.max(0, d.y - 170), width: 560, height: 300 } });
console.log('errors:', errors.length ? errors : 'none');
await browser.close();
