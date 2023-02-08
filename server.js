const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(express.json())
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser.json());
const puppeteer = require('puppeteer');
//const puppeteer = require('puppeteer-core');
//const puppeteer = require('puppeteer-extra');
const args = require('minimist')(process.argv.slice(2));
const os = require('os');
const pjson = require('./package.json');
const { exit } = require('process');


// Add stealth plugin and use defaults (all tricks to hide puppeteer usage)
// STORAGE DOES NOT WORK WITH STEALTH
//const StealthPlugin = require('puppeteer-extra-plugin-stealth')
//puppeteer.use(StealthPlugin())

// Add adblocker plugin to block all ads and trackers (saves bandwidth)
// const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker')
// puppeteer.use(AdblockerPlugin({ blockTrackers: true }))



const supportedGameVariants = ['X01','Cricket']
const supportedCricketFields = ['15','16','17','18','19','20','25']

const lidarts = 'lidarts'
const nakka = 'nakka'
const dartboards = 'dartboards'
const webcamdarts = 'webcamdarts'
const supportedExternPlatforms = [lidarts, nakka, dartboards]

const autodartsUrl = "https://autodarts.io";
const lidartsUrl = "https://lidarts.org/login";
const nakkaUrl = "https://nakka.com/n01/online/n01_v2/setting.php"
const dartboardsUrl = "https://dartboards.online"
const webcamdartsUrl = "https://www.webcamdarts.com/GameOn"
//const webcamdartsUrl = 'https://www.webcamdarts.com/GameOn/Lobby/ExternalLogin?ReturnUrl=%2FGameOn%2FLobby'
//const webcamdartsUrl = "https://www.webcamdarts.com/GameOn/Lobby/Loginuser?ReturnUrl=%2fGameOn%2fLobby"




DEBUG = false


let _browser;
let _page;


