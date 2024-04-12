var express = require('express');
var router = express.Router();

/* GET Spotify login */
router.get('/', function (req, res, next) {
  res.redirect('https://accounts.spotify.com/authorize?' +
    new URLSearchParams({
      response_type: 'code',
      client_id: process.env.SPOTIFY_CLIENT_ID,
      scope: 'user-read-private user-read-email',
      redirect_uri: 'http://localhost:3000/access',
      state: req.app.locals.randomState
    })
  );
});

module.exports = router;
