// ═══════════════════════════════════════════════
// RESULTS RENDERING — 結果画面の描画
// ═══════════════════════════════════════════════

function showResult(result) {
  showScreen('screen-result');
  applyStaticTranslations();

  // 言語に合わせてキャッチコピーを再生成
  document.getElementById('catchcopyText').innerHTML =
    generateProfile(result.bigFiveTop, result.viaTop);

  setTimeout(() => drawRadar(result.bigFive), 100);
  renderRadarLegend(result.bigFive);
  renderBigFiveList(result.bigFive, result.bigFiveTop);
  renderConsistencyBlock(result);
  renderViaCards(result.viaSorted, result.viaTimings);
  renderIntuitionSection(result);
  renderShadowSection(result.viaSorted);

  window._currentResult = result;
  renderSoundtrackSection(result);
}

function drawRadar(bigFive) {
  const canvas = document.getElementById('radarCanvas');
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const size = Math.min(canvas.offsetWidth, 340);
  canvas.width = size * dpr;
  canvas.height = size * dpr;
  canvas.style.width = size + 'px';
  canvas.style.height = size + 'px';
  ctx.scale(dpr, dpr);

  const cx = size / 2, cy = size / 2;
  const maxR = size * 0.36;
  const labels = t('radarLabels');
  const codes  = ['O', 'C', 'E', 'A', 'N'];
  const values = [
    bigFive.O / 5,
    bigFive.C / 5,
    bigFive.E / 5,
    bigFive.A / 5,
    (6 - bigFive.N) / 5,
  ];
  const n = 5;
  const angleOffset = -Math.PI / 2;

  function getXY(i, r) {
    const angle = angleOffset + (2 * Math.PI * i) / n;
    return {x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle)};
  }

  let progress = 0;
  function animate() {
    progress = Math.min(progress + 0.04, 1);
    const ease = 1 - Math.pow(1 - progress, 3);

    ctx.clearRect(0, 0, size, size);

    // Grid
    [0.2, 0.4, 0.6, 0.8, 1].forEach(ratio => {
      ctx.beginPath();
      for (let i = 0; i < n; i++) {
        const {x, y} = getXY(i, maxR * ratio);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = ratio === 1 ? '#2a2a2a' : '#1a1a1a';
      ctx.lineWidth = 1;
      ctx.stroke();
    });
    for (let i = 0; i < n; i++) {
      const outer = getXY(i, maxR);
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(outer.x, outer.y);
      ctx.strokeStyle = '#222';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Data fill
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const {x, y} = getXY(i, maxR * values[i] * ease);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = 'rgba(232,255,60,0.1)';
    ctx.fill();
    ctx.strokeStyle = '#e8ff3c';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Dots
    for (let i = 0; i < n; i++) {
      const {x, y} = getXY(i, maxR * values[i] * ease);
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#e8ff3c';
      ctx.fill();
    }

    // Labels
    const labelOffset = 28;
    ctx.font = '12px "DM Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (let i = 0; i < n; i++) {
      const {x, y} = getXY(i, maxR + labelOffset);
      ctx.fillStyle = '#888';
      ctx.fillText(labels[i], x, y);
      const {x: sx, y: sy} = getXY(i, maxR * values[i] * ease + 14);
      if (progress > 0.8) {
        ctx.fillStyle = 'rgba(232,255,60,' + ((progress - 0.8) * 5) + ')';
        ctx.font = '10px "DM Mono", monospace';
        ctx.fillText(bigFive[codes[i] === 'N' ? '_' : codes[i]] !== undefined
          ? (values[i] * 5).toFixed(1)
          : '', sx, sy);
        ctx.font = '12px "DM Mono", monospace';
      }
    }

    if (progress < 1) requestAnimationFrame(animate);
  }
  animate();
}

function renderRadarLegend(bigFive) {
  const bfi = getBigFiveInfoForLang();
  const items = [
    {code:'O', name: bfi.O.name, val:bigFive.O},
    {code:'C', name: bfi.C.name, val:bigFive.C},
    {code:'E', name: bfi.E.name, val:bigFive.E},
    {code:'A', name: bfi.A.name, val:bigFive.A},
    {code:'N', name: currentLang==='en' ? 'Stability' : '安定性', val:6-bigFive.N},
  ];
  const el = document.getElementById('radarLegend');
  el.innerHTML = items.map(item => `
    <div class="radar-item">
      <div class="radar-dot"></div>
      <div class="radar-item-label">${item.code} · ${item.name}</div>
      <div class="radar-item-bar">
        <div class="radar-item-fill" style="width:0%" data-w="${(item.val/5)*100}%"></div>
      </div>
      <div class="radar-item-score">${item.val.toFixed(1)}</div>
    </div>
  `).join('');
  setTimeout(() => {
    el.querySelectorAll('.radar-item-fill').forEach(el => {
      el.style.width = el.dataset.w;
    });
  }, 200);
}

