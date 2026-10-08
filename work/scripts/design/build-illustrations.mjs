// Builds the testimonial drawings (s09) and the release-notes glyphs (s06), brief 5.7.
//   docs/assets/illustrations/{printer,cat,lamp,shredder,pencil,bin}.svg   96 x 96, 1.25 px line, pencil grain
//   docs/assets/illustrations/glyphs/<name>.svg + glyphs/sprite.svg        16 x 16, 1.25 px line
// Style: graphite, not sketchbook. Objects only. Precise, unhurried, mostly unshaded; at most a few light
// parallel strokes for shadow. Every stroke has an id and pathLength="1" so it can draw on with
// stroke-dashoffset; when a drawing is loaded as an <img> it draws itself on once, stroke by stroke.
// Colour: currentColor. As a standalone file (an <img> on the ink ground of s09) it defaults to paper white;
// glyphs default to graphite (they sit on the white ground of s06). Inline either and it follows `color`.
// Usage: node work/scripts/design/build-illustrations.mjs [preview.png]
import fs from 'node:fs';
import path from 'node:path';

const OUT = 'docs/assets/illustrations';
const PAPER = '#F7F5F0', GRAPHITE = '#2A2926';

// ---------- testimonial drawings: [id, d, opts] ; opts.s = shadow (light hatch), opts.w = width override ----------
// A half-length hexagonal HB pencil lying on a diagonal, computed in its own frame (s along the axis, t across).
function pencilStrokes() {
  const P0 = [23, 71], ang = (-41 * Math.PI) / 180, L = 62, h = 4.1, tip = 11.5, lead = 4;
  const u = [Math.cos(ang), Math.sin(ang)], n = [-u[1], u[0]];
  const at = (s, t) => [P0[0] + u[0] * s + n[0] * t, P0[1] + u[1] * s + n[1] * t].map((v) => +v.toFixed(2));
  const M = (pts) => 'M' + pts.map((q) => q.join(' ')).join('L');
  const body = [M([at(tip, -h), at(L, -h)]), M([at(tip, h), at(L, h)]), M([at(tip, h * 0.33), at(L, h * 0.33)])];
  const cone = M([at(tip, -h), at(0, 0), at(tip, h)]);
  // scalloped edge where the lacquer meets the sharpened wood
  const scallop = M([at(tip, -h), at(tip - 1.4, -h * 0.5), at(tip, -h * 0.05), at(tip - 1.3, h * 0.4), at(tip, h)]);
  const leadLine = M([at(lead, -h * lead / tip), at(lead + 0.5, 0), at(lead, h * lead / tip)]);
  // the cut end: a hexagon seen slightly from above, with the lead in the middle
  const hex = [];
  for (let k = 0; k <= 6; k++) { const a = (k * Math.PI) / 3 + Math.PI / 6; hex.push(at(L + Math.sin(a) * 1.3, Math.cos(a) * h)); }
  const end = M(hex);
  const dot = M([at(L + 0.05, 0), at(L + 0.06, 0)]);
  // "HB", set along the barrel
  const H = (s0) => [M([at(s0, -1.8), at(s0, 1.8)]), M([at(s0 + 2.5, -1.8), at(s0 + 2.5, 1.8)]), M([at(s0, 0), at(s0 + 2.5, 0)])].join('');
  const B = (s0) => M([at(s0, 1.8), at(s0, -1.8), at(s0 + 1.7, -1.8), at(s0 + 2.3, -1.2), at(s0 + 2.3, -0.55), at(s0 + 1.7, 0), at(s0, 0)]) +
    M([at(s0 + 1.8, 0), at(s0 + 2.5, 0.6), at(s0 + 2.5, 1.2), at(s0 + 1.8, 1.8), at(s0, 1.8)]);
  const shadow = [0, 1, 2, 3, 4].map((k) => M([at(18 + k * 8.5, h + 4.6), at(21 + k * 8.5, h + 3.2)])).join('');
  return [
    ['cone', cone], ['scallop', scallop], ['lead', leadLine],
    ['barrel-top', body[0]], ['barrel-bottom', body[1]], ['facet', body[2]],
    ['end', end], ['core', dot], ['hb', H(28) + B(32)],
    ['shadow', shadow, { s: 1 }],
  ];
}

