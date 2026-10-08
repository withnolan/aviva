import { launch } from './launch.mjs';
const browser = await launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
const page = await ctx.newPage();
page.on('console', (m) => console.log(`[${m.type()}] ${m.text()}`.slice(0, 300)));
page.on('pageerror', (e) => console.log('[pageerror]', String(e).slice(0, 400)));
await page.goto('http://localhost:8080/?debug', { waitUntil: 'load' });
for (let i = 0; i < 120; i++) { if (await page.evaluate(() => window.__aviva && window.__aviva.ready)) break; await page.waitForTimeout(250); }
await page.waitForTimeout(2500);
console.log(JSON.stringify(await page.evaluate(() => {
  const op = (s) => { const e = document.querySelector(s); return e ? getComputedStyle(e).opacity + ' vis=' + getComputedStyle(e).visibility + ' disp=' + getComputedStyle(e).display : 'none'; };
  return { html: document.documentElement.className, loader: document.getElementById('s00-loader').className, nav: op('.nav'), h1: op('.hero__l1'), l1cls: document.querySelector('.hero__l1').className, main: op('#content'), furniture: op('#furniture'), body: op('body') };
}), null, 1));
await browser.close();
