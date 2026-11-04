// s03-t10.mjs: T10 s03 shots at 1440×900: normal (p 2.0, drafting board), the dark-mode coda (p 6.0, auto UV on,
// with a drawn stroke), the switch toggled OFF in the coda, and the T5 rest frame (intro clock frozen past the end).
// node work/scripts/web/s03-t10.mjs [outDir] [baseUrl]
import { launch } from './launch.mjs';
const out = process.argv[2] || 'work/screenshots/t10';
const base = process.argv[3] || 'http://localhost:8080/';
import { mkdirSync } from 'node:fs'; mkdirSync(out, { recursive: true });
const browser = await launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
const page = await ctx.newPage();
const errors = [];
page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') errors.push(m.text().slice(0, 200)); });
page.on('pageerror', (e) => errors.push(String(e).slice(0, 200)));
console.log('goto', Date.now()); await page.goto(base, { waitUntil: 'load', timeout: 120000 });
for (let i = 0; i < 400; i++) { if (await page.evaluate(() => !!(window.__aviva && window.__aviva.ready)).catch(() => false)) break; await page.waitForTimeout(100); }
console.log('ready', Date.now());
// T5 rest frame: let the intro run out (or force the clock to its end), then shoot the loader layer.
await page.evaluate(() => { const A = window.__aviva; if (!A.E.intro.done) { A.gsap.globalTimeline.pause(); A.E.intro.clock = 4.8; } });
await page.waitForTimeout(2500);
console.log('loader drawing visible nodes:', await page.evaluate(() => { const r = document.querySelector('.loader, #loader'); if (!r) return 'no loader node'; const cs = getComputedStyle(r); return { display: cs.display, opacity: cs.opacity, vis: cs.visibility, cls: r.className }; }));
await page.screenshot({ path: `${out}/t5-rest.jpg`, quality: 80 });
await page.evaluate(() => window.__aviva.gsap.globalTimeline.resume());
const go = async (p, wait = 3500) => { await page.evaluate((p) => { const S = window.__aviva.scroll; S.scrollTo(S.yOf(S.byKey('s03'), p), { immediate: true }); }, p); await page.waitForTimeout(wait); };
const stroke = async () => {
  const P = await page.evaluate(() => { const P = [{}, {}, {}, {}]; window.__aviva.world.heroCorners(P, false); return P; });
  const cx = (P[0].x + P[2].x) / 2, cy = (P[0].y + P[2].y) / 2;
  await page.mouse.move(cx - 60, cy); await page.mouse.down();
  for (let i = 0; i <= 30; i++) await page.mouse.move(cx - 60 + i * 4, cy + Math.sin(i / 3) * 18);
  await page.mouse.up(); await page.mouse.move(40, 860);
};
await go(2.0); await stroke(); await page.waitForTimeout(1200);
await page.screenshot({ path: `${out}/s03-normal.jpg`, quality: 80 });
await go(6.0, 4000);
console.log('uv:', await page.evaluate(() => ({ k: window.__aviva.E.uv.k, sw: document.getElementById('s03-dm').getAttribute('aria-checked'), v: document.getElementById('s03-dm-v').textContent })));
await stroke(); await page.waitForTimeout(1200);
await page.screenshot({ path: `${out}/s03-uv.jpg`, quality: 80 });
await page.click('#s03-dm'); await page.waitForTimeout(1500);
console.log('after click:', await page.evaluate(() => ({ k: window.__aviva.E.uv.k, sw: document.getElementById('s03-dm').getAttribute('aria-checked'), sr: document.getElementById('s03-dm-sr').textContent })));
await page.screenshot({ path: `${out}/s03-uv-off.jpg`, quality: 80 });
await go(4.0, 3000);
console.log('leaving coda uv.k:', await page.evaluate(() => window.__aviva.E.uv.k));
console.log('errors:', errors.length ? errors : 'none');
await browser.close();
