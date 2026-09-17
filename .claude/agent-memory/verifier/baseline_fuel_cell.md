---
name: baseline-fuel-cell
description: Fuel-cell topic baselines for acid/alkaline steps mode and acid free-run with switch
metadata:
  type: project
---

Verified 2026-09-17 at --width 1024 (small labels need the wider shot).

- acid preset, steps=7, sim=3, last=0.8: step index 6 caption "At the cathode each oxygen
  molecule gains 4 electrons... O2 + 4H+ + 4e- → 2H2O". Cathode shows O2 with small yellow
  e- dots on it, and red H+ dots sitting in the electrolyte pressed up against the cathode
  bar (correct "moving into electrode" look). Electrode labels "anode (−)"/"cathode (+)"
  render BELOW the cell, centred under each electrode — no overlap with "water out" arrow
  text or the caption box.
- alkaline preset, steps=3, sim=2, last=1.0: step index 2 caption "At the anode hydrogen
  reacts with OH- ions... 2H2 + 4OH- → 4H2O + 4e-". Green electrolyte, teal OH- ions, H2 at
  left anode with a yellow e- dot and OH- ions converging on it. Blue water molecules did
  NOT appear yet at this early step — that's expected/optional per later steps, not a bug.
- acid preset, guide=free, sim=12, param switch=1: no flow columns shown. Bulb renders lit
  (filled yellow/orange with glow) when switch=1. Switch shows as two dots with no visible
  diagonal open-line when closed (contrast: alkaline steps screenshot shows a diagonal line
  = open switch, no param passed). Counters top-right read "H2 used N  O2 used N  H2O made N".
  Both half-equations render under the cell, non-clipped.
