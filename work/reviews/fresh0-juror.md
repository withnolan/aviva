# Fresh-eyes jury review: ORYZO (benchmark) vs aviva

Reviewer persona: Awwwards / FWA juror, first visit to both sites, no prior context.
Captures: 1440x900, real wheel scrolling, software WebGL.
- Benchmark: `work/screenshots/fresh0/juror-oryzo/oryzo-1440x900-000..035.jpg` (+ a partial deeper pass in `juror-oryzo-deep/`, stopped after 10 frames because it got no further).
- Second site: `work/screenshots/fresh0/juror-aviva/aviva-1440x900-000..035.jpg`.

Capture caveat: ORYZO's smooth-scroll moves slowly under software WebGL, so 36 steps only reached about 6,800 of 55,800 px (the intro, "Isn't just a coaster" and "Powered by AI"). I judge ORYZO on that opening, which is its showpiece anyway. aviva was captured top to bottom (51,300 of 51,300 px).

## What each site is, in one line
- **ORYZO**: a deadpan, very expensive-looking "AI product launch" for a cork coaster, told as a cinematic 3D film you scroll through.
- **aviva**: the same joke for a blank A4 sheet of paper: a "foundation model pre-trained on nothing", with a changelog, benchmarks, reviews, a size table and a fake research paper.

## First 5 seconds
**ORYZO.** A design-tool frame (orange bezier handles, dashed guides) on a flat green field (000), which then racks focus into a real-looking photographic scene: a cork coaster on a green cutting mat, wooden desk, pencil, depth of field, film grain (001-003). The wordmark ORYZO fades in huge, then the scene drops to black and the coaster floats alone, lit like a jewel (004-007). I believed it was a product before I knew it was a joke. The feeling: "this is a studio showing off", and I wanted to keep scrolling.

**aviva.** A pale page, a calm headline ("Every great product starts with a blank sheet of paper."), and a huge black AVIVA wordmark with a sheet of paper standing in for the "I" (000). Clever, clean, confident type. But the sheet is a flat, slightly trapezoid card with a faint glare and no thickness, shadow or paper feel, so the hero reads more like a nice poster than a 3D launch. The first scroll goes to a dark slate frame where the AVIVA letters almost disappear and the sheet looks like a grey trapezoid (001). The feeling: "smart copywriter, careful designer, not yet a 3D studio".

## What I remember afterwards
**ORYZO:** the macro cork texture turning in light; "ISN'T JUST A COASTER."; the giant "Powered by AI\*" with ORYZO-1 under it; a dark 3D hand holding the coaster up; the rainbow "AI glow" border around the whole viewport (028-035); "AI fills in the gaps. We said high five. It heard six." and the "Try to hover hand" prompt. Every beat is one image plus one line.

**aviva:** the line "Pre-trained on nothing"; "0.1 mm." with the sheet seen edge-on as a single white line (002), the best image on the site; the washing line of "Selected outputs" (paper plane, boat, fan; 009-010); the "Hold to tear" distillation (013); the ultramarine ink-drop and "Absorption: total." (018-020); the reviewer gags ("Went down beautifully." The Shredder); the claims cards ("Zero hallucinations", "Needle in a haystack: 100 %"); the print dialog and the research paper ("We thank the pencil, without which this work would be complete."). I remember far more *jokes* from aviva, but far fewer *images*.

## Which is richer, more crafted, more premium, funnier
- **Richer / more crafted / more premium: ORYZO, by a wide margin.** Photoreal materials, lighting, depth of field, grain, a real environment (mat, desk, pencil), a character (the hand), and a single hero object that is always beautiful at any angle. Type, image and motion are one choreography. aviva's 3D object is a flat cream rectangle in nearly every frame; it rarely bends, curls, catches light or shows fibre. The site leans on DOM cards, tables and text for its richness.
- **Funnier: aviva, narrowly.** Joke density is much higher and the AI-parody vocabulary is sharper and more specific (base model, open weights, distillation, context window, the arena, refusal rate, alignment, roadmap to the Moon). ORYZO is funny through restraint: few jokes, perfectly timed, carried by visuals. aviva sometimes explains its jokes in a second line of small print, which dampens them.

## Where aviva is empty, boring, confusing or cheap
1. **The hero object looks cheap.** A flat card with no thickness, edge, shadow, fibre or curl: 000, 001 (grey trapezoid on slate), 003-005 (big cream slab), 020, 022-023. Next to ORYZO's cork this is the single biggest gap.
2. **Collisions between 3D and text, and between text and text.** These read as bugs to a juror:
   - 007: the giant "4" cuts through "the weights."; the "g" sits on top of the body copy "Our weights are…".
   - 008: the giant "4.99 g" crashes into the logo and nav.
   - 019: the sheet covers "Absorption: total." and its paragraph; the nav item disappears.
   - 021: the sheet covers the subtitle ("…of office equipment") and the rating line.
   - 025: "No vote. Also a valid preference." and "In a blind test, aviva beat aviva…" overlap each other; Response A's sheet sticks out at the top.
   - 026-028: a stray sheet pokes out above the claims cards; the mm ruler runs over card text (027 "250" over "ALL SAFE"; 028).
   - 031: the faded "One shape. Three sizes." heading runs under the logo; "PLEASE TURN OVER" sits on the table row.
   - 014, 015: "PLEASE TURN OVER" overlaps changelog entries.
   - 034: "RELEASE IT" button and the text input sit on top of the sheet.
   - 035: the paper plane is sliced off flat by the footer's top edge.
