function getCookie(name) {
	const value = `; ${document.cookie}`;
	const parts = value.split(`; ${name}=`);
	if (parts.length === 2) return parts.pop().split(';').shift();
}

class SpotifyAPI {
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

async function render(tracks) {
	let getX = track => track.features.energy;
	let getY = track => track.features.acousticness;

	let xValues = tracks.map(getX);
	let yValues = tracks.map(getY);

	var width = window.innerWidth, height = window.innerHeight;
	var colorScale = ['orange', 'lightblue', '#B19CD9'];

	let xScale = d3.scaleLinear()
		.domain([Math.min(...xValues), Math.max(...xValues)])
		.range([0, width - 100])

	let yScale = d3.scaleLinear()
		.domain([Math.min(...yValues), Math.max(...yValues)])
		.range([0, height - 100]);

	let songinfo = d3.select('body')
		.append('div')
		.attr('class', 'songinfo')
		.style('opacity', 0);

	d3.select('svg')
		.attr('width', width)
		.attr('height', height);

	d3.select('svg g')
		.selectAll('circle')
		.data(tracks)
		.join('circle')
		.attr('r', 5)
		.attr('cx', d => xScale(getX(d)))
		.attr('cy', d => yScale(getY(d)))
		.on('mouseover', function(e, d) {
			d3.select(this).transition().duration(100).style("fill", "red");
			
			songinfo.html(d.name + " by " + d.artists.map(artist => artist.name).join(", "))
				.style('left', (e.pageX + 10) + "px")
				.style('top', (e.pageY - 15) + "px");
			songinfo.transition().duration(100).style('opacity', 1);
		}).on("mouseout", function(d) {
			d3.select(this).transition().duration(200).style("fill", "black");

			songinfo.transition().duration(200).style('opacity', 0);
		});
}

let token = getCookie('access_token');
if (!token) {
	window.location.replace("/");
}
let spotify = new SpotifyAPI(token);

(async () => {
	let tracks = await spotify.getTracksWithFeaturesCached();
	console.log(tracks);

	let data = tracks.map(t => {
		return {
			name: t.track.name,
			artists: t.track.artists,
			features: t.features,
			duration: t.track.duration_ms,
			popularity: t.track.popularity
		}
	});

	render(data);
})();



