---
name: bug-reflection-object-fshape-ray-anchors
description: reflection object preset with design object.shape=F - ray/dot anchor touch status on the F glyph (FIXED as of 2026-09-21, see update at bottom)
metadata:
  type: project
---

**UPDATE 2026-09-21:** re-measured at `--steps 8 --sim 3`, 800px shot, with `topics/reflection.js`
showing an uncommitted diff (26 ins/16 del) dated today — the fix for this appears to be in that
diff. Pixel analysis (PIL, green/purple color masks + connected components, cross-checked with 5-8x
NEAREST crops) now finds all 6 anchor points touching within ~1-2px (well under the 4px "touching"
threshold): object-side incident rays touch the F's top-left corner, top-right corner (right end of
top bar), and bottom-left corner (bottom of stem) each within ~1.4px; image-side virtual-ray dots
touch the mirrored F's top-left, top-right and bottom-right corners each within ~1-2px. No console
errors. Previously (entry below, now superseded) 2 of 3 pairs floated ~15-50px off the glyph — if
this regresses again after a future reflection.js change, that old failure mode is the one to check
for first.

**Original bug report (now fixed, kept for reference):**

Verified via `--param design={"object.shape":"F"}` (JSON form confirmed working, see
[[reference_design_param_not_url_overridable]]) at `--steps 8 --sim 3`, 800px shot. The object really
renders as a green letter F (and the mirrored image as a correctly laterally-inverted light-green F),
and there are 3 incident/reflected/virtual rays as intended (top of stem, right end of top bar, bottom
of stem), color-coded and not visually cluttered — no crossing confusion, labels are legible.

But per-pixel check of ray anchor points found only 1 of the 3 pairs actually touches the glyph edge on
both sides:
- Top-of-stem ray: starts exactly at the glyph's top-left corner on the object side, and its dashed
  virtual-ray dot lands exactly on the mirrored glyph's corresponding corner. Correct.
- Right-end-of-top-bar ray: starts ~50px out in blank space to the right of the actual top-bar edge
  (measured green bbox right edge x=286 vs ray start x=336 in an 800px-wide shot) — floats, doesn't
  touch the F. Its mirrored dashed dot likewise floats to the left of the mirrored glyph, not touching it.
- Bottom-of-stem ray: starts correctly at the object anchor dot (touches the glyph on the object side),
  but its mirrored virtual-ray dot lands clearly separated from the mirrored glyph's stem (near the
  "image" label, not on the green shape) — floats on the image side only.

This suggests the ray-anchor coordinates for object.shape=F are computed from different geometry/metrics
than what's used to actually draw the F glyph (or the mirrored copy uses a different bbox), so anchors
that should sit on real F features (top-bar corner, stem bottom) drift off the shape. Likely still true
for the default `arrow` shape's anchors were fine per [[baseline_reflection_object_steps]] (that baseline
only checked the arrow shape). Worth re-checking after any fix to `topics/reflection.js` ray-anchor logic
for non-arrow `object.shape` values.

**How to apply:** when asked to verify ray placement on any non-default `object.shape`, don't trust a
quick visual glance — crop and pixel-check (or at minimum zoom) the start/end points against the glyph's
actual bounding box before reporting "ok".
