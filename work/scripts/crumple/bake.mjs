#!/usr/bin/env node
// bake.mjs (v2): offline crumple of one A4 sheet for aviva. No Houdini: a quasi-static position-based simulation in plain JS.
//   - inextensible triangle mesh (distance constraints on every edge, many Gauss-Seidel sweeps per step)
//   - signed dihedral bending with PLASTIC yield and STRAIN SOFTENING: once a hinge yields it gets weaker, so later
//     bending concentrates on existing creases -> flat facets and sharp ridges (paper), not smooth wrinkles (cloth / foil)
//   - particle self-collision (spatial hash) so layers stack instead of passing through each other
//   - driver: soft "hands" gather the corners and edges into a loose bundle (big folds first, like a person scrunching
//     a sheet), then a shrinking sphere compacts it into a ball, then it springs back a little.
// Output: docs/assets/paper/crumple.bin.gz (K keyframes, row-DPCM int8, per-vertex AO front/back) + crumple.json report.
//
// Usage: node work/scripts/crumple/bake.mjs [--nx 57 --ny 81 --steps 6000 --K 9 --seed 7 --out docs/assets/paper/crumple.bin]
//        (--nx 31 --ny 44 --steps 1500 for a quick look)

import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { makeCrumpleGrid, encodeCrumple, mulberry32 } from '../../../docs/js/paper/crumple-grid.js';

const argv = process.argv.slice(2);
const arg = (k, d) => { const i = argv.indexOf('--' + k); return i < 0 ? d : (argv[i + 1] === undefined || argv[i + 1].startsWith('--') ? true : argv[i + 1]); };
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const NX = +arg('nx', 57), NY = +arg('ny', 81), STEPS = +arg('steps', 6000), K = +arg('K', 9), SEED = +arg('seed', 7);
const ITER = +arg('iter', 24), BEND_EVERY = +arg('bendEvery', 3);
const OUT = path.resolve(ROOT, arg('out', 'docs/assets/paper/crumple.bin'));
const JITTER = 0.32;

const grid = makeCrumpleGrid(NX, NY, SEED, { w: 0.21, h: 0.297 }, JITTER);
const N = grid.n, rest = grid.rest, tris = grid.tris;
const cell = 0.21 / (NX - 1);
const rnd = mulberry32(SEED * 7919 + 13);

/* ---------- topology: edges + hinges ---------- */
const edgeMap = new Map(), edges = [];
const key = (a, b) => (a < b ? a * N + b : b * N + a);
for (let t = 0; t < tris.length; t += 3) {
  const tri = [tris[t], tris[t + 1], tris[t + 2]];
  for (let e = 0; e < 3; e++) {
    const a = tri[e], b = tri[(e + 1) % 3], c = tri[(e + 2) % 3], k = key(a, b);
    if (!edgeMap.has(k)) { edgeMap.set(k, { opp: [c], dir: [[a, b]] }); edges.push([a, b]); }
    else { const E = edgeMap.get(k); E.opp.push(c); E.dir.push([a, b]); }
  }
}
const E = edges.length;
const eI = new Int32Array(E * 2), eL = new Float64Array(E);
edges.forEach(([a, b], i) => { eI[i * 2] = a; eI[i * 2 + 1] = b; eL[i] = Math.hypot(rest[a * 2] - rest[b * 2], rest[a * 2 + 1] - rest[b * 2 + 1]); });
// shear-ish "skip" constraints (vertex to vertex two cells apart) keep in-plane distances honest -> less rubbery stretch
const skips = [];
for (let j = 0; j < NY; j++) for (let i = 0; i < NX; i++) {
  const v = j * NX + i;
  if (i + 2 < NX) skips.push([v, v + 2]); if (j + 2 < NY) skips.push([v, v + 2 * NX]);
}
const S2 = skips.length, sI = new Int32Array(S2 * 2), sL = new Float64Array(S2);
skips.forEach(([a, b], i) => { sI[i * 2] = a; sI[i * 2 + 1] = b; sL[i] = Math.hypot(rest[a * 2] - rest[b * 2], rest[a * 2 + 1] - rest[b * 2 + 1]); });
const hingeRaw = [];
for (const H of edgeMap.values()) { if (H.opp.length !== 2) continue; const [x0, x1] = H.dir[0]; hingeRaw.push([x0, x1, H.opp[0], H.opp[1]]); }
const HN = hingeRaw.length;
const hI = new Int32Array(HN * 4); hingeRaw.forEach((h, i) => hI.set(h, i * 4));
const hTheta0 = new Float64Array(HN), hDamage = new Float64Array(HN), hWeak = new Float64Array(HN);
for (let h = 0; h < HN; h++) hWeak[h] = 0.7 + 0.6 * rnd();
console.log(`grid ${NX}x${NY} = ${N} verts, ${tris.length / 3} tris, ${E} edges, ${S2} skip links, ${HN} hinges, cell ${(cell * 1000).toFixed(2)} mm`);

