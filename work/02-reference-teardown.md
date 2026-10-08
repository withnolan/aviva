# 02 — ORYZO reference teardown

Author: reference-analyst · Date: 2026-10-01 · Status: complete (v1)

## Sources and reach (read first)
- **oryzo.ai is not reachable** from this VM (proxy 403 / ERR_TUNNEL_CONNECTION_FAILED, checked by the lead in Phase 0). No live capture, no DOM/`window` inspection, no asset list. Everything about libraries and canvas vs DOM below is **inferred from the frames**, and marked so.
- **blog.lusion.co (Oryzo BTS series) is not reachable** (curl and WebFetch blocked). Only WebSearch snippets were used; see §6.
- **Primary source:** `reference/VIDEO_NOTES.md` + all 84 frames in `reference/oryzo-frames/` (every frame opened and read). Frames are 1440×748 JPEGs scaled from a 1918×996 desktop screen recording.
- **Secondary:** `work/oryzo-1-repo/` (README, paper.pdf, checkpoint .obj headers) for the academic section's format.
- **Mobile:** the recording is desktop only. Everything about mobile is **inferred** and labelled as such.

### Frame geometry (how to read every number in this document)
- Browser chrome occupies frame rows 0–33. **The page viewport is frame rows 34–743: 1440 × 710 frame px** (aspect 2.03:1). In the original recording that is ≈ 1918 × 945 CSS px.
- Because the layout scales with viewport width, **1 frame px ≈ 1 CSS px on a 1440-wide viewport**. So px values below can be read as "px at 1440 wide". `1vw = 14.4 px`. For vertical values, `1vh = 7.10 frame px` in the recording; vh values are given against that.
- Positions use frame coordinates with the viewport's top at y=34 subtracted where a vh value is given (so "y=34" is 0 vh, "y=389" is the vertical centre, 50 vh).
- Our test viewport is 1440 × 900 (aspect 1.6), taller than the recording. Treat vw-based sizes (type, card widths) as reliable and vh-based ones (vertical placement) as proportions of the viewport.

---

## 1. Overview

**What it is.** ORYZO is Lusion's parody "AI product launch" for a cork coaster. One long, dark page treats a coaster like a flagship AI model and a luxury gadget at once: it has a model name (ORYZO-1), "powered by AI", wearable mode, thermal stability, encryption, a sustainability story, testimonials, a gallery of benchmark-style claims, three tiers (base / Pro / Pro Max), an academic paper with BibTeX and open weights (`.obj` files on GitHub), and a closing pitch for the studio.

**Personality in five adjectives:** deadpan, lavish, warm, self-aware, tactile.

**Why it works as a parody.**
1. **Craft is the punchline.** The site spends real effort (photoreal desk renders, a thermal pass, cork macros, a staged photo series) on an object worth almost nothing. The gap between effort and object is the joke, so the craft cannot be faked or cut.
2. **It borrows two launch languages at once:** Apple-style product theatre (giant type, slow product rotations, tier picker, comparison table) and AI-lab vocabulary (model name, temperature, tokens, edge inference, GPU memory, open weights, peer review, BibTeX). Every section maps a coaster's dull property onto one of those terms.
3. **Never winks visually.** The UI stays restrained and premium the whole way; the jokes live in the words, the footnotes and the staged photos. The one place the UI breaks its own rules (the magazine cover, a serif face) is a deliberate transition, not a gag.
4. **It is honest about being fake.** The footer states plainly that the product doesn't exist and nothing is for sale; the ending turns the whole thing into a portfolio pitch.

---

## 2. Scroll map

### How the scroll lengths were measured (not guessed)
ORYZO replaces the browser scrollbar with a **custom cream thumb, 9 × 150 px, flush to the right edge, no track** (frames 03–84, x = 1431–1439). Its top moves from vp-y 0 to 560 (track 710 − thumb 150) as the page scrolls, so `thumbTop / 560` is the page's scroll progress in every frame. I measured it in all 84 frames (`work/scripts/thumb_raw.txt`, plus a visual montage of the right-edge strips for the frames where the background is also cream).

To turn progress into distance I used two stretches where content moves at a known rate:
- **Testimonial rows** (normal DOM scroll, row pitch 271 frame px): frames 55 → 57 move 984 px while the thumb moves 12 px; frames 57 → 58 move 404 px for 5 px.
- **Claim gallery** (horizontal pin, translation ≈ 1:1 with scroll): frames 60 → 77 travel 4,857 px for 63 px of thumb.

Both give a **total scroll range of ≈ 62–65 viewport heights; I use 63 vh** (≈ 44,700 frame px; ≈ 59,500 CSS px in the original 945-px-tall window). So **1 px of thumb ≈ 0.11 vh of scroll, and 9 px of thumb ≈ 1 viewport**. Assumption: thumb position is linear in scroll position (it behaves that way in every stretch I could check). The timestamps alone would mislead: the user scrolled at very uneven speed (0.07 vh/s while reading the AI section, 1.5 vh/s through the gallery) and scrolled backwards three times (frames 20–21, 56–57, 60–62).

"vh" below = cumulative viewport heights scrolled from the top. Positions are % of the viewport (x from left, y from top). Product size is the coaster's on-screen diameter (or width when tilted), in px at 1440 wide and as % of viewport height (710).

### The map

| # | Section | Frames | Video time | Scroll (vh from top) | Length | What the 3D object / camera does |
|---|---|---|---|---|---|---|
| 1 | Loader | 01 | 0:00–0:01 | before scroll (time-driven) | 0 vh | No 3D yet. A flat vector "construction drawing" of the coaster in the exact screen position the 3D coaster will take: two dashed concentric circles (outer Ø 301 px = 42% vh, inner Ø 141 px), 8 orange bezier handles, faint dashed guide lines crossing the frame. The ring area fills with a lighter tone clockwise as a progress pie (≈ 95% done in frame 01). Background flat green `#4C603D`. |
| 2 | Hero (desk) | 02–03 | 0:01–0:03 | 0 → ~0.7 | ~1 vh | Camera straight top-down over a photoreal desk (wood, green cutting mat rotated ≈ −3°, pencil, cutter, eraser, paper clips) with heavy depth-of-field blur on the edges. Coaster centred (x 50%, y 50%), Ø 300 → 337 px (42% → 47% vh) during the intro, i.e. a slow camera push-in of ≈ 12% while props settle in. The loader's dashed outline and handles are still faintly drawn on top of the real coaster in frame 02 (match-cut from drawing to object). Warm low-angle window light from upper right; soft blinds shadow. |
| 3 | "Isn't just a coaster" | 04 | 0:03–0:07 | 0.7 → ~3.5 | ~3 vh | Desk dissolves to flat warm black `#1A1613`; coaster stays dead centre (x 50%, y 50%), grows to Ø 367 px (52% vh, its largest "hero" size). Per the notes it rotates top view → angled → edge-on with scroll (frame 04 shows the top view). Lighting: single soft key from top-left, no environment. Text left and right of the object. |
| 4 | "Powered by AI" | 05–10 | 0:07–0:17 | ~3.5 → ~9.5 | ~6 vh (pinned) | Coaster shrinks to Ø 263 px (37% vh) and drops to y 49%, darkened (key light down ≈ 50%). A 3D hand rises from below the viewport edge (frame 05: only fingertips at y 82–100%) and closes around the coaster (frame 06): coaster Ø 222 px (31% vh), held at y 51%, hand occupies x 40–58%, y 47–100%. Background warms: orange-brown radial glow bottom-left (`#643721` at the corner fading to `#1A1613`). A full-viewport rainbow inner-glow border fades in ~1 vh after the headline and **cycles hue on a timer** (frames 06–09 are 0.5 s apart and all differ), then fades out on exit (frame 10). Hover on the hand animates it. |
| 5 | "So portable, it's wearable" | 11–24 | 0:17–0:36 | ~9.5 → ~18.5 | ~9 vh (pinned) | (a) 10.0 vh: coaster Ø 205 px inside a branded foil wrapper, centred, sitting **in front of** giant type; a dashed selection frame 360 × 352 px (25 × 50% vh) with a dotted circle and tick marks surrounds it. (b) 10.8 vh: wrapper gone, coaster tips to ≈ 60° and rises to y 30%, now **behind** the type, which blooms white. Frame grows to 410 × 468. (c) 11.6 vh: frame grows to 460 × 578 (32 vw × 81% vh, portrait 4:5) and the 3D coaster hands over to a photo in which a coaster sits at the same spot; the type starts shrinking. (d) 12.9 vh: type has collapsed to a 2-line heading top-left; a strip of small cards (154 × 199 px, 12 px gaps, centred on y 50%) enters from the right. (e) 12.9 → 18.3 vh: the strip slides left at ≈ 0.37 px per px of scroll (one card every ≈ 0.6 vh); the card in the central slot is shown magnified ×2.9 inside the frame, with a horizontal wipe and motion smear between images. No 3D product visible during the gallery. |
| 6 | Magazine transition | 25–26 | 0:36–0:41 | ~18.3 → ~21.5 | ~3 vh | The last gallery item is a fashion-magazine cover whose photo **is** the next 3D scene (pegboard desk, cup on coaster). The central frame scales from 460 × 578 to full-bleed 1440 × 710 (frame 26 caught at 1307 px wide, left edge x 133), so the cover's photo becomes the scene. |
| 7 | "Elevate your coffee experience" | 26–27 | 0:41–0:43 | ~21.5 → ~23.5 | ~2 vh | 3/4 eye-level view of a desk against a pegboard (keyboard, game controller, headphones, storage cubes, green mat). The coaster is small (≈ 110 px wide, x 65%, y 63%) under a takeaway cup. Camera dollies in and trucks right ≈ 45 px between frames 26 and 27. Dappled leaf shadows on the pegboard. A frosted-glass panel (0–454 px, 31.5 vw) covers the left of the scene. |
| 8 | "Thermodynamic stability" | 28–29 | 0:43–0:48 | ~23.5 → ~25.7 | ~2.2 vh | Same camera keeps pushing in on the cup (cup 111 × 177 px → 167 × 309 px, i.e. 25% → 44% of viewport height). The whole scene's shading swaps to a thermal false-colour palette (cold floor indigo `#22194C` → walls violet `#670D6D` → lid red `#EF1F34` → hot spots yellow-white `#FFFF9D`); animated steam rises from the lid; the coaster ring glows hot under the cup. |
| 9 | "Perfectly round / 37.9% more circular" | 30–34 | 0:48–1:01 | ~25.7 → ~31 | ~5 vh | Cut to top-down desk rotated ≈ 35°; coaster ≈ 150 px at (x 66%, y 50%). Vector handles identical to the loader's are drawn over it (frame 31). The desk fades to black, leaving only the vector ring (frames 32–33) with faint red pencil sketches drifting around it in parallax; one sketch catches an iridescent highlight near the cursor. Then the left panel slides out and the ring glides from x 66% to x 50% (frame 34) as a giant outlined sketch of the logotype fades in below. |
| 10 | "Smart flip encryption" | 35–40 | 1:01–1:11 | ~31 → ~35 | ~4 vh | Ring → coaster again (match-cut): top-down desk, coaster Ø 345 px (49% vh) bottom-face-up with an embossed logo, scene fades up from dark (frame 35) to fully lit (36). Camera then tilts from top-down to a low 3/4 view facing the pegboard (frame 37) while the coaster flips in the air. It lands face-up (≈ 200 × 115 px ellipse at x 50%, y 75%) showing the text the user typed (frame 38). On further scroll it flips up onto its edge (frame 40) as the camera drops toward mat level and pushes in. |
| 11 | "Grip-locked antislip" | 41–45 | 1:11–1:20 | ~35 → ~38.5 | ~3.5 vh | Camera at mat height pushing in: coaster 1,267 px wide (88 vw, frame 41) → wider than the viewport, macro of the side wall (frame 42). Then a colour grade to monochrome and ≈ −40% exposure (frame 43), shallow depth of field; text and a spec card fade in over the macro (44–45). |
| 12 | Sustainability | 46–53 | 1:20–1:26 | ~38.5 → ~46 | ~7.5 vh | No coaster. Full-screen cork-bark macro with a horizontal crack at y 50%, lit from dark (frame 46) to warm (47). The bark splits along the crack and the two halves rotate away top and bottom like doors (48), revealing a giant word that is lit from behind (glow, 49). At ~43 vh the background cross-fades from black to cream `#FDECD8` with a leaf-shadow gobo, and the word inverts to near-black `#120B07` (50–51, ≈ 1 vh). The pin then releases and the page scrolls as normal DOM: three info cards rise (52–53). |
| 13 | Testimonials | 54–59 | 1:26–1:34 | ~46 → ~49.3 | ~3.3 vh | Coaster returns dead centre (x 50%, y ≈ 50%) at Ø 308 px (43% vh), top view, under a warm overhead spotlight (radial `#643821` at top centre). As the review list scrolls past (normal scroll), the coaster rotates about its horizontal axis: top view (54) → ≈ 35° (55) → ≈ 60° (57) → edge-on, 159 × 292 px (58). It is fixed in the canvas; only the DOM moves. |
| 14 | Claim gallery | 59–77 | 1:34–1:43 | ~49.3 → ~57 | ~7.5 vh (pinned, horizontal) | Cards (567 px tall = 80% vh, top at vp-y 71) rise and pin, then translate left ≈ 5,100 px, ≈ 1:1 with scroll. The coaster stays in the canvas **behind** the DOM cards: it is visible in the gap above the row as it rises (56, 59) and peeks over again when the row leaves (77). |
| 15 | "Choose your own" tiers + comparison | 78–82 | 1:43–1:51 | ~57 → ~60.5 | ~3.5 vh | Coaster centred, tilted ≈ 30° toward camera, ≈ 300 px (42% vh). A giant logotype rises from below and passes **in front of** it (79), then shrinks (710 → 577 px wide) and moves up to y 20%, while the coaster drops to y 72% in 3/4 view (80). Tier pills swap the model for a stack of 1, 2 or 3 coasters (81) with a short settle animation. Red neon line sketches are revealed by a light that follows the cursor. Background drops to near-black `#080705`. The comparison table then scrolls up and the stack scrolls up with it (82). |
| 16 | Academic section | 83 | 1:51–1:55 | ~60.5 → ~62 | ~1.5 vh | No product. Plain DOM column on `#070604`. |
| 17 | Ending CTA + footer | 83–84 | 1:55–2:00 | ~62 → 63 | ~1–1.5 vh | No coaster. A field of hundreds of floating 3D coffee beans (the notes call them cork particles; the frames show bean shapes with a centre crease) drifting in depth, densest at the bottom right, behind the footer. |

