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

## Working rules
- **Pause/resume (decision #22):** on the user's "stop", pause running agents via SendMessage (finish step, save, report, end turn); on "continue", resume the same agents via SendMessage. Don't launch new agents for paused work.
- **Lean plan (decision #23):** 2 build chunks; 3 review rounds (round 1 = 3 reviewers, rounds 2–3 = 1 combined reviewer); Sonnet for fact-checks and small fixes; fewer screenshots; the lead does trivial fixes directly.

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
- 2026-10-07 — **Paused by the user again**: skeleton, design-system and paper agents stopped from the user's side. Partial work committed (paper module in progress incl. texture rewrite, lab, illustrations, icons, logo, favicons, CSS, index.html in progress, sheet adapter not yet written).
- 2026-10-08 — **Milestone: the site boots and scrolls end to end on the real paper module** (0 console errors, 1.52 MB first load, all 16 sections reached, grounds per #24). Research PDF built (8 pages). Lead notes for Phase 4: hero show-through 'i' not visible yet; s04 body text overlaps the numerals; s07 macro reads as beige texture; s14 golden light too orange; phone horizontal overflow (nav clipped).
- 2026-10-07 17:12 UTC — User said continue. Inventory: skeleton has index.html + CSS + choreo/state/scene/adapter/placeholder but no main.js/scroll/ui/interactions/fallback (why the page sits on the loader); design system has tokens/fonts/print/icons/logo/illustrations/05 doc but no styleguide or PDF; paper module ~2k lines mid texture rewrite. Relaunched 3 agents with 'what's left' briefs; WD's first priority is a scrollable page wired to the real paper module.

## Running now
- **Running (2026-10-08 16:20 UTC, resumed after the usage-limit reset):** creative-director → brief Part 10 (#27–#31: AI flip, Pro tiers, PDF rename, AVIVA caps, folded-letter hero); WD → reduced-motion bug, retests, CSS notes (Part 10 later); paper VD → crumple install, stack API, letter-fold presets A/V/I, effects, contact sheet; design VD → print.css, AVIVA caps logo/wordmark, PDF (Part 10 later).
- Earlier pause notes: Next: creative-director applies `work/04b-ai-flip-plan.md` to the brief + Part 10 (decision #29: credits, grounds note, PDF rename). WD: reduced-motion invisibility bug → re-run interactions → 768/fps shoots (and adopt design VD's CSS notes: ruler backing, .hl in labels, claim gap ≥ 40 px, .kb-line minmax, hide .print-only; paint.js mip bug goes to the paper VD). Paper VD: install f1 crumple (copy in work/scripts/crumple/out/) → check → stack API → boat/folds/tear/ink/macro → contact sheet + docs; fix PaintLayer.clear() mipmaps. Design VD: print.css → rebuild PDF → 05 §11. Was running: creative-director → AI flip + Pro tiers (brief Part 10 changelog); WD, paper VD (+ stack API) and design VD resumed on their next steps. When Part 10 lands, route it to WD (copy + s12 tiers) and design VD (PDF text).
- Earlier pause notes: Next steps: WD → phone overflow + phone overlaps, interactions.mjs, 768/fps shoots. Paper VD → crumple phase-2 bake from the fold packet, boat, folds/tear/ink/macro checks, contact sheet, README/05b. Design VD → 6 styleguide fixes, print/icon checks, 05 §11. (Older notes below.)
  - web-developer: written scroll.js, ui.js, interactions.js, grounds.js, adapter (real module default), config (FEATURES flags). Next: world.js → main.js → fallback.js + states.css → CSS edits (pencil, dims, grain) → index.html data-ground per #24 (+ remove wrong data-ground on s08 cards) → 404 → shoot + interaction script.
  - visual-designer (paper): new textures, edge, 3-lobe contact shadow, grounds + charcoal/grey presets, pencil.js (HB yellow), paint.js (GPU pencil + ghost), crumple bake (183 KB). Next: pencil darkness, s03 lamp colour, charcoal gradient, tooth strength → crumple shading → boat, folds, tear, ink, macro → contact sheet + README/05b.
  - visual-designer (design): tokens v2 (charcoal, greys, pencil, blueprint, highlighters; all AA), 05 doc §2.1/§9.18–9.20, marks SVGs, paper fonts, paper.html/css written. Next: paper.js → build-paper.mjs → recolour figures → Figure 5 → render 8 pages and iterate → styleguide → print/icon checks. Decision #25 on typesetting.

## Next step
- Judge the paper look-dev myself (contact sheet) and iterate until it's clearly real. Send fact-check corrections to the creative-director (new agent; brief owner). Review the skeleton screenshots. Then Phase 4.
