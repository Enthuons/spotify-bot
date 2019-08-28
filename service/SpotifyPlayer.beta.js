const config = require('../config.json');
let chromeOptions = null;
let driver = null;
let browserWindow = [];
let a = '';
let browserOpen = false;



async function openBrowser() {
  console.log('calling');
  if (!browserOpen) {
    for (i = 0; i < 3; i++) {
      const windowID = '';
      chromeOptions = new chrome.Options();
      // chromeOptions.addArguments("--headless");
      chromeOptions.addArguments("--no-sandbox");
      driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(chromeOptions)
        .build();
      windowID = await driver.getWindowHandle();
    
      const data = {
        botID: i+1,
        windowID: windowID, 
      }
      browserWindow.push(data);
    }
    browserOpen = true;
  }
}
openBrowser();











// const environment = process.env.ENV || 'development';
// const config = configs[environment];

const fs = require('fs');
const {Builder, By, Key, until} = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
 
const SpotifyPlayer = {
  play: async (musicUrl, botID, callback) => {
    // console.log(new Date(), "got a song to play. music_url: ", musicUrl);
    // console.log("opening: " + musicUrl);
    console.log('wd: ', browserWindow);
    let cookies = [];
    try {
      const fileContents = await fs.promises.readFile(`cookies_${botID}.json`);
      const data = fileContents.toString();
      cookies = JSON.parse(data);
    } catch (e) {
      console.log(new Date(), e);
    }

    // if (chromeOptions === null) {
    //   chromeOptions = new chrome.Options();
    //   // chromeOptions.addArguments("--headless");
    //   chromeOptions.addArguments("--no-sandbox");

    //   driver = await new Builder()
    //                 .forBrowser('chrome')
    //                 .setChromeOptions(chromeOptions)
    //                 .build();

    //  a = await driver.getWindowHandle();
    //  driver.switchTo().window(a); 
    //  driver.get("http://google.com");

    // }
    
    // if (chromeOptions === null) {

let i = 0;
for (i=0; i<3; i++) {
  chromeOptions = new chrome.Options();
  // chromeOptions.addArguments("--headless");
  chromeOptions.addArguments("--no-sandbox");

  driver = await new Builder()
                .forBrowser('chrome')
                .setChromeOptions(chromeOptions)
                .build();
      a = await driver.getWindowHandle();
      browserWindow.push(a);
}


    // }

    try {

      console.log('browserWindow__________ :', browserWindow);

      if (cookies.length <= 0) {
        // open the login page with next url to player with track
        await driver.get('https://accounts.spotify.com/en/login/?continue=' + musicUrl);
        // set username in text field
        await driver.findElement(By.id('login-username')).sendKeys(config.spotify_accounts[botID-1].username);
        // set password in text field
        await driver.findElement(By.id('login-password')).sendKeys(config.spotify_accounts[botID-1].password, Key.RETURN);
      } else {
        // Open spotify home page
        await driver.get('https://www.spotify.com/in/');
        // set logged in cookies
        for (c in cookies) {
          await driver.manage().addCookie(cookies[c]);
        }
        // open the player as logged in user with track
        await driver.get(musicUrl);
      }
      
      // const element = By.css("[title='Pause']");
      // const pauseButton = driver.findElement(element);
      // await driver.wait(until.elementIsVisible(pauseButton), 20000);
      console.log(new Date(), "track is now started playing in headless browser");

      let palyTime = '';
      await driver.sleep(10*1000);
      check = () => {
        var textPromise = driver.findElement(By.className("playback-bar__progress-time")).getText();
          return textPromise.then((text) => {
            if(text > '0:20' && text < '0:40') {
              console.log('><><><><><<<<>>>>> ', text);
              palyTime = text;
              return true;
            } else {
              return false
            }
            
            // return (text > '0:10' && text < '0:15')? true : false;
          })
        }

       await driver.wait(check, 60*1000);

      console.log(new Date(), "song played for ",palyTime," seconds");

    } catch (e) {
      console.log(new Date(), e);
    } finally {
      cookies = await driver.manage().getCookies();
      fs.writeFile(`cookies_${botID}.json`, JSON.stringify(cookies), 'utf8', () => console.log(''));
      // await driver.close();
      // await driver.quit();
      callback('done');
    }

  }
};

module.exports = SpotifyPlayer;