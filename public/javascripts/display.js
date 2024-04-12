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

	var width = window.innerWidth, height = window.innerHeight;
	var colorScale = ['orange', 'lightblue', '#B19CD9'];

	let durScale = d3.scaleLinear()
		.domain([Math.min(...durations), Math.max(...durations)])
		.range([0, width - 100])

	let popScale = d3.scaleLinear()
		.domain([Math.min(...popularities), Math.max(...popularities)])
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
		.data(data)
		.join('circle')
		.attr('r', 5)
		.attr('cx', d => durScale(d.duration))
		.attr('cy', d => popScale(d.popularity))
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
})();



