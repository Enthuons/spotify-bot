const SpotifyPlayer = require('./SpotifyPlayer');
const model = require('../models');
const dbconfig = require('../config.json');

var trackListArray = [];
var tempArray = [];
var maxBot = dbconfig.botDetails.totalBot;
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
          console.log(new Date(), 'All tracks are played for today, retry in 5 min');
          setTimeout(() => {
            getAllPendingList(callback);
          }, 5 * 60 * 1000);
        }
      }, 500);

    } else {
      console.log(new Date(), 'Tracklist empty, please add track in tracklist');
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
        --trackListArray[0].play_count;
        tempArray.push(trackListArray[0].track_id);
        console.log(new Date(), `Now playing track_id ${trackListArray[0].track_id} and playing track number: ${trackListArray[0].play_count+1}`);
        // tempArray.push(trackListArray[0].track_id);
        // --trackListArray[0].play_count;
        SpotifyPlayer.play(trackListArray[0].track_url, botID, function (data) {
          if (data == 'done') {
            --runningBot;
            data = {
              track_id: tempArray[0],
              bot_id: `spotify_bot-${botID}`,
              date: new Date().toISOString().slice(0, 10),
            }
            model.playedTracksModel.insertTrackIntoPlayedListData(data, function (err, data) {
              if (err) { console.log(new Date(), 'some error occured while inserting track'); return; }
              if (data) {
                console.log(new Date(), `track_id ${tempArray[0]} insert into played_track table`);
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
      botManager('stop');
    }
  }

  function botManager(input) {
    if (input == 'stop') {
      console.log(new Date(), 'botManager stop');
      clearInterval(waitBot);
      runningBot = 0;
    }
    if (input == 'start') {
      console.log(new Date(), 'botManager start');
      waitBot = setInterval(check, 2*1000);
      function check() {
        if (maxBot > runningBot) {
          ++runningBot;
          console.log(new Date(), 'bot ---> ', botCount % maxBot + 1);
          start(botCount % maxBot + 1);
          // clearInterval(waitBot);
          ++botCount
        }
      }
    }
  }

  function getNewMusicTrack() {
    console.log(new Date(), '_________________________________');
    var wait = setInterval(check, 1000);
    function check() {
      if (trackListArray.length == 0) {
        clearInterval(wait);
        // botManager('stop');
        console.log(new Date(), 'All tracks are played, need new tracks for play');
        playTracks();
      }
    }
  }

}

module.exports = { playTracks };
