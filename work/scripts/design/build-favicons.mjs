// Builds docs/favicon.svg, docs/assets/favicon-32.png and docs/assets/apple-touch-icon.png.
// The favicon is the logomark at its own optical size: heavier strokes, a slightly larger gap, so the
// eight crop-mark arms survive 16 px. Usage: node work/scripts/design/build-favicons.mjs
import { launch } from './snap.mjs';
import fs from 'node:fs';
const S2 = Math.SQRT2, r = (v) => +v.toFixed(3);
function cropPath(W, H, h, gap, arm) {
  const w = h / S2, x = (W - w) / 2, y = (H - h) / 2; let d = '';
  for (const [cx, sx] of [[x, -1], [x + w, 1]]) for (const [cy, sy] of [[y, -1], [y + h, 1]]) {
    d += `M${r(cx + sx * gap)} ${r(cy)}H${r(cx + sx * (gap + arm))}M${r(cx)} ${r(cy + sy * gap)}V${r(cy + sy * (gap + arm))}`;
  }
  return d;
}
const fav = cropPath(32, 32, 13.5, 2, 6.25);
const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><style>path{stroke:#2A2926}@media (prefers-color-scheme:dark){path{stroke:#F7F5F0}}</style><path d="${fav}" fill="none" stroke-width="3"/></svg>\n`;
fs.writeFileSync('docs/favicon.svg', faviconSvg);
// apple-touch-icon: paper-white tile, graphite marks at the logomark's own proportions (26 x 30 grid), 56 % tall
const apple = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180"><rect width="180" height="180" fill="#F7F5F0"/><g transform="translate(${r(90 - 13 * 3.4)} ${r(90 - 15 * 3.4)}) scale(3.4)"><path d="${cropPath(26, 30, 14, 2, 6)}" fill="none" stroke="#2A2926" stroke-width="1.5"/></g></svg>`;
const b = await launch();
async function png(svg, size, out, transparent) {
  const p = await b.newPage({ viewport: { width: size, height: size }, deviceScaleFactor: 1 });
  await p.setContent(`<!doctype html><style>html,body{margin:0;background:transparent}svg{display:block;width:${size}px;height:${size}px}</style>${svg}`);
  await p.screenshot({ path: out, omitBackground: transparent });
  await p.close();
}
await png(faviconSvg.replace(/<style>.*<\/style>/, '').replace('<path ', '<path stroke="#2A2926" '), 32, 'docs/assets/favicon-32.png', true);
await png(apple, 180, 'docs/assets/apple-touch-icon.png', false);
// preview sheet: 16, 32, 64 light + dark, apple icon
const p = await b.newPage({ viewport: { width: 520, height: 220 } });
const light = faviconSvg, dark = faviconSvg.replace('#2A2926', '#F7F5F0');
await p.setContent(`<!doctype html><body style="margin:0;display:flex;gap:18px;align-items:center;padding:20px;background:#F7F5F0">
${[16, 32, 64].map((s) => `<img style="width:${s}px" src="data:image/svg+xml;base64,${Buffer.from(light).toString('base64')}">`).join('')}
<div style="background:#202124;padding:12px;display:flex;gap:14px;align-items:center">${[16, 32, 64].map((s) => `<img style="width:${s}px" src="data:image/svg+xml;base64,${Buffer.from(dark).toString('base64')}">`).join('')}</div>
<img style="width:90px;border-radius:20px;box-shadow:0 0 0 1px #ddd" src="data:image/png;base64,${fs.readFileSync('docs/assets/apple-touch-icon.png').toString('base64')}">
<img style="width:32px;image-rendering:pixelated;width:64px" src="data:image/png;base64,${fs.readFileSync('docs/assets/favicon-32.png').toString('base64')}"></body>`);
await p.screenshot({ path: process.env.PREVIEW || 'favicon-preview.png' });
await b.close();
console.log('ok');
