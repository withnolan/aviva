// Serves a folder and checks that the import-map page loads and scroll drives GSAP. Usage: node work/scripts/importmap-test.mjs <folder> [subpath]
import { chromium } from '/home/user/aviva/node_modules/playwright/index.mjs';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
const dir = process.argv[2]; const sub = process.argv[3] || '/';
const port = 8123; const srv = spawn('python3', ['-m', 'http.server', String(port), '--directory', dir], { stdio: 'ignore' });
await new Promise(r => setTimeout(r, 800));
const args = ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--enable-webgl'];
const exe = ['/opt/pw-browsers/chromium', undefined].find(p => !p || fs.existsSync(p));
const b = await chromium.launch({ headless: true, args, executablePath: '/opt/pw-browsers/chromium' });
const p = await b.newPage({ viewport: { width: 800, height: 600 } });
const logs = []; p.on('console', m => logs.push(m.type() + ': ' + m.text())); p.on('pageerror', e => logs.push('PAGEERROR ' + e)); p.on('response', r => { if (r.status() >= 400) logs.push('HTTP ' + r.status() + ' ' + r.url()); }); p.on('requestfailed', r => logs.push('FAILED ' + r.url()));
let bytes = 0; p.on('response', async r => { try { bytes += (await r.body()).length } catch {} });
await p.goto(`http://localhost:${port}${sub}`, { waitUntil: 'networkidle' });
await p.waitForFunction(() => window.__result, null, { timeout: 20000 }).catch(e => { console.log(logs.join("\n")); throw e; });
console.log(JSON.stringify(await p.evaluate(() => window.__result)));
await p.mouse.move(400,300); for (let i = 0; i < 8; i++) { await p.mouse.wheel(0, 300); await p.waitForTimeout(150); }
await p.waitForTimeout(800);
console.log('scrollY', await p.evaluate(() => scrollY), 'gsap proxy.p', await p.evaluate(() => window.__proxy.p));
console.log('transfer bytes (uncompressed)', bytes); console.log(logs.join('\n') || 'no console output');
await p.screenshot({ path: process.argv[4] || '/tmp/claude-0/-home-user-aviva/a2098eec-65ea-5b04-89f8-7e29117e6bb9/scratchpad/importmap.png' });
await b.close(); srv.kill();
