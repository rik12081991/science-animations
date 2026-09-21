// Ray-diagram helpers shared by the optics topics (reflection, refraction, lens).
// Rays.create(g) binds the drawing functions to a canvas; all coordinates are canvas pixels.
//   ray(a, b, o)            straight ray a -> b. o: { colour, width, frac (0..1 drawn so far), dashed,
//                           arrow (true = head part way along, false = none), arrowAt (0..1), head (px) }
//   normal(p, dir, len, o)  dashed line through p perpendicular to a surface running along unit vector dir;
//                           drawn `len` px on the front side (o.side = -1 flips), o.back px on the other side
//   angleArc(v, a1, a2, r, o) arc at vertex v between angles a1 and a2 (radians) with a label at the middle
//   label(x, y, text, o)    text on a rounded background pill so it reads over rays
//   wavelengthColour(nm)    approximate visible colour for a wavelength in nm (380-700)
(function () {
  const TAU = Math.PI * 2;
  function norm(a) { a %= TAU; if (a < 0) a += TAU; return a; }

  function wavelengthColour(nm) {
    let r = 0, g = 0, b = 0;
    if (nm < 440) { r = -(nm - 440) / 60; b = 1; }
    else if (nm < 490) { g = (nm - 440) / 50; b = 1; }
    else if (nm < 510) { g = 1; b = -(nm - 510) / 20; }
    else if (nm < 580) { r = (nm - 510) / 70; g = 1; }
    else if (nm < 645) { r = 1; g = -(nm - 645) / 65; }
    else { r = 1; }
    let f = 1;
    if (nm < 420) f = 0.3 + 0.7 * (nm - 380) / 40; else if (nm > 700) f = 0.3 + 0.7 * (780 - nm) / 80;
    const c = v => Math.round(255 * Math.max(0, Math.min(1, v * f)));
    return 'rgb(' + c(r) + ',' + c(g) + ',' + c(b) + ')';
  }

  function create(g) {
    const ctx = g.ctx;

    function ray(a, b, o) {
      o = o || {};
      const frac = o.frac == null ? 1 : Math.max(0, Math.min(1, o.frac));
      if (frac <= 0) return;
      const x2 = a[0] + (b[0] - a[0]) * frac, y2 = a[1] + (b[1] - a[1]) * frac;
      const w = o.width || 2, col = o.colour || '#000';
      g.line(a[0], a[1], x2, y2, col, w, o.dashed ? [w * 3, w * 2.5] : null);
      if (o.arrow !== false && frac >= (o.arrowAt == null ? 0.55 : o.arrowAt)) {
        const t = o.arrowAt == null ? 0.55 : o.arrowAt;
        const hx = a[0] + (b[0] - a[0]) * t, hy = a[1] + (b[1] - a[1]) * t;
        g.arrowHead(hx, hy, Math.atan2(b[1] - a[1], b[0] - a[0]), col, o.head || w * 4.5);
      }
    }

    function normal(p, dir, len, o) {
      o = o || {};
      const side = o.side || -1;                     // -1: front side is the left-hand side of dir (screen y down)
      const nx = -dir[1] * side, ny = dir[0] * side; // unit normal on the front side
      const w = o.width || 1.5, col = o.colour || '#000';
      const back = o.back || 0;
      g.line(p[0] - nx * back, p[1] - ny * back, p[0] + nx * len, p[1] + ny * len, col, w, [w * 4, w * 3]);
      if (o.label) label(p[0] + nx * (len + (o.labelGap || 12)), p[1] + ny * (len + (o.labelGap || 12)), o.label, o);
      return [nx, ny];
    }

    function angleArc(v, a1, a2, r, o) {
      o = o || {};
      let d = norm(a2 - a1); if (d > Math.PI) { const t = a1; a1 = a2; a2 = t; d = TAU - d; }
      const col = o.colour || '#000', w = o.width || 1.5;
      ctx.beginPath(); ctx.arc(v[0], v[1], r, a1, a1 + d);
      ctx.strokeStyle = col; ctx.lineWidth = w; ctx.setLineDash([]); ctx.stroke();
      if (o.fill !== false) { ctx.lineTo(v[0], v[1]); ctx.closePath(); ctx.fillStyle = g.withAlpha(col, 0.12); ctx.fill(); }
      if (o.label) {
        const m = a1 + d / 2, rr = r * (o.labelR || 1.45);
        label(v[0] + rr * Math.cos(m), v[1] + rr * Math.sin(m), o.label, Object.assign({ colour: col, align: 'center' }, o.text || {}));
      }
    }

    function label(x, y, text, o) {
      o = o || {};
      const size = o.size || 13, font = o.font, weight = o.weight || '700';
      const tw = g.formulaWidth(text, { size, font, weight });
      const pad = size * 0.35, h = size * 1.4, w = tw + 2 * pad;
      let x0 = x - pad; if (o.align === 'center') x0 = x - w / 2; else if (o.align === 'right') x0 = x - w + pad;
      if (o.bg !== false) g.roundRect(x0, y - h / 2, w, h, h / 3, o.bg || 'rgba(255,255,255,0.85)');
      g.formula(x0 + pad, y, text, { size, font, weight, color: o.colour || '#000' });
    }

    return { ray, normal, angleArc, label, wavelengthColour };
  }
  window.Rays = { create, wavelengthColour };
})();
