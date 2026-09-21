---
name: verify
description: Run the text-only headless-Chrome check on a topic (errors, step walk, study-question self-check, optional downscaled screenshot). Use after any code change instead of manual screenshots.
---

Run from the project root. Output is one line per scenario; `ok` or `FAIL`.

```
python3 tools/verify.py                          # smoke: brine steps + hard study check (~5 s)
python3 tools/verify.py --preset cuso4-inert     # the preset you touched
python3 tools/verify.py --preset brine --guide study --difficulty medium --check
python3 tools/verify.py --all                    # full matrix, only before a milestone
python3 tools/verify.py --topic fuel-cell --all  # same for the fuel cell (2 presets)
python3 tools/verify.py --preset brine --steps 3 --shot $SCRATCH/x.png   # visual change only
```

Rules:
- Logic change: run the preset/mode you touched. Never `--all` unless asked or at a milestone.
- Visual change: one `--shot` at 640px (default). Read the PNG once; do not re-shoot to confirm text.
- The script rebuilds `dist/` and `docs/MAP.md` itself. Do not run build.py separately.
- If a scenario prints `NO ERRLOG`, the page did not boot: run `node -e "new Function(require('fs').readFileSync('topics/electrolysis.js','utf8'))"` for the syntax error.
- Harness internals live in `tools/harness.js` (URL params: steps, sim, check, open, labels).
- Design-panel values need `--param 'design={"object.shape":"F"}'`; bare `--param k=v` only reaches teaching controls.
- `--steps` for the reflection object preset maxes at 8 (9 wraps to Start). The harness prints `sim.status` when a sim defines it (non-electrolysis sims need no ion getters).
- Real Safari (iPad/Mac differ from headless Chrome, e.g. `measureText`): ask the user to enable Safari ▸ Develop ▸ Allow JavaScript from Apple Events, open the built page in Safari, then read the canvas with `osascript -e 'tell application "Safari" to do JavaScript "document.querySelector(\"canvas\").toDataURL()" in document 1'` and decode the base64 (terminal `screencapture` is blocked).
- "Still wrong on the iPad" after a push is usually a cached page: check the `build <hash> <time>` stamp in the panel header before touching code.
