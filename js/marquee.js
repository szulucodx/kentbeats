// =============================================
// marquee.js — Scrolling marquee text
// =============================================

const MARQUEE_ITEMS = [
  'TRAP BEATS', 'AFROBEATS', 'DRILL BANGERS', 'R&B VIBES',
  'AMAPIANO', 'BOOM BAP', 'LO-FI CHILL', 'UK RAP', 'POP HITS', 'FREE DOWNLOADS'
];

const marqueeEl = document.getElementById('marquee');
let html = '';

[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].forEach(item => {
  html += `<span class="marquee-item">${item}<span class="marquee-dot"></span></span>`;
});

marqueeEl.innerHTML = html;
