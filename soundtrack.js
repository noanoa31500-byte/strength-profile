// ═══════════════════════════════════════════════
// STRENGTH SOUNDTRACK v2 — Web Audio API
// ═══════════════════════════════════════════════

let _sndCtx     = null;
let _sndNodes   = [];
let _sndVizId   = null;
let _sndPlaying = false;
let _masterGain = null;

// ── スケール定義 ──────────────────────────────────
const SCALES = {
  major:   [0,2,4,5,7,9,11],
  dorian:  [0,2,3,5,7,9,10],
  minor:   [0,2,3,5,7,8,10],
  lydian:  [0,2,4,6,7,9,11],
};

// コード進行（スケール上の度数インデックス）
const CHORD_DEGS = {
  major:  [0,4,5,3],   // Ⅰ - Ⅴ - ⅵ - Ⅳ
  dorian: [0,3,6,5],   // ⅰ - Ⅳ - ♭Ⅶ - ♭Ⅵ
  minor:  [0,5,3,6],   // ⅰ - ♭Ⅵ - ⅳ - ♭Ⅶ
  lydian: [0,1,4,5],   // Ⅰ - Ⅱ - Ⅴ - Ⅵ
};

const CHORD_LABELS = {
  major:  ['Ⅰ','Ⅴ','ⅵ','Ⅳ'],
  dorian: ['ⅰ','Ⅳ','♭Ⅶ','♭Ⅵ'],
  minor:  ['ⅰ','♭Ⅵ','ⅳ','♭Ⅶ'],
  lydian: ['Ⅰ','Ⅱ','Ⅴ','Ⅵ'],
};

function midiToHz(m) { return 440 * Math.pow(2, (m - 69) / 12); }

// ── ユーティリティ ─────────────────────────────────
function degreeToMidi(deg, rootMidi, scale) {
  const oct = Math.floor(deg / scale.length);
  return rootMidi + scale[deg % scale.length] + oct * 12;
}

function getChordMidis(rootMidi, degRoot, scale, n = 3) {
  return Array.from({ length: n }, (_, i) => {
    const deg = degRoot + i * 2;
    const oct = Math.floor(deg / scale.length);
    return rootMidi + scale[deg % scale.length] + oct * 12;
  });
}

function fillRoundRect(ctx, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y,   x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x,   y + h, r);
  ctx.arcTo(x,   y + h, x,   y,     r);
  ctx.arcTo(x,   y,     x + w, y,     r);
  ctx.closePath();
  ctx.fill();
}

// ── リバーブ ──────────────────────────────────────
function makeReverb(ctx, secs, wet) {
  const conv = ctx.createConvolver();
  const len  = Math.floor(ctx.sampleRate * secs);
  const buf  = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch);
    for (let i = 0; i < len; i++)
      d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.5);
  }
  conv.buffer = buf;
  const dryG = ctx.createGain(); dryG.gain.value = 1 - wet;
  const wetG = ctx.createGain(); wetG.gain.value = wet;
  return {
    input: dryG, send: conv, wet: wetG,
    connect(dest) { dryG.connect(dest); conv.connect(wetG); wetG.connect(dest); }
  };
}

