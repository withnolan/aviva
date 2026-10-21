# Part 2 of the AI-flip / lineup / capitals / folded-letter-hero edits (decisions #27–#31). Same format as p1.py.
R = []
B = []

# ---------- Part 3.4 s03 ----------
B.append(("### 3.4 `s03-intelligence`", "### 3.5 `s04-outputs`", '''### 3.4 `s03-intelligence`

| id | Copy | Notes |
|---|---|---|
| `s03.eyebrow` | AVIVA INTELLIGENCE | the AI's name, as an eyebrow *above* the headline, never a tag under it (#27) |
| `s03.h2` | Intelligence, built in. | centred, above the sheet. A sincere "Powered by AI"-style claim in our own words: no asterisk, no footnote (#26) |
| `s03.body` | AVIVA Intelligence learns from every stroke you make, remembers every one of them, and answers in your own handwriting. | 19 words. True of paper: it keeps every mark, and its "answer" is what you wrote |
| `s03.body.m` | It learns from every stroke, remembers every one, and answers in your handwriting. | |
| `s03.cta` | Pick up the pencil. | under the body |
| `s03.hint.pointer` | DRAW ON THE SHEET | appears beside the sheet when a fine pointer hovers it |
| `s03.pencil.tip` | HB. Graphite, not lead. | tooltip on the pencil cursor, first hover only (R§13.8 med-high). The pencil's barrel carries the stamp "AVIVA HB" (decision #30) |
| `s03.note` | Pencil mostly sits on the fibres, so it mostly erases. Ink soaks in, so it doesn't. | small, under the buttons (R§13.8 high, "largely" true; it sets up s07 and the s11 "Persistent memory." card) |

**Status line** `s03.status.*`: one line under the sheet, `aria-live="polite"`. It shows one message at a time, in this order:

| id | Copy | Trigger |
|---|---|---|
| `s03.status.ready` | AVIVA Intelligence is ready. It has been in development for about 2,200 years. | on entering s03 (R§2: oldest paper 179–141 BCE, high; "about 2,200 years" derived) |
| `s03.status.receiving` | Learning from you. | while strokes are being drawn |
| `s03.status.memory` | Memory updated. | **new:** 0.4 s after a stroke ends, shown for 1 s. It parodies the AI-memory notice, and it's true of paper: the mark stays |
| `s03.status.thinking` | AVIVA is thinking. | 1.2 s after the last stroke, with the corner curl |
| `s03.status.thought` | AVIVA has thought about it. | +1.4 s |
| `s03.status.answer` | Answer: see above. | +1.0 s. The punchline, kept as the blank-joke contrast (decision #27). It stays until something new happens |
| `s03.status.waiting` | AVIVA is waiting. It is very good at that. | the pencil hovers still over the sheet for 4 s with nothing drawn yet |
| `s03.status.erase` | Erased. AVIVA still remembers, mostly. | after erasing (R§13.8 med: the pressure impression usually remains) |
| `s03.status.regen.1` | Regenerating. | on Regenerate |
| `s03.status.regen.2` | Done. Same answer. | once the fresh sheet has landed |
| `s03.status.none` | No prompt yet. The model is ready when you are. | empty state: the visitor leaves s03 without drawing |

**Controls**

| id | Visible label | aria-label / notes |
|---|---|---|
| `s03.btn.erase` | ERASE | toggle (`aria-pressed`). Its helper text `s03.btn.erase.help`: "Turn the pencil round." aria: "Eraser. Turn the pencil round to erase pencil marks." |
| `s03.btn.regen` | REGENERATE | "Regenerate: crumple this sheet and start again with a fresh one." It also triggers `ream.status` |
| `s03.kb.label` | Type a line | keyboard and no-fine-pointer alternative; a visible `<label>` for the input |
| `s03.kb.placeholder` | Ask AVIVA anything | |
| `s03.kb.submit` | WRITE IT | "Write it: the pencil writes a line of quick handwriting on the sheet." The stroke is **pre-baked** and never renders the typed text (avoids #36) |
| `s03.kb.echo` | You asked: "{text}" | DOM only, shown above the status line. Sanitised; max 80 characters, then "…" |
| `s03.kb.sr` | The pencil wrote a line of quick handwriting on the sheet. | visually hidden, announced after the stroke |
| `s03.touch.draw` | DRAW | touch toggle: "Start drawing. Scrolling pauses while you draw." |
| `s03.touch.done` | DONE | "Stop drawing and continue scrolling." |
| `s03.touch.hint` | Tap Draw, then write with your finger. | shown on touch devices instead of `s03.hint.pointer` |
| `s03.fallback` | In 3D, you would write on the sheet here, and AVIVA would learn it by heart. | the no-WebGL static page |

Reduced motion: no corner curl; Regenerate swaps the sheet with a 300 ms fade instead of the crumple and roll; drawing still works, and "Memory updated." still shows.

'''))

# ---------- s05 distillation ----------
R.append(("| `s05.g.body` | Distillation trains a small model to keep what a large one knows. Tear aviva in half: two smaller models, the same shape, the same knowledge. None. | 26 words (FC row 32: distillation aims to keep, it doesn't promise no loss) |",
          "| `s05.g.body` | Distillation trains a small model to keep what a large one knows. Tear AVIVA in half: two smaller models, the same shape, every capability intact. Even the paper cut. | 29 words (FC row 32; decision #27: capabilities, not \"none\") |"))

