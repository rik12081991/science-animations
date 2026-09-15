// Animation loop with fixed timestep, play/pause/step and a speed multiplier.
(function () {
  function create(hooks) {
    const FIXED = 1 / 60, MAX_FRAME = 0.1;
    let playing = false, speed = 1, last = 0, acc = 0, raf = null, time = 0;
    function frame(ts) {
      raf = requestAnimationFrame(frame);
      const now = ts / 1000;
      let dt = last ? now - last : 0;
      last = now;
      if (dt > MAX_FRAME) dt = MAX_FRAME;
      if (playing) {
        acc += dt * speed;
        let n = 0;
        while (acc >= FIXED && n < 10) { hooks.update(FIXED); time += FIXED; acc -= FIXED; n++; }
        if (n >= 10) acc = 0;
      }
      hooks.draw();
    }
    const api = {
      start() { if (!raf) raf = requestAnimationFrame(frame); },
      stop() { if (raf) cancelAnimationFrame(raf); raf = null; last = 0; },
      play() { playing = true; },
      pause() { playing = false; },
      toggle() { playing = !playing; api.onChange && api.onChange(); return playing; },
      step() { playing = false; for (let i = 0; i < 6; i++) { hooks.update(FIXED); time += FIXED; } api.onChange && api.onChange(); },
      setSpeed(s) { speed = s; },
      get speed() { return speed; },
      get playing() { return playing; },
      get time() { return time; },
      onChange: null
    };
    return api;
  }
  window.Engine = { create };
})();
