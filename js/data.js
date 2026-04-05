// =============================================
// data.js — Beats data + API loader
// =============================================

let BEATS_DATA = [
  { name: 'Midnight Frequencies', bpm: '140 BPM', genre: 'Trap',      price: 'FREE', emoji: '🌙', g: 'g1', badge: 'NEW', streamUrl: 'https://samplelib.com/lib/preview/mp3/sample-3s.mp3', downloadUrl: 'https://samplelib.com/lib/preview/mp3/sample-3s.mp3' },
  { name: 'Lagos Nights',          bpm: '112 BPM', genre: 'Afrobeats', price: 'FREE', emoji: '🌍', g: 'g2', streamUrl: 'https://samplelib.com/lib/preview/mp3/sample-6s.mp3', downloadUrl: 'https://samplelib.com/lib/preview/mp3/sample-6s.mp3' },
  { name: 'Cold Streets',          bpm: '135 BPM', genre: 'Drill',     price: 'FREE', emoji: '❄️', g: 'g3', badge: 'HOT', streamUrl: 'https://samplelib.com/lib/preview/mp3/sample-9s.mp3', downloadUrl: 'https://samplelib.com/lib/preview/mp3/sample-9s.mp3' },
  { name: 'Velvet Soul',           bpm: '90 BPM',  genre: 'R&B',       price: 'FREE', emoji: '💙', g: 'g4', streamUrl: 'https://samplelib.com/lib/preview/mp3/sample-12s.mp3', downloadUrl: 'https://samplelib.com/lib/preview/mp3/sample-12s.mp3' },
  { name: 'Thunder Wave',          bpm: '145 BPM', genre: 'Trap',      price: 'FREE', emoji: '⚡', g: 'g5', badge: 'EXCLUSIVE', streamUrl: 'https://samplelib.com/lib/preview/mp3/sample-15s.mp3', downloadUrl: 'https://samplelib.com/lib/preview/mp3/sample-15s.mp3' },
  { name: 'Johannesburg',          bpm: '118 BPM', genre: 'Amapiano',  price: 'FREE', emoji: '🎹', g: 'g6', streamUrl: 'https://samplelib.com/lib/preview/mp3/sample-3s.mp3', downloadUrl: 'https://samplelib.com/lib/preview/mp3/sample-3s.mp3' },
  { name: 'Ghost Protocol',        bpm: '138 BPM', genre: 'Drill',     price: 'FREE', emoji: '👻', g: 'g1', badge: 'NEW', streamUrl: 'https://samplelib.com/lib/preview/mp3/sample-6s.mp3', downloadUrl: 'https://samplelib.com/lib/preview/mp3/sample-6s.mp3' },
  { name: 'Afro Carnival',         bpm: '105 BPM', genre: 'Afrobeats', price: 'FREE', emoji: '🥁', g: 'g2', streamUrl: 'https://samplelib.com/lib/preview/mp3/sample-9s.mp3', downloadUrl: 'https://samplelib.com/lib/preview/mp3/sample-9s.mp3' },
  { name: 'Blue Flame',            bpm: '93 BPM',  genre: 'R&B',       price: 'FREE', emoji: '🔥', g: 'g3', streamUrl: 'https://samplelib.com/lib/preview/mp3/sample-12s.mp3', downloadUrl: 'https://samplelib.com/lib/preview/mp3/sample-12s.mp3' },
  { name: 'Street Gospel',         bpm: '88 BPM',  genre: 'Boom Bap',  price: 'FREE', emoji: '🎤', g: 'g4', badge: 'HOT', streamUrl: 'https://samplelib.com/lib/preview/mp3/sample-15s.mp3', downloadUrl: 'https://samplelib.com/lib/preview/mp3/sample-15s.mp3' },
  { name: 'Neon Rush',             bpm: '150 BPM', genre: 'Trap',      price: 'FREE', emoji: '🌀', g: 'g5', streamUrl: 'https://samplelib.com/lib/preview/mp3/sample-3s.mp3', downloadUrl: 'https://samplelib.com/lib/preview/mp3/sample-3s.mp3' },
  { name: 'Sunset Drive',          bpm: '96 BPM',  genre: 'Lo-Fi',     price: 'FREE', emoji: '🌅', g: 'g6', streamUrl: 'https://samplelib.com/lib/preview/mp3/sample-6s.mp3', downloadUrl: 'https://samplelib.com/lib/preview/mp3/sample-6s.mp3' },
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
    streamUrl: beat.streamUrl || '',
    downloadUrl: beat.downloadUrl || beat.streamUrl || '',
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
