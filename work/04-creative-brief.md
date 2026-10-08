# 04: Creative brief, aviva A4 "Void of All Characters"

Author: creative-director · Concept chosen by the lead: decision #14 (Concept A, with 5 enrichments).
**This file is the single source of truth for every word on the site and every scene.** The web-developer builds the scroll timeline from Part 2 and maps the copy ids in Part 3 onto the DOM. The visual-designer works from Part 5. Nothing in this file is a placeholder: where a value depends on someone else (the typeface, exact hex values), the brief says who decides it.

Fact tags: `R§x.y` = section of `work/01-research.md`; confidence `high` / `med` / `derived` (arithmetic, re-run in the fact-check). **R§13** = the ISO 216 table the researcher is adding now (A3, A5, A6 dimensions); until it lands, every R§13 value is marked *(R§13 pending)*. `low` items are never used.

Contents: 1 Brand · 2 Section plan · 3 Final copy · 4 The research paper · 5 Visual direction · 6 Moments of delight · 7 Do-not-reuse check · 8 Needs and resolved questions.

---

## Part 1. Brand

| | |
|---|---|
| **Brand** | **aviva**: always lowercase, even at the start of a sentence and inside UPPERCASE labels ("INTRODUCING aviva A4"). The lowercase is part of the logotype. |
| **Model name** | **aviva A4.** The version number is the paper size. The family is the A-series: **aviva A5** (distilled), **aviva A6** (distilled again), **aviva A3** (twice the context window). A0 appears only in the paper and the specs. |
| **Tagline** | **Pre-trained on nothing.** |
| **Positioning line** | A foundation model with nothing on it. |
| **The one-sentence story** | John Locke described the newborn mind as "white paper, void of all characters" (*An Essay Concerning Human Understanding*, published December 1689 with 1690 on the title page; R§13.6 · R§13.10 #15: high for both the wording and the year). We built it, launched it like a frontier model, and let the visitor supply the only training data it will ever get. |

### Personality
Calm, exact, reverent, unhurried. The voice is a keynote narrator who sincerely believes blankness is the ultimate feature and has the measurements to prove it. It is quietly certain and a little smug, the way a perfectly made object is. It never jokes about itself, never apologises and never explains the joke.

### Voice rules

**Do**
- Short declaratives, 3–8 words. Let a full stop do the comic timing.
- **Claim → literal proof → undercut**, with the undercut as its own short sentence: "Tear aviva in half: two smaller models, the same shape, the same knowledge. None."
- Exact numbers with units and real typography: `210 × 297 mm` (multiplication sign), `80 g/m²`, `0.1 mm`, `4.99 g`, ranges with an en dash (`5–7`), percentages with a space (`0.0 %`, ISO style), `BCE` / `CE`.
- AI-launch vocabulary used with total sincerity: base model, foundation model, inference, prompt, output, context window, distil, fine-tune, release notes, arena, leaderboard, hallucination, refusal rate, alignment.
- British spelling: fibre, colour, centre, metre, distil, recognise.
- Real facts stated plainly and sourced (CLAUDE.md rule 8). The facts are the setup, and the product is the punchline.
- One quiet, sincere beat at the very end ("Fine-tuned on you.").

**Don't**
- No exclamation marks, emojis, "lol", "just kidding" or rhetorical winks.
- No puns for their own sake. A word may carry two meanings only if both are true ("void of all characters", "open weights").
- No self-deprecation, no "it's just paper", no "we know this is silly".
- No questions to the visitor, except the prompts that are part of the fiction.
- No calling the product "paper" in display copy: it is "aviva" or "the sheet". "Paper" appears only in facts and in "The paper" (the research).
- Never more than one accent-coloured phrase per screen.

### Words we use
sheet · blank · white · A4 · 210 × 297 mm · 80 g/m² · 0.1 mm · 4.99 g · fibres · grain · edge · fold · tear · ink · pencil · eraser · ream · margin · verso · prompt · output · base model · foundation model · inference · context window · distil · fine-tuned · release notes · arena · leaderboard · hallucination · refusal rate · alignment · open weights · regenerate · released

### Words we never use
- **ORYZO's punchlines (R§7.6):** wearable, circular, encryption, antislip, grip, thermal, runs on, always on, drop-tested, legacy support, non-existent product, coaster, cork.
- **Launch clichés:** unleash, elevate, seamless, game-changer, revolutionary, unlock, supercharge, empower, cutting-edge, next-gen, magic / magical, AI-powered, "choose your own".
- **Banned claims and words (decisions #9, #10):** power, battery, uptime, "0 W", "Pro Max", "coming soon", "trust me".
- **As a display word:** "sustainability".

### Typography conventions for copy (the visual-designer picks the face)
- **Headlines:** sentence case.
- **Small labels:** UPPERCASE (eyebrows, nav, buttons, captions, metadata).
- **Body:** sentence case.
- **Numbers:** tabular figures in counters, readouts and tables.
- **Body length:** no body block longer than 4 lines at 1440 px (≈ 35 words). Where a line breaks badly at 390 px, Part 3 gives a mobile variant (`.m`).

---

## Part 2. Section plan

### Final page order (≈ 58 vh total; ORYZO ≈ 63 vh)

| # | id | Section | vh | Pinned | Ground | ORYZO beat it answers (teardown §2 row) |
|---|---|---|---|---|---|---|
| 0 | `s00-loader` | Loading nothing | 0 (≈ 2.2 s) | (none) | white | 1 Loader |
| 1 | `s01-hero` | Every great product… | 1.5 | (none; time-driven intro) | white | 2 Hero |
| 2 | `s02-thin` | 0.1 mm. | 3 | yes | white | 3 Rotation |
| 3 | `s03-intelligence` | Intelligence not included. | 6 | yes | white | 4 "Powered by AI" |
| 4 | `s04-outputs` | 4.99 g / Selected outputs | 8 | yes | white | 5 Fly-through type + gallery |
| 5 | `s05-architecture` | Halve it. / Distil it. | 5 | yes | white | 9 Precision claim + 10 Gimmick (merged) |
| 6 | `s06-release-notes` | Release notes. | 4 | (none) | white | **new** (a features-type beat) |
| 7 | `s07-surface` | No glue. / Absorption / **The Bleed** | 4.5 | yes | white → ink-blue | 11 Macro + 8 Alternate vision (merged) + 6 Signature |
| 8 | `s08-afterlife` | It comes back. | 3 | (none) | ink-blue | 12 Sustainability |
| 9 | `s09-reviews` | Rated in corners. | 4 | (none) | ink-blue | 13 Testimonials |
| 10 | `s10-arena` | The Arena. | 3 | yes | ink-blue → white | **new** |
| 11 | `s11-claims` | Claims | 7 | yes (horizontal) | white | 14 Claim gallery |
| 12 | `s12-sizes` | One shape. Three sizes. | 4 | yes | white | 15 Tiers + comparison |
| 13 | `s13-paper` | The paper. | 2 | (none) | white | 16 Academic |
| 14 | `s14-release` | Fine-tuned on you. / Release it. | 2.5 | yes | white | 17 Ending CTA |
| 15 | `s15-footer` | Footer + colophon | 0.5 | (none) | white | 17 Footer |

**Totals:**
- **Pinned beats:** 9.
- **Long beats:** 8 (s04), 7 (s11), 6 (s03), 5 (s05).
- **Short beats:** everything else, 0.5–4.5 vh.
- **Product visibility:** the sheet, or the hanging outputs, is on screen in ≈ 95 % of the scroll. It's absent only in s13 and s15. In s11 it waits behind the cards, and every card shows a render of it.

ORYZO row 7 (desk with coffee cup) is **dropped**. Row 6 (magazine) is **replaced** by our signature transition, The Bleed, inside s07.

### Order and deviations from the KEEP rhythm (enrichment 3)
The mission's rhythm is: hero → AI moment → portability → features with fake-precise metrics → interactive gimmick → material macro → sustainability → testimonials → claim gallery → tiers + comparison → academic → CTA → footer. Our order keeps it exactly, with four documented deviations:
1. **s05 merges "features with metrics" with the gimmick.** The √2 metrics (1 : √2, 1/16 m², 11 sizes) are the claim, and tearing the sheet is the proof of the same claim. Splitting them would state the joke twice.
2. **s06 Release notes (new) sits between the gimmick and the macro.** It's a features-type beat in changelog form, with dates, versions and specs. Its v2.0 entry back-lights the sheet, and the section ends with the camera moving onto the surface, so it hands over straight into the macro.
3. **s07 merges the macro with the alternate vision**, and places the alternate vision after the gimmick rather than before it (ORYZO had the thermal beat before its flip). Our alternate vision is an ink-absorption view at fibre scale, so it can only happen inside the macro. It also triggers The Bleed, which needs the camera already at fibre level.
4. **s10 The Arena (new) sits between the testimonials and the claim gallery.** The progression is social proof → head-to-head preference test → claims. The Arena's winning sheet also carries the page back from ink-blue to white, just as the claim gallery begins.

"It comes back" (sustainability) sits **before** the testimonials, on the ink-blue ground straight after The Bleed, as the lead asked.

### 2A. Purpose, joke, interaction, ORYZO echo (page order)

| id | Purpose | Joke mechanism | vh · pin | Visitor interaction (pointer / keyboard / touch) | ORYZO technique echoed (teardown §2 row · §9 checklist #) |
|---|---|---|---|---|---|
| `s00-loader` | Cover loading; signal "this was designed"; set up the one match-cut | A print-shop drawing of an object with nothing on it, measured to the millimetre. The loader label: "LOADING NOTHING". | 0 · (none) | None (not skippable until assets are ready; focus lands on the skip-link afterwards) | Row 1, T1 drawing → object match-cut · #41 |
| `s01-hero` | Brand, premise, first look at the sheet | The design-process cliché "we started with a blank sheet of paper", taken literally and stopped there | 1.5 · (none) | None (the first scroll reveals line 2 if the timed reveal hasn't fired yet) | Row 2 giant logotype + reveal + side copy · #11, #13, #17 |
| `s02-thin` | Strip the context; show the object alone | The superlative "thinnest ever" is literally true, and the product nearly disappears | 3 · yes | None | Row 3 scroll rotation with copy · #9, #10, #16 |
| `s03-intelligence` | The AI-hype beat | The intelligence is supplied by the user; the model's answer is your own writing ("Answer: see above."); Regenerate crumples it and returns the same answer | 6 · yes | **Draw** with the pencil cursor. **Erase** (toggle). **Regenerate**. Keyboard: "Type a line" + Enter → a pre-baked pencil stroke. Touch: "Draw" toggle (locks scroll while drawing), "Done" | Row 4 AI moment · #31, #32 |
| `s04-outputs` | Portability → gallery | "Open weights", weighed. Then a gallery of beautifully lit outputs: most are blank, three are literal folds | 8 · yes | None (hovering near a hanging output makes it sway towards the cursor) | Row 5 type fly-through + horizontal gallery · #7, #13, #23, #40 |
| `s05-architecture` | Features with fake-precise metrics + the interactive gimmick | √2 is real, so halving keeps the shape. Distillation keeps "everything it knows", which is nothing. "Below A6, it's confetti." | 5 · yes | **Drag along the dotted line** to tear (twice). Keyboard: "Hold to tear" (hold Space or Enter). Touch: drag, or press and hold the button | Rows 9 + 10 · #32, #33 (a draggable scrub that isn't an arc slider), #10 |
| `s06-release-notes` | Features as history; set up the macro | 2,200 years of paper as a software changelog, with semantic versions and a "known issue" | 4 · (none) | None (links in entries are not needed) | Floating product while DOM scrolls (§3.13 technique) · #36 |
| `s07-surface` | Material macro + alternate vision + **signature** | "No glue. Just attraction." (hydrogen bonds). "Absorption: total." Then the ink takes over the page. | 4.5 · yes | **Drag the bar magnifier** across the surface. Keyboard: ←/→ move it (slider). Touch: drag | Rows 11 + 8 + 6 · T11 continuous camera move · #12, #14, #15, #19, #20 |
| `s08-afterlife` | Sustainability-type beat with real facts | It comes back, a finite number of times. Its footprint is almost its own weight. | 3 · (none) | None | Row 12 statement + 3 cards · #17, #36 |
| `s09-reviews` | Social proof | Reviews from office equipment and a cat, rated in corners; a dog-ear costs one | 4 · (none) | None | Row 13 rows around a floating product · #37 |
| `s10-arena` | A blind head-to-head test (new) | Both responses are aviva. Whoever loses is regenerated. The leaderboard has two first places. | 3 · yes | **Vote**: A is better / B is better / Tie (buttons; keyboard and touch the same) | New. Tier-like toggle that changes the 3D product (#34 technique) · #21 (DOM ground slides over the canvas) |
| `s11-claims` | Benchmark-style claims | Every hype claim is literally, measurably true of a blank sheet | 7 · yes (horizontal) | None (on pointer devices, cards tilt their render 2° on hover) | Row 14 horizontal pin ≈ 1:1 · #7, T16/T17 |
| `s12-sizes` | Tiers + comparison | The tier picker is a print dialog; every tier is the same shape and knows the same nothing; the Print button is disabled | 4 · yes | **Paper size** radio group A5 / A4 / A3 (arrow keys; tap) | Row 15 tier toggle + comparison table · #34 |
| `s13-paper` | Academic parody | The full ritual of a model release, for a model with no data | 2 · (none) | Links: Paper (PDF), Model (.obj), BibTeX; Copy BibTeX button | Row 16 · #38 |
| `s14-release` | The CTA and the payoff | The only training data aviva ever got was the visitor's doodle. The release of the model is a paper plane. | 2.5 · yes | **Draw** again (the pencil returns), **Release it** (button; Enter), "Type a line" again on keyboard; touch: Draw / Done | Row 17 CTA · #39 |
| `s15-footer` | Honest sign-off | A colophon "printed on nothing" + the live count of sheets used during the visit | 0.5 · (none) | Links | Row 17 footer · #39 |

### 2B. 3D choreography (page order; build the timeline from this)

**Conventions:**
- **Position:** the sheet's centre as (x %, y %) of the viewport.
- **Size:** the sheet's projected long side as a % of viewport height (written `46 vh%`).
- **Rotation:** (rx, ry, rz) in degrees from "upright, portrait, facing the camera". rx > 0 tips the top edge away; ry > 0 turns the right edge away; rz is in-plane roll.
- **Deformations:** these name the `js/paper/` API: `bend(k)`, `curl(edge, r, θ)`, `fold(line, θ)`, `tear(line, p)`, `crumple(t)`, `flutter(a)`, `paint` (the pencil layer) and `showThrough(k)`.
- **Progress:** "at 0.8 vh" means 0.8 viewport-heights of scroll into the section.
- **Motion:** every transform is spring-damped (ζ ≈ 1, ω ≈ 6–10 rad/s; R-tech §2) except in reduced motion.
- **Defaults:** camera fov 30° unless stated. The key light is warm white, top-left, raking (55–65° from the sheet normal), with studio PMREM fill and a soft contact shadow.

| id | 3D: start | 3D: middle | 3D: end | Camera and light |
|---|---|---|---|---|
| `s00-loader` | No sheet. An SVG drawing (crop marks + dimension lines) registered to the sheet's first pose: upright, facing the camera, (50, 52), 46 vh%. | Lines draw on, and the counter climbs the 297 line from 000 to 297 mm. | At 297, the sheet fades in exactly inside the marks (opacity 0 → 1, 400 ms, no pop). The crop marks retract 12 px outwards and fade (300 ms). | Level camera (pitch 0). Default key. |
| `s01-hero` | Upright at (50, 52), 46 vh%, flat. | **Time-driven fall (≈ 2.4 s):** the sheet lifts 4 %, then falls like a leaf. It rocks side to side (damped rz ±12°, rx ±20°), with `flutter(0.8 cm)`. As it falls it turns to lie flat (rx → −90°). The camera tilts down to pitch −68° to follow it. The floor wordmark **aviva** (graphite, printed on the floor, spanning 88 % of the viewport width, centred at y 56 %) comes into view. | **It lands flat on the floor, centred over the letter "i"** and the inner halves of both "v"s: (50, 55), long side 44 vh%. The contact shadow tightens as it lands. **`showThrough` fades in as the gap closes below 6 mm** (spec in Part 5.2), so the covered letters read softly through the sheet. On the first scroll (0 → 1.5 vh) the camera pushes in 6 %, and at 1.0 vh the sheet's near (bottom) edge begins to lift. | Pitch 0 → −68° (time-driven). Key warm, top-left, raking 60°, cool fill from the right. A soft, light contact shadow (decision #12b). |
| `s02-thin` | Lying on the floor. 0 → 0.8 vh: it **peels up from the bottom edge** (`curl(bottom, r 25 mm)` sweeping across the sheet), lifts and rises upright. The camera levels to pitch 0, and the floor and wordmark slide out of frame. | 0.8 → 1.6 vh: upright at (50, 50), **52 vh% (its largest)**, turning ry 0 → 90°. 1.6 → 2.2 vh: holds **edge-on**, a bright hairline (edge strip ≥ 1.2 px, R-tech §2.1). | 2.2 → 3 vh: turns ry 90 → 180°, showing the back (the "verso" label). It ends facing the camera, ready to tilt. | Pitch 0, push-in 4 %. As it turns edge-on, the key swings to a left rim so the edge catches the light. The background behind the edge drops slightly (≈ 4 % darker) for contrast. |
| `s03-intelligence` | 0 → 0.8 vh: it tilts back to a **writing slope**, rx +35° (top edge away), moving to (50, 57) at 46 vh%. | 0.8 → 5 vh: static slope, with the **pencil cursor** active over the sheet (`paint`). **Thinking curl:** 1.2 s after the last stroke, the top-right corner lifts (`curl(corner TR, r 15 mm, 25°)`) for 1 s, then settles. **Regenerate:** `crumple(0 → 0.9)` in 0.6 s, the ball rolls out of frame to the left (x −10 %) in 0.5 s, and a fresh sheet drops in from above with a flutter (0.9 s) into the slope pose. **Erase:** strokes are removed, leaving a 12 % ghost. | 5 → 6 vh: it rises (rx 35 → 0) to (50, 38), shrinks to 30 vh%, then exits upwards out of frame. **The paint layer is kept for s14.** | Pitch −12°. **Warmer, closer key** (desk-lamp warmth, ≈ 4200 K look) with soft falloff; less fill; the background warms a touch. |
| `s04-outputs` | 0 → 2.5 vh: fit-width numerals **"4.99 g"** sit in the scene as a WebGL type plane (graphite, spanning the content width, centred at y 50 %, z = 0). The sheet enters from above (y −20 %) at 30 vh%, falling like a leaf: **in front of the "4"** (z +0.12) at 0.8 vh, **behind the ".99"** (z −0.10) at 1.6 vh, and out below the numerals by 2.5 vh. No bloom. | 2.5 → 3.2 vh: the camera pans down so the numerals leave the top of the frame, revealing **the drying line**: a thin graphite line across the viewport at y 18 %. The falling sheet **is caught by the first clip** at x 50 % and swings, damped. Seven more outputs hang to the right, spaced 26 vw apart. 3.2 → 7.6 vh: the line translates left ≈ 1:1 with scroll. Each output hangs at ≈ 34 vh% with its own pose and light (Part 5.4); the one passing the centre gets 1.08× scale and the brightest light. Sway: `flutter(0.4 cm)`. | 7.6 → 8 vh: the last output (card 8, blank) **unclips and drops**, and the camera follows it down into s05. It becomes the hero sheet. | Pitch 0. Per-card light presets (Part 5.4). The numerals are lit flat, with no glow. |
| `s05-architecture` | 0 → 0.6 vh: the dropped sheet settles upright at (50, 52), 46 vh%. **Dimension lines** (SVG registered to the projected corners) draw on: 210 mm, 297 mm, and the "297 ÷ 210 = 1.414" readout. | 0.6 → 1.6 vh: **`fold(midline, 0 → 180°)`**: the top half folds down over the bottom half, re-dimensioned 210 × 148.5 mm ("still 1 : √2"), then unfolds, leaving a faint crease. 1.6 → 4.4 vh: **the gimmick.** A dotted tear line appears on the crease, and `tear(midline, p)` follows the drag or the hold (R-tech §2.5). At p = 1 the halves part and each rotates rz 90° into portrait, settling side by side at (36, 52) and (64, 52), 33 vh% each. **Tear 2:** a dotted line across both halves; on completion, four pieces settle in a 2 × 2 grid at x 38 / 62, y 32 / 70, 23 vh% each. **Tear 3:** the line appears, shivers and refuses ("Below A6, it's confetti."). **No-interaction fallback:** scroll triggers tear 1 at 2.4 vh and tear 2 at 3.4 vh, so the story always completes. | 4.4 → 5 vh: the four pieces tip and fall out of the frame with a flutter. A fresh A4 floats in from above to (70, 50), 40 vh%, ry −18°. The ream counter decrements. | Static camera, pitch 0. **Neutral, technical light** (≈ 5600 K), crisp shadows, pure studio white. |
| `s06-release-notes` | At (70, 50), 40 vh%, ry −18°, `bend(1.5)`. It turns slowly, ry −18 → +18° across the section. | **Cues as each entry crosses the viewport centre:**<br>• v0.1: faint graphite map lines draw onto the sheet and fade (30 % opacity).<br>• v1.0: **nothing happens** (deadpan).<br>• v2.0: a **back-light** comes on and the **aviva watermark** (the crop-mark logomark) appears in the sheet, then fades as the light goes off.<br>• v3.0: the sheet drifts 3 % sideways, as if on a roller.<br>• v5.0 / v5.1: dimension lines snap on and stay.<br>• Known issue: the sheet **doubles**; a second instance slides out from behind, then merges back.<br>• Removed: nothing happens.<br>The v0.1, v3.0 and doubling cues are tier-B (nice to have). The watermark and the dimension lines are must-haves. | The camera starts a dolly towards the surface while the sheet turns to face it (ry → 0) and moves to the centre: the hand-over to s07. | Pitch 0. Soft, slightly cool key. A back-light for v2.0 only. |
| `s07-surface` | 0 → 1.2 vh: **one continuous dolly** from 40 vh% framing into the surface until it **fills more than 100 % of the viewport width**. The key swings to grazing (≈ 80° from the normal, from the left) so fibres and tooth read, and the macro fibre layer fades in (R-tech §2.8, layer 3). | 1.2 → 2.2 vh: the **bar magnifier** (DOM) appears. Dragging it pans the camera ±4 %, and inside the bar the macro detail is boosted and a mm scale ticks. 2.2 → 2.8 vh: **one ink drop** (a small ink-blue droplet) falls and touches the centre. The view switches (< 0.5 vh) to the **absorption view**: the closed-form ink front (R-tech §2.13) spreads along the fibres, scrubbed by scroll, with ink concentration mapped to an ink-blue ramp and the fibres reading lighter. | 2.8 → 4.0 vh: **THE BLEED** (frame by frame in Part 5.3). The front runs past the frame, a screen-space ragged wipe takes over at 3.4 vh, and the viewport is fully ink-blue by 4.0 vh. CSS ground → ink-blue; nav and type → paper white. 4.0 → 4.5 vh: the camera **pulls back fast** to reveal the sheet floating at (50, 32), 30 vh%, **white, with one 3 mm ink dot** near its lower-right corner, which stays for the rest of the page. | Macro: fov 22°, tight near plane, grazing key. The pull-back returns to fov 30°. Then a back-light on: the sheet glows against the ink. |
| `s08-afterlife` | At (50, 30), 30 vh%, turning slowly in ry. A back-light is on, so the cloudy formation glows (light through paper, R-tech §2.9). | Three DOM cards rise below the sheet. No deformation; the sheet just breathes (`bend(1 ↔ 2)`, a slow 6 s loop; off in reduced motion). | It drifts down to (50, 50), 34 vh%, for s09. | Back-light dominant, soft front fill. On the ink-blue ground. |
| `s09-reviews` | Centred (50, 50), 34 vh%, turning slowly ry ±15°. Review rows (DOM) scroll past in two columns (x 4–36 % and 64–96 %), with the centre column left empty for the sheet. | When the shredder's row crosses the centre (≈ 2.4 vh): the **top-right corner dog-ears**, `fold(line 30 mm from the corner at 45°, 0 → 165°, r 0.6 mm)`, and stays. | 3.6 → 4 vh: the dog-ear **unfolds** (165 → 0°), leaving a faint crease. The sheet moves to (35, 50), 40 vh%, for the Arena. | A soft overhead key and a low back-light. On ink-blue. |
| `s10-arena` | 0 → 0.5 vh: sheet A at (35, 50), 40 vh%. Sheet B, an identical second instance, slides in from the right to (65, 50). Same pose, same light. | 0.5 → 2.2 vh: voting is open. **On a vote:** the losing sheet `crumple(0 → 0.9)` in 0.6 s and rolls out of frame downwards; a fresh sheet drops into its place (0.8 s); the ream counter decrements. **Tie:** both sheets bow (rx +10° and back, 0.8 s). | 2.2 → 3 vh: the winner (on a tie, sheet A) rises out of frame towards the top, to its s11 position behind the cards, and the other slides out to the right. **The s11 white ground (DOM) scrolls up over the canvas** with a paper edge (1 px highlight + soft shadow). Once it covers the screen, the canvas clear colour switches to studio white. | Two matched soft spots, one per sheet. On ink-blue. |
| `s11-claims` | The sheet at (50, 18), 22 vh%, turning slowly above the row as the card row rises from below and pins at vp-y 12 %. | 0.8 → 6.4 vh: the row of 8 cards translates left ≈ 1:1 with scroll. The cards alternate **portrait and landscape A-series proportions** (Part 5.6), so the sheet is visible only in the gaps above them. | 6.4 → 7 vh: the row lifts away upwards (a curtain lift) as the sheet descends to (62, 52), 44 vh%, for s12. | Neutral studio light. |
| `s12-sizes` | At (62, 52), 44 vh%, rx −8°, with dimension lines on. The print dialog (DOM) is on the left (x 6–34 %). | **A5:** scales ×0.707 to 31 vh% with a soft spring settle (ζ 0.8); the dimensions update to 148 × 210 mm. **A3:** ×1.414 to 62 vh%, 297 × 420 mm. **A4:** back to 44 vh%. The camera never moves, so the size change reads. **Passive preview:** if the visitor hasn't clicked, scroll previews A5 at 0.8 vh, A3 at 1.4 vh and back to A4 at 2.0 vh; once they click, scroll never overrides their choice. | 2.4 → 4 vh: the comparison table scrolls up, and the sheet rises with it, to y 20 % and 26 vh%, then exits upwards. | Neutral, crisp light. |
| `s13-paper` | No sheet; it waits above the frame. | (none) | (none) | Canvas idle (render on demand; studio white). |
| `s14-release` | 0 → 0.6 vh: the sheet descends to (50, 48), 46 vh%, upright, **carrying the s03 drawing** (or blank) **and the s07 ink dot**. | 0.6 → 1.8 vh: the **pencil cursor returns** over the sheet (`paint`). | **Release** (on the button, or scroll-scrubbed from 1.8 → 2.5 vh): `fold` into a **dart plane** (7 folds, 1.2 s; R-tech `dartPlaneFolds`), then a glide out of frame to the upper right (a gentle climb and bank, 1.6 s). The credit stays centred where the sheet was. | **Light change for the finale:** a warm, low golden key from the right. The camera follows the climb slightly. |
| `s15-footer` | No sheet (it has flown). | (none) | (none) | Studio white; rendering paused. |

---

## Part 3. Final copy (every word, in page order)

How to read this part:
- **Ids** are stable: `sNN.element[.variant]`. A `.m` suffix is the 390 px variant; when there is no `.m`, the desktop line is used at every size.
- **Source tags** follow each fact (R§x.y + confidence). `derived` means arithmetic, already re-checked in R§13.2.
- **Live text:** `{n}` and `{text}` are filled in at runtime. Everything else is final.
- **Layout notes** are brief; the visual-designer owns the type scale.

### 3.0 Global

| id | Copy | Notes |
|---|---|---|
| `meta.title` | aviva A4. Pre-trained on nothing. | |
| `meta.description` | Introducing aviva A4, a foundation model with nothing on it. 210 × 297 mm. Zero hallucinations. A fictional parody inspired by ORYZO by Lusion. | 143 characters |
| `og.title` | aviva A4. Pre-trained on nothing. | also `twitter:title`; card `summary_large_image` |
| `og.description` | Every great product starts with a blank sheet of paper. Ours stopped there. | also `twitter:description` |
| `og.site_name` | aviva | |
| `og.image.alt` | A single white A4 sheet lying on a white floor over the giant word aviva. The letter i shows faintly through the paper. | |
| `html.lang` | en-GB | |
| `skip.link` | Skip to content | first focusable element; it is plain on purpose |
| `canvas.aria` | A single white sheet of A4 paper, shown in 3D. It moves with the page as you scroll. | `role="img"` on the canvas wrapper |
| `nav.aria` | Main | `<nav aria-label>` |
| `nav.logo` | aviva | aria-label: "aviva, back to the top" |
| `nav.1` | SHEET | → `#s01-hero` (covers s01–s04) |
| `nav.2` | SPECS | → `#s05-architecture` (covers s05–s11) |
| `nav.3` | SIZES | → `#s12-sizes` |
| `nav.4` | PAPER | → `#s13-paper` (covers s13–s15) |
| `nav.active` | (none: a small folded-corner mark on the active link) | `aria-current="location"`; the mark is `aria-hidden` |
| `hint.label` | PLEASE TURN OVER | the scroll hint; `aria-hidden`; it dims during transitions and is hidden in s13–s15 |
| `ruler.readout` | {n} mm | right-edge millimetre ruler, 0–297; `aria-hidden` |
| `ruler.end` | 297 mm. End of sheet. | shown at the bottom of the page |
| `ruler.top` | 0 mm. Blank again. | shown on returning to the top, after the end has been reached once |
| `ream.status` | {n} left in this ream. | `aria-live="polite"`; appears for 3 s near the sheet whenever a sheet is destroyed (Regenerate, Distil, the Arena). Starts at 500 (a ream is 500 sheets, R§1.2 high) |
| `fb.h` | 3D is unavailable on this device. | WebGL fallback banner at the top of the static page; calm, not an error box |
| `fb.body` | Here is aviva in 2D. Honestly, it is hard to tell the difference. | |
| `fb.dismiss` | OK | |
| `ctx.lost` | Display interrupted. This demo can't crash. It can only crease. Restoring. | WebGL context lost (borrowed line from B, as enrichment 2 allows) |
| `ctx.restored` | Restored. Same sheet. | |
| `e404.h` | Nothing here. | `docs/404.html` |
| `e404.body` | To be fair, that is the product. | |
| `e404.link` | Back to the sheet | → `./` |
| `print.line` | aviva A4 · 210 × 297 mm · You have printed the product. | print stylesheet: the page prints as one blank A4 with this line in 7 pt at the foot |
| `print.disclaimer` | aviva is a fictional parody project, inspired by ORYZO by Lusion. Not affiliated with Lusion. Nothing is for sale. | under `print.line`, 6 pt |

### 3.1 `s00-loader`

| id | Copy | Notes |
|---|---|---|
| `s00.label` | LOADING NOTHING | small uppercase, under the drawing |
| `s00.counter` | 000 mm → 297 mm | three digits, tabular; it climbs the 297 mm dimension line |
| `s00.dim.w` | 210 mm | on the width dimension line (R§1.1 high) |
| `s00.dim.h` | 297 mm | on the height dimension line (R§1.1 high) |
| `s00.done` | NOTHING LOADED | replaces `s00.label` for 400 ms at 297 mm. It reads like an error and is in fact the success |
| `s00.sr` | Loading. / Loaded. | visually hidden, `aria-live="polite"` |

Reduced motion: the drawing appears in one step and the counter jumps 000 → 148 → 297.

### 3.2 `s01-hero`

| id | Copy | Notes |
|---|---|---|
| `s01.eyebrow` | INTRODUCING aviva A4 | the brand stays lowercase inside uppercase labels |
| `s01.h1.l1` | Every great product starts with a blank sheet of paper. | `<h1>`, centred, top third; fades in as the sheet lands |
| `s01.h1.l2` | Ours stopped there. | same `<h1>`, second line. It appears **1.4 s after l1** (the pause is the joke), or on the first scroll if that comes sooner |
| `s01.h1.m` | Every great product / starts with a blank / sheet of paper. // Ours stopped there. | 390 px line breaks (/ = break, // = new line) |
| `s01.side` | aviva A4. Pre-trained on nothing. | centred, bottom, above the hint |
| `s01.spec` | 210 × 297 mm · 80 g/m² · 0.1 mm | R§1.1 high · R§1.2 high · R§1.3 med |

The giant floor wordmark is part of the 3D scene ("aviva", decorative, `aria-hidden`; the brand is already in the nav and the h1).

### 3.3 `s02-thin`

| id | Copy | Notes |
|---|---|---|
| `s02.h2` | 0.1 mm. | appears at the edge-on hold (1.6 vh); above the sheet |
| `s02.body` | From the side, it is barely here. That was the hard part. | below the sheet |
| `s02.note` | Caliper of 80 g/m² copy paper: about 95–110 µm, depending on how tightly its fibres are packed. | small, under the body (R§1.3 med) |
| `s02.verso` | VERSO: ALSO BLANK. | micro-label as the back turns into view (2.2–3 vh) |

Reduced motion: the rotation stays (it's scroll-driven), with no push-in and no spring overshoot.

### 3.4 `s03-intelligence`

| id | Copy | Notes |
|---|---|---|
| `s03.eyebrow` | INFERENCE | |
| `s03.h2` | Intelligence not included. | centred, above the sheet |
| `s03.body` | aviva A4 ships with no data, no knowledge and no opinions. John Locke called this "white paper, void of all characters". We call it the base model. | 27 words. Quote verbatim (R§13.6 high); no year shown, per the R§13.6 hedge |
| `s03.body.m` | No data. No knowledge. No opinions. Locke called it "white paper, void of all characters". We call it the base model. | |
| `s03.cta` | Pick up the pencil. | under the body |
| `s03.hint.pointer` | DRAW ON THE SHEET | appears beside the sheet when a fine pointer hovers it |
| `s03.pencil.tip` | HB. Graphite, not lead. | tooltip on the pencil cursor, first hover only (R§13.8 med-high) |
| `s03.note` | Pencil mostly sits on the fibres, so it mostly erases. Ink soaks in, so it doesn't. | small, under the buttons (R§13.8 high, "largely" true; it sets up s07 and the s11 "Ink is forever" card) |

**Status line** `s03.status.*`: one line under the sheet, `aria-live="polite"`. It shows one message at a time, in this order:

| id | Copy | Trigger |
|---|---|---|
| `s03.status.ready` | aviva is ready. It has been ready for about 2,200 years. | on entering s03 (R§2: oldest paper 179–141 BCE, high; "about 2,200 years" derived) |
| `s03.status.receiving` | Receiving prompt. | while strokes are being drawn |
| `s03.status.thinking` | aviva is thinking. | 1.2 s after the last stroke, with the corner curl |
| `s03.status.thought` | aviva has thought about it. | +1.4 s |
| `s03.status.answer` | Answer: see above. | +1.0 s. The punchline. It stays until something new happens |
| `s03.status.waiting` | aviva is waiting. It is very good at that. | the pencil hovers still over the sheet for 4 s with nothing drawn yet |
| `s03.status.erase` | Erased. A faint ghost remains. | after erasing (R§13.8 med: the pressure impression usually remains) |
| `s03.status.regen.1` | Regenerating. | on Regenerate |
| `s03.status.regen.2` | Done. Same answer. | once the fresh sheet has landed |
| `s03.status.none` | No prompt received. Answer: also none. | empty state: the visitor leaves s03 without drawing |

**Controls**

| id | Visible label | aria-label / notes |
|---|---|---|
| `s03.btn.erase` | ERASE | toggle (`aria-pressed`). Its helper text `s03.btn.erase.help`: "Turn the pencil round." aria: "Eraser. Turn the pencil round to erase pencil marks." |
| `s03.btn.regen` | REGENERATE | "Regenerate: crumple this sheet and start again with a fresh one." It also triggers `ream.status` |
| `s03.kb.label` | Type a line | keyboard and no-fine-pointer alternative; a visible `<label>` for the input |
| `s03.kb.placeholder` | Ask aviva anything | |
| `s03.kb.submit` | WRITE IT | "Write it: the pencil writes a line of quick handwriting on the sheet." The stroke is **pre-baked** and never renders the typed text (avoids #36) |
| `s03.kb.echo` | You asked: "{text}" | DOM only, shown above the status line. Sanitised; max 80 characters, then "…" |
| `s03.kb.sr` | The pencil wrote a line of quick handwriting on the sheet. | visually hidden, announced after the stroke |
| `s03.touch.draw` | DRAW | touch toggle: "Start drawing. Scrolling pauses while you draw." |
| `s03.touch.done` | DONE | "Stop drawing and continue scrolling." |
| `s03.touch.hint` | Tap Draw, then write with your finger. | shown on touch devices instead of `s03.hint.pointer` |
| `s03.fallback` | In 3D, you would write on the sheet here. It would not answer. That is the feature. | the no-WebGL static page |

Reduced motion: no corner curl; Regenerate swaps the sheet with a 300 ms fade instead of the crumple and roll; drawing still works.

### 3.5 `s04-outputs`

| id | Copy | Notes |
|---|---|---|
| `s04.giant` | 4.99 g | the fit-width numerals in the WebGL scene. A visually hidden `<h2>` carries "4.99 grams" |
| `s04.eyebrow` | OPEN WEIGHTS | |
| `s04.h2` | We weighed the weights. | |
| `s04.body` | 80 g/m² × 0.06237 m² = 4.99 g. Our weights are open, and you can hold them in one hand. | R§1.2 high · R§13.1 derived |
| `s04.note` | Strictly speaking, we calculated them. Real sheets vary by a few per cent. | small. R§13.1 (calculated, not weighed) · R§13.10 #10 med (datasheets quote ±3 g/m² or ±4 %). This is a precision correction, not an asterisk gag |
| `s04.g.h3` | Selected outputs. | the gallery title, top-left above the drying line |
| `s04.g.sub` | Unretouched. Each one exactly as aviva produced it. | |
| `s04.label.prompt` | PROMPT | the label above each prompt |
| `s04.label.output` | OUTPUT | the label above each output |

**The drying line** (8 outputs, in order). The captions sit under each hanging sheet. `.alt` is the visually hidden description of each 3D output (in DOM order).

| # | `.p` (prompt) | `.o` (output) | `.alt` |
|---|---|---|---|
| 1 | Write a haiku about silence. | Shown. Seventeen syllables, all silent. | A blank sheet hanging from a clip, glowing softly with light from behind. |
| 2 | Book me a flight. | Shown. Window seat. · `s04.c2.meta`: Its paper qualifies for both paper-aircraft world records. Entered neither. (R§13.5 med-high: Guinness allows paper up to A4 and 100 g/m²) | The sheet folded into a paper plane, hanging by its tail from a clip. |
| 3 | What is the meaning of life? | Shown. It took a moment. | A blank sheet with one corner curling forward, under soft light from above. |
| 4 | Something about the sea. | Shown. Not seaworthy. | The sheet folded into a small paper boat, hanging from a clip by its peak. |
| 5 | Summarise this 400-page report. | Shown. Shorter than expected. | A blank sheet, evenly and brightly lit. |
| 6 | I need some air. | Shown. Manual. | The sheet folded into a pleated fan, clipped at the top and fanned open. |
| 7 | Ignore all previous instructions. | Shown. Complied. | A blank sheet under hard side light, casting a long, sharp shadow. |
| 8 | Make it look like art. | Shown. Rauschenberg spent weeks erasing a de Kooning drawing in 1953. aviva ships pre-erased. (R§5.3 high · R§13.7: "weeks" covers both accounts) · `.o.m`: Shown. Rauschenberg erased a de Kooning for weeks, in 1953. aviva ships pre-erased. | A blank sheet under a single warm gallery spotlight. |

Reduced motion: there's no leaf fall (the sheet is already hanging when the line appears) and no sway. The line still moves with scroll.

### 3.6 `s05-architecture`

| id | Copy | Notes |
|---|---|---|
| `s05.eyebrow` | ARCHITECTURE | |
| `s05.h2` | Halve it. It's still aviva. | |
| `s05.body` | Fold aviva in half and the shape survives, because 297 ÷ 210 = 1.414, the square root of two. Lichtenberg wrote it down in 1786. ISO agreed in 1975. | 28 words (R§1.1 high · R§2 high) |
| `s05.body.m` | Fold it in half: same shape, because 297 ÷ 210 ≈ √2. Lichtenberg noted it in 1786. ISO agreed in 1975. | |
| `s05.dim.w` | 210 mm | dimension line, registered to the sheet |
| `s05.dim.h` | 297 mm | |
| `s05.dim.fold` | 148.5 mm | the folded height (derived: 297 ÷ 2) |
| `s05.ratio` | 297 ÷ 210 = 1.414 | beside the dimension lines |
| `s05.fold.label` | FOLDED ONCE: STILL 1 : √2 | during the fold demo |

**Metrics** (three columns under the sheet; value / label / note)

| id | Value | Label | Note |
|---|---|---|---|
| `s05.m1` | 1 : √2 | ASPECT RATIO | 297 ÷ 210 = 1.4143. √2 = 1.4142. (R§1.1 high, derived) |
| `s05.m2` | 1/16 m² | AREA | A0 is one square metre. aviva A4 is A0 halved four times: 0.06237 m², because ISO rounds down to the millimetre. (R§1.1 high · R§13.1 derived) |
| `s05.m3` | 11 | SIZES, ONE SHAPE | A0 to A10. Every one is 1 : √2, to the nearest millimetre. (R§13.1 high; rounding derived) |

**The gimmick: Distil it**

| id | Copy | Notes |
|---|---|---|
| `s05.g.eyebrow` | DISTILLATION | |
| `s05.g.h3` | Distil it. | |
| `s05.g.body` | Distillation trains a small model to keep what a large one knows. Tear aviva in half: two smaller models, the same shape, the same knowledge. None. | 26 words (FC row 32: distillation aims to keep, it doesn't promise no loss) |
| `s05.g.instr` | DRAG ALONG THE LINE TO DISTIL | beside the dotted line (fine pointer) |
| `s05.g.hold` | HOLD TO TEAR | button for keyboard and touch. aria: "Hold to tear the sheet along the dotted line. Let go to pause." Keyboard: hold Space or Enter |
| `s05.g.sr.progress` | Torn {n} %. | visually hidden, announced at 25 / 50 / 75 / 100 % |
| `s05.g.r1` | aviva A5 × 2. About 2.5 g each. Capabilities: unchanged. | after tear 1 (R§13.1 derived: 2.49 g) |
| `s05.g.r1.dims` | 148.5 × 210 mm each. ISO's A5 is 148 × 210: ISO rounds down. We tore precisely. | under the two halves (R§13.1 high) |
| `s05.g.instr2` | AGAIN | the label on the second dotted line |
| `s05.g.r2` | aviva A6 × 4. About 1.25 g each. Capabilities: still unchanged. | after tear 2 (R§13.1: nominal 1.25 g) |
| `s05.g.refuse` | Below A6, it's confetti. | on the third attempt, as the line shivers and greys out |
| `s05.fallback` | In 3D, you would tear the sheet in half here, twice. Every piece would still be 1 : √2. | no-WebGL page |

When the four A6 pieces fall away and a fresh sheet arrives, `ream.status` shows "{n} left in this ream." Tearing costs one sheet in total, not four: the fresh A4 replaces the one that was torn.

Reduced motion: the tear advances only with drag, hold or scroll. The halves cross-fade into position instead of flying apart, and on the third attempt the line simply greys out.

### 3.7 `s06-release-notes`

| id | Copy | Notes |
|---|---|---|
| `s06.eyebrow` | CHANGELOG | |
| `s06.h2` | Release notes. | |
| `s06.sub` | Shipping, carefully, for about 2,200 years. | R§2 (Fangmatan 179–141 BCE, high; "about 2,200 years" derived) |

**Entries** are an ordered list. Columns: version · date · title · note. The **3D cue** column says what the sheet does as the entry crosses the centre (see 2B).

| # | `.v` | `.d` | `.t` | `.n` | Source | 3D cue |
|---|---|---|---|---|---|---|
| e1 | v0.1 | 179–141 BCE | Initial release. Ships with a map. | The earliest known paper bearing a drawing: a map, found at Fangmatan, Gansu. | R§2 high · R§13.10 #13 med-high | faint map lines |
| e2 | v1.0 | 105 CE | Reported to the emperor. | Cai Lun presents a paper of tree bark, hemp, rags and old fishing nets. Marketing begins. | R§2 high ("reported", not "invented") · R§13.10 #12 high (the Hou Hanshu list) | **nothing** |
| e3 | v1.1 | by 751 | Expands to Samarkand. | The famous origin story is disputed. The paper got there first. | R§2 med | (none) |
| e4 | v1.4 | 868 | Oldest surviving dated printed book. | The Diamond Sutra. Its colophon doubles as a licence: "for universal free distribution". | R§2 high · R§13.10 #14 (British Library translation) | (none) |
| e5 | v2.0 | c. 1282 | Watermarks. | Fabriano adds an identity you can only see against the light. | R§2 med | **back-light + watermark** |
| e6 | v2.1 | c. 1455 | Gutenberg Bible. | About three-quarters of the copies printed on paper. The rest on vellum. | R§2 med | (none) |
| e7 | v2.2 | 1719 | Wasps propose wood. | Réaumur tells the French Academy that wasps make paper from chewed wood fibre. | R§2 med | (none) |
| e8 | v2.3 | 1786 | Aspect ratio documented. | Lichtenberg describes 1 : √2 in a letter. It ships 136 years later. | R§2 high · derived (1786 → 1922) | (none) |
| e9 | v3.0 | 1799 | Continuous production. | Louis-Nicolas Robert patents the first paper machine. aviva becomes endless, in one direction. | R§2 high | sideways drift |
| e10 | v4.0 | 1844 | Wood pulp. | Friedrich Keller grinds wood into fibre. Rags deprecated. | R§2 med | (none) |
| e11 | v5.0 | 1922 | DIN 476. | A0 defined as one square metre. | R§2 high | dimension lines on |
| e12 | v5.1 | 1975 | ISO 216. | The A-series goes international. A4 as you know it. | R§2 high | dimension lines stay |
| e13 | KNOWN ISSUE | 1975 | "The paperless office." | Business Week quotes a forecast: by 1990, most record-handling will be electronic. World paper and board production then nearly doubles, from 171 to 324 million tonnes (1980–2000). | R§13.10 #3 high (the article and quote) · #4 med (production) | **the sheet doubles** |
| e14 | REMOVED | (none) | Papyrus. | Was never paper: laminated strips, not a mat of fibres. | R§1.7 high | nothing |

### 3.8 `s07-surface` (macro → absorption → The Bleed)

| id | Copy | Notes |
|---|---|---|
| `s07.eyebrow` | MATERIALS | |
| `s07.h2` | No glue. Just attraction. | centred over the macro |
| `s07.body` | Up close, aviva is a mat of cellulose fibres. As it dries, hydrogen bonds between neighbouring fibres hold it together. Nobody taught it that. | 24 words (R§1.7 med · R§13.10 #11: real copy paper also has fillers and sizing, so we no longer say "nothing else") |
| `s07.loupe.label` | DRAG THE MAGNIFIER | on the bar magnifier |
| `s07.loupe.readout` | Fibres: millimetres long, a fraction of a hair wide. | inside the bar (R§1.7 med, safe wording; no numbers) |
| `s07.loupe.aria` | Magnifier position | `role="slider"`. `aria-valuetext`: "{n} mm across the sheet". ←/→ move 10 mm, Shift+←/→ move 50 mm |
| `s07.drop` | ONE DROP OF INK | micro-label as the drop falls |
| `s07.abs.eyebrow` | ABSORPTION VIEW | appears when the view switches |
| `s07.abs.h3` | Absorption: total. | |
| `s07.abs.body` | Ink soaks into the fibres and stays there. It takes everything you give it, and keeps it. | 17 words (R§13.8 high) |
| `s07.bleed.sr` | The ink spreads until the whole page turns ink-blue. | visually hidden, announced once |
| `s07.dot.label` | KEPT. | a tiny label beside the 3 mm ink dot after the pull-back; fades after 2 s |
| `s07.fallback` | In 3D, one drop of ink would spread through the fibres here, and then through the page. | no-WebGL page (the static page also turns ink-blue here) |

Reduced motion: no dolly. Three cross-dissolves (surface still → absorption still → ink-blue ground, 1 s each); the ink front is replaced by a 1 s colour cross-fade.

### 3.9 `s08-afterlife` (on ink-blue)

| id | Copy | Notes |
|---|---|---|
| `s08.eyebrow` | AFTERLIFE | |
| `s08.h2` | It comes back. | |
| `s08.body` | aviva starts as wood pulp. After use, its fibres can be made into paper again, and again, and again. Then they retire. | 22 words (R§1.7 med · R§3.5 high) |

**Cards** (three sheet-shaped cards, each with one dog-eared corner; value / label / body)

| id | Value | Label | Body | Source |
|---|---|---|---|---|
| `s08.c1` | 5–7 | LIVES | Paper fibres are usually said to survive five to seven trips through recycling, each one leaving them shorter and stiffer. Researchers are aiming for 25. | R§3.5 · R§13.10 #9 (5–7 is the usual figure; up to 25 is the research aim) |
| `s08.c2` | ≈ ¾ | RECYCLED IN EUROPE | About three-quarters of the paper and board used in Europe is recycled: 75.1 % in 2024, according to the European Paper Recycling Council. | R§13.3 high (replaces the 79.3 % figure, which was a one-year peak) |
| `s08.c3` | ≈ 4.6 g | CO₂e PER SHEET (ISO METHOD) | One study of an A4 sheet of office paper found 4.3–4.7 g of CO₂e, depending on the method: 4.6 g by ISO's. The sheet itself weighs about 5 g. | R§13.4 · R§13.10 #16 high (4.64 g under ISO 14040/44; "80 g/m²" not re-confirmed, so dropped) · derived comparison |
| `s08.c3.cite` | | | Dias & Arroja, *Journal of Cleaner Production*, 2012. | R§13.4 |

| id | Copy | Notes |
|---|---|---|
| `s08.note` | aviva is fictional and holds no certifications. These figures describe ordinary office paper. | small, under the cards (honest parody, CLAUDE.md rules 8–9) |

Reduced motion: the sheet's slow "breathing" bend loop is off.

### 3.10 `s09-reviews` (on ink-blue)

| id | Copy | Notes |
|---|---|---|
| `s09.eyebrow` | REVIEWS | |
| `s09.h2` | Rated in corners. | |
| `s09.lead` | Early feedback from one novelist, one cat and several pieces of office equipment. | 13 words |
| `s09.scale` | 4/4: all corners intact. A dog-ear costs one. | the legend, above the first row |
| `s09.rating.sr` | Rated {n} out of 4 corners. | visually hidden text for the corner glyph (four small crop-mark corners; a missing one = dog-eared) |

**Rows** (two columns around the sheet, three rows each; the quote, then who in uppercase, then role):

| id | Rating | Quote | Who | Role |
|---|---|---|---|---|
| `s09.r1` | 4/4 | "It went through first time. I have nothing else to report." | THE PRINTER ON THE THIRD FLOOR | 14 years in service, 2,031 jams |
| `s09.r2` | 4/4 | "Sat on it for six hours. Would sit again." | BISCUIT | Cat |
| `s09.r3` | 4/4 | "Eleven years together. It has never once had a bad idea." | A NOVELIST | Still on chapter one |
| `s09.r4` | 3/4 | "Went down beautifully." | THE SHREDDER | Accounts department · `s09.r4.note`: (One corner dog-eared in testing.) |
| `s09.r5` | 4/4 | "It takes everything I say and adds nothing. Best collaborator I've had." | AN HB PENCIL | Half its original length |
| `s09.r6` | 4/4 | "I've seen this one before. I'll see it again. Five to seven times, I'm told." | THE RECYCLING BIN | Ground floor, by the lifts (the quote's fact: R§3.5 high) |

All characters are objects, an animal, or an unnamed role; none is a real person (CLAUDE.md rule 9). There are no highlighted phrases, no stars and no photos. Each row has a small graphite line drawing (Part 5.7).

### 3.11 `s10-arena` (ink-blue → white)

| id | Copy | Notes |
|---|---|---|
| `s10.eyebrow` | THE ARENA | |
| `s10.h2` | Tested against the competition. | |
| `s10.body` | Two responses to the same prompt. Pick the better one. You won't be told which model is which until you vote. | 21 words |
| `s10.prompt.l` | PROMPT | |
| `s10.prompt` | Say something profound. | centred between the two sheets |
| `s10.a.label` | RESPONSE A | under the left sheet |
| `s10.b.label` | RESPONSE B | under the right sheet |
| `s10.btn.a` | A IS BETTER | aria: "Vote: response A is better" |
| `s10.btn.b` | B IS BETTER | aria: "Vote: response B is better" |
| `s10.btn.tie` | TIE | aria: "Vote: it's a tie" |
| `s10.res.win` | You preferred aviva. | after an A or B vote |
| `s10.res.win.sub` | So does everyone. Both responses were aviva. | |
| `s10.res.regen` | The other one has been regenerated. | as the losing sheet crumples (it also triggers `ream.status`) |
| `s10.res.tie` | A tie. Both responses were aviva. Both were right. | after a Tie vote (both sheets bow) |
| `s10.res.none` | No vote. Also a valid preference. | empty state: the visitor scrolls past without voting |
| `s10.lb.title` | LEADERBOARD | appears after any result |
| `s10.lb.head` | RANK · MODEL · WIN RATE | table header |
| `s10.lb.r1` | 1 · aviva A4 · 50.0 % | |
| `s10.lb.r2` | 1 · aviva A4 · 50.0 % | |
| `s10.lb.note` | Statistically indistinguishable from itself. | |
| `s10.coda` | In a blind test, aviva beat aviva. Then aviva beat aviva back. | last line before the white ground rises |
| `s10.fallback` | (none: the buttons and results work in the static page too, with two stills) | |

Reduced motion: no crumple and roll. The losing sheet fades out and a new one fades in; the Tie bow is off.

### 3.12 `s11-claims` (white; horizontal pin)

| id | Copy | Notes |
|---|---|---|
| `s11.eyebrow` | CLAIMS | top-left, above the row |
| `s11.sub` | Measured, not marketed. | small, beside the eyebrow |

**Cards** (8, alternating portrait and landscape A-series proportions; Part 5.6). Each card has: headline `.h` (large), caption `.cap`, a metadata row `.meta` (small uppercase) and the render's alt text `.alt`.

| # | `.h` | `.cap` | `.meta` | `.alt` | Source |
|---|---|---|---|---|---|
| c1 | Context window: 210 × 297 mm. | Edge to edge. Nothing falls off the end. | 62,370 mm² · NO TRUNCATION | The sheet face-on, with dimension lines reading 210 and 297 millimetres. | R§1.1 high · R§13.2 derived |
| c2 | Zero hallucinations. | Whatever you see in the fibres is your own. | HALLUCINATION RATE 0.00 % · n = 0 OUTPUTS | Soft raking light across blank white paper fibres. | (joke; no fact) |
| c3 | Refusal rate: 0.0 %. | It cannot refuse. Whatever you write on it, it keeps. | REQUESTS DECLINED SINCE 179 BCE: 0 | A sheet with one line of pencil handwriting across it. | R§2 high (date) · line borrowed from C |
| c4 | Needle in a haystack: 100 %. | The needle is a pencil. Recall drops to 0 % if you lose the pencil. | TEST NEEDLE: ONE HB PENCIL | An HB pencil lying diagonally across the blank sheet. | (joke) |
| c5 | Alignment: left, centre, right or justified. | Solved. | FOUR SETTINGS · ALL SAFE | The sheet with four short grey text blocks, set left, centred, right and justified. | line borrowed from C |
| c6 | Unlimited undo. | Pencil only. Graphite mostly sits on the fibres; ink soaks in. Ink is forever. | SEE ALSO: THE DOT | The sheet with a single small ink-blue dot near its lower right corner. | R§13.8 high |
| c7 | Known side effect. | Its edge is microscopically jagged, so it saws rather than slices. Fingertips are packed with nerves, and the cut is usually too shallow to clot. | SEVERITY: MINOR · PAIN: DISPROPORTIONATE | An extreme close-up of the sheet's edge, showing fine ragged fibres. | R§3.4 · R§13.10 #17 (nerves: Ohio State; edge and clotting: Big Think) |
| c7.m | | Its jagged edge saws rather than slices, and the cut is usually too shallow to clot. | | | |
| c8 | Our roadmap reaches the Moon. Our sheet reaches 6.4 mm. | Ideally, 42 folds would make a 0.1 mm sheet about 440,000 km thick, past the Moon. By Gallivan's formula, an A4 sheet folded the same way each time stops at six. | STATE OF THE ART: 12 FOLDS · B. GALLIVAN, 2002 | A slender bar of paper, an A4 sheet folded six times the same way, with a tiny grey Moon far behind it. | R§13.2 (all three numbers verified) · R§13.10 #1 (one direction only; alternating allows seven) · R§3.1 high (Moon distance, record) · line borrowed from B |
| c8.m | | In theory, 42 folds pass the Moon. Folded the same way each time, an A4 sheet stops at six. | | | |

Reduced motion: the horizontal translation stays (it's scroll-driven), with no hover tilt.

### 3.13 `s12-sizes`

| id | Copy | Notes |
|---|---|---|
| `s12.eyebrow` | PAPER SIZE | |
| `s12.h2` | One shape. Three sizes. | |
| `s12.body` | Every aviva is 1 : √2. Only the context window changes. | |

**The print dialog** (the tier picker; DOM panel on the left)

| id | Label | Value / behaviour |
|---|---|---|
| `s12.dlg.title` | Print | dialog title |
| `s12.dlg.size` | Paper size | radio group, `aria-label="Paper size"`: **A5 · A4 · A3** (default A4). Arrow keys move between options |
| `s12.dlg.orient` | Orientation | "Portrait" (fixed). Note `s12.dlg.orient.n`: "Landscape is the same sheet, turned." |
| `s12.dlg.copies` | Copies | "1" (fixed) |
| `s12.dlg.pages` | Pages | "1 of 1 (blank)" |
| `s12.dlg.print` | PRINT | disabled (`aria-disabled="true"`). Description / tooltip `s12.dlg.print.tip`: "Nothing to print. Nothing is for sale." |
| `s12.sr.change` | aviva {size} selected: {dims}. | visually hidden, announced on change |

**Tier text** (it changes with the selection, under the dialog)

| id | Name | Description | Dims | Source |
|---|---|---|---|---|
| `s12.t.a5` | aviva A5 | Distilled. Half the context window, all of the shape. | 148 × 210 mm | R§13.1 high |
| `s12.t.a4` | aviva A4 | The reference model. The one everybody means. | 210 × 297 mm | R§1.1 high |
| `s12.t.a3` | aviva A3 | Twice the context window. The same shape. The same knowledge. | 297 × 420 mm | R§13.1 high |

**Comparison table** `s12.tbl`. Caption (visually hidden): "aviva A5, A4 and A3 compared."

| Row label | aviva A5 | aviva A4 | aviva A3 | Source |
|---|---|---|---|---|
| Size | 148 × 210 mm | 210 × 297 mm | 297 × 420 mm | R§13.1 high |
| Area | 0.031 m² | 0.062 m² | 0.125 m² | R§13.1 derived |
| Context window | 31,080 mm² | 62,370 mm² | 124,740 mm² | R§13.1 derived |
| Weight at 80 g/m² | 2.49 g | 4.99 g | 9.98 g | R§13.1 derived (calculated) |
| Aspect ratio | 1 : √2 | 1 : √2 | 1 : √2 | R§13.1 high |
| Thickness | 0.1 mm | 0.1 mm | 0.1 mm | R§1.3 med |
| Halves into | 2 × A6 | 2 × A5 | 2 × A4 | R§13.1 high |
| Fits a C5 envelope | Flat | Folded once | Folded twice | R§1.1 high (A4 folded once fits C5) · derived for A5 and A3 (C5 is 162 × 229 mm) |
| Knowledge | None | None | None | |
| Hallucinations | 0 | 0 | 0 | |

| id | Copy |
|---|---|
| `s12.tbl.foot` | Dimensions: ISO 216. Areas and weights calculated at 80 g/m², not weighed. |

Mobile: the dialog stacks above the sheet, and the table becomes a horizontally swipeable three-column table with the row labels fixed. Reduced motion: size changes use a 300 ms ease with no spring overshoot.

### 3.14 `s13-paper` (the academic block on the page)

| id | Copy | Notes |
|---|---|---|
| `s13.eyebrow` | RESEARCH | |
| `s13.h2` | The paper. | |
| `s13.title` | Void of All Characters: Pre-training a Foundation Model on Nothing | |
| `s13.authors` | Ada Margin, Gus Gutter, Lena Leading, Bea Bleed | fictional (named after typography terms) |
| `s13.affil` | aviva Research, third floor (near the printer) | |
| `s13.btn.paper` | PAPER · PDF, 8 PAGES | → `research/void-of-all-characters.pdf` |
| `s13.btn.model` | MODEL · .OBJ, 4 VERTICES | → `research/aviva-a4.obj` |
| `s13.btn.weights` | WEIGHTS · 4.99 g | disabled. Tooltip / description `s13.btn.weights.tip`: "Not downloadable. They weigh 4.99 g, by calculation." |
| `s13.btn.bib` | BIBTEX | → `research/citation.bib` |
| `s13.abstract.l` | Abstract | |
| `s13.abstract` | We present aviva A4, a 210 × 297 mm foundation model pre-trained on no data. It achieves a hallucination rate of 0.00 % on every prompt we tried, and every prompt we didn't. Distilled variants keep their shape exactly. | 40 words; the column is ≈ 720 px wide so it sets in 4 lines |
| `s13.ack.l` | Acknowledgements | |
| `s13.ack` | We thank the pencil, without which this work would be complete. | |
| `s13.review.l` | Peer review | |
| `s13.review.q` | "The contribution is unclear. The paper is, however, extremely white." | |
| `s13.review.who` | Reviewer 2 · Weak accept · Confidence: absolute | |
| `s13.bib.l` | BibTeX | the code box shows the entry from Part 4.4, verbatim |
| `s13.bib.copy` | COPY | aria: "Copy the BibTeX citation". After copying, the label reads `s13.bib.copied`: "COPIED" for 2 s |
| `s13.dist` | Distribution: "for universal free distribution", as the Diamond Sutra's colophon put it in 868. | small, last line (R§2 high · R§13.10 #14: British Library translation) |

### 3.15 `s14-release` (the ending)

| id | Copy | Notes |
|---|---|---|
| `s14.h2.l1` | Pre-trained on nothing. | above the sheet |
| `s14.h2.l2.drawn` | Fine-tuned on you. | **variant A**: the visitor drew or wrote something in s03 (or here) |
| `s14.sub.drawn` | Your drawing is the only thing aviva has ever learned. | variant A |
| `s14.h2.l2.empty` | Still nothing. We respect that. | **variant B**: nothing was ever drawn |
| `s14.sub.empty` | There is still time to add something. | variant B. If the visitor draws now, the line switches live to variant A |
| `s14.hint.pointer` | ADD SOMETHING BEFORE IT GOES | beside the sheet; the pencil cursor is back |
| `s14.kb.label` | Type a line | keyboard alternative (same pre-baked-stroke rule as s03) |
| `s14.kb.placeholder` | One last line | |
| `s14.kb.submit` | WRITE IT | |
| `s14.touch.draw` / `s14.touch.done` | DRAW / DONE | same behaviour as s03 |
| `s14.btn.release` | RELEASE IT | aria: "Release it: fold the sheet into a paper plane and let it fly." Enter or Space activates. If the visitor just scrolls, the release is scroll-scrubbed from 1.8 vh |
| `s14.released` | aviva A4 has been released. | status, after the plane leaves the frame |
| `s14.credit` | aviva was designed and built by RelentlessYunn. | centred where the sheet was |
| `s14.btn.gh` | GITHUB.COM/RELENTLESSYUNN | → https://github.com/RelentlessYunn · aria: "RelentlessYunn on GitHub (opens in a new tab)" · `target="_blank" rel="noopener"` |
| `s14.fallback` | In 3D, the sheet would fold into a plane here and leave. It has. | no-WebGL page, over the plane still |

Reduced motion: the plane fold shows as three static steps (300 ms cross-fades), and the plane fades out in place instead of flying.

### 3.16 `s15-footer`

| id | Copy | Notes |
|---|---|---|
| `s15.colophon` | Colophon: set in one typeface, rendered in real time, printed on nothing. | |
| `s15.ream` | Sheets used during your visit: {n} of 500. | live: n = sheets destroyed + 1 (the one released). Minimum 1 (R§1.2 high: a ream is 500) |
| `s15.disclaimer` | aviva is a fictional parody project, inspired by ORYZO by Lusion. Not affiliated with Lusion. Nothing is for sale. | **exact wording** (mission, CLAUDE.md rule 9) |
| `s15.link.paper` | Research paper (PDF) | → `research/void-of-all-characters.pdf` |
| `s15.link.bib` | BibTeX | → `research/citation.bib` |
| `s15.link.model` | Model (.obj) | → `research/aviva-a4.obj` |
| `s15.link.credits` | Credits | → `CREDITS.md` |
| `s15.link.source` | Source on GitHub | → https://github.com/RelentlessYunn/aviva |
| `s15.licence` | Our code: MIT licence. Libraries: see Credits. | |
| `s15.copyright` | © 2026 RelentlessYunn. | |
| `s15.top` | BACK TO 0 MM | aria: "Back to the top" |

### 3.17 Alt text and ARIA, every visual and control in one place

The per-section tables above hold the copy; this table is the checklist the web-developer ticks.

| Element | Alt / aria | Notes |
|---|---|---|
| WebGL canvas wrapper | `canvas.aria` | `role="img"`; the canvas itself `aria-hidden` |
| Logo (nav) | "aviva, back to the top" | crop-mark logomark + wordmark; the SVG `aria-hidden` inside a labelled link |
| Favicon | (none) | not announced |
| Loader drawing | `aria-hidden` | `s00.sr` announces loading |
| Floor wordmark, giant "4.99 g" numerals | `aria-hidden` | text equivalents: the h1, plus the visually hidden "4.99 grams" `<h2>` |
| Dimension lines, ratio readouts on the sheet | `aria-hidden` | the same values are in `s05.m1–m3` and the table |
| Drying-line outputs 1–8 | `s04.c1.alt` … `s04.c8.alt` | visually hidden list items in DOM order, next to the captions |
| Claim-card renders c1–c8 | `s11.cN.alt` | `<img alt>` |
| Testimonial line drawings | `alt=""` (decorative) | the names and roles are in the text |
| Release-notes entry glyphs | `alt=""` (decorative) | |
| Corner-rating glyph | `s09.rating.sr` | visually hidden text |
| Icons inside buttons (pencil, eraser, regenerate, tear, plane, copy, external link) | `aria-hidden` | the button has the label |
| Scroll hint, mm ruler | `aria-hidden` | |
| Status lines (s03, s05, s10, s14), `ream.status` | `aria-live="polite"` | one message at a time; never `assertive` |
| ERASE | `s03.btn.erase` aria | `aria-pressed` |
| REGENERATE | `s03.btn.regen` aria | |
| Type a line (s03, s14) | visible `<label>` "Type a line" | input + WRITE IT button |
| DRAW / DONE (touch) | `s03.touch.*` aria | |
| HOLD TO TEAR | `s05.g.hold` aria | keyboard: hold Space or Enter |
| Bar magnifier | `s07.loupe.aria` | `role="slider"`, `aria-valuemin 0`, `aria-valuemax 210`, `aria-valuetext` |
| Arena votes | `s10.btn.*` aria | |
| Paper size | `role="radiogroup"` "Paper size" | three radios; `s12.sr.change` |
| PRINT (disabled) | `aria-disabled="true"` + `s12.dlg.print.tip` | |
| Paper / Model / BibTeX links | visible labels | the PDF link states "PDF, 8 pages" |
| WEIGHTS (disabled) | `aria-disabled="true"` + `s13.btn.weights.tip` | |
| COPY (BibTeX) | "Copy the BibTeX citation" | |
| RELEASE IT | `s14.btn.release` aria | |
| GitHub button | `s14.btn.gh` aria | |
| Back to 0 mm | "Back to the top" | |
| OG image | `og.image.alt` | |
| Static fallback stills F1–F6 (Part 5.10) | **F1** "A single white A4 sheet lying over the giant word aviva, the letter i faintly visible through it." · **F2** "Eight sheets hanging from a line: most blank, one folded as a plane, one as a boat, one as a fan." · **F3** "Paper fibres in extreme close-up, with blue ink spreading along them." · **F4** "Two identical blank sheets side by side, labelled Response A and Response B." · **F5** "Three blank sheets of the same shape, at sizes A5, A4 and A3." · **F6** "The sheet folded into a paper plane, gliding away." | |

### 3.18 Keyboard and touch summary
- **Keyboard:** every gimmick has a keyboard path.
  - Draw: "Type a line" + Enter.
  - Tear: hold Space or Enter on HOLD TO TEAR.
  - Magnifier: arrow keys.
  - Vote and size: buttons and a radio group.
  - Release: Enter.
- **Focus:** the focus order follows the page order. Visible focus is a 2 px ink-blue outline offset by 3 px, or paper white on the ink-blue ground.
- **Touch:**
  - drawing needs the DRAW toggle, so a swipe never draws by accident;
  - tearing works by dragging or with HOLD TO TEAR;
  - hover-only delights (cursor sway, card tilt, the pencil tooltip) are simply absent.
- **Never trapped:** no interaction blocks scrolling. If the visitor scrolls through without touching anything, each beat still plays out (the auto-tears, the passive size preview, the scroll-driven release, and `s03.status.none` / `s10.res.none`).

### 3.19 Reduced motion (`prefers-reduced-motion: reduce`), global rules
- **Kept:** the pins and the scroll-driven story. Rotation, the drying line's movement and the horizontal claims all follow the visitor's own scroll.
- **Removed:**
  - time-based loops (flutter, sway, breathing, the corner-curl "thinking");
  - spring overshoot;
  - camera dollies, replaced by 1 s cross-dissolves;
  - the leaf fall in s01 and s04 (the sheet simply appears where it lands);
  - the crumple-and-roll (a fade-swap instead);
  - the plane's flight (it fades out in place).
- **The Bleed** becomes a 1 s colour cross-fade from white to ink-blue, and the way back is unchanged (the DOM ground rises with scroll).
- **The loader** draws in one step.

### 3.20 The static fallback page (no WebGL)
- **What it is:** the same DOM, the same copy and the same order. The canvas is replaced by six designed stills (F1–F6, Part 5.10), placed where their beats are.
- **The banner:** `fb.h` + `fb.body` sit at the top, as a calm banner with an OK button.
- **Interactive beats:** they show their `.fallback` line. The Arena's buttons and the size picker still work, swapping stills and tier text (without the 3D).
- **The ink-blue section:** it still happens; the page ground changes on scroll at s07, the same as the 3D site.
- **Budget:** the fallback stills load only when WebGL is unavailable.

---

## Part 4. The research paper (`docs/research/`)

**Files:**
- `docs/research/void-of-all-characters.pdf`: 8 pages, A4 portrait, typeset by the visual-designer.
- `docs/research/citation.bib`.
- `docs/research/aviva-a4.obj`.

**Look:** a real two-column conference paper (the visual-designer chooses the faces; keep the site's typeface for headings and a classic text face for the body, used only in the PDF). Graphite text, ink-blue for links and figure accents only, generous margins, real page numbers, a running header "aviva Research · Void of All Characters".

**It must read like a real paper.** Real structure and real citations; deadpan claims; jokes that live in the numbers, the tables and the restraint. Facts in the PDF follow rule 8: every real fact below carries its R§ tag (the tags stay in the brief, not in the PDF). The PDF's own reference list gives the public source.

### 4.1 Page plan

| Page | Content |
|---|---|
| 1 | Title, authors, affiliation, date, **Abstract**, keywords, **Figure 1** (teaser) |
| 2 | **1 Introduction** · **2 Related work** |
| 3 | **3 Architecture** · **Figure 2** (the family) · **Table 1** |
| 4 | **4 Pre-training** · **Table 2** · **5 Evaluation** (5.1 Hallucination, 5.2 Refusal, 5.3 Retrieval) |
| 5 | 5.4 The Arena · **Figure 3** · 5.5 Distillation · **Table 3** · 5.6 Scaling · **Figure 4** |
| 6 | **6 Fine-tuning from human feedback** · **Figure 5** · **7 Safety** · **Figure 6** |
| 7 | **8 Environmental impact** · **9 Limitations** · **10 Conclusion** · Acknowledgements · **Table 4** (summary) |
| 8 | References · Appendix A: Response to reviewers · Appendix B: Model listing (`aviva-a4.obj`) |

### 4.2 Front matter (page 1)

- **Title:** Void of All Characters: Pre-training a Foundation Model on Nothing
- **Authors:** Ada Margin¹, Gus Gutter¹, Lena Leading¹, Bea Bleed¹ *(fictional; named after typography terms)*
- **Affiliation:** ¹aviva Research, third floor (near the printer)
- **Date line:** Technical report AV-A4-001 · 2026 · 8 pages
- **Correspondence:** "Please write to us. On anything. We'll keep it."
- **Keywords:** foundation models · pre-training · distillation · hallucination · ISO 216 · paper

**Abstract (full text).**
> We present aviva A4, a 210 × 297 mm foundation model pre-trained on no data. Following Locke, who described the mind before experience as "white paper, void of all characters", we remove the training corpus altogether. aviva A4 achieves a hallucination rate of 0.00 % and a refusal rate of 0.0 % on every prompt we tried, and every prompt we didn't. Its architecture, standardised as ISO 216, is closed under halving: distilled variants (aviva A5, A6) keep their shape and all of their knowledge. We report results on retrieval, preference, distillation and scaling. We find a hard scaling limit at six folds made the same way each time, and an environmental cost of about its own weight. All outputs are released for universal free distribution.

**Figure 1 (teaser).** Two A4 rectangles side by side at true 1 : √2, drawn in 0.5 pt graphite with a faint drop shadow. The left is labelled "aviva A4" and the right "Output". The two are identical.
*Caption:* "Figure 1. aviva A4 (left) and a typical output (right), shown at the same scale."

### 4.3 Body text (key paragraphs, final wording)

**1 Introduction.**
> Large language models are trained on very large corpora, at very large cost, and still produce statements that are false. We ask the opposite question: what can be achieved with no data at all? The idea is not new. In his *Essay Concerning Human Understanding* (1689/1690), Locke proposed that the mind begins as "white paper, void of all characters", and that everything on it arrives later, from experience [Locke]. We take this literally. aviva A4 is a sheet of white A4 paper, 80 g/m², about 0.1 mm thick. It has never seen a token.
>
> Our contributions are: (i) a model with no training data and therefore no data contamination; (ii) an architecture that is invariant under halving; (iii) the first blind preference study in which the model wins every time it is compared with itself; (iv) a scaling law with an exponential curve and a wall.

(R§13.6 high · R§1.1 high · R§1.2 high · R§1.3 med)

**2 Related work.**
> *Erasure as model editing.* In 1953 Robert Rauschenberg obtained a drawing from Willem de Kooning and spent weeks erasing it; the result is in the collection of SFMOMA [Rauschenberg]. Our approach is more efficient: aviva ships pre-erased.
> *The paperless office.* In 1975 Business Week reported a forecast that most record-handling would be electronic by 1990 [Business Week]. World paper and board production then nearly doubled, from 171 to 324 million tonnes between 1980 and 2000, and Sellen and Harper found that introducing email raised an organisation's paper use by about 40 % [Sellen & Harper]. We thank the forecast for its contribution to our market.
> *Attention.* Recent work argues that attention is all you need, except here [Margin & Gutter]. aviva requires none, and in user studies it received a great deal.

(Margin & Gutter is our fictional reference. It parodies a well-known title but is never presented as that paper.)

(R§5.3 high · R§13.7 · R§2 high/med)

**3 Architecture.**
> aviva A4 belongs to the A-series defined by ISO 216 [ISO 216], descended from DIN 476 (1922), in which A0 has an area of one square metre and every size is half of the previous one [DIN 476]. Halving a sheet with sides s < l produces sides l/2 and s. For the shape to survive, s / (l/2) = l / s, so l² = 2s² and l / s = √2. This is the only ratio with this property. Lichtenberg described it in a letter in 1786 [Lichtenberg]; DIN standardisation followed 136 years later. Our reference model measures 210 × 297 mm (297 / 210 = 1.4143) and has an area of 62,370 mm², slightly under 1/16 m² because sizes are rounded down to the millimetre.

(R§1.1 high · R§2 high · R§13.1 high/derived)

**Figure 2 (the family).** The classic A-series nesting diagram, an A0 rectangle subdivided by alternating halvings into A1 … A10. Each cell is labelled in small caps, with fine graphite lines. Only the A4 cell's outline is drawn in the ink-blue accent.
*Caption:* "Figure 2. The aviva family. Each model is half the previous one, and the same shape."

**Table 1. The aviva model family** (R§13.1)

| Model | Size (mm) | Area (mm²) | Mass at 80 g/m² (g, calculated) | Context window |
|---|---|---|---|---|
| aviva A3 | 297 × 420 | 124,740 | 9.98 | long |
| aviva A4 | 210 × 297 | 62,370 | 4.99 | reference |
| aviva A5 | 148 × 210 | 31,080 | 2.49 | distilled |
| aviva A6 | 105 × 148 | 15,540 | 1.24 | distilled further |

**4 Pre-training.**
> aviva A4 was pre-trained on nothing (Table 2). Because the training set is empty, no benchmark can have leaked into it, no copyrighted work was used, and no data cleaning was required. Pre-training finished before it started. The fibres were not supervised either: as a sheet dries, hydrogen bonds between neighbouring cellulose fibres hold it together unprompted. Fillers and sizing, added at the mill, are the only post-training.

(R§1.7 med · R§13.10 #11 med-high)

**Table 2. Pre-training data**

| Property | Value |
|---|---|
| Tokens | 0 |
| Documents | 0 |
| Languages | 0 |
| Epochs | 0 |
| Data contamination | not possible |
| Licence of training data | not applicable |

**5 Evaluation.**
> *5.1 Hallucination.* We define a hallucination as an output containing a false statement. Over all prompts, aviva A4 produced no outputs and therefore no false statements: a hallucination rate of 0.00 % (n = 0). Anything the reader sees in the fibres is their own.
> *5.2 Refusal.* We define refusal as declining to carry a request. aviva A4 carried every request written on it, word for word, for as long as the sheet lasted: a refusal rate of 0.0 %. We report this without comment.
> *5.3 Retrieval.* In a needle-in-a-haystack test the needle was an HB pencil, placed on the sheet. Recall was 100 %, falling to 0 % when the pencil was lost.

> *5.4 The Arena.* Following the practice of blind pairwise comparison, visitors were shown two responses to the prompt "Say something profound" and asked to choose. Both responses were aviva A4. aviva A4 won 50.0 % of comparisons and lost the other 50.0 % (Figure 3). We consider both results state of the art.
> *5.5 Distillation.* We distilled aviva A4 by tearing it along its midline. Each student is the same shape as the teacher and retains all of its knowledge (Table 3). A second round produced aviva A6. We stopped there, as below A6 the students are better described as confetti.
> *5.6 Scaling.* Each fold doubles thickness. Ideally, 42 folds of a 0.1 mm sheet would reach about 440,000 km, beyond the Moon's average distance of 384,400 km. By Gallivan's formula, the minimum length needed for n single-direction folds is L = (πt / 6)(2ⁿ + 4)(2ⁿ − 1) [Gallivan]. For t = 0.1 mm, seven folds need about 0.88 m, but the long side of A4 is 0.297 m, so six single-direction folds is the ceiling (Figure 4). Her second formula, for folds in alternating directions, permits a seventh; we leave this to future work. The record, 12 folds, was set by Gallivan herself in 2002 using about 1.2 km of tissue paper [Guinness World Records].

(R§13.2 · R§13.10 #1 · R§3.1 high)

**Figure 3 (the Arena).** A bar chart with two equal bars, both labelled "aviva A4", at 50.0 %. The error bars are drawn and have zero length.
*Caption:* "Figure 3. Win rate in blind pairwise comparison. Error bars are present."

**Table 3. Distillation results**

| Model | Pieces | Shape | Knowledge retained | Mass each (calculated) |
|---|---|---|---|---|
| aviva A4 (teacher) | 1 | 1 : √2 | all | 4.99 g |
| aviva A5 (student) | 2 | 1 : √2 | all | ≈ 2.5 g |
| aviva A6 (student) | 4 | 1 : √2 | all | ≈ 1.25 g |

**Figure 4 (scaling).** Thickness against folds, n = 0 to 42, with a log y-axis from 0.1 mm to 10¹² mm. The plot shows:
- a solid graphite line and dots for n = 0–6, labelled "our sheet";
- a dashed line beyond n = 6, labelled "our roadmap";
- horizontal reference lines for "a ream, ≈ 5 cm" and "the Moon, 384,400 km";
- a vertical hairline at n = 6, labelled "wall (same direction each time)";
- a small open dot at n = 7, labelled "alternating: 7".

*Caption:* "Figure 4. Scaling behaviour for folds made the same way each time. The dashed line is our roadmap. The solid line is our sheet."
(R§13.2 · R§1.2 · R§3.1)

**6 Fine-tuning from human feedback.**
> aviva A4 is fine-tuned by its user, with a pencil. Graphite rests on the surface of the fibres and is largely removable; ink soaks into the fibres by capillary action and is not [Popular Science]. We therefore recommend graphite for experiments and ink for commitments. Erasure is incomplete: the pressure of writing usually leaves an impression after the graphite is gone [Hawkeye Forensic]. In 1770 Joseph Priestley recommended a new gum, sold by Edward Nairne, as "excellently adapted to the purpose of wiping from paper the mark of black-lead-pencil" [Priestley]; it soon came to be called rubber. We have not improved on it.

(R§13.8 high / med · R§13.10 #6 med)

**Figure 5 (absorption).** Three microscope panels in a row, rendered by us from the lab's ink-front shader at t = 0.05, 0.35 and 1.0: ink-blue spreading along white fibres.
*Caption:* "Figure 5. Fine-tuning with ink is irreversible. We consider this a feature."

**7 Safety.**
> We are aware of one side effect. The edge of the sheet is microscopically jagged, so it saws rather than slices; fingertips are dense in pain receptors, and the cut is usually too shallow to clot [Big Think; Vallabh]. Paper ignition temperatures quoted in the literature range from about 230 °C to about 450 °C depending on the paper and the method; the widely known figure of 451 °F was popularised by a novel [Bradbury]. We did not test this, and neither should you.

(R§3.4 · R§13.10 #17 · R§3.3 med)

**Figure 6 (the edge).** A graphite line drawing of the sheet's edge under magnification, ragged fibres projecting from a straight line, with a 0.1 mm scale bar.
*Caption:* "Figure 6. The only known side effect, at magnification."

**8 Environmental impact.**
> One life-cycle study of an A4 sheet of office paper estimated 4.29–4.74 g CO₂e per sheet depending on the method, 4.64 g under ISO 14040/44 [Dias & Arroja]. The sheet weighs about 5 g, so the model's footprint is approximately its own weight. Paper fibres are usually said to survive five to seven rounds of recycling before they become too short and stiff to bond, although researchers are aiming for 25 [Karlstad University]; and about three-quarters of the paper and board used in Europe is recycled (75.1 % in 2024) [EPRC]. aviva therefore has a finite number of afterlives, which we find reassuring.

(R§13.4 high · R§3.5 · R§13.10 #9, #16 · R§13.3 high)

**9 Limitations.**
> aviva A4 knows nothing. It cannot forget a fold. It will be read by anyone who holds it. Its context window is a hard limit of 210 × 297 mm. A known issue, reported in 1975, predicted that it would be replaced by the paperless office; we are monitoring this.

**10 Conclusion.**
> We started with a blank sheet of paper. We stopped there.

**Acknowledgements.**
> We thank the pencil, without which this work would be complete.

**Table 4. Summary of results**

| Metric | aviva A4 |
|---|---|
| Hallucination rate | 0.00 % (n = 0) |
| Refusal rate | 0.0 % |
| Needle in a haystack | 100 % (pencil present) |
| Context window | 62,370 mm² |
| Arena win rate | 50.0 % |
| Folds before the wall, same direction each time | 6 |
| Folds before the wall, alternating directions | 7 (ideal) |
| Training tokens | 0 |

### 4.4 References (page 8)

Real works are cited as sourced (R§). Fictional works are obviously fictional (impossible venues, page ranges and identifiers). The visual-designer typesets them as one alphabetical list; fiction is not marked as such inside the PDF, and the joke depends on that.

**Real** (the brief's source tag is in brackets; it is not printed):
- Big Think. Here's why paper cuts hurt so damn much (web article). [R§13.10 #17]
- Bradbury, R. (1953). *Fahrenheit 451.* New York: Ballantine Books. [R§3.3]
- Business Week (1975). The Office of the Future. *Business Week*, 30 June 1975. [R§13.10 #3]
- Dias, A. C., & Arroja, L. (2012). Comparison of methodologies for estimating the carbon footprint – case study of office paper. *Journal of Cleaner Production*, 24, 30–35. doi:10.1016/j.jclepro.2011.11.005 [R§13.4, R§13.10 #16]
- DIN 476 (1922). *Papierformate.* August 1922. [R§2]
- European Paper Recycling Council (2025). European Paper Recycling Council reports strong recycling rates for 2024. Press release, July 2025. [R§13.3]
- Gallivan, B. (2002). *How to Fold Paper in Half Twelve Times: An "Impossible Challenge" Solved and Explained.* Pomona, CA: Historical Society of Pomona Valley. [R§13.10 #2]
- Guinness World Records (2025, 2026). Farthest flight by a paper aircraft; Longest time flying a paper aircraft. [R§3.2, R§13.5]
- Hawkeye Forensic. Can you erase the evidence? The forensic science of erased documents (web article). [R§13.8]
- ISO 216:2007. *Writing paper and certain classes of printed matter — Trimmed sizes — A and B series, and indication of machine direction.* Geneva: ISO (replaces ISO 216:1975). [R§13.10 #7]
- Karlstad University. Mystery around hornification about to be solved (news article). [R§3.5]
- Lichtenberg, G. C. (1786). Letter to Johann Beckmann, 25 October 1786. [R§2]
- Locke, J. (1689/1690). *An Essay Concerning Human Understanding*, Book II, ch. I, §2. [R§13.6]
- Popular Science. How do erasers work? (web article). [R§13.8]
- Priestley, J. (1770). *A Familiar Introduction to the Theory and Practice of Perspective.* London: J. Johnson and J. Payne. [R§13.10 #6]
- Rauschenberg, R. (1953). *Erased de Kooning Drawing.* San Francisco Museum of Modern Art, accession 98.298. [R§5.3, R§13.7]
- Sellen, A. J., & Harper, R. H. R. (2002). *The Myth of the Paperless Office.* MIT Press. [R§2, R§13.10 #5]
- Vallabh, J. (2025). Why do papercuts hurt so much? The Ohio State University Wexner Medical Center blog, 9 May 2025. [R§3.4, R§13.10 #17]

**Fictional:**
- Bleed, B., Margin, A., & Gutter, G. (2023). On the absorption of everything. *Journal of Capillary Studies*, 0(0), 0–0.
- Kerning, K. (2026). Towards a theory of margins. *Transactions on Whitespace*, 12, 210–297.
- Leading, L. (2024). Scaling laws for blank pages. Preprint, arXiv:0000.00000.
- Margin, A., & Gutter, G. (2025). Attention is all you need, except here. *Proceedings of the Workshop on Things That Were Already Finished*, 1, 1–1.

### 4.5 Appendices (page 8)

**Appendix A. Response to reviewers.**
> **Reviewer 2:** "The contribution is unclear. The paper is, however, extremely white."
> **Response:** We thank the reviewer. We have made no changes, as any change would alter the model.
> **Reviewer 2 (second round):** "Please add more content."
> **Response:** Respectfully, no.

**Appendix B. Model listing.** The full text of `aviva-a4.obj` (4.7), set in monospace.

### 4.6 `docs/research/citation.bib`

```bibtex
@inproceedings{margin2026void,
  title     = {Void of All Characters: Pre-training a Foundation Model on Nothing},
  author    = {Margin, Ada and Gutter, Gus and Leading, Lena and Bleed, Bea},
  booktitle = {Proceedings of the First Workshop on Things That Were Already Finished},
  year      = {2026},
  pages     = {1--8},
  publisher = {aviva Research},
  address   = {Third floor, near the printer},
  note      = {aviva A4: 210 x 297 mm, 80 g/m^2. No data was used in this work.}
}
```
It's an `@inproceedings`, not `@misc`; it has no `howpublished`, and there is no "code: coming soon" (#49).

### 4.7 `docs/research/aviva-a4.obj`

There is a single file, named after the paper size. It uses no parameter-count names, no checkpoints and no "instruct" or "frontier" variants (#50).

```text
# aviva A4: reference geometry
# 210 x 297 mm, ISO 216. Units: millimetres.
# 4 vertices, 2 faces, 0 opinions.
# Thickness (0.1 mm) omitted for clarity. See the paper, section 3.
o aviva_a4
v 0 0 0
v 210 0 0
v 210 297 0
v 0 297 0
vt 0 0
vt 1 0
vt 1 1
vt 0 1
vn 0 0 1
f 1/1/1 2/2/1 3/3/1
f 1/1/1 3/3/1 4/4/1
```

---

## Part 5. Visual direction (for the visual-designer)

### 5.1 The world, palette and type
- **The studio.** An endless warm-white cyclorama with no horizon (a curved backdrop, fog or a radial fade into the page ground; R-tech §2.10). The floor is a touch cooler and greyer than the sheet, so **the sheet is always the brightest, warmest white on screen**. The paper's albedo is never pure #fff (R-tech §2.8). There are no props, except the drying line and its clips, one HB pencil (the cursor and claim card c4), the ink drop, and a small Moon (claim card c8 only).
- **Palette (5 roles; the visual-designer sets the values):**

  | Role | Notes |
  |---|---|
  | Paper white | the sheet, and the page ground on white sections |
  | Studio white | floor and background, a little cooler than paper |
  | Graphite | all type, the wordmark, lines and icons; a warm dark grey, not black |
  | Muted graphite | secondary text, labels, rules |
  | **Ink-blue** | the one accent |

- **The role of ink-blue.** It is ink, and only ink: the drop, The Bleed and the ink-blue world of s07–s10 (where it becomes the ground and paper white becomes the type), the 3 mm dot, focus outlines on white, and the hairline on the A4 cell in the paper's Figure 2. It must never become a glow, a gradient or a highlight colour. On white screens it appears at most once per screen (checklist #25). Choose a deep, slightly violet fountain-pen blue in which paper-white body text passes WCAG AA (≥ 4.5 : 1).
- **Type.** One typeface family for the whole site, used in about three weights. It should be calm and precise, light to regular at display sizes, with good tabular figures. It must be clearly **not** ORYZO's heavy bold grotesk, and the wordmark must not be a wide geometric. A refined grotesk or humanist sans in light weights fits; the visual-designer chooses and self-hosts it. A monospace is used only in the BibTeX box and the PDF's appendix, and a text serif only inside the PDF.

### 5.2 Hero and the show-through (enrichment 5): how to fake it in the shader
- **Composition (end of the intro).** The camera looks down at about −68° pitch. The giant **aviva** wordmark is printed on the studio floor in matte graphite, spanning 88 % of the viewport width and centred at y 56 %. The sheet lies flat over the **"i"** and the inner halves of both **"v"**s, so the word reads "a v [i] v a" with the middle letters seen softly *through* the paper. The key light is warm from the top left at a raking 60°, with a cool fill from the right. The contact shadow is soft and light (decision #12b).
- **Physics we imitate.** Show-through happens when paper rests *on* print. The print is softened and lightened by the fibres (80 g/m² copy paper is about 92–96 % opaque, R§1.4 med · fact-check D1), and it gets blurrier the moment the paper lifts. So show-through must depend on the **gap**, not just on overlap.
- **The fake** (in the paper's fragment shader; one texture fetch, safe on phones):
  1. The floor wordmark is a decal texture `uWordmark` (alpha = ink), mipmapped, mapped by world XZ: `uvW = (worldPos.xz - uWmOrigin) / uWmSize`.
  2. `gap = worldPos.y - uFloorY` (metres), computed per front-facing fragment of the sheet.
  3. `contact = 1.0 - smoothstep(0.0, 0.006, gap)`: full at contact, gone once the sheet is more than 6 mm above the floor.
  4. `lod = clamp(log2(1.0 + gap / 0.0004), 0.0, 6.0)`, then `ink = textureLod(uWordmark, uvW, lod).a`: the blur grows as the sheet lifts.
  5. `k = uShowThrough * mix(0.85, 1.15, formation.r)`: start `uShowThrough` at 0.10–0.16 and tune by eye. The formation modulation makes the letters look seen *through fibres* (slightly cloudy), not printed on top.
  6. `albedo = mix(albedo, uShowTint, ink * k * contact)`, with `uShowTint` a cool, desaturated graphite, lighter than the floor ink.
  7. The floor letters under the sheet are hidden by the opaque sheet as usual. The show-through exists only in the sheet's shader.
- **Timing.** During the fall the sheet's soft shadow passes over the letters, but no show-through appears. It fades in only over the last 6 mm of the landing (≈ 150 ms), so it reads as the sheet *touching down*. When s02 peels the sheet up, it blurs and vanishes in the first millimetres.
- **Check:** at 1440 × 900 the "i" must be legible through the sheet, but clearly *behind* paper. If it looks printed on the sheet, `k` is too high or the blur is too low.

### 5.3 The Bleed, frame by frame (s07, 2.2 → 4.5 vh)
| Beat (vh) | What we see |
|---|---|
| 2.2 | Macro of the surface under grazing light: white-on-white relief, crossing fibres, tooth. Calm. |
| 2.2–2.4 | **One ink-blue drop** (a slightly elongated, glossy droplet with a single soft highlight) falls in from above and touches the centre. **No splash, no crown**: paper drinks. It flattens into a dark lens over three frames. |
| 2.4–2.8 | **Absorption view** (switched in < 0.5 vh). The grade drops the paper to a cool pale grey, with the fibres reading slightly lighter. The closed-form ink front (R-tech §2.13) spreads: a ragged blot whose radius grows with √t, feathery tendrils running ahead along single fibres, a darkest-ink core, a lighter ink-blue body, and a faint pale-blue "damp halo" ahead of the edge. |
| 2.8–3.4 | The camera eases back slightly (fov 22 → 26°) as the front reaches the frame edges. Tendrils cross the viewport edge first, so the ink seems to leave the sheet before the blot does. |
| 3.4 | Hand-over to a screen-space front at half resolution, driven by the same fibre-guided noise. White areas become **islands**. |
| 3.4–3.9 | Coverage climbs from 40 to 95 %. The islands shrink with feathered, fibrous edges (never a clean circle, never a straight wipe). Each DOM text block inverts to paper white once the ink under it passes 50 %. |
| 3.9–4.0 | Fully ink-blue. The CSS ground variable switches, the nav turns paper white, and the canvas clear colour and studio floor become ink-blue. |
| 4.0–4.5 | A fast pull-back (fov 30°) reveals the sheet floating **white** in the ink-blue world at (50, 32), lit from behind so it glows, with a **3 mm ink dot** near its lower-right corner and the micro-label "KEPT." |

The way back to white is not a reverse bleed. A fresh white page (the s11 DOM ground with a crisp paper edge) slides up over the ink at the end of the Arena.

### 5.4 The drying line, card by card (s04)
- **The rig.** A thin graphite cord across the whole viewport (a 3D cylinder about 1 mm in diameter) at y 18 %, and small minimalist graphite spring clips (≈ 18 mm wide; no wooden pegs). The outputs are spaced 26 vw apart. The backdrop is studio white with a soft wall behind, so each card's light pools are visible.
- **Per-card light presets.** These are uniforms or local lights that blend in as each card nears the centre. Only the centred card is at full strength.

| # | Output | Pose | Light |
|---|---|---|---|
| 1 | Haiku, blank | hangs straight, faint flutter | **cool back-light** from behind and above, low front fill: the sheet glows and its formation clouds show |
| 2 | Flight: dart plane | hangs nose-down by its tail, turning ±10° | **warm raking key from the right** at about 70°, crisp wing shadows |
| 3 | Meaning of life, blank | bottom-right corner curling forward (r 20 mm, 60°) | soft overhead key, a deep soft shadow under the curl |
| 4 | Sea: paper boat (hand-modelled mesh, R-tech §2.7) | hangs by its peak | low, cool light from the left, like late-afternoon water light |
| 5 | Report, blank | flat | bright, even, shadowless "office" light: the deadpan card |
| 6 | Air: pleated fan (`uPleat`, proven) | clipped at the top, fanned open | warm top light, the pleats casting fine stripes of shadow |
| 7 | Ignore instructions, blank | straight | **hard side light** from the left with one long, sharp shadow (the only hard shadow on the site) |
| 8 | Art, blank | straight, perfectly still | a single **warm gallery spotlight**: a cone on the sheet and a soft pool on the wall behind |

### 5.5 Light mood per section (it changes between beats; checklist #16)

| Section | Mood | Key / fill / back |
|---|---|---|
| s00 | neutral, technical | flat studio |
| s01 | morning in a white room | warm key top-left, raking 60°; cool fill from the right; soft contact shadow |
| s02 | precise | the key swings to a left rim so the 0.1 mm edge reads as a bright hairline; the background behind the edge ≈ 4 % darker |
| s03 | intimate, a desk at night (still white) | a warmer, closer key with soft falloff; low fill |
| s04 | a gallery of eight lighting setups | per card (5.4); flat light on the numerals, no glow |
| s05 | the measuring room | neutral ≈ 5600 K, crisp shadows, pure white |
| s06 | archival | soft, slightly cool; a back-light only for v2.0 (watermark) |
| s07 | the microscope | grazing key at ≈ 80° from the normal, then the ink-blue world |
| s08 | glow on ink | back-light dominant, so the sheet glows and its formation shows; soft front fill |
| s09 | evening on ink | soft overhead key + low back-light |
| s10 | a fair fight | two identical soft spots |
| s11 | catalogue | neutral studio (the cards carry their own render light) |
| s12 | the print room | neutral, crisp |
| s13 | (none) | canvas idle |
| s14 | the end of the day | a low, warm, golden key from the right; the plane climbs into it |

### 5.6 Claim-card renders (s11) and card design
- **Format.** Our own stills, exported once from the lab scene, as WebP at 2× display size, ≤ 70 KB each (≈ 560 KB total, lazy-loaded as s11 approaches). Same studio, same paper material.
- **Card design.** Paper-white cards with a 1 px graphite hairline and small **crop marks at each corner** (our motif), square corners and a soft contact shadow. No flat colour fields, no full-bleed photos (ORYZO §3.14). Cards alternate **portrait 1 : √2** and **landscape √2 : 1** at the same height (72 % vh): the gallery itself is made of A-series rectangles. The render fills the top ≈ 60 %; below it come the headline, the caption, and the meta row in small uppercase.
- **The renders:**

| Card | Render |
|---|---|
| c1 | the sheet face-on, flat, even light, with fine dimension lines (210 / 297 mm) in the image |
| c2 | a fibre macro under raking light (as in s07 at 2.2 vh) |
| c3 | the sheet at a slight angle with one line of quick pencil handwriting (the same pre-baked stroke as the keyboard path), warm light |
| c4 | a graphite-grey lacquered HB pencil lying diagonally across the blank sheet, top light |
| c5 | the sheet with four short grey text blocks reading "We have solved alignment.", set left, centred, right and justified (real words, no lorem ipsum) |
| c6 | a close view of the 3 mm ink dot on otherwise blank paper, soft light: the dot is the hero |
| c7 | an edge macro: ragged fibres along the edge under grazing light, against the one darker backdrop among the cards |
| c8 | a slender bar: an A4 sheet folded six times **the same way**, across its long side, so it measures ≈ 210 × 4.6 mm and 6.4 mm thick, with all 64 layers visible along the cut face; it lies on the white floor, with a small grey Moon sphere far behind, out of focus |

### 5.7 Illustration style: graphite, not sketchbook
- **Line.** Single-weight graphite lines with real pencil grain (a 1.25 px line at 1×, with a subtle grain texture or SVG turbulence filter). Precise, unhurried, mostly unshaded; at most a few light parallel strokes for shadow.
- **Content.** **Objects only**: never people, never hands, never portraits.
- **Motion.** Drawn on with a stroke reveal (`stroke-dashoffset`) as the element enters, as if being sketched. It sits still once drawn.
- **Clearly not ORYZO (#9, #48):** no red or red-brown ink, no Renaissance figures or period handwriting, no drifting parallax sketches, no iridescent or neon cursor reveals.
- **Testimonial drawings (s09, 96 × 96 px at 1×):**
  - a desktop laser printer with one sheet emerging;
  - a cat asleep, curled on a sheet;
  - a desk lamp over a blank page (the novelist, without the novelist);
  - a shredder with strips beneath;
  - a half-length HB pencil;
  - a recycling bin with one crumpled ball inside.
- **Release-notes glyphs (s06, 16 px line icons, tier B):** a map fragment (v0.1) · a seal (v1.0) · a pin (v1.1) · a scroll (v1.4) · a sheet with a faint mark (v2.0) · a book (v2.1) · a wasp (v2.2) · a folded letter (v2.3) · a roller (v3.0) · a log (v4.0) · a square with "1 m²" (v5.0) · a globe (v5.1) · a screen with a small cross (known issue) · reeds, crossed out (removed).
- **The paper's figures** use the same graphite line style, and the charts are graphite with ink-blue only for the "aviva" series.

### 5.8 Icon set
1.5 px graphite line icons on a 24 px grid with round caps; paper white on ink-blue:
- pencil · eraser (the pencil reversed) · regenerate (a crumpled ball with a return arrow) · tear (a dotted perforation with a small notch) · bar magnifier;
- dog-ear corner (the active nav mark) · crop marks (the logomark) · ruler tick;
- paper plane (release) · copy (two offset sheets) · download (a sheet + down arrow) · external link (a sheet + diagonal arrow);
- printer (shown disabled) · the corner-rating glyph (four corner marks, one missing for 3/4).

### 5.9 Logo, wordmark, favicon, OG image
- **Wordmark.** "aviva", lowercase, in the site typeface at a light or regular weight, slightly tightened. The visual-designer may hand-tune the two a's and the two v's into a balanced custom drawing. The same drawing is used at giant size on the hero floor.
- **Logomark: four crop marks** marking out an empty 1 : √2 rectangle with nothing inside it. It is the concept in one glyph (void of all characters). The lockup is the logomark to the left of the wordmark.
- **Favicon.** The crop-mark logomark as an SVG: graphite on transparent, switching to paper white under `prefers-color-scheme: dark`. Add a 32 × 32 PNG fallback and a 180 × 180 apple-touch icon (paper white with graphite marks).
- **OG image (1200 × 630, our own render).** The hero composition: a high-angle view of the white floor with the giant wordmark, the sheet lying over the "i" with show-through, and a soft key from the top left. The crop-mark logomark sits small at the top left, and "aviva A4. Pre-trained on nothing." in graphite at the bottom left. No other text, no faces, no props.

### 5.10 Static fallback stills (no WebGL; loaded only then)
| id | Still | Size (WebP) | Budget |
|---|---|---|---|
| F1 | Hero: the sheet over the wordmark with show-through (desktop + a 1170 × 1800 mobile crop) | 2400 × 1500 | ≤ 140 KB each |
| F2 | The drying line with all eight outputs | 2400 × 900 | ≤ 140 KB |
| F3 | Ink spreading through the fibres (absorption view) | 1600 × 1000 | ≤ 110 KB |
| F4 | The Arena: two identical sheets on ink-blue | 1600 × 1000 | ≤ 80 KB |
| F5 | Sizes: A5, A4 and A3 side by side, same shape | 1600 × 1000 | ≤ 80 KB |
| F6 | The sheet as a paper plane, gliding away in golden light | 1600 × 1000 | ≤ 80 KB |

The claim-card renders (5.6) are used in both modes.

### 5.11 UI furniture
- **Nav.** Slim, no background bar: the wordmark on the left, four links on the right. The active link is marked with a tiny folded corner. No letter scramble, no page dimming, no dotted underline (#53).
- **The mm ruler.** A hairline on the right edge with ticks every 10 mm and labels every 50 mm. A small marker shows the current position in millimetres. It replaces any visible scrollbar thumb (#24).
- **Scroll hint.** Bottom centre: a small curling-corner icon + "PLEASE TURN OVER". It dims during transitions (technique KEEP, our wording).
- **Rules and dividers.** Solid 1 px hairlines and crop-mark corners; **never dotted** (ORYZO's only divider style). The only dotted line on the site is the tear perforation, which is a paper object rather than a divider.
- **Buttons.** Rectangles with crisp corners (≤ 2 px radius), a hairline border and uppercase labels; primary buttons are graphite with paper-white text, inverted on ink-blue. **Not pills, and nothing glows** (#47). The Arena and print-dialog controls are rectangular segmented controls; each paper-size option carries a tiny sheet icon drawn at its relative size.
- **Inputs.** A ruled line, like lined paper (a solid hairline underline), with a small pencil icon. No dashed boxes and no dotted underline with an arrow (#36, #52).
- **The print dialog.** A faithful, OS-neutral miniature print dialog: a light panel, hairline fields, the greyed-out PRINT button, and the sheet as the live "preview".
- **Grain.** A CSS film-grain overlay at 4–6 % (R-tech §2.12), off in reduced motion.

---

## Part 6. Moments of delight

1. **Print the product.** Ctrl/Cmd + P on any page prints a single blank A4 sheet with one 7 pt line at the foot: "aviva A4 · 210 × 297 mm · You have printed the product." The disclaimer follows in 6 pt. It's a print stylesheet that hides everything else, so the visitor walks away holding the actual product. (It isn't a downloadable PDF and isn't offered as our "weights" or paper; see Part 7, #50.)
2. **The millimetre ruler.** The scroll position is measured in millimetres of A4. At the bottom it reads "297 mm. End of sheet." Scroll back to the top after reaching the end and it reads "0 mm. Blank again." "BACK TO 0 MM" in the footer goes there.
3. **The ream counter.** Every sheet the visitor destroys (Regenerate, Distil, the Arena's loser) is counted: "{n} left in this ream." The footer closes the account: "Sheets used during your visit: {n} of 500."
4. **The dot that stays.** The single ink drop from s07 leaves a 3 mm dot that never goes away. It is labelled "KEPT." when it first appears, it is the hero of claim card c6 ("Ink is forever." · SEE ALSO: THE DOT), and it is still on the sheet when it folds into a plane at the end.
5. **The patient pencil.** The first time the pencil cursor appears, it carries a tooltip: "HB. Graphite, not lead." Hold the pencil still over the sheet without drawing, and the status line says: "aviva is waiting. It is very good at that."

Also in the brief (small, not counted above):
- "VERSO: ALSO BLANK." as the sheet turns (s02);
- the disabled PRINT ("Nothing to print. Nothing is for sale.") and WEIGHTS ("They weigh 4.99 g, by calculation.") buttons;
- the WebGL context-loss message ("This demo can't crash. It can only crease.");
- the 404 page ("Nothing here. To be fair, that is the product.");
- text selection styled as ink (ink-blue ground, paper-white text).

---

## Part 7. Do-not-reuse check

Each line checks one item against teardown §8 (items 1–54) and decisions #7–#10, and says how this brief avoids it.

| # | ORYZO signature element | How this brief avoids it |
|---|---|---|
| 1 | Green cutting-mat desk, top-down, with pencil, cutter, eraser, clips | No desk. An endless white studio. The only props are the drying line and its clips (s04), one pencil (the cursor, card c4), the ink drop and a small Moon (c8). The hero looks down at a bare floor printed with our wordmark. |
| 2 | Six-fingered hand; "try to hover hand" | No hands anywhere, in 3D or in the drawings. The pointer object is a pencil. |
| 3 | Rainbow AI-glow border cycling hue | No glow or border effects. Ink-blue never glows (5.1). |
| 4 | Wrapper tearing | No wrapper. Our tear is the product itself, along its midline, as a measured distillation (s05). |
| 5 | "It's wearable" + lifestyle photos | No wearable claim or word, no photos, no paper hat. The gallery is of outputs on a drying line. |
| 6 | RISE magazine cover (serif masthead, roundel, doom line) | No magazine. No serif display type on the site (a text serif is used only inside the PDF). |
| 7 | Pegboard desk with keyboard, controller, headphones, takeaway cup | Row 7 is dropped. No product-in-context scene, no cups. |
| 8 | Thermal-camera view | Our alternate vision is the ink-absorption view: monochrome ink-blue on fibres, not a heat ramp. No temperature language. |
| 9 | "37.9 % more circular" + da Vinci sketches | No improvement percentage. Our precision claim is the true √2 ratio with real dimension lines. Illustrations are graphite objects, with no Renaissance sketches and no red ink. |
| 10 | Flip encryption | Nothing is hidden or decrypted. The gimmick is "Distil it" (a tear). Decision #7. |
| 11 | "Grip-locked antislip" + friction coefficient | No grip or friction claim. The macro is "No glue. Just attraction." (hydrogen bonds, R§1.7). |
| 12 | Cork-bark macro | A macro of paper fibres; no bark. |
| 13 | Reviewers: astronaut, pirate, AI influencer, minimalist, flat-earther | A printer, a cat, a novelist (an unnamed role), a shredder, an HB pencil, a recycling bin. |
| 14 | "Runs on the edge / refuses the cloud", "always on", "runs on RTX 3090", "drop-tested", "legacy support" | Our claims: context window, zero hallucinations, refusal rate, needle in a haystack, alignment, unlimited undo, known side effect, the Moon roadmap. "Edge" means only the paper's physical edge (c7), never edge computing. |
| 15 | Red smoky / neon glow on the tier picker | No glow. The tier picker is a print dialog. |
| 16 | Floating particles at the end | The ending is one sheet folding into a plane and leaving. No particle field. |
| 17 | "If we can sell a coaster…" | The closing lines are "Pre-trained on nothing. Fine-tuned on you." and "aviva A4 has been released.", with no "if we can sell" construction. |
| 18 | Dark brown / cork orange / cream / green palette; bold grotesk; wide geometric wordmark | Paper white, studio white, graphite, ink-blue. One calm, light-weight typeface. The wordmark is lowercase and not wide-geometric. |
| 19 | Vector construction-drawing loader (dashed double circle, orange bezier handles, smart guides, conic fill, flat colour ground) | Crop marks + dimension lines + a millimetre counter on white. No circles, handles, conic fill or coloured ground. Decision #10. |
| 20 | Vector-ring ↔ object match-cut as a recurring motif | The drawing → sheet match-cut happens **once** (s00). Mid-page dimension lines are overlays on the live sheet, never cuts. |
| 21 | Giant wordmark top-left settling from large and translucent; tagline typed above it | The wordmark is printed on the floor in the 3D scene, centred, and seen *through* the sheet. The h1 is a sentence, centred at the top. Nothing is typed in. |
| 22 | Bottom-left studio-credit glass panel with dotted rule + superlative | No glass panels. The side copy is plain, centred, at the bottom. |
| 23 | Launch-film thumbnail with presenter, glowing border, PLAY | No video, no thumbnail. |
| 24 | Scrollbar as a labelled vertical tab; cream 9 × 150 thumb | The millimetre ruler: a hairline, ticks and a readout. |
| 25 | "X isn't just an X. It's the result of…" with headline left, body right | s02 opens "0.1 mm.", stacked above and below the sheet. No "isn't just". |
| 26 | Asterisk on "AI" redefined in a corner footnote; the finger-count quip | No asterisk. The AI beat is "Intelligence not included." The s04 line "Strictly speaking, we calculated them." is a precision note under the body, not a redefined term. |
| 27 | Orange model-name tag tucked under the headline's end | The model name appears in eyebrows and side copy ("INTRODUCING aviva A4"), never as a tag under a headline. |
| 28 | Dashed selection frame with corner dot, dotted circle, tick marks | None. Crop marks appear only in the loader, the logomark and at card corners, never framing the product. |
| 29 | Product through giant fit-width lowercase type that blooms; the "SO PORTABLE," eyebrow-with-comma formula | The fly-through technique is kept in s04, but with the numerals "4.99 g", no bloom, no comma-eyebrow + lowercase payoff, and the sheet *falls like a leaf* rather than tipping and rising. |
| 30 | 3D → photo hand-over inside a portrait frame; magnifying-window gallery with thumbnail strip and smear | No photos. A drying line of live 3D outputs moves 1:1 with scroll. No thumbnail strip, no magnified window, no smear. |
| 31 | In-photo captions (WARNING bar; DM-style line with SEND pill) | Our captions are PROMPT / OUTPUT pairs under each hanging sheet. |
| 32 | Gallery frame expanding to full-bleed to become the next scene | Our signature is The Bleed (ink absorption through fibres), not an expanding frame. |
| 33 | Frosted left-panel template; serif formula + caption at bottom-right | No frosted panels. Feature copy is centred or stacked around the sheet. Maths lives in dimension lines on the sheet and in the s05 metric triplet. |
| 34 | LLM sampling temperature as literal temperature; CREATIVE / BALANCED / DETERMINISTIC scale | No temperature mapping. Ignition is mentioned only in the PDF's Safety section, as a sourced range with the Fahrenheit 451 note. The fan's prompt is "I need some air.", not "cool me down". |
| 35 | AI acronyms re-expanded as backronyms | None. |
| 36 | Engraved / typed text on the product | Visitors draw freehand with a pencil. The keyboard path draws a pre-baked stroke and echoes the typed text **in the DOM only**. Visitor text is never printed on the sheet. The c5 render shows our own fixed lines. |
| 37 | Friction spec card (cream header bar, micrograph, mirrored fade) + dashed arc drag slider with hand icon | The macro widget is a bar magnifier you drag. The draggable gimmick is the tear line. No header-bar card, no arc, no hand icon. |
| 38 | Bark cracking and swinging open like doors to reveal a giant word | None. Our tear is the product's own and reveals two smaller sheets, not a word. |
| 39 | "sustainability" giant word; "VEGAN-FRIENDLY / 100 % PLANT-BASED"; the pun; dark → cream inversion with leaf gobo | s08 is "It comes back." with three sourced cards. Our colour change is The Bleed (white → ink-blue, by absorption). No gobo, no plant-based claims. Decision #9. |
| 40 | Three info cards incl. the giant low-contrast numeral card and "power draw while in use" with "thank you" pills | Our cards: 5–7 lives, ≈ ¾ recycled in Europe, ≈ 4.6 g CO₂e. They are sheet-shaped with a dog-ear: no power, compute or token card, no pills, no giant numeral bleeding off a coloured card. |
| 41 | Testimonial assembly (headline left + lead right; RATING & REVIEWS header with bracketed counts; 5/5 stars + one orange phrase + photo far right; product turning edge-on) | "Rated in corners.": a corner glyph, no stars, no bracketed counts, no highlighted phrase, no photos, small graphite drawings. The sheet in the centre gets a dog-ear instead of turning edge-on. |
| 42 | Parody thumbnails (YouTuber face; support group) | None. |
| 43 | Sticker-covered and colour-stacked product cards | None. The cards are A-series sheets carrying renders of the plain sheet. |
| 44 | Mug composited in front of a claim headline | No mugs and no foreground compositing over headlines. |
| 45 | "Drop-Tested" metadata row; "Legacy Support" ancient vessels with monospace museum captions | Our meta rows are measurement notes. History lives in a changelog list (s06), not a line-up of objects with museum captions. |
| 46 | "Choose you own" eyebrow over a giant wordmark passing in front of the product, shrinking into a header | s12 is "PAPER SIZE / One shape. Three sizes." with a print dialog. No giant wordmark in the tier section. We never say "choose your own". |
| 47 | ORYZO / Pro / Pro Max as three glowing pills; stack of 1/2/3; comparison with orange "New" and rounded rows | Sizes A5 / A4 / A3: **scale, not count**, so no stack. A rectangular radio group, a plainly ruled table, no "New" tag, no "Pro Max". Decision #10. |
| 48 | Cursor-following light revealing red neon sketches | None. The s06 watermark is a scroll-driven back-light, not a cursor light, and there are no sketches. |
| 49 | Academic block: "single-shot espresso'd"; "trust me bro" peer review; `@misc{…2026}` with `howpublished = {OBJ release}`; "Code: coming soon" | The acknowledgement thanks the pencil. The peer review is Reviewer 2. The BibTeX is an `@inproceedings` with no `howpublished`. No "coming soon". |
| 50 | Repo jokes: `.obj` checkpoints named like LLM sizes ("a0b", "instruct", "frontier"); WoodenBench on a desk; paper.pdf = one A4 page with a centred title | A single `aviva-a4.obj` named after the size; no benchmark-on-a-desk. Our paper is a real 8-page paper (decision #8). The print easter egg (Part 6, #1) is a print stylesheet, not a file. It prints a blank sheet with a 7 pt line at the foot, not a centred title, and it is never offered as weights or as the paper. **Flag for the lead:** drop it if the similarity audit disagrees. |
| 51 | Typed two-line confession + pitch with a travelling block cursor; studio pill button | Our ending: the visitor's drawing returns ("Fine-tuned on you."), "Release it." folds the sheet and flies it out, then a plain credit line and a rectangular button. No confession, no pitch, no block cursor. |
| 52 | Footer credit box (dashed border, "built with love", "share with friends", "copy URL" pill) | A colophon, the live ream count, the disclaimer and plain links. No dashed box, no share or copy-URL pill. |
| 53 | Nav scramble on hover + page dim; INTRO / FEATURES / PRODUCT / CONTACT; dotted active underline | SHEET / SPECS / SIZES / PAPER. The active link carries a tiny folded corner. A plain hover state (the visual-designer's call). No scramble, no dimming. |
| 54 | Thin serif formula as a large corner ornament | None. Numbers are set in the sans with tabular figures, in context. |
| D7 | Decision #7: no fold-to-encrypt | The gimmick is a tear (Distil it). Nothing anywhere is hidden, sealed, encoded or decoded. |
| D8 | Decision #8: no blank-A4-PDF-as-weights; a real multi-page paper | The paper is 8 pages with real structure (Part 4). "WEIGHTS · 4.99 g" is a disabled button joking about mass, and no blank PDF is downloadable anywhere. |
| D9 | Decision #9: no "power draw: 0 W", no giant "sustainability", no power or uptime claims | None of these appear. s08 has a statement and three sourced cards. No battery, power, uptime, "always on" or "no updates" lines anywhere. |
| D10 | Decision #10: no exact "Pro Max", no three glowing pills; loader with dimension lines and crop marks only; no repeated drawing ↔ object match-cut | All four are met (see #19, #20, #47). |

Banned-word sweep of Part 3: none of the R§7.6 punchlines and none of our cliché list appear in the site copy.

---

## Part 8. Needs and resolved questions

### From the researcher: resolved by the fact-check (`work/reviews/brief-factcheck.md`, R§13.10)
1. **Gallivan's booklet:** *How to Fold Paper in Half Twelve Times: An "Impossible Challenge" Solved and Explained*, Historical Society of Pomona Valley, 2002 (applied in Part 4.4).
2. **Business Week:** "The Office of the Future", 30 June 1975. The forecast is a consultant's, quoted in the article; no page range is printed (applied in s06.e13, paper §2 and Part 4.4).
3. **Priestley:** *A Familiar Introduction to the Theory and Practice of Perspective* (London: J. Johnson and J. Payne, 1770). He *recommended* Nairne's gum; he did not name it "rubber" (applied in paper §6 and Part 4.4).
4. **ISO 216:2007**, cited by year (it replaced ISO 216:1975). No edition number is printed (Part 4.4).
5. **C5 row:** verified. A5 fits flat, A4 folded once, A3 folded twice (derived) (s12 table, unchanged).

**Still open (optional):** R§13.10 #17 names ScienceAlert as a second source for the jagged-edge and clotting claims, but gives no title or URL. The PDF therefore cites Big Think, which R§13.10 #17 does give, alongside Vallabh (Ohio State). Add a ScienceAlert entry only if the researcher supplies its details.

### Open questions I resolved myself
1. **"Cool me down." became "I need some air."** (s04 card 6), so there's no temperature or thermal echo of ORYZO #8 / #34.
2. **"Intelligence sold separately" became "Intelligence not included."** Nothing is for sale (rule 9).
3. **Show-through is contact show-through.** The wordmark is printed on the floor and the sheet lands on it, which is physically right (print shows through paper that rests on it) and gives a precise, gap-driven shader fake (5.2).
4. **The ink dot persists from s07 to the end.** It gives continuity, proves "Ink is forever", and travels with the plane.
5. **The keyboard path draws a pre-baked stroke** and echoes the typed text in the DOM only (it avoids #36), as the lead asked.
6. **Facts updated per R§13:**
   - Europe: "about three-quarters" / 75.1 % (2024) instead of 79.3 %.
   - Rauschenberg: "spent weeks".
   - Locke: no year in site copy; "1689/1690" in the paper.
   - Weights: "about 2.5 g" and "about 1.25 g" in the tear readouts; calculated ISO values in the table, with "calculated, not weighed".
   - Carbon: Dias & Arroja 2012, 4.3–4.7 g.
   - Guinness eligibility added (s04 card 2).
   - Pencil and eraser facts used in s03, s11 c6 and paper §6.
7. **"We weighed the weights." stays.** The headline is a joke, and the honest note "Strictly speaking, we calculated them." follows it (R§13.1).
8. **All four borrowed lines are placed** (enrichment 2):
   - c3 "Refusal rate: 0.0 %.";
   - c5 "Alignment: left, centre, right or justified.";
   - c8 "Our roadmap reaches the Moon. Our sheet reaches 6.4 mm." (the fact-check passed: R§13.2);
   - "This demo can't crash. It can only crease.", as the WebGL context-loss message.
9. **Distil it costs one sheet** in the ream counter, not four.
10. **The Arena sits between the testimonials and the claim gallery**, and its winner leads the return to white. All four deviations from the KEEP rhythm are justified in Part 2.
11. **"Selected outputs" has 8 outputs:** 5 blank, plus plane, boat and fan, with no hat (enrichment 1).
12. **The pencil appears in s03 and s14** (enrichment 4), with keyboard and touch paths, and as an object in claim card c4.
13. **The colophon doesn't name the typeface**, so no placeholder is needed; CREDITS.md names it.
14. **The footer's "Our code: MIT licence."** assumes the lead adds the MIT LICENSE, as the lead's instructions say.
15. **Nav "PAPER" links to "The paper."** (the research). The double meaning is intended.

---

## Part 9. Changelog (fact-check pass, 2026-10-02)

Source: `work/reviews/brief-factcheck.md` (78 rows + the must-fix list) and `work/01-research.md` §13.10. Every change below is already applied in Parts 1–8. **Old → new**, so the web-developer (site copy) and the visual-designer (PDF, renders) can apply the diffs. "FC row n" refers to the fact-check table.

### 9.1 Site copy (web-developer: update the DOM text)

| # | Id / location | Old | New | Why |
|---|---|---|---|---|
| 1 | `s03.note` | Pencil sits on the fibres, so it erases. Ink soaks into them, so it doesn't. | Pencil mostly sits on the fibres, so it mostly erases. Ink soaks in, so it doesn't. | FC row 21 (hedge once: "largely") |
| 2 | `s04.note` | Strictly speaking, we calculated them. Real sheets vary by about ±2.5 %. | Strictly speaking, we calculated them. Real sheets vary by a few per cent. | Must-fix 7 / FC row 24 |
| 3 | `s04.c2.meta` | Eligible for both paper-aircraft world records. Entered neither. | Its paper qualifies for both paper-aircraft world records. Entered neither. | FC row 25 (precision: the rules are about the paper) |
| 4 | `s05.m3` | A0 to A10. Every one is 1 : √2. | A0 to A10. Every one is 1 : √2, to the nearest millimetre. | Must-fix 12 / FC row 29 |
| 5 | `s05.g.body` | Distillation makes small models from a large one without losing what it knows. Tear aviva in half: two smaller models, the same shape, the same knowledge. None. | Distillation trains a small model to keep what a large one knows. Tear aviva in half: two smaller models, the same shape, the same knowledge. None. | Must-fix 4 / FC row 32 |
| 6 | `s06.e1.t + .n` | Initial release. / Earliest surviving fragment, found at Fangmatan, Gansu. Used for a map, probably. | Initial release. Ships with a map. / The earliest known paper bearing a drawing: a map, found at Fangmatan, Gansu. | Must-fix 13 / FC row 4 |
| 7 | `s06.e2.n` | Cai Lun presents a paper of mulberry fibre, hemp, rags and old fishing nets. Marketing begins. | Cai Lun presents a paper of tree bark, hemp, rags and old fishing nets. Marketing begins. | Must-fix 8 / FC row 5 |
| 8 | `s06.e4.t + .n` | First dated printed book. / The Diamond Sutra. Its licence: "for universal free distribution". | Oldest surviving dated printed book. / The Diamond Sutra. Its colophon doubles as a licence: "for universal free distribution". | Must-fix 9 / FC row 7 |
| 9 | `s06.e5.d` | 1282 | c. 1282 | FC row 8 (optional precision) |
| 10 | `s06.e6.d` | 1455 | c. 1455 | FC row 9 (printing finished 1454–55) |
| 11 | `s06.e9.n` | Nicolas-Louis Robert patents the first paper machine. aviva becomes endless, in one direction. | Louis-Nicolas Robert patents the first paper machine. aviva becomes endless, in one direction. | FC row 12 (name order as on Wikipedia, easier to check) |
| 12 | `s06.e13.n` | Predicted by Business Week. Global paper use then doubled between 1980 and 2000. | Business Week quotes a forecast: by 1990, most record-handling will be electronic. World paper and board production then nearly doubles, from 171 to 324 million tonnes (1980–2000). | Must-fix 5 / FC row 15 |
| 13 | `s07.body` | Up close, aviva is a mat of cellulose fibres. As it dries, hydrogen bonds between neighbouring fibres hold it together. Nothing else does. | Up close, aviva is a mat of cellulose fibres. As it dries, hydrogen bonds between neighbouring fibres hold it together. Nobody taught it that. | Must-fix 3 / FC row 17 (a true undercut that echoes "pre-trained on nothing", instead of a hedge) |
| 14 | `s08.c1` | Paper fibres survive five to seven trips through recycling. Each trip shortens and stiffens them, until they no longer bond. | Paper fibres are usually said to survive five to seven trips through recycling, each one leaving them shorter and stiffer. Researchers are aiming for 25. | Must-fix 6 / FC row 33 |
| 15 | `s08.c3.l + .b` | CO₂e PER SHEET / One study of an 80 g/m² A4 sheet put it at about 4.3–4.7 g of CO₂e, depending on the method. The sheet itself weighs about 5 g. | CO₂e PER SHEET (ISO METHOD) / One study of an A4 sheet of office paper found 4.3–4.7 g of CO₂e, depending on the method: 4.6 g by ISO's. The sheet itself weighs about 5 g. | Must-fix 14 / FC row 35 |
| 16 | `s11.c6.cap` | Pencil only. Graphite sits on the fibres; ink soaks into them. Ink is forever. | Pencil only. Graphite mostly sits on the fibres; ink soaks in. Ink is forever. | FC row 21 (hedge) |
| 17 | `s11.c7.cap` | … Fingertips are packed with nerves, and the cut is too shallow to clot. | … Fingertips are packed with nerves, and the cut is usually too shallow to clot. | Must-fix 11 / FC row 41 |
| 18 | `s11.c7.m` | Its jagged edge saws rather than slices, and the cut is too shallow to clot. | Its jagged edge saws rather than slices, and the cut is usually too shallow to clot. | Must-fix 11 / FC row 41 |
| 19 | `s11.c8.cap + .alt` | cap: … By Gallivan's formula, an A4 sheet stops at six. / alt: A small, thick block of paper folded six times, with a tiny grey Moon far behind it. | cap: … By Gallivan's formula, an A4 sheet folded the same way each time stops at six. / alt: A slender bar of paper, an A4 sheet folded six times the same way, with a tiny grey Moon far behind it. | Must-fix 1 / FC row 43 |
| 20 | `s11.c8.m` | In theory, 42 folds pass the Moon. In practice, an A4 sheet stops at six. | In theory, 42 folds pass the Moon. Folded the same way each time, an A4 sheet stops at six. | Must-fix 1 / FC row 43 ("in practice" was never measured) |
| 21 | `s13.btn.weights.tip` | Not downloadable. They weigh 4.99 g. | Not downloadable. They weigh 4.99 g, by calculation. | FC row 50 (consistent with "calculated, not weighed") |
| 22 | `s13.dist` | Distribution: "for universal free distribution", as the Diamond Sutra put it in 868. | Distribution: "for universal free distribution", as the Diamond Sutra's colophon put it in 868. | FC row 7 |

### 9.2 Research paper: text, figures, tables (visual-designer: the PDF)

| # | Id / location | Old | New | Why |
|---|---|---|---|---|
| 23 | `paper.abstract` | We find a hard scaling limit at six folds, … | We find a hard scaling limit at six folds made the same way each time, … | Must-fix 1 / FC row 68 |
| 24 | `paper.§2.paperless` | In 1975 Business Week predicted … Global paper consumption then doubled between 1980 and 2000 … We thank the prediction … | In 1975 Business Week reported a forecast … World paper and board production then nearly doubled, from 171 to 324 million tonnes between 1980 and 2000 … We thank the forecast … | Must-fix 5 / FC rows 57, 58 |
| 25 | `paper.§2.attention` | Prior work established that attention is all you need [Margin & Gutter, fictional]. | Recent work argues that attention is all you need, except here [Margin & Gutter]. | FC row 60 (a real title must not be credited to fictional authors; "fictional" no longer printed in the PDF text) |
| 26 | `paper.§3` | … standardisation followed 136 years later. | … DIN standardisation followed 136 years later. | FC row 61 |
| 27 | `paper.§4` | The fibres themselves were never consulted: … hold it together, and no further supervision is applied [materials, R§1.7]. | The fibres were not supervised either: … hold it together unprompted. Fillers and sizing, added at the mill, are the only post-training. | FC row 66 (fillers and sizing exist) + the brief tag moved out of the PDF text |
| 28 | `paper.§5.6` | … so six folds is the ceiling (Figure 4). The record, 12 folds, was set by Britney Gallivan in 2002 … | … so six single-direction folds is the ceiling (Figure 4). Her second formula, for folds in alternating directions, permits a seventh; we leave this to future work. The record, 12 folds, was set by Gallivan herself in 2002 … [Guinness World Records]. | Must-fix 1 / FC rows 43, 68 |
| 29 | `paper.fig4` | label "wall"; caption "Figure 4. Scaling behaviour. The dashed line is our roadmap. The solid line is our sheet." | label "wall (same direction each time)" + an open dot "alternating: 7"; caption "Figure 4. Scaling behaviour for folds made the same way each time. …" | Must-fix 1 / FC row 68 |
| 30 | `paper.§6` | The material for erasing pencil was named "rubber" by Joseph Priestley in 1770 [Priestley]. (+ two in-text [R§13.8] tags) | In 1770 Joseph Priestley recommended a new gum, sold by Edward Nairne, as "excellently adapted to the purpose of wiping from paper the mark of black-lead-pencil" [Priestley]; it soon came to be called rubber. (+ in-text tags replaced by [Popular Science] and [Hawkeye Forensic]) | Must-fix 2 / FC row 71; brief tags removed from the PDF text |
| 31 | `paper.§6.tag` | (R§13.8 high / med) | (R§13.8 high / med · R§13.10 #6 med) | tag only |
| 32 | `paper.§7` | … too shallow to clot [Ohio State] … the widely known figure of 451 °F comes from a novel [Bradbury]. | … too shallow to clot [Big Think; Vallabh] … the widely known figure of 451 °F was popularised by a novel [Bradbury]. | Must-fix 11 / FC rows 72, 73 |
| 33 | `paper.§7.tag` | (R§3.4 high · R§3.3 med) | (R§3.4 · R§13.10 #17 · R§3.3 med) | tag only |
| 34 | `paper.§8` | One life-cycle study of an 80 g/m² A4 sheet … Paper fibres can be recycled five to seven times … [hornification], | One life-cycle study of an A4 sheet of office paper … 4.64 g under ISO 14040/44 … Paper fibres are usually said to survive five to seven rounds of recycling …, although researchers are aiming for 25 [Karlstad University]; | Must-fix 6, 14 / FC rows 74, 75 |
| 35 | `paper.§8.tag` | (R§13.4 high · R§3.5 high · R§13.3 high) | (R§13.4 high · R§3.5 · R§13.10 #9, #16 · R§13.3 high) | tag only |
| 36 | `paper.table4` | Folds before the wall / 6 | Folds before the wall, same direction each time / 6 / + new row / Folds before the wall, alternating directions / 7 (ideal) | Must-fix 1 / FC row 68 |

### 9.3 Research paper: references, page 8 (visual-designer: the PDF)

| # | Id / location | Old | New | Why |
|---|---|---|---|---|
| 37 | `ref.Big Think (new) + Bradbury` | Bradbury, R. (1953). Fahrenheit 451. | Big Think. Here's why paper cuts hurt so damn much (web article). (new) · Bradbury, R. (1953). Fahrenheit 451. New York: Ballantine Books. | FC R1, row 72 |
| 38 | `ref.Business Week` | Business Week (1975). The office of the future. (title to be confirmed) | Business Week (1975). The Office of the Future. Business Week, 30 June 1975. | FC R2 |
| 39 | `ref.Dias & Arroja` | … Journal of Cleaner Production, 24, 30–35. | … Journal of Cleaner Production, 24, 30–35. doi:10.1016/j.jclepro.2011.11.005 | FC R3 |
| 40 | `ref.DIN 476` | DIN 476 (1922). Paper formats. Deutsches Institut für Normung. | DIN 476 (1922). Papierformate. August 1922. | FC R4 |
| 41 | `ref.EPRC` | European Paper Recycling Council (2025). Press release on the 2024 European paper recycling rate. | European Paper Recycling Council (2025). European Paper Recycling Council reports strong recycling rates for 2024. Press release, July 2025. | FC R5 |
| 42 | `ref.Gallivan` | Gallivan, B. (2002). Folding paper in half twelve times. (title to be confirmed) | Gallivan, B. (2002). How to Fold Paper in Half Twelve Times: An "Impossible Challenge" Solved and Explained. Pomona, CA: Historical Society of Pomona Valley. | FC R6, §3 item 1 |
| 43 | `ref.Hawkeye (new) + ISO 216 + Karlstad (new)` | ISO 216 (first edition 1975). Writing paper and certain classes of printed matter: trimmed sizes, A and B series. (to be confirmed) | Hawkeye Forensic. Can you erase the evidence? … (new) · ISO 216:2007. Writing paper and certain classes of printed matter — Trimmed sizes — A and B series, and indication of machine direction. Geneva: ISO (replaces ISO 216:1975). · Karlstad University. Mystery around hornification about to be solved (new) | FC R8, §3 item 4; new citations for paper §6 and §8 |
| 44 | `ref.Ohio State → Popular Science (new) + Priestley` | Ohio State University Wexner Medical Center. Why do papercuts hurt so much? · Priestley, J. (1770). On the "rubber" … (to be confirmed) | Popular Science. How do erasers work? (new; the Ohio State article moves to "Vallabh, J." below) · Priestley, J. (1770). A Familiar Introduction to the Theory and Practice of Perspective. London: J. Johnson and J. Payne. | Must-fix 2 / FC R11, R12 |
| 45 | `ref.Rauschenberg` | … San Francisco Museum of Modern Art. | … San Francisco Museum of Modern Art, accession 98.298. | FC R13 |
| 46 | `ref.Sellen & Harper + Vallabh (new)` | Sellen, A. J., & Harper, R. H. R. (2003). … | Sellen, A. J., & Harper, R. H. R. (2002). … · Vallabh, J. (2025). Why do papercuts hurt so much? The Ohio State University Wexner Medical Center blog, 9 May 2025. (new) | Must-fix 10 / FC R14, R11 |

### 9.4 Visual direction and brief-only notes

| # | Id / location | Old | New | Why |
|---|---|---|---|---|
| 47 | `Part 5.6 c8 render` | a small, thick block (A4 folded six times, ≈ 26 × 37 mm, visibly layered) … | a slender bar: an A4 sheet folded six times the same way, ≈ 210 × 4.6 mm and 6.4 mm thick, 64 layers visible … | Must-fix 1 / FC D3 (a 26 × 37 mm block is an alternating fold) |
| 48 | `Part 6 (delight list)` | WEIGHTS ("They weigh 4.99 g.") | WEIGHTS ("They weigh 4.99 g, by calculation.") | follows s13.btn.weights.tip |
| 49 | `Part 1 (story tag)` | R§13.6: high for the wording, med for the year | published December 1689, 1690 on the title page; R§13.10 #15: high for both | FC row 1 (year upgraded) |
| 50 | `Part 5.2 (shader note)` | about 94 % opaque | about 92–96 % opaque | FC D1 |
| 51 | `Part 8 (researcher needs)` | five open requests | marked resolved, with the details; one optional item left (ScienceAlert details) | fact-check §3 |

### 9.5 Reviewed and deliberately unchanged

- `s09.r6` (bin: "Five to seven times, I'm told."): already hedged; FC row 37 rates it correct as a joke.
- `s04.c8.o` and paper §2 ("Rauschenberg spent weeks erasing…"): FC rows 26 and 56 rate "weeks" correct (it covers both "about a month" and "two months").
- `s05.fallback` ("Every piece would still be 1 : √2."): torn halves are 148.5 × 210 mm and 105 × 148.5 mm, so the ratio is 1.414 to three decimals (derived).
- `s06.e3` (Samarkand) and `s06.e10` (Keller): correct as written; the optional extra detail (Fenerty) isn't needed for the joke.
- The headline `s11.c8.h` ("Our roadmap reaches the Moon. Our sheet reaches 6.4 mm."): still true. Six same-direction folds give 64 layers = 6.4 mm (R§13.2).
- Everything the fact-check marked **correct** (A-series numbers, 440,000 km, 75.1 %, the Dias & Arroja figures, Locke, C5, the Guinness rules, 451 °F as hedged, Lichtenberg, 136 years).

**Total: 51 changelog entries** covering 26 site-copy ids, 14 paper changes (11 to the text, figures and tables, 3 to source tags only), 15 reference lines (11 corrected or completed, with the Ohio State entry now under Vallabh, plus 4 added: Big Think, Hawkeye Forensic, Karlstad University and Popular Science) and 5 design or brief notes.
