# Part 1–3 edits for the AI flip (#27), tiers (#28), credits/rename (#29), capitals (#30), folded-letter hero (#31)
R = []   # (old, new) exact replacements
B = []   # (start_marker, end_marker, new_block): replace [start, end) ; end marker kept

# ---------- Part 1 ----------
B.append(("| **Brand** |", "### Typography conventions for copy", '''| **Brand** | **AVIVA**, written in capitals in all visible text (decision #30): AVIVA, AVIVA A4, AVIVA Intelligence, AVIVA Notebook Pro, AVIVA Ream Pro Max, AVIVA Research, and the pencil stamp "AVIVA HB". Lowercase only where it must be: URLs and domains (`withnolan.github.io/aviva`), file and folder names (`aviva-a4.pdf`), the repo name, code identifiers and CSS classes, and the BibTeX key. BibTeX titles use `{AVIVA}` braces so the capitals survive. |
| **Model name** | **AVIVA A4.** The version number is the paper size, and the A-series is the family: AVIVA A5 and A6 are distilled, and AVIVA A3 has twice the context window. **The lineup** (decision #28): **AVIVA** (one sheet), **AVIVA Notebook Pro** (80 sheets, bound) and **AVIVA Ream Pro Max** (500 sheets). |
| **Tagline** | **Pre-trained on trees.** (Copy paper is made mostly from wood pulp: R§1.7 med · R§2, Keller, 1844.) |
| **Sticker line** | **NOW WITH AI**: the hero eyebrow and the page title ("AVIVA A4. Now with AI."). Everything has AI now, so this sheet of paper has it too (decision #27). |
| **Positioning line** | A foundation model, on paper. |
| **The AI** | **AVIVA Intelligence.** It learns from every stroke, remembers every mark and answers in your own handwriting. |
| **The one-sentence story** | Everything has AI now, so this sheet of paper has AI too. AVIVA A4 is launched like a frontier model, and every capability it claims is something a sheet really does: a 210 × 297 mm context window; input by pencil, ink, fold and tear; a memory that keeps every mark; distillation by tearing in half. Locke called the mind before experience "white paper, void of all characters" (1689/1690; R§13.6 · R§13.10 #15). The paper has since been trained. |

### Personality
Calm, exact and completely confident. The voice is a keynote narrator who sincerely believes this sheet is the most capable model ever shipped, and has the measurements to prove it. It over-claims with a straight face and never lies: every claim survives a ruler. It never jokes about itself, never apologises and never explains the joke.

### Voice rules

**Do**
- Short declaratives, 3–8 words. Let a full stop do the comic timing.
- **Claim → literal proof → undercut**, with the undercut as its own short sentence: "Tear AVIVA in half: two smaller models, the same shape, every capability intact. Even the paper cut."
- **Over-claim, never lie** (decision #27). Every AI capability is something a sheet really does: it keeps every mark, accepts pencil, ink, folds and tears, flies when folded, and halves without changing shape. Say it with launch-day confidence.
- Keep a few blank jokes as contrast, where they are strongest: the blank outputs on the drying line, "Answer: see above.", the Arena, and "Fine-tuned on you."
- Exact numbers with units and real typography: `210 × 297 mm` (multiplication sign), `80 g/m²`, `0.1 mm`, `4.99 g`, ranges with an en dash (`5–7`), percentages with a space (`0.0 %`, ISO style), `BCE` / `CE`.
- AI-launch vocabulary used with total sincerity: base model, foundation model, multimodal, persistent memory, "Memory updated.", agentic, inference, prompt, output, context window, distil, fine-tune, model merge, release notes, arena, leaderboard, hallucination, refusal rate, alignment, lineup, Pro, Pro Max.
- British spelling: fibre, colour, centre, metre, distil, recognise.
- Real facts stated plainly and sourced (CLAUDE.md rule 8). The facts are the setup, and the product is the punchline.
- One quiet, sincere beat at the very end ("Fine-tuned on you.").

**Don't**
- No exclamation marks, emojis, "lol", "just kidding" or rhetorical winks.
- No puns for their own sake. A word may carry two meanings only if both are true ("open weights", "a foundation model, on paper").
- Never ORYZO's AI gags: no asterisk redefining "AI", no extra fingers, no rainbow glow, no model-name tag tucked under a headline (teardown §8 #2, #3, #26, #27).
- No self-deprecation, no "it's just paper", no "we know this is silly".
- No questions to the visitor, except the prompts that are part of the fiction.
- No calling the product "paper" in display copy: it is "AVIVA" or "the sheet". "Paper" appears only in facts and in "The paper" (the research).
- Never more than one accent-coloured phrase per screen.

### Words we use
sheet · white · A4 · 210 × 297 mm · 80 g/m² · 0.1 mm · 4.99 g · fibres · grain · edge · fold · tear · ink · pencil · eraser · ream · margin · verso · prompt · output · base model · foundation model · intelligence · multimodal · persistent memory · agentic · learns · memory updated · model merge · inference · context window · distil · fine-tuned · pre-trained on trees · release notes · arena · leaderboard · hallucination · refusal rate · alignment · open weights · regenerate · lineup · Pro · Pro Max · released

### Words we never use
- **ORYZO's punchlines (R§7.6):** wearable, circular, encryption, antislip, grip, thermal, runs on, always on, drop-tested, legacy support, non-existent product, coaster, cork.
- **Launch clichés:** unleash, elevate, seamless, game-changer, revolutionary, unlock, supercharge, empower, cutting-edge, next-gen, magic / magical, AI-powered (we say "Now with AI" and "Intelligence, built in"), "choose your own".
- **Banned claims and words (decision #9):** power, battery, uptime, "0 W", "coming soon", "trust me". ("Pro Max" is allowed again since decision #28.)
- **As a display word:** "sustainability".

'''))

