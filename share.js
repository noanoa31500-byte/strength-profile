// ═══════════════════════════════════════════════
// SHARE — URL共有・テキスト・トースト
// ═══════════════════════════════════════════════

function encodeResult(result) {
  const slim = {
    bigFive:          result.bigFive,
    bigFiveTop:       result.bigFiveTop,
    viaSorted:        result.viaSorted,
    viaTop:           result.viaTop,
    catchcopy:        result.catchcopy,
    consistencyScore: result.consistencyScore,
    pairScores:       result.pairScores,
  };
  const bytes  = new TextEncoder().encode(JSON.stringify(slim));
  let binStr   = '';
  bytes.forEach(b => { binStr += String.fromCharCode(b); });
  return btoa(binStr);
}

function decodeResult(b64) {
  const binStr = atob(b64);
  const bytes  = Uint8Array.from(binStr, c => c.charCodeAt(0));
  return JSON.parse(new TextDecoder().decode(bytes));
}

function shareResultURL() {
  const savedStr = localStorage.getItem('strength_result');
  if (!savedStr) { showToast(t('toastNeedResult')); return; }
  const result  = JSON.parse(savedStr);
  const encoded = encodeResult(result);
  const url     = `${location.origin}${location.pathname}#r=${encoded}`;
  if (navigator.share) {
    navigator.share({title: t('shareTitle'), url}).catch(() => {});
  } else {
    navigator.clipboard.writeText(url).then(() => {
      showToast(t('toastCopiedLink'));
    }).catch(() => {
      prompt('URL:', url);
    });
  }
}

function shareResult() {
  const el = document.getElementById('catchcopyText');
  const text = el.textContent || el.innerText;
  const shareText = `${t('shareTitle')}：${text} ${t('shareHashtags')}`;
  navigator.clipboard.writeText(shareText).then(() => {
    showToast(t('toastCopied'));
  }).catch(() => {
    prompt('', shareText);
  });
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}
