// build-paper.mjs: prints the research paper (docs/research/src/paper.html) to docs/research/aviva-a4.pdf
// with the Chromium launch settings of tools/shoot.mjs, checks it, and renders every page for review.
//
// Usage: node work/scripts/design/build-paper.mjs [--url http://localhost:8080/research/src/paper.html]
//          [--out docs/research/aviva-a4.pdf] [--png work/screenshots/paper] [--dpi 110] [--no-png]
// Needs the site server (npm run serve, :8080). Checks: page.js report (overflow, fill, broken links, uncited
// references), exactly 8 pages, every font embedded and none Type 3. Then (optional) sets the PDF's Author / Subject /
// Keywords with pypdf, renders p-1..p-8.png with pdftoppm and a contact sheet (montage).
import { launch } from './snap.mjs';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const argv = process.argv.slice(2);
const opt = (n, d) => { const i = argv.indexOf(`--${n}`); if (i === -1) return d; const v = argv[i + 1]; return v === undefined || v.startsWith('--') ? true : v; };
const url = opt('url', 'http://localhost:8080/research/src/paper.html');
const out = opt('out', 'docs/research/aviva-a4.pdf');   // decision #29
const pngDir = opt('png', 'work/screenshots/paper');
const dpi = Number(opt('dpi', 110));

const b = await launch();
const ctx = await b.newContext({ viewport: { width: 900, height: 1200 }, deviceScaleFactor: 1 });
const page = await ctx.newPage();
const msgs = [];
page.on('console', (m) => msgs.push(`[${m.type()}] ${m.text()}`));
page.on('pageerror', (e) => msgs.push(`[pageerror] ${e}`));
page.on('response', (r) => { if (r.status() >= 400 && !r.url().endsWith('favicon.ico')) msgs.push(`[${r.status()}] ${r.url()}`); });
await page.emulateMedia({ media: 'print' });
await page.goto(url, { waitUntil: 'networkidle', timeout: 90000 });
await page.waitForFunction(() => window.__ready === true, null, { timeout: 90000 });
const report = await page.evaluate(() => window.__report);
for (const p of report.pages) {
  const cols = p.cols.map((c) => `${c.left}/${c.right}`).join(' ');
  console.log(`${p.page}: ${String(p.fill).padStart(3)} % of the text block (${p.usedMM} of ${p.frameMM} mm)  columns L/R mm: ${cols || '-'}${p.overflow.length ? '  OVERFLOW' : ''}`);
}
console.log('soft hyphens:', JSON.stringify(report.hyphens));
if (report.problems.length) console.log('PROBLEMS:\n  ' + report.problems.join('\n  '));
if (msgs.length) console.log(msgs.join('\n'));

fs.mkdirSync(path.dirname(out), { recursive: true });
await page.pdf({ path: out, preferCSSPageSize: true, printBackground: true, tagged: true, outline: true });
await b.close();

// ---- checks on the PDF
const info = execFileSync('pdfinfo', [out]).toString();
const pages = +(info.match(/Pages:\s+(\d+)/) || [])[1];
const size = (info.match(/Page size:\s+(.+)/) || [])[1];
const fonts = execFileSync('pdffonts', [out]).toString().trim().split('\n').slice(2);
const type3 = fonts.filter((l) => /Type 3/.test(l));
const notEmb = fonts.filter((l) => / no +(yes|no) +(yes|no)/.test(l.slice(54)));
console.log(`\n${out}: ${pages} pages, ${size}, ${(fs.statSync(out).size / 1024).toFixed(0)} KB`);
console.log(fonts.map((l) => '  ' + l.replace(/\s+/g, ' ')).join('\n'));
if (pages !== 8) console.log('!! expected 8 pages');
if (type3.length) console.log('!! Type 3 fonts:', type3.length);
if (notEmb.length) console.log('!! fonts not embedded:', notEmb.length);

// ---- metadata (Chromium sets Title from <title>; add the rest)
try {
  execFileSync('python3', ['-I', '-c', `
import sys
from pypdf import PdfReader, PdfWriter
src = sys.argv[1]
r = PdfReader(src); w = PdfWriter(clone_from=r)
w.add_metadata({
  '/Title': 'Void of All Characters: Pre-training a Foundation Model on Nothing',
  '/Author': 'Ada Margin, Gus Gutter, Lena Leading, Bea Bleed (aviva Research)',
  '/Subject': 'aviva Research technical report AV-A4-001 (2026). A parody research paper from aviva, a fictional parody project inspired by ORYZO by Lusion. Not affiliated with Lusion. Nothing is for sale.',
  '/Keywords': 'foundation models; pre-training; distillation; hallucination; ISO 216; paper',
})
with open(src, 'wb') as f: w.write(f)
`, out]);
  console.log('metadata set (pypdf)');
} catch (e) { console.log('(metadata skipped: pypdf not available)'); }

// ---- page renders + contact sheet
if (!opt('no-png', false)) {
  fs.mkdirSync(pngDir, { recursive: true });
  for (const f of fs.readdirSync(pngDir)) if (/^p-\d+\.png$/.test(f)) fs.unlinkSync(path.join(pngDir, f));
  execFileSync('pdftoppm', ['-r', String(dpi), '-png', out, path.join(pngDir, 'p')]);
  const files = fs.readdirSync(pngDir).filter((f) => /^p-\d+\.png$/.test(f)).sort((a, c) => parseInt(a.slice(2)) - parseInt(c.slice(2)));
  // pdftoppm pads the page number when there are more than 9 pages; normalise to p-N.png
  for (const f of files) { const n = parseInt(f.slice(2)); if (f !== `p-${n}.png`) fs.renameSync(path.join(pngDir, f), path.join(pngDir, `p-${n}.png`)); }
  try {
    execFileSync('montage', [...[1, 2, 3, 4].map((n) => path.join(pngDir, `p-${n}.png`)), '-tile', '4x1', '-geometry', '+14+14', '-background', '#D8D6D0', '-resize', '640x', path.join(pngDir, 'contact-1-4.png')]);
    execFileSync('montage', [...[5, 6, 7, 8].map((n) => path.join(pngDir, `p-${n}.png`)), '-tile', '4x1', '-geometry', '+14+14', '-background', '#D8D6D0', '-resize', '640x', path.join(pngDir, 'contact-5-8.png')]);
    console.log(`renders: ${pngDir}/p-1..${files.length}.png, contact-1-4.png, contact-5-8.png`);
  } catch (e) { console.log('montage failed:', e.message); }
}
