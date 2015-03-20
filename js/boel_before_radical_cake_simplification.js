/*jslint
    bitwise, browser, for, this, white
*/
/*global
    createjs, console
*/

/* Boel och Tore - da game */

//How the various images are produced:
//tore's clothes:
//originals for tore's clothes are found in toreclothes.psd
//file->scripts->export layers to files, check Trim layers


//line
//original is found in line.psd
//save for web->scale 50%
//Note: clothes are also found in layers here, but they are not used and should be hidden

//balls

//table pics




/*make documentation with 

cd Sites/djallo/boel/js
/Users/k3bope/node_modules/.bin/jsdoc boel.js


see https://github.com/jsdoc3/jsdoc

*/

//debug settings
var debug = true;
var debugAlwaysUpdate = false;

//variables that must be the same as attributes in index.html
//they could be retrived as canvas.height etc, but must sometimes be used before they can be retrieved. 
var canvasWidth = 1024;
var canvasHeight = 768;

//prototypes for subclasses
Ball.prototype = Object.create(createjs.Bitmap.prototype);

//setup parameters
var splashScreenBackgroundColor = "#86DBD5";
var ballBackgroundColor = "#FFFF00";
var tableBackgroundColor = "#FF95CB";
var clothesBackgroundColor = "#93D4F2";

/**time between forced stage update in milliseconds*/
var wakeInterval = 20 * 1000;
/**return speed to clothes line in pixels per millisecond 
 * @summary clothes */
var returnSpeed = 0.5;
/** time to new ball game in ms */
var timeToNewBallGame = 5000;
/** ball bounce speed in pixels per milliseconds */
var ballBounceSpeed = 0.4;
/** min random time before voice "x vill ha tårta, var är x" for first character after start.*/
var minSecSelectFirstName = 1.5;
var maxSecSelectFirstName = 1.6;
var minSecSelectName = 4.0; //min random time before voice: "x vill ha tårta, var är x" for characters after first character
var maxSecSelectName = 5.0; //max random time...
var minSecNextBall = 3.0;
var maxSecNextBall = 3.2;
var progressBarHeight = 20;
var progressBarColor = "#060";
var progressBarErrorColor = "#C00";
var progressBarFadeTime = 400;
var enableCakePieceTouch = false; //if true, cake pieces can be distributet by clicking cake
var useRAF = true;
var fps = 24; //fps not used if useRAF = true;
var cakeBounceTime = 6.0; //time for a complete cake bounce cycle in seconds
var minSecNextSmash = 8.0; //important that this is larger than cakeBounceTime
var maxSecNextSmash = 14.0;
var gameTransitionTime = 700;
var numberX = canvasWidth - 60; //canvas.width - 200;xxx canvaswidth variable
var numberY = 80; //0; xxx finetune
var numberTransitionTime = 1000;
var startBallGameRotationTime = 2000;
var startBallGameNoOfTurns = 2;

var menuClothesX = 412 - 3;
var menuClothesY = 484;
var menuCakeX = menuClothesX + 100 + 6; //was (menuCake.image.width/2|0) + 20; 
var menuCakeY = menuClothesY; //was (menuCake.image.height/2|0) + 20;
var menuBallX = menuClothesX; //was canvas.width - menuBall.image.width/2 - 20;
var menuBallY = menuClothesY + 100 + 6; //was menuBall.image.height/2 + 20;
var menuHelpX = menuCakeX;
var menuHelpY = menuBallY;
var menuHelpRunningX = 10;
var menuHelpRunningY = 25;

var backButtonX = 10; //menuCakeX;
var backButtonY = 670;
var ballMinBorderDistance = 150; //min distance from center of ball to border when placed randomly
var ballMinDistance = 100; //min distance between balls. if min distance close to 200, the balls won't fit and the script will freeze
var wrongBallNumberOfTurns = 4;
var wrongBallTurnTime = 2000; //must be at least as long as the sound "det var ju blåa bollen", otherwise there might be an error if wrong ball is touched
var tableX = 100;
var tableY = 50;
var clothesGameContainerX = (canvasWidth - 768); //768 is width of line.png, which is not loaded yet. 
var clothesGameContainerY = 0;

var pieceMoveTime = 1000;
var ballPulsateTime = 1000;
var characterPulsateTime = 1000;
var cakeBallNoOfTurns = 6; //xxxx was 4

var clothesTweenTime = 600;
var hitDistance = 50;


//xxx possibly put setup parameters in a setup object:
//var setup = {timeToNewBallGame:1500,ballBounceSpeed:0.4};

//xxx the clothes parameters are not really setup parameters, but determined by size on position of clothes images. 
//should be defined somewhere else....

var toreX = 47;
var toreY = 530;
var lineX = 0;
var lineY = 0;

var shirtX = 592; //start postion on line.
var shirtY = 210;
var shirtWearX = 2; //position relative to Tore when worn
var shirtWearY = -3;
var shirtStartRotation = -180;
var trousersX = 167; //start postion on line.
var trousersY = 130;
var trousersWearX = 0; //position relative to Tore when worn
var trousersWearY = 106;
var trousersStartRotation = -157;

var sockLeftX = 309;
var sockLeftY = 127;
var sockLeftStartRotation = 20;
var sockLeftWearX = -32;
var sockLeftWearY = 186;

var sockRightX = 425;
var sockRightY = 143;
var sockRightStartRotation = 30;
var sockRightWearX = 28;
var sockRightWearY = 186;

var ballTween = {};

var characters = {}; //to find character connected to piece through getCharacter function

var cardinal = [
    "noll",
    "en",
    "tvaa",
    "tre",
    "fyra",
    "fem",
    "sex"
];

var ordinal = [
    "nolltetaartbiten",
    "foerstataartbiten",
    "andrataartbiten",
    "tredjetaartbiten",
    "fjaerdetaartbiten",
    "femtetaartbiten",
    "sjaettetaartbiten"
];


//help texts
var generalHelpText = "Det finns tre olika spel, tårtspelet, bollspelet och klädspelet. Tårtspelet och bollspelet fungerar bäst om ljudet är på. Peka på knapparna för att välja ett av spelen. ";
var ballHelpText = "Du ska försöka få bort alla bollarna från skärmen. Lyssna på rösten och peka på bollen med rätt färg. \n\nPeka på pilen för att komma till startsidan där du kan välja ett annat spel. ";
var clothesHelpText = "Dra kläderna från tvättlinan till Tore. Sätt de olika plaggen på rätt ställe på kroppen. När Tore har alla kläder på sig kan du rita på skärmen. Men rita inte på Tore, för då blir han ledsen. \n\nPeka på pilen för att komma till startsidan där du kan välja ett annat spel eller börja om det här spelet. ";
var cakeHelpText = "Alla vill ha tårta. Rösten berättar vems tur det är att få tårta. Peka på den personen som rösten säger vill ha tårta. \n\nPeka på pilen för att komma till startsidan där du kan välja ett annat spel. ";

//help sounds
var generalHelpSound;
var ballHelpSound;
var clothesHelpSound;
var cakeHelpSound;


//Here follows global variable definitions

var n; //xxx a global n is evil and must be replaced


var menuClothes;
var boelToreSplash;

var nextSmashId;
var nextBallId;
var randomCheckId;

var helpFrame;
var helpTextBox;
var helpContainer;

var canvas;
var minBounceDistance;
var stage;
var background; //xxx only for debug, should be deleted. No, revitalized as a cover when help is shown.
var queue;
var offset;
var update = false;
var menuBall, menuCake, menuHelp;
var backButton;
var cake;
var progressBar;
var blueBall, redBall, yellowBall, greenBall;
var allBalls;
var pieceParts, numberOfCakePieces;
var cakeFiles;
var cakeBall;
var table;
var clothesGameContainer; //a container for all graphics in the clothesgame. xxx maybe rename to clothesContainer
var line;
var shirt;
var trousers;
var sockRight;
var sockLeft;
var tore;
var star;
var tableBoel = {};
var tableMom = {};
var tableGrandDad = {};
var tableDad = {};
var tableTore = {};
var tableDog = {};
var tableTable;
var numbers = [];
var cakeComplete = [];
var debugText;
var loadedFiles;
var filesToLoad;
//var ballBackground; //xxx delete
//var splashScreenBackground; //xxx delete
//var tableBackground; //xxx delete
//var clothesBackground; //xxx delete
var nowMillis;
var nextSmash;
var nextRandomCheck;
var pieceNumberToSmash;
var nextBall;
var nextBallTime;
var selectedNameNumber;
var selectedName;
var soundQueue = [];
var paintDetect = [];
var lastWakeTime = 0;

//drawing variables
var drawingCanvas;
var oldPt;
var oldMidPt;
var crayonColor;
var crayonStroke;
var crayonColors;
var crayonColorIndex;
var crayons = [];
var crayonsOverlay = [];
var stroke;




/* =========== MIXED ========== */

/**
 * Launched from index.html
 * @summary mixed
 *  */
