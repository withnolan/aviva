// util.js: small math helpers shared by the choreography, springs and UI. No allocations in hot paths.

export const clamp = (x, a = 0, b = 1) => (x < a ? a : x > b ? b : x);
export const lerp = (a, b, t) => a + (b - a) * t;
export const invLerp = (a, b, x) => clamp((x - a) / (b - a));
export const smooth = (t) => t * t * (3 - 2 * t);
export const smoothstep = (a, b, x) => smooth(invLerp(a, b, x));
export const deg = Math.PI / 180;

export const ease = {
  linear: (t) => t,
  in: (t) => t * t * t,
  out: (t) => 1 - (1 - t) ** 3,
  inOut: (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2),
  sine: (t) => 0.5 - 0.5 * Math.cos(Math.PI * t),
  expoOut: (t) => (t >= 1 ? 1 : 1 - 2 ** (-10 * t)),
  quadOut: (t) => 1 - (1 - t) * (1 - t),
  quadIn: (t) => t * t,
};

/**
 * Piecewise keyframes over a progress value p (viewport heights into a section).
 * keys: [[p0, v0], [p1, v1, easeFn?], ...]; the ease on a key shapes the segment that ends at it.
 */
export function kf(p, keys) {
  if (p <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const k1 = keys[i];
    if (p <= k1[0]) {
      const k0 = keys[i - 1];
      const t = (p - k0[0]) / (k1[0] - k0[0] || 1);
      return k0[1] + (k1[1] - k0[1]) * (k1[2] || ease.inOut)(t);
    }
  }
  return keys[keys.length - 1][1];
}

/** 0 → 1 over [a, b] with smoothstep; handy for "between 0.8 and 1.6 vh". */
export const seg = (p, a, b, fn = smooth) => fn(invLerp(a, b, p));

/** Frame-rate independent exponential damping toward a target. */
export const damp = (x, target, lambda, dt) => lerp(x, target, 1 - Math.exp(-lambda * dt));

/** Seeded PRNG (mulberry32). */
export function rng(seed = 1) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** 1D value noise in [-1, 1] (cheap, for sways). */
export function noise1(x, seed = 0) {
  const h = (n) => {
    const s = Math.sin(n * 127.1 + seed * 311.7) * 43758.5453;
    return s - Math.floor(s);
  };
  const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f);
  return (lerp(h(i), h(i + 1), u) - 0.5) * 2;
}

export const isTouch = () => matchMedia('(pointer: coarse)').matches;
export const isFinePointer = () => matchMedia('(pointer: fine)').matches;
export const isNarrow = () => innerWidth <= 600;