# ---------- Part 2: final order rows + grounds note ----------
R.append(("| 0 | `s00-loader` | Loading nothing | 0 (≈ 2.2 s) | (none) | white | 1 Loader |",
          "| 0 | `s00-loader` | Loading weights | 0 (≈ 2.2 s) | (none) | white | 1 Loader |"))
R.append(("| 1 | `s01-hero` | Every great product… | 1.5 | (none; time-driven intro) | white | 2 Hero |",
          "| 1 | `s01-hero` | AVIVA, folded / Every great product… | 1.5 | (none; the first scroll unfolds the letters) | white | 2 Hero |"))
R.append(("| 3 | `s03-intelligence` | Intelligence not included. | 6 | yes | white | 4 \"Powered by AI\" |",
          "| 3 | `s03-intelligence` | Intelligence, built in. | 6 | yes | white | 4 \"Powered by AI\" |"))
R.append(("| 12 | `s12-sizes` | One shape. Three sizes. | 4 | yes | white | 15 Tiers + comparison |",
          "| 12 | `s12-sizes` | More sheets. More context. (the lineup) | 4 | yes | white | 15 Tiers + comparison |"))
R.append(("| 15 | `s15-footer` | Footer + colophon | 0.5 | (none) | white | 17 Footer |\n",
          "| 15 | `s15-footer` | Footer + colophon | 0.5 | (none) | white | 17 Footer |\n\n> **Grounds:** the Ground column above predates decision #24. The design system's ground map (charcoal, cool grey, ink-blue and white) overrides it (decision #29).\n"))

# ---------- Part 2A rows ----------
R.append(('| `s00-loader` | Cover loading; signal "this was designed"; set up the one match-cut | A print-shop drawing of an object with nothing on it, measured to the millimetre. The loader label: "LOADING NOTHING". |',
          '| `s00-loader` | Cover loading; signal "this was designed"; set up the one match-cut | A print-shop drawing of the five folded letters, with fold types and angles, measured to the millimetre. The model "loads its weights": 24.95 g, five sheets. |'))