async function setupExternPlatform(page){

  // kills initial browser-tab
  const pages = (await _browser.pages());
  if(pages.length >= 2){
    await pages[0].close();
  }

  switch (externPlatform) {
    case lidarts:
      return await setupLidarts(page);
    case nakka:
      return await setupNakka(page);
    case dartboards:
      return await setupDartboards(page);
    case webcamdarts:
      return await setupWebcamdarts(page);
  }
}
async function setupLidarts(page){
  console.log('Lidarts: Setup');
  await page.goto(lidartsUrl, {waitUntil: 'networkidle0'});

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

  // decide game-variant
  await page.waitForFunction(
      'document.querySelector("#cricket_scoreboard") != null || document.querySelector("#change-keypad") != null',
      {visible: true, timeout: 0}
    );
  variant = 'X01';
  try{
    await page.waitForSelector('#cricket_scoreboard', {visible: true, timeout: 1000});
    variant = 'Cricket';
    console.log("Lidarts: Cricket");
  }catch(error){
    console.log("Lidarts: X01");
  }

  // Send start-message
  if(lidartsChatMessageStart != ""){
    await page.waitForTimeout(2500);
    if(variant == 'X01'){
      const chatButton = await page.waitForSelector('#chat-tab', {visible: true, timeout: 0});
      await chatButton.click();
      await page.waitForSelector('#message', {visible: true, timeout: 0});
      await page.focus("#message");
      await page.keyboard.type(lidartsChatMessageStart);
      await page.keyboard.press('Enter');
    }else{
      // TODO: maybe fix
      // const openChatButton = await page.waitForSelector('#toggle-chat', {visible: true, timeout: 0});
      // await openChatButton.click();    
      // await page.waitForSelector('#message', {visible: true, timeout: 0});
      // await page.focus("#message");
      // await page.keyboard.type(lidartsChatMessageStart);
      // await page.keyboard.press('Enter');
      // await openChatButton.click(); 
    }
  }

  // Return game-configuration
  initialPoints = 'Cricket'
  if(variant == 'X01'){
    await page.waitForSelector('#p1_score', {visible: true, timeout: 0});
    // wait for initial score to get x01-start points
    // that is fucking ugly..
    await page.waitForFunction(
      'parseInt(document.querySelector("#p1_score").innerText) > 100',
      {visible: true, timeout: 0}
    );
    const pointsElement = await page.waitForSelector('#p1_score', {visible: true, timeout: 0});
    initialPoints = await (await pointsElement.getProperty('textContent')).jsonValue();
  }else{
    // Wait for possible bulling-action
    try{
      // closest_to_bull_notification_div
      await page.waitForSelector('#closest_to_bull_notification', {visible: true, timeout: 2000});
      await page.waitForSelector('#closest_to_bull_notification', { hidden: true, timeout: 0 });
    }catch(error){
      // no bulling
    }
  }
  return initialPoints;
}
async function setupNakka(page){
  console.log('Nakka: Setup');
  await page.goto(nakkaUrl, {waitUntil: 'networkidle0'});

  // user login required?
  try {
    await page.waitForSelector('#title_player_name', {visible: true, timeout: 2000});
  } catch(error) {
    console.log("Nakka: login user!");
  }

  await page.waitForTimeout(200);

  const pointsElement = await page.waitForSelector('.p1left', {visible: true, timeout: 0});
  const initialPoints = await (await pointsElement.getProperty('textContent')).jsonValue();
  return initialPoints;
}
async function setupDartboards(page){
  console.log('Dartboards: Setup');
  await page.goto(dartboardsUrl, {waitUntil: 'networkidle0'});

  await page.waitForTimeout(1500);

  // cookies acceptance required?
  const [buttonCookiesAcceptance] = await page.$x("//a[contains(@href,'/acceptcookies')]/@href");
  try {
    if (buttonCookiesAcceptance) {
      console.log("Dartboards: accepting cookies!");
      await page.goto("https://dartboards.online/acceptcookies", {waitUntil: 'networkidle0'});
    }
  } catch(error) {
    //console.log('dartboards: error accepting cookies');
  }

  // user login required?
  const [buttonLogin] = await page.$x("//a[contains(@href,'https://dartboards.online/login')]/@href");

  if(buttonLogin){
    console.log("Dartboards: login user!");
    await page.goto("https://dartboards.online/login", {waitUntil: 'networkidle0'});

    await page.focus("#email");
    await page.keyboard.type(dartboardsUser);
    await page.focus("#password");
    await page.keyboard.type(dartboardsPassword);
    await page.$eval('button[type=submit]', el => el.click());
  }
  await page.waitForTimeout(600);


  // cookies acceptance required?
  const [buttonCookieAccept] = await page.$x("//a[@aria-label='allow cookies']");
  try {
    if (buttonCookieAccept) {
      await buttonCookieAccept.click();
    }
  } catch(error) {
    // console.log('dartboards: error accepting cookies');
  }

  // wait for initial score to get x01-start points
  // that is fucking ugly..
  await page.waitForSelector('.game-player-score', {visible: true, timeout: 0});
  await page.waitForFunction(
    'parseInt(document.querySelector(".game-player-score").innerText) > 100',
    {visible: true, timeout: 0}
  );
  const pointsElement = await page.waitForSelector('.game-player-score', {visible: true, timeout: 0});
  const initialPoints = await (await pointsElement.getProperty('textContent')).jsonValue();
  return initialPoints;
}
async function setupWebcamdarts(page){
  console.log('Webcamdarts: Setup');
  await page.goto(webcamdartsUrl, {waitUntil: 'networkidle0'});
 
  // user login required?
  // try {
  //   await page.waitForSelector('#title_player_name', {visible: true, timeout: 2000});
  // } catch(error) {
  //   console.log("Webcamdarts: login user!");
  // }

  // await page.waitForTimeout(200);

  
  // wait for initial score to get x01-start points
  // that is fucking ugly..
  await page.waitForSelector('.text-scores', {visible: true, timeout: 0});
  console.log('webcamdarts: das element ist da.')
  await page.waitForFunction(
    'parseInt(document.querySelector(".text-scores").innerText) > 100',
    {visible: true, timeout: 0}
  );
  const pointsElement = await page.waitForSelector('.text-scores', {visible: true, timeout: 0});
  const initialPoints = await (await pointsElement.getProperty('textContent')).jsonValue();
  console.log(initialPoints);
  return initialPoints;
}

