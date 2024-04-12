function getCookie(name) {
	const value = `; ${document.cookie}`;
	const parts = value.split(`; ${name}=`);
	if (parts.length === 2) return parts.pop().split(';').shift();
}

class SpotifyAPI {
	constructor(access_token) {
		this.access_token = access_token;
	}

	async request(path, method='GET') {
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
		} catch (e) {}
	
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
	document.getElementById('filler').innerText = "Hello, " + me.display_name + "!";
})();

(async () => {
	let tracks = await spotify.getSavedTracksCached();
	console.log(tracks);
})();

var width = 600, height = 400;

var colorScale = ['orange', 'lightblue', '#B19CD9'];
var xCenter = [100, 300, 500];

var numNodes = 100;
var nodes = d3.range(numNodes).map(function (d, i) {
	return {
		radius: Math.random() * 25,
		category: i % 3
	}
});

var simulation = d3.forceSimulation(nodes)
	.force('charge', d3.forceManyBody().strength(5))
	.force('x', d3.forceX().x(function (d) {
		return xCenter[d.category];
	}))
	.force('collision', d3.forceCollide().radius(function (d) {
		return d.radius;
	}))
	.on('tick', ticked);

function ticked() {
	var u = d3.select('svg g')
		.selectAll('circle')
		.data(nodes)
		.join('circle')
		.attr('r', function (d) {
			return d.radius;
		})
		.style('fill', function (d) {
			return colorScale[d.category];
		})
		.attr('cx', function (d) {
			return d.x;
		})
		.attr('cy', function (d) {
			return d.y;
		});
}

