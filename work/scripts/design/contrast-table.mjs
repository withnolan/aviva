// Prints the WCAG 2.x contrast table for aviva's palette (v2: paper, ink, charcoal and grey grounds).
// Usage: node work/scripts/design/contrast-table.mjs [--md]   (--md prints Markdown rows for work/05-design-system.md)
// Every pair the site uses is listed with the minimum it needs: 4.5 for text (AA, any size), 3 for UI boundaries
// and meaningful graphics (WCAG 1.4.11), "n/a" for decorative or disabled marks (exempt).
// Alpha colours (rules on dark grounds) and highlighter marks (multiply over the ground) are composited first.
import { ratio, over } from './contrast.mjs';

const P = {
  paper: '#F7F5F0', studio: '#ECEBE7', studioShade: '#E2E1DC', graphite: '#2A2926', muted: '#615F58',
  ink: '#2E2A8E', inkDeep: '#1E1A60', onInk: '#F7F5F0', onInkMuted: '#C8C6E4', rule: '#D9D6CE', ruleStrong: '#827F77',
  disabled: '#A3A099',
  // v2
  charcoal: '#1F2328', charcoalRaised: '#2A2F36', charcoalDeep: '#171A1E', onCharcoalMuted: '#A9B0B9',
  grey100: '#E6E8EA', grey200: '#D9DDE1', grey300: '#CDD2D7', mutedDeep: '#55534D', ruleGrey: '#BFC4CA', ruleStrongGrey: '#72716B',
  pencil: '#F3C623', blueprint: '#2A5BAE', blueprintLight: '#8FB3F0', hlYellow: '#EAF33F', hlPink: '#FF94CA',
};
const mul = (a, b) => '#' + [1, 3, 5].map((i) => Math.round(parseInt(a.slice(i, i + 2), 16) * parseInt(b.slice(i, i + 2), 16) / 255).toString(16).padStart(2, '0')).join('');
// highlighter as drawn: the mark's mask alpha is ≈ 0.88 (assets/marks/highlighter.svg); on light grounds it multiplies
// over the ground (and over the text, which stays darker than graphite); on charcoal it lies under graphite text, normal blend
const hl = (mark, ground, a = 0.88) => over(mul(mark, ground), a, ground);
const hlDark = (mark, ground, a = 0.88) => over(mark, a, ground);
const paperA = (a, g) => over(P.paper, a, P[g]);

