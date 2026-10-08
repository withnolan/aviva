import { launch } from './launch.mjs';
const browser = await launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, reducedMotion: process.argv[2] === 'normal' ? 'no-preference' : 'reduce' });
const page = await ctx.newPage();
await page.addInitScript(() => { window.__raf = []; const loop = (t) => { window.__raf.push(Math.round(performance.now())); requestAnimationFrame(loop); }; requestAnimationFrame(loop); });
await page.goto('http://localhost:8080/', { waitUntil: 'load' });
let readyAt = 0;
for (let i = 0; i < 120; i++) { if (await page.evaluate(() => window.__aviva && window.__aviva.ready)) { readyAt = await page.evaluate(() => Math.round(performance.now())); break; } await page.waitForTimeout(250); }
await page.waitForTimeout(3000);
const r = await page.evaluate((readyAt) => {
  const after = window.__raf.filter((t) => t > readyAt);
  const gaps = []; for (let i = 1; i < after.length; i++) gaps.push(after[i] - after[i - 1]);
  const nav = document.querySelector('.nav'), a = nav.getAnimations()[0];
  return { readyAt, now: Math.round(performance.now()), framesSinceReady: after.length, maxGap: Math.max(0, ...gaps), lastFrames: after.slice(-5), nav: a ? `${a.playState} t=${a.currentTime} start=${a.startTime}` : 'none', navOp: getComputedStyle(nav).opacity, hidden: document.hidden, vis: document.visibilityState };
}, readyAt);
console.log(JSON.stringify(r));
await browser.close();
