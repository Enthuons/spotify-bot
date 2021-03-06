const config = require('../config.json');
// const environment = process.env.ENV || 'development';
// const config = configs[environment];

const fs = require('fs');
const {Builder, By, Key, until} = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
 
const SpotifyPlayer = {
  play: async (musicUrl, botID, callback) => {
    // console.log(new Date(), "got a song to play. music_url: ", musicUrl);
    // console.log("opening: " + musicUrl);
    let cookies = [];
    try {
      const fileContents = await fs.promises.readFile(`cookies_${botID}.json`);
      const data = fileContents.toString();
      cookies = JSON.parse(data);
    } catch (e) {
      console.log(new Date(), e);
    }

    let chromeOptions = new chrome.Options();
    chromeOptions.addArguments("--headless");
    chromeOptions.addArguments("--no-sandbox");

    const driver = await new Builder()
                  .forBrowser('chrome')
                  .setChromeOptions(chromeOptions)
                  .build();
    try {
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
      await driver.sleep(50*1000);
      console.log(new Date(), "song played for 45 seconds");
    } catch (e) {
      console.log(new Date(), e);
    } finally {
      cookies = await driver.manage().getCookies();
      fs.writeFile(`cookies_${botID}.json`, JSON.stringify(cookies), 'utf8', () => console.log(''));
      // fs.writeFile(`cookies_${botID}.json`, JSON.stringify(cookies), 'utf8');
      await driver.quit();
      callback('done');
    }
    
  }
};

module.exports = SpotifyPlayer;