// ═══════════════════════════════════════════════
// COMPUTATION — スコア計算
// ═══════════════════════════════════════════════

function computeResult() {
  // Big Five
  const factors = {O:[], C:[], E:[], A:[], N:[]};
  QUESTIONS.slice(0, 20).forEach(q => {
    let val = answers[q.id] || 3;
    if (q.reversed) val = 6 - val;
    factors[q.factor].push(val);
  });
  const bigFive = {};
  Object.entries(factors).forEach(([k, vals]) => {
    bigFive[k] = vals.reduce((a,b) => a+b, 0) / vals.length;
  });

  // VIA
  const viaScores = {};
  QUESTIONS.slice(20).forEach(q => {
    viaScores[q.via] = {score: answers[q.id] || 3, virtue: q.virtue};
  });

  // Big Five top（キーを日本語名にすることでPROFILESと一致させる）
  const bfEffective = {
    "開放性":     bigFive.O,
    "誠実性":     bigFive.C,
    "外向性":     bigFive.E,
    "協調性":     bigFive.A,
    "神経症傾向低": 6 - bigFive.N,
  };
  const bigFiveTop = Object.entries(bfEffective).sort((a,b) => b[1]-a[1])[0][0];

  // VIA top 5
  const viaSorted = Object.entries(viaScores)
    .sort((a,b) => b[1].score - a[1].score)
    .slice(0, 5)
    .map(([name, data]) => ({name, ...data}));

  const viaTop    = viaSorted[0].name;
  const catchcopy = generateProfile(bigFiveTop, viaTop);

  // 一貫性スコア
  const pairScores = CONSISTENCY_PAIRS.map(p => {
    const diff = Math.abs((answers[p.a] || 3) - (answers[p.b] || 3));
    return {label: p.label, pct: Math.round((1 - diff / 4) * 100)};
  });
  const consistencyScore = Math.round(
    pairScores.reduce((s, p) => s + p.pct, 0) / pairScores.length
  );

  // 回答時間分析（VIA 質問 id:21〜40 のみ）
  const viaTimings = QUESTIONS.slice(20).map(q => ({
    via: q.via,
    ms:  responseTimes[q.id] != null ? responseTimes[q.id] : null,
  })).filter(t => t.ms !== null).sort((a, b) => a.ms - b.ms);

  return {bigFive, bigFiveTop, viaScores, viaSorted, viaTop, catchcopy,
          consistencyScore, pairScores, viaTimings};
}
