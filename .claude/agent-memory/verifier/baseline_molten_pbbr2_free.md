---
name: baseline-molten-pbbr2-free
description: Molten PbBr2 free-run baseline — Ions shown segmented control layout, ion counts, Next/Back hidden in free mode
metadata:
  type: project
---

Verified 2026-09-18 with `preset=molten-pbbr2&guide=free&ions=cations&sim=3`.

- Teaching controls panel has a segmented "Ions shown" control: "Cations (+) only" / "Anions (−) only" / "Both" (three buttons, wraps to a second line at 640px). No separate "Show ... ions" toggle rows exist any more — this replaced the older per-ion toggle UI.
- In free-running mode, "Next step" / "Back" buttons are correctly absent (only Play/Step/Reset/Speed in the transport row). Confirms the `[hidden]` CSS fix works.
- With `ions=cations`, canvas draws only Pb2+ (grey), no Br- ions, even though internal state still tracks both (debug line showed `{"Pb2+":8,"Br-":16}` with 24 total ions at sim=3 preset default seed) — the ions param is a display filter, not a simulation change.
- Gotcha: `tools/verify.py --shot` uses `--window-size=1024,760`, which only captures the viewport — the Teaching controls panel (a `<details>` below the transport row) is below the fold and gets cut off in the default screenshot. To see the panel, re-run headless Chrome directly against the same `SCRATCH/harness.html` (built by verify.py) with a taller `--window-size` (e.g. 1024,1900), then downscale with `sips --resampleWidth 640`. See [[reference_taller_screenshot_workaround]].

## Single-electrode step mode (electrodes=cathode / electrodes=anode)

Verified 2026-09-18 with `preset=molten-pbbr2&guide=steps&electrodes=cathode&steps=6&sim=2` and `electrodes=anode&ions=anions&steps=4&sim=2`.

- With `electrodes=cathode`, only the left/cathode electrode + its wire to the d.c. supply's − terminal are drawn; anode half is correctly absent. Flow-diagram numbered-box column sits on the cathode side only. Grey Pb lead atoms visibly stack at the base of the electrode by step 5/6. Br− ions still render in solution even though only the cathode electrode is drawn (expected — ions param is separate from electrodes param).
- With `electrodes=anode&ions=anions`, only the right/anode electrode + wire to + terminal are drawn. Only Br− ions shown (no Pb2+, matches `ions=anions`), each with a pulsing orange ring that always has an ion inside — no empty/floating rings seen. Flow-diagram column sits on the anode side only.
