const model = require('../../models');

const home = (req, res) => {
  res.render('admin/pages/dashboard');
}

const tracklist = (req, res) => {
  res.render('admin/pages/tracklist');
}

//-------------------tracklist------------------------

const getAllTrackList = (req, res) => {
  model.tracklistModel.getAllTrackListModel(function (err, result) {
    if (err) return;
    res.status(200).send(result);
  });
}

const removeTrack = (req, res) => {
  var data = req.body
  model.tracklistModel.removeTrackModel(data, function (err, result) {
    if (err) return;
    res.status(200).send(result);
  });
}

const insertTrackList = (req, res) => {
  var data = req.body
  model.tracklistModel.getTracklistByIdModel(data, function (err, result) {
    if (err) return;
    if (result.length <= 0) {
      model.tracklistModel.insertTracklistModel(data, function (err, result) {
        if (err) return;
        res.status(200).send('track successfully inserted');
      });
    } else res.status(200).send('Already Exist');
  });
}

// ----------------------------------------


module.exports = { home, tracklist, removeTrack, insertTrackList, getAllTrackList };