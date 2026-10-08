// launch.mjs: start headless Chromium the way tools/shoot.mjs does (software WebGL via SwiftShader).
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
export async function launch() {
  const args = ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--enable-webgl'];
  const candidates = [undefined, process.env.CHROME_PATH];
  const pwb = process.env.PLAYWRIGHT_BROWSERS_PATH;
  if (pwb && fs.existsSync(pwb)) {
    candidates.push(path.join(pwb, 'chromium'));
    for (const d of fs.readdirSync(pwb).filter((d) => d.startsWith('chromium-'))) for (const sub of ['chrome-linux/chrome', 'chrome-linux64/chrome']) candidates.push(path.join(pwb, d, sub));
  }
  candidates.push('/opt/pw-browsers/chromium', '/usr/bin/chromium', '/usr/bin/chromium-browser', '/usr/bin/google-chrome');
  let lastErr;
  for (const exe of [...new Set(candidates)]) {
    if (exe && !fs.existsSync(exe)) continue;
    try { return await chromium.launch({ headless: true, executablePath: exe, args }); } catch (e) { lastErr = e; }
  }
  throw lastErr;
}
