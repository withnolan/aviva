// Draws the research paper's vector figures (1, 2, 3, 4, 6) into docs/research/src/figures/*.svg.
// Units are millimetres (viewBox in mm, width/height in mm), so each figure prints at true size.
// Style: the site's graphite line drawing. Colour (decision #24): graphite lines and text; blueprint blue for
// dimension lines and the aviva series; nothing else. (Ink-blue is reserved for links and for real ink, Figure 5.)
// Text uses the paper's own fonts ("Hanken Grotesk"); paper.js inlines the SVGs so they can.
// Usage: node work/scripts/design/build-paper-figures.mjs
import fs from 'node:fs';
import path from 'node:path';

const OUT = 'docs/research/src/figures';
const G = '#2A2926', MUTED = '#615F58', BP = '#2A5BAE', RULE = '#CFCCC4', SOFT = '#8F8C85';
const PT = 0.3528;                       // 1 pt in mm
const r = (v) => +(+v).toFixed(3);
const FONT = 'font-family="Hanken Grotesk, Helvetica, Arial, sans-serif"';
const svg = (w, h, body, title) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${r(w)} ${r(h)}" width="${r(w)}mm" height="${r(h)}mm" role="img" aria-label="${title}">${body}</svg>\n`;
const text = (x, y, s, size, { fill = G, anchor = 'start', weight = 400, extra = '' } = {}) =>
  `<text x="${r(x)}" y="${r(y)}" ${FONT} font-size="${r(size * PT)}" font-weight="${weight}" fill="${fill}"${anchor !== 'start' ? ` text-anchor="${anchor}"` : ''}${extra ? ' ' + extra : ''}>${s}</text>`;
const line = (d, stroke, wPt, extra = '') => `<path d="${d}" fill="none" stroke="${stroke}" stroke-width="${r(wPt * PT)}"${extra ? ' ' + extra : ''}/>`;
// a blueprint dimension: from (x1,y1) to (x2,y2) along x or y, offset `off` mm from the measured edge, ticks at the ends
function dim({ x1, y1, x2, y2, off, label, side = 1, size = 6.2 }) {
  const horiz = Math.abs(y2 - y1) < 1e-6;
  let b = '';
  const ext = 1.3, gap = 0.9;
  if (horiz) {
    const y = y1 + side * off;
    b += line(`M${r(x1)} ${r(y1 + side * gap)}V${r(y + side * ext)}M${r(x2)} ${r(y1 + side * gap)}V${r(y + side * ext)}`, BP, 0.3);
    b += line(`M${r(x1)} ${r(y)}H${r(x2)}`, BP, 0.4);
    b += line(`M${r(x1 - 0.9)} ${r(y + 0.9)}L${r(x1 + 0.9)} ${r(y - 0.9)}M${r(x2 - 0.9)} ${r(y + 0.9)}L${r(x2 + 0.9)} ${r(y - 0.9)}`, BP, 0.55);
    b += text((x1 + x2) / 2, y - 1.15, label, size, { fill: BP, anchor: 'middle', weight: 500 });
  } else {
    const x = x1 + side * off;
    b += line(`M${r(x1 + side * gap)} ${r(y1)}H${r(x + side * ext)}M${r(x1 + side * gap)} ${r(y2)}H${r(x + side * ext)}`, BP, 0.3);
    b += line(`M${r(x)} ${r(y1)}V${r(y2)}`, BP, 0.4);
    b += line(`M${r(x - 0.9)} ${r(y1 + 0.9)}L${r(x + 0.9)} ${r(y1 - 0.9)}M${r(x - 0.9)} ${r(y2 + 0.9)}L${r(x + 0.9)} ${r(y2 - 0.9)}`, BP, 0.55);
    const ty = (y1 + y2) / 2, tx = x - 1.15 * (side < 0 ? 1 : -1) * -1;
    b += `<text transform="translate(${r(x + (side < 0 ? -1.15 : 2.35))} ${r(ty)}) rotate(-90)" ${FONT} font-size="${r(size * PT)}" font-weight="500" fill="${BP}" text-anchor="middle">${label}</text>`;
    void tx;
  }
  return b;
}
fs.mkdirSync(OUT, { recursive: true });

