import { launch } from './launch.mjs';
const browser = await launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
const page = await ctx.newPage();
page.on('console', (m) => { if (/frame ms|slow frame/.test(m.text())) console.log(m.text()); });
await page.goto(process.argv[2] || 'http://localhost:8080/?debug', { waitUntil: 'load' });
for (let i = 0; i < 100; i++) { if (await page.evaluate(() => window.__aviva && window.__aviva.ready)) break; await page.waitForTimeout(250); }
await page.waitForTimeout(8000);
await page.mouse.move(700, 450);
for (let i = 0; i < 8; i++) { await page.mouse.wheel(0, 400); await page.waitForTimeout(500); }
await page.waitForTimeout(3000);
await browser.close();