// ── パラメータ生成 ─────────────────────────────────
function buildSoundParams(bigFive) {
  const O = bigFive.O || 0.5;
  const C = bigFive.C || 0.5;
  const E = bigFive.E || 0.5;
  const A = bigFive.A || 0.5;
  const N = bigFive.N || 0.5;

  const bpm   = 68 + E * 88;
  const beat  = 60 / bpm;
  // A(協調性) → スケール/モード選択
  const mode  = A > 0.75 ? 'lydian' : A > 0.5 ? 'major' : A > 0.25 ? 'dorian' : 'minor';
  const scale = SCALES[mode];

  // ─ メロディー生成（O/C依存）
  const maxStep    = Math.round(1 + O * 4);
  const TOTAL_BEATS = 16;
  const notes      = [];
  let degree = 2, time = 0;
  function nextDur() {
    if (C > 0.65) return 0.5;
    if (C > 0.35) return Math.random() < 0.7 ? 0.5 : 0.75;
    const r = Math.random(); return r < 0.4 ? 0.25 : r < 0.7 ? 0.75 : 0.5;
  }
  while (time < TOTAL_BEATS * beat) {
    const dur  = nextDur() * beat;
    const step = Math.round((Math.random() - 0.4) * maxStep * 2);
    degree = Math.max(0, Math.min(13, degree + step));
    notes.push({ time, dur: dur * 0.85, midi: degreeToMidi(degree, 72, scale), vel: 0.5 + Math.random() * 0.35 });
    time += dur;
  }

  // ─ 各楽器パラメーター
  const oscType      = O > 0.65 ? 'sawtooth' : O > 0.35 ? 'triangle' : 'sine';
  const reverbWet    = 0.15 + N * 0.5;        // N → リバーブ
  const reverbSecs   = 1.5 + N * 2.0;
  const vibratoDepth = N * 0.85;              // N → ビブラート深さ
  const stringsVol   = 0.3 + A * 0.7;        // A → ストリングス音量
  const numVoices    = 3 + Math.round(E * 4); // E → 声部数（コーラス広がり）
  const bassVol      = 0.3 + A * 0.5;        // A → ベース存在感
  const arpeggioRate = O > 0.65 ? 3 : O > 0.35 ? 2 : 0;  // O → アルペジオ速度
  const arpeggioVol  = Math.max(0, O - 0.3);
  const bellFreq     = Math.max(0, (O - 0.35) * 1.6);    // O → ベル出現頻度
  const percVol      = 0.35 + E * 0.45;      // E → パーカッション音量

  // ─ C(誠実性) → ドラムパターン規則性
  const kickPat  = makeKickPattern(C);
  const snarePat = makeSnarePattern(C);
  const hihatPat = makeHihatPattern(C, E);

  const totalDur = notes[notes.length - 1].time + beat * 2;

  return {
    notes, bpm, mode, beat, scale,
    chordDegRoots: CHORD_DEGS[mode],
    rootMidi: 48,
    oscType, reverbWet, reverbSecs, vibratoDepth,
    stringsVol, numVoices, bassVol,
    arpeggioRate, arpeggioVol, bellFreq,
    percVol, kickPat, snarePat, hihatPat, totalDur,
    // 表示用
    bpmRound:   Math.round(bpm),
    reverbPct:  Math.round(reverbWet * 100),
    oscLabel:   O > 0.65 ? 'SAWTOOTH' : O > 0.35 ? 'TRIANGLE' : 'SINE',
    rhythm:     C > 0.65 ? 'STEADY' : C > 0.35 ? 'MIXED' : 'SYNCOPATED',
    chordLabels: CHORD_LABELS[mode],
  };
}

// ── ドラムパターン（C→規則性, 16 quarter-beat 版）───
function makeKickPattern(C) {
  // C高: 4つ打ち, C中: 1・3拍, C低: シンコペ
  if (C > 0.65) return [1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1];
  if (C > 0.35) return [1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0];
  const p = Array.from({ length: 16 }, () => Math.random() < 0.32 ? 1 : 0);
  p[0] = 1; return p;
}
function makeSnarePattern(C) {
  if (C > 0.5)  return [0,0,1,0, 0,0,1,0, 0,0,1,0, 0,0,1,0];
  const p = Array.from({ length: 16 }, () => Math.random() < 0.22 ? 1 : 0);
  p[2] = 1; p[10] = 1; return p;
}
function makeHihatPattern(C, E) {
  // 32 8分音符ポジション
  const density = 0.3 + C * 0.35 + E * 0.2;
  const p = Array.from({ length: 32 }, () => Math.random() < density ? 1 : 0);
  if (E > 0.6) for (let i = 0; i < 32; i += 2) p[i] = 1; // 8分打ち
  return p;
}

// ── 音源スケジューリング ─────────────────────────────

