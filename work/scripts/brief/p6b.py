# Part 11 Step B, Parts 2 and 5: page order, totals, 2A/2B rows for s03, s06b, s12, s13, s13b, and the new 5.12 (the sets).
# Self-contained. Usage: python3 p6b.py [--apply]
import sys, pathlib
brief = pathlib.Path(__file__).parents[3] / 'work' / '04-creative-brief.md'
t = brief.read_text(encoding='utf-8')
lines = t.split('\n')
problems, ops = [], 0

def idx(prefix):
    hits = [i for i, l in enumerate(lines) if l.startswith(prefix)]
    if len(hits) != 1: problems.append(f'{len(hits)}x {prefix[:60]!r}'); return None
    return hits[0]
def put_after(prefix, rows):
    global ops
    i = idx(prefix)
    if i is not None: lines[i + 1:i + 1] = rows; ops += 1
def put_before(prefix, rows):
    global ops
    i = idx(prefix)
    if i is not None: lines[i:i] = rows; ops += 1
def swap_line(prefix, new):
    global ops
    i = idx(prefix)
    if i is not None: lines[i] = new; ops += 1
def swap_text(old, new):
    global ops
    hits = [i for i, l in enumerate(lines) if old in l]
    if len(hits) != 1 or lines[hits[0]].count(old) != 1: problems.append(f'text x{len(hits)}: {old[:60]!r}'); return
    lines[hits[0]] = lines[hits[0]].replace(old, new); ops += 1

# ---------- page order and totals ----------
swap_text('### Final page order (≈ 58 vh total; ORYZO ≈ 63 vh)', '### Final page order (≈ 62.5 vh total with Part 11; ORYZO ≈ 63 vh)')
swap_line('| 3 | `s03-intelligence` |', '| 3 | `s03-intelligence` | Intelligence, built in. / Dark mode. | 7 | yes | white | 4 "Powered by AI" |')
put_after('| 6 | `s06-release-notes` |', ['| 6b | `s06b-roadmap` | Roadmap. (new, Part 11) | 1.5 | yes | cream, 5 mm grid | **new** (an annotation bridge into the macro) |'])
put_after('| 13 | `s13-paper` |', ['| 13b | `s13b-session` | Your session. (new, Part 11) | 1.5 | (none) | white | **new** (a callback before the ending) |'])
swap_text('- **Pinned beats:** 10 (s01 joined them in the 2026-10-14 pass).', '- **Pinned beats:** 11 (s01 joined them in the 2026-10-14 pass; s06b in Part 11).')
swap_text('- **Long beats:** 8 (s04), 7 (s11), 6 (s03), 5 (s05).', '- **Long beats:** 8 (s04), 7 (s03, s11), 5 (s05).')
put_after('> **Grounds:**', ['', "> **Sets, signature and mouse effects (Part 11):** 11.1 is authoritative for each section's environment, props, signature effect and mouse effect, and 5.12 says how each set looks. 2A and 2B below remain the product's choreography; the sets are built around it."])

# ---------- 2A ----------
swap_text('| 6 · yes | **Draw** with the pencil cursor.', '| 7 · yes | **Draw** with the pencil cursor; the **DARK MODE** switch in the coda (Part 11).')
put_after('| `s06-release-notes` | Features as history', ['| `s06b-roadmap` | Bridge from the changelog into the macro; preview the ending | The roadmap is the paper plane: seven folds in origami notation, "No new features." | 1.5 · yes | Point at or focus a fold number to preview that fold (Tab, Enter) | New: an annotation layer on the product (fold notation, not ORYZO\'s sketches, #9 / #19) |'])
put_after('| `s13-paper` | Academic parody', ['| `s13b-session` | Fill the gap before the ending; pay off the visitor\'s own actions | Everything you crumpled, tore or regenerated rolls into the recycling bin, and the count is real | 1.5 · (none) | None (the cursor nudges the debris) | New: a callback, with rigid-body physics |'])

# ---------- 2B ----------
swap_text('| 5 → 6 vh: it rises (rx 35 → 0) to (50, 38), shrinks to 30 vh%, then exits upwards out of frame. **The paint layer is kept for s14.** |',
          '| 5.0 → 5.4 vh: it rises upright (rx 35 → 0) at (50, 48), 40 vh%. 5.4 → 6.6 vh: **dark mode** (Part 11): the lamp goes off, a UV tube comes on, and the sheet fluoresces blue-white while its strokes stay dark. 6.6 → 7 vh: it shrinks to 30 vh% and exits upwards out of frame. **The paint layer is kept for s14.** |')