### Pacing in one line
Of the 63 vh, the live 3D product is on screen for ≈ 39 vh (62%); counting the beats where it appears in photos (both galleries, the magazine), the product is visible for ≈ 52 vh (83%). It is absent only in sustainability (bark → cards, 7.5 vh) and in the last 2.5 vh. The three longest beats are the wearable gallery (9 vh), the claim gallery (7.5 vh) and sustainability (7.5 vh); the hero itself is only ≈ 1 vh, because the hero's job is done by the loader match-cut and the first scroll.

### Product on-screen size per beat (measured)
| Beat | Frame | Size (px at 1440) | vw | % of viewport height | Centre (x %, y %) | Orientation |
|---|---|---|---|---|---|---|
| Hero (start → settled) | 02 → 03 | Ø 300 → 337 | 20.8 → 23.4 | 42 → 47 | 50, 50 | top view |
| "Isn't just" | 04 | Ø 367 | 25.5 | 52 | 50, 50 | top view → edge (notes) |
| AI (free → in hand) | 05 → 06 | Ø 263 → 222 | 18.3 → 15.4 | 37 → 31 | 50, 49 → 50, 51 | top view, slight tilt |
| Wearable (wrapped) | 11 | Ø 205 (wrapper 310 × 290) | 14.2 | 29 | 50, 50 | top view |
| Lift / thermal (under cup) | 27 / 29 | ≈ 110 → 170 wide | 7.6 → 11.8 | — | 65, 63 | 3/4 eye level |
| Circular (top-down desk) | 30 | Ø ≈ 150 | 10.4 | 21 | 66, 50 | top view |
| Flip (top-down → landed) | 36 → 38 | Ø 291 → 200 × 115 ellipse | 20.2 → 13.9 | 41 → 16 | 50, 50 → 50, 75 | bottom up → face up |
| Macro | 41 → 42 | 1,267 → > 1,440 wide | 88 → > 100 | — | 50, 45 | side wall, mat level |
| Testimonials | 54 → 58 | Ø 308 → 159 × 292 (edge-on) | 21.4 → 11 | 43 → 41 tall | 50, 50 | 0° → 90° about X |
| Tiers (single → ×3 stack) | 79 → 81 | 300 → 284 wide (stack 231 tall) | 20.8 → 19.7 | 42 → 33 | 50, 50 → 50, 72 | 30° tilt → 3/4 |

Rule of thumb: the hero object lives between **15 and 26 vw (31–52% of viewport height)** whenever it is the subject, drops to ≈ 8–12 vw when shown in a scene, and jumps past 100 vw for the one macro beat.

### Scroll timeline a developer can start from (normalised 0–1 over the whole page)
```
0.000–0.011  hero desk → dark (crossfade), coaster stays centred, push-in 12%
0.011–0.056  intro text + rotation (top → angled → edge), Ø 52% vh
0.056–0.151  AI beat (pin): shrink to 37% vh, hand rises (0.06–0.08), glow on (0.07–0.14), exit fade (0.14–0.15)
0.151–0.294  wearable (pin): type+wrap 0.151–0.17 · product through type 0.17–0.185 · frame grow/photo handover 0.185–0.205 · strip gallery 0.205–0.29
0.294–0.341  magazine cover → frame expands to full bleed (signature)
0.341–0.408  feature scene A, then same camera + thermal grade
0.408–0.492  top-down → vector ring → sketches → ring recentres
0.492–0.556  ring → coaster, camera tilt, flip, flip onto edge
0.556–0.611  mat-level push-in, macro, mono grade, spec card
0.611–0.730  bark macro, split, giant word, dark→cream inversion, cards (normal scroll)
0.730–0.783  testimonials: product centred, rotates 0°→90° about X
0.783–0.905  horizontal claim gallery (pin, ~1:1)
0.905–0.960  logotype over product, tier stack 1/2/3, comparison
0.960–1.000  academic, CTA, footer (no product)
```

---

## 3. Section-by-section spec

Conventions: sizes are px at a 1440-wide viewport (= frame px) with vw in brackets; vertical positions are vp-y (px from the viewport top, viewport = 710 px tall in the recording) and % of viewport height. "Cap" = measured cap height; font sizes are estimated as cap ÷ 0.72 (neo-grotesk proportions). **DOM vs canvas is inferred from behaviour** (occlusion, blur, bloom, real-time text on the object); it could not be verified on the live site. **Mobile is inferred** for every section (the recording is desktop only); each section ends with a proposal for 390 px.

Global furniture present in almost every frame:
- **Nav**, no background, no border: wordmark left (67 × 14 px at x 47, vp-y 25–38); four uppercase links right (INTRO, FEATURES, PRODUCT, CONTACT; cap 8–9 px ≈ 12 px font, bold; 24 px gaps; right edge x 1395). Nav band ≈ 64 px (4.4 vw, 9% vh); wordmark cap 14 px (≈ 1 vw). The active link has a 1 px dotted underline 2 px below the baseline (x 1126–1159 under INTRO). Hovering a link dims its siblings to ≈ 55%, scrambles/rolls the hovered word's letters, and **dims the whole page ≈ 70%** (frame 15). Link colour flips to near-black on cream sections (frames 50–53). Section map of the nav: INTRO = frames 02–25, FEATURES = 26–53, PRODUCT = 54–82, CONTACT = 83–84.
- **Scrollbar**: custom cream thumb 9 × 150 px (21% vh), flush right, no track. On first load it is a wider 22 × 148 px cream tab with a dot and vertical label for the model page (frame 02) that collapses into the thumb.
- **Scroll hint**: dotted 24 px circle with a chevron + "SCROLL TO CONTINUE" (uppercase, cap 9 px ≈ 12 px font), bottom centre at vp-y 668–693 (≈ 20 px above the bottom edge). Present in pinned sections; it dims to ≈ 30% during transitions and fast moves (frames 36–37, 41–42, 60, 62, 77) and returns to full when a beat settles.
- **Gutter**: 45–47 px left and right (3.125 vw), so content width is 1,350 px (93.75 vw). Everything (nav, giant words, rules, card grids, footer) snaps to these two edges.
- **Dotted 1 px rules** (cream ≈ 50%) are the only divider style used on the whole site.

### 3.1 Loader — frame 01
- **Purpose:** cover asset loading; announce "this object was *designed*"; set up the match-cut.
- **Joke mechanism:** none yet; it is pure craft signalling (the product shown as a vector file being edited).
- **Layout:** centred construction drawing: outer dashed circle Ø 301 px (x 569–869, vp-y 203–505, 42% vh), inner dashed circle Ø 141 px. Orange bezier handles (4 on the outer circle at N/E/S/W with 165 px handle bars; 4 on the inner), 1 px dashed guide lines (cream ≈ 15%) extend ≈ 100 px past the circles horizontally and vertically, like Illustrator smart guides.
- **DOM vs canvas:** probably SVG/DOM (crisp dashes, flat colour); the canvas is not yet visible.
- **Colour:** flat moss green `#4C603D`; ring fill lighter green `#637356`; handles cork orange `#F87A3D`; dashes cream.
- **Animation:** the ring's fill is a clockwise conic sweep tracking load progress (≈ 95% in frame 01: a 10° gap left at 12 o'clock). On completion the drawing stays registered on top of the 3D coaster for ≈ 1 s and fades (frame 02 still shows the dashed outline and handles at ≈ 30% over the real object).
- **Mobile (inferred / proposal):** same drawing scaled to the object's mobile size (≈ 60 vw); keep the registration with the 3D object exact.

