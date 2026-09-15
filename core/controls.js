// Builds a panel of inputs from a schema. Used by both the teaching panel and the design panel.
// Schema item: { id, type, label, default, group, min, max, step, unit, options, showIf(values) }
// Types: toggle | range | select | segmented | colour | button | text
(function () {
  function el(tag, cls, text) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function normOptions(opts) {
    return opts.map(o => typeof o === 'string' ? { value: o, label: o.charAt(0).toUpperCase() + o.slice(1) } : o);
  }
  function fmt(v, item) {
    if (item.format) return item.format(v);
    const step = item.step || 1;
    const dec = (String(step).split('.')[1] || '').length;
    return Number(v).toFixed(dec) + (item.unit ? ' ' + item.unit : '');
  }
  let uid = 0;

  function build(container, schema, initial, onChange) {
    const values = Object.assign({}, initial);
    const rows = [];
    const groups = {};
    const root = el('div', 'ctl-root');
    container.appendChild(root);

    function groupFor(name) {
      if (!name) return root;
      if (!groups[name]) {
        const fs = el('fieldset', 'ctl-group');
        fs.appendChild(el('legend', null, name));
        root.appendChild(fs);
        groups[name] = fs;
      }
      return groups[name];
    }
    function refreshVisibility() {
      rows.forEach(r => { if (r.item.showIf) r.row.hidden = !r.item.showIf(values); });
    }

    schema.forEach(item => {
      if (values[item.id] === undefined && item.default !== undefined) values[item.id] = item.default;
      const row = el('div', 'ctl-row ctl-' + item.type);
      row.dataset.id = item.id;
      const label = el('label', 'ctl-label', item.label || item.id);
      const id = 'ctl_' + (++uid);
      let update = () => {};
      const set = v => { values[item.id] = v; refreshVisibility(); if (onChange) onChange(item.id, v, values, item); };

      switch (item.type) {
        case 'toggle': {
          const input = el('input', 'ctl-switch'); input.type = 'checkbox'; input.id = id;
          input.checked = !!values[item.id];
          input.addEventListener('change', () => set(input.checked));
          label.htmlFor = id;
          row.classList.add('ctl-inline'); row.appendChild(label); row.appendChild(input);
          update = v => { input.checked = !!v; };
          break;
        }
        case 'range': {
          const input = el('input'); input.type = 'range'; input.id = id;
          input.min = item.min; input.max = item.max; input.step = item.step || 1;
          input.value = values[item.id];
          const out = el('output', 'ctl-value', fmt(values[item.id], item));
          input.addEventListener('input', () => { const v = parseFloat(input.value); out.textContent = fmt(v, item); set(v); });
          label.htmlFor = id;
          const head = el('div', 'ctl-head'); head.appendChild(label); head.appendChild(out);
          row.appendChild(head); row.appendChild(input);
          update = v => { input.value = v; out.textContent = fmt(v, item); };
          break;
        }
        case 'select': {
          const sel = el('select'); sel.id = id;
          normOptions(item.options).forEach(o => {
            const op = el('option', null, o.label); op.value = o.value; sel.appendChild(op);
          });
          sel.value = values[item.id];
          sel.addEventListener('change', () => set(sel.value));
          label.htmlFor = id;
          row.appendChild(label); row.appendChild(sel);
          update = v => { sel.value = v; };
          break;
        }
        case 'segmented': {
          const seg = el('div', 'seg');
          const btns = [];
          normOptions(item.options).forEach(o => {
            const b = el('button', null, o.label); b.type = 'button';
            b.setAttribute('aria-pressed', String(values[item.id] === o.value));
            b.addEventListener('click', () => { set(o.value); update(o.value); });
            btns.push([b, o.value]); seg.appendChild(b);
          });
          row.appendChild(label); row.appendChild(seg);
          update = v => btns.forEach(([b, val]) => b.setAttribute('aria-pressed', String(val === v)));
          break;
        }
        case 'colour': {
          const input = el('input'); input.type = 'color'; input.id = id;
          input.value = values[item.id] || '#000000';
          input.addEventListener('input', () => set(input.value));
          label.htmlFor = id;
          row.classList.add('ctl-inline'); row.appendChild(label); row.appendChild(input);
          update = v => { input.value = v; };
          break;
        }
        case 'text': {
          const input = el('input'); input.type = 'text'; input.id = id;
          input.value = values[item.id] || '';
          input.addEventListener('input', () => set(input.value));
          label.htmlFor = id;
          row.appendChild(label); row.appendChild(input);
          update = v => { input.value = v; };
          break;
        }
        case 'button': {
          const b = el('button', 'btn' + (item.primary ? ' primary' : ''), item.label); b.type = 'button';
          b.addEventListener('click', () => { if (onChange) onChange(item.id, true, values, item); });
          row.appendChild(b);
          break;
        }
        default:
          row.appendChild(label);
      }
      groupFor(item.group).appendChild(row);
      rows.push({ item, row, update });
    });
    refreshVisibility();

    return {
      values, root,
      set(id, v, silent) {
        const r = rows.find(x => x.item.id === id);
        values[id] = v;
        if (r) r.update(v);
        refreshVisibility();
        if (!silent && onChange && r) onChange(id, v, values, r.item);
      },
      setAll(obj, silent) { Object.keys(obj).forEach(k => this.set(k, obj[k], silent)); },
      refresh: refreshVisibility
    };
  }
  window.Controls = { build, el };
})();