# ---------- Part 3.12 s11 + 3.13 s12 ----------
B.append(("### 3.12 `s11-claims` (white; horizontal pin)", "### 3.14 `s13-paper`", '''### 3.12 `s11-claims` (white; horizontal pin)

| id | Copy | Notes |
|---|---|---|
| `s11.eyebrow` | CLAIMS | top-left, above the row |
| `s11.sub` | Measured, not marketed. | small, beside the eyebrow |

**Cards:** 9 of them, alternating portrait and landscape A-series proportions (P L P L P L P L P; Part 5.6). Each card has: headline `.h` (large), caption `.cap`, a metadata row `.meta` (small uppercase) and the render's alt text `.alt`. The cards are numbered in visual order; the old → new number map is in Part 10.

| # | `.h` | `.cap` | `.meta` | `.alt` | Source |
|---|---|---|---|---|---|
| c1 | Context window: 210 × 297 mm. | Edge to edge. Nothing falls off the end. | 62,370 mm² · NO TRUNCATION | The sheet face-on, with dimension lines reading 210 and 297 millimetres. | R§1.1 high · R§13.2 derived |
| c2 | Multimodal. | Accepts pencil, ink, folds and tears. Also the occasional shopping list. | MODALITIES: PENCIL · INK · FOLD · TEAR | A yellow HB pencil stamped AVIVA HB lying across the sheet, beside a pencil scribble, an ink dot, a fold crease and a torn corner. | (observable; no fact) |
| c3 | Persistent memory. | It keeps every mark you make. Erase one, and its impression usually stays. Ink is forever. | CLEAR HISTORY: NOT AVAILABLE · SEE ALSO: THE DOT | The sheet under raking light: a small ink-blue dot and the faint impression of erased pencil writing. | R§13.8 high (ink) / med (impression) |
| c4 | Zero hallucinations. | Everything on it was put there by you. | HALLUCINATION RATE 0.00 % · SOURCE: YOU | Soft raking light across blank white paper fibres. | (true of a sheet; no fact) |
| c5 | Agentic. | Folded into a plane, it carries your task across the room by itself. Launch is manual. | LONGEST TIME ALOFT, PAPER AIRCRAFT: 31.2 s (GUINNESS, 2026) | The sheet folded into a paper plane, gliding, lit from the side. | R§3.2 high · R§13.5 |
| c6 | Refusal rate: 0.0 %. | It cannot refuse. Whatever you write on it, it keeps. | REQUESTS DECLINED SINCE 179 BCE: 0 | A sheet with one line of pencil handwriting across it. | R§2 high (date) · line borrowed from C |
| c7 | Alignment: left, centre, right or justified. | Solved. | FOUR SETTINGS · ALL SAFE | The sheet with four short grey text blocks, set left, centred, right and justified. | line borrowed from C |
| c8 | Known side effect. | Its edge is microscopically jagged, so it saws rather than slices. Fingertips are packed with nerves, and the cut is usually too shallow to clot. | SEVERITY: MINOR · PAIN: DISPROPORTIONATE | An extreme close-up of the sheet's edge, showing fine ragged fibres. | R§3.4 · R§13.10 #17 (nerves: Ohio State; edge and clotting: Big Think) |
| c8.m | | Its jagged edge saws rather than slices, and the cut is usually too shallow to clot. | | | |
| c9 | Our roadmap reaches the Moon. Our sheet reaches 6.4 mm. | Ideally, 42 folds would make a 0.1 mm sheet about 440,000 km thick, past the Moon. By Gallivan's formula, an A4 sheet folded the same way each time stops at six. | STATE OF THE ART: 12 FOLDS · B. GALLIVAN, 2002 | A slender bar of paper, an A4 sheet folded six times the same way, with a tiny grey Moon far behind it. | R§13.2 · R§13.10 #1 (one direction only; alternating allows seven) · R§3.1 high · line borrowed from B |
| c9.m | | In theory, 42 folds pass the Moon. Folded the same way each time, an A4 sheet stops at six. | | | |

Dropped: the old c4 "Needle in a haystack: 100 %." (it lives on in the paper, §5.3), and the old c6 "Unlimited undo." (merged into c3, which keeps the dot).

Reduced motion: the horizontal translation stays (it's scroll-driven), with no hover tilt.

### 3.13 `s12-sizes` (the lineup; the id stays)

| id | Copy | Notes |
|---|---|---|
| `s12.eyebrow` | THE LINEUP | |
| `s12.h2` | More sheets. More context. | |
| `s12.body` | Every AVIVA has the same intelligence per sheet. The Pro models simply have more sheets. | 15 words |

**The print dialog** (the tier picker, a DOM panel on the left). Hairline rectangular controls: no pills, nothing glows, no red (decision #28).

| id | Label | Value / behaviour |
|---|---|---|
| `s12.dlg.title` | Print | dialog title |
| `s12.dlg.model` | Model | **new:** radio group, `aria-label="Model"`: **AVIVA · AVIVA Notebook Pro · AVIVA Ream Pro Max** (default AVIVA). Arrow keys move between options. Each option carries a tiny icon: one sheet, a bound block, a tall stack |
| `s12.dlg.size` | Paper size | now fixed: "A4". New note `s12.dlg.size.n`: "A5 and A3 too: see the table." |
| `s12.dlg.orient` | Orientation | "Portrait" (fixed). Note `s12.dlg.orient.n`: "Landscape is the same sheet, turned." |
| `s12.dlg.copies` | Copies | follows the model: "1" / "80" / "500" |
| `s12.dlg.pages` | Pages | follows the model: "1 of 1 (blank)" / "80 of 80 (blank)" / "500 of 500 (blank)" |
| `s12.dlg.print` | PRINT | disabled (`aria-disabled="true"`). Description / tooltip `s12.dlg.print.tip`: "Nothing to print. Nothing is for sale." |
| `s12.sr.change` | {model} selected: {n} sheets. | visually hidden, announced on change |

**Tier text** (under the dialog; it changes with the selection)

| id | Name | Description | Spec line | Source |
|---|---|---|---|---|
| `s12.t.base` | AVIVA | The original. One sheet, one 210 × 297 mm context window, every capability on this page. | 1 SHEET · 4.99 g | R§1.1 high · R§13.1 |
| `s12.t.pro` | AVIVA Notebook Pro | For professionals. 80 sheets, bound in order: 4.99 m² of context, and a memory that keeps your pages in sequence. | 80 SHEETS · ≈ 399 g | derived (80 × 62,370 mm²; 80 × 4.99 g). The sheet count is our fictional spec |
| `s12.t.max` | AVIVA Ream Pro Max | For the enterprise. 500 sheets, 31.2 m² of context and about 2.5 kg of capability. "Ream" comes from the Arabic rizma, a bundle. | 500 SHEETS · ≈ 2.5 kg | R§1.2 high (ream, rizma) · R§13.2 (2.5 kg) · derived (31.2 m²) |

The old ids `s12.t.a5`, `s12.t.a4` and `s12.t.a3` are removed.

**Comparison table** `s12.tbl`. Caption (visually hidden): "AVIVA, AVIVA Notebook Pro and AVIVA Ream Pro Max compared."

| Row label | AVIVA | AVIVA Notebook Pro | AVIVA Ream Pro Max | Source |
|---|---|---|---|---|
| Sheets | 1 | 80 | 500 | our spec · R§1.2 (a ream is 500) |
| Sizes | A5 · A4 · A3 | A5 · A4 · A3 | A5 · A4 · A3 | R§13.1 high |
| Context window (A4) | 62,370 mm² | 4.99 m² | 31.2 m² | derived |
| Weight (A4, calculated) | 4.99 g | ≈ 399 g | ≈ 2.5 kg | R§13.1 · R§13.2 (derived) |
| Thickness | 0.1 mm | ≈ 8 mm | ≈ 5 cm | R§1.3 · R§13.2 (derived) |
| Aspect ratio | 1 : √2 | 1 : √2 | 1 : √2 | R§13.1 high |
| Modalities | pencil · ink · fold · tear | pencil · ink · fold · tear | pencil · ink · fold · tear | |
| Memory | every mark | every mark, in order | every mark, on all 500 sheets | |
| Regenerations included | 0 | 79 | 499 | follows the ream counter (R§1.2) |
| Hallucinations | 0 | 0 | 0 | |
| Fits a C5 envelope (A4) | folded once | no | no | R§1.1 high · R§13.10 #8 |

| id | Copy |
|---|---|
| `s12.tbl.foot` | Sizes: ISO 216. Context, weight and thickness calculated for A4 sheets at 80 g/m², paper only, not weighed. Notebook binding not included. |

Mobile: the dialog stacks above the sheet, and the table becomes a horizontally swipeable three-column table with the row labels fixed. Reduced motion: the stack cross-fades between counts, with no fan-in.

'''))

