// =============================================
// api.js — API endpoint configuration
// =============================================

// Replace these values with your real backend providers when ready.
const workerBaseUrl = (window.KENTBEATS_WORKER_BASE_URL || '').replace(/\/$/, '');
const youtubeSearchUrl = workerBaseUrl ? `${workerBaseUrl}/api/youtube/search` : '';

window.KENTBEATS_API_CONFIG = {
	// Primary source: your own API or local JSON
	primary: {
		type: 'custom',
		url: 'api/beats.json',
	},

	// Backup sources if primary fails
	backups: [
		...(youtubeSearchUrl
			? [{
				type: 'youtube-worker',
				url: youtubeSearchUrl,
				q: 'afrobeats trap drill amapiano',
				region: 'US',
				maxResults: 20,
			}]
			: []),
		{
			type: 'itunes',
			term: 'afrobeats trap drill',
			country: 'US',
			limit: 24,
		},
	],
};
