var express = require('express');
var router = express.Router();

/* GET display page. */
router.get('/', function (req, res, next) {
    res.render('display', { title: 'Your Noise' });
});

module.exports = router;
