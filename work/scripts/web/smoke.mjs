// smoke.mjs: load the site, report errors and boot timing, take a few screenshots at chosen scroll positions.
// node work/scripts/web/smoke.mjs [url] [outdir] [w] [h] [y1,y2,...(in viewport heights)]
import { chromium } from 'playwright';
import fs from 'node:fs';
const url = process.argv[2] || 'http://localhost:8080/?debug';
const out = process.argv[3] || 'work/screenshots/build/smoke';
const W = +(process.argv[4] || 1440), H = +(process.argv[5] || 900);
const ys = (process.argv[6] || '0').split(',').map(Number);
fs.mkdirSync(out, { recursive: true });
import { launch } from './launch.mjs';
const browser = await launch();
const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, isMobile: W < 600, hasTouch: W < 600 });
const page = await ctx.newPage();
const logs = [];
page.on('console', (m) => logs.push(`[${m.type()}] ${m.text()}`.slice(0, 500)));
page.on('pageerror', (e) => logs.push(`[pageerror] ${String(e).slice(0, 500)}`));
page.on('requestfailed', (r) => logs.push(`[requestfailed] ${r.url()} ${r.failure()?.errorText}`));
page.on('response', (r) => { if (r.status() >= 400) logs.push(`[http ${r.status()}] ${r.url()}`); });
const t0 = Date.now();
await page.goto(url, { waitUntil: 'load', timeout: 90000 });
let ready = false;
for (let i = 0; i < 120; i++) { ready = await page.evaluate(() => !!(window.__aviva && window.__aviva.ready)).catch(() => false); if (ready) break; await page.waitForTimeout(250); }
console.log('ready:', ready, 'after', Date.now() - t0, 'ms');
await page.waitForTimeout(3200);
for (const y of ys) {
  await page.evaluate((y) => { const a = window.__aviva; if (a && a.scroll) a.scroll.scrollTo(y * innerHeight, { immediate: true }); else scrollTo(0, y * innerHeight); }, y);
  await page.waitForTimeout(1600);
  const f = `${out}/smoke-${W}x${H}-${String(y).replace('.', '_')}.jpg`;
  await page.screenshot({ path: f, type: 'jpeg', quality: 80 });
  const info = await page.evaluate(() => { const a = window.__aviva; return a && a.scroll ? { Y: +a.scroll.Y.toFixed(2), cur: a.scroll.current.key, kind: a.world && a.world.kind } : null; });
  console.log('shot', f, JSON.stringify(info));
}
console.log(logs.join('\n'));
await browser.close();