R.append(('| `s01-hero` | Brand, premise, first look at the sheet | The design-process cliché "we started with a blank sheet of paper", taken literally and stopped there | 1.5 · (none) | None (the first scroll reveals line 2 if the timed reveal hasn\'t fired yet) | Row 2 giant logotype + reveal + side copy · #11, #13, #17 |',
          '| `s01-hero` | Brand, premise, first look at the product | The brand name is spelled by the product: five sheets folded into AVIVA (two mountain folds, two valley folds, one sheet edge-on), with a "4" after the last A. On the first scroll they unfold and merge into one blank sheet ("MODEL MERGE: 5 SHEETS → 1"), and the h1 lands: "Ours stopped there." | 1.5 · (none) | None (the first scroll unfolds and merges the letters; reduced motion cross-fades) | Row 2 giant logotype + reveal + side copy · #11, #13, #17 (decision #31) |'))
R.append(('| `s03-intelligence` | The AI-hype beat | The intelligence is supplied by the user; the model\'s answer is your own writing ("Answer: see above."); Regenerate crumples it and returns the same answer |',
          '| `s03-intelligence` | The AI-hype beat, played straight | "Intelligence, built in." The AI learns from every stroke ("Memory updated."), remembers even what you erase, and answers in your own handwriting ("Answer: see above."). Regenerate crumples it and returns the same answer |'))
R.append(('| `s11-claims` | Benchmark-style claims | Every hype claim is literally, measurably true of a blank sheet |',
          '| `s11-claims` | Benchmark-style capability claims | Every AI capability claim is literally, measurably true of a sheet: context window, multimodal, persistent memory, agentic flight, zero hallucinations, refusal rate, alignment, the side effect and the scaling roadmap |'))
R.append(('| `s12-sizes` | Tiers + comparison | The tier picker is a print dialog; every tier is the same shape and knows the same nothing; the Print button is disabled | 4 · yes | **Paper size** radio group A5 / A4 / A3 (arrow keys; tap) | Row 15 tier toggle + comparison table · #34 |',
          '| `s12-sizes` | Tiers + comparison | The Apple-style lineup, by sheet count: AVIVA / AVIVA Notebook Pro / AVIVA Ream Pro Max. Same intelligence per sheet; the Pro models simply have more sheets. The picker lives in a print dialog whose PRINT button is disabled | 4 · yes | **Model** radio group: AVIVA / AVIVA Notebook Pro / AVIVA Ream Pro Max (arrow keys; tap) | Row 15 tier toggle + stack + comparison table · #34 (decision #28) |'))
R.append(('| `s13-paper` | Academic parody | The full ritual of a model release, for a model with no data |',
          '| `s13-paper` | Academic parody | The full ritual of a model release, for a model pre-trained on trees |'))
R.append(('| `s14-release` | The CTA and the payoff | The only training data aviva ever got was the visitor\'s doodle. The release of the model is a paper plane. |',
          '| `s14-release` | The CTA and the payoff | Pre-trained on trees, fine-tuned on the visitor\'s doodle. The sheet comes back folded into the A, opens to show what it learned, and its release is a paper plane. |'))

# ---------- Part 2B rows ----------
R.append(('| `s00-loader` | No sheet. An SVG drawing (crop marks + dimension lines) registered to the sheet\'s first pose: upright, facing the camera, (50, 52), 46 vh%. | Lines draw on, and the counter climbs the 297 line from 000 to 297 mm. | At 297, the sheet fades in exactly inside the marks (opacity 0 → 1, 400 ms, no pop). The crop marks retract 12 px outwards and fade (300 ms). | Level camera (pitch 0). Default key. |',
          '| `s00-loader` | No sheet yet. An SVG drawing registered to the hero letters\' first pose, with outlines projected from the 3D letters (`Vector3.project`): the five letters A V I V A plus the "4", each in front elevation, crop marks around the whole word, a cap-height dimension (141 mm) and the apex angle (36°) on the first A, and a fold label under each letter. | Lines draw on, and the counter climbs from 000 to 297 mm along a dimension line under the word. | At 297, the five 3D letters and the "4" fade in exactly inside the drawing (opacity 0 → 1, 400 ms, no pop). The drawing and crop marks retract and fade (300 ms). The drawing → object match-cut happens only here. | Camera pitch −6°, level horizon. Default key. |'))