# ---------- s13 rows ----------
R.append(("| `s13.title` | Void of All Characters: Pre-training a Foundation Model on Nothing | |",
          "| `s13.title` | AVIVA A4: A Multimodal Foundation Model at 80 g/m² | decision #27 |"))
R.append(("| `s13.btn.paper` | PAPER · PDF, 8 PAGES | → `research/void-of-all-characters.pdf` |",
          "| `s13.btn.paper` | PAPER · PDF, 8 PAGES | → `research/aviva-a4.pdf` (renamed, decision #29) |"))
R.append(("| `s13.abstract` | We present aviva A4, a 210 × 297 mm foundation model pre-trained on no data. It achieves a hallucination rate of 0.00 % on every prompt we tried, and every prompt we didn't. Distilled variants keep their shape exactly. | 40 words; the column is ≈ 720 px wide so it sets in 4 lines |",
          "| `s13.abstract` | We present AVIVA A4, a multimodal foundation model with a 210 × 297 mm context window and persistent memory. It accepts pencil, ink, folds and tears, refuses nothing, and distils into smaller models without changing shape. | 36 words; the column is ≈ 720 px wide so it sets in 4 lines |"))

# ---------- Part 3.15 s14 ----------
B.append(("### 3.15 `s14-release` (the ending)", "### 3.16 `s15-footer`", '''### 3.15 `s14-release` (the ending)

| id | Copy | Notes |
|---|---|---|
| `s14.a.sr` | The sheet comes back folded into the letter A, then opens. | **new:** visually hidden, announced as the A lands (the hero echo, decision #31) |
| `s14.h2.l1` | Pre-trained on trees. | above the sheet, once it has opened (R§1.7 med · R§2) |
| `s14.h2.l2.drawn` | Fine-tuned on you. | **variant A**: the visitor drew or wrote something in s03 (or here). Kept from the original (decision #27) |
| `s14.sub.drawn` | Your drawing is now part of the model. | variant A |
| `s14.h2.l2.empty` | Ready to be fine-tuned on you. | **variant B**: nothing was ever drawn. It replaces "Still nothing. We respect that." |
| `s14.sub.empty` | It learns from the first thing you draw. | variant B. If the visitor draws now, the line switches live to variant A |
| `s14.hint.pointer` | ADD SOMETHING BEFORE IT GOES | beside the sheet; the pencil cursor is back |
| `s14.kb.label` | Type a line | keyboard alternative (same pre-baked-stroke rule as s03) |
| `s14.kb.placeholder` | One last line | |
| `s14.kb.submit` | WRITE IT | |
| `s14.touch.draw` / `s14.touch.done` | DRAW / DONE | same behaviour as s03 |
| `s14.btn.release` | RELEASE IT | aria: "Release it: fold the sheet into a paper plane and let it fly." Enter or Space activates. If the visitor just scrolls, the release is scroll-scrubbed from 1.8 vh |
| `s14.released` | AVIVA A4 has been released. | status, after the plane leaves the frame |
| `s14.credit` | AVIVA was designed and built by withnolan. | centred where the sheet was (decision #21: the handle stays lowercase) |
| `s14.btn.gh` | GITHUB.COM/WITHNOLAN | → https://github.com/withnolan · aria: "withnolan on GitHub (opens in a new tab)" · `target="_blank" rel="noopener"` |
| `s14.fallback` | In 3D, the sheet would fold into a plane here and leave. It has. | no-WebGL page, over the plane still |

Reduced motion: the A is shown for 0.6 s and then cross-fades to the open sheet (300 ms). The plane fold shows as three static steps (300 ms cross-fades), and the plane fades out in place instead of flying.

'''))

