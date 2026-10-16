# Part 3 of the 2026-10-14 pass: continuity and accuracy fixes found while writing Part 10.
# Self-contained. Usage: python3 p3.py [--apply]. Every old string must match exactly once.
import sys, pathlib
brief = pathlib.Path(__file__).parents[3] / 'work' / '04-creative-brief.md'
R = []

# 1. Loader counter: a 297 mm dimension "under the word" would be false (the word is far wider).
#    It now measures the first A's unfolded length, 2 x 148.5 mm.
R.append(("| `s00.counter` | 000 mm → 297 mm | three digits, tabular; it climbs a dimension line under the word |",
          "| `s00.counter` | 000 mm → 297 mm | three digits, tabular. It climbs a chain dimension that follows the first A's outline, from its left foot over the apex to its right foot: 2 × 148.5 mm, the sheet's unfolded length (R§1.1 high, derived) |"))
R.append(("Lines draw on, and the counter climbs from 000 to 297 mm along a dimension line under the word.",
          "Lines draw on, and the counter climbs from 000 to 297 mm along a chain dimension that follows the first A's outline (left foot → apex → right foot: 2 × 148.5 mm, the sheet's unfolded length)."))
R.append(("Reduced motion: the drawing appears in one step, and the counter jumps 000 → 148 → 297.",
          "Reduced motion: the drawing appears in one step, and the counter jumps 000 → 148 (the apex) → 297."))

# 2. Paper Table 4: "n = 0" belonged to the old "no outputs" logic; §5.1 now says every mark is the user's.
R.append(("| Hallucination rate | 0.00 % (n = 0) |",
          "| Hallucination rate | 0.00 % (source: the user) |"))

# 3. Hero A crossbar: seen end-on, a pre-crease cannot draw a bar between the legs. Make it optional and honest.
R.append(("A faint pre-crease across both panels at 42 % of the leg height reads as the crossbar.",
          "Optional (tier B): a faint pre-crease at 42 % of the leg height, a thin shadow line on the visible panel faces that hints at a crossbar. The Λ alone reads as A in this word (5.2)."))
R.append(("The crossbar is read from a faint horizontal pre-crease across both panels at 42 % of the leg height, which catches the key as a thin shadow line. Perspective shows the outer A's panel faces, so the crease reads there. If it doesn't read at 390 px, that's acceptable: a barless A still reads as A in this word.",
          "The crossbar is optional (tier B): a faint pre-crease along both panels at 42 % of the leg height catches the key as a thin shadow line on the panel faces that perspective shows (the A's sit off the camera's centre line). Keep it only if it reads as a bar; a barless A still reads as A in this word, at every size."))

# 4. Hero hand-off: the camera must also rise to the sheet's mid-height; the sheet leaves the floor.
R.append(("• 0.9 → 1.2 vh: the camera eases back (×1.28 distance) and levels to pitch 0.",
          "• 0.9 → 1.2 vh: the camera eases back (≈ ×1.24 distance), rises to the sheet's mid-height and levels to pitch 0. The merged sheet lifts ≈ 20 mm off the floor and its contact shadow fades: from here on it floats. The end frame governs the exact distance."))

# 5. Continuity: s05 tears the last drying-line output, not the hero sheet, so the hero crease is not torn.
R.append(("(the fold's memory; s05 later tears along it)",
          "(the fold's memory; it stays on this sheet through s02–s04 and catches the rim light in s02)"))
R.append(("- **The memory of the fold.** The merged sheet keeps a faint horizontal crease at mid-height. s05 later tears along it, and s14 folds the A back along it.",
          "- **The memory of the fold.** The merged sheet keeps a faint horizontal crease at mid-height, which catches the rim light as it turns in s02. (s05's sheet, the last output from the drying line, makes its own crease before the tear; s14 folds its sheet back into the A at the same mid-height line.)"))

# 6. s14 A echo: the drawing must be inside, so the tent shows the verso; the "4" keeps the hero spacing.
R.append(("**folded into the A** (a mountain fold along its mid-crease, apex 36°, the drawing hidden inside)",
          "**folded into the A** (folded at mid-height with the drawn side inwards and stood as a tent, apex 36°: the outside shows the verso, and the drawing is hidden inside)"))
R.append(('the graphite "4" fades in beside it, so it reads "A4".',
          'the graphite "4" fades in beside it at the hero\'s A-to-4 spacing, so it reads "A4".'))

t = brief.read_text(encoding='utf-8')
bad = [(t.count(o), o[:90]) for o, n in R if t.count(o) != 1]
print(f'{len(R)} replacements, {len(bad)} problems')
for c, o in bad: print(f'  x{c}: {o!r}')
if bad or '--apply' not in sys.argv:
    sys.exit(1 if bad else 0)
for o, n in R:
    t = t.replace(o, n, 1)
brief.write_text(t, encoding='utf-8')
print('applied')
