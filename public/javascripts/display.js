import { SpotifyAPI } from "./spotify.js";
import { FEATURES } from "./features.js";

function getCookie(name) {
	const value = `; ${document.cookie}`;
	const parts = value.split(`; ${name}=`);
	if (parts.length === 2) return parts.pop().split(';').shift();
}

let xAxis = document.getElementById("x");
let yAxis = document.getElementById("y");

for (let feature of Object.keys(FEATURES)) {
	let opt = document.createElement('option');
	opt.value = feature;
	opt.innerHTML = feature;
	xAxis.appendChild(opt.cloneNode(true));
	yAxis.appendChild(opt);
}

xAxis.value = localStorage.getItem("xFeature") || "energy";
yAxis.value = localStorage.getItem("yFeature") || "acousticness";

async function render(tracks) {
	let getX = track => FEATURES[xAxis.value].get(track);
	let getY = track => FEATURES[yAxis.value].get(track);

	let xValues = tracks.map(getX);
	let yValues = tracks.map(getY);

	var width = window.innerWidth - 50, height = window.innerHeight - 50;

	let xScale = d3.scaleLinear()
		.domain([Math.min(...xValues), Math.max(...xValues)])
		.range([0, width - 75])

	let yScale = d3.scaleLinear()
		.domain([Math.min(...yValues), Math.max(...yValues)])
		.range([0, height - 75]);

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
	
	d3.select(window).on("resize.chart", () => render(data));

	render(data);
	
	xAxis.onchange = () => {
		localStorage.setItem("xFeature", xAxis.value);
		render(data);
	};

	yAxis.onchange = () => {
		localStorage.setItem("yFeature", yAxis.value);
		render(data);
	};
})();
