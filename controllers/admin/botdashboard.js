const model = require('../../models');
const spotifyplayer = require('../../service/SpotifyPlayer');
const spotifyBot = require('../../service/spotifyBot');


const { exec } = require('child_process');


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

const getBotStatus = (req, res) => {
  const result = JSON.parse(localStorage.getItem('botstatus'));
  res.status(200).send(result);
}

const serverTask = (req, res) => {
  var data = req.body;
  console.log('data  : ', data);
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
      console.error(`exec error: ${err}`);
      res.status(200).send('Failed to execute the command');
      return;
    }
    res.status(200).send(stdout != '' ? stdout : 'Command execute successfully');
    console.log(stdout);
  });
}

module.exports = { getListCount, botDashboard, getTrackListCount, getBotListCount, getPlayDetailsCount, getBotStatus, serverTask };