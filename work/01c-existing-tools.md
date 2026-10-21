# 01c: Existing tools that could shortcut the remaining work

**Verdict:** Almost nothing is worth adopting. The only real shortcuts are Origami Simulator (an offline tool for the origami meshes, not code to ship) and the Lenis README snippet (to check our scaffold). Everything else is "build ourselves" or a marginal helper.

Method: 12 searches and 6 GitHub page opens. Non-GitHub hosts could not be opened, so claims about them come from search snippets only. Repo pages showed no commit dates, so "health" below is "date unknown" unless stated.

## 1. Crumpled paper ball. Build ourselves.
- Found no free mesh. Every crumpled-paper ball model was paid (Superhive $9 royalty-free, TurboSquid $29, Gumroad $5+) or only a material (Womp, CC0 but no mesh download seen). None is CC0 with a glb.
- Technique notes from the three.js forum (threads found by search, not opened): `displacementMap` moves vertices along the normal only, and normals go stale after any vertex displacement. Recompute normals by finite differences, or perturb them in the fragment shader.
- My own suggestion, not from a source: ridged noise (`1.0 - abs(n)`) or Worley (cellular) noise gives facets instead of pillows. Stefan Gustavson's cellular noise is MIT.
- Recommendation: **Build**, with an icosphere of about 6 subdivisions, facet-style displacement and a baked normal map. Don't spend more time searching assets.

## 2. Origami meshes (boat, dart plane). Adapt (offline), or hand-build.
- **Origami Simulator** (amandaghassaei/OrigamiSimulator, https://github.com/amandaghassaei/OrigamiSimulator): MIT, 611 commits (last commit date not shown). It takes an SVG or FOLD crease pattern and exports the folded state as **OBJ or STL**. It runs in the browser on three.js, so it is a heavy app and should not ship in our site.
  - Use it as an offline tool only: load a pattern, set the fold percent, export an OBJ at several fold percentages, then decimate by hand or script. The fold percent is one slider across all creases, not a sequence. A dart plane needs sequential folds, so our own hinge-fold module is probably still the right tool for the sequence.
  - It lists an "Examples" menu, but I could not confirm a boat or a dart plane in it. Its crane is confirmed.
- No CC0 boat model was found. The boat and plane assets on CGTrader, Superhive and RenderHub are paid; OpenGameArt's only boat is CC-BY-SA and is not origami. Jun Mitani's crease-pattern page (Tsukuba) has no boat, and its licence is unclear (CC BY 4.0 vs BY-NC 4.0).
- Recommendation: **Build** the boat and plane from our existing folds module. A boat is about 12 to 30 faces. **Adapt** Origami Simulator only if the team wants a physically plausible intermediate pose. Check the output licence (the MIT code does not affect the models you make).

## 3. Paper-fibre macro / ink-bleed shader. Build ourselves.
- Found only partial, unlicensed Godot shaders (godotshaders.com "Retro Parchment Paper" and "Ballpoint shader") and an unfinished Khronos forum thread on ink diffusion. No usable licence and no GLSL fit.
- Idea worth stealing (the technique, not the code): fibre = `pow(sin(warpedNoise), n)`, and ink bleed = a soft noisy halo around dark pixels.
- Recommendation: **Build** it as a fragment-shader or canvas-texture post step in our paint layer.

## 4. Lenis + ScrollTrigger + three scaffold. Use the official snippet, not a template.
- Lenis README (https://github.com/darkroomengineering/lenis), MIT, version 1.3.26 matches ours:
  `lenis.on('scroll', ScrollTrigger.update); gsap.ticker.add(t => lenis.raf(t*1000)); gsap.ticker.lagSmoothing(0);`
- Pitfalls from the README via search: no second `requestAnimationFrame` loop for Lenis, no `scrollerProxy` (Lenis scrolls the document), and clean up both the ticker callback and the Lenis instance.
- Only template found: **awwwards-3d** (tsogjavklann/awwwards-3d, MIT, 24 stars, 4 commits, single-file HTML). It pins three r170, GSAP 3.12.5 and Lenis 1.1.0, so it is stale against our versions, and it is a Claude Code skill rather than a scaffold. Not worth adopting. The Codrops 3D scroll tutorials use ScrollSmoother, not Lenis.
- Recommendation: **Use** the README snippet verbatim. Our existing code should be checked against the pitfalls above. **Build** the rest.

## 5. HTML to PDF two-column academic template. Adapt CSS only.
- **PubCSS** (thomaspark/pubcss, https://github.com/thomaspark/pubcss): MIT, 26 commits (date not shown). It has ACM SIG, ACM SIGCHI and IEEE conference two-column templates with automatic section and figure numbering. Its PDF step needs **Prince**, which is free only for non-commercial use. Whether the CSS renders correctly under Chromium `page.pdf()` is **unverified**: it may use Prince-only properties.
- Recommendation: **Adapt** the IEEE CSS as a starting point if a quick Playwright test renders it cleanly. Otherwise **Build** with `column-count: 2`, `@page` margins and `break-inside: avoid`. That is about 60 lines. paged.js and `pagedown` (R package, MIT) add a build or runtime dependency we don't need.

## 6. Claude Code skills / plugins. Marginal. Skip unless a specific problem appears.
- **kndoshn/threejs-skill-plugin** (https://github.com/kndoshn/threejs-skill-plugin): MIT, 3 stars, 1 commit. It has a three.js skill, about 18 reference files and diagnostic scripts (`three-doctor.mjs`, `asset-audit.mjs`). The install is a copy into `.claude/skills/`. The risk is token cost: more context for the agents, and it is tuned for generic Vite apps, not our import-map setup.
- **Anthropic `frontend-design` plugin**: first-party, installed with `/plugin install frontend-design@claude-code-plugins` (per search snippets; not opened). It is about generic UI design and risks pulling us toward templated looks, against our "never templated" rule.
- I found no MCP server for WebGL or design review. `tools/shoot.mjs` already covers visual checks.
- Recommendation: **Don't adopt**. If we want one, take `three-doctor.mjs` and `asset-audit.mjs` as read-only checkers, not the full skill.

## Summary table
| Need | Call |
|---|---|
| 1 Crumpled ball | Build |
| 2 Origami meshes | Build (Adapt Origami Simulator offline if wanted) |
| 3 Fibre/ink shader | Build |
| 4 Scroll scaffold | Use Lenis README snippet; Build the rest |
| 5 PDF paper template | Adapt PubCSS IEEE CSS, or Build |
| 6 Skills/plugins | Skip |
