// check-91.mjs: every "New" text in brief Part 9.1 must appear in docs/index.html (tags stripped, quotes normalised).
import fs from 'node:fs';
const brief = fs.readFileSync('work/04-creative-brief.md', 'utf8');
const sec = brief.slice(brief.indexOf('### 9.1 Site copy'), brief.indexOf('### 9.2'));
const html = fs.readFileSync('docs/index.html', 'utf8');
const norm = (s) => s.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/[“”"]/g, '"').replace(/[‘’']/g, "'").replace(/\s+/g, ' ').trim();
const page = norm(html);
let ok = 0, bad = 0;
for (const row of sec.split('\n').filter((l) => /^\| \d+ \|/.test(l))) {
  const cells = row.split(' | ');
  const id = cells[1], nu = cells[3];
  for (const part of nu.split(' / ').map((x) => x.replace(/^…\s*/, '').replace(/\s*…$/, '').replace(/^(cap|alt): /, ''))) {
    const t = norm(part).replace(/\.\.\.$/, '');
    const pieces = t.split('…').map((x) => x.trim()).filter((x) => x.length > 3);
    const hit = pieces.every((p) => page.includes(p));
    if (hit) ok++; else { bad++; console.log('MISSING', id, '→', t.slice(0, 120)); }
  }
}
console.log(`9.1 check: ${ok} found, ${bad} missing`);