function renderBigFiveList(bigFive, bigFiveTop) {
  const order = ['O','C','E','A','N'];
  const el = document.getElementById('bigFiveList');
  const bfi = getBigFiveInfoForLang();

  el.innerHTML = order.map(code => {
    const info = bfi[code];
    const score = bigFive[code];
    const pct = (score / 5) * 100;
    const isTop = (code === 'N' && bigFiveTop === '神経症傾向低') ||
                  (code !== 'N' && bigFiveTop === info.name);

    return `
      <div class="bigfive-item ${isTop ? 'top-factor' : ''}">
        <div class="bigfive-item-header">
          <span class="bigfive-factor-code">${code} · ${info.code}</span>
          <span class="bigfive-factor-name">${info.name}</span>
          ${isTop ? '<span class="bigfive-top-badge">TOP FACTOR</span>' : ''}
        </div>
        <div class="bigfive-score-row">
          <span class="bigfive-score-val">${score.toFixed(2)}</span>
          <span class="bigfive-score-max">/ 5.00</span>
        </div>
        <div class="bigfive-bar-wrap">
          <div class="bigfive-bar" style="width:0%" data-w="${pct}%"></div>
        </div>
        <div class="bigfive-desc">${info.desc}</div>
      </div>
    `;
  }).join('');

  setTimeout(() => {
    el.querySelectorAll('.bigfive-bar').forEach(bar => {
      bar.style.width = bar.dataset.w;
    });
  }, 300);
}

function renderViaCards(viaSorted, viaTimings) {
  const timeMap = {};
  (viaTimings || []).forEach(v => { timeMap[v.via] = v.ms; });

  const el = document.getElementById('viaGrid');
  el.innerHTML = viaSorted.map((item, i) => {
    const info = getViaInfoForLang(item.name);
    const ms   = timeMap[item.name];
    const instantBadge = (ms != null && ms < 2000)
      ? `<span class="via-intuition-badge">${t('viaInstant')}</span>` : '';
    const dispName    = getViaName(item.name);
    const dispVirtue  = getVirtueName(item.virtue);
    return `
      <div class="via-card" style="animation-delay:${0.1*i}s">
        <div class="via-card-inner">
          <div class="via-card-rank">
            <span class="via-rank-num">0${i+1}</span>
            <span>${t('sigStrength')}</span>
            ${instantBadge}
          </div>
          <div class="via-card-name">${dispName}</div>
          <div class="via-virtue-tag virtue-${item.virtue}">${dispVirtue}</div>
          <div class="via-card-desc">${info.desc||''}</div>
          <div class="via-card-usage">
            <div class="via-usage-item">
              <span class="via-usage-label">${t('viaWork')}</span>
              <span class="via-usage-text">${info.work||''}</span>
            </div>
            <div class="via-usage-item">
              <span class="via-usage-label">${t('viaLearn')}</span>
              <span class="via-usage-text">${info.learn||''}</span>
            </div>
            <div class="via-usage-item">
              <span class="via-usage-label">${t('viaRelation')}</span>
              <span class="via-usage-text">${info.relation||''}</span>
            </div>
          </div>
          <div class="via-score-bar">
            <div class="via-score-fill" style="width:0%" data-w="${(item.score/5)*100}%"></div>
          </div>
        </div>
      </div>
    `;
  }).join('');

  setTimeout(() => {
    el.querySelectorAll('.via-score-fill').forEach(bar => {
      bar.style.width = bar.dataset.w;
    });
  }, 400);
}

function renderShadowSection(viaSorted) {
  const el = document.getElementById('shadowSection');
  const targets = viaSorted.slice(0, 3).filter(item => item.score >= 4);

  if (targets.length === 0) { el.innerHTML = ''; return; }

  const cards = targets.map(item => {
    const info = getShadowForLang(item.name);
    if (!info || !info.shadow) return '';
    const isHigh = item.score === 5;
    const levelClass = isHigh ? 'level-high' : 'level-mid';
    const badgeClass = isHigh ? 'high' : 'mid';
    const badgeLabel = isHigh ? t('shadowHigh') : t('shadowMid');
    const dispName   = getViaName(item.name);
    return `
      <div class="shadow-card ${levelClass}">
        <div class="shadow-card-inner">
          <div class="shadow-card-header">
            <span class="shadow-strength-name">${dispName}</span>
            <span class="shadow-level-badge ${badgeClass}">${badgeLabel}</span>
          </div>
          <div class="shadow-name">▲ SHADOW — ${info.shadow}</div>
          <div class="shadow-desc">${info.desc}</div>
          <div class="shadow-signal">
            <span class="shadow-signal-label">${t('shadowSignalLabel')}</span>
            <span class="shadow-signal-text">${info.signal}</span>
          </div>
        </div>
      </div>
    `;
  }).join('');

  el.innerHTML = `
    <div class="section-title">
      <div class="section-title-text">${t('secShadow')}</div>
      <div class="section-title-line"></div>
    </div>
    <div class="shadow-intro">${t('shadowIntro')}</div>
    <div class="shadow-grid">${cards}</div>
  `;
}

