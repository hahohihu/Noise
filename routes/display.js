var express = require('express');
var router = express.Router();

async function getAccessToken(authCode) {
    let token = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic '
                                + (new Buffer.from(process.env.SPOTIFY_CLIENT_ID 
                                    + ':' 
                                    + process.env.SPOTIFY_CLIENT_SECRET
                                ).toString('base64'))
        },
        body: new URLSearchParams({
            code: authCode,
            redirect_uri: 'http://localhost:3000/display',
            grant_type: 'authorization_code'
        })
    });

    let token_json = await token.json();
    return token_json.access_token;
}

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

/* GET display page. */
router.get('/', async function (req, res, next) {
    if (req.app.locals.randomState != req.query.state) {
        res.send('Error: Insecure connection');
        return;
    }

    let access_token = await getAccessToken(req.query.code);
    let spotify = new SpotifyAPI(access_token);

    let me = await spotify.get('/me');
    me = await me.json();
    res.send("Hello, " + me.display_name + '!');
});

module.exports = router;