### 3.2 Hero — frames 02–03
- **Purpose:** brand, premise, credibility, first look at the object.
- **Joke mechanism:** a luxury-object hero shot of a cork coaster, plus a tagline that sounds like a product line and a superlative that admits it is unnecessary.
- **Layout:** full-bleed top-down desk. Giant wordmark top-left (frame 03: x 48–545 = 498 px wide [34.6 vw], cap 107 px [7.4 vw, 15% vh], vp-y 60–166); it starts larger and translucent (frame 02: ≈ 610 px wide, ≈ 25% opacity) and settles. A short uppercase tagline sits directly above the wordmark's right half (cap 13 px, vp-y 39–51), revealed by typing. Right: 3-line body (x 943–1333, ≈ 26 px font, line pitch 36 px) at vp-y 306–400. Bottom-left: a frosted panel (x 40–304, vp-y 386–695) with a 4-line uppercase studio credit (cap 16 px ≈ 22 px font, line pitch 27 px), a dotted rule (157 px), and a right-aligned 3-line superlative (≈ 17 px). Bottom-right: a 150 × 84 px rounded video thumbnail of the launch film with a 2 px glowing orange border and "PLAY" (x 1245–1395, vp-y 600–685). Scroll hint at bottom (here offset right, x 929). Right edge: the "model" tab.
- **DOM vs canvas:** desk = canvas (photoreal, depth of field, moves; most likely a Gaussian splat rendered from Houdini, see §6); coaster = real-time mesh; all text, panel and video = DOM.
- **Type/colour:** wordmark cream `#FDECD9`; side copy cream ≈ 85% (`#DBCEBD`); desk palette wood `#5B3F30`, mat green, cork orange.
- **Animation:** tagline types in from the left (frame 03 shows its first words cut); credit lines slide up out of per-line masks (frame 03 shows each line clipped at its bottom); body copy fades in **per character** left-to-right (frame 02 shows a smooth opacity ramp across each line); props and camera settle over ≈ 1.5 s (coaster grows 300 → 337 px).
- **Mobile (inferred / proposal):** wordmark across the full width at top (≈ 88 vw), object centred at ≈ 70 vw, body copy under the object, credit panel and video thumbnail dropped or collapsed into one line.