// ① メロディー（ビブラート付き / N→深さ）
function scheduleNote(ctx, midi, vel, t0, dur, type, vibratoDepth, reverb, master) {
  const osc = ctx.createOscillator();
  const env = ctx.createGain();
  osc.type = type;
  osc.frequency.value = midiToHz(midi);
  if (vibratoDepth > 0.12) {
    const lfo  = ctx.createOscillator();
    const lfoG = ctx.createGain();
    lfo.frequency.value  = 5.4 + Math.random() * 0.6;
    lfoG.gain.value      = vibratoDepth * midiToHz(midi) * 0.018;
    lfo.connect(lfoG); lfoG.connect(osc.frequency);
    lfo.start(t0 + 0.12); lfo.stop(t0 + dur + 0.05);
    _sndNodes.push(lfo, lfoG);
  }
  env.gain.setValueAtTime(0, t0);
  env.gain.linearRampToValueAtTime(vel * 0.2, t0 + 0.02);
  env.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
  osc.connect(env); env.connect(reverb.input); env.connect(reverb.send); reverb.connect(master);
  osc.start(t0); osc.stop(t0 + dur + 0.05);
  _sndNodes.push(osc, env);
}

// ② ストリングスアンサンブル（A→音量, E→声部数/コーラス広がり）
function scheduleStrings(ctx, midi, t0, dur, vol, numVoices, reverb, master) {
  const nv     = Math.max(3, Math.min(8, numVoices));
  const spread = 16 + (nv - 3) * 3.5; // E高いほど広いデチューン
  for (let i = 0; i < nv; i++) {
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.value = midiToHz(midi);
    osc.detune.value = (i / (nv - 1) - 0.5) * spread * 2;
    const center = Math.floor(nv / 2);
    const v = vol * (i === center ? 0.065 : 0.032);
    env.gain.setValueAtTime(0, t0);
    env.gain.linearRampToValueAtTime(v, t0 + 0.5 + i * 0.04);
    env.gain.setValueAtTime(v, t0 + dur - 0.8);
    env.gain.linearRampToValueAtTime(0, t0 + dur + 0.15);
    osc.connect(env); env.connect(reverb.input); env.connect(reverb.send); reverb.connect(master);
    osc.start(t0); osc.stop(t0 + dur + 0.3);
    _sndNodes.push(osc, env);
  }
}

// ③ ベースライン（A→音量, サウ+サイン+ローパス）
function scheduleBass(ctx, chordRootMidi, t0, dur, vol, reverb, master) {
  const midi = chordRootMidi - 12; // 1オクターブ下
  const osc  = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const env  = ctx.createGain();
  const lpf  = ctx.createBiquadFilter();
  lpf.type = 'lowpass'; lpf.frequency.value = 230; lpf.Q.value = 1.2;
  osc.type = 'sawtooth'; osc.frequency.value = midiToHz(midi);
  osc2.type = 'sine';   osc2.frequency.value = midiToHz(midi);
  env.gain.setValueAtTime(0, t0);
  env.gain.linearRampToValueAtTime(vol * 0.3, t0 + 0.04);
  env.gain.exponentialRampToValueAtTime(vol * 0.18, t0 + dur * 0.5);
  env.gain.exponentialRampToValueAtTime(0.001, t0 + dur * 0.92);
  osc.connect(lpf); osc2.connect(lpf); lpf.connect(env);
  env.connect(reverb.input); env.connect(reverb.send); reverb.connect(master);
  osc.start(t0); osc.stop(t0 + dur + 0.05);
  osc2.start(t0); osc2.stop(t0 + dur + 0.05);
  _sndNodes.push(osc, osc2, env, lpf);
}

// ④ アルペジオ（O→速度/複雑さ）
function scheduleArpeggio(ctx, chordMidis, t0, chordDur, beat, rate, vol, type, reverb, master) {
  const noteLen = beat / rate;
  const n       = Math.round(chordDur / noteLen);
  const pattern = [0, 1, 2, 1, 0, 2, 1, 2]; // up-down-skip pattern
  for (let i = 0; i < n; i++) {
    const nt   = t0 + i * noteLen;
    const midi = chordMidis[pattern[i % pattern.length]] + 12;
    const osc  = ctx.createOscillator();
    const env  = ctx.createGain();
    osc.type = type; osc.frequency.value = midiToHz(midi);
    env.gain.setValueAtTime(0, nt);
    env.gain.linearRampToValueAtTime(vol * 0.1, nt + 0.008);
    env.gain.exponentialRampToValueAtTime(0.001, nt + noteLen * 0.68);
    osc.connect(env); env.connect(reverb.input); env.connect(reverb.send); reverb.connect(master);
    osc.start(nt); osc.stop(nt + noteLen);
    _sndNodes.push(osc, env);
  }
}

