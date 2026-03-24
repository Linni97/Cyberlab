/* cyberlab.js — shared utilities */

/* ── Task accordion ─────────────────────────────────────── */
function toggleTask(el) {
  // supports both .lab-card (new modules) and .task-card (legacy)
  const card = el.closest('.lab-card') || el.closest('.task-card');
  if (!card) return;
  card.classList.toggle('open');
}

/* ── Hint / solution toggles ────────────────────────────── */
function toggleHint(btn) {
  const box = btn.nextElementSibling;
  const open = box.classList.toggle('show');
  btn.classList.toggle('on', open);
  btn.textContent = open ? '▼ Skjul hint' : '▶ Hint';
}

function toggleSolution(btn) {
  const box = btn.nextElementSibling;
  const open = box.classList.toggle('show');
  btn.classList.toggle('on', open);
  btn.textContent = open ? '▼ Skjul løsning' : '▶ Vis løsning';
}

/* ── Progress tracking (localStorage) ───────────────────── */
function getProgress() {
  try { return JSON.parse(localStorage.getItem('cl_progress') || '{}'); } catch { return {}; }
}
function saveProgress(data) {
  try { localStorage.setItem('cl_progress', JSON.stringify(data)); } catch {}
}

function markTaskDone(taskId) {
  const p = getProgress();
  p[taskId] = true;
  saveProgress(p);
  // Mark card done (border colour)
  const card = document.getElementById(taskId);
  if (card) card.classList.add('done');
  // Show completion banner
  const banner = document.getElementById('done-' + taskId);
  if (banner) banner.classList.add('show');
  updateModuleProgress();
}

function loadDoneStates() {
  const p = getProgress();
  Object.keys(p).forEach(id => {
    const card = document.getElementById(id);
    if (card) card.classList.add('done');
    const banner = document.getElementById('done-' + id);
    if (banner) banner.classList.add('show');
  });
  updateModuleProgress();
}

function updateModuleProgress() {
  // support .lab-card (new) and .task-card (legacy)
  const allCards = document.querySelectorAll('.lab-card[id], .task-card[id]');
  const all  = allCards.length;
  const done = document.querySelectorAll('.lab-card[id].done, .task-card[id].done').length;
  const fill  = document.getElementById('progressFill');
  const label = document.getElementById('progressLabel');
  if (fill)  fill.style.width = all ? (done / all * 100) + '%' : '0%';
  if (label) label.textContent = `${done} / ${all} fullført`;
}

/* ── Difficulty filter ───────────────────────────────────── */
function setFilter(level, btn) {
  document.querySelectorAll('.filter-pill').forEach(p => p.className = 'filter-pill');
  btn.classList.add(level === 'all' ? 'active-all' : 'active-' + level);
  // support both .lab-card and .task-card
  document.querySelectorAll('.lab-card, .task-card').forEach(card => {
    card.style.display = (level === 'all' || card.dataset.level === level) ? '' : 'none';
  });
}

/* ── Terminal ── uses lt-* classes (matching lab-shared.css) ─ */
function termRun(bodyId, cmd, responses) {
  const body = document.getElementById(bodyId);
  if (!body) return;
  const add = (text, cls) => {
    const d = document.createElement('div');
    d.className = cls;
    d.textContent = text;
    body.appendChild(d);
  };
  add('$ ' + cmd, 'lt-prompt');
  if (!cmd) { body.scrollTop = body.scrollHeight; return; }
  if (cmd.toLowerCase() === 'clear') { body.innerHTML = ''; return; }

  const key  = cmd.toLowerCase();
  const resp = responses[key] || responses[key.split(' ')[0]];
  if (resp) {
    resp.forEach(l => {
      const cls = l.t === 'info' ? 'lt-info'
                : l.t === 'err'  ? 'lt-err'
                : l.t === 'lt-err' ? 'lt-err'
                : 'lt-out';
      add(l.v, cls);
    });
  } else {
    add(`bash: ${cmd.split(' ')[0]}: command not found  (skriv 'help')`, 'lt-err');
  }
  body.scrollTop = body.scrollHeight;
}

function termInit(bodyId, inputId, responses) {
  const input = document.getElementById(inputId);
  if (!input) return;
  input.addEventListener('keydown', e => {
    if (e.key !== 'Enter') return;
    const cmd = input.value.trim();
    input.value = '';
    termRun(bodyId, cmd, responses);
  });
}

/* ── Quiz ────────────────────────────────────────────────── */
function quiz(el, correct) {
  const group = el.closest('.quiz-group');
  if (!group) return;
  group.querySelectorAll('.quiz-opt').forEach(o => {
    o.style.pointerEvents = 'none';
    if (o.dataset.correct === 'true' && !correct) o.classList.add('reveal');
  });
  el.classList.add(correct ? 'correct' : 'wrong');
}

/* ── SHA-256 hash helper ─────────────────────────────────── */
async function sha256(str) {
  try {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
  } catch {
    return '(crypto.subtle ikke tilgjengelig — bruk GitHub Pages)';
  }
}

/* ── On page load ────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  loadDoneStates();
});