function init() {
    "use strict";
    console.log("almost passes jslint");
    console.log("Boel game starting at " + new Date());
    console.log("TweenJS version " + createjs.TweenJS.version);

    // create stage and point it to the canvas:
    canvas = document.getElementById("myCanvas");




    changeBackground(splashScreenBackgroundColor);



    //some initial values of "constans"
    //pixels, must be larger than canvas diagonal to make sure ball bounces outside of canvas
    minBounceDistance = Math.floor(Math.sqrt(canvasWidth * canvasWidth + canvasHeight * canvasHeight) * 1.5);

    //initial values. some of these must be reset to initial values when game is restarted
    loadedFiles = 0;
    nowMillis = 0;
    nextSmash = -1;
    nextRandomCheck = -1;
    pieceNumberToSmash = -1;
    nextBallTime = -1;
    selectedNameNumber = -1;
    selectedName = "";

    //check to see if we are running in a browser with touch support
    stage = new createjs.Stage(canvas);


    stage.name = "The Stage";
    // enable touch interactions if supported on the current device:
    createjs.Touch.enable(stage);



    /*
        var debugbutton1 = new createjs.Shape();
        debugbutton1.graphics.beginFill("blue").drawCircle(30, 0, 30, 30);
        stage.addChild(debugbutton1);
        debugbutton1.addEventListener("click",function(event){hideHelp()});
        */

    /*
        var debugbutton2 = new createjs.Shape();
        debugbutton2.graphics.beginFill("blue").drawCircle(90, 0, 30, 30);
        stage.addChild(debugbutton2);
        debugbutton2.addEventListener("click",function(event){console.log(sockRight.extraArea.x,sockRight.extraArea.y,sockRight.linePic.x,sockRight.linePic.y);stage.update();console.log("updating stage")});
        */

    /* to be deleted
        splashScreenBackground = createBackground("#86DBD5",0 * 1.0);//xxxyyy
        ballBackground = createBackground("#FFFF00",0.0);
        tableBackground = createBackground("#FF95CB",0.0);
        clothesBackground = createBackground("#93D4F2",0,0);
        */

    /* to be deleted 
        stage.addChild(splashScreenBackground);
        stage.addChild(ballBackground);
        stage.addChild(tableBackground);
        stage.addChild(clothesBackground);
        */

    addProgressBar();
    addDebugText();

    //loading assets

    //xxx must include ogg as well. Please use the new alternateExtensions property.
    //se http://www.createjs.com/tutorials/SoundJS%20and%20PreloadJS/. Gör olika testljud med ogg och mp3 för att testa
    var soundFiles = [{
            id: "andrataartbiten",
            src: "assets/andrataartbiten.mp3"
        }, {
            id: "boelslut",
            src: "assets/boelslut.mp3"
        }, {
            id: "boelstart",
            src: "assets/boelstart.mp3"
        }, {
            id: "boelvill_",
            src: "assets/boelvill_.mp3"
        }, {
            id: "detaerju",
            src: "assets/detaerju.mp3"
        }, {
            id: "detaerjuentaartbit",
            src: "assets/detaerjuentaartbit.mp3"
        }, {
            id: "detvarvaelinte",
            src: "assets/detvarvaelinte.mp3"
        }, {
            id: "faar",
            src: "assets/faar.mp3"
        }, {
            id: "femtetaartbiten",
            src: "assets/femtetaartbiten.mp3"
        }, {
            id: "fjaerdetaartbiten",
            src: "assets/fjaerdetaartbiten.mp3"
        }, {
            id: "foerstataartbiten",
            src: "assets/foerstataartbiten.mp3"
        }, {
            id: "hundenslut",
            src: "assets/hundenslut.mp3"
        }, {
            id: "hundenstart",
            src: "assets/hundenstart.mp3"
        }, {
            id: "hundenvill_",
            src: "assets/hundenvill_.mp3"
        }, {
            id: "ja",
            src: "assets/ja.mp3"
        }, {
            id: "mammaslut",
            src: "assets/mammaslut.mp3"
        }, {
            id: "mammastart",
            src: "assets/mammastart.mp3"
        }, {
            id: "mammavill_",
            src: "assets/mammavill_.mp3"
        }, {
            id: "morfarslut",
            src: "assets/morfarslut.mp3"
        }, {
            id: "morfarstart",
            src: "assets/morfarstart.mp3"
        }, {
            id: "morfarvill_",
            src: "assets/morfarvill_.mp3"
        }, {
            id: "pappaslut",
            src: "assets/pappaslut.mp3"
        }, {
            id: "pappastart",
            src: "assets/pappastart.mp3"
        }, {
            id: "pappavill_",
            src: "assets/pappavill_.mp3"
        }, {
            id: "sjaettetaartbiten",
            src: "assets/sjaettetaartbiten.mp3"
        }, {
            id: "somfaar",
            src: "assets/somfaar.mp3"
        }, {
            id: "toreslut",
            src: "assets/toreslut.mp3"
        }, {
            id: "torestart",
            src: "assets/torestart.mp3"
        }, {
            id: "torevill_",
            src: "assets/torevill_.mp3"
        }, {
            id: "tredjetaartbiten",
            src: "assets/tredjetaartbiten.mp3"
        }, {
            id: "tyst1000",
            src: "assets/tyst1000.mp3"
        }, {
            id: "cakebounce",
            src: "assets/cakebounce.mp3"
        }, {
            id: "detjublue",
            src: "assets/detjublue.mp3"
        }, {
            id: "detjuyellow",
            src: "assets/detjuyellow.mp3"
        }, {
            id: "detjugreen",
            src: "assets/detjugreen.mp3"
        }, {
            id: "detjured",
            src: "assets/detjured.mp3"
        },
        //{id:"nejinteyellow",src:"assets/nejinteyellow.mp3"},
        //{id:"nejintegreen",src:"assets/nejintegreen.mp3"},
        //{id:"nejinteblue",src:"assets/nejinteblue.mp3"},
        //{id:"nejintered",src:"assets/nejintered.mp3"},
        {
            id: "jagreen",
            src: "assets/jagreen.mp3"
        }, {
            id: "jablue",
            src: "assets/jablue.mp3"
        }, {
            id: "jared",
            src: "assets/jared.mp3"
        }, {
            id: "jayellow",
            src: "assets/jayellow.mp3"
        }, {
            id: "vargreen",
            src: "assets/vargreen.mp3"
        }, {
            id: "varblue",
            src: "assets/varblue.mp3"
        }, {
            id: "varyellow",
            src: "assets/varyellow.mp3"
        }, {
            id: "varred",
            src: "assets/varred.mp3"
        }, {
            id: "tada",
            src: "assets/tada.mp3"
        }
    ];


    //simple as opposed to the more complex files making a cake and a table
    var simpleImageFiles = [{
        id: "boelToreSplash",
        src: "assets/boeltoresplash.png"
    }, {
        id: "menuBall",
        src: "assets/menuball.png"
    }, {
        id: "menuCake",
        src: "assets/menucake.png"
    }, {
        id: "menuClothes",
        src: "assets/menuclothes.png"
    }, {
        id: "menuHelp",
        src: "assets/menuhelp.png"
    }, {
        id: "backButton",
        src: "assets/backbutton.png"
    }, {
        id: "cakePlate",
        src: "assets/cake_plate.png"
    }, {
        id: "line",
        src: "assets/line.png"
    }, {
        id: "shirtLine",
        src: "assets/shirtline.png"
    }, {
        id: "shirtWear",
        src: "assets/shirtwear.png"
    }, {
        id: "trousersLine",
        src: "assets/trousersline.png"
    }, {
        id: "trousersWear",
        src: "assets/trouserswear.png"
    }, {
        id: "sockLeftLine",
        src: "assets/sockleftline.png"
    }, {
        id: "sockLeftWear",
        src: "assets/sockleftwear.png"
    }, {
        id: "sockRightLine",
        src: "assets/sockrightline.png"
    }, {
        id: "sockRightWear",
        src: "assets/sockrightwear.png"
    }, {
        id: "tore",
        src: "assets/tore.png"
    }, {
        id: "toreSad",
        src: "assets/toresad.png"
    }, {
        id: "star",
        src: "assets/star.png"
    }, {
        id: "blueBall",
        src: "assets/blueball.png"
    }, {
        id: "redBall",
        src: "assets/redball.png"
    }, {
        id: "yellowBall",
        src: "assets/yellowball.png"
    }, {
        id: "greenBall",
        src: "assets/greenball.png"
    }, {
        id: "cakeBall",
        src: "assets/cake_ball.png"
    }];

    var numberFiles = [];
    var i;
    for (i = 0; i < 10; i += 1) {
        numberFiles.push({
            id: i + "",
            src: "assets/" + i + ".png"
        });
    }

    pieceParts = ["smashed_piece", "cake_base", "cake_outsidelines"]; //these are filenames for differnent parts of a cake. Filenames should never be in camelCase. 
    numberOfCakePieces = 6;
    cakeFiles = buildCakeFiles(pieceParts, numberOfCakePieces);

    //no camelCase in filenames (might lead to cross platform issues...)
    var tableFiles = [{
        id: "tableMom",
        src: "assets/tablemom.png"
    }, {
        id: "tableMomSad",
        src: "assets/tablemomsad.png"
    }, {
        id: "tableGrandDad",
        src: "assets/tablegranddad.png"
    }, {
        id: "tableGrandDadSad",
        src: "assets/tablegranddadsad.png"
    }, {
        id: "tableBoel",
        src: "assets/tableboel.png"
    }, {
        id: "tableBoelSad",
        src: "assets/tableboelsad.png"
    }, {
        id: "tableDad",
        src: "assets/tabledad.png"
    }, {
        id: "tableDadSad",
        src: "assets/tabledadsad.png"
    }, {
        id: "tableTore",
        src: "assets/tabletore.png"
    }, {
        id: "tableToreSad",
        src: "assets/tabletoresad.png"
    }, {
        id: "tableTable",
        src: "assets/tabletable.png"
    }, {
        id: "tableMomHand",
        src: "assets/tablemomhand.png"
    }, {
        id: "tableDadHand",
        src: "assets/tabledadhand.png"
    }, {
        id: "tableToreHand",
        src: "assets/tabletorehand.png"
    }, {
        id: "tableDog",
        src: "assets/tabledog.png"
    }, {
        id: "tableDogSad",
        src: "assets/tabledogsad.png"
    }, {
        id: "tableBoelHand",
        src: "assets/tableboelhand.png"
    }, {
        id: "tableGrandDadHand",
        src: "assets/tablegranddadhand.png"
    }];

    var files = simpleImageFiles.concat(cakeFiles, numberFiles, tableFiles, soundFiles);


    queue = new createjs.LoadQueue(false);
    createjs.Sound.alternateExtensions = ["ogg"];
    //in theory, you could list .mp3 files and have "ogg" as alternate extension, but that
    //seems to cause problems for chrome on android. It is better to have it the other way around. Or maybe not.
    queue.installPlugin(createjs.Sound);
    queue.addEventListener("complete", handleComplete);
    queue.addEventListener("error", handleFileError);
    queue.addEventListener("fileload", handleFileLoad);

    queue.loadManifest(files);
    filesToLoad = files.length;
} //init

/** 
 * @summary mixed
 */
function watchSound(s0) {
    "use strict";
    var i;
    for (i = 0; i < ordinal.length; i += 1) {
        if (s0 == ordinal[i]) {
            showNumber(i);
        }
    }
    if (s0 == "varblue" || s0 == "varred" || s0 == "varyellow" || s0 == "vargreen") {
        pulsate(nextBall, ballPulsateTime);

    }
    if (s0 == "tada") {
        showStar();
    }
}

/** 
 * @summary mixed
 */
function noGameRunning() {
    "use strict";
    return (!menuBall.focus && !menuCake.focus && !menuClothes.focus);
}

/** 
 * @summary mixed
 */
function handleComplete(event) {
    "use strict";
    //event triggered even if file not loaded
    if (loadedFiles < filesToLoad) {
        progressBar.graphics.beginFill(progressBarErrorColor).drawRect(0, 0, canvasWidth, progressBar.height);
        //xxx the loader div is only for debugging and should be deleted
        //var div = document.getElementById("loader");
        //div.innerHTML = "Some resources were not loaded: " + (filesToLoad - loadedFiles);
    } else {
        createjs.Tween.get(progressBar).to({
            alpha: 0.0
        }, progressBarFadeTime);
    }

    addBoelToreSplash();
    stage.removeChild(progressBar); //to make it visible on top of BoelToreSplash
    stage.addChild(progressBar);
    stage.removeChild(debugText); //to make it visible on top of BoelToreSplash
    stage.addChild(debugText);
    addHelp();
    addTable();
    addCake(pieceParts, numberOfCakePieces, cakeFiles);
    addBall();
    addClothes();
    addBackButton();
    addNumbers();
    addStar();
    addBackground();

    //setup almost complete, start the ticker

    if (useRAF) {
        createjs.Ticker.timingMode = createjs.Ticker.RAF;
    } else {
        createjs.Ticker.timingMode = createjs.Ticker.TIMEOUT;
        createjs.Ticker.framerate=fps;
    }
    stage.update();

    createjs.Ticker.addEventListener("tick", handleTick);

}

/** 
 * @summary mixed
 */
