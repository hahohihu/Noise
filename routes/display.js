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

/* GET display page. */
router.get('/', async function (req, res, next) {
    if (req.app.locals.randomState != req.query.state) {
        res.send('Error: Insecure connection');
        return;
    }

    let access_token = await getAccessToken(req.query.code);

    let me = await fetch('https://api.spotify.com/v1/me', {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + access_token
        }
    });
    me = await me.json();
    console.log(me);
    res.send("Hello, " + me.display_name + '!');
});

module.exports = router;
