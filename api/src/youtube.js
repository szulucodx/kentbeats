const YOUTUBE_BASE = 'https://www.googleapis.com/youtube/v3';

function requireApiKey(env) {
  const key = env?.YOUTUBE_API_KEY;
  if (!key) {
    throw new Error('Missing YOUTUBE_API_KEY in worker environment');
  }
  return key;
}

function toIsoCountry(value) {
  const country = String(value || 'US').toUpperCase();
  return /^[A-Z]{2}$/.test(country) ? country : 'US';
}

function mapYouTubeSearchItem(item) {
  return {
    videoId: item.id?.videoId,
    title: item.snippet?.title || 'Untitled',
    description: item.snippet?.description || '',
    channelTitle: item.snippet?.channelTitle || 'Unknown Artist',
    publishedAt: item.snippet?.publishedAt || null,
    thumbnails: item.snippet?.thumbnails || {},
    watchUrl: `https://www.youtube.com/watch?v=${item.id?.videoId}`,
    embedUrl: `https://www.youtube.com/embed/${item.id?.videoId}`,
  };
}

export async function searchYouTubeVideos({ q, regionCode = 'US', maxResults = 20, env }) {
  const apiKey = requireApiKey(env);
  const country = toIsoCountry(regionCode);
  const limit = Math.min(Math.max(Number(maxResults) || 20, 1), 50);

  const url = new URL(`${YOUTUBE_BASE}/search`);
  url.searchParams.set('part', 'snippet');
  url.searchParams.set('type', 'video');
  url.searchParams.set('q', q);
  url.searchParams.set('maxResults', String(limit));
  url.searchParams.set('regionCode', country);
  url.searchParams.set('videoEmbeddable', 'true');
  url.searchParams.set('key', apiKey);

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`YouTube search failed with ${response.status}`);
  }

  const payload = await response.json();
  const items = Array.isArray(payload.items) ? payload.items : [];
  return items.filter(item => item.id?.videoId).map(mapYouTubeSearchItem);
}

export async function getYouTubeVideoDetails({ id, env }) {
  const apiKey = requireApiKey(env);

  const url = new URL(`${YOUTUBE_BASE}/videos`);
  url.searchParams.set('part', 'snippet,contentDetails,statistics');
  url.searchParams.set('id', id);
  url.searchParams.set('key', apiKey);

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`YouTube video details failed with ${response.status}`);
  }

  const payload = await response.json();
  const item = Array.isArray(payload.items) ? payload.items[0] : null;
  if (!item) {
    throw new Error('Video not found');
  }

  return {
    videoId: item.id,
    title: item.snippet?.title || 'Untitled',
    description: item.snippet?.description || '',
    channelTitle: item.snippet?.channelTitle || 'Unknown Artist',
    publishedAt: item.snippet?.publishedAt || null,
    duration: item.contentDetails?.duration || null,
    viewCount: item.statistics?.viewCount || null,
    likeCount: item.statistics?.likeCount || null,
    thumbnails: item.snippet?.thumbnails || {},
    watchUrl: `https://www.youtube.com/watch?v=${item.id}`,
    embedUrl: `https://www.youtube.com/embed/${item.id}`,
  };
}