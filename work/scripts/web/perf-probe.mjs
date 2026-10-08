// perf-probe.mjs: time the world's frames during boot (software WebGL), to see what blocks the loader.
import { launch } from './launch.mjs';
const url = process.argv[2] || 'http://localhost:8080/?debug';
const browser = await launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
const page = await ctx.newPage();
page.on('console', (m) => console.log(`[${m.type()}] ${m.text()}`.slice(0, 300)));
await page.addInitScript(() => {
  const t0 = performance.now(); let last = t0, n = 0;
  const loop = () => { const now = performance.now(); if (now - last > 120) console.log(`slow rAF gap ${Math.round(now - last)} ms at ${Math.round(now - t0)} ms`); last = now; if (++n < 4000) requestAnimationFrame(loop); };
  requestAnimationFrame(loop);
});
await page.goto(url, { waitUntil: 'load' });
await page.waitForTimeout(20000);
const st = await page.evaluate(() => ({ ready: window.__aviva.ready, mm: document.getElementById('loader-mm')?.textContent, cls: document.getElementById('s00-loader')?.className }));
console.log(JSON.stringify(st));
await browser.close();
