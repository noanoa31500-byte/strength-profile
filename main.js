// ═══════════════════════════════════════════════
// INIT — イベントリスナー・初期化
// ═══════════════════════════════════════════════

// キーボード操作
document.addEventListener('keydown', (e) => {
  if (!document.getElementById('screen-quiz').classList.contains('active')) return;
  if (['1','2','3','4','5'].includes(e.key)) {
    e.preventDefault();
    selectAnswer(parseInt(e.key));
  }
  if (e.key === 'Enter') {
    e.preventDefault();
    if (answers[QUESTIONS[currentQ].id]) advanceQuestion();
  }
  if (e.key === 'ArrowLeft') {
    e.preventDefault();
    prevQuestion();
  }
});

// 起動時：URLハッシュから共有結果を復元、または途中保存ノーティス
window.addEventListener('DOMContentLoaded', () => {
  const hash = location.hash;
  if (hash.startsWith('#r=')) {
    try {
      const result = decodeResult(hash.slice(3));
      responseTimes = {};
      showResult(result);
      return;
    } catch(e) {
      console.warn('結果URLの解析に失敗しました:', e);
    }
  }
  updateRestoreNotice();
});

// リサイズ時にレーダーチャートを再描画
window.addEventListener('resize', () => {
  const saved = localStorage.getItem('strength_result');
  const resultScreen = document.getElementById('screen-result');
  if (saved && resultScreen.classList.contains('active')) {
    drawRadar(JSON.parse(saved).bigFive);
  }
});

// Service Worker 登録（PWA対応）
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}
