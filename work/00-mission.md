# 00 — Mission (the user's kickoff message, saved verbatim)

You are the lead of a team of specialist agents. First, read `.claude/agents/project-lead.md` and follow it as your own instructions for this whole session. You are the project lead; never spawn project-lead as a subagent. Then read CLAUDE.md.

## Mission
- **Build:** aviva, a parody "AI product launch" website for a plain white sheet of paper (one A4 sheet, 80 gsm).
- **Reference:** ORYZO by Lusion, https://oryzo.ai, and its GitHub repo https://github.com/lusionltd/ORYZO-1. It's a parody "AI product launch" website for a cork coaster (a cup holder), made with very high craft: deadpan premium tone, a scroll-driven 3D product story, a fake research paper.
- **Brand name:** aviva (fixed; the team invents the model name, tagline and everything else).
- **Repository:** https://github.com/RelentlessYunn/aviva. The website goes in `docs/` (GitHub Pages will publish `main` → `/docs`). Work on this session's branch, push after every step, and deliver everything as a pull request into `main`. I'll merge it.
- **Credits / final call-to-action:** RelentlessYunn, https://github.com/RelentlessYunn
- **Check in with me:** no. Decide everything yourself and tell me at the end.
- **Language:** English. **Pages:** one long scrolling page like ORYZO, plus our downloadable parody research paper.

## Materials already in the repo
- `reference/VIDEO_NOTES.md`: a section-by-section scroll map of ORYZO, made from my screen recording of the site.
- `reference/oryzo-frames/`: 84 frames from that recording, in scroll order (desktop). Trust these over automated screenshots, and use them as the main reference if this session can't reach oryzo.ai.
- `tools/shoot.mjs`: a headless screenshot tool that works in this cloud VM (see CLAUDE.md).
Nothing from `reference/` may go into the website, and you remove `reference/` in the final commit.

## The main rule: same technique, different elements
aviva must clearly use ORYZO's technique and level of craft, but with different elements, so it isn't too similar.

**KEEP from ORYZO (the technique):**
- The deadpan premium tone: an absurd product presented with completely serious craft, parodying AI hype and Apple-style launches.
- Product-centred storytelling: the object is always at the centre, and one continuous 3D scene carries it through the whole page with seamless scroll-driven transitions.
- Restrained UI: one main typeface, a tiny palette, small uppercase labels, lots of space, a slim top nav and a "scroll" hint, so the 3D and the jokes do the work.
- The rhythm of section types: hero → "AI" moment → portability → features with fake-precise metrics → an interactive gimmick → material macro → sustainability → testimonials → claim gallery → tier picker and comparison → academic "paper" → call to action → footer disclaimer.

