// usage: node shoot.mjs "<query>" out.png [w h]   (server must serve the lab dir containing proto/ and vendor/ on :8130)
import { chromium } from '/home/user/aviva/node_modules/playwright/index.mjs';
const [query, out, w = 1000, h = 700] = process.argv.slice(2);
const b = await chromium.launch({ headless: true, executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--enable-webgl'] });
const p = await b.newPage({ viewport: { width: +w, height: +h } });
const logs = []; p.on('console', m => logs.push(m.type() + ': ' + m.text())); p.on('pageerror', e => logs.push('PAGEERROR ' + e));
await p.goto(`http://localhost:8130/proto/index.html?${query}`, { waitUntil: 'load' });
try { await p.waitForFunction(() => window.__ready, null, { timeout: 90000 }); } catch (e) { console.log('NOT READY'); }
await p.waitForTimeout(300);
console.log(JSON.stringify(await p.evaluate(() => window.__info || null)));
console.log(logs.slice(0, 12).join('\n'));
await p.screenshot({ path: out }); await b.close();
