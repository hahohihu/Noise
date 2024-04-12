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
}

let token = getCookie('access_token');
if (!token) {
	window.location.replace("/");
}
let spotify = new SpotifyAPI(token);

(async () => {
	let me = await spotify.get('/me');
	console.log(me);
	document.getElementById('filler').innerText = "Hello, " + me.display_name + "!";
})();

(async () => {
	let tracks = await spotify.getSavedTracksCached();
	console.log(tracks);

	let data = tracks.map(t => {
		return {
			name: t.track.name,
			artists: t.track.artists,
			duration: t.track.duration_ms,
			popularity: t.track.popularity
		}
	});
	let durations = data.map(t => t.duration);
	let popularities = data.map(t => t.popularity);

	var width = 600, height = 400;
	var colorScale = ['orange', 'lightblue', '#B19CD9'];

	let durScale = d3.scaleLinear()
		.domain([Math.min(...durations), Math.max(...durations)])
		.range([0, width])

	let popScale = d3.scaleLinear()
		.domain([Math.min(...popularities), Math.max(...popularities)])
		.range([0, height]);

	d3.select('svg g')
		.selectAll('circle')
		.data(data)
		.join('circle')
		.attr('r', 3)
		.attr('cx', d => durScale(d.duration))
		.attr('cy', d => popScale(d.popularity))
		.on('mouseover', function(d) {
			d3.select(this).style("fill", "red");
		}).on("mouseout", function(d) {
			d3.select(this).style("fill", "black");
		});
})();