/* ---------- state ---------- */
const X = new Float64Array(N * 3), P = new Float64Array(N * 3);
const ph = [rnd() * 6.28, rnd() * 6.28, rnd() * 6.28, rnd() * 6.28];
for (let i = 0; i < N; i++) {
  const x = rest[i * 2], y = rest[i * 2 + 1];
  X[i * 3] = x; X[i * 3 + 1] = y;
  // a real sheet is never flat: long, gentle waves break the symmetry so the sheet buckles globally, not at the rim
  X[i * 3 + 2] = 0.004 * Math.sin(x * 14 + ph[0]) * Math.cos(y * 9 + ph[1]) + 0.0025 * Math.sin((x - y) * 21 + ph[2]) + 0.002 * Math.cos(x * 31 + y * 7 + ph[3]);
}

/* ---------- signed dihedral angle + gradient ---------- */
const g = new Float64Array(12);
let X_ = P;
function dihedral(i0, i1, i2, i3, wantGrad) {
  const X = X_;
  const ex = X[i1 * 3] - X[i0 * 3], ey = X[i1 * 3 + 1] - X[i0 * 3 + 1], ez = X[i1 * 3 + 2] - X[i0 * 3 + 2];
  const ax = X[i2 * 3] - X[i0 * 3], ay = X[i2 * 3 + 1] - X[i0 * 3 + 1], az = X[i2 * 3 + 2] - X[i0 * 3 + 2];
  const bx = X[i3 * 3] - X[i1 * 3], by = X[i3 * 3 + 1] - X[i1 * 3 + 1], bz = X[i3 * 3 + 2] - X[i1 * 3 + 2];
  const nAx = ey * az - ez * ay, nAy = ez * ax - ex * az, nAz = ex * ay - ey * ax;
  const nBx = by * ez - bz * ey, nBy = bz * ex - bx * ez, nBz = bx * ey - by * ex;
  const lA2 = nAx * nAx + nAy * nAy + nAz * nAz, lB2 = nBx * nBx + nBy * nBy + nBz * nBz, le = Math.hypot(ex, ey, ez);
  if (lA2 < 1e-24 || lB2 < 1e-24 || le < 1e-12) return NaN;
  const lA = Math.sqrt(lA2), lB = Math.sqrt(lB2);
  const cosT = (nAx * nBx + nAy * nBy + nAz * nBz) / (lA * lB);
  const cx = nAy * nBz - nAz * nBy, cy = nAz * nBx - nAx * nBz, cz = nAx * nBy - nAy * nBx;
  const sinT = (cx * ex + cy * ey + cz * ez) / (lA * lB * le);
  const theta = Math.atan2(sinT, cosT);
  if (!wantGrad) return theta;
  const kA = le / lA2, kB = le / lB2;
  const g2x = -kA * nAx, g2y = -kA * nAy, g2z = -kA * nAz, g3x = -kB * nBx, g3y = -kB * nBy, g3z = -kB * nBz;
  const x2mx1 = [X[i2 * 3] - X[i1 * 3], X[i2 * 3 + 1] - X[i1 * 3 + 1], X[i2 * 3 + 2] - X[i1 * 3 + 2]];
  const x3mx0 = [X[i3 * 3] - X[i0 * 3], X[i3 * 3 + 1] - X[i0 * 3 + 1], X[i3 * 3 + 2] - X[i0 * 3 + 2]];
  const dA1 = (x2mx1[0] * ex + x2mx1[1] * ey + x2mx1[2] * ez) / le, dA0 = (ax * ex + ay * ey + az * ez) / le;
  const dB1 = (bx * ex + by * ey + bz * ez) / le, dB0 = (x3mx0[0] * ex + x3mx0[1] * ey + x3mx0[2] * ez) / le;
  const s = 1 / le;
  g[0] = (dA1 * s) * g2x + (dB1 * s) * g3x; g[1] = (dA1 * s) * g2y + (dB1 * s) * g3y; g[2] = (dA1 * s) * g2z + (dB1 * s) * g3z;
  g[3] = -(dA0 * s) * g2x - (dB0 * s) * g3x; g[4] = -(dA0 * s) * g2y - (dB0 * s) * g3y; g[5] = -(dA0 * s) * g2z - (dB0 * s) * g3z;
  g[6] = g2x; g[7] = g2y; g[8] = g2z; g[9] = g3x; g[10] = g3y; g[11] = g3z;
  return theta;
}
function selfTest() {
  const save = X_; const T = new Float64Array(12); X_ = T; const r = mulberry32(3); let worst = 0;
  for (let trial = 0; trial < 50; trial++) {
    for (let i = 0; i < 12; i++) T[i] = r() * 2 - 1;
    const th = dihedral(0, 1, 2, 3, true); if (isNaN(th)) continue; const ga = Float64Array.from(g);
    for (let i = 0; i < 12; i++) { const h = 1e-6, o = T[i]; T[i] = o + h; const tp = dihedral(0, 1, 2, 3, false); T[i] = o - h; const tm = dihedral(0, 1, 2, 3, false); T[i] = o;
      let d = tp - tm; if (d > Math.PI) d -= 2 * Math.PI; if (d < -Math.PI) d += 2 * Math.PI; worst = Math.max(worst, Math.abs(d / (2 * h) - ga[i]) / (1 + Math.abs(ga[i]))); }
  }
  X_ = save; return worst;
}
const gradErr = selfTest();
console.log('dihedral gradient self-test, max rel error:', gradErr.toExponential(2));
if (gradErr > 1e-3) { console.error('gradient check FAILED'); process.exit(1); }