R.append(('''| `s01-hero` | Upright at (50, 52), 46 vh%, flat. | **Time-driven fall (≈ 2.4 s):** the sheet lifts 4 %, then falls like a leaf. It rocks side to side (damped rz ±12°, rx ±20°), with `flutter(0.8 cm)`. As it falls it turns to lie flat (rx → −90°). The camera tilts down to pitch −68° to follow it. The floor wordmark **aviva** (graphite, printed on the floor, spanning 88 % of the viewport width, centred at y 56 %) comes into view. | **It lands flat on the floor, centred over the letter "i"** and the inner halves of both "v"s: (50, 55), long side 44 vh%. The contact shadow tightens as it lands. **`showThrough` fades in as the gap closes below 6 mm** (spec in Part 5.2), so the covered letters read softly through the sheet. On the first scroll (0 → 1.5 vh) the camera pushes in 6 %, and at 1.0 vh the sheet's near (bottom) edge begins to lift. | Pitch 0 → −68° (time-driven). Key warm, top-left, raking 60°, cool fill from the right. A soft, light contact shadow (decision #12b). |''',
          '''| `s01-hero` | **AVIVA, folded (decision #31).** Five A4 sheets, each folded in half across its long side (two 210 × 148.5 mm panels). The crease runs into the scene, so each letter is seen end-on. They stand on the studio floor in a row centred on x 50 %, with the baseline at y 66 % and a cap height of ≈ 27 vh% (141 mm):<br>• **A** (x ≈ 23.5 %): a mountain fold stood as a tent, apex angle 36°. A faint pre-crease across both panels at 42 % of the leg height reads as the crossbar.<br>• **V** (≈ 39.5 %): the same fold as a valley, crease on the floor.<br>• **I** (exactly 50 %): the same fold closed flat, standing upright, seen exactly edge-on (a bright hairline, ≥ 1.2 px).<br>• **V** (≈ 60.5 %) and **A** (≈ 76.5 %).<br>• **"4"** (≈ 90 %): graphite, in the site typeface, a thin upright type plane at cap height, so the last A reads "A4".<br>Soft contact shadows under every letter. Mobile: the same row scaled to 92 % of the width. | **First scroll, 0 → 1.5 vh (unfold and merge):**<br>• 0 → 0.15 vh: the "4" fades out.<br>• From 0.1 vh, staggered from the outside in (A's at 0.1, V's at 0.2, I at 0.3 vh), each letter (1) turns to face the camera (ry ±90°, 0.25 vh); (2) unfolds flat into an upright A4 portrait (fold angle → 180°, 0.3 vh: each A's far panel swings up over its ridge, each V rises as its lower panel swings down, the I opens upwards); (3) slides to x 50 % (0.35 vh) and stacks a few mm behind the centre sheet, where it disappears ("merged").<br>• 0.8 → 1.3 vh: `s01.merge` shows.<br>• 0.9 → 1.2 vh: the camera eases back (×1.28 distance) and levels to pitch 0. | 1.2 vh: one flat sheet, upright at (50, 52), 46 vh%, with a faint horizontal crease at mid-height (the fold's memory; s05 later tears along it). `s01.h1.l2` appears. 1.2 → 1.5 vh: hold. | Pitch −6° → 0. Warm key from the top left, raking 60°; cool fill from the right; the tent interiors read slightly darker; soft, light contact shadows (decision #12b). Reduced motion: a 1 s cross-fade from the letters to the single sheet on the first scroll. `showThrough` stays in the module, unused (decision #31). |'''))
R.append(('| `s02-thin` | Lying on the floor. 0 → 0.8 vh: it **peels up from the bottom edge** (`curl(bottom, r 25 mm)` sweeping across the sheet), lifts and rises upright. The camera levels to pitch 0, and the floor and wordmark slide out of frame. |',
          '| `s02-thin` | Upright at (50, 52), 46 vh%, straight from the s01 merge. 0 → 0.8 vh: a slow push-in to (50, 50). |'))
R.append(('0.8 → 6.4 vh: the row of 8 cards translates left ≈ 1:1 with scroll.',
          '0.8 → 6.4 vh: the row of 9 cards translates left ≈ 1:1 with scroll.'))
