// Prints a page to PDF the way Ctrl/Cmd + P would (print media, CSS page size) and reports the page count.
// Usage: node work/scripts/design/print-test.mjs <url> <out.pdf>
import { launch } from './snap.mjs';
const [url, out] = process.argv.slice(2);
const b = await launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto(url, { waitUntil: 'load' });
await p.evaluate(() => document.fonts.ready);
await p.pdf({ path: out, preferCSSPageSize: true, printBackground: false });
await b.close();
const fs = await import('node:fs');
const n = (fs.readFileSync(out, 'latin1').match(/\/Type\s*\/Page[^s]/g) || []).length;
console.log(out, 'pages:', n);
