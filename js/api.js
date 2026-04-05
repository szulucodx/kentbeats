// =============================================
// api.js — API endpoint configuration
// =============================================

// Replace these values with your real backend providers when ready.
window.KENTBEATS_API_CONFIG = {
	// Primary source: your own API or local JSON
	primary: {
		type: 'custom',
		url: 'api/beats.json',
	},

	// Backup sources if primary fails
	backups: [
		{
			type: 'youtube-worker',
			url: '/api/youtube/search',
			q: 'afrobeats trap drill amapiano',
			region: 'US',
			maxResults: 20,
		},
		{
			type: 'itunes',
			term: 'afrobeats trap drill',
			country: 'US',
			limit: 24,
		},
	],
};
