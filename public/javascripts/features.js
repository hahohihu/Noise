class Feature {
	constructor(name, domain = [0, 1]) {
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
        new Feature("energy"),
        new Feature("acousticness")
    ]) {
        features[feature.name] = feature;
    }
    return features;
}

export const FEATURES = define_features();