3. **Empty or unfinished frames:** 006 (flat mid-grey screen, nav almost gone, a lone card), 011 (dark grey leftover sheets hanging over the logo, a sheet with a muddy orange gradient), 016 (an almost empty screen with a small sheet on the right), 033 (a completely blank screen, only the ruler). On ORYZO no frame is ever empty; even transitions are beautiful.
4. **Confusing:** the dimension labels in 030 say 148 x 210 mm while A4 is the selected size and the caption says 210 x 297 mm. The "Pick up the pencil" invite (003-005) leads to an interface panel (Erase / Regenerate / Type a line) that looks like a settings form rather than a magical moment. The 0 to 297 mm ruler on the right is a nice idea, but it is always on and competes with content.
5. **Template feel in the middle third.** The changelog (014-015), the claims carousel (026-029), the print dialog and the specs table (030-031) and the paper page (032) are tidy, but they are web components, not scenes. Pacing goes from "film" to "documentation". The look shifts from slate to blue-grey to cream to ultramarine without a clear rule, so it feels like separate pages rather than one story.
6. **Little motion drama.** Across 36 frames the sheet mostly translates and scales. The few real 3D moments (the edge-on line, the washing line, the folded fan, the boat, the tear, the plane) are the best parts and are too short.

## Where aviva beats the benchmark
- **Copy and joke density.** "Pre-trained on nothing." "Intelligence not included." "We weighed the weights." "Rated in corners." "Zero hallucinations. Whatever you see in the fibres is your own." "Reviewer 2 · Weak accept · Confidence: absolute." The AI-launch parody is more precise and more of-the-moment than ORYZO's.
- **Interactivity with a point:** typing a prompt onto the sheet, hold-to-tear distillation, the blind "arena" vote, the print dialog, the size switcher. ORYZO (in what I saw) offers hover; aviva offers play.
- **Real facts as punchlines:** the 1:√2 ratio, Lichtenberg 1786, DIN 476, ISO 216, Cai Lun, the paperless-office forecast, Gallivan's folding formula. It teaches you something, which ORYZO does not.
- **The ultramarine ink section (018-024)** is the boldest colour moment and the most "designed" stretch of the site.
- **Weight and robustness:** 1.6 MB first load and no console errors, against ORYZO's 6.2 MB.
- **The edge-on "0.1 mm." frame (002)** is a genuinely original image that ORYZO's format doesn't have.

## The 7 changes that would most raise aviva to the benchmark's level (most important first)
1. **Make the sheet a hero material.** Real paper: visible thickness at grazing angles, soft contact shadow, subtle fibre and tooth in the normal map, translucency when backlit, a slight natural curl and bend, and lighting that rakes across it. It should be beautiful at every scroll position, like the cork. Right now it is a flat card (000, 001, 003-005, 020).
2. **Fix every collision and stray object.** Choreograph the sheet so it never covers copy (007, 008, 019, 021, 025, 034); clear leftover sheets between scenes (011, 026-028); keep the hint and ruler out of content (014, 015, 027, 031); don't slice 3D at the footer (035). Juries mark you down for these immediately.
3. **Give the opening a cinematic set piece.** ORYZO earns trust in 5 seconds with a believable scene (desk, mat, pencil, depth of field, grain). aviva needs its own: for example the sheet emerging from a ream or printer tray, or lying on a desk under raking window light, with focus pulls, before the title lands. The hero (000) is clever type; add the image.
4. **Make the 3D do more storytelling.** More scroll-driven transformations of the sheet itself: folding into the plane and boat live, crumpling for the shredder review, curling over the reader in "Absorption", stacking into a ream for the changelog. The washing line and the tear prove the team can do it; make that the rule, not the exception.
5. **Turn the middle third from documents into scenes.** The changelog, claims carousel, print dialog and table (014-016, 026-031) should each have a strong 3D or visual anchor and less UI chrome. Cut or merge sections so no frame is empty (006, 016, 033).
6. **One art-direction rule for colour and light.** Pick a deliberate sequence (for example paper white, then night slate, then ink ultramarine, then back to white) and transition between them with intent, carried by light on the sheet, not by flat background swaps (006 grey, 011 muddy gradient).
7. **Edit the copy down to one line per beat.** Keep the punchline; drop the second sentence of explanation and most of the small print (003-005 helper text, 012 and 013 captions, 027-029 footnotes). ORYZO's strength is "one image, one line". Also fix the 148 x 210 vs A4 label mismatch (030).

## Scores (out of 10)
| | ORYZO | aviva |
|---|---|---|
| First impression | 9 | 6 |
| Visual richness | 9 | 5 |
| Craft | 9 | 5 |
| Humour | 7 | 8 |
| Memorability | 9 | 6 |
| **Overall** | **9** | **6** |

Verdict as a juror: ORYZO is a Site of the Day contender on craft alone. aviva is a very well-written parody with a few original images, but in its current state it reads as an honourable mention: the writing is ready for a jury; the 3D sheet, the choreography and the polish are not yet.
