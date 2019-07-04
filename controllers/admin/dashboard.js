const SpotifyPlayer = require('../../service/SpotifyPlayer');

const home = (req, res) => {
    res.render('admin/pages/dashboard');
}

const playTrack = (req, res) => {
    data = req.body;
    if(data.selectedTrack) {
        SpotifyPlayer.play(data.selectedTrack);
        // res.render('admin/pages/success');
        res.status(200).send('Song is being played by bot');
    } else {
        res.status(401).send('Error 404, no song url found');
    }  
}

module.exports = { home, playTrack };