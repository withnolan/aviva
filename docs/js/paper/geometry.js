// geometry.js: the flat rest sheet as ONE BufferGeometry: top surface + bottom surface + 4 edge walls.
// All shape comes from the vertex shader (glsl.js), so the geometry never changes and is shared by every sheet
// with the same segment count. Attribute aShell = (side, outX, outY, wallV):
//   side +1 top (front, normal +z), -1 bottom (back), 0 edge wall; (outX, outY) outward rest direction of a wall; wallV +-1.
import * as THREE from 'three';

const cache = new Map();

/** Square-ish cells: segW x segH. Even counts put the centre lines x = 0 / y = 0 on vertex lines (A4 -> A5 -> A6 creases). */
export function sheetSegments(segW, size = { w: 0.21, h: 0.297 }) {
  const w = Math.max(1, Math.round(segW));
  const h = Math.max(1, Math.round(w * size.h / size.w / 2) * 2 || 1);
  return [w % 2 && w > 1 ? w + 1 : w, h];
}

export function createSheetGeometry(segW = 128, segH = 181, size = { w: 0.21, h: 0.297 }) {
  const key = `${segW}x${segH}@${size.w}x${size.h}`;
  if (cache.has(key)) { const g = cache.get(key); g.userData.refs++; return g; }
  const nTop = (segW + 1) * (segH + 1), nWall = 2 * 2 * (segW + segH + 2);
  const pos = new Float32Array((2 * nTop + nWall) * 3), shell = new Float32Array((2 * nTop + nWall) * 4);
  const idx = [];
  let v = 0;
  const push = (x, y, side, ox, oy, wv) => { pos[v * 3] = x; pos[v * 3 + 1] = y; shell[v * 4] = side; shell[v * 4 + 1] = ox; shell[v * 4 + 2] = oy; shell[v * 4 + 3] = wv; return v++; };
  const grid = (side) => {
    const base = v;
    for (let j = 0; j <= segH; j++) for (let i = 0; i <= segW; i++) push((i / segW - 0.5) * size.w, (j / segH - 0.5) * size.h, side, 0, 0, 0);
    for (let j = 0; j < segH; j++) for (let i = 0; i < segW; i++) {
      const a = base + j * (segW + 1) + i, b = a + 1, c = a + segW + 1, d = c + 1;
      // alternate the diagonal (checkerboard) so diagonal creases do not all lean the same way
      const flip = (i + j) & 1;
      if (side > 0) { if (flip) idx.push(a, b, c, b, d, c); else idx.push(a, b, d, a, d, c); }
      else { if (flip) idx.push(a, c, b, b, c, d); else idx.push(a, d, b, a, c, d); }
    }
  };
  grid(1); grid(-1);
  const hw = size.w / 2, hh = size.h / 2;
  const sides = [
    { n: segW, p: (t) => [-hw + t * size.w, -hh], o: [0, -1] },
    { n: segH, p: (t) => [hw, -hh + t * size.h], o: [1, 0] },
    { n: segW, p: (t) => [hw - t * size.w, hh], o: [0, 1] },
    { n: segH, p: (t) => [-hw, hh - t * size.h], o: [-1, 0] },
  ];
  for (const s of sides) {
    const base = v;
    for (let k = 0; k <= s.n; k++) { const [x, y] = s.p(k / s.n); push(x, y, 0, s.o[0], s.o[1], 1); push(x, y, 0, s.o[0], s.o[1], -1); }
    for (let k = 0; k < s.n; k++) { const a = base + k * 2, b = a + 1, c = a + 2, d = a + 3; idx.push(a, b, d, a, d, c); }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos.subarray(0, v * 3), 3));
  g.setAttribute('aShell', new THREE.BufferAttribute(shell.subarray(0, v * 4), 4));
  g.setIndex(v > 65535 ? new THREE.Uint32BufferAttribute(idx, 1) : new THREE.Uint16BufferAttribute(idx, 1));
  // vertices move in the shader: never cull on the rest-pose bounds
  g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 0.6);
  g.boundingBox = new THREE.Box3(new THREE.Vector3(-0.6, -0.6, -0.6), new THREE.Vector3(0.6, 0.6, 0.6));
  g.userData = { key, segW, segH, size, refs: 1, triangles: idx.length / 3 };
  cache.set(key, g);
  return g;
}

export function releaseSheetGeometry(g) {
  if (!g || !g.userData || !g.userData.key) return;
  if (--g.userData.refs <= 0) { cache.delete(g.userData.key); g.dispose(); }
}
