const fs = require('fs');
const { Builder, By, Key, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

const config = require('../config.json');

if (typeof localStorage === "undefined" || localStorage === null) {
  let LocalStorage = require('node-localstorage').LocalStorage;
  localStorage = new LocalStorage('./scratch');
}

const SpotifyPlayer = {
  play: async (musicUrl, botID, callback) => {
    // console.log(new Date(), "got a song to play. music_url: ", musicUrl);
    try {
      let cookies = [];
      let autoPlayInterval;
      let palyTime = '';
      let status = '';
      let s = {};
      let loadPlayer = null;
      let result = '';

      let chromeOptions = new chrome.Options();
      // chromeOptions.addArguments("--headless");
      chromeOptions.addArguments("--start-maximized");
      chromeOptions.addArguments("--no-sandbox");

      const driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(chromeOptions)
        .build();
      console.log(new Date(), `spotify_bot-${botID} -> Open chrome browser`);
      try {
        const fileContents = await fs.promises.readFile(`cookies_${botID}.json`);
        const data = fileContents.toString();
        cookies = JSON.parse(data);
      } catch (e) {
        status = `spotify_bot-${botID} ${e}`;
        console.log(new Date(), `spotify_bot-${botID}`, 'cookies', status);
        s = { type: 'error', details: status };
        localStorage.setItem('botstatus', JSON.stringify(s));
      }

      try {
        if (cookies.length <= 0) {
          // open the login page with next url to player with track
          await driver.get('https://accounts.spotify.com/en/login/?continue=' + musicUrl);
          // set username in text field
          await driver.findElement(By.id('login-username')).sendKeys(config.spotify_accounts[botID - 1].username);
          // set password in text field
          await driver.findElement(By.id('login-password')).sendKeys(config.spotify_accounts[botID - 1].password, Key.RETURN);
        } else {
          // Open spotify home page
          await driver.get('https://www.spotify.com/');
          // set logged in cookies
          for (c in cookies) {
            await driver.manage().addCookie(cookies[c]);
          }
          // open the player as logged in user with track
          await driver.sleep(3000);
          await driver.get(musicUrl);
        }

        // const element = By.css("[title='Pause']");
        // const pauseButton = driver.findElement(element);
        // await driver.wait(until.elementIsVisible(pauseButton), 20000);
        // console.log(new Date(), `spotify_bot-${botID}`, "track is now started playing in headless browser"); // status

        // //----------------- Take screenshot ------------------------
        // let i = 0;
        // screenshot = () => {
        //   console.log('take screenshot' `spotify_bot-${botID}`);
        //   i++;
        //   driver.takeScreenshot().then(
        //     function (image, err) {
        //       require('fs').writeFile(`screenshot/headless/chrome${i}.png`, image, 'base64', function (err) {
        //         console.log(`spotify_bot-${botID}`, err);
        //       });
        //     }
        //   );
        // }
        // setInterval(screenshot, 3 * 1000);
        // //---------------------------------------------------------

        loadPlayer = await driver.wait(until.elementLocated(By.className('playback-bar__progress-time')));
        
        status = `spotify_bot-${botID} track is now started playing in web player`;
        s = { type: 'success', details: status };
        console.log(new Date(), status);
        localStorage.setItem('botstatus', JSON.stringify(s));
        
        // ---------------------- autoPlay --------------------------
        async function autoPlay() {
          try {
            if (loadPlayer) {
              const result = await driver.executeScript(() => {
                const playcontrol_container = document.querySelector(".Root__top-container .player-controls .player-controls__buttons");
                const pauseTrack = playcontrol_container.querySelectorAll('.spoticon-play-16');
                const playTrack = playcontrol_container.querySelectorAll('.spoticon-pause-16');
                return pauseTrack.length > 0 ? 'paused' : playTrack.length > 0 ? 'playing' : 0;
              });
              if (result && result === 'paused') {
                // if (result && result === 'paused') player();
                const body = await driver.findElement(By.tagName("body"));
                body.sendKeys(Key.SPACE);
              }
            } else {
              console.log('Warn from autoPlay : Not loading music player properly', `spotify_bot-${botID}`);
            }
          } catch (e) {
            console.log('Error from autoPlay', `spotify_bot-${botID} : `, e);
          }
        }
        autoPlayInterval = setInterval(autoPlay, 5 * 1000);
        //--------------------------------------------------------------

        // -----------------------Player Input -------------------------
        async function player(input = 'play-pause') {
          try {
            if (loadPlayer) {
              if (input == 'prev') {
                await driver.executeScript((input) => {
                  const playcontrol_container = document.querySelector(".Root__top-container .player-controls .player-controls__buttons");
                  const play_button_container = playcontrol_container.querySelectorAll(".control-button-wrapper");
                  const button = play_button_container[1].querySelector('button');
                  button.click();
                });
              } else if (input == 'play-pause') {
                await driver.executeScript((input) => {
                  const playcontrol_container = document.querySelector(".Root__top-container .player-controls .player-controls__buttons");
                  const play_button_container = playcontrol_container.querySelectorAll(".control-button-wrapper");
                  const button = play_button_container[2].querySelector('button');
                  button.click();
                });
              } else if (input == 'next') {
                await driver.executeScript((input) => {
                  const playcontrol_container = document.querySelector(".Root__top-container .player-controls .player-controls__buttons");
                  const play_button_container = playcontrol_container.querySelectorAll(".control-button-wrapper");
                  const button = play_button_container[3].querySelector('button');
                  button.click();
                });
              }
            } else {
              console.log('Warn from player : Not loading music player properly', `spotify_bot-${botID}`);
            }
          } catch (e) {
            console.log('Error from function player ', `spotify_bot-${botID} :`, e);
          }
        }
        // -------------------------------------------------------------

        // --------------------- check play time -----------------------
        async function checkPlayTime() {
          try {
            if (loadPlayer) {
              const element = await driver.wait(until.elementLocated(By.className('playback-bar__progress-time')));
              const textPromise = await element.getText();
              // console.log(`spotify_bot-${botID}`, 'textPromise : ', textPromise);
              palyTime = textPromise;
              if (textPromise && textPromise > '0:35' && textPromise < '0:40') {                
                return true;
              } else if (textPromise && textPromise > '0:42') {
                // player('prev');  // comment this line if 1 bot play more than 1 song at a time or when stream song it may conflict.
                // return false;
              } else {
                return false;
              }
            } else {
              console.log('Warn from checkPlayTime : Not loading music player properly', `spotify_bot-${botID}`);
              return false;
            }
          } catch (e) {
            console.log('Error from checkPlayTime function: ', `spotify_bot-${botID}`, e);
            return false;
          }
        }
        // check playtime function every sec
        // let wait = setInterval(check, 1000); // comment this line if you use driver.wait()
        //-------------------------------------------------------------

        await driver.wait(checkPlayTime, 3 * 60 * 1000);

        status = `spotify_bot-${botID} song played for ${palyTime} seconds`;
        console.log(new Date(), 'status2', status);
        s = { type: 'success', details: status };
        localStorage.setItem('botstatus', JSON.stringify(s));
        // callback('done', botID, palyTime);
        result = 'done';
      } catch (e) {
        status = `spotify_bot-${botID} ${e}`;
        s = { type: 'error', details: status };
        console.log(new Date(), 'status3', status);
        localStorage.setItem('botstatus', JSON.stringify(s));
        // callback('error', botID, palyTime);
        result = 'error';
      } finally {
        cookies = await driver.manage().getCookies();
        fs.writeFile(`cookies_${botID}.json`, JSON.stringify(cookies), 'utf8', () => console.log(''));
        autoPlayInterval && clearInterval(autoPlayInterval);
        await driver.quit();
        callback(result, botID, palyTime);
        console.log(new Date(), `spotify_bot-${botID} -> Close chrome browser`);
        console.log(new Date(), `spotify_bot-${botID}`, '______________________________');
      }
    } catch (e) {
      console.log('Error in main try catch : ', `spotify_bot-${botID}`, e);
      await driver.quit();
      callback('UNEXPECTED_ERROR', botID, '00:00');
      console.log(new Date(), `spotify_bot-${botID} -> Close chrome browser`);
      console.log(new Date(), `spotify_bot-${botID}`, '______________________________');
    }
  }
};

module.exports = SpotifyPlayer;
