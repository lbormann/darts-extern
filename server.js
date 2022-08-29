const express = require('express');
const app = express();
const puppeteer = require('puppeteer');
const args = require('minimist')(process.argv.slice(2));
const os = require('os');
const pjson = require('./package.json');
const { exit } = require('process');


const supportedGameVariants = ['X01']
const supportedExternPlatforms = ['lidarts']

const autodartsUrl = "https://autodarts.io";
const lidartsUrl = "https://lidarts.org/login";
DEBUG = false


let _browser;
let _page;



async function setupLidarts(page){

  // kills initial browser-tab
  const pages = (await _browser.pages());
  if(pages.length >= 2){
    await pages[0].close();
  }

  await page.goto(lidartsUrl, {waitUntil: 'networkidle0'});
  // await page.waitForTimeout(1000); 

  // user login required?
  const [buttonLogout] = await page.$x("//a[contains(@href,'/logout')]/@href");

  if(!buttonLogout){
    console.log("Lidarts: login user!");
    await page.focus("#email");
    await page.keyboard.type(lidartsUser);
    await page.focus("#password");
    await page.keyboard.type(lidartsPassword);
    await page.$eval('button[type=submit]', el => el.click());
  }
  await page.waitForTimeout(200);

  // wait for initial score to get x01-start points
  // that is fucking ugly..
  await page.waitForSelector('#p1_score', {visible: true, timeout: 0});
  await page.waitForFunction(
    'parseInt(document.querySelector("#p1_score").innerText) > 100',
    {visible: true, timeout: 0}
  );
  const pointsElement = await page.waitForSelector('#p1_score', {visible: true, timeout: 0});
  const initialPoints = await (await pointsElement.getProperty('textContent')).jsonValue();
  return initialPoints;
}

async function waitLidartsMatch(page){
   // wait for match-shot-modal
  await page.waitForSelector('#match-shot-modal', {visible: true, timeout: 0});
  console.log('Lidarts: gameshot & match');

  // TODO: DRY..
  const pages = (await _browser.pages());

  const [buttonAbort] = await pages[1].$x("//button[contains(.,'Abort')]");
  if (buttonAbort) {
      console.log('Autodarts: close current game');
      await buttonAbort.click();
      await pages[1].waitForTimeout(2000);
  }else{
    console.log('Autodarts: Abort-button not found');
  }

  // wait a bit, so the user can see the match result
  await page.waitForTimeout(timeBeforeExit);

  process.exit(0);
}

async function waitLidartsGame(page){
    // wait for game-shot-modal
    await page.waitForSelector('#game-shot-modal', {visible: true, timeout: 0});
    console.log('Lidarts: gameshot');

    // wait for dialog to close, so its NOT triggered/ recognized on next run
    await page.waitForTimeout(4000);
    
    return true;
}

async function loopAutodarts(points){
  const pages = (await _browser.pages());
  
  const [buttonAbort] = await pages[1].$x("//button[contains(.,'Abort')]");
  if (buttonAbort) {
      console.log('Autodarts: close current game');
      await buttonAbort.click();
      await pages[1].waitForTimeout(2000);
  }else{
    console.log('Autodarts: Abort-button not found');
  }

  setupAutodarts(points, false, pages[1]);

  waitLidartsGame(pages[0]).then((val) => {
    loopAutodarts(points);
  });
}


async function setupAutodarts(points, nav=true, pageExtern=false){
  if(nav == true){

    // var page = await _browser.newPage();
    var context = await _browser.createIncognitoBrowserContext();
    var page = await context.newPage();
    await page.goto(autodartsUrl, {waitUntil: 'networkidle0'});
    // await page.waitForTimeout(1000);
    // await page.waitForNavigation();

    // user login required?
    const [buttonLogout] = await page.$x("//button[contains(.,'Sign Out')]");
    if(!buttonLogout){
      console.log("Autodarts: login user!");
      await page.focus("#username");
      await page.keyboard.type(autodartsUser);
      await page.focus("#password");
      await page.keyboard.type(autodartsPassword);

      const loginButton = await page.waitForSelector('#kc-login', {visible: true});
      await loginButton.click();

      // await page.waitForNavigation()
      await page.waitForTimeout(2000);
    }

    // switches to dark-mode
    const [buttonDarkMode] = await page.$x("//button[@aria-label='Switch to light mode']");
    if (buttonDarkMode) {
        await buttonDarkMode.click();
    }
  }else{
    var page = pageExtern;
  }


  await page.goto("https://autodarts.io/lobbies/new/x01", {waitUntil: 'networkidle0'});
  // await page.waitForTimeout(2000); 

  // only when we are visiting first time we need to configure the game
  if(nav == true){
    const [buttonPoints] = await page.$x("//button[contains(., " + points + ")]");
    if (buttonPoints) {
        await buttonPoints.click();
    }else{
      console.log('Autodarts does not support X01 with ' + points);
    }
    await page.waitForTimeout(150);
  
    const [buttonVisibility] = await page.$x("//button[contains(.,'Private')]");
    if (buttonVisibility) {
        await buttonVisibility.click();
    }
    await page.waitForTimeout(150);
  }

  // go to lobby-area
  const [buttonOpenLobby] = await page.$x("//button[contains(.,'Open Lobby')]");
  if (buttonOpenLobby) {
      await buttonOpenLobby.click();
  }
  await page.waitForTimeout(1500);
  
  // only when we are visiting first time we need to configure the game
  if(nav == true){
    // there is only one select - we are lucky
    await page.select('select', autodartsBoardId);
  }
  
  // start the game
  const [buttonStartMatch] = await page.$x("//button[contains(.,'Start')]");
  if (buttonStartMatch) {
      await buttonStartMatch.click();
  }
}