const D = {
  printer: [
    ['body-front', 'M15.5 47.5h50v26h-50z'],
    ['body-top', 'M15.5 47.5l10-9h50l-10 9'],
    ['body-side', 'M65.5 73.5l10-9v-26'],
    ['out-slot', 'M30 43.2h40'],
    ['sheet', 'M31.5 43.2 35 19.5c12-1.9 25-1.9 37.2 0l-3.2 23.7'],
    ['tray', 'M19.5 66.5h34M17.5 73.5l-3 4h52l-1-4'],
    ['panel', 'M53.5 52.5h8v4h-8zM57.5 61.2h.01'],
    ['shadow', 'M58 82.5l3-3M64 82.5l3-3M70 81l2.6-2.6M75.5 77.2l2-2', { s: 1 }],
  ],
  cat: [
    // the sheet, lying on the desk; its back edges disappear behind the cat
    ['sheet', 'M17 65.5 6 68l40 12 44-12-13-3.25'],
    // asleep, curled, facing left
    ['back', 'M33 47c3-8 14-12 24-10s17 10 18 18c.6 5-1.5 9.6-6.2 11.2'],
    ['head', 'M33 47c-6.5-.4-12 4-12 10 0 5.3 4 9 9.6 9.2'],
    ['ear-left', 'M22.6 51.3l-2.2-7.7 6.6 3.8'],
    ['ear-right', 'M28.6 46.4l2.4-7 3.6 6.3'],
    ['eye', 'M24.6 56.8c1 1 2.6 1 3.6-.2'],
    ['tail', 'M68.8 66.2c-7.8 3.3-22.8 4.4-32.2 2.4-3.6-.8-5-2.6-3.8-4'],
    ['haunch', 'M60.5 44.5c5.5 3.5 6.9 11.9 3.1 16.9'],
    ['shadow', 'M42 73.6l2.4-1.8M48.5 73.6l2.4-1.8M55 73.2l2.4-1.8M61.5 72.4l2.4-1.8', { s: 1 }],
  ],
  lamp: [
    ['page', 'M36.5 76.5 58 66.5l29.5 6-21.5 10z'],
    ['base', 'M10.5 82.5h22M12.5 82.5c0-3.7 3.5-5.5 9-5.5s9 1.8 9 5.5'],
    ['arm-low', 'M19.6 77 31 45.4M23.4 77l11.4-31'],
    ['elbow', 'M35.4 43.6a2.2 2.2 0 1 1-4.4 0 2.2 2.2 0 1 1 4.4 0z'],
    ['arm-up', 'M34.4 41.8l26.4-18.9M36 44.3l26.4-19'],
    ['knuckle', 'M64.8 23.6a2.2 2.2 0 1 1-4.4 0 2.2 2.2 0 1 1 4.4 0z'],
    ['shade', 'M61 26.6 57.4 44M65.8 25.8l9.6 14.8M61 26.6c1-1.6 3.6-2.1 4.8-.8'],
    ['rim', 'M57.4 44c3.6 4.9 15.2 2.8 18-3.4-3.6-3.8-14.4-1.6-18 3.4z'],
    ['bulb', 'M63.4 46.2c1.2 2.2 4.8 2.2 6.4.2'],
    ['shadow', 'M66 86.2l3-2.2M72.5 84.4l3-2.2M79 82.6l3-2.2', { s: 1 }],
  ],
  shredder: [
    ['sheet', 'M30.5 31.5l3-20h30l-3 20'],
    ['head', 'M17.5 31.5h61v14h-61z'],
    ['slot', 'M27.5 35.5h41'],
    ['led', 'M70.5 40.5h.01'],
    ['bin', 'M20.5 45.5l3 37h49l3-37'],
    ['window', 'M29.5 52.5h37l-1.5 22h-34z'],
    ['strips', 'M36 52.5v6.5c0 2 1.4 3 1.4 5.2v8.3M42 52.5v4.4c0 2.4-1.3 3.7-1.3 6v10.6M48 52.5v8.6c0 2 1.2 3 1.2 5.2v6.2M54 52.5v3.6c0 2.6-1.4 3.8-1.4 6.2v11.2M60 52.5v7.4c0 2 1.3 3.1 1.3 5.4v7.2'],
    ['shadow', 'M60 89.5l3-2.6M67 89.5l3-2.6M74 88.2l2.6-2.4', { s: 1 }],
  ],
  pencil: pencilStrokes(),
  bin: [
    ['rim', 'M22.5 30.5c0-4 11.4-7 25.5-7s25.5 3 25.5 7-11.4 7-25.5 7-25.5-3-25.5-7z'],
    ['rim-in', 'M25.3 31.3c3.4 2.6 12.4 4.2 22.7 4.2s19.3-1.6 22.7-4.2'],
    ['side', 'M22.5 30.5l5 48c.4 3.5 9.4 6 20.5 6s20.1-2.5 20.5-6l5-48'],
    ['mesh', 'M31 36.2l3.4 47M39.5 37.3l1.6 48.2M56.5 37.3l-1.6 48.2M65 36.2l-3.4 47'],
    ['band', 'M25.6 60.5c5.3 2.3 13.2 3.6 22.4 3.6s17.1-1.3 22.4-3.6'],
    ['ball', 'M40.6 72.6l2.4-5.5 5.4-2.3 5.6 1.4 3.4 4.4-.2 5.6-4.1 3.7-5.6.6-4.9-2.5z'],
    ['ball-creases', 'M43 67.1l4.6 5.1 5.9-.8M47.6 72.2l-1 6.6'],
    ['shadow', 'M62 90.6l3-2.6M69 89.2l2.8-2.4M75.4 86.6l2.2-2', { s: 1 }],
  ],
};

