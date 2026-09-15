// Small helpers for particle motion. Positions and velocities in pixels.
(function () {
  const P = {
    rand(a, b) { return a + Math.random() * (b - a); },
    pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; },
    // Random acceleration plus damping (Brownian-ish wobble).
    wander(p, jitter, dt, damping) {
      p.vx += (Math.random() - 0.5) * jitter * dt;
      p.vy += (Math.random() - 0.5) * jitter * dt;
      const d = Math.exp(-(damping == null ? 2.2 : damping) * dt);
      p.vx *= d; p.vy *= d;
    },
    clampSpeed(p, max) {
      const s = Math.hypot(p.vx, p.vy);
      if (s > max) { p.vx *= max / s; p.vy *= max / s; }
    },
    // Keep p inside rect {x,y,w,h} with radius r; bounce softly.
    confine(p, rect, r, bounce) {
      bounce = bounce == null ? 0.5 : bounce;
      if (p.x < rect.x + r) { p.x = rect.x + r; p.vx = Math.abs(p.vx) * bounce; }
      if (p.x > rect.x + rect.w - r) { p.x = rect.x + rect.w - r; p.vx = -Math.abs(p.vx) * bounce; }
      if (p.y < rect.y + r) { p.y = rect.y + r; p.vy = Math.abs(p.vy) * bounce; }
      if (p.y > rect.y + rect.h - r) { p.y = rect.y + rect.h - r; p.vy = -Math.abs(p.vy) * bounce; }
    },
    // Push overlapping particles apart. radiusOf(p) gives each radius. O(n^2), fine for n < 200.
    separate(list, radiusOf, gap, canCollide) {
      gap = gap || 2;
      for (let i = 0; i < list.length; i++) {
        const a = list[i]; if (a.skip) continue;
        const ra = radiusOf(a);
        for (let j = i + 1; j < list.length; j++) {
          const b = list[j]; if (b.skip) continue;
          if (canCollide && !canCollide(a, b)) continue;
          const rb = radiusOf(b);
          let dx = b.x - a.x, dy = b.y - a.y;
          const dist = Math.hypot(dx, dy), min = ra + rb + gap;
          if (dist < min && dist > 0.001) {
            const push = (min - dist) / 2; dx /= dist; dy /= dist;
            a.x -= dx * push; a.y -= dy * push; b.x += dx * push; b.y += dy * push;
          }
        }
      }
    }
  };
  window.Particles = P;
})();
