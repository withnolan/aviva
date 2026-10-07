# aviva — PROGRESS

If you lose context: `git pull`, then read this file and `work/decisions.md`, and carry on from "Next step".

Branch: `claude/elegant-curie-dduigw` → PR into `main` (user merges).

## Environment (checked 2026-10-01, Phase 0)
| Resource | Reachable? | Notes |
|---|---|---|
| https://oryzo.ai (live site) | **No** (proxy 403 / ERR_TUNNEL_CONNECTION_FAILED) | Team works from `reference/VIDEO_NOTES.md` + 84 frames in `reference/oryzo-frames/`. |
| https://blog.lusion.co (Oryzo BTS series) | **No** (egress blocked, curl + WebFetch) | Use WebSearch snippets only; say so in reports. |
| github.com / raw.githubusercontent.com | Yes | `lusionltd/ORYZO-1` cloned to `work/oryzo-1-repo/` (git-ignored, read only). three.js / gsap / lenis source + examples readable on GitHub. |
| api.github.com via curl | No (403) | Use the GitHub MCP tools for PRs. |
| npm registry | Yes | three 0.186.1, gsap 3.15.0, lenis 1.3.26 (latest on 2026-10-01). |
| Google Fonts (fonts.googleapis.com + fonts.gstatic.com) | Yes | Font files can be self-hosted in `docs/assets/fonts/`. |
| WebSearch | Yes | Returns result snippets/titles; most target sites are blocked for WebFetch. |
| WebFetch (wikipedia, threejs.org, …) | **Mostly no** | Egress proxy blocks most hosts. Researchers rely on WebSearch + GitHub-hosted sources + node_modules docs. |
| Local tooling | Yes | `npm install` done; `npm run serve` on :8080; `tools/shoot.mjs` works with software WebGL (SwiftShader). |

