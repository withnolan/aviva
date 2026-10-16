# 05: Design system, AVIVA A4

Owner: visual-designer (design system, 2D assets, research paper). **The 3D sheet (material, shaders, deformations, lab) is documented in [`work/05b-paper-module.md`](05b-paper-module.md).**
Source of truth for words and scenes: `work/04-creative-brief.md` (Parts 1, 3, 5, 6, 9). This file is the source of truth for how they look.

| Deliverable | Path |
|---|---|
| Tokens (the contract) | `docs/css/tokens.css` |
| Web fonts | `docs/css/fonts.css`, `docs/assets/fonts/` |
| Print joke | `docs/css/print.css` |
| Living style guide | `docs/lab/styleguide.html` |
| Logo, wordmark (floor decal retired, #31) | `docs/assets/logo/` |
| Favicons | `docs/favicon.svg`, `docs/assets/favicon-32.png`, `docs/assets/apple-touch-icon.png` |
| Icons | `docs/assets/icons/*.svg`, `docs/assets/icons/sprite.svg` |
| Drawings and glyphs | `docs/assets/illustrations/*.svg`, `docs/assets/illustrations/glyphs/` |
| Research paper | `docs/research/aviva-a4.pdf`, `citation.bib`, `aviva-a4.obj`, source in `docs/research/src/` |
| Build scripts | `work/scripts/design/` (fonts, logo, favicons, icons, drawings, contrast, fluid type, snapshots, print test, paper) |

---

## 1. Principles

1. **ORYZO's restraint, not its look.** One typeface, five colours, small uppercase labels, measured gutters, generous air; the sheet and the jokes do the work. ORYZO is a dark room with a heavy grotesk; AVIVA is a white room, set light, printed precisely.
2. **The sheet is the brightest, warmest white on screen.** UI never competes with it: no white panels floating over the scene, no glows, no gradients, no shadows deeper than a sheet resting on a desk.
3. **Ink is ink.** Ink-blue is the only accent and it always means ink: the drop, The Bleed, the ink ground of s07–s10, the 3 mm dot, focus rings and text selection on white, the A4 cell in the paper's Figure 2. Never a highlight, glow or gradient; at most one ink-blue element per white screen.
4. **Print-shop precision.** Crop marks, dimension lines, hairlines, rulers, A-series proportions. Corners are square (≤ 2 px). Rules are solid hairlines, never dotted; the only dotted line on the site is the tear perforation, which is a paper object.
5. **Light type, firm type.** Display and headings at Light (300), body at Regular (400), labels at Medium (500). Nothing is bold.

---

## 2. Palette

| Token | Hex | Role | Contrast (WCAG 2.x) |
|---|---|---|---|
| `--color-paper` | `#F7F5F0` | the sheet; white page ground; cards; paper white on ink | — |
| `--color-studio` | `#ECEBE7` | 3D floor and backdrop (cooler, greyer than paper); `html` background behind the canvas; sunken wells | — |
| `--color-graphite` | `#2A2926` | all type, wordmark, lines, icons. Warm, never black | 13.35 on paper · 12.19 on studio · 11.11 on studio shade `#E2E1DC` |
| `--color-graphite-muted` | `#615F58` | secondary text, labels, notes | 5.87 on paper · 5.36 on studio · 4.88 on studio shade |
| `--color-graphite-soft` | `#A3A099` | disabled labels, ghost marks (never text you must read) | 2.40 on paper (exempt: disabled) |
| `--color-ink` | `#2E2A8E` | the accent; the s07–s10 ground | 10.49 on paper · 9.58 on studio |
| `--color-ink-deep` | `#1E1A60` | ink core, pressed states on ink, wells on ink | paper on it 14.05 |
| `--color-on-ink` | `#F7F5F0` | text on ink | 10.49 on ink |
| `--color-on-ink-muted` | `#C8C6E4` | secondary text on ink | 6.88 on ink · 9.22 on ink-deep |
| `--color-rule` | `#D9D6CE` | decorative hairlines | 1.33 on paper (decorative, exempt) |
| `--color-rule-strong` | `#827F77` | UI boundaries: input lines, button and control borders | 3.67 on paper · 3.35 on studio (≥ 3 : 1, WCAG 1.4.11) |
| on ink: rule | paper 28 % | decorative hairlines on ink | 2.13 (exempt) |
| on ink: rule-strong | paper 62 % | UI boundaries on ink | 5.00 |

Checked with `node work/scripts/design/contrast-table.mjs` (v2: it covers every pair below and in 2.1, composites the alpha rules and the highlighter marks first, and exits non-zero if any required pair fails; `--md` prints Markdown rows). Every text/ground pair the site uses passes AA (4.5 : 1) at every size, including muted text over the darkest part of the studio vignette. Focus rings: ink on white (10.49), ink on cool grey (8.37), paper on ink (10.49), paper on charcoal (14.50), all far above the 3 : 1 minimum.

**Why these values.** Paper is a warm off-white (never `#fff`); studio is a touch darker and less warm, so the sheet always reads as the brightest object. Graphite is a warm grey-black, like a B pencil, so type sits *on* the paper rather than punching through it. The ink is a deep, slightly violet fountain-pen blue (hue ≈ 243°): violet enough to read as ink rather than corporate royal blue (the provisional `#283090` was hue 235°, towards cyan), deep enough that paper-white body text on it scores 10.5 : 1.

**For three.js** (linear sRGB, `new THREE.Color().setRGB(r, g, b, THREE.LinearSRGBColorSpace)`): paper 0.9301 0.9131 0.8714 · studio 0.8388 0.8308 0.7991 · graphite 0.0232 0.0222 0.0194 · ink 0.0273 0.0232 0.2705 · ink-deep 0.0130 0.0103 0.1170. The Bleed must end exactly on `--color-ink`, so the ink-front shader's flat ink and the CSS ground switch at 4.0 vh are the same colour.

**Roles, not colours.** Components use `--ground`, `--surface`, `--surface-sunken`, `--text`, `--text-muted`, `--text-disabled`, `--accent`, `--color-rule`, `--color-rule-strong`, `--color-focus`, `--button-bg`, `--button-fg`, `--button-bg-hover`, `--selection-bg`, `--selection-fg`, `--press-hi`, `--press-lo`, `--shadow-contact`, `--shadow-lift`, and (v2) `--dims`, `--mark`, `--mark-alt`, `--pencil`. `[data-ground="ink"]` remaps all of them (paper text, paper hairlines, paper buttons with ink labels, paper selection with ink text). `[data-ground="paper"]` / `[data-ground="studio"]` restore the light roles inside an ink region. v2 adds `[data-ground="charcoal"]`, `[data-ground="grey"]` and `[data-ground="grey-light"]` (2.1).

### 2.1 Palette v2: mixed grounds and stationery colours (decision #24)

The user asked for dark and grey sections and more colour. Everything new is **cool or stationery-coloured**, so it stays paper-native and clearly away from ORYZO's warm brown-black, cork orange, cream and green. Paper white, graphite and ink-blue keep their v1 roles.

| Token | Hex | Role | Contrast (WCAG 2.x) |
|---|---|---|---|
| `--color-charcoal` | `#1F2328` | the dark ground (s02, s03, s15). Cool blue-grey, hue 213°, never warm brown-black | paper on it 14.50 |
| `--color-charcoal-raised` | `#2A2F36` | raised surfaces on charcoal (the tools panel, cards) | paper 12.37 · muted 6.16 |
| `--color-charcoal-deep` | `#171A1E` | wells and pressed states on charcoal | paper 16.02 |
| `--color-on-charcoal` | `#F7F5F0` | text on charcoal (= paper) | 14.50 |
| `--color-on-charcoal-muted` | `#A9B0B9` | secondary text and labels on charcoal | 7.22 on charcoal · 6.16 on raised |
| `--color-grey-100` | `#E6E8EA` | light cool grey ground (s06) | graphite 11.84 · muted-deep 6.26 |
| `--color-grey-200` | `#D9DDE1` | cool grey ground (s04 gallery, s12 print room) | graphite 10.65 · muted-deep 5.63 |
| `--color-grey-300` | `#CDD2D7` | wells and table heads on grey | graphite 9.56 · muted-deep 5.05 |
| `--color-graphite-muted-deep` | `#55534D` | secondary text on the grey grounds (v1 muted is only 4.68 on grey-200, too close) | see above |
| `--color-pencil` | `#F3C623` | HB-pencil yellow (hue 47°, golden, not orange): the pencil's lacquer, the s03 CTA underline, claim card c4 | 9.71 on charcoal · 1.49 on paper (objects only there, never text or UI) |
| `--color-pencil-shade` | `#CFA21A` | the pencil's shaded facets | — |
| `--color-blueprint` | `#2A5BAE` | technical blue (hue 218°; ink is 242°, and three times darker): dimension lines and their labels, the loader drawing, the paper's diagrams | 6.01 paper · 5.49 studio · 5.33 grey-100 · 4.80 grey-200 |
| `--color-blueprint-light` | `#8FB3F0` | blueprint on charcoal | 7.43 charcoal · 6.34 raised |
| `--color-hl-yellow` | `#EAF33F` | highlighter, fluorescent lemon (hue 63°: yellow, not green) | graphite under it 11.24 on paper · 9.01 on grey-200 · 9.58 on charcoal |
| `--color-hl-pink` | `#FF94CA` | highlighter, pink | graphite under it 7.19 on paper · 5.77 on grey-200 · 5.81 on charcoal |

**The ground map** (brief section ids):

| Ground | `data-ground` | Sections | Accent family on that screen |
|---|---|---|---|
| paper white | (default) | s00 loader (blueprint lines), s01 hero, s05 architecture (blueprint dimension lines), s07 until The Bleed, s11 claims, s13 the paper, s14 release (golden 3D light) | blueprint on s00/s05; highlighter at most once; ink only as the drop |
| **charcoal** | `charcoal` | **s02 0.1 mm** (the edge hairline glows on dark), **s03 Intelligence** (a night desk, warm lamp key, yellow pencil), **s15 footer** | pencil yellow (s03) or none |
| **cool grey** | `grey` | **s04 Outputs** (gallery), **s12 The lineup** (print room) | highlighter or ink, one of them |
| **light grey** | `grey-light` | **s06 Release notes** | highlighter ("KNOWN ISSUE") |
| ink-blue | `ink` | s07 after The Bleed, s08, s09, s10 | ink is the ground; dims and marks in paper white |

**Usage rules.**
1. **One accent family per screen**: blueprint, pencil yellow, highlighter or ink. Never two on one screen (the highlighter counts as one family whichever colour it is).
2. **Highlighter**: a pen stroke behind **≤ 1 short phrase per screen** (component 9.18). On light grounds it multiplies over the print, like a real marker; on charcoal it becomes an opaque stroke and the phrase turns graphite (paper-white text on yellow would fail). It is off on the ink ground (`--mark: transparent`), where ink is the accent. Candidates: "Answer: see above." (s03 status line), the "KNOWN ISSUE" entry (s06), the ratio "1.414" (s05). Yellow is the default; pink is the second voice (a reviewer's mark, s13 and the PDF).
3. **Pencil yellow is the pencil**: the cursor's lacquer, claim card c4's pencil, the s03 CTA underline. Never a text colour on light grounds, never a button fill, never a glow.
4. **Blueprint is drawing, ink is ink**: blueprint for dimension lines, the loader's blueprint, the √2 ratio lines and the research paper's diagrams; ink-blue stays the drop, The Bleed, the ink world, the 3 mm dot, focus rings and links.
5. **Ground changes** between sections are scroll-synced cross-fades of `--ground` (and the canvas clear colour / studio floor); The Bleed remains the only change that is *absorbed*.
6. The sheet stays the brightest, warmest white on every ground; on charcoal its edge reads as a lit hairline.

**For three.js** (linear sRGB): charcoal 0.0137 0.0168 0.0212 · charcoal-raised 0.0232 0.0284 0.0369 · grey-100 0.7913 0.8070 0.8228 · grey-200 0.6939 0.7231 0.7529 · pencil 0.8963 0.5647 0.0168 · blueprint 0.0232 0.1046 0.4233. On charcoal and grey sections the studio floor and clear colour switch to that ground (cross-fade with the DOM ground).

**What each new ground remaps** (`tokens.css`): charcoal: text paper, muted `#A9B0B9`, rules paper 16 % / 44 % (1.64 decorative, 3.94 UI), focus paper, primary buttons paper with charcoal labels, selection paper with charcoal text, accent pencil, dims blueprint-light, marks opaque under graphite text (`--mark-ink`, `--mark-blend: normal`, `--mark-z: 0`, `--mark-layer: -1`). Grey: text graphite, muted `#55534D`, rules `#BFC4CA` / `#72716B` (3.59 on grey-200, 4.49 on a paper card), focus and accent ink, buttons and selection as on paper, surfaces paper (the print dialog stays a white sheet), wells grey-300, dims blueprint, marks on. `grey-light` is the same with grey-100 as the ground and grey-200 for wells.

---

## 3. Type

### 3.1 Families

| Use | Family | Files | Licence |
|---|---|---|---|
| Everything on the site | **Hanken Grotesk** (variable, weight 300–500) | `hanken-grotesk-var-latin.woff2`, **30.4 KB** | SIL OFL 1.1, © 2021 The Hanken Grotesk Project Authors. No Reserved Font Name |
| The BibTeX box (s13) only | **DM Mono** Regular | `dm-mono-400-latin.woff2`, **8.4 KB** | SIL OFL 1.1, © 2020 The DM Mono Project Authors. No Reserved Font Name |
| Research PDF only | **STIX Two Text** (body), Hanken Grotesk (headings), DM Mono (Appendix B) | embedded in the PDF | SIL OFL 1.1, © 2001–2021 The STIX Fonts Project Authors |

Total web-font weight: **38.8 KB**, of which the mono (8.4 KB) loads only when the BibTeX box renders.

**Why Hanken Grotesk (re-checked against seven alternatives: Host Grotesk, Public Sans, Onest, Reddit Sans, Geist, Mona Sans, Figtree).** Calm and precise, with real Light and Regular cuts that hold up at display sizes; a double-storey *a* and plain *v* that make a quiet lowercase wordmark; and its default figures are already **tabular** (every digit is 0.560 em), so counters, the ruler and tables line up without `font-variant-numeric`. It is clearly not ORYZO: no heavy neo-grotesk display weights (we stop at 500), no uppercase headlines, no wide geometric wordmark (Mona Sans and Figtree failed on that count; Geist and Inter-likes read as templated tech).

**Why DM Mono, not IBM Plex Mono.** Plex carries the Reserved Font Name "Plex", so a subsetted, self-hosted copy would have to be renamed. DM Mono has no RFN, is lighter, and sits more quietly next to Hanken Grotesk Light.

**What the build changed** (`work/scripts/design/build-fonts.py`, a Modified Version under the OFL; Hanken Grotesk has no RFN, so it keeps its name):
- weight axis limited to 300–500 (the three weights we use and everything between);
- **superior figures redrawn**: Hanken's ² ³ ¹ ⁴ float above the cap height (y 488–907 units). They are now composites of the numerator figures, topping out at cap height, so `g/m²` and `mm²` sit properly;
- **added `₂` (U+2082)** for `CO₂e` (the denominator two, dropped 110 units below the baseline);
- **added U+2009 thin space and U+202F narrow no-break space** (0.18 em);
- Latin subset plus the copy's maths and unit signs: × ÷ − ± ≈ √ ≤ ≥ ∞ µ ² ³ ₂ ¼ ½ ¾ ° · – — … ‘ ’ “ ” → ← ↑ ↓; hinting dropped.

`fonts.css` also declares a metric-matched fallback (`"Hanken Grotesk Fallback"`, Arial with `size-adjust: 101.1 %`, ascent 98.9 %, descent 30 %), measured on the copy's own sentences, so the swap barely moves the layout. `font-display: swap` throughout. `tokens.css` sets `font-synthesis-weight: none`: a request for bold renders at 500 instead of a smeared fake bold.

### 3.2 Scale

Fluid between 390 and 1440 px (`work/scripts/design/fluid.mjs`), px values:

| Token | 390 | 768 | 1440 | Weight | Line height | Tracking | Case | Use |
|---|---|---|---|---|---|---|---|---|
| `--fs-display` | 66 | 130 | 245 | 300 | 0.84 | −0.045 em | lower / sentence | nominal fit-width word; real fit-width words are sized per word (3.4) |
| `--fs-h1` | 36 | 47.5 | 68 | 300 | 1.04 | −0.03 em | sentence | the hero sentence |
| `--fs-h2` | 32 | 40.6 | 56 | 300 | 1.06 | −0.025 em | sentence | section headlines |
| `--fs-h3` | 22 | 24.9 | 30 | 350 (`--fw-book`) or 400 | 1.16 | −0.015 em | sentence | sub-heads, tier names, card values |
| `--fs-lead` | 18 | 19.8 | 23 | 300 at ≥ 768, 350 below | 1.40 | −0.008 em | sentence | side copy, quotes, the Arena prompt |
| `--fs-body` | 16 | 16.7 | 18 | 400 | 1.55 | 0 | sentence | body |
| `--fs-small` | 13.5 | 13.9 | 14.5 | 400 | 1.50 | +0.004 em | sentence | notes, captions, roles |
| `--fs-label` | 11.5 | 11.7 | 12 | 500 | 1.25 | +0.10 em | UPPERCASE | eyebrows, nav, buttons, table heads |
| `--fs-micro` | 10.5 | 10.7 | 11 | 500 | 1.40 | +0.08 em | UPPERCASE | meta rows, names, ruler, legal |
| `--fs-mono` | 13 | 13 | 13 | 400 | 1.60 | 0 | as typed | BibTeX |

Sizes step by roughly 1.25 below the lead and 1.2–1.4 above it; the jump from h2 to display is deliberately large (the display words are scenery, not headings).

### 3.3 Case, numbers and units
- **Headlines and body: sentence case. Labels, eyebrows, nav, buttons, meta rows: UPPERCASE, authored in capitals** (never `text-transform`): "INTRODUCING AVIVA A4".
- **AVIVA is always in capitals** (decision #30), in running text as well as labels: "AVIVA A4", "AVIVA Notebook Pro". Lowercase survives only where nobody reads it as the name: URLs and file names (`aviva-a4.pdf`), code, and the BibTeX key (`margin2026aviva`). The wordmark is drawn in capitals to match (8.2).
- **Numbers with units:** a no-break space between value and unit (`0.1&nbsp;mm`, `80&nbsp;g/m²`, `0.0&nbsp;%`); `×` (U+00D7) for dimensions, `÷` and `−` (U+2212) in maths, en dash for ranges (`5–7`, `179–141 BCE`), `≈ ¾`, `1 : √2` with spaces round the ratio colon. A narrow no-break space (U+202F) is available if a tighter join is wanted.
- **Figures** are tabular by default (Hanken Grotesk), so `font-variant-numeric: tabular-nums` is harmless but not required.
- **Quotes and apostrophes** are typographic (“ ” ‘ ’).

### 3.4 Fit-width display words
A fit-width word fills the content width exactly, ink edge to ink edge, as ORYZO's do; ours are numerals and words at Light, the name in capitals.

`font-size = var(--content-w) / W`, then shift left by the first glyph's side bearing so the ink starts on the gutter: `margin-left: calc(-1 * L * 1em)`. Measured at wght 300 (`--tracking-display` −0.045 em, kerning ignored, ±1 %):

| Word | W (ink width, em) | L (first side bearing, em) | font-size at 1360 px content | at 350 px (390 viewport) |
|---|---|---|---|---|
| `4.99 g` (s04, WebGL plane) | 2.426 | 0.020 | 560 px | 144 px |
| `0.1 mm.` | 3.086 | 0.062 | 441 px | 113 px |
| `AVIVA` (live type, not the drawing; **kerned**) | 2.408 | 0.020 | 565 px | 145 px |
| `Release notes.` | 5.674 | 0.085 | 240 px | 62 px |

The capitals kern hard (A–V, V–A), so `AVIVA` was measured in Chromium with kerning on: ignoring it would be 6 % off (2.568 em). The lowercase row it replaces (`aviva`, 2.017 em) is retired with decision #30.

For the WebGL `4.99 g` plane (s04): draw it into a canvas texture with the loaded web font (`document.fonts.load('300 100px "Hanken Grotesk"')` first), graphite, no glow, lit flat (brief 2B).

### 3.5 Measures and wrapping
- Body blocks: `--measure` (36 rem ≈ 576 px, about 65 characters); bodies beside or under the sheet: `--measure-narrow` (26 rem ≈ 416 px); the s13 abstract column: `--measure-wide` (45 rem = 720 px, decision #19).
- Headlines `text-wrap: balance`; bodies `text-wrap: pretty`.
- Where the brief gives a `.m` variant for 390 px, use it rather than letting the browser break.

---

## 4. Grid and layout

| Token | 390 | 768 | 1440 | Notes |
|---|---|---|---|---|
| `--gutter` | 20 | 27 | 40 | everything snaps to these two edges: nav, ruler zone, copy columns, footer |
| `--content-max` | — | — | 1360 | 1440 − 2 gutters; above 1440 the content stays 1360 and centres |
| `--content-w` | 350 | 714 | 1360 | `min(100vw − 2 × gutter, content-max)`; correct because the native scrollbar is hidden (the mm ruler replaces it) |
| `--grid-columns` | 4 | 8 (≥ 768) | 12 (≥ 1024) | |
| `--grid-gap` | 16 | 19 | 24 | |
| nav height (`base.css`) | 56 | 64 | 64 | |
| `--ruler-zone` | — | 36 | 36 | right-hand band kept clear of copy at ≥ 768 (the dev's `.col-r` uses gutter + 44 px; either is fine) |

**Composition rule.** The sheet owns the centre of the screen. Copy lives in three places only: **above** it (eyebrow + headline, centred), **below** it (body, notes, status lines, controls, centred), or **beside** it in a left column (`--gutter` to ≈ 30 %) or right column (≈ 70 % to the ruler zone). Never on top of the sheet. At 390 px every "beside" becomes "above" or "below".

---

## 5. Spacing

`--space-1 … --space-9` = 4 · 8 · 12 · 16 · 24 · 28→40 · 40→64 · 56→96 · 80→144 px (6–9 fluid). Eyebrow → headline: `--space-3`/`--space-4`; headline → body: `--space-4`; body → controls: `--space-5`; between blocks in a column: `--space-6`/`--space-7`; between sections in flowing parts: `--space-9`.

---

## 6. Shape, lines, depth, texture

- **Corners:** `--radius-0` (cards, panels, the sheet) and `--radius-1` = 2 px (buttons, inputs, focus rings). No pills, no circles except the joints of the lamp drawing.
- **Lines:** `--hairline` 1 px. Decorative: `--color-rule`. UI boundaries: `--color-rule-strong`. Solid, never dotted.
- **Crop marks:** `--crop-mark` 10 px arms, `--crop-gap` 6 px from the trim corner, 1 px graphite: the card motif (s11), the loader, the logomark.
- **Dog-ear:** `--dog-ear` 28 px on s08 cards; 6–7 px on the nav mark.
- **Shadows:** only two, both soft and light (decision #12b): `--shadow-contact` (a sheet resting on a surface: s11 cards, the print dialog) and `--shadow-lift` (a sheet held just above: the s11 ground's top edge). `--edge-light` adds the 1 px highlight on a paper edge. On ink the shadows are ink-dark.
- **Elevation:** `--z-canvas` 0 · `--z-content` 10 · `--z-grain` 90 · `--z-nav` 100 · `--z-overlay` 1000.
- **Grain:** a fixed full-screen fractal-noise overlay at `--grain-opacity` 0.05, `mix-blend-mode: multiply` on white and `soft-light` on ink, under the nav; it also hides banding in the studio gradients. Off in reduced motion (`--grain-opacity: 0`). The dev's `.grain` (an inline feTurbulence data-URI, 160 px tile) is the implementation; please read its opacity from `--grain-opacity` and its z from `--z-grain`.

---

## 7. Motion

### 7.1 Durations and curves

| Token | Value | Use |
|---|---|---|
| `--dur-fast` | 160 ms | hovers, presses, colour swaps |
| `--dur-base` | 320 ms | small state changes: nav mark, tooltips, status-line swaps |
| `--dur-slow` | 720 ms | panels, the hint dimming back |
| `--dur-press` | 760 ms | one line of the signature reveal |
| `--dur-draw` | 1400 ms | drawings and dimension lines drawing on |
| `--stagger` | 90 ms | between lines of one block |
| `--ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` | arrivals |
| `--ease-in-out` | `cubic-bezier(0.65, 0, 0.35, 1)` | draws, cross-fades |
| `--ease-spring` | `linear()` with a 4 % overshoot | the sheet's UI echoes (nav dog-ear, size picker), never text |
| `--ease-press` | `cubic-bezier(0.3, 0, 0.1, 1)` | the signature reveal |

3D motion is spring-damped in JS (ζ ≈ 1, ω 6–10 rad/s, brief 2B); CSS durations never fight scroll-scrubbed motion: anything tied to scroll is scrubbed, not timed.

### 7.2 Signature text reveal: **Impression**
ORYZO reveals text per character with blur, typing and mask slide-ups (teardown §3, §8). AVIVA **prints** it. Each line is first **pressed into the sheet without ink**: a blind impression, visible only as a light lower edge and a faint upper shadow. Then the **ink arrives** and the relief disappears under it, line by line, like sheets coming off a platen. No blur, no per-character motion, no movement at all: the line stays exactly where it is and only its tone changes.

```css
/* lines: each line of a block wrapped in <span class="press__line" style="--i:n"> (split by measured lines) */
.press__line { display: block; opacity: 0; }
.is-pressed .press__line { animation: impression var(--dur-press) var(--ease-press) calc(var(--i, 0) * var(--stagger)) both; }
@keyframes impression {
  0%   { opacity: 0; color: color-mix(in srgb, var(--text) 4%, var(--ground)); text-shadow: 0 0 0 transparent, 0 0 0 transparent; }
  14%  { opacity: 1; color: color-mix(in srgb, var(--text) 4%, var(--ground)); text-shadow: 0 0.035em 0 var(--press-hi), 0 -0.03em 0 var(--press-lo); }
  34%  { color: color-mix(in srgb, var(--text) 10%, var(--ground)); text-shadow: 0 0.035em 0 var(--press-hi), 0 -0.03em 0 var(--press-lo); }
  100% { opacity: 1; color: var(--text); text-shadow: 0 0.035em 0 transparent, 0 -0.03em 0 transparent; }
}
@media (prefers-reduced-motion: reduce) {
  .is-pressed .press__line { animation: impression-calm 240ms linear both; }
  @keyframes impression-calm { from { opacity: 0; } to { opacity: 1; } }
}
```
- Used on: h1, h2, h3 and the s14 lines (once each, when they enter; the h1's second line waits its 1.4 s). Bodies and notes get the **ink only** (colour from ground-tint to text, no relief, 480 ms, whole block). Labels and buttons don't animate.
- On ink, `--press-hi`/`--press-lo` remap, so the impression reads as a deboss in the ink-blue sheet before the paper-white ink arrives.
- The dev's `data-split` / `data-reveal` hooks can drive this: add `is-pressed` on enter; split h1/h2 into measured lines (not characters).
- The style guide has a live demo with a Replay button and a frozen mid-frame.

### 7.3 Other motion
- **Draw-on:** drawings (s09), dimension lines (s05, s06 v5.0, s12) and the loader's crop marks draw with `stroke-dashoffset` (`pathLength="1"`, dasharray 1), `--dur-draw`, `--ease-in-out`, strokes staggered by 90 ms. The six drawings do this by themselves when loaded as `<img>`.
- **Status lines:** the old message goes to opacity 0 in `--dur-fast`, the new one arrives with the ink-only reveal. One message at a time.
- **Nav mark:** the dog-ear folds in (scale from its corner) with `--ease-spring` in `--dur-base`.
- **Buttons:** colour swap in `--dur-fast`; a 1 px press on `:active`. Nothing scales, nothing glows.
- **Scroll hint:** dims to 32 % during transitions in `--dur-base`, returns in `--dur-slow`.
- **Reduced motion:** springs lose their overshoot (`--ease-spring` → `--ease-out`), the impression becomes a 240 ms fade, drawings appear in one step (`--dur-draw` 1 ms), grain off; the rest per brief 3.19.

---

## 8. Brand assets

### 8.1 Logomark: crop marks around nothing
`docs/assets/logo/logomark.svg` (26 × 30 grid). Four pairs of printer's crop marks around an **empty 1 : √2 trim box** (14 × 9.9 units). Arms 6, gap 2, stroke 1.5, butt caps: the arms are three times the gap, so the eight strokes read as the extended edges of a sheet (a `#` with its middle removed), not as a ring of dashes (the first version, with short arms, read as a loading spinner at 16 px and was redrawn). `currentColor`.

### 8.2 Wordmark
`docs/assets/logo/wordmark.svg` (viewBox `0 -697 2217.74 697`; cap height 697 units), built by `work/scripts/design/build-logo.py` v2 (decision #30) from Hanken Grotesk at **weight 340** (between Light and Regular: calm when large, firm at 16 px). **AVIVA in capitals, spaced by closest approach, not by area:** each pair is set by the nearest distance between the two outlines, **72 units** where a diagonal meets the I's stem (V|I, I|V) and **68** between the parallel diagonals of A and V (A|V, V|A). Averaging the white space, the usual optical method, let the V's arms touch the I; closest approach keeps the five letters evenly lit, and the word is mirror-symmetric about the I. The letters are the font's own; nothing is redrawn. Each letter is its own path: `#wm-a1 #wm-v1 #wm-i #wm-v2 #wm-a2`. `currentColor`. Metrics in `wordmark-metrics.json` (version 2: case, weight, gaps, letter spans). The lowercase v1, with its A4 tittle, is retired (backed up outside `docs/`).

### 8.3 Lockup
`docs/assets/logo/lockup.svg` (viewBox `0 -780.64 3134.07 864.28`): logomark left of the wordmark; the mark is **1.24 × the cap height**, centred on the caps' midline, with a gap of **0.24 × the cap height** to the first A (`LOCK_SCALE`, `LOCK_GAP` in the build script). Nav size: **18 px tall (≈ 65 px wide; the caps are 14.5 px)**; minimum 14 px tall. Clear space: one mark-width on every side. Paste the SVG inline (it must follow `color` on every ground); keep `aria-hidden` inside the labelled link. The style guide shows it inline (`#sg-lockup-g`).
**Request to the web-developer (15.1):** the nav sets the name as live text plus a mark; please inline `lockup.svg` instead.

### 8.4 Floor decal (retired)
**Retired by decision #31:** the hero is now the sheet folding into the letter A (brief Part 10.2 #21), and nothing loads the decal. The files stay in `docs/assets/logo/`, rebuilt from the capitals wordmark in case a scene wants the word on the floor again: `wordmark-floor.svg` and `wordmark-floor.png` (4096 × 1495 px, RGBA, RGB graphite everywhere, alpha = ink, 4 % padding; 98 KB). UVs are in `wordmark-metrics.json` → `floor_uv` (u right, v down from the PNG's top-left: baseline v 0.8986, cap line v 0.1014, the I centred on u = 0.500, letter spans per id). The v1 UVs (lowercase, i at u 0.5023) no longer apply.

### 8.5 Favicons
`docs/favicon.svg`: the logomark redrawn at its own optical size for 16–32 px (trim box 13.5, gap 2, arms 6.25, stroke 3 on a 32 grid), graphite, paper white under `prefers-color-scheme: dark`. `docs/assets/favicon-32.png` (transparent) and `docs/assets/apple-touch-icon.png` (180, paper-white tile, graphite marks). Head tags: `<link rel="icon" href="favicon.svg" type="image/svg+xml">`, `<link rel="icon" href="assets/favicon-32.png" sizes="32x32">`, `<link rel="apple-touch-icon" href="assets/apple-touch-icon.png">`.

### 8.6 Icons (brief 5.8)
`docs/assets/icons/`: 24 px grid, 1.5 px line, round caps and joins, no fills, `currentColor`; `sprite.svg` holds them all as `<symbol id="i-…">`. **pencil · eraser** (the pencil turned round, on a line of paper) **· regenerate** (a crumpled ball and a return arrow) **· tear** (perforation with a notch where the tear starts) **· magnifier** (the bar magnifier over lines of text) **· dog-ear · crop-marks · ruler-tick · turn-over** (a sheet with its corner lifting: the scroll hint) **· plane · copy · download · external · printer · check · rating-4 · rating-3 · model-sheet · model-notebook · model-ream** (the s12 lineup, brief 5.11: one A4 footprint in isometric view at three thicknesses: a single sheet, a bound block with its binding strip, a tall stack with its layers; 20 px in the Model radio group and the table head). 20 icons. The dev's `.icon` mask classes already point at these file names; the model icons are used from the sprite (`<svg><use href="assets/icons/sprite.svg#i-model-…"/></svg>`), so they follow `color` when their option fills.

### 8.7 Drawings (brief 5.7)
`docs/assets/illustrations/printer.svg cat.svg lamp.svg shredder.svg pencil.svg bin.svg`: 96 × 96, 1.25 px line with a subtle graphite grain (an feTurbulence alpha mask, 0.85 frequency, alpha 0.8–1.0), objects only, a few light hatch strokes for shadow. A laser printer with a sheet coming out; a cat asleep, curled on a sheet; an anglepoise lamp over a blank page; a shredder taking a sheet, strips in its window; a half-length HB pencil with its cut end and "HB" on the barrel; a wire-mesh bin with one crumpled ball. Every stroke has an id (`#cat-tail` …) and `pathLength="1"`; as an `<img>` each drawing **draws itself on once** (1.1 s per stroke, 90 ms stagger, off in reduced motion). Colour: `currentColor`, defaulting to **paper white** when loaded as an `<img>` (they live on the ink ground of s09); inline them and they follow `color`.
Release-notes glyphs, `docs/assets/illustrations/glyphs/` (16 px, 1.25 px line, default graphite; `glyphs/sprite.svg` with `#g-…`): **map** (v0.1) · **seal** (v1.0) · **pin** (v1.1) · **scroll** (v1.4) · **watermark**, a sheet with faint crop marks (v2.0) · **book** (v2.1) · **wasp** (v2.2) · **letter** (v2.3) · **roller**, two press rolls with the web between (v3.0) · **log** (v4.0) · **area** "1 m²" (v5.0) · **globe** (v5.1) · **screen** with a cross (known issue) · **reeds**, struck through (removed). Tier B: place them at 16 px in the version column, muted, `alt=""`.

---

## 9. Components

All of these exist in `docs/css/base.css`, `ui.css` and `sections.css` (web-developer); the style guide renders them from those files. Where the build differs from this spec, the difference is listed under **Change**.

### 9.1 Nav
No bar, no background. Lockup left (8.3), four labels right: SHEET · SPECS · SIZES · PAPER (`--fs-label`, Medium, +0.10 em), 26 px apart (14 px at 390). Rest: `--text-muted`; hover and active: `--text`. **Active mark: a folded corner**, a 7 × 7 px right triangle in the link's top-right corner, filled `currentColor`, its hypotenuse facing the text (the flap of a dog-ear), folding in from its corner with `--ease-spring`. Hover: colour only (no underline, no scramble, no dimming). On ink everything is paper white.
**Change:** inline `lockup.svg` (8.3).

### 9.2 The millimetre ruler
Right edge, from under the nav to above the hint. A 1 px `--color-rule-strong` track; ticks every 10 mm (5 px, `--color-rule`) and every 50 mm (10 px, `--color-rule-strong`), 297 mm over the track's height; at ≥ 768 the 50 mm ticks carry micro labels (`50` … `250`, muted, right-aligned 14 px left of the track). The marker: a 14 px graphite tick plus the readout `{n} mm` in micro, tabular. At the end it reads `297 mm. End of sheet.`; back at the top after that, `0 mm. Blank again.` At 390: ticks only, readout hidden except while scrolling.
**Change:** add the 50 mm labels at ≥ 768.

### 9.3 PLEASE TURN OVER
Bottom centre, 18 px above the edge (12 at 390): the `turn-over` icon (14 px) + `PLEASE TURN OVER` (micro). Dims to 32 % during transitions, hidden in s13–s15. The icon's corner may lift 2° on a 3 s loop (off in reduced motion); nothing else moves.

### 9.4 Buttons
Rectangles, `--radius-1`, 1 px `--color-rule-strong` border, label in `--fs-label` Medium UPPERCASE, 40 px tall (32 px small; 44 px minimum touch target at 390 via padding), 16 px side padding, 10 px icon gap, 16 px icons.
- **Default (hairline):** transparent, `--text`. Hover: border `--text`. Active: 1 px down.
- **Primary:** `--button-bg` / `--button-fg` (graphite / paper; paper / ink on ink). Hover: inverts to hairline.
- **Toggle** (`aria-pressed="true"`, ERASE): filled like primary.
- **Hold** (HOLD TO TEAR): a fill grows left to right inside the button with the tear progress; releasing leaves it where it stopped.
- **Disabled** (PRINT, WEIGHTS · 4.99 g): `aria-disabled="true"`, opacity 0.42, `cursor: not-allowed`, no hover change; the description appears under it on hover and focus (`.tip`, small, muted).
- Never pills, never shadows, never glows.

### 9.5 Segmented control (Arena) and the Model radio group (print dialog)
One hairline rectangle divided by hairlines; labels in `--fs-label` Medium, authored in capitals. Hover: a 7 % `--text` tint. Selected: `--button-bg` fill, `--button-fg` text (icons follow through `currentColor`). Focus ring on the focused option.
- **Arena vote (s10):** horizontal; options 40 px tall; toggle buttons with `aria-pressed`.
- **Model (s12; Part 10.2, decisions #27, #28):** the same rectangle stood on end. `role="radiogroup"`, `aria-label="Model"`, three native `<input type="radio">` (so the arrow keys move the choice): **AVIVA · AVIVA NOTEBOOK PRO · AVIVA REAM PRO MAX**, default AVIVA. It spans the dialog's full width, with the key "Model" above it, because the longest name needs the room (at 28vw the value column is only ≈ 180 px). Options 44 px tall, left-aligned, 12 px left padding, 12 px between icon and name, hairlines between options; a **20 px model icon** in each: `i-model-sheet`, `i-model-notebook`, `i-model-ream` (8.6). No counts or prices in the options; Copies and Pages say how many.
- The paper-size radio group (A5 / A4 / A3, sheet icons at relative size) is **retired**: the sizes live in the table.
```css
.dlg__row--model { grid-template-columns: minmax(0, 1fr); align-items: start; gap: 8px; padding-block: 10px 14px; }
.seg--model { display: grid; width: 100%; }
.seg--model .seg__opt { justify-content: flex-start; gap: 12px; min-height: 44px; padding: 0 14px 0 12px; border-left: 0; }
.seg--model .seg__opt + .seg__opt { border-top: var(--line-strong); }
.seg__ico { width: 20px; height: 20px; flex: none; }
```
One option: `<label class="seg__opt"><input type="radio" name="model" value="base" checked><svg class="seg__ico" aria-hidden="true"><use href="assets/icons/sprite.svg#i-model-sheet"/></svg><span>AVIVA</span></label>`. The style guide (06) runs it live: Copies, Pages, the tier text, the table's marked column and the live line all follow.

### 9.6 Inputs ("Type a line")
A ruled line, like lined paper: no box, a 1 px `--color-rule-strong` underline that turns `--text` on focus-within, the `pencil` icon (16 px, 70 % opacity) at the start, text at `--fs-body`, placeholder in `--text-muted`. Visible `<label>` above in `--fs-small` muted. The WRITE IT button sits to the right (below at 390). Never dashed boxes, never a dotted underline with an arrow.

### 9.7 Status lines
One line, `--fs-small`, `--text`, centred under the sheet, `aria-live="polite"`, fixed `min-height` (one line) so nothing jumps. Messages swap: old one fades in `--dur-fast`, new one arrives ink-only. Never assertive, never more than one message.

### 9.8 Metric triplet (s05)
Three equal columns (stacked at 390), each with a 1 px `--color-rule` top border and `--space-3` above: **value** first (`--fs-h3`… at ≥ 1024 `--fs-h2`, Light, tabular), then the **label** (micro, UPPERCASE, `--text`), then the **note** (small, muted, ≤ 4 lines).

### 9.9 Sheet cards with a dog-ear (s08, on ink)
Three portrait **A-series** cards (`aspect-ratio: 210 / 297`, `--surface` = ink, 1 px paper-62 % border), the top-right corner folded: `clip-path` removes a `--dog-ear` triangle and a flap (`::after`) shows the verso in paper at 30 %, with a 1 px fold line. Inside, top-down: value (`--fs-h2` Light), label (micro), body (small, muted), source (small, muted, italic title). Desktop: three in a row, max 1080 px; 768: three in a row at 3 : 4 · 390: stacked, **landscape √2 : 1** (every card is still an A-series sheet, turned).
**Change:** the cards are `min-height: 300px` today; make them `aspect-ratio: 210 / 297` (≥ 768) and `297 / 210` (390), so they are sheet-shaped as the brief asks.

### 9.10 Review rows and the corner-rating glyph (s09, on ink)
Two columns (x 4–36 % and 64–96 %), three rows each, the centre left to the sheet. Row: drawing (72 px at 1440, 64 at 390, left) · rating glyph · quote (`--fs-lead`, Light, ≤ 3 lines) · WHO (micro, UPPERCASE) · role (small, muted). No stars, no highlighted phrase, no photos. **Corner-rating glyph:** 13 × 18 px (a 1 : √2 box), four 4 px corner marks, 1 px; **3/4 = the top-right mark replaced by a 45° fold line** (a dog-ear), not just missing. Visually hidden text "Rated {n} out of 4 corners." The legend sits above the first row.
**Change:** `.corners--3` currently hides the top-right corner; add the fold line (a 4 px diagonal, e.g. a `linear-gradient(45deg, …)` on `i:nth-child(2)`), as in `icons/rating-3.svg`.

### 9.11 Claim cards (s11)
Alternating **portrait 1 : √2 and landscape √2 : 1 at the same height** (72 vh at ≥ 768), paper-white, 1 px graphite hairline, square corners, `--shadow-contact`, and **crop marks at all four corners** (`--crop-mark` arms, `--crop-gap` gap, 1 px graphite, outside the card). The render fills the top 60 % (`--color-studio` while loading; c7's backdrop is the one dark card); below: headline (portrait 18→28 px, landscape 20→34 px, Light, balanced), caption (small, muted), meta row (micro, UPPERCASE) pinned to the bottom. At 390: **every card portrait** at 80 vw (phones are portrait; landscape renders keep their ratio inside the portrait card), 12 px gaps, the same horizontal pin.
**Change:** the build draws crop marks at two corners (one per pseudo-element). Four corners from a single `::before`:
```css
.claim::before {
  content: ""; position: absolute; pointer-events: none;
  inset: calc(-1 * (var(--crop-gap) + var(--crop-mark)));
  --e: calc(var(--crop-gap) + var(--crop-mark)); --c: linear-gradient(var(--color-graphite), var(--color-graphite));
  background:
    var(--c) left 0 top var(--e) / var(--crop-mark) 1px no-repeat,  var(--c) left var(--e) top 0 / 1px var(--crop-mark) no-repeat,
    var(--c) right 0 top var(--e) / var(--crop-mark) 1px no-repeat, var(--c) right var(--e) top 0 / 1px var(--crop-mark) no-repeat,
    var(--c) left 0 bottom var(--e) / var(--crop-mark) 1px no-repeat, var(--c) left var(--e) bottom 0 / 1px var(--crop-mark) no-repeat,
    var(--c) right 0 bottom var(--e) / var(--crop-mark) 1px no-repeat, var(--c) right var(--e) bottom 0 / 1px var(--crop-mark) no-repeat;
}
```
(then `::after` is free; `.claim` needs `overflow: visible` and room for 16 px outside each card).

### 9.12 Print dialog (s12)
An OS-neutral miniature dialog: a paper panel, 1 px `--color-rule-strong` border, a soft contact shadow, 24 px side padding, the s12 column's width (400 px at 1440). Title "Print" (body, Medium) over a hairline. Rows separated by hairlines, label left in small muted, value right:
1. **Model** (9.5): the key above, the radio group full width.
2. **Paper size:** "A4", fixed, with the note "A5 and A3 too: see the table."
3. **Orientation:** "Portrait", with the note "Landscape is the same sheet, turned."
4. **Copies:** 1 / 80 / 500, following the model.
5. **Pages:** "1 of 1 (blank)" / "80 of 80 (blank)" / "500 of 500 (blank)".

Footer: the disabled PRINT primary button with the `printer` icon, its tip under it ("Nothing to print. Nothing is for sale."). **Tier text** under the dialog, swapped with the model: name (h3: AVIVA / AVIVA Notebook Pro / AVIVA Ream Pro Max), description (body), spec line (label, muted: "1 SHEET · 4.99 g", "80 SHEETS · ≈ 399 g", "500 SHEETS · ≈ 2.5 kg"; units keep their case). A visually hidden polite line announces each change: "AVIVA Notebook Pro selected: 80 sheets." (singular for the base model: "AVIVA selected: 1 sheet."). The live preview is the 3D stack beside it.

### 9.13 Comparison table (s12)
**The lineup** (brief 3.13): columns AVIVA / AVIVA NOTEBOOK PRO / AVIVA REAM PRO MAX, each header carrying its 20 px model icon above the name (10 px gap, header cells bottom-aligned), and 11 rows: Sheets · Sizes · Context window (A4) · Weight (A4, calculated) · Thickness · Aspect ratio · Modalities · Memory · Regenerations included · Hallucinations · Fits a C5 envelope (A4). Visually hidden caption: "AVIVA, AVIVA Notebook Pro and AVIVA Ream Pro Max compared."
Plainly ruled: header row in `--fs-label` Medium over a `--color-rule-strong` line; rows 12 px × 14 px padding with `--color-rule` lines; row labels muted in the first column (26 %); values regular, tabular. The selected model's column gets a 1 px `--text` top rule on its header cell, following the dialog, and nothing louder (no "New", no colour, no rounded rows). Foot (micro, muted): "Sizes: ISO 216. Context, weight and thickness calculated for A4 sheets at 80 g/m², paper only, not weighed. Notebook binding not included." At 390: swipe horizontally, row labels sticky.
```css
.cmp__t thead th { vertical-align: bottom; }
.cmp__ico { display: block; width: 20px; height: 20px; margin-bottom: 10px; }
```

### 9.14 BibTeX box (s13)
`--surface-sunken` (studio) well, 1 px `--color-rule` border, 20 px × 24 px padding, DM Mono 13/1.6, `white-space: pre`, horizontal scroll at 390. It shows `docs/research/citation.bib` verbatim (`@inproceedings{margin2026aviva, …}`, brief 4.6). "BibTeX" label (micro, muted) and the COPY button (small, with `copy` icon) above it, right-aligned; COPIED for 2 s.

### 9.15 Footer and colophon (s15)
On paper, under a 1 px rule. Three columns at ≥ 1024 (stacked at 390): **left** lockup (16 px), colophon, live ream count (small); **middle** links (Research paper (PDF) · BibTeX · Model (.obj) · Credits · Source on GitHub → `https://github.com/withnolan/aviva`), each underlined by a 1 px `--color-rule-strong` line; **right** the disclaimer (exact wording, small), licence, © 2026 withnolan, BACK TO 0 MM (label). Micro and small sizes only; no boxes, no dashed borders, no share buttons.

### 9.16 Focus, selection, tooltips
- **Focus:** `outline: 2px solid var(--color-focus); outline-offset: 3px; border-radius: var(--radius-1)` on `:focus-visible` (ink on white, paper on ink). The ruled input shows focus with its underline turning `--text` **and** the ring.
- **Selection:** ink ground, paper text (`--selection-*`); inverted on ink.
- **Tooltips / tips:** small, muted, under their trigger, fading in `--dur-base`; no boxes except the pencil tip (a paper label with a hairline).

### 9.17 Small furniture
Ream status `{n} left in this ream.`: micro, a hairline rectangle on `--ground`, beside the sheet for 3 s. WebGL fallback banner: paper, hairline under, `fb.h` Medium + `fb.body` muted + OK (small button). Context-loss line: small, centred, graphite.

### 9.18 Highlighter mark (v2)
A real marker stroke behind **one short phrase per screen at most** (one line, ≤ ≈ 28 characters): `<mark class="hl">Answer: see above.</mark>`, `.hl--pink` for the second voice. The stroke is `docs/assets/marks/highlighter.svg` used as a **mask** (alpha = ink: a chisel-tip shape with angled ends, a slight upward drift, a darker landing where the tip touches, a thinner lift, two faint felt streaks; mask alpha ≈ 0.88), filled with `--mark`, so the colour always comes from the tokens. It sits a touch low and wide (−0.2 em left, −0.24 em right, 0.1 em from the top), tilted −0.7°.
- **Light grounds:** the stroke lies **over** the text with `mix-blend-mode: multiply`, exactly like ink over print: graphite stays graphite, paper turns lemon. Graphite under it: 11.24 (paper), 9.01 (grey-200).
- **Charcoal:** the roles flip it: the stroke lies **under** the phrase (`--mark-z: 0`, `--mark-layer: -1`), blends normally, and the phrase turns graphite (`--mark-ink`): 9.58 : 1.
- **Ink ground:** off (`--mark: transparent`).
- **Motion:** drawn on left to right when it enters (`.is-drawn` from the reveal observer): `clip-path: inset(0 100% 0 0)` → `inset(0 -1% 0 0)`, 620 ms `--ease-in-out`, once. Reduced motion and no-JS: shown drawn.
- **Never** behind a headline, a whole sentence, a button or a link; never two on one screen; never an animated glow or a fill on hover.
```css
.hl { position: relative; z-index: var(--mark-z, auto); color: var(--mark-ink); background: none; white-space: nowrap; }
.hl::after {
  content: ""; position: absolute; z-index: var(--mark-layer, auto); pointer-events: none;
  inset: 0.1em -0.24em -0.04em -0.2em;
  background: var(--mark);
  -webkit-mask: url("../assets/marks/highlighter.svg") 0 0 / 100% 100% no-repeat;
          mask: url("../assets/marks/highlighter.svg") 0 0 / 100% 100% no-repeat;
  mix-blend-mode: var(--mark-blend);
  transform: rotate(-0.7deg);
  clip-path: inset(0 100% 0 0);
  transition: clip-path 620ms var(--ease-in-out);
}
.hl--pink::after { background: var(--mark-alt); transform: rotate(0.5deg); }
.hl.is-drawn::after, .no-js .hl::after { clip-path: inset(0 -1% 0 0); }
@media (prefers-reduced-motion: reduce) { .hl::after { clip-path: none; transition: none; } }
```
(The `url()` is relative to `docs/css/`; put the rules in `base.css`.)
**Mask files:** an XML comment must never contain `--`. That makes the SVG invalid, the mask silently fails to load, and the mark vanishes on screen and prints as a plain rectangle. Both mark SVGs were fixed for this; every SVG in `docs/` now parses.

### 9.19 Pencil yellow: the pencil and its underline (v2)
- **The pencil cursor** (`ui.css`, `.pencil__*`): lacquer `--pencil` (`#F3C623`) on the body, the right third shaded `--color-pencil-shade` (a 3.3 px rect on the body's right edge, so the hexagonal barrel reads), the facet line `rgba(255,255,255,0.35)`, the sharpened wood `#E9D9BF` and the graphite lead as now, ferrule `#B9B6AE`, eraser `#E7B9B2`. On light grounds the barrel gets a 0.75 px `rgba(42,41,38,0.45)` outline so the yellow (1.49 : 1 on paper) still reads as an object.
- **The 3D pencil** (claim card c4, the s03 desk) uses the same lacquer and shade (three.js linear values in 2.1).
- **The CTA underline** (`.u-pencil`, s03 "Pick up the pencil." on charcoal): a quick hand-drawn pencil-yellow stroke under the label, `docs/assets/marks/pencil-underline.svg` as a mask (tapered ends, a slight rise, heavier mid-stroke), 0.36 em tall, 0.55 em below the text, drawn on after the label arrives (520 ms `--ease-out`, 160 ms delay). Pencil on charcoal: 9.71 : 1.
```css
.u-pencil { position: relative; display: inline-block; padding-bottom: 0.55em; }
.u-pencil::after {
  content: ""; position: absolute; left: -0.08em; right: -0.2em; bottom: 0; height: 0.36em; pointer-events: none;
  background: var(--pencil);
  -webkit-mask: url("../assets/marks/pencil-underline.svg") 0 0 / 100% 100% no-repeat;
          mask: url("../assets/marks/pencil-underline.svg") 0 0 / 100% 100% no-repeat;
  clip-path: inset(0 100% 0 0);
  transition: clip-path 520ms var(--ease-out) 160ms;
}
.u-pencil.is-drawn::after, .no-js .u-pencil::after { clip-path: inset(0 -2% 0 0); }
@media (prefers-reduced-motion: reduce) { .u-pencil::after { clip-path: none; transition: none; } }
```
- Pencil yellow is never a text colour on light grounds, never a button fill and never a glow.

### 9.20 Dimension lines in blueprint (v2)
Every dimension line, extension line, tick and its label uses `--dims`: blueprint on paper and grey (6.01 / 4.80), blueprint-light on charcoal (7.43), paper white on ink. That covers the s00 loader drawing (crop marks stay graphite: they are the logomark's), the s05 √2 lines and readouts ("1.414" may carry the screen's one highlighter), the s06 v5.0 "1 m²" drawing and the s12 size labels. Lines 1 px (`vector-effect: non-scaling-stroke`), labels micro at `--fs-micro`, Medium; ends are short perpendicular ticks as in the loader, never arrowheads.

---

## 10. Section layouts (390 / 768 / 1440)

Sheet positions are the brief's (2B, % of viewport); this table places the DOM around them.

| Section | 1440 | 768 | 390 |
|---|---|---|---|
| s00 loader | crop marks + dimension lines registered to the sheet's first pose (50, 52), 46 vh%; label 34 px under the drawing, counter on the 297 line | same | same, the drawing at the sheet's mobile size |
| s01 hero | eyebrow (label, muted) centred at nav + 5 %; h1 centred, `--fs-h1`, max 18 em, l1 balanced on two lines, l2 its own line, centre ≈ 22 %; floor wordmark (3D) 88 % wide at y 56 %; side copy (lead) + spec (micro, muted) centred, bottom ≈ hint + 36 px | same, h1 47 px, three lines | `.m` breaks, h1 36 px, four lines; side copy two lines |
| s02 thin | "0.1 mm." display-s centred above the sheet (top ≈ 10 %); body + note centred under it (`--measure-narrow`); VERSO micro label right of the sheet | same | same; verso label under the body |
| s03 intelligence | head (eyebrow, h2, body, cta) centred above the sloped sheet; tools (ERASE, REGENERATE, Type a line) in the right column, vertically centred; status line centred under the sheet; note under the tools | head above, tools under the status line | head above; DRAW toggle + tools under the sheet; type-a-line full width |
| s04 outputs | intro (eyebrow, h2, body, note) top-left column (`--measure-narrow`) while the numerals fill the width; gallery title top-left over the drying line; PROMPT/OUTPUT pairs under each hanging output, 26 vw apart | same, pairs 40 vw apart | intro above the numerals; pairs 70 vw apart, one centred at a time |
| s05 architecture | claim (eyebrow, h2, body) left column ≤ 380 px; metric triplet across the bottom third; distil block top-left; HOLD TO TEAR under it; results right column | metrics in three columns, claim above | everything stacked above/below the sheet; metrics stacked |
| s06 release notes | one column, max 960 px, offset left of the sheet (which sits at x 70 %): version + date (label) · title (lead) · note (small, muted, 46 ch) | same, sheet smaller | full width, sheet hidden or as a small sticky at the top |
| s07 surface | head centred over the macro; loupe bar across the middle; absorption block bottom-left; "KEPT." beside the dot | same | same, loupe full width |
| s08 afterlife (ink) | head centred under the glowing sheet; three portrait cards in a row (max 1080); note centred | three in a row | stacked landscape cards |
| s09 reviews (ink) | head centred; rows in two columns (4–36 %, 64–96 %) around the sheet | rows in two columns, sheet smaller | one column; the sheet as a small sticky above |
| s10 arena (ink → white) | head top-left column; prompt centred between the sheets; labels under each; vote segmented control centred under; result + leaderboard under it; coda centred bottom | same | head above, sheets side by side at 40 vw, controls under |
| s11 claims | eyebrow + sub top-left; card row pinned at vp-y 12 %, 72 vh tall | same | portrait cards 80 vw |
| s12 lineup | head + print dialog left (x 6–34 %); the sheet, block or stack right (62, 52); table full width below | dialog above, sheet beside | dialog above the sheet; table swipes |
| s13 paper | one column, `--measure-wide` (720), centred | same | full width |
| s14 release | h2 lines centred above the sheet; tools under; credit centred where the sheet was; GitHub button under it | same | same, tools stacked |
| s15 footer | three columns | two | one |

---

## 11. The research paper (`docs/research/`)
**`docs/research/aviva-a4.pdf`** (decision #29): "AVIVA A4: A Multimodal Foundation Model at 80 g/m²" (Part 10.2, decision #27), 8 pages, A4, ≈ 0.6 MB, tagged, with an outline. Beside it `citation.bib` (brief 4.6 verbatim, key `margin2026aviva`) and `aviva-a4.obj` (brief 4.7, four vertices). The old `void-of-all-characters.pdf` is deleted.
- **Format:** a two-column conference paper. Page 210 × 297 mm; margins 19 mm at the sides, 25 mm top, 24 mm bottom; 7 mm column gap. Running head in Hanken 7.4 pt, muted, 12.5 mm from the top: page 1 "Technical report AV-A4-001 · 2026 · 8 pages" | "AVIVA Research"; pages 2–8 "AVIVA Research · AVIVA A4"; folios at the foot.
- **Type:** body STIX Two Text 9.8/12.9 pt, justified, graphite; the 12.9 pt baseline step sets every vertical space. Title in Hanken Grotesk 21 pt, two lines ("AVIVA A4:" / "A Multimodal Foundation Model at 80 g/m²"). Headings, captions, tables and the running head in Hanken, as **static 300 / 400 / 500 instances** (Chromium prints a variable font as Type 3, which some viewers render badly). Equations in MathML Core with **STIX Two Math**; Appendix B (the .obj listing) in DM Mono. Fonts in `docs/research/src/fonts/`, subset, with `OFL-STIXTwo.txt`.
- **Colour (decision #24):** graphite text; blueprint blue (#2A5BAE) for dimension lines and the AVIVA series in the figures; ink for links; ink at full strength only for real ink (Figure 5). Two reviewer's marks with the highlighter: yellow on "therefore 0.00 %" (§5.1), pink on "Respectfully, no." (Appendix A).
- **Figures:** 1–4 and 6 are graphite line drawings in true millimetres (`build-paper-figures.mjs`; its `dim()` helper draws the blueprint dimensions), inlined by `paper.js` so they set in the paper's fonts. Figure 5 is three brightfield micrographs of ink spreading through the sheet at t = 0.05, 0.35 and 1.0 (`build-fig5.mjs`: the site's closed-form ink-front model, R = 0.16 + 0.34 √t mm, a ragged fbm edge, wicking along the fibres, Beer–Lambert colour in linear light; JPEG).
- **Tables:** booktabs rules. Table 2 (pre-training, six prose rows) is a full-width band at the top of page 4; Appendix B is a full-width band at the foot of its page.
- **Hyphenation:** headless Chromium on Linux has no hyphenation dictionaries, so `hyphenate-paper.mjs` inserts soft hyphens at build time (Liang's algorithm with the en-GB TeX patterns from the `hyphen` npm package, which is not shipped). Chromium writes every soft hyphen into the PDF's text layer, so `paper.js` strips the ones the layout does not use before printing (last build: 15 used, 295 removed). **To edit the text:** strip U+00AD from `paper.html`, edit, then re-run the hyphenator.
- **Checks** (`paper.js` → `window.__report`, read by `build-paper.mjs`): no overflow on any page, fill per page, no broken links, every reference cited (the three fictional ones once each, decision #25), exactly 8 pages, every font embedded and none Type 3. pypdf writes the metadata (title, authors, subject, keywords). Pages 2, 4 and 7 keep their white space by agreement (decision #25).
- **Build** (site server on :8080): `node work/scripts/design/build-paper.mjs` writes the PDF, `work/screenshots/paper/p-1…8.png` and a contact sheet. Figures: `node work/scripts/design/build-paper-figures.mjs`; Figure 5: `node work/scripts/design/build-fig5.mjs`.

## 12. The print joke
`docs/css/print.css`, linked last with `media="print"`. `@page { size: A4; margin: 0 }`; `html` and `body` are 210 × 296 mm (a millimetre short, so rounding never spills onto a second sheet); everything except `.print-only` is hidden. The site's own `.print-only` block (index.html) carries the two lines, so the copy lives in one place: centred, 10 mm from the foot, `.print-only__line` at 7 pt ("AVIVA A4 · 210 × 297 mm · You have printed the product.") and `.print-only__disc` at 6 pt in #615F58 (the disclaimer). Pages without the block (the lab pages, this style guide) get the same two lines from `body::before` / `::after`. On screen `.print-only` is hidden (`base.css`). Verified with Playwright: exactly **one** page in both cases (`node work/scripts/design/print-test.mjs <url> out.pdf`).

## 13. Budget
Fonts 38.8 KB (8.4 KB of it only on demand). Logo SVGs ≈ 3 KB; floor decal PNG 98 KB (retired, not loaded). Icons ≈ 12.7 KB as 20 files or 5.8 KB as one sprite. Six drawings ≈ 2 KB each. Favicons < 1.5 KB.

## 14. Credits (for `docs/CREDITS.md`)
- **Hanken Grotesk**, Copyright 2021 The Hanken Grotesk Project Authors (https://github.com/marcologous/hanken-grotesk), SIL Open Font License 1.1. Subsetted and modified for AVIVA (superiors redrawn, U+2082 and thin spaces added); static 300 / 400 / 500 instances for the research PDF.
- **DM Mono**, Copyright 2020 The DM Mono Project Authors (https://www.github.com/googlefonts/dm-mono), SIL Open Font License 1.1. Subsetted.
- **STIX Two Text and STIX Two Math** (research PDF only), Copyright 2001–2021 The STIX Fonts Project Authors (https://github.com/stipub/stixfonts), with Reserved Font Name "TM Math", SIL Open Font License 1.1. Subsetted; licence in `docs/research/src/fonts/OFL-STIXTwo.txt`.
- Licence texts ship in `docs/assets/fonts/OFL-HankenGrotesk.txt` and `OFL-DMMono.txt`.

## 15. Requests to the web-developer (summary)
Status on 2026-10-16. Done already in the build: `.print-only` hidden on screen; the PDF links point at `research/aviva-a4.pdf`; `.kb-line` uses `grid-template-columns: minmax(0, 1fr)`.
1. Nav: inline `assets/logo/lockup.svg` (18 px tall, 16 px at 390) instead of live text + mark (8.3, 9.1).
2. Ruler: 50 mm micro labels at ≥ 768 (9.2).
3. s08 cards as spec sheets: `aspect-ratio: 210 / 297` on the ink-deep surface, the value at the head and the label, body and source settling at the foot (`.card__l { margin-top: auto }`); `297 / 210` on phones (9.9).
4. s09 3/4 rating: draw the dog-ear fold line in place of the missing corner (9.10).
5. s11 claim cards: crop marks at all four corners (9.11; CSS above), and at least 40 px between cards so neighbouring marks never meet.
6. Headlines: the Impression reveal (7.2) instead of any blur or per-character reveal; bodies ink-only.
7. Grain: read `--grain-opacity` and `--z-grain` (6).
8. Footer and any credit: **withnolan**, `https://github.com/withnolan`, source `https://github.com/withnolan/aviva` (decision #21).
9. Ruler readout: a ground-coloured backing, so it covers the 50 mm labels it passes: `.ruler__readout { background: var(--ground); padding: 2px 6px; margin-right: -2px; }` (9.2).
10. Marks inside uppercase labels cover the cap height, not the x-height: `:is(.label, .micro, .eyebrow) .hl::after { inset: -0.28em -0.36em -0.26em -0.32em; }` (9.18).
11. s12, the lineup (Part 10.2): the Model radio group with its icons (9.5), the dialog rows and tier text (9.12), the lineup table with icons in its head (9.13), and the live line with "1 sheet" for the base model. Remove `.seg--size`, `.sheet-ico` and the A5 / A4 / A3 tier blocks.
12. Print: the `.print-only` copy in capitals: "AVIVA A4 · 210 × 297 mm · You have printed the product." and "AVIVA is a fictional parody project, …" (12, decision #30).
13. s13: the BibTeX box shows `docs/research/citation.bib` verbatim; it still shows the old `margin2026void` entry (9.14).