function changeSplashScreen(alpha) {
    "use strict";
    createjs.Tween.get(menuCake).to({
        alpha: alpha
    }, gameTransitionTime, createjs.Ease.linear);
    createjs.Tween.get(menuBall).to({
        alpha: alpha
    }, gameTransitionTime, createjs.Ease.linear);
    createjs.Tween.get(menuClothes).to({
        alpha: alpha
    }, gameTransitionTime, createjs.Ease.linear);
    createjs.Tween.get(backButton).to({
        alpha: (1 - alpha)
    }, gameTransitionTime, createjs.Ease.linear);
    createjs.Tween.get(boelToreSplash).to({
        alpha: alpha
    }, gameTransitionTime / 2, createjs.Ease.linear);
    //splashScreenBackground.alpha = alpha;//xxxyyy createjs.Tween.get(splashScreenBackground).to({alpha:alpha},gameTransitionTime, createjs.Ease.linear);



    if (alpha > 0.9) {
        changeBackground(splashScreenBackgroundColor);
        createjs.Tween.get(menuHelp).to({
            x: menuHelpX,
            y: menuHelpY
        }, gameTransitionTime / 2, createjs.Ease.linear);
    } else {
        createjs.Tween.get(menuHelp).to({
            x: menuHelpRunningX,
            y: menuHelpRunningY
        }, gameTransitionTime / 2, createjs.Ease.linear);
    }

}

/** 
 * @summary mixed
 */
function handleTick(event) {
    "use strict";
    nowMillis = createjs.Ticker.getTime(false);

    if (nowMillis - lastWakeTime > wakeInterval) {
        //this update is good for two reasons:
        //1: it prevents certain browsers to sleep
        //2: it assures that the stage is updatedet even if a tween is too fast and not caught by handleTick
        update = true;
        lastWakeTime = nowMillis;
    }

    //things to do only when a tween is running or something is dragged
    if (update || debugAlwaysUpdate) {
        if (menuBall.focus)  {
            checkBallOutsideAndBallBounce();
        }
        stage.update(event); //pass event to make sure for example sprite animation works
    }
    update = createjs.Tween.hasActiveTweens(); //xxxtickxxx
}

/** 
 * @summary mixed
 */
function handleBackButtonTouch(event) {
    "use strict";
    //update = true; //xxxtick nu funkar det att gå tillbaka men utan tween, istället pang på!
    if (menuBall.focus) {
        restoreMenuBall();
    } else if (menuCake.focus) {
        restoreMenuCake();
    } else if (menuClothes.focus) {
        restoreMenuClothes();
    }
}

/* =========== GENERAL ========== */

/** Changes background color of canvas
 * @summary general
 * @param {string} color - Background color in valid css format, for example "#FF0000" or "red"
 * */
function changeBackground(color) {
    "use strict";
    canvas.style.backgroundColor = color;
}

/** Creates a Background of certain color and alpha. Used to create transparent overlay when help is shown. 
 * @summary general
 * @param {string} color - Background color in valid css format, for example "#FF0000" or "red"
 * @param {float} alpha
 * @returns {Shape} Shape object filling the canvas
 */
function createBackground(color, alpha) {
    "use strict";
    var b = new createjs.Shape();
    b.graphics.beginFill(color).drawRect(0, 0, canvasWidth, canvasHeight);
    b.x = 0;
    b.y = 0;
    b.alpha = alpha;
    return b;
}

/** Detects mousedown events on transparent overlay when help is shown. Used to hide the help dialog.
 * @summary general
 * @param event */
function handleBackgroundTouch(event) {
    "use strict";
    if (debug) {
        console.log("background touch", event.stageX, event.stageY);
        background.touchX = event.stageX;
        background.touchY = event.stageY;
        stage.update();
    }
    hideHelp();
}

/** 
 * @summary general
 */
function printDebug(text) {
    "use strict";
    //console.log("printDebug ",text);
    if (debug) {
        debugText.text += text;
        debugText.text = debugText.text.substring(debugText.text.length - 68, debugText.text.length);
        //stage.update();
    }
}

/** 
 * @summary general
 */
function handleFileError(event) {
    "use strict";
    //var div = document.getElementById("loader");
    //div.innerHTML = "File load error";
    //div.style.backgroundColor = "#FF0000";
}

/** 
 * @summary general
 */
function handleFileLoad(event) {
    "use strict";
    console.log(event.item.src);
    printDebug(event.item.src + ',');

    loadedFiles += 1;
    var progress = loadedFiles / filesToLoad;
    updateProgressBar(progress);
    //xxx the loader div is only for debugging and should be deleted
    //var div = document.getElementById("loader");
    //div.innerHTML = xxxxx;
}

/** 
 * @summary general
 */
function updateProgressBar(progress) {
    "use strict";
    progressBar.scaleX = progress;
    stage.update();
}

/** 
 * @summary general
 */
function addProgressBar() {
    "use strict";
    progressBar = new createjs.Shape();
    progressBar.graphics.beginFill(progressBarColor).drawRect(0, 0, canvasWidth, progressBarHeight);
    progressBar.x = 0;
    progressBar.y = 0;
    progressBar.scaleX = 0.05;
    progressBar.height = progressBarHeight;
    stage.addChild(progressBar);
}

/** 
 * @summary general
 */
function addBackground() {
    "use strict";
    //the background is an almost invisible object, there to be able to click the background
    //currently only used for testing and debugging
    //UPDATE: not so invisible anymore, there for preventing clicks behind it when help is shown. 
    background = createBackground("#FFFFFF", 0.5); //should be less

    //stage.addChild(background); xxx done when help is shown
    background.addEventListener("mousedown", handleBackgroundTouch);
}

/** 
 * @summary general
 */
function addHelp() {
    "use strict";
    menuHelp = new createjs.Bitmap(queue.getResult("menuHelp"));
    stage.addChild(menuHelp);
    menuHelp.x = menuHelpX;
    menuHelp.y = menuHelpY;
    menuHelp.alpha = 1.0;
    menuHelp.addEventListener("mousedown", handleMenuHelpTouch);


    helpContainer = new createjs.Container();
    helpContainer.x = 100;
    helpContainer.y = 100;
    helpContainer.visible = false;

    helpFrame = new createjs.Shape();

    helpFrame.graphics.
    beginFill("white").
    beginStroke("orange").setStrokeStyle(20, 'round', 'round').
    drawRect(0, 0, canvasWidth - 100 * 2, canvasHeight - 100 * 2);



    helpTextBox = new createjs.Text("", "36px sans-serif", "#000");
    helpTextBox.lineHeight = 42;
    helpTextBox.lineWidth = canvasWidth - 4 * 100;
    helpTextBox.x = 100;
    helpTextBox.y = 100;
    helpContainer.addChild(helpFrame);
    helpContainer.addChild(helpTextBox);


    menuHelp.focus = false; //xxx ska detta in som gamerunning? inte riktigt kanke. den ska nog bort
}

/** 
 * @summary general
 */
function addStar() {
    "use strict";
    star = new createjs.Bitmap(queue.getResult("star"));
    stage.addChild(star);
    star.regX = star.image.width / 2 | 0;
    star.regY = star.image.height / 2 | 0;
    star.x = canvasWidth / 2 | 0;
    star.y = canvasHeight / 2 | 0;
    hideStar();
}

/** 
 * @summary general
 */
function addDebugText() {
    "use strict";
    debugText = new createjs.Text("", "24px Courier", "#000");

    debugText.x = 20;
    debugText.y = canvasHeight - 30;
    if (debug) {
        debugText.text = "Debug on";
    } else {
        debugText.text = " ";
    }
    stage.addChild(debugText);
}

/** 
 * @summary general
 */
function showSplashScreen() {
    "use strict";
    changeSplashScreen(1.0);
}

/** 
 * @summary general
 */
function hideSplashScreen() {
    "use strict";
    changeSplashScreen(0.0);
}

/** 
 * @summary general
 */
function handleMenuHelpTouch(evt) {
    "use strict";
    if (noGameRunning()) {
        showHelp(generalHelpText, generalHelpSound);
    } else if (menuCake.focus) {
        showHelp(cakeHelpText, cakeHelpSound);
    } else if (menuBall.focus) {
        showHelp(ballHelpText, ballHelpSound);
    } else if (menuClothes.focus) {
        showHelp(clothesHelpText, clothesHelpSound);
    }
}

/** 
 * @summary general
 */
function showHelp(text, sound) {
    "use strict";
    console.log("showHelp");
    //xxx ska man pausa tweens? pausa ljud? blir lite knepigt...
    helpTextBox.text = text;
    helpContainer.visible = true;
    stage.addChild(background);
    stage.addChild(helpContainer);
    stage.update();
}

/** 
 * @summary general
 */
function hideHelp() {
    "use strict";
    helpTextBox.text = "";
    stage.removeChild(helpContainer);
    stage.removeChild(background);
    helpContainer.visible = false;
    stage.update();
}

/** 
 * @summary general
 */
function isRunning(tween) {
    "use strict";
    //if no argument is given it should check all running tweens, but if argument is given only that tween should be checked
    //however, due to a bug in 0.5.1, all tweens are checked, with or without tween argument. 

    //possibly somtehing like createjs.Tween.hasActiveTweens(tween.target???) might work, but 
    //in NEXT version
    //NOTE: if this is fixed in a future version make sure this function works both with and without argument.  
    return createjs.Tween.hasActiveTweens();
}

/** 
 * @summary general
 */
function addBoelToreSplash() {
    "use strict";
    boelToreSplash = new createjs.Bitmap(queue.getResult("boelToreSplash"));
    stage.addChild(boelToreSplash);
}

/** 
 * @summary general
 */
function addBackButton() {
    "use strict";
    backButton = new createjs.Bitmap(queue.getResult("backButton"));
    stage.addChild(backButton);
    backButton.x = backButtonX;
    backButton.y = backButtonY;
    backButton.alpha = 0;
    //button.regX = button.image.width/2; //should be deleted xxx
    //button.regY = button.image.height/2;
    backButton.name = "Back button";
    backButton.addEventListener("mousedown", handleBackButtonTouch);
}

/** 
 * @summary general
 */
function extendAndPlayQueue(sounds) {
    "use strict";
    var soundQueueLengthBefore = soundQueue.length;
    soundQueue = soundQueue.concat(sounds);
    if (soundQueueLengthBefore == 0) { //queue was empty, no sound was playing
        playQueue();
    }
}

/** 
 * @summary general
 */
function playQueue() {
    "use strict";
    console.log("playQueue: ", soundQueue);
    var sq0;
    var soundinstance;
    if (soundQueue.length > 0) {
        sq0 = soundQueue[0];
        watchSound(sq0);
        printDebug(sq0);
        soundinstance = createjs.Sound.play(sq0);
        if (soundinstance.playState != "playFailed") {
            soundinstance.addEventListener("complete", handleNextSound);
        } else {
            console.log("play failed");
            handleNextSound(null);
        }
    }
}

/** 
 * @summary general
 */
function playSingle(sound) {
    "use strict";
    var soundinstance;
    soundinstance = createjs.Sound.play(sound);
}

/** 
 * @summary general
 */
function handleNextSound(evt) {
    "use strict";
    soundQueue = soundQueue.splice(1);
    playQueue();
}

/** 
 * @summary general
 */
function showStar() {
    "use strict";
    createjs.Tween.get(star).
    to({
        alpha: 0.7,
        scaleX: 2.3,
        scaleY: 2.3
    }, 2000, createjs.Ease.getElasticOut(1, 0.3)).
    wait(1000).
    to({
        alpha: 0
    }, 1000).
    to({
        scaleX: 0.1,
        scaleY: 0.1
    }, 10);
}

/** 
 * @summary general
 */
function hideStar() {
    "use strict";
    createjs.Tween.removeTweens(star);
    star.alpha = 0;
    star.scaleX = 0.1;
    star.scaleY = 0.1;
}


/** 
 * @summary general
 */
function randomFutureMillis(minSec, maxSec) {
    "use strict";
    //note: input in milliseconds and seconds, output in milliseconds
    var randomSec = minSec + Math.random() * (maxSec - minSec);
    return 1000 * randomSec;
}

