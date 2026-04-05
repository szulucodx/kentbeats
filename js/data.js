// =============================================
// data.js — Beats data + API loader
// =============================================

let BEATS_DATA = [
  { name: 'Midnight Frequencies', bpm: '140 BPM', genre: 'Trap',      price: 'FREE', emoji: '🌙', g: 'g1', badge: 'NEW' },
  { name: 'Lagos Nights',          bpm: '112 BPM', genre: 'Afrobeats', price: 'FREE', emoji: '🌍', g: 'g2' },
  { name: 'Cold Streets',          bpm: '135 BPM', genre: 'Drill',     price: 'FREE', emoji: '❄️', g: 'g3', badge: 'HOT' },
  { name: 'Velvet Soul',           bpm: '90 BPM',  genre: 'R&B',       price: 'FREE', emoji: '💙', g: 'g4' },
  { name: 'Thunder Wave',          bpm: '145 BPM', genre: 'Trap',      price: 'FREE', emoji: '⚡', g: 'g5', badge: 'EXCLUSIVE' },
  { name: 'Johannesburg',          bpm: '118 BPM', genre: 'Amapiano',  price: 'FREE', emoji: '🎹', g: 'g6' },
  { name: 'Ghost Protocol',        bpm: '138 BPM', genre: 'Drill',     price: 'FREE', emoji: '👻', g: 'g1', badge: 'NEW' },
  { name: 'Afro Carnival',         bpm: '105 BPM', genre: 'Afrobeats', price: 'FREE', emoji: '🥁', g: 'g2' },
  { name: 'Blue Flame',            bpm: '93 BPM',  genre: 'R&B',       price: 'FREE', emoji: '🔥', g: 'g3' },
  { name: 'Street Gospel',         bpm: '88 BPM',  genre: 'Boom Bap',  price: 'FREE', emoji: '🎤', g: 'g4', badge: 'HOT' },
  { name: 'Neon Rush',             bpm: '150 BPM', genre: 'Trap',      price: 'FREE', emoji: '🌀', g: 'g5' },
  { name: 'Sunset Drive',          bpm: '96 BPM',  genre: 'Lo-Fi',     price: 'FREE', emoji: '🌅', g: 'g6' },
];

function normalizeBeat(beat) {
  return {
    name: beat.name || 'Untitled Beat',
    bpm: beat.bpm || '120 BPM',
    genre: beat.genre || 'Trap',
    price: beat.price || 'FREE',
    emoji: beat.emoji || '🎵',
    g: beat.g || 'g1',
    badge: beat.badge || '',
  };
}

function isValidBeatArray(payload) {
  return Array.isArray(payload) && payload.length > 0;
}

async function loadBeatsFromApi() {
  const apiUrl = window.KENTBEATS_API_URL || 'api/beats.json';

  try {
    const response = await fetch(apiUrl, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const payload = await response.json();
    if (!isValidBeatArray(payload)) {
      throw new Error('API payload is not a non-empty array');
    }

    BEATS_DATA = payload.map(normalizeBeat);
    document.dispatchEvent(new CustomEvent('beats:data-updated', {
      detail: { source: apiUrl, count: BEATS_DATA.length }
    }));
  } catch (error) {
    console.warn('Using fallback beats data:', error.message);
    document.dispatchEvent(new CustomEvent('beats:data-fallback', {
      detail: { source: apiUrl, count: BEATS_DATA.length }
    }));
  }
}

window.loadBeatsFromApi = loadBeatsFromApi;
loadBeatsFromApi();
