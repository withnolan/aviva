// claims.mjs: render the s11 claim-card stills (brief 5.6 / 11.3, T20) from the paper lab's claim states, straight from
// the WebGL canvas to WebP (1600 x 1000, quality stepped down until the file is <= 150 KB), plus a JPEG preview to look at.
//   node work/scripts/paper-proto/claims.mjs [--base http://localhost:8080] [--only 1,3] [--out docs/assets/claims]
import { launch } from '../web/launch.mjs';
import fs from 'node:fs';
import path from 'node:path';

const argv = process.argv.slice(2);
const opt = (k, d) => { const i = argv.indexOf('--' + k); return i >= 0 && argv[i + 1] ? argv[i + 1] : d; };
const base = opt('base', 'http://localhost:8080').replace(/\/$/, '');
const out = opt('out', 'docs/assets/claims'), preview = opt('preview', 'work/screenshots/claims');
const only = opt('only', '1,2,3').split(',').map(Number), MAX = 150 * 1024;
fs.mkdirSync(out, { recursive: true }); fs.mkdirSync(preview, { recursive: true });

const browser = await launch();
const page = await (await browser.newContext({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 1 })).newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(String(e).slice(0, 200)));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 200)); });
for (const n of only) {
  await page.goto(`${base}/lab/paper.html?state=claim${n}`, { waitUntil: 'load', timeout: 120000 });
  await page.waitForFunction(() => window.__ready === true, null, { timeout: 180000, polling: 250 });
  await page.evaluate(() => { const h = document.getElementById('help'); if (h) h.style.display = 'none'; });
  const r = await page.evaluate((MAX) => {
    const c = window.lab.renderer.domElement;
    for (let q = 0.92; q >= 0.5; q -= 0.04) { const u = c.toDataURL('image/webp', q), b = Math.round((u.length - 23) * 0.75); if (b <= MAX || q < 0.54) return { u, q: +q.toFixed(2), b, w: c.width, h: c.height }; }
  }, MAX);
  const file = path.join(out, `c${n}.webp`);
  fs.writeFileSync(file, Buffer.from(r.u.split(',')[1], 'base64'));
  await page.screenshot({ path: path.join(preview, `c${n}.jpg`), quality: 90 });
  console.log(`${file}  ${r.w}x${r.h}  q ${r.q}  ${(fs.statSync(file).size / 1024).toFixed(1)} KB`);
}
console.log('errors:', errors.length ? errors : 'none');
await browser.close();
