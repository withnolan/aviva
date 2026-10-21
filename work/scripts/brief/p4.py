# Part 4 of the 2026-10-14/15 pass: the cinematic hero (fold-in intro, pinned 2 vh unfold) and one-line trims
# (fresh-eyes review #0). Self-contained. Usage: python3 p4.py [--apply]. Every old string must match exactly once.
import sys, pathlib
brief = pathlib.Path(__file__).parents[3] / 'work' / '04-creative-brief.md'
R = []

# --- Part 2: page order, totals, 2A ---
R.append(("| 1 | `s01-hero` | AVIVA, folded / Every great product… | 1.5 | (none; the first scroll unfolds the letters) | white | 2 Hero |",
          "| 1 | `s01-hero` | AVIVA, folded / Every great product… | 2 | yes (the letters unfold and merge under the h1) | white | 2 Hero |"))
R.append(("- **Pinned beats:** 9.",
          "- **Pinned beats:** 10 (s01 joined them in the 2026-10-14 pass)."))
R.append(("five sheets folded into AVIVA (two mountain folds",
          "five sheets drop in and fold themselves into AVIVA (two mountain folds"))
R.append(("| 1.5 · (none) | None (the first scroll unfolds and merges the letters; reduced motion cross-fades) |",
          "| 2 · yes | None (the fold-in plays by itself after the loader, and any input fast-forwards it; the first scroll unfolds and merges the letters; reduced motion cross-fades) |"))

# --- 2B s00 ---
R.append(('At 297, the five 3D letters and the "4" fade in exactly inside the drawing (opacity 0 → 1, 400 ms, no pop). The drawing and crop marks retract and fade (300 ms). The drawing → object match-cut happens only here.',
          'At 297, the **fold-in** starts (10.3, H2–H3): five flat sheets drop into the frame and fold themselves into the drawing\'s outlines. Each outline fades as its sheet lands in it, so the drawing → object match-cut is the landing (and it happens only here). Then the "4" draws on, and the crop marks and labels retract and fade (300 ms).'))
R.append(("| Camera pitch −6°, level horizon. Default key. |",
          "| Camera at the pre-settle pose (≈ ×1.06 distance, pitch −9°; it settles in H4), level horizon. The studio and the default key fade up under the drawing at 297. |"))

# --- 2B s01 ---
R.append(("with the baseline at y 66 % and a cap height of ≈ 27 vh% (141 mm):",
          "with the baseline at y 66 % and a cap height of ≈ 30 vh% (141 mm; enlarged from 27 vh% for the opening, letter gaps tightened to ≈ 0.22 × the cap height):"))
R.append(("Soft contact shadows under every letter.",
          "Soft contact shadows under every letter. **They arrive by themselves** (the intro, 10.3 H2–H4): the sheets drop in and fold into these poses, then the camera settles."))
R.append(("| 1.2 vh: one flat sheet, upright at (50, 52), 46 vh%,",
          "| 1.5 vh: one flat sheet, upright at (50, 52), 46 vh%,"))
R.append(("`s01.h1.l2` appears. 1.2 → 1.5 vh: hold. |",
          "`s01.h1.l2` appears. 1.5 → 2.0 vh: hold; the pin releases at 2.0 vh. |"))

# --- 3.2 hero copy notes ---
R.append(("| `<h1>`, centred, top third; fades in as the letters light up |",
          "| `<h1>`, centred, top third; fades in with the eyebrow as the last sheet lands (10.3 H4) |"))
R.append(("It appears **when the letters have merged into one sheet** (≈ 1.2 vh). Without a scroll it waits: the standing letters are the setup |",
          "It appears **when the letters have merged into one sheet** (1.5 vh; s01 is now pinned for 2 vh). Without a scroll it waits: the standing letters are the setup |"))
R.append(("| centred, bottom, above the hint (R§1.7 med · R§2) |",
          "| centred, bottom, above the hint. In 0.6 s after the h1, out at the first scroll (0–0.2 vh), with `s01.spec`: one line per beat (R§1.7 med · R§2) |"))
R.append(("micro-label during the merge (0.8–1.3 vh) (new id)",
          "micro-label during the merge (1.0–1.6 vh) (new id)"))

# --- 3.6 one line per beat ---
R.append(('| `s05.g.body` | Distillation trains a small model to keep what a large one knows. Tear AVIVA in half: two smaller models, the same shape, every capability intact. Even the paper cut. | 29 words (FC row 32; decision #27: capabilities, not "none") |',
          '| `s05.g.body` | Tear AVIVA in half: two smaller models, the same shape, every capability intact. Even the paper cut. | 17 words. "Distil it." above already names the technique, so the definition is cut (one line per beat, fresh-eyes review #0) |'))

