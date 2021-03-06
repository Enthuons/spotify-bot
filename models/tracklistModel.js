var db = require('./dbConnection');

const getAllTrackListData = (callback) => {
  var sql = `SELECT * FROM tracklist`;
  db.query(sql, function (err, result) {
    if (err) { console.log(new Date(), 'ERROR from database:', err); callback(err,null); }
    callback(null, result);
  });
}

const getTracklistByIdData = (data, callback) => {
  var sql = `SELECT * FROM tracklist WHERE track_id = '${data.track_id}'`;
  db.query(sql, function (err, result) {
    if (err) { console.log(new Date(), 'ERROR from database:', err); callback(err,null); }
    callback(null, result);
  });
}

const insertTracklistData = (data, callback) => {
  var sql = `INSERT INTO tracklist (track_id, track_name, album_name, artist_name, release_date, duration_ms, track_url, preview_url, popularity, album_art, play_count) 
              VALUES ('${data.track_id}', '${data.track_name}', '${data.album_name}', '${data.artist_name}', '${data.release_date}', '${data.duration_ms}', '${data.track_url}', '${data.preview_url}', '${data.popularity}', '${data.album_art}', ${data.play_count})`;
  db.query(sql, function (err, result) {
    if (err) { console.log(new Date(), 'ERROR from database:', err); callback(err,null); }
    callback(null, result);
  });
}

const removeTrackData = (data, callback) => {
  var sql = `DELETE FROM tracklist WHERE id = '${data.id}'`;
  db.query(sql, function (err, result) {
    if (err) { console.log(new Date(), 'ERROR from database:', err); callback(err,null); }
    callback(null, result);
  });
}

const updatePlayCountData = (data, callback) => {
  var sql = `UPDATE tracklist SET play_count= ${data.play_count} WHERE track_id = '${data.track_id}'`;
  db.query(sql, function (err, result) {
    if (err) { console.log(new Date(), 'ERROR from database:', err); callback(err,null); }
    callback(null, result);
  });
}

module.exports = { insertTracklistData, getAllTrackListData, removeTrackData, getTracklistByIdData, updatePlayCountData };