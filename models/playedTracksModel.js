var db = require('./dbConnection');

const insertTrackIntoPlayedListData = (data, callback) => {
  var sql = `INSERT INTO played_tracks(track_id, played_by_bot_id, date) VALUES ('${data.track_id}', '${data.bot_id}', '${data.date}')`;
  db.query(sql, function (err, result) {
      if (err) callback(err,null);
      if (result) callback(null,result);
  });
}

const getPlayedTrackListByIdData = (data, callback) => {
  var sql = `SELECT * FROM played_tracks WHERE track_id = '${data.track_id}'`;
    db.query(sql, function (err, result) {
    if (err) callback(err, null);
    if (result) callback(null, result);
  });
}

const getAllListData = (callback) => {
  var sql = `SELECT *, (SELECT COUNT(*) From played_tracks WHERE played_tracks.track_id=tracklist.track_id and date = CURDATE()) as played_count FROM tracklist WHERE tracklist.track_id IN (SELECT track_id FROM tracklist)`;
  db.query(sql, function (err, result) {
    if (err) callback(err, null);
    if (result) callback(null, result);

  });
}

const getAllPendingListData = (callback) => {
  var sql = `SELECT track_id, track_url, play_count, (SELECT COUNT(*) From played_tracks WHERE played_tracks.track_id=tracklist.track_id and date = CURDATE()) as played_count FROM tracklist WHERE tracklist.track_id IN (SELECT track_id FROM tracklist GROUP BY track_id)`;
  db.query(sql, function (err, result) {
    if (err) callback(err, null);
    if (result) callback(null, result);
  });
}

const getPlayedTracksDetailsData = (data, callback) => {
  var sql = `SELECT date, COUNT(*) AS play_count FROM played_tracks WHERE track_id = '${data.track_id}' GROUP BY date`;
  db.query(sql, function (err, result) {
    if (err) callback(err, null);
    if (result) callback(null, result);
  });
}

module.exports = { insertTrackIntoPlayedListData, getPlayedTrackListByIdData, getAllListData, getAllPendingListData, getPlayedTracksDetailsData };