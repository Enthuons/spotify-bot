var express = require('express');
var router = express.Router();

var model = require('../models');

// middleware to authenticate user
// router.use('/', (req, res, next) => {
//   const user = req.session.user;
//   if (!user) {
//     return res.status(401).send('login required');
//   }
//   next();
// });

// model base route
// router.get('/', (req, res) => {
//   res.status(200).send('welcome to Modelss');
// });

// store tracklist
router.post('/tracklist', model.tracklistModel.storeTrackList);

// get tracklist
router.get('/tracklist', model.tracklistModel.getTrackList);

// remove track
router.post('/removetrack', model.tracklistModel.removeTrack);

// playTrackByBot
router.get('/playtrackbybot', model.bot.playTrackByBot);


// // store tracklist
// router.post('/played-song', model.tracklistModel.storeTrackList);

// //get tracklist
// router.post('/played-song', model.tracklistModel.storeTrackList);

module.exports = router;
