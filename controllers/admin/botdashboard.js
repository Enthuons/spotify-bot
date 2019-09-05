const model = require('../../models');
const spotifyplayer = require('../../service/SpotifyPlayer');
const spotifyBot = require('../../service/spotifyBot');

if (typeof localStorage === "undefined" || localStorage === null) {
  var LocalStorage = require('node-localstorage').LocalStorage;
  localStorage = new LocalStorage('./scratch');
}

const { exec } = require('child_process');


const botDashboard = (req, res) => {
  // var track_id = req.query.id
  res.render('admin/pages/botdashboard');
}

const getOverviewListCount = (req, res) => {
  var data = req.body;
  model.botDashboardModel.getListCountByDate(data, function (err, result) {
    if (err) return;
    res.status(200).send(result);
  });
}

const getListByDate = (req, res) => {
  var data = req.body;
  if(data.flag == 'tracks') {
    model.botDashboardModel.getTrackListByDate(data, function (err, result) {
      if (err) return;
      res.status(200).send(result);
    });
  } else {
    model.botDashboardModel.getBotListByDate(data, function (err, result) {
      if (err) return;
      res.status(200).send(result);
    });
  }
}

const getListByID = (req, res) => {
  var data = req.body;
  if(data.flag == 'tracks') {
    model.botDashboardModel.getBotListByMusic(data, function (err, result) {
      if (err) return;
      res.status(200).send(result);
    });
  } else {
    model.botDashboardModel.getTrackListByBot(data, function (err, result) {
      if (err) return;
      res.status(200).send(result);
    });
  }
}

const getPlayDetailsCount = (req, res) => {
  var data = req.body;
  model.botDashboardModel.getPlayDetailsByBot(data, function (err, result) {
    if (err) return;
    res.status(200).send(result);
  });
}

const getCurrentList = (req, res) => {
  var data = req.body;
  model.botDashboardModel.getCurrentList(data, function (err, result) {
    if (err) return;
    res.status(200).send(result);
  });
}


const getBotStatus = (req, res) => {
  if (localStorage.getItem('botstatus')) {
    const result = JSON.parse(localStorage.getItem('botstatus'));
      res.status(200).send(result);
  } else {
    res.status(200).send('');
  }
}

const serverTask = (req, res) => {
  var data = req.body;
  var command = '';
  var task = data.command
  switch (task) {
    case 'restart_bot':
      command = 'pm2 restart spotifybot';
      break;
    case 'getInfo':
      command = 'cat /proc/meminfo | grep Mem* && df -hT && pm2 list';
      break;
    case 'getTempfileCount':
      command = 'sudo find /tmp -type d | grep ".com.google*" | wc -l';
      break;
    case 'clearTempFile':
      command = `find /tmp -type d -name ".com.google.Chrome*" -exec rm -rf {} \\;`;
      break;
    case 'mysqlStatus':
      command = 'sudo /etc/init.d/mysql status |grep Active';
      break;
    case 'restart_mysql':
      command = 'sudo /etc/init.d/mysql restart';
      break;
    case 'tail':
      command = 'tail -f package.json';
      break;
    default:
      command = 'uname';
  }

  exec(command, (err, stdout, stderr) => {
    if (err) {
      console.error(`execute command: ${task} \n exec error: ${err}`);
      res.status(200).send('Failed to execute the command');
      return;
    }
    res.status(200).send(stdout != '' ? stdout : 'Command execute successfully');
    console.log(`execute command: ${task} \n exec success: ${stdout}`);
  });
}

module.exports = { getOverviewListCount, botDashboard, getListByDate, getListByID, getPlayDetailsCount, getBotStatus, serverTask, getCurrentList };