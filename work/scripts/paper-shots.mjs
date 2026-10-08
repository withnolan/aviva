#!/usr/bin/env node
// paper-shots.mjs: screenshot many lab states in ONE page load (fast: textures and shaders are built once).
// Every spec is the query string of docs/lab/paper.html; the first loads the page, the rest go through
// window.lab.apply(spec) (a spec containing tier= / seg= / dpr= reloads the page, since those are fixed at boot).
//
//   node work/scripts/paper-shots.mjs --out work/screenshots/lab/iter --size 1440x900 \
//        hero="state=hero" air="state=heroair&show=0.2" ...
//   options: --montage path.jpg (contact sheet of all shots, labelled) --cols 4 --tile 720x450
//            --crop x,y,w,h (crop every shot) --log (print the page console) --jpeg
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const argv = process.argv.slice(2);
const opts = {}; const specs = [];
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a.startsWith('--')) { const k = a.slice(2); const v = argv[i + 1]; if (v === undefined || v.startsWith('--') || /^[\w.-]+=/.test(v) && !['out', 'size', 'montage', 'cols', 'tile', 'crop', 'base', 'timeout'].includes(k)) opts[k] = true; else { opts[k] = v; i++; } continue; }
  const m = a.match(/^([\w.-]+)=(.*)$/); if (m) specs.push({ name: m[1], q: m[2].replace(/^\?/, '') });
}
const out = opts.out || 'work/screenshots/lab/shots';
const [W, H] = String(opts.size || '1440x900').split('x').map(Number);
const base = opts.base || 'http://localhost:8080/lab/paper.html';
const ext = opts.jpeg ? 'jpg' : 'png';
fs.mkdirSync(out, { recursive: true });

async function launch() {
  const args = ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--enable-webgl'];
  const cands = [undefined, process.env.CHROME_PATH, '/opt/pw-browsers/chromium', '/usr/bin/chromium'];
  let err;
  for (const exe of cands) { if (exe && !fs.existsSync(exe)) continue; try { return await chromium.launch({ headless: true, executablePath: exe, args }); } catch (e) { err = e; } }
  throw err;
}
const browser = await launch();
const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
let page = null, loadedQ = null;
const errors = [];
async function open(q) {
  if (page) await page.close();
  page = await ctx.newPage();
  page.on('console', (m) => { const t = `[${m.type()}] ${m.text()}`; if (opts.log) console.log(t.slice(0, 400)); if (m.type() === 'error' && !/favicon/.test(t)) errors.push(t); });
  page.on('pageerror', (e) => { errors.push('[pageerror] ' + e); console.log('[pageerror]', String(e).slice(0, 600)); });
  await page.goto(`${base}?${q}`, { waitUntil: 'load', timeout: 120000 });
  await page.waitForFunction(() => window.__ready === true, null, { timeout: +(opts.timeout || 180000), polling: 200 });
  loadedQ = q;
}
const files = [];
const t00 = Date.now();
for (const s of specs) {
  const t0 = Date.now();
  const reload = !page || /(^|&)(tier|seg|dpr|cfile)=/.test(s.q) || /(^|&)(tier|seg|dpr|cfile)=/.test(loadedQ || '');
  try {
    if (reload) await open(s.q);
    else {
      await page.evaluate((q) => { window.__ready = false; return window.lab.apply('?' + q); }, s.q);
      await page.waitForFunction(() => window.__ready === true, null, { timeout: +(opts.timeout || 180000), polling: 100 });
    }
    // two more frames so async bits (crumple, contact shadow) settle
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
    const file = path.join(out, `${s.name}.${ext}`);
    const clip = opts.crop ? (([x, y, w, h]) => ({ x, y, width: w, height: h }))(String(opts.crop).split(',').map(Number)) : undefined;
    await page.screenshot({ path: file, type: opts.jpeg ? 'jpeg' : 'png', ...(opts.jpeg ? { quality: 92 } : {}), ...(clip ? { clip } : {}) });
    const info = await page.evaluate(() => window.__info || null).catch(() => null);
    console.log(`${file}  ${((Date.now() - t0) / 1000).toFixed(1)}s${reload ? ' (load)' : ''}${info ? '  ' + JSON.stringify(info) : ''}`);
    files.push({ file, name: s.name });
  } catch (e) { console.log('FAILED', s.name, String(e).slice(0, 300)); }
}
await browser.close();
if (errors.length) console.log('PAGE ERRORS:\n  ' + [...new Set(errors)].slice(0, 12).join('\n  '));
console.log(`done ${files.length} shots in ${((Date.now() - t00) / 1000).toFixed(0)}s`);

if (opts.montage && files.length) {
  const [tw, th] = String(opts.tile || '720x450').split('x');
  const args = [];
  for (const f of files) args.push('-label', f.name, f.file);
  args.push('-tile', `${opts.cols || 4}x`, '-geometry', `${tw}x${th}+6+6`, '-background', '#d9d8d4', '-fill', '#2a2926', '-pointsize', '18', '-font', 'DejaVu-Sans', '-quality', '88', opts.montage);
  execFileSync('montage', args, { stdio: 'inherit' });
  console.log('montage ->', opts.montage);
}
