// overflow-probe.mjs: find the elements that make the page wider than the viewport (phone emulation):
// skips anything inside a clipping ancestor or a fixed layer, then confirms by hiding candidates one by one.
import { launch } from './launch.mjs';
const W = +(process.argv[2] || 390), H = +(process.argv[3] || 844);
const browser = await launch();
const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
const page = await ctx.newPage();
await page.goto('http://localhost:8080/', { waitUntil: 'load' });
for (let i = 0; i < 120; i++) { if (await page.evaluate(() => window.__aviva && window.__aviva.ready)) break; await page.waitForTimeout(250); }
await page.waitForTimeout(1000);
const r = await page.evaluate(() => {
  const vw = document.documentElement.clientWidth;
  const sw0 = document.documentElement.scrollWidth;
  const clipped = (el) => { for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) { const cs = getComputedStyle(p); if (cs.position === 'fixed') return true; if (/(hidden|clip|auto|scroll)/.test(cs.overflowX)) return true; } return false; };
  const cands = [];
  for (const el of document.querySelectorAll('body *')) {
    const cs = getComputedStyle(el);
    if (cs.position === 'fixed') continue;
    const b = el.getBoundingClientRect();
    if (!b.width || b.right <= vw + 1 || clipped(el)) continue;
    cands.push(el);
  }
  const res = [];
  for (const el of cands) {
    const d = el.style.display; el.style.display = 'none';
    const sw = document.documentElement.scrollWidth;
    el.style.display = d;
    const b = el.getBoundingClientRect();
    res.push(`${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}.${String(el.className || '').split(' ').join('.')} right=${Math.round(b.right)} hidden→sw=${sw}`);
  }
  return { vw, sw0, innerWidth, res: res.slice(0, 30) };
});
console.log(JSON.stringify(r, null, 1));
await browser.close();