# --- 5.2 ---
R.append(("- **Composition (the first frame after the loader).**",
          "- **Composition (the rest frame, after the fold-in).**"))
R.append(("The word spans about 78 % of the width, centred on the I, with a cap height of ≈ 27 % of the viewport height (141 mm at true scale).",
          'The word is big: a cap height of ≈ 30 % of the viewport height (141 mm at true scale), letter gaps of ≈ 0.22 × the cap height, centred on the I. With the "4", the lockup spans ≈ 17–97 % of the width at 1440 × 900.'))
R.append(("- **The unfold and merge (the first scroll).**",
          '- **The fold-in (the intro, and the opening\'s "whoa").** No scroll needed. When the loader reaches 297, five flat sheets drop into the frame from above, one per letter, A V I V A, 0.12 s apart. Each falls face-on with a light flutter, then folds itself in half in mid-air and turns end-on as it lands on its mark inside the drawing\'s outline, where its contact shadow blooms in. The product spells its own name, live, in under two seconds. Then the "4" is drawn on in graphite, the drawing retracts, and the camera settles in one slow push-in. Light it like a product film: the studio fades up out of the drawing\'s white as the sheets fall, and the key catches each fold as it closes. Beats H0–H4 in 10.3.\n- **The unfold and merge (the first scroll).**'))

# --- Part 10.1 rows already written ---
R.append(("| when the letters have merged (≈ 1.2 vh); with no scroll it waits | #31 |",
          "| when the letters have merged (1.5 vh of the now-pinned 2 vh hero); with no scroll it waits | #31; row 72 |"))
R.append(("| MODEL MERGE: 5 SHEETS → 1 | micro-label, 0.8–1.3 vh |",
          "| MODEL MERGE: 5 SHEETS → 1 | micro-label, 1.0–1.6 vh |"))
R.append(("the same knowledge. None. | Distillation trains a small model to keep what a large one knows. Tear AVIVA in half: two smaller models, the same shape, every capability intact. Even the paper cut. | |",
          "the same knowledge. None. | Tear AVIVA in half: two smaller models, the same shape, every capability intact. Even the paper cut. | trimmed to one line (fresh-eyes review #0) |"))

# --- span: the 2B s01 middle cell (start marker to end marker, inclusive) ---
SPAN = ("**First scroll, 0 → 1.5 vh (unfold and merge):**", "The end frame governs the exact distance.",
        "**First scroll, pinned, 0 → 1.5 vh (unfold and merge; frame-accurate beats H5–H9 in 10.3):**<br>"
        "• 0 → 0.2 vh: the \"4\", the side copy and the spec line fade out.<br>"
        "• Staggered from the outside in, each letter (1) **turns** to face the camera, ry ±90° (A's 0.10–0.40, V's 0.25–0.55, I 0.40–0.70 vh); "
        "(2) **unfolds** flat into an upright A4 portrait, fold angle → 180° (A's 0.40–0.80, V's 0.55–0.95, I 0.70–1.10 vh): each A's far panel swings up over its ridge, each V rises as its lower panel swings down, the I opens upwards; "
        "(3) **slides** to x 50 % and parks 2–4 mm behind the I-sheet, hidden once fully covered (A's 0.80–1.25, V's 0.95–1.35 vh).<br>"
        "• 1.0 → 1.6 vh: `s01.merge` shows.<br>"
        "• 1.10 → 1.50 vh: the camera eases back (≈ ×1.24 distance), rises to the sheet's mid-height and levels to pitch 0. The merged sheet lifts ≈ 20 mm off the floor and its contact shadow fades: from here on it floats. The end frame governs the exact distance.")

t = brief.read_text(encoding='utf-8')
bad = [(t.count(o), o[:90]) for o, n in R if t.count(o) != 1]
s0, s1 = t.count(SPAN[0]), t.count(SPAN[1])
if s0 != 1 or s1 != 1: bad.append((f'{s0}/{s1}', 'SPAN markers'))
print(f'{len(R)} replacements + 1 span, {len(bad)} problems')
for c, o in bad: print(f'  x{c}: {o!r}')
if bad or '--apply' not in sys.argv:
    sys.exit(1 if bad else 0)
i = t.index(SPAN[0]); j = t.index(SPAN[1], i) + len(SPAN[1])
t = t[:i] + SPAN[2] + t[j:]
for o, n in R:
    assert t.count(o) == 1, o[:80]
    t = t.replace(o, n, 1)
brief.write_text(t, encoding='utf-8')
print('applied')
