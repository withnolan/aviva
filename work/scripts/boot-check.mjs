#!/usr/bin/env node
// boot-check.mjs: does the site still boot its 3D world with the current docs/js/paper/? (decision #45: the paper
// module must be bootable at every save). Loads the site and the lab's hero rest state, waits for each to settle and
// fails (exit 1) on any page error, on the static fallback (html.no-webgl) or on a missing world.
//
//   node work/scripts/boot-check.mjs                       # http://localhost:8080
//   node work/scripts/boot-check.mjs --base http://localhost:8091 --lab "state=herorest"
import { chromium } from 'playwright';
import fs from 'node:fs';

const argv = process.argv.slice(2);
const opt = (k, d) => { const i = argv.indexOf('--' + k); return i >= 0 && argv[i + 1] !== undefined ? argv[i + 1] : d; };
const base = opt('base', 'http://localhost:8080').replace(/\/$/, '');
const labQ = opt('lab', 'state=herorest');
const skipSite = argv.includes('--no-site');

async function launch() {
  const args = ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--enable-webgl'];
  const cands = [undefined, process.env.CHROME_PATH, '/opt/pw-browsers/chromium', '/usr/bin/chromium'];
  let err;
  for (const exe of cands) { if (exe && !fs.existsSync(exe)) continue; try { return await chromium.launch({ headless: true, executablePath: exe, args }); } catch (e) { err = e; } }
  throw err;
}

const browser = await launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
let failed = false;
const report = (name, ok, detail) => { console.log(`${ok ? 'OK  ' : 'FAIL'} ${name}${detail ? '  ' + detail : ''}`); if (!ok) failed = true; };

async function check(name, url, ready, state) {
  const page = await ctx.newPage(), errors = [];
  page.on('pageerror', (e) => errors.push('[pageerror] ' + String(e).slice(0, 300)));
  page.on('console', (m) => { if (m.type() === 'error' && !/favicon|404 \(File not found\)/.test(m.text())) errors.push('[console] ' + m.text().slice(0, 300)); });
  const t0 = Date.now();
  try {
    await page.goto(url, { waitUntil: 'load', timeout: 90000 });
    await page.waitForFunction(ready, null, { timeout: 90000, polling: 250 }).catch(() => {});
    const s = await page.evaluate(state);
    const ok = !errors.length && s.ok;
    report(name, ok, `${((Date.now() - t0) / 1000).toFixed(1)}s ${JSON.stringify(s)}${errors.length ? '\n     ' + errors.join('\n     ') : ''}`);
  } catch (e) { report(name, false, String(e).slice(0, 300)); }
  await page.close();
}

if (!skipSite) {
  await check('site', base + '/',
    () => (window.__aviva && (window.__aviva.ready || window.__aviva.world)) || document.documentElement.classList.contains('no-webgl'),
    () => { const fb = document.documentElement.classList.contains('no-webgl'); const w = !!(window.__aviva && window.__aviva.world); return { ok: !fb && w, fallback: fb, world: w }; });
}
await check('lab ' + labQ, `${base}/lab/paper.html?${labQ}`, () => window.__ready === true, () => ({ ok: window.__ready === true }));
await browser.close();
process.exit(failed ? 1 : 0);