async function inputThrow(page, throwPoints){
    await page.focus("#score_value");
    await page.keyboard.type(throwPoints);
    await page.keyboard.press('Enter');

    // TODO: best-practice..
    if(lidartsSkipDartModals == true || lidartsSkipDartModals == "true" || lidartsSkipDartModals == "True"){
      await page.waitForTimeout(250);
      console.log('Lidarts: skip dart modals');
    
      // <button type="button" class="btn btn-primary double-missed-1 btn-lg mt-2" data-dismiss="modal" id="double-missed-1">1</button>
      try {
        buttonMissedZero = await page.waitForSelector('#double-missed-0', {visible: true, timeout: 1500});
        await buttonMissedZero.click();
        await page.waitForTimeout(100);
      } catch(error) {
        // console.log('button 0 not there');
      }
      try {
        buttonMissedOne = await page.waitForSelector('#double-missed-1', {visible: true, timeout: 1500});
        await buttonMissedOne.click();
        await page.waitForTimeout(100);
      } catch(error) {
        // console.log('button 1 not there');
      }
      try {
        buttonMissedTwo = await page.waitForSelector('#double-missed-2', {visible: true, timeout: 1500});
        await buttonMissedTwo.click();
        await page.waitForTimeout(100);
      } catch(error) {
        // console.log('button 2 not there');
      }
      try {
        buttonMissedThree = await page.waitForSelector('#double-missed-3', {visible: true, timeout: 1500});
        await buttonMissedThree.click();
        await page.waitForTimeout(100);
      } catch(error) {
        // console.log('button 3 not there');
      }

      // <button type="button" class="btn btn-primary btn-lg mt-2" data-dismiss="modal" id="to-finish-3">3</button>
      try {
        buttonFinishOne = await page.waitForSelector('#to-finish-1', {visible: true, timeout: 1500});
        await buttonFinishOne.click();
        await page.waitForTimeout(100);
      } catch(error) {
        // console.log('buttonf 1 not there');
      }
      try {
        buttonFinishTwo = await page.waitForSelector('#to-finish-2', {visible: true, timeout: 1500});
        await buttonFinishTwo.click();
        await page.waitForTimeout(100);
      } catch(error) {
        // console.log('buttonf 2 not there');
      }
      try {
        buttonFinishThree = await page.waitForSelector('#to-finish-3', {visible: true, timeout: 1500});
        await buttonFinishThree.click();
        await page.waitForTimeout(100);
      } catch(error) {
        // console.log('buttonf 3 not there');
      }


    }
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


// Check for required arguments
if (!args.autodarts_user) {
  console.log('"--autodarts_user" is required');
  process.exit(0);
}
if (!args.autodarts_password) {
  console.log('"--autodarts_password" is required');
  process.exit(0);
}
if (!args.autodarts_board_id){
  console.log('"--autodarts_board_id" is required');
  process.exit(0);
}
if (!args.extern_platform || supportedExternPlatforms.indexOf(args.extern_platform) < 0) {
  console.log('"--extern_platform" is required. Supported values: ' + supportedExternPlatforms);
  process.exit(0);
}
if (args.extern_platform == 'lidarts' && (!args.lidarts_user || !args.lidarts_password)){
  console.log('"--lidarts_user" and "--lidarts_password" is required');
  process.exit(0);
}


const autodartsUser = args.autodarts_user; 
const autodartsPassword = args.autodarts_password;
const autodartsBoardId = args.autodarts_board_id
var timeBeforeExit = args.time_before_exit;
const externPlatform = args.extern_platform;
const lidartsUser = args.lidarts_user;           
const lidartsPassword = args.lidarts_password; 
var lidartsSkipDartModals = args.lidarts_skip_dart_modals;

// Check for optional arguments
if(!timeBeforeExit){
  timeBeforeExit = 10000;
}
if(!lidartsSkipDartModals){
  lidartsSkipDartModals = false;
}



app.get('/throw/:user/:throwNumber/:throwPoints/:pointsLeft/:busted/:variant', function (req, res) {
  // console.log(req);
  var user = req.params.user;
  var throwNumber = req.params.throwNumber;
  var throwPoints = req.params.throwPoints;
  var pointsLeft = req.params.pointsLeft;
  var busted = req.params.busted;
  var variant = req.params.variant;
  var msg = 'Throw received - user:' + user + ' Throw-Number: ' + throwNumber + ' Throw-Points: ' + throwPoints + ' Points-Left: ' + pointsLeft + ' Busted: ' + busted + ' Variant: ' + variant;
  console.log(msg);

  _page
  .then((page) => {
    inputThrow(page, throwPoints);
  });

  res.end(msg)
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
  devtools: DEBUG,
  args: [ '--start-maximized', '--hide-crash-restore-bubble'], // '--start-maximized', '--window-size=540,960'
  // slowMo: 250, // slow down by 250ms
})
.then((browser) => (_browser = browser))
.then((browser) => (_page = browser.newPage())
.then((page) => {

      setupLidarts(page).then((points) => {
        waitLidartsMatch(page);
        setupAutodarts(points);
      });

      waitLidartsGame(page).then((val) => {
        loopAutodarts();
      });
        
}));
