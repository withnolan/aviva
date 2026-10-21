# Part 11 Step B, Part 3 edits: new copy ids, one-line trims, the singular screen-reader line, the two new sections,
# and the Part 11 additions to 3.17-3.19. Self-contained. Usage: python3 p6a.py [--apply]
import sys, pathlib
brief = pathlib.Path(__file__).parents[3] / 'work' / '04-creative-brief.md'
lines = brief.read_text(encoding='utf-8').split('\n')
problems, ops = [], 0

def idx(pred, label):
    hits = [i for i, l in enumerate(lines) if pred(l)]
    if len(hits) != 1:
        problems.append(f'{len(hits)}x {label}')
        return None
    return hits[0]

def set_row(cid, row):           # replace the whole row whose first cell is `cid`
    global ops
    i = idx(lambda l: l.startswith(f'| `{cid}` |'), cid)
    if i is not None: lines[i] = row; ops += 1

def after_row(cid, rows):        # insert rows after the row whose first cell is `cid`
    global ops
    i = idx(lambda l: l.startswith(f'| `{cid}` |'), 'after ' + cid)
    if i is not None: lines[i + 1:i + 1] = rows.strip('\n').split('\n'); ops += 1

def before_heading(prefix, block):  # insert a block (ending with a blank line) before a heading
    global ops
    i = idx(lambda l: l.startswith(prefix), 'heading ' + prefix)
    if i is not None: lines[i:i] = block.strip('\n').split('\n') + ['']; ops += 1

def replace_line(prefix, new):
    global ops
    i = idx(lambda l: l.startswith(prefix), 'line ' + prefix[:40])
    if i is not None: lines[i] = new; ops += 1

P = '**Part 11:** '

# ---------- 3.1 s00 / 3.2 s01 ----------
after_row('s00.sr', f'''| `s00.cursor` | X 000.0 · Y 000.0 mm | {P}the ⊕ registration cursor's live readout: the pointer's position on the drawing, in mm from the first A's left foot. `aria-hidden` |''')
after_row('s01.letters.sr', f'''| `s01.labels` | MOUNTAIN · VALLEY · EDGE-ON · VALLEY · MOUNTAIN | {P}the loader's fold labels (`s00.fold.*`) stay small under the letters on the rest frame and fade at the first scroll (10.3 H5) |''')

# ---------- 3.3 s02: the metrology bench ----------
after_row('s02.verso', f'''| `s02.mic.readout` | 0.10 mm | {P}the micrometer's display. It counts down from 12.50 as the spindle closes (1.6 → 2.2 vh) and stops at 0.10 (R§1.3 med; inside the 95–110 µm of `s02.note`) |
| `s02.stack` | 10 SHEETS: 1.0 mm | leader to the stack on the granite (derived: 10 × 0.1 mm) |
| `s02.mic.sr` | A micrometer closes on the edge of the sheet and reads 0.10 millimetres. | visually hidden |''')
before_heading('### 3.4 `s03-intelligence`', '''**On screen, one line per beat (Part 11):** 0–0.8 vh `s02.h2` and `s02.body`; 1.6–2.2 vh the readout, `s02.stack` and `s02.note` (now the micrometer's spec line); 2.2–3 vh `s02.verso`. Never more than 5 lines.''')

# ---------- 3.4 s03: trims + the dark-mode coda ----------
set_row('s03.cta', f'''| `s03.cta` | (cut, Part 11) | remove from the DOM: `s03.hint.pointer` already says it |''')
set_row('s03.note', f'''| `s03.note` | Pencil mostly sits on the fibres, so it mostly erases. Ink soaks in, so it doesn't. | small, under the buttons. {P}it shows only after the first Erase, for 4 s (R§13.8 high, "largely" true; it sets up s07 and card c3) |''')
before_heading('### 3.5 `s04-outputs`', f'''**Dark mode** (the Part 11 coda, 5.4 → 6.6 vh; 2B s03)

| id | Copy | Notes |
|---|---|---|
| `s03.dm.eyebrow` | ONE MORE THING | |
| `s03.dm.h3` | Dark mode. | |
| `s03.dm.body` | Most white office paper contains optical brighteners. They turn ultraviolet into blue, so under a blacklight, AVIVA glows. | 18 words (R§14.6; "most", never "all": part10-factcheck X1) |
| `s03.dm.note` | Blacklight not included. | small |
| `s03.dm.switch` | DARK MODE | `role="switch"`, `aria-checked`; state labels `s03.dm.on` ON and `s03.dm.off` OFF. Scroll turns it on at 5.4 vh; the visitor can flip it either way; it switches off as the section ends |
| `s03.dm.sr` | Dark mode on. The sheet glows blue-white; your strokes stay dark. | visually hidden, announced on change ("Dark mode off." when off) |
| `s03.dm.fallback` | In 3D, the lights would go out here and the sheet would glow under ultraviolet. | no-WebGL page |

**On screen, one line per beat:** while writing, `s03.eyebrow`, `s03.h2`, `s03.body`, the status line and the buttons; in the coda, `s03.dm.eyebrow`, `s03.dm.h3`, `s03.dm.body`, `s03.dm.note` and the switch.''')

