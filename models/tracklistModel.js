// var express = require('express');
// var app = express();
var db = require('./dbConnection');

const getTrackList = (req, res) => {

  console.log('getTrackList');

  db.query("SELECT * FROM tracklist", function (err, result, fields) {
    if (err) throw err;
    console.log('result: ', result);
      res.status(200).send(result);

  });
}

const storeTrackList = (req, res) => {

  var data = req.body;

  db.query(`SELECT 1 FROM tracklist WHERE track_id = '${data.track_id}'`, function (err, result, fields) {
    if (err) throw err;
    
    if (result.length <= 0) {
      console.log('New track');
      var sql = `INSERT INTO tracklist (track_id, track_name, album_name, artist_name, release_date, duration_ms, track_url, preview_url, popularity, album_art, play_count) 
                VALUES ('${data.track_id}', '${data.track_name}', '${data.album_name}', '${data.artist_name}', '${data.release_date}', '${data.duration_ms}', '${data.track_url}', '${data.preview_url}', '${data.popularity}', '${data.album_art}', ${data.play_count})`;
      db.query(sql, function (err, result) {
        if (err) throw err;
        res.status(200).send('track successfully inserted');
      });
    } else {
      res.status(200).send('Already Exist');
    }
      // res.status(200).send(result);
  });
}

const removeTrack = (req, res) => {

  var data = req.body;
  console.log('RemoveTrack: ');

  var sql = `DELETE FROM tracklist WHERE id = '${data.id}'`;
  db.query(sql, function (err, result) {
    if (err) throw err;
    console.log("Number of records deleted: " + result.affectedRows);
    res.status(200).send(result);
  });
}


module.exports = { storeTrackList, getTrackList, removeTrack };