function renderConsistencyBlock(result) {
  const el    = document.getElementById('consistencySection');
  const score = result.consistencyScore;
  if (score == null) { el.innerHTML = ''; return; }

  let level, levelColor, levelDesc;
  if (score >= 85) {
    level = t('consistencyHigh'); levelColor = '#e8ff3c';
    levelDesc = t('consistencyDescHigh');
  } else if (score >= 70) {
    level = t('consistencyMod');  levelColor = '#fbbf24';
    levelDesc = t('consistencyDescMod');
  } else {
    level = t('consistencyLow');  levelColor = '#fb923c';
    levelDesc = t('consistencyDescLow');
  }

  const barsHTML = result.pairScores.map(p => `
    <div class="consistency-pair-row">
      <div class="consistency-pair-label">${p.label}</div>
      <div class="consistency-pair-bar-wrap">
        <div class="consistency-pair-bar" style="width:0%" data-w="${p.pct}%"></div>
      </div>
      <div class="consistency-pair-pct">${p.pct}%</div>
    </div>
  `).join('');

  el.innerHTML = `
    <div class="section-title">
      <div class="section-title-text">${t('secConsistency')}</div>
      <div class="section-title-line"></div>
    </div>
    <div class="consistency-block">
      <div class="consistency-left">
        <div class="consistency-label-sm">${t('consistencyLabel')}</div>
        <div class="consistency-main">
          <span class="consistency-num">${score}</span>
          <span class="consistency-unit">%</span>
        </div>
        <div class="consistency-level" style="color:${levelColor}">${level}</div>
        <div class="consistency-desc">${levelDesc}</div>
      </div>
      <div class="consistency-pairs">${barsHTML}</div>
    </div>
  `;
  setTimeout(() => {
    el.querySelectorAll('.consistency-pair-bar').forEach(bar => {
      bar.style.width = bar.dataset.w;
    });
  }, 300);
}

function renderIntuitionSection(result) {
  const el = document.getElementById('intuitionSection');
  const timings = (result.viaTimings || []);
  if (timings.length === 0) { el.innerHTML = ''; return; }

  const top5Names = new Set(result.viaSorted.map(v => v.name));
  const top5Timings = timings
    .filter(t => top5Names.has(t.via))
    .sort((a, b) => a.ms - b.ms)
    .slice(0, 5);

  if (top5Timings.length === 0) { el.innerHTML = ''; return; }

  const maxMs = Math.max(...top5Timings.map(t => t.ms));

  function classify(ms) {
    if (ms < 2000) return {cls:'instant',    label: t('badgeInstant')};
    if (ms < 5000) return {cls:'normal',     label: t('badgeNormal')};
    return              {cls:'deliberate',  label: t('badgeDeliberate')};
  }

  const instantItem    = top5Timings.find(v => v.ms < 2000);
  const deliberateItem = top5Timings.find(v => v.ms >= 5000);

  let insight = '';
  if (instantItem || deliberateItem) {
    const fastName = getViaName(instantItem?.via   || '');
    const slowName = getViaName(deliberateItem?.via || '');
    const fastSec  = instantItem    ? (instantItem.ms/1000).toFixed(1)    : null;
    const slowSec  = deliberateItem ? (deliberateItem.ms/1000).toFixed(1) : null;
    insight = t('intuitionInsight')(fastName, fastSec, slowName, slowSec);
  }

  const listHTML = top5Timings.map((item, i) => {
    const {cls, label} = classify(item.ms);
    const barW   = Math.max(6, Math.round((item.ms / maxMs) * 100));
    const barClr = cls === 'instant' ? '#e8ff3c' : cls === 'deliberate' ? '#60a5fa' : '#444';
    const dispMs = item.ms < 1000 ? `${item.ms}ms` : `${(item.ms/1000).toFixed(1)}s`;
    return `
      <div class="intuition-item">
        <div class="intuition-rank">${i+1}</div>
        <div class="intuition-via-name">${getViaName(item.via)}</div>
        <div class="intuition-timebar">
          <div class="intuition-timebar-fill" style="width:${barW}%;background:${barClr}"></div>
        </div>
        <span class="intuition-badge ${cls}">${label}</span>
        <span class="intuition-ms">${dispMs}</span>
      </div>
    `;
  }).join('');

  el.innerHTML = `
    <div class="section-title">
      <div class="section-title-text">${t('secIntuition')}</div>
      <div class="section-title-line"></div>
    </div>
    <div class="intuition-intro">${t('intuitionIntro')}</div>
    <div class="intuition-list">${listHTML}</div>
    ${insight ? `<div class="intuition-insight">${insight}</div>` : ''}
  `;
}

