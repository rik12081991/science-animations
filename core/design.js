// Design panel: every visual parameter as a live control, persisted per topic in localStorage.
// Value precedence: schema defaults < baked (topics/<id>.design.js) < localStorage < URL ?design={...}
(function () {
  const KEY = id => 'sciAnim.design.' + id;
  const el = Controls.el;

  function defaults(schema) { const d = {}; schema.forEach(i => { if (i.default !== undefined) d[i.id] = i.default; }); return d; }
  function load(id) { try { const s = localStorage.getItem(KEY(id)); return s ? JSON.parse(s) : null; } catch (e) { return null; } }
  function save(id, v) { try { localStorage.setItem(KEY(id), JSON.stringify(v)); } catch (e) { /* private mode */ } }
  function clear(id) { try { localStorage.removeItem(KEY(id)); } catch (e) { /* ignore */ } }
  function diff(vals, base) { const d = {}; Object.keys(vals).forEach(k => { if (vals[k] !== base[k]) d[k] = vals[k]; }); return d; }
  function extractJson(text) {
    try { return JSON.parse(text); } catch (e) { /* fall through */ }
    const a = text.indexOf('{'), b = text.lastIndexOf('}');
    if (a >= 0 && b > a) return JSON.parse(text.slice(a, b + 1));
    throw new Error('No JSON object found');
  }

  function create(o) {
    const base = Object.assign({}, defaults(o.schema), o.baked || {});
    const stored = load(o.topicId) || {};
    const init = Object.assign({}, base, stored, o.urlOverrides || {});

    const tools = el('div', 'design-tools');
    o.container.appendChild(tools);
    const panel = Controls.build(o.container, o.schema, init, (id, v, vals) => {
      save(o.topicId, diff(vals, base));
      if (o.onChange) o.onChange(id, v, vals);
    });

    function exportText() {
      const json = JSON.stringify(panel.values, null, 2);
      return '// Design for topic "' + o.topicId + '". Drop this file into topics/ as ' + o.topicId + '.design.js\n' +
        'window.TopicDesigns = window.TopicDesigns || {};\n' +
        'window.TopicDesigns["' + o.topicId + '"] = ' + json + ';\n';
    }
    function applyJson(obj) {
      const clean = {};
      Object.keys(obj).forEach(k => { if (k in base) clean[k] = obj[k]; });
      panel.setAll(Object.assign({}, base, clean), true);
      save(o.topicId, diff(panel.values, base));
      if (o.onChange) o.onChange('*', null, panel.values);
    }

    const exportBtn = el('button', 'btn', 'Export design'); exportBtn.type = 'button';
    const importBtn = el('button', 'btn', 'Import design'); importBtn.type = 'button';
    const pasteBtn = el('button', 'btn', 'Show as text'); pasteBtn.type = 'button';
    const resetBtn = el('button', 'btn', 'Reset design'); resetBtn.type = 'button';
    const file = el('input'); file.type = 'file'; file.accept = '.js,.json,text/plain'; file.hidden = true;
    const ta = el('textarea'); ta.hidden = true; ta.spellcheck = false;
    const taBtns = el('div', 'design-tools'); taBtns.hidden = true;
    const applyBtn = el('button', 'btn primary', 'Apply text'); applyBtn.type = 'button';
    const copyBtn = el('button', 'btn', 'Copy'); copyBtn.type = 'button';
    taBtns.appendChild(applyBtn); taBtns.appendChild(copyBtn);
    [exportBtn, importBtn, pasteBtn, resetBtn, file].forEach(b => tools.appendChild(b));
    tools.appendChild(ta); tools.appendChild(taBtns);

    exportBtn.addEventListener('click', () => {
      const blob = new Blob([exportText()], { type: 'text/javascript' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob); a.download = o.topicId + '.design.js';
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    });
    importBtn.addEventListener('click', () => file.click());
    file.addEventListener('change', () => {
      const f = file.files[0]; if (!f) return;
      const rd = new FileReader();
      rd.onload = () => { try { applyJson(extractJson(String(rd.result))); } catch (e) { alert('Could not read design file: ' + e.message); } };
      rd.readAsText(f); file.value = '';
    });
    pasteBtn.addEventListener('click', () => {
      const show = ta.hidden; ta.hidden = !show; taBtns.hidden = !show;
      if (show) { ta.value = exportText(); }
      pasteBtn.textContent = show ? 'Hide text' : 'Show as text';
    });
    applyBtn.addEventListener('click', () => { try { applyJson(extractJson(ta.value)); } catch (e) { alert('Could not read design text: ' + e.message); } });
    copyBtn.addEventListener('click', () => {
      ta.select(); ta.setSelectionRange(0, ta.value.length);
      try { navigator.clipboard.writeText(ta.value); } catch (e) { document.execCommand('copy'); }
    });
    resetBtn.addEventListener('click', () => {
      if (!confirm('Reset all design settings for this topic?')) return;
      clear(o.topicId); panel.setAll(base, true);
      if (o.onChange) o.onChange('*', null, panel.values);
    });

    return {
      get values() { return panel.values; },
      set: panel.set, base, applyJson, exportText
    };
  }
  window.Design = { create };
})();
