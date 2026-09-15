---
name: baseline-cuso4-inert-free
description: CuSO4 inert-electrode free-run ion counts/visuals at 5s and 8s (power=1), for comparing future verify runs
metadata:
  type: project
---

Scenario: `python3 tools/verify.py --preset cuso4-inert --guide free --steps 0 --sim <N> --param power=1 --shot ...`

At sim=5s: counter reads "10 Cu atoms" / "2 O2 molecules". Screenshot shows ~4 Cu2+ ions still in
solution near the cathode, and a fairly noticeable orange copper deposit already built up on the
cathode (thicker than just "starting" — several orange blobs stacked).

At sim=8s: counter reads "14 Cu atoms" / "4 O2 molecules". Screenshot shows ~7 Cu2+ ions total
(not the ~10 a task brief once assumed) — a tight cluster of ~4 right at the cathode base
(touching the copper deposit, not just "drifting towards" it) plus ~3 more spread further out
toward mid-cell/anode side.

**Why:** No baseline existed for cuso4-inert before 2026-09-15; task instructions describing
expected ion counts/positions didn't fully match what the sim renders (cathode coating builds up
faster than "starting", and Cu2+ ions cluster at the cathode rather than staying spread/drifting).
**How to apply:** When verifying cuso4-inert free-run screenshots, compare against these counts/
positions rather than assuming task-brief wording is exact; flag brief-vs-render mismatches in the
report but don't treat them as FAIL unless counts are wildly off (e.g. 0 or 20+ Cu2+, no deposit at
all, etc.).
