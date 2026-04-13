/* ══════════════════════════════════════════════════════════════════════════
   Abacus Test – Single-page application
   ══════════════════════════════════════════════════════════════════════════ */

// ── State ─────────────────────────────────────────────────────────────────────
let questions     = [];
let answers       = {};       // { [questionId]: string }
let currentIdx    = 0;
let timerSecs     = 0;
let timerHandle   = null;
let startTime     = null;
let userEmail     = '';
let userName      = '';
let timeLimitSecs = 0;        // 0 = no limit (count up); >0 = countdown

// ── View helpers ──────────────────────────────────────────────────────────────
function showView(id) {
  document.querySelectorAll('.view').forEach(v => {
    v.classList.toggle('active', v.id === id);
  });
}

// ── Timer ─────────────────────────────────────────────────────────────────────
function startTimer() {
  startTime   = Date.now();
  const el    = document.getElementById('timer');

  if (timeLimitSecs > 0) {
    // Countdown mode
    timerSecs = timeLimitSecs;
    el.classList.remove('warning');

    timerHandle = setInterval(() => {
      timerSecs--;

      const remaining = Math.max(timerSecs, 0);
      const m = String(Math.floor(remaining / 60)).padStart(2, '0');
      const s = String(remaining % 60).padStart(2, '0');
      el.textContent = `${m}:${s}`;

      if (remaining <= 60) el.classList.add('warning');

      if (remaining <= 0) {
        clearInterval(timerHandle);
        timerHandle = null;
        onTimeExpired();
      }
    }, 1000);

    // Set display immediately without waiting 1s
    const m = String(Math.floor(timerSecs / 60)).padStart(2, '0');
    const s = String(timerSecs % 60).padStart(2, '0');
    el.textContent = `${m}:${s}`;
  } else {
    // Count-up mode (no limit)
    timerSecs   = 0;
    timerHandle = setInterval(() => {
      timerSecs++;
      const m = String(Math.floor(timerSecs / 60)).padStart(2, '0');
      const s = String(timerSecs % 60).padStart(2, '0');
      el.textContent = `${m}:${s}`;
    }, 1000);
  }
}

// Called when countdown hits 0 — lock navigation, force submit button visible
function onTimeExpired() {
  // Disable prev/next navigation
  document.getElementById('btn-prev').disabled = true;
  document.getElementById('btn-next').disabled = true;

  // Always show the submit button regardless of answered count
  document.getElementById('submit-row').classList.remove('hidden');

  // Flash the timer to make it obvious
  const el = document.getElementById('timer');
  el.textContent = '00:00';
  el.classList.add('warning');
}

// ── SVG Abacus renderer ───────────────────────────────────────────────────────
/**
 * Draws a 4-rod Japanese soroban (thousands + hundreds + tens + units) as an SVG string.
 * Each rod config: { upper: 0|1, lower: 0-4 }
 * Rod value = upper*5 + lower
 */
