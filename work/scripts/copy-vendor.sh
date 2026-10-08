#!/usr/bin/env bash
# copy-vendor.sh: copy pinned three / gsap / lenis from node_modules into docs/vendor/
# Usage:  bash work/scripts/copy-vendor.sh [DEST]          (default DEST = docs/vendor)
#         MINIFY=0 bash work/scripts/copy-vendor.sh        (plain copy, no minify; default MINIFY=1)
# Needs: `npm install` done (node_modules present). Minify uses esbuild (npx --yes esbuild), falls back to plain copy if unavailable.
# Licence headers (/*! ... @license ... */) are kept by esbuild --legal-comments=inline (GSAP's licence forbids removing notices).
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
NM="$ROOT/node_modules"
DEST="${1:-$ROOT/docs/vendor}"
MINIFY="${MINIFY:-1}"
ESBUILD_VERSION="${ESBUILD_VERSION:-0.28.2}"

# --- addons we expect to use (path relative to node_modules/three/examples/jsm). Transitive imports are added below. ---
ADDONS=(
  environments/RoomEnvironment.js
  postprocessing/EffectComposer.js
  postprocessing/RenderPass.js
  postprocessing/ShaderPass.js
  postprocessing/OutputPass.js
  utils/BufferGeometryUtils.js
  shaders/HorizontalBlurShader.js
  shaders/VerticalBlurShader.js
  misc/GPUComputationRenderer.js
  math/ImprovedNoise.js
  # optional extras (uncomment when a section needs them):
  # postprocessing/SMAAPass.js
  # postprocessing/UnrealBloomPass.js
  # math/SimplexNoise.js
  # loaders/GLTFLoader.js
)

mkdir -p "$DEST/three/addons" "$DEST/gsap" "$DEST/lenis"

# esbuild availability
ESB=""
if [ "$MINIFY" = "1" ]; then
  if [ -x "$ROOT/node_modules/.bin/esbuild" ]; then ESB="$ROOT/node_modules/.bin/esbuild"
  elif npx --yes "esbuild@$ESBUILD_VERSION" --version >/dev/null 2>&1; then ESB="npx --yes esbuild@$ESBUILD_VERSION"
  else echo "esbuild unavailable, copying unminified"; fi
fi

put() { # put SRC DEST_FILE
  mkdir -p "$(dirname "$2")"
  if [ -n "$ESB" ] && [[ "$1" == *.js || "$1" == *.mjs ]]; then
    $ESB "$1" --minify --format=esm --target=es2020 --legal-comments=inline --log-level=error --outfile="$2"
  else cp "$1" "$2"; fi
}

# --- three ---
put "$NM/three/build/three.module.js" "$DEST/three/three.module.js"
put "$NM/three/build/three.core.js"   "$DEST/three/three.core.js"
cp "$NM/three/LICENSE" "$DEST/three/LICENSE"

# transitive addon imports (relative './x.js' or 'three/addons/x.js')
JSM="$NM/three/examples/jsm"
RESOLVED=$(node --input-type=module - "$JSM" "${ADDONS[@]}" <<'JS'
import fs from 'node:fs'; import path from 'node:path';
const [root, ...entries] = process.argv.slice(2); const seen = new Set();
const walk = (f) => { f = path.resolve(f); if (seen.has(f)) return; if (!fs.existsSync(f)) { console.error('MISSING ' + f); process.exit(1); }
  seen.add(f); const s = fs.readFileSync(f, 'utf8'); const re = /(?:import|export)\s[^'"]*?from\s*['"]([^'"]+)['"]|import\s*['"]([^'"]+)['"]/g; let m;
  while ((m = re.exec(s))) { const x = m[1] || m[2]; if (x === 'three') continue;
    if (x.startsWith('three/addons/')) walk(path.join(root, x.slice(13))); else if (x.startsWith('.')) walk(path.join(path.dirname(f), x)); else { console.error('UNRESOLVED ' + x + ' in ' + f); process.exit(1); } } };
entries.forEach((e) => walk(path.join(root, e))); [...seen].forEach((f) => console.log(path.relative(root, f)));
JS
)
for rel in $RESOLVED; do put "$JSM/$rel" "$DEST/three/addons/$rel"; done

# --- gsap (ES modules; core + CSSPlugin + ScrollTrigger + Observer) ---
for f in index.js gsap-core.js CSSPlugin.js ScrollTrigger.js Observer.js; do put "$NM/gsap/$f" "$DEST/gsap/$f"; done
cat > "$DEST/gsap/LICENSE.txt" <<LIC
GSAP $(node -p "require('$NM/gsap/package.json').version") - GreenSock Animation Platform
Copyright 2008-2026 GreenSock. Licensed under the Standard "No Charge" GSAP License (Webflow),
effective April 30, 2025: https://gsap.com/standard-license
Free for use on any website/web app, including commercially. Restrictions: no use in tools that let users
build visual animations without code that compete with Webflow's visual animation builder; no reverse
engineering to create such products; do not remove or alter proprietary notices (the /*! @license */ headers
in the .js files in this folder must stay intact). The URL above is the authoritative text.
LIC

# --- lenis ---
put "$NM/lenis/dist/lenis.mjs" "$DEST/lenis/lenis.mjs"
cp "$NM/lenis/dist/lenis.css" "$DEST/lenis/lenis.css"
cp "$NM/lenis/LICENSE" "$DEST/lenis/LICENSE"

echo "vendor copied to $DEST (minify=$([ -n "$ESB" ] && echo yes || echo no))"
( cd "$DEST" && du -sh . && find . -type f | sort | xargs wc -c | tail -40 )
