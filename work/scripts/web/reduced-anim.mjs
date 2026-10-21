import { launch } from './launch.mjs';
const browser = await launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
const page = await ctx.newPage();
await page.goto('http://localhost:8080/', { waitUntil: 'load' });
for (let i = 0; i < 120; i++) { if (await page.evaluate(() => window.__aviva && window.__aviva.ready)) break; await page.waitForTimeout(250); }
const r = await page.evaluate(() => new Promise((res) => {
  const nav = document.querySelector('.nav'); const seen = []; let n = 0;
  const mo = new MutationObserver((list) => { for (const m of list) seen.push(`${m.target.tagName}.${m.attributeName}=${m.target.getAttribute(m.attributeName)?.slice(0, 80)}`); });
  mo.observe(document.documentElement, { attributes: true, subtree: true, attributeOldValue: false });
  const f = () => {
    n++;
    const a = nav.getAnimations()[0];
    if (n === 5 || n === 30) seen.push(`frame ${n}: nav anim ${a ? a.playState + ' t=' + a.currentTime + ' start=' + a.startTime : 'none'} op=${getComputedStyle(nav).opacity}`);
    if (n < 40) requestAnimationFrame(f); else { mo.disconnect(); const counts = {}; for (const s of seen) counts[s.replace(/=.*/, '')] = (counts[s.replace(/=.*/, '')] || 0) + 1; res({ counts, sample: seen.filter((s) => s.startsWith('frame')).concat(seen.slice(0, 12)) }); }
  };
  requestAnimationFrame(f);
}));
console.log(JSON.stringify(r, null, 1));
await browser.close();
