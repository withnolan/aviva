// usage: node montage.mjs out.png cols w h "<query1>" "<query2>" ...  (one browser, one page per query, tiles them using an HTML canvas)
import { chromium } from '/home/user/aviva/node_modules/playwright/index.mjs';
import fs from 'node:fs';
const [out, cols, w, h, ...queries] = process.argv.slice(2);
const b = await chromium.launch({ headless: true, executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--enable-webgl'] });
const shots = [];
for (const q of queries) {
  const p = await b.newPage({ viewport: { width: +w, height: +h } });
  p.on('pageerror', e => console.log('PAGEERROR', e)); p.on('console', m => { if (m.type() === 'error' || m.text().includes('Error')) console.log(q, m.text().slice(0, 600)); });
  await p.goto(`http://localhost:8130/proto/index.html?${q}`, { waitUntil: 'load' });
  try { await p.waitForFunction(() => window.__ready, null, { timeout: 120000 }); } catch { console.log('NOT READY', q); }
  await p.waitForTimeout(200); shots.push((await p.screenshot()).toString('base64')); await p.close();
}
const rows = Math.ceil(shots.length / +cols);
const p = await b.newPage({ viewport: { width: +cols * +w, height: rows * +h } });
await p.setContent('<canvas id=c></canvas>');
const dataUrl = await p.evaluate(async ({ shots, cols, w, h, rows, queries }) => {
  const c = document.getElementById('c'); c.width = cols * w; c.height = rows * h; const g = c.getContext('2d'); g.font = '14px monospace';
  for (let i = 0; i < shots.length; i++) { const im = new Image(); im.src = 'data:image/png;base64,' + shots[i]; await im.decode(); g.drawImage(im, (i % cols) * w, Math.floor(i / cols) * h); g.fillStyle = '#c00'; g.fillText(queries[i].slice(0, 60), (i % cols) * w + 6, Math.floor(i / cols) * h + 16); }
  return c.toDataURL('image/png');
}, { shots, cols: +cols, w: +w, h: +h, rows, queries });
fs.writeFileSync(out, Buffer.from(dataUrl.split(',')[1], 'base64')); await b.close();
