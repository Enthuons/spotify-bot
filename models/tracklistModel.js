var db = require('./dbConnection');

const getAllTrackListModel = (callback) => {
  var sql = `SELECT * FROM tracklist`;
  db.query(sql, function (err, result) {
    if (err) callback(err, null);
    callback(null, result);
  });
}

const getTracklistByIdModel = (data, callback) => {
  var sql = `SELECT * FROM tracklist WHERE track_id = '${data.track_id}'`;
  db.query(sql, function (err, result) {
    if (err) callback(err, null);
    callback(null, result);
  });
}

const insertTracklistModel = (data, callback) => {
  var sql = `INSERT INTO tracklist (track_id, track_name, album_name, artist_name, release_date, duration_ms, track_url, preview_url, popularity, album_art, play_count) 
              VALUES ('${data.track_id}', '${data.track_name}', '${data.album_name}', '${data.artist_name}', '${data.release_date}', '${data.duration_ms}', '${data.track_url}', '${data.preview_url}', '${data.popularity}', '${data.album_art}', ${data.play_count})`;
  db.query(sql, function (err, result) {
    if (err) callback(err, null);
    callback(null, result);
  });
}

const removeTrackModel = (data, callback) => {
  var sql = `DELETE FROM tracklist WHERE id = '${data.id}'`;
  db.query(sql, function (err, result) {
    if (err) callback(err, null);
    callback(null, result);
  });
}

const getAllPendingTracklistModel = (callback) => {
  var sql = `SELECT * FROM tracklist WHERE pending = true`;
  db.query(sql, function (err, result) {
    if (err) callback(err, null);
    callback(null, result);
  });
}

const updateTracklistComplete = (data, callback) => {
  console.log('updateTracklistComplete: ', data);
  db.query(`UPDATE tracklist SET pending=false WHERE track_id = '${data.track_id}'`, function (err, result) {
    if (err) callback(err, null);
    if (result) callback(null, result);
  });
}

module.exports = { insertTracklistModel, getAllTrackListModel, removeTrackModel, getTracklistByIdModel, updateTracklistComplete, getAllPendingTracklistModel };