/** 
 * @summary general
 */
function pulsate(bitmap, pulsetime) {
    "use strict";
    //console.log("bitmap",bitmap,"pulsetime",pulsetime);
    var partTime = Math.floor(pulsetime / 4);
    createjs.Tween.get(bitmap).to({
        scaleX: 1.1,
        scaleY: 1.1
    }, partTime, createjs.Ease.sineInOut).to({
        scaleX: 1.0,
        scaleY: 1.0
    }, partTime, createjs.Ease.sineInOut).to({
        scaleX: 1.1,
        scaleY: 1.1
    }, partTime, createjs.Ease.sineInOut).to({
        scaleX: 1.0,
        scaleY: 1.0
    }, partTime, createjs.Ease.sineInOut);
}

/** 
 * @summary general
 */
function log(text) {
    "use strict";
    console.log(text);
    console.log("active tweens: " + createjs.Tween.hasActiveTweens());
}


/* =========== CAKE ========== */


/** 
 * @summary cake
 */
function checkCharacter() {
    "use strict";
    console.log("checking character");
    if (helpContainer.visible) {
        console.log("not ready to check character");
        randomCheckId = setTimeout(checkCharacter, 2000);
    } else {
        var characterSelected = selectNextCharacter();
        if (characterSelected) {
            //a character was selected. No new character should be selected until this character receives a piece of cake
            clearTimeout(randomCheckId);
            nextRandomCheck = -1;
        }
    }
}

/** 
 * @summary cake
 */
function selectNextCharacter() {
    "use strict";
    var notMoved = [];

    function pushNotMovedPiece(piece, pieceNumber, array) {
        console.log("piece: ", pieceNumber, piece);
        if (!piece.moved) {
            notMoved.push(pieceNumber);
        }
    }

    //returns true if a character is selected, false otherwise
    //also pulsates a character and plays sound, if there is a character to select
    //who has no cake yet?
    var characterSelected = false;
    if (soundQueue.length == 0 && selectedNameNumber == -1) {


        /* original for in, now replaced with Array.foreach
            var pieceNumber;
            var piece;
            for (pieceNumber in cakeComplete) {
                piece = cakeComplete[pieceNumber];
                if (!piece.moved) {
                    notMoved.push(pieceNumber);
                }
            }*/

        cakeComplete.forEach(pushNotMovedPiece);

        if (notMoved.length > 0) {
            var randomIndex = Math.floor(Math.random() * notMoved.length);
            selectedNameNumber = notMoved[randomIndex];
            selectedName = getCharacterNameSound(selectedNameNumber);
            var character = getCharacter(selectedNameNumber);
            pulsate(character.happyPic, characterPulsateTime);
            if (character.hasOwnProperty("handPic")) {
                pulsate(character.handPic, characterPulsateTime);
            }
            extendAndPlayQueue([selectedName + "vill_"]); //namn vill ha tårta, var är namn?
            characterSelected = true;
        }
    }
    return characterSelected;
}

/** 
 * @summary cake
 */
function smashNextPiece() {
    "use strict";
    console.log("trying to smash next piece");
    var movedAndNotSmashed = [];

    function pushMovedAndNotSmashedPiece(piece, pieceNumber, array) {
        if (piece.moved && !piece.smashed) {
            console.log("======= moved and not smashed: ", pieceNumber);
            movedAndNotSmashed.push(pieceNumber);
        }
    }

    if (isRunning() || helpContainer.visible) {
        console.log("not ready to smash yet");
        clearTimeout(nextSmashId);
        nextSmashId = setTimeout(smashNextPiece, 2000);
    } else {
        //smashes a random piece
        /* old for in
            var pieceNumber;
            var piece;
            for (pieceNumber in cakeComplete) {
                piece = cakeComplete[pieceNumber];
                if (piece.moved && !piece.smashed) {
                    console.log("xxxmoved and not smashed: ",pieceNumber);
                    movedAndNotSmashed.push(pieceNumber);
                }
            }*/

        cakeComplete.forEach(pushMovedAndNotSmashedPiece);

        if (movedAndNotSmashed.length > 0) {
            //decide which piece to smash
            var randomIndex = Math.floor(Math.random() * movedAndNotSmashed.length);
            var randomPiece = movedAndNotSmashed[randomIndex];
            bounceToTable(randomPiece);
            nextSmash = randomFutureMillis(minSecNextSmash, maxSecNextSmash); //note: nextSmash is also updated when a cake piece is moved

            //there might not be a piece to smash now, but might be at nextSmash. If there is no piece to smash at nextSmash, nextSmash will get a new value
            clearTimeout(nextSmashId);
            nextSmashId = setTimeout(smashNextPiece, nextSmash);
            console.log("smashNextPiece: next smash in ", (nextSmash - 0 * nowMillis) / 1000, " seconds", nextSmashId);
        }

    }
}

/** 
 * @summary cake
 */
function handleCharacterTouch(event) {
    "use strict";
    //ok, vi har ett event. detta är en bitmapimage. men hur veta vilken character den hör till?
    var c = event.target.character;
    moveCakePiece(c.pieceNumber, c.pieceDeltaX, c.pieceDeltaY, "character");
}

/** 
 * @summary cake
 */
function handleCakePieceTouch(event) {
    "use strict";
    var pieceNumber = event.target.number;
    var c = getCharacter(pieceNumber);
    moveCakePiece(c.pieceNumber, c.pieceDeltaX, c.pieceDeltaY, "piece");
}

/** 
 * @summary cake
 */
function handleMenuCakeTouch(event) {
    "use strict";
    if (noGameRunning()) {
        menuCake.focus = true;
        extendAndPlayQueue(["tyst1000"]); //very weird. this sound is needed for first sound to play on iphone. 

        hideSplashScreen();

        //xxx to be moved to startcakegame
        nextRandomCheck = randomFutureMillis(minSecSelectFirstName, maxSecSelectFirstName);
        console.log("---->next random check at ", nextRandomCheck);
        //no need to clear previous timeout here (I think xxx)
        randomCheckId = setTimeout(checkCharacter, nextRandomCheck);
        createjs.Tween.get(cake).to({
            alpha: 1.0
        }, gameTransitionTime, createjs.Ease.linear);
        createjs.Tween.get(table).to({
            alpha: 1.0
        }, gameTransitionTime, createjs.Ease.linear);
        //tableBackground.alpha = 1.0;//xxxyyy createjs.Tween.get(tableBackground).to({alpha:1.0},gameTransitionTime, createjs.Ease.linear);
        changeBackground(tableBackgroundColor);
    }
}

/** 
 * @summary cake
 */
function addNumbers() {
    "use strict";
    var i;
    var number;
    for (i = 0; i < 10; i += 1) {
        number = new createjs.Bitmap(queue.getResult(i + ""));
        number.x = numberX;
        number.y = numberY;
        number.regX = number.image.width / 2 | 0;
        number.regY = number.image.height / 2 | 0;
        number.alpha = 0.0;
        numbers.push(number);
        stage.addChild(numbers[i]);
    }
}

/** 
 * @summary cake
 */
function addTable() {
    "use strict";
    table = new createjs.Container();

    //xxx borde ha en array allCharacters som allBalls.

    //anticlockwise around table
    tableDog = new Character(0, -60, 140, "tableDog", true, false, "Hunden", 180, 610);
    tableTore = new Character(1, 115, 100, "tableTore", true, true, "Tore", 730, 500);
    tableDad = new Character(2, 118, -38, "tableDad", true, true, "Pappa", 680, 310);
    tableGrandDad = new Character(3, 100, -90, "tableGrandDad", true, true, "Morfar", 460, 210);
    tableMom = new Character(4, -95, -55, "tableMom", true, true, "Mamma", 210, 320);
    tableBoel = new Character(5, -120, 35, "tableBoel", true, true, "Boel", 170, 470);

    tableTable = new createjs.Bitmap(queue.getResult("tableTable"));

    table.addChild(tableMom.happyPic,
        tableMom.sadPic,
        tableGrandDad.happyPic,
        tableGrandDad.sadPic,
        tableBoel.happyPic,
        tableBoel.sadPic,
        tableDad.happyPic,
        tableDad.sadPic,
        tableTore.happyPic,
        tableTore.sadPic,
        tableTable,
        tableDog.happyPic,
        tableDog.sadPic,
        tableMom.handPic,
        tableGrandDad.handPic,
        tableBoel.handPic,
        tableDad.handPic,
        tableTore.handPic);

    table.x = tableX;
    table.y = tableY;
    table.alpha = 0.0;

    //make an object (with integer id-s, making it look like an array) used for looking up character 
    //associated to cake piece
    characters[tableMom.pieceNumber] = tableMom;
    characters[tableGrandDad.pieceNumber] = tableGrandDad;
    characters[tableBoel.pieceNumber] = tableBoel;
    characters[tableDad.pieceNumber] = tableDad;
    characters[tableTore.pieceNumber] = tableTore;
    characters[tableDog.pieceNumber] = tableDog;

    stage.addChild(table);

    //xxx only a test
    table.addEventListener("mousedown", handleTableTouch);
}

//gjort trimvariabler hit

/** 
 * @summary cake
 */
function handleTableTouch(event) {
    "use strict";
    //console.log("xxx not used right now, but prevents from clicking through table");
}

/** 
 * @summary cake
 */
function addCharacterEventListener(character) {
    "use strict";
    if (character.hasOwnProperty("happyPic")) {
        character.happyPic.addEventListener("mousedown", handleCharacterTouch);
    }
    if (character.hasOwnProperty("sadPic")) {
        character.sadPic.addEventListener("mousedown", handleCharacterTouch);
    }
    if (character.hasOwnProperty("handPic")) {
        character.handPic.addEventListener("mousedown", handleCharacterTouch);
    }

}

/** 
 * @summary cake
 */
function makeCharacterHappy(character) {
    "use strict";
    var c = character;
    if (c.hasOwnProperty("happyPic")) {
        c.happyPic.visible = true;
    }
    if (c.hasOwnProperty("sadPic")) {
        c.sadPic.visible = false;
    }
}

/** 
 * @summary cake
 */
function makeCharacterSad(character) {
    "use strict";
    var c = character;
    if (c.hasOwnProperty("happyPic")) {
        c.happyPic.visible = false;
    }
    if (c.hasOwnProperty("sadPic")) {
        c.sadPic.visible = true;
    }
}

/** 
 * @summary cake
 */