// ---------- Figure 1: aviva A4 and a typical output, same scale, identical dimension lines ----------
{
  const W = 170, h = 80, w = h / Math.SQRT2, gap = 44, top = 9.5;
  const x1 = (W - 2 * w - gap) / 2, x2 = x1 + w + gap, y = top, H = top + h + 10.5;
  const shadow = `<filter id="s" x="-25%" y="-20%" width="150%" height="145%"><feGaussianBlur in="SourceAlpha" stdDeviation="1.4"/><feOffset dx="0.35" dy="1.3"/><feComponentTransfer><feFuncA type="linear" slope="0.16"/></feComponentTransfer><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter>`;
  const sheet = (x) => `<rect x="${r(x)}" y="${r(y)}" width="${r(w)}" height="${r(h)}" fill="#fff" stroke="${G}" stroke-width="${r(0.5 * PT)}" filter="url(#s)"/>`;
  let body = `<defs>${shadow}</defs>` + sheet(x1) + sheet(x2);
  for (const [x, side] of [[x1, -1], [x2, 1]]) {
    body += dim({ x1: x, y1: y, x2: x + w, y2: y, off: 5.2, label: '210 mm', side: -1 });
    const ex = side < 0 ? x : x + w;
    body += dim({ x1: ex, y1: y, x2: ex, y2: y + h, off: 5.2, label: '297 mm', side });
  }
  body += text(x1 + w / 2, y + h + 7.6, 'aviva A4', 8, { anchor: 'middle' }) + text(x2 + w / 2, y + h + 7.6, 'Output', 8, { anchor: 'middle' });
  fs.writeFileSync(path.join(OUT, 'fig1.svg'), svg(W, H, body, 'Two identical blank A4 rectangles, each dimensioned 210 by 297 millimetres, labelled aviva A4 and Output'));
}

// ---------- Figure 2: the A-series nesting diagram, A0 halved into A1 … A10 ----------
{
  const A0w = 50, A0h = A0w * Math.SQRT2, ox = 9.5, oy = 8.5, W = 81.5, H = oy + A0h + 3;
  let x = ox, y = oy, w = A0w, h = A0h;
  const cells = [];
  for (let k = 1; k <= 10; k++) {
    if (w < h) { cells.push({ k, x, y, w, h: h / 2 }); y += h / 2; h /= 2; }   // portrait: cut across; the top half is A_k
    else { cells.push({ k, x, y, w: w / 2, h }); x += w / 2; w /= 2; }        // landscape: cut down; the left half is A_k
  }
  cells.push({ k: 10, x, y, w, h, twin: true });                              // the last remainder is a second A10
  let body = `<rect x="${ox}" y="${oy}" width="${r(A0w)}" height="${r(A0h)}" fill="#fff" stroke="${G}" stroke-width="${r(0.6 * PT)}"/>`;
  for (const c of cells) body += `<rect x="${r(c.x)}" y="${r(c.y)}" width="${r(c.w)}" height="${r(c.h)}" fill="none" stroke="${G}" stroke-width="${r(0.32 * PT)}"/>`;
  const a4 = cells.find((c) => c.k === 4);
  body += `<rect x="${r(a4.x)}" y="${r(a4.y)}" width="${r(a4.w)}" height="${r(a4.h)}" fill="none" stroke="${BP}" stroke-width="${r(1.0 * PT)}"/>`;
  // labels: small capitals inside the cells that fit, leaders for the smallest
  const leaderX = ox + A0w + 4.2;
  for (const c of cells.filter((c) => c.w >= 6)) {
    const cx = c.x + c.w / 2, cy = c.y + c.h / 2, size = Math.max(5, Math.min(8.4, c.w * 0.52));
    body += text(cx, cy + size * PT * 0.36, `A${c.k}`, size, { anchor: 'middle', fill: c.k === 4 ? BP : G, weight: c.k === 4 ? 500 : 400, extra: 'letter-spacing="0.05em"' });
  }
  const small = cells.filter((c) => c.w < 6).map((c) => ({ ...c, cx: c.x + c.w / 2, cy: c.y + c.h / 2 })).sort((a, b) => a.cy - b.cy || a.cx - b.cx);
  let ly = oy + A0h - (small.length - 1) * 3.9 - 0.6;
  for (const c of small) {
    body += line(`M${r(c.cx)} ${r(c.cy)}L${r(leaderX - 1)} ${r(ly - 0.8)}`, SOFT, 0.25) + `<circle cx="${r(c.cx)}" cy="${r(c.cy)}" r="0.28" fill="${G}"/>` +
      text(leaderX, ly, `A${c.k}`, 5.6, { extra: 'letter-spacing="0.05em"' });
    ly += 3.9;
  }
  // A0's own size, in blueprint
  body += dim({ x1: ox, y1: oy, x2: ox + A0w, y2: oy, off: 4.2, label: 'A0 · 841 mm', side: -1, size: 5.8 });
  body += dim({ x1: ox, y1: oy, x2: ox, y2: oy + A0h, off: 4.2, label: '1189 mm', side: -1, size: 5.8 });
  fs.writeFileSync(path.join(OUT, 'fig2.svg'), svg(W, H, body, 'The A-series: an A0 rectangle of 841 by 1189 millimetres halved repeatedly into A1 to A10, with the A4 cell outlined in blueprint blue'));
}

