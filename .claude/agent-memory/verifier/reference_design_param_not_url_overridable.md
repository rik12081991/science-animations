---
name: reference-design-param-not-url-overridable
description: tools/verify.py --param k=v only affects teaching controls (topic.controls schema), not design-schema items like object.shape; design overrides need a JSON design={...} param
metadata:
  type: reference
---

`core/embed.js` applies plain URL params (`k=v`) only via `Embed.controlOverrides(topic.controls)`,
which matches against the teaching-controls schema. Design-schema items (e.g. `object.shape` in
`topics/reflection.js`, exported to `topics/reflection.design.js`) are only read via
`Embed.designOverrides()`, which expects a single JSON-encoded `design={"object.shape":"F"}` param,
not `object.shape=F`.

`tools/verify.py --param object.shape=F` therefore silently does nothing — no error, no console
warning, the harness reports `ok`, but the rendered object stays at its schema default (`arrow` for
reflection's `object`). Confirmed by diffing two screenshots requested with `--param object.shape=F`
vs `--param object.shape=arrow`: byte-identical output, both showing the default arrow.

**How to apply:** if a verify task asks to check a design-schema value via `--param`, first check
whether the id belongs to `topic.controls` (works with `--param`) or only the design schema
(`topics/<name>.js` designSchema array / `<name>.design.js`) — the latter needs
`--param design=%7B%22object.shape%22%3A%22F%22%7D` (URL-encoded JSON) or equivalent, not a bare
`key=value`. Flag this explicitly in the report rather than assuming the screenshot reflects the
requested param. See [[baseline_reflection_object_steps]] for the reflection object preset's step
count and geometry baseline.
