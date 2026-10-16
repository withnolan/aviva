# 2026-10-16: the four must-fixes from work/reviews/part10-factcheck.md (#2, #6, #15; X1 is applied in Part 11's copy)
# plus the 10.3 amendment that keeps the fold labels on the hero's rest frame (Part 11, density).
# Self-contained. Usage: python3 p5.py [--apply]. Each entry: (old, new, expected count).
import sys, pathlib
brief = pathlib.Path(__file__).parents[3] / 'work' / '04-creative-brief.md'
R = [
    # #2 "earliest surviving" (s06.e1.n, paper §4, and 10.2 #10 which quotes §4)
    ("Ships with a map. | The earliest known paper bearing a drawing",
     "Ships with a map. | The earliest surviving paper bearing a drawing", 1),
    ("the earliest known paper at Fangmatan to the standard",
     "the earliest surviving paper, found at Fangmatan, to the standard", 2),
    # #6 "often" (card c3, 10.1 #35, paper §2 and 10.2 #9, paper §6)
    ("Erase one, and its impression usually stays. Ink is forever. | CLEAR HISTORY",
     "Erase one, and its impression often stays. Ink is forever. | CLEAR HISTORY", 1),
    ("Erase one, and its impression usually stays. Ink is forever. / CLEAR HISTORY",
     "Erase one, and its impression often stays. Ink is forever. / CLEAR HISTORY", 1),
    ("complete: the impression of the writing usually remains",
     "complete: the impression of the writing often remains", 2),
    ("the pressure of writing usually leaves an impression",
     "the pressure of writing often leaves an impression", 1),
    # #15 fold lines: mountain dash-dot-dot, valley plain dashes
    ("with the dot-dash mountain-fold symbol (Yoshizawa–Randlett notation, R§5.1 high)",
     "with the mountain-fold line drawn dash-dot-dot (a dash, then two dots; never a plain dotted line, which means a hidden edge) (Yoshizawa–Randlett notation, R§14.5 high)", 1),
    ("with the dashed valley-fold symbol (R§5.1 high)",
     "with the valley-fold line drawn in plain dashes (R§14.5 high)", 1),
    # Part 11 amendment to the hero: the five fold labels stay on the rest frame until the first scroll
    ("| static. Crop marks, dimensions and labels retract to the corners and fade (300 ms) | the drawing leaves |",
     "| static. Crop marks and dimensions retract to the corners and fade (300 ms). The five fold labels stay, small, under the letters, until H5 (Part 11) | the drawing leaves, except the fold labels |", 1),
    ("| side, spec and hint fade out; the h1 stays |",
     "| side, spec, hint and the fold labels fade out; the h1 stays |", 1),
    ('Then the "4" draws on, and the crop marks and labels retract and fade (300 ms).',
     'Then the "4" draws on, and the crop marks and dimensions retract and fade (300 ms); the fold labels stay until the first scroll (Part 11).', 1),
    ('crop marks, dimensions and labels retract after the "4" (H3)',
     'crop marks and dimensions retract after the "4" (H3); the five fold labels stay until H5', 1),
]
t = brief.read_text(encoding='utf-8')
bad = [(t.count(o), k, o[:80]) for o, n, k in R if t.count(o) != k]
print(f'{len(R)} replacements, {len(bad)} problems')
for c, k, o in bad: print(f'  found x{c}, expected x{k}: {o!r}')
if bad or '--apply' not in sys.argv:
    sys.exit(1 if bad else 0)
for o, n, k in R:
    t = t.replace(o, n)
brief.write_text(t, encoding='utf-8')
print('applied')
