---
name: reference-taller-screenshot-workaround
description: How to screenshot below-the-fold UI (e.g. Teaching controls panel) that verify.py --shot cuts off
metadata:
  type: reference
---

`tools/verify.py --shot` runs headless Chrome with `--window-size=1024,760` and screenshots only that viewport (not the full scrollable page), then downscales with `sips`. Panels below the transport row (Teaching controls `<details>`, Design panel) are routinely cut off.

Workaround when a task needs to see below-the-fold panel content:
1. Run `python3 tools/verify.py --preset ... --guide ... --param k=v --shot <path>` once — this builds `SCRATCH/harness.html` (or `$TMPDIR/harness.html` if `CLAUDE_SCRATCHPAD` is unset) with dist/ rebuilt and the harness script injected.
2. Find that harness.html (check `$CLAUDE_SCRATCHPAD` env var, else `python3 -c "import tempfile;print(tempfile.gettempdir())"`).
3. Run Chrome directly: `"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu --virtual-time-budget=3000 --window-size=1024,1900 --screenshot=<out.png> "file://<harness.html>?<same query params>"`, then `sips --resampleWidth 640 <out.png>`.

Related: [[baseline_molten_pbbr2_free]]
