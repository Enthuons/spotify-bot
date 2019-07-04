var express = require('express');
var router = express.Router();

var api = require('../controllers/api');

// middleware to authenticate user
router.use('/', (req, res, next) => {
  const user = req.session.user;
  if (!user) {
    return res.send('401', 'login required');
  }
  next();
});

// api base route
router.get('/', (req, res) => {
  res.send('welcome to apis');
});

// get all artists
router.get('/artist', api.artist.list);
router.get('/track', api.track.list);

module.exports = router;
