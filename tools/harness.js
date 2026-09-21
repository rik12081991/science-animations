// Injected into a built dist file by tools/verify.py. Headless Chrome does not tick
// requestAnimationFrame under --virtual-time-budget, so this drives sim.update() by hand
// and prints results into a pre element with id errlog, which verify.py reads from the DOM dump.
//
// URL params:  steps=N sim=SECS   walk N Next presses, simulate SECS each (last=SECS for the final one)
//              check=1            self-check every study question (answers pass own check)
//              open=I             open the question for step I and leave it on screen
//              labels=1           with check=1, also list step labels
window.__errs=[]; window.onerror=function(m,s,l,c,e){window.__errs.push(m+' @'+l+':'+c+' '+(e&&e.stack||''));};
setTimeout(function(){
  var q = new URLSearchParams(location.search), out=[];
  try {
    // stop the app's own animation loop so only the manual update() calls below advance the sim
    var eng = window.app.engine; if (eng && eng.playing && eng.toggle) eng.toggle();
    if (q.get('check')) {
      var sim = window.app.sim, n = sim.stepCount, bad = 0, total = 0;
      for (var i0=0;i0<n;i0++){ var qsl = sim.questionsFor(i0); for (var j=0;j<qsl.length;j++){ var qq = qsl[j]; total++;
        if (qq.options) { var c = qq.options.filter(function(o){return o.correct;}).length; if (c<1 || (!qq.multi && c!==1)) { bad++; out.push('BAD options step '+i0+' '+qq.prompt); } }
        else if (qq.gaps) { var g=qq.gaps; g.answers.forEach(function(a){ a.forEach(function(w){ if (g.bank.indexOf(w)<0) { bad++; out.push('BAD gap word '+w); } }); }); }
        else if (qq.match) { qq.match.left.forEach(function(it){ var idx = typeof it.answer==='number'? it.answer : qq.match.right.indexOf(it.answer); if (idx<0 || idx>=qq.match.right.length) { bad++; out.push('BAD match step '+i0+' '+it.label+' -> '+it.answer); } }); }
        else if (qq.typed) { var fs = qq.typed.fields||[qq.typed]; fs.forEach(function(f){ if (!f.check(f.answer)) { bad++; out.push('BAD typed step '+i0+' '+(f.label||qq.prompt)+' answer='+f.answer); } }); }
        else { bad++; out.push('BAD no answer form step '+i0); }
      } }
      out.push('questions '+total+' bad '+bad);
      if (q.get('labels')) { var L=[]; for (var i=0;i<n;i++){ L.push((sim.questionFor(i)?'Q+':'')+ (sim.stepLabelFor? sim.stepLabelFor(i):i)); } out.push(L.join(' ')); }
    } else if (q.get('open')) {
      window.app.sim.openQuestion(parseInt(q.get('open')));
      window.app.sim.draw(); out.push(window.app.sim.status!==undefined ? 'step '+window.app.sim.step+' '+window.app.sim.status : 'ions '+window.app.sim.ionCount+' step '+window.app.sim.step);
    } else {
      var steps = parseInt(q.get('steps')||'0'), secs = parseFloat(q.get('sim')||'3'), last = parseFloat(q.get('last')||secs);
      for (var k=0;k<steps;k++){ window.app.sim.action('next'); var ss = k===steps-1 ? last : secs; for (var i=0;i<ss*60;i++) window.app.sim.update(1/60); window.app.sim.draw(); }
      if (!steps) for (var i=0;i<secs*60;i++) window.app.sim.update(1/60);
      window.app.sim.draw(); out.push(window.app.sim.status!==undefined ? 'step '+window.app.sim.step+' '+window.app.sim.status : 'ions '+window.app.sim.ionCount+' step '+window.app.sim.step+' stuck '+window.app.sim.stuck+' '+JSON.stringify(window.app.sim.speciesCounts)+' busy '+window.app.sim.busyIons.join(','));
    }
  } catch(e){ window.__errs.push('step: '+e.message+' '+e.stack); }
  var p=document.createElement('pre');p.id='errlog';p.textContent=(window.__errs.join('\n')||'NO ERRORS')+' | '+out.join(' | ');document.body.appendChild(p);
},800);
