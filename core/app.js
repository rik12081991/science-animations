// App shell: builds the page around a topic, wires engine, panels, embed and keyboard.
(function () {
  const el = Controls.el;

  function start(opts) {
    const topic = Topics.get(opts.topicId);
    const root = opts.root;
    root.innerHTML = '';
    const embed = Embed.isEmbed;
    document.body.classList.toggle('embed', embed);
    document.title = topic.title + ' · Science Animations';

    // Header
    const header = el('header', 'app-header');
    if (!embed && Topics.list().length > 1) {
      const back = el('a', 'app-back', '‹ Topics'); back.href = location.pathname; header.appendChild(back);
    }
    header.appendChild(el('h1', 'app-title', topic.title));
    const focusBtn = el('button', 'btn app-focus', 'Focus'); focusBtn.type = 'button';
    if (!embed) header.appendChild(focusBtn);
    root.appendChild(header);

    // Stage
    const stage = el('div', 'stage');
    root.appendChild(stage);
    const canvas = SimCanvas.create(stage, { aspect: topic.aspect || 0.64 });
    const overlay = el('div', 'stage-overlay');
    stage.appendChild(overlay);
    const g = SimCanvas.G(canvas);

    // Transport
    const transport = el('div', 'transport');
    const playBtn = el('button', 'btn primary', 'Pause'); playBtn.type = 'button';
    const stepBtn = el('button', 'btn', 'Step'); stepBtn.type = 'button';
    const resetBtn = el('button', 'btn', 'Reset'); resetBtn.type = 'button';
    const speedWrap = el('label', 'speed');
    speedWrap.appendChild(el('span', null, 'Speed'));
    const speed = el('input'); speed.type = 'range'; speed.min = 0.25; speed.max = 3; speed.step = 0.25; speed.value = 1;
    const speedOut = el('output', 'ctl-value', '1×');
    speedWrap.appendChild(speed); speedWrap.appendChild(speedOut);
    [playBtn, stepBtn, resetBtn, speedWrap].forEach(b => transport.appendChild(b));
    root.appendChild(transport);

    // Panels
    const student = !!(window.BUILD && window.BUILD.student);   // student build: no design panel, design fixed by the baked file
    const teachPanel = el('details', 'panel panel-teach');
    const summary = el('summary', null, student ? 'Setup controls' : 'Teaching controls'); teachPanel.appendChild(summary);
    if (window.BUILD && window.BUILD.version) summary.appendChild(el('span', 'build-stamp', 'build ' + window.BUILD.version));   // which push this page came from
    const teachBody = el('div', 'panel-body'); teachPanel.appendChild(teachBody);
    teachPanel.open = !embed;
    if (embed && !Embed.flag('controls', true)) teachPanel.hidden = true;
    root.appendChild(teachPanel);

    const designPanel = el('details', 'panel panel-design');
    designPanel.appendChild(el('summary', null, 'Design (colours, sizes, text)'));
    const designBody = el('div', 'panel-body'); designPanel.appendChild(designBody);
    if (student || (embed && !Embed.flag('designer', false))) designPanel.hidden = true;
    root.appendChild(designPanel);

    // Design values
    const baked = (window.TopicDesigns && window.TopicDesigns[topic.id]) || {};
    const design = Design.create({
      topicId: topic.id, schema: topic.designSchema || [], baked, locked: student,
      urlOverrides: Embed.designOverrides(), container: designBody,
      onChange: () => { if (sim && sim.onDesignChange) sim.onDesignChange(); }
    });

    // Teaching controls
    let sim = null;
    const controlInit = Embed.controlOverrides(topic.controls || []);
    const presetParam = Embed.params.get('preset');
    if (presetParam && topic.presets.some(p => p.id === presetParam)) controlInit.preset = presetParam;
    const controls = Controls.build(teachBody, topic.controls || [], controlInit, (id, v, values, item) => {
      if (!sim) return;
      if (id === 'preset') sim.reset(v);
      else if (item && item.type === 'button') sim.action(id);
      else if (sim.onControl) sim.onControl(id, v);
      Embed.notify('control', { id, value: v });
    });

    sim = topic.create({ g, canvas, controls, design, overlay });
    const engine = Engine.create({ update: dt => sim.update(dt), draw: () => sim.draw() });
    sim.reset(controls.values.preset || (topic.presets[0] && topic.presets[0].id));

    function syncPlay() { playBtn.textContent = engine.playing ? 'Pause' : 'Play'; }
    engine.onChange = syncPlay;
    playBtn.addEventListener('click', () => { engine.toggle(); });
    stepBtn.addEventListener('click', () => { engine.step(); });
    function reset() {
      if (topic.resetControls) topic.resetControls(controls);
      sim.reset(controls.values.preset);
    }
    resetBtn.addEventListener('click', reset);
    speed.addEventListener('input', () => { engine.setSpeed(parseFloat(speed.value)); speedOut.textContent = speed.value + '×'; });

    // Focus mode: hide chrome, try fullscreen
    focusBtn.addEventListener('click', () => {
      const on = document.body.classList.toggle('focus');
      focusBtn.textContent = on ? 'Exit focus' : 'Focus';
      teachPanel.open = !on;
      try {
        if (on && root.requestFullscreen) root.requestFullscreen();
        else if (on && root.webkitRequestFullscreen) root.webkitRequestFullscreen();
        else if (!on && document.fullscreenElement && document.exitFullscreen) document.exitFullscreen();
      } catch (e) { /* not supported */ }
      setTimeout(canvas.resize, 50);
    });
    document.addEventListener('fullscreenchange', () => {
      if (!document.fullscreenElement && document.body.classList.contains('focus')) {
        document.body.classList.remove('focus'); focusBtn.textContent = 'Focus'; teachPanel.open = true;
      }
      setTimeout(canvas.resize, 50);
    });

    // Keyboard (desktop convenience)
    document.addEventListener('keydown', ev => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) return;
      if (overlay.childElementCount) return;
      if (ev.key === ' ') { ev.preventDefault(); engine.toggle(); }
      else if (ev.key === 'ArrowRight') { engine.step(); }
      else if (ev.key.toLowerCase() === 'r') { reset(); }
      else if (ev.key.toLowerCase() === 'p' && controls.values.power !== undefined) { controls.set('power', !controls.values.power); }
      else if (ev.key.toLowerCase() === 'n' && sim.action) { sim.action('next'); }
      else if (ev.key.toLowerCase() === 'b' && sim.action) { sim.action('back'); }
    });

    engine.start();
    if (Embed.flag('autoplay', true)) engine.play();
    syncPlay();

    const app = {
      topic, engine, controls, design, sim, reset,
      setPreset(id) { controls.set('preset', id); },
      setControl(id, v) { controls.set(id, v); }
    };
    Embed.listen(app);
    Embed.notify('ready', { topic: topic.id });
    window.app = app;
    return app;
  }

  function launcher(root) {
    root.innerHTML = '';
    const header = el('header', 'app-header');
    header.appendChild(el('h1', 'app-title', 'Science Animations'));
    root.appendChild(header);
    const list = el('div', 'launcher');
    Topics.list().forEach(t => {
      const a = el('a', 'launch-card');
      a.href = '?topic=' + encodeURIComponent(t.id);
      a.appendChild(el('div', 'launch-title', t.title));
      if (t.description) a.appendChild(el('div', 'launch-desc', t.description));
      list.appendChild(a);
    });
    root.appendChild(list);
  }

  function registerSW() {
    if (!('serviceWorker' in navigator) || location.protocol !== 'https:') return;
    navigator.serviceWorker.register('sw.js').catch(() => { /* optional */ });
  }

  function boot(root) {
    const list = Topics.list();
    const id = Embed.params.get('topic') || window.DEFAULT_TOPIC || (list.length === 1 ? list[0].id : null);
    if (id && Topics.get(id)) start({ topicId: id, root });
    else launcher(root);
    registerSW();
  }

  window.App = { start, launcher, boot };
})();
