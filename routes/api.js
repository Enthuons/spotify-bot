var express = require('express');
var router = express.Router();

var api = require('../controllers/api');

// middleware to authenticate user
router.use('/', (req, res, next) => {
  const user = req.session.user;
  if (!user) {
    return res.status(401).send('login required');
  }
  next();
});

// api base route
router.get('/', (req, res) => {
  res.status(200).send('welcome to APIs');
});

// search tracks
router.get('/search', api.search.track);
// play a song in bot
// router.post('/play-track', api.search.playTrack);

module.exports = router;
