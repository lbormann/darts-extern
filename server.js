const express = require('express');
const app = express();
const puppeteer = require('puppeteer');
// const config = require('config');
const args = require('minimist')(process.argv.slice(2));
const os = require('os');
const pjson = require('./package.json');
const { exit } = require('process');


const supportedGameVariants = ['X01']
const supportedExternPlatforms = ['lidarts']

const autodartsUrl = "https://autodarts.io";
const lidartsUrl = "https://lidarts.org/login";



let _browser;
let _page;



async function setupLidarts(page){
  // await page.setViewport({width: 0, height: 0});
  await page.goto(lidartsUrl, {waitUntil: 'networkidle2'});
  // await page.waitForTimeout(1000); 

  // user login required?
  const [buttonLogout] = await page.$x("//a[contains(@href,'/logout')]/@href");

  if(buttonLogout){
    console.log("Lidarts: user already logged in!");
  }else{
    console.log("Lidarts: login user!");
    await page.focus("#email");
    await page.keyboard.type(lidartsUser);
    await page.focus("#password");
    await page.keyboard.type(lidartsPassword);
    await page.$eval('button[type=submit]', el => el.click());
  }
  await page.waitForTimeout(200);

  // wait for initial score to get x01-start points
  const pointsElement = await page.waitForSelector('#p1_score', {visible: true, timeout: 0});
  await page.waitForTimeout(1000);
  const text = await (await pointsElement.getProperty('textContent')).jsonValue();
  return text;
}


async function setupAutodarts(points){
  var page = await _browser.newPage();
  // await page.setViewport({width: 0, height: 0});
  await page.goto(autodartsUrl, {waitUntil: 'networkidle2'});
  // await page.waitForTimeout(1500);
  // await page.waitForNavigation()

    // user login required?
    const [buttonLogout] = await page.$x("//button[contains(.,'Sign Out')]");
    if(buttonLogout){
      console.log("Autodarts: user already logged in!");
    }else{
      console.log("Autodarts: login user!");
      await page.focus("#username");
      await page.keyboard.type(autodartsUser);
      await page.focus("#password");
      await page.keyboard.type(autodartsPassword);

      const loginButton = await page.waitForSelector('#kc-login', {visible: true});
      await loginButton.click();

      // await page.waitForNavigation()
      await page.waitForTimeout(1000);
    }


  // TODO: find 'dark-mode-button' if available
  // await page.$eval('button[aria-label="Switch to dark mode"]', el => el.click());
  // const buttonDarkMode = await page.waitForSelector('button[aria-label=\'Switch to dark mode\']', {visible: true});
  // await buttonDarkMode.click();


  await page.goto("https://autodarts.io/lobbies/new/x01", {waitUntil: 'networkidle2'});
  // await page.waitForTimeout(1000); 

  const [buttonPoints] = await page.$x("//button[contains(., " + points + ")]");
  if (buttonPoints) {
      await buttonPoints.click();
  }else{
    console.log('Autodarts does not support X01 with ' + points);
  }

  await page.waitForTimeout(300);

  const [buttonVisibility] = await page.$x("//button[contains(.,'Private')]");
  if (buttonVisibility) {
      await buttonVisibility.click();
  }

  await page.waitForTimeout(300);

  const [buttonOpenLobby] = await page.$x("//button[contains(., 'Open Lobby')]");
  if (buttonOpenLobby) {
      await buttonOpenLobby.click();
  }

  await page.waitForTimeout(500);

  const [buttonStartMatch] = await page.$x("//button[contains(., 'Start')]");
  if (buttonStartMatch) {
      await buttonStartMatch.click();
  }
}

async function inputThrow(page, throwPoints){
    await page.focus("#score_value");
    await page.keyboard.type(throwPoints);
    await page.keyboard.press('Enter');
}



console.log('\r\n')
console.log('##########################################')
console.log('       WELCOME TO AUTODARTS-EXTERN')
console.log('##########################################')
console.log('VERSION: ' + pjson.version)
console.log('RUNNING OS: ' + os.type() + ' | ' + os.platform() + ' | ' + os.release())
console.log('SUPPORTED GAME-VARIANTS: ' + supportedGameVariants)
console.log('SUPPORTED EXTERN-PLATFORMS: ' + supportedExternPlatforms)
console.log('\r\n')


if (!args.autodarts_user) {
  console.log('"--autodarts_user" is required');
  process.exit(0);
}
if (!args.autodarts_password) {
  console.log('"--autodarts_password" is required');
  process.exit(0);
}
if (!args.extern_platform || supportedExternPlatforms.indexOf(args.extern_platform) < 0) {
  console.log('"--extern_platform" is required. Supported values: ' + supportedExternPlatforms);
  process.exit(0);
}

const autodartsUser = args.autodarts_user; // config.get('autodarts_user');
const autodartsPassword = args.autodarts_password; // config.get('autodarts_password');
const externPlatform = args.extern_platform;

if (externPlatform == 'lidarts' && (!args.lidarts_user || !args.lidarts_password)){
  console.log('"--lidarts_user" and "--lidarts_password" is required');
  process.exit(0);
}
const lidartsUser = args.lidarts_user;           // config.get('lidarts_user');
const lidartsPassword = args.lidarts_password;   // config.get('lidarts_password');



app.get('/throw/:user/:throwNumber/:throwPoints/:pointsLeft/:busted/:variant', function (req, res) {
  // console.log(req);
  var throwPoints = req.params.throwPoints;

  _page
  .then((page) => {
    inputThrow(page, throwPoints);
  });

  res.end('Throw received')
});


// Start a http listener as receiver for throws
var server = app.listen(8080, function () {
    var host = server.address().address
    var port = server.address().port
    console.log("Taking throws at http://%s:%s", host, port)
});


puppeteer
.launch({
  userDataDir: 'myChromeSession',
  headless: false, 
  defaultViewport: {width: 0, height: 0},
  // devtools: true,
  args: ['--start-maximized', '--hide-crash-restore-bubble'],
  // slowMo: 250, // slow down by 250ms
})
.then((browser) => (_browser = browser))
.then((browser) => (_page = browser.newPage())
.then((page) => {
    setupLidarts(page).then((p) => {
      setupAutodarts(p);
    });
}));


  









// // solange bis benutzer ESP drückt
// while(1){
//   eDP = askForExternDartsPlatform();

//   switch (eDP) {
//     case "lidarts":
//       waitForExternMatch();
//       break;
//     case "webcamdarts":
//       break;
//     // default:
//     //   break;
//   }

// }


function askForExternDartsPlatform(){
  var externDartsPlatform = "lidarts";

  return externDartsPlatform;
}

