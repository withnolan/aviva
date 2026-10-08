// crumple-grid.js: the rest-space mesh used by the baked crumple (shared by the Node bake script and the browser).
// No three.js import, so `work/scripts/crumple/bake.mjs` can import it as plain ES module.
// A jittered grid (interior vertices moved by up to +-jitter of a cell, boundary vertices slide along their edge)
// with a random diagonal per quad: isotropic enough that creases do not line up with grid axes.

export function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * @param {number} nx vertices along x (sheet width)
 * @param {number} ny vertices along y (sheet height)
 * @param {number} seed
 * @param {{w:number,h:number}} size metres
 * @returns {{ nx:number, ny:number, n:number, rest:Float32Array, tris:Uint32Array, size:{w:number,h:number} }}
 */
export function makeCrumpleGrid(nx = 57, ny = 81, seed = 7, size = { w: 0.21, h: 0.297 }, jitter = 0.32) {
  const rnd = mulberry32(seed);
  const n = nx * ny, rest = new Float32Array(n * 2);
  const cx = size.w / (nx - 1), cy = size.h / (ny - 1);
  for (let j = 0; j < ny; j++) {
    for (let i = 0; i < nx; i++) {
      let x = -size.w / 2 + i * cx, y = -size.h / 2 + j * cy;
      const bx = i === 0 || i === nx - 1, by = j === 0 || j === ny - 1;
      const jx = (rnd() * 2 - 1) * jitter * cx, jy = (rnd() * 2 - 1) * jitter * cy;
      if (!bx) x += jx;          // boundary columns stay on the edge (x fixed), may slide in y
      if (!by) y += jy;
      if (bx && by) { /* corners fixed */ } else if (bx) { y += 0; } else if (by) { x += 0; }
      rest[(j * nx + i) * 2] = x; rest[(j * nx + i) * 2 + 1] = y;
    }
  }
  const tris = new Uint32Array((nx - 1) * (ny - 1) * 6);
  let t = 0;
  for (let j = 0; j < ny - 1; j++) {
    for (let i = 0; i < nx - 1; i++) {
      const a = j * nx + i, b = a + 1, c = a + nx, d = c + 1;
      if (rnd() < 0.5) { tris[t++] = a; tris[t++] = b; tris[t++] = d; tris[t++] = a; tris[t++] = d; tris[t++] = c; }
      else { tris[t++] = a; tris[t++] = b; tris[t++] = c; tris[t++] = b; tris[t++] = d; tris[t++] = c; }
    }
  }
  return { nx, ny, n, rest, tris, size };
}

/* ---------- compact keyframe codec (closed-loop DPCM along grid rows, int8 deltas) ----------
 * File layout (little endian):
 *   0  'AVCR' magic, u16 version=1, u16 nx, u16 ny, u16 K, u32 seed, f32 jitter, f32 step (metres per delta unit), f32 aoScale
 *   32 for each keyframe k: for each row j: first vertex of the row as 3 x i16 (absolute, units of `step`),
 *        then for i>=1: 3 x i8 deltas (units of `step`) from the RECONSTRUCTED previous vertex; then N x u8 AO front, N x u8 AO back.
 */
export const CRUMPLE_MAGIC = 0x52435641; // 'AVCR'

