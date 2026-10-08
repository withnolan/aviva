// raf-probe.mjs: average frame interval while scrolling, with optional CSS injected (to find compositing costs).
import { launch } from './launch.mjs';
const url = process.argv[2] || 'http://localhost:8080/';
const css = process.argv[3] || '';
const browser = await launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
const page = await ctx.newPage();
await page.goto(url, { waitUntil: 'load' });
if (css) await page.addStyleTag({ content: css });
for (let i = 0; i < 100; i++) { if (await page.evaluate(() => window.__aviva && window.__aviva.ready)) break; await page.waitForTimeout(250); }
await page.waitForTimeout(4000);
const measure = () => page.evaluate(() => new Promise((res) => { let n = 0; const t0 = performance.now(); const f = () => { n++; if (performance.now() - t0 < 3000) requestAnimationFrame(f); else res(+(n / ((performance.now() - t0) / 1000)).toFixed(2)); }; requestAnimationFrame(f); }));
const idle = await measure();
await page.mouse.move(700, 450);
const p = measure();
for (let i = 0; i < 10; i++) { await page.mouse.wheel(0, 300); await page.waitForTimeout(280); }
const scrolling = await p;
console.log(JSON.stringify({ css: css.slice(0, 80), idleFps: idle, scrollFps: scrolling }));
await browser.close();