async function waitExternMatch(page){
  
  switch (externPlatform) {
    case lidarts:
      await waitLidartsMatch(page);
      break;
    case nakka:
      await waitNakkaMatch(page);
      break;
    case dartboards:
      await waitDartboardsMatch(page);
      break;
    case webcamdarts:
      await waitWebcamdartsMatch(page);
      break;
      
  }

  await abortAutodartsGame()

  // wait a bit, so the user can see the match result
  await page.waitForTimeout(timeBeforeExit);

  // due to some technical things some portals create another AD-Game - we kill it just in case
  await abortAutodartsGame()

  process.exit(0);
}
async function waitLidartsMatch(page){
    // wait for match-shot-modal
    await page.waitForSelector('#match-shot-modal', {visible: true, timeout: 0});
    console.log('Lidarts: gameshot & match');
  
    // Send end-message
    if(lidartsChatMessageEnd != ""){
      await page.waitForTimeout(4000);
      const chatButton = await page.waitForSelector('#chat-tab', {visible: true, timeout: 0});
      await chatButton.click();
      await page.waitForSelector('#message', {visible: true, timeout: 0});
      await page.focus("#message");
      await page.keyboard.type(lidartsChatMessageEnd);
      await page.keyboard.press('Enter');
    }
}
async function waitNakkaMatch(page){
  // wait for match-shot-modal
  // <td id="msg_net_text" class="message_msg" style="padding: 5.51px 55.1px 110.2px;">Winner is wusAAAAAA</td>
  //await page.waitForSelector('#msg_net_text', {visible: true, timeout: 0});
  await page.waitForFunction(
    'document.querySelector("#msg_net_text").innerText.includes("Winner is")',
    {visible: true, timeout: 0}
  );
  console.log('Nakka: gameshot & match');
}
async function waitDartboardsMatch(page){
  // wait for match-shot-modal
  await page.waitForSelector('#modal-game-results___BV_modal_title_', {visible: true, timeout: 0});
  console.log('Dartboards: gameshot & match');
}
async function waitWebcamdartsMatch(page){
  // wait for match-shot-modal
  await page.waitForFunction(
    'document.querySelector("h1").innerText.includes("Game is now finished.")',
    {visible: true, timeout: 0}
  );
  console.log('Webcamdarts: gameshot & match');
}

async function waitExternGame(page){
  switch (externPlatform) {
    case lidarts:
      return await waitLidartsGame(page);
    case nakka:
      return await waitNakkaGame(page);
    case dartboards:
      return await waitDartboardsGame(page);
    case webcamdarts:
      return await waitWebcamdartsGame(page);
  }
}
async function waitLidartsGame(page){
    // wait for game-shot-modal
    await page.waitForSelector('#game-shot-modal', {visible: true, timeout: 0});
    console.log('Lidarts: gameshot');

    // wait for dialog to close, so its NOT triggered/ recognized on next run
    await page.waitForTimeout(4000);
    
    return true;
}
async function waitNakkaGame(page){
  // wait for game-shot-modal
  // <div id="msg_ok" class="msg_button" style="padding: 11.565px 0px; margin: 0px 11.565px 11.565px 5.7825px;">OK</div>
  buttonOk = await page.waitForSelector('.message_btn_ok', {visible: true, timeout: 0});
  await buttonOk.click();

  //await page.waitForSelector('#msg_text', {visible: true, timeout: 0});
  console.log('Nakka: gameshot');

  // wait for dialog to close, so its NOT triggered/ recognized on next run
  await page.waitForTimeout(300);
  
  return true;
}
async function waitDartboardsGame(page){

  //await page.waitForTimeout(500);

  // wait for game-shot-modal
  await page.waitForSelector('#modal-leg-end___BV_modal_header_', {visible: true, timeout: 0});
  
  // <button data-v-2e80cb5e="" type="button" class="btn leg-button btn-success btn-lg"><span data-v-2e80cb5e="">Nächstes Leg starten</span></button>
  const nextLegButton = await page.waitForSelector('.btn-success', {visible: true, timeout: 0});
  nextLegButton.click();

  console.log('Dartboards: gameshot');

  // wait for dialog to close, so its NOT triggered/ recognized on next run
  await page.waitForTimeout(300);
  
  return true;
}
async function waitWebcamdartsGame(page){
  // wait for game-shot-modal
  await page.waitForSelector('.text-scores', {visible: true, timeout: 0});
  await page.waitForFunction(
    'parseInt(document.querySelector(".text-scores").innerText) > 100',
    {visible: true, timeout: 0}
  );
  const pointsElement = await page.waitForSelector('.text-scores', {visible: true, timeout: 0});
  const initialPoints = await (await pointsElement.getProperty('textContent')).jsonValue();

  // wait for dialog to close, so its NOT triggered/ recognized on next run
  await page.waitForTimeout(300);
  
  return true;
}

