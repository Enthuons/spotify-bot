const configs = require('./config.json');
const environment = process.env.ENV || 'development';
const config = configs[environment];

const SpotifyPlayer = require('./SpotifyPlayer');

const Spotify = require('node-spotify-api');
 
const spotify = new Spotify({
  id: config.spotify_client_id,
  secret: config.spotify_client_secret
});
 
spotify.search({ type: 'track', query: 'All the Small Things' }, function(err, data) {
  if (err) {
    return console.log('Error occurred: ' + err);
  }
  
  const tracks = data.tracks.items;
  for (let i in tracks) {
    if (i > 1) return; // play only two songs for now
    const track = tracks[i];
    console.log("Playing track: ", track.name + ' ' + track.track_number);
    const musicUrl = track.external_urls.spotify;
    SpotifyPlayer.play(musicUrl);
  }
});
