class Feature {
	constructor(name) {
		this.name = name;
	}

	get(track) {
		return track.features[this.name];
	}
}

function define_features() {
    let features = {};
    for (let feature of [
        new Feature("energy"),
        new Feature("acousticness"),
        new Feature("danceability"),
        new Feature("liveness"),
        new Feature("instrumentalness"),
        new Feature("speechiness"),
        new Feature("loudness"),
        new Feature("duration_ms"),
        new Feature("tempo")
    ]) {
        features[feature.name] = feature;
    }
    return features;
}

export const FEATURES = define_features();
