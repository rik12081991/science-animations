// Topic registry. Each topic file calls Topics.register({...}) once.
// Contract:
//   id            unique string, also the file name in topics/
//   title         shown in header and launcher
//   aspect        canvas height / width (default 0.64)
//   presets       [{id, title, ...}]  named starting states
//   controls      schema for the teaching panel (see core/controls.js)
//   designSchema  schema for the design panel (see core/design.js)
//   create(ctx)   returns { reset(presetId), update(dt), draw(), action(id) }
//                 ctx = { g, canvas, controls, design }
(function () {
  const topics = {};
  const order = [];
  window.Topics = {
    register(def) {
      if (!def || !def.id) throw new Error('Topic needs an id');
      topics[def.id] = def;
      if (!order.includes(def.id)) order.push(def.id);
    },
    get(id) { return topics[id]; },
    list() { return order.map(id => topics[id]); }
  };
})();
