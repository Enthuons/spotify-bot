var pool = require('./dbConnection');

const insertTrackIntoPlayedListData = (data, callback) => {
  pool.getConnection(function (err, connection) {
    if (err) throw err;
    var sql = `INSERT INTO played_tracks(track_id, played_by_bot_id, date) VALUES ('${data.track_id}', '${data.bot_id}', CURDATE())`;
    connection.query(sql, function (err, result) {
      connection.release();
      if (err) { console.log(new Date(), 'ERROR from database:', err); callback(err, null); }
      if (result) callback(null, result);
    });
  });
}

const getPlayedTrackListByIdData = (data, callback) => {
  pool.getConnection(function (err, connection) {
    if (err) throw err;
    var sql = `SELECT * FROM played_tracks WHERE track_id = '${data.track_id}'`;
    connection.query(sql, function (err, result) {
      connection.release();
      if (err) { console.log(new Date(), 'ERROR from database:', err); callback(err, null); }
      if (result) callback(null, result);
    });
  });
}

const getAllListData = (callback) => {
  pool.getConnection(function (err, connection) {
    if (err) throw err;
    var sql = `SELECT *, (SELECT COUNT(*) From played_tracks WHERE played_tracks.track_id=tracklist.track_id and date = CURDATE()) as played_count FROM tracklist WHERE tracklist.track_id IN (SELECT track_id FROM tracklist)`;
    connection.query(sql, function (err, result) {
      connection.release();
      if (err) { console.log(new Date(), 'ERROR from database:', err); callback(err, null); }
      if (result) callback(null, result);
    });
  });
}

const getAllPendingListData = (callback) => {
  pool.getConnection(function (err, connection) {
    if (err) throw err;
    var sql = `SELECT track_id, track_url, play_count, (SELECT COUNT(*) From played_tracks WHERE played_tracks.track_id=tracklist.track_id and date = CURDATE()) as played_count FROM tracklist WHERE tracklist.track_id IN (SELECT track_id FROM tracklist GROUP BY track_id)`;
    connection.query(sql, function (err, result) {
      connection.release();
      if (err) { console.log(new Date(), 'ERROR from database:', err); callback(err, null); }
      if (result) callback(null, result);
    });
  });
}

const getPlayedTracksDetailsData = (data, callback) => {
  pool.getConnection(function (err, connection) {
    if (err) throw err;
    var sql = `SELECT date, COUNT(*) AS play_count FROM played_tracks WHERE track_id = '${data.track_id}' GROUP BY date ORDER BY date DESC`;
    connection.query(sql, function (err, result) {
      connection.release();
      if (err) { console.log(new Date(), 'ERROR from database:', err); callback(err, null); }
      if (result) callback(null, result);
    });
  });
}

const updatePlayTime = (data, callback) => {
  pool.getConnection(function (err, connection) {
    if (err) throw err;
    var sql = `UPDATE played_tracks SET updated_at = CURTIME(), playtime = '${data.palyTime}' WHERE id = '${data.id}'`;
    connection.query(sql, function (err, result) {
      connection.release();
      if (err) { console.log(new Date(), 'ERROR from database:', err); callback(err, null); }
      if (result) callback(null, result);
    });
  });
}

module.exports = { insertTrackIntoPlayedListData, getPlayedTrackListByIdData, getAllListData, getAllPendingListData, getPlayedTracksDetailsData, updatePlayTime };