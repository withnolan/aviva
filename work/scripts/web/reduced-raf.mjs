import { launch } from './launch.mjs';
const browser = await launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, reducedMotion: process.argv[2] === 'normal' ? 'no-preference' : 'reduce' });
const page = await ctx.newPage();
page.on('console', (m) => { if (/frame ms|slow|aviva/.test(m.text())) console.log(m.text().slice(0, 200)); });
await page.goto('http://localhost:8080/?debug', { waitUntil: 'load' });
for (let i = 0; i < 120; i++) { if (await page.evaluate(() => window.__aviva && window.__aviva.ready)) break; await page.waitForTimeout(250); }
const r = await page.evaluate(() => new Promise((res) => {
  let n = 0; const t0 = performance.now(); const W = window.__aviva.world;
  const s = { renders: 0 };
  const orig = W.render; W.render = (...a) => { s.renders++; return orig(...a); };
  const f = () => { n++; if (performance.now() - t0 < 4000) requestAnimationFrame(f); else res({ fps: +(n / 4).toFixed(2), renders: s.renders, ticker: window.__aviva.gsap.ticker.frame }); };
  requestAnimationFrame(f);
}));
console.log(JSON.stringify(r));
await browser.close();