// ⑤ グロッケンシュピール/ベル（O→出現頻度, 自然倍音列）
function scheduleBell(ctx, midi, t0, vel, reverb, master) {
  const ratios   = [1, 2.756, 5.404, 8.933];
  const amps     = [0.55, 0.25, 0.12, 0.05];
  const decayTs  = [2.2, 1.5, 0.9, 0.55];
  ratios.forEach((ratio, i) => {
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = midiToHz(midi) * ratio;
    env.gain.setValueAtTime(0, t0);
    env.gain.linearRampToValueAtTime(vel * amps[i] * 0.14, t0 + 0.005);
    env.gain.exponentialRampToValueAtTime(0.0001, t0 + decayTs[i]);
    osc.connect(env); env.connect(reverb.input); env.connect(reverb.send); reverb.connect(master);
    osc.start(t0); osc.stop(t0 + decayTs[i] + 0.1);
    _sndNodes.push(osc, env);
  });
}

// ⑦ キック（サイン掃引 + ノイズバースト）
function scheduleKick(ctx, t0, vol, master) {
  const osc  = ctx.createOscillator();
  const oscE = ctx.createGain();
  osc.frequency.setValueAtTime(130, t0);
  osc.frequency.exponentialRampToValueAtTime(40, t0 + 0.12);
  oscE.gain.setValueAtTime(vol * 0.6, t0);
  oscE.gain.exponentialRampToValueAtTime(0.001, t0 + 0.28);
  osc.connect(oscE); oscE.connect(master);
  osc.start(t0); osc.stop(t0 + 0.32);

  const bLen = Math.floor(ctx.sampleRate * 0.06);
  const nbuf = ctx.createBuffer(1, bLen, ctx.sampleRate);
  const nd   = nbuf.getChannelData(0);
  for (let i = 0; i < bLen; i++) nd[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.014));
  const nsrc = ctx.createBufferSource(); nsrc.buffer = nbuf;
  const nlpf = ctx.createBiquadFilter(); nlpf.type = 'lowpass'; nlpf.frequency.value = 100;
  const nenv = ctx.createGain();
  nenv.gain.setValueAtTime(vol * 0.22, t0);
  nenv.gain.exponentialRampToValueAtTime(0.001, t0 + 0.06);
  nsrc.connect(nlpf); nlpf.connect(nenv); nenv.connect(master);
  nsrc.start(t0); nsrc.stop(t0 + 0.07);
  _sndNodes.push(osc, oscE, nsrc, nlpf, nenv);
}

// スネア（サイン + ノイズ）
function scheduleSnare(ctx, t0, vol, master) {
  const osc  = ctx.createOscillator();
  const oscE = ctx.createGain();
  osc.frequency.value = 200;
  oscE.gain.setValueAtTime(vol * 0.2, t0);
  oscE.gain.exponentialRampToValueAtTime(0.001, t0 + 0.1);
  osc.connect(oscE); oscE.connect(master);
  osc.start(t0); osc.stop(t0 + 0.12);

  const bLen = Math.floor(ctx.sampleRate * 0.18);
  const nbuf = ctx.createBuffer(1, bLen, ctx.sampleRate);
  const nd   = nbuf.getChannelData(0);
  for (let i = 0; i < bLen; i++) nd[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.04));
  const nsrc = ctx.createBufferSource(); nsrc.buffer = nbuf;
  const bpf  = ctx.createBiquadFilter(); bpf.type = 'bandpass'; bpf.frequency.value = 240; bpf.Q.value = 0.5;
  const nenv = ctx.createGain();
  nenv.gain.setValueAtTime(vol * 0.26, t0);
  nenv.gain.exponentialRampToValueAtTime(0.001, t0 + 0.16);
  nsrc.connect(bpf); bpf.connect(nenv); nenv.connect(master);
  nsrc.start(t0); nsrc.stop(t0 + 0.2);
  _sndNodes.push(osc, oscE, nsrc, bpf, nenv);
}

