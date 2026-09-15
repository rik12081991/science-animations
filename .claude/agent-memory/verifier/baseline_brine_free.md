---
name: baseline-brine-free
description: Ion counts and clustering behavior for brine preset, free-run guide, power=1, at sim=15s
metadata:
  type: project
---

Baseline observed 2026-09-15 (`python3 tools/verify.py --preset brine --guide free --steps 0 --sim 15 --param power=1`):
- Product counts at 15s: ~19 H2 molecules (cathode), ~24 Cl2 molecules (anode).
- Ion clustering: most Na+ ions correctly stack along the side face of the cathode column (not underneath); most Cl- ions correctly stack along the side face of the anode column.
- Quirk: a small tangle of ~4-5 overlapping ions (mix of Na+/H+) still bunches right at the base/bottom of the cathode, and ~3 overlapping ions (Cl-/H+) bunch at the base of the anode. This is a minority of the total ions — majority sit correctly at the side faces — but the bottom clustering isn't fully eliminated.
- How to apply: when re-verifying after fixes to ion positioning, compare against this — if the bottom-of-electrode tangle grows or becomes the majority position, that's a regression. If it shrinks/disappears, that's the fix landing.