## Phase checklist
- [x] **Phase 0 — Setup**: mission saved, folders, npm install, shoot tool verified, network checked, ORYZO-1 repo cloned, commit + push, draft PR (#1).
- [x] **Phase 1 — Discovery**: reference teardown (reference-analyst), paper + parody research (web-researcher A), tech research (web-researcher B). Lead reviews all three.
- [x] **Phase 2 — Concepts**: 3 concepts (creative-director), lead scores + chooses.
- [ ] **Phase 3 — Brief, look-dev, skeleton**: creative brief; then in parallel design system + paper look-dev, technical skeleton, fact-check. Lead iterates paper look until it's clearly real.
- [ ] **Phase 4 — Build**: sections in chunks, screenshots between chunks.
- [ ] **Phase 5 — Review loops** (3–6 rounds): fidelity + similarity, creative, visual → fix list → fixes.
- [ ] **Phase 6 — Final QA + hand-over**: QA run, README, CREDITS, LICENSE, `git rm -r reference`, PR ready.

## Log
- 2026-10-01 — Phase 0 done. Placeholder `docs/index.html`; `docs/.nojekyll`; `work/reviews/`. Draft PR: https://github.com/RelentlessYunn/aviva/pull/1 (now https://github.com/withnolan/aviva/pull/1)
- 2026-10-01 — Pinned three 0.186.1 / gsap 3.15.0 / lenis 1.3.26 as devDependencies (exact). Phase 1 launched.
- 2026-10-01 19:12 UTC — All three Phase 1 agents hit an API usage limit before writing anything; resumed after the reset with their context intact, and told to write their files incrementally.
- 2026-10-01 — Research A accepted (sourced, confidence-tagged). Teardown accepted (measured 63 vh scroll map, 54 signature elements, 48-item checklist). Collision decisions #7–#10 logged (no fold-to-encrypt, no blank-A4 weights, no power-draw card, no Pro Max/glowing pills). Concepts brief sent.
- 2026-10-01 — Tech research accepted, with a working prototype in `work/scripts/paper-proto/` (folds, dart plane, halving, tear, crumple, pencil, ink front, picking, contact shadow) and a tested import map + `work/scripts/copy-vendor.sh`. Look-dev targets logged (#12). **Phase 1 complete.**
- 2026-10-02 07:10 UTC — Creative-director hit a usage limit after writing Concept A; partial file committed; agent resumed for B, C and the comparison.
- 2026-10-02 — Concepts A/B/C in `work/03-concepts.md`. Lead scores A 43.5 · C 41.5 · B 39.5. **Chosen: Concept A "Void of All Characters" (aviva A4, "Pre-trained on nothing.")** with 5 enrichments (decisions #14). **Phase 2 complete.**
- 2026-10-02 — Research §13 added: ISO 216 A0–A10 table, derived numbers re-checked (all correct), EU rate → use 75.1 % (2024) not 79.3 %, Dias & Arroja 2012 carbon, Guinness paper rules (≤ A4, ≤ 100 g/m²), Locke verbatim (1689/1690), Rauschenberg 'about a month' (his words), pencil/eraser facts. Corrections forwarded to the creative-director.
- 2026-10-02 — Creative brief accepted (`work/04-creative-brief.md`, 1,189 lines, ≈ 58 vh). Decisions #16–#20. Phase 3 parallel tasks launched.
- 2026-10-02 — **Paused by the user**: all four Phase 3 agents (paper look-dev, design system, skeleton, brief fact-check) were stopped from the user's side. Partial work committed as WIP: `docs/vendor/` (copy script ran), `docs/css/tokens.css` (provisional), `docs/js/paper/textures.js`, `docs/js/paper/crumple-grid.js`, `work/scripts/crumple/`, `work/scripts/design/`. No fact-check file was written yet.
- 2026-10-02 12:50 UTC — User said continue. The stopped agents could not be resumed, so four fresh agents were launched with standalone briefs that build on the partial files: paper look-dev (VD #1), design system (VD #2), skeleton (WD), brief fact-check (WR). Local server restarted on :8080.
- 2026-10-02 — Brief fact-check done (`work/reviews/brief-factcheck.md`, ~78 claims, 14 must-fixes: one-direction 'six folds' (alternate allows 7 on A4; lead verified), Priestley wording, 'Nothing else does', distillation wording, 'nearly doubled', 5–7 cycles hedge, ±2.5 %, Cai Lun materials, 'oldest surviving', Sellen & Harper 2002, paper-cut cite, A10 rounding, Fangmatan map, CO₂e figure). Part 8 reference details confirmed. Sent to the creative-director.
- 2026-10-02 — Brief updated with all fact-check corrections; **Part 9 changelog** (51 entries, old → new, grouped by owner). Web-developer and design-system designer told to apply 9.1 / 9.2.
- 2026-10-02 → 10-07 — VD #1, VD #2 and WD hit the API usage limit mid-task; their partial work was committed on 2026-10-07 (paper module files, lab, icons, logo, favicons, CSS, index.html in progress).
- 2026-10-07 — Found the user's GitHub account renamed RelentlessYunn → withnolan (decision #21). PR: https://github.com/withnolan/aviva/pull/1. Live URL will be https://withnolan.github.io/aviva/. Server restarted; agents resumed.

## Running now
- visual-designer #1 → paper module `docs/js/paper/`, lab `docs/lab/paper.html`, `work/05b-paper-module.md`, contact sheet `work/screenshots/lab/contact-final.jpg`
- visual-designer #2 → tokens (final), fonts, print.css, 2D assets, `docs/research/` PDF + .bib + .obj, `work/05-design-system.md`, `docs/lab/styleguide.html`
- web-developer → technical skeleton (index.html with all copy, Lenis+ScrollTrigger, fixed canvas, placeholder sheet through all sections, fallback, reduced motion)

## Next step
- Judge the paper look-dev myself (contact sheet) and iterate until it's clearly real. Send fact-check corrections to the creative-director (new agent; brief owner). Review the skeleton screenshots. Then Phase 4.