**CHANGE (so it's clearly its own thing):**
- **Look:** ORYZO is dark (brown-black, cork orange, cream, green) with a heavy bold grotesk. aviva should be mostly light (paper white, graphite, one ink-blue accent is a good start) with a different typeface. The visual-designer makes the final call.
- **No ORYZO signature elements:** see the list at the end of `reference/VIDEO_NOTES.md` (no cutting-mat desk, six-fingered hand, rainbow AI glow, wrapper tearing, "it's wearable" photos, magazine cover, thermal camera, "more circular", flip encryption, cork macro, their reviewer characters, their claim cards, red glow, particles ending, "if we can sell a coaster…" line).
- **Paper-only interactions:** it bends, curls, folds, flies, crumples, tears, and you can write on it.
- **At least 2 new sections** ORYZO doesn't have, at least 1 of theirs dropped or merged, and our own signature transition.
- Every joke, headline, metric, character and illustration is new.

**Section by section.** These are starting ideas; the creative team should beat them, not just use them.

| # | ORYZO moment (frames) | Technique to keep | aviva starting idea |
|---|---|---|---|
| 1 | Loader: the coaster drawn as a line ring (01) | a line drawing that becomes the 3D object | the A4 outline drawn like a blueprint with 210 × 297 mm dimension lines, which fills in and becomes the real sheet |
| 2 | Hero: desk from above, huge logotype (02–03) | giant logotype + product reveal + small side copy | no desk: one sheet drifting down through an endless white studio and landing softly; "aviva" embossed into the paper |
| 3 | "Isn't just a coaster": 3D rotation (04) | scroll-driven rotation with text on either side | the sheet turns edge-on and almost disappears: "0.1 mm. Our thinnest product ever." |
| 4 | "Powered by AI": hand + rainbow glow (05–10) | the big AI-hype moment | the cursor becomes a pencil and visitors write on the sheet: the intelligence is supplied by the user |
| 5 | "It's wearable": product through giant type + photo gallery (11–24) | huge type the product moves through + a horizontal gallery | "So foldable, it flies": the sheet folds into a paper plane that flies through the giant type; a gallery of origami forms (crane, boat, hat, fan) rendered by us in 3D |
| 6 | Magazine-cover transition (25) | one signature transition where the UI breaks its own rules | the sheet zooms until it fills the screen and becomes the page itself: the rest of the site is "printed on aviva" |
| 7 | Desk with coffee cup (26–27) | product in context | drop or merge |
| 8 | Thermal-camera view (28–29) | an alternate "scientific vision" of the product | ink-absorption microscope: blue ink spreading through the fibres |
| 9 | "More circular" + sketches (30–34) | a precision claim with diagrams | "Fold it in half. Still the same shape.": A4 → A5 → A6 with the √2 ratio drawn as dimension lines |
| 10 | Flip encryption (35–40) | an interactive gimmick | fold-to-encrypt: type a message and the sheet folds it into an envelope; unfold to decrypt |
| 11 | Material macro + spec card (41–45) | extreme macro + one spec card | macro of the fibres and the razor edge: an absurd "paper-cut" safety spec |
| 12 | Sustainability: giant word + info cards (46–53) | giant word + 3 info cards | trees, recycling, "power draw: 0 W" (the researcher checks the real numbers) |
| 13 | Testimonials around the floating product (54–58) | floating product + review cards | new fictional characters: a printer, a cat that sat on it, an origami master, a shredder, a novelist afraid of blank pages |
| 14 | Claim gallery (59–77) | horizontal scroll of big claim cards | "Context window: 210 × 297 mm", "Zero hallucinations", "Offline since 105 AD", "No battery. No updates.", "Unlimited undo (pencil only)" |
| 15 | Tier picker + comparison (78–82) | tier toggle + a stack + comparison table | aviva / aviva Notebook Pro / aviva Ream Pro Max (500 sheets); the stack grows; no red glow |
| 16 | Academic section (83) | academic parody with BibTeX | "aviva-1: a paper about paper"; the "model weights" are a blank A4 PDF; our repo ships a 4-vertex .obj |
| 17 | Ending CTA (84) | final call-to-action + footer | the sheet crumples into a ball and drops into a bin (or flies off as a plane); our own closing line; footer disclaimer |

Footer disclaimer: "aviva is a fictional parody project, inspired by ORYZO by Lusion. Not affiliated with Lusion. Nothing is for sale."

## Technique notes
- Lusion explain how they made ORYZO in their "Oryzo BTS" blog series at https://blog.lusion.co. Read every published part you can reach, especially the WebGL / Three.js ones.
- They used Houdini renders, photography and Gaussian splatting for the photoreal scenes. We do it in real time: Three.js with a high-resolution deformable sheet, custom shaders for bending, curling and folding, procedural paper fibres, light shining softly through the paper, soft shadows, and GSAP ScrollTrigger + Lenis for the scroll, all self-hosted in `docs/vendor/`. The paper must look real and beautiful; it's the hero of the whole site.
- Where ORYZO uses lifestyle photography, we use our own real-time 3D renders and illustrations instead.
- Their website code is not open source (the GitHub repo only has their coaster models and paper, under MIT). Study how the site looks and behaves; never copy its code, images, videos or text.

## How to work
1. First save this whole message to `work/00-mission.md`, create `work/PROGRESS.md`, and start Phase 0.
2. Run the phases in your instructions, in order. Give every piece of specialist work to the right agent; you plan, brief, judge and decide.
3. Take as long as this needs. There is no deadline and I'm not watching. Depth beats speed: do every research step and every review round, and send work back whenever it's below the bar. Don't stop early, and don't ask me questions: make the most reasonable call, write it in `work/decisions.md`, and keep going.
4. Keep `work/PROGRESS.md` up to date, and commit and push after every step, so nothing is lost if this cloud VM is reset.
5. Never force-push or rewrite history. Never put anything from `reference/` into `docs/`.
6. When you're done, tell me: the pull-request link, the exact steps to merge it and turn on GitHub Pages, the concept in three sentences, what we kept from ORYZO and what we changed, the final review scores, and what you'd improve with more time.

Begin with Phase 0.
