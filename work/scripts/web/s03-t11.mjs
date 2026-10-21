// s03-t11.mjs: the T11 s03 behaviours at 1440×900: "Memory updated." after a stroke, s03.note only after the first
// Erase (for 4 s), the BibTeX box text. node work/scripts/web/s03-t11.mjs [baseUrl]
import { launch } from './launch.mjs';
const base = process.argv[2] || 'http://localhost:8080/';
const browser = await launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
const page = await ctx.newPage();
const errors = [];
page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') errors.push(m.text().slice(0, 200)); });
page.on('pageerror', (e) => errors.push(String(e).slice(0, 200)));
await page.goto(base, { waitUntil: 'load', timeout: 90000 });
for (let i = 0; i < 200; i++) { if (await page.evaluate(() => !!(window.__aviva && window.__aviva.ready)).catch(() => false)) break; await page.waitForTimeout(100); }
await page.evaluate(() => { const S = window.__aviva.scroll; S.scrollTo(S.yOf(S.byKey('s03'), 2), { immediate: true }); });
await page.waitForTimeout(3000);
const status = () => page.evaluate(() => document.getElementById('s03-status').textContent.trim());
const P = await page.evaluate(() => { const P = [{}, {}, {}, {}]; window.__aviva.world.heroCorners(P, false); return P; });
const cx = (P[0].x + P[2].x) / 2, cy = (P[0].y + P[2].y) / 2;
await page.mouse.move(cx - 50, cy); await page.mouse.down();
for (let i = 0; i <= 25; i++) await page.mouse.move(cx - 50 + i * 4, cy + Math.sin(i / 3) * 15);
await page.mouse.up();
const seen = new Set(); const t0 = Date.now();
while (Date.now() - t0 < 5000) { seen.add(await status()); await page.waitForTimeout(120); }
console.log('statuses after a stroke:', JSON.stringify([...seen]));
console.log('note before erase hidden:', await page.evaluate(() => document.getElementById('s03-note').hidden));
await page.click('#s03-erase'); await page.waitForTimeout(300);
console.log('note after first erase hidden:', await page.evaluate(() => document.getElementById('s03-note').hidden));
await page.waitForTimeout(4300);
console.log('note 4.3 s later hidden:', await page.evaluate(() => document.getElementById('s03-note').hidden));
console.log('bib first line:', await page.evaluate(() => document.getElementById('s13-bib').textContent.split('\n')[0]));
console.log('errors:', errors.length ? errors : 'none');
await browser.close();
