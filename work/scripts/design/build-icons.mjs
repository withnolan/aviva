// Builds the aviva icon set: docs/assets/icons/<name>.svg + docs/assets/icons/sprite.svg (<symbol id="i-<name>">).
// Style (brief 5.8): 24 px grid, 1.5 px line, round caps and joins, no fills, currentColor. Paper white on ink
// comes free: the icons inherit `color`. Usage: node work/scripts/design/build-icons.mjs [preview.png]
import fs from 'node:fs';
import path from 'node:path';

const OUT = 'docs/assets/icons';
const S2 = Math.SQRT2;
const r = (v) => +v.toFixed(2);

// A pencil lying along +x, tip at x0, end at x1, centred on y = 12; drawn flat then rotated.
function pencil(x0, x1, { eraser = true } = {}) {
  const h = 1.9; // half thickness
  const cone = 3.6;
  const ferrule = eraser ? 1.8 : 0;
  const rub = eraser ? 1.9 : 0;
  const bodyEnd = x1 - ferrule - rub;
  let d = `M${x0} 12L${x0 + cone} ${12 - h}H${bodyEnd}V${12 + h}H${x0 + cone}Z`;   // tip + body
  d += `M${x0 + cone} ${12 - h}L${x0 + cone} ${12 + h}`;                          // where the wood meets the lacquer
  d += `M${x0 + 1.25} ${12 - 0.62}L${x0 + 1.25} ${12 + 0.62}`;                    // graphite point
  if (eraser) {
    d += `M${bodyEnd} ${12 - h}H${bodyEnd + ferrule}V${12 + h}H${bodyEnd}`;      // ferrule
    d += `M${bodyEnd + ferrule} ${12 - h}H${x1 - 0.6}Q${x1} ${12 - h} ${x1} ${12 - h + 0.6}V${12 + h - 0.6}Q${x1} ${12 + h} ${x1 - 0.6} ${12 + h}H${bodyEnd + ferrule}`; // eraser
  }
  return d;
}

function cropMarks(W, H, h, gap, arm, ox = 0, oy = 0) {
  const w = h / S2, x = ox + (W - w) / 2, y = oy + (H - h) / 2;
  let d = '';
  for (const [cx, sx] of [[x, -1], [x + w, 1]]) for (const [cy, sy] of [[y, -1], [y + h, 1]]) {
    d += `M${r(cx + sx * gap)} ${r(cy)}H${r(cx + sx * (gap + arm))}M${r(cx)} ${r(cy + sy * gap)}V${r(cy + sy * (gap + arm))}`;
  }
  return d;
}

// Corner-rating glyph: a 1 : sqrt(2) sheet implied by four corner marks; a missing corner is dog-eared.
function rating(n) {
  const h = 18, w = h / S2, x = 12 - w / 2, y = 12 - h / 2, a = 3.6; // arm length
  const tl = `M${r(x)} ${r(y + a)}V${r(y)}H${r(x + a)}`;
  const tr = `M${r(x + w - a)} ${r(y)}H${r(x + w)}V${r(y + a)}`;
  const br = `M${r(x + w)} ${r(y + h - a)}V${r(y + h)}H${r(x + w - a)}`;
  const bl = `M${r(x + a)} ${r(y + h)}H${r(x)}V${r(y + h - a)}`;
  const ear = `M${r(x + w - a)} ${r(y)}L${r(x + w)} ${r(y + a)}`; // the fold line where the corner used to be
  return [tl, n >= 4 ? tr : ear, br, bl].join('');
}

