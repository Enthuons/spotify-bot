const spotify = require('../../service/spotify');
const SpotifyPlayer = require('../../service/SpotifyPlayer');

const track = (req, res) => {
  spotify.searchTrack(req.query.search, req.query.url)
    .then(function (response) {
      const data = response.tracks;
      res.status(200).send(data);
    })
    .catch(function (err) {
      console.log(err);
    });
}

const playTrack = (req, res) => {
  data = req.body;
  if(data.track) {
      var count = data.count;
      console.log(count);
      SpotifyPlayer.play(data.track);
      // res.render('admin/pages/success');
      res.status(200).send('Song is being played by bot');
  } else {
      res.status(401).send('Error 404, no song url found');
  }  
}

module.exports = { track, playTrack };
