---
name: baseline-cuso4-inert-steps
description: CuSO4 inert-electrode step-mode (step 5a, cathode discharge) screenshot quirk — no yellow e- transit dots ever render
metadata:
  type: project
---

Scenario: `python3 tools/verify.py --preset cuso4-inert --guide steps --electrodes one --steps 10 --sim 1.5 --last <N> --shot ...`

At step 5a (caption "At the cathode each Cu2+ ion gains 2 electrons from the cathode"), tried
`--last 0.2`, `--last 0.35`, and `--last 0.5`:

- `--last 0.2`: a Cu2+ ion (blue, labelled) sits a visible gap from the cathode face, alongside
  two H+ ions. No yellow "e-" dots visible in the gap between electrode and ion at any zoom level.
- `--last 0.35` and `--last 0.5`: the ion nearest the cathode is already an orange blob (already
  discharged into a Cu atom) touching the electrode directly — no blue Cu2+ with a gap, no e- dots.

**Why:** Task briefs have asked to confirm yellow e- dots "in transit" in the gap between a paused
Cu2+ ion and the cathode during step 5a. Across the low/mid/high end of `--last`, this visual never
appears — either the ion is too far out with no dots, or it's already merged into the deposit.
**How to apply:** When asked to verify this specific discharge-in-progress visual for cuso4-inert
step 5a, expect NOT to find e- dots regardless of `--last` value; report this as a screenshot
finding (mismatch vs. task expectation), not as a verify.py script failure — verify.py itself
still reports `ok`. Flag to the user as a possible sim rendering gap worth fixing in the topic code
if they want it. See [[baseline_cuso4_inert_free]] for the related free-run cathode-clustering note.