const P = {
  // Writing and making
  pencil: `<path transform="rotate(-45 12 12)" d="${pencil(2.2, 21.8)}"/>`,
  eraser: `<path transform="rotate(135 12 12)" d="${pencil(2.2, 21.8)}"/><path d="M3.5 21.25h5"/>`,
  regenerate: `<path d="M7.6 12.4 9.9 9.5l3.2-.4 2.9 1.5 1.1 3-1 3.1-2.9 1.9-3.3-.3-2.3-2.2z"/><path d="M8.4 14.7l2.7-2.1 2.1 2.6 3.2-2.1"/><path d="M19.4 7.4A8.75 8.75 0 0 0 5.1 5.9"/><path d="M4.6 2.9v3.4H8"/>`,
  tear: `<path d="M5.25 3.25h13.5v17.5H5.25v-7.25l2-1.5-2-1.5z"/><path d="M10.25 12h.01M13.25 12h.01M16.25 12h.01" stroke-width="1.75"/>`,
  magnifier: `<path d="M3.25 8.75h17.5v6.5H3.25z"/><path d="M6.25 12h11.5" stroke-width="1.5"/><path d="M5.25 4.75h5.5M13.25 4.75h4.5M5.25 19.25h4M12.25 19.25h6.5" stroke-width="1"/>`,
  // Paper furniture
  'dog-ear': `<path d="M5.25 3.25h9l4.5 4.5v13H5.25z"/><path d="M14.25 3.25v4.5h4.5"/>`,
  'crop-marks': `<path d="${cropMarks(24, 24, 11.2, 1.6, 4.8)}" stroke-linecap="butt"/>`,
  'ruler-tick': `<path d="M16.75 2.75v18.5M16.75 3.25h-6.5M16.75 7.75h-3.25M16.75 12h-6.5M16.75 16.25h-3.25M16.75 20.75h-6.5"/>`,
  'turn-over': `<path d="M5.25 3.25h13.5v10.5c-3 .1-5.6 2.4-6 7H5.25z"/><path d="M18.75 13.75c-2.8 1.2-4.9 3.3-6 7"/>`,
  // Actions
  plane: `<path d="M2.75 11.1 21.25 3.75l-5.2 16.5-4.6-6.1z"/><path d="m21.25 3.75-9.8 10.4-.4 5.6 2.6-3.1"/>`,
  copy: `<path d="M8.75 6.75v-3.5h10v14h-3.5"/><path d="M5.25 6.75h10v14h-10z"/>`,
  download: `<path d="M5.25 3.25h13.5v17.5H5.25z"/><path d="M12 7.75v8.5M8.75 13l3.25 3.25L15.25 13"/>`,
  external: `<path d="M13.25 5.25h-8v15.5h13.5v-8"/><path d="M11.25 12.75 20.25 3.75M14.75 3.75h5.5v5.5"/>`,
  printer: `<path d="M7.25 9.25v-6h9.5v6"/><path d="M7.25 17.25H3.25v-8h17.5v8h-4"/><path d="M7.25 14.25h9.5v6.5h-9.5z"/><path d="M17.25 11.75h.01" stroke-width="1.75"/>`,
  check: `<path d="M4.75 12.75l4.5 4.5 10-10.5"/>`,
  // Ratings
  'rating-4': `<path d="${rating(4)}"/>`,
  'rating-3': `<path d="${rating(3)}"/>`,
};

const head = (inner, id) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>\n`;

fs.mkdirSync(OUT, { recursive: true });
for (const [name, inner] of Object.entries(P)) fs.writeFileSync(path.join(OUT, `${name}.svg`), head(inner));
const sprite = `<svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style="display:none">\n` +
  Object.entries(P).map(([n, inner]) => `<symbol id="i-${n}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${inner}</symbol>`).join('\n') + '\n</svg>\n';
fs.writeFileSync(path.join(OUT, 'sprite.svg'), sprite);
console.log(Object.keys(P).length, 'icons →', OUT);

if (process.argv[2]) {
  const { launch } = await import('./snap.mjs');
  const b = await launch();
  const p = await b.newPage({ viewport: { width: 1200, height: 560 }, deviceScaleFactor: 2 });
  const cells = Object.entries(P).map(([n, inner]) => `<figure><div class=row>${[24, 48].map((s) => `<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`).join('')}</div><figcaption>${n}</figcaption></figure>`).join('');
  const css = `body{margin:0;font:500 10px/1.2 sans-serif;letter-spacing:.08em;text-transform:uppercase}.g{display:grid;grid-template-columns:repeat(9,1fr);gap:10px;padding:20px}figure{margin:0;padding:12px;border:1px solid var(--r)}.row{display:flex;gap:12px;align-items:center;height:52px}figcaption{margin-top:8px;color:var(--m)}`;
  await p.setContent(`<!doctype html><style>${css}</style><div class=g style="background:#F7F5F0;color:#2A2926;--r:#D9D6CE;--m:#615F58">${cells}</div><div class=g style="background:#2E2A8E;color:#F7F5F0;--r:rgba(247,245,240,.28);--m:#C8C6E4">${cells}</div>`);
  await p.screenshot({ path: process.argv[2], fullPage: true });
  await b.close();
}
