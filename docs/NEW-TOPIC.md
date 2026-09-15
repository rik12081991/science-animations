# Adding a new topic

One file: `topics/<id>.js`. Add a `<script src="topics/<id>.js">` line to `index.html`. Done.

```js
(function () {
  Topics.register({
    id: 'diffusion',
    title: 'Diffusion',
    description: 'Particles spreading out from high to low concentration.',
    aspect: 0.64,                                   // canvas height / width
    presets: [{ id: 'bromine-air', title: 'Bromine in air' }],
    controls: [                                     // teaching panel
      { id: 'preset', type: 'select', label: 'Scenario', options: [{ value: 'bromine-air', label: 'Bromine in air' }], default: 'bromine-air' },
      { id: 'lid', type: 'toggle', label: 'Remove lid', default: false },
      { id: 'labels', type: 'segmented', label: 'Labels', options: ['on', 'off'], default: 'on' },
      { id: 'burst', type: 'button', label: 'Add particles' }
    ],
    designSchema: [                                 // design panel; any of: colour, range, select, segmented, toggle
      { id: 'colour.background', type: 'colour', label: 'Background', default: '#ffffff', group: 'Colours' },
      { id: 'particle.radius', type: 'range', label: 'Particle size', min: 4, max: 20, step: 1, default: 8, unit: 'px', group: 'Sizes' }
    ],
    create(ctx) {
      const g = ctx.g;                              // drawing helpers, see core/canvas.js
      // ctx.overlay is a DOM layer over the canvas; Quiz.ask(ctx.overlay, question, done) shows a question (core/quiz.js)
      const C = () => ctx.controls.values;          // current teaching control values
      const D = () => ctx.design.values;            // current design values
      let particles = [];
      return {
        reset(presetId) { particles = []; /* build the starting state */ },
        update(dt) { /* advance the simulation by dt seconds */ },
        draw() { g.begin(D()['colour.background']); /* draw everything */ },
        action(id) { if (id === 'burst') { /* button pressed */ } },
        onControl(id, value) { /* optional: react to a control change */ }
      };
    }
  });
})();
```

Rules of thumb:

- Store positions in normalised units (0 to 1) so the canvas can resize; convert with `g.w` and `g.h` when drawing.
- Scale every pixel size by `g.w / 800` so it looks the same on an iPad and a projector.
- Use `g.formula(x, y, 'SO_4^2-', {...})` for chemical text: `_` makes a subscript, `^` a superscript.
- Use `Particles.wander / confine / separate` from `core/particles.js` for particle motion.
- Run `python3 build.py` to get `dist/<id>.html`.
