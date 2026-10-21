import { chromium } from '/home/user/aviva/node_modules/playwright/index.mjs';
const out = process.argv[2], steps = process.argv[3] || 400;
const b = await chromium.launch({ headless: true, executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--enable-webgl'] });
const p = await b.newPage({ viewport: { width: 700, height: 700 } }); p.on('console', m => console.log(m.text().slice(0, 400))); p.on('pageerror', e => console.log('ERR', e));
await p.goto(`http://localhost:8130/proto/${process.argv[4] || 'ink.html'}?steps=${steps}&t=${steps}`); await p.waitForFunction(() => window.__ready, null, { timeout: 120000 });
await p.screenshot({ path: out }); await b.close();
