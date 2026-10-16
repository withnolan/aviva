# Density comparison: ORYZO vs aviva (decision #35)

Reviewer: reference-analyst. Desktop 1440x900 only. Date of captures: 2026-10-16.
Scope: how many "rich elements" a visitor sees per screen on each site, and which of our screens feel emptiest next to ORYZO's equivalent beat. This is a density review, not a similarity review; every filler below is a *type* of element, never ORYZO's content.

## 1. Sources and how the capture was solved

| Side | Source | What it covers |
|---|---|---|
| ORYZO (primary) | 40 live frames, `work/screenshots/density/oryzo/oryzo-00..39.jpg`, made by `work/scripts/oryzo-capture.mjs` | Whole page: scrollY 0 to 55,791 px (page is 56,691 px = 63 viewports tall once loaded), one frame every 1,431 px (1.59 vh). Verified: frame 20 is the middle (28,611 px, green-mat desk), frame 39 is the end (coffee-bean field and the fiction disclaimer). |
| ORYZO (detail) | The user's recording, `reference/oryzo-frames/` | Used for 3 beats where the live frame was caught mid-animation or the beat is too fast for 1.6 vh sampling: the hero (rec 02-03, because live y=0 was still blurring in under software WebGL), the horizontal claim gallery (rec 59-77, 8 cards in about 7 live-frame-equivalents), the tier picker (rec 78-82, red glow and wireframe coasters had not appeared yet live), the thermal beat (rec 28-29) and the ending (rec 84). Frames 00 and 37 in the table below carry recording values. |
| aviva | 30 frames, `work/screenshots/density/aviva/aviva-00..29.jpg`, same script with `--url http://localhost:8080/?nointro --n 30` (uses `window.__aviva.scroll.scrollTo(y, {immediate:true})`) | Whole page: 0 to 51,300 px (58 vh), one frame every 1,769 px (1.97 vh). Last frame is the footer. |

**The ORYZO stall is solved, and it was a timing artefact, not a scroll lock.** oryzo.ai ignores or snaps back native scrolling during roughly the first 15-20 s of headless load (software WebGL runs at about 1 fps), and `scrollHeight` is re-measured at about 15 s (49,967 px to 56,691 px). After 25-30 s, plain `window.scrollTo({top, behavior:'instant'})` is honoured everywhere: I tested 9,200 / 12,000 / 20,000 / 30,000 / 45,000 / 55,000 and each held. There is no `window.lenis`, no `lenis` class on `<html>`, and 6 canvases. The earlier "stuck at 9,200" came from my own probe, where I scrolled to 9,000 and then relied on wheel/End, which feed ORYZO's smoothed scroller and crawl at 1 fps. The script waits 30 s after load, then jumps and waits 2.5 s per frame; it re-reads `scrollHeight` for each step. Run time about 5.5 min for 40 frames. Asset check: ORYZO transferred about 16 MB on load (about 180 requests) in my probe; I did not download or keep any asset.

