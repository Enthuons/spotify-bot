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

router.get('/', admin.dashboard.home);
router.get('/login', admin.auth.login);
router.post('/login', admin.auth.login);
router.post('/play-track', admin.dashboard.playTrack);


module.exports = router;