function abacusSVG(thousandsRod, hundredsRod, tensRod, unitsRod) {
  const W  = 220, H = 270;
  const BEAM_Y = 105, BEAM_H = 10;
  const BEAD_R = 13, BEAD_GAP = 28;
  const ROD_X  = [27, 77, 127, 177];  // thousands, hundreds, tens, units

  // Vertical positions
  const upperActiveY   = BEAM_Y - BEAD_R - 4;   // heaven bead touching beam
  const upperInactiveY = 22;                      // heaven bead at top
  const lowerStart     = BEAM_Y + BEAM_H + BEAD_R + 2; // first earth bead
  const lowerBottom    = H - 20 - BEAD_R;         // bottom of lower section

  function beadY(rodCfg, i) {
    if (i < rodCfg.lower) {
      return lowerStart + i * BEAD_GAP;
    }
    const totalInactive = 4 - rodCfg.lower;
    const inactiveIdx   = i - rodCfg.lower;
    return lowerBottom - (totalInactive - 1 - inactiveIdx) * BEAD_GAP;
  }

  const ACTIVE_COLOR   = '#16a34a';
  const INACTIVE_COLOR = '#f97316';
  const BEAD_STROKE    = '#1e293b';
  const ROD_COLOR      = '#7c3f00';
  const WOOD_COLOR     = '#d4a56a';
  const FRAME_COLOR    = '#7c3f00';
  const BEAM_COLOR     = '#5d2e0c';
  const ZERO = { upper: 0, lower: 0 };

  let s = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">`;

  // Frame
  s += `<rect x="0" y="0" width="${W}" height="${H}" rx="10" fill="${FRAME_COLOR}"/>`;
  s += `<rect x="5" y="5" width="${W-10}" height="${H-10}" rx="8" fill="${WOOD_COLOR}"/>`;
  // Beam
  s += `<rect x="0" y="${BEAM_Y}" width="${W}" height="${BEAM_H}" fill="${BEAM_COLOR}"/>`;

  const rods   = [thousandsRod||ZERO, hundredsRod||ZERO, tensRod||ZERO, unitsRod||ZERO];
  const labels = ['Th', 'H', 'T', 'U'];

  rods.forEach((rod, ri) => {
    const rx = ROD_X[ri];

    // Rod
    s += `<line x1="${rx}" y1="8" x2="${rx}" y2="${H-8}" stroke="${ROD_COLOR}" stroke-width="4" stroke-linecap="round"/>`;

    // Heaven (upper) bead
    const uy    = rod.upper === 1 ? upperActiveY : upperInactiveY;
    const uFill = rod.upper === 1 ? ACTIVE_COLOR : INACTIVE_COLOR;
    s += bead(rx, uy, BEAD_R, uFill, BEAD_STROKE);

    // Earth (lower) beads
    for (let i = 0; i < 4; i++) {
      const by    = beadY(rod, i);
      const fill  = i < rod.lower ? ACTIVE_COLOR : INACTIVE_COLOR;
      s += bead(rx, by, BEAD_R, fill, BEAD_STROKE);
    }

    // Label
    s += `<text x="${rx}" y="${H - 4}" text-anchor="middle" font-size="10" font-weight="bold" fill="${FRAME_COLOR}" font-family="sans-serif">${labels[ri]}</text>`;
  });

  s += '</svg>';
  return s;

  function bead(cx, cy, r, fill, stroke) {
    return (
      `<ellipse cx="${cx}" cy="${cy}" rx="${r}" ry="${r * 0.72}" fill="${fill}" stroke="${stroke}" stroke-width="1.2"/>` +
      `<ellipse cx="${cx - r * 0.28}" cy="${cy - r * 0.18}" rx="${r * 0.28}" ry="${r * 0.16}" fill="rgba(255,255,255,0.38)" stroke="none"/>`
    );
  }
}

// ── Render one question ───────────────────────────────────────────────────────
function renderQuestion(idx) {
  const q   = questions[idx];
  const area = document.getElementById('question-area');

  let html = `<div class="question-card">`;
  html += `<div class="q-badge">${q.type === 'abacus' ? 'Abacus Reading' : 'Mental Math'}</div>`;
  html += `<div class="q-label">Question ${idx + 1} of ${questions.length}</div>`;

  if (q.type === 'abacus') {
    const svg = abacusSVG(q.thousands, q.hundreds, q.tens, q.units);
    html += `
      <div class="abacus-wrap">
        <p class="abacus-question-text">What number does this abacus show?</p>
        <div class="abacus-svg-wrap">${svg}</div>
        <div class="answer-input-wrap">
          <label for="ans-input">Your answer</label>
          <input id="ans-input" class="answer-input${answers[q.id] ? ' answered' : ''}"
                 type="number" inputmode="numeric" placeholder="?"
                 value="${answers[q.id] || ''}" autocomplete="off" />
        </div>
      </div>`;
  } else {
    html += `
      <div class="math-problem">${q.problem} = ?</div>
      <div class="answer-input-wrap">
        <label for="ans-input">Your answer</label>
        <input id="ans-input" class="answer-input${answers[q.id] ? ' answered' : ''}"
               type="number" inputmode="numeric" placeholder="?"
               value="${answers[q.id] || ''}" autocomplete="off" />
      </div>`;
  }

  html += '</div>';
  area.innerHTML = html;

  const input = document.getElementById('ans-input');
  input.focus();
  input.addEventListener('input', () => {
    const val = input.value.trim();
    if (val !== '') {
      answers[q.id] = val;
      input.classList.add('answered');
    } else {
      delete answers[q.id];
      input.classList.remove('answered');
    }
    updateDots();
    updateSubmitVisibility();
  });
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (currentIdx < questions.length - 1) goTo(currentIdx + 1);
    }
  });

  // Nav buttons
  document.getElementById('btn-prev').disabled = idx === 0;
  document.getElementById('btn-next').textContent = idx === questions.length - 1 ? 'Review' : 'Next →';

  // Progress bar
  const filled = ((idx + 1) / questions.length) * 100;
  document.getElementById('progress-bar').style.width = filled + '%';
  document.getElementById('progress-label').textContent = `Question ${idx + 1} / ${questions.length}`;

  updateDots();
  updateSubmitVisibility();
}

