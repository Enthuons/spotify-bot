

var pool = require('./dbConnection');

const getAllTrackListData = (callback) => {
  pool.getConnection(function (err, connection) {
    if (err) throw err;
    var sql = `SELECT * FROM tracklist`;
    connection.query(sql, function (err, result) {
      connection.release();
      if (err) { console.log(new Date(), 'ERROR from database:', err); callback(err, null); }
      callback(null, result);
    });
  });
}

const getListCountByDate = (data, callback) => {
  pool.getConnection(function (err, connection) {
    if (err) throw err;
    var sql = `SELECT played_by_bot_id, track_id, (SELECT track_name FROM tracklist WHERE track_id = played_tracks.track_id) AS track_name, COUNT(*) AS playCount FROM played_tracks WHERE date = '${data.date}' GROUP BY played_by_bot_id, track_id ORDER BY played_by_bot_id * 1, played_by_bot_id`;
    connection.query(sql, function (err, result) {
      connection.release();
      if (err) { console.log(new Date(), 'ERROR from database:', err); callback(err, null); }
      callback(null, result);
    });
  });
}

const getTrackListByDate = (data, callback) => {
  pool.getConnection(function (err, connection) {
    if (err) throw err;
    var sql = `SELECT track_name, album_name, artist_name, track_id, play_count AS total_play_count, (SELECT COUNT(*) FROM played_tracks WHERE date = '${data.date}' and track_id = tracklist.track_id) AS play_count FROM tracklist WHERE track_id IN (SELECT track_id FROM played_tracks Where date = '${data.date}' GROUP BY track_id)`;
    connection.query(sql, function (err, result) {
      connection.release();
      if (err) { console.log(new Date(), 'ERROR from database:', err); callback(err, null); }
      callback(null, result);
    });
  });
}

const getBotListByMusic = (data, callback) => {
  pool.getConnection(function (err, connection) {
    if (err) throw err;
    var sql = `SELECT played_by_bot_id, track_id, COUNT(*) AS play_count FROM played_tracks WHERE date = '${data.date}' and track_id = '${data.track_id}' GROUP BY played_by_bot_id`;
    connection.query(sql, function (err, result) {
      connection.release();
      if (err) { console.log(new Date(), 'ERROR from database:', err); callback(err, null); }
      callback(null, result);
    });
  });
}

const getPlayDetailsByBot = (data, callback) => {
  pool.getConnection(function (err, connection) {
    if (err) throw err;
    var sql = `SELECT * FROM played_tracks WHERE date = '${data.date}' and played_by_bot_id = '${data.bot_id}' and track_id = '${data.track_id}'`;
    connection.query(sql, function (err, result) {
      connection.release();
      if (err) { console.log(new Date(), 'ERROR from database:', err); callback(err, null); }
      callback(null, result);
    });
  });
}

module.exports = { getAllTrackListData, getListCountByDate, getTrackListByDate, getBotListByMusic, getPlayDetailsByBot };