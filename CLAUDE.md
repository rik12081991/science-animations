# Science_animations

GCSE classroom animations. Vanilla JS + Canvas, no dependencies, offline on iPad Safari, iframe-embeddable.
Topics: `topics/electrolysis.js`, `topics/fuel-cell.js` (added 2026-09-17). Framework in `core/`. `python3 build.py` -> `dist/<topic>.html`.
Docs: `docs/EMBED.md`, `docs/NEW-TOPIC.md`, `README.md` (modes and keys). Git repo, remote github.com/rik12081991/science-animations; GitHub Pages serves the main branch root (index.html + core/ + topics/, offline via sw.js).

## Token rules (the last session cost 5x what it needed)

- Look up code via `docs/MAP.md` (function -> line), then `sed -n START,ENDp file`. Never Read a whole .js file.
- Change code with Edit or `sed`. Never rewrite a whole file through a heredoc.
- Verify with `/verify` (`python3 tools/verify.py`, `--topic fuel-cell` for the fuel cell). Logic change: only the preset/mode touched. Visual change: one 640px screenshot, or delegate to the `verifier` subagent so the image never enters this context.
- Edit `.claude/settings.json` by hand. Never invoke the `update-config` skill (it loads ~70K tokens).
- Run `/compact` at ~120K context and before any break over an hour. Start a fresh session for a new round of work.
- Batch feedback; do not re-screenshot to confirm wording.

## Current state (2026-09-15)

Three modes in Teaching controls: Step by step (default, empty electrolyte, Next reveals ions lined up centrally, numbered steps, 1a/1b sub-steps when Electrodes = One at a time, flow diagram columns, final observations step); Study (question before each step, Easy/Medium/Hard, single/multi/match/gap/typed, Try again then Show answer after 2 misses); Free running (many ions, power, replenish, predict quiz).
Eight presets via a rules engine: molten PbBr2, NaCl, Al2O3; concentrated NaCl (brine); dilute NaCl (OH- beats Cl- at the anode, `dilute: true`); CuSO4 inert and copper; dilute H2SO4.
Design panel (~65 controls) exports to `topics/electrolysis.design.js`.
Fuel cell topic: same three modes, presets `acid` (H+ crosses, water at cathode) and `alkaline` (OH- crosses, water at anode). Discrete electron accounting: `stored.anode` -> `transit` along the wire (only when the circuit is closed) -> `stored.cathode`; a cathode reaction needs 4 stored. Acid story has 11 steps, alkaline 11 (ions step comes after reduce). Typed equation answers are compared as sorted term sets via `eqKey`.
Replenish is deferred (2026-09-15): discharged electrolyte ions are "owed" and return as a batch only once that species is nearly used up, so the class sees ions turn into atoms before new ones appear. Water-derived H+/OH- return at once. Debug getters on the sim: `stuck`, `speciesCounts`.

Open items: free-running CuSO4 inert with replenish off leaves the cathode idle instead of switching to H2 (flagged, not fixed). Not yet tested on a real iPad. No GitHub Pages yet. Future topics mentioned: diffusion, rates, states of matter.

## Conventions

- Every visual parameter goes in the topic designSchema, never hard-coded.
- Keep animations simple: few particles, central start, captions on canvas, guided mode as default.
- Headless Chrome needs `app.sim.update(1/60)` driven manually (no rAF under --virtual-time-budget); `tools/harness.js` does this.