// ---------- Figure 3: win rate, two equal bars, zero-length error bars ----------
{
  const W = 81.5, H = 47, x0 = 12.5, y0 = 38, ph = 31, pw = 64;
  const yv = (p) => y0 - (p / 100) * ph;
  let body = '';
  for (const p of [0, 25, 50, 75, 100]) {
    body += line(`M${x0} ${r(yv(p))}H${x0 + pw}`, p ? RULE : G, p ? 0.3 : 0.6) + text(x0 - 1.8, yv(p) + 0.85, `${p}`, 6.2, { anchor: 'end', fill: MUTED });
  }
  body += `<text transform="translate(2.8 ${r(y0 - ph / 2)}) rotate(-90)" ${FONT} font-size="${r(6.2 * PT)}" fill="${MUTED}" text-anchor="middle">Win rate (%)</text>`;
  const bw = 14;
  for (const cx of [x0 + pw * 0.3, x0 + pw * 0.7]) {
    body += `<rect x="${r(cx - bw / 2)}" y="${r(yv(50))}" width="${bw}" height="${r(ph / 2)}" fill="${BP}"/>` +
      // the error bar: drawn, length zero (whisker and caps coincide at 50.0 %)
      line(`M${r(cx - 2.4)} ${r(yv(50))}H${r(cx + 2.4)}M${r(cx)} ${r(yv(50))}V${r(yv(50))}`, G, 0.8, 'stroke-linecap="round"') +
      text(cx, yv(50) - 2.1, '50.0', 6.8, { anchor: 'middle' }) + text(cx, y0 + 4.4, 'aviva A4', 6.8, { anchor: 'middle' });
  }
  fs.writeFileSync(path.join(OUT, 'fig3.svg'), svg(W, H, body, 'Bar chart: two equal bars, both labelled aviva A4, at 50.0 percent, with error bars of zero length'));
}

// ---------- Figure 4: thickness against folds, log axis 0.1 mm to 10^12 mm ----------
{
  const W = 170, H = 64, x0 = 19, y0 = 53, pw = 117, ph = 49;
  const xv = (n) => x0 + (n / 42) * pw;
  const yv = (mm) => y0 - ((Math.log10(mm) + 1) / 13) * ph;     // 10^-1 … 10^12
  let body = '';
  for (let e = -1; e <= 12; e++) {
    body += line(`M${x0} ${r(yv(10 ** e))}H${x0 + pw}`, RULE, 0.25);
    if ((e + 1) % 2 === 0) {
      const lab = e === -1 ? '0.1' : e === 0 ? '1' : e === 1 ? '10' : `10<tspan dy="-0.9" font-size="${r(4.4 * PT)}">${e}</tspan>`;
      body += `<text x="${x0 - 1.8}" y="${r(yv(10 ** e) + 0.85)}" ${FONT} font-size="${r(6.2 * PT)}" fill="${MUTED}" text-anchor="end">${lab}</text>`;
    }
  }
  for (const n of [0, 6, 12, 18, 24, 30, 36, 42]) body += line(`M${r(xv(n))} ${y0}v1.1`, G, 0.4) + text(xv(n), y0 + 4.1, `${n}`, 6.2, { anchor: 'middle' });
  body += line(`M${x0} ${y0 - ph}V${y0}H${x0 + pw}`, G, 0.6);
  body += text(x0 + pw / 2, y0 + 8.6, 'Folds, n', 6.2, { anchor: 'middle', fill: MUTED });
  body += `<text transform="translate(3.6 ${r(y0 - ph / 2)}) rotate(-90)" ${FONT} font-size="${r(6.2 * PT)}" fill="${MUTED}" text-anchor="middle">Thickness (mm, log scale)</text>`;
  // reference lines: a ream (≈ 5 cm) and the Moon (384,400 km)
  for (const [mm, lab] of [[50, 'a ream, ≈ 5 cm'], [3.844e11, 'the Moon, 384,400 km']]) {
    body += line(`M${x0} ${r(yv(mm))}H${x0 + pw}`, G, 0.45, 'stroke-dasharray="0.5 0.8"') + text(x0 + pw + 2, yv(mm) + 0.85, lab, 6.2);
  }
  // the roadmap beyond n = 6 (dashed, graphite), the sheet for n = 0..6 (solid blueprint + dots)
  const pts = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => `${r(xv(a + i))} ${r(yv(0.1 * 2 ** (a + i)))}`);
  body += line(`M${pts(6, 42).join('L')}`, SOFT, 0.6, 'stroke-dasharray="1.6 1.1"');
  body += line(`M${pts(0, 6).join('L')}`, BP, 0.95);
  for (let n = 0; n <= 6; n++) body += `<circle cx="${r(xv(n))}" cy="${r(yv(0.1 * 2 ** n))}" r="0.6" fill="${BP}"/>`;
  // the wall at n = 6 and the alternating-direction seventh fold (open dot)
  body += line(`M${r(xv(6))} ${y0 - ph}V${y0}`, G, 0.35) + text(xv(6) + 1.3, yv(3e8), 'wall (same direction each time)', 6.2);
  body += `<circle cx="${r(xv(7))}" cy="${r(yv(12.8))}" r="0.78" fill="#fff" stroke="${BP}" stroke-width="${r(0.6 * PT)}"/>` + text(xv(7) + 1.6, yv(12.8) + 3.4, 'alternating: 7', 6.2, { fill: BP });
  body += text(xv(0.4), yv(0.1 * 2 ** 4.6) - 1.6, 'our sheet', 6.2, { fill: BP, weight: 500 }) + text(xv(29.2), yv(0.1 * 2 ** 29.2) - 2.6, 'our roadmap', 6.2, { fill: MUTED, anchor: 'end' });
  fs.writeFileSync(path.join(OUT, 'fig4.svg'), svg(W, H, body, 'Log plot of thickness against number of folds, from 0.1 millimetres to beyond the Moon, with a wall at six folds and an open dot at seven for alternating folds'));
}