# ---------- 3.5 s04: the weights room ----------
set_row('s04.body', '''| `s04.body` | Our weights are open. You can hold them in one hand. | **Part 11:** the formula moves into the callouts below (R§1.2 high · R§13.1 derived) |''')
set_row('s04.note', '''| `s04.note` | (cut, Part 11) | remove from the DOM: `s04.call.3` carries the correction (R§13.1 · R§13.10 #10) |''')
after_row('s04.note', f'''| `s04.call.1` | 80 g/m² | {P}leader callout to the "4" (R§1.2 high) |
| `s04.call.2` | × 0.06237 m² | leader callout to the ".99" (R§13.1: A4 = 62,370 mm²) |
| `s04.call.3` | = 4.99 g. Calculated, strictly speaking. | leader callout to the "g" (R§13.1: calculated, not weighed; real sheets vary by a few per cent, R§13.10 #10) |
| `s04.weights` | CALIBRATION SET: 4.99 g IN 8 WEIGHTS | small label on the open case: 2 + 2 + 0.5 + 0.2 + 0.2 + 0.05 + 0.02 + 0.02 g (derived) |
| `s04.weights.sr` | An open case of eight brass calibration weights that add up to 4.99 grams. | visually hidden |''')

# ---------- 3.6 s05: the ISO 216 wall ----------
set_row('s05.body', '''| `s05.body` | Fold it in half and the shape survives: 297 ÷ 210 = 1.414, the square root of two. | 18 words. **Part 11:** the history moves to the wall's title block, `s05.wall.title` (R§1.1 high) |''')
after_row('s05.ratio', f'''| `s05.wall.title` | SHEET SIZES A0–A8 · AFTER LICHTENBERG (1786), DIN 476 (1922) AND ISO 216 (1975) | {P}the drawing's title block, bottom right of the wall (R§2 high · R§14.8 high) |
| `s05.wall.label` | A0 … A8 | one small label per rectangle, at its top-left corner (R§1.1 high) |
| `s05.wall.note` | A0 = 1 m². Each size is half the one before. | small, inside the title block (R§1.1 high · R§14.8) |''')
after_row('s05.g.refuse', f'''| `s05.g.confetti.sr` | The third tear is refused, and a little confetti falls. | {P}visually hidden, announced with the confetti puff |''')

# ---------- 3.7 s06: the machine room ----------
after_row('s06.sub', f'''| `s06.head` | NOW PRINTING: {{version}} | {P}small label at the print head; it follows the entry being printed |
| `s06.torch.hint` | YOUR CURSOR IS A LAMP NOW | appears at e5 (v2.0, Watermarks), beside the hero sheet: the torch (11.1) |
| `s06.torch.sr` | Moving the pointer behind the sheet reveals the AVIVA watermark. | visually hidden |
| `s06.printer.sr` | A dot-matrix printer prints these release notes on a continuous strip of paper. | visually hidden. The strip is the DOM list, so screen readers get every entry as text |''')
before_heading('### 3.8 `s07-surface`', f'''**On screen (Part 11):** each entry shows `.v`, `.d` and `.t` on one line; `.n` shows only for the entry at the print head (≤ 4 entries on screen). The 13 margin drawings are decorative (`aria-hidden`).

### 3.7b `s06b-roadmap` (new, Part 11)

| id | Copy | Notes |
|---|---|---|
| `s06b.eyebrow` | ROADMAP | |
| `s06b.h3` | v6.0, planned: flight. | the entry after the changelog's last line |
| `s06b.body` | Seven folds. No new features. | |
| `s06b.hint` | POINT AT A FOLD TO PREVIEW IT | beside the sheet |
| `s06b.fold.n` | FOLD {{n}} OF 7 | the label of each fold number (buttons 1–7: Tab, then Enter previews) |
| `s06b.call.1` | CENTRE LINE: 105 mm | leader callout (derived: 210 ÷ 2, R§1.1 high) |
| `s06b.call.2` | FOLDS 1–2: CORNERS TO THE CENTRE LINE, 45° | leader callout (geometry, derived) |
| `s06b.call.3` | NO GLUE · NO CUTS · NO TAPE | leader callout (our method) |
| `s06b.sr` | The sheet is marked with the seven folds of a paper dart, in standard origami notation. | visually hidden |
| `s06b.fallback` | In 3D, the seven folds of a paper plane would draw themselves onto the sheet here. | no-WebGL page |

Reduced motion: the lines appear in one step, and a preview highlights its line without folding. **On screen:** eyebrow, h3, body and hint, plus three short callouts.''')

