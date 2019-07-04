const login = (req, res) => {
    if (req.method === 'POST') {
        const { username, password } = req.body;
        if (username.toLowerCase() === 'admin@spotifybot'
         && password.toLowerCase() === '123456') {
            req.session.user = { username, isAdmin: true }
            return res.redirect('/admin');
        } else {
            return res.render('admin/pages/login', {error: 'Wrong username or password.'});
        }
    }
    res.render('admin/pages/login');
}

module.exports = { login };