function addCake(pieceParts, numberOfCakePieces, cakeFiles) {
    "use strict";
    //these won't change
    menuCake = new createjs.Bitmap(queue.getResult("menuCake"));
    stage.addChild(menuCake);
    menuCake.x = menuCakeX;
    menuCake.y = menuCakeY;
    //menuCake.regX = menuCake.image.width/2|0; xxx should probably be deleted
    //menuCake.regY = menuCake.image.height/2|0;
    menuCake.name = "menuCake";

    //these will change
    menuCake.alpha = 1;
    menuCake.focus = false;

    menuCake.addEventListener("mousedown", handleMenuCakeTouch);

    cake = new createjs.Container();

    //alltså, behöver en cake som är en multidimensionell array, som dels består av alla bitar och varje bit av 5? delar
    //första index är bit, andra index är del. 

    //xxx bättre göra varje bit till en container istället för hela tårtan väl...
    //nu finns det en 2-dim array cakeComplete som pieces och parts
    //sedan är varje part child till cake, istället för att varje part är child till piece som 
    //är child till part. 
    //eg skulle jag inte behöva cakeComplete
    var k = 0;
    var onePiece;
    var part;
    var i, j;
    for (i = 0; i < numberOfCakePieces; i += 1) {
        onePiece = [];
        for (j = 0; j < pieceParts.length + 1; j += 1) { // + 1 because cake_outsidelines doubled
            part = new createjs.Bitmap(queue.getResult(cakeFiles[k]["id"]));
            k += 1;
            part.number = i; //first piece has number 0, all parts get number i
            part.name = "part" + j + "piece" + i;
            onePiece.push(part);
            if (enableCakePieceTouch) {
                part.addEventListener("mousedown", handleCakePieceTouch);
            }
        }
        cakeComplete.push(onePiece);
        restoreCakePiece(i);
    }

    var cakePlate = new createjs.Bitmap(queue.getResult("cakePlate"));
    cake.addChild(cakePlate);


    var pieceOrder = [3, 4, 2, 5, 1, 6];
    for (i = 0; i < cakeComplete.length; i += 1) {
        for (j = 0; j < cakeComplete[i].length; j += 1) {
            cake.addChild(cakeComplete[pieceOrder[i] - 1][j]); //-1 because piece 1 has index 0 etc
        }
    }

    //ok, hyfsat, men skulle behöva samla kakkonstruktion istället för att ha det så utspritt. 
    stage.addChild(cake);
    cake.scaleStart = 1.0;
    cake.scaleX = cake.scaleY = cake.scale = cake.scaleStart;

    cake.width = cakeComplete[0][0].image.width;
    cake.height = cakeComplete[0][0].image.height;


    cake.relativeTableX = 450;
    cake.relativeTableY = 380;

    cake.x = table.x + cake.relativeTableX;
    cake.y = table.y + cake.relativeTableY;
    cake.regX = cake.width / 2;
    cake.regY = cake.height / 2;
    cake.name = "Tårta";

    cake.alpha = 0.0;


    cakeBall = new createjs.Bitmap(queue.getResult("cakeBall"));
    cakeBall.regX = cakeBall.image.width / 2 | 0;
    cakeBall.regY = cakeBall.image.height / 2 | 0;

    restoreCakeBall(); //place in initial position

    stage.addChild(cakeBall);

}

/** 
 * @summary cake
 */
function restoreMenuCake() {
    "use strict";

    if (menuCake.focus) {
        createjs.Tween.removeAllTweens();
        soundQueue = [];
        clearTimeout(nextSmashId);
        clearTimeout(randomCheckId);
        nextRandomCheck = -1;
        selectedNameNumber = -1;
        selectedName = "";
        hideAllNumbers();
        makeCharacterHappy(tableMom);
        makeCharacterHappy(tableGrandDad);
        makeCharacterHappy(tableBoel);
        makeCharacterHappy(tableDad);
        makeCharacterHappy(tableTore);
        makeCharacterHappy(tableDog);
        restoreCakeBall();

        var i;
        for (i = 0; i < cakeComplete.length; i += 1) {
            restoreCakePiece(i);
        }

        menuCake.focus = false;

    }

    //detta kan paketeras i en funktion XXXXXXXXXX. I guess these are the same as in handlemenucaketouch but show<->hide
    //show
    showSplashScreen();

    //hide
    createjs.Tween.get(cake).to({
        alpha: 0.0
    }, gameTransitionTime, createjs.Ease.linear);
    createjs.Tween.get(table).to({
        alpha: 0.0
    }, gameTransitionTime, createjs.Ease.linear);
    //createjs.Tween.get(tableBackground).to({alpha:0.0},gameTransitionTime, createjs.Ease.linear);

}


/** 
 * @summary cake
 */
function buildCakeFiles(pieceParts, numberOfCakePieces) {
    "use strict";
    var cakeFiles = []; //((pieceParts.length + 1) * numberOfCakePieces); // + 1 because cake_outsidelines doubled
    var shared = pieceParts[pieceParts.length - 1];
    var first, second, third, index;
    var k = 0;
    var i, j;
    for (i = 1; i < numberOfCakePieces + 1; i += 1) {
        for (j = 0; j < pieceParts.length - 1; j += 1) {
            cakeFiles.push({
                id: pieceParts[j] + i,
                src: "assets/" + pieceParts[j] + i + ".png"
            });
            k += 1;
        }
        //here is some tricky code to find outside lines...
        first = i;
        second = ((i % numberOfCakePieces) + 1);
        third = (i - 2 + numberOfCakePieces) % numberOfCakePieces + 1;
        index = first + "" + second;
        cakeFiles.push({
            id: shared + index,
            src: "assets/" + shared + index + ".png"
        });
        k += 1;
        index = first + "" + third;
        cakeFiles.push({
            id: shared + index,
            src: "assets/" + shared + index + ".png"
        });
        k += 1;
    }
    return cakeFiles;
}

/** 
 * @summary cake
 */
function restoreCakePiece(piecenumber) {
    "use strict";
    var piece = cakeComplete[piecenumber];

    var j;
    for (j = 0; j < piece.length; j += 1) {
        if (j == 0 || j == 2 || j == 3) {
            piece[j].visible = false;
        } else {
            piece[j].visible = true;
        }
        piece[j].x = 0;
        piece[j].y = 0;
    }
    piece.smashed = false;
    piece.moved = false;
}

/** 
 * @summary cake
 */
function moveCakePiece(piecenumber, x, y, action) {
    "use strict";
    //action can be character eller piece men för närvarande används endast character


    var movePerformed = false;
    if (menuCake.focus && soundQueue.length == 0) {
        var piece = cakeComplete[piecenumber];

        if (!piece.moved) {
            var j;
            for (j = 0; j < piece.length; j += 1) {

                createjs.Tween.get(piece[j]).to({
                    x: x,
                    y: y
                }, pieceMoveTime, createjs.Ease.sineInOut);
                piece.moved = true;
                movePerformed = true;
            }
        }
        var movedPieces = 0;
        var nextPiece;
        var prevPiece;
        var k;
        for (k = 0; k < cakeComplete.length; k += 1) {
            //om bit är på plats men nästa bit ej på plats: visa skiljelinje
            piece = cakeComplete[k];
            nextPiece = cakeComplete[(k + 1) % cakeComplete.length];
            if (!piece.moved && nextPiece.moved) {
                piece[2].visible = true;
            } else {
                piece[2].visible = false;
            }
            prevPiece = cakeComplete[(k - 1 + cakeComplete.length) % cakeComplete.length];
            if (!piece.moved && prevPiece.moved) {
                piece[3].visible = true;
            } else {
                piece[3].visible = false;
            }

            if (piece.moved) {
                //flyttad bit
                movedPieces += 1;
                if (!piece.smashed) {
                    piece[2].visible = true;
                    piece[3].visible = true;
                }
            }
        }

        var nameClicked = getCharacterNameSound(piecenumber);
        var nameSelected = getCharacterNameSound(selectedNameNumber);

        if (movePerformed) {
            //här bestämmer vi tid för nästa smash. Vilken bit som smashas bestäms dock inte här
            //utan i handleTick
            nextSmash = randomFutureMillis(minSecNextSmash, maxSecNextSmash); //note: nextSmash is also updated when a cake bounce is started

            clearTimeout(nextSmashId);
            nextSmashId = setTimeout(smashNextPiece, nextSmash);

            console.log("move: next smash in ", (nextSmash - 0 * nowMillis) / 1000, " seconds", nextSmashId);

            if (selectedNameNumber == piecenumber) {
                //"rätt" person klickad
                if (action == "character") {
                    extendAndPlayQueue(["ja"]);
                }
                extendAndPlayQueue([nameClicked + "start", "faar", ordinal[movedPieces]]);
                selectedNameNumber = -1;
                nextRandomCheck = randomFutureMillis(minSecSelectName, maxSecSelectName);
                console.log("2---->next random check at ", nextRandomCheck);

                clearTimeout(randomCheckId);
                randomCheckId = setTimeout(checkCharacter, nextRandomCheck);
            } else if (selectedNameNumber == -1) {
                //person utan tårtbit klickad
                extendAndPlayQueue([nameClicked + "start", "faar", ordinal[movedPieces]]); //somma som föregående
                nextRandomCheck = randomFutureMillis(minSecSelectName, maxSecSelectName);
                console.log("3---->next random check at ", nextRandomCheck);
                clearTimeout(randomCheckId);
                randomCheckId = setTimeout(checkCharacter, nextRandomCheck);
            } else {
                //"fel" person som inte än fått tårtbit klickad
                extendAndPlayQueue(["detvarvaelinte", nameSelected + "slut"]);
                if (action == "character") {
                    extendAndPlayQueue(["detaerju", nameClicked + "start", "somfaar", ordinal[movedPieces]]); //xxx inte helt nöjd med denna
                } else if (action == "piece") {
                    extendAndPlayQueue(["detaerju", ordinal[movedPieces]]);
                }
            }
        } else if (selectedNameNumber != piecenumber && selectedNameNumber != -1) {
            //"fel" person som redan fått tårtbit klickad
            extendAndPlayQueue(["detvarvaelinte", nameSelected + "slut"]);
            if (action == "character") {
                extendAndPlayQueue(["detaerju", nameClicked + "start"]);
            } else if (action == "piece") {
                extendAndPlayQueue(["detaerjuentaartbit"]);
            }
        }

    }
}

/** 
 * @summary cake
 */
function bounceToTable(piecenumber) {
    "use strict";
    var time = Math.floor(1000 * cakeBounceTime / 4);
    var startX = cakeBall.x;
    var startY = cakeBall.y;
    var smashX = cake.x + cakeComplete[piecenumber][0].x;
    var smashY = cake.y + cakeComplete[piecenumber][0].y;
    var endX = startX + (smashX - startX) * 3.9;
    //should be 4 but this only affects movement outside canvas
    //it is slightly less than 4 to ensure that x tween finishes before y tween
    //as handleComplete is done by y tween and the x tween should be finished
    var endY = startY;
    pieceNumberToSmash = piecenumber;
    createjs.Tween.get(cakeBall).to({
        x: endX,
        rotation: cakeBallNoOfTurns * 360
    }, 3.9 * time, createjs.Ease.linear);

    createjs.Tween.get(cakeBall).to({
        y: smashY
    }, time, createjs.Ease.getPowIn(2)).call(smashPiece).to({
        y: startY
    }, time, createjs.Ease.getPowOut(2)).to({
        y: smashY
    }, time, createjs.Ease.getPowIn(2)).to({
        y: startY
    }, time, createjs.Ease.getPowOut(2)).call(restoreCakeBall);
}

/** 
 * @summary cake
 */
function restoreCakeBall() {
    "use strict";
    if (cakeBall.x > canvasWidth + 100) {
        cakeBall.x = canvasWidth + 100;
        cakeBall.y = 100;
    } else if (cakeBall.x < -100) {
        cakeBall.x = -100;
        cakeBall.y = 100;
    } else {
        cakeBall.x = canvasWidth + 100;
        cakeBall.y = 100;
    }
    cakeBall.rotation = 0;
}

/** 
 * @summary cake
 */
function smashPiece() {
    "use strict";
    var piece = cakeComplete[pieceNumberToSmash];
    playSingle("cakebounce");

    var character = getCharacter(pieceNumberToSmash);
    makeCharacterSad(character);

    piece.smashed = true;
    piece[0].visible = true;
    piece[1].visible = false;
    piece[2].visible = false;
    piece[3].visible = false;
}

