# Waves and optics topics: plan (2026-09-18)

Cambridge IGCSE Physics 0625 section P03. Five topic files, built in this order.
Reference exam figures in `Reference_images/`. Base sims: javalab.org light_refraction and lens.

## Shared conventions (all five topics)

- **Label toggles.** Every named feature is a Teaching-controls toggle, off by default in Step-by-step
  and Study modes. Turning one on draws that element *with its label* so pupils get visual
  confirmation of what the term means. Set:
  `normal`, `incident ray`, `reflected ray` / `refracted ray`, `angle i`, `angle r`,
  `principal axis`, `principal focus (F)`, `focal length (f)`, `virtual rays` (dashed back-projection),
  `image characteristics` (terms caption), `refractive index numbers`.
- **Study mode** questions reuse the toggles: "click where the normal goes", "which ray is the
  incident ray", plus calculations (i = r, n = sin i / sin r, image distance, magnification word).
- **Shared helpers** go in `core/rays.js` (built with topic 1): `normal(p, dir)`, `ray(a, b, {arrow, dashed, colour})`,
  `angleArc(vertex, from, to, label)`, `protractor`, `labelLine`. Wavelength -> colour helper for topics 2 and 5.
- Free running mode: drag handle on the incident ray (or object), live readouts.
- Same three modes, designSchema for every colour/size, student build unchanged.

## 1. `reflection.js` (P03.2.1.01-.05) - 1 session

Presets: **Single ray** (plane mirror, one ray), **Object in mirror** (object arrow, eye, image).
Steps (single ray): ray hits mirror -> normal -> angle i -> reflected ray (no angles) -> angle r -> "i = r".
Steps (object): object -> two rays to the eye -> reflect -> dashed virtual rays behind mirror -> image ->
characteristics caption (same size, same distance, laterally inverted) -> "virtual: rays only appear to come from it".
Study: label lines, calculate angle of reflection, image distance from mirror/object.
Free: drag incident angle; drag object distance.

## 2. `refraction.js` (P03.2.2.01-.08, P03.2.4, P03.1.04b) - 2 sessions

Presets: **Boundary** (air -> water / glass / diamond, selectable n), **Glass block** (emerges parallel, lateral shift),
**Why it bends** (car with visible wheels crossing tarmac -> sand; wheel that enters first slows first),
**Total internal reflection** (glass -> air, critical angle labelled, past it fully reflected),
**Optical fibre** (zig-zag by repeated TIR, applications caption), **Prism / dispersion** (white light -> 7 colours,
wavelength slider, ROYGBIV in frequency and wavelength order).
Toggles: normal, incident ray, refracted ray, angle i, angle r, refractive index numbers, speed readout (v = c/n),
wavefront view (crests closer in slower medium).
Study: label lines, calculate r or n with Snell's law, calculate critical angle, which way it bends.
Free: drag incident angle; media selector; wavelength slider.

## 3. `lens.js` (P03.2.3.01-.07) - 1-2 sessions

Presets: **Parallel beam** (distant object -> rays parallel -> converge at F; first so F is defined before an object appears),
**Beyond 2F**, **At 2F**, **Between F and 2F**, **Inside F** (magnifying glass, virtual upright enlarged, dashed back-projection).
Steps: object -> ray 1 (parallel -> through F) -> ray 2 (through centre) -> ray 3 (through F -> parallel) -> image arrow ->
characteristics (enlarged / same size / diminished, upright / inverted, real / virtual).
Toggles: principal axis, principal focus (F), focal length (f), image characteristics, real/virtual explanation.
Grid on/off to match exam paper style. No lens equation, no concave lens (not in spec).
Free: drag object along axis, image updates live.

## 4. `diffraction.js` (P03.1.08-.09) - 1 session

Ripple tank, plane waves to a gap. Sliders: wavelength, gap size. Caption rule: most spreading when gap ~ wavelength,
nearly straight through when gap >> wavelength. Study: predict spreading for a given gap/wavelength pair.

## 5. `waves.js` (P03.1.01-.07, P03.4.05, .08-.09) - 1 session

Presets: **Rope** (transverse), **Slinky** (longitudinal, compressions and rarefactions), **Sound** (loudness = amplitude,
pitch = frequency). Toggles label crest, trough, wavelength, amplitude, direction of vibration vs propagation.
Sliders: frequency, wavelength; live v = f x lambda. Study: read wavelength/amplitude off the diagram, v = f lambda calculations.

## Not animated

EM spectrum (P03.3), speed of sound method, echo, ultrasound (P03.4.01-.07, .10): tables and practical methods.
Possible later: study-mode ordering quiz for EM regions and ROYGBIV.
