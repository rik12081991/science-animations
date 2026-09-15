// HiDPI canvas plus drawing helpers. All coordinates are CSS pixels.
(function () {
  function create(container, opts) {
    opts = opts || {};
    const aspect = opts.aspect || 0.64;
    const el = document.createElement('canvas');
    el.className = 'sim-canvas';
    container.appendChild(el);
    const ctx = el.getContext('2d');
    const api = { el, ctx, w: 0, h: 0, dpr: 1, resize, onResize: null };
    function resize() {
      const cssW = container.clientWidth || 800;
      const cssH = Math.round(cssW * aspect);
      const dpr = Math.min(window.devicePixelRatio || 1, 3);
      if (cssW === api.w && cssH === api.h && dpr === api.dpr) return;
      api.w = cssW; api.h = cssH; api.dpr = dpr;
      el.style.width = cssW + 'px';
      el.style.height = cssH + 'px';
      el.width = Math.round(cssW * dpr);
      el.height = Math.round(cssH * dpr);
      if (api.onResize) api.onResize(cssW, cssH);
    }
    window.addEventListener('resize', resize);
    if (window.ResizeObserver) new ResizeObserver(() => requestAnimationFrame(resize)).observe(container);
    resize();
    return api;
  }

  function hexToRgb(hex) {
    hex = (hex || '#000000').replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    const n = parseInt(hex, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function withAlpha(hex, a) {
    if (hex.startsWith('rgb')) return hex;
    const [r, g, b] = hexToRgb(hex);
    return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
  }
  function contrastText(hex) {
    const [r, g, b] = hexToRgb(hex);
    const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return lum > 0.6 ? '#111827' : '#ffffff';
  }
  function darken(hex, f) {
    const [r, g, b] = hexToRgb(hex).map(v => Math.round(v * (1 - f)));
    return 'rgb(' + r + ',' + g + ',' + b + ')';
  }

  // Formula strings: "_" + digits = subscript, "^" + run = superscript.
  //   "SO_4^2-"  "2H^+ + 2e^- → H_2"
  function parseFormula(str) {
    const parts = []; let i = 0, cur = '';
    const flush = () => { if (cur) { parts.push({ t: 'main', s: cur }); cur = ''; } };
    while (i < str.length) {
      const ch = str[i];
      if (ch === '_') {
        flush(); let j = i + 1, s = '';
        while (j < str.length && /[0-9]/.test(str[j])) { s += str[j]; j++; }
        parts.push({ t: 'sub', s }); i = j;
      } else if (ch === '^') {
        flush(); let j = i + 1, s = '';
        while (j < str.length && !' ),.;:'.includes(str[j])) { s += str[j]; j++; }
        parts.push({ t: 'sup', s: s.replace(/-/g, '−') }); i = j;
      } else { cur += ch; i++; }
    }
    flush();
    return parts;
  }

  function G(canvas) {
    const ctx = canvas.ctx;
    const defaultFont = 'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
    function fontStr(o) {
      const fam = o.font && o.font !== 'system-ui' ? '"' + o.font + '", ' + defaultFont : defaultFont;
      return (o.weight || '400') + ' ' + (o.size || 14) + 'px ' + fam;
    }
    function measureParts(parts, o) {
      const size = o.size || 14, small = size * 0.68;
      let w = 0;
      parts.forEach(p => {
        ctx.font = fontStr(Object.assign({}, o, { size: p.t === 'main' ? size : small }));
        p.w = ctx.measureText(p.s).width; w += p.w;
      });
      return w;
    }
    const g = {
      ctx,
      get w() { return canvas.w; },
      get h() { return canvas.h; },
      withAlpha, contrastText, darken,
      mix(a, b, k) {
        const A = hexToRgb(a), B = hexToRgb(b); k = Math.max(0, Math.min(1, k));
        return 'rgb(' + A.map((v, i) => Math.round(v + (B[i] - v) * k)).join(',') + ')';
      },
      begin(bg) {
        ctx.setTransform(canvas.dpr, 0, 0, canvas.dpr, 0, 0);
        ctx.globalAlpha = 1;
        ctx.fillStyle = bg || '#fff';
        ctx.fillRect(0, 0, canvas.w, canvas.h);
      },
      alpha(a, fn) { const prev = ctx.globalAlpha; ctx.globalAlpha = prev * a; fn(); ctx.globalAlpha = prev; },
      circle(x, y, r, fill, stroke, lw) {
        if (r <= 0) return;
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
        if (fill) { ctx.fillStyle = fill; ctx.fill(); }
        if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw || 1; ctx.stroke(); }
      },
      ellipse(x, y, rx, ry, fill) {
        ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
        ctx.fillStyle = fill; ctx.fill();
      },
      rect(x, y, w, h, fill, stroke, lw) {
        if (fill) { ctx.fillStyle = fill; ctx.fillRect(x, y, w, h); }
        if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw || 1; ctx.strokeRect(x, y, w, h); }
      },
      roundRect(x, y, w, h, r, fill, stroke, lw) {
        ctx.beginPath();
        ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath();
        if (fill) { ctx.fillStyle = fill; ctx.fill(); }
        if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw || 1; ctx.stroke(); }
      },
      path(points, color, lw, dash) {
        if (points.length < 2) return;
        ctx.beginPath(); ctx.moveTo(points[0][0], points[0][1]);
        for (let i = 1; i < points.length; i++) ctx.lineTo(points[i][0], points[i][1]);
        ctx.strokeStyle = color; ctx.lineWidth = lw || 1; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
        ctx.setLineDash(dash || []); ctx.stroke(); ctx.setLineDash([]);
      },
      line(x1, y1, x2, y2, color, lw, dash) { g.path([[x1, y1], [x2, y2]], color, lw, dash); },
      arrow(x1, y1, x2, y2, color, lw, head) {
        head = head || 8;
        g.line(x1, y1, x2, y2, color, lw);
        const a = Math.atan2(y2 - y1, x2 - x1);
        ctx.beginPath(); ctx.moveTo(x2, y2);
        ctx.lineTo(x2 - head * Math.cos(a - 0.5), y2 - head * Math.sin(a - 0.5));
        ctx.lineTo(x2 - head * Math.cos(a + 0.5), y2 - head * Math.sin(a + 0.5));
        ctx.closePath(); ctx.fillStyle = color; ctx.fill();
      },
      arrowHead(x, y, angle, color, size) {
        ctx.beginPath(); ctx.moveTo(x + size * Math.cos(angle), y + size * Math.sin(angle));
        ctx.lineTo(x + size * Math.cos(angle + 2.5), y + size * Math.sin(angle + 2.5));
        ctx.lineTo(x + size * Math.cos(angle - 2.5), y + size * Math.sin(angle - 2.5));
        ctx.closePath(); ctx.fillStyle = color; ctx.fill();
      },
      text(x, y, str, o) {
        o = o || {};
        ctx.font = fontStr(o); ctx.fillStyle = o.color || '#000';
        ctx.textAlign = o.align || 'left'; ctx.textBaseline = o.baseline || 'middle';
        ctx.fillText(str, x, y);
        return ctx.measureText(str).width;
      },
      textWidth(str, o) { ctx.font = fontStr(o || {}); return ctx.measureText(str).width; },
      formula(x, y, str, o) {
        o = o || {};
        const parts = parseFormula(str);
        const total = measureParts(parts, o);
        const size = o.size || 14, small = size * 0.68;
        let cx = x;
        if (o.align === 'center') cx = x - total / 2; else if (o.align === 'right') cx = x - total;
        ctx.textAlign = 'left'; ctx.textBaseline = o.baseline || 'middle'; ctx.fillStyle = o.color || '#000';
        parts.forEach(p => {
          const isMain = p.t === 'main';
          ctx.font = fontStr(Object.assign({}, o, { size: isMain ? size : small }));
          const dy = p.t === 'sub' ? size * 0.28 : p.t === 'sup' ? -size * 0.42 : 0;
          ctx.fillText(p.s, cx, y + dy); cx += p.w;
        });
        return total;
      },
      formulaWidth(str, o) { return measureParts(parseFormula(str), o || {}); },
      // Draw a formula, shrinking the font until it fits maxWidth.
      formulaFit(x, y, str, o, maxWidth) {
        o = Object.assign({}, o);
        let w = g.formulaWidth(str, o);
        while (w > maxWidth && o.size > 6) { o.size *= 0.9; w = g.formulaWidth(str, o); }
        return g.formula(x, y, str, o);
      }
    };
    return g;
  }
  window.SimCanvas = { create, G, withAlpha, contrastText };
})();