/** 
 * @summary cake
 */
function getCharacterNameSound(pieceNumber) {
    "use strict";
    var character = getCharacter(pieceNumber);
    if (character.hasOwnProperty("name")) {
        return character.name.toLowerCase();
    } else {
        return "";
    }
}

/** 
 * @summary cake
 */
function getCharacter(pieceNumber) {
    "use strict";
    var character = {};
    if (characters.hasOwnProperty(pieceNumber)) {
        character = characters[pieceNumber];
    }
    return character;
}


/** 
 * @summary cake
 */
function Character(pieceNumber, pieceDeltaX, pieceDeltaY, happyPic, hasSadPic, hasHandPic, name, regX, regY) {
    "use strict";
    //constructor for character
    this.pieceNumber = pieceNumber;
    this.pieceDeltaX = pieceDeltaX;
    this.pieceDeltaY = pieceDeltaY;
    this.happyPic = new createjs.Bitmap(queue.getResult(happyPic));
    this.happyPic.character = this;
    //will this circular reference cause garbage? 
    //Not according to
    //http://stackoverflow.com/questions/7347203/circular-references-in-javascript-garbage-collector

    this.happyPic.regX = regX;
    this.happyPic.regY = regY;
    this.happyPic.x = regX;
    this.happyPic.y = regY;

    if (hasSadPic) {
        this.sadPic = new createjs.Bitmap(queue.getResult(happyPic + "Sad"));
        this.sadPic.character = this;
        this.sadPic.regX = regX;
        this.sadPic.regY = regY;
        this.sadPic.x = regX;
        this.sadPic.y = regY;

    }
    if (hasHandPic) {
        this.handPic = new createjs.Bitmap(queue.getResult(happyPic + "Hand"));
        this.handPic.character = this;
        this.handPic.regX = regX;
        this.handPic.regY = regY;
        this.handPic.x = regX;
        this.handPic.y = regY;
    }
    this.name = name;
    addCharacterEventListener(this);
    makeCharacterHappy(this);
}

/** 
 * @summary cake
 */
function hideAllNumbers() {
    "use strict";
    //basically the same as hideNumber but immediate instead of tween
    var i;
    for (i = 0; i < numbers.length; i += 1) {
        numbers[i].alpha = 0;
    }
}

/** 
 * @summary cake
 */
function hideNumber() {
    "use strict";
    var i;
    for (i = 0; i < numbers.length; i += 1) {
        if (numbers[i].alpha > 0.0) {
            createjs.Tween.get(n).to({
                alpha: 0.0
            }, numberTransitionTime / 3, createjs.Ease.linear);
        }
    }
}

/** 
 * @summary cake
 */
function showNumber(number) {
    "use strict";
    hideNumber();
    n = numbers[number];
    createjs.Tween.get(n).to({
        alpha: 1.0
    }, numberTransitionTime, createjs.Ease.linear);
    pulsate(n, numberTransitionTime);
}


/* =========== BALL ========== */

/** 
 * @summary ball
 */
function handleNextBall() {
    "use strict";
    if (isRunning() || helpContainer.visible) {
        console.log("not ready for next ball yet");
        nextBallId = setTimeout(handleNextBall, 2000);
    } else if (menuBall.focus) {
        nextBall = findRandomBall();
        extendAndPlayQueue("var" + nextBall.color); //this sound is "watched" and will trigger pulsating ball
        nextBallTime = -1; //no new nextBall until this nextBall is touched 
    }
}

/** 
 * @summary ball
 */
function checkBallOutsideAndBallBounce() {
    "use strict";
    if (ballTween.hasOwnProperty("target")) {
        var ball = ballTween.target;
        //check if ball is outside of canvas
        //if it is, delete it (set .inside to false) so you can't bounce against it
        var inside = (ball.x - ball.radius) < canvasWidth && (ball.y - ball.radius) < canvasHeight && (ball.x + ball.radius) > 0 && (ball.y + ball.radius) > 0;
        if (!inside) {
            ball.inside = false;
            ball.alpha = 0;
            ballTween.setPaused(true);
            if (ball.last) {
                //restart game if it is the last ball
                extendAndPlayQueue("tada");
                startBallGame(timeToNewBallGame);
            }
        }
        //check if ball has bounced into another ball 
        if (detectBallCollision(ball, 0)) {
            if (ball.obstacleBall != ball.lastObstacleBall) {
                //ball has bounced into another ball. stop running tween and start new tween in new direction
                if (isRunning(ballTween)) {
                    ballTween.setPaused(true); //funkar nog bäst
                }
                //calculate bounce direction
                var centerToCenterAngle = Math.atan2(ball.y - ball.obstacleBall.y, ball.x - ball.obstacleBall.x);
                ball.bounceAngle = 2 * centerToCenterAngle - Math.PI - ball.startAngle;
                var deltaX = minBounceDistance * Math.cos(ball.bounceAngle);
                var deltaY = minBounceDistance * Math.sin(ball.bounceAngle);
                var finalX = ball.x + deltaX;
                var finalY = ball.y + deltaY;
                ballTween = makeBallTween(ball, finalX, finalY, ballBounceSpeed);
            }
        }
    }
}

/** 
 * @summary ball
 */
function makeBallTween(ball, x, y, speed) {
    "use strict";
    //speed in pixels per millisecond
    var distance = Math.sqrt((x - ball.x) * (x - ball.x) + (y - ball.y) * (y - ball.y));
    var time = Math.floor(distance / speed);
    ball.startAngle = Math.atan2(y - ball.y, x - ball.x);
    var rotationAngle = randomDirection() * Math.floor(360 * distance / 600.0); //600 deliberately not a setup variable, although it could have been
    return createjs.Tween.get(ball).to({
        x: x,
        y: y,
        rotation: ball.rotation + rotationAngle
    }, time, createjs.Ease.linear);
}

/** 
 * @summary ball
 */
function randomDirection() {
    "use strict";
    return (Math.random() < 0.5) ? -1.0 : 1.0;
}

/** 
 * @summary ball
 */
function randomSpeedAndDirection() {
    "use strict";
    //returns random value betwwen -1 and 1
    return 2 * Math.random() - 1.0;
}

/** 
 * @summary ball
 */
function handleMenuBallTouch(event) {
    "use strict";
    if (noGameRunning()) {
        menuBall.focus = true;
        extendAndPlayQueue(["tyst1000"]); //very weird. this sound is needed for first sound to play on iphone.
        hideSplashScreen();
        showBallGame();
        startBallGame(0);
    }
}

/** 
 * @summary ball
 */
function showBallGame() {
    "use strict";
    //ballBackground.alpha = 1.0;//xxx yyy createjs.Tween.get(ballBackground).to({alpha:1.0},gameTransitionTime, createjs.Ease.linear);
    changeBackground(ballBackgroundColor);
}

/** 
 * @summary ball
 */
function startBallGame(delay) {
    "use strict";
    hideStar();
    nextBallTime = delay + randomFutureMillis(minSecNextBall, maxSecNextBall);
    nextBallId = setTimeout(handleNextBall, nextBallTime);

    nextBall = null; //decided att next ball time
    allBalls.forEach(setRandomPosition);
    var i;
    for (i = 0; i < allBalls.length; i += 1) {
        allBalls[i].scaleX = 0.1;
        allBalls[i].scaleY = 0.1;
        createjs.Tween.get(allBalls[i]).wait(delay).to({
            scaleX: 1.0,
            scaleY: 1.0,
            alpha: 1.0,
            rotation: allBalls[i].rotation + randomSpeedAndDirection() * startBallGameNoOfTurns * 360
        }, startBallGameRotationTime, createjs.Ease.linear);
    }
}

/** 
 * @summary ball
 */
function restoreMenuBall() {
    "use strict";
    menuBall.focus = false;
    nextBallTime = -1;
    clearTimeout(nextBallId);
    var i;
    for (i = 0; i < allBalls.length; i += 1) {
        createjs.Tween.removeTweens(allBalls[i]);
    }
    showSplashScreen();
    hideBalls();
}

/** 
 * @summary ball
 */
function addBall() {
    "use strict";
    menuBall = new createjs.Bitmap(queue.getResult("menuBall"));
    stage.addChild(menuBall);

    //these parameters won't change
    menuBall.x = menuBallX;
    menuBall.y = menuBallY;
    menuBall.name = "menuBall";

    //these will change
    menuBall.alpha = 1.0;
    menuBall.focus = false;

    menuBall.addEventListener("mousedown", handleMenuBallTouch);

    //here are balls of different colors used in the ball game. 
    blueBall = new Ball("blueBall", "Blå boll", "blue");
    redBall = new Ball("redBall", "Röd boll", "red");
    yellowBall = new Ball("yellowBall", "Gul boll", "yellow");
    greenBall = new Ball("greenBall", "Grön boll", "green");
    allBalls = [blueBall, redBall, yellowBall, greenBall];
}

/** 
 * @summary ball
 */
function hideBalls() {
    "use strict";
    var i;
    for (i = 0; i < allBalls.length; i += 1) {
        createjs.Tween.get(allBalls[i]).to({
            alpha: 0.0
        }, gameTransitionTime, createjs.Ease.linear);
    }
    //createjs.Tween.get(ballBackground).to({alpha:0.0},gameTransitionTime, createjs.Ease.linear);
}

/** 
 * @summary ball
 */
function setRandomPosition(ball) {
    "use strict";
    var free = false;
    var forceField = ballMinDistance / 2;
    while (!free) { //a for me rare occasion where I would consider repeat instead...
        ball.x = Math.floor(Math.random() * (canvasWidth - ballMinBorderDistance * 2) + ballMinBorderDistance);
        ball.y = Math.floor(Math.random() * (canvasHeight - ballMinBorderDistance * 2) + ballMinBorderDistance);
        free = !detectBallCollision(ball, forceField);
    }
    ball.rotation = Math.floor(Math.random() * 360);
    ball.inside = true;
    ball.last = false;
    delete ball.obstacleBall;
    delete ball.lastObstacleBall;
}

/** 
 * @summary ball
 */
function collides(ball1, ball2, forceField) {
    "use strict";
    var cathX = ball1.x - ball2.x; //horizontal catheter
    var cathY = ball1.y - ball2.y;
    var distanceSquare = cathX * cathX + cathY * cathY;
    var centerDist = ball1.radius + ball2.radius + forceField;
    var centerDistSquare = centerDist * centerDist;
    return (distanceSquare < centerDistSquare);
}

/** 
 * @summary ball
 */
function findRandomBall(thisBall) {
    "use strict";
    //find random ball  * other than thisBall
    var allBallsButThis = [];
    var i;
    for (i = 0; i < allBalls.length; i += 1) {
        if (allBalls[i] != thisBall && allBalls[i].inside) {
            allBallsButThis.push(allBalls[i]);
        }
    }
    var randomIndex = Math.floor(Math.random() * allBallsButThis.length);
    if (allBallsButThis.length > 0) {
        return allBallsButThis[randomIndex];
    } else {
        return null;
    }
}

/** 
 * @summary ball
 */
function detectBallCollision(thisBall, forceField) {
    "use strict";
    //klumpigt kanske, men funkar för bara fyra bollar.
    var collision = false;
    var otherBall = {};
    var i;
    for (i = 0; i < allBalls.length && !collision; i += 1) {
        if (allBalls[i] != thisBall && allBalls[i].inside) {
            otherBall = allBalls[i];
            collision = collides(thisBall, otherBall, forceField);
            if (collision) {
                if (thisBall.hasOwnProperty("obstacleBall")) {
                    thisBall.lastObstacleBall = thisBall.obstacleBall;
                }
                thisBall.obstacleBall = otherBall;
            }
        }
    }
    return collision;
}

