# Science Animations

Browser-based classroom animations. No install, no internet needed once open, works on iPad.

- **Run:** open `index.html` in Safari or Chrome.
- **Build single files:** `python3 build.py` → `dist/electrolysis.html`, `dist/fuel-cell.html`, `dist/all.html` (email it, AirDrop it, host it, iframe it).
- **Embed in another site:** see `docs/EMBED.md`.
- **Add a topic:** see `docs/NEW-TOPIC.md`.
- **Change the look:** open the Design panel, adjust, then Export and replace `topics/electrolysis.design.js`.

Topics: **Electrolysis** and **Hydrogen fuel cell** (acidic or alkaline half-equations; hydrogen oxidised at the anode, electrons round the circuit light a bulb, oxygen reduced at the cathode, water out).

Three modes, switched in Teaching controls:

- **Step by step** (default): a few ions start in the middle. Press **Next** on the canvas to walk through each numbered step. With Electrodes set to One at a time, each step has an a (cathode) and b (anode) sub-step, e.g. 1a electrons pushed to the cathode, 1b electrons pulled from the anode, 2a cathode negative, 2b anode positive. Both together does each pair as one step. The last numbered step shows what you would observe (seen, smelled, heard) at each electrode. Back rewinds to that step.
- **Study (questions)**: same steps, but the electrolyte starts empty and a question pops up before every step. Question types: pick one, pick several, click-to-match (electrode ↔ charge, ion ↔ electrode, electrode ↔ what is discharged), and typed. Difficulty: Easy (plain options), Medium (extra ions with wrong charges and subtler distractors), Hard (type the answer, including half-equations). Wrong answers get a Try again button that resets the question; after two misses, Show answer. Score shown in the caption bar.
- **Free running**: many ions, power switch, replenish, predict-the-products quiz.

Keyboard on a Mac: space = play/pause, → = step, n = next step, b = back, p = power (free mode), r = reset.