# ---------- s15 rows ----------
R.append(("| `s15.colophon` | Colophon: set in one typeface, rendered in real time, printed on nothing. | |",
          "| `s15.colophon` | Colophon: set in one typeface, rendered in real time, best printed on AVIVA A4. | it points, deadpan, at the print delight (Part 6 #1) |"))
R.append(("| `s15.link.paper` | Research paper (PDF) | → `research/void-of-all-characters.pdf` |",
          "| `s15.link.paper` | Research paper (PDF) | → `research/aviva-a4.pdf` (decision #29) |"))
R.append(("| `s15.link.source` | Source on GitHub | → https://github.com/RelentlessYunn/aviva |",
          "| `s15.link.source` | Source on GitHub | → https://github.com/withnolan/aviva (decision #21) |"))
R.append(("| `s15.copyright` | © 2026 RelentlessYunn. | |", "| `s15.copyright` | © 2026 withnolan. | decision #21 |"))

# ---------- Part 3.17–3.20 ----------
R.append(('| Floor wordmark, giant "4.99 g" numerals | `aria-hidden` | text equivalents: the h1, plus the visually hidden "4.99 grams" `<h2>` |',
          '| Hero letters and the "4", giant "4.99 g" numerals | `aria-hidden` | text equivalents: `s01.letters.sr`, the h1, and the visually hidden "4.99 grams" `<h2>` |'))
R.append(("| Claim-card renders c1–c8 | `s11.cN.alt` | `<img alt>` |", "| Claim-card renders c1–c9 | `s11.cN.alt` | `<img alt>` |"))
R.append(('| Paper size | `role="radiogroup"` "Paper size" | three radios; `s12.sr.change` |',
          '| Model (s12) | `role="radiogroup"` "Model" | three radios; `s12.sr.change` |'))
R.append(('**F1** "A single white A4 sheet lying over the giant word aviva, the letter i faintly visible through it."',
          '**F1** "Five folded white sheets standing in a white studio, spelling AVIVA, with a 4 beside the last A."'))
R.append(('**F5** "Three blank sheets of the same shape, at sizes A5, A4 and A3."',
          '**F5** "The lineup: one sheet, an 80-sheet bound notebook and a 500-sheet ream."'))
R.append(("Vote and size: buttons and a radio group.", "Vote and model: buttons and a radio group."))
R.append(("the passive size preview", "the passive lineup preview"))
R.append(("the size picker still work", "the model picker still work"))
R.append(("the leaf fall in s01 and s04 (the sheet simply appears where it lands)",
          "the letters' unfold in s01 (a cross-fade) and the leaf fall in s04 (the sheet simply appears where it lands)"))

# ---------- Part 4: the research paper ----------
R.append(("- `docs/research/void-of-all-characters.pdf`: 8 pages, A4 portrait, typeset by the visual-designer.",
          "- `docs/research/aviva-a4.pdf`: 8 pages, A4 portrait, typeset by the visual-designer (renamed from `void-of-all-characters.pdf`, decision #29)."))
R.append(('a running header "aviva Research · Void of All Characters".', 'a running header "AVIVA Research · AVIVA A4".'))

