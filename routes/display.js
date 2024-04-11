class SpotifyAPI {
    constructor(access_token) {
        this.access_token = access_token;
    }

    get(path) {
        return fetch('https://api.spotify.com/v1' + path, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + this.access_token
            }
        })
    }
}

var express = require('express');
var router = express.Router();

/* GET display page. */
router.get('/', async function (req, res, next) {
    let spotify = new SpotifyAPI(req.app.locals.access_token);

    let me = await spotify.get('/me');
    me = await me.json();
    res.send("Hello, " + me.display_name + '!');
});

module.exports = router;
