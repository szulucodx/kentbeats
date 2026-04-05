# Kentbeats

A static music showcase website for free beat discovery and instant downloads.

## What is now functional

- Search by name, genre, and BPM
- Genre chip filtering synced with search filters
- Beat preview selection in the player
- Cart with localStorage persistence
- Checkout validation (name + email)
- Real file downloads (license text per selected beat)
- API-based beat catalog loading with fallback data

## Connect real APIs

The app now uses `window.KENTBEATS_API_CONFIG` in `js/api.js` with:

- Primary source
- Backup sources

Example:

```js
window.KENTBEATS_API_CONFIG = {
	primary: {
		type: 'custom',
		url: 'https://api.yourdomain.com/beats'
	},
	backups: [
		{
			type: 'itunes',
			term: 'afrobeats trap drill',
			country: 'US',
			limit: 24
		}
	]
};
```

Supported source types:

- `custom` (your own endpoint returning beat array)
- `itunes` (public iTunes search API)

Expected JSON response is an array of beat objects:

```json
[
	{
		"name": "Midnight Frequencies",
		"bpm": "140 BPM",
		"genre": "Trap",
		"price": "FREE",
		"emoji": "🌙",
		"g": "g1",
		"badge": "NEW",
		"streamUrl": "https://cdn.yourdomain.com/audio/midnight-frequencies.mp3",
		"downloadUrl": "https://cdn.yourdomain.com/audio/midnight-frequencies.mp3"
	}
]
```

If all APIs fail, the app automatically falls back to local default data.

## Publish on GitHub Pages (Windows)

Since Git is installed at `C:\\Program Files\\Git\\bin\\git.exe`, use these commands in PowerShell:

```powershell
Set-Location "c:\Users\stephen\Downloads\kentbeats (1)\kentbeats"
& "C:\Program Files\Git\bin\git.exe" init
& "C:\Program Files\Git\bin\git.exe" add .
& "C:\Program Files\Git\bin\git.exe" commit -m "feat: production-ready kentbeats site"
& "C:\Program Files\Git\bin\git.exe" branch -M main
& "C:\Program Files\Git\bin\git.exe" remote add origin https://github.com/<your-username>/<your-repo>.git
& "C:\Program Files\Git\bin\git.exe" push -u origin main
```

Then on GitHub:

1. Open your repository.
2. Go to Settings > Pages.
3. Under Build and deployment, set Source to Deploy from a branch.
4. Select branch `main` and folder `/ (root)`.
5. Save.

Your website will be live at:

`https://<your-username>.github.io/<your-repo>/`

## Local preview

Open `index.html` directly, or use any local static server.
