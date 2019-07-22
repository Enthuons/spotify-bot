const SpotifyPlayer = require('./SpotifyPlayer');
const model = require('../models');

var trackListArray = [];
var trackListArray2 = [];
var tempArray = [];
var maxBot = 3;

var runningBot = 0;

function getAllPendingList(callback) {
  trackListArray = [];
  trackListArray2 = [];
  model.tracklistModel.getAllPendingTracklistModel(function (err, result) {
    if (err) return;
    if (result) {
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
        // console.log('tracklist null retry in 10 sec');
        setTimeout(() => {
          getAllPendingList();
        }, 10000) ;
      }
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
        model.playedTracksModel.getPlayedTrackListByID(trackListArray[i].track_id, function(err,data){
          if(err) return;
          trackListArray[i].play_count = trackListArray[i].play_count - data;
          trackListArray2[i].count = trackListArray2[i].count - data;
        });
      });
    } else {
      // console.log('Warning 101! there have no song in tracklist');
      // getAllPendingList();
    }
    
    setTimeout(() => {
      // console.log('trackListArray2: ', trackListArray2);
      // console.log('trackListArray: ', trackListArray);
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
            model.playedTracksModel.insertTrackIntoPlayedList(tempArray[0],function(err,data){
              if(err) {console.log('some error occured while inserting track'); return;}
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
      botManager('stop');
    }
  }

  function onPlayComplete() {
    if (trackListArray2.length > 0) {
      --trackListArray2[0].count;
      if(trackListArray2[0].count == 0 ) {
          model.tracklistModel.updateTracklistComplete(trackListArray2[0], function (err, result) {
          if(err) console.log('some error occure while updating');
          if(result) {
            console.log(`all song played by this track_id=${trackListArray2[0].track_id} and update status pending to complete`);
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
      runningBot = 0;
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
          // console.log('.');
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
        botManager('stop');
        console.log('All tracks are played, need new tracks for play');
        playTrackByBot();
      }
    }
  }

}

module.exports = { playTrackByBot };
