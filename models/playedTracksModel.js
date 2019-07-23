var db = require('./dbConnection');

const insertTrackIntoPlayedList = (data, callback) => {
  var sql = `INSERT INTO played_tracks(track_id, played_by_bot_id, date) VALUES ('${data.track_id}', '${data.bot_id}', '${data.date}')`;
  db.query(sql, function (err, result) {
      if (err) callback(err,null);
      if (result) callback(null,result);
  });
}

const getPlayedTrackListByID = (data, callback) => {
  db.query(`SELECT COUNT(*) AS COUNT FROM played_tracks WHERE track_id = '${data}'`, function (err, result) {
    if (err) callback(err, null);
    if (result) callback(null, result[0].COUNT);

  });
}

module.exports = { insertTrackIntoPlayedList, getPlayedTrackListByID };