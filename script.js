var viewMode = 'both';
var ragOn = true;
var humanOn = true;
var currentChart = 0;


function setView(mode) {
  viewMode = mode;
  document.body.setAttribute('data-view', mode);
  var names = ['doctor', 'engineer', 'both'];
  for (var i = 0; i < names.length; i++) {
    var btn = document.getElementById('view-' + names[i]);
    btn.className = 'px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg ' +
      (names[i] === mode ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200');
  }
}


function toggleRag()   { ragOn = !ragOn;     refresh(); }
function toggleHuman() { humanOn = !humanOn; refresh(); }



function getOutcome() {
  if (!ragOn && !humanOn) return { box: 'bg-rose-50 border-rose-400 text-rose-950', title: 'A fake diagnosis reaches the patient', text: 'No database lookup and no human reviewer. The invented disease goes straight into care plans [5, 7].' };
  if (!ragOn && humanOn)  return { box: 'bg-amber-50 border-amber-400 text-amber-950', title: 'It depends on the clinician catching it', text: 'A doctor may spot the fake disease, but only if they actively audit the output. The AI still generated the error [7, 9].' };
  if (ragOn && !humanOn)  return { box: 'bg-amber-50 border-amber-400 text-amber-950', title: 'Fewer errors, but unverified edge cases remain', text: 'RAG cuts hallucinations, yet residual errors remain in complex cases without a human reviewer [7, 9].' };
  return { box: 'bg-emerald-50 border-emerald-400 text-emerald-950', title: 'Grounded answer, checked by a person', text: 'The answer is retrieved from verified databases and signed off by a clinician. This is the optimal framework [2, 3, 9].' };
}



function paintOutcome(id) {
  var o = getOutcome();
  var el = document.getElementById(id);
  el.className = 'p-4 rounded-xl border ' + o.box;
  el.innerHTML = '<strong class="block mb-1">' + o.title + '</strong><span class="text-sm">' + o.text + '</span>';
}



function refresh() {
  var r = document.getElementById('btn-rag');
  r.textContent = 'RAG check: ' + (ragOn ? 'ON' : 'OFF');
  r.className = 'px-3 py-1.5 text-xs sm:text-sm font-bold rounded-lg text-white ' + (ragOn ? 'bg-emerald-700' : 'bg-rose-700');
  var h = document.getElementById('btn-human');
  h.textContent = 'Human review: ' + (humanOn ? 'ON' : 'OFF');
  h.className = 'px-3 py-1.5 text-xs sm:text-sm font-bold rounded-lg text-white ' + (humanOn ? 'bg-emerald-700' : 'bg-rose-700');

  document.getElementById('code-human').textContent = humanOn ? 'true' : 'false';

  var ai = document.getElementById('ai-box');
  if (ragOn) {
    ai.className = 'p-4 rounded-xl border mb-3 bg-emerald-50 border-emerald-400 text-emerald-950';
    ai.innerHTML = '<strong class="block mb-1">AI output: grounded shortlist</strong><span class="text-sm">Searched trusted databases. No match for "Bixonimania", so it was dropped [7]. Variant flagged for clinician review [2].</span>';
  } else {
    ai.className = 'p-4 rounded-xl border mb-3 bg-rose-50 border-rose-400 text-rose-950';
    ai.innerHTML = '<strong class="block mb-1">AI output: hallucination</strong><span class="text-lg font-extrabold block">Bixonimania Syndrome</span><span class="text-sm">Stated confidence: 98% (illustrative). This disease is fictional [7].</span>';
  }
  paintOutcome('out-2');

  var good = 'p-3 rounded-lg border bg-emerald-50 border-emerald-400 text-emerald-950';
  var bad  = 'p-3 rounded-lg border bg-rose-50 border-rose-400 text-rose-950';
  var off  = 'p-3 rounded-lg border border-dashed bg-slate-100 border-slate-400 text-slate-500';
  document.getElementById('flow').innerHTML =
    '<div class="' + (ragOn ? good : bad) + '">Data<br><span class="font-normal">' + (ragOn ? 'Verified databases' : 'Unvetted web text') + '</span></div>' +
    '<div class="' + (ragOn ? good : bad) + '">AI model<br><span class="font-normal">' + (ragOn ? 'RAG Search' : 'Raw Memory') + '</span></div>' +
    '<div class="' + (humanOn ? good : off) + '">Clinician<br><span class="font-normal">' + (humanOn ? 'Reviews result' : 'Skipped') + '</span></div>';
  paintOutcome('out-3');

  document.getElementById('row-off').style.opacity = ragOn ? '0.4' : '1';
  document.getElementById('row-on').style.opacity  = ragOn ? '1' : '0.4';
}



function showChart(n) {
  currentChart = n;
  var charts = document.querySelectorAll('.chart');
  for (var i = 0; i < charts.length; i++) charts[i].classList.toggle('show', i === n);

  var steps = document.querySelectorAll('.step');
  for (var j = 0; j < steps.length; j++) steps[j].classList.toggle('active', j === n);

  document.getElementById('step-label').textContent = 'Step ' + (n + 1) + ' of 5';

  var bars = document.querySelectorAll('#chart-' + n + ' .bar-fill');
  for (var k = 0; k < bars.length; k++) { bars[k].style.width = '0%'; }
  setTimeout(function () {
    for (var m = 0; m < bars.length; m++) { bars[m].style.width = bars[m].getAttribute('data-w'); }
  }, 60);
}



function watchSteps() {
  if (!('IntersectionObserver' in window)) return;
  var narrow = window.matchMedia('(max-width: 860px)').matches;
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        var n = parseInt(entry.target.getAttribute('data-chart'), 10);
        if (n !== currentChart) showChart(n);
      }
    });
  }, { rootMargin: narrow ? '-60% 0px -30% 0px' : '-45% 0px -45% 0px' });
  document.querySelectorAll('.step').forEach(function (s) { observer.observe(s); });
}



function updateProgress() {
  var total = document.documentElement.scrollHeight - window.innerHeight;
  var pct = total > 0 ? Math.min(100, Math.max(0, (window.scrollY / total) * 100)) : 0;
  document.getElementById('progress').style.width = pct + '%';
}
window.addEventListener('scroll', updateProgress);



var roleText = {
  patient:  '<strong>For patients:</strong> Ask your care team whether any AI tool used in your diagnosis draws on verified medical databases and whether a doctor signs off on every result[2, 3].',
  engineer: '<strong>For software developers:</strong> Build transparency in from the start. Show clinicians reasoning traces, cite retrieved sources, and warn automatically when evidence is thin[4, 9].',
  policy:   '<strong>For policymakers:</strong> Require rigorous pre-deployment testing and ongoing error tracking after launch before approving clinical AI applications[4, 9].'
};



function setRole(role) {
  document.getElementById('role-box').innerHTML = roleText[role];
  ['patient', 'engineer', 'policy'].forEach(function (r) {
    document.getElementById('role-' + r).className = 'px-4 py-2 text-xs font-bold rounded-lg border ' +
      (r === role ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-100 text-slate-700 border-slate-300');
  });
}



function measureBar() {
  document.documentElement.style.setProperty('--bar-h', (document.getElementById('bar').offsetHeight + 8) + 'px');
}
window.addEventListener('resize', measureBar);


window.addEventListener('DOMContentLoaded', function () {
  setView('both');
  refresh();
  setRole('patient');
  showChart(0);
  measureBar();
  watchSteps();
  updateProgress();
});