B.append(("### 4.2 Front matter (page 1)", "### 4.3 Body text (key paragraphs, final wording)", '''### 4.2 Front matter (page 1)

- **Title:** AVIVA A4: A Multimodal Foundation Model at 80 g/m²
- **Running header:** AVIVA Research · AVIVA A4
- **Authors:** Ada Margin¹, Gus Gutter¹, Lena Leading¹, Bea Bleed¹ *(fictional; named after typography terms)*
- **Affiliation:** ¹AVIVA Research, third floor (near the printer)
- **Date line:** Technical report AV-A4-001 · 2026 · 8 pages
- **Correspondence:** "Please write to us. On anything. We'll keep it."
- **Keywords:** foundation models · multimodal · persistent memory · distillation · ISO 216 · paper

**Abstract (full text).**
> We present AVIVA A4, a multimodal foundation model with a context window of 210 × 297 mm. Locke described the mind before experience as "white paper, void of all characters"; we show that the paper itself has since been pre-trained, on wood fibre, over more than two thousand years of papermaking. AVIVA A4 accepts four input modalities (pencil, ink, folds and tears), keeps a persistent memory of every input, refuses nothing (0.0 %) and hallucinates nothing (0.00 %). Its architecture, standardised as ISO 216, is closed under halving: distilled variants (AVIVA A5, A6) keep their shape and every capability. We report results on memory, preference, distillation and scaling, find a hard scaling limit at six folds made the same way each time, and estimate an environmental cost of about its own weight. All outputs are released for universal free distribution.

(R§13.6 · R§1.7 med · R§2 high · R§13.1 · R§13.2 · R§13.4)

**Figure 1 (teaser).** Two A4 rectangles side by side at true 1 : √2, drawn in 0.5 pt graphite with a faint drop shadow. The left is labelled "AVIVA A4" and the right "Output". The two are identical. (The blank output is kept as contrast, decision #27.)
*Caption:* "Figure 1. AVIVA A4 (left) and a typical output (right), shown at the same scale."

'''))

B.append(("**1 Introduction.**", "**2 Related work.**", '''**1 Introduction.**
> Every product now has AI. We asked whether a sheet of paper could be left out, and found that it could not. In his *Essay Concerning Human Understanding* (1689/1690), Locke proposed that the mind begins as "white paper, void of all characters", and that everything on it arrives later, from experience [Locke]. More than three centuries later, the white paper has caught up. AVIVA A4 is a sheet of white A4 paper, 80 g/m², about 0.1 mm thick. It is pre-trained on wood fibre, accepts input in four modalities, and remembers everything written on it.
>
> Our contributions are: (i) a foundation model whose pre-training corpus is a tree; (ii) an architecture that is invariant under halving; (iii) the first blind preference study in which the model wins every time it is compared with itself; (iv) a scaling law with an exponential curve and a wall.

(R§13.6 high · R§1.1 high · R§1.2 high · R§1.3 med · R§1.7 med · "more than three centuries" derived: 1689/1690 → 2026)

'''))

R.append(("the result is in the collection of SFMOMA [Rauschenberg]. Our approach is more efficient: aviva ships pre-erased.",
          "the result is in the collection of SFMOMA [Rauschenberg]. In AVIVA, erasure is never complete: the impression of the writing usually remains [Hawkeye Forensic]. We call this persistent memory."))
R.append(("(R§5.3 high · R§13.7 · R§2 high/med)", "(R§5.3 high · R§13.7 · R§13.8 med · R§2 high/med)"))

B.append(("**4 Pre-training.**", "**5 Evaluation.**", '''**4 Pre-training.**
> AVIVA A4 was pre-trained on wood fibre (Table 2), drawing on more than two thousand years of papermaking, from the earliest known paper at Fangmatan to the standard described in §3. The fibres required no supervision: as a sheet dries, hydrogen bonds between neighbouring cellulose fibres hold it together unprompted. Fillers and sizing, added at the mill, are the only post-training.

(R§1.7 med · R§2 high · R§13.10 #11, #13)

**Table 2. Pre-training**

| Property | Value |
|---|---|
| Pre-training corpus | wood fibre (cellulose) |
| Training period | more than 2,000 years (from 179–141 BCE) |
| Architecture fixed | 1922 (DIN 476); international since 1975 (ISO 216) |
| Post-training | fillers and sizing, at the mill |
| Tokens | not applicable; the model is measured in millimetres |
| Data contamination | limited to what users write on it |

'''))

R.append(("> *5.1 Hallucination.* We define a hallucination as an output containing a false statement. Over all prompts, aviva A4 produced no outputs and therefore no false statements: a hallucination rate of 0.00 % (n = 0). Anything the reader sees in the fibres is their own.",
          "> *5.1 Hallucination.* We define a hallucination as an output containing a false statement. Every mark on a used AVIVA A4 was made by its user; the model adds nothing it was not given. The hallucination rate is therefore 0.00 %. Anything the reader sees in the fibres is their own."))
R.append(("Each student is the same shape as the teacher and retains all of its knowledge (Table 3).",
          "Each student is the same shape as the teacher and retains every capability, including the paper cut (Table 3)."))
R.append(("| Model | Pieces | Shape | Knowledge retained | Mass each (calculated) |",
          "| Model | Pieces | Shape | Capabilities retained | Mass each (calculated) |"))
R.append(("> aviva A4 knows nothing. It cannot forget a fold.", "> AVIVA A4 knows only what has been written on it. It cannot forget a fold."))
R.append(("> We started with a blank sheet of paper. We stopped there.", "> We started with a blank sheet of paper. Like everything else, it now has AI."))
R.append(("| Training tokens | 0 |", "| Pre-training corpus | wood fibre |\n| Memory | persistent, including erasures |"))

