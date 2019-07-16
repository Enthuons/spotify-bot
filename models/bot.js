var db = require('./dbConnection');
const SpotifyPlayer = require('../service/SpotifyPlayer');

var trackListArray = [];
var remainingPlayCount = null;
var botCount = 3;

function getList(listType, callback) {
  db.query(`SELECT * FROM ${listType}`, function(err, result) {
    // if (err) callback(err,null);
    // else 
    callback(null,result);
  });
}

function insertTrackIntoPlayedList(data, callback) {
  if (!data.track_id) return;
  var played_by_bot_id = `spotify_bot_${Math.floor(Math.random() * 20) + 1}`;
  var sql = `INSERT INTO played_tracks(track_id, played_by_bot_id) VALUES ('${data.track_id}', '${played_by_bot_id}')`;
  db.query(sql, function (err, result) {
      if (err) callback(err,null);
      if (result) callback(null,result);
  });
}

function updateTracklist(data, callback) {
  if (!data.track_id) return;
  db.query(`UPDATE tracklist SET pending=false WHERE track_id = '${data.track_id}'`, function (err, result) {
    if (err) callback(err, null);
    if (result) callback(null,result);
    console.log(`update song ${data.track_id} pending to complete`);
  });
}

function getAllPendingList(callback) {
  db.query(`SELECT * FROM tracklist WHERE pending = true`, function (err, result) {
    if (err) callback(err, null);
    if (result) {
      result.map((item, i) => {
        trackListArray.push(item);
      });
      callback(null,result);
    }
  });
}

function getRemainingSongToPlay(callback) {
  if (trackListArray.length > 0) {
    console.log('trackListArray: ', trackListArray);
    db.query(`SELECT * FROM played_tracks WHERE track_id = '${trackListArray[0].track_id}'`, function (err, result) {
      if (err) callback(err, null);
      var playedTrack = result;
      remainingPlayCount =  trackListArray[0].play_count - playedTrack.length;
      callback(null, remainingPlayCount);
    })
  } else {
    console.log('all song played, playlist null');
  }     
}

const playTrackByBot = (req, res) => {

  console.log('start');

  getAllPendingList(function(err,data){
    if(err) return;

    getRemainingSongToPlay(function(err, res) {
      if(err) return;
    
      for(i = 0; i < botCount; i++) {
        setTimeout(() => {
          bot();
        }, 1000);
      }
    });
  });



  function bot() {
    console.log('step2 - remainingPlayCount:', remainingPlayCount);
    --remainingPlayCount;
    if (trackListArray.length > 0) {
        console.log('remaining song to play : ', remainingPlayCount);
        function play() {
          if (remainingPlayCount > 0) {
            console.log('play song to spotify player');
            SpotifyPlayer.play(trackListArray[0].track_url, function(data){
              if(data == 'done') {
                console.log('45sec over get another song');
                insertTrackIntoPlayedList(trackListArray[0],function(err,data){
                  if(err) console.log('some error occure');
                  if(data) {
                    console.log('song insert to played_track table');
                    --remainingPlayCount;
                    play();
                  }
                });
              }
            });
          } else {
            console.log('update to complete track[0]');
            updateTracklist(trackListArray[0],function(err,data){
              if(err) console.log('some error occure');
              if(data) {
                trackListArray.shift(); bot();
              }
            });
          }
        }
        play();
    } else {
      console.log('All song played');
    }
  }
}

module.exports = { playTrackByBot };
