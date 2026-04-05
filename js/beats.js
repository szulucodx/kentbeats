// =============================================
// beats.js — Render beat cards to the grid
// =============================================

const beatsGrid = document.getElementById('beatsGrid');

function getBeatFileName(beat) {
  return beat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function buildLicenseText(beat) {
  return [
    'KENTBEATS FREE LICENSE',
    '',
    `Beat: ${beat.name}`,
    `Genre: ${beat.genre}`,
    `Tempo: ${beat.bpm}`,
    `Downloaded: ${new Date().toISOString()}`,
    '',
    'This beat is provided for free use by Kentbeats.',
    'Credit format: Prod. by Kentbeats',
    'For exclusive licensing inquiries, contact Kentbeats directly.',
  ].join('\n');
}

function triggerDownload(filename, content) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function previewBeat(beatName) {
  const beat = BEATS_DATA.find(item => item.name === beatName);
  if (!beat) return;

  document.dispatchEvent(new CustomEvent('beat:selected', { detail: beat }));
}

function downloadBeat(beatName, options = {}) {
  const beat = BEATS_DATA.find(item => item.name === beatName);
  if (!beat) return;

  const filename = `${getBeatFileName(beat)}-license.txt`;
  triggerDownload(filename, buildLicenseText(beat));

  if (!options.silent && typeof showToast === 'function') {
    showToast(`${beat.name} downloaded`);
  }
}

window.previewBeat = previewBeat;
window.downloadBeat = downloadBeat;

function renderBeats(list) {
  beatsGrid.innerHTML = '';

  list.forEach(b => {
    const card = document.createElement('div');
    card.className = 'beat-card';
    card.innerHTML = `
      ${b.badge ? `<div class="beat-badge">${b.badge}</div>` : ''}
      <div class="beat-thumb">
        <div class="beat-thumb-bg ${b.g}"></div>
        <div class="beat-icon">${b.emoji}</div>
        <div class="beat-play-btn"><div class="play-circle">▶</div></div>
      </div>
      <div class="beat-info">
        <div class="beat-genre">${b.genre}</div>
        <div class="beat-name">${b.name}</div>
        <div class="beat-bpm">${b.bpm}</div>
        <div class="beat-footer">
          <div class="beat-price">${b.price}</div>
          <button
            class="cart-add-btn"
            data-action="cart"
            data-name="${b.name}"
            data-genre="${b.genre}"
            data-price="${b.price}"
            data-emoji="${b.emoji}">
            + Cart
          </button>
          <button class="dl-btn" data-action="download" data-name="${b.name}">⬇ Download</button>
        </div>
      </div>`;
    beatsGrid.appendChild(card);
  });

  // Re-attach cart listeners after render
  document.querySelectorAll('.cart-add-btn').forEach(btn => {
    btn.addEventListener('click', () => addToCart({
      name:  btn.dataset.name,
      genre: btn.dataset.genre,
      price: btn.dataset.price,
      emoji: btn.dataset.emoji,
    }));
  });

  document.querySelectorAll('.dl-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      downloadBeat(btn.dataset.name);
    });
  });

  document.querySelectorAll('.beat-play-btn').forEach((btn, idx) => {
    btn.addEventListener('click', () => {
      const beat = list[idx];
      previewBeat(beat.name);
    });
  });

  document.getElementById('countNum').textContent = list.length;
}

// Initial render
renderBeats(BEATS_DATA);

document.addEventListener('beats:data-updated', () => {
  if (typeof applySearch === 'function') {
    applySearch();
    return;
  }
  renderBeats(BEATS_DATA);
});

document.getElementById('navGetStarted')?.addEventListener('click', () => {
  document.getElementById('beats')?.scrollIntoView({ behavior: 'smooth' });
});

document.getElementById('previewPackBtn')?.addEventListener('click', () => {
  ['Midnight Frequencies', 'Lagos Nights', 'Cold Streets'].forEach(name => {
    const beat = BEATS_DATA.find(item => item.name === name);
    if (beat && typeof addToCart === 'function') {
      addToCart(beat);
    }
  });
  if (typeof openCart === 'function') {
    openCart();
  }
});

const footerYear = document.getElementById('footerYear');
if (footerYear) {
  footerYear.textContent = String(new Date().getFullYear());
}