/* ---------- spatial hash for self collision ---------- */
const RC = +arg('rc', 0.5 * cell), HCELL = 2 * RC, HSIZE = 1 << 18;
const hHead = new Int32Array(HSIZE), hNext = new Int32Array(N);
const hashOf = (ix, iy, iz) => (((ix * 73856093) ^ (iy * 19349663) ^ (iz * 83492791)) >>> 0) & (HSIZE - 1);
let pairs = new Int32Array(1 << 20), pairCount = 0;
const EXCL2 = (2 * RC * 1.6) ** 2;
function buildPairs() {
  hHead.fill(-1);
  for (let i = 0; i < N; i++) { const h = hashOf(Math.floor(P[i * 3] / HCELL), Math.floor(P[i * 3 + 1] / HCELL), Math.floor(P[i * 3 + 2] / HCELL)); hNext[i] = hHead[h]; hHead[h] = i; }
  pairCount = 0; const R2 = (2 * RC * 1.2) ** 2;
  for (let i = 0; i < N; i++) {
    const ix = Math.floor(P[i * 3] / HCELL), iy = Math.floor(P[i * 3 + 1] / HCELL), iz = Math.floor(P[i * 3 + 2] / HCELL);
    for (let dz = -1; dz <= 1; dz++) for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      let j = hHead[hashOf(ix + dx, iy + dy, iz + dz)];
      while (j >= 0) {
        if (j > i) {
          const qx = P[i * 3] - P[j * 3], qy = P[i * 3 + 1] - P[j * 3 + 1], qz = P[i * 3 + 2] - P[j * 3 + 2];
          if (qx * qx + qy * qy + qz * qz < R2) {
            const rx = rest[i * 2] - rest[j * 2], ry = rest[i * 2 + 1] - rest[j * 2 + 1];
            if (rx * rx + ry * ry > EXCL2) { if (pairCount * 2 + 2 > pairs.length) { const np = new Int32Array(pairs.length * 2); np.set(pairs); pairs = np; } pairs[pairCount * 2] = i; pairs[pairCount * 2 + 1] = j; pairCount++; }
          }
        }
        j = hNext[j];
      }
    }
  }
}

/* ---------- parameters ---------- */
const BEND_K = +arg('bk', 0.55);          // bending stiffness per bend pass, undamaged hinge (0..1)
const YIELD = +arg('yield', 0.32);        // elastic range of a hinge (rad) before it creases
const SOFTEN = +arg('soften', 7.0);       // stiffness /= 1 + SOFTEN * accumulated plastic rotation
const FRICTION = +arg('friction', 0.35);
const HAND_END = +arg('handEnd', 0.42), SPH0 = +arg('sph0', 0.3), SPH1 = +arg('sph1', 0.9), RELAX = +arg('relax', 0.08);
const R_NAT = Math.cbrt(N * RC ** 3 / 0.5);    // natural ball radius for this particle size (random close packing)
const R_END = +arg('rend', R_NAT * 0.98);
console.log(`RC ${(RC * 1000).toFixed(2)}mm  R_NAT ${(R_NAT * 1000).toFixed(1)}mm  R_END ${(R_END * 1000).toFixed(1)}mm  bk ${BEND_K} yield ${YIELD} soften ${SOFTEN}`);

