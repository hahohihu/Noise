export class SpotifyAPI {
	constructor(access_token) {
		this.access_token = access_token;
	}

	async request(path, method = 'GET') {
		let res = await fetch(path, {
			method: method,
			headers: {
				'Authorization': 'Bearer ' + this.access_token
			}
		});
		return await res.json();
	}

	get(path) {
		return this.request('https://api.spotify.com/v1' + path);
	}

	async getSavedTracks() {
		let tracks = [];
		let next = 'https://api.spotify.com/v1/me/tracks?limit=50';
		do {
			let new_tracks = await this.request(next);
			tracks.push(...new_tracks.items);
			next = new_tracks.next;
		} while (next);
		return tracks;
	}

	async getSavedTracksCached() {
		let tracks;
		try {
			tracks = JSON.parse(localStorage.getItem('tracks'));
			if (tracks && Array.isArray(tracks)) {
				return tracks;
			}
		} catch (e) { }

		tracks = await spotify.getSavedTracks();
		localStorage.setItem('tracks', JSON.stringify(tracks));
		return tracks;
	}
	
	async addFeatures(tracks) {
		let base_url = 'https://api.spotify.com/v1/audio-features?ids=';
		for (let i = 0; i < tracks.length; i += 100) {
			let ids = tracks.map(t => t.track.id).slice(i, i + 100);
			let features = await this.request(base_url + ids.join(','));
			features = features.audio_features;
			for (let j = 0; j < features.length; j++) {
				tracks[i + j].features = features[j];
			}
		}
	}

	async getTracksWithFeaturesCached() {
		let tracks = await this.getSavedTracksCached();
		if (tracks.length > 0 && !tracks[0].features) {
			await this.addFeatures(tracks);
			localStorage.setItem('tracks', JSON.stringify(tracks));
		}
		return tracks;
	}
}
