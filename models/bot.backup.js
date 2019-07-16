var db = require('./dbConnection');
// var spotify = require('../controllers/api/search');
// const SpotifyPlayer = require('../../service/SpotifyPlayer');
const SpotifyPlayer = require('../service/SpotifyPlayer');

function getList(listType, callback) {
  db.query(`SELECT * FROM ${listType}`, function(err, result) {
    // if (err) callback(err,null);
    // else 
    callback(null,result);
  });
}

function insertTrackIntoPlayedList(data, callback) {
  var played_by_bot_id = `spotify_bot_${Math.floor(Math.random() * 20) + 1}`;
    var sql = `INSERT INTO played_tracks(track_id, track_name, album_name, artist_name, track_url, played_by_bot_id)
              VALUES ('${data.track_id}', '${data.track_name}', '${data.album_name}', '${data.artist_name}', '${data.track_url}', '${played_by_bot_id}')`;
    db.query(sql, function (err, result) {
        // if (err) throw err;
        if (err) callback(err,null);
        if (result) callback(null,result);
    });
}

function updateTracklist(data, callback) {
  db.query(`UPDATE tracklist SET pending=false WHERE track_id = '${data.track_id}'`, function (err, result) {
    if (err) throw err;
    callback(null,result);
    console.log(`update song ${data.track_id} pending to complete`);
  });
}

// var trackListArray = [];
// function getAllPendingList() {
//   db.query(`SELECT * FROM tracklist WHERE pending = true`, function (err, result) {
//     if (err) throw err;
//     // callback(null,result);
//     // console.log('result: ', result);
//     result.map((item, i) => {
//       console.log(item);
//       trackListArray.push(item);
//       console.log('trackListArray: ', trackListArray);
//     });
//   });
// }
// getAllPendingList();




const playTrackByBot = (req, res) => {

    console.log('playTrackByBot:  ');

    var trackList = null;
    var playedTracks = null;

    // getList("tracklist", function(err,data){
    //   // if (err) console.log("ERROR : ",err);            
    //   // else console.log("result from db is : ",data); 
    //   if (data) trackList = data;
    // });

    // getList("played_tracks", function(err,data){
    //   // if (err) console.log("ERROR : ",err);            
    //   // else console.log("result from db is : ",data); 
    //   if (data) playedTracks = data;
    // });

    db.query(`SELECT * FROM tracklist WHERE pending = true`, function (err, result, fields) {
      if (err) throw err;

      if (result) {
        console.log('get all pending tracklist from database');
        trackList = result;
        if (trackList.length > 0) {
            db.query(`SELECT * FROM played_tracks WHERE track_id = '${trackList[0].track_id}'`, function (err, result, fields) {
                if (err) throw err;
    
                var playedTrack = result    
                if (playedTrack.length > 0 ) {
                  if (playedTrack.length < trackList[0].play_count) {
                    console.log('pending song');
                    // play song and increment the value in table2
                    // play song by bot 
                    // after complet  update in table2

                    SpotifyPlayer.play(trackList[0].track_url, function(data){
                      if(data == 'done') {
                        console.log('50sec over get another song');
                        insertTrackIntoPlayedList(trackList[0],function(err,data){
                          if(err) console.log('some error occure');
                          playTrackByBot();
                        });
                      }
                    });
                  } else {
                     // update it pending to false
                    // updateTracklist(trackList[0]);

                    updateTracklist(trackList[0],function(err,data){
                        if(err) console.log('some error occure');
                        playTrackByBot();
                    });
                  }                   
                } else {
                  console.log('new song');

                  // play song and insert into table2
                  // play song by bot 
                  // after complet  update in table2 

                  SpotifyPlayer.play(trackList[0].track_url, function(data){
                    if(data == 'done') {
                      insertTrackIntoPlayedList(trackList[0],function(err,data){
                        if(err) console.log('some error occure');
                        playTrackByBot();
                      });
                      playTrackByBot();
                    }
                  });
                }
            });
        } else {
          // all song played from tracklist
          console.log('all song played from tracklist');
          return;
        }
      }
    });

}

module.exports = { playTrackByBot };