// ハイハット（ノイズ + ハイパス）
function scheduleHihat(ctx, t0, vol, open, master) {
  const dur  = open ? 0.1 : 0.032;
  const bLen = Math.floor(ctx.sampleRate * dur);
  const nbuf = ctx.createBuffer(1, bLen, ctx.sampleRate);
  const nd   = nbuf.getChannelData(0);
  for (let i = 0; i < bLen; i++) nd[i] = Math.random() * 2 - 1;
  const nsrc = ctx.createBufferSource(); nsrc.buffer = nbuf;
  const hpf  = ctx.createBiquadFilter(); hpf.type = 'highpass'; hpf.frequency.value = 8500;
  const env  = ctx.createGain();
  env.gain.setValueAtTime(vol * 0.1, t0);
  env.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
  nsrc.connect(hpf); hpf.connect(env); env.connect(master);
  nsrc.start(t0); nsrc.stop(t0 + dur + 0.005);
  _sndNodes.push(nsrc, hpf, env);
}

// ── ブロックスケジュール ──────────────────────────
function scheduleBlock(ctx, offset, p, reverb, master) {
  const { notes, beat, scale, chordDegRoots, rootMidi,
          oscType, vibratoDepth,
          stringsVol, numVoices, bassVol,
          arpeggioRate, arpeggioVol, bellFreq,
          percVol, kickPat, snarePat, hihatPat } = p;

  // ① メロディー
  notes.forEach(n =>
    scheduleNote(ctx, n.midi, n.vel, offset + n.time, n.dur, oscType, vibratoDepth, reverb, master)
  );

  // ② ③ ④ コード進行（4拍 × 4コード）
  chordDegRoots.forEach((deg, ci) => {
    const t0    = offset + ci * 4 * beat;
    const dur   = 4 * beat;
    const midis = getChordMidis(rootMidi, deg, scale, 3);

    // ストリングス（コードの3音それぞれ）
    midis.forEach(m => scheduleStrings(ctx, m, t0, dur, stringsVol, numVoices, reverb, master));
    // ベース
    scheduleBass(ctx, midis[0], t0, dur, bassVol, reverb, master);
    // アルペジオ
    if (arpeggioRate > 0) {
      scheduleArpeggio(ctx, midis, t0, dur, beat, arpeggioRate, arpeggioVol, oscType, reverb, master);
    }
  });

  // ⑤ グロッケンシュピール（確率的に出現）
  if (bellFreq > 0.05) {
    notes.forEach((n, i) => {
      if (i % 3 === 0 && Math.random() < bellFreq)
        scheduleBell(ctx, n.midi + 12, offset + n.time, n.vel, reverb, master);
    });
  }

  // ⑦ パーカッション（16 quarter-beat）
  for (let i = 0; i < 16; i++) {
    const t = offset + i * beat;
    if (kickPat[i])  scheduleKick (ctx, t, percVol,        master);
    if (snarePat[i]) scheduleSnare(ctx, t, percVol * 0.75, master);
  }
  // ハイハット（32 8分音符）
  const eighth = beat / 2;
  for (let i = 0; i < 32; i++) {
    if (hihatPat[i]) scheduleHihat(ctx, offset + i * eighth, percVol * 0.48, i % 8 === 0, master);
  }
}

// ── 再生 / 停止 ───────────────────────────────────
function playSoundtrack(result) {
  if (_sndPlaying) return;
  _sndPlaying = true;
  _sndCtx = new (window.AudioContext || window.webkitAudioContext)();

  // ダイナミクスコンプレッサー → マスター
  const comp = _sndCtx.createDynamicsCompressor();
  comp.threshold.value = -20; comp.knee.value = 10;
  comp.ratio.value = 5; comp.attack.value = 0.003; comp.release.value = 0.2;
  comp.connect(_sndCtx.destination);

  _masterGain = _sndCtx.createGain();
  // ⑩ フェードイン
  _masterGain.gain.setValueAtTime(0, _sndCtx.currentTime);
  _masterGain.gain.linearRampToValueAtTime(0.65, _sndCtx.currentTime + 1.5);
  _masterGain.connect(comp);
  _sndNodes.push(_masterGain, comp);

  const p      = buildSoundParams(result.bigFive);
  const reverb = makeReverb(_sndCtx, p.reverbSecs, p.reverbWet);

  function doBlock(offset) { scheduleBlock(_sndCtx, offset, p, reverb, _masterGain); }

  doBlock(_sndCtx.currentTime + 0.1);
  const loopMs = (p.totalDur + 0.05) * 1000;
  const loopFn = function loop() {
    if (!_sndPlaying) return;
    doBlock(_sndCtx.currentTime + 0.05);
    const tid = setTimeout(loop, loopMs);
    _sndNodes.push({ stop: () => clearTimeout(tid) });
  };
  const tid0 = setTimeout(loopFn, loopMs);
  _sndNodes.push({ stop: () => clearTimeout(tid0) });

  updatePlayBtn(true);
  startSpectrumViz(_sndCtx, _masterGain);
}

