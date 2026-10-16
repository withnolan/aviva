// snap.mjs: screenshot one page (or one element) with the Chromium launch settings of tools/shoot.mjs.
// Usage:
//   node work/scripts/design/snap.mjs <url> <out.png> [--w 1440] [--h 900] [--full] [--wait 600]
//          [--dpr 1] [--el "#selector"] [--dark] [--reduced] [--print]
// --print emulates print media (for print.css checks); --dark emulates prefers-color-scheme: dark.
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const argv = process.argv.slice(2);
const [url, out] = argv;
const opt = (n, d) => { const i = argv.indexOf(`--${n}`); if (i === -1) return d; const v = argv[i + 1]; return v === undefined || v.startsWith('--') ? true : v; };
const w = Number(opt('w', 1440)), h = Number(opt('h', 900)), wait = Number(opt('wait', 600)), dpr = Number(opt('dpr', 1));

export async function launch() {
  const args = ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--enable-webgl', '--font-render-hinting=none'];
  const candidates = [undefined, process.env.CHROME_PATH, '/opt/pw-browsers/chromium', '/usr/bin/chromium'];
  let lastErr;
  for (const exe of [...new Set(candidates)]) {
    if (exe && !fs.existsSync(exe)) continue;
    try { return await chromium.launch({ headless: true, executablePath: exe, args }); } catch (e) { lastErr = e; }
  }
  throw lastErr;
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (isMain && url && out) {
  const browser = await launch();
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: dpr, colorScheme: opt('dark', false) ? 'dark' : 'light', reducedMotion: opt('reduced', false) ? 'reduce' : 'no-preference', isMobile: w < 600, hasTouch: w < 600 });
  const page = await ctx.newPage();
  const errs = [];
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') errs.push(`[${m.type()}] ${m.text()}`); });
  page.on('pageerror', (e) => errs.push(`[pageerror] ${e}`));
  page.on('requestfailed', (r) => errs.push(`[failed] ${r.url()}`));
  page.on('response', (r) => { if (r.status() >= 400) errs.push(`[${r.status()}] ${r.url()}`); });
  if (opt('print', false)) await page.emulateMedia({ media: 'print' });
  await page.goto(url, { waitUntil: 'load', timeout: 90000 });
  await page.evaluate(() => document.fonts && document.fonts.ready);
  await new Promise((r) => setTimeout(r, wait));
  fs.mkdirSync(path.dirname(out), { recursive: true });
  const el = opt('el', null);
  if (el && el !== true) await page.locator(el).first().screenshot({ path: out });
  else await page.screenshot({ path: out, fullPage: !!opt('full', false) });
  if (errs.length) console.log(errs.join('\n'));
  console.log('saved', out);
  await browser.close();
}