swap_text('moves to the centre: the hand-over to s07.', 'moves to the centre: the hand-over to s06b, which starts the dolly (Part 11).')
put_after('| `s06-release-notes` | At (70, 50)', ['| `s06b-roadmap` | From s06: the sheet faces the camera at (50, 50), 46 vh%, on a hairline 5 mm grid. | 0.1 → 1.1 vh: the AVIVA HB pencil and a steel rule draw the seven fold lines, one every ≈ 0.14 vh. Each line, once drawn, pre-creases the sheet by 4–6° (`fold(line, 4–6°)`), so the flat sheet takes on the plane\'s relief. Pointing at or focusing a number runs `fold(line, 30°)` and springs back (0.6 s). | 1.1 → 1.5 vh: the creases relax to 1°, the lines fade to 20 %, and the camera starts the s07 dolly toward the surface. | Raking key from the left (≈ 70° from the normal) so the relief reads; pitch 0. |'])
swap_line('| `s13-paper` | No sheet; it waits above the frame.', '| `s13-paper` | **The printout (Part 11):** the paper\'s eight pages lie in a 4 × 2 grid on the white floor, each with a slight natural curl; the hero sheet waits above the frame. | The page under the cursor peels up at its corner (`curl`, r 20 mm, ≤ 25°). The .obj viewer (a wireframe rectangle) turns on drag or arrow keys. | 1.6 → 2 vh: the camera lowers toward the floor for s13b. | Soft top light, studio white; pitch −35° (never straight down, #1). |')
put_after('| `s13-paper` | **The printout', ['| `s13b-session` | The white floor at a low angle (pitch −20°); the bin standee from s09 at (80, 62). | 0.1 → 1.2 vh: the session\'s debris enters from the left (crumpled balls from s03 and s10, the s05 quarters, the confetti), rolls and bounces (rigid bodies, restitution ≈ 0.3) and drops into the bin one by one, while the counter ticks per item. If nothing was destroyed, nothing rolls in: the bin waits. | 1.2 → 1.5 vh: the bin settles, and the camera lifts toward the s14 A, which is already descending, so no frame is blank. | Warm overhead studio light. |'])
swap_text('2.4 → 4 vh: the comparison table scrolls up, and the stack rises with it', '2.4 → 4 vh: **Part 11, the family portrait:** the other two stacks slide in on their own plinths, so 1 / 80 / 500 stand side by side with dimension callouts; the comparison table scrolls up, and the portrait rises with it')

