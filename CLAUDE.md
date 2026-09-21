# Science_animations

GCSE classroom animations. Vanilla JS + Canvas, no dependencies, offline on iPad Safari, iframe-embeddable.
Topics: `topics/electrolysis.js`, `topics/fuel-cell.js` (added 2026-09-17), `topics/reflection.js` (added 2026-09-18, first of five optics topics planned in `docs/WAVES-PLAN.md`; shared ray helpers in `core/rays.js`). Framework in `core/`. `python3 build.py` -> `dist/<topic>.html` (teacher) + `dist/<topic>-student.html` (2026-09-18: `window.BUILD={student:true}`, Design panel hidden, design locked to `topics/<topic>.design.js`, panel titled Setup controls).
Docs: `docs/EMBED.md`, `docs/NEW-TOPIC.md`, `README.md` (modes and keys). Git repo, remote github.com/rik12081991/science-animations; GitHub Pages serves the main branch root (index.html + core/ + topics/, offline via sw.js).

## Token rules (the last session cost 5x what it needed)

- Look up code via `docs/MAP.md` (function -> line), then `sed -n START,ENDp file`. Never Read a whole .js file.
- Change code with Edit or `sed`. Never rewrite a whole file through a heredoc.
- Verify with `/verify` (`python3 tools/verify.py`, `--topic fuel-cell` for the fuel cell). Logic change: only the preset/mode touched. Visual change: one 640px screenshot, or delegate to the `verifier` subagent so the image never enters this context.
- Edit `.claude/settings.json` by hand. Never invoke the `update-config` skill (it loads ~70K tokens).
- Run `/compact` at ~120K context and before any break over an hour. Start a fresh session for a new round of work.
- Batch feedback; do not re-screenshot to confirm wording.

## Current state (2026-09-15)

Three modes in Teaching controls: Step by step (default, empty electrolyte, Next reveals ions lined up centrally, numbered steps, Electrodes = Cathode only / Anode only / Both (2026-09-18; single side hides the other electrode, wire, flow column and question parts via `shownSide()`/`showE()`/`sideOnly()`), flow diagram columns, final observations step); Study (question before each step, Easy/Medium/Hard, single/multi/match/gap/typed, Try again then Show answer after 2 misses); Free running (many ions, power, replenish, predict quiz).
Eight presets via a rules engine: molten PbBr2, NaCl, Al2O3; concentrated NaCl (brine); dilute NaCl (OH- beats Cl- at the anode, `dilute: true`); CuSO4 inert and copper; dilute H2SO4.
Teaching control `ions` (cations / anions / both, 2026-09-18) hides one sign of ion so pupils see + to cathode, − to anode separately. `[hidden]{display:none!important}` in styles.css is what makes control-row `showIf` work.
Design panel (~65 controls) exports to `topics/electrolysis.design.js`.
Fuel cell topic: same three modes, presets `acid` (H+ crosses, water at cathode) and `alkaline` (OH- crosses, water at anode). Discrete electron accounting: `stored.anode` -> `transit` along the wire (only when the circuit is closed) -> `stored.cathode`; a cathode reaction needs 4 stored. Acid story has 11 steps, alkaline 11 (ions step comes after reduce). Typed equation answers are compared as sorted term sets via `eqKey`.
Replenish is deferred (2026-09-15): discharged electrolyte ions are "owed" and return as a batch only once that species is nearly used up, so the class sees ions turn into atoms before new ones appear. Water-derived H+/OH- return at once. Debug getters on the sim: `stuck`, `speciesCounts`.

Reflection topic (2026-09-18): presets `single-ray` (8 steps: incident, normal, angle i, reflected, angle r, i = r) and `object` (9 steps: object+eye, two incident rays, reflected, virtual dashed, image + cm distances, characteristics, virtual explanation). "Show and label" toggles (incident, normal, angleI, reflected, angleR, equal, virtual, image, characteristics) reveal an element early in step mode and are the only source of labels in free mode (`shown()`/`labelled()`). Teaching sliders `angle` (5-85°) and `distance` (2-12 cm); drag the source handle / object on the canvas in any mode. Ray reveal animates via `prog[e]` with `CHAIN` ordering.
2026-09-21: object preset sends one ray per marked point (`sourcePoints()`: arrow = tip + base; F = stem top, bar end, stem foot; `glyphMetrics()` measures ink bounds with textAlign centre), each virtual ray traces back to its own `r.img`. 1 cm graph-paper grid (`drawGrid`, anchored on the mirror / hit point, never the object; `grid.show/colour/major` in design). "Hide lines" teaching group (`hide.incident/reflected/virtual`) blanks a ray in any mode via `shown()`. Letter R removed. Verify tip: design-panel values need `--param 'design={"object.shape":"F"}'`; bare `--param k=v` only reaches teaching controls. `--steps` for the object preset maxes at 8 (9 wraps to Start). `tools/harness.js` prints `sim.status` when a sim defines it (non-electrolysis sims need no ion getters).

2026-09-21 (evening): letter F baked as the default object (`topics/reflection.design.js`); the letter's ink bounds are measured by drawing offscreen and scanning pixels (`glyphMetrics`, cached) because Safari's `measureText` ink metrics are wrong. Verified on a real iPad. `sw.js` is network-first (cache is the offline fallback only, v3); every build shows `build <hash> <time>` in the panel header (`build.py` VERSION, hash = commit being built on) so a stale cached page on the iPad can be spotted; GitHub Pages sends max-age 600, so a push can take 10+ min to reach an iPad. To inspect Safari from the terminal: Safari ▸ Develop ▸ Allow JavaScript from Apple Events, then `osascript -e 'tell application "Safari" to do JavaScript "…" in document 1'` (screencapture is blocked).

Open items: free-running CuSO4 inert with replenish off leaves the cathode idle instead of switching to H2 (flagged, not fixed). GitHub Pages is live (student links: `https://rik12081991.github.io/science-animations/dist/<topic>-student.html`); everything pushed as of 2026-09-21 evening. Next topic: refraction (`docs/WAVES-PLAN.md` §2). Future topics mentioned: diffusion, rates, states of matter.

## Conventions

- Every visual parameter goes in the topic designSchema, never hard-coded.
- Keep animations simple: few particles, central start, captions on canvas, guided mode as default.
- Headless Chrome needs `app.sim.update(1/60)` driven manually (no rAF under --virtual-time-budget); `tools/harness.js` does this.