/* ---------- hands: soft grips that gather corners and edges into a loose bundle ---------- */
const smooth = (a, b, x) => { const t = Math.min(Math.max((x - a) / (b - a), 0), 1); return t * t * (3 - 2 * t); };
const hr = mulberry32(SEED * 31 + 5);
const anchors = [[-0.085, 0.125], [0.085, 0.125], [-0.085, -0.125], [0.085, -0.125], [-0.1, 0.0], [0.1, 0.01]];
const hands = anchors.map(([ax, ay], h) => {
  const members = []; for (let i = 0; i < N; i++) if (Math.hypot(rest[i * 2] - ax, rest[i * 2 + 1] - ay) < 0.02) members.push(i);
  // goal: a point on a loose sphere (r ~ 4.5 cm), alternating above / below the sheet plane
  const th = (h / anchors.length) * Math.PI * 2 + hr() * 0.8, up = (h % 2 ? 1 : -1) * (0.3 + 0.5 * hr());
  const r = 0.045 + 0.015 * hr();
  const goal = [Math.cos(th) * r * Math.sqrt(1 - up * up), Math.sin(th) * r * Math.sqrt(1 - up * up), up * r];
  const axis = (() => { const z = hr() * 2 - 1, a = hr() * 6.283, s = Math.sqrt(1 - z * z); return [s * Math.cos(a), s * Math.sin(a), z]; })();
  const ang = (hr() - 0.5) * 2.2;
  const t0 = 0.02 + 0.08 * hr();                   // hands do not all start at once
  return { ax, ay, members, goal, axis, ang, t0 };
});
const rotate = (v, ax, a) => { const c = Math.cos(a), s = Math.sin(a), d = v[0] * ax[0] + v[1] * ax[1] + v[2] * ax[2];
  const cx = ax[1] * v[2] - ax[2] * v[1], cy = ax[2] * v[0] - ax[0] * v[2], cz = ax[0] * v[1] - ax[1] * v[0];
  return [v[0] * c + cx * s + ax[0] * d * (1 - c), v[1] * c + cy * s + ax[1] * d * (1 - c), v[2] * c + cz * s + ax[2] * d * (1 - c)]; };
const handStart = hands.map((H) => H.members.map((i) => [X[i * 3], X[i * 3 + 1], X[i * 3 + 2]]));

