---
name: baseline-reflection-object-steps
description: reflection topic, object preset, steps mode - off-by-one on --steps N, and confirmed grid/ray-origin geometry at the final step
metadata:
  type: project
---

`--steps N` in tools/verify.py drives N `action('next')` calls starting from step 0 (Start). The object
preset has 9 steps (indices 0-8). `action('next')` resets back to step 0 once already on the last step
(`storyStep >= steps.length - 1`), so `--steps 9` overshoots and lands back on "Start" instead of the
final "Finish" step. Use `--steps 8` to land on the last (9th, "Finish") step for this preset.
Same off-by-one likely applies to `single-ray` (8 steps -> use `--steps 7`) and to any other
reflection/step-mode preset - always use `stepCount - 1`.

Confirmed at the object preset's final step (`--steps 8`), via pixel-level inspection of a 1024px shot:
- Grid is light blue at 1cm spacing with genuinely heavier gray lines (RGB ~200 vs ~240 background) every
  5 cells, e.g. rows 24.4px apart, heavy line every 5th one (~122px).
- Object base and image base sit on the same heavy horizontal gridline, and are symmetric about the
  mirror (both measured 195px from the mirror in a 1024px-wide shot at the default 8cm distance).
- The two incident rays originate from the same point as the top of the green object arrowhead (measured
  within 1px), not below it.
- Grid is subtle enough not to interfere with label readability (label boxes have their own light-gray
  background).

**How to apply:** when asked to verify a specific late/last step of a reflection (or similar future
step-mode) preset, first check `stepCount` (e.g. via a plain non-shot verify run's `step N` output) and
request `stepCount - 1`, not the pupil-facing step number, to avoid landing back on Start.