R.append(('''| `s12-sizes` | At (62, 52), 44 vh%, rx −8°, with dimension lines on. The print dialog (DOM) is on the left (x 6–34 %). | **A5:** scales ×0.707 to 31 vh% with a soft spring settle (ζ 0.8); the dimensions update to 148 × 210 mm. **A3:** ×1.414 to 62 vh%, 297 × 420 mm. **A4:** back to 44 vh%. The camera never moves, so the size change reads. **Passive preview:** if the visitor hasn't clicked, scroll previews A5 at 0.8 vh, A3 at 1.4 vh and back to A4 at 2.0 vh; once they click, scroll never overrides their choice. | 2.4 → 4 vh: the comparison table scrolls up, and the sheet rises with it, to y 20 % and 26 vh%, then exits upwards. | Neutral, crisp light. |''',
          '''| `s12-sizes` | **The lineup (decision #28).** The hero sheet at (62, 52), 44 vh%, rx −8°, ry −12°, turned slightly so the side of a stack will read. The print dialog (DOM) is on the left (x 6–34 %). | **AVIVA Notebook Pro:** 79 more sheets **fan in** from the right like a dealt deck (≈ 0.9 s, 10 ms apart). Each arrives with a small flutter (`flutter(0.3 cm)` → 0) and settles with a soft spring under the hero sheet. A hairline graphite binding strip draws on along the left edge, so the ≈ 8 mm block reads as a bound notebook.<br>**AVIVA Ream Pro Max:** 420 more fan in (≈ 1.2 s, a faster cadence). The binding strip fades, and the camera eases back 8 % and tilts down 6° so the top and side of the ≈ 5 cm block both read.<br>**AVIVA:** the extra sheets fan back out to the left in reverse order and leave.<br>True thickness, no exaggeration (8 mm ≈ 1.2 % vh, 5 cm ≈ 7.4 % vh at this scale). Build: an `InstancedMesh` of up to 499 thin slabs with a simplified paper material (a per-instance flutter during the fan-in only); the top sheet stays the live hero sheet.<br>**Passive preview:** if the visitor hasn't clicked, scroll previews Notebook Pro at 0.8 vh, Ream Pro Max at 1.4 vh and back to AVIVA at 2.0 vh. Once they click, scroll never overrides their choice.<br>Not ORYZO's stack (#47): counts of 1 / 80 / 500, sheets dealt in sideways with a flutter rather than identical objects dropping in, nothing glows. | 2.4 → 4 vh: the comparison table scrolls up, and the stack rises with it (to y 20 %, 26 vh%), then exits upwards. The top sheet continues as the s14 sheet. | Neutral, crisp light on the cool-grey ground (decision #24). A small camera ease-back for Ream Pro Max only. Reduced motion: the stack cross-fades between counts. |'''))
R.append(('| `s14-release` | 0 → 0.6 vh: the sheet descends to (50, 48), 46 vh%, upright, **carrying the s03 drawing** (or blank) **and the s07 ink dot**. |',
          '| `s14-release` | **The A comes back (echo of the hero, decision #31).** 0 → 0.3 vh: the sheet descends from above, **folded into the A** (a mountain fold along its mid-crease, apex 36°, the drawing hidden inside). It lands upright on the studio floor at (50, 60) at hero letter size (≈ 27 vh%), and the graphite "4" fades in beside it, so it reads "A4". 0.3 → 0.8 vh: the A turns to face the camera and **unfolds flat** (the hero\'s unfold, reused), rising to (50, 48), 46 vh%. It reveals **the s03 drawing** (if any) **and the s07 ink dot**, and the "4" fades. |'))
R.append(('| 0.6 → 1.8 vh: the **pencil cursor returns** over the sheet (`paint`). |',
          '| 0.8 → 1.8 vh: the **pencil cursor returns** over the sheet (`paint`). The h2 lines appear once the sheet is open. |'))

