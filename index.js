// load the things we need
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');

const bot = require('./service/bot')

const routes = require('./routes');

const app = express();
const HOST = process.env.HOST || '0.0.0.0';
const PORT = process.env.PORT || 3000;

// set the view engine to ejs
app.set('view engine', 'ejs');
app.set('views','./views');

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use(session({ secret: 'spotify-secrets', resave: false, saveUninitialized:false, cookie: {} }));
if (app.get('env') === 'production') {
  app.set('trust proxy', 1) // trust first proxy
  sess.cookie.secure = true // serve secure cookies
}

app.use('/', routes);

const server = app.listen(PORT, HOST, () => {
  const host = server.address().address;
  const port = server.address().port;
  console.log(`server running at http://${host}:${port}`);
  bot.playTracks();
  console.log(new Date(), 'Start playing tracks... ');
});


