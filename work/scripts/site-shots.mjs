#!/usr/bin/env node
// site-shots.mjs: screenshot the real site at exact section positions (no wheel scrolling): each spec is
// name=sectionKey:progress (progress in viewport heights into the section, as in brief 2B), e.g. s03=s03:2.5
//   node work/scripts/site-shots.mjs --out work/screenshots/site/x --size 1440x900 a=s01:0.6 b=s03:2.5 --montage m.jpg
// options: --url (default http://localhost:8080/?nointro) --settle ms (2600) --montage file --cols 2 --tile 720x450 --log
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const argv = process.argv.slice(2), opts = {}, specs = [];
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a.startsWith('--')) { const k = a.slice(2), v = argv[i + 1]; if (v === undefined || v.startsWith('--') || /^[\w.-]+=/.test(v)) opts[k] = true; else { opts[k] = v; i++; } continue; }
  const m = a.match(/^([\w.-]+)=(s\d\d):([\d.]+)$/); if (m) specs.push({ name: m[1], key: m[2], p: +m[3] });
}
const out = opts.out || 'work/screenshots/site/shots';
const [W, H] = String(opts.size || '1440x900').split('x').map(Number);
fs.mkdirSync(out, { recursive: true });
const args = ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--enable-webgl'];
let browser;
for (const exe of [undefined, '/opt/pw-browsers/chromium']) { try { browser = await chromium.launch({ headless: true, executablePath: exe, args }); break; } catch (e) { if (exe) throw e; } }
const page = await (await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1 })).newPage();
const errors = [];
page.on('console', (m) => { if (opts.log) console.log(`[${m.type()}] ${m.text()}`.slice(0, 300)); if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', (e) => errors.push('[pageerror] ' + e));
await page.goto(opts.url || 'http://localhost:8080/?nointro', { waitUntil: 'load', timeout: 120000 });
await page.waitForFunction(() => window.__aviva && window.__aviva.ready && window.__aviva.scroll, null, { timeout: 120000, polling: 250 });
await page.waitForTimeout(+(opts.first || 3000));
const files = [];
for (const s of specs) {
  const ok = await page.evaluate(({ key, p }) => { const S = window.__aviva.scroll, sec = S.byKey(key); if (!sec) return false; S.scrollTo(S.yOf(sec, p), { immediate: true }); return true; }, s);
  if (!ok) { console.log('no section', s.key); continue; }
  await page.waitForTimeout(+(opts.settle || 2600));
  const file = path.join(out, s.name + '.jpg');
  await page.screenshot({ path: file, type: 'jpeg', quality: 90 });
  files.push({ file, name: `${s.name} (${s.key} ${s.p})` }); console.log(file);
}
await browser.close();
if (errors.length) console.log('PAGE ERRORS:\n  ' + [...new Set(errors)].slice(0, 10).join('\n  '));
if (opts.montage && files.length) {
  const [tw, th] = String(opts.tile || '720x450').split('x'), a = [];
  for (const f of files) a.push('-label', f.name, f.file);
  a.push('-tile', `${opts.cols || 2}x`, '-geometry', `${tw}x${th}+6+6`, '-background', '#d9d8d4', '-pointsize', '18', '-quality', '88', opts.montage);
  execFileSync('montage', a, { stdio: 'inherit' }); console.log('montage ->', opts.montage);
}
