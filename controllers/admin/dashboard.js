const home = (req, res) => {
    res.render('admin/pages/dashboard');
}

const tracklist = (req, res) => {
    res.render('admin/pages/tracklist');
}

module.exports = { home, tracklist };