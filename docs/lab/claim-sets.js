// claim-sets.js: lab-only set pieces for the s11 claim-card renders (brief 11.3, 5.6, T20). The lab builds one with
// `set=c1` (see the claim1..3 states in paper-lab.js); work/scripts/paper-proto/claims.mjs renders the stills.
//   c1 "Context window": the sheet IS the pane of a small white sash window in a pale plaster wall, daylight glowing
//      through it, with graphite dimension lines (210 / 297 mm) drawn on the wall.
//   c2 / c3 need no extra pieces (the sweep is the studio in bg=, the props are the lab's pencil, paint, dot and tear).
import * as THREE from 'three';

export async function buildClaimSet(name, { sheet }) {
  const g = new THREE.Group(); g.name = 'claimset.' + name;
  if (name === 'c1') await windowSet(g, sheet.object.position.clone());
  g.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return g;
}

async function windowSet(g, c) {
  const W = 0.21, H = 0.297, zw = 0.016;                   // the opening is the sheet; the wall's face sits 16 mm in front
  const plaster = new THREE.MeshStandardMaterial({ color: '#e8e1d5', roughness: 0.97, bumpMap: noiseTexture(), bumpScale: 0.6 });
  const paint = new THREE.MeshStandardMaterial({ color: '#f2f0ea', roughness: 0.42 });
  const brass = new THREE.MeshStandardMaterial({ color: '#c9a35f', metalness: 1, roughness: 0.28 });
  // the wall, with the opening cut out
  const s = new THREE.Shape([new THREE.Vector2(-2, -2), new THREE.Vector2(2, -2), new THREE.Vector2(2, 2), new THREE.Vector2(-2, 2)]);
  s.holes.push(new THREE.Path([new THREE.Vector2(-W / 2, -H / 2), new THREE.Vector2(-W / 2, H / 2), new THREE.Vector2(W / 2, H / 2), new THREE.Vector2(W / 2, -H / 2)]));
  const wall = new THREE.Mesh(new THREE.ShapeGeometry(s), plaster); wall.position.set(c.x, c.y, c.z + zw);
  const geo = (w, h, d, x, y, z) => new THREE.BoxGeometry(w, h, d).translate(x, y, z);
  const cw = 0.017, cd = 0.007;                             // the casing's width and how proud it stands
  const frame = [
    // the reveal: jambs and head between the wall's face and the pane
    geo(0.003, H, zw, -W / 2 - 0.0015, 0, zw / 2), geo(0.003, H, zw, W / 2 + 0.0015, 0, zw / 2), geo(W + 0.006, 0.003, zw, 0, H / 2 + 0.0015, zw / 2),
    // the casing round the opening, and the sill (a stool with a nosing) below it
    geo(cw, H + cw, cd, -W / 2 - cw / 2, cw / 2, zw + cd / 2), geo(cw, H + cw, cd, W / 2 + cw / 2, cw / 2, zw + cd / 2), geo(W, cw, cd, 0, H / 2 + cw / 2, zw + cd / 2),
    geo(W + 2 * cw + 0.026, 0.012, 0.05, 0, -H / 2 - 0.006, zw + 0.012), geo(W + 2 * cw, 0.014, 0.004, 0, -H / 2 - 0.019, zw + 0.002),
    // the upper sash (outer, near the pane): stiles, top rail, meeting rail
    geo(0.008, H / 2, 0.006, -W / 2 + 0.004, H / 4, 0.004), geo(0.008, H / 2, 0.006, W / 2 - 0.004, H / 4, 0.004),
    geo(W, 0.01, 0.006, 0, H / 2 - 0.005, 0.004), geo(W, 0.011, 0.006, 0, 0.0055, 0.004),
    // the lower sash (inner, toward the room): stiles, meeting rail, a deeper bottom rail
    geo(0.008, H / 2, 0.006, -W / 2 + 0.004, -H / 4, 0.0095), geo(0.008, H / 2, 0.006, W / 2 - 0.004, -H / 4, 0.0095),
    geo(W, 0.011, 0.006, 0, -0.0045, 0.0095), geo(W, 0.016, 0.006, 0, -H / 2 + 0.008, 0.0095),
  ];
  const wood = new THREE.Mesh(mergeBoxes(frame), paint); wood.position.copy(c);
  // brass: the sash fastener on the meeting rails and two lifts on the lower sash
  const fittings = new THREE.Mesh(mergeBoxes([geo(0.016, 0.004, 0.004, 0, 0.0005, 0.0145), geo(0.006, 0.006, 0.003, 0.006, 0.003, 0.0135),
    geo(0.01, 0.003, 0.006, -0.06, -H / 2 + 0.012, 0.0155), geo(0.01, 0.003, 0.006, 0.06, -H / 2 + 0.012, 0.0155)]), brass);
  fittings.position.copy(c);
  // the dimension lines, drawn on the wall in graphite
  const S = 0.62, tex = await dimensionTexture(S, W, H, cw);
  const dims = new THREE.Mesh(new THREE.PlaneGeometry(S, S), new THREE.MeshStandardMaterial({ map: tex, transparent: true, roughness: 0.9, depthWrite: false }));
  dims.position.set(c.x, c.y, c.z + zw + 0.0004); dims.castShadow = false;
  g.add(wall, wood, fittings, dims);
}