export function encodeCrumple({ nx, ny, seed, jitter, frames, aoFront, aoBack, step = 0.00005, center = null, swap = 0 }) {
  const n = nx * ny, K = frames.length;
  const rowBytes = 6 + (nx - 1) * 3;
  const frameBytes = ny * rowBytes + n * 2;
  const HDR = center ? 48 : 32;                  // v2: + the packet centre (sheet frame) the frames were re-centred by
  const buf = new ArrayBuffer(HDR + K * frameBytes), dv = new DataView(buf);
  dv.setUint32(0, CRUMPLE_MAGIC, true); dv.setUint16(4, center ? 2 : 1, true); dv.setUint16(6, nx, true); dv.setUint16(8, ny, true); dv.setUint16(10, K, true);
  dv.setUint32(12, seed, true); dv.setFloat32(16, jitter, true); dv.setFloat32(20, step, true); dv.setFloat32(24, 1, true);
  if (center) { dv.setFloat32(28, center[0], true); dv.setFloat32(32, center[1], true); dv.setFloat32(36, center[2], true); dv.setFloat32(40, swap, true); }
  let o = HDR, maxErr = 0, clipped = 0;
  for (let k = 0; k < K; k++) {
    const P = frames[k];
    for (let j = 0; j < ny; j++) {
      const r0 = j * nx;
      const coarse = step; let px = 0, py = 0, pz = 0;
      for (let c = 0; c < 3; c++) {
        const q = Math.max(-32768, Math.min(32767, Math.round(P[r0 * 3 + c] / coarse)));
        dv.setInt16(o, q, true); o += 2;
        const rec = q * coarse; if (c === 0) px = rec; else if (c === 1) py = rec; else pz = rec;
      }
      let prev = [px, py, pz];
      for (let i = 1; i < nx; i++) {
        const v = (r0 + i) * 3;
        for (let c = 0; c < 3; c++) {
          let q = Math.round((P[v + c] - prev[c]) / step);
          if (q > 127 || q < -127) { clipped++; q = Math.max(-127, Math.min(127, q)); }
          dv.setInt8(o++, q);
          prev[c] = prev[c] + q * step;
          maxErr = Math.max(maxErr, Math.abs(prev[c] - P[v + c]));
        }
      }
    }
    for (let v = 0; v < n; v++) dv.setUint8(o++, Math.max(0, Math.min(255, Math.round(aoFront[k][v] * 255))));
    for (let v = 0; v < n; v++) dv.setUint8(o++, Math.max(0, Math.min(255, Math.round(aoBack[k][v] * 255))));
  }
  return { buffer: buf, maxErr, clipped };
}

/** @returns {{nx,ny,n,K,seed,jitter, center: number[]|null, swap: number, positions: Float32Array[] (n*3 each), ao: Float32Array[] (n*2 each: front, back)}} */
export function decodeCrumple(buffer) {
  const dv = new DataView(buffer);
  if (dv.getUint32(0, true) !== CRUMPLE_MAGIC) throw new Error('not an aviva crumple file');
  const version = dv.getUint16(4, true);
  const nx = dv.getUint16(6, true), ny = dv.getUint16(8, true), K = dv.getUint16(10, true);
  const seed = dv.getUint32(12, true), jitter = dv.getFloat32(16, true), step = dv.getFloat32(20, true);
  const center = version >= 2 ? [dv.getFloat32(28, true), dv.getFloat32(32, true), dv.getFloat32(36, true)] : null;
  const swap = version >= 2 ? dv.getFloat32(40, true) : 0;
  const n = nx * ny, positions = [], ao = [];
  let o = version >= 2 ? 48 : 32;
  for (let k = 0; k < K; k++) {
    const P = new Float32Array(n * 3), A = new Float32Array(n * 2);
    for (let j = 0; j < ny; j++) {
      const r0 = j * nx, coarse = step, prev = [0, 0, 0];
      for (let c = 0; c < 3; c++) { prev[c] = dv.getInt16(o, true) * coarse; o += 2; P[r0 * 3 + c] = prev[c]; }
      for (let i = 1; i < nx; i++) {
        const v = (r0 + i) * 3;
        for (let c = 0; c < 3; c++) { prev[c] += dv.getInt8(o++) * step; P[v + c] = prev[c]; }
      }
    }
    for (let v = 0; v < n; v++) A[v * 2] = dv.getUint8(o++) / 255;
    for (let v = 0; v < n; v++) A[v * 2 + 1] = dv.getUint8(o++) / 255;
    positions.push(P); ao.push(A);
  }
  return { nx, ny, n, K, seed, jitter, center, swap, positions, ao };
}
