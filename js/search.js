// =============================================
// search.js — Search & filter functionality
// =============================================

const searchInput = document.getElementById('searchInput');
let activeFilter = 'all';

function setActiveFilter(filter) {
  activeFilter = filter;
  document.querySelectorAll('.search-filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === filter);
  });
}

function applySearch() {
  const query = searchInput.value.toLowerCase().trim();

  const filtered = BEATS_DATA.filter(b => {
    const matchGenre = activeFilter === 'all' || b.genre === activeFilter;
    const matchQuery = !query
      || b.name.toLowerCase().includes(query)
      || b.genre.toLowerCase().includes(query)
      || b.bpm.toLowerCase().includes(query);
    return matchGenre && matchQuery;
  });

  renderBeats(filtered);
}

window.applySearch = applySearch;

function setGenreFilter(filter) {
  setActiveFilter(filter);
  applySearch();
}

window.setGenreFilter = setGenreFilter;

// Live search as user types
searchInput.addEventListener('input', applySearch);

// Search button click
document.querySelector('.search-go').addEventListener('click', applySearch);

// Filter buttons
document.querySelectorAll('.search-filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    setActiveFilter(btn.dataset.filter);
    applySearch();
  });
});

document.addEventListener('beats:data-updated', applySearch);