async function inputThrow(page, throwPoints, pointsLeft, variant){

  // fix autodarts stop
  // ✊
  // const pages = (await _browser.pages());

  // const [buttonAbort] = await pages[1].$x("//button[contains(.,'Abort')]");
  // if (buttonAbort) {
  //     console.log('Autodarts: close current game');
  //     await buttonAbort.click();
  //     await pages[1].waitForTimeout(2000);
  // }else{
  //   console.log('Autodarts: Abort-button not found');
  // }

  switch (externPlatform) {
    case lidarts:
      await inputThrowLidarts(page, throwPoints, variant);
      break;
    case nakka:
      await inputThrowNakka(page, throwPoints);
      break;
    case dartboards:
      await inputThrowDartboards(page, throwPoints);
      break;
    case webcamdarts:
      await inputThrowWebcamdarts(page, throwPoints);
      break;
  }
}
async function inputThrowLidarts(page, throwPoints, variant){

  if(variant == 'X01'){
    await page.focus("#score_value");
    await page.keyboard.type(throwPoints);
    await page.keyboard.press('Enter');

  }else if(variant == 'Cricket'){
    points = throwPoints.split('x');

    if(points.length >= 1){
      var t1 = points[0].substring(1);
      if(supportedCricketFields.indexOf(t1) >= 0){
        buttonValue = await page.waitForSelector('#score-button-' + points[0], {visible: true, timeout: 0});
        await buttonValue.click();
        await page.waitForTimeout(130);
      }
    }
    if(points.length >= 2){
      var t2 = points[1].substring(1);
      if(supportedCricketFields.indexOf(t2) >= 0){
        buttonValue = await page.waitForSelector('#score-button-' + points[1], {visible: true, timeout: 0});
        await buttonValue.click();
        await page.waitForTimeout(130);
      }
    }
    if(points.length == 3){
      var t3 = points[2].substring(1);
        if(supportedCricketFields.indexOf(t3) >= 0){
        buttonValue = await page.waitForSelector('#score-button-' + points[2], {visible: true, timeout: 0});
        await buttonValue.click();
        await page.waitForTimeout(130);
      }
    }
    await page.waitForTimeout(150);
    const buttonConfirm = await page.waitForSelector('#score-confirm', {visible: true, timeout: 0});
    await buttonConfirm.click();
  }else{
    console.log('Variant: ' + variant + ' not supported');
  }


  // TODO: correct AD-points when there is a difference to lidarts (currently not possible)
  // get points current from lidarts
  //const pointsElement = await page.waitForSelector('#p1_score', {visible: true, timeout: 0});
  //const currentPoints = await (await pointsElement.getProperty('textContent')).jsonValue();
  //console.log('Lidarts: current Points: ' + currentPoints);
  //await correctAutodartsPoints(currentPoints, throwPoints, pointsLeft);

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
async function inputThrowNakka(page, throwPoints){
  // .score_input .p1score 
  await page.focus(".input_area");
  await page.keyboard.type(throwPoints);
  await page.keyboard.press('Enter');

  // TODO: correct AD-points when there is a difference to nakka

  // TODO: best-practice..
  if(nakkaSkipDartModals == true || nakkaSkipDartModals == "true" || nakkaSkipDartModals == "True"){
    await page.waitForTimeout(250);
    console.log('Nakka: skip dart modals');

    try {
      buttonFinishOne = await page.waitForSelector('#finish_first', {visible: true, timeout: 1500});
      await buttonFinishOne.click();
      await page.waitForTimeout(100);
    } catch(error) {
      // console.log('buttonf 1 not there');
    }
    try {
      buttonFinishSecond = await page.waitForSelector('#finish_second', {visible: true, timeout: 1500});
      await buttonFinishSecond.click();
      await page.waitForTimeout(100);
    } catch(error) {
      // console.log('buttonf 2 not there');
    }
    try {
      buttonFinishThird = await page.waitForSelector('#finish_third', {visible: true, timeout: 1500});
      await buttonFinishThird.click();
      await page.waitForTimeout(100);
    } catch(error) {
      // console.log('buttonf 3 not there');
    }
  }
}
async function inputThrowDartboards(page, throwPoints){
  await page.focus(".outline-white");
  await page.keyboard.type(throwPoints);
  await page.keyboard.press('Enter');

  // TODO: correct AD-points when there is a difference to dartboards

  // TODO: best-practice..
  if(dartboardsSkipDartModals == true || dartboardsSkipDartModals == "true" || dartboardsSkipDartModals == "True"){
    await page.waitForTimeout(250);
    console.log('Dartboards: skip dart modals');

    // try {
    //   buttonFinishOne = await page.waitForSelector('#finish_first', {visible: true, timeout: 1500});
    //   await buttonFinishOne.click();
    //   await page.waitForTimeout(100);
    // } catch(error) {
    //   // console.log('buttonf 1 not there');
    // }
    // try {
    //   buttonFinishSecond = await page.waitForSelector('#finish_second', {visible: true, timeout: 1500});
    //   await buttonFinishSecond.click();
    //   await page.waitForTimeout(100);
    // } catch(error) {
    //   // console.log('buttonf 2 not there');
    // }
    // try {
    //   buttonFinishThird = await page.waitForSelector('#finish_third', {visible: true, timeout: 1500});
    //   await buttonFinishThird.click();
    //   await page.waitForTimeout(100);
    // } catch(error) {
    //   // console.log('buttonf 3 not there');
    // }
  }
}
async function inputThrowWebcamdarts(page, throwPoints){
  await page.focus(".outline-white");
  await page.keyboard.type(throwPoints);
  await page.keyboard.press('Enter');

  // TODO: correct AD-points when there is a difference to webcamdarts

  // TODO: best-practice..
  if(webcamdartsSkipDartModals == true || webcamdartsSkipDartModals == "true" || webcamdartsSkipDartModals == "True"){
    await page.waitForTimeout(250);
    console.log('Webcamdarts: skip dart modals');

    // try {
    //   buttonFinishOne = await page.waitForSelector('#finish_first', {visible: true, timeout: 1500});
    //   await buttonFinishOne.click();
    //   await page.waitForTimeout(100);
    // } catch(error) {
    //   // console.log('buttonf 1 not there');
    // }
    // try {
    //   buttonFinishSecond = await page.waitForSelector('#finish_second', {visible: true, timeout: 1500});
    //   await buttonFinishSecond.click();
    //   await page.waitForTimeout(100);
    // } catch(error) {
    //   // console.log('buttonf 2 not there');
    // }
    // try {
    //   buttonFinishThird = await page.waitForSelector('#finish_third', {visible: true, timeout: 1500});
    //   await buttonFinishThird.click();
    //   await page.waitForTimeout(100);
    // } catch(error) {
    //   // console.log('buttonf 3 not there');
    // }
  }
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

  if(points != 'Cricket'){
    await page.goto("https://autodarts.io/lobbies/new/x01", {waitUntil: 'networkidle0'});
  }else{
    await page.goto("https://autodarts.io/lobbies/new/cricket", {waitUntil: 'networkidle0'});
  }
  // await page.waitForTimeout(2000); 

  // only when we are visiting first time we need to configure the game
  if(nav == true){

    if(points != 'Cricket'){
      const [buttonPoints] = await page.$x("//button[contains(., " + points + ")]");
      if (buttonPoints) {
          await buttonPoints.click();
      }else{
        console.log('Autodarts does not support X01 with ' + points);
      }
      await page.waitForTimeout(150);
    }
  
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
    await page.waitForTimeout(550); 
  }
  
  // start the game
  const [buttonStartMatch] = await page.$x("//button[contains(.,'Start')]");
  if (buttonStartMatch) {
      await buttonStartMatch.click();
  }
}
async function loopAutodarts(points){
  const pages = await abortAutodartsGame()

  setupAutodarts(points, false, pages[1]);
  waitExternGame(pages[0]).then((val) => {
    loopAutodarts(points);
  });
}
async function abortAutodartsGame(){
  const pages = (await _browser.pages());

  const [buttonAbort] = await pages[1].$x("//button[contains(.,'Abort')]");
  if (buttonAbort) {
      console.log('Autodarts: close current game');
      await buttonAbort.click();
      await pages[1].waitForTimeout(2000);
  }else{
    console.log('Autodarts: Abort-button not found');
  }
  return pages;
}
async function correctAutodartsPoints(externCurrentPoints, autodartsThrowPoints, autodartsPointsLeft){
  // is there if difference?
  const externPointsFuture = externCurrentPoints - autodartsThrowPoints;
  if(externPointsFuture == autodartsPointsLeft){
    console.log('Autodarts: no point difference');
  // yes difference
  }else{
    console.log('Autodarts: point difference');

    //do i need step backward?
    if(externPointsFuture > pointsLeft){
      const pages = (await _browser.pages());
      const [buttonUndo] = await pages[1].$x("//button[contains(.,'Undo')]");
      if (buttonUndo) {
          console.log('Autodarts: do undo');
          await buttonUndo.click();
          await pages[1].waitForTimeout(75);
      }else{
        console.log('Autodarts: Undo-button not found');
      }
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
if(!args.browser_path){
  console.log('"--browser_path" is required');
  process.exit(0);
}
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
if (args.extern_platform == lidarts && (!args.lidarts_user || !args.lidarts_password)){
  console.log('"--lidarts_user" and "--lidarts_password" is required');
  process.exit(0);
}
if (args.extern_platform == dartboards && (!args.dartboards_user || !args.dartboards_password)){
  console.log('"--dartboards_user" and "--dartboards_password" is required');
  process.exit(0);
}

const browserPath = args.browser_path;
var hostPort = args.host_port;
const autodartsUser = args.autodarts_user; 
const autodartsPassword = args.autodarts_password;
const autodartsBoardId = args.autodarts_board_id
var timeBeforeExit = args.time_before_exit;
const externPlatform = args.extern_platform;
const lidartsUser = args.lidarts_user;           
const lidartsPassword = args.lidarts_password; 
var lidartsSkipDartModals = args.lidarts_skip_dart_modals;
var lidartsChatMessageStart = args.lidarts_chat_message_start;
var lidartsChatMessageEnd = args.lidarts_chat_message_end;
var nakkaSkipDartModals = args.nakka_skip_dart_modals;
const dartboardsUser = args.dartboards_user;
const dartboardsPassword = args.dartboards_password;
var dartboardsSkipDartModals = args.dartboards_skip_dart_modals;
var webcamdartsSkipDartModals = args.webcamdarts_skip_dart_modals;

// Check for optional arguments
if(!hostPort){
  hostPort = 8080;
}
if(!timeBeforeExit){
  timeBeforeExit = 10000;
}
if(!lidartsSkipDartModals){
  lidartsSkipDartModals = false;
}
if(!lidartsChatMessageStart){
  lidartsChatMessageStart = "";
}
if(!lidartsChatMessageEnd){
  lidartsChatMessageEnd = "";
}
if(!nakkaSkipDartModals){
  nakkaSkipDartModals = false;
}
if(!dartboardsSkipDartModals){
  dartboardsSkipDartModals = false;
}
if(!webcamdartsSkipDartModals){
  webcamdartsSkipDartModals = false;
}



app.post('/', function(req, res) {
  // EXAMPLE-REQUEST
  //   {
  //     "event": "darts-thrown",
  //     "player": currentPlayerName,
  //     "game": {
  //         "mode": "X01",
  //         "points-left": str(remainingPlayerScore),
  //         "dart-number": "3",
  //         "dart-value": points,        
  //     }
  //    }

  try{
    var msg = 'Thank You, but that is not my thing.';
    var body = req.body;
    if(body.event == "darts-pulled"){
      var user = body.player;
      var throwNumber = "1";
      var throwPoints = body.game.dartsThrownValue;
      var pointsLeft = body.game.pointsLeft;
      var busted = body.game.busted;
      var variant = body.game.mode;
      msg = 'Throw received - User: ' + user + ' Throw-Number: ' + throwNumber + ' Throw-Points: ' + throwPoints + ' Points-Left: ' + pointsLeft + ' Busted: ' + busted + ' Variant: ' + variant;
      console.log(msg);
    
      _page
      .then((page) => {
        inputThrow(page, throwPoints, pointsLeft, variant);
      });
    }
  }catch(error){
    console.log("Parsing request failed.");
  }finally{
    res.end(msg);
  } 
});


// Start a http listener as receiver for throws
var server = app.listen(hostPort, function() {
    var host = server.address().address
    var port = server.address().port
    console.log("Taking throws at http://%s:%s", host, port)
});


puppeteer
.launch({
  userDataDir: 'sessionData',
  executablePath: browserPath,
  headless: false, 
  defaultViewport: {width: 0, height: 0},
  devtools: DEBUG,
  args: [ '--start-maximized', '--hide-crash-restore-bubble'],
})
.then((browser) => (_browser = browser))
.then((browser) => (_page = browser.newPage())
.then((page) => {

      setupExternPlatform(page).then((points) => {
        waitExternMatch(page);
        setupAutodarts(points);
      });

      waitExternGame(page).then((val) => {
       loopAutodarts();
      });
        
}));
