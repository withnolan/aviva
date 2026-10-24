#!/usr/bin/env node
// letters-sim.mjs: checks the hero fold-in (letters.js letterIntroState) for sheets passing through each other or the
// floor, and how much of each sheet the pre-settle camera sees. Runs in Node on the pure pose functions (no renderer).
//   node work/scripts/letters-sim.mjs [--root <dir containing docs/>] [--step 0.01] [--set key=value ...]
import * as THREE from 'three';
const argv = process.argv.slice(2);
const opt = (k, d) => { const i = argv.indexOf('--' + k); return i >= 0 ? argv[i + 1] : d; };
const root = opt('root', '/home/user/aviva');
const L = await import(root + '/docs/js/paper/letters.js');
const { foldPoint } = await import(root + '/docs/js/paper/folds.js');
for (let i = 0; i < argv.length; i++) if (argv[i] === '--set') { const [k, v] = argv[i + 1].split('='); L.LETTER_INTRO[k] = +v; }
const I = L.LETTER_INTRO, word = 'AVIVA', n = word.length, R = L.letterRestLayout(word), apex = THREE.MathUtils.degToRad(36);
const step = +opt('step', 0.01);
// the pre-settle camera (Letters.restCamera with distK 1.06, pitch -9), 16:10
const LL = L.LETTER_LAYOUT, t = Math.tan(THREE.MathUtils.degToRad(LL.fov / 2)), viewH = (LL.capMM / 1000) / LL.capVh;
const dist = viewH / (2 * t) * 1.06, pitch = THREE.MathUtils.degToRad(-9), axisY = (LL.baselineY - 0.5) * viewH;
const cam = new THREE.PerspectiveCamera(LL.fov, 1.6, 0.01, 10);
cam.position.set(0, axisY - Math.sin(pitch) * dist, R.frontZ + Math.cos(pitch) * dist); cam.lookAt(0, axisY, R.frontZ); cam.updateMatrixWorld(); cam.updateProjectionMatrix();
const grid = (GX, GY) => { const g = []; for (let a = 0; a <= GX; a++) for (let b = 0; b <= GY; b++) g.push([-0.105 + (0.21 * a) / GX, -0.1485 + (0.297 * b) / GY]); return g; };
const pts = grid(15, 21), fine = grid(60, 84);
const o = [0, 0, 0], v = new THREE.Vector3();
function cloud(i, c, P = pts) {
  const S = L.letterIntroState(word[i], i, n, c, R, apex);
  if (!S.visible) return null;
  const T = L.letterTransform(word[i], { tilt: 0, splay: 0, ...S }, apex);
  return P.map((p) => { foldPoint(p, T.P.folds, o); return v.set(o[0], o[1], o[2]).applyQuaternion(T.quaternion).add(T.position).clone(); });
}
const worst = {}, floorMin = new Array(n).fill(Infinity), seen = [];
for (let c = I.start; c <= I.start + I.gap * (n - 1) + I.fall + 0.3; c += step) {
  const C = word.split('').map((_, i) => cloud(i, c));
  for (let i = 0; i < n; i++) {
    if (!C[i]) continue;
    for (const p of C[i]) floorMin[i] = Math.min(floorMin[i], p.y);
    // the share of the sheet inside the frame
    let inF = 0; for (const p of C[i]) { const q = p.clone().project(cam); if (Math.abs(q.x) <= 1 && Math.abs(q.y) <= 1) inF++; }
    seen.push([c, i, inF / C[i].length]);
    for (let j = i + 1; j < n; j++) {
      if (!C[j]) continue;
      let d = Infinity; for (const a of C[i]) for (const b of C[j]) { const e = a.distanceToSquared(b); if (e < d) d = e; }
      d = Math.sqrt(d); const k = i + '-' + j;
      if (!worst[k] || d < worst[k].d) worst[k] = { d, c };
    }
  }
}
// exact test: does any edge of one sheet's mesh pass through a triangle of the other's (Moller-Trumbore)?
function meshOf(i, c, GX = 30, GY = 42) {
  const P = cloud(i, c, grid(GX, GY)); if (!P) return null;
  const tris = []; const at = (a, b) => P[a * (GY + 1) + b];
  for (let a = 0; a < GX; a++) for (let b = 0; b < GY; b++) { tris.push([at(a, b), at(a + 1, b), at(a + 1, b + 1)], [at(a, b), at(a + 1, b + 1), at(a, b + 1)]); }
  return tris;
}
const e1 = new THREE.Vector3(), e2 = new THREE.Vector3(), pv = new THREE.Vector3(), tv = new THREE.Vector3(), qv = new THREE.Vector3(), dv = new THREE.Vector3();
function segTri(p0, p1, [a, b, c]) {
  dv.subVectors(p1, p0); e1.subVectors(b, a); e2.subVectors(c, a); pv.crossVectors(dv, e2);
  const det = e1.dot(pv); if (Math.abs(det) < 1e-12) return false;
  const inv = 1 / det; tv.subVectors(p0, a); const u = tv.dot(pv) * inv; if (u < 0 || u > 1) return false;
  qv.crossVectors(tv, e1); const v = dv.dot(qv) * inv; if (v < 0 || u + v > 1) return false;
  const t = e2.dot(qv) * inv; return t >= 0 && t <= 1;
}
function crosses(i, j, c) {
  const A = meshOf(i, c), B = meshOf(j, c); if (!A || !B) return false;
  const box = (T) => { const bb = new THREE.Box3(); for (const t of T) bb.expandByPoint(t[0]).expandByPoint(t[1]).expandByPoint(t[2]); return bb; };
  if (!box(A).intersectsBox(box(B))) return false;
  for (const ta of A) { const bt = new THREE.Box3().setFromPoints(ta);
    for (const tb of B) { if (!bt.intersectsBox(new THREE.Box3().setFromPoints(tb))) continue;
      for (const [p, q] of [[ta[0], ta[1]], [ta[1], ta[2]], [ta[2], ta[0]]]) if (segTri(p, q, tb)) return true;
      for (const [p, q] of [[tb[0], tb[1]], [tb[1], tb[2]], [tb[2], tb[0]]]) if (segTri(p, q, ta)) return true; } }
  return false;
}
// near misses: re-measure on a 4x finer grid around the worst moment (crossing sheets come out at ~1-2 mm)
const minD = (A, B) => { let d = Infinity; for (const a of A) for (const b of B) { const e = a.distanceToSquared(b); if (e < d) d = e; } return Math.sqrt(d); };
console.log('closest approach between sheets (mm, at clock s); fine = re-measured on a 3.5 mm grid:');
for (const k in worst) {
  const i = +k[0], j = +k[2]; let fineD = null;
  if (worst[k].d < 0.012) { fineD = Infinity; for (let dc = -0.02; dc <= 0.0201; dc += 0.005) { const A = cloud(i, worst[k].c + dc, fine), B = cloud(j, worst[k].c + dc, fine); if (A && B) fineD = Math.min(fineD, minD(A, B)); } }
  let cross = '';
  if (fineD !== null && fineD < 0.004) { const hits = []; for (let dc = -0.04; dc <= 0.0401; dc += 0.01) if (crosses(i, j, worst[k].c + dc)) hits.push((worst[k].c + dc).toFixed(2)); cross = hits.length ? `  CROSSING at ${hits.join(' ')}` : '  (no crossing: meshes tested)'; }
  console.log(`  ${word[i]}${i}-${word[j]}${j}  ${(worst[k].d * 1000).toFixed(1)} mm @ ${worst[k].c.toFixed(2)}${fineD !== null ? `  fine ${(fineD * 1000).toFixed(1)} mm` : ''}${cross}`);
}
console.log('lowest point of each sheet (mm):', floorMin.map((y) => (y * 1000).toFixed(1)).join(' '));
for (let i = 0; i < n; i++) {
  const s = seen.filter((x) => x[1] === i), first = s.find((x) => x[2] > 0.5);
  console.log(`  ${word[i]}${i}: >50 % in frame from clock ${first ? first[0].toFixed(2) : '-'} (drop ${(I.start + I.gap * i).toFixed(2)}, lands ${(I.start + I.gap * i + I.fall).toFixed(2)})`);
}
