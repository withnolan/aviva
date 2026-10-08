// Fluid type helper: linear between 390 px and 1440 px viewports, as CSS clamp() in rem.
// Usage: node fluid.mjs 34 72   -> clamp(2.125rem, ... , 4.5rem)
export function fluid(minPx, maxPx, vMin = 390, vMax = 1440) {
  const slope = (maxPx - minPx) / (vMax - vMin);            // px per px of viewport
  const intercept = minPx - slope * vMin;                    // px
  const r = (n) => +(n).toFixed(4);
  const lo = Math.min(minPx, maxPx), hi = Math.max(minPx, maxPx);
  return `clamp(${r(lo / 16)}rem, ${r(intercept / 16)}rem + ${r(slope * 100)}vw, ${r(hi / 16)}rem)`;
}
export function at(minPx, maxPx, vw, vMin = 390, vMax = 1440) {
  const slope = (maxPx - minPx) / (vMax - vMin);
  const v = minPx + slope * (vw - vMin);
  return +Math.min(Math.max(v, Math.min(minPx, maxPx)), Math.max(minPx, maxPx)).toFixed(1);
}
if (process.argv[1] && process.argv[1].endsWith('fluid.mjs') && process.argv.length > 3) {
  const [a, b] = process.argv.slice(2).map(Number);
  console.log(fluid(a, b), '| 768:', at(a, b, 768));
}