# ---------- 3.8 s07 ----------
set_row('s07.body', '''| `s07.body` | Up close, AVIVA is a mat of cellulose fibres, held together by hydrogen bonds. Nobody taught it that. | 18 words (R§1.7 med · R§13.10 #11: real copy paper also has fillers and sizing, so we never say "nothing else") |''')
after_row('s07.drop', f'''| `s07.pipette.sr` | A glass pipette releases one drop of ink. | {P}visually hidden |
| `s07.scale` | 1 mm | the scale bar in the absorption view |
| `s07.timer` | t = {{s}} s | time since the drop, live, one decimal |
| `s07.ink.hint` | MOVE THE CURSOR. THE INK WILL FOLLOW. | small, in the absorption view: the ink-follows-pointer effect (11.1) |''')

# ---------- 3.9 s08: the generations stage ----------
set_row('s08.body', '''| `s08.body` | Its fibres can be made into paper again, and again. Then they retire. | 13 words (R§3.5 high). **Part 11:** "starts as wood pulp" is cut; the tagline already says trees |''')
replace_line('**Cards** (three sheet-shaped cards', '**Callouts** (Part 11: the three DOM cards become callouts in the generations scene; value and label stay, the body is one line)')
set_row('s08.c1', '''| `s08.c1` | 5–7 | LIVES | Five to seven times. Researchers are aiming for 25. | R§3.5 · R§13.10 #9. Over the row of generations |''')
set_row('s08.c2', '''| `s08.c2` | ≈ ¾ | RECYCLED IN EUROPE | About three-quarters of Europe's paper and board comes back. | R§13.3 high (75.1 % in 2024, European Paper Recycling Council; the figure goes in the cite line) |''')
set_row('s08.c3', '''| `s08.c3` | 4.64 g | CO₂e PER SHEET (ISO METHOD) | Its footprint is about its own weight. | R§13.4 · R§13.10 #16 high (4.64 g under ISO 14040/44). It is the label on the jar on the balance; the sheet's pan reads 4.99 g |''')
set_row('s08.c3.cite', '''| `s08.c3.cite` | | | Dias & Arroja, *Journal of Cleaner Production*, 2012 · European Paper Recycling Council, 2024. | R§13.4 · R§13.3 |''')
after_row('s08.note', f'''| `s08.gen` | GEN {{n}} | {P}under each of the seven sheets |
| `s08.gen.hover` | GEN 1 · VIRGIN FIBRE / GEN {{n}} · RECYCLED {{n − 1}}× | on hover or focus |
| `s08.pan` | 4.99 g | the sheet's pan on the balance (R§13.1, calculated) |
| `s08.scene.sr` | Seven sheets stand in a row, each recycled once more than the last and a little greyer. Beside them, a balance weighs one sheet against its carbon footprint and tips, slightly, toward the sheet. | visually hidden |''')

# ---------- 3.10 s09 ----------
after_row('s09.rating.sr', f'''| `s09.hint` | POINT AT A REVIEWER | {P}small. Without a pointer, the reviews play in order as you scroll (one per 0.6 vh) |
| `s09.scene.sr` | Six reviewers stand as paper cut-outs, each under its own light: a printer, a cat, a novelist's manuscript, a shredder, a pencil and a recycling bin. | visually hidden. The standees and tent cards are decorative; the quotes are DOM text |''')

# ---------- 3.11 s10 ----------
set_row('s10.body', '''| `s10.body` | Two responses to the same prompt. Pick the better one. | 10 words. **Part 11:** "You won't be told…" is cut; the result says it |''')
after_row('s10.lb.note', f'''| `s10.board.sr` | Scoreboard: AVIVA A4, 50.0 %. AVIVA A4, 50.0 %. | {P}the split-flap board shows the two leaderboard rows; this is its hidden text |
| `s10.crowd.sr` | The audience of paper cranes applauds. | announced after each vote |''')

# ---------- 3.12 s11 ----------
before_heading('### 3.13 `s12-sizes`', '''**On screen (Part 11):** each card shows its headline and meta line; the caption shows on the card nearest the centre only (≤ 5 lines on screen). Each render develops from a blank sheet as it nears the centre (the darkroom, 11.1); the alt texts are unchanged.''')