B.append(("### 4.6 `docs/research/citation.bib`", "### 4.7 `docs/research/aviva-a4.obj`", '''### 4.6 `docs/research/citation.bib`

```bibtex
@inproceedings{margin2026aviva,
  title     = {{AVIVA} A4: A Multimodal Foundation Model at 80 g/m^2},
  author    = {Margin, Ada and Gutter, Gus and Leading, Lena and Bleed, Bea},
  booktitle = {Proceedings of the First Workshop on Things That Were Already Finished},
  year      = {2026},
  pages     = {1--8},
  publisher = {{AVIVA} Research},
  address   = {Third floor, near the printer},
  note      = {{AVIVA} A4: 210 x 297 mm, 80 g/m^2. Pre-trained on wood fibre; fine-tuned by its users.}
}
```
It's an `@inproceedings`, not `@misc`; it has no `howpublished`, and there is no "code: coming soon" (#49). The key `margin2026aviva` stays lowercase (decision #30), and the `{AVIVA}` braces keep the capitals in any bibliography style.

'''))

# ---------- Part 5 ----------
B.append(("### 5.2 Hero and the show-through (enrichment 5): how to fake it in the shader", "### 5.3 The Bleed, frame by frame (s07, 2.2 → 4.5 vh)", '''### 5.2 Hero: AVIVA, folded (decision #31)
- **Composition (the first frame after the loader).** Five A4 sheets stand on the white studio floor. Each is folded in half across its long side into a letter, seen end-on, and together they read **AVIVA**. A graphite **"4"** after the last A completes the model name, AVIVA A4. The camera is at letter height, pitched about −6°. The word spans about 78 % of the width, centred on the I, with a cap height of ≈ 27 % of the viewport height (141 mm at true scale). The h1 sits above the word; the side copy and spec line sit below.
- **The letters.** All are made from the same fold: two 210 × 148.5 mm panels.
  - **A** = a mountain fold, crease on top, the panels 18° from vertical (apex 36°). The crossbar is read from a faint horizontal pre-crease across both panels at 42 % of the leg height, which catches the key as a thin shadow line. Perspective shows the outer A's panel faces, so the crease reads there. If it doesn't read at 390 px, that's acceptable: a barless A still reads as A in this word.
  - **V** = the same fold as a valley, crease on the floor.
  - **I** = the same fold closed flat, standing upright, seen **exactly edge-on** because it sits on the camera's centre line. It is a hairline (two layers, rendered ≥ 1.2 px, with a bright edge): the thinnest letter, setting up the 0.1 mm beat. It stands 5 % taller than the A's and V's (148.5 vs 141 mm). Keep that: the hairline reads lighter.
  - **"4"** = the only non-paper element: a numeral in the site typeface, matte graphite, a thin upright plane with its own soft contact shadow.
- **Light.** A warm key from the top left at a raking 60°, a cool fill from the right, and soft, light contact shadows (decision #12b). The tent interiors read slightly darker than their outsides, which is what makes the folds legible. No glow, no rim effects.
- **The unfold and merge (the first scroll).** The beats are in 2B and Part 10.3. Visually, the "4" goes first. Then the letters turn to face us, one pair at a time from the outside in, open flat, and slide into the centre, where they stack and vanish behind the I-sheet. It must read as **paper opening**, not morphing: every sheet keeps its edges and its crease at all times.
- **The memory of the fold.** The merged sheet keeps a faint horizontal crease at mid-height. s05 later tears along it, and s14 folds the A back along it.
- **Show-through** (the previous hero): `showThrough` stays in the paper module, unused in the hero (decision #31). The flat AVIVA wordmark remains the logo (5.9).
- **Check at 1440 × 900 and 390 × 844:** the word reads AVIVA in under a second, the "4" makes "A4", and the I is a crisp hairline, never a grey smear.

'''))

B.append(("- **The renders:**", "### 5.7 Illustration style: graphite, not sketchbook", '''- **The renders.** There are 9 cards, in visual order. "Reuse" means the existing render from the previous card list.

| Card | Render |
|---|---|
| c1 | (reuse old c1) the sheet face-on, flat, even light, with fine dimension lines (210 / 297 mm) in the image |
| c2 | **new:** the yellow HB pencil (stamped "AVIVA HB", decision #30) lying across the sheet, beside a short pencil scribble, a small ink dot, a soft fold crease and one torn corner: four modalities on one sheet, warm side light |
| c3 | **new:** the sheet under raking light, with a 3 mm ink-blue dot and the faint pressure impression of erased pencil handwriting (a ghost you only see at a grazing angle) |
| c4 | (reuse old c2) a fibre macro under raking light (as in s07 at 2.2 vh) |
| c5 | **new:** the sheet folded as a dart plane, caught mid-glide against the studio white, side-lit, with a soft shadow on the floor far below |
| c6 | (reuse old c3) the sheet at a slight angle with one line of quick pencil handwriting (the same pre-baked stroke as the keyboard path), warm light |
| c7 | (reuse old c5) the sheet with four short grey text blocks reading "We have solved alignment.", set left, centred, right and justified (real words, no lorem ipsum) |
| c8 | (reuse old c7) an edge macro: ragged fibres along the edge under grazing light, against the one darker backdrop among the cards |
| c9 | (reuse old c8) the slender bar: an A4 sheet folded six times **the same way**, ≈ 210 × 4.6 mm and 6.4 mm thick, its 64 layers visible, lying on the white floor with a small grey Moon far behind, out of focus |

The old c4 render (the pencil on the sheet) and the old c6 render (the dot) are retired; the dot lives on in c3. **The 3D pencil** (the s03/s14 cursor and card c2) carries the stamp **AVIVA HB** in small capitals along its barrel (decision #30).

'''))

B.append(("### 5.9 Logo, wordmark, favicon, OG image", "### 5.10 Static fallback stills (no WebGL; loaded only then)", '''### 5.9 Logo, wordmark, favicon, OG image
- **Wordmark.** **AVIVA**, in capitals (decision #30), in the site typeface at a light or regular weight, slightly tracked out because capitals need air. The visual-designer may hand-tune the two A's and the two V's into a balanced custom drawing. The flat wordmark is the logo (nav, footer, OG image, PDF); the hero spells the name with folded sheets instead (5.2).
- **Logomark: four crop marks** marking out an empty 1 : √2 rectangle: the context window, ready for input. The lockup is the logomark to the left of the wordmark.
- **Favicon.** The crop-mark logomark as an SVG: graphite on transparent, switching to paper white under `prefers-color-scheme: dark`. Add a 32 × 32 PNG fallback and a 180 × 180 apple-touch icon (paper white with graphite marks).
- **OG image (1200 × 630, our own render).** The hero: the five folded letters spelling AVIVA, with the "4", standing in the white studio under a warm key from the top left. The crop-mark logomark sits small at the top left, and "AVIVA A4. Now with AI." in graphite at the bottom left. No other text, no faces, no props.

'''))

R.append(("| F1 | Hero: the sheet over the wordmark with show-through (desktop + a 1170 × 1800 mobile crop) | 2400 × 1500 | ≤ 140 KB each |",
          "| F1 | Hero: the five folded letters AVIVA and the 4 in the white studio (desktop + a 1170 × 1800 mobile crop) | 2400 × 1500 | ≤ 140 KB each |"))
R.append(("| F5 | Sizes: A5, A4 and A3 side by side, same shape | 1600 × 1000 | ≤ 80 KB |",
          "| F5 | The lineup: one sheet, the 80-sheet Notebook Pro and the 500-sheet Ream Pro Max | 1600 × 1000 | ≤ 80 KB |"))
R.append(("each paper-size option carries a tiny sheet icon drawn at its relative size.",
          "each model option carries a tiny icon: one sheet, a bound block, a tall stack."))

# ---------- Part 6 ----------
R.append(('it is the hero of claim card c6 ("Ink is forever." · SEE ALSO: THE DOT)',
          'it is the hero of claim card c3 ("Persistent memory." · SEE ALSO: THE DOT)'))

# ---------- Part 7 ----------
R.append(("The hero looks down at a bare floor printed with our wordmark.",
          "The hero shows five folded sheets standing in the studio, spelling the name (decision #31)."))
R.append(("| 20 | Vector-ring ↔ object match-cut as a recurring motif | The drawing → sheet match-cut happens **once** (s00). Mid-page dimension lines are overlays on the live sheet, never cuts. |",
          "| 20 | Vector-ring ↔ object match-cut as a recurring motif | The drawing → object match-cut happens **once** (s00), where the blueprint of the folded letters becomes the 3D letters. The letters → sheet change in s01 and the A that returns in s14 are physical folds of the product, not drawings or cuts (see 7b). Mid-page dimension lines are overlays on the live sheet. |"))
R.append(("| 21 | Giant wordmark top-left settling from large and translucent; tagline typed above it | The wordmark is printed on the floor in the 3D scene, centred, and seen *through* the sheet. The h1 is a sentence, centred at the top. Nothing is typed in. |",
          "| 21 | Giant wordmark top-left settling from large and translucent; tagline typed above it | There is no giant typeset wordmark in the hero: the brand is spelled by five folded sheets standing centre stage (decision #31). The h1 is a sentence, centred at the top. Nothing is typed in. |"))
R.append(('| 26 | Asterisk on "AI" redefined in a corner footnote; the finger-count quip | No asterisk. The AI beat is "Intelligence not included." The s04 line "Strictly speaking, we calculated them." is a precision note under the body, not a redefined term. |',
          '| 26 | Asterisk on "AI" redefined in a corner footnote; the finger-count quip | No asterisk and no redefinition. The AI beat is a sincere claim in our own words, "Intelligence, built in.", and "NOW WITH AI" is an eyebrow sticker. The payoff is the visitor\'s own handwriting ("Answer: see above."), not a finger joke. The s04 line "Strictly speaking, we calculated them." is a precision note, not a redefined term. |'))
R.append(('| 27 | Orange model-name tag tucked under the headline\'s end | The model name appears in eyebrows and side copy ("INTRODUCING aviva A4"), never as a tag under a headline. |',
          '| 27 | Orange model-name tag tucked under the headline\'s end | The model name appears in eyebrows and side copy ("INTRODUCING AVIVA A4 · NOW WITH AI"). s03\'s "AVIVA INTELLIGENCE" is an eyebrow *above* the headline. Nothing is tucked under a headline. |'))