### 3.3 "Isn't just a coaster" — frame 04
- **Purpose:** the first scroll beat; strip the context away and present the object alone.
- **Joke mechanism:** the classic "X isn't just an X, it's the result of…" launch sentence, applied to a coaster.
- **Layout:** three columns around the dead-centre object (Ø 367 px [25.5 vw, 52% vh], x 536–902, vp-y 169–537). Left: 2-line uppercase headline right-aligned to x 408 (cap 35 px ≈ 48 px font). Right: 3-line body left-aligned at x 1064 (≈ 26 px, line pitch 36 px). Both columns are vertically centred on the object (vp-y 315–405).
- **DOM vs canvas:** object canvas; text DOM.
- **Colour:** background `#1A1613` (the site's base); coaster rim `#ECA15B`, dish `#9D4F29`.
- **Animation:** headline letters fade/slide in with a stagger (frame 04 catches the first line half-faded); right body brightens per character as you scroll (≈ 20% → 100% opacity), a scroll-scrubbed "reading" reveal used again in 3.13. The object turns from top view to an angled and then edge-on view across ≈ 3 vh (per the notes).
- **Mobile (proposal):** headline above the object, body below; object ≈ 70 vw.

### 3.4 "Powered by AI" — frames 05–10
- **Purpose:** the big AI-hype beat.
- **Joke mechanism:** a giant claim with an asterisk; the footnote in the bottom-right corner redefines the acronym as a design program; a quip about generative models' famous finger-count errors, made literal by a six-fingered hand; an invitation to hover the hand.
- **Layout:** centred sentence-case headline (x 371–1095 incl. asterisk, cap 81 px ≈ 112 px font [7.8 vw], vp-y 101–205). A small orange model-name tag right-aligned under the headline's end (cap 13 px, x 977–1069, vp-y 201–217). Object below centre (Ø 263 → 222 px), hand rising from the bottom edge. Lower-left: hand icon (24 × 29 px) above a dotted rule (x 370–521) and an uppercase hint (cap 8 px). Lower-right: 3-line uppercase quip right-aligned to x 1070 (cap 12 px ≈ 16 px font, line pitch 20 px), so the quip and the tag share the headline's right edge, and the hint shares its left edge: **a centred 725 px column defined by the headline**. Bottom-right corner: dotted rule + 2-line footnote (cap 9 px).
- **DOM vs canvas:** hand and coaster canvas (the hand reacts to hover); text DOM; the rainbow border could be either (a CSS inset glow or a post-process vignette), more likely a shader because it blends additively with the scene.
- **Colour:** background warm black with a radial orange-brown glow from the bottom-left (`#643721` at the corner); headline cream `#F5E5D3`; tag orange `#CF4E0B`; glow border = fully saturated spectrum, a ≈ 25 px saturated core at the viewport edge fading out by ≈ 100 px (left-edge profile in frame 06: `#D12133` at 0 px → `#6A2821` at 20 px → background at ≈ 100 px); edge samples across frames 06–09: red `#A42329` / `#EE3137`, yellow `#FEFF70`, green `#64F4A0`, blue `#62719F`, magenta `#86397A`.
- **Animation:** headline words resolve from a ≈ 20 px blur to sharp, left to right (frame 05: "AI" still blurred); tag slides up from a mask. The glow border fades in ≈ 1 vh later and **rotates its hues continuously on a timer** (≈ 0.5 s per noticeable shift; independent of scroll). Exit (frame 10): headline characters fade from the left, the quip erases from the end of each line like reverse typing, the glow fades, hint fades.
- **Mobile (proposal):** headline 2 lines at ≈ 15 vw, object + hand centred, quip below; hover becomes tap.

### 3.5 "So portable, it's wearable" + gallery — frames 11–24
- **Purpose:** portability, then a lifestyle gallery.
- **Joke mechanism:** escalate "portable" into "wearable", then show the object worn in increasingly absurd staged photos that parody wearable-tech ads, influencer posts and safety disclaimers.
- **Layout (a/b):** small uppercase eyebrow with trailing comma (cap 19 px incl. comma, x 46, vp-y 204–222, cream 60%) sitting on the top-left of a giant lowercase phrase **fitted exactly to the content width** (x 46–1395 = 1,350 px; x-height 128 px, ascender 177 px ≈ 250 px font [17 vw]; vp-y 234–420, i.e. vertically centred). A dashed selection frame (1 px dashed cream) with a 6 px dot at its top-right corner and a dotted inner circle with two tick marks surrounds the object; it grows 360 × 352 → 410 × 468 → 460 × 578 px (frames 11/12/13).
- **Layout (c–e):** the phrase collapses into a 2-line heading at top-left (x 46, vp-y 183–234; line 1 eyebrow cap 13 px, line 2 ≈ 30 px font). The frame becomes a fixed portrait window (x 490–949, vp-y 66–643: 32 vw × 81% vh, 4:5). A strip of thumbnails (154 × 199 px, 12 px gaps, pitch 166 px, vp-y 255–453 so centred on the viewport) runs behind it from right to left; the strip is hidden inside the frame area, where the current item is shown magnified ×2.9. Captions sit inside the big image (a black "WARNING" bar with a dashed box; a DM-style line with an orange pill button).
- **DOM vs canvas:** the giant type is very likely **in the WebGL scene** (the object passes in front of it, then behind it, and the type gets bloom); wrapper and object canvas; the magnified images are probably WebGL planes (horizontal motion smear on fast moves, frame 23), the thumbnails could be DOM.
- **Colour:** giant type cream `#FBEED8`, blooming to `#FEFDFB` with a warm halo when the object is behind it; eyebrow `#B8A395`.
- **Animation:** wrapper tears away (frames 11→12) and the object tips ≈ 60° and rises; the frame scales up; 3D → photo handover inside the frame (frame 13: the photo's coaster sits where the 3D coaster was); heading collapse; strip translation ≈ 0.37 px per scroll px, so one item per ≈ 0.6 vh; inside the frame, items slide horizontally with a **velocity-based horizontal smear**; the large images are short video loops (motion blur in frames 16, 23).
- **Mobile (proposal):** giant phrase on 2 lines at full width; the frame becomes ≈ 80 vw × 4:5 centred; thumbnails as a row of dots/mini cards below; swipe also advances.

### 3.6 Magazine transition — frames 25–26
- **Purpose:** move from the gallery into the first "feature" scene without a cut.
- **Joke mechanism:** a fashion/lifestyle magazine cover about the product, with doom-slang cover lines about AI taking jobs.
- **Layout:** the last gallery item is a cover with a high-contrast serif masthead (the only serif display type on the site), an issue roundel ("No" + numeral in a 75 px circle) and a two-line serif cover line. The cover's photo shows the next scene (pegboard, cup on coaster).
- **DOM vs canvas:** the cover is an image in the frame; the next scene is canvas. The expand is probably a clip-rect/scale on the frame while the scene is revealed behind (the scene in frame 26 is already the live 3D scene at the frame's size).
- **Animation:** frame width 460 → 1307 (frame 26) → 1440 px, height 578 → 710, over ≈ 3 vh. The left part of the screen still shows the old background until the scene covers it.
- **Mobile (proposal):** same, the frame simply grows to full screen.

### 3.7 "Elevate your coffee experience" — frames 26–27
- **Purpose:** feature 1 (lift/height), product in context.
- **Joke mechanism:** "elevate" taken literally: the coaster raises the cup by exactly its own thickness; a formula makes the tautology look scientific.
- **Layout — the feature-panel template (reused by 3.8 and 3.9):** frosted panel x 0–454 px (31.5 vw) full height; inside, 45 px padding: 45 px circular icon button (translucent cream) at vp-y 99–144; uppercase heading (cap 13 px ≈ 18 px font) at vp-y 181; 4-line body (≈ 18 px, line pitch 24 px, max width ≈ 315 px) from vp-y 218; dotted rule (x 45–364) at vp-y 532; **2-line uppercase title right-aligned to x 367** (cap 24 px ≈ 33 px font, line pitch 34 px) at vp-y 574–632; a 4 px dot at bottom-left (vp-y 683) as a page/progress mark. Bottom-right of the scene: a one-line caption (cap 9 px) and a large thin serif formula (cap ≈ 30 px, x 1284–1395, vp-y 644–676).
- **DOM vs canvas:** scene canvas; panel DOM with `backdrop-filter: blur` (≈ 30–40 px blur, cream tint ≈ 15%; the scene behind reads `#806154`, through the panel `#8D7963`).
- **Animation:** heading types/fades in per character; body lines slide up from masks; title letters slide up per character (frame 28 shows them clipped at the baseline); camera dolly-in + right truck ≈ 45 px per vh.
- **Mobile (proposal):** panel becomes a bottom sheet (full width, ≈ 45% height, same blur), formula moves to the top-right.

### 3.8 "Thermodynamic stability" — frames 28–29
- **Purpose:** feature 2 (insulation/heat).
- **Joke mechanism:** literal temperature mapped onto an LLM's sampling temperature; a scale labelled from "creative" to "deterministic" with T values; a softmax formula; a backronym "model" name; a one-line legal hedge under the formula.
- **Layout:** same panel template (tinted by the thermal scene: `#462254`). Right edge: a vertical 2 px gradient scale (x 1387–1394, vp-y 178–459) with 3 right-aligned labels (cap 9 px, two lines each) at its top, middle and bottom. Bottom-right: 2-line caption + 2-level fraction formula in serif.
- **DOM vs canvas:** the thermal look is a re-shade of the same scene (canvas); scale and text DOM.
- **Colour (thermal ramp):** `#22194C` → `#670D6D` → `#EF1F34` → `#FFFF9D`; animated steam above the cup.
- **Animation:** the swap is fast (< 0.5 vh); camera keeps pushing in; steam loops.
- **Mobile (proposal):** scale moves to a horizontal bar above the bottom sheet.

### 3.9 "Perfectly round / X% more circular" — frames 30–34
- **Purpose:** feature 3 (shape precision).
- **Joke mechanism:** a fake-precise improvement to an already perfect circle, a circularity formula, an AI-term backronym, and Renaissance-style design sketches as if the coaster were a masterpiece of engineering.
- **Layout:** panel template; scene top-down; the vector handles from the loader appear on the coaster; sketches (thin red-brown pencil lines `#712C27` with handwritten notes) drift on the black field at 3 depth layers.
- **DOM vs canvas:** sketches are probably textured planes in the canvas (they parallax and one catches a moving iridescent highlight near the cursor, frame 33); vector ring could be SVG/DOM registered to the 3D object or drawn in the canvas.
- **Animation:** desk fades to black over ≈ 1 vh, leaving the drawing; panel slides out to the left (frame 34) and the ring glides to the centre; a giant outlined sketch of the wordmark fades in below the ring.
- **Mobile (proposal):** panel as bottom sheet; sketches fewer (3–4) and larger.

### 3.10 "Smart flip encryption" — frames 35–40
- **Purpose:** the interactive gimmick.
- **Joke mechanism:** "encryption" = turning the coaster upside down so the message is hidden; "decryption" = flipping it back.
- **Layout:** centred stack over the 3D desk: uppercase eyebrow (cap 13 px, vp-y 85–97), 2-line uppercase headline (cap 35 px ≈ 48 px font, line pitch 47 px, vp-y 131–212), 2-line body (≈ 18 px, vp-y 244–283), a dashed-outline text input 183 × 38 px (vp-y 325–362, centred caps text, translucent dark fill), and a pill button 160 × 40 px under it (vp-y 381–421). The object lies on the mat below (x 50%, y 75%).
- **DOM vs canvas:** UI DOM; the typed text appears **on the 3D coaster's surface in real time** (frame 38), so the coaster is real-time with a dynamic canvas texture.
- **Interaction:** type → the text is printed/engraved on the coaster; the button toggles encode/decode (two labels cross-fade in place, frame 37); click flips the coaster in the air (≈ 0.8–1 s, spring-like overshoot); button hover = near-black fill `#100905` with cream text; idle = cream at ≈ 75% opacity over the scene with dark text; the input is a translucent dark box (≈ 30% black) with a 1 px dashed cream border.
- **Camera:** top-down → low 3/4 (tilt ≈ 60°) over ≈ 1 vh, then on exit a continuous drop to mat level and push-in (into 3.11).
- **Mobile (proposal):** UI block in the top 45%, object in the bottom half; input full-width minus gutters; on-screen keyboard must not cover the object (scroll the object into view on focus).

### 3.11 "Grip-locked antislip" — frames 41–45
- **Purpose:** material/grip feature; extreme macro.
- **Joke mechanism:** courtroom/drama wording about gravity and spills; a precise friction coefficient marked "(EST)"; a microscope image.
- **Layout:** centred stack: eyebrow (cap 13 px, vp-y 85–99), 2-line headline (cap 35 px, 527 px wide), 3-line body (vp-y 245–308), a spec card 248 px wide (x 597–845) with a cream header bar (26 px: label left, value right) and a 248 × 80 px SEM-style micrograph with a mirrored fade below; under it a dashed 180° arc (≈ 250 px wide) with 2 dots and a hand icon = a **drag-along-the-arc slider** that pans/rotates the micrograph (frames 44 → 45).
- **DOM vs canvas:** macro canvas (perspective grid on the mat proves real-time); card DOM.
- **Colour:** monochrome grade (macro `#6C6A6C`, darkened behind text to `#1F1F1F`).
- **Animation:** camera push to a macro wider than the viewport over ≈ 1 vh; desaturation + darkening over ≈ 0.5 vh; text fades in after.
- **Mobile (proposal):** card centred under the text; drag the arc with a finger (horizontal pan).

### 3.12 Sustainability — frames 46–53
- **Purpose:** eco story + real facts about the material.
- **Joke mechanism:** "plant-based / vegan" said of cork, then a crude pun undercuts it; the cards mix true harvesting facts with an AI joke about tokens and politeness.
- **Layout:** (a) full-screen bark macro, horizontal crack at vp-y 350. (b) Giant lowercase word fitted to the content width (x 45–1396 = 1,352 px; x-height 126 px, ascender 169 px ≈ 245 px font [17 vw]; vp-y 221–460), small uppercase eyebrow on its top-left (cap 16 px), a small uppercase label top-centre (vp-y 62–69), a centred 3-line body under the word (≈ 20 px, line pitch 24 px, x 567–873). (c) Normal scroll: a 3-card grid (top at vp-y 44 when settled): card 1 324 × 495 px in moss green `#455632` with a 3-line uppercase heading (cap 23 px ≈ 32 px font), a 4-line body (≈ 18 px) and a giant low-contrast numeral (`#546641`, ≈ 300 px) bleeding off the bottom; cards 2 and 3 495 × 495 px in beige `#F5DFC7` with a green 2-line heading (cap 16 px ≈ 23 px font), a centred illustration (a 170 px green circle with a line drawing; a rotating ring of dark pills `#362418` saying "thank you" in 7 languages on dotted orbits) and a 2-line body at the bottom (≈ 20 px). Gaps 18 px.
- **DOM vs canvas:** bark canvas (it splits in 3D); word DOM or canvas (it glows like the wearable type; probably the same WebGL text technique); cream page DOM (hard top/bottom edges against the dark canvas, frames 53–54).
- **Colour:** dark → cream `#FDECD8` page with a large soft leaf-shadow gobo top-right; word `#120B07`; body `#2B2018`.
- **Animation:** bark brightens; splits along the crack and the halves swing away; word fades up with a backlight glow; background cross-fades dark → cream in ≈ 1 vh while the word inverts; then the pin releases and the cards scroll in at 1:1.
- **Mobile (proposal):** word at full width (one line, ≈ 17 vw still fits); cards stack vertically, card 1 full width × 120% height.

### 3.13 Testimonials — frames 54–59
- **Purpose:** social proof.
- **Joke mechanism:** five-star reviews from absurd archetypes (space traveller, cartoon pirate captain, AI influencer, minimalist, conspiracy theorist), each with a parody photo; one key phrase per quote highlighted in orange; an exact-looking review count and rating.
- **Layout:** intro: 3-line uppercase headline left (cap 35 px ≈ 48 px font, line pitch 46 px, x 46–530, vp-y 259–385) and a 3-line lead at right (≈ 26 px, line pitch 36 px, x 987–1291) with the object centred between (Ø 308 px). Then a header row (cap 9 px, three labels left/centre/right across 1,350 px) over a dotted rule; rows of pitch 271 px separated by dotted rules: stars (5 × ≈ 13 px, 104 px wide) + bracketed score, quote (cap 15 px ≈ 21 px font, 3 lines, line pitch 27 px, max 320 px wide), name + role (cap 8 px, 2 lines) at the row's bottom; photo right-aligned (≈ 317 × 240 to 335 × 248 px, 4:3). The centre column (x ≈ 380–1060) is left empty for the object.
- **DOM vs canvas:** rows DOM; object canvas, fixed at the centre while rows scroll past it.
- **Animation:** rows dim to ≈ 40% when away from the viewport centre and brighten at the centre (frames 55, 57); the object rotates about the horizontal axis 0° → 90° across the section (≈ 3 vh); warm top spotlight `#643821`.
- **Mobile (proposal):** one column: quote, name, photo full width; object as a small sticky element at the top (≈ 30 vw) or between every second review.

### 3.14 Claim gallery — frames 59–77
- **Purpose:** benchmark-style claims in a horizontal sequence.
- **Joke mechanism:** each card takes one AI-infrastructure phrase (edge, uptime, GPU, testing, compatibility) literally and stages a product photo proving it; supporting captions add deadpan metadata.
- **Layout:** a row of full-height cards (567 px tall = 80% vh, vp-y 71–638, so 71 px above and below), 12 px gaps, alternating **wide claim cards** (783–1,078 px = 54–75 vw) with **narrow image cards** (368 px = 25.6 vw). Claim cards carry either a 2-line top-left headline (cap 33 px ≈ 46 px font, sentence case, line pitch 61 px, 26 px inset) with a bottom-left uppercase caption, or a centred one-line headline (cap 75 px ≈ 104 px font; or ascender 119 px ≈ 165 px font) with a top caption row (up to three uppercase metadata labels spread across the card, cap 9 px) and, in one card, a row of monospace captions along the bottom. In two cards a foreground object (a mug) is composited **in front of** the headline.
- **DOM vs canvas:** cards DOM (photos/video); object canvas behind them.
- **Animation:** row scrolls up at 1:1, pins at vp-y 71, then translates left ≈ 5,100 px ≈ 1:1 with scroll (≈ 7.5 vh); releases upward at the end. No visible parallax inside cards; motion is linear, not snapped.
- **Mobile (proposal):** keep the horizontal pin (it reads well on phones) with cards at 85 vw × 70 vh, or switch to vertical stacked cards; claims at ≈ 11 vw.

### 3.15 Tier picker + comparison — frames 78–82
- **Purpose:** the "buy" moment without a buy button.
- **Joke mechanism:** Pro / Pro Max naming applied to stacking more coasters; feature bullets inflate the stack count; a comparison table compares the number of layers.
- **Layout:** centred uppercase eyebrow (cap 17 px) over a giant wordmark (707 × 151 px cap → shrinks to 576 × 123 px and moves to vp-y 141–263); three pills under it (117 / 147 / 176 × 52 px, ≈ 8 px gaps, row 457 px wide centred, vp-y 286–343); left: tier name (cap 16 px) + 3–4-line description (≈ 20 px, warm grey `#9A948E`, max 345 px); centre: object (≈ 290 px wide at vp-y 409–639); right: 3 bullets with 19 px dotted-circle icons (≈ 20 px text, line pitch 45 px) from x 1058. Comparison: three centred columns at x ≈ 327 / 720 / 1113 (pitch 393 px): orange "New" (cap 9 px), name (cap 16 px), 2-line description (≈ 15 px, grey), then full-width rounded rows (x 130–1310 = 1,180 px, 70 px tall, fill `#0D0C0A`, radius ≈ 35 px) with label (cap 8 px) over value.
- **DOM vs canvas:** wordmark, pills, text, table DOM; objects and red sketches canvas.
- **Colour:** background drops to near-black `#080705`; active pill: dark `#362015` fill, 1.5 px orange-red border `#C73413` + 8–12 px outer glow; inactive `#362318`; red neon sketches `#F00000` revealed only inside a soft ≈ 350 px radius light that follows the cursor.
- **Animation:** wordmark passes in front of the object while rising, then scales ×0.81 and moves up; pill click swaps the model to a stack of 1/2/3 with the extra layers dropping in (≈ 0.6 s); stack scrolls up with the table.
- **Mobile (proposal):** wordmark full width; pills as a segmented control (full width, 3 × 33%); description and bullets stack under the object; the comparison table becomes a horizontally swipeable 3-column table.

### 3.16 Academic section — frame 83 (+ `work/oryzo-1-repo/`)
- **Purpose:** the open-weights/research parody.
- **Joke mechanism:** the full ritual of an AI model release (paper/model/code buttons, abstract, acknowledgements, peer review, BibTeX, a GitHub repo with checkpoints) applied to a 3D model of a coaster. In the repo, "model sizes" in checkpoint names are AI parameter-count/active-parameter style; the `.obj` files are real Houdini exports (98 → 1,282 points); the "paper" PDF is a single A4 page with one centred title line; a benchmark "conducted on a single desk".
- **Layout:** single centred column 531 px wide (x 455–986, 36.9 vw), left-aligned. Grey section labels (cap 10 px ≈ 14 px font, `#8E8A81`), body ≈ 18 px cream, 60–70 px between blocks; a code box 531 × 185 px (`#2B2723`, ≈ 20 px padding, monospace ≈ 14 px, line pitch 18 px).
- **DOM vs canvas:** DOM only; background near-black `#070604`.
- **Mobile (proposal):** column = full width minus gutters; the code box scrolls horizontally.

### 3.17 Ending CTA + footer — frames 83–84
- **Purpose:** reveal the real purpose (a studio pitch) and sign off honestly.
- **Joke mechanism:** a confession that the product doesn't exist, followed by a pitch.
- **Layout:** 2 uppercase lines right-aligned to x 1394 (cap 28–29 px ≈ 40 px font, line pitch 36 px), **typed on** with a cream block cursor (22 × 43 px) that travels down the left side; a dark pill button (152 × 44 px, `#362418`) right-aligned under it. Footer at the bottom of the same screen: left, a dashed-border credit box (257 × 127 px) with orange and cream uppercase lines and a dotted outline "copy URL" pill; centre column (x 473): newsletter label (cap 7 px) + email input with a dotted underline and an arrow; two contact pairs (label + email); socials stacked (x 748); bottom row: legal links left (cap 9 px), 3-line uppercase disclaimer right (cap ≈ 8 px).
- **DOM vs canvas:** text DOM; a canvas particle field of floating, slowly tumbling coffee beans (instanced meshes, depth-of-field, densest bottom-right) behind it.
- **Mobile (proposal):** headline left-aligned, footer columns stack; particle count cut by ≈ 70%.

---

## 4. Transitions

Every hand-over keeps the product (or a stand-in for it) **in the same screen position across the cut**, so the page never feels like it changes slide. Mechanisms, in order:

| # | From → to | Frames (before → after) | Mechanism | Scroll length |
|---|---|---|---|---|
| T1 | Loader → hero | 01 → 02 | **Match-cut from vector drawing to object.** The dashed ring and handles are drawn exactly over where the 3D coaster appears; the photoreal desk fades up under them; the drawing lingers ≈ 1 s at ≈ 30% then fades. Time-driven, not scroll. | 0 (≈ 1.5 s) |
| T2 | Hero → "isn't just" | 03 → 04 | **Context dissolve.** The desk cross-fades to flat warm black while the object stays put and keeps growing (337 → 367 px). Big wordmark exits; small nav wordmark is the only brand left. | ≈ 0.7 vh |
| T3 | "Isn't just" → AI | 04 → 05 | **Object re-staging.** Object shrinks 367 → 263 px and darkens; background warms from the bottom-left; a hand enters from below the frame edge; new headline blurs in. | ≈ 1 vh |
| T4 | AI → wearable | 10 → 11 | **Typographic exit + wrapper swap.** Headline fades out character by character from the left, the quip erases from line ends, the glow border fades; the object reappears in a branded wrapper in front of giant type; dashed frame draws on. | ≈ 1 vh |
| T5 | Wearable type → gallery | 11 → 13 → 14 | **Object through type, then 3D-to-photo handover inside a frame.** Wrapper tears off; object tips and rises behind the (now blooming) type; the frame grows to a 4:5 window; a photo in which a coaster sits in the same spot replaces the 3D object; the giant phrase collapses into a top-left heading. | ≈ 3 vh |
| **T6** | **Gallery → feature scene** | **25 → 26 → 27** | **The frame becomes the world.** The final gallery item is a magazine cover whose photo is the next 3D scene; the 4:5 frame scales to full-bleed (460 → 1,440 px wide) and the cover photo resolves into the live scene; the left panel is already waiting. The only place a second display typeface (a serif) appears. | ≈ 3 vh |
| T7 | Lift → thermal | 27 → 28 | **Vision-mode swap.** Same camera, same scene, re-shaded to a false-colour thermal ramp (fast, < 0.5 vh); panel content swaps with per-character fades. | < 0.5 vh |
| T8 | Thermal → circular | 29 → 30 | **Camera re-frame.** Cross-fade to a top-down, rotated view of the same desk (no hard cut visible: the panel stays, the scene behind changes). | ≈ 0.5 vh |
| T9 | Desk → drawing | 30 → 31 → 32 | **Reverse match-cut.** Vector handles appear over the coaster; then the desk and the object fade out, leaving only the drawing (the loader motif returns). | ≈ 1 vh |
| T10 | Drawing → flip desk | 34 → 35 → 36 | **Match-cut back to object.** The ring recentres; the desk fades up from black with the coaster exactly inside the ring (bottom face up). | ≈ 0.5 vh |
| T11 | Flip → macro | 40 → 41 → 42 → 43 | **One continuous camera move.** Camera drops to the mat and pushes in until the coaster's side wall fills more than the viewport; then a colour-grade change (to mono, −40% exposure) marks the new section. | ≈ 1.5 vh |
| T12 | Macro → bark | 45 → 46 | **Material zoom metaphor via black.** The cork macro darkens to black and the bark macro (the raw material at a larger scale) fades up. | ≈ 0.5 vh |
| T13 | Bark → word | 47 → 48 → 49 | **Split reveal.** The bark cracks along a horizontal line and the halves swing away top and bottom, revealing a backlit giant word behind. | ≈ 1.5 vh |
| T14 | Dark → cream | 49 → 50 → 51 | **Global colour inversion.** Background black → cream with a leaf-shadow gobo; the word glow turns into near-black ink; nav colour inverts. | ≈ 1 vh |
| T15 | Cream cards → testimonials | 53 → 54 | **DOM over canvas.** The cream section is an ordinary block that scrolls up and off, uncovering the dark canvas stage where the object is already waiting at the centre (hard edge, no blend). | ≈ 1 vh |
| T16 | Testimonials → claim gallery | 58 → 56/59 → 60 | **Cards rise over the object** (DOM in front of the canvas), then pin and turn horizontal. | ≈ 1 vh |
| T17 | Claim gallery → tiers | 77 → 78 → 79 | **Curtain lift.** The card row scrolls up and away; the object is revealed in the gap; a giant wordmark rises in front of it. | ≈ 1 vh |
| T18 | Tiers → academic → end | 82 → 83 → 84 | Plain document scroll; the end headline types on with a block cursor. | — |

**The site's signature transition is T6: the 4:5 gallery frame whose last image (a magazine cover photographed inside the next scene) scales up to full-bleed and *becomes* the next scene.** It is also the one moment where the UI breaks its own type rules. The **recurring structural motif** is T1/T9/T10: the vector construction-drawing ring that turns into the object and back, used as bookends at the start and the middle of the page. Both are ORYZO's and must not be reused as they are (see §8); aviva needs its own signature built on a paper-only property.

---

## 5. Design system (measured)

### Palette
| Role | Hex | Where sampled |
|---|---|---|
| Base background (warm black-brown) | `#1A1613` | frames 04, 05, 54, 55, 60, 79 |
| Deep background (tiers, academic, footer) | `#080705` / `#070604` | frames 80, 82, 83 |
| Cream (all light text; light page bg) | `#FDECD9` (text) / `#FDECD8` (page) | frames 03, 51 |
| Muted cream (eyebrows, secondary on dark) | `#B8A395`, body `#DBCEBD` | frames 11, 03 |
| Warm grey (descriptions, labels) | `#9A948E`, label `#8E8A81` | frames 80, 83 |
| Ink on cream | `#120B07`, body `#2B2018` | frame 51 |
| Beige card | `#F5DFC7` | frame 53 |
| Moss green (loader bg, card, illustrations) | `#4C603D` loader, `#455632` card, `#546641` numeral | frames 01, 53 |
| Cork orange (vector handles) | `#F87A3D` | frames 01, 32 |
| Rust orange (model tag, "New", quote highlights) | `#CF4E0B` (on dark, small text) | frames 06, 82, 57 |
| Brown glow (radial light) | `#643721` bottom-left, `#643821` top spotlight | frames 05, 55 |
| Dark brown pill / button | `#362418` | frames 80, 84, 53 |
| Active-pill border / glow | `#C73413` | frame 80 |
| Red neon sketches | `#F00000` | frame 80 |
| Code box | `#2B2723` | frame 83 |
| Thermal ramp | `#22194C` → `#670D6D` → `#EF1F34` → `#FFFF9D` | frame 29 |
| Claim-card grounds | deep red `#6A0D01` → orange-red `#B13604` (radial); olive `#42350B` | frames 60, 69, 73 |
| Rainbow glow samples | `#D12133`, `#EE3137`, `#FEFF70`, `#64F4A0`, `#62719F`, `#86397A` | frames 06–09 |

Structure of the palette: **one warm dark ground, one cream, one orange accent, one green**; everything else comes from the 3D scenes and photos. Accent orange is used for at most one short word per screen.

### Type
- **Families (inferred from glyph shapes; files not inspected):** (1) one neo-grotesk (Neue Haas / Helvetica Now Display look: double-storey a, straight-tailed y, flat terminals) for everything, in ≈ 3 weights (regular body, medium/semibold display, bold small caps labels), tight tracking at display sizes (≈ −2% to −3%); (2) a wide geometric wordmark with circular counters (custom logotype, hero/nav/tiers/film); (3) a high-contrast serif only on the magazine cover and for maths formulas; (4) a monospace for BibTeX and a few photo captions.
- **Scale (px at 1440 wide → vw):**

| Token | Use | Measured | ≈ font-size |
|---|---|---|---|
| Fit-width display | "it's wearable", "sustainability" | x-height 126–128, ascender 169–177, width 1,350 | **245–250 px (17 vw)**, set to fill the content width exactly |
| Claim XL | "Always On" | ascender 119 | 165 px (11.5 vw) |
| Display L | "Powered by AI" | cap 81 | 112 px (7.8 vw) |
| Wordmark | hero / tiers | cap 107 (hero), 151 → 123 (tiers) | — (width 34.6 vw hero; 49 → 40 vw tiers) |
| Claim L | "Runs on RTX…" | cap 75 | 104 px (7.2 vw) |
| H2 (uppercase) | flip, grip, testimonials, intro | cap 35 | 48 px (3.3 vw), lh 0.98 |
| Claim M (sentence case) | 2-line card claims | cap 33 | 46 px (3.2 vw), lh 1.3 |
| H3 (uppercase) | end headline / panel titles / green card | cap 28 / 24 / 23 | 40 / 33 / 32 px (2.8 / 2.3 / 2.2 vw), lh ≈ 1.03 |
| H4 (uppercase) | card heading, tier eyebrow, tier name | cap 16–17 | 23 px (1.6 vw) |
| Lead | side copy, testimonial intro | line pitch 36 | 26 px (1.8 vw), lh 1.38 |
| Quote | reviews | cap 15 | 21 px, lh 1.3 |
| Body | panels, sections | line pitch 24 | 17–18 px, lh 1.35 |
| Eyebrow (uppercase) | above H2s | cap 13 | 18 px, bold |
| Label (uppercase) | nav, hints, captions, header row | cap 8–9 | 12 px, bold, tracking ≈ 0 |
| Micro (uppercase) | names, roles, disclaimer | cap 7–8 | 10–11 px |

- **Case rules:** giant words and display statements in **lowercase/sentence case**; section titles, labels, buttons, nav in **uppercase**; body in sentence case.

### Spacing
- Gutter 45 px (3.125 vw); content width 1,350 px; centred narrow columns 531 px (academic) and ≈ 725 px (AI headline column).
- Small gaps: 8 px (pills), 12 px (gallery cards and thumbnails), 18 px (info cards), 24 px (nav links; body line pitch).
- Block gaps: 35–40 px between eyebrow/headline/body in centred stacks; 60–70 px between academic blocks; 271 px testimonial row pitch; card row inset 71 px top and bottom (10% vh).
- Feature panel: 454 px wide (31.5 vw), 45 px inner padding, five fixed slots (icon / heading / body / rule / title) at fixed vp-y positions so the panel reads identically across features.
- A practical scale that reproduces these: 4, 8, 12, 18, 24, 36, 45, 72, 120 px.

### Components
- **Nav:** see §3 (global furniture). Logo left, 4 links right, dotted active underline, scramble hover, page dim on hover, colour adapts to background.
- **Buttons:** fully rounded pills, uppercase 12–13 px labels. Variants: dark brown solid (`#362418`, 44–52 px tall); translucent cream on photo scenes (hover → near-black); outline dotted (small, 24 px tall); glowing active state (orange-red border + outer glow) for the tier toggle; 45 px circular icon buttons.
- **Inputs:** dashed 1 px border box with centred uppercase text; newsletter = dotted underline + arrow.
- **Rules:** 1 px dotted only.
- **Cards:** flat colour or full-bleed photo, square corners (no radius), no shadows, no borders. Only pills and comparison rows are rounded.
- **Footer:** dashed-border credit box; newsletter; two contact pairs; stacked socials; legal links; right-aligned uppercase disclaimer; all on the near-black ground over the particle field.

---

## 6. Tech notes

### What is known (public sources, snippets only)
- Lusion published a **7-part "Oryzo BTS" series**: Part 1 concept and creative direction; Part 2 3D design and motion graphics; Part 3 website UX/UI and illustrations ("keeping the interface quiet while letting the content do the talking"); Parts 4–7 "WebGL/ThreeJS tricks". The blog is blocked here, so only search snippets were read. [Part 1](https://blog.lusion.co/oryzo-bts-part-1-7-concept-and-creative-direction), [Part 2](https://blog.lusion.co/oryzo-bts-part-2-7-3d-design-and-motion-graphics), [Part 3](https://blog.lusion.co/oryzo-bts-part-3-7-website-ux-ui-and-illustrations), [Lusion on X (Part 3 announcement)](https://x.com/lusionltd/status/2046585874926743563).
- Part 2's snippet: they used **Gaussian splatting to turn high-quality Houdini renders into something that runs in real time in WebGL**: many camera views rendered in Houdini, processed into splats (they tested Jawset Postshot and the open-source LichtFeld Studio and preferred Postshot), and **the scene split into several splats for compositing inside the web experience**.
- The Part 3 snippet says an early design "looked like a typical Awwwards design" and "felt lifeless", which led to the quiet UI.
- Third-party write-ups describe the hero object as **rendered live in Three.js with weight and inertia**, and the camera as moving through real depth rather than sliding 2D layers ([utsubo, Best Three.js websites 2026](https://www.utsubo.com/blog/best-threejs-websites-2026)). A three.js forum showcase thread exists ([discourse.threejs.org](https://discourse.threejs.org/t/oryzo-ai-a-wearable-product-in-the-ai-era/90696)), not readable from here.
- Awwwards: Site of the Month (April 2026) and a Developer Award, per the search summary of [awwwards.com/lusion](https://www.awwwards.com/lusion/).
- The ORYZO-1 checkpoints are **Houdini 21 OBJ exports** (header line), 98 to 1,282 points, radius 4.5 and height 1.75 units, i.e. a 9 cm coaster, 1.75 cm tall, if the units are cm.
- Lusion has an MIT repo, [lusionltd/WebGL-Scroll-Sync](https://github.com/lusionltd/WebGL-Scroll-Sync), explaining why WebGL sites take over scrolling: native scroll and `requestAnimationFrame` are out of sync, so a fixed canvas drifts against the DOM. Their proposed fix is to let the canvas scroll with the page and re-offset it each frame, with extra padding. Useful background for our scroll setup; we take the idea, not code.

### Libraries detected
**None could be detected**, because the live site is unreachable (no `window` globals, no network list). Inferred from the frames: Three.js/WebGL (above); JS-driven smooth scroll (the custom thumb and perfectly steady pins point to a virtual or smoothed scroll); per-character text splitting for every reveal; a post-processing stack with bloom, depth of field, colour grading and a velocity smear.

### How each key effect is probably built, and the real-time translation for a sheet of paper
"Offline" = relied on pre-rendering, photography, video or splats. Each proposal is a technique; whether aviva uses it is the creative team's call, and anything in §8 is off-limits as content.

| ORYZO effect | Probably built with | Offline? | Real-time Three.js approach for aviva's sheet |
|---|---|---|---|
| Photoreal desk scenes (hero, pegboard, flip desk), camera moves through them | Houdini renders → Gaussian splats, several splats composited, live coaster mesh on top | **Yes** (splats) | No desk. An infinite white studio: a large curved cyclorama plane with a shader gradient (no visible horizon), `PMREMGenerator` + `RoomEnvironment` for soft image-based light, one soft key light, a **contact-shadow render target** (orthographic depth from below, blurred twice) under the sheet, and `BokehPass` or a two-layer blur for depth of field. The paper itself carries the realism: procedural fibre normal map, slight warm/cool white variation, a sheen lobe, and a back-light transmission term (below). |
| Coaster as hero object with weight/inertia | Real-time mesh; damped springs on position/rotation | No | A sheet mesh of ≈ 128 × 181 segments (≈ 1.6 mm cells on A4, aspect 1:√2) with a deformation vertex shader; drive targets from scroll, then **critically damped springs** (ζ ≈ 1, ω ≈ 6–10 rad/s) on rotation, position and bend uniforms so the sheet lags and settles like a light object in air. |
| Dynamic text on the object (flip encryption) | CanvasTexture decal on a live mesh | No | Same: a `CanvasTexture` (or a render-target "ink layer") on the sheet's front face; pointer strokes or typed text are drawn into it and multiplied with the paper colour, with slight bleed (blur the ink layer by 1 px and darken where strokes overlap). |
| Thermal "vision mode" | Re-shaded splat/render (gradient map) + live steam | Probably yes | A **vision-mode uniform** on one full-screen post shader: luminance or a per-object ID buffer remapped through a 1D ramp texture. For paper (ink microscope), render an ink-concentration field (reaction–diffusion or noise advection in a 512² ping-pong target, guided by an anisotropic fibre texture) and map it through an ink-blue ramp. |
| Six-fingered hand holding the coaster | Rigged, skinned mesh with baked animation | Modelled offline, plays live | (Don't reuse the hand.) Pencil cursor: a small 3D pencil mesh that follows the pointer projected onto the sheet's plane, tilted by pointer velocity; strokes written into the ink layer. |
| Branded wrapper tearing | Houdini cloth/tear sim baked to vertex animation or mesh sequence | **Yes** | (Don't reuse wrappers.) Paper's own versions, all procedural: **curl** (bend around a moving cylinder axis: for vertices past the axis, map distance to an arc of radius r), **fold** (rotate the half-space beyond a crease line by θ, with a 1–2 mm smooth hinge to avoid a hard kink), **crumple** (blend toward a precomputed noisy height/normal field while shrinking the outline), **tear** (two meshes split along a jagged noise path, with a 1–2 px alpha-tested fibre fringe that glows when back-lit). |
| Object passes in front of, then behind, giant glowing type | Type rendered inside WebGL (MSDF text or text texture on a plane) + bloom | No | Same technique: type as an MSDF plane or a `CanvasTexture` plane at a fixed depth; the sheet (or the paper plane it folds into) moves through z on either side; glow from a cheap separable blur of the type layer added back (avoid full-scene bloom cost). |
| Magnifying gallery with velocity smear | WebGL image planes; UV offset + horizontal stretch by scroll velocity; photos/videos | **Yes** (photography, video) | Same shader idea on **our own renders**: origami forms folded from the same sheet and rendered either live into render targets or exported once by us as stills. Smear: in the fragment shader, sample 5–7 taps along x with an offset ∝ scroll velocity. |
| Frame grows to full-bleed (signature T6) | Animated clip rect over the live scene + `camera.setViewOffset` to keep the composition registered | No | Technique to keep (registered clip-rect expansion of a live scene) but with our own content: e.g. the sheet itself zooming until it is the page (mission row 6). |
| Vector handles registered on the object | 3D bounds projected to screen each frame, drawn in SVG/canvas | No | Same projection (`Vector3.project`) to draw dimension lines (210 / 297 mm), crop marks or a fold diagram registered to the sheet's corners. |
| Sketches with parallax + cursor-revealed neon | Textured planes, additive blend, reveal mask = distance to projected cursor | Drawn offline | (Don't reuse sketches/red glow.) The masked-reveal technique could show watermark-like fibre patterns or transmitted light only near the cursor ("hold paper to the light"). |
| Macro push-in + mono grade | Live camera dolly into a high-res mesh + grade shader | Textures offline | Camera dolly to ≈ 2–3 cm from the sheet; a 2048² tiling fibre normal + height map with parallax occlusion (4–8 steps) and a grazing key light; the 0.1 mm edge as a separate thin box strip with its own brighter, rougher material; grade with a desaturate/curves post pass. |
| Bark macro splitting | Displaced bark meshes or a rendered clip | Probably yes | Not needed (avoid bark). For a paper equivalent, a tear reveal: the sheet tears horizontally and the halves curl away. |
| Light through the product | — | — | **The paper's key look.** In the fragment shader add a back-light term `T = transmission × thickness_map × max(0, −N·L)` tinted warm, so the sheet glows and shows fibre/cloud structure when the key light is behind it; animate the light behind the sheet in the hero and macro beats. |
| Dark → cream inversion, leaf-shadow gobo | CSS variables + WebGL clear colour tween; image overlay with multiply | Gobo image offline | aviva starts light, so if we invert, go light → ink-dark. A gobo should be our own (e.g. a window-blind or none). |
| Floating coffee-bean field at the end | `InstancedMesh` + noise drift + DOF | Bean model offline | (Don't reuse a particle-field ending.) |
| Typed headline with block cursor, char-level reveals | Split text + timeline | No | Same family of techniques with our own signature reveal (e.g. ink bleeding in, or lines appearing as if printed). |

### Scroll and render loop (recommended for aviva)
One fixed full-screen canvas; Lenis with `autoRaf: false`; `gsap.ticker` drives Lenis, ScrollTrigger updates and the Three.js render in the **same** frame (this is the drift problem Lusion's repo describes). Pins via ScrollTrigger with `pinSpacing` so the document length grows like ORYZO's (≈ 63 vh). All scene state comes from one normalised progress value per section, which is then spring-smoothed per property.

---

## 7. Copy patterns (structure only, no copy reproduced)

- **Headline lengths.** Display statements are 2–4 words (the AI claim, the portability payoff, the sustainability word, the claim cards). Section titles are 2–4 words in uppercase, often two lines of 1–2 words each (feature panel titles, flip, grip, testimonials). Eyebrows are 3–5 words, uppercase, often ending in a comma that hands off to the giant word below ("SO PORTABLE," → payoff).
- **The deadpan formula: claim → literalisation → undercut.** Bodies are 2–3 sentences, ≈ 20–35 words: sentence 1 states a premium-sounding benefit; sentence 2 takes it literally (the lift is exactly one coaster thick; the grip makes the drink file a legal complaint); sentence 3 is a dry undercut, frequently a one-word sentence or a two-word aside ("Literally." / "Genius." type). The tone never laughs at itself; the absurdity is in the logic.
- **AI-term mapping.** Every feature pairs a dull physical property with one AI/tech term (lift ↔ elevate; heat ↔ sampling temperature; roundness ↔ a positional-encoding acronym; turning over ↔ encryption; no electricity ↔ no compute/tokens; table edge ↔ edge computing; no off switch ↔ uptime; a GPU as a mug stand ↔ memory limits; antiques ↔ backward compatibility; more coasters ↔ Pro Max; a 3D file ↔ open weights).
- **Asterisk footnote reveal.** A giant claim carries an asterisk; the bottom-right corner redefines the term in two words.
- **Fake-precise metrics, formatted like specs:** one-decimal percentages; coefficients to two decimals with "(EST)"; review counts and averages in square brackets ("[364]", "[4.9/5]", "[5/5]"); temperature labels "T = 10 / 1 / 0.1"; dates and test conditions in uppercase metadata rows; formulas typeset in a serif maths face with a caption naming a fake model or acronym; a one-line legal hedge under the formula.
- **Backronyms.** Real AI acronyms re-expanded into coaster engineering phrases (e.g. a positional-embedding acronym turned into roundness engineering).
- **Testimonials:** 1–2 sentences, one phrase highlighted in the accent colour, signed with a first name + initial and an absurd role line (often two roles, one ex-).
- **Slang inside corporate voice:** internet slang ("cooked", "trust me bro") dropped into otherwise polished copy, used sparingly (≈ 3 times on the page).
- **Ending:** a two-sentence turn: confession (the product doesn't exist) → pitch (what that means for your brand), then the studio link. aviva must not echo this structure word-for-word or the "if we can sell X" construction.
- **Rhythm across the page:** big claim (2–4 words) → small explanation (≈ 30 words) → one visual gag → move on. No paragraph is longer than 4 lines at 1440 px.

---

## 8. ORYZO's signature elements (do not reuse)

The creative team must not reuse any of these as content, composition or gag. Techniques listed in §9 are fine; these specific executions are not.

### From `reference/VIDEO_NOTES.md` (confirmed in the frames)
1. Green cutting-mat desk, seen top-down, with pencil, cutter, eraser and paper clips (02–03, 30–36).
2. The six-fingered hand holding the product, and the "try to hover hand" invitation (05–10).
3. The rainbow AI-glow border that cycles hue around the viewport (06–09).
4. Wrapper tearing (a branded foil wrapper around the product) (11–12).
5. "It's wearable" and the lifestyle photos: chest-worn with a holographic wellness UI, yoga, cap, bikini, eye patch, held in the teeth, in a sweater pocket (13–25).
6. The RISE magazine cover (serif masthead, issue roundel, doom cover line) (18–25).
7. Pegboard desk with keyboard, controller, headphones and a takeaway cup on the product (26–29).
8. Thermal-camera view (28–29).
9. "37.9% more circular" and the da Vinci-style sketches (Vitruvian figure in a ring, grail, circle studies) (31–34).
10. Flip encryption (type a message, flip to hide it, flip back to read) (37–40).
11. "Grip-locked antislip" (44–45).
12. Cork-bark macro (46–48).
13. The reviewers: astronaut, pirate captain, AI/ex-web3 influencer, minimalist, flat-earther (55–58).
14. The claims "runs on the edge / refuses the cloud", "always on", "runs on RTX 3090", "drop-tested", "legacy support" (56–77).
15. Red smoky/neon glow on the tier picker (80–81).
16. Floating particles at the end (coffee beans in the frames) (84).
17. The "if we can sell a coaster…" closing line.
18. ORYZO's palette (dark brown, cork orange, cream, green) and its bold grotesk + wide geometric wordmark.

### Added from the frames and the repo
19. **The vector construction-drawing loader**: dashed double circle, orange bezier handles, smart-guide lines, conic progress fill on a flat colour ground (01).
20. **The vector-ring ↔ object match-cut as a recurring motif** (loader, mid-page, return) (01–02, 31–35).
21. **Giant wordmark top-left over the hero**, settling from large/translucent to final; tagline typed in above it (02–03).
22. **The bottom-left studio-credit glass panel** with dotted rule and a right-aligned superlative (02–03).
23. **The launch-film thumbnail** (presenter seated, logotype behind him, glowing orange border, "PLAY") in the hero's bottom-right (02–03; `thumb.png`).
24. **The scrollbar thumb that starts as a labelled vertical tab** for the model page (02) and the cream 9 × 150 px thumb.
25. **"X isn't just an X. It's the result of…"** as the opening line, with headline left and body right of the centred object (04).
26. **The asterisk on "AI" redefined as a design program in the corner footnote**, and the finger-count quip (05–10).
27. **The orange model-name tag tucked under the end of the headline** (05–10).
28. **The dashed selection frame with a corner dot, dotted circle and tick marks** around the product (11–25).
29. **Product passing through giant fitted-width lowercase type that blooms** (11–13).
30. **3D product → photo handover inside a portrait frame**, and the **magnifying-window gallery** (small thumbnail strip, magnified item in a fixed 4:5 frame, motion smear) (13–25).
31. **In-photo captions**: black "WARNING / stunt performed by professionals" bar; DM-style "hey @brand…" line with a SEND pill (16, 17, 21).
32. **The gallery frame expanding to full-bleed to become the next scene** (25–27).
33. **The frosted left panel template** (icon circle / caps heading / body / dotted rule / right-aligned two-line title / bottom-left dot) **with a serif formula and caption in the bottom-right** (Δh ≈ t, softmax, circularity) (26–34).
34. **LLM sampling temperature as literal temperature**, with a CREATIVE / BALANCED / DETERMINISTIC vertical scale and "a visualization, not a warranty" (28–29).
35. **AI acronyms re-expanded as engineering backronyms** (RoPE, "TDM") (28–34).
36. **The engraved-name-on-the-product interaction** (typed text printed on the object) (38–40).
37. **The friction-coefficient spec card** (cream header bar with value, micrograph with mirrored fade) and the **dashed arc drag slider with hand icon** (44–45).
38. **Bark cracking and swinging open like doors to reveal a giant word** (46–48).
39. **"sustainability" as the giant word**, "VEGAN-FRIENDLY / 100% PLANT-BASED", the "bull" pun, the **dark→cream inversion with a palm/leaf shadow gobo** (48–51).
40. **The three info cards**: green card with a giant low-contrast numeral (first harvest age), bark-icon card (harvest interval), and **"power draw while in use" with a rotating ring of "thank you" pills in many languages** and the please/thank-you tokens joke (52–53).
41. **The testimonial composition as a whole**: the "people all around the world love [product]" headline left + lead right around the product; the three-label RATING & REVIEWS header row with bracketed count/average; 5/5 stars + one orange phrase per quote + photo far right; the product turning edge-on in the empty centre column (54–58). (Rows of reviews around a floating product are a technique and allowed; this exact assembly is not.)
42. **Parody thumbnails** ("Can you tell it's real?" YouTuber face, a support-group meeting) (56–58).
43. **The sticker-covered product** and **the colour-stacked product** as narrow gallery cards (56–77).
44. **Mug composited in front of the claim headline** (text-behind-object photo compositing) (65–70).
45. **"Drop-Tested" metadata row** (test conditions / date / damage) and **"Legacy Support" ancient vessels with monospace museum captions** (73–77).
46. **"Choose you own" (sic)** eyebrow over a giant wordmark that passes in front of the product, then shrinks into a tier header (78–80).
47. **Tier names Product / Pro / Pro Max as three glowing pills** and the stack of 1/2/3 identical objects; comparison table with orange "New" and rounded value rows (80–82).
48. **Cursor-following light revealing red neon sketches** (80–81).
49. **The academic block**: "single-shot espresso'd" acknowledgement, "trust me bro" peer review from a LocalLLaMA user, BibTeX `@misc{…2026}` with `howpublished = {OBJ release}` and "Code: coming soon" (83).
50. **The repo jokes**: `.obj` checkpoints named like LLM sizes with "a0b" (zero active parameters) and an "instruct" and "frontier" variant; "WoodenBench… on a single desk"; **paper.pdf = one A4 page with a single centred title line** (`work/oryzo-1-repo/`).
51. **Typed two-line confession + pitch** with a travelling cream block cursor, and the studio pill button (83–84).
52. **Footer credit box** (dashed border, "built with love", "share with friends if you like it", "copy URL" pill) (84).
53. **Nav behaviour**: link scramble on hover + whole-page dim; INTRO / FEATURES / PRODUCT / CONTACT labels; dotted active underline (15).
54. **Formula in a thin serif at large size as a corner ornament** (26–34).

### Collision watch: the mission's starting ideas vs ORYZO
The section table in `work/00-mission.md` is a starting point; several ideas sit close to items above. My recommendation for each (the creative director decides):

| Mission idea (row) | Too close to | Risk | Direction |
|---|---|---|---|
| Fold-to-encrypt: type a message, the sheet hides it, unfold to decrypt (10) | #10, #36 (flip encryption: type → conceal by a physical move → reverse to decrypt) | **High: same joke and same interaction structure** | Keep "interactive gimmick" but change the joke: not encryption/decryption, and not "your text appears on the product then gets hidden". E.g. the visitor's input changes the sheet physically (paper-plane range test, a fold-count challenge, a "print preview" that never prints). |
| Sustainability card "power draw: 0 W" (12) | #40 (their third card is power draw while in use) | **High** | Drop the power-draw card entirely; pick three different true paper facts. Also don't use "sustainability" as the giant word (#39). |
| "No battery. No updates." claim (14) | #14 "always on: 24/7 uptime, no power required" | Medium | Avoid power/uptime claims; "zero hallucinations", "context window 210 × 297 mm" and "unlimited undo (pencil only)" are clear. |
| "Offline since 105 AD" (14) | #45 "legacy support since the 5th millennium BCE" with ancient objects | Medium | Keep the date joke only if it is not staged as a museum line-up with monospace captions; better as a single-sentence claim. |
| Tier names "Notebook Pro / Ream Pro Max" (15) | #47 Pro / Pro Max | Medium | Tier picker is KEEP; avoid the exact "Pro Max" suffix and the three-glowing-pills look. |
| "aviva-1: a paper about paper", model weights = a blank A4 PDF, a 4-vertex .obj (16) | #50 (their paper.pdf is already a nearly blank A4 page; their weights are .obj files) | **High for the blank-A4 PDF**, medium for the .obj | Make our parody paper a real multi-page paper with its own jokes (the mission asks for one); don't make the joke "the paper is a blank A4 page". A 4-vertex .obj is a twist on #50; only keep it if the naming is not LLM-size style. |
| A4 outline loader that becomes the sheet (1) | #19, #20 | Medium (technique is KEEP) | Use blueprint dimension lines and crop marks, no bezier handles, no dashed double outline, no conic progress fill, no flat green ground; don't repeat the drawing↔object cut mid-page. |
| Sheet turns edge-on: "thinnest product ever" (3) | #25 placement (headline left / body right of the centred object) | Low | Fine; change the layout (e.g. stacked copy) and the opening sentence form. |
| Paper plane flies through giant type (5) | #29 (product through fitted-width blooming type), #28 dashed frame | Medium (technique is KEEP) | Keep the fly-through; drop the dashed selection frame, the eyebrow-with-comma + lowercase payoff formula, and the bloom-on-pass. |
| "Fold in half, still the same shape" √2 diagram (9) | #9, #33 (formula corner), #35 | Low–medium | Use real dimension lines and true maths; no percentage-improvement claim, no Renaissance sketches, no serif formula corner ornament. |
| Sheet zooms until it becomes the page (6) | #32 (frame grows to become the next scene) | Low–medium | Distinct enough if it is the product itself (not a gallery frame or a cover) and the paper texture persists as the site's ground afterwards. |
| Macro of fibres + paper-cut safety spec (11) | #37 (spec card with header bar, micrograph, arc slider) | Medium | Keep macro + one number; use a different spec widget (no header-bar card, no arc slider). |

---

## 9. Technique checklist (for reviewers: tick yes/no against the aviva build)

**Structure and pacing**
1. One continuous page; no hard page loads or route changes between sections.
2. The document is a long, pinned scroll story: total scroll range ≥ 40 vh (ORYZO ≈ 63 vh) with at least 6 pinned beats.
3. The product is visible in ≥ 80% of scroll positions (ORYZO ≈ 83%, counting photos of it), and the live 3D sheet in ≥ 60% (ORYZO ≈ 62%).
4. When the product is on screen it is horizontally centred (x 50% ± 5%) in ≥ 80% of those positions.
5. The section rhythm follows hero → AI moment → portability → features with fake metrics → interactive gimmick → material macro → sustainability-type beat → testimonials → claim gallery → tiers + comparison → academic → CTA → footer disclaimer (with our additions/merges documented).
6. No single beat is longer than ≈ 10 vh, and no beat shorter than ≈ 1 vh except the hero.
7. At least one long horizontal pinned gallery that translates ≈ 1:1 with vertical scroll.

**3D choreography**
8. Exactly one fixed full-screen WebGL canvas and one scene for the whole page.
9. Scroll drives the product's rotation, position, scale and the camera continuously (scrubbing back reverses everything exactly).
10. Product motion is spring-damped (it lags and settles; no linear, robotic tweens on the hero object).
11. The product changes on-screen size deliberately per beat (ORYZO range: 31%–52% of viewport height, plus one macro beyond 100% width).
12. At least one continuous camera move through ≥ 2 beats without a cut (ORYZO: flip → mat level → macro).
13. At least one beat where the product passes in front of and then behind DOM-looking type (real depth layering).
14. At least one "alternate vision" re-shade of the same scene (ORYZO: thermal), switched in < 1 vh.
15. At least one extreme macro where the material detail holds up at > 100% viewport width.
16. Lighting changes between beats (key direction, colour temperature or background), not one static light setup.
17. The sheet looks physically real: visible fibre/surface detail, soft contact shadow, light visibly passing through it when back-lit.

**Transitions**
18. Every section hand-over keeps the product (or its stand-in) registered in screen position across the change (no "slide" cuts).
19. One clearly identifiable signature transition of our own, not a frame expanding to full-bleed or a vector-ring match-cut.
20. At least one transition is a global colour change of the page ground (ORYZO: dark → cream) that also flips nav and text colours.
21. At least one transition where a DOM block scrolls over the canvas with a hard edge, revealing the 3D stage behind it.

**Typography and UI restraint**
22. One main typeface family for all UI and copy (at most one extra face, used in one place on purpose).
23. At least two "fit-width" display words that span exactly the content width at 1440 px (ORYZO: 1,350 px, ≈ 17 vw).
24. Small uppercase labels (≈ 12 px) for nav, hints, eyebrows and captions; body ≈ 17–18 px with line height ≈ 1.35.
25. Palette ≤ 5 UI colours (ground, ink, one accent, one secondary, one muted), with the accent used for ≤ 1 short phrase per screen.
26. Consistent page gutter equal on left and right (ORYZO 45 px at 1440) and all major elements snap to it.
27. Slim nav with no background bar: logo left, ≤ 4 links right, an active-section indicator that changes as you scroll.
28. A persistent "scroll" hint during pinned beats, at the bottom centre, which dims during transitions and returns when a beat settles.
29. Every text block reveals with a crafted per-line or per-character animation, and exits with one (no plain fade-in of whole paragraphs).
30. Body copy blocks never exceed 4 lines at 1440 px.

**Interactions**
31. At least one hover/pointer interaction that affects the 3D product directly.
32. At least one input-driven gimmick whose result is rendered on or by the 3D product in real time.
33. At least one draggable control that scrubs something visual (ORYZO: an arc slider; ours must be a different widget).
34. A tier picker that changes the 3D product (count/size/form) with a short settle animation, plus a comparison table.
35. Nav links jump smoothly to sections; hover states exist on every interactive element; keyboard focus is visible.

**Content formats**
36. Fake-precise metrics are formatted like specs (decimals, units, a hedge word, a source-style footnote) and every number and its formatting joke is new.
37. Testimonials are rows (rating, quote, name + absurd role, our own image) arranged around the floating product, with a new header/format of our own (not §8 #41).
38. An academic block with abstract, acknowledgements, peer review, BibTeX in a code box, and links (paper / model / code).
39. A closing CTA and a footer that states plainly that the site is a fictional parody inspired by ORYZO by Lusion, not affiliated, nothing for sale.
40. Every image in galleries/cards is our own (real-time render, our own render export, or our own illustration).

**Polish, performance, responsiveness**
41. Loader: a line drawing that becomes the real 3D sheet in the same screen position, with no visible pop.
42. First load ≤ 3 MB; pixel ratio capped (2 desktop / 1.5 mobile); rendering pauses when the tab is hidden.
43. No FPS regression against the previous build in `tools/shoot.mjs --fps` (software WebGL, so compare builds, not absolute numbers), and no console errors from our code.
44. At 390 px: every section is laid out on purpose (no overflow, no clipped type), the product is visible in every pinned beat, pins still work.
45. At 768 px: no two-column layout collapses into overlapping text and the product.
46. `prefers-reduced-motion`: pins and 3D still tell the story but without large camera moves or springs; no time-based loops.
47. WebGL unavailable: a designed static fallback (still the premium look, not an error message).
48. No element from §8 appears in the build.

---

## 10. Mobile behaviour (all inferred) and the 390 px plan

The recording is desktop only, and the live site can't be reached, so nothing here is observed. What can be inferred from the desktop build:
- Most layouts are centred stacks or gutter-to-gutter rows, which collapse cleanly; the three-column compositions (3.3, 3.4, 3.13, 3.15) and the left feature panel (3.7–3.9) are the parts that must be redesigned for phones.
- Fit-width words (≈ 17 vw) stay legible at 390 px (≈ 66 px), so the giant-word beats can survive unchanged.
- Hover gimmicks (hand, cursor light, nav scramble) have no touch equivalent; they need tap or scroll-driven stand-ins.

aviva at 390 × 844, by beat type:
| Beat type | 390 px layout |
|---|---|
| Hero / intro | Logotype across the top (≈ 88 vw), sheet centred at ≈ 70 vw (A4 portrait ≈ 270 × 380 px), one short line of copy under it; credits and video-style extras dropped. |
| Side-by-side copy around the product | Headline above, body below the product; the product never shares a row with text. |
| Giant type + product through it | Keep at full width; 1–2 lines; the sheet passes through at ≈ 60 vw. |
| Galleries | Horizontal pin kept, cards 85 vw × ≈ 70 vh; swipe as a secondary input; thumbnails become a dot row. |
| Feature panels | Bottom sheet, full width, ≤ 45% height, blurred; the 3D stays in the top 55%. |
| Interactive gimmick | Controls in the top 45%, product in the bottom half; on input focus, keep the product visible above the keyboard. |
| Testimonials | Single column; product small and sticky at the top, or interleaved every two reviews. |
| Tiers + comparison | Segmented control (3 × 33%), stacked text, swipeable 3-column table. |
| Academic + footer | Single column, code box scrolls horizontally, footer columns stacked. |
| Performance | DPR ≤ 1.5, fewer segments on the sheet (≈ 64 × 90), no depth-of-field pass, particle/instance counts −70%. |

---

## 11. Gaps (what the frames could not tell)
- **Live-site facts:** libraries and versions, canvas vs DOM per element, asset types and sizes, fonts, exact easing curves and durations, and the whole mobile layout: all unverified (site and blog blocked). Font identifications are shape-based guesses.
- **Scroll lengths** come from a custom thumb assumed to be linear in scroll position; the two independent checks agree to ±5%, but each section boundary is ±0.5 vh.
- **What happens between frames:** e.g. the intro rotation (only the top view is captured), how the wrapper appears, the bark split's exact motion, whether the tier stack drops or grows, the comparison table's lower rows, and the academic section's top (model name, buttons, abstract are cut off above frame 83; the notes list them).
- **Interaction details:** hand hover response, the arc slider's mapping, the encode/decode flip timing: only single states were captured.
- **Audio:** unknown (no audio in the frames; the launch film thumbnail suggests sound on play only).
- **Easing:** inferred as smooth/inertial (expo-out-like) from the absence of overshoot in frames; can't be measured from stills.
