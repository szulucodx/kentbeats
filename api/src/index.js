/**
 * Kentbeats API - Cloudflare Worker
 * YouTube search and metadata endpoints
 */

import {
  searchYouTubeVideos,
  getYouTubeVideoDetails,
} from './youtube.js';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  });
}

function ok(data, meta = null) {
  const body = { success: true, data };
  if (meta && Object.keys(meta).length) body.meta = meta;
  return json(body);
}

function err(message, status = 400, code = 'ERROR') {
  return json({ success: false, error: { code, message } }, status);
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);
    const path = url.pathname;
    const params = url.searchParams;

    try {
      if (path === '/' || path === '/api') {
        return ok({
          name: 'Kentbeats API',
          version: '1.0.0',
          endpoints: {
            youtubeSearch: 'GET /api/youtube/search?q=query&region=US&maxResults=20',
            youtubeVideo: 'GET /api/youtube/video?id=VIDEO_ID',
          },
        });
      }

      if (path === '/api/youtube/search') {
        const q = params.get('q');
        if (!q) return err('Missing query param: q', 400, 'MISSING_PARAM');

        const region = params.get('region') || 'US';
        const maxResults = params.get('maxResults') || '20';
        const data = await searchYouTubeVideos({
          q,
          regionCode: region,
          maxResults,
          env,
        });

        return ok(data, { total: data.length, source: 'youtube' });
      }

      if (path === '/api/youtube/video') {
        const id = params.get('id');
        if (!id) return err('Missing id param', 400, 'MISSING_PARAM');

        const data = await getYouTubeVideoDetails({ id, env });
        return ok(data, { source: 'youtube' });
      }

      return err('Not found', 404, 'NOT_FOUND');
    } catch (e) {
      return err(e.message || 'Internal error', 500, 'INTERNAL_ERROR');
    }
  },
};