R.append(('| 46 | "Choose you own" eyebrow over a giant wordmark passing in front of the product, shrinking into a header | s12 is "PAPER SIZE / One shape. Three sizes." with a print dialog. No giant wordmark in the tier section. We never say "choose your own". |',
          '| 46 | "Choose you own" eyebrow over a giant wordmark passing in front of the product, shrinking into a header | s12 is "THE LINEUP / More sheets. More context." inside a print dialog. There is no wordmark in the tier section, and nothing passes in front of the product. Our only letters are the hero\'s folded sheets, which *are* the product (see 7b). We never say "choose your own". |'))
R.append(('| 47 | ORYZO / Pro / Pro Max as three glowing pills; stack of 1/2/3; comparison with orange "New" and rounded rows | Sizes A5 / A4 / A3: **scale, not count**, so no stack. A rectangular radio group, a plainly ruled table, no "New" tag, no "Pro Max". Decision #10. |',
          '| 47 | ORYZO / Pro / Pro Max as three glowing pills; stack of 1/2/3; comparison with orange "New" and rounded rows | Decision #28 restores AVIVA / AVIVA Notebook Pro / AVIVA Ream Pro Max at the user\'s request, so the "Pro Max" suffix is now shared (an accepted medium risk). Everything else differs: a hairline rectangular radio group inside a print dialog (no pills, nothing glows, no red); counts of 1 / 80 / 500 dealt in sideways with a flutter, not 1 / 2 / 3 identical objects dropping in; a plainly ruled table with no "New" tag and no rounded rows. |'))
R.append(('| D10 | Decision #10: no exact "Pro Max", no three glowing pills; loader with dimension lines and crop marks only; no repeated drawing ↔ object match-cut | All four are met (see #19, #20, #47). |',
          '| D10 | Decision #10: no exact "Pro Max", no three glowing pills; loader with dimension lines and crop marks only; no repeated drawing ↔ object match-cut | Three are met (see #19, #20, #47). The "Pro Max" suffix is back at the user\'s request (decision #28 supersedes that part of #10). |'))
R.append(("Banned-word sweep of Part 3: none of the R§7.6 punchlines and none of our cliché list appear in the site copy.",
          '''Banned-word sweep of Part 3: none of the R§7.6 punchlines and none of our cliché list appear in the site copy.

### 7b. New lines from decisions #27–#31, checked against §8

| New line or element | Nearest ORYZO element | Why it's ours |
|---|---|---|
| "NOW WITH AI" (hero eyebrow); "AVIVA A4. Now with AI." (page title) | "Powered by AI*" (#26) | A sticker-style claim in an eyebrow and the page title. No asterisk, no footnote, no glow, no hand. "Powered by AI" is a shared launch trope (R§7), and our words differ. |
| "Intelligence, built in." (s03) | "Powered by AI*" + the model tag (#26, #27) | Different words, no footnote, and the eyebrow sits above the headline. The payoff is the visitor's own handwriting, not a finger joke. |
| "Memory updated." / "AVIVA still remembers, mostly." | none | An AI-memory parody; ORYZO has no memory gag. |
| "LOADING WEIGHTS" / "24.95 g LOADED" (loader) | the loader (#19) | Copy only, on our blueprint drawing. ORYZO's loader has no copy, and ours has no circles. |
| **The folded-letter hero:** five sheets spelling AVIVA unfold and merge into one sheet (decision #31) | the ring ↔ object match-cut and its logotype (#20); the giant wordmark beside or passing the product (#21, #29, #46) | The letters are the product itself, physically folded (mountain, valley, edge-on), and they become the product by unfolding: a mechanism only paper has. ORYZO's motif is a vector drawing cutting to an object, and its wordmark is type set beside or in front of the product. Our single drawing → object cut stays in the loader (#20). A watch item for the round-1 audit, as decision #31 asks. |
| The A that returns in s14, with the "4" | the ending (#17, #51) | A fold callback that opens to reveal the visitor's drawing. No confession, no pitch. |
| s11 "Multimodal.", "Persistent memory.", "Zero hallucinations.", "Agentic." | the claim gallery (#14) | None of ORYZO's five claims (edge, always on, RTX 3090, drop-tested, legacy support). |
| The lineup AVIVA / Notebook Pro / Ream Pro Max (decision #28) | #46, #47 | See #46 and #47 above. |
| The paper title "AVIVA A4: A Multimodal Foundation Model at 80 g/m²" | the academic block (#49, #50) | Our own title and paper: an 8-page `@inproceedings`, not a one-page PDF or an `@misc` OBJ release. |
| "Pre-trained on trees. Fine-tuned on you." | the closing line (#17) | No "if we can sell" construction. |
| "AVIVA A4, our most intelligent sheet yet" (meta description) | ORYZO's hero superlative in its glass panel (#22) | A different construction, and it lives only in the meta description, not in a hero panel. |'''))

# ---------- Part 8 / Part 9 notes ----------
R.append(("3. **Show-through is contact show-through.**", "3. **(Superseded by decision #31.) Show-through was contact show-through.**"))
R.append(("## Part 9. Changelog (fact-check pass, 2026-10-02)\n",
          "## Part 9. Changelog (fact-check pass, 2026-10-02)\n\n> Historical log, written before decisions #27–#31. The copy quoted here is kept exactly as it was then (lowercase brand, the old concept lines). The current copy is in Parts 1–8, and the later changes are in Part 10.\n"))
