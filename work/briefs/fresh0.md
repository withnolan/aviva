# Fresh-eyes panel #0 (decisions #37, #40): brief for each reviewer

You are seeing two websites for the first time. You know nothing about who made them or why. **Do not read any project files**: not `work/`, not `reference/`, not `docs/` source, not CLAUDE.md, not README. The only files you may write are your report and your screenshots.

Persona: {PERSONA}

1. Look at the benchmark first: https://oryzo.ai (desktop, 1440×900). Capture it with
   `node tools/shoot.mjs --url https://oryzo.ai --out work/screenshots/fresh0/{ID}-oryzo --label oryzo --sizes 1440x900 --steps 35 --step-px 900 --wait 2500`
   and open the screenshots with Read (all of them, in order).
2. Then look at the second site the same way: `http://localhost:8080` → `work/screenshots/fresh0/{ID}-aviva`.
3. Write `work/reviews/fresh0-{ID}.md`, plain and honest:
   - What each site is, in one line, as you understood it.
   - First 5 seconds of each: what you felt and noticed.
   - What you remember after scrolling each.
   - Which feels richer, more crafted, more premium, funnier, and why.
   - Where the second site is empty, boring, confusing or cheap (with screenshot file names).
   - Where the second site is better than the benchmark.
   - The 7 changes that would most raise the second site to the benchmark's level, most important first.
   - Scores out of 10 for both: first impression, visual richness, craft, humour, memorability, overall.
Keep it to what a visitor would notice. Stop after the report (one task, about 20 minutes).