# ---------- Part 5: 5.12 the sets ----------
S512 = r'''### 5.12 The sets (Part 11): look, light and props, set by set
Where 5.4–5.6 differ, 5.12 wins. The blues follow decision #43 (ink ≈ #1F1B6E, ink-deep ≈ #120F45, blueprint ≈ #1D4590; the design VD sets the exact values). **Composition rule:** every set leaves the copy zones of its section clear, so no text ever sits under a 3D object (fresh-eyes review #0, problem 2). **Budget:** each set's assets load lazily with its section, so the first load stays under 3 MB; props are primitives with procedural materials wherever possible.

| Set (section) | Ground and colour | Props and materials | Light | Camera |
|---|---|---|---|---|
| The drawing (s00) | paper white | graphite 0.5 px lines; fold lines per R§14.5 (mountain dash-dot-dot, valley dashes); mono labels | flat | the pre-settle pose (10.3) |
| The white studio (s01) | warm-white cyclorama; the floor shows until H9 | five A4 letters, the graphite "4" | warm key from the top left, raking 60°; cool fill from the right; soft contact shadows | pitch −9° → −6° → 0 |
| The metrology bench (s02) | charcoal; a speckled black granite surface plate fills the lower third | a digital outside micrometer (graphite-enamel frame, satin-chrome spindle and thimble, grey LCD with dark segments) lying with its axis horizontal, so the edge-on sheet stands between anvil and spindle; a 10-sheet stack flat on the granite, its layers visible at the edge | cool top light (≈ 5600 K); a rim light on the sheet's edge that follows the cursor | macro look, shallow depth of field: focus racks from the readout (1.6 vh) to the edge (2.2 vh) |
| The drafting board (s03) | warm dark grey falling off around the board | a pale grey laminate board at 35° (not wood); an aluminium parallel rule on fine cables; cream drafting tape at the sheet's four corners; an architect's lamp head (graphite enamel) entering at the top left | a warm pool (≈ 4200 K) from the lamp; low fill | pitch −12° |
| The blacklight room (s03 coda) | near-black violet; never a false-colour ramp or a scale | a thin UV tube across the top of the frame, glowing violet. The sheet's albedo becomes an emissive blue-white, modulated by the formation and masked by the paint layer, so graphite stays dark; the tape and board stay dark | the tube only; a faint bloom on the sheet's edges | as the board, with a 4 % push-in |
| The weights room (s04, 0–2.5 vh) | pale warm grey | the "4.99 g" type plane; an open case lined with graphite felt holding two 2 g knob weights and six flat leaf weights (500, 200, 200, 50, 20, 20 mg) in brass and nickel silver, with a pair of tweezers | soft top light; warm highlights on the brass | as 2B s04 |
| The drying loft (s04, 2.5–8 vh) | pale cool-grey back wall | the graphite line, brushed-steel clips, eight outputs (5.4) | two soft bars of window light from the upper left across the outputs | trucks left with the line |
| The ISO 216 wall (s05) | cream | nested A0–A8 rectangles in 0.75 px graphite with corner labels and a title block at the bottom right; the active size redraws in ink-blue in 200 ms; confetti: up to 400 A7–A10-sized scraps with the paper flutter | neutral 5600 K, crisp shadows | static, pitch 0 |
| The machine room (s06) | cool grey | a low-poly dot-matrix printer at the bottom left (graphite plastic, ≈ 420 × 300 × 120 mm, a platen slot, two tractor sprockets); the fanfold strip (tractor holes along both edges, a perforation every 297 mm) feeding upward and settling into a zig-zag pile; the 13 margin drawings; the hero sheet at the right | a soft, slightly cool key; from e5, the cursor back-light (torch) behind the hero sheet | pitch 0, panning slowly up with the strip |
| The crease pattern (s06b) | cream with a 5 mm hairline grid (graphite at 10 %, every fifth line at 20 %) | the sheet face-on; seven fold lines, numbered circles and Yoshizawa–Randlett arrows; the AVIVA HB pencil and a steel rule | a raking key from the left (≈ 70°), so the relief reads | pitch 0, then the s07 dolly |
| The fibre field and the ink bloom (s07) | the ink ramp from the new ink (#43) | the fibres, the bar magnifier; a clear glass pipette tip with a meniscus entering from the top; the drop; the mm scale bar and timer (DOM) | grazing key | fov 22° macro |
| The generations stage (s08) | an ink-deep floor, lit by seven soft pools of light in a shallow curve | seven sheets on thin clear acrylic stands, 260 mm apart: GEN 1 bright white with crisp edges through to GEN 7, soft pale grey with feathered, fibrous edges; a two-pan balance (graphite-enamel beam, brass pans); a clear glass jar with a metal lid and a paper label (no cork: it is ORYZO's material) | a back-light behind each sheet, cloudier with each generation; soft front fill | pitch −8°; parallax with the cursor |
| The office after hours (s09) | very dark ink-deep floor and wall | six standees, 30–45 cm tall: printed card 1.5 mm thick with white cut edges and a folded foot, in a shallow arc; six tent cards on the floor | one subtle volumetric downlight per standee, fading up in turn | pitch −6° |
| The arena (s10) | an ink-deep stage; a satin floor with soft reflections | two lecterns (graphite, with paper-white front panels A and B), each with a small easel; a split-flap board above centre (graphite housing, white flaps, dark digits); ≈ 300 white paper cranes, ≈ 40 mm each, in five tiers at the edges | two warm spotlights from above; the audience softly lit from the stage | pitch −4° |
| The nine claim sets (s11) | per card: c1 a pale wall with a sash window and sky; c2 a yellow sweep; c3 slate; c4 white macro; c5 a cool office corridor; c6 a grey wall with a clipboard; c7 a light table glowing from below; c8 a dark backdrop; c9 a night floor with a grey Moon | as 5.6 | each its own (5.6) | stills rendered at 2× the card size; the develop reveal goes from paper white through low contrast to the full image |
| The family portrait (s12) | cool grey | three graphite plinths, 400 × 400 × 120 mm, 120 mm apart; the stacks at true thickness; dimension callouts (DOM) | crisp neutral key; a small ease-back for the Ream | as 2B s12 |
| The printout (s13) | studio white | eight A4 pages in a 4 × 2 grid with 20 mm gaps, each textured with its PDF page, with a slight natural curl; the .obj wireframe (graphite lines, ink-blue vertex dots) in a 240 px viewer | soft top light | pitch −35°, never straight down (#1) |
| The cleanup (s13b) | the studio-white floor | the bin standee from s09; the session's debris (baked crumple meshes, the s05 quarters, confetti) | warm overhead | pitch −20° |
| Golden hour (s14) | the white studio, warmed | the A, the "4", the pencil, the plane; 24 dart planes, 60–90 mm, at the far depth | a low golden key from the right (≈ 3200 K), long soft shadows | as 2B s14 |
| The deckle edge (s15) | where the white page meets the footer ground | a ragged, fibrous edge 24–40 px tall across the full width, with a soft shadow | (none) | (none) |

**Design VD illustration list (Part 11):**
- **13 margin drawings for s06**, one per entry, 120 × 120 px, 0.75 px graphite.
- **6 standee illustrations for s09**, front views in graphite line and soft tone on white card, ≈ 1024 px tall, transparent WebP:
  - the printer;
  - Biscuit, curled;
  - the manuscript stack, its top page typed "CHAPTER ONE";
  - the shredder, with strips;
  - the half-length HB pencil stamped AVIVA HB;
  - the recycling bin.
- **The ISO 216 wall and its title block** (SVG).
- **The s06b fold-notation set** (SVG): lines, numbered circles, arrows.
- **The deckle-edge mask** (SVG).
- **Eight PDF page renders** (WebP, 1240 × 1754, ≤ 120 KB each, loaded with s13).
- **The scoreboard flap type** (the site typeface).'''
put_before('## Part 6. Moments of delight', S512.split('\n') + [''])

print(f'{ops} operations, {len(problems)} problems')
for p in problems: print(' ', p)
if problems or '--apply' not in sys.argv:
    sys.exit(1 if problems else 0)
brief.write_text('\n'.join(lines), encoding='utf-8')
print('applied')
