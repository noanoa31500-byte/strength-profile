// ═══════════════════════════════════════════════
// STRENGTH SOUNDTRACK  (Web Audio API)
// ═══════════════════════════════════════════════

let _sndCtx     = null;
let _sndNodes   = [];
let _sndVizId   = null;
let _sndPlaying = false;

const SCALES = {
  major:  [0,2,4,5,7,9,11],
  dorian: [0,2,3,5,7,9,10],
  minor:  [0,2,3,5,7,8,10],
};

function midiToHz(midi) { return 440 * Math.pow(2, (midi - 69) / 12); }

function makeReverb(ctx, secs, wet) {
  const conv = ctx.createConvolver();
  const len  = ctx.sampleRate * secs;
  const buf  = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.5);
  }
  conv.buffer = buf;
  const dryG = ctx.createGain(); dryG.gain.value = 1 - wet;
  const wetG = ctx.createGain(); wetG.gain.value = wet;
  return {
    input: dryG, send: conv, wet: wetG,
    connect(dest) { dryG.connect(dest); conv.connect(wetG); wetG.connect(dest); }
  };
}

function degreeToMidi(degree, root, scale) {
  const octave = Math.floor(degree / scale.length);
  return root + scale[degree % scale.length] + octave * 12;
}

function generateMelodyNotes(bigFive) {
  const O = bigFive.O, C = bigFive.C, E = bigFive.E, A = bigFive.A;
  const bpm   = 68 + E * 88;
  const beat  = 60 / bpm;
  const mode  = A > 0.65 ? 'major' : A > 0.35 ? 'dorian' : 'minor';
  const scale = SCALES[mode];
  const maxStep = Math.round(1 + O * 4);
  const totalBeats = 16;
  const notes = [];
  let degree = 2, time = 0;
  function nextDur() {
    if (C > 0.65) return 0.5;
    if (C > 0.35) return Math.random() < 0.7 ? 0.5 : 0.75;
    const r = Math.random(); return r < 0.4 ? 0.25 : r < 0.7 ? 0.75 : 0.5;
  }
  while (time < totalBeats * beat) {
    const dur  = nextDur() * beat;
    const step = Math.round((Math.random() - 0.4) * maxStep * 2);
    degree = Math.max(0, Math.min(13, degree + step));
    const midi = degreeToMidi(degree, 72, scale);
    notes.push({ time, dur: dur * 0.85, midi, vel: 0.5 + Math.random() * 0.35 });
    time += dur;
  }
  return { notes, bpm, mode, beat, scale };
}

function scheduleNote(ctx, midi, vel, t0, dur, type, reverb, master) {
  const osc = ctx.createOscillator();
  const env = ctx.createGain();
  osc.type = type;
  osc.frequency.value = midiToHz(midi);
  env.gain.setValueAtTime(0, t0);
  env.gain.linearRampToValueAtTime(vel * 0.25, t0 + 0.02);
  env.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
  osc.connect(env); env.connect(reverb.input); env.connect(reverb.send);
  reverb.connect(master);
  osc.start(t0); osc.stop(t0 + dur + 0.05);
  _sndNodes.push(osc, env);
}

function schedulePad(ctx, midi, t0, dur, reverb, master) {
  [-6, 0, 6].forEach(detune => {
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = midiToHz(midi);
    osc.detune.value = detune;
    env.gain.setValueAtTime(0, t0);
    env.gain.linearRampToValueAtTime(0.055, t0 + 0.5);
    env.gain.setValueAtTime(0.055, t0 + dur - 0.5);
    env.gain.linearRampToValueAtTime(0, t0 + dur);
    osc.connect(env); env.connect(reverb.input); env.connect(reverb.send);
    reverb.connect(master);
    osc.start(t0); osc.stop(t0 + dur + 0.1);
    _sndNodes.push(osc, env);
  });
}

function playSoundtrack(result) {
  if (_sndPlaying) return;
  _sndPlaying = true;
  _sndCtx = new (window.AudioContext || window.webkitAudioContext)();
  const master = _sndCtx.createGain();
  master.gain.value = 0.7;
  master.connect(_sndCtx.destination);

  const { notes, bpm, mode, beat, scale } = generateMelodyNotes(result.bigFive);
  const N = result.bigFive.N || 0.5;
  const O = result.bigFive.O || 0.5;
  const reverbWet = 0.2 + N * 0.45;
  const reverb    = makeReverb(_sndCtx, 2 + N, reverbWet);
  const oscType   = O > 0.65 ? 'sawtooth' : O > 0.35 ? 'triangle' : 'sine';
  const padRoot   = 48;
  const totalDur  = notes[notes.length - 1].time + beat * 2;

  function scheduleBlock(offset) {
    [0, scale[2], scale[4]].forEach(semi =>
      schedulePad(_sndCtx, padRoot + semi, offset, totalDur, reverb, master)
    );
    notes.forEach(n =>
      scheduleNote(_sndCtx, n.midi, n.vel, offset + n.time, n.dur, oscType, reverb, master)
    );
  }

  scheduleBlock(_sndCtx.currentTime + 0.1);

  const loopMs = (totalDur + 0.05) * 1000;
  const loopFn = function loop() {
    if (!_sndPlaying) return;
    scheduleBlock(_sndCtx.currentTime + 0.05);
    const t = setTimeout(loop, loopMs);
    _sndNodes.push({ stop: () => clearTimeout(t) });
  };
  const t0 = setTimeout(loopFn, loopMs);
  _sndNodes.push({ stop: () => clearTimeout(t0) });

  updatePlayBtn(true);
  startWaveformViz(_sndCtx, master);
}

