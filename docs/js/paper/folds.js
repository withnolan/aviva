// folds.js: authoring folds in the plane of the (flat-folded) sheet, and the fold presets of the brief.
// A fold is a hinge with a bend radius (glsl.js paperFold): a crease is r ~ 0.4 mm, a page curl r ~ 20 mm.
// Every fold carries a progress `t` (0..1) that scales its angle, so sequences are just timelines over t.
import * as THREE from 'three';

export const A4 = { w: 0.21, h: 0.297 };
const ease = (x) => { x = Math.min(Math.max(x, 0), 1); return x * x * (3 - 2 * x); };
const _d = new THREE.Vector3(), _m = new THREE.Vector3(), _a = new THREE.Vector3(), _c = new THREE.Vector3();

/**
 * One fold, defined in the XY plane of the current flat state.
 * p:[x,y] a point on the crease; dir:[dx,dy] the crease direction; side:[sx,sy] points to the part that MOVES;
 * toward: +1 valley (the flap comes toward +z, the front), -1 mountain; angle (rad); radius (m);
 * mask:[nx,ny,d] optional rest-space half-plane (dot(rest, n) + d > 0) for stacked layers that move differently;
 * taper (1/m): cone curl, the radius grows along the crease (corner curls).
 */
export function fold2D({ p, dir, side, toward = 1, angle = Math.PI, radius = 0.0004, mask = null, taper = 0, t = 1, minRadius = true }) {
  _d.set(dir[0], dir[1], 0).normalize();
  _m.set(-_d.y, _d.x, 0); if (_m.x * side[0] + _m.y * side[1] < 0) _m.negate();
  _a.copy(_d); if (_c.crossVectors(_a, _m).z < 0) _a.negate();
  return {
    q: new THREE.Vector4(p[0], p[1], 0, radius),
    a: new THREE.Vector4(_a.x, _a.y, _a.z, toward * angle),
    m: new THREE.Vector4(_m.x, _m.y, _m.z, mask ? 1 : 0),
    r: new THREE.Vector4(mask ? mask[0] : 0, mask ? mask[1] : 0, mask ? mask[2] : 0, taper),
    t, minRadius,
  };
}

/** Dart paper plane on A4 as 7 folds (verified step by step). t in 0..7 runs the sequence. */
export function dartPlane(t = 7, { size = A4, wing = 0.045, dihedral = 0.0, r = 0.0004 } = {}) {
  const hw = size.w / 2, hh = size.h / 2, f = [];
  f.push(fold2D({ p: [0, hh], dir: [1, -1], side: [1, 1], toward: 1, radius: r }));
  f.push(fold2D({ p: [0, hh], dir: [-1, -1], side: [-1, 1], toward: 1, radius: r }));
  const s = Math.sin(Math.PI / 8), c = Math.cos(Math.PI / 8);
  f.push(fold2D({ p: [0, hh], dir: [s, -c], side: [c, s], toward: 1, radius: r }));
  f.push(fold2D({ p: [0, hh], dir: [-s, -c], side: [-c, s], toward: 1, radius: r }));
  f.push(fold2D({ p: [0, 0], dir: [0, 1], side: [1, 0], toward: -1, radius: r }));
  const nose = [0, hh], tail = [-wing, -hh], dir = [tail[0] - nose[0], tail[1] - nose[1]];
  const wingAngle = Math.PI * 0.5 - dihedral;
  f.push(fold2D({ p: nose, dir, side: [-1, 0], toward: 1, angle: wingAngle, radius: 0.0011, mask: [-1, 0, 0] }));
  f.push(fold2D({ p: nose, dir, side: [-1, 0], toward: -1, angle: wingAngle, radius: 0.0011, mask: [1, 0, 0] }));
  f.forEach((x, i) => (x.t = ease(t - i)));
  return f;
}
/**
 * Where the finished dart plane sits in the sheet frame, so it can be flown as a rigid object:
 * returns { forward, up, origin } (sheet-local) for t = 7: the nose points +y, the keel hangs toward -x/+z.
 */
export function dartPlaneFrame({ size = A4, wing = 0.045 } = {}) {
  const hh = size.h / 2;
  // after fold 5 the plane lies in the x <= 0 half, keel along x = 0; the wing hinge runs nose -> (-wing, -hh)
  const forward = new THREE.Vector3(0, 1, 0);
  const up = new THREE.Vector3(0, 0, 1);            // wings open toward +z; keel below
  return { forward, up, origin: new THREE.Vector3(-wing * 0.5, hh * 0.15, 0) };
}