// ---------- release-notes glyphs, 16 px grid ----------
const G = {
  map: 'M2.5 4.5l3.5-1.5 4 1.5 3.5-1.5v8.5L10 13l-4-1.5-3.5 1.5zM6 3v8.5M10 4.5V13',
  seal: 'M8 2.5a4.5 4.5 0 1 1 0 9 4.5 4.5 0 1 1 0-9zM8 5.2v3.6M6.2 7h3.6M5.5 11l-1 3 2-1 1.5 1.5M10.5 11l1 3-2-1-1.5 1.5',
  pin: 'M8 14s-4.5-4.4-4.5-7.5a4.5 4.5 0 0 1 9 0C12.5 9.6 8 14 8 14zM8 8a1.4 1.4 0 1 0 0-2.8A1.4 1.4 0 0 0 8 8z',
  scroll: 'M4.5 3.5h7.5a1.5 1.5 0 0 1 0 3h-1.5v6a1.5 1.5 0 0 1-1.5 1.5H3a1.5 1.5 0 0 1 0-3h1.5zM4.5 11.5V3.5M6.5 7h2M6.5 9h2',
  watermark: ['M3.5 1.5h9v13h-9z', 'M6 6.1V5h1.1M10 6.1V5H8.9M6 9.9V11h1.1M10 9.9V11H8.9'],
  book: 'M2.5 3.5c2-.8 3.9-.6 5.5.8 1.6-1.4 3.5-1.6 5.5-.8v9c-2-.8-3.9-.6-5.5.8-1.6-1.4-3.5-1.6-5.5-.8zM8 4.3v9',
  wasp: 'M8 5.5c1.6 0 2.5 1.6 2.5 4s-1.1 4.5-2.5 4.5-2.5-2.1-2.5-4.5S6.4 5.5 8 5.5zM5.6 9.2h4.8M5.9 11.4h4.2M8 5.5V4M6.8 2.6 8 4l1.2-1.4M5.5 7.5 2 5.5l1.4 3.3M10.5 7.5 14 5.5l-1.4 3.3',
  letter: 'M2.5 4.5h11v8h-11zM2.5 4.5 8 9l5.5-4.5M2.5 12.5 6.5 8.2M13.5 12.5 9.5 8.2',
  roller: 'M8 1.8a2.7 2.7 0 1 1 0 5.4 2.7 2.7 0 1 1 0-5.4zM8 8.8a2.7 2.7 0 1 1 0 5.4 2.7 2.7 0 1 1 0-5.4zM1.5 8h13M8 4.5h.01M8 11.5h.01',
  log: 'M10 3.5a4.5 4.5 0 1 1 0 9 4.5 4.5 0 1 1 0-9zM10 6a2 2 0 1 1 0 4 2 2 0 1 1 0-4zM10 3.5H3.8M10 12.5H3.8M3.8 3.5c-1.4 1.1-1.9 2.7-1.9 4.5s.5 3.4 1.9 4.5M10 8h.01',
  area: 'M2.5 2.5h11v11h-11zM5.2 6.7l1.2-.8v4.6M8.4 7.6v2.9M8.4 8.6c0-.8.5-1 1-1s1 .3 1 1v1.9M10.4 8.6c0-.8.5-1 1-1s1 .3 1 1v1.9M12.3 4.6c.2-.3.5-.5.8-.5.4 0 .7.3.7.6 0 .5-.6.8-1.5 1.5h1.6',
  globe: 'M8 2.5a5.5 5.5 0 1 1 0 11 5.5 5.5 0 1 1 0-11zM2.5 8h11M8 2.5c1.6 1.6 2.3 3.5 2.3 5.5S9.6 11.9 8 13.5M8 2.5C6.4 4.1 5.7 6 5.7 8s.7 3.9 2.3 5.5',
  screen: 'M1.5 3.5h13v8.5h-13zM5.5 14.5h5M8 12v2.5M6.4 6.2l3.2 3.1M9.6 6.2 6.4 9.3',
  reeds: ['M5 14.5V7.2M8 14.5V5.2M11 14.5V7.8M4.2 4.6a.8.8 0 0 1 1.6 0v2.6a.8.8 0 0 1-1.6 0zM7.2 2.6a.8.8 0 0 1 1.6 0v2.6a.8.8 0 0 1-1.6 0zM10.2 5.2a.8.8 0 0 1 1.6 0v2.6a.8.8 0 0 1-1.6 0zM5 14.5c-.6-2-1.7-3.4-3-4M11 14.5c.6-2 1.7-3.2 3-3.7', 'M1.8 14.2 14.2 1.8'],
};

