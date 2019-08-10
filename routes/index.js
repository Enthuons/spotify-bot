const express = require('express');
const router = express.Router();

const adminRoutes = require('./admin');
const apiRoutes = require('./api');

// middleware to log request time
router.use('/', (req, res, next) => {
    console.log(new Date(), 'Request:', req.url);
    next()
});

// home route
router.get('/', (req, res) => {
    res.render('index');
});

// Logout
router.get('/logout', (req, res) => {
    delete req.session.user;
    res.redirect('/');
});

// admin routes
router.use('/admin', adminRoutes);
// api routes
router.use('/api', apiRoutes);
// 404 route
router.get('*', (req, res) => {
    res.status(404).send('NOT FOUND');
});

module.exports = router;
