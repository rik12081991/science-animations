// URL parameters and a postMessage API for embedding in another site.
//   ?topic=electrolysis&preset=brine&mode=embed&power=1&labels=name
//   mode=embed  hides header and design panel (also the default inside an iframe)
//   mode=full   forces the full UI even inside an iframe
//   controls=0  hides the teaching panel too
//   designer=1  shows the design panel in embed mode
//   design={"colour.background":"#000"}   JSON design overrides
//   autoplay=0  start paused
(function () {
  const params = new URLSearchParams(location.search);
  const inFrame = window.self !== window.top;
  const Embed = {
    params,
    get mode() { return params.get('mode') || (inFrame ? 'embed' : 'full'); },
    get isEmbed() { return this.mode === 'embed'; },
    flag(name, def) {
      if (!params.has(name)) return def;
      return ['1', 'true', 'on', 'yes'].includes(params.get(name).toLowerCase());
    },
    designOverrides() {
      const raw = params.get('design'); if (!raw) return {};
      try { return JSON.parse(raw); } catch (e) { console.warn('Bad design param', e); return {}; }
    },
    controlOverrides(schema) {
      const out = {};
      schema.forEach(item => {
        if (!params.has(item.id)) return;
        const raw = params.get(item.id);
        if (item.type === 'toggle') out[item.id] = ['1', 'true', 'on', 'yes'].includes(raw.toLowerCase());
        else if (item.type === 'range') out[item.id] = parseFloat(raw);
        else if (item.type !== 'button') out[item.id] = raw;
      });
      return out;
    },
    listen(app) {
      window.addEventListener('message', ev => {
        const m = ev.data;
        if (!m || typeof m !== 'object' || !m.cmd) return;
        switch (m.cmd) {
          case 'preset': app.setPreset(m.id); break;
          case 'control': app.setControl(m.id, m.value); break;
          case 'play': app.engine.play(); break;
          case 'pause': app.engine.pause(); break;
          case 'step': app.engine.step(); break;
          case 'reset': app.reset(); break;
          case 'speed': app.engine.setSpeed(Number(m.value) || 1); break;
          case 'design': app.design.applyJson(m.values || {}); break;
        }
      });
    },
    notify(event, data) {
      if (!inFrame) return;
      try { window.parent.postMessage(Object.assign({ source: 'science-animations', event }, data || {}), '*'); } catch (e) { /* ignore */ }
    }
  };
  window.Embed = Embed;
})();