# ---------- Part 3.0 global ----------
R.append(("| `meta.title` | aviva A4. Pre-trained on nothing. | |", "| `meta.title` | AVIVA A4. Now with AI. | |"))
R.append(("| `meta.description` | Introducing aviva A4, a foundation model with nothing on it. 210 × 297 mm. Zero hallucinations. A fictional parody inspired by ORYZO by Lusion. | 143 characters |",
          "| `meta.description` | AVIVA A4, our most intelligent sheet yet: a multimodal foundation model with a 210 × 297 mm context window. A fictional parody inspired by ORYZO by Lusion. | 155 characters |"))
R.append(("| `og.title` | aviva A4. Pre-trained on nothing. | also `twitter:title`; card `summary_large_image` |",
          "| `og.title` | AVIVA A4. Now with AI. | also `twitter:title`; card `summary_large_image` |"))
R.append(("| `og.image.alt` | A single white A4 sheet lying on a white floor over the giant word aviva. The letter i shows faintly through the paper. | |",
          "| `og.image.alt` | Five folded white sheets standing in a white studio, spelling AVIVA, with a 4 beside the last A. | also `twitter:image:alt` |"))
R.append(("| `nav.3` | SIZES | → `#s12-sizes` |", "| `nav.3` | MODELS | → `#s12-sizes` (the id stays) |"))

# ---------- Part 3.1 s00 and 3.2 s01 ----------
B.append(("### 3.1 `s00-loader`", "### 3.3 `s02-thin`", '''### 3.1 `s00-loader`

| id | Copy | Notes |
|---|---|---|
| `s00.label` | LOADING WEIGHTS | small uppercase, under the drawing |
| `s00.counter` | 000 mm → 297 mm | three digits, tabular; it climbs a dimension line under the word |
| `s00.dim.h` | 141 mm | the cap-height dimension on the first A (derived: a 148.5 mm leg at 18° from vertical) |
| `s00.dim.angle` | 36° | the first A's apex angle (new id) |
| `s00.fold.a` | MOUNTAIN | under each A, with the dot-dash mountain-fold symbol (Yoshizawa–Randlett notation, R§5.1 high) (new id) |
| `s00.fold.v` | VALLEY | under each V, with the dashed valley-fold symbol (R§5.1 high) (new id) |
| `s00.fold.i` | EDGE-ON | under the I (new id) |
| `s00.four` | ISO 216 | small, under the "4" (R§1.1 high) (new id) |
| `s00.done` | 24.95 g LOADED | replaces `s00.label` for 400 ms at 297 mm: five sheets × 4.99 g (R§13.1 derived) |
| `s00.sr` | Loading. / Loaded. | visually hidden, `aria-live="polite"` |

`s00.dim.w` is removed: the letters' depth isn't drawn. Reduced motion: the drawing appears in one step, and the counter jumps 000 → 148 → 297.

### 3.2 `s01-hero`

| id | Copy | Notes |
|---|---|---|
| `s01.eyebrow` | INTRODUCING AVIVA A4 · NOW WITH AI | the sticker line |
| `s01.h1.l1` | Every great product starts with a blank sheet of paper. | `<h1>`, centred, top third; fades in as the letters light up |
| `s01.h1.l2` | Ours stopped there. | same `<h1>`, second line. It appears **when the letters have merged into one sheet** (≈ 1.2 vh). Without a scroll it waits: the standing letters are the setup |
| `s01.h1.m` | Every great product / starts with a blank / sheet of paper. // Ours stopped there. | 390 px line breaks (/ = break, // = new line) |
| `s01.side` | AVIVA A4. Pre-trained on trees. | centred, bottom, above the hint (R§1.7 med · R§2) |
| `s01.spec` | 210 × 297 mm · 80 g/m² · 0.1 mm | R§1.1 high · R§1.2 high · R§1.3 med |
| `s01.merge` | MODEL MERGE: 5 SHEETS → 1 | micro-label during the merge (0.8–1.3 vh) (new id) |
| `s01.letters.sr` | Five folded sheets of paper stand in a row and spell AVIVA: tents for the A's, valley folds for the V's and one sheet seen edge-on for the I. A 4 stands beside the last A. | visually hidden description of the hero scene (new id) |

The folded letters and the "4" are part of the 3D scene, decorative (`aria-hidden`), and described by `s01.letters.sr`.

'''))
