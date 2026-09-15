---
name: baseline-dilute-nacl-steps
description: Step-by-step caption text for dilute-nacl preset, electrodes=one, at step 9 (anode competition step 4b)
metadata:
  type: project
---

Baseline observed 2026-09-15 (`python3 tools/verify.py --preset dilute-nacl --guide steps --electrodes one --steps 9 --sim 1`):
- After 9 Next presses, lands on step labeled "Step 4b" (anode side).
- Caption text: "Cl⁻ and OH⁻ (from water) both reach the anode. The solution is dilute, so there are only a few Cl⁻ ions. OH⁻ ions are discharged instead and oxygen forms."
- Text fits cleanly in the caption box, no clipping/overflow observed at 640px width.
- How to apply: use this exact step count (9) and caption wording as the reference when re-checking this scenario; a step-count drift or reworded caption missing "dilute" / "OH−" would indicate a regression in the guided-steps script.
