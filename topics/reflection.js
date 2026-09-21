// Reflection at a plane mirror (IGCSE 0625 P03.2.1). Two presets: a single ray (incident ray, normal,
// angle of incidence, reflected ray, angle of reflection, i = r) and an object in front of the mirror
// (two rays into an eye, virtual rays traced back, image and its characteristics).
// Every named feature is a "Show and label" toggle so a pupil can see the term next to the thing it names.
(function () {
  const PRESETS = [
    { id: 'single-ray', title: 'Single ray on a plane mirror', heading: 'Reflection: a single ray' },
    { id: 'object', title: 'Object in a plane mirror', heading: 'Reflection: the image in a plane mirror' }
  ];
  const PRESET_BY_ID = {}; PRESETS.forEach(p => { PRESET_BY_ID[p.id] = p; });
  const FONTS = ['system-ui', 'Helvetica Neue', 'Arial', 'Arial Rounded MT Bold', 'Verdana', 'Trebuchet MS', 'Georgia', 'Chalkboard SE', 'Comic Sans MS', 'Courier New'];
  const DEG = Math.PI / 180;

  const designSchema = [
    { id: 'colour.background', type: 'colour', label: 'Background', default: '#ffffff', group: 'Colours' },
    { id: 'colour.mirror', type: 'colour', label: 'Mirror', default: '#334155', group: 'Colours' },
    { id: 'colour.mirrorBack', type: 'colour', label: 'Mirror back (hatching)', default: '#94a3b8', group: 'Colours' },
    { id: 'colour.incident', type: 'colour', label: 'Incident ray', default: '#dc2626', group: 'Colours' },
    { id: 'colour.reflected', type: 'colour', label: 'Reflected ray', default: '#2563eb', group: 'Colours' },
    { id: 'colour.normal', type: 'colour', label: 'Normal', default: '#64748b', group: 'Colours' },
    { id: 'colour.angleI', type: 'colour', label: 'Angle of incidence', default: '#dc2626', group: 'Colours' },
    { id: 'colour.angleR', type: 'colour', label: 'Angle of reflection', default: '#2563eb', group: 'Colours' },
    { id: 'colour.virtual', type: 'colour', label: 'Virtual rays', default: '#7c3aed', group: 'Colours' },
    { id: 'colour.object', type: 'colour', label: 'Object', default: '#16a34a', group: 'Colours' },
    { id: 'colour.image', type: 'colour', label: 'Image', default: '#86efac', group: 'Colours' },
    { id: 'colour.eye', type: 'colour', label: 'Eye', default: '#0f172a', group: 'Colours' },
    { id: 'colour.handle', type: 'colour', label: 'Drag handle', default: '#f59e0b', group: 'Colours' },
    { id: 'colour.text', type: 'colour', label: 'Text', default: '#0f172a', group: 'Colours' },
    { id: 'size.ray', type: 'range', label: 'Ray width', min: 1, max: 6, step: 0.5, default: 2.5, unit: 'px', group: 'Sizes' },
    { id: 'size.head', type: 'range', label: 'Arrow head', min: 6, max: 20, step: 1, default: 11, unit: 'px', group: 'Sizes' },
    { id: 'size.normal', type: 'range', label: 'Normal width', min: 1, max: 4, step: 0.5, default: 1.5, unit: 'px', group: 'Sizes' },
    { id: 'size.arc', type: 'range', label: 'Angle arc radius', min: 20, max: 100, step: 2, default: 52, unit: 'px', group: 'Sizes' },
    { id: 'size.handle', type: 'range', label: 'Drag handle', min: 5, max: 16, step: 1, default: 9, unit: 'px', group: 'Sizes' },
    { id: 'size.object', type: 'range', label: 'Object height', min: 0.1, max: 0.45, step: 0.01, default: 0.26, group: 'Sizes' },
    { id: 'size.eye', type: 'range', label: 'Eye height', min: 0.05, max: 0.25, step: 0.01, default: 0.11, group: 'Sizes' },
    { id: 'layout.mirrorY', type: 'range', label: 'Mirror height (single ray)', min: 0.45, max: 0.8, step: 0.01, default: 0.64, group: 'Layout' },
    { id: 'layout.hitX', type: 'range', label: 'Point of incidence (single ray)', min: 0.3, max: 0.7, step: 0.01, default: 0.5, group: 'Layout' },
    { id: 'layout.mirrorLength', type: 'range', label: 'Mirror length (single ray)', min: 0.3, max: 0.95, step: 0.01, default: 0.7, group: 'Layout' },
    { id: 'layout.rayLength', type: 'range', label: 'Ray length', min: 0.15, max: 0.45, step: 0.01, default: 0.34, group: 'Layout' },
    { id: 'layout.normalLength', type: 'range', label: 'Normal length', min: 0.1, max: 0.4, step: 0.01, default: 0.3, group: 'Layout' },
    { id: 'layout.mirrorX', type: 'range', label: 'Mirror position (object)', min: 0.35, max: 0.65, step: 0.01, default: 0.5, group: 'Layout' },
    { id: 'layout.mirrorTop', type: 'range', label: 'Mirror top (object)', min: 0.02, max: 0.3, step: 0.01, default: 0.06, group: 'Layout' },
    { id: 'layout.mirrorBottom', type: 'range', label: 'Mirror bottom (object)', min: 0.6, max: 0.84, step: 0.01, default: 0.8, group: 'Layout' },
    { id: 'layout.eyeX', type: 'range', label: 'Eye position across', min: 0.03, max: 0.3, step: 0.01, default: 0.1, group: 'Layout' },
    { id: 'layout.eyeY', type: 'range', label: 'Eye position down', min: 0.05, max: 0.5, step: 0.01, default: 0.2, group: 'Layout' },
    { id: 'scale.cmPerWidth', type: 'range', label: 'Scale: cm across the whole canvas', min: 20, max: 80, step: 1, default: 40, unit: 'cm', group: 'Layout' },
    { id: 'object.shape', type: 'segmented', label: 'Object', options: [{ value: 'arrow', label: 'Arrow' }, { value: 'F', label: 'Letter F' }, { value: 'R', label: 'Letter R' }], default: 'arrow', group: 'Layout' },
    { id: 'motion.rayTime', type: 'range', label: 'Time for a ray to travel', min: 0.2, max: 2, step: 0.1, default: 0.7, unit: 's', group: 'Motion' },
    { id: 'motion.pulses', type: 'toggle', label: 'Light pulses along rays (free mode)', default: true, group: 'Motion' },
    { id: 'motion.pulseSpeed', type: 'range', label: 'Pulse speed', min: 0.2, max: 3, step: 0.1, default: 1, group: 'Motion' },
    { id: 'text.font', type: 'select', label: 'Font', options: FONTS, default: 'system-ui', group: 'Text' },
    { id: 'text.size', type: 'range', label: 'Text size', min: 10, max: 26, step: 1, default: 15, unit: 'px', group: 'Text' },
    { id: 'text.labelSize', type: 'range', label: 'Label size', min: 9, max: 22, step: 1, default: 13, unit: 'px', group: 'Text' },
    { id: 'text.angleLabels', type: 'segmented', label: 'Angle labels', options: [{ value: 'letters', label: 'i = 40°' }, { value: 'words', label: 'angle of incidence = 40°' }], default: 'letters', group: 'Text' },
    { id: 'text.showTitle', type: 'toggle', label: 'Show title', default: true, group: 'Text' },
    { id: 'text.showReadouts', type: 'toggle', label: 'Show live readouts (free mode)', default: true, group: 'Text' }
  ];

  const single = v => v.preset !== 'object', object = v => v.preset === 'object';
  const controls = [
    { id: 'preset', type: 'select', label: 'Scenario', options: PRESETS.map(p => ({ value: p.id, label: p.title })), default: 'single-ray' },
    { id: 'guide', type: 'segmented', label: 'Mode', options: [{ value: 'steps', label: 'Step by step' }, { value: 'study', label: 'Study (questions)' }, { value: 'free', label: 'Free running' }], default: 'steps' },
    { id: 'difficulty', type: 'segmented', label: 'Question difficulty', options: [{ value: 'easy', label: 'Easy' }, { value: 'medium', label: 'Medium' }, { value: 'hard', label: 'Hard (type answers)' }], default: 'easy', showIf: v => v.guide === 'study' },
    { id: 'next', type: 'button', label: 'Next step ›', primary: true, showIf: v => v.guide !== 'free' },
    { id: 'back', type: 'button', label: '‹ Back', showIf: v => v.guide !== 'free' },
    { id: 'angle', type: 'range', label: 'Angle of incidence', min: 5, max: 85, step: 1, default: 40, unit: '°', showIf: single },
    { id: 'distance', type: 'range', label: 'Object distance from mirror', min: 2, max: 12, step: 0.5, default: 8, unit: 'cm', showIf: object },
    { id: 'objectY', type: 'range', label: 'Object position (up / down)', min: 0.4, max: 0.8, step: 0.01, default: 0.68, showIf: object },
    { id: 'incident', type: 'toggle', label: 'Incident ray', default: false, group: 'Show and label' },
    { id: 'normal', type: 'toggle', label: 'Normal', default: false, group: 'Show and label' },
    { id: 'angleI', type: 'toggle', label: 'Angle of incidence (i)', default: false, group: 'Show and label' },
    { id: 'reflected', type: 'toggle', label: 'Reflected ray', default: false, group: 'Show and label' },
    { id: 'angleR', type: 'toggle', label: 'Angle of reflection (r)', default: false, group: 'Show and label' },
    { id: 'equal', type: 'toggle', label: 'i = r', default: false, group: 'Show and label', showIf: single },
    { id: 'virtual', type: 'toggle', label: 'Virtual rays (dashed)', default: false, group: 'Show and label', showIf: object },
    { id: 'image', type: 'toggle', label: 'Image and distances', default: false, group: 'Show and label', showIf: object },
    { id: 'characteristics', type: 'toggle', label: 'Image characteristics', default: false, group: 'Show and label', showIf: object }
  ];
  // what free-running mode shows without any toggle
  const FREE_FLAGS = { 'single-ray': { incident: true, reflected: true }, object: { object: true, eye: true, incident: true, reflected: true, virtual: true, image: true } };
  const ELEMENTS = ['object', 'eye', 'incident', 'normal', 'angleI', 'reflected', 'angleR', 'equal', 'virtual', 'image', 'characteristics'];
  const LABEL_IDS = ['incident', 'normal', 'angleI', 'reflected', 'angleR', 'equal', 'virtual', 'image', 'characteristics'];
  const CHAIN = { reflected: 'incident', virtual: 'reflected', image: 'virtual' };   // each waits for the one before it to finish drawing

  // ---------------------------------------------------------------- answer helpers
  const norm = t => String(t || '').toLowerCase().replace(/\s+/g, ' ').trim();
  const wordCheck = words => t => words.some(w => norm(t).includes(norm(w)));
  const numCheck = (ans, tol) => t => { const v = parseFloat(String(t).replace(/[^0-9.\-]/g, '')); return !isNaN(v) && Math.abs(v - ans) <= (tol || 0.5); };
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const opt = (label, correct) => ({ label, correct: !!correct });
  const fmtCm = v => (Math.round(v * 10) / 10) + ' cm';

  // ---------------------------------------------------------------- simulation
  function create(ctx) {
    const g = ctx.g, R = Rays.create(g);
    const C = () => ctx.controls.values, D = () => ctx.design.values;
    let preset, steps = [], storyStep = 0, asked = {}, score = { right: 0, total: 0 }, btnRects = {};
    let prog = {}, time = 0, drag = null, pending = -1, side = 1, eyePos = null, grabDy = 0;
    const isStory = () => C().guide !== 'free', isStudy = () => C().guide === 'study';
    const s0 = () => g.w / 800;
    const angle = () => C().angle == null ? 40 : C().angle;
    const dist = () => C().distance == null ? 8 : C().distance;
    const objectY = () => C().objectY == null ? 0.68 : C().objectY;

    // element e is drawn when the current step (or free mode) reveals it or its toggle is on;
    // it is labelled in story mode always, in free mode only when its toggle is on
    function shown(e) {
      const f = isStory() ? steps[pending >= 0 ? pending : storyStep].flags : FREE_FLAGS[preset.id];
      return !!(f[e] || C()[e]);
    }
    // labels: always in story mode, except the elements a pending question is asking about; only via toggles in free mode
    const labelled = e => isStory() ? !(pending >= 0 && steps[pending].flags[e] && !steps[storyStep].flags[e]) : !!C()[e];

    function reset(id) {
      preset = PRESET_BY_ID[id] || PRESETS[0];
      steps = buildStory(); storyStep = 0; asked = {}; score = { right: 0, total: 0 };
      prog = {}; time = 0; drag = null; pending = -1; side = 1; eyePos = null;
      Quiz.close(ctx.overlay);
    }
    function setStep(i) {
      storyStep = Math.max(0, Math.min(steps.length - 1, i));
      if (storyStep === 0) prog = {};
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
    function onControl(id, value) {
      if (id === 'guide' && value === 'study') LABEL_IDS.forEach(k => ctx.controls.set(k, false, true));   // questions must not be pre-labelled
      if (id === 'guide' || id === 'difficulty') reset(preset.id);
    }

    // ---------------------------------------------------------------- story
    function buildStory() {
      const S = [], f = {};
      const add = (key, text, patch) => { Object.assign(f, patch || {}); S.push({ key, text, flags: Object.assign({}, f) }); };
      const numbered = preset.id === 'single-ray' ? [
        ['incident', 'A ray of light travels towards the mirror. This is the incident ray. The point where it hits the mirror is the point of incidence.', { incident: true }],
        ['normal', 'Draw the normal: a dashed line at 90° to the mirror at the point of incidence. Angles are always measured from the normal, never from the mirror.', { normal: true }],
        ['angleI', () => 'The angle of incidence, i, is the angle between the incident ray and the normal. Here i = ' + angle() + '°.', { angleI: true }],
        ['reflected', 'The ray bounces off the mirror. This is the reflected ray.', { reflected: true }],
        ['angleR', () => 'The angle of reflection, r, is the angle between the reflected ray and the normal. Here r = ' + angle() + '°.', { angleR: true }],
        ['equal', 'Law of reflection: the angle of incidence equals the angle of reflection, i = r. Drag the handle or move the slider and the reflected ray follows.', { equal: true }]
      ] : [
        ['object', () => 'An object stands ' + fmtCm(dist()) + ' in front of the mirror. An eye looks into the mirror.', { object: true, eye: true }],
        ['incident', 'Light from the top of the object spreads out in every direction. Two of the rays that reach the mirror are shown: the incident rays.', { incident: true }],
        ['reflected', 'Each ray reflects off the mirror (angle of incidence = angle of reflection) and enters the eye.', { reflected: true }],
        ['virtual', 'To the eye the rays seem to come from behind the mirror. Extend the reflected rays backwards (dashed lines) to find where they appear to come from.', { virtual: true }],
        ['image', () => 'The dashed lines meet at the image of the top of the object. The image is the same distance behind the mirror (' + fmtCm(dist()) + ') as the object is in front.', { image: true }],
        ['characteristics', 'The image is the same size as the object, upright, the same distance from the mirror as the object, and laterally inverted (left and right swapped).', { characteristics: true }],
        ['virtualExplain', 'The image is virtual: no light actually passes through it, the rays only appear to come from it. A virtual image cannot be formed on a screen.', {}]
      ];
      add('start', preset.id === 'single-ray'
        ? 'A plane mirror, seen from the side. Light reflects off its shiny front surface. Press Next to shine a ray of light at it.'
        : 'A plane mirror, seen from above. Press Next to put an object in front of it.', {});
      numbered.forEach(([key, text, patch], i) => { add(key, text, patch); S[S.length - 1].num = i + 1; });
      add('finish', preset.id === 'single-ray'
        ? 'Summary: incident ray in, normal at 90° to the mirror, reflected ray out, and i = r every time.'
        : 'Summary: rays from the object reflect into the eye; trace them back behind the mirror to find the virtual image, the same size and the same distance from the mirror.', {});
      return S;
    }
    const stepText = st => typeof st.text === 'function' ? st.text() : st.text;

    // ---------------------------------------------------------------- questions
    function questionsFor(i) { const st = steps[i]; const q = st && st.key ? buildQuestion(st.key) : null; return q ? [q] : []; }
    function questionFor(i) { return questionsFor(i)[0] || null; }
    function buildQuestion(key) {
      const diff = C().difficulty || 'easy', hard = diff === 'hard', medium = diff === 'medium';
      const a = angle(), d = dist();
      const choose = (correct, wrongs) => shuffle([opt(correct, true)].concat((medium ? wrongs : wrongs.slice(0, 3)).map(w => opt(w, false))));
      switch (key) {
        case 'incident': return {
          prompt: 'What do we call the ray of light travelling towards the mirror?',
          options: hard ? null : choose('The incident ray', ['The reflected ray', 'The normal', 'The refracted ray', 'The emergent ray']),
          typed: hard ? { placeholder: 'the ___ ray', answer: 'incident', check: wordCheck(['incident']) } : null
        };
        case 'normal': return {
          prompt: 'What is the name of the dashed line drawn at 90° to the mirror at the point of incidence?',
          options: hard ? null : choose('The normal', ['The reflected ray', 'The axis', 'The mirror line', 'The perpendicular ray']),
          typed: hard ? { placeholder: 'name of the line', answer: 'normal', check: wordCheck(['normal']) } : null
        };
        case 'angleI': return {
          prompt: 'The angle of incidence is measured between the incident ray and which line?',
          options: hard ? null : choose('The normal', ['The mirror surface', 'The reflected ray', 'The back of the mirror', 'The horizontal']),
          typed: hard ? { placeholder: 'name of the line', answer: 'normal', check: wordCheck(['normal']) } : null
        };
        case 'reflected': return preset.id === 'single-ray' ? (medium ? {
          prompt: 'Match each term to its meaning.',
          match: { left: [{ label: 'Incident ray', answer: 'Ray travelling towards the mirror' }, { label: 'Normal', answer: 'Line at 90° to the mirror' }, { label: 'Point of incidence', answer: 'Where the ray hits the mirror' }],
            right: shuffle(['Ray travelling towards the mirror', 'Line at 90° to the mirror', 'Where the ray hits the mirror']) }
        } : {
          prompt: 'What is the ray leaving the mirror called?',
          options: hard ? null : choose('The reflected ray', ['The incident ray', 'The normal', 'The emergent ray']),
          typed: hard ? { placeholder: 'the ___ ray', answer: 'reflected', check: wordCheck(['reflected']) } : null
        }) : {
          prompt: 'A ray hits the mirror with an angle of incidence of 30°. What is its angle of reflection?',
          options: hard ? null : choose('30°', ['60°', '90°', '150°', '15°']),
          typed: hard ? { placeholder: 'angle in degrees', answer: '30', check: numCheck(30) } : null
        };
        case 'angleR': return {
          prompt: 'The angle of incidence is ' + a + '°. What is the angle of reflection?',
          options: hard ? null : choose(a + '°', [(90 - a) + '°', (2 * a) + '°', (180 - a) + '°', Math.round(a / 2) + '°']),
          typed: hard ? { placeholder: 'angle in degrees', answer: String(a), check: numCheck(a) } : null
        };
        case 'equal': return medium || hard ? {
          prompt: 'Complete the law of reflection.',
          gaps: { sentences: [['The angle of', '', 'equals the angle of', '', '.'], ['Both angles are measured from the', '', '.']],
            answers: [['incidence', 'reflection'], ['normal']], bank: shuffle(['incidence', 'reflection', 'normal', 'mirror', 'refraction']) }
        } : {
          prompt: 'Which statement is the law of reflection?',
          options: shuffle([opt('angle of incidence = angle of reflection', true), opt('angle of incidence = 2 × angle of reflection'), opt('angle of incidence + angle of reflection = 90°'), opt('angle of reflection = 90° − angle of incidence')])
        };
        case 'object': return {
          prompt: 'An object is placed in front of a plane mirror. Where will its image appear to be?',
          options: hard ? null : choose('Behind the mirror', ['In front of the mirror', 'On the surface of the mirror', 'Inside the eye', 'Above the mirror']),
          typed: hard ? { placeholder: 'in front of / behind / on the mirror', answer: 'behind', check: wordCheck(['behind']) } : null
        };
        case 'virtual': return {
          prompt: 'Why are the lines behind the mirror drawn dashed?',
          options: shuffle([opt('No light really travels there: they show where the light appears to come from', true), opt('The mirror is partly transparent'), opt('The light is dimmer behind the mirror'), opt('They are the normals')])
        };
        case 'image': return hard ? {
          prompt: 'The object is ' + fmtCm(d) + ' in front of the mirror.',
          typed: { fields: [
            { label: 'How far behind the mirror is the image? (cm)', placeholder: 'cm', answer: String(d), check: numCheck(d, 0.26) },
            { label: 'How far is the image from the object? (cm)', placeholder: 'cm', answer: String(2 * d), check: numCheck(2 * d, 0.26) }] }
        } : medium ? {
          prompt: 'The object is ' + fmtCm(d) + ' in front of the mirror. How far is the image from the object?',
          options: choose(fmtCm(2 * d), [fmtCm(d), fmtCm(d / 2), fmtCm(4 * d), fmtCm(d + 2)])
        } : {
          prompt: 'The object is ' + fmtCm(d) + ' in front of the mirror. How far behind the mirror is the image?',
          options: choose(fmtCm(d), [fmtCm(2 * d), fmtCm(d / 2), '0 cm'])
        };
        case 'characteristics': return medium || hard ? {
          prompt: 'Which of these describe the image in a plane mirror? Choose all that apply.', multi: true,
          options: shuffle([opt('Same size as the object', true), opt('Upright', true), opt('Laterally inverted', true), opt('Virtual', true), opt('Magnified'), opt('Upside down'), opt('Real')])
        } : {
          prompt: 'Compared with the object, the image in a plane mirror is...',
          options: shuffle([opt('the same size', true), opt('bigger'), opt('smaller'), opt('upside down')])
        };
        case 'virtualExplain': return hard ? {
          prompt: 'Complete the sentences.',
          gaps: { sentences: [['The image is', '', 'because the rays only', '', 'to come from it.'], ['It cannot be formed on a', '', '.']],
            answers: [['virtual', 'appear'], ['screen']], bank: shuffle(['virtual', 'real', 'appear', 'travel', 'screen', 'mirror']) }
        } : {
          prompt: 'What does it mean to say the image is virtual?',
          options: choose('The rays only appear to come from it; it cannot be formed on a screen', ['It is made by a computer', 'It is smaller than the object', 'Light passes through it', 'It is upside down'])
        };
        default: return null;
      }
    }
    function openQuestion(i) {
      const qs = questionsFor(i);
      const finish = () => { pending = -1; asked[i] = true; setStep(i); };
      if (!qs.length) { finish(); return; }
      pending = i;
      Quiz.ask(ctx.overlay, qs[0], firstTry => { score.total++; if (firstTry) score.right++; finish(); });
    }

    // ---------------------------------------------------------------- update
    function update(dt) {
      time += dt;
      const T = D()['motion.rayTime'];
      ['incident', 'reflected', 'virtual', 'image'].forEach(e => {
        if (!shown(e)) { prog[e] = 0; return; }
        const p = CHAIN[e];
        if (p && shown(p) && (prog[p] || 0) < 1) return;
        prog[e] = Math.min(1, (prog[e] || 0) + dt / T);
      });
    }

    // ---------------------------------------------------------------- geometry
    function layout() {
      const d = D(), s = s0();
      if (preset.id === 'single-ray') {
        const hit = [d['layout.hitX'] * g.w, d['layout.mirrorY'] * g.h];
        const i = angle() * DEG, L = d['layout.rayLength'] * g.w, half = d['layout.mirrorLength'] * g.w / 2;
        const src = [hit[0] - side * L * Math.sin(i), hit[1] - L * Math.cos(i)], end = [hit[0] + side * L * Math.sin(i), hit[1] - L * Math.cos(i)];
        return { s, kind: 'single', hit, i, src, end, mirror: { x0: hit[0] - half, x1: hit[0] + half, y: hit[1] }, nLen: d['layout.normalLength'] * g.w };
      }
      const mx = d['layout.mirrorX'] * g.w, mt = d['layout.mirrorTop'] * g.h, mb = d['layout.mirrorBottom'] * g.h;
      const dpx = dist() / d['scale.cmPerWidth'] * g.w, baseY = objectY() * g.h, h = d['size.object'] * g.h;
      const tip = [mx - dpx, baseY - h], imgTip = [mx + dpx, baseY - h];
      const eye = eyePos ? [eyePos[0] * g.w, eyePos[1] * g.h] : [d['layout.eyeX'] * g.w, d['layout.eyeY'] * g.h], es = d['size.eye'] * g.h;
      const rays = [-0.3, 0.3].map(k => {
        const E = [eye[0] + es * 0.3, eye[1] + es * k];      // inside the pupil, on the side facing the mirror
        const t = (imgTip[0] - mx) / (imgTip[0] - E[0]);
        return { src: tip, hit: [mx, imgTip[1] + t * (E[1] - imgTip[1])], end: E };
      });
      return { s, kind: 'object', mx, mt, mb, dpx, baseY, h, tip, base: [tip[0], baseY], imgTip, imgBase: [imgTip[0], baseY], eye, es, rays, nLen: d['layout.normalLength'] * g.w * 0.6 };
    }

    // ---------------------------------------------------------------- drawing
    const lab = (d, extra) => Object.assign({ size: d['text.labelSize'] * s0(), font: d['text.font'], colour: d['colour.text'] }, extra || {});
    // label beside a ray at fraction t along it, pushed off the ray to the side whose y points up (up = true) or down
    function labelAlong(a, b, t, text, up, o) {
      const dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy) || 1;
      let px = -dy / len, py = dx / len; if ((py < 0) !== up) { px = -px; py = -py; }
      const off = 20 * s0();
      R.label(a[0] + dx * t + px * off, a[1] + dy * t + py * off, text, Object.assign({ align: 'center' }, o));
    }
    function hatch(d, s, from, to, dir, side) {   // short ticks behind a mirror from point `from` to `to`
      const len = Math.hypot(to[0] - from[0], to[1] - from[1]), n = Math.floor(len / (11 * s));
      for (let k = 0; k <= n; k++) {
        const x = from[0] + (to[0] - from[0]) * k / n, y = from[1] + (to[1] - from[1]) * k / n;
        g.line(x, y, x + (side[0] - dir[0] * 0.7) * 9 * s, y + (side[1] - dir[1] * 0.7) * 9 * s, d['colour.mirrorBack'], 1.5 * s);
      }
    }
    function pulses(d, s, segs) {
      if (isStory() || !d['motion.pulses']) return;
      const ph = (time * d['motion.pulseSpeed'] * 0.7) % 1;
      segs.forEach(([a, b, col]) => { for (let k = 0; k < 3; k++) { const p = (ph + k / 3) % 1; g.circle(a[0] + (b[0] - a[0]) * p, a[1] + (b[1] - a[1]) * p, d['size.ray'] * s * 1.6, col); } });
    }
    function angleText(d, which) {
      return d['text.angleLabels'] === 'words' ? 'angle of ' + (which === 'i' ? 'incidence' : 'reflection') : which;
    }
    function handle(d, s, p, haloOnly) {
      const r = d['size.handle'] * s;
      g.circle(p[0], p[1], r * (haloOnly ? 3 : 1.8), g.withAlpha(d['colour.handle'], 0.18));
      if (!haloOnly) g.circle(p[0], p[1], r, d['colour.handle'], '#ffffff', 2 * s);
    }

    function drawSingle(L, d) {
      const s = L.s, rw = d['size.ray'] * s, head = d['size.head'] * s, arcR = d['size.arc'] * s, m = L.mirror;
      hatch(d, s, [m.x0, m.y], [m.x1, m.y], [1, 0], [0, 1]);
      g.line(m.x0, m.y, m.x1, m.y, d['colour.mirror'], 4 * s);
      R.label(m.x1, m.y + 20 * s, 'plane mirror', lab(d, { align: 'right', bg: false }));
      if (shown('normal')) {
        R.normal(L.hit, [1, 0], L.nLen, { colour: d['colour.normal'], width: d['size.normal'] * s });
        if (labelled('normal')) R.label(L.hit[0] + 8 * s, L.hit[1] - L.nLen * 0.8, 'normal', lab(d, { colour: d['colour.normal'] }));
        const q = 9 * s; g.path([[L.hit[0] - q, L.hit[1]], [L.hit[0] - q, L.hit[1] - q], [L.hit[0], L.hit[1] - q]], d['colour.normal'], 1 * s);
      }
      if (shown('angleI')) R.angleArc(L.hit, -Math.PI / 2 - side * L.i, -Math.PI / 2, arcR, { colour: d['colour.angleI'], width: 1.5 * s, label: labelled('angleI') ? angleText(d, 'i') : null, text: lab(d, { colour: d['colour.angleI'] }) });
      if (shown('angleR')) R.angleArc(L.hit, -Math.PI / 2, -Math.PI / 2 + side * L.i, arcR * (shown('angleI') ? 0.75 : 1), { colour: d['colour.angleR'], width: 1.5 * s, label: labelled('angleR') ? angleText(d, 'r') : null, text: lab(d, { colour: d['colour.angleR'] }) });
      if (shown('incident')) {
        R.ray(L.src, L.hit, { colour: d['colour.incident'], width: rw, frac: prog.incident, head, arrowAt: 0.5 });
        if (labelled('incident') && prog.incident >= 1) labelAlong(L.src, L.hit, 0.25, 'incident ray', false, lab(d, { colour: d['colour.incident'] }));
        g.circle(L.hit[0], L.hit[1], 3 * s, d['colour.text']);
        if (labelled('incident')) R.label(L.hit[0], L.hit[1] + 20 * s, 'point of incidence', lab(d, { align: 'center', bg: false }));
        handle(d, s, L.src);
      }
      if (shown('reflected')) {
        R.ray(L.hit, L.end, { colour: d['colour.reflected'], width: rw, frac: prog.reflected, head, arrowAt: 0.5 });
        if (labelled('reflected') && prog.reflected >= 1) labelAlong(L.hit, L.end, 0.75, 'reflected ray', false, lab(d, { colour: d['colour.reflected'] }));
      }
      if (shown('equal') && labelled('equal')) R.label(L.hit[0], Math.min(L.src[1], L.hit[1] - L.nLen) - 22 * s, 'i = r   (angle of incidence = angle of reflection)', lab(d, { align: 'center', size: d['text.size'] * s }));
      if (prog.incident >= 1 && prog.reflected >= 1) pulses(d, s, [[L.src, L.hit, d['colour.incident']], [L.hit, L.end, d['colour.reflected']]]);
    }

    function drawShape(d, s, base, tip, col, mirrored) {
      const shape = d['object.shape'];
      if (shape === 'arrow') { g.line(base[0], base[1], tip[0], tip[1], col, 4 * s); g.arrowHead(tip[0], tip[1], -Math.PI / 2, col, d['size.head'] * s * 1.3); return; }
      // letter sized so its cap height runs exactly from base to tip, so rays leave its top
      const h = base[1] - tip[1], o = { size: h, weight: '800', font: d['text.font'], color: col, align: 'center', baseline: 'alphabetic' };
      g.textWidth(shape, o); g.ctx.textBaseline = 'alphabetic';   // sets ctx.font the same way g.text will; ascent is measured from the baseline
      const asc = g.ctx.measureText(shape).actualBoundingBoxAscent || h * 0.72;
      o.size = h * h / asc;
      g.ctx.save(); g.ctx.translate(base[0], base[1]); if (mirrored) g.ctx.scale(-1, 1);
      g.text(0, 0, shape, o);
      g.ctx.restore();
    }
    function drawEye(d, s, L) {
      const w = L.es * 1.4, h = L.es / 2, x = L.eye[0], y = L.eye[1], col = d['colour.eye'];
      handle(d, s, [x, y], true);
      g.ctx.beginPath(); g.ctx.moveTo(x - w / 2, y); g.ctx.quadraticCurveTo(x, y - 2 * h, x + w / 2, y); g.ctx.quadraticCurveTo(x, y + 2 * h, x - w / 2, y);
      g.ctx.closePath(); g.ctx.fillStyle = '#ffffff'; g.ctx.fill(); g.ctx.strokeStyle = col; g.ctx.lineWidth = 2 * s; g.ctx.stroke();
      g.circle(x + L.es * 0.3, y, L.es * 0.38, col);       // pupil, looking towards the mirror; the rays end inside it
      if (labelled('eye')) R.label(x, y + h + 14 * s, 'eye', lab(d, { align: 'center', bg: false }));
    }

    function drawObject(L, d) {
      const s = L.s, rw = d['size.ray'] * s, head = d['size.head'] * s, arcR = d['size.arc'] * s * 0.8;
      hatch(d, s, [L.mx, L.mt], [L.mx, L.mb], [0, 1], [1, 0]);
      g.line(L.mx, L.mt, L.mx, L.mb, d['colour.mirror'], 4 * s);
      R.label(L.mx + 14 * s, L.mb + 12 * s, 'plane mirror', lab(d, { bg: false }));
      if (shown('object')) {
        drawShape(d, s, L.base, L.tip, d['colour.object'], false);
        if (labelled('object')) R.label(L.base[0], L.baseY + 14 * s, 'object', lab(d, { align: 'center', bg: false }));
        handle(d, s, L.base);
      }
      if (shown('eye')) drawEye(d, s, L);
      if (shown('normal')) L.rays.forEach((r, k) => R.normal(r.hit, [0, 1], L.nLen, { side: 1, colour: d['colour.normal'], width: d['size.normal'] * s, label: k === 0 && labelled('normal') ? 'normal' : null, labelGap: 14 * s, size: lab(d).size, font: d['text.font'], align: 'center' }));
      // angles on the upper ray only (two sets would overlap); the value sits just outside each ray so i = r reads live
      const r0 = L.rays[0], ai = Math.atan2(r0.src[1] - r0.hit[1], r0.src[0] - r0.hit[0]), ar = Math.atan2(r0.end[1] - r0.hit[1], r0.end[0] - r0.hit[0]);
      const deg = Math.round(Math.abs(Math.PI - ai) / DEG), out = 28 * DEG, lr = arcR * 1.9;
      if (shown('angleI')) {
        R.angleArc(r0.hit, ai, Math.PI, arcR, { colour: d['colour.angleI'], width: 1.5 * s });
        if (labelled('angleI')) R.label(r0.hit[0] + lr * Math.cos(ai - out), r0.hit[1] + lr * Math.sin(ai - out), 'i = ' + deg + '°', lab(d, { colour: d['colour.angleI'], align: 'right' }));
      }
      if (shown('angleR')) {
        R.angleArc(r0.hit, Math.PI, ar, arcR * 0.8, { colour: d['colour.angleR'], width: 1.5 * s });
        if (labelled('angleR')) R.label(r0.hit[0] + lr * Math.cos(ar + out), r0.hit[1] + lr * Math.sin(ar + out), 'r = ' + deg + '°', lab(d, { colour: d['colour.angleR'], align: 'right' }));
      }
      if (shown('incident')) {
        L.rays.forEach(r => R.ray(r.src, r.hit, { colour: d['colour.incident'], width: rw, frac: prog.incident, head, arrowAt: 0.5 }));
        if (labelled('incident') && prog.incident >= 1) R.label(L.tip[0] - 14 * s, L.tip[1] + 10 * s, 'incident rays', lab(d, { colour: d['colour.incident'], align: 'right' }));
      }
      if (shown('reflected')) {
        L.rays.forEach(r => R.ray(r.hit, r.end, { colour: d['colour.reflected'], width: rw, frac: prog.reflected, head, arrowAt: 0.5 }));
        if (labelled('reflected') && prog.reflected >= 1) labelAlong(L.rays[0].hit, L.rays[0].end, 0.62, 'reflected rays', true, lab(d, { colour: d['colour.reflected'] }));
      }
      if (shown('virtual')) {
        L.rays.forEach(r => R.ray(r.hit, L.imgTip, { colour: d['colour.virtual'], width: rw, frac: prog.virtual, arrow: false, dashed: true }));
        if (labelled('virtual') && prog.virtual >= 1) labelAlong(L.rays[1].hit, L.imgTip, 0.5, 'virtual rays', false, lab(d, { colour: d['colour.virtual'] }));
      }
      if (shown('image')) g.alpha(prog.image || 0, () => {
        drawShape(d, s, L.imgBase, L.imgTip, d['colour.image'], true);
        g.circle(L.imgTip[0], L.imgTip[1], 3.5 * s, d['colour.virtual']);
        if (labelled('image')) {
          R.label(L.imgBase[0], L.baseY + 14 * s, 'image', lab(d, { align: 'center', bg: false }));
          const y = L.baseY + 36 * s, col = g.withAlpha(d['colour.text'], 0.7), txt = fmtCm(dist());
          [[L.base[0], L.mx], [L.mx, L.imgBase[0]]].forEach(([x0, x1]) => {
            g.line(x0, y, x1, y, col, 1 * s); g.line(x0, y - 5 * s, x0, y + 5 * s, col, 1 * s); g.line(x1, y - 5 * s, x1, y + 5 * s, col, 1 * s);
            R.label((x0 + x1) / 2, y + 12 * s, txt, lab(d, { align: 'center', bg: false, weight: '600' }));
          });
        }
      });
      if (shown('characteristics') && labelled('characteristics')) {
        const o = lab(d, { size: d['text.size'] * s * 0.9, bg: false });
        const x = L.mx + 24 * s, y0 = L.mt + 8 * s, lh = o.size * 1.45;
        const lines = ['Image:', 'same size as the object', 'same distance behind the mirror', 'upright', 'laterally inverted', 'virtual'];
        const w = Math.max.apply(null, lines.map(t => g.formulaWidth(t, { size: o.size, font: o.font, weight: '600' }))) + 28 * s;
        g.roundRect(x - 8 * s, y0 - 4 * s, w, lh * lines.length + 8 * s, 8 * s, g.withAlpha(d['colour.text'], 0.05), g.withAlpha(d['colour.text'], 0.18), 1);
        lines.forEach((t, k) => R.label(x + (k ? 14 * s : 0), y0 + lh * (k + 0.5), (k ? '• ' : '') + t, Object.assign({}, o, { weight: k ? '600' : '800' })));
      }
      if (prog.incident >= 1 && prog.reflected >= 1) pulses(d, s, L.rays.flatMap(r => [[r.src, r.hit, d['colour.incident']], [r.hit, r.end, d['colour.reflected']]]));
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
      const base = st.num ? 'Step ' + st.num : ({ start: 'Start', finish: 'Finish' }[st.key] || '');
      return isStudy() ? base + '   ·   Score ' + score.right + ' / ' + score.total : base;
    }
    function drawStory(d, s) {
      const ts = d['text.size'] * s, font = d['text.font'], text = d['colour.text'];
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
      let lines = wrapF(stepText(st), textW, o);
      while (lines.length > 3 && o.size > 8) { o.size *= 0.92; lines = wrapF(stepText(st), textW, o); }
      const lh = o.size * 1.22, y0 = by + ts * 1.55 + o.size * 0.55;
      lines.forEach((ln, i) => g.formula(bx + 12 * s, y0 + i * lh, ln, o));
    }

    function draw() {
      const d = D(), L = layout(), s = L.s;
      g.begin(d['colour.background']);
      if (L.kind === 'single') drawSingle(L, d); else drawObject(L, d);
      const ts = d['text.size'] * s;
      if (d['text.showTitle']) g.text(12 * s, 16 * s, preset.heading, { font: d['text.font'], size: ts * 1.1, weight: '800', color: d['colour.text'] });
      if (L.kind === 'single' && (shown('angleI') || shown('angleR')) && (isStory() || !d['text.showReadouts'])) {
        const parts = []; if (shown('angleI')) parts.push('i = ' + angle() + '°'); if (shown('angleR')) parts.push('r = ' + angle() + '°');
        g.text(12 * s, 16 * s + ts * 1.5, parts.join('     '), { font: d['text.font'], size: ts * 0.95, weight: '700', color: g.withAlpha(d['colour.text'], 0.8) });
      }
      if (!isStory() && d['text.showReadouts'] && L.kind === 'single') {
        const txt = 'i = ' + angle() + '°     r = ' + angle() + '°     (drag the handle or move the slider)';
        g.text(12 * s, 16 * s + ts * 1.5, txt, { font: d['text.font'], size: ts * 0.9, color: g.withAlpha(d['colour.text'], 0.75) });
      }
      if (isStory()) drawStory(d, s);
    }

    // ---------------------------------------------------------------- pointer: story buttons and drag handles
    const el = ctx.canvas.el;
    function pos(ev) { const r = el.getBoundingClientRect(); return [ev.clientX - r.left, ev.clientY - r.top]; }
    el.addEventListener('pointerdown', ev => {
      const [x, y] = pos(ev), L = layout(), s = L.s;
      const hit = r => r && x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
      if (isStory()) { if (hit(btnRects.next)) { action('next'); return; } if (hit(btnRects.back)) { action('back'); return; } }
      const grab = 26 * s;
      if (L.kind === 'single' && shown('incident') && Math.hypot(x - L.src[0], y - L.src[1]) < grab) drag = 'angle';
      else if (L.kind === 'object' && shown('eye') && Math.hypot(x - L.eye[0], y - L.eye[1]) < Math.max(grab, L.es)) drag = 'eye';
      else if (L.kind === 'object' && shown('object') && Math.abs(x - L.base[0]) < grab && y > L.tip[1] - grab && y < L.baseY + grab) { drag = 'object'; grabDy = L.baseY - y; }
      if (drag) { try { el.setPointerCapture(ev.pointerId); } catch (e) { /* not supported */ } }
    });
    el.addEventListener('pointermove', ev => {
      if (!drag) return;
      const [x, y] = pos(ev), L = layout();
      if (drag === 'angle') {
        side = x < L.hit[0] ? 1 : -1;                         // the source may swing right through the normal
        const a = Math.atan2(Math.abs(L.hit[0] - x), L.hit[1] - y) / DEG;
        ctx.controls.set('angle', Math.round(Math.max(5, Math.min(85, a))));
      } else if (drag === 'eye') {
        eyePos = [Math.max(0.03, Math.min(L.mx / g.w - 0.08, x / g.w)), Math.max(0.05, Math.min(0.82, y / g.h))];
      } else {
        const cm = (L.mx - x) / g.w * D()['scale.cmPerWidth'];
        ctx.controls.set('distance', Math.round(Math.max(2, Math.min(12, cm)) * 2) / 2);
        ctx.controls.set('objectY', Math.round(Math.max(0.4, Math.min(0.8, (y + grabDy) / g.h)) * 100) / 100);
      }
    });
    const endDrag = () => { drag = null; };
    el.addEventListener('pointerup', endDrag); el.addEventListener('pointercancel', endDrag);

    return { reset, update, draw, action, onControl,
      get step() { return storyStep; }, get stepCount() { return steps.length; },
      get status() { const p = {}; Object.keys(prog).forEach(k => { p[k] = Math.round(prog[k] * 100) / 100; }); return 'shown ' + ELEMENTS.filter(shown).join(',') + ' prog ' + JSON.stringify(p); },
      stepLabelFor: i => steps[i].key, questionFor, questionsFor, openQuestion };
  }

  Topics.register({
    id: 'reflection',
    title: 'Reflection at a plane mirror',
    description: 'Incident ray, normal, angles i and r, and the virtual image of an object in a plane mirror.',
    aspect: 0.64,
    presets: PRESETS,
    controls, designSchema, create
  });
})();