// ── シェア画像生成用のCanvas テキスト折り返し ──
function wrapCanvasText(ctx, text, x, y, maxWidth, lineHeight) {
  const chars = Array.from(text);
  let line = '', curY = y;
  for (const ch of chars) {
    const test = line + ch;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, curY);
      line  = ch;
      curY += lineHeight;
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line, x, curY);
}

function downloadShareImage() {
  const savedStr = localStorage.getItem('strength_result');
  if (!savedStr) { showToast('先に診断を完了してください'); return; }
  const result = JSON.parse(savedStr);

  const canvas = document.getElementById('shareCanvas');
  const W = 1200, H = 628;
  canvas.width  = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#0f0f0f';
  ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = '#161616';
  ctx.lineWidth   = 1;
  for (let x = 0; x <= W; x += 60) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
  }

  ctx.fillStyle = '#e8ff3c';
  ctx.fillRect(0, 0, W, 4);

  ctx.fillStyle = '#555';
  ctx.font = '400 13px monospace';
  ctx.fillText('STRENGTH  PROFILE  ·  科学的強み診断', 60, 56);
  ctx.fillStyle = '#e8ff3c';
  ctx.beginPath(); ctx.arc(52, 52, 3, 0, Math.PI*2); ctx.fill();

  const catchEl  = document.getElementById('catchcopyText');
  const catchTxt = (catchEl.textContent || catchEl.innerText).trim();
  ctx.fillStyle = '#f0f0f0';
  ctx.font = 'bold 34px sans-serif';
  wrapCanvasText(ctx, catchTxt, 60, 160, 660, 52);

  ctx.fillStyle = '#2a2a2a';
  ctx.fillRect(60, 350, 680, 1);

  const bfLabels = ['O','C','E','A','N'];
  const bfNames  = ['開放性','誠実性','外向性','協調性','安定性'];
  const bfVals   = [
    result.bigFive.O, result.bigFive.C, result.bigFive.E,
    result.bigFive.A, 6 - result.bigFive.N
  ];
  bfLabels.forEach((code, i) => {
    const bx = 60 + i * 128;
    const by = 400;
    ctx.fillStyle = '#e8ff3c';
    ctx.font = '500 13px monospace';
    ctx.fillText(bfVals[i].toFixed(1), bx, by - 6);
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(bx, by, 110, 3);
    ctx.fillStyle = '#e8ff3c';
    ctx.fillRect(bx, by, 110 * bfVals[i] / 5, 3);
    ctx.fillStyle = '#444';
    ctx.font = '400 11px monospace';
    ctx.fillText(`${code} ${bfNames[i]}`, bx, by + 18);
  });

  if (result.consistencyScore != null) {
    ctx.fillStyle = '#333';
    ctx.font = '400 12px monospace';
    ctx.fillText(`RELIABILITY  ${result.consistencyScore}%`, 60, 560);
  }

  const rx = 860;
  ctx.fillStyle = '#333';
  ctx.font = '400 11px monospace';
  ctx.fillText('VIA SIGNATURE STRENGTHS', rx, 96);

  result.viaSorted.slice(0, 3).forEach((item, i) => {
    const vy = 136 + i * 128;
    ctx.fillStyle = '#e8ff3c';
    ctx.font = '500 26px monospace';
    ctx.fillText(`0${i+1}`, rx, vy + 26);
    ctx.fillStyle = '#f0f0f0';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText(item.name, rx + 48, vy + 26);
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(rx + 48, vy + 36, 260, 2);
    ctx.fillStyle = '#e8ff3c';
    ctx.fillRect(rx + 48, vy + 36, 260 * item.score / 5, 2);
    ctx.fillStyle = '#555';
    ctx.font = '400 11px monospace';
    ctx.fillText(item.virtue, rx + 48, vy + 56);
  });

  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(0, H - 6, W, 6);
  ctx.fillStyle = '#e8ff3c';
  ctx.fillRect(0, H - 6, W * (result.consistencyScore || 80) / 100, 6);

  const link    = document.createElement('a');
  link.download = 'strength-profile.png';
  link.href     = canvas.toDataURL('image/png');
  link.click();
  showToast('画像をダウンロードしました ✓');
}