/** 
 * @summary ball
 */
function handlePlayBallTouch(event) {
    "use strict";
    var ball = event.target;

    if (!isRunning(ballTween)) {
        if (ball == nextBall) {
            //correct ball is touched
            extendAndPlayQueue("ja" + ball.color);
            var otherBall = findRandomBall(ball);
            if (otherBall !== null) {
                var directionX = otherBall.x + 0.35 * otherBall.image.width * randomDirection();
                var directionY = otherBall.y + 0.35 * otherBall.image.width * randomDirection();
                ballTween = makeBallTween(ball, directionX, directionY, ballBounceSpeed);
                nextBall = null;
                nextBallTime = randomFutureMillis(minSecNextBall, maxSecNextBall);
                console.log("Next ball time: ", nextBallTime);
                nextBallId = setTimeout(handleNextBall, nextBallTime);
            } else {
                //random direction for last ball
                var angle = Math.random() * 2 * Math.PI;
                var x = minBounceDistance * Math.cos(angle);
                var y = minBounceDistance * Math.sin(angle);
                ball.last = true;
                ballTween = makeBallTween(ball, x, y, ballBounceSpeed);
            }
        } else if (nextBall !== null) {
            console.log("next ball", nextBall);
            console.log("wrong ball touched");
            //wrong ball is touched
            var startRotation = ball.rotation;
            createjs.Tween.get(ball).to({
                rotation: startRotation + 360 * wrongBallNumberOfTurns
            }, wrongBallTurnTime, createjs.Ease.sineInOut);
            //createjs.Tween.get(ball).to({rotation:startRotation + 360 * 4}, 2000,createjs.Ease.sineInOut);

            extendAndPlayQueue(["detju" + ball.color, "var" + nextBall.color]);
        } else {
            //nothing should be done here
        }
    }
}

/** 
 * @summary ball
 */
function Ball(imageid, name, color) {
    "use strict";
    //constructor for ball
    createjs.Bitmap.call(this, queue.getResult(imageid));
    stage.addChild(this);
    this.regX = this.image.width / 2 | 0;
    this.regY = this.image.height / 2 | 0;
    this.name = name;
    this.color = color;
    this.addEventListener("mousedown", handlePlayBallTouch);
    this.alpha = 0.0;
    this.radius = this.regX;
    this.last = false;
}


/* =========== CAKE ========== */

/** 
 * @summary clothes
 */
function Clothes(linePicId, wearPicId, name, startRotation, startX, startY, wearX, wearY, movable) {
    "use strict";
    //note linepic and wearpic should have approximately the same size but must not be exact
    this.linePic = new createjs.Bitmap(queue.getResult(linePicId));
    this.linePic.clothes = this;
    this.wearPic = new createjs.Bitmap(queue.getResult(wearPicId));
    this.wearPic.clothes = this;
    this.linePic.alpha = 1.0;
    this.wearPic.alpha = 0.0;

    this.linePic.startX = this.linePic.x = startX;
    this.linePic.startY = this.linePic.y = startY;
    this.linePic.regX = this.linePic.image.width / 2 | 0;
    this.linePic.regY = this.linePic.image.height / 2 | 0;
    this.linePic.startRotation = this.linePic.rotation = startRotation;
    this.linePic.tweening = false; //true if tweening back to position. Used because of bug in hasActiveTweens
    this.linePic.wearX = wearX;
    this.linePic.wearY = wearY;
    this.linePic.kind = "linePic";

    this.wearPic.regX = this.wearPic.image.width / 2 | 0;
    this.wearPic.regY = this.wearPic.image.height / 2 | 0;
    this.wearPic.startRotation = this.wearPic.rotation = startRotation;


    this.extraArea = new createjs.Shape();
    this.extraArea.graphics.beginFill(clothesBackgroundColor).drawCircle(0, 0, 50, 50);
    this.extraArea.x = startX;
    this.extraArea.y = startY;
    this.extraArea.clothes = this;
    this.extraArea.startX = startX;
    this.extraArea.startY = startY;
    //this.extraArea.startRotation = this.extraArea.rotation = startRotation;

    //this.extraArea.regX = this.linePic.regX;
    //this.extraArea.regY = this.linePic.regY;
    this.extraArea.kind = "extraArea";
    //xxx hade varit trevligt med sock + extraarea som en container men då måste allt ligga i lager ovanför tore, inte extraarean under
    //kan lägga till en ifsats på pressmove så att den gör lite olika om man drar i extraarean. 



    this.onBody = false;

    if (movable) {
        this.extraArea.addEventListener("mousedown", handlePrePressmoveMousedown);
        this.extraArea.addEventListener("pressmove", handlePressmove);
        this.extraArea.addEventListener("pressup", handlePostPressmovePressup);

        this.linePic.addEventListener("mousedown", handlePrePressmoveMousedown);
        this.linePic.addEventListener("pressmove", handlePressmove);
        this.linePic.addEventListener("pressup", handlePostPressmovePressup);

    }
}

/** 
 * @summary clothes
 */
function addClothes() {
    "use strict";

    menuClothes = new createjs.Bitmap(queue.getResult("menuClothes"));
    stage.addChild(menuClothes);

    //these parameters won't change
    menuClothes.x = menuClothesX;
    menuClothes.y = menuClothesY;
    menuClothes.name = "menuClothes";

    //these will change
    menuClothes.alpha = 1.0;
    menuClothes.focus = false;

    menuClothes.addEventListener("mousedown", handleMenuClothesTouch);

    clothesGameContainer = new createjs.Container();
    clothesGameContainer.x = clothesGameContainerX;
    clothesGameContainer.y = clothesGameContainerY;
    clothesGameContainer.alpha = 0.0;
    clothesGameContainer.drawingEnabled = false;

    tore = new createjs.Bitmap(queue.getResult("tore"));
    tore.sad = new createjs.Bitmap(queue.getResult("toreSad"));
    tore.startX = tore.x = toreX;
    tore.startY = tore.y = toreY;
    tore.regX = tore.image.width / 2 | 0;
    tore.regY = tore.image.height / 2 | 0;
    tore.sad.x = tore.x - 42;
    tore.sad.y = tore.y - 156;
    tore.sad.alpha = 0.0;
    tore.rotation = 0;
    tore.dressed = false;


    sockRight = new Clothes("sockRightLine", "sockRightWear", "sockRight", sockRightStartRotation, sockRightX, sockRightY, sockRightWearX, sockRightWearY, true);
    sockLeft = new Clothes("sockLeftLine", "sockLeftWear", "sockLeft", sockLeftStartRotation, sockLeftX, sockLeftY, sockLeftWearX, sockLeftWearY, true);
    trousers = new Clothes("trousersLine", "trousersWear", "trousers", trousersStartRotation, trousersX, trousersY, trousersWearX, trousersWearY, true);
    shirt = new Clothes("shirtLine", "shirtWear", "shirt", shirtStartRotation, shirtX, shirtY, shirtWearX, shirtWearY, true);
    clothesGameContainer.clean = true;


    line = new createjs.Bitmap(queue.getResult("line"));
    line.x = lineX;
    line.y = lineY;

    //objects that should detect if you paint on them and make Tore sad
    paintDetect.push(tore);
    paintDetect.push(shirt.wearPic);
    paintDetect.push(sockLeft.wearPic);
    paintDetect.push(sockRight.wearPic);
    paintDetect.push(trousers.wearPic);


    //note shirt and trousers have extraArea but they are not used and not added to clothesGameContainer. 
    clothesGameContainer.addChild(sockRight.extraArea);
    clothesGameContainer.addChild(sockLeft.extraArea);


    clothesGameContainer.addChild(tore);
    clothesGameContainer.addChild(tore.sad);

    /* original order - not so good
        clothes.addChild(sockRight.linePic);
        clothes.addChild(sockRight.wearPic);
        clothes.addChild(sockLeft.linePic);
        clothes.addChild(sockLeft.wearPic);    
        clothes.addChild(trousers.linePic);
        clothes.addChild(trousers.wearPic);
        clothes.addChild(shirt.linePic);
        clothes.addChild(shirt.wearPic);
        */

    /* line pics on top of wear pics - much better! */
    clothesGameContainer.addChild(sockRight.wearPic);
    clothesGameContainer.addChild(sockLeft.wearPic);
    clothesGameContainer.addChild(trousers.wearPic);
    clothesGameContainer.addChild(shirt.wearPic);
    clothesGameContainer.addChild(sockRight.linePic);
    clothesGameContainer.addChild(sockLeft.linePic);
    clothesGameContainer.addChild(trousers.linePic);
    clothesGameContainer.addChild(shirt.linePic);




    clothesGameContainer.addChild(line);
    stage.addChild(clothesGameContainer);
}

/** 
 * @summary clothes
 */
function handleMenuClothesTouch(event) {
    "use strict";
    if (noGameRunning()) {
        menuClothes.focus = true;
        extendAndPlayQueue(["tyst1000"]); //very weird. this sound is needed for first sound to play on iphone.
        hideSplashScreen();
        showClothesGame();
        startClothesGame(0);
    }
}

/** 
 * @summary clothes
 */
function startClothesGame(delay) {
    "use strict";

    //xxx mpste snyggas till, detta är quick and dirty


    line.alpha = 1.0;
    tore.alpha = 1.0;
    tore.dressed = false;

    createjs.Tween.get(clothesGameContainer).to({
        alpha: 1.0
    }, gameTransitionTime, createjs.Ease.linear);

}

/** 
 * @summary clothes
 */
function restorePieceOfClothes(c) {
    "use strict";
    //xxx this is basically the same as in function Clothes. Should be unified
    log("restorePieceOfClothes()");
    createjs.Tween.removeTweens(c.linePic);
    createjs.Tween.removeTweens(c.wearPic);
    c.linePic.rotation = c.linePic.startRotation;
    c.wearPic.rotation = c.wearPic.startRotation;
    c.linePic.alpha = 1.0;
    c.wearPic.alpha = 0;
    c.linePic.x = c.linePic.startX;
    c.linePic.y = c.linePic.startY;
    c.extraArea.x = c.extraArea.startX;
    c.extraArea.y = c.extraArea.startY;
    c.extraArea.alpha = 1.0;
    c.onBody = false;
}

/** 
 * @summary clothes
 */
function restoreMenuClothes() {
    "use strict";
    menuClothes.focus = false;
    log("restoreMenuClothes()");
    restorePieceOfClothes(shirt);
    restorePieceOfClothes(trousers);
    restorePieceOfClothes(sockLeft);
    restorePieceOfClothes(sockRight);
    if (clothesGameContainer.drawingEnabled) {
        disableDrawing();
    }
    //xxx almost works but must make tore happy again!!!!! and make clothes not dirty. hm, dirty är egenskap på ett plagg, kan få konsekvenser om man sedan ritar på annat plagg
    menuClothes.focus = false;
    showSplashScreen();
    hideClothes();
}

/** 
 * @summary clothes
 */
function hideClothes() {
    "use strict";
    log("hideClothes()");
    createjs.Tween.get(clothesGameContainer).to({
        alpha: 0.0
    }, gameTransitionTime, createjs.Ease.linear);
    //createjs.Tween.get(clothesBackground).to({alpha:0.0},gameTransitionTime, createjs.Ease.linear);
}