function stopSoundtrack() {
  if (!_sndPlaying) return;
  _sndPlaying = false;
  if (_sndVizId) { cancelAnimationFrame(_sndVizId); _sndVizId = null; }
  updatePlayBtn(false);

  if (_sndCtx && _masterGain) {
    // ⑩ フェードアウト
    _masterGain.gain.cancelScheduledValues(_sndCtx.currentTime);
    _masterGain.gain.setValueAtTime(_masterGain.gain.value, _sndCtx.currentTime);
    _masterGain.gain.linearRampToValueAtTime(0, _sndCtx.currentTime + 1.2);
    setTimeout(() => {
      _sndNodes.forEach(n => { try { if (n.stop) n.stop(); } catch(e) {} });
      _sndNodes = [];
      if (_sndCtx) { _sndCtx.close(); _sndCtx = null; }
      _masterGain = null;
      clearWaveform();
    }, 1400);
  } else {
    _sndNodes.forEach(n => { try { if (n.stop) n.stop(); } catch(e) {} });
    _sndNodes = [];
    if (_sndCtx) { _sndCtx.close(); _sndCtx = null; }
    clearWaveform();
  }
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
  const idle = c.parentElement?.querySelector('.snd-canvas-idle');
  if (idle) idle.style.opacity = '1';
}

// ── ⑨ スペクトラムビジュアライザー（FFTバーグラフ）───
function startSpectrumViz(audioCtx, sourceNode) {
  const analyser = audioCtx.createAnalyser();
  analyser.fftSize = 512;
  analyser.smoothingTimeConstant = 0.8;
  sourceNode.connect(analyser);
  const freqBuf = new Uint8Array(analyser.frequencyBinCount);
  const c = document.getElementById('sndCanvas');
  if (!c) return;
  const idle = c.parentElement?.querySelector('.snd-canvas-idle');
  if (idle) idle.style.opacity = '0';
  const dpr = window.devicePixelRatio || 1;
  c.width  = c.offsetWidth * dpr;
  c.height = (c.offsetHeight || 96) * dpr;
  const ctx = c.getContext('2d');
  const W = c.width, H = c.height;
  const NUM_BARS  = 56;
  const MAX_BIN   = Math.floor(analyser.frequencyBinCount * 0.65);
  const barW      = (W / NUM_BARS) - 1.2;
  const peakArr   = new Float32Array(NUM_BARS).fill(0);
  const peakVel   = new Float32Array(NUM_BARS).fill(0);

  function draw() {
    if (!_sndPlaying) return;
    _sndVizId = requestAnimationFrame(draw);
    analyser.getByteFrequencyData(freqBuf);

    ctx.fillStyle = '#080808';
    ctx.fillRect(0, 0, W, H);

    // グリッド線（控えめ）
    ctx.strokeStyle = 'rgba(42,42,42,0.7)';
    ctx.lineWidth = 1;
    [0.25, 0.5, 0.75].forEach(ratio => {
      const gy = H * ratio;
      ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke();
    });

    for (let i = 0; i < NUM_BARS; i++) {
      const binIdx = 1 + Math.floor(i * MAX_BIN / NUM_BARS);
      const val    = freqBuf[Math.min(binIdx, freqBuf.length - 1)] / 255;
      const barH   = Math.max(2, val * H * 0.92);
      const x      = i * (W / NUM_BARS);

      // バーカラー: 低値→黄, 高値→白に近づく
      const r = Math.floor(232 + val * 23);   // 232→255
      const g = 255;
      const b = Math.floor(60  + val * 195);  // 60→255
      ctx.fillStyle = `rgb(${r},${g},${b})`;
      fillRoundRect(ctx, x, H - barH, barW, barH, Math.min(2 * dpr, barW / 2));

      // ピーク追尾（ドット）
      peakVel[i] -= 0.004;
      if (val > peakArr[i]) { peakArr[i] = val; peakVel[i] = 0.005; }
      else peakArr[i] = Math.max(0, peakArr[i] + peakVel[i]);
      if (peakArr[i] > 0.02) {
        const py = H - peakArr[i] * H * 0.92 - 2;
        ctx.fillStyle = `rgba(232,255,60,${Math.min(1, peakArr[i] * 1.8)})`;
        ctx.fillRect(x, py, barW, 1.5 * dpr);
      }

      // 高エネルギーグロウ
      if (val > 0.72) {
        ctx.fillStyle = `rgba(232,255,60,${(val - 0.72) * 1.5 * 0.35})`;
        fillRoundRect(ctx, x - 1, H - barH - 4, barW + 2, barH + 4, Math.min(3 * dpr, (barW + 2) / 2));
      }
    }
  }
  draw();
}

