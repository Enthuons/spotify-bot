const model = require('../../models');

const home = (req, res) => {
  res.render('admin/pages/dashboard');
}

const tracklist = (req, res) => {
  res.render('admin/pages/tracklist');
}

const trackDetails = (req, res) => {
  // var track_id = req.query.id
  res.render('admin/pages/trackdetails');
}

const getTrackDetails = (req, res) => {
  var data = req.body
  var response = {};
  model.tracklistModel.getTracklistByIdData(data, function (err, result) {
    if (err) return;
    response.trackDetails = result;
    model.playedTracksModel.getPlayedTracksDetailsData(data, function (err, result) {
      if (err) return;
      response.playDetails = result;
      res.status(200).send(response);
    });
  });
}


//-------------------tracklist------------------------

const removeTrack = (req, res) => {
  var data = req.body
  model.tracklistModel.removeTrackData(data, function (err, result) {
    if (err) return;
    res.status(200).send(result);
  });
}

const insertTrackList = (req, res) => {
  var data = req.body
  model.tracklistModel.getTracklistByIdData(data, function (err, result) {
    if (err) return;
    if (result.length <= 0) {
      model.tracklistModel.insertTracklistData(data, function (err, result) {
        if (err) return;
        res.status(200).send('track successfully inserted');
      });
    } else res.status(200).send('Already Exist');
  });
}

const getAllList = (req, res) => {
  var data = req.body
  model.playedTracksModel.getAllListData(function (err, result) {
    if (err) return;
    res.status(200).send(result);
  });
}


const updatePlaycount = (req, res) => {
  var data = req.body
  model.tracklistModel.updatePlayCountData(data, function (err, result) {
    if (err) return;
    res.status(200).send(result);
  });
}

// ----------------------------------------


module.exports = { home, tracklist, removeTrack, insertTrackList, getAllList, getTrackDetails, trackDetails, updatePlaycount };