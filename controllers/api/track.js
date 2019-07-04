const spotify = require('../../service/spotify');
const list = (req, res) => {
   var url = req.query.url;
   if(url == '') {
    return;
   }
    spotify.listTrackByPage(url)
    .then(function(response) {
        const data = response.tracks;
        res.status(200).send(data);
    })
    .catch(function(err) {
        console.log(err);
    });
}

module.exports = { list };