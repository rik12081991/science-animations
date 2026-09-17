// Hydrogen-oxygen fuel cell. Hydrogen is oxidised at the anode (negative electrode), electrons flow round
// the external circuit and power a bulb, ions cross the electrolyte, oxygen is reduced at the cathode
// (positive electrode). Water is the only product. Two presets: acidic (PEM) and alkaline half-equations.
(function () {
  const P = window.Particles;

  const PRESETS = [
    { id: 'acid', title: 'Acidic electrolyte (H⁺ ions cross)', electrolyte: 'acid',
      anodeEq: 'H_2 → 2H^+ + 2e^-', cathodeEq: 'O_2 + 4H^+ + 4e^- → 2H_2O', ion: 'H+', waterAt: 'cathode',
      note: 'The electrolyte only lets H^+ ions through. Half-equations in the acidic form.' },
    { id: 'alkaline', title: 'Alkaline electrolyte (OH⁻ ions cross)', electrolyte: 'alkaline',
      anodeEq: '2H_2 + 4OH^- → 4H_2O + 4e^-', cathodeEq: 'O_2 + 2H_2O + 4e^- → 4OH^-', ion: 'OH-', waterAt: 'anode',
      note: 'Potassium hydroxide solution supplies OH^- ions. Half-equations in the alkaline form.' }
  ];
  const OVERALL = '2H_2 + O_2 → 2H_2O';
  const PRESET_BY_ID = {}; PRESETS.forEach(p => { PRESET_BY_ID[p.id] = p; });
  const NAMES = { H2: 'hydrogen molecule', O2: 'oxygen molecule', 'H+': 'hydrogen ion', 'OH-': 'hydroxide ion', H2O: 'water molecule' };
  const FORM = { H2: 'H_2', O2: 'O_2', 'H+': 'H^+', 'OH-': 'OH^-', H2O: 'H_2O' };

  const FONTS = ['system-ui', 'Helvetica Neue', 'Arial', 'Arial Rounded MT Bold', 'Verdana', 'Trebuchet MS', 'Georgia', 'Chalkboard SE', 'Comic Sans MS', 'Courier New'];
  const designSchema = [
    { id: 'colour.background', type: 'colour', label: 'Background', default: '#ffffff', group: 'Colours' },
    { id: 'colour.gasChamber', type: 'colour', label: 'Gas chambers', default: '#f1f5f9', group: 'Colours' },
    { id: 'colour.electrolyteAcid', type: 'colour', label: 'Acidic electrolyte', default: '#fef3c7', group: 'Colours' },
    { id: 'colour.electrolyteAlkaline', type: 'colour', label: 'Alkaline electrolyte', default: '#dcfce7', group: 'Colours' },
    { id: 'colour.electrode', type: 'colour', label: 'Electrodes', default: '#334155', group: 'Colours' },
    { id: 'colour.wire', type: 'colour', label: 'Wires', default: '#475569', group: 'Colours' },
    { id: 'colour.electron', type: 'colour', label: 'Electrons', default: '#eab308', group: 'Colours' },
    { id: 'colour.bulb', type: 'colour', label: 'Bulb glow', default: '#fbbf24', group: 'Colours' },
    { id: 'colour.text', type: 'colour', label: 'Text', default: '#0f172a', group: 'Colours' },
    { id: 'colour.H2', type: 'colour', label: 'Hydrogen molecules', default: '#e2e8f0', group: 'Particle colours' },
    { id: 'colour.O2', type: 'colour', label: 'Oxygen molecules', default: '#ef4444', group: 'Particle colours' },
    { id: 'colour.H+', type: 'colour', label: 'Hydrogen ions', default: '#dc2626', group: 'Particle colours' },
    { id: 'colour.OH-', type: 'colour', label: 'Hydroxide ions', default: '#0d9488', group: 'Particle colours' },
    { id: 'colour.H2O', type: 'colour', label: 'Water molecules', default: '#3b82f6', group: 'Particle colours' },
    { id: 'size.particle', type: 'range', label: 'Particle size', min: 8, max: 26, step: 1, default: 14, unit: 'px', group: 'Sizes' },
    { id: 'size.electron', type: 'range', label: 'Electron size', min: 0.5, max: 3, step: 0.1, default: 1, group: 'Sizes' },
    { id: 'motion.jitter', type: 'range', label: 'Random wobble', min: 0, max: 3, step: 0.1, default: 1, group: 'Motion' },
    { id: 'motion.drift', type: 'range', label: 'Drift speed', min: 0.2, max: 3, step: 0.1, default: 1, group: 'Motion' },
    { id: 'motion.reaction', type: 'range', label: 'Reaction animation time (electrons move, then particles change)', min: 0.4, max: 3, step: 0.1, default: 1.6, unit: 's', group: 'Motion' },
    { id: 'motion.electronSpeed', type: 'range', label: 'Electron speed in wires', min: 0.2, max: 3, step: 0.1, default: 1, group: 'Motion' },
    { id: 'motion.h2Count', type: 'range', label: 'Hydrogen molecules (free mode)', min: 1, max: 12, step: 1, default: 5, group: 'Motion' },
    { id: 'motion.o2Count', type: 'range', label: 'Oxygen molecules (free mode)', min: 1, max: 6, step: 1, default: 3, group: 'Motion' },
    { id: 'text.font', type: 'select', label: 'Font', options: FONTS, default: 'system-ui', group: 'Text' },
    { id: 'text.size', type: 'range', label: 'Text size', min: 10, max: 26, step: 1, default: 15, unit: 'px', group: 'Text' },
    { id: 'text.equationSize', type: 'range', label: 'Half-equation size', min: 12, max: 32, step: 1, default: 18, unit: 'px', group: 'Text' },
    { id: 'text.flowSize', type: 'range', label: 'Flow diagram text size', min: 8, max: 20, step: 1, default: 13, unit: 'px', group: 'Text' },
    { id: 'text.electrodeNames', type: 'segmented', label: 'Electrode names', options: [{ value: 'symbols', label: 'anode (−)' }, { value: 'words', label: 'negative electrode' }, { value: 'both', label: 'Both' }], default: 'both', group: 'Text' },
    { id: 'text.showTitle', type: 'toggle', label: 'Show title', default: true, group: 'Text' },
    { id: 'text.showCounters', type: 'toggle', label: 'Show counters (free mode)', default: true, group: 'Text' },
    { id: 'layout.cellWidth', type: 'range', label: 'Cell width', min: 0.4, max: 0.7, step: 0.02, default: 0.56, group: 'Layout' },
    { id: 'layout.electrodeWidth', type: 'range', label: 'Electrode width', min: 0.015, max: 0.05, step: 0.005, default: 0.028, group: 'Layout' },
    { id: 'layout.showFlow', type: 'toggle', label: 'Show flow diagram (step mode)', default: true, group: 'Layout' },
    { id: 'layout.glow', type: 'toggle', label: 'Glow when particles react', default: true, group: 'Layout' }
  ];

  const controls = [
    { id: 'preset', type: 'select', label: 'Electrolyte', options: PRESETS.map(p => ({ value: p.id, label: p.title })), default: 'acid' },
    { id: 'guide', type: 'segmented', label: 'Mode', options: [{ value: 'steps', label: 'Step by step' }, { value: 'study', label: 'Study (questions)' }, { value: 'free', label: 'Free running' }], default: 'steps' },
    { id: 'difficulty', type: 'segmented', label: 'Question difficulty', options: [{ value: 'easy', label: 'Easy' }, { value: 'medium', label: 'Medium' }, { value: 'hard', label: 'Hard (type answers)' }], default: 'easy', showIf: v => v.guide === 'study' },
    { id: 'next', type: 'button', label: 'Next step ›', primary: true, showIf: v => v.guide !== 'free' },
    { id: 'back', type: 'button', label: '‹ Back', showIf: v => v.guide !== 'free' },
    { id: 'switch', type: 'toggle', label: 'Circuit switch closed', default: false, showIf: v => v.guide === 'free' },
    { id: 'h2supply', type: 'toggle', label: 'Hydrogen supply on', default: true, showIf: v => v.guide === 'free' },
    { id: 'o2supply', type: 'toggle', label: 'Oxygen supply on', default: true, showIf: v => v.guide === 'free' },
    { id: 'labels', type: 'segmented', label: 'Particle labels', options: ['formula', 'none'], default: 'formula' },
    { id: 'equations', type: 'segmented', label: 'Half-equations (free mode)', options: [{ value: 'auto', label: 'When it happens' }, { value: 'always', label: 'Always' }, { value: 'off', label: 'Off' }], default: 'auto', showIf: v => v.guide === 'free' }
  ];
  ['H2', 'O2', 'H+', 'OH-', 'H2O'].forEach(k => controls.push({
    id: 'show.' + k, type: 'toggle', label: 'Show ' + NAMES[k] + 's', default: true,
    showIf: v => { const pr = PRESET_BY_ID[v.preset]; return !!pr && (k !== 'H+' && k !== 'OH-' || pr.ion === k); }
  }));

  // ---------------------------------------------------------------- typed-answer helpers
  const SUPS = { '⁺': '+', '⁻': '-', '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '₀': '0', '₁': '1', '₂': '2', '₃': '3', '₄': '4' };
  const norm = t => String(t || '').toLowerCase().replace(/[⁺⁻⁰¹²³⁴₀₁₂₃₄]/g, ch => SUPS[ch]).replace(/\s+/g, '')
    .replace(/[−–]/g, '-').replace(/→|-->|->|=>|=/g, '>').replace(/[\^_]/g, '').replace(/\((g|l|aq)\)/g, '');
  const eqKey = t => norm(t).replace(/oh-/g, 'Q').replace(/e-|e\b/g, 'E').replace(/h\+/g, 'P')
    .split('>').map(side => side.split('+').filter(Boolean).sort().join('+')).join('>');
  const eqCheck = eq => t => eqKey(t) === eqKey(eq);
  const wordCheck = words => t => words.some(w => norm(t).includes(norm(w)));
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const opt = (label, correct) => ({ label, correct: !!correct });

  // ---------------------------------------------------------------- simulation
  function create(ctx) {
    const g = ctx.g;
    const C = () => ctx.controls.values, D = () => ctx.design.values;
    let preset, mols = [], stored = { anode: 0, cathode: 0 }, transit = [], counts, litTimer, time, shownEq;
    let steps = [], storyStep = 0, asked = {}, score = { right: 0, total: 0 }, btnRects = {}, spawnTimer = 0;
    const isStory = () => C().guide !== 'free', isStudy = () => C().guide === 'study';
    const flags = () => isStory() ? steps[storyStep].flags : null;
    const s0 = () => g.w / 800;
    const pr = () => D()['size.particle'] * s0();

    function layout() {
      const d = D(), w = g.w, h = g.h, s = s0();
      const cw = w * d['layout.cellWidth'], cell = { x: (w - cw) / 2, y: h * 0.3, w: cw, h: h * 0.46 };
      const ew = w * d['layout.electrodeWidth'];
      const chamberW = cw * 0.25, elecW = cw - 2 * chamberW;
      const anode = { x: cell.x + chamberW, y: cell.y, w: ew, h: cell.h, name: 'anode' };
      const cathode = { x: cell.x + chamberW + elecW - ew, y: cell.y, w: ew, h: cell.h, name: 'cathode' };
      anode.cx = anode.x + ew / 2; cathode.cx = cathode.x + ew / 2;
      const h2 = { x: cell.x, y: cell.y, w: chamberW, h: cell.h }, o2 = { x: cathode.x + ew, y: cell.y, w: chamberW, h: cell.h };
      const lyte = { x: anode.x + ew, y: cell.y, w: cathode.x - anode.x - ew, h: cell.h };
      const yw = h * 0.13, m = w * 0.015;
      const wire = [[anode.cx, cell.y], [anode.cx, yw], [cathode.cx, yw], [cathode.cx, cell.y]];
      const flowTop = h * 0.2, flowBottom = h * 0.84;
      return { s, cell, anode, cathode, h2, o2, lyte, wire, yw, bulb: { x: w / 2, y: yw, r: w * 0.032 },
        sw: { x1: w / 2 + (cathode.cx - w / 2) * 0.55, x2: w / 2 + (cathode.cx - w / 2) * 0.75, y: yw },
        flow: { anode: { x: m, y: flowTop, w: cell.x - 2 * m, h: flowBottom - flowTop }, cathode: { x: cell.x + cell.w + m, y: flowTop, w: w - cell.x - cell.w - 2 * m, h: flowBottom - flowTop } },
        chamber: k => k === 'H2' ? h2 : k === 'O2' ? o2 : lyte };
    }
    // positions are stored as fractions of the particle's own region so the canvas can resize
    const px = (p, L) => { const R = L.chamber(p.k === 'H2O' ? p.zone : p.k === 'H2' ? 'H2' : p.k === 'O2' ? 'O2' : 'lyte'); return [R.x + p.u * R.w, R.y + p.v * R.h]; };
    const setPx = (p, x, y, L) => { const R = L.chamber(p.k === 'H2O' ? p.zone : p.k === 'H2' ? 'H2' : p.k === 'O2' ? 'O2' : 'lyte'); p.u = (x - R.x) / R.w; p.v = (y - R.y) / R.h; };
    const radiusOf = p => { const r = pr(); return p.k === 'H+' ? r * 0.6 : p.k === 'OH-' ? r * 0.8 : p.k === 'H2O' ? r * 0.85 : r * 1.25; };
    function newMol(k, u, v, zone) { return { k, u, v, vx: 0, vy: 0, state: 'free', t: 0, zone: zone || null, scale: 1 }; }

    function reset(id) {
      preset = PRESET_BY_ID[id] || PRESETS[0];
      steps = buildStory(); storyStep = 0; asked = {}; score = { right: 0, total: 0 };
      Quiz.close(ctx.overlay);
      resetState();
    }
    function resetState() {
      mols = []; transit = []; stored = { anode: 0, cathode: 0 }; counts = { H2: 0, O2: 0, H2O: 0 };
      litTimer = 0; time = 0; spawnTimer = 0; shownEq = { anode: false, cathode: false };
      if (!isStory()) { populateFree(); }
      else if (storyStep > 0) populateStory();
    }
    function populateStory() {
      mols.push(newMol('H2', 0.5, 0.38), newMol('H2', 0.5, 0.62), newMol('O2', 0.5, 0.5));
      if (preset.ion === 'OH-') for (let i = 0; i < 4; i++) mols.push(newMol('OH-', 0.5, 0.2 + i * 0.2));
    }
    function populateFree() {
      const d = D();
      for (let i = 0; i < d['motion.h2Count']; i++) mols.push(newMol('H2', P.rand(0.2, 0.8), P.rand(0.1, 0.9)));
      for (let i = 0; i < d['motion.o2Count']; i++) mols.push(newMol('O2', P.rand(0.2, 0.8), P.rand(0.1, 0.9)));
      if (preset.ion === 'OH-') for (let i = 0; i < 6; i++) mols.push(newMol('OH-', P.rand(0.1, 0.9), P.rand(0.1, 0.9)));
    }
    function setStep(i) {
      storyStep = Math.max(0, Math.min(steps.length - 1, i));
      if (storyStep > 0 && !mols.length) populateStory();
      if (storyStep === 0) resetState();
    }
    function action(id) {
      if (id === 'next') {
        if (ctx.overlay.childElementCount) return;
        if (storyStep >= steps.length - 1) reset(preset.id);
        else if (isStudy() && !asked[storyStep + 1] && questionsFor(storyStep + 1).length) openQuestion(storyStep + 1);
        else setStep(storyStep + 1);
      }
      if (id === 'back') { if (ctx.overlay.childElementCount) return; if (storyStep > 0) setStep(storyStep - 1); }
    }
    function onControl(id) { if (id === 'guide' || id === 'difficulty') reset(preset.id); }

    // ---------------------------------------------------------------- story
    function buildStory() {
      const acid = preset.ion === 'H+';
      const S = [], f = {};
      const add = (key, text, patch, flow) => { Object.assign(f, patch || {}); S.push({ key, text, flags: Object.assign({}, f), flow: flow || null }); };
      add('start', 'Hydrogen-oxygen fuel cell. ' + preset.note + ' Press Next to see the parts of the cell.', {});
      add('parts', 'A fuel cell has two porous electrodes with an electrolyte between them. Hydrogen is fed to the negative electrode (the anode) and oxygen, usually from the air, to the positive electrode (the cathode). A wire joins the electrodes through the device being powered, here a bulb.', {});
      const numbered = [
        ['fuel', 'Hydrogen gas flows into the cell and reaches the porous anode.', { h2In: true }, { anode: 'H_2 arrives at the anode' }],
        ['oxidise', acid
          ? 'At the anode each hydrogen molecule loses 2 electrons to the electrode (it is oxidised):   ' + preset.anodeEq + '.   The H^+ ions pass into the electrolyte.'
          : 'At the anode hydrogen reacts with OH^- ions from the electrolyte and loses electrons to the electrode (it is oxidised):   ' + preset.anodeEq + '.',
          { oxidise: true }, { anode: preset.anodeEq + ' (oxidation)' }],
        ['circuit', 'Electrons cannot travel through the electrolyte, so they flow along the wire from the anode to the cathode. This flow of electrons is an electric current: it lights the bulb.', { circuit: true }, { anode: 'Electrons leave along the wire', cathode: 'Electrons arrive along the wire' }],
        acid ? ['ions', 'H^+ ions move through the electrolyte from the anode to the cathode.', { ionsMove: true }, { cathode: 'H^+ ions cross the electrolyte' }] : null,
        ['oxygen', 'Oxygen gas flows into the cell and reaches the porous cathode.', { o2In: true }, { cathode: 'O_2 arrives at the cathode' }],
        ['reduce', acid
          ? 'At the cathode each oxygen molecule gains 4 electrons from the electrode and joins with 4 H^+ ions (it is reduced):   ' + preset.cathodeEq + '.'
          : 'At the cathode each oxygen molecule gains 4 electrons from the electrode and reacts with water (it is reduced):   ' + preset.cathodeEq + '.',
          { reduce: true }, { cathode: preset.cathodeEq + ' (reduction)' }],
        acid ? null : ['ions', 'The OH^- ions made at the cathode move through the electrolyte back to the anode, ready to react with more hydrogen.', { ionsMove: true }, { cathode: 'OH^- ions cross the electrolyte' }],
        ['water', 'Water is the only product and it leaves the cell. Overall:   ' + OVERALL + '.   The cell keeps producing a current for as long as hydrogen and oxygen are supplied.', { waterOut: true }, { anode: acid ? null : 'Water leaves the cell', cathode: acid ? 'Water leaves the cell' : null }],
        ['evaluate', 'Compared with a rechargeable cell: no recharging is needed, water is the only product and there are no toxic metals to dispose of. But hydrogen is explosive, hard to store, and often made from fossil fuels or by electrolysis that uses a lot of energy.', {}, null]
      ].filter(Boolean);
      numbered.forEach(([key, text, patch, flow], i) => { add(key, text, patch, flow); S[S.length - 1].num = i + 1; });
      add('finish', 'The circuit is complete: hydrogen in, oxygen in, water out, and a steady current through the bulb.', { free: true });
      return S;
    }

    // ---------------------------------------------------------------- questions
    function questionsFor(i) { const st = steps[i]; const q = st && st.key ? buildQuestion(st.key) : null; return q ? [q] : []; }
    function questionFor(i) { return questionsFor(i)[0] || null; }
    function buildQuestion(key) {
      const diff = C().difficulty || 'easy', hard = diff === 'hard', medium = diff === 'medium';
      const acid = preset.ion === 'H+';
      const eqOptions = (correct, wrongs) => shuffle([opt(correct, true)].concat((medium ? wrongs : wrongs.slice(0, 3)).map(w => opt(w, false))));
      switch (key) {
        case 'parts': return {
          prompt: 'Which gas is supplied to the negative electrode (the anode)?',
          options: hard ? null : shuffle([opt('Hydrogen', true), opt('Oxygen'), opt('Water vapour')].concat(medium ? [opt('Nitrogen'), opt('Carbon dioxide')] : [opt('Nitrogen')])),
          typed: hard ? { placeholder: 'name of the gas', answer: 'hydrogen', check: wordCheck(['hydrogen', 'h2']) } : null
        };
        case 'fuel': return {
          prompt: 'What happens to hydrogen molecules at the anode?',
          options: hard ? null : shuffle([opt('They lose electrons (oxidation)', true), opt('They gain electrons (reduction)'), opt('They react with oxygen directly')].concat(medium ? [opt('They lose protons and gain electrons'), opt('They pass through the electrolyte unchanged')] : [opt('They dissolve in the electrolyte')])),
          typed: hard ? { placeholder: 'oxidised or reduced?', answer: 'oxidised (they lose electrons)', check: wordCheck(['oxid', 'loseelectron', 'loseselectron', 'losetwoelectron']) } : null
        };
        case 'oxidise': return {
          prompt: hard ? 'Write the half-equation for the reaction at the anode.' : 'Which is the half-equation at the anode?',
          hint: hard ? 'Use → or -> for the arrow, e- for an electron.' : null,
          options: hard ? null : eqOptions(preset.anodeEq, acid ? ['2H^+ + 2e^- → H_2', 'H_2 + 2e^- → 2H^-', 'O_2 + 4H^+ + 4e^- → 2H_2O', 'H_2 → 2H^- + 2e^+'] : ['4H_2O + 4e^- → 2H_2 + 4OH^-', 'O_2 + 2H_2O + 4e^- → 4OH^-', '2H_2 + O_2 → 2H_2O', '2H_2 + 4OH^- → 4H_2O + 4e^+']),
          typed: hard ? { placeholder: 'e.g. X_2 → 2X^+ + 2e^-', answer: preset.anodeEq, check: eqCheck(preset.anodeEq) } : null
        };
        case 'circuit': return {
          prompt: 'Why do the electrons travel through the external wire rather than through the electrolyte?',
          options: hard ? null : shuffle([opt('The electrolyte lets ions through but not electrons', true), opt('Electrons are repelled by hydrogen'), opt('The wire is a shorter path')].concat(medium ? [opt('The electrolyte is a solid insulator'), opt('The bulb attracts electrons')] : [opt('The electrolyte is too hot')])),
          typed: hard ? { placeholder: 'because the electrolyte...', answer: 'the electrolyte conducts ions, not electrons', check: wordCheck(['ion', 'notconductelectron', 'insulat', 'cannotpasselectron', "can'tpasselectron"]) } : null
        };
        case 'ions': return {
          prompt: 'Which particles move through the electrolyte, and in which direction?',
          options: hard ? null : shuffle([opt(acid ? 'H^+ ions, from the anode to the cathode' : 'OH^- ions, from the cathode to the anode', true), opt('Electrons, from the anode to the cathode'), opt(acid ? 'H^+ ions, from the cathode to the anode' : 'OH^- ions, from the anode to the cathode')].concat(medium ? [opt('O_2 molecules, from the cathode to the anode'), opt('H_2 molecules, from the anode to the cathode')] : [opt('O_2 molecules, from the cathode to the anode')])),
          typed: hard ? { fields: [
            { label: 'Which ion moves through the electrolyte?', placeholder: 'e.g. X^+', answer: FORM[preset.ion], check: t => norm(t) === norm(FORM[preset.ion]) || norm(t) === (acid ? 'hydrogenion' : 'hydroxideion') },
            { label: 'From which electrode to which?', placeholder: 'anode to cathode, or cathode to anode', answer: acid ? 'anode to cathode' : 'cathode to anode', check: t => norm(t).replace(/the|electrode|from|s/g, '').indexOf(acid ? 'anodetocathode' : 'cathodetoanode') >= 0 || norm(t).replace(/the|electrode|from|s/g, '').indexOf(acid ? 'negativetopositive' : 'positivetonegative') >= 0 }
          ] } : null
        };
        case 'oxygen': return {
          prompt: 'What happens to oxygen molecules at the cathode?',
          options: hard ? null : shuffle([opt('They gain electrons (reduction)', true), opt('They lose electrons (oxidation)'), opt('They burn in hydrogen')].concat(medium ? [opt('They lose electrons and form O^2- ions'), opt('They dissolve and cross the electrolyte')] : [opt('They pass through the electrolyte')])),
          typed: hard ? { placeholder: 'oxidised or reduced?', answer: 'reduced (they gain electrons)', check: wordCheck(['reduc', 'gainelectron', 'gainselectron']) } : null
        };
        case 'reduce': return {
          prompt: hard ? 'Write the half-equation for the reaction at the cathode.' : 'Which is the half-equation at the cathode?',
          hint: hard ? 'Use → or -> for the arrow, e- for an electron.' : null,
          options: hard ? null : eqOptions(preset.cathodeEq, acid ? ['O_2 + 4H^+ → 2H_2O + 4e^-', '2H_2O → O_2 + 4H^+ + 4e^-', 'H_2 → 2H^+ + 2e^-', 'O_2 + 2H^+ + 2e^- → H_2O'] : ['4OH^- → O_2 + 2H_2O + 4e^-', '2H_2 + 4OH^- → 4H_2O + 4e^-', 'O_2 + 4e^- → 2O^2-', 'O_2 + 4H^+ + 4e^- → 2H_2O']),
          typed: hard ? { placeholder: 'e.g. X_2 + 4e^- → 2X^2-', answer: preset.cathodeEq, check: eqCheck(preset.cathodeEq) } : null
        };
        case 'water': return {
          prompt: hard ? 'Write the overall equation for the fuel cell reaction.' : 'What is the only product of a hydrogen-oxygen fuel cell?',
          hint: hard ? 'Use → or -> for the arrow.' : null,
          options: hard ? null : shuffle([opt('Water', true), opt('Carbon dioxide'), opt('Hydrogen peroxide')].concat(medium ? [opt('Hydroxide'), opt('Water and carbon dioxide')] : [opt('Hydrogen chloride')])),
          typed: hard ? { placeholder: 'e.g. 2X_2 + Y_2 → 2X_2Y', answer: OVERALL, check: eqCheck(OVERALL) } : null
        };
        case 'evaluate': return {
          prompt: 'Which of these are advantages of a hydrogen fuel cell compared with a rechargeable cell? Pick all that apply.',
          multi: true,
          options: shuffle([opt('It does not need recharging', true), opt('Water is the only product', true), opt('No toxic metals to dispose of', true), opt('Hydrogen is easy to store'), opt('Hydrogen is not flammable')].concat(medium ? [opt('It produces electricity from a fuel', true), opt('Hydrogen is always made without fossil fuels')] : []))
        };
        default: return null;
      }
    }
    function openQuestion(i) {
      const qs = questionsFor(i);
      const finish = () => { asked[i] = true; setStep(i); };
      if (!qs.length) { finish(); return; }
      Quiz.ask(ctx.overlay, qs[0], firstTry => { score.total++; if (firstTry) score.right++; finish(); });
    }

    // ---------------------------------------------------------------- update
    function update(dt) {
      const c = C(), d = D(), L = layout(), s = L.s, f = flags();
      time += dt; litTimer = Math.max(0, litTimer - dt);
      const r = pr(), jitter = d['motion.jitter'] * 700 * s * (f && !f.free ? 0.3 : 1), drift = d['motion.drift'] * 260 * s;
      const T = d['motion.reaction'];
      const free = !f || f.free;
      const closed = f ? !!f.circuit : !!c.switch;
      const acid = preset.ion === 'H+';
      const may = k => free || (k === 'H2' ? f.h2In : k === 'O2' ? f.o2In : k === 'OH-' ? (f.ionsMove || f.oxidise) : f.ionsMove);
      const electronsInSystem = stored.anode + stored.cathode + transit.length;

      // free-mode supply: top up gas from the inlets at the top of each chamber
      if (free) {
        spawnTimer += dt;
        const want = { H2: c.h2supply ? d['motion.h2Count'] : 0, O2: c.o2supply ? d['motion.o2Count'] : 0 };
        ['H2', 'O2'].forEach(k => { if (spawnTimer > 0.4 && mols.filter(p => p.k === k).length < want[k]) { spawnTimer = 0; mols.push(newMol(k, P.rand(0.3, 0.7), 0.06)); } });
      }

      for (let i = mols.length - 1; i >= 0; i--) {
        const p = mols[i], rr = radiusOf(p);
        let [x, y] = px(p, L);
        if (p.state === 'free') {
          P.wander(p, jitter, dt);
          if (may(p.k)) {
            if (p.k === 'H2') p.vx += drift * dt;                                   // towards the anode face
            else if (p.k === 'O2') p.vx -= drift * dt;                              // towards the cathode face
            else if (p.k === 'H+') p.vx += drift * 0.8 * dt;                        // anode -> cathode
            else if (p.k === 'OH-') p.vx -= drift * 0.8 * dt;                       // cathode -> anode
          }
          if (p.k === 'H2O') { p.vx *= 0.9; if (free || f.waterOut) p.vy += drift * 0.6 * dt; else p.vy *= 0.8; }
          P.clampSpeed(p, 120 * s * Math.max(1, d['motion.drift']));
          x += p.vx * dt; y += p.vy * dt;
          const R = L.chamber(p.k === 'H2O' ? p.zone : p.k === 'H2' ? 'H2' : p.k === 'O2' ? 'O2' : 'lyte');
          const tmp = { x, y, vx: p.vx, vy: p.vy };
          if (p.k === 'H2O' && (free || f.waterOut) && y > R.y + R.h + rr) { mols.splice(i, 1); continue; }   // left through the outlet
          P.confine(tmp, { x: R.x, y: R.y, w: R.w, h: R.h + (p.k === 'H2O' && (free || f.waterOut) ? rr * 4 : 0) }, rr, 0.4);
          p.vx = tmp.vx; p.vy = tmp.vy; setPx(p, tmp.x, tmp.y, L);

          // reactions
          const atAnode = p.k === 'H2' && tmp.x > L.anode.x - rr * 1.3;
          const atCathode = p.k === 'O2' && tmp.x < L.cathode.x + L.cathode.w + rr * 1.3;
          if (atAnode && (free ? closed && electronsInSystem < 8 : f.oxidise) && !mols.some(q => q.state === 'reacting' && q.k === 'H2')) {
            const partners = acid ? [] : nearest('OH-', L.lyte.x, tmp.y, 2, L);
            if (acid || partners.length === 2) { startReaction(p, partners, 'anode', tmp, L); }
          } else if (atCathode && (free ? closed : f.reduce) && stored.cathode >= 4 && !mols.some(q => q.state === 'reacting' && q.k === 'O2')) {
            const partners = acid ? nearest('H+', L.lyte.x + L.lyte.w, tmp.y, 4, L) : [];
            if (!acid || partners.length === 4) { startReaction(p, partners, 'cathode', tmp, L); }
          }
        } else if (p.state === 'reacting') {
          p.t += dt;
          // partner ions glide onto the reacting molecule during the electron phase
          const E = L[p.E]; p.partners.forEach((q, j) => { const [qx, qy] = px(q, L); const k = Math.min(1, dt / Math.max(0.05, T * 0.65 - p.t)); const ty = p.py + (j - (p.partners.length - 1) / 2) * radiusOf(q) * 1.6; setPx(q, qx + (E.cx - qx) * k, qy + (ty - qy) * k, L); });
          if (p.t >= T) finishReaction(p, i, L);
        }
      }

      // stored electrons leave the anode along the wire when the circuit is closed
      if (closed && stored.anode > 0 && (!transit.length || transit[transit.length - 1].t > 0.22)) { stored.anode--; transit.push({ t: 0 }); }
      const transitTime = 2.2 / d['motion.electronSpeed'];
      for (let i = transit.length - 1; i >= 0; i--) {
        if (!closed) break;
        transit[i].t += dt; litTimer = 0.6;
        if (transit[i].t >= transitTime) { transit.splice(i, 1); stored.cathode++; }
      }

      // keep free particles apart within their region
      const freeList = mols.filter(p => p.state === 'free' && !p.partnerOf).map(p => { const [x, y] = px(p, L); return { p, x, y, zone: p.k === 'H2' ? 1 : p.k === 'O2' ? 2 : p.k === 'H2O' ? 3 : 0 }; });
      P.separate(freeList, o => radiusOf(o.p), 2 * s, (a, b) => a.zone === b.zone);
      freeList.forEach(o => setPx(o.p, o.x, o.y, L));
    }
    function nearest(k, x, y, n, L) {
      const list = mols.filter(p => p.k === k && p.state === 'free' && !p.partnerOf).map(p => { const [qx, qy] = px(p, L); return { p, d: Math.hypot(qx - x, qy - y) }; });
      list.sort((a, b) => a.d - b.d);
      const r = pr() * 6;
      const near = list.slice(0, n).filter(o => o.d < r * 3);
      return near.length === n ? near.map(o => o.p) : [];
    }
    function startReaction(p, partners, E, at, L) {
      const el = L[E], rr = radiusOf(p);
      p.state = 'reacting'; p.t = 0; p.E = E; p.partners = partners;
      p.px = E === 'anode' ? el.x - rr * 1.1 : el.x + el.w + rr * 1.1; p.py = at.y;
      setPx(p, p.px, p.py, L); p.vx = p.vy = 0;
      partners.forEach(q => { q.partnerOf = p; q.vx = q.vy = 0; });
    }
    function finishReaction(p, i, L) {
      const acid = preset.ion === 'H+', el = L[p.E], r = pr();
      mols.splice(i, 1);
      p.partners.forEach(q => { const j = mols.indexOf(q); if (j >= 0) mols.splice(j, 1); });
      shownEq[p.E] = true;
      if (p.E === 'anode') {
        counts.H2++; stored.anode += 2;
        const bx = el.x + el.w + r * 0.9;
        if (acid) for (let k = 0; k < 2; k++) { const q = newMol('H+'); setPx(q, bx, p.py + (k - 0.5) * r * 1.6, L); q.vx = 20; mols.push(q); }
        else for (let k = 0; k < 2; k++) { const q = newMol('H2O', 0, 0, 'H2'); setPx(q, el.x - r * 1.2, p.py + (k - 0.5) * r * 2, L); mols.push(q); }
      } else {
        counts.O2++; stored.cathode -= 4;
        if (acid) { counts.H2O += 2; for (let k = 0; k < 2; k++) { const q = newMol('H2O', 0, 0, 'O2'); setPx(q, el.x + el.w + r * 1.2, p.py + (k - 0.5) * r * 2, L); mols.push(q); } }
        else { counts.H2O -= 2; for (let k = 0; k < 4; k++) { const q = newMol('OH-'); setPx(q, el.x - r * 1.1, p.py + (k - 1.5) * r * 1.7, L); q.vx = -20; mols.push(q); } }   // net: 4 made at the anode, 2 used here
      }
      if (!acid && p.E === 'anode') counts.H2O += 2;
    }

    // ---------------------------------------------------------------- draw
    function draw() {
      const c = C(), d = D(), L = layout(), s = L.s, f = flags();
      const font = d['text.font'], text = d['colour.text'], ts = d['text.size'] * s;
      g.begin(d['colour.background']);
      const story = isStory(), showParts = !story || storyStep > 0;
      if (d['text.showTitle']) g.formula(g.w * 0.02, g.h * 0.055, 'Hydrogen-oxygen fuel cell', { font, size: ts * 1.2, color: text, weight: '700' });
      if (!story && d['text.showCounters']) g.formula(g.w * 0.98, g.h * 0.055, 'H_2 used ' + counts.H2 + '   O_2 used ' + counts.O2 + '   H_2O made ' + counts.H2O, { font, size: ts * 0.85, color: g.withAlpha(text, 0.7), align: 'right' });

      // cell body
      const acid = preset.ion === 'H+';
      g.roundRect(L.cell.x, L.cell.y, L.cell.w, L.cell.h, 6 * s, d['colour.gasChamber'], g.withAlpha(text, 0.4), 2 * s);
      g.rect(L.lyte.x, L.lyte.y, L.lyte.w, L.lyte.h, acid ? d['colour.electrolyteAcid'] : d['colour.electrolyteAlkaline']);
      [L.anode, L.cathode].forEach(E => {
        g.rect(E.x, E.y, E.w, E.h, d['colour.electrode']);
        for (let y = E.y + 8 * s; y < E.y + E.h - 4 * s; y += 9 * s) g.circle(E.cx, y, 1.6 * s, g.withAlpha('#ffffff', 0.35));   // porous
        const closed = f ? !!f.circuit : !!c.switch;
        const inUse = E.name === 'cathode' ? 4 * mols.filter(q => q.state === 'reacting' && q.E === 'cathode').length : 0;
        const n = Math.max(0, Math.min(6, stored[E.name] - inUse)), er = 4.5 * s * d['size.electron'];
        for (let k = 0; k < n; k++) { const y = E.y + E.h * 0.5 + (k - (n - 1) / 2) * er * 2.4; g.circle(E.cx, y, er, d['colour.electron'], g.darken(d['colour.electron'], 0.4), 1); if (er > 3.5) g.formula(E.cx, y, 'e^-', { size: er * 1.3, color: '#1f2937', align: 'center', weight: '700' }); }
        void closed;
      });
      // labels
      const names = d['text.electrodeNames'];
      const lab = (E, sym, word, sign) => {
        const t = names === 'symbols' ? sym + ' (' + sign + ')' : names === 'words' ? word : sym + ' (' + sign + ')';
        const o = { font, size: ts * 0.9, color: text, weight: '700', align: 'center' };
        const lx = E.cx, ly = L.cell.y + L.cell.h + ts * 0.85;
        g.text(lx, ly, t, o);
        if (names === 'both') g.text(lx, ly + ts * 0.95, word, { font, size: ts * 0.7, color: g.withAlpha(text, 0.65), align: 'center' });
      };
      lab(L.anode, 'anode', 'negative electrode', '−'); lab(L.cathode, 'cathode', 'positive electrode', '+');
      g.text(L.lyte.x + L.lyte.w / 2, L.cell.y + L.cell.h - ts * 0.8, 'electrolyte', { font, size: ts * 0.8, color: g.withAlpha(text, 0.55), align: 'center', weight: '600' });
      // inlets and outlet
      const inlet = (R, label, on) => { const x = R.x + R.w / 2; g.alpha(on ? 1 : 0.3, () => { g.arrow(x, L.cell.y - ts * 2.3, x, L.cell.y - 3 * s, g.withAlpha(text, 0.6), 2 * s, 7 * s); g.formula(x, L.cell.y - ts * 3, label, { font, size: ts * 0.8, color: text, align: 'center', weight: '600' }); }); };
      inlet(L.h2, 'hydrogen in', !story || f.h2In || f.free); inlet(L.o2, 'oxygen in', !story || f.o2In || f.free);
      const outR = preset.waterAt === 'anode' ? L.h2 : L.o2, ox = outR.x + outR.w / 2, oy = L.cell.y + L.cell.h;
      g.alpha(!story || f.waterOut || f.free ? 1 : 0.3, () => { g.arrow(ox, oy + 3 * s, ox, oy + ts * 2.1, g.withAlpha(text, 0.6), 2 * s, 7 * s); g.text(ox, oy + ts * 2.75, 'water out', { font, size: ts * 0.8, color: text, align: 'center', weight: '600' }); });

      // circuit: wire, switch, bulb, electrons in transit
      drawCircuit(L, d, c, f);

      if (showParts) {
        mols.forEach(p => { if (c['show.' + p.k] !== false) drawMol(p, L, d, c); });
      }

      // equations (free mode) and story chrome
      if (!story && c.equations !== 'off') {
        const es = d['text.equationSize'] * s, ey = g.h * 0.9;
        if (c.equations === 'always' || shownEq.anode) g.formula(L.anode.cx, ey, preset.anodeEq, { font, size: es, color: text, align: 'center', weight: '600' });
        if (c.equations === 'always' || shownEq.cathode) g.formula(L.cathode.cx, ey, preset.cathodeEq, { font, size: es, color: text, align: 'center', weight: '600' });
      }
      if (story) { if (d['layout.showFlow']) drawFlow(L, d); drawStory(L, d); }
    }

    function drawCircuit(L, d, c, f) {
      const s = L.s, wire = d['colour.wire'], closed = f ? !!f.circuit : !!c.switch;
      const [a, b, cc, dd] = L.wire;
      g.path([a, b, [L.sw.x1, L.yw]], wire, 3 * s);
      g.path([[L.sw.x2, L.yw], cc, dd], wire, 3 * s);
      // switch
      if (closed) g.line(L.sw.x1, L.yw, L.sw.x2, L.yw, wire, 3 * s);
      else g.line(L.sw.x1, L.yw, L.sw.x2 - (L.sw.x2 - L.sw.x1) * 0.2, L.yw - (L.sw.x2 - L.sw.x1) * 0.6, wire, 3 * s);
      g.circle(L.sw.x1, L.yw, 3 * s, wire); g.circle(L.sw.x2, L.yw, 3 * s, wire);
      // bulb
      const B = L.bulb, lit = litTimer > 0 && closed;
      if (lit && d['layout.glow']) g.alpha(0.3, () => g.circle(B.x, B.y, B.r * 1.45, d['colour.bulb']));
      g.circle(B.x, B.y, B.r, lit ? d['colour.bulb'] : '#f8fafc', wire, 2 * s);
      g.path([[B.x - B.r * 0.4, B.y + B.r * 0.4], [B.x - B.r * 0.15, B.y - B.r * 0.2], [B.x + B.r * 0.15, B.y + B.r * 0.2], [B.x + B.r * 0.4, B.y - B.r * 0.4]], lit ? '#b45309' : wire, 1.5 * s);
      // direction arrows on the vertical legs
      const tcol = g.withAlpha(d['colour.text'], 0.55);
      if (closed && (transit.length || stored.anode)) { g.arrowHead(a[0] + 12 * s, (a[1] + b[1]) / 2, -Math.PI / 2, tcol, 7 * s); g.arrowHead(dd[0] + 12 * s, (cc[1] + dd[1]) / 2, Math.PI / 2, tcol, 7 * s); }
      // electrons in transit along the path
      const segs = []; let total = 0;
      for (let i = 1; i < L.wire.length; i++) { const p = L.wire[i - 1], q = L.wire[i]; const len = Math.hypot(q[0] - p[0], q[1] - p[1]); segs.push({ p, q, len }); total += len; }
      const er = 5 * s * d['size.electron'], ecol = d['colour.electron'], transitTime = 2.2 / d['motion.electronSpeed'];
      transit.forEach(e => {
        let rem = Math.min(1, e.t / transitTime) * total;
        for (const sg of segs) {
          if (rem <= sg.len) { const t = rem / sg.len, x = sg.p[0] + (sg.q[0] - sg.p[0]) * t, y = sg.p[1] + (sg.q[1] - sg.p[1]) * t; g.circle(x, y, er, ecol, g.darken(ecol, 0.4), 1); if (er > 3.5) g.formula(x, y, 'e^-', { size: er * 1.3, color: '#1f2937', align: 'center', weight: '700' }); break; }
          rem -= sg.len;
        }
      });
    }

    function drawMol(p, L, d, c) {
      const s = L.s, r0 = radiusOf(p), T = d['motion.reaction'], font = d['text.font'];
      let scale = 1;
      if (p.state === 'reacting') { const k = Math.max(0, (p.t - T * 0.65) / (T * 0.35)); scale = Math.max(0.1, 1 - 0.9 * k * k); }
      const r = r0 * scale, [x, y] = px(p, L), col = d['colour.' + p.k], labels = c.labels !== 'none';
      const outline = g.darken(col, 0.35);
      if (p.state === 'reacting' && d['layout.glow']) { const k = p.t / T; g.alpha(0.4 * (1 - k), () => g.circle(x, y, r0 * (1.5 + k), d['colour.electron'])); }
      if (p.k === 'H2' || p.k === 'O2') {
        g.circle(x - r * 0.42, y, r * 0.7, col, outline, 1.2 * s); g.circle(x + r * 0.42, y, r * 0.7, col, outline, 1.2 * s);
        if (labels && r > 5) g.formulaFit(x, y, FORM[p.k], { font, size: r * 0.9, color: g.contrastText(col), align: 'center', weight: '700' }, r * 1.9);
      } else if (p.k === 'H2O') {
        g.circle(x, y, r, col, outline, 1.2 * s);
        g.circle(x - r * 0.75, y - r * 0.55, r * 0.45, '#e2e8f0', outline, 1); g.circle(x + r * 0.75, y - r * 0.55, r * 0.45, '#e2e8f0', outline, 1);
        if (labels && r > 5) g.formulaFit(x, y, 'H_2O', { font, size: r * 0.8, color: '#ffffff', align: 'center', weight: '700' }, r * 1.7);
      } else {
        g.circle(x, y, r, col, outline, 1.2 * s);
        if (labels && r > 4) g.formulaFit(x, y, FORM[p.k], { font, size: r * 0.95, color: g.contrastText(col), align: 'center', weight: '700' }, r * 1.8);
      }
      // electrons crossing between the molecule and the electrode during the first 65% of the reaction
      if (p.state === 'reacting') {
        const E = L[p.E], n = p.E === 'anode' ? 2 : 4, ecol = d['colour.electron'], er = 5 * s * d['size.electron'];
        const ex = E.cx, ix = p.E === 'anode' ? x + r0 * 0.3 : x - r0 * 0.3;
        const stagger = (T * 0.65) / (n + 1), span = T * 0.65 - (n - 1) * stagger;
        for (let k = 0; k < n; k++) {
          let t = (p.t - k * stagger) / span;
          if (t < 0 || t > 1) continue;
          if (p.E === 'anode') t = 1 - t;   // leave the molecule into the anode
          const bx = ex + (ix - ex) * t, by = y + (k - (n - 1) / 2) * er * 1.6;
          g.circle(bx, by, er, ecol, g.darken(ecol, 0.4), 1.2 * s);
          g.formula(bx, by, 'e^-', { size: er * 1.3, color: '#1f2937', align: 'center', weight: '700' });
        }
      }
    }

    function wrapF(str, maxW, o) {
      const words = String(str).split(' '), lines = []; let cur = '';
      words.forEach(w => { const t = cur ? cur + ' ' + w : w; if (g.formulaWidth(t, o) > maxW && cur) { lines.push(cur); cur = w; } else cur = t; });
      if (cur) lines.push(cur);
      return lines;
    }
    function drawBtn(r, label, primary, disabled, d, s) {
      const ts = d['text.size'] * s;
      g.alpha(disabled ? 0.35 : 1, () => {
        g.roundRect(r.x, r.y, r.w, r.h, 8 * s, primary ? '#2563eb' : '#ffffff', primary ? '#2563eb' : g.withAlpha(d['colour.text'], 0.35), 1.5 * s);
        g.text(r.x + r.w / 2, r.y + r.h / 2, label, { font: d['text.font'], size: ts, color: primary ? '#ffffff' : d['colour.text'], align: 'center', weight: '700' });
      });
    }
    function stepLabel(i) {
      const st = steps[i];
      const base = st.num ? 'Step ' + st.num : ({ start: 'Start', parts: 'The parts', finish: 'Finish' }[st.key] || '');
      return isStudy() ? base + '   ·   Score ' + score.right + ' / ' + score.total : base;
    }
    function drawFlow(L, d) {
      const s = L.s, font = d['text.font'], text = d['colour.text'];
      ['anode', 'cathode'].forEach(side => {
        const col = L.flow[side], items = [];
        for (let i = 0; i < storyStep; i++) { const st = steps[i]; if (st.flow && st.flow[side]) items.push({ n: st.num, label: st.flow[side] }); }
        if (!items.length) return;
        let size = d['text.flowSize'] * s;
        const pad = 6 * s, gapY = 14 * s, badge = () => size * 1.1;
        let boxes;
        for (;;) {
          const o = { font, size, color: text };
          boxes = items.map(it => { const lines = wrapF(it.label, col.w - 2 * pad - badge() - 6 * s, o); return { it, lines, h: Math.max(badge() + 2 * pad, lines.length * size * 1.22 + 2 * pad) }; });
          const total = boxes.reduce((a, b) => a + b.h, 0) + gapY * (boxes.length - 1);
          if (total <= col.h || size <= 7) break;
          size *= 0.92;
        }
        let y = col.y;
        const accent = side === 'anode' ? '#2563eb' : '#dc2626';
        boxes.forEach((b, idx) => {
          g.roundRect(col.x, y, col.w, b.h, 6 * s, g.withAlpha(accent, 0.07), g.withAlpha(accent, 0.5), 1.2 * s);
          const bx = col.x + pad + badge() / 2, by = y + pad + badge() / 2;
          g.circle(bx, by, badge() / 2, accent);
          g.text(bx, by, String(b.it.n), { font, size: size * 0.8, color: '#fff', align: 'center', weight: '800' });
          const tx = col.x + pad + badge() + 6 * s, ty0 = y + pad + size * 0.6;
          b.lines.forEach((ln, i) => g.formula(tx, ty0 + i * size * 1.22, ln, { font, size, color: text }));
          if (idx < boxes.length - 1) { const ax = col.x + col.w / 2; g.arrow(ax, y + b.h + 2 * s, ax, y + b.h + gapY - 2 * s, g.withAlpha(text, 0.5), 2 * s, 6 * s); }
          y += b.h + gapY;
        });
      });
    }
    function drawStory(L, d) {
      const s = L.s, ts = d['text.size'] * s, font = d['text.font'], text = d['colour.text'];
      const st = steps[storyStep];
      const bx = g.w * 0.02, by = g.h * 0.855, bw = g.w * 0.96, bh = g.h * 0.135;
      g.roundRect(bx, by, bw, bh, 8 * s, g.withAlpha(text, 0.05), g.withAlpha(text, 0.18), 1);
      const btnW = Math.max(74 * s, ts * 4.6), btnH = Math.min(bh * 0.6, 48 * s), gap = 8 * s;
      const nextR = { x: bx + bw - gap - btnW, y: by + (bh - btnH) / 2, w: btnW, h: btnH };
      const backR = { x: nextR.x - gap - btnW * 0.8, y: nextR.y, w: btnW * 0.8, h: btnH };
      btnRects = { next: nextR, back: backR };
      const last = storyStep === steps.length - 1;
      drawBtn(nextR, last ? 'Restart' : 'Next ›', true, false, d, s);
      drawBtn(backR, '‹ Back', false, storyStep === 0, d, s);
      g.text(bx + 12 * s, by + ts * 0.85, stepLabel(storyStep), { font, size: ts * 0.7, color: g.withAlpha(text, 0.6), weight: '700' });
      const textW = backR.x - bx - 24 * s, o = { font, size: ts * 0.95, color: text };
      let lines = wrapF(st.text, textW, o);
      while (lines.length > 3 && o.size > 8) { o.size *= 0.92; lines = wrapF(st.text, textW, o); }
      const lh = o.size * 1.22, y0 = by + ts * 1.55 + o.size * 0.55;
      lines.forEach((ln, i) => g.formula(bx + 12 * s, y0 + i * lh, ln, o));
    }

    ctx.canvas.el.addEventListener('pointerdown', ev => {
      if (!isStory()) return;
      const rect = ctx.canvas.el.getBoundingClientRect();
      const x = ev.clientX - rect.left, y = ev.clientY - rect.top;
      const hit = r => r && x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
      if (hit(btnRects.next)) action('next'); else if (hit(btnRects.back)) action('back');
    });

    return { reset, update, draw, action, onControl,
      get step() { return storyStep; }, get stepCount() { return steps.length; }, get ionCount() { return mols.length; },
      get speciesCounts() { const o = {}; mols.forEach(p => { o[p.k] = (o[p.k] || 0) + 1; }); o.eAnode = stored.anode; o.eWire = transit.length; o.eCathode = stored.cathode; o.made = counts.H2O; return o; },
      get busyIons() { return mols.filter(p => p.state !== 'free').map(p => p.k + ':' + p.state + ':' + p.t.toFixed(2)); },
      get stuck() { return 0; },
      questionFor, questionsFor, openQuestion };
  }

  Topics.register({
    id: 'fuel-cell',
    title: 'Hydrogen fuel cell',
    description: 'Hydrogen oxidised at the anode, oxygen reduced at the cathode, electrons round the circuit, water the only product.',
    aspect: 0.7,
    presets: PRESETS,
    controls, designSchema, create
  });
})();
