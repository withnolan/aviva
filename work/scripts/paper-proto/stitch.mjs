// usage: node stitch.mjs out.png a.png b.png c.png ... (side by side)
import { chromium } from '/home/user/aviva/node_modules/playwright/index.mjs'; import fs from 'node:fs';
const [out, ...files] = process.argv.slice(2); const b = await chromium.launch({ headless: true, executablePath: '/opt/pw-browsers/chromium' }); const p = await b.newPage();
await p.setContent('<canvas id=c></canvas>');
const url = await p.evaluate(async (imgs) => { const ims = await Promise.all(imgs.map(async (s) => { const i = new Image(); i.src = 'data:image/png;base64,' + s; await i.decode(); return i; })); const c = document.getElementById('c'); c.width = ims.reduce((a, i) => a + i.width, 0); c.height = Math.max(...ims.map(i => i.height)); const g = c.getContext('2d'); let x = 0; for (const i of ims) { g.drawImage(i, x, 0); x += i.width; } return c.toDataURL('image/png'); }, files.map(f => fs.readFileSync(f).toString('base64')));
fs.writeFileSync(out, Buffer.from(url.split(',')[1], 'base64')); await b.close();
