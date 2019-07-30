const SpotifyPlayer = require('./SpotifyPlayer');
const model = require('../models');

var trackListArray = [];
var tempArray = [];
var maxBot = 3;
var runningBot = 0;
var botCount = 0;
var pendingFlag = false;

function getAllPendingList(callback) {
  trackListArray = [];
  pendingFlag = false;
  model.playedTracksModel.getAllPendingListData(function (err, result) {
    if (err) return;
    if (result && result.length > 0) {
      result.map((item, i) => {
        if (item.play_count - item.played_count > 0) {
          pendingFlag = true;
          data1 = {
            play_count: item.play_count - item.played_count,
            track_id: item.track_id,
            track_url: item.track_url,
          }
          trackListArray.push(data1);
        }
      });

      setTimeout(() => {
        if (pendingFlag) {
          callback(null, result);
        } else {
          console.log('All tracks are played for today, retry in 5 min');
          setTimeout(() => {
            getAllPendingList(callback);
          }, 5 * 60 * 1000);
        }
      }, 500);

    } else {
      console.log('Tracklist empty, please add track in tracklist');
      setTimeout(() => {
        getAllPendingList(callback);
      }, 5 * 60 * 1000);
    }
  });
}

const playTracks = () => {

  getAllPendingList(function (err, data) { /// step 0 fech data from db and store in local storage
    if (err) return;
    if (data.length > 0) botManager('start');
  });

  function start(botID) {
    if (trackListArray.length > 0) {
      if (trackListArray[0].play_count > 0) {
        console.log(`Now playing track_id ${trackListArray[0].track_id} and playing track number: ${trackListArray[0].play_count}`);
        tempArray.push(trackListArray[0].track_id);
        --trackListArray[0].play_count;
        SpotifyPlayer.play(trackListArray[0].track_url, botID, function (data) {
          if (data == 'done') {
            --runningBot;
            data = {
              track_id: tempArray[0],
              bot_id: `spotify_bot-${botID}`,
              date: new Date().toISOString().slice(0, 10),
            }
            model.playedTracksModel.insertTrackIntoPlayedListData(data, function (err, data) {
              if (err) { console.log('some error occured while inserting track'); return; }
              if (data) {
                console.log(`track_id ${tempArray[0]} insert into played_track table`);
                tempArray.shift();
                if (tempArray.length == 0) getNewMusicTrack();
              }
            });
          }
        });
      } else {
        trackListArray.shift();
        --runningBot;
      }
    } else {
      console.log('Unknown ERROR 103');
      // if (tempArray.length == 0) getNewMusicTrack();
    }
  }

  function botManager(input) {
    if (input == 'stop') {
      console.log('botManager stop');
      clearInterval(waitBot);
      runningBot = 0;
    }
    if (input == 'start') {
      console.log('botManager start');
      waitBot = setInterval(check, 1000);
      function check() {
        if (maxBot > runningBot) {
          ++runningBot;
          console.log('bot ---> ', botCount % maxBot + 1);
          start(botCount % maxBot + 1);
          // clearInterval(waitBot);
          ++botCount
        }
      }
    }
  }

  function getNewMusicTrack() {
    console.log('_________________________________');
    var wait = setInterval(check, 1000);
    function check() {
      if (trackListArray.length == 0) {
        clearInterval(wait);
        botManager('stop');
        console.log('All tracks are played, need new tracks for play');
        playTracks();
      }
    }
  }

}

module.exports = { playTracks };
