// WCAG 2.x contrast ratio. Usage: node contrast.mjs '#2A2926' '#F7F5F0' ...pairs
const hex = (h) => { h = h.replace('#', ''); if (h.length === 3) h = h.split('').map(c => c + c).join(''); return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16) / 255); };
const lin = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
export const lum = (h) => { const [r, g, b] = hex(h).map(lin); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
export const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
// alpha-composite fg (with alpha) over bg
export const over = (fg, a, bg) => { const f = hex(fg), b = hex(bg); return '#' + f.map((c, i) => Math.round((c * a + b[i] * (1 - a)) * 255).toString(16).padStart(2, '0')).join(''); };
if (process.argv[1] && process.argv[1].endsWith('contrast.mjs')) {
  const args = process.argv.slice(2);
  for (let i = 0; i + 1 < args.length; i += 2) console.log(args[i], 'on', args[i + 1], '=', ratio(args[i], args[i + 1]).toFixed(2));
}
