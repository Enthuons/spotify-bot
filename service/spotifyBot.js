const SpotifyPlayer = require('./SpotifyPlayer');
const model = require('../models');
const config = require('../config.json');

if (typeof localStorage === "undefined" || localStorage === null) {
  var LocalStorage = require('node-localstorage').LocalStorage;
  localStorage = new LocalStorage('./scratch');
}

setInterval(() => {localStorage.setItem('botstatus', '');}, 6*60*1000)

var trackListArray = [];
var tempArray = [];
var maxBot = config.bot_count;
var runningBot = 0;
var botCount = 0;
var pendingFlag = false;
var status = '';

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
          status = 'All tracks are played for today, retry in 5 min';
          const s =  { type: 'warning', details: status };
          localStorage.setItem('botstatus', JSON.stringify(s));
          console.log(new Date(), status);
          setTimeout(() => {
            getAllPendingList(callback);
          }, 5 * 60 * 1000);
        }
      }, 500);

    } else {
      status = 'Tracklist empty, please add track in tracklist';
      const s =  { type: 'success', details: status };
      localStorage.setItem('botstatus', JSON.stringify(s));
      console.log(new Date(), status);
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

        data = {
          track_id: trackListArray[0].track_id,
          bot_id: `spotify_bot-${botID}`,
          // date: new Date().toISOString().slice(0, 10),
        }

        model.playedTracksModel.insertTrackIntoPlayedListData(data, function (err, data) {
          if (err) { 
            status = `spotify_bot-${botID} some error occured while inserting track ${err}`
            localStorage.setItem('botstatus','error');
            console.log(new Date(), status);
            return; 
          }
          if (data) {
            status = `spotify_bot-${botID} track_id ${trackListArray[0].track_id} insert startPlayTime into played_track table`;
            const s =  { type: 'success', details: status };
            localStorage.setItem('botstatus', JSON.stringify(s));
            console.log(new Date(), status);
            const d = {
              track_id: trackListArray[0].track_id,
              id: data.insertId
            }
            tempArray.push(d);
          }
        });
        status = `spotify_bot-${botID} Now playing track_id ${trackListArray[0].track_id} and playing track number: ${trackListArray[0].play_count+1}`;
        const s =  { type: 'success', details: status };
        localStorage.setItem('botstatus', JSON.stringify(s));
        console.log(new Date(), status);

        SpotifyPlayer.play(trackListArray[0].track_url, botID, function (data) {
          status = `spotify_bot-${botID} track_id ${tempArray[0].track_id} -> ${data}`;
          const s =  { type: 'success', details: status };
          localStorage.setItem('botstatus', JSON.stringify(s));
          console.log(new Date(), status);
          if (data == 'done') {
            --runningBot;
            data = {
              track_id: tempArray[0].track_id,
              bot_id: `spotify_bot-${botID}`,
              id: tempArray[0].id
            }
            model.playedTracksModel.updatePlayTime(data, function (err, data) {
              if (err) {
                status = `spotify_bot-${botID} some error occured while inserting track`;
                localStorage.setItem('botstatus','error');
                console.log(new Date(), status);
                return;
              }
              if (data) {
                status = `spotify_bot-${botID} track_id ${tempArray[0].track_id} update endPlayTime into played_track table`;
                const s =  { type: 'success', details: status };
                localStorage.setItem('botstatus', JSON.stringify(s));
                console.log(new Date(), status);
                tempArray.shift();
                if (tempArray.length == 0) getNewMusicTrack();
              }
            });
          } else if (data == 'error') {
            status = 'Error from SpotifyPlayer';
            localStorage.setItem('botstatus','error');
            console.log(new Date(), status);
            --runningBot;
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
      status = 'botManager stop';
      const s =  { type: 'success', details: status };
      localStorage.setItem('botstatus', JSON.stringify(s));
      console.log(new Date(), status);
      clearInterval(waitBot);
      runningBot = 0;
    }
    if (input == 'start') {
      status = 'botManager start';
      const s =  { type: 'success', details: status };
      localStorage.setItem('botstatus', JSON.stringify(s));
      console.log(new Date(), status);
     
      waitBot = setInterval(check, 1000);
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
        status = 'All tracks are played, need new tracks for play';
        const s =  { type: 'success', details: status };
        localStorage.setItem('botstatus', JSON.stringify(s));
        console.log(new Date(), status);
        playTracks();
      }
    }
  }

}

module.exports = { playTracks };