// ── Dot nav ───────────────────────────────────────────────────────────────────
function buildDots() {
  const nav = document.getElementById('dot-nav');
  nav.innerHTML = '';
  questions.forEach((q, i) => {
    const btn = document.createElement('button');
    btn.className = 'dot';
    btn.title = `Question ${i + 1}`;
    btn.addEventListener('click', () => goTo(i));
    nav.appendChild(btn);
  });
}

function updateDots() {
  const dots = document.querySelectorAll('.dot');
  dots.forEach((d, i) => {
    d.classList.toggle('current',  i === currentIdx);
    d.classList.toggle('answered', answers[questions[i].id] !== undefined && i !== currentIdx);
  });
}

function updateSubmitVisibility() {
  const allAnswered = questions.every(q => answers[q.id] !== undefined);
  document.getElementById('submit-row').classList.toggle('hidden', !allAnswered);
}

// ── Navigation ────────────────────────────────────────────────────────────────
function goTo(idx) {
  currentIdx = idx;
  renderQuestion(currentIdx);
}

document.addEventListener('DOMContentLoaded', () => {

  // Initialise test-info from server before form submit
  fetch('/api/questions').then(r => r.json()).then(data => {
    const lim  = data.timeLimitSecs ?? 0;
    const text = lim > 0 ? `${Math.round(lim / 60)} min time limit` : 'No time limit';
    document.getElementById('test-info-text').textContent =
      `${data.questions.length} questions · 1 point each · ${text}`;
  }).catch(() => {
    document.getElementById('test-info-text').textContent = '20 questions · 1 point each';
  });

  // ── Registration form ──────────────────────────────────────────────────────
  document.getElementById('register-form').addEventListener('submit', async e => {
    e.preventDefault();
    userEmail = document.getElementById('email').value.trim();
    userName  = document.getElementById('name').value.trim();
    if (!userEmail) return;

    showView('view-submitting');
    try {
      const data    = await fetch('/api/questions').then(r => r.json());
      questions     = data.questions;
      timeLimitSecs = data.timeLimitSecs ?? 0;
    } catch (err) {
      alert('Could not load questions. Please refresh and try again.');
      showView('view-register');
      return;
    }

    // Update test info line with actual question count + time limit
    const limitText = timeLimitSecs > 0
      ? `${Math.round(timeLimitSecs / 60)} min time limit`
      : 'No time limit';
    document.getElementById('test-info-text').textContent =
      `${questions.length} questions · 1 point each · ${limitText}`;

    answers    = {};
    currentIdx = 0;
    timerSecs  = 0;
    document.getElementById('btn-next').disabled = false;
    document.getElementById('btn-prev').disabled = true;
    showView('view-test');
    buildDots();
    renderQuestion(0);
    startTimer();
  });

  // ── Next / Prev ────────────────────────────────────────────────────────────
  document.getElementById('btn-next').addEventListener('click', () => {
    if (currentIdx < questions.length - 1) goTo(currentIdx + 1);
  });
  document.getElementById('btn-prev').addEventListener('click', () => {
    if (currentIdx > 0) goTo(currentIdx - 1);
  });

  // ── Submit ─────────────────────────────────────────────────────────────────
  document.getElementById('btn-submit').addEventListener('click', async () => {
    const unanswered = questions.filter(q => answers[q.id] === undefined).length;
    // Only prompt if time hasn't expired (timer still running)
    if (timerHandle !== null && unanswered > 0) {
      const go = confirm(`You have ${unanswered} unanswered question(s). Submit anyway?`);
      if (!go) return;
    }

    clearInterval(timerHandle);
    timerHandle = null;
    // If the timer expired, record the full time limit as time taken
    const timeTaken = timeLimitSecs > 0 && timerSecs <= 0
      ? timeLimitSecs
      : Math.round((Date.now() - startTime) / 1000);

    showView('view-submitting');

    try {
      const res = await fetch('/api/submit', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:        userName,
          email:       userEmail,
          answers,
          questionIds: questions.map(q => q.id),
          timeTaken,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Unknown error');
      showResults(data);
    } catch (err) {
      alert('Submission failed: ' + err.message);
      showView('view-test');
      if (timerSecs > 0) startTimer(); // only resume if time remains
    }
  });

  // ── Retake ─────────────────────────────────────────────────────────────────
  document.getElementById('btn-retake').addEventListener('click', () => {
    timeLimitSecs = 0;
    document.getElementById('timer').classList.remove('warning');
    document.getElementById('email').value = '';
    document.getElementById('name').value  = '';
    showView('view-register');
  });

  // ── Exit test ──────────────────────────────────────────────────────────────
  document.getElementById('btn-exit-test').addEventListener('click', () => {
    document.getElementById('exit-modal-overlay').classList.add('open');
  });

  document.getElementById('btn-exit-cancel').addEventListener('click', () => {
    document.getElementById('exit-modal-overlay').classList.remove('open');
  });

  document.getElementById('btn-exit-confirm').addEventListener('click', () => {
    // Discard everything — no submission, no data stored
    clearInterval(timerHandle);
    timerHandle   = null;
    questions     = [];
    answers       = {};
    currentIdx    = 0;
    timerSecs     = 0;
    timeLimitSecs = 0;
    startTime     = null;
    userEmail     = '';
    userName      = '';
    document.getElementById('exit-modal-overlay').classList.remove('open');
    document.getElementById('timer').classList.remove('warning');
    document.getElementById('email').value = '';
    document.getElementById('name').value  = '';
    showView('view-register');
  });
});

// ── Show results ──────────────────────────────────────────────────────────────
function showResults(data) {
  const { score, total, percentage, detail, submissionId } = data;
  const pct = parseFloat(percentage);

  // Icon & heading
  let icon, heading;
  if (pct === 100)     { icon = '🏆'; heading = 'Perfect Score!'; }
  else if (pct >= 80)  { icon = '🎉'; heading = 'Excellent Work!'; }
  else if (pct >= 60)  { icon = '👍'; heading = 'Good Job!'; }
  else if (pct >= 40)  { icon = '📚'; heading = 'Keep Practicing!'; }
  else                 { icon = '💪'; heading = 'Keep Going!'; }

  document.getElementById('result-icon').textContent    = icon;
  document.getElementById('result-heading').textContent  = heading;
  document.getElementById('result-subtitle').textContent =
    `You scored ${score} out of ${total} (${pct.toFixed(1)}%)`;
  document.getElementById('score-num').textContent = score;
  document.getElementById('score-den').textContent = `/ ${total}`;
  document.getElementById('submission-id').textContent =
    `Submission ID: #${submissionId}`;

  // Animate score ring
  const circumference = 326.73;
  const offset = circumference - (pct / 100) * circumference;
  const ring = document.getElementById('score-ring-fill');
  ring.style.transition = 'none';
  ring.style.strokeDashoffset = circumference;
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      ring.style.transition = 'stroke-dashoffset 1.1s ease';
      ring.style.strokeDashoffset = offset;
      // Color ring based on score
      ring.style.stroke = pct >= 80 ? '#22c55e' : pct >= 60 ? '#f59e0b' : '#ef4444';
    });
  });

  // Answer review
  const reviewEl = document.getElementById('answer-review');
  if (detail && detail.length > 0) {
    let html = `
      <div class="review-header">
        <h3>Question Review</h3>
        <span class="review-legend">
          <span class="legend-dot correct-dot"></span>Correct
          <span class="legend-dot wrong-dot"></span>Incorrect
        </span>
      </div>`;

    detail.forEach((item, i) => {
      const cls  = item.correct ? 'correct' : 'wrong';
      const mark = item.correct ? '✓' : '✗';

      // Build question body
      let qBody = '';
      if (item.type === 'math') {
        qBody = `<div class="rv-problem">${item.problem} = ?</div>`;
      } else {
        // Abacus: show the SVG diagram + the number it represents
        const svg = abacusSVG(item.thousands, item.hundreds, item.tens, item.units);
        qBody = `
          <div class="rv-abacus-wrap">
            <div class="abacus-svg-wrap rv-abacus-svg">${svg}</div>
            <p class="rv-abacus-label">What number does this abacus show?</p>
          </div>`;
      }

      // Answer row
      const yourVal   = item.userAnswer || '—';
      const ansBlock  = item.correct
        ? `<span class="rv-ans correct-ans">${yourVal}</span>`
        : `<span class="rv-ans wrong-ans">${yourVal}</span>
           <span class="rv-arrow">→</span>
           <span class="rv-ans correct-ans">${item.correctAnswer}</span>`;

      html += `
        <div class="review-card ${cls}">
          <div class="review-card-top">
            <span class="rv-mark ${cls}">${mark}</span>
            <span class="rv-num">Q${i + 1}</span>
            <span class="rv-type-badge ${item.type}">${item.type === 'abacus' ? 'Abacus' : 'Math'}</span>
          </div>
          <div class="review-card-body">
            ${qBody}
            <div class="rv-answer-row">
              <span class="rv-label">Your answer:</span>
              ${ansBlock}
            </div>
          </div>
        </div>`;
    });
    reviewEl.innerHTML = html;
  } else {
    reviewEl.innerHTML = '';
  }

  showView('view-result');
}
