import { chromium } from 'playwright';
const b = await chromium.launch({ headless: true, executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--enable-webgl'] });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type()==='error') errs.push(m.text()); });
await p.goto('http://localhost:8080/?nointro', { waitUntil: 'load' }); await p.waitForTimeout(15000);
const fb = await p.evaluate(() => document.documentElement.className);
console.log('classes:', fb); console.log('errors:', errs.slice(0,5));
await b.close();
