const configs = require('../config.json');
const environment = process.env.ENV || 'development';
const config = configs[environment];

const Spotify = require('node-spotify-api');
 
const spotify = new Spotify({
  id: config.spotify_client_id,
  secret: config.spotify_client_secret
});

searchTrack = (query, url) => {
  if (url) {
    return spotify.request(url);
  }
  return spotify.search({ type: 'track', query: query });
}

module.exports = { searchTrack };
