// s11-hover.mjs (T23): the claims row's pointer tilt and keyboard focus at 1440×900.
// node work/scripts/web/s11-hover.mjs [outDir]
import { launch } from './launch.mjs';
import { mkdirSync } from 'node:fs';
const out = process.argv[2] || 'work/screenshots/build/t23-hover';
mkdirSync(out, { recursive: true });
const browser = await launch();
const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 })).newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(String(e).slice(0, 200)));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 200)); });
await page.goto('http://localhost:8080/?nointro', { waitUntil: 'load', timeout: 120000 });
for (let i = 0; i < 400; i++) { if (await page.evaluate(() => !!(window.__aviva && window.__aviva.ready)).catch(() => false)) break; await page.waitForTimeout(100); }
await page.evaluate(() => { const S = window.__aviva.scroll; S.scrollTo(S.yOf(S.byKey('s11'), 2.25), { immediate: true }); });
await page.waitForTimeout(3000);
// hover the centre card's upper right: it tilts toward the cursor, the render shifts the other way
const r = await page.evaluate(() => { const c = document.querySelector('.claim.is-centre'); const b = c.getBoundingClientRect(); return { x: b.left, y: b.top, w: b.width, h: b.height, id: c.dataset.copy }; });
await page.mouse.move(r.x + r.w * 0.5, r.y + r.h * 0.5);
await page.mouse.move(r.x + r.w * 0.92, r.y + r.h * 0.1, { steps: 6 });
await page.waitForTimeout(900);
const tilt = await page.evaluate(() => { const c = document.querySelector('.claim.is-centre'); return { rx: c.style.getPropertyValue('--rx'), ry: c.style.getPropertyValue('--ry'), t: getComputedStyle(c).transform.slice(0, 60) }; });
console.log('hover', r.id, JSON.stringify(tilt));
await page.screenshot({ path: `${out}/s11-hover.jpg`, quality: 85, clip: { x: Math.max(0, r.x - 60), y: Math.max(0, r.y - 40), width: Math.min(1440, r.w + 120), height: r.h + 80 } });
// keyboard: Tab to the next card; the page scrolls until it is centred
await page.mouse.move(20, 880);
const before = await page.evaluate(() => window.__aviva.scroll.byKey('s11').p.toFixed(2));
await page.evaluate(() => { const cs = [...document.querySelectorAll('.claim')]; const i = cs.findIndex((c) => c.classList.contains('is-centre')); cs[Math.min(cs.length - 1, i + 2)].focus(); });
await page.waitForTimeout(4000);
const after = await page.evaluate(() => { const S = window.__aviva.scroll.byKey('s11'); const f = document.activeElement; const b = f.getBoundingClientRect(); return { p: S.p.toFixed(2), id: f.dataset.copy, centreX: Math.round(b.left + b.width / 2), centre: f.classList.contains('is-centre') }; });
console.log('focus: p', before, '->', JSON.stringify(after));
await page.screenshot({ path: `${out}/s11-focus.jpg`, quality: 80 });
console.log('errors:', errors.length ? errors : 'none');
await browser.close();
