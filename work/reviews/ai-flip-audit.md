# Audit: where aviva inverted ORYZO's core joke (2026-10-08)

**User's note:** the irony is that *everything* has AI now, so this sheet of paper has AI too. ORYZO's KEEP is a mundane object sold, completely seriously, as an AI product. Our brief instead built the concept on *absence* ("Intelligence not included", "Pre-trained on nothing"). This file lists every place that did this, plus other places where we drifted from the mission's KEEP, and what changing them costs.

## A. The "no AI" inversion (change: the sheet proudly HAS AI)
| Where | Now | Direction |
|---|---|---|
| Tagline + meta + OG + footer colophon | "Pre-trained on nothing." | A confident AI claim (e.g. "Our most intelligent sheet yet."; the creative-director writes the final line) |
| s03 AI beat | "Intelligence not included." / "no data, no knowledge, no opinions" / "Answer: see above." | "Powered by AI." as a sincere headline (our own wording; never ORYZO's asterisk / "Adobe Illustrator" gag). The pencil writing is the AI at work: it remembers, it learns, it answers with what you wrote |
| s00 loader | "LOADING NOTHING" / "NOTHING LOADED" | e.g. "LOADING MODEL" / "MODEL LOADED" (210 × 297 mm) |
| s04 outputs | blank outputs as "nothing" | Keep the visuals; reframe the captions as the AI's confident outputs |
| s11 claims | "Zero hallucinations. It has never said anything." / "Knowledge: none" | Real-sounding AI capability claims, true of paper (context window, multimodal = pencil + ink + fold, memory = creases, agentic = it flies) |
| s12 table | rows "Knowledge: None" | AI spec rows that sound impressive and are literally true |
| s13 + research PDF | "Void of All Characters: Pre-training a Foundation Model on Nothing"; Table 2 "0 tokens"; abstract; acknowledgements | New title and abstract framed as a real model release (the PDF pipeline exists; only the text changes) |
| s14 ending | "Pre-trained on nothing. / Fine-tuned on you." / "Still nothing." | Keep "Fine-tuned on you" (it fits AI hype); drop the "nothing" variants |
| Brief Part 1 (brand) | positioning "A foundation model with nothing on it" | A foundation model, on paper |

Count of "nothing / no data / knowledge none" phrases: **index.html 33, research paper.html 18, citation.bib 2, brief 75.**

## B. Other places we drifted from the mission's KEEP or the user's own starting ideas
| Item | Mission / user idea | What we did | Suggestion |
|---|---|---|---|
| Tier picker | "aviva / aviva Notebook Pro / aviva Ream Pro Max (500 sheets); the stack grows" | A5 / A4 / A3 sizes, no "Pro", no stack (to avoid ORYZO's Pro / Pro Max stack) | **Bring back the Apple-style tiers** with our own names and staging (e.g. aviva / aviva Notebook Pro / aviva Ream Pro Max, a stack that fans in, no glowing pills), and keep A5/A3 as a size row. A medium similarity risk that's acceptable, since the user asked for it and the staging is different |
| "Powered by AI" beat | Mission row 4: the cursor becomes a pencil; "the intelligence is supplied by the user" | "Intelligence not included" | Merge: "Powered by AI" + the visitor's pencil as the training signal |
| Hype register overall | Apple/AI launch confidence | Hushed, minimal, "less is nothing" | Keep the deadpan, but switch from *absence* to *over-claiming* |
| Sustainability | trees, recycling, "power draw: 0 W" | "It comes back" + 3 sourced cards (0 W dropped as an ORYZO copy) | Keep as is (the 0 W card stays dropped: it's ORYZO's exact card) |
| Fold-to-encrypt | Mission row 10 | Replaced by "Distil it" (tear) | Keep replaced: same joke and interaction as ORYZO's flip encryption |

## C. Unaffected
The 3D paper module, choreography, scroll, layout, colours/grounds (decision #24), interactions (draw, tear, vote, sizes, release), the illustrations and icons, the research-PDF build pipeline, and the code. **This is a copy and concept change, not a rebuild.**

## D. Cost estimate (lean plan, decision #26)
| Step | Who | Size |
|---|---|---|
| Rewrite brand line, s00/s03/s04/s11/s12/s13/s14 copy and the paper text (brief Parts 1, 3, 4) + a changelog | creative-director (Opus) | medium (one run) |
| Fact-check the new lines | web-researcher (Sonnet) | small |
| Apply the copy to `index.html` (+ tiers if chosen) | web-developer (already has context) | small (tiers: medium) |
| Re-typeset the paper text and rebuild the PDF | design visual-designer (already has context) | small to medium |
Roughly **10–15 % of what has been spent so far**. Doing it now, before the build and review phases, is far cheaper than after them.