// ── レンダリング ──────────────────────────────────
function renderSoundtrackSection(result) {
  const el = document.getElementById('soundtrackSection');
  if (!el) return;

  const p = buildSoundParams(result.bigFive);

  // アクティブ楽器タグ
  const instrs = [
    { name: 'MELODY',      on: true },
    { name: 'STRINGS',     on: p.stringsVol > 0.4 },
    { name: 'BASS',        on: p.bassVol > 0.35 },
    { name: 'ARPEGGIO',    on: p.arpeggioRate > 0 },
    { name: 'BELLS',       on: p.bellFreq > 0.08 },
    { name: 'PERCUSSION',  on: true },
    { name: 'VIBRATO',     on: p.vibratoDepth > 0.12 },
    { name: 'REVERB',      on: true },
  ];
  const instrTags = instrs
    .filter(i => i.on)
    .map((i, idx) => `<span class="soundtrack-tag${idx < 3 ? ' accent' : ''}">${i.name}</span>`)
    .join('');

  const progStr = (p.chordLabels || []).join(' → ');

  el.innerHTML = `
    <div class="section-title">
      <div class="section-title-text">STRENGTH SOUNDTRACK</div>
      <div class="section-title-line"></div>
    </div>
    <div class="soundtrack-block">
      <div class="soundtrack-top">
        <div>
          <div class="soundtrack-label">WEB AUDIO API · GENERATIVE MUSIC</div>
          <div class="soundtrack-desc">${t('soundtrackDesc')}</div>
          <div class="soundtrack-tags">${instrTags}</div>
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
        <div class="snd-param-row"><span class="snd-param-key">EXTRAVERSION →</span><span class="snd-param-val">${p.bpmRound} BPM · PERC ${Math.round(p.percVol * 100)}%</span></div>
        <div class="snd-param-row"><span class="snd-param-key">AGREEABLENESS →</span><span class="snd-param-val">${p.mode.toUpperCase()} · STRINGS ${Math.round(p.stringsVol * 100)}%</span></div>
        <div class="snd-param-row"><span class="snd-param-key">OPENNESS →</span><span class="snd-param-val">${p.oscLabel}${p.arpeggioRate > 0 ? ` · ARP ×${p.arpeggioRate}` : ''}${p.bellFreq > 0.08 ? ' · BELLS' : ''}</span></div>
        <div class="snd-param-row"><span class="snd-param-key">CONSCIENTIOUSNESS →</span><span class="snd-param-val">${p.rhythm} RHYTHM</span></div>
        <div class="snd-param-row"><span class="snd-param-key">NEUROTICISM →</span><span class="snd-param-val">REVERB ${p.reverbPct}%${p.vibratoDepth > 0.12 ? ' · VIBRATO' : ''}</span></div>
        <div class="snd-param-row"><span class="snd-param-key">PROGRESSION →</span><span class="snd-param-val">${progStr}</span></div>
      </div>
    </div>
  `;
}