/** 
 * @summary clothes
 */
function showClothesGame() {
    "use strict";
    //createjs.Tween.get(clothesBackground).to({alpha:1.0},gameTransitionTime, createjs.Ease.linear);
    changeBackground(clothesBackgroundColor);
}

/** 
 * @summary clothes
 */
function handlePrePressmoveMousedown(evt) {
    "use strict";
    var t;
    var t2;
    //make sure t is always linepic, and t2 is extraarea
    if (evt.target.kind == "linePic") {
        t = evt.target;
        t2 = t.clothes.extraArea;
    } else if (evt.target.kind == "extraArea") {
        t2 = evt.target;
        t = t2.clothes.linePic;
    }


    if (!t.tweening) {
        t.mousedownOffset = {
            x: evt.stageX - t.x,
            y: evt.stageY - t.y
        };
    }
}

/** 
 * @summary clothes
 */
function handlePressmove(evt) {
    "use strict";
    var t;
    var t2;
    //make sure t is always linepic, and t2 is extraarea
    if (evt.target.kind == "linePic") {
        t = evt.target;
        t2 = t.clothes.extraArea;
    } else if (evt.target.kind == "extraArea") {
        t2 = evt.target;
        t = t2.clothes.linePic;
    }

    if (!t.tweening) {
        t.x = evt.stageX - t.mousedownOffset.x;
        t.y = evt.stageY - t.mousedownOffset.y;
        t2.x = t.x;
        t2.y = t.y;
        if (t.x > tore.x + t.wearX - hitDistance && t.x < tore.x + t.wearX + hitDistance && t.y > tore.y + t.wearY - hitDistance && t.y < tore.y + t.wearY + hitDistance && !t.clothes.onBody) {
            t.clothes.onBody = true;
            t.clothes.wearPic.x = t.x;
            t.clothes.wearPic.y = t.y;
            t2.alpha = 0;
            createjs.Tween.get(t).to({
                x: tore.x + t.wearX,
                y: tore.y + t.wearY,
                rotation: 0,
                alpha: 0.0
            }, clothesTweenTime, createjs.Ease.linear);
            createjs.Tween.get(t.clothes.wearPic).to({
                x: tore.x + t.wearX,
                y: tore.y + t.wearY,
                rotation: 0,
                alpha: 1.0
            }, clothesTweenTime, createjs.Ease.linear).wait(500).call(checkIfAllClothesOn);
        }
        update = true;
    }
}

/** 
 * @summary clothes
 */
function checkIfAllClothesOn() {
    "use strict";
    if (shirt.onBody && trousers.onBody && sockLeft.onBody && sockRight.onBody && !tore.dressed) {
        tore.dressed = true;
        extendAndPlayQueue("tada");
        createjs.Tween.get(line).to({
            alpha: 0
        }, 500, createjs.Ease.linear).wait(3800).call(enableDrawing);
    }
}

/** 
 * @summary clothes
 */
function handlePostPressmovePressup(evt) {
    "use strict";
    var t;
    var t2;
    //make sure t is always linepic, and t2 is extraarea
    if (evt.target.kind == "linePic") {
        t = evt.target;
        t2 = t.clothes.extraArea;
    } else if (evt.target.kind == "extraArea") {
        t2 = evt.target;
        t = t2.clothes.linePic;
    }

    if (!t.tweening && !t.clothes.onBody) {
        t.tweening = true;
        var distance = Math.sqrt((t.x - t.startX) * (t.x - t.startX) + (t.y - t.startY) * (t.y - t.startY));
        var time = distance / returnSpeed;
        createjs.Tween.get(t).to({
            x: t.startX,
            y: t.startY
        }, time, createjs.Ease.sineInOut).call(function(evt) {
            t.tweening = false;
        });
        createjs.Tween.get(t2).to({
            x: t2.startX,
            y: t2.startY
        }, time, createjs.Ease.sineInOut);
    }
}

//drawing functions

/** 
 * @summary clothes
 */
function enableDrawing() {
    "use strict";
    if (helpContainer.visible) {
        //wait until helpContainer is gone
        console.log("not ready to enable drawing");
        setTimeout(enableDrawing, 2000);
    } else if (menuClothes.focus) {
        clothesGameContainer.drawingEnabled = true;
        menuHelp.alpha = 0.0;
        stage.update();
        stage.autoClear = false;
        crayonColors = ["red", "yellow", "green", "#FFAABB", "blue", "orange", "brown", "purple"]; //xxx till setup
        crayonColorIndex = 0;
        crayonColor = crayonColors[crayonColorIndex];

        var i;
        for (i = 0; i < crayonColors.length; i += 1) {
            crayons[i] = makeCrayon(crayonColors[i], "black", 3); //xxx possibly move to init
            crayonsOverlay[i] = makeCrayon("lightblue", "lightblue", 4);
            crayons[i].index = i;
            crayonsOverlay[i].index = i;
            stage.addChild(crayonsOverlay[i]);
            stage.addChild(crayons[i]);
            crayons[i].addEventListener("mousedown", handleCrayonMouseDown);
            crayonsOverlay[i].addEventListener("mousedown", handleCrayonMouseDown);
        }

        drawCrayons(crayonColorIndex);
        drawingCanvas = new createjs.Shape(); //xxx probably move to init
        stage.addEventListener("stagemousedown", handleStrokeMouseDown);
        stage.addChild(drawingCanvas);
        stage.update();
    }
}

/** 
 * @summary clothes
 */
function disableDrawing() {
    "use strict";
    clothesGameContainer.drawingEnabled = false;
    menuHelp.alpha = 1.0;
    tore.sad.alpha = 0;
    clothesGameContainer.clean = true;
    line.alpha = 1;
    stage.autoClear = true;
    removeCrayons();
    stage.removeChild(drawingCanvas);
    stage.removeEventListener("stagemousedown", handleStrokeMouseDown);
    stage.removeEventListener("stagemouseup", handleStrokeMouseUp);
    stage.removeEventListener("stagemousemove", handleStrokeMouseMove);
}

/** 
 * @summary clothes
 */
function removeCrayons() {
    "use strict";
    var i;
    for (i = 0; i < crayonColors.length; i += 1) {
        stage.removeChild(crayonsOverlay[i]);
        stage.removeChild(crayons[i]);
    }
}

/** 
 * @summary clothes
 */
function makeCrayon(color, outlineColor, outlineWidth) {
    "use strict";
    var crayon = new createjs.Shape();
    crayon.graphics.
    beginFill(color).
    beginStroke(outlineColor).setStrokeStyle(outlineWidth, 'round', 'round').
    moveTo(40, 0).
    lineTo(200, 0).
    lineTo(200, 40).
    lineTo(40, 40).
    lineTo(36, 35).
    lineTo(2, 23).
    lineTo(2, 17).
    lineTo(36, 5).
    lineTo(40, 0).
    beginFill(outlineColor).
    drawRect(60, 2, 20, 36).
    beginStroke(color).setStrokeStyle(7, 'round', 'round').
    moveTo(70, 2).
    curveTo(65, 10, 70, 20).
    curveTo(75, 30, 70, 38).
    beginStroke(outlineColor).setStrokeStyle(outlineWidth - 1, 'round', 'round').
    moveTo(60, 0).lineTo(80, 0).
    moveTo(60, 40).lineTo(80, 40);
    return crayon;
}

/** 
 * @summary clothes
 */
function handleClothesPaint() {
    "use strict";
    if (clothesGameContainer.clean) {
        console.log("paint on clothes");
        clothesGameContainer.clean = false;
        tore.sad.alpha = 1.0; //xxx eller tween?
        stage.update();
        clothesGameContainer.alpha = 0.0;
    }

}

/** 
 * @summary clothes
 */
function drawCrayons(index) {
    "use strict";
    console.log("drawCrayons", index);
    var crayonDelta = 50; //xxx to setup
    var number = crayons.length;
    var crayonTop = canvasHeight - (number + 1) * crayonDelta;
    var crayonShowLength = 100; //xxx to setup


    var i;
    for (i = 0; i < number; i += 1) {

        crayonsOverlay[i].y = crayonTop + i * crayonDelta;
        crayonsOverlay[i].x = canvasWidth - crayonShowLength - 2;

        crayons[i].y = crayonTop + i * crayonDelta;
        if (i == index) {
            crayons[i].x = canvasWidth - crayonShowLength;
        } else {
            crayons[i].x = canvasWidth - crayonShowLength / 2;
        }
    }
}

/** 
 * @summary clothes
 */
function handleCrayonMouseDown(evt) {
    "use strict";
    crayonColorIndex = evt.target.index;
    crayonColor = crayonColors[crayonColorIndex];
    drawCrayons(crayonColorIndex);
    stage.update();
}

/** 
 * @summary clothes
 */
function handleStrokeMouseDown(evt) {
    "use strict";
    console.log(">>>>> handleStrokeMouseDown", stage.mouseX | 0, stage.mouseY | 0);
    detectPaint();
    stroke = 10; //xxx to setup
    oldPt = new createjs.Point(stage.mouseX, stage.mouseY);
    oldMidPt = new createjs.Point(stage.mouseX, stage.mouseY);

    drawingCanvas.graphics.clear().beginFill(crayonColor).drawCircle(oldPt.x, oldPt.y, stroke / 2, stroke / 2);
    stage.update();

    stage.addEventListener("stagemousemove", handleStrokeMouseMove);
    stage.addEventListener("stagemouseup", handleStrokeMouseUp);
    
}

/** 
 * @summary clothes
 */
function handleStrokeMouseMove(evt) {
    "use strict";
    console.log(" *  *  *  *  *  handleStrokeMouseMove");
    detectPaint();

    var midPt = new createjs.Point(oldPt.x + stage.mouseX >> 1, oldPt.y + stage.mouseY >> 1);

    drawingCanvas.graphics.clear().setStrokeStyle(stroke, 'round', 'round').beginStroke(crayonColor).
    moveTo(midPt.x, midPt.y).
    curveTo(oldPt.x, oldPt.y, oldMidPt.x, oldMidPt.y);

    oldPt.x = stage.mouseX;
    oldPt.y = stage.mouseY;

    oldMidPt.x = midPt.x;
    oldMidPt.y = midPt.y;

    stage.update();
}

/** 
 * @summary clothes
 */
function handleStrokeMouseUp(evt) {
    "use strict";
    console.log(" *  *  *  *  *  handleStrokeMouseUp", stage.mouseX | 0, stage.mouseY | 0);

    drawingCanvas.graphics.clear().setStrokeStyle(stroke, 'round', 'round').beginStroke(crayonColor).
    moveTo(oldMidPt.x, oldMidPt.y).
    lineTo(stage.mouseX, stage.mouseY);
    stage.update();
    stage.removeEventListener("stagemousemove", handleStrokeMouseMove);
    stage.removeEventListener("stagemouseup", handleStrokeMouseUp);

}

/** 
 * @summary clothes
 */
function detectPaint() {
    "use strict";
    var detected = false;
    var pt;
    var i;
    for (i = 0; i < paintDetect.length && !detected; i += 1) {
        pt = paintDetect[i].globalToLocal(stage.mouseX, stage.mouseY); //xxx kan inte detta göras en gång för alla?
        if (paintDetect[i].hitTest(pt.x, pt.y)) {
            detected = true;
            handleClothesPaint();
        }
    }

}


