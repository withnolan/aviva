// hyphenate-paper.mjs: puts soft hyphens (U+00AD) into the research paper's running text, so the justified
// two-column text can break words the way TeX would. Headless Chromium on Linux ships no hyphenation dictionaries,
// so CSS `hyphens: auto` does nothing there; this does the same job once, at build time, and the result is saved in
// docs/research/src/paper.html (soft hyphens are invisible unless a line breaks at one).
//
// Usage: node work/scripts/design/hyphenate-paper.mjs <path to an unpacked "hyphen" npm package> [paper.html]
//   (npm pack hyphen && tar -xzf hyphen-*.tgz  ->  ./package ; ISC licence, Liang's algorithm with the en-GB
//    TeX patterns. Nothing from the package is copied into docs/.)
// Rules: running-text <p> and <li> only (not headings, captions, tables or references); never inside <math>, links,
// highlighter marks or numbers; at least 3 letters before and after a break; the brand "aviva" is never broken.
// Idempotent: existing soft hyphens are removed first.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const [pkg, file = 'docs/research/src/paper.html'] = process.argv.slice(2);
if (!pkg) { console.error('usage: node hyphenate-paper.mjs <hyphen package dir> [paper.html]'); process.exit(2); }
const require = createRequire(import.meta.url);
const { hyphenateSync } = require(path.resolve(pkg, 'en-gb'));
const SHY = '­';
const MIN_L = 3, MIN_R = 3, NEVER = new Set(['aviva']);

const fixWord = (w) => {
  if (!w.includes(SHY)) return w;
  const plain = w.replaceAll(SHY, '');
  if (NEVER.has(plain.toLowerCase())) return plain;
  const parts = w.split(SHY);
  // merge pieces until the first has >= MIN_L letters and the last >= MIN_R
  while (parts.length > 1 && parts[0].length < MIN_L) parts.splice(0, 2, parts[0] + parts[1]);
  while (parts.length > 1 && parts[parts.length - 1].length < MIN_R) parts.splice(-2, 2, parts[parts.length - 2] + parts[parts.length - 1]);
  return parts.join(SHY);
};
const hyText = (t) => hyphenateSync(t).replace(/[A-Za-zÀ-ɏ­]+/g, fixWord);
// hyphenate the text outside protected inline elements and outside tags
const PROTECT = /<math[\s\S]*?<\/math>|<a\b[\s\S]*?<\/a>|<span class="(?:hl[^"]*|cite|xref|nobr)"[\s\S]*?<\/span>|<[^>]+>/g;
function hyHTML(inner) {
  let out = '', last = 0;
  for (const m of inner.matchAll(PROTECT)) {
    out += hyText(inner.slice(last, m.index)) + m[0];
    last = m.index + m[0].length;
  }
  return out + hyText(inner.slice(last));
}

let html = fs.readFileSync(file, 'utf8').replaceAll(SHY, '');
let n = 0;
html = html.replace(/(<p(?: class="noindent")?>)([\s\S]*?)(<\/p>)/g, (m, a, inner, c) => { n++; return a + hyHTML(inner) + c; });
html = html.replace(/(<ol class="contrib">)([\s\S]*?)(<\/ol>)/, (m, a, inner, c) => a + inner.replace(/(<li>)([\s\S]*?)(<\/li>)/g, (mm, x, t, y) => { n++; return x + hyHTML(t) + y; }) + c);
fs.writeFileSync(file, html);
console.log(`hyphenated ${n} blocks; ${(html.match(/­/g) || []).length} soft hyphens in ${file}`);
