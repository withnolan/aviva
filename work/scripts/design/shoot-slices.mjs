// shoot-slices.mjs: screenshots a long, non-WebGL page (the style guide) viewport by viewport, instead of one
// full-page capture (Chromium's full-page capture repeats tiles on very tall pages), and joins every 3 slices into a
// review sheet. Uses the Chromium launch settings of tools/shoot.mjs (via snap.mjs).
// Usage: node work/scripts/design/shoot-slices.mjs <url> <outdir> [--w 1440] [--h 900] [--dpr 1] [--per 3]
import { launch } from './snap.mjs';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const argv = process.argv.slice(2);
const [url, out] = argv;
const opt = (n, d) => { const i = argv.indexOf(`--${n}`); return i === -1 ? d : argv[i + 1]; };
const W = +opt('w', 1440), H = +opt('h', 900), DPR = +opt('dpr', 1), PER = +opt('per', 3);
fs.mkdirSync(out, { recursive: true });
for (const f of fs.readdirSync(out)) if (/^(slice|sheet)-\d+\.png$/.test(f)) fs.unlinkSync(path.join(out, f));

const b = await launch();
const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: DPR, isMobile: W < 600, hasTouch: W < 600 });
const p = await ctx.newPage();
const errs = [];
p.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') errs.push(`[${m.type()}] ${m.text()}`); });
p.on('pageerror', (e) => errs.push(`[pageerror] ${e}`));
p.on('response', (r) => { if (r.status() >= 400) errs.push(`[${r.status()}] ${r.url()}`); });
await p.goto(url, { waitUntil: 'networkidle', timeout: 90000 });
await p.evaluate(() => document.fonts.ready);
await p.waitForTimeout(1200);
const total = await p.evaluate(() => document.documentElement.scrollHeight);
const files = [];
for (let y = 0, i = 0; y < total; y += H, i++) {
  await p.evaluate((yy) => window.scrollTo(0, yy), y);
  await p.waitForTimeout(350);
  const f = path.join(out, `slice-${String(i).padStart(2, '0')}.png`);
  await p.screenshot({ path: f });
  files.push(f);
}
const overflowX = await p.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
await b.close();
for (let s = 0; s * PER < files.length; s++) {
  const group = files.slice(s * PER, s * PER + PER);
  execFileSync('montage', [...group, '-tile', `${group.length}x1`, '-geometry', '+6+0', '-background', '#888', path.join(out, `sheet-${s}.png`)]);
}
console.log(`${files.length} slices (${W}x${H}), page ${total}px tall, horizontal overflow: ${overflowX ? 'YES' : 'no'}`);
if (errs.length) console.log(errs.join('\n'));