Caveats on the counting: (a) counts are judgement, but one rule set was applied to both sites (below); (b) at 1 fps some ORYZO frames are mid-transition, which lowers their counts slightly (a hint that the real numbers are a bit higher); (c) sampling every 1.6-2.0 vh can skip a short beat; (d) persistent chrome (nav, "scroll to continue", scroll thumb, aviva's mm ruler and "please turn over" hint) is counted on neither side.

### Counting rules (columns in the per-screen tables)
- **S**: a photoreal or 3D scene/environment, one per screen at most (two when a second visual mode is in play, e.g. thermal over desk).
- **P**: distinct props beyond the hero object (things you could name: a controller, a hanging output, a fan).
- **I**: distinct 2D images or renders (photo cards, claim cards, thumbnails, the magazine cover).
- **L**: illustrations, icons, drawn graphics.
- **M**: motion moments visible on that screen, judged from the neighbouring frames (a transform, wipe, tear, flip, slice, scroll-driven reveal).
- **A**: interactive affordances (buttons, inputs, toggles, drag or hover hints).
- **N**: annotations and callouts (leader lines, dimension lines, formulas, spec cards, captions tied to the object, stat rows).
- **R** (rich elements) = S + P + I + L + M + A + N. **C** = visible lines of copy (not counted in R).
- "Photoreal/staged" = S + P + I.
- **Lone-object screen** (strict): S + P + I + L + A + N is 1 or less, so the hero object and text and nothing else static. **Loose**: 2 or less (one object + one guide, button or callout).

## 2. Side-by-side

| Metric | ORYZO (40 screens) | aviva (30 screens) | Reading |
|---|---|---|---|
| Page length | 63 vh | 58 vh | similar length, so density is a fair comparison |
| **Average rich elements per screen (R)** | **6.8** (max 15, median 6) | **4.5** (max 7, median 5) | we have about two thirds of ORYZO's density |
| Screens with R of 8 or more | 32 % | **0 %** | ORYZO has a dense peak every third screen; we never do |
| Screens with R of 3 or less | 10 % | **33 %** | one in three of our screens is near empty |
| Average photoreal / staged elements (S+P+I) | 2.9 | 1.5 | 1.9x |
| Average props beyond the hero (P) | 1.25 | 0.47 | 2.7x |
| Average images + illustrations (I+L) | 1.3 | 0.4 | 3.3x: our biggest gap |
| Screens with at least 3 staged elements | 38 % | 17 % | |
| Average motion moments (M) | 1.9 | 1.2 | 1.6x |
| Average annotations / callouts (N) | 1.2 | 0.8 | 1.5x |
| Average interactive affordances (A) | 0.45 | 0.8 | we lead (pencil, vote, print, tear, magnifier) |
| Average lines of copy (C) | 5.2 | 7.7 | we write 1.5x more per screen |
| **"Just one object + text", strict** (S+P+I+L+A+N of 1 or less) | **10 %** (4 screens: the bark macro, bark-to-type, the tan and cream sustainability type screens: full-bleed photoreal or giant type, not a lone object) | **30 %** (9 screens: hero, thin tilt, edge-on, float in grey, 4.99 g, lone sheet on cream, absorption, indigo sheet, blank handover) | |
| "Just one object + text", loose (2 or less) | 22 % (9 screens) | 33 % (10 screens) | |
| Distinct visual set-ups (grounds/environments) | **19 families, about 26 counting each gallery card as its own set** | **12 grounds, of which only 3 are staged sets** (clothesline, fibre macro, ink field) | |

**One-line diagnosis.** aviva is not short of words or controls (it has more copy and more affordances per screen than ORYZO). It is short of *things to look at*: pictures and illustrations are 3.3x thinner, props 2.7x thinner, and nearly every screen is "the sheet in a coloured void". ORYZO changes the world every 1-3 screens; we change the paint colour.

### ORYZO's distinct set-ups (19 families)
1 blurred desk hero with props and video inset (rec 02-03); 2 dark studio with the 3D object (isn't just / testimonials / tiers); 3 dark studio + hand + glow border; 4 giant type with wrapper object; 5 portrait photo strip; 6 magazine cover; 7 pegboard desk with cup; 8 its thermal re-skin; 9 blueprint ring on dark; 10 giant outlined logotype; 11 angled desk close-up (flip UI); 12 grey grip macro on a grid floor; 13 bark macro; 14 tan/cream giant-word with leaf-shadow light and info cards; 15 testimonial list with floating object; 16 claim gallery (8 separately staged photo cards: edge/step, campsite, colour stack, GPU, cork macro, drop test, sticker board, museum shelf); 17 tier picker with wireframe glow; 18 academic text on black; 19 bean-field ending.

### aviva's distinct set-ups (12)
1 white studio with giant wordmark (s01); 2 navy void (s02-s03, with a warm floor glow); 3 grey float (s03 end); 4 clothesline of outputs on pale blue-grey (s04, the one real staged set); 5 cream diagram stage with dimension lines (s05); 6 cool-grey changelog (s06); 7 fibre macro (s07); 8 indigo ink field, reused for the absorption view, the reviews and the arena (s08-s10: three layouts, one set); 9 claims cards on cream (s11, placeholder wells until `claimRenders` is on); 10 blue-grey sizes with print dialog (s12); 11 cream research text (s13); 12 dark footer with plane (s14-s15).

## 3. Per-screen counts

Columns: S P I L M A N, then R and C as defined above. Source column for ORYZO: live frame unless marked rec (recording).

### ORYZO (40 screens)
| # | Section | Src | S | P | I | L | M | A | N | R | C |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 00 | hero (rec 02-03) | rec | 1 | 6 | 1 | 0 | 2 | 0 | 3 | **13** | 9 |
| 01 | isn't just | live | 1 | 0 | 0 | 0 | 1 | 0 | 2 | **4** | 6 |
| 02 | isn't just | live | 1 | 0 | 0 | 0 | 1 | 0 | 2 | **4** | 6 |
| 03 | powered by AI | live | 1 | 1 | 0 | 0 | 1 | 0 | 1 | **4** | 5 |
| 04 | powered by AI | live | 1 | 1 | 0 | 0 | 2 | 1 | 1 | **6** | 6 |
| 05 | powered by AI | live | 1 | 1 | 0 | 0 | 1 | 1 | 0 | **4** | 4 |
| 06 | wearable type | live | 1 | 1 | 0 | 0 | 2 | 0 | 2 | **6** | 2 |
| 07 | wearable type | live | 1 | 0 | 0 | 0 | 2 | 0 | 1 | **4** | 2 |
| 08 | wearable photos | live | 0 | 0 | 1 | 0 | 1 | 0 | 1 | **3** | 2 |
| 09 | wearable photos | live | 0 | 0 | 1 | 0 | 1 | 0 | 1 | **3** | 2 |
| 10 | wearable strip | live | 0 | 0 | 6 | 0 | 2 | 1 | 1 | **10** | 3 |
| 11 | wearable strip | live | 0 | 0 | 5 | 0 | 2 | 0 | 1 | **8** | 2 |
| 12 | magazine cover | live | 0 | 0 | 3 | 1 | 2 | 0 | 1 | **7** | 10 |
| 13 | cover to desk | live | 1 | 0 | 1 | 0 | 3 | 0 | 1 | **6** | 4 |
| 14 | pegboard desk | live | 1 | 8 | 0 | 1 | 1 | 0 | 2 | **13** | 9 |
| 15 | thermal wipe | live | 2 | 8 | 0 | 0 | 3 | 0 | 2 | **15** | 4 |
| 16 | thermal top-down | live | 1 | 5 | 0 | 1 | 2 | 0 | 4 | **13** | 7 |
| 17 | circular sketch | live | 0 | 0 | 0 | 2 | 2 | 0 | 3 | **7** | 8 |
| 18 | circular sketch | live | 0 | 0 | 0 | 1 | 2 | 0 | 1 | **4** | 0 |
| 19 | outlined logotype | live | 0 | 0 | 0 | 1 | 2 | 0 | 1 | **4** | 0 |
| 20 | mat desk | live | 1 | 6 | 0 | 0 | 1 | 0 | 0 | **8** | 0 |
| 21 | flip UI | live | 1 | 7 | 0 | 0 | 2 | 2 | 1 | **13** | 7 |
| 22 | flip mid | live | 1 | 6 | 0 | 0 | 3 | 0 | 0 | **10** | 0 |
| 23 | grip macro | live | 1 | 0 | 1 | 0 | 2 | 1 | 1 | **6** | 5 |
| 24 | grip spec card | live | 1 | 0 | 1 | 0 | 1 | 2 | 2 | **7** | 8 |
| 25 | bark macro | live | 1 | 0 | 0 | 0 | 3 | 0 | 0 | **4** | 0 |
| 26 | bark to type | live | 1 | 0 | 0 | 0 | 3 | 0 | 0 | **4** | 1 |
| 27 | sustainability | live | 1 | 0 | 0 | 0 | 2 | 0 | 0 | **3** | 5 |
| 28 | sustainability | live | 1 | 0 | 0 | 0 | 1 | 0 | 0 | **2** | 6 |
| 29 | info cards | live | 1 | 0 | 0 | 3 | 2 | 0 | 0 | **6** | 8 |
| 30 | testimonials | live | 1 | 0 | 4 | 0 | 2 | 0 | 2 | **9** | 14 |
| 31 | claim gallery | live | 1 | 0 | 2 | 0 | 3 | 0 | 0 | **6** | 2 |
| 32 | claim gallery | live | 0 | 0 | 3 | 0 | 2 | 0 | 1 | **6** | 3 |
| 33 | claim gallery | live | 0 | 0 | 2 | 0 | 2 | 0 | 1 | **5** | 2 |
| 34 | claim gallery | live | 0 | 0 | 3 | 0 | 2 | 0 | 2 | **7** | 4 |
| 35 | claim gallery | live | 0 | 0 | 3 | 0 | 2 | 0 | 3 | **8** | 8 |
| 36 | tier rise | live | 1 | 0 | 0 | 0 | 3 | 0 | 2 | **6** | 3 |
| 37 | tier picker (rec 80-82) | rec | 1 | 0 | 0 | 4 | 3 | 3 | 0 | **11** | 10 |
| 38 | academic | live | 0 | 0 | 0 | 0 | 1 | 3 | 1 | **5** | 16 |
| 39 | ending | live | 1 | 0 | 0 | 1 | 2 | 4 | 1 | **9** | 14 |
### aviva (30 screens; section = from scrollY / config.js lengths)
| # | Section | S | P | I | L | M | A | N | R | C |
|---|---|---|---|---|---|---|---|---|---|---|
| 00 | s01 hero | 1 | 0 | 0 | 0 | 1 | 0 | 0 | **2** | 4 |
| 01 | s02 thin | 1 | 0 | 0 | 0 | 1 | 0 | 0 | **2** | 0 |
| 02 | s02 thin | 1 | 0 | 0 | 0 | 1 | 0 | 0 | **2** | 4 |
| 03 | s03 intelligence | 1 | 0 | 0 | 0 | 1 | 5 | 0 | **7** | 10 |
| 04 | s03 intelligence | 1 | 0 | 0 | 0 | 1 | 5 | 0 | **7** | 10 |
| 05 | s03 end | 1 | 0 | 0 | 0 | 1 | 0 | 0 | **2** | 0 |
| 06 | s04 weight | 1 | 0 | 0 | 0 | 2 | 0 | 0 | **3** | 6 |
| 07 | s04 clothesline | 1 | 3 | 0 | 0 | 1 | 0 | 0 | **5** | 11 |
| 08 | s04 clothesline | 1 | 4 | 0 | 0 | 1 | 0 | 0 | **6** | 14 |
| 09 | s04 clothesline | 1 | 3 | 0 | 0 | 1 | 0 | 0 | **5** | 10 |
| 10 | s05 architecture | 1 | 0 | 0 | 0 | 1 | 0 | 4 | **6** | 15 |
| 11 | s05 distil/tear | 1 | 1 | 0 | 0 | 2 | 1 | 2 | **7** | 8 |
| 12 | s06 release notes | 1 | 0 | 0 | 1 | 1 | 0 | 1 | **4** | 16 |
| 13 | s06 release notes | 1 | 0 | 0 | 0 | 1 | 0 | 4 | **6** | 14 |
| 14 | s06/s07 handover | 1 | 0 | 0 | 0 | 1 | 0 | 0 | **2** | 0 |
| 15 | s07 surface macro | 1 | 0 | 0 | 0 | 1 | 1 | 2 | **5** | 5 |
| 16 | s07/s08 absorption | 1 | 0 | 0 | 0 | 2 | 0 | 0 | **3** | 4 |
| 17 | s08 ink field | 1 | 0 | 0 | 0 | 1 | 0 | 0 | **2** | 0 |
| 18 | s09 reviews | 1 | 0 | 0 | 1 | 1 | 0 | 1 | **4** | 5 |
| 19 | s09 reviews | 1 | 0 | 0 | 2 | 2 | 0 | 1 | **6** | 10 |
| 20 | s10 arena | 1 | 1 | 0 | 0 | 1 | 0 | 0 | **3** | 5 |
| 21 | s10 arena | 1 | 1 | 0 | 0 | 1 | 3 | 1 | **7** | 12 |
| 22 | s11 claims | 0 | 0 | 3 | 0 | 2 | 0 | 1 | **6** | 10 |
| 23 | s11 claims | 0 | 0 | 3 | 0 | 2 | 0 | 1 | **6** | 10 |
| 24 | s11 claims | 0 | 0 | 2 | 0 | 2 | 0 | 1 | **5** | 6 |
| 25 | s12 sizes | 1 | 0 | 0 | 0 | 1 | 0 | 3 | **5** | 5 |
| 26 | s12 sizes | 1 | 0 | 0 | 0 | 1 | 3 | 2 | **7** | 14 |
| 27 | s13 paper | 0 | 0 | 0 | 0 | 0 | 4 | 0 | **4** | 12 |
| 28 | s13/s14 handover | 0 | 0 | 0 | 0 | 1 | 0 | 0 | **1** | 0 |
| 29 | s14/s15 footer | 0 | 1 | 0 | 0 | 1 | 2 | 0 | **4** | 12 |
### Source used per ORYZO section
| ORYZO section | Live frames | Recording frames used |
|---|---|---|
| Hero | 00 (caught mid-blur at y=0, not used for counts) | 02-03 (counts) |
| Isn't just a coaster / Powered by AI | 01-05 | none |
| So portable, it's wearable + magazine cover | 06-13 | none |
| Pegboard desk, thermal | 14-16 | 28-29 (checked) |
| Circular sketches / outlined logotype | 17-19 | none |
| Flip encryption | 20-22 | none |
| Grip macro, bark macro, sustainability, info cards | 23-29 | none |
| Testimonials | 30 | none |
| Claim gallery (8 cards) | 31-35 (5 samples) | 59-77 (all 8 cards, to confirm each is its own staged set) |
| Tier picker + comparison | 36 | 78-82 (counts for frame 37) |
| Academic | 38 | 83 (checked) |
| Ending | 39 | 84 (checked) |

## 4. The 10 emptiest aviva screens, against ORYZO's equivalent beat

Ordered by emptiness (lowest R, then biggest gap to the ORYZO beat). "Fill" names a type of element only. All fills must also pass the mission rule: same technique, different everything else.

| # | aviva screen | Now (R) | ORYZO equivalent beat | Fill with (type of richness) | Keep different from ORYZO |
|---|---|---|---|---|---|
| 1 | **aviva-28**, s13 to s14 handover, 55 vh. Blank cream: no object, no text. | 1 | Ending and tier-rise beats, live 36-39 (R6-9): object, large type, controls, particle field | A motion set-piece with at least 3 things moving: a flock of paper planes crossing a lit studio, loose torn scraps drifting, plus one counter or callout tied to them. If the sheet is meant to be off-screen here, give the empty frame a payload instead. | ORYZO's ending is a bean-particle field with a pitch; ours should be paper-native motion, not a dark particle drift. |
| 2 | **aviva-14**, s06 to s07 handover, 27.5 vh. One sheet on empty cream. | 2 | Circular-sketch and outlined-logotype beats, live 17-19 (R4-7): drawn layer, guides, formula tag | A drawn-on construction layer around the sheet, driven by scroll: fold-line and crease-pattern diagrams with standard origami arrows, hairline grid, 2-3 leader-line callouts with fake-precise numbers. | No bezier-handle rings, no da Vinci-style marginal sketches, no giant outlined wordmark. Use fold geometry. |
| 3 | **aviva-17**, s08 ink field, 33 vh. Sheet floating in flat indigo. | 2 | Alternate-vision beat, live 15-16 (R13-15) and grip macro, live 23-24 (R6-7) | A real macro render of fibres taking ink (a cross-section with capillary bloom), a draggable loupe inset, one spec card with a fake-precise absorption figure, unit labels. The indigo field should be a lit scene, not a wash. | ORYZO's alternate vision is a false-colour heat map with a formula. Ours is ink bloom in fibre, not a gradient heat map. When the UV view from #35 is added, give it a different set (blacklight, dark room, fluorescing edges), never a purple-orange false-colour pass. |
| 4 | **aviva-05**, s03 end, 10 vh. Grey void, floating sheet, no text. | 2 | "Powered by AI" climax, live 04 (R6): second object, hover hint, quip, full-screen glow | A light event inside the paper: a back-lit watermark or "intelligence" switching on through the fibres, a hover/hold affordance, a one-line quip, floating dust motes. | No hand, no rainbow glow around the viewport edge. Keep the light inside the object. |
| 5 | **aviva-01 / aviva-02**, s02 thin, 2-4 vh. Tilting then edge-on sheet, ghost wordmark. | 2 | Isn't-just and wearable-type beats, live 01-02, 06-07 (R4-6) | Measurement props and callouts: a micrometer or caliper closing on the edge with a live read-out, a stack of 10 sheets beside it for scale, a thickness bar against a human hair or a fibre, 2-3 dimension hairlines. | Don't have the object pass through giant type, or follow it with a photo strip. |
| 6 | **aviva-00**, s01 hero, 0 vh. White studio, giant wordmark, one sheet. | 2 | Hero, recording 02-03 (R13): staged set with 6 props at depth, side copy, credit block, video inset | A lit, shallow depth-of-field set around the sheet: 5-6 stationery props ORYZO doesn't show (copier glass with the light bar, stapler, hole punch, binder clips, index tabs, ream box), the side-copy and a small credit/spec footnote, and a small looping inset render. | No wooden desk, green mat, pencil/eraser/cutter/paperclip cluster, or top-down desk framing. |
| 7 | **aviva-16**, s07 to s08, 31.5 vh. "Absorption: total." on a flat blue wash with a ghost loupe. | 3 | Grip macro with spec card, live 24 (R7) | Make the wipe carry content: show the fibre macro already blooming ink in the first frame, with its spec card and drag hint, so the colour change arrives with an image. Same fix family as 3. | As 3. |
| 8 | **aviva-20**, s10 arena intro, 39 vh. Two blank sheets in a void under a headline. | 3 | Interactive-gimmick beat, live 21-22 (R10-13): staged set, 6-7 props, input UI, the object performing | A staged arena set: a stage or podium for each response, a vote counter and live ticker, a scoreboard with flip digits, an audience of small instanced folded-paper figures. | ORYZO's gimmick is a desk with a message input and a flipping object; ours is a staged contest, not a desk. |
| 9 | **aviva-22 / 23 / 24**, s11 claims, 43-47 vh. Every card is the same grey well with the same sheet (placeholders, `claimRenders` is off). | 5-6 | Claim gallery, live 32-35 and recording 59-77 (R5-8): eight differently staged images, each with its own set, light, colour and caption | Eight unique staged renders (decision #35, point 2), each a different environment and colour, each with a measurement-style tag. Cards should differ in scale, light and subject, not only copy. | Don't echo the cards' formula: action shot with debris, museum shelf of ancient cups, sticker board, GPU gag. Our subjects come from our own claims. |
| 10 | **aviva-18 / aviva-19**, s09 reviews, 35-37 vh. One small icon beside each quote, a lone sheet. | 4-6 | Testimonials, live 30 (R9): floating object plus four portrait/thumbnail images and star ratings | A character for each fictional reviewer (printer, shredder, pencil and so on) as a small 3D or illustrated figure with its own tiny scene, a visible rating UI, and the sheet reacting. | ORYZO's ruled list with a thumbnail on the right is its layout. Stage ours as a cast on a set, not a list. |

Runners-up: aviva-06 (R3, the 4.99 g screen: add a balance or scale prop and weights), aviva-12 (R4, release notes: a text list with a faint sheet; add period-artefact renders or an illustrated timeline strip, with every fact sourced in `work/01-research.md`), aviva-27 (R4, research section: text and buttons only; ORYZO's equivalent is also text, so acceptable, but a small 3D viewer of the 4-vertex model would pay off).

## 5. What would move the numbers

Targets that would put aviva at parity on density (not on style): average R of 6.5 or more; at least a quarter of the screens at R of 8 or more (today none); strict lone-object screens at 10 % or less (today 30 %); at least 18 distinct set-ups (today 12, only 3 staged); images + illustrations per screen above 1.0 (today 0.4). The first three screens by effort-to-impact are cheap: 1 (planes and scraps, particles), 2 (SVG/DOM construction layer), 5 (callouts and a caliper). The expensive ones are 6, 8 and 9 (new staged 3D sets and eight renders); they are also the ones ORYZO's richness comes from.

Mapping to decision #35: the annotation layer covers 2, 5, 7; the flock of planes and confetti cover 1; the UV view or watermark cover 3, 4; staged sets cover 6, 8; real renders for every slot cover 9; reviewer figures (the design VD's illustrations) cover 10.

## 6. Flags for the lead

1. **Decision #35 conflict:** point 1 lists "a ream wrapper being torn open". "Wrapper tearing" is on the do-not-reuse list (mission and `reference/VIDEO_NOTES.md`). Use a different reveal (lid sliding off, band cut, box unfolding) or drop it.
2. **UV view vs ORYZO's thermal mode** is already on the similarity watch in #35; keep it a different set and palette (see row 3).
3. **Do not fix emptiness with ORYZO's own devices:** a desk seen from above with a pencil/eraser/cutter/paperclip cluster, a hand, a rainbow or red full-screen glow, a photo strip, a magazine cover, a ruled testimonial list, giant outlined wordmark with bezier handles.
4. **aviva-28 may be a bug or an intentional beat:** a completely blank cream screen at about 55 vh, where the s13 text has gone and s14 has not started. Worth a look by the web developer.
5. Our claim cards and fallback stills are still placeholders (`FEATURES.claimRenders` and `fallbackStills` are off in `docs/js/config.js`), so rows 9 and part of 1 reflect that, not the intended design.

## 7. Reproduce

```
bash work/scripts/setup-session.sh
node work/scripts/oryzo-capture.mjs                        # ORYZO, 40 frames, about 5.5 min (30 s initial wait is the fix)
node work/scripts/oryzo-capture.mjs --url 'http://localhost:8080/?nointro' --out work/screenshots/density/aviva --n 30 --prefix aviva --first 5000
```
Each run also writes `capture-log.json` (target and reached scrollY per frame).