function mergeBoxes(list) {
  // plain merge of non-indexed boxes (position, normal, uv)
  const parts = list.map((b) => b.toNonIndexed()), n = parts.reduce((s, p) => s + p.attributes.position.count, 0);
  const out = new THREE.BufferGeometry();
  for (const k of ['position', 'normal', 'uv']) {
    const size = parts[0].attributes[k].itemSize, arr = new Float32Array(n * size); let o = 0;
    for (const p of parts) { arr.set(p.attributes[k].array, o); o += p.attributes[k].array.length; }
    out.setAttribute(k, new THREE.BufferAttribute(arr, size));
  }
  return out;
}

function noiseTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d'), img = x.createImageData(256, 256);
  for (let i = 0; i < img.data.length; i += 4) { const v = 128 + (Math.random() - 0.5) * 40; img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255; }
  x.putImageData(img, 0, 0); const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(10, 10); t.colorSpace = THREE.NoColorSpace; return t;
}

async function dimensionTexture(S, W, H, cw) {
  try {
    const url = new URL('../assets/fonts/dm-mono-400-latin.woff2', import.meta.url).href;
    const f = await new FontFace('DM Mono', `url(${url})`, { weight: '400' }).load(); document.fonts.add(f);
  } catch { /* the fallback monospace */ }
  const N = 2048, k = N / S, c = document.createElement('canvas'); c.width = c.height = N; const x = c.getContext('2d');
  const X = (m) => N / 2 + m * k, Y = (m) => N / 2 - m * k;     // metres from the window's centre -> canvas px
  x.strokeStyle = 'rgba(42,41,38,0.82)'; x.fillStyle = 'rgba(42,41,38,0.86)'; x.lineWidth = 0.0011 * k; x.lineCap = 'round';
  const line = (x0, y0, x1, y1) => { x.beginPath(); x.moveTo(X(x0), Y(y0)); x.lineTo(X(x1), Y(y1)); x.stroke(); };
  const tick = (px, py) => { const d = 0.0055; line(px - d, py - d, px + d, py + d); };   // the architect's 45 deg tick
  x.font = `400 ${Math.round(0.0125 * k)}px "DM Mono", ui-monospace, monospace`; x.textAlign = 'center'; x.textBaseline = 'middle';
  // 297: the opening's height, left of the casing
  const vx = -W / 2 - cw - 0.03;
  line(-W / 2 - cw - 0.008, H / 2, vx - 0.008, H / 2); line(-W / 2 - cw - 0.008, -H / 2, vx - 0.008, -H / 2);   // extension lines
  line(vx, -H / 2 - 0.006, vx, H / 2 + 0.006); tick(vx, H / 2); tick(vx, -H / 2);
  x.save(); x.translate(X(vx - 0.016), Y(0)); x.rotate(-Math.PI / 2); x.fillText('297 mm', 0, 0); x.restore();
  // 210: the opening's width, below the sill
  const hy = -H / 2 - 0.058;
  line(-W / 2, -H / 2 - 0.03, -W / 2, hy - 0.008); line(W / 2, -H / 2 - 0.03, W / 2, hy - 0.008);
  line(-W / 2 - 0.006, hy, W / 2 + 0.006, hy); tick(-W / 2, hy); tick(W / 2, hy);
  x.fillText('210 mm', X(0), Y(hy - 0.016));
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}
