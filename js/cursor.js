// =============================================
// cursor.js — Custom animated cursor
// =============================================

const cursor    = document.getElementById('cursor');
const cursorRing = document.getElementById('cursorRing');

let rx = 0, ry = 0, cx = 0, cy = 0;

document.addEventListener('mousemove', e => {
  cx = e.clientX;
  cy = e.clientY;
  cursor.style.left = cx + 'px';
  cursor.style.top  = cy + 'px';
});

(function loop() {
  rx += (cx - rx) * 0.15;
  ry += (cy - ry) * 0.15;
  cursorRing.style.left = rx + 'px';
  cursorRing.style.top  = ry + 'px';
  requestAnimationFrame(loop);
})();
