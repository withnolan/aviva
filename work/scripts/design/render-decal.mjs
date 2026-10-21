// Renders docs/assets/logo/wordmark-floor.svg to a 4096 px-wide transparent PNG (alpha = ink).
// RGB is then flattened to graphite by work/scripts/design/flatten-rgb.py so mip-maps never pick up black fringes.
// Usage: node work/scripts/design/render-decal.mjs [width=4096]
import { launch } from './snap.mjs';
import fs from 'node:fs';
const W = Number(process.argv[2] || 4096);
const svg = fs.readFileSync('docs/assets/logo/wordmark-floor.svg', 'utf8');
const [, , vw, vh] = svg.match(/viewBox="([^"]+)"/)[1].split(/\s+/).map(Number);
const H = Math.round(W * vh / vw);
const b = await launch();
const p = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
await p.setContent(`<!doctype html><html><head><style>html,body{margin:0;background:transparent}svg{display:block;width:${W}px;height:${H}px}</style></head><body>${svg}</body></html>`);
await p.screenshot({ path: 'docs/assets/logo/wordmark-floor.png', omitBackground: true, clip: { x: 0, y: 0, width: W, height: H } });
await b.close();
console.log('wordmark-floor.png', W, 'x', H);
