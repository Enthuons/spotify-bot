var db = require('./dbConnection');
const SpotifyPlayer = require('../service/SpotifyPlayer');

var trackListArray = [];
var trackListArray2 = [];
var tempArray = [];
var maxBot = 3;
var runningBot = 0;

function insertTrackIntoPlayedList(data, callback) {
  // if (!data) return;
  var played_by_bot_id = `spotify_bot_${Math.floor(Math.random() * 20) + 1}`;
  var sql = `INSERT INTO played_tracks(track_id, played_by_bot_id) VALUES ('${data}', '${played_by_bot_id}')`;
  db.query(sql, function (err, result) {
      if (err) callback(err,null);
      if (result) callback(null,result);
  });
}

function updateTracklist(data, callback) {
  // console.log('update song: ', data);
  if (!data.track_id) return;
  db.query(`UPDATE tracklist SET pending=false WHERE track_id = '${data.track_id}'`, function (err, result) {
    if (err) callback(err, null);
    if (result) callback(null, result);
    // console.log(`update song ${data.track_id} pending to complete`);
  });
}

function getAllPendingList(callback) {
  db.query(`SELECT * FROM tracklist WHERE pending = true`, function (err, result) {
    if (err) callback(err, null);
    if (result) {
      trackListArray = [];
      trackListArray2 = [];
      if (result.length > 0){
        result.map((item, i) => {
          data1 = {
            play_count: item.play_count,
            track_id: item.track_id,
            track_url: item.track_url,
          }
          data2 = {
            count: item.play_count,
            track_id: item.track_id,
          }
          trackListArray.push(data1);
          trackListArray2.push(data2);
        });
        callback(null,result);
      } else {
        console.log('_');
        setTimeout(() => {
          getAllPendingList();
        }, 5000) ;
      }
    }
  });
}

function getPlayedTrackList(track_id, callback) {
  db.query(`SELECT COUNT(*) AS COUNT FROM played_tracks WHERE track_id = '${track_id}'`, function (err, result) {
    if (err) callback(err, null);
    if (result) {
      callback(null, result[0].COUNT);
    }
  });
}

const playTrackByBot = (req, res) => {

  getAllPendingList(function(err,data){ /// step 0 fech data from db and store in local storage
    if(err) return;
    if(data.length > 0) modifyTracklistArray();
  });

  function modifyTracklistArray() {   /// modify arraylist count with played_track 
    if (trackListArray.length > 0) {
      trackListArray.map((item, i) => {
        getPlayedTrackList(trackListArray[i].track_id, function(err,data){
          if(err) return;
          trackListArray[i].play_count = trackListArray[i].play_count - data;
          trackListArray2[i].count = trackListArray2[i].count - data;
        });
      });
    } else {
      console.log('Warning 101! there have no song in tracklist');
      // getAllPendingList();
    }
    
    setTimeout(() => {
      console.log('trackListArray2: ', trackListArray2);
      console.log('trackListArray: ', trackListArray);
      botManager('start');
    }, 5000);
  }

  function start() { /// bot goto queue list fetch data
    if(trackListArray.length > 0) {
      if(trackListArray[0].play_count > 0) {
        console.log(`Now playing track_id ${trackListArray[0].track_id} and play track_no ${trackListArray[0].play_count}`);
        tempArray.push(trackListArray[0].track_id);
        --trackListArray[0].play_count;
        SpotifyPlayer.play(trackListArray[0].track_url, function(data){
          if(data == 'done') {
            --runningBot;
            insertTrackIntoPlayedList(tempArray[0],function(err,data){
              if(err) console.log('some error occured');
              if(data) {
                console.log(`track ${tempArray[0]} insert to played_track table`);
                tempArray.shift();
              }
            });
            onPlayComplete();
          }
        });
      } else {
        trackListArray.shift();
        start();
      }
    } else {
      // all song play from recent tracklist
      // getNewMusicTrack();
    }
  }

  function onPlayComplete() {
    if (trackListArray2.length > 0) {
      --trackListArray2[0].count;
      if(trackListArray2[0].count == 0 ) {
        updateTracklist(trackListArray2[0],function(err, data){
          console.log('vvvvvvv: ', err, 'xxxxxx: ', data);
          if(err) console.log('some error occure');
          if(data) {
            console.log(`track_id ${trackListArray2[0].track_id} all song played and update status pending to complete`);
            trackListArray2.shift();
            if(trackListArray2.length < 1) {
              getNewMusicTrack();
            }
          }
        });
      }
    } else {
      // console.log('all song played');
      // getNewMusicTrack();
    }
  }

  function botManager(input) {
    if (input == 'stop') {
      console.log('botManager stop');
      clearInterval(waitBot);
    }
    if (input == 'start') {
      console.log('botManager start');
    waitBot = setInterval(check, 1000);
      function check() {
        if(maxBot > runningBot) {
          ++runningBot;
          console.log('bot ---> ', runningBot);
          start();
          // clearInterval(waitBot);
        } else {
          console.log('.');
        }
      }
    }
  }

  function getNewMusicTrack() {
    console.log('_________________________________');
    var wait = setInterval(check, 1000);
    function check() {
      if(trackListArray2.length == 0 && trackListArray.length == 0) {
        clearInterval(wait);
        console.log('need new music track from db');
        botManager('stop');
        playTrackByBot();
      }
    }
  }

}

module.exports = { playTrackByBot };