const rows = [
  ['— paper / studio grounds (v1)'],
  ['graphite', 'paper', 'body text', 4.5], ['graphite', 'studio', 'text over the 3D studio', 4.5], ['graphite', 'studioShade', 'text over the studio vignette', 4.5],
  ['muted', 'paper', 'secondary text', 4.5], ['muted', 'studio', 'secondary over studio', 4.5], ['muted', 'studioShade', 'secondary over vignette', 4.5],
  ['ink', 'paper', 'ink accent / focus on paper', 4.5], ['ink', 'studio', 'ink on studio', 4.5],
  ['paper', 'graphite', 'primary button label', 4.5],
  ['ruleStrong', 'paper', 'UI boundary (inputs, buttons)', 3], ['ruleStrong', 'studio', 'UI boundary on studio', 3],
  ['rule', 'paper', 'decorative hairline (exempt)', 1], ['disabled', 'paper', 'disabled label (exempt)', 1],
  ['— ink ground (s07–s10)'],
  ['onInk', 'ink', 'text on ink ground', 4.5], ['onInkMuted', 'ink', 'secondary on ink', 4.5], ['onInk', 'inkDeep', 'text on ink-deep', 4.5],
  ['ink', 'onInk', 'button label on paper button (ink ground)', 4.5],
  ['— v2: new accents on light grounds'],
  ['blueprint', 'paper', 'dimension labels, loader, diagrams', 4.5], ['blueprint', 'studio', 'dimension labels over the studio', 4.5],
  ['blueprint', 'grey100', 'dimension labels on light grey', 4.5], ['blueprint', 'grey200', 'dimension labels on cool grey', 4.5],
  ['pencil', 'paper', 'pencil yellow on paper: objects only, never text or UI (exempt)', 1],
  ['— v2: charcoal ground (s02, s03, s15)'],
  ['onInk', 'charcoal', 'text (paper) on charcoal', 4.5], ['onInk', 'charcoalRaised', 'text on raised charcoal', 4.5], ['onInk', 'charcoalDeep', 'text in a charcoal well', 4.5],
  ['onCharcoalMuted', 'charcoal', 'secondary text, labels', 4.5], ['onCharcoalMuted', 'charcoalRaised', 'secondary on raised', 4.5],
  ['charcoal', 'onInk', 'primary button label (charcoal on paper)', 4.5],
  ['onInk', 'charcoal', 'focus ring (paper) on charcoal', 3],
  ['pencil', 'charcoal', 'pencil yellow: CTA underline, accent', 3], ['pencil', 'charcoalRaised', 'pencil yellow on raised', 3],
  ['charcoal', 'pencil', 'charcoal text on a pencil-yellow fill (if ever used)', 4.5],
  ['blueprintLight', 'charcoal', 'dimension labels on charcoal', 4.5], ['blueprintLight', 'charcoalRaised', 'dimension labels on raised', 4.5],
  ['— v2: grey grounds (s04, s06, s12)'],
  ['graphite', 'grey200', 'text on cool grey', 4.5], ['graphite', 'grey100', 'text on light grey', 4.5], ['graphite', 'grey300', 'text in a grey well / table head', 4.5],
  ['mutedDeep', 'grey200', 'secondary text on cool grey', 4.5], ['mutedDeep', 'grey100', 'secondary on light grey', 4.5], ['mutedDeep', 'grey300', 'secondary in a grey well', 4.5],
  ['muted', 'grey200', 'v1 muted on cool grey: why grey grounds remap it', 4.5],
  ['ink', 'grey200', 'ink accent / focus ring on cool grey', 4.5], ['ink', 'grey100', 'ink accent / focus on light grey', 4.5],
  ['paper', 'graphite', 'primary button label (unchanged)', 4.5],
  ['ruleStrongGrey', 'grey200', 'UI boundary on cool grey', 3], ['ruleStrongGrey', 'grey100', 'UI boundary on light grey', 3], ['ruleStrongGrey', 'paper', 'UI boundary on a paper card in a grey section', 3],
  ['ruleGrey', 'grey200', 'decorative hairline on grey (exempt)', 1],
];
const md = process.argv.includes('--md');
const fmt = (r) => r.toFixed(2).padStart(6);
let fails = 0;
for (const row of rows) {
  if (row.length === 1) { if (!md) console.log('\n' + row[0]); continue; }
  const [f, b, use, need] = row;
  const r = ratio(P[f], P[b]);
  const ok = r >= need; if (!ok && need > 1) fails++;
  if (md) console.log(`| ${f} \`${P[f]}\` on ${b} \`${P[b]}\` | ${r.toFixed(2)} | ${need === 1 ? 'exempt' : '≥ ' + need} | ${use} |`);
  else console.log(`${f.padEnd(15)} ${P[f]} on ${b.padEnd(14)} ${P[b]} ${fmt(r)} : 1  ${ok ? 'pass' : (need === 1 ? 'n/a ' : 'FAIL')} (${need === 1 ? 'n/a' : '≥ ' + need})  ${use}`);
}
// alpha colours and highlighter marks
const extra = [
  ['rule on ink (paper 28 %)', paperA(0.28, 'ink'), P.ink, 1], ['rule-strong on ink (paper 62 %)', paperA(0.62, 'ink'), P.ink, 3],
  ['rule on charcoal (paper 16 %)', paperA(0.16, 'charcoal'), P.charcoal, 1],
  ['rule-strong on charcoal (paper 44 %)', paperA(0.44, 'charcoal'), P.charcoal, 3], ['rule-strong on raised (paper 44 %)', over(P.paper, 0.44, P.charcoalRaised), P.charcoalRaised, 3],
  ['disabled on charcoal (paper 42 %, exempt)', paperA(0.42, 'charcoal'), P.charcoal, 1],
];
if (!md) console.log('\n— alpha colours (composited)');
for (const [use, fg, bg, need] of extra) {
  const r = ratio(fg, bg); if (r < need && need > 1) fails++;
  if (md) console.log(`| ${use}: \`${fg}\` on \`${bg}\` | ${r.toFixed(2)} | ${need === 1 ? 'exempt' : '≥ ' + need} | |`);
  else console.log(`${use.padEnd(40)} ${fg} on ${bg} ${fmt(r)} : 1  ${r >= need ? 'pass' : (need === 1 ? 'n/a ' : 'FAIL')}`);
}
if (!md) console.log('\n— highlighter marks: graphite text under a mark (mask alpha 0.88; multiply on light grounds, opaque under graphite text on charcoal)');
for (const [name, mark] of [['hl-yellow', P.hlYellow], ['hl-pink', P.hlPink]]) {
  for (const g of ['paper', 'studio', 'grey100', 'grey200']) {
    const bg = hl(mark, P[g]); const r = ratio(P.graphite, bg); if (r < 4.5) fails++;
    // the text itself is multiplied too: graphite × mark stays darker than graphite, so this is the worst case
    if (md) console.log(`| graphite under ${name} on ${g} (mark ≈ \`${bg}\`) | ${r.toFixed(2)} | ≥ 4.5 | |`);
    else console.log(`graphite under ${name.padEnd(9)} on ${g.padEnd(8)} mark ≈ ${bg} ${fmt(r)} : 1  ${r >= 4.5 ? 'pass' : 'FAIL'}`);
  }
  const bg = hlDark(mark, P.charcoal); const r = ratio(P.graphite, bg); if (r < 4.5) fails++;
  if (md) console.log(`| graphite under ${name} on charcoal (mark ≈ \`${bg}\`) | ${r.toFixed(2)} | ≥ 4.5 | |`);
  else console.log(`graphite under ${name.padEnd(9)} on charcoal mark ≈ ${bg} ${fmt(r)} : 1  ${r >= 4.5 ? 'pass' : 'FAIL'}`);
}
if (!md) console.log(fails ? `\n${fails} FAIL(S)` : '\nall required pairs pass');
process.exitCode = fails ? 1 : 0;
