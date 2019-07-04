const spotify = require('../../service/spotify');

const list = (req, res) => {
    // console.log('req : ',req.query.artistName);
    var artistName = req.query.artistName;
    spotify.listArtist(artistName)
    .then(function(response) {
        const data = response.tracks;
        const tracks = data.items;
        const { limit, offset, total, name } = data;

        res.status(200).send(data);
    })
    .catch(function(err) {
        console.log(err);
    });    
}

module.exports = { list };