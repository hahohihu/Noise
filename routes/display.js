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
router.get('/', function (req, res, next) {
    res.render('display', { title: 'Your Noise' });
});

module.exports = router;