/** A4 -> A5 -> A6: two flat folds that land the edges exactly on each other (sqrt 2). t in 0..2. */
export function halving(t = 2, { r = 0.0004, size = A4 } = {}) {
  const f = [
    fold2D({ p: [0, 0], dir: [1, 0], side: [0, 1], toward: 1, radius: r }),
    fold2D({ p: [0, 0], dir: [0, 1], side: [1, 0], toward: 1, radius: r }),
  ];
  f.forEach((x, i) => (x.t = ease(t - i)));
  return f;
}

/** A4 halved n times (A10 after 6: 26 x 37 mm, 64 layers). Real thickness wants r ~ 0.06 mm. t in 0..n */
export function sixfold(t = 6, { n = 6, r = 0.00007, size = A4 } = {}) {
  const f = []; let x0 = -size.w / 2, x1 = size.w / 2, y0 = -size.h / 2, y1 = size.h / 2;
  for (let i = 0; i < n; i++) {
    if (i % 2 === 0) { const ym = (y0 + y1) / 2; f.push(fold2D({ p: [0, ym], dir: [1, 0], side: [0, 1], toward: 1, radius: r * (1 + i * 0.6) })); y1 = ym; }
    else { const xm = (x0 + x1) / 2; f.push(fold2D({ p: [xm, 0], dir: [0, 1], side: [1, 0], toward: 1, radius: r * (1 + i * 0.6) })); x1 = xm; }
  }
  f.forEach((x, i) => (x.t = ease(t - i)));
  return { folds: f, box: { x0, x1, y0, y1 } };
}

const CORNERS = { tr: [1, 1], tl: [-1, 1], br: [1, -1], bl: [-1, -1] };
/** The dog-ear (s09): a 45 deg crease cutting `size` off both edges at the corner, up to 165 deg, r 0.6 mm. t 0..1 */
export function dogEar(t = 1, { corner = 'tr', size = 0.03, angle = THREE.MathUtils.degToRad(165), r = 0.0006, toward = 1, sheet = A4 } = {}) {
  const [sx, sy] = CORNERS[corner], cx = sx * sheet.w / 2, cy = sy * sheet.h / 2;
  return [fold2D({ p: [cx - sx * size / 2, cy - sy * size / 2], dir: [sx, -sy], side: [sx, sy], toward, angle, radius: r, t: ease(t) })];
}

/** A lifting corner (the s03 "thinking" curl, card 3): a cone curl across a corner. t 0..1 */
export function cornerCurl(t = 1, { corner = 'tr', size = 0.06, r = 0.015, angle = THREE.MathUtils.degToRad(25), taper = 0, toward = 1, sheet = A4 } = {}) {
  const [sx, sy] = CORNERS[corner], cx = sx * sheet.w / 2, cy = sy * sheet.h / 2;
  return [fold2D({ p: [cx - sx * size / 2, cy - sy * size / 2], dir: [sx, -sy], side: [sx, sy], toward, angle, radius: r, taper, t: ease(t), minRadius: false })];
}

const EDGES = { bottom: [0, -1], top: [0, 1], left: [-1, 0], right: [1, 0] };
/**
 * A curl from an edge (page curl, the s02 peel): the hinge runs parallel to `edge`, `at` 0..1 moves it from the edge
 * across the sheet; everything between the edge and the hinge rolls up toward `toward` with radius r.
 */
export function edgeCurl({ edge = 'bottom', at = 0.2, r = 0.025, angle = Math.PI * 0.6, toward = 1, sheet = A4 } = {}) {
  const [ex, ey] = EDGES[edge];
  const ext = ex ? sheet.w : sheet.h;
  const pos = (ext / 2) - at * ext;                     // distance of the hinge from the centre, toward the edge
  return [fold2D({ p: [ex * pos, ey * pos], dir: [ey, ex], side: [ex, ey], toward, angle, radius: r, minRadius: false })];
}

/** The s02 peel: the near (bottom) edge lifts and the curl sweeps across. t 0..1 */
export function peel(t = 1, { r = 0.025, angle = Math.PI * 0.55, toward = 1, sheet = A4 } = {}) {
  const at = THREE.MathUtils.clamp(t * 1.05, 0, 1);
  const a = angle * ease(Math.min(1, t * 3.0));
  return edgeCurl({ edge: 'bottom', at, r, angle: a, toward, sheet });
}

/** The pleated fan (card 6): uniform uPleat. gamma 0 (flat) .. ~0.75 (tight pleats); open 0 .. ~4 rad/m */
export function fan(t = 1, { period = 0.015, gamma = 0.62, open = 3.4, pivot = 0.05 } = {}) {
  const e = ease(t);
  return { period, gamma: gamma * Math.min(1, e * 1.6), open: open * ease((t - 0.35) / 0.65), pivot };
}
