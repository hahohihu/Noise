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
            redirect_uri: 'http://localhost:3000/access',
            grant_type: 'authorization_code'
        })
    });

    let token_json = await token.json();
    return token_json.access_token;
}


/* GET access page. */
router.get('/', async function (req, res, next) {
    if (req.app.locals.randomState != req.query.state) {
        res.send('Error: Insecure connection');
        return;
    }

    let access_token = await getAccessToken(req.query.code);
    res.cookie('access_token', access_token, { maxAge: 3500000 });
    res.redirect('/display');
});

module.exports = router;
