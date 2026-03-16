// ═══════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════

let answers          = {};
let currentQ         = 0;
let autoAdvanceTimer = null;
let responseTimes    = {};    // {questionId: ms}
let questionStartTime = 0;

// 一貫性ペア：類似構造を持つ Big Five / VIA 質問の組み合わせ
const CONSISTENCY_PAIRS = [
  {a:1,  b:23, label:"創造性"},
  {a:2,  b:22, label:"好奇心"},
  {a:4,  b:24, label:"向学意欲"},
  {a:5,  b:27, label:"粘り強さ"},
  {a:6,  b:38, label:"計画性"},
  {a:7,  b:28, label:"誠実さ"},
  {a:13, b:31, label:"利他性"},
  {a:15, b:32, label:"共感力"},
  {a:11, b:35, label:"主導性"},
  {a:16, b:33, label:"協調性"},
];

// ═══════════════════════════════════════════════
// QUIZ LOGIC
// ═══════════════════════════════════════════════

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

function saveProgress() {
  localStorage.setItem('strength_progress', JSON.stringify({answers, currentQ, responseTimes}));
}

function clearProgress() {
  localStorage.removeItem('strength_progress');
}

function updateRestoreNotice() {
  const savedResult   = localStorage.getItem('strength_result');
  const savedProgress = localStorage.getItem('strength_progress');
  const notice = document.getElementById('restoreNotice');

  if (!savedProgress && !savedResult) {
    notice.style.display = 'none';
    return;
  }

  notice.style.display = 'block';

  if (savedProgress) {
    const data = JSON.parse(savedProgress);
    const done = Object.keys(data.answers).length;
    notice.innerHTML = `
      <div class="restore-notice-title">途中の診断が保存されています（${done} / 40 問）</div>
      <div class="restore-btns">
        <button class="btn-restore-primary" onclick="resumeQuiz()">続きから再開する</button>
        <button class="btn-restore-ghost"   onclick="startFresh()">最初からやり直す</button>
      </div>`;
  } else {
    notice.innerHTML = `
      <div class="restore-notice-title">以前の診断結果が保存されています</div>
      <div class="restore-btns">
        <button class="btn-restore-primary" onclick="restoreResult()">結果を見る</button>
        <button class="btn-restore-ghost"   onclick="startFresh()">もう一度診断する</button>
      </div>`;
  }
}

function resumeQuiz() {
  const saved = localStorage.getItem('strength_progress');
  if (!saved) return;
  const data    = JSON.parse(saved);
  answers       = data.answers;
  currentQ      = data.currentQ;
  responseTimes = data.responseTimes || {};
  showScreen('screen-quiz');
  renderQuestion();
}

function startFresh() {
  clearProgress();
  localStorage.removeItem('strength_result');
  answers  = {};
  currentQ = 0;
  showScreen('screen-quiz');
  renderQuestion();
}

function startQuiz() {
  clearProgress();
  localStorage.removeItem('strength_result');
  answers  = {};
  currentQ = 0;
  showScreen('screen-quiz');
  renderQuestion();
}

function renderQuestion() {
  const q = QUESTIONS[currentQ];
  document.getElementById('qNum').textContent = q.id;
  document.getElementById('qCategory').textContent = q.category;
  document.getElementById('qText').textContent = q.text;
  document.getElementById('progressBar').style.width = `${(currentQ / QUESTIONS.length) * 100}%`;

  const btns = document.querySelectorAll('.scale-btn');
  btns.forEach((btn, i) => {
    btn.classList.remove('selected');
    if (answers[q.id] === i + 1) btn.classList.add('selected');
  });
  document.getElementById('btnPrev').disabled = currentQ === 0;
  document.getElementById('btnNext').disabled = !answers[q.id];

  const body = document.querySelector('.quiz-body');
  body.style.animation = 'none';
  body.offsetHeight;
  body.style.animation = 'fadeUp .3s ease';

  questionStartTime = Date.now();
}

function advanceQuestion() {
  if (autoAdvanceTimer) { clearTimeout(autoAdvanceTimer); autoAdvanceTimer = null; }
  if (currentQ < QUESTIONS.length - 1) {
    currentQ++;
    renderQuestion();
  } else {
    finishQuiz();
  }
}

function selectAnswer(val) {
  const q = QUESTIONS[currentQ];
  if (!answers[q.id]) {
    responseTimes[q.id] = Date.now() - questionStartTime;
  }
  answers[q.id] = val;
  const btns = document.querySelectorAll('.scale-btn');
  btns.forEach((btn, i) => btn.classList.toggle('selected', i + 1 === val));
  document.getElementById('btnNext').disabled = false;
  saveProgress();
  if (autoAdvanceTimer) clearTimeout(autoAdvanceTimer);
  autoAdvanceTimer = setTimeout(() => { autoAdvanceTimer = null; advanceQuestion(); }, 220);
}

function nextQuestion() {
  if (!answers[QUESTIONS[currentQ].id]) return;
  advanceQuestion();
}

function prevQuestion() {
  if (currentQ > 0) {
    currentQ--;
    renderQuestion();
  }
}

function finishQuiz() {
  clearProgress();
  const result = computeResult();
  localStorage.setItem('strength_result', JSON.stringify(result));
  showResult(result);
}

function retryQuiz() {
  if (confirm('診断をリセットしてもう一度始めますか？')) {
    stopSoundtrack();
    clearProgress();
    localStorage.removeItem('strength_result');
    answers  = {};
    currentQ = 0;
    showScreen('screen-start');
    updateRestoreNotice();
  }
}

function restoreResult() {
  const saved = localStorage.getItem('strength_result');
  if (saved) showResult(JSON.parse(saved));
}
