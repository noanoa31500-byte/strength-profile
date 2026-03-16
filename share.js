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
  if (!savedStr) { showToast('先に診断を完了してください'); return; }
  const result  = JSON.parse(savedStr);
  const encoded = encodeResult(result);
  const url     = `${location.origin}${location.pathname}#r=${encoded}`;
  if (navigator.share) {
    navigator.share({title:'私の強みプロフィール', url}).catch(() => {});
  } else {
    navigator.clipboard.writeText(url).then(() => {
      showToast('リンクをコピーしました ✓');
    }).catch(() => {
      prompt('URLをコピーしてください:', url);
    });
  }
}

function shareResult() {
  const el = document.getElementById('catchcopyText');
  const text = el.textContent || el.innerText;
  const shareText = `私の強みプロフィール：${text} #強み診断 #BigFive #VIA`;
  navigator.clipboard.writeText(shareText).then(() => {
    showToast('コピーしました ✓');
  }).catch(() => {
    prompt('以下のテキストをコピーしてください:', shareText);
  });
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}
