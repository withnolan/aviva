// overflow-probe.mjs: find elements that make the page wider than the viewport (phone emulation).
import { launch } from './launch.mjs';
const W = +(process.argv[2] || 390), H = +(process.argv[3] || 844);
const browser = await launch();
const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
const page = await ctx.newPage();
await page.goto('http://localhost:8080/', { waitUntil: 'load' });
for (let i = 0; i < 120; i++) { if (await page.evaluate(() => window.__aviva && window.__aviva.ready)) break; await page.waitForTimeout(250); }
await page.waitForTimeout(1000);
const r = await page.evaluate(() => {
  const vw = document.documentElement.clientWidth, sw = document.documentElement.scrollWidth, iw = innerWidth;
  const out = [];
  for (const el of document.querySelectorAll('body *')) {
    const b = el.getBoundingClientRect();
    if (b.width && (b.right > vw + 1)) {
      const cs = getComputedStyle(el);
      out.push(`${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}.${(el.className && el.className.baseVal === undefined ? el.className : '').toString().split(' ').join('.')} right=${Math.round(b.right)} pos=${cs.position}`);
    }
  }
  return { vw, sw, iw, vv: visualViewport.width, scale: visualViewport.scale, out: out.slice(0, 40) };
});
console.log(JSON.stringify(r, null, 1));
await browser.close();