const grainFilter = (id, freq) => `<filter id="${id}" x="-5%" y="-5%" width="110%" height="110%" color-interpolation-filters="sRGB">` +
  `<feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="2" seed="11" result="n"/>` +
  `<feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.9 0.52" result="g"/>` +
  `<feComposite in="SourceGraphic" in2="g" operator="in"/></filter>`;

function drawing(name, strokes, defaultColour) {
  const css = `svg:root{color:${defaultColour}}` +
    `.l{fill:none;stroke:currentColor;stroke-width:1.25;stroke-linecap:round;stroke-linejoin:round}` +
    `.s{stroke-width:1;opacity:.42}` +
    `.l{stroke-dasharray:1;stroke-dashoffset:1;animation:draw 1.1s cubic-bezier(.65,0,.35,1) calc(var(--i)*90ms) forwards}` +
    `@keyframes draw{to{stroke-dashoffset:0}}` +
    `@media (prefers-reduced-motion:reduce){.l{animation:none;stroke-dashoffset:0}}`;
  const paths = strokes.map(([id, d, o = {}], i) => `<path id="${name}-${id}" class="l${o.s ? ' s' : ''}" style="--i:${i}" pathLength="1" d="${d}"/>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" width="96" height="96" aria-hidden="true">` +
    `<style>${css}</style><defs>${grainFilter('grain', 0.85)}</defs><g filter="url(#grain)">${paths}</g></svg>\n`;
}

const gPaths = (name, d) => (Array.isArray(d) ? d : [d]).map((x, i) => `<path id="g-${name}${i ? '-' + i : ''}" pathLength="1"${i && name === 'watermark' ? ' opacity=".5"' : ''} d="${x}"/>`).join('');
function glyph(name, d) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><style>svg:root{color:${GRAPHITE}}</style>${gPaths(name, d)}</svg>\n`;
}

fs.mkdirSync(path.join(OUT, 'glyphs'), { recursive: true });
for (const [n, s] of Object.entries(D)) fs.writeFileSync(path.join(OUT, `${n}.svg`), drawing(n, s, PAPER));
for (const [n, d] of Object.entries(G)) fs.writeFileSync(path.join(OUT, 'glyphs', `${n}.svg`), glyph(n, d));
fs.writeFileSync(path.join(OUT, 'glyphs', 'sprite.svg'),
  `<svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style="display:none">\n` +
  Object.entries(G).map(([n, d]) => `<symbol id="g-${n}" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round">${gPaths(n, d).replace(/ id="[^"]+"/g, '')}</symbol>`).join('\n') + '\n</svg>\n');
console.log(Object.keys(D).length, 'drawings,', Object.keys(G).length, 'glyphs →', OUT);

if (process.argv[2]) {
  const { launch } = await import('./snap.mjs');
  const b = await launch();
  const p = await b.newPage({ viewport: { width: 1200, height: 900 }, deviceScaleFactor: 2 });
  const inline = (n, s) => drawing(n, s, PAPER).replace('<svg ', '<svg style="width:var(--z);height:var(--z)" ').replace(/svg:root\{color:[^}]+\}/, '').replace(/animation:draw[^;}]+/, 'animation:none;stroke-dashoffset:0').replace(/id="grain"/, `id="grain-${n}"`).replace('url(#grain)', `url(#grain-${n})`);
  const cells = (z) => Object.entries(D).map(([n, s]) => `<figure style="--z:${z}px"><div>${inline(n, s)}</div><figcaption>${n}</figcaption></figure>`).join('');
  const gs = (d, z) => `<svg viewBox="0 0 16 16" width="${z}" height="${z}" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round">${gPaths('x', d).replace(/ id="[^"]+"/g, '')}</svg>`;
  const glyphs = Object.entries(G).map(([n, d]) => `<figure>${gs(d, 32)}${gs(d, 16)}<figcaption>${n}</figcaption></figure>`).join('');
  const css = `body{margin:0;font:500 10px/1.2 sans-serif;letter-spacing:.08em;text-transform:uppercase}.g{display:flex;flex-wrap:wrap;gap:12px;padding:16px}figure{margin:0;padding:10px;border:1px solid var(--r);display:grid;justify-items:center;gap:6px}figcaption{color:var(--m)}`;
  await p.setContent(`<!doctype html><style>${css}</style>` +
    `<div class=g style="background:#2E2A8E;color:#F7F5F0;--r:rgba(247,245,240,.28);--m:#C8C6E4">${cells(192)}</div>` +
    `<div class=g style="background:#2E2A8E;color:#F7F5F0;--r:rgba(247,245,240,.28);--m:#C8C6E4">${cells(96)}</div>` +
    `<div class=g style="background:#F7F5F0;color:#2A2926;--r:#D9D6CE;--m:#615F58">${cells(96)}</div>` +
    `<div class=g style="background:#F7F5F0;color:#2A2926;--r:#D9D6CE;--m:#615F58">${glyphs}</div>`);
  await p.screenshot({ path: process.argv[2], fullPage: true });
  await b.close();
}
