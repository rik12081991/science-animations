// Question overlay shown over the canvas. Reusable by any topic.
// Quiz.ask(overlayEl, question, done)
//   question = { prompt, hint,
//                options: [{label, correct}], multi,             single or multi choice
//             or match: { left: [{label, answer}], right: [label] }   click a left item then a right item
//             or typed: {placeholder, check(text), answer}  or  typed: { fields: [{label, placeholder, check, answer}] } }
//   done(firstTryCorrect) is called when the student gets it right or reveals the answer.
(function () {
  const el = Controls.el;

  // "SO_4^2-" -> HTML with <sub>/<sup>
  function formulaHTML(str) {
    let out = '', i = 0;
    const esc = t => t.replace(/&/g, '&amp;').replace(/</g, '&lt;');
    str = String(str);
    while (i < str.length) {
      const ch = str[i];
      if (ch === '_') { let j = i + 1, s = ''; while (j < str.length && /[0-9]/.test(str[j])) { s += str[j]; j++; } out += '<sub>' + s + '</sub>'; i = j; }
      else if (ch === '^') { let j = i + 1, s = ''; while (j < str.length && !' ),.;:'.includes(str[j])) { s += str[j]; j++; } out += '<sup>' + esc(s.replace(/-/g, '−')) + '</sup>'; i = j; }
      else { out += esc(ch); i++; }
    }
    return out;
  }

  function ask(overlay, q, done) {
    let attempts = 0;

    function render() {
      overlay.innerHTML = '';
      const wrap = el('div', 'q-overlay');
      const card = el('div', 'q-card');
      wrap.appendChild(card);
      overlay.appendChild(wrap);
      const prompt = el('div', 'q-prompt'); prompt.innerHTML = formulaHTML(q.prompt); card.appendChild(prompt);
      if (q.hint) { const h = el('div', 'q-hint'); h.innerHTML = formulaHTML(q.hint); card.appendChild(h); }
      const feedback = el('div', 'q-feedback');
      const actions = el('div', 'q-actions');
      let finished = false;
      let reveal = () => {};

      function finish(firstTry) {
        if (finished) return; finished = true;
        const btn = el('button', 'btn primary', 'Continue ›'); btn.type = 'button';
        btn.addEventListener('click', () => { overlay.innerHTML = ''; done(firstTry); });
        actions.innerHTML = ''; actions.appendChild(btn); btn.focus();
      }
      function wrong() {
        attempts++;
        feedback.textContent = attempts === 1 ? 'Not quite.' : 'Still not right.';
        feedback.className = 'q-feedback bad';
        actions.innerHTML = '';
        const again = el('button', 'btn primary', 'Try again'); again.type = 'button';
        again.addEventListener('click', render);
        actions.appendChild(again);
        if (attempts >= 2) {
          const rv = el('button', 'btn', 'Show answer'); rv.type = 'button';
          rv.addEventListener('click', () => { reveal(); finish(false); });
          actions.appendChild(rv);
        }
        lock();
      }
      function right() {
        feedback.textContent = attempts === 0 ? 'Correct!' : 'Correct.';
        feedback.className = 'q-feedback good';
        finish(attempts === 0);
      }
      let lock = () => { finished = true; };

      if (q.options) {
        const opts = el('div', 'q-opts');
        const btns = [];
        q.options.forEach(o => {
          const b = el('button', 'q-opt'); b.type = 'button'; b.innerHTML = formulaHTML(o.label);
          b.setAttribute('aria-pressed', 'false');
          b.addEventListener('click', () => {
            if (finished) return;
            if (q.multi) { b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') !== 'true'); return; }
            if (o.correct) { b.classList.add('right'); right(); } else { b.classList.add('wrong'); wrong(); }
          });
          btns.push({ b, o }); opts.appendChild(b);
        });
        card.appendChild(opts);
        if (q.multi) {
          const check = el('button', 'btn primary', 'Check answer'); check.type = 'button';
          check.addEventListener('click', () => {
            if (finished) return;
            const ok = btns.every(x => (x.b.getAttribute('aria-pressed') === 'true') === !!x.o.correct);
            if (ok) { btns.forEach(x => { if (x.o.correct) x.b.classList.add('right'); }); right(); }
            else { btns.forEach(x => { if ((x.b.getAttribute('aria-pressed') === 'true') !== !!x.o.correct) x.b.classList.add('wrong'); }); wrong(); }
          });
          actions.appendChild(check);
        }
        reveal = () => btns.forEach(x => { x.b.classList.remove('wrong'); if (x.o.correct) x.b.classList.add('right'); x.b.setAttribute('aria-pressed', String(!!x.o.correct)); });
      } else if (q.gaps) {
        // sentences: arrays of text pieces where '' is a blank; answers: per-sentence arrays of words; bank: words to pick from
        const G = q.gaps;
        const fills = G.sentences.map(sn => sn.filter(x => x === '').map(() => null));
        let sel = null;                          // { si, bi }
        const blankBtns = [];
        const box = el('div', 'q-gaps');
        const firstEmpty = () => { for (let si = 0; si < fills.length; si++) for (let bi = 0; bi < fills[si].length; bi++) if (fills[si][bi] == null) return { si, bi }; return null; };
        const paint = () => blankBtns.forEach(({ b, si, bi }) => {
          b.textContent = fills[si][bi] == null ? '______' : fills[si][bi];
          b.classList.toggle('filled', fills[si][bi] != null);
          b.setAttribute('aria-pressed', String(sel && sel.si === si && sel.bi === bi));
        });
        G.sentences.forEach((sn, si) => {
          const line = el('div', 'q-sentence');
          let bi = 0;
          sn.forEach(piece => {
            if (piece === '') {
              const b = el('button', 'q-blank'); b.type = 'button';
              const myBi = bi++;
              b.addEventListener('click', () => { if (finished) return; if (fills[si][myBi] != null) fills[si][myBi] = null; sel = { si, bi: myBi }; paint(); });
              blankBtns.push({ b, si, bi: myBi }); line.appendChild(b);
            } else { const sp = el('span'); sp.innerHTML = formulaHTML(piece) + ' '; line.appendChild(sp); }
          });
          box.appendChild(line);
        });
        const bank = el('div', 'q-opts q-bank');
        G.bank.forEach(w => {
          const b = el('button', 'q-opt'); b.type = 'button'; b.innerHTML = formulaHTML(w);
          b.addEventListener('click', () => { if (finished) return; if (!sel) sel = firstEmpty(); if (!sel) return; fills[sel.si][sel.bi] = w; sel = firstEmpty(); paint(); });
          bank.appendChild(b);
        });
        card.appendChild(box); card.appendChild(bank);
        sel = firstEmpty(); paint();
        const lines = () => box.querySelectorAll('.q-sentence');
        const check = el('button', 'btn primary', 'Check answer'); check.type = 'button';
        check.addEventListener('click', () => {
          if (finished) return;
          if (firstEmpty()) { feedback.textContent = 'Fill every gap first.'; feedback.className = 'q-feedback'; return; }
          const key = a => a.join('|');
          let ok = true;
          if (G.unordered) {
            const remaining = G.answers.map(key);
            fills.forEach((f, si) => { const k = key(f); const idx = remaining.indexOf(k); if (idx >= 0) { remaining.splice(idx, 1); lines()[si].classList.add('right'); } else { ok = false; lines()[si].classList.add('wrong'); } });
          } else {
            fills.forEach((f, si) => { const good = key(f) === key(G.answers[si]); if (!good) ok = false; lines()[si].classList.add(good ? 'right' : 'wrong'); });
          }
          if (ok) right(); else wrong();
        });
        actions.appendChild(check);
        reveal = () => { G.answers.forEach((a, si) => { fills[si] = a.slice(); }); sel = null; paint(); lines().forEach(l => { l.classList.remove('wrong'); l.classList.add('right'); }); };
      } else if (q.match) {
        const box = el('div', 'q-match');
        const colL = el('div', 'q-col'), colR = el('div', 'q-col');
        box.appendChild(colL); box.appendChild(colR); card.appendChild(box);
        const assign = {};                       // left index -> right index
        let sel = null;                          // { side, idx }
        const lefts = [], rights = [];
        const paint = () => {
          lefts.forEach((b, i) => {
            b.setAttribute('aria-pressed', String(sel && sel.side === 'L' && sel.idx === i));
            b.innerHTML = formulaHTML(q.match.left[i].label) + (assign[i] != null ? '<span class="q-pair">→ ' + formulaHTML(q.match.right[assign[i]]) + '</span>' : '');
          });
          rights.forEach((b, j) => b.setAttribute('aria-pressed', String(sel && sel.side === 'R' && sel.idx === j)));
        };
        const pick = (side, idx) => {
          if (finished) return;
          if (sel && sel.side !== side) {
            const li = side === 'L' ? idx : sel.idx, ri = side === 'R' ? idx : sel.idx;
            assign[li] = ri; sel = null;
            const nextFree = q.match.left.findIndex((x, i) => assign[i] == null);
            if (nextFree >= 0) sel = { side: 'L', idx: nextFree };
          } else sel = (sel && sel.side === side && sel.idx === idx) ? null : { side, idx };
          paint();
        };
        q.match.left.forEach((it, i) => { const b = el('button', 'q-opt q-left'); b.type = 'button'; b.addEventListener('click', () => pick('L', i)); lefts.push(b); colL.appendChild(b); });
        q.match.right.forEach((lab, j) => { const b = el('button', 'q-opt q-right'); b.type = 'button'; b.innerHTML = formulaHTML(lab); b.addEventListener('click', () => pick('R', j)); rights.push(b); colR.appendChild(b); });
        sel = { side: 'L', idx: 0 }; paint();
        const check = el('button', 'btn primary', 'Check answer'); check.type = 'button';
        check.addEventListener('click', () => {
          if (finished) return;
          if (q.match.left.some((x, i) => assign[i] == null)) { feedback.textContent = 'Match every item on the left first: click an item, then click its partner.'; feedback.className = 'q-feedback'; return; }
          const answerIdx = it => typeof it.answer === 'number' ? it.answer : q.match.right.indexOf(it.answer);
          let ok = true;
          q.match.left.forEach((it, i) => { const good = assign[i] === answerIdx(it); if (!good) ok = false; lefts[i].classList.add(good ? 'right' : 'wrong'); });
          if (ok) right(); else wrong();
        });
        actions.appendChild(check);
        reveal = () => { q.match.left.forEach((it, i) => { assign[i] = typeof it.answer === 'number' ? it.answer : q.match.right.indexOf(it.answer); }); sel = null; paint(); lefts.forEach(b => { b.classList.remove('wrong'); b.classList.add('right'); }); };
      } else if (q.typed) {
        const fields = q.typed.fields || [q.typed];
        const inputs = [];
        fields.forEach((f, i) => {
          if (f.label) { const l = el('div', 'q-field-label'); l.innerHTML = formulaHTML(f.label); card.appendChild(l); }
          const row = el('div', 'q-typed');
          const input = el('input', 'q-input'); input.type = 'text'; input.placeholder = f.placeholder || 'Type your answer';
          input.autocapitalize = 'off'; input.autocomplete = 'off'; input.spellcheck = false;
          input.addEventListener('keydown', ev => { ev.stopPropagation(); if (ev.key === 'Enter') { if (i < fields.length - 1) inputs[i + 1].focus(); else go(); } });
          row.appendChild(input); card.appendChild(row); inputs.push(input);
        });
        const go = () => {
          if (finished) return;
          let ok = true;
          fields.forEach((f, i) => { const good = f.check(inputs[i].value); inputs[i].classList.add(good ? 'right' : 'wrong'); if (!good) ok = false; });
          if (ok) right(); else wrong();
        };
        const check = el('button', 'btn primary', 'Check'); check.type = 'button';
        check.addEventListener('click', go);
        actions.appendChild(check);
        setTimeout(() => inputs[0].focus(), 50);
        reveal = () => { const a = el('div', 'q-answer'); a.innerHTML = fields.map(f => (f.label ? formulaHTML(f.label) + ': ' : 'Answer: ') + formulaHTML(f.answer)).join('<br>'); card.insertBefore(a, feedback); };
      }
      card.appendChild(feedback); card.appendChild(actions);
    }
    render();
  }

  window.Quiz = { ask, formulaHTML, close(overlay) { overlay.innerHTML = ''; } };
})();
