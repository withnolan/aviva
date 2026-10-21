// print-test.mjs: prints pages the way Ctrl/Cmd + P would (print media, the CSS page size) and checks print.css:
// exactly one A4 page, the foot line present. Renders each PDF to PNG for a look.
// Usage: node work/scripts/design/print-test.mjs <outdir> [url ...]   (default: the site, plus a page without .print-only)
import { launch } from './snap.mjs';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
const [out = 'work/screenshots/print', ...urls] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const jobs = urls.length ? urls.map((u, i) => ({ name: `page-${i}`, url: u })) : [
  { name: 'site', url: 'http://localhost:8080/' },
  { name: 'fallback', html: '<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><link rel="stylesheet" href="/css/fonts.css"><link rel="stylesheet" href="/css/print.css" media="print"></head><body><header>nav</header><main><h1>A page without the .print-only block</h1><p>Body copy that must not print.</p></main></body></html>' },
];
const b = await launch();
for (const j of jobs) {
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  if (j.url) await p.goto(j.url, { waitUntil: 'load', timeout: 90000 });
  else { await p.goto('http://localhost:8080/css/print.css'); await p.setContent(j.html, { waitUntil: 'load' }); }
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(800);
  const pdf = path.join(out, `${j.name}.pdf`);
  await p.pdf({ path: pdf, preferCSSPageSize: true, printBackground: false });
  await p.close();
  const info = execFileSync('pdfinfo', [pdf]).toString();
  const text = execFileSync('pdftotext', ['-layout', pdf, '-']).toString().trim().replace(/\s+\n/g, '\n');
  execFileSync('pdftoppm', ['-r', '60', '-png', '-singlefile', pdf, path.join(out, j.name)]);
  execFileSync('pdftoppm', ['-r', '300', '-png', '-singlefile', '-x', '0', '-y', '3270', '-W', '2480', '-H', '240', pdf, path.join(out, j.name + '-foot')]);
  console.log(`${j.name}: ${(info.match(/Pages:\s+(\d+)/) || [])[1]} page(s), ${(info.match(/Page size:\s+(.+)/) || [])[1]}\n  text: ${JSON.stringify(text)}`);
}
await b.close();
