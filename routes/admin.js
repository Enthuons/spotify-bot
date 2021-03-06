var express = require('express');
var router = express.Router();

var admin = require('../controllers/admin');

// middleware to authenticate admin
router.use('/', (req, res, next) => {
  const user = req.session.user;
  if (['/login'].indexOf(req.url) > -1) {
    if (user && user.isAdmin) {
      return res.redirect('/admin');
    }
  } else if (!(user && user.isAdmin)) {
    return res.redirect('/admin/login');
  }
  next();
});

router.get('/', admin.dashboard.tracklist);
router.get('/login', admin.auth.login);
router.post('/login', admin.auth.login);
router.get('/addtracklist', admin.dashboard.home);

router.get('/trackdetails', admin.dashboard.trackDetails);
router.post('/trackdetails', admin.dashboard.getTrackDetails);
router.post('/updatecount', admin.dashboard.updatePlaycount);

router.post('/tracklist', admin.dashboard.insertTrackList);
router.get('/tracklist', admin.dashboard.getAllList);
router.post('/removetrack', admin.dashboard.removeTrack);


module.exports = router;