# ---------- 3.13 s12: the singular, settled ----------
set_row('s12.sr.change', '''| `s12.sr.change` | {model} selected: {n} sheets. | visually hidden, announced on change, for 80 and 500 sheets. **Settled (Part 11):** one sheet uses `s12.sr.change.one` |''')
after_row('s12.sr.change', f'''| `s12.sr.change.one` | AVIVA selected: 1 sheet. | singular; announced when AVIVA is chosen |
| `s12.dim` | 0.1 mm / ≈ 8 mm / ≈ 5 cm | {P}dimension callouts on the three stacks of the family portrait (R§1.3 med · derived · R§13.2) |
| `s12.riffle.hint` | RUN THE CURSOR ALONG THE EDGE | small, beside the stack: the riffle (11.1) |''')

# ---------- 3.14 s13 + the new s13b ----------
set_row('s13.abstract', '''| `s13.abstract` | We present AVIVA A4, a multimodal foundation model with a 210 × 297 mm context window and persistent memory. | **Part 11:** the first sentence only, on screen (one line per beat); the full abstract is in the PDF (4.2) |''')
after_row('s13.abstract', f'''| `s13.model.card` | MODEL CARD · aviva-a4.obj · 4 VERTICES · 2 FACES · 210 × 297 mm | {P}beside the wireframe viewer (true of the file, 4.7) |
| `s13.model.hint` | DRAG TO TURN THE MODEL | keyboard: focus the viewer, then the arrow keys turn it |
| `s13.model.sr` | A wireframe of the model: one rectangle, 210 by 297 millimetres. | the viewer's accessible name (`role="img"`) |
| `s13.pages.sr` | The paper's eight pages, laid out on the floor. | the printout set |''')
before_heading('### 3.15 `s14-release`', f'''### 3.14b `s13b-session` (new, Part 11)

| id | Copy | Notes |
|---|---|---|
| `s13b.eyebrow` | YOUR SESSION | |
| `s13b.h3` | Sheets used: {{n}} of 500. | the same counter as `s15.ream`: n = sheets crumpled, torn or regenerated + 1, the one still in use (R§1.2 high: a ream is 500) |
| `s13b.body` | The bin has seen them before. | when n > 1: a callback to the bin's review in s09 |
| `s13b.body.one` | Just the one. Thank you for your restraint. | when n = 1 |
| `s13b.sr` | Everything you crumpled, tore or regenerated rolls into the recycling bin. | visually hidden; when n = 1, "Nothing to recycle." |
| `s13b.fallback` | In 3D, everything you used would roll into the recycling bin here. | no-WebGL page |

Reduced motion: the debris is already in the bin, and the counter shows its final value.''')

# ---------- 3.15 s14 ----------
after_row('s14.released', f'''| `s14.ga` | Now generally available. | {P}appears under `s14.released` as the flock crosses the sky |
| `s14.flock.sr` | A flock of paper planes crosses the sky. | visually hidden |''')

# ---------- 3.17 / 3.18 / 3.19 additions ----------
before_heading('### 3.18 Keyboard and touch summary', '''**Part 11 additions**

| Element | Accessible name / role | Notes |
|---|---|---|
| The sets, props and effects of 11.1 (registration cursor, letters, micrometer, board and lamp, weights, wall, printer and strip art, crease lines, pipette, generations and balance, standees, arena and cranes, plinths, printout, debris and bin, flock, deckle) | `aria-hidden` | where one carries meaning, its section has a `.sr` line |
| DARK MODE (s03) | `role="switch"` "Dark mode", `aria-checked` | `s03.dm.sr` on change |
| Fold numbers 1–7 (s06b) | buttons "Fold {n} of 7: preview" | Enter or Space previews |
| Model viewer (s13) | `role="img"`, named by `s13.model.sr`; focusable | arrow keys turn it |
| Session counter (s13b) | `aria-live="polite"` | announces the final count once |''')
before_heading('### 3.19 Reduced motion', '''- **Part 11 keyboard:** DARK MODE toggles with Space; the fold numbers take Tab and Enter; the model viewer turns with the arrow keys; the reviewers take Tab, one quote each. The mouse-only effects (breeze, torch, riffle, crane gaze, push field, magnetic controls, lean) have no keyboard version and need none: they decorate, and every beat plays without them.''')
before_heading('### 3.20 The static fallback page', '''- **Part 11:** every signature effect has a calm version, a still or a 400 ms cross-fade. No fold-in (the letters fade in), no rack focus, no UV flicker, no sway, no confetti (the line just refuses), no fanfold feed, no crease-relief motion, no ink-follow, no crane wave (the board just updates), no develop (cards arrive developed), no deal (counts cross-fade), no curl, no rolling debris, no flock. Mouse effects are off, except the pencil.''')

print(f'{ops} operations, {len(problems)} problems')
for p in problems: print(' ', p)
if problems or '--apply' not in sys.argv:
    sys.exit(1 if problems else 0)
brief.write_text('\n'.join(lines), encoding='utf-8')
print('applied')
