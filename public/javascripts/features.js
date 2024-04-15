class Feature {
	constructor(name, domain = undefined) {
		this.name = name;
		this.domain = domain;
	}

	get(track) {
		return track.features[this.name];
	}
}

function define_features() {
    let features = {};
    for (let feature of [
        new Feature("energy", [0, 1]),
        new Feature("acousticness", [0, 1]),
        new Feature("danceability", [0, 1]),
        new Feature("liveness", [0, 1]),
        new Feature("instrumentalness", [0, 1]),
        new Feature("speechiness", [0, 1]),
        new Feature("loudness"),
        new Feature("duration_ms"),
        new Feature("tempo")
    ]) {
        features[feature.name] = feature;
    }
    return features;
}

export const FEATURES = define_features();
