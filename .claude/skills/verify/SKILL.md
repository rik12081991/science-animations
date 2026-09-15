---
name: verify
description: Run the text-only headless-Chrome check on a topic (errors, step walk, study-question self-check, optional downscaled screenshot). Use after any code change instead of manual screenshots.
---

Run from the project root. Output is one line per scenario; `ok` or `FAIL`.

```
python3 tools/verify.py                          # smoke: brine steps + hard study check (~5 s)
python3 tools/verify.py --preset cuso4-inert     # the preset you touched
python3 tools/verify.py --preset brine --guide study --difficulty medium --check
python3 tools/verify.py --all                    # full 7x3x2 matrix, only before a milestone
python3 tools/verify.py --preset brine --steps 3 --shot $SCRATCH/x.png   # visual change only
```

Rules:
- Logic change: run the preset/mode you touched. Never `--all` unless asked or at a milestone.
- Visual change: one `--shot` at 640px (default). Read the PNG once; do not re-shoot to confirm text.
- The script rebuilds `dist/` and `docs/MAP.md` itself. Do not run build.py separately.
- If a scenario prints `NO ERRLOG`, the page did not boot: run `node -e "new Function(require('fs').readFileSync('topics/electrolysis.js','utf8'))"` for the syntax error.
- Harness internals live in `tools/harness.js` (URL params: steps, sim, check, open, labels).
