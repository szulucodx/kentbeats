// =============================================
// waveform.js — Animated hero waveform bars
// =============================================

const waveformEl = document.getElementById('waveform');

for (let i = 0; i < 90; i++) {
  const bar = document.createElement('div');
  bar.className = 'bar';
  const h = Math.floor(8 + Math.random() * 52);
  bar.style.cssText = `
    --h: ${h}px;
    animation-delay: ${(Math.random() * 1.2).toFixed(2)}s;
    animation-duration: ${(0.7 + Math.random() * 0.8).toFixed(2)}s;
  `;
  waveformEl.appendChild(bar);
}