function stopSoundtrack() {
  if (!_sndPlaying) return;
  _sndPlaying = false;
  if (_sndVizId) { cancelAnimationFrame(_sndVizId); _sndVizId = null; }
  _sndNodes.forEach(n => { try { if (n.stop) n.stop(); } catch(e){} });
  _sndNodes = [];
  if (_sndCtx) { _sndCtx.close(); _sndCtx = null; }
  updatePlayBtn(false);
  clearWaveform();
}

function toggleSoundtrack(result) {
  if (_sndPlaying) stopSoundtrack();
  else playSoundtrack(result);
}

function updatePlayBtn(playing) {
  const btn = document.getElementById('sndPlayBtn');
  if (!btn) return;
  if (playing) { btn.textContent = '■  STOP'; btn.classList.add('playing'); }
  else         { btn.textContent = '▶  PLAY'; btn.classList.remove('playing'); }
}

function clearWaveform() {
  const c = document.getElementById('sndCanvas');
  if (!c) return;
  const ctx = c.getContext('2d');
  ctx.clearRect(0, 0, c.width, c.height);
  const idle = c.parentElement.querySelector('.snd-canvas-idle');
  if (idle) idle.style.opacity = '1';
}

function startWaveformViz(audioCtx, sourceNode) {
  const analyser = audioCtx.createAnalyser();
  analyser.fftSize = 512;
  sourceNode.connect(analyser);
  const buf = new Uint8Array(analyser.frequencyBinCount);
  const c   = document.getElementById('sndCanvas');
  if (!c) return;
  const idle = c.parentElement.querySelector('.snd-canvas-idle');
  if (idle) idle.style.opacity = '0';
  const dpr = window.devicePixelRatio || 1;
  c.width  = c.offsetWidth * dpr;
  c.height = 72 * dpr;
  const ctx = c.getContext('2d');
  function draw() {
    if (!_sndPlaying) return;
    _sndVizId = requestAnimationFrame(draw);
    analyser.getByteTimeDomainData(buf);
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.beginPath();
    ctx.strokeStyle = '#e8ff3c';
    ctx.lineWidth   = 1.5 * dpr;
    const sliceW = c.width / buf.length;
    let x = 0;
    for (let i = 0; i < buf.length; i++) {
      const y = (buf[i] / 128) * (c.height / 2);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      x += sliceW;
    }
    ctx.stroke();
  }
  draw();
}

function renderSoundtrackSection(result) {
  const el = document.getElementById('soundtrackSection');
  if (!el) return;
  const { bpm, mode } = generateMelodyNotes(result.bigFive);
  const bpmRound  = Math.round(bpm);
  const O = result.bigFive.O || 0.5;
  const N = result.bigFive.N || 0.5;
  const C = result.bigFive.C || 0.5;
  const oscType   = O > 0.65 ? 'SAWTOOTH' : O > 0.35 ? 'TRIANGLE' : 'SINE';
  const reverbPct = Math.round((0.2 + N * 0.45) * 100);
  const rhythm    = C > 0.65 ? 'STEADY 8TH' : C > 0.35 ? 'MIXED' : 'SYNCOPATED';
  el.innerHTML = `
    <div class="section-title">
      <div class="section-title-text">STRENGTH SOUNDTRACK</div>
      <div class="section-title-line"></div>
    </div>
    <div class="soundtrack-block">
      <div class="soundtrack-top">
        <div>
          <div class="soundtrack-label">WEB AUDIO API · GENERATIVE MUSIC</div>
          <div class="soundtrack-desc">あなたのBig Fiveプロフィールから<br>リアルタイム生成したパーソナル音楽。外向性がテンポを、協調性がスケールを、開放性が音色を決める。</div>
          <div class="soundtrack-tags">
            <span class="soundtrack-tag accent">${mode.toUpperCase()} SCALE</span>
            <span class="soundtrack-tag">${bpmRound} BPM</span>
            <span class="soundtrack-tag">${oscType} OSC</span>
            <span class="soundtrack-tag">${rhythm}</span>
            <span class="soundtrack-tag">REVERB ${reverbPct}%</span>
          </div>
        </div>
      </div>
      <div class="snd-canvas-wrap">
        <canvas id="sndCanvas"></canvas>
        <div class="snd-canvas-idle">PRESS PLAY TO GENERATE</div>
      </div>
      <div class="soundtrack-controls">
        <button class="btn-play" id="sndPlayBtn" onclick="toggleSoundtrack(window._currentResult)">▶  PLAY</button>
      </div>
      <div class="snd-params">
        <div class="snd-param-row"><span class="snd-param-key">EXTRAVERSION →</span><span class="snd-param-val">${bpmRound} BPM</span></div>
        <div class="snd-param-row"><span class="snd-param-key">AGREEABLENESS →</span><span class="snd-param-val">${mode.toUpperCase()} SCALE</span></div>
        <div class="snd-param-row"><span class="snd-param-key">OPENNESS →</span><span class="snd-param-val">${oscType} OSCILLATOR</span></div>
        <div class="snd-param-row"><span class="snd-param-key">CONSCIENTIOUSNESS →</span><span class="snd-param-val">${rhythm}</span></div>
        <div class="snd-param-row"><span class="snd-param-key">NEUROTICISM →</span><span class="snd-param-val">REVERB ${reverbPct}%</span></div>
      </div>
    </div>
  `;
}
