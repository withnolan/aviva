#!/usr/bin/env node
// lab-shot.mjs: screenshot one or many URLs headlessly (SwiftShader WebGL, same launch flags as tools/shoot.mjs),
// waiting for `window.__ready === true` (set by the lab pages after the first full render) instead of a fixed delay.
//
// Usage:
//   node work/scripts/lab-shot.mjs --out work/screenshots/lab/x.png --size 1440x900 "http://localhost:8080/lab/paper.html?state=hero"
//   node work/scripts/lab-shot.mjs --dir work/screenshots/lab/set --size 960x600 name1="url1" name2="url2" ...
// Options: --timeout 120000 (ms to wait for __ready), --dpr 1, --jpeg (write .jpg q90), --log (print page console)
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const argv = process.argv.slice(2);
const opt = (k, d) => { const i = argv.indexOf('--' + k); if (i < 0) return d; const v = argv[i + 1]; return v === undefined || v.startsWith('--') ? true : v; };
const flags = new Set(['--out', '--dir', '--size', '--timeout', '--dpr']);
const urls = [];
for (let i = 0; i < argv.length; i++) { if (flags.has(argv[i])) { i++; continue; } if (argv[i].startsWith('--')) continue; urls.push(argv[i]); }
const [W, H] = String(opt('size', '1440x900')).split('x').map(Number);
const timeout = +opt('timeout', 180000), dpr = +opt('dpr', 1), jpeg = opt('jpeg', false) === true, log = opt('log', false) === true;

async function launch() {
  const args = ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--enable-webgl'];
  const cands = [undefined, process.env.CHROME_PATH, '/opt/pw-browsers/chromium', '/usr/bin/chromium'];
  let err;
  for (const exe of cands) { if (exe && !fs.existsSync(exe)) continue; try { return await chromium.launch({ headless: true, executablePath: exe, args }); } catch (e) { err = e; } }
  throw err;
}
const browser = await launch();
const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: dpr });
let n = 0;
for (const spec of urls) {
  let name = null, url = spec;
  const m = spec.match(/^([\w.-]+)=(https?:\/\/.*)$/); if (m) { name = m[1]; url = m[2]; }
  const file = opt('out', null) && urls.length === 1 ? opt('out') : path.join(opt('dir', 'work/screenshots/lab'), (name || `shot-${String(n).padStart(2, '0')}`) + (jpeg ? '.jpg' : '.png'));
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const page = await ctx.newPage();
  const msgs = [];
  page.on('console', (mm) => { const t = `[${mm.type()}] ${mm.text()}`; msgs.push(t); if (log) console.log(t.slice(0, 500)); });
  page.on('pageerror', (e) => { msgs.push('[pageerror] ' + e); console.log('[pageerror]', String(e).slice(0, 500)); });
  const t0 = Date.now();
  await page.goto(url, { waitUntil: 'load', timeout: 120000 });
  try { await page.waitForFunction(() => window.__ready === true, null, { timeout, polling: 250 }); }
  catch { console.log('timeout waiting for __ready:', url); }
  const info = await page.evaluate(() => window.__info || null).catch(() => null);
  await page.screenshot({ path: file, type: jpeg ? 'jpeg' : 'png', ...(jpeg ? { quality: 90 } : {}) });
  const errs = msgs.filter((t) => t.startsWith('[error]') || t.startsWith('[pageerror]'));
  console.log(`${file}  ${((Date.now() - t0) / 1000).toFixed(1)}s${info ? '  ' + JSON.stringify(info) : ''}${errs.length ? '\n  ERRORS: ' + errs.slice(0, 5).join('\n  ') : ''}`);
  await page.close(); n++;
}
await browser.close();