/* ---------- quasi-static simulation ---------- */
const snapshots = [];
const SNAP_EVERY = Math.max(1, Math.floor(STEPS / 160));
const t0 = Date.now();
let maxStretch = 0, R_bound = 0.19;
X_ = P;
function stretchSweep(fwd) {
  for (let q = 0; q < E; q++) {
    const e = fwd ? q : E - 1 - q, a = eI[e * 2], b = eI[e * 2 + 1];
    const dx = P[b * 3] - P[a * 3], dy = P[b * 3 + 1] - P[a * 3 + 1], dz = P[b * 3 + 2] - P[a * 3 + 2];
    const d = Math.sqrt(dx * dx + dy * dy + dz * dz); if (d < 1e-12) continue;
    const corr = 0.5 * (d - eL[e]) / d;
    P[a * 3] += dx * corr; P[a * 3 + 1] += dy * corr; P[a * 3 + 2] += dz * corr;
    P[b * 3] -= dx * corr; P[b * 3 + 1] -= dy * corr; P[b * 3 + 2] -= dz * corr;
  }
}
function skipSweep() {   // only resists stretching beyond rest (paper cannot stretch, but it can fold, so no compression term)
  for (let q = 0; q < S2; q++) {
    const a = sI[q * 2], b = sI[q * 2 + 1];
    const dx = P[b * 3] - P[a * 3], dy = P[b * 3 + 1] - P[a * 3 + 1], dz = P[b * 3 + 2] - P[a * 3 + 2];
    const d = Math.sqrt(dx * dx + dy * dy + dz * dz); if (d <= sL[q] || d < 1e-12) continue;
    const corr = 0.5 * (d - sL[q]) / d;
    P[a * 3] += dx * corr; P[a * 3 + 1] += dy * corr; P[a * 3 + 2] += dz * corr;
    P[b * 3] -= dx * corr; P[b * 3 + 1] -= dy * corr; P[b * 3 + 2] -= dz * corr;
  }
}
const ids = [0, 0, 0, 0];
function bendSweep() {
  for (let h = 0; h < HN; h++) {
    const i0 = hI[h * 4], i1 = hI[h * 4 + 1], i2 = hI[h * 4 + 2], i3 = hI[h * 4 + 3];
    const th = dihedral(i0, i1, i2, i3, true); if (isNaN(th)) continue;
    let C = th - hTheta0[h]; if (C > Math.PI) C -= 2 * Math.PI; if (C < -Math.PI) C += 2 * Math.PI;
    const k = BEND_K * hWeak[h] / (1 + SOFTEN * hDamage[h]);
    let den = 0; for (let m = 0; m < 12; m++) den += g[m] * g[m]; if (den < 1e-20) continue;
    const dl = -k * C / den; ids[0] = i0; ids[1] = i1; ids[2] = i2; ids[3] = i3;
    for (let m = 0; m < 4; m++) { const v = ids[m] * 3; P[v] += g[m * 3] * dl; P[v + 1] += g[m * 3 + 1] * dl; P[v + 2] += g[m * 3 + 2] * dl; }
  }
}
function collide() {
  for (let q = 0; q < pairCount; q++) {
    const i = pairs[q * 2], j = pairs[q * 2 + 1];
    const dx = P[i * 3] - P[j * 3], dy = P[i * 3 + 1] - P[j * 3 + 1], dz = P[i * 3 + 2] - P[j * 3 + 2];
    const d2 = dx * dx + dy * dy + dz * dz, D = 2 * RC; if (d2 >= D * D || d2 < 1e-16) continue;
    const d = Math.sqrt(d2), corr = 0.5 * (D - d) / d;
    P[i * 3] += dx * corr; P[i * 3 + 1] += dy * corr; P[i * 3 + 2] += dz * corr; P[j * 3] -= dx * corr; P[j * 3 + 1] -= dy * corr; P[j * 3 + 2] -= dz * corr;
    const nx = dx / d, ny = dy / d, nz = dz / d;
    const rx = (P[i * 3] - X[i * 3]) - (P[j * 3] - X[j * 3]), ry = (P[i * 3 + 1] - X[i * 3 + 1]) - (P[j * 3 + 1] - X[j * 3 + 1]), rz = (P[i * 3 + 2] - X[i * 3 + 2]) - (P[j * 3 + 2] - X[j * 3 + 2]);
    const rn = rx * nx + ry * ny + rz * nz, tx = rx - rn * nx, ty = ry - rn * ny, tz = rz - rn * nz, f = FRICTION * 0.5;
    P[i * 3] -= tx * f; P[i * 3 + 1] -= ty * f; P[i * 3 + 2] -= tz * f; P[j * 3] += tx * f; P[j * 3 + 1] += ty * f; P[j * 3 + 2] += tz * f;
  }
}
for (let step = 0; step <= STEPS; step++) {
  const prog = step / STEPS;
  if (step % SNAP_EVERY === 0 || step === STEPS) snapshots.push({ prog, pos: Float64Array.from(X) });
  if (step === STEPS) break;
  P.set(X);
  let cx = 0, cy = 0, cz = 0; for (let i = 0; i < N; i++) { cx += P[i * 3]; cy += P[i * 3 + 1]; cz += P[i * 3 + 2]; } cx /= N; cy /= N; cz /= N;
  // hands: targets move along an eased path; their grip fades out after HAND_END
  const grip = 1 - smooth(HAND_END, HAND_END + 0.12, prog);
  const handTargets = [];
  if (grip > 0) hands.forEach((H, h) => {
    const e = smooth(H.t0, HAND_END, prog), lift = Math.sin(Math.PI * e) * 0.03 * (h % 2 ? 1 : -1);
    const A = [H.ax, H.ay, 0], G = H.goal;
    const c = [A[0] + (G[0] - A[0]) * e, A[1] + (G[1] - A[1]) * e, A[2] + (G[2] - A[2]) * e + lift];
    handTargets.push(H.members.map((i, m) => { const s0 = handStart[h][m]; const off = rotate([s0[0] - H.ax, s0[1] - H.ay, s0[2]], H.axis, H.ang * e); return [c[0] + off[0], c[1] + off[1], c[2] + off[2]]; }));
  });
  // the sphere: from the bundle's bound to the ball, then a small spring-back
  let Rs = 1e9;
  if (prog > SPH0) {
    if (Math.abs(prog - SPH0) < 1.5 / STEPS) { let m = 0; for (let i = 0; i < N; i++) m = Math.max(m, Math.hypot(P[i * 3] - cx, P[i * 3 + 1] - cy, P[i * 3 + 2] - cz)); R_bound = m; }
    const w = smooth(SPH0, SPH1, prog);
    Rs = R_bound + (R_END - R_bound) * w;
    if (prog > 1 - RELAX) Rs = R_END * (1 + 0.07 * smooth(1 - RELAX, 1, prog));
  }
  if (step % 2 === 0) buildPairs();
  for (let it = 0; it < ITER; it++) {
    stretchSweep(it % 2 === 0);
    if (it % 4 === 1) skipSweep();
    if (it % BEND_EVERY === 0) bendSweep();
    collide();
    if (grip > 0) hands.forEach((H, h) => { const T = handTargets[h]; const s = 0.22 * grip; H.members.forEach((i, m) => { P[i * 3] += (T[m][0] - P[i * 3]) * s; P[i * 3 + 1] += (T[m][1] - P[i * 3 + 1]) * s; P[i * 3 + 2] += (T[m][2] - P[i * 3 + 2]) * s; }); });
    if (Rs < 1e8) for (let i = 0; i < N; i++) {
      const dx = P[i * 3] - cx, dy = P[i * 3 + 1] - cy, dz = P[i * 3 + 2] - cz, r = Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (r > Rs) { const k = 0.6 * (r - Rs) / r; P[i * 3] -= dx * k; P[i * 3 + 1] -= dy * k; P[i * 3 + 2] -= dz * k; }
    }
  }
  for (let it = 0; it < 6; it++) stretchSweep(it % 2 === 1);   // end on inextensibility
  // plasticity: hinges beyond their elastic range take a permanent set (and get weaker)
  for (let h = 0; h < HN; h++) {
    const th = dihedral(hI[h * 4], hI[h * 4 + 1], hI[h * 4 + 2], hI[h * 4 + 3], false); if (isNaN(th)) continue;
    let C = th - hTheta0[h]; if (C > Math.PI) C -= 2 * Math.PI; if (C < -Math.PI) C += 2 * Math.PI;
    const y = YIELD * hWeak[h];
    if (Math.abs(C) > y) { const flow = (Math.abs(C) - y) * Math.sign(C); hTheta0[h] += flow; hDamage[h] += Math.abs(flow); }
  }
  X.set(P);
  if (step % Math.max(1, Math.floor(STEPS / 12)) === 0) {
    let rr = 0; for (let i = 0; i < N; i++) rr += (X[i * 3] - cx) ** 2 + (X[i * 3 + 1] - cy) ** 2 + (X[i * 3 + 2] - cz) ** 2; rr = Math.sqrt(rr / N);
    const st = []; for (let e = 0; e < E; e++) { const a = eI[e * 2], b = eI[e * 2 + 1]; st.push(Math.abs(Math.hypot(X[b * 3] - X[a * 3], X[b * 3 + 1] - X[a * 3 + 1], X[b * 3 + 2] - X[a * 3 + 2]) / eL[e] - 1)); }
    st.sort((a, b) => a - b); maxStretch = Math.max(maxStretch, st[E - 1]);
    let creased = 0; for (let h = 0; h < HN; h++) if (Math.abs(hTheta0[h]) > 0.6) creased++;
    console.log(`step ${step}/${STEPS} prog ${prog.toFixed(2)} rms ${(rr * 1000).toFixed(1)}mm Rs ${Rs < 1e8 ? (Rs * 1000).toFixed(0) : '-'} stretch p50 ${(st[E >> 1] * 100).toFixed(2)}% p99 ${(st[Math.floor(E * 0.99)] * 100).toFixed(2)}% max ${(st[E - 1] * 100).toFixed(1)}%  pairs ${pairCount} creased ${creased}  ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  }
}
console.log(`sim done in ${((Date.now() - t0) / 1000).toFixed(1)} s`);
for (const sn of snapshots) { let cx = 0, cy = 0, cz = 0; const p = sn.pos; for (let i = 0; i < N; i++) { cx += p[i * 3]; cy += p[i * 3 + 1]; cz += p[i * 3 + 2]; } cx /= N; cy /= N; cz /= N; for (let i = 0; i < N; i++) { p[i * 3] -= cx; p[i * 3 + 1] -= cy; p[i * 3 + 2] -= cz; } }

/* ---------- K keyframes, evenly spaced by visual change ---------- */
const cum = [0];
for (let s = 1; s < snapshots.length; s++) { let acc2 = 0; const A = snapshots[s - 1].pos, B = snapshots[s].pos; for (let i = 0; i < N * 3; i++) acc2 += (A[i] - B[i]) ** 2; cum.push(cum[s - 1] + Math.sqrt(acc2 / N)); }
const total = cum[cum.length - 1], chosen = [];
for (let k = 0; k < K; k++) { const target = total * (k / (K - 1)); let s = cum.findIndex((c) => c >= target - 1e-12); if (s < 0) s = snapshots.length - 1; chosen.push(s); }
const frames = chosen.map((s, k) => { const p = Float32Array.from(snapshots[s].pos); if (k === 0) for (let i = 0; i < N; i++) { p[i * 3] = rest[i * 2]; p[i * 3 + 1] = rest[i * 2 + 1]; p[i * 3 + 2] = 0; } return p; });
console.log('keyframes at sim progress', chosen.map((s) => snapshots[s].prog.toFixed(3)).join(' '));

function vertexNormals(p) {
  const nrm = new Float32Array(N * 3);
  for (let t = 0; t < tris.length; t += 3) {
    const a = tris[t] * 3, b = tris[t + 1] * 3, c = tris[t + 2] * 3;
    const ux = p[b] - p[a], uy = p[b + 1] - p[a + 1], uz = p[b + 2] - p[a + 2], vx = p[c] - p[a], vy = p[c + 1] - p[a + 1], vz = p[c + 2] - p[a + 2];
    const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    for (const v of [a, b, c]) { nrm[v] += nx; nrm[v + 1] += ny; nrm[v + 2] += nz; }
  }
  for (let i = 0; i < N; i++) { const l = Math.hypot(nrm[i * 3], nrm[i * 3 + 1], nrm[i * 3 + 2]) || 1; nrm[i * 3] /= l; nrm[i * 3 + 1] /= l; nrm[i * 3 + 2] /= l; }
  return nrm;
}
function computeAO(p, rays = 40, maxDist = 0.035) {
  const nrm = vertexNormals(p);
  // uniform grid of triangles
  let mn = [1e9, 1e9, 1e9], mx = [-1e9, -1e9, -1e9];
  for (let i = 0; i < N; i++) for (let c = 0; c < 3; c++) { mn[c] = Math.min(mn[c], p[i * 3 + c]); mx[c] = Math.max(mx[c], p[i * 3 + c]); }
  const G = 0.006; const dims = [0, 1, 2].map((c) => Math.max(1, Math.ceil((mx[c] - mn[c] + 2e-3) / G)));
  const cellsT = new Map();
  const T = tris.length / 3;
  for (let t = 0; t < T; t++) {
    let lo = [1e9, 1e9, 1e9], hi = [-1e9, -1e9, -1e9];
    for (let k = 0; k < 3; k++) { const v = tris[t * 3 + k] * 3; for (let c = 0; c < 3; c++) { lo[c] = Math.min(lo[c], p[v + c]); hi[c] = Math.max(hi[c], p[v + c]); } }
    const a = lo.map((v, c) => Math.floor((v - mn[c]) / G)), b = hi.map((v, c) => Math.floor((v - mn[c]) / G));
    for (let z = a[2]; z <= b[2]; z++) for (let y = a[1]; y <= b[1]; y++) for (let x = a[0]; x <= b[0]; x++) {
      const k = (z * dims[1] + y) * dims[0] + x; let L = cellsT.get(k); if (!L) cellsT.set(k, (L = [])); L.push(t);
    }
  }
  const hitTri = (ox, oy, oz, dx, dy, dz, t, skip) => {
    const a = tris[t * 3] * 3, b = tris[t * 3 + 1] * 3, c = tris[t * 3 + 2] * 3;
    if (tris[t * 3] === skip || tris[t * 3 + 1] === skip || tris[t * 3 + 2] === skip) return -1;
    const e1x = p[b] - p[a], e1y = p[b + 1] - p[a + 1], e1z = p[b + 2] - p[a + 2], e2x = p[c] - p[a], e2y = p[c + 1] - p[a + 1], e2z = p[c + 2] - p[a + 2];
    const px = dy * e2z - dz * e2y, py = dz * e2x - dx * e2z, pz = dx * e2y - dy * e2x; const det = e1x * px + e1y * py + e1z * pz;
    if (Math.abs(det) < 1e-14) return -1; const inv = 1 / det;
    const tx = ox - p[a], ty = oy - p[a + 1], tz = oz - p[a + 2]; const u = (tx * px + ty * py + tz * pz) * inv; if (u < 0 || u > 1) return -1;
    const qx = ty * e1z - tz * e1y, qy = tz * e1x - tx * e1z, qz = tx * e1y - ty * e1x; const v = (dx * qx + dy * qy + dz * qz) * inv; if (v < 0 || u + v > 1) return -1;
    const d = (e2x * qx + e2y * qy + e2z * qz) * inv; return d > 1e-4 ? d : -1;
  };
  const visited = new Set();
  const trace = (ox, oy, oz, dx, dy, dz, skip) => {
    visited.clear();
    const steps = Math.ceil(maxDist / (G * 0.5));
    for (let s = 0; s <= steps; s++) {
      const tt = s * G * 0.5; const x = ox + dx * tt, y = oy + dy * tt, z = oz + dz * tt;
      const ci = [Math.floor((x - mn[0]) / G), Math.floor((y - mn[1]) / G), Math.floor((z - mn[2]) / G)];
      if (ci[0] < 0 || ci[1] < 0 || ci[2] < 0 || ci[0] >= dims[0] || ci[1] >= dims[1] || ci[2] >= dims[2]) { if (s > 2) break; else continue; }
      const k = (ci[2] * dims[1] + ci[1]) * dims[0] + ci[0]; if (visited.has(k)) continue; visited.add(k);
      const L = cellsT.get(k); if (!L) continue;
      for (const t of L) { const d = hitTri(ox, oy, oz, dx, dy, dz, t, skip); if (d > 0 && d < maxDist) return d; }
    }
    return -1;
  };
  const r = mulberry32(99);
  const dirs = []; for (let k = 0; k < rays; k++) { const u = (k + 0.5) / rays, phi = k * 2.399963; const ct = Math.sqrt(1 - u), st = Math.sqrt(u); dirs.push([st * Math.cos(phi), st * Math.sin(phi), ct]); }
  const front = new Float32Array(N), back = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    const n = [nrm[i * 3], nrm[i * 3 + 1], nrm[i * 3 + 2]];
    const tA = Math.abs(n[0]) < 0.9 ? [1, 0, 0] : [0, 1, 0];
    let t1 = [n[1] * tA[2] - n[2] * tA[1], n[2] * tA[0] - n[0] * tA[2], n[0] * tA[1] - n[1] * tA[0]]; const l1 = Math.hypot(...t1); t1 = t1.map((c) => c / l1);
    const t2 = [n[1] * t1[2] - n[2] * t1[1], n[2] * t1[0] - n[0] * t1[2], n[0] * t1[1] - n[1] * t1[0]];
    const rot = r() * 6.283;
    for (const side of [1, -1]) {
      let occ = 0;
      for (const d0 of dirs) {
        const cx = Math.cos(rot) * d0[0] - Math.sin(rot) * d0[1], cy = Math.sin(rot) * d0[0] + Math.cos(rot) * d0[1];
        const dx = t1[0] * cx + t2[0] * cy + n[0] * d0[2] * side, dy = t1[1] * cx + t2[1] * cy + n[1] * d0[2] * side, dz = t1[2] * cx + t2[2] * cy + n[2] * d0[2] * side;
        const o = 0.0006 * side;
        const d = trace(p[i * 3] + n[0] * o, p[i * 3 + 1] + n[1] * o, p[i * 3 + 2] + n[2] * o, dx, dy, dz, i);
        if (d > 0) occ += 1 - (d / maxDist) ** 0.5 * 0.6;    // near hits occlude more
      }
      const vis = 1 - occ / rays;
      (side > 0 ? front : back)[i] = vis;
    }
  }
  return { front, back };
}
const aoFront = [], aoBack = [];
const tAO = Date.now();
for (let k = 0; k < K; k++) {
  if (k === 0) { aoFront.push(new Float32Array(N).fill(1)); aoBack.push(new Float32Array(N).fill(1)); continue; }
  const { front, back } = computeAO(frames[k], +arg('rays', 48));
  aoFront.push(front); aoBack.push(back);
}
console.log(`AO done in ${((Date.now() - tAO) / 1000).toFixed(1)} s`);

let maxDelta = 0;
for (const p of frames) for (let j = 0; j < NY; j++) for (let i = 1; i < NX; i++) { const a = (j * NX + i) * 3, b = a - 3; for (let c = 0; c < 3; c++) maxDelta = Math.max(maxDelta, Math.abs(p[a + c] - p[b + c])); }
const STEP = Math.ceil(maxDelta / 126 * 1e7) / 1e7;
const enc = encodeCrumple({ nx: NX, ny: NY, seed: SEED, jitter: JITTER, frames, aoFront, aoBack, step: STEP });
fs.mkdirSync(path.dirname(OUT), { recursive: true });
const gz = zlib.gzipSync(Buffer.from(enc.buffer), { level: 9 });
fs.writeFileSync(OUT + '.gz', gz);
if (arg('raw', false)) fs.writeFileSync(OUT, Buffer.from(enc.buffer)); else if (fs.existsSync(OUT)) fs.unlinkSync(OUT);
// final quality numbers
const last = frames[K - 1]; let rEnd = 0; for (let i = 0; i < N; i++) rEnd = Math.max(rEnd, Math.hypot(last[i * 3], last[i * 3 + 1], last[i * 3 + 2]));
const st = []; for (let e = 0; e < E; e++) { const a = eI[e * 2], b = eI[e * 2 + 1]; st.push(Math.abs(Math.hypot(last[b * 3] - last[a * 3], last[b * 3 + 1] - last[a * 3 + 1], last[b * 3 + 2] - last[a * 3 + 2]) / eL[e] - 1)); }
st.sort((a, b) => a - b);
let creased = 0; for (let h = 0; h < HN; h++) if (Math.abs(hTheta0[h]) > 0.6) creased++;
const report = { nx: NX, ny: NY, N, K, steps: STEPS, seed: SEED, rawBytes: enc.buffer.byteLength, gzBytes: gz.length, maxQuantErrMM: +(enc.maxErr * 1000).toFixed(3), clipped: enc.clipped,
  finalStretch: { p50: +(st[E >> 1] * 100).toFixed(2), p99: +(st[Math.floor(E * 0.99)] * 100).toFixed(2), max: +(st[E - 1] * 100).toFixed(2) }, maxStretchDuringPct: +(maxStretch * 100).toFixed(2),
  finalRadiusMM: +(rEnd * 1000).toFixed(1), creasedHinges: creased, hinges: HN,
  keyframesAt: chosen.map((s) => +snapshots[s].prog.toFixed(3)),
  params: { BEND_K, YIELD, SOFTEN, RC, ITER, BEND_EVERY, HAND_END, SPH0, SPH1, RELAX, R_END } };
fs.writeFileSync(OUT.replace(/\.bin$/, '.json'), JSON.stringify(report, null, 2));
console.log(report);
