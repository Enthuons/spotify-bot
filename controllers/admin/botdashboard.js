const model = require('../../models');

const botDashboard = (req, res) => {
  // var track_id = req.query.id
  res.render('admin/pages/botdashboard');
}

const getListCount = (req, res) => {
  var data = req.body;
  model.botDashboardModel.getListCountByDate(data, function (err, result) {
    if (err) return;
    res.status(200).send(result);
  });
}

const getTrackListCount = (req, res) => {
  var data = req.body;
  model.botDashboardModel.getTrackListByDate(data, function (err, result) {
    if (err) return;
    res.status(200).send(result);
  });
}

const getBotListCount = (req, res) => {
  var data = req.body;
  model.botDashboardModel.getBotListByMusic(data, function (err, result) {
    if (err) return;
    res.status(200).send(result);
  });
}

const getPlayDetailsCount = (req, res) => {
  var data = req.body;
  model.botDashboardModel.getPlayDetailsByBot(data, function (err, result) {
    if (err) return;
    res.status(200).send(result);
  });
}

module.exports = { getListCount, botDashboard, getTrackListCount, getBotListCount, getPlayDetailsCount };