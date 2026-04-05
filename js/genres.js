// =============================================
// genres.js — Genre chip filter
// =============================================

function chipTextToGenre(text) {
  const normalized = text.replace(/[^a-zA-Z&\s]/g, '').trim().toLowerCase();

  if (normalized === 'all beats') return 'all';
  if (normalized.includes('trap')) return 'Trap';
  if (normalized.includes('afrobeats')) return 'Afrobeats';
  if (normalized.includes('drill')) return 'Drill';
  if (normalized.includes('r&b')) return 'R&B';
  return 'all';
}

document.querySelectorAll('.genre-chip').forEach(chip => {
  chip.addEventListener('click', () => {
    document.querySelectorAll('.genre-chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');

    const genre = chipTextToGenre(chip.textContent || '');
    if (typeof setGenreFilter === 'function') {
      setGenreFilter(genre);
    }

    document.getElementById('beats')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});
