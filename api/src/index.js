/**
 * Emnex Music API - Cloudflare Worker
 * Tubidy: search, download, trending, categories
 * Clean JSON responses
 */

import {
  searchTubidy,
  searchTubidyExpanded,
  getTubidySongDetails,
  getTubidyTrending,
  getTubidyTopSearch,
  getTubidyCategories,
  getTubidyCategory,
} from './tubidy.js';
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
  async fetch(request, env, ctx) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);
    const path = url.pathname;
    const params = url.searchParams;

    try {
      // GET / - API info
      if (path === '/' || path === '/api') {
        return ok({
          name: 'Emnex Music API',
          version: '1.0.0',
          endpoints: {
            search: 'GET /api/search?q=query&page=1 (pages 1–3 merged per request, ~18 results)',
            searchWithDownloads: 'GET /api/search?q=query&downloads=1',
            song: 'GET /api/song?url=...',
            download: 'GET /api/download?url=...',
            stream: 'GET /api/stream?url=...&filename=... (proxy download)',
            trending: 'GET /api/trending',
            category: 'GET /api/category?name=pop',
            topSearch: 'GET /api/top-search',
            categories: 'GET /api/categories',
            youtubeSearch: 'GET /api/youtube/search?q=query&region=US&maxResults=20',
            youtubeVideo: 'GET /api/youtube/video?id=VIDEO_ID',
          },
        });
      }

      // GET /api/youtube/search?q=query&region=US&maxResults=20
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

      // GET /api/youtube/video?id=VIDEO_ID
      if (path === '/api/youtube/video') {
        const id = params.get('id');
        if (!id) return err('Missing id param', 400, 'MISSING_PARAM');

        const data = await getYouTubeVideoDetails({ id, env });
        return ok(data, { source: 'youtube' });
      }

      // GET /api/search?q=query&page=1
      // Tubidy returns ~6 per query; we use multiple query variations to get more results
      if (path === '/api/search') {
        const q = params.get('q');
        if (!q) return err('Missing query param: q', 400, 'MISSING_PARAM');

        const page = Math.max(1, parseInt(params.get('page') || '1', 10));
        const includeDownloads = params.get('downloads') === '1' || params.get('downloads') === 'true';

        // Multi-query search: "query", "query mix", "query 2024", etc. - each returns different results
        const results = await searchTubidyExpanded(q, page);

        if (includeDownloads && results.length > 0) {
          const withDownloads = await Promise.all(
            results.slice(0, 5).map(async (r) => {
              try {
                const details = await getTubidySongDetails(r.watchUrlMp3);
                return { ...r, downloads: details.downloads };
              } catch {
                return { ...r, downloads: [] };
              }
            }),
          );
          return ok(withDownloads, { total: results.length });
        }

        return ok(results, { total: results.length });
      }

      // GET /api/song?url=...
      if (path === '/api/song') {
        const songUrl = params.get('url');
        if (!songUrl) return err('Missing url param', 400, 'MISSING_PARAM');
        const details = await getTubidySongDetails(songUrl);
        const song = {
          title: details.title,
          duration: details.duration,
          artist: details.artist,
          song: details.song,
          downloads: details.downloads,
          primaryDownload: details.primaryDownload,
          previewUrl: details.previewUrl || null,
          previewType: details.previewType || null,
        };
        return ok(song);
      }

      // GET /api/download?url=...
      if (path === '/api/download') {
        const tubidyUrl = params.get('url');
        if (!tubidyUrl) return err('Missing url param', 400, 'MISSING_PARAM');
        const details = await getTubidySongDetails(tubidyUrl);
        const song = {
          title: details.title,
          duration: details.duration,
          artist: details.artist,
          song: details.song,
          downloads: details.downloads,
          primaryDownload: details.primaryDownload,
        };
        return ok(song);
      }

      // GET /api/stream?url=... - proxy download (streams file so user gets direct download, no Tubidy redirect)
      if (path === '/api/stream') {
        const fileUrl = params.get('url');
        if (!fileUrl) return err('Missing url param', 400, 'MISSING_PARAM');
        const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36';
        let res = await fetch(fileUrl, {
          method: 'GET',
          redirect: 'follow',
          headers: { 'User-Agent': ua },
        });
        if (!res.ok) return err('Download failed', res.status, 'DOWNLOAD_FAILED');

        const htmlPatterns = [
          /href=["']([^"']*\.(?:mp3|mp4|m4a)(?:\?[^"']*)?)["']/i,
          /href=["'](https?:\/\/[^"']+\.(?:mp3|mp4|m4a)[^"']*)["']/i,
          /href=["'](https?:\/\/[^"']*d2mefast[^"']*c\.php[^"']*)["']/i,
          /href=["'](https?:\/\/[^"']*d2mefast[^"']*p\.php[^"']*)["']/i,
          /href=["'](https?:\/\/[^"']+c\.php\?s=[^"']+)["']/i,
          /window\.location\s*=\s*["']([^"']+)["']/i,
          /content=["'][^;]*;\s*url=([^"']+)["']/i,
        ];
        let lastUrl = fileUrl;
        while (res.headers.get('Content-Type')?.includes('text/html')) {
          const html = await res.text();
          const directMatch = htmlPatterns.reduce((m, re) => m || html.match(re), null);
          if (directMatch) {
            let target = directMatch[1].replace(/&amp;/g, '&');
            if (!target.startsWith('http')) target = new URL(target, lastUrl).href;
            lastUrl = target;
            res = await fetch(target, { method: 'GET', redirect: 'follow', headers: { 'User-Agent': ua } });
            if (!res.ok) return err('Download failed', res.status, 'DOWNLOAD_FAILED');
          } else {
            return err('Could not extract download URL from page', 502, 'NO_DIRECT_LINK');
          }
        }

        const ext = (res.headers.get('Content-Type') || '').includes('video') ? '.mp4' : '.mp3';
        const filename = (params.get('filename') || 'download') + ext;
        const isPreview = params.get('preview') === '1' || params.get('preview') === 'true';
        const disposition = isPreview ? 'inline' : `attachment; filename="${filename}"`;
        return new Response(res.body, {
          status: 200,
          headers: {
            ...corsHeaders,
            'Content-Type': res.headers.get('Content-Type') || 'audio/mpeg',
            'Content-Disposition': disposition,
          },
        });
      }

      // GET /api/trending
      if (path === '/api/trending') {
        const category = params.get('category');
        const results = await getTubidyTrending(category || null);
        return ok(results, { total: results.length });
      }

      // GET /api/category?name=pop
      if (path === '/api/category') {
        const name = params.get('name');
        if (!name) return err('Missing name param', 400, 'MISSING_PARAM');
        const results = await getTubidyCategory(name);
        return ok(results, { total: results.length });
      }

      // GET /api/top-search
      if (path === '/api/top-search') {
        const results = await getTubidyTopSearch();
        return ok(results, { total: results.length });
      }

      // GET /api/categories
      if (path === '/api/categories') {
        const results = await getTubidyCategories();
        return ok(results, { total: results.length });
      }

      return err('Not found', 404, 'NOT_FOUND');
    } catch (e) {
      console.error(e);
      return err(e.message || 'Internal error', 500, 'INTERNAL_ERROR');
    }
  },
};