// ---------- Figure 6: the sheet's edge at magnification ----------
{
  const W = 81.5, H = 42, edge = 22.5;
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  let body = `<defs><clipPath id="c"><rect x="12" y="0" width="${r(W - 13.5)}" height="${r(edge + 12)}"/></clipPath></defs><g clip-path="url(#c)">`;
  // fibres inside the sheet (above the edge): long, faint, crossing
  for (let i = 0; i < 46; i++) {
    const x = 13 + rnd() * (W - 13), y = 2 + rnd() * (edge - 4), a = (rnd() - 0.5) * 0.9, L = 8 + rnd() * 22;
    const dx = Math.cos(a) * L / 2, dy = Math.sin(a) * L / 2, bend = (rnd() - 0.5) * 3;
    body += line(`M${r(x - dx)} ${r(y - dy)}Q${r(x + bend)} ${r(y + bend * 0.4)} ${r(x + dx)} ${r(y + dy)}`, G, 0.4, 'stroke-opacity="0.22"');
  }
  body += line(`M13 ${edge}H${W - 1.5}`, G, 0.8);            // the nominal edge
  for (let i = 0; i < 64; i++) {                              // ragged fibrils projecting beyond it
    const x = 14 + rnd() * (W - 17), L = 0.6 + rnd() ** 2 * 7.5, a = Math.PI / 2 + (rnd() - 0.5) * 1.6;
    const ex = x + Math.cos(a) * L, ey = edge + Math.sin(a) * L, cx = x + (rnd() - 0.5) * 1.6, cy = edge + L * 0.5;
    body += line(`M${r(x)} ${edge}Q${r(cx)} ${r(cy)} ${r(ex)} ${r(ey)}`, G, 0.35 + rnd() * 0.35, 'stroke-linecap="round"');
  }
  body += '</g>';
  // the 0.1 mm scale bar in blueprint (the field is 0.6 mm wide, so 0.1 mm = (W - 4) / 6)
  const bar = (W - 4) / 6, by = H - 2.6;
  body += line(`M${r(W - 2 - bar)} ${r(by)}H${W - 2}M${r(W - 2 - bar)} ${r(by - 1)}v2M${W - 2} ${r(by - 1)}v2`, BP, 0.7) +
    text(W - 2 - bar / 2, by - 1.8, '0.1 mm', 6.2, { anchor: 'middle', fill: BP, weight: 500 }) +
    text(2, 9, 'sheet', 6.2, { fill: MUTED }) + text(2, edge + 0.9, 'edge', 6.2, { fill: MUTED });
  fs.writeFileSync(path.join(OUT, 'fig6.svg'), svg(W, H, body, 'Line drawing of a paper edge under magnification, with ragged fibres projecting from a straight line and a 0.1 millimetre scale bar'));
}
console.log('figures →', OUT, fs.readdirSync(OUT).join(' '));
