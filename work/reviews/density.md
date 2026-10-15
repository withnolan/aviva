# Density comparison: ORYZO vs aviva (decision #35)

STATUS: PAUSED by the lead before any analysis. No counts, table or top-10 list exist yet.

## Where I stopped
- Done: read mission, decisions #35, site-shots.mjs, shoot.mjs; ran setup-session.sh (ready); probed oryzo.ai in headless Chromium.
- Wrote `work/scripts/oryzo-capture.mjs` (not yet run end to end, so no frames in `work/screenshots/density/oryzo/` or `.../aviva/`).
- Not started: the 40 ORYZO frames, the ~30 aviva frames (use `site-shots.mjs`, specs `name=sKey:progress`), the per-screen counts, the table, the 10 emptiest screens.

## ORYZO probe findings (1440x900, software WebGL, about 1 fps)
- oryzo.ai loads headless (13 s to load event); loader (line ring on green) is still showing 12 s in.
- scrollHeight: 49,967 px at load, 56,691 px about 15 s later (re-read it before every step). Six canvases on the page; no Lenis global and no `lenis` class on `<html>`.
- Native `window.scrollTo` held (9000 stayed 9000 for 4 s) when tried about 20 s after load. In an earlier run, 5000 snapped back to ~1100 shortly after load.
- Wheel +20000 and End both stopped at 9,200 in the probe: unresolved. Next step is to find out if the scroll range unlocks progressively (try scrollTo to 20000 and 40000 directly after waiting 25 s+, and compare with scrollHeight). If it does clamp, step with scrollTo in a loop from the top.
- Local server http://localhost:8080 is up; I did not start or stop it.
