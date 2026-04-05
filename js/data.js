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

const CARD_GRADIENTS = ['g1', 'g2', 'g3', 'g4', 'g5', 'g6'];

function normalizeGenre(genre) {
  const value = String(genre || '').toLowerCase();

  if (value.includes('afro')) return 'Afrobeats';
  if (value.includes('drill')) return 'Drill';
  if (value.includes('r&b') || value.includes('soul')) return 'R&B';
  if (value.includes('trap') || value.includes('hip-hop') || value.includes('hip hop')) return 'Trap';
  if (value.includes('amapiano')) return 'Amapiano';
  if (value.includes('lo-fi') || value.includes('lofi')) return 'Lo-Fi';
  return 'Trap';
}

function genreEmoji(genre) {
  const mapping = {
    Trap: '🔥',
    Afrobeats: '🌍',
    Drill: '💥',
    'R&B': '💙',
    Amapiano: '🎹',
    'Lo-Fi': '🌙',
  };

  return mapping[genre] || '🎵';
}

function mapItunesResult(track, index) {
  const genre = normalizeGenre(track.primaryGenreName);
  const tempo = 86 + ((index * 7) % 70);

  return normalizeBeat({
    name: track.trackName || 'Untitled Beat',
    bpm: `${tempo} BPM`,
    genre,
    price: 'FREE',
    emoji: genreEmoji(genre),
    g: CARD_GRADIENTS[index % CARD_GRADIENTS.length],
    badge: 'LIVE',
    streamUrl: track.previewUrl || '',
    downloadUrl: track.previewUrl || '',
  });
}

async function fetchCustomSource(url) {
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`Custom API failed with ${response.status}`);
  }

  const payload = await response.json();
  if (!isValidBeatArray(payload)) {
    throw new Error('Custom API returned invalid beat array');
  }

  return payload.map(normalizeBeat);
}

async function fetchItunesSource(config) {
  const term = encodeURIComponent(config.term || 'music');
  const country = (config.country || 'US').toUpperCase();
  const limit = Math.min(Number(config.limit) || 24, 50);
  const url = `https://itunes.apple.com/search?term=${term}&entity=song&country=${country}&limit=${limit}`;

  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`iTunes API failed with ${response.status}`);
  }

  const payload = await response.json();
  const tracks = Array.isArray(payload.results) ? payload.results : [];
  const usableTracks = tracks.filter(track => Boolean(track.previewUrl));

  if (!usableTracks.length) {
    throw new Error('iTunes API returned no playable tracks');
  }

  return usableTracks.map(mapItunesResult);
}

async function fetchFromSource(source) {
  if (!source || !source.type) {
    throw new Error('Invalid API source configuration');
  }

  if (source.type === 'custom') {
    return fetchCustomSource(source.url || 'api/beats.json');
  }

  if (source.type === 'itunes') {
    return fetchItunesSource(source);
  }

  throw new Error(`Unsupported source type: ${source.type}`);
}

async function loadBeatsFromApi() {
  const config = window.KENTBEATS_API_CONFIG || {
    primary: { type: 'custom', url: 'api/beats.json' },
    backups: [],
  };

  const sources = [config.primary, ...(config.backups || [])].filter(Boolean);
  const errors = [];

  for (const source of sources) {
    try {
      const beats = await fetchFromSource(source);
      BEATS_DATA = beats;

      document.dispatchEvent(new CustomEvent('beats:data-updated', {
        detail: {
          source: source.type,
          count: BEATS_DATA.length,
        }
      }));
      return;
    } catch (error) {
      errors.push(`${source.type}: ${error.message}`);
    }
  }

  console.warn('Using fallback beats data:', errors.join(' | '));
  document.dispatchEvent(new CustomEvent('beats:data-fallback', {
    detail: {
      source: 'fallback',
      count: BEATS_DATA.length,
      errors,
    }
  }));
}

window.loadBeatsFromApi = loadBeatsFromApi;
loadBeatsFromApi();
