// s15-deckle.mjs (T39): the footer's deckle edge and magnetic links at 1440×900.
// node work/scripts/web/s15-deckle.mjs [outDir]
import { launch } from './launch.mjs';
import { mkdirSync } from 'node:fs';
const out = process.argv[2] || 'work/screenshots/build/t39';
mkdirSync(out, { recursive: true });
const browser = await launch();
const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 })).newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(String(e).slice(0, 200)));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 200)); });
await page.goto('http://localhost:8080/?nointro', { waitUntil: 'load', timeout: 120000 });
for (let i = 0; i < 400; i++) { if (await page.evaluate(() => !!(window.__aviva && window.__aviva.ready)).catch(() => false)) break; await page.waitForTimeout(100); }
await page.mouse.move(30, 30);
await page.evaluate(() => { const S = window.__aviva.scroll; S.scrollTo(document.documentElement.scrollHeight, { immediate: true }); });
await page.waitForTimeout(3500);
await page.screenshot({ path: `${out}/s15-footer.jpg`, quality: 84 });
const d = await page.evaluate(() => { const r = document.querySelector('.deckle').getBoundingClientRect(); return { top: r.top, h: r.height, fibres: document.querySelectorAll('.deckle__fibres line').length }; });
console.log('deckle', JSON.stringify(d));
// the cursor runs along the edge: the fibres stir
await page.mouse.move(500, d.top + 30);
for (let i = 0; i <= 8; i++) await page.mouse.move(500 + i * 20, d.top + 26, { steps: 2 });
await page.waitForTimeout(120);
await page.screenshot({ path: `${out}/s15-deckle-stir.png`, clip: { x: 420, y: Math.max(0, d.top - 30), width: 420, height: 110 } });
await page.screenshot({ path: `${out}/s15-deckle.png`, clip: { x: 0, y: Math.max(0, d.top - 40), width: 720, height: 120 } });
// a magnetic link
const a = await page.evaluate(() => { const r = document.querySelector('.foot__links a').getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; });
await page.mouse.move(a.x + a.w / 2, a.y + a.h / 2);
await page.mouse.move(a.x + a.w - 4, a.y + a.h - 2, { steps: 4 });
await page.waitForTimeout(400);
console.log('magnet', await page.evaluate(() => { const el = document.querySelector('.foot__links a'); return el.style.getPropertyValue('--mx') + ' ' + el.style.getPropertyValue('--my') + ' ' + el.classList.contains('is-magnet'); }));
console.log('errors:', errors.length ? errors : 'none');
await browser.close();
