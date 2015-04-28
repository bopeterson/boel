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
//file->scripts->export layers to files, check Trim layers
//hand pics must be positioned to match body
// note: almost invisible dot left of dog's back leg, to force same widht as dogsad

/*make documentation with

cd Sites/djallo/boel/js
/Users/k3bope/node_modules/.bin/jsdoc boel.js

see https://github.com/jsdoc3/jsdoc

*/

//debug settings
var debug = false;
var debugAlwaysUpdate = false;
var fpsLabel;
var showfps = true;

//platform specific settings
var useRAF = false; //should probably be false for Android, true for all other platforms

//variables that must be the same as attributes in index.html
//they could be retrived as canvas.height etc, but must sometimes be used before they can be retrieved.
var canvasWidth = 1024; //optimised for iPad aspect ratio
var canvasHeight = 768; //optimised for iPad aspect ratio

//prototypes for subclasses
Ball.prototype = Object.create(createjs.Bitmap.prototype);

//setup parameters
var splashScreenBackgroundColor = ["#86DBD5", "#B5E7EF"]; //canvas color and a more pale canvasholder color
var ballBackgroundColor = ["#FFFF00", "#F8FF88"];
var tableBackgroundColor = ["#FF95CB", "#FFC7E5"];
var clothesBackgroundColor = ["#93D4F2", "#BFEAF8"];

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

var numberOfCakePieces = 6;

var minSecSelectFirstName = 1.5;
var maxSecSelectFirstName = 2.0;
var minSecSelectName = 6.0; //min random time before voice: "nn vill ha tårta, var är nn" for characters after first character
var maxSecSelectName = 8.0; //max random time before voice: "nn vill ha tårta, var är nn" for characters after first character
var minSecNextBall = 3.0;
var maxSecNextBall = 3.2;
var showNumberDelay = 2000; //delay before number is shown after sound "nn gets cake piece number n" is started
var tadaDelay = 6000; //delay before tada and star is shown when all cake pieces delivered
var progressBarHeight = 40;
var progressBarColor = "#060";
var progressBarErrorColor = "#C00";
var progressBarFadeTime = 400;
var fps = 30; //fps not used if useRAF = true;
var cakeBounceTime = 6.0; //time for a complete cake bounce cycle in seconds
var minSecNextSmash = 18.0; //important that this is larger than cakeBounceTime
var maxSecNextSmash = 26.0; //
var gameTransitionTime = 700;
var numberX = canvasWidth - 60;
var numberY = 80;
var numberAppearTime = 600;
var numberWaitTime = 2000;
var numberMoveTime = 400;
var numberBackgroundWidth = 380;
var numberBackgroundHeight = 460;
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
var ballPulsateTime = 2000;
var characterPulsateTime = 1500;
var cakeBallNoOfTurns = 6;

var clothesTweenTime = 600;
var hitDistance = 50;

//the following clothes parameters are not really setup parameters, but determined by size and position of clothes images.

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

var crayonColors = ["red", "yellow", "green", "pink", "blue", "orange", "brown", "purple"];

var crayonDelta = 50; //distance in pixels between center of crayons
var crayonShowLength = 100; //length in pixels of selected crayon
var drawingStroke = 10;

var ballTween = {};

var allCharacters = [];

//help texts
var generalHelpText = "Det finns tre olika spel, tårtspelet, bollspelet och klädspelet. Tårtspelet och bollspelet fungerar bäst om ljudet är på. Peka på knapparna för att välja ett av spelen. ";
var ballHelpText = "Du ska försöka få bort alla bollarna. Lyssna på rösten och peka på bollen med rätt färg. \n\nPeka på pilen för att komma till startsidan där du kan välja ett annat spel. ";
var clothesHelpText = "Dra kläderna från tvättlinan till Tore. Sätt kläderna på rätt ställe på kroppen. När Tore har alla kläder på sig kan du rita på skärmen. Men rita inte på Tore, då blir han ledsen. \n\nPeka på pilen för att komma till startsidan där du kan välja ett annat spel eller börja om det här spelet. ";
var cakeHelpText = "Alla vill ha tårta. Rösten berättar vems tur det är att få tårta. Peka på den personen som vill ha tårta. \n\nPeka på pilen för att komma till startsidan där du kan välja ett annat spel. ";

//help sounds
var generalHelpSounds = ["generalhelp1", "generalhelp2", "generalhelp3", "generalhelp4"];
var ballHelpSounds = ["ballhelp1", "ballhelp2", "ballhelp3"];
var clothesHelpSounds = ["clotheshelp1", "clotheshelp2", "clotheshelp3", "clotheshelp4", "clotheshelp5"];
var cakeHelpSounds = ["cakehelp1", "cakehelp2", "cakehelp3", "cakehelp4"];

//Here follows global variable definitions

var piecesLeft;

var menuClothes;
var boelToreSplash;

var nextSmashId;
var nextBallId;
var randomCheckId;
var showNumberId;
var tadaId;

var helpFrame;
var helpTextBox;
var helpContainer;

var canvas;
var minBounceDistance;
var stage;
var helpBackground; //cover when help is shown.
var queue;
var offset;
var update = false;
var menuBall, menuCake, menuHelp;
var backButton;
var cakeContainer;
var progressBar;
var progressBarTextBox;
var progressBarBackground;
var blueBall, redBall, yellowBall, greenBall;
var allBalls;
var allPieces;
var allSmashedPieces;
var allCakes;
var cakeFiles;
var cakeBall;
var table;
var clothesGameContainer; //a container for all graphics in the clothesgame.
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
var numberBackground;
var debugText;
var loadedFiles;
var filesToLoad;
var nowMillis;
var nextSmash;
var nextRandomCheck;
var pieceNumberToSmash;
var nextBall;
var nextBallTime;
var selectedCharacterIndex;
var selectedName;
var soundQueue = [];
var paintDetect = [];
var lastWakeTime = 0;

//drawing variables
var drawingCanvas;
var oldPt;
var oldMidPt;
var crayonColor;
var crayonColorIndex;
var crayons = [];
var crayonOverlay;
var numberOfCrayons;
var crayonTop;

/* =========== MIXED ========== */

/**
 * Launched from index.html
 * @summary mixed
 *  */

function init() {
    "use strict";

    var canvasHolder = document.getElementById("canvasHolder");
    canvasHolder.innerHTML = "<canvas id='myCanvas' width='" + canvasWidth + "' height='" + canvasHeight + "'></canvas>";

    console.log("Boel game starting at " + new Date());
    console.log("TweenJS version " + createjs.TweenJS.version);
    console.log("EaselJS version " + createjs.EaselJS.version);
    setTimeout(printDebug, 5000, createjs.TweenJS.version + " " + createjs.EaselJS.version);

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
    selectedCharacterIndex = -1;
    selectedName = "";

    //check to see if we are running in a browser with touch support
    stage = new createjs.Stage(canvas);

    stage.name = "The Stage";
    // enable touch interactions if supported on the current device:
    createjs.Touch.enable(stage);

    //show splash screen image as early as possible
    addBoelToreSplash();

    /*
    var debugbutton1 = new createjs.Shape();
    debugbutton1.graphics.beginFill("blue").drawCircle(1024-30, 30, 30, 30);
    debugbutton1.name = "debugbutton";
    stage.addChild(debugbutton1);
    debugbutton1.addEventListener("click",function(evt){var i;console.log("----");for (i=0;i<stage.children.length;i++){console.log(stage.children[i].name)}});
    */

    addProgressBar();
    addDebugText();

    //loading assets

    var soundFiles = [{
        id: "boelgets1",
        src: "assets/boelgets1.mp3"
    }, {
        id: "boelgets2",
        src: "assets/boelgets2.mp3"
    }, {
        id: "boelgets3",
        src: "assets/boelgets3.mp3"
    }, {
        id: "boelgets4",
        src: "assets/boelgets4.mp3"
    }, {
        id: "boelgets5",
        src: "assets/boelgets5.mp3"
    }, {
        id: "boelgets6",
        src: "assets/boelgets6.mp3"
    }, {
        id: "dadgets1",
        src: "assets/dadgets1.mp3"
    }, {
        id: "dadgets2",
        src: "assets/dadgets2.mp3"
    }, {
        id: "dadgets3",
        src: "assets/dadgets3.mp3"
    }, {
        id: "dadgets4",
        src: "assets/dadgets4.mp3"
    }, {
        id: "dadgets5",
        src: "assets/dadgets5.mp3"
    }, {
        id: "dadgets6",
        src: "assets/dadgets6.mp3"
    }, {
        id: "doggets1",
        src: "assets/doggets1.mp3"
    }, {
        id: "doggets2",
        src: "assets/doggets2.mp3"
    }, {
        id: "doggets3",
        src: "assets/doggets3.mp3"
    }, {
        id: "doggets4",
        src: "assets/doggets4.mp3"
    }, {
        id: "doggets5",
        src: "assets/doggets5.mp3"
    }, {
        id: "doggets6",
        src: "assets/doggets6.mp3"
    }, {
        id: "granddadgets1",
        src: "assets/granddadgets1.mp3"
    }, {
        id: "granddadgets2",
        src: "assets/granddadgets2.mp3"
    }, {
        id: "granddadgets3",
        src: "assets/granddadgets3.mp3"
    }, {
        id: "granddadgets4",
        src: "assets/granddadgets4.mp3"
    }, {
        id: "granddadgets5",
        src: "assets/granddadgets5.mp3"
    }, {
        id: "granddadgets6",
        src: "assets/granddadgets6.mp3"
    }, {
        id: "mumgets1",
        src: "assets/mumgets1.mp3"
    }, {
        id: "mumgets2",
        src: "assets/mumgets2.mp3"
    }, {
        id: "mumgets3",
        src: "assets/mumgets3.mp3"
    }, {
        id: "mumgets4",
        src: "assets/mumgets4.mp3"
    }, {
        id: "mumgets5",
        src: "assets/mumgets5.mp3"
    }, {
        id: "mumgets6",
        src: "assets/mumgets6.mp3"
    }, {
        id: "toregets1",
        src: "assets/toregets1.mp3"
    }, {
        id: "toregets2",
        src: "assets/toregets2.mp3"
    }, {
        id: "toregets3",
        src: "assets/toregets3.mp3"
    }, {
        id: "toregets4",
        src: "assets/toregets4.mp3"
    }, {
        id: "toregets5",
        src: "assets/toregets5.mp3"
    }, {
        id: "toregets6",
        src: "assets/toregets6.mp3"
    }, {
        id: "tada",
        src: "assets/tada.mp3"
    }, {
        id: "yesblue",
        src: "assets/yesblue.mp3"
    }, {
        id: "yesgreen",
        src: "assets/yesgreen.mp3"
    }, {
        id: "yesred",
        src: "assets/yesred.mp3"
    }, {
        id: "yesyellow",
        src: "assets/yesyellow.mp3"
    }, {
        id: "thatwasblue",
        src: "assets/thatwasblue.mp3"
    }, {
        id: "thatwasgreen",
        src: "assets/thatwasgreen.mp3"
    }, {
        id: "thatwasred",
        src: "assets/thatwasred.mp3"
    }, {
        id: "thatwasyellow",
        src: "assets/thatwasyellow.mp3"
    }, {
        id: "cakebounce",
        src: "assets/cakebounce.mp3"
    }, {
        id: "silence1000",
        src: "assets/silence1000.mp3"
    }, {
        id: "silence300",
        src: "assets/silence300.mp3"
    }, {
        id: "whereblue",
        src: "assets/whereblue.mp3"
    }, {
        id: "wheregreen",
        src: "assets/wheregreen.mp3"
    }, {
        id: "wherered",
        src: "assets/wherered.mp3"
    }, {
        id: "whereyellow",
        src: "assets/whereyellow.mp3"
    }, {
        id: "boeltap",
        src: "assets/boeltap.mp3"
    }, {
        id: "boelwhereis",
        src: "assets/boelwhereis.mp3"
    }, {
        id: "boelwouldlike",
        src: "assets/boelwouldlike.mp3"
    }, {
        id: "dadtap",
        src: "assets/dadtap.mp3"
    }, {
        id: "dadwhereis",
        src: "assets/dadwhereis.mp3"
    }, {
        id: "dadwouldlike",
        src: "assets/dadwouldlike.mp3"
    }, {
        id: "dogtap",
        src: "assets/dogtap.mp3"
    }, {
        id: "dogwhereis",
        src: "assets/dogwhereis.mp3"
    }, {
        id: "dogwouldlike",
        src: "assets/dogwouldlike.mp3"
    }, {
        id: "granddadtap",
        src: "assets/granddadtap.mp3"
    }, {
        id: "granddadwhereis",
        src: "assets/granddadwhereis.mp3"
    }, {
        id: "granddadwouldlike",
        src: "assets/granddadwouldlike.mp3"
    }, {
        id: "mumtap",
        src: "assets/mumtap.mp3"
    }, {
        id: "mumwhereis",
        src: "assets/mumwhereis.mp3"
    }, {
        id: "mumwouldlike",
        src: "assets/mumwouldlike.mp3"
    }, {
        id: "toretap",
        src: "assets/toretap.mp3"
    }, {
        id: "torewhereis",
        src: "assets/torewhereis.mp3"
    }, {
        id: "torewouldlike",
        src: "assets/torewouldlike.mp3"
    }, {
        id: "boelbut",
        src: "assets/boelbut.mp3"
    }, {
        id: "torebut",
        src: "assets/torebut.mp3"
    }, {
        id: "granddadbut",
        src: "assets/granddadbut.mp3"
    }, {
        id: "dogbut",
        src: "assets/dogbut.mp3"
    }, {
        id: "mumbut",
        src: "assets/mumbut.mp3"
    }, {
        id: "dadbut",
        src: "assets/dadbut.mp3"
    }, {
        id: "ballhelp1",
        src: "assets/ballhelp1.mp3"
    }, {
        id: "ballhelp2",
        src: "assets/ballhelp2.mp3"
    }, {
        id: "ballhelp3",
        src: "assets/ballhelp3.mp3"
    }, {
        id: "generalhelp1",
        src: "assets/generalhelp1.mp3"
    }, {
        id: "generalhelp2",
        src: "assets/generalhelp2.mp3"
    }, {
        id: "generalhelp3",
        src: "assets/generalhelp3.mp3"
    }, {
        id: "generalhelp4",
        src: "assets/generalhelp4.mp3"
    }, {
        id: "cakehelp1",
        src: "assets/cakehelp1.mp3"
    }, {
        id: "cakehelp2",
        src: "assets/cakehelp2.mp3"
    }, {
        id: "cakehelp3",
        src: "assets/cakehelp3.mp3"
    }, {
        id: "cakehelp4",
        src: "assets/cakehelp4.mp3"
    }, {
        id: "clotheshelp1",
        src: "assets/clotheshelp1.mp3"
    }, {
        id: "clotheshelp2",
        src: "assets/clotheshelp2.mp3"
    }, {
        id: "clotheshelp3",
        src: "assets/clotheshelp3.mp3"
    }, {
        id: "clotheshelp4",
        src: "assets/clotheshelp4.mp3"
    }, {
        id: "clotheshelp5",
        src: "assets/clotheshelp5.mp3"
    }, {
        id: "yes",
        src: "assets/yes.mp3"
    }];

    var cakeFiles = [{
        id: "piece1",
        src: "assets/piece1.png"
    }, {
        id: "piece2",
        src: "assets/piece2.png"
    }, {
        id: "piece3",
        src: "assets/piece3.png"
    }, {
        id: "piece4",
        src: "assets/piece4.png"
    }, {
        id: "piece5",
        src: "assets/piece5.png"
    }, {
        id: "piece6",
        src: "assets/piece6.png"
    }, {
        id: "smashedPiece1",
        src: "assets/smashedpiece1.png"
    }, {
        id: "smashedPiece2",
        src: "assets/smashedpiece2.png"
    }, {
        id: "smashedPiece3",
        src: "assets/smashedpiece3.png"
    }, {
        id: "smashedPiece4",
        src: "assets/smashedpiece4.png"
    }, {
        id: "smashedPiece5",
        src: "assets/smashedpiece5.png"
    }, {
        id: "smashedPiece6",
        src: "assets/smashedpiece6.png"
    }, {
        id: "cake0",
        src: "assets/cake0.png"
    }, {
        id: "cake1",
        src: "assets/cake1.png"
    }, {
        id: "cake2",
        src: "assets/cake2.png"
    }, {
        id: "cake3",
        src: "assets/cake3.png"
    }, {
        id: "cake4",
        src: "assets/cake4.png"
    }, {
        id: "cake5",
        src: "assets/cake5.png"
    }, {
        id: "cake6",
        src: "assets/cake6.png"
    }];

    //simple as opposed to the more complex files making a cake and a table
    var simpleImageFiles = [{
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
    for (i = 0; i <= numberOfCakePieces; i += 1) {
        numberFiles.push({
            id: i + "",
            src: "assets/" + i + ".png"
        });
    }

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
    console.log(createjs.Sound.activePlugin.toString());
} //init

/**
 * @summary mixed
 */

function watchSound(s0) {
    "use strict";

    if (s0.slice(-7) === "whereis") {
        var character = getCharacter(selectedCharacterIndex);
        if (character.hasOwnProperty("happyPic")) {
            pulsate(character.happyPic, characterPulsateTime);
        }
        if (character.hasOwnProperty("handPic")) {
            pulsate(character.handPic, characterPulsateTime);
        }
    }

    if (s0 === "whereblue" || s0 === "wherered" || s0 === "whereyellow" || s0 === "wheregreen") {
        if (nextBall !== null) {
            pulsate(nextBall, ballPulsateTime);
        }
    } else if (s0 === "tada") {
        showStar();
    } else if (s0.slice(-5, -1) === "gets") {
        var currentNumber = parseInt(s0.slice(-1), 10);
        showNumberId = setTimeout(showNumber, showNumberDelay, currentNumber);
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

function handleComplete(evt) {
    "use strict";
    //evt triggered even if file not loaded
    if (loadedFiles < filesToLoad) {
        progressBar.graphics.beginFill(progressBarErrorColor).drawRect(0, 0, canvasWidth, progressBar.height);
    } else {
        stage.removeChild(progressBarBackground);
        stage.removeChild(progressBarTextBox);
        createjs.Tween.get(progressBar).to({
            alpha: 0.0
        }, progressBarFadeTime).call(function(evt) {
            stage.removeChild(progressBar);
        });
    }

    //addBoelToreSplash(); moved to init

    addHelp();
    addTable();
    addBall();
    addClothes();
    addBackButton();
    addNumbers();
    addStar();
    addHelpBackground();

    //setup almost complete, start the ticker

    if (useRAF) {
        createjs.Ticker.timingMode = createjs.Ticker.RAF;
    } else {
        createjs.Ticker.timingMode = createjs.Ticker.TIMEOUT;
        createjs.Ticker.framerate = fps;
    }
    stage.update();

    createjs.Ticker.addEventListener("tick", handleTick);

    if (showfps) {
        fpsLabel = new createjs.Text("-- fps", "bold 24px Arial", "#FFF");
        fpsLabel.name = "fps label";
        stage.addChild(fpsLabel);
        fpsLabel.x = 10;
        fpsLabel.y = 160;
    }
}

/**
 * @summary mixed
 */

function handleTick(evt) {
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
        stage.update(evt); //pass evt to make sure for example sprite animation works
    }
    if (showfps) {
        fpsLabel.text = Math.round(createjs.Ticker.getMeasuredFPS()) + " fps";
    }
    update = createjs.Tween.hasActiveTweens();
}

/**
 * @summary mixed
 */

function handleBackButtonTouch(evt) {
    "use strict";
    if (menuBall.focus) {
        hideBallGame();
    } else if (menuCake.focus) {
        hideCakeGame();
    } else if (menuClothes.focus) {
        hideClothesGame();
    }
}

/* =========== GENERAL ========== */

/** Changes background color of canvas
 * @summary general
 * @param {string} color - Background color in valid css format, for example "#FF0000" or "red"
 * */

function changeBackground(color) {
    "use strict";
    canvas.style.backgroundColor = color[0];
    var frame = document.getElementById("canvasHolder");
    frame.style.backgroundColor = color[1];
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
 * @param evt */

function handleHelpBackgroundTouch(evt) {
    "use strict";
    if (debug) {
        console.log("background touch", evt.stageX, evt.stageY);
        helpBackground.touchX = evt.stageX;
        helpBackground.touchY = evt.stageY;
        stage.update();
    }
    hideHelp();
}

/**
 * @summary general
 */

function printDebug(text) {
    "use strict";
    if (debug) {
        debugText.text += text;
        debugText.text = debugText.text.substring(debugText.text.length - 68, debugText.text.length); //could use slice instead of substring
        //stage.update();
    }
}

/**
 * @summary general
 */

function handleFileError(evt) {
    "use strict";
    console.log("handlefileerror", evt);
    //var div = document.getElementById("loader");
    //div.innerHTML = "File load error";
    //div.style.backgroundColor = "#FF0000";
}

/**
 * @summary general
 */

function handleFileLoad(evt) {
    "use strict";
    printDebug(evt.item.src + ',');

    loadedFiles += 1;
    var progress = loadedFiles / filesToLoad;
    updateProgressBar(progress);
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
    progressBarBackground = new createjs.Shape();

    progressBarBackground.graphics.beginFill("white").drawRect(0, 0, canvasWidth / 3 + 6, progressBarHeight + 6);
    progressBarBackground.x = canvasWidth / 3 - 3;
    progressBarBackground.y = 350 - 3;
    progressBarBackground.alpha = 0.2;

    progressBar = new createjs.Shape();
    progressBar.graphics.beginFill(progressBarColor).drawRect(0, 0, canvasWidth / 3, progressBarHeight);
    progressBar.x = canvasWidth / 3;
    progressBar.y = 350;
    progressBar.scaleX = 0.05;
    progressBar.height = progressBarHeight;
    progressBar.name = "progress bar";

    progressBarTextBox = new createjs.Text("Laddar...", "36px sans-serif", "#000");
    progressBarTextBox.lineHeight = 42;
    //progressBarTextBox.lineWidth = canvasWidth - 4 * 100;
    progressBarTextBox.textAlign = "center";
    progressBarTextBox.x = canvasWidth / 2;
    progressBarTextBox.y = 350;

    stage.addChild(progressBarBackground);
    stage.addChild(progressBar);
    stage.addChild(progressBarTextBox);
}

/**
 * @summary general
 */

function addHelpBackground() {
    "use strict";
    helpBackground = createBackground("#FFFFFF", 0.4);
    helpBackground.addEventListener("mousedown", handleHelpBackgroundTouch);
}

/**
 * @summary general
 */

function addHelp() {
    "use strict";
    menuHelp = new createjs.Bitmap(queue.getResult("menuHelp"));
    menuHelp.name = "menu help";
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

    menuHelp.focus = false;
}

/**
 * @summary general
 */

function addStar() {
    "use strict";
    star = new createjs.Bitmap(queue.getResult("star"));
    star.regX = star.image.width / 2 | 0;
    star.regY = star.image.height / 2 | 0;
    star.x = canvasWidth / 2 | 0;
    star.y = canvasHeight / 2 | 0;
    star.name = "star";
    hideStar();
}

/**
 * @summary general
 */

function addDebugText() {
    "use strict";
    debugText = new createjs.Text("", "24px Courier", "#000");
    debugText.name = "debug text";
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
    console.log("showspalshscreen");
    stage.addChildAt(boelToreSplash, 0); //add at the bottom, behind progress bar
    stage.addChild(menuCake);
    stage.addChild(menuBall);
    stage.addChild(menuClothes);
    var alpha = 1.0;
    createjs.Tween.get(menuCake).to({
        alpha: alpha
    }, gameTransitionTime, createjs.Ease.linear);
    createjs.Tween.get(menuBall).to({
        alpha: alpha
    }, gameTransitionTime, createjs.Ease.linear);
    createjs.Tween.get(menuClothes).to({
        alpha: alpha
    }, gameTransitionTime, createjs.Ease.linear);
    createjs.Tween.get(boelToreSplash).to({
        alpha: alpha
    }, gameTransitionTime / 2, createjs.Ease.linear);

    changeBackground(splashScreenBackgroundColor);
    createjs.Tween.get(menuHelp).to({
        x: menuHelpX,
        y: menuHelpY
    }, gameTransitionTime / 2, createjs.Ease.linear);
}

/**
 * @summary general
 */

function hideSplashScreen() {
    "use strict";
    var alpha = 0.0;
    createjs.Tween.get(menuCake).to({
        alpha: alpha
    }, gameTransitionTime, createjs.Ease.linear).call(function(evt) {
        stage.removeChild(menuCake);
    });
    createjs.Tween.get(menuBall).to({
        alpha: alpha
    }, gameTransitionTime, createjs.Ease.linear).call(function(evt) {
        stage.removeChild(menuBall);
    });
    createjs.Tween.get(menuClothes).to({
        alpha: alpha
    }, gameTransitionTime, createjs.Ease.linear).call(function(evt) {
        stage.removeChild(menuClothes);
    });
    createjs.Tween.get(boelToreSplash).to({
        alpha: alpha
    }, gameTransitionTime / 2, createjs.Ease.linear).call(function(evt) {
        stage.removeChild(boelToreSplash);
    });
    createjs.Tween.get(menuHelp).to({
        x: menuHelpRunningX,
        y: menuHelpRunningY
    }, gameTransitionTime / 2, createjs.Ease.linear);
}

/**
 * @summary general
 */

function showBackButton() {
    "use strict";
    stage.addChild(backButton);
    createjs.Tween.get(backButton).to({
        alpha: 1
    }, gameTransitionTime, createjs.Ease.linear);
}

/**
 * @summary general
 */

function hideBackButton() {
    "use strict";
    createjs.Tween.get(backButton).to({
        alpha: 0
    }, gameTransitionTime, createjs.Ease.linear).call(function(evt) {
        stage.removeChild(backButton);
    });
}

/**
 * @summary general
 */

function handleMenuHelpTouch(evt) {
    "use strict";
    if (noGameRunning()) {
        showHelp(generalHelpText, generalHelpSounds);
    } else if (menuCake.focus) {
        showHelp(cakeHelpText, cakeHelpSounds);
    } else if (menuBall.focus) {
        showHelp(ballHelpText, ballHelpSounds);
    } else if (menuClothes.focus) {
        showHelp(clothesHelpText, clothesHelpSounds);
    }
}

/**
 * @summary general
 */

function showHelp(text, sounds) {
    "use strict";
    helpTextBox.text = text;
    helpContainer.visible = true;
    stage.addChild(helpBackground);
    stage.addChild(helpContainer);
    stage.update();
    extendAndPlayQueue(sounds);
}

/**
 * @summary general
 */

function hideHelp() {
    "use strict";
    helpTextBox.text = "";
    stage.removeChild(helpContainer);
    stage.removeChild(helpBackground);
    helpContainer.visible = false;
    removeAllButFirstSound(); //do not remove currently playing sound
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
    console.log("addboeltoresplash");
    //load directly, not from queue. Should be shown as soon as possible while loading
    boelToreSplash = new createjs.Bitmap("assets/boeltoresplash.png");
    boelToreSplash.name = "Splash screen";
    stage.addChildAt(boelToreSplash, 0); //add at the bottom, behind progress bar
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
    backButton.name = "Back button";
    backButton.addEventListener("mousedown", handleBackButtonTouch);
}

/**
sounds can be a string or array of strings
 * @summary general
 */

function extendAndPlayQueue(sounds) {
    "use strict";
    var soundQueueLengthBefore = soundQueue.length;
    soundQueue = soundQueue.concat(sounds);
    if (soundQueueLengthBefore === 0) { //queue was empty, no sound was playing
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
        if (soundinstance.playState !== "playFailed") {
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

function getPlayingSound() {
    "use strict";
    if (soundQueue.length > 0) {
        return soundQueue[0];
    } else {
        return "";
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
    soundQueue.splice(0, 1); //removes first element in soundQueue
    playQueue();
}
/**
 * @summary general
 */

function removeNextSound() {
    "use strict";
    soundQueue.splice(1, 1); //removes second element in soundQueue
}

function removeAllButFirstSound() {
    "use strict";
    soundQueue = soundQueue.splice(0, 1); //removes all but first sound
}

/**
 * @summary general
 */

function showStar() {
    "use strict";
    stage.addChild(star);
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
    }, 10).call(function(evt) {
        stage.removeChild(star);
    });
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
    stage.removeChild(star);
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
    var cycles = Math.floor(pulsetime / 500 + 0.5);

    var partTime = Math.floor(pulsetime / 2 / cycles);

    pulsateOne(bitmap, partTime, cycles);
}

/**
 * @summary general
 */

function pulsateOne(bitmap, partTime, cycles) {
    "use strict";
    if (cycles <= 1) {
        createjs.Tween.get(bitmap).to({
            scaleX: 1.1,
            scaleY: 1.1
        }, partTime, createjs.Ease.sineInOut).to({
            scaleX: 1.0,
            scaleY: 1.0
        }, partTime, createjs.Ease.sineInOut);
    } else {
        createjs.Tween.get(bitmap).to({
            scaleX: 1.1,
            scaleY: 1.1
        }, partTime, createjs.Ease.sineInOut).to({
            scaleX: 1.0,
            scaleY: 1.0
        }, partTime, createjs.Ease.sineInOut).call(function(evt) {
            pulsateOne(bitmap, partTime, cycles - 1);
        });
    }
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
    if (soundQueue.length > 0 || helpContainer.visible) {
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
    returns true if a character is selected, false otherwise
    "selected" means that the character is the next in turn to
    supposedly receive a piece of cake.
    It also also pulsates a character and plays sound, if there is a character to select

 */

function selectNextCharacter() {
    "use strict";

    var notMoved = [];

    function pushNotMovedPiece(piece, pieceNumber, array) {
        if (!piece.moved) {
            notMoved.push(pieceNumber);
        }
    }

    //who has no cake yet?
    var characterSelected = false;
    if (selectedCharacterIndex === -1) {

        allPieces.forEach(pushNotMovedPiece);
        if (notMoved.length > 0) {
            var randomIndex = Math.floor(Math.random() * notMoved.length);
            selectedCharacterIndex = notMoved[randomIndex];
            selectedName = getCharacterNameSound(selectedCharacterIndex);

            /*
            var character = getCharacter(selectedCharacterIndex);
            pulsate(character.happyPic, characterPulsateTime);
            if (character.hasOwnProperty("handPic")) {
                pulsate(character.handPic, characterPulsateTime);
            }
 */

            extendAndPlayQueue([selectedName + "wouldlike", selectedName + "whereis", selectedName + "tap"]); //namn vill ha tårta, var är namn?
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
    var movedAndNotSmashed = [];

    function pushMovedAndNotSmashedPiece(piece, pieceNumber, array) {
        if (piece.moved && !piece.smashed) {
            movedAndNotSmashed.push(pieceNumber);
        }
    }

    if (isRunning() || helpContainer.visible) {
        console.log("not ready to smash yet");
        clearTimeout(nextSmashId);
        nextSmashId = setTimeout(smashNextPiece, 2000);
    } else {
        //smashes a random piece

        //cakeComplete.forEach(pushMovedAndNotSmashedPiece);

        allPieces.forEach(pushMovedAndNotSmashedPiece);

        if (movedAndNotSmashed.length > 0) {
            //decide which piece to smash
            var randomIndex = Math.floor(Math.random() * movedAndNotSmashed.length);
            var randomPiece = movedAndNotSmashed[randomIndex];
            bounceToTable(randomPiece);
            nextSmash = randomFutureMillis(minSecNextSmash, maxSecNextSmash); //note: nextSmash is also updated when a cake piece is moved

            //there might not be a piece to smash now, but might be at nextSmash. If there is no piece to smash at nextSmash, nextSmash will get a new value
            clearTimeout(nextSmashId);
            nextSmashId = setTimeout(smashNextPiece, nextSmash);
        }
    }
}

/**
 * @summary cake
 */

function handleCharacterTouch(evt) {
    "use strict";
    var c = evt.target.character;

    if (c.hasCake === false) { //more safe than !c.hasCake if hasCake is undefined
        moveCakePiece(c);
    }
}

/**
 * @summary cake
 */

function handleMenuCakeTouch(evt) {
    "use strict";
    if (noGameRunning() && !isRunning()) {
        menuCake.focus = true;
        extendAndPlayQueue(["silence1000"]); //very weird. this sound is needed for first sound to play on iphone.
        hideSplashScreen();
        showCakeGame();
        startCakeGame();
    }
}

/**
 * @summary cake
 */

function showCakeGame() {
    "use strict";
    changeBackground(tableBackgroundColor);
    showTable();
    showBackButton();
}

function showTable() {
    "use strict";
    table.removeAllChildren();
    table.addChild(
        tableMom.happyPic,
        //tableMom.sadPic,
        tableGrandDad.happyPic,
        //tableGrandDad.sadPic,
        tableBoel.happyPic,
        //tableBoel.sadPic,
        tableDad.happyPic,
        //tableDad.sadPic,
        tableTore.happyPic,
        //tableTore.sadPic,
        tableTable,
        tableDog.happyPic,
        //tableDog.sadPic,
        tableMom.handPic,
        tableGrandDad.handPic,
        tableBoel.handPic,
        tableDad.handPic,
        tableTore.handPic,
        cakeContainer
    );
    var p;
    var i;
    for (i = 0; i < allPieces.length; i += 1) {
        p = allPieces[i];
        p.smashed = false;
        p.moved = false;
    }

    var c;
    for (i = 0; i < numberOfCakePieces + 1; i += 1) {
        c = allCakes[i];
        c.alpha = 1.0;
    }
    piecesLeft = numberOfCakePieces;
    cakeContainer.removeAllChildren();
    cakeContainer.addChild(allCakes[piecesLeft]);

    //gör figurer glada mm
    var ch;
    for (i = 0; i < allCharacters.length; i += 1) {
        ch = allCharacters[i];
        restoreCharacter(ch);
    }

    restoreCakeBall();

    stage.addChild(table);

    createjs.Tween.get(table).to({
        alpha: 1.0
    }, gameTransitionTime, createjs.Ease.linear);
}

/**
 * @summary cake
 */

function startCakeGame() {
    "use strict";
    nextRandomCheck = randomFutureMillis(minSecSelectFirstName, maxSecSelectFirstName);
    randomCheckId = setTimeout(checkCharacter, nextRandomCheck); //no need to clear previous timeout before
}

/**
 * @summary cake
 */

function hideCakeGame() {
    "use strict";
    menuCake.focus = false;

    createjs.Tween.removeAllTweens();
    soundQueue = [];
    clearTimeout(nextSmashId);
    clearTimeout(randomCheckId);
    clearTimeout(showNumberId);
    clearTimeout(tadaId);
    nextRandomCheck = -1;
    selectedCharacterIndex = -1;
    selectedName = "";

    hideAllNumbers();
    hideStar();
    hideBackButton();
    showSplashScreen();

    createjs.Tween.get(table).to({
        alpha: 0.0
    }, gameTransitionTime, createjs.Ease.linear).call(function(evt) {
        stage.removeChild(table);
    });
}

/**
 * @summary cake
 */

function addNumbers() {
    "use strict";
    var i;
    var number;
    for (i = 0; i <= numberOfCakePieces; i += 1) {
        number = new createjs.Bitmap(queue.getResult(i + ""));
        number.x = numberX;
        number.y = numberY;
        number.regX = number.image.width / 2 | 0;
        number.regY = number.image.height / 2 | 0;
        number.alpha = 0.0;
        number.name = i + "";
        numbers.push(number);
        numberBackground = new createjs.Shape();
        numberBackground.graphics.beginFill("white").drawEllipse(canvasWidth / 2, canvasHeight / 2, numberBackgroundWidth, numberBackgroundHeight);
        numberBackground.regX = numberBackgroundWidth / 2;
        numberBackground.regY = numberBackgroundHeight / 2;
        numberBackground.alpha = 0.6;
        numberBackground.name = "Number background";
    }
}

/**
 * @summary cake
 */

function addTable() {
    "use strict";
    table = new createjs.Container();

    addCake(numberOfCakePieces);
    addCakeBall();

    table.name = "Table container";

    //anticlockwise around table
    tableDog = new Character(181, 605, 0, 417, 535, "tableDog", true, false, 0, 0, "Dog");
    tableTore = new Character(719, 490, 1, 594, 475, "tableTore", true, true, 0, 163, "Tore");
    tableDad = new Character(658, 266, 2, 587, 319, "tableDad", true, true, 2, 295, "Dad");
    tableGrandDad = new Character(411, 175, 3, 527, 265, "tableGrandDad", true, true, 0, 254, "Granddad");
    tableMom = new Character(249, 285, 4, 324, 332, "tableMom", true, true, 81, 202, "Mum");
    tableBoel = new Character(191, 417, 5, 310, 444, "tableBoel", true, true, 107, 121, "Boel");

    allCharacters = [tableDog, tableTore, tableDad, tableGrandDad, tableMom, tableBoel];

    tableTable = new createjs.Bitmap(queue.getResult("tableTable"));
    tableTable.x = 139;
    tableTable.y = 267;
    tableTable.name = "Table";

    table.x = tableX;
    table.y = tableY;
    table.alpha = 0.0;
    table.addEventListener("mousedown", handleTableTouch);
}

/**
 * @summary cake
 */

function handleTableTouch(evt) {
    "use strict";
    //not used right now, but prevents from clicking through table
    var x = evt.stageX;
    var y = evt.stageY;
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

function restoreCharacter(character) {
    "use strict";
    character.mood = "happy";
    character.hasCake = false;
}

/**
 * @summary cake
 */

function makeCharacterSad(character) {
    "use strict";
    if (character.hasOwnProperty("sadPic") && character.mood === "happy") {
        table.addChildAt(character.sadPic, table.getChildIndex(character.happyPic));
        table.removeChild(character.happyPic);
    }
    character.mood = "sad";
}

/**
 * @summary cake
 */

function addCake(numberOfCakePieces) {
    "use strict";
    //these won't change
    menuCake = new createjs.Bitmap(queue.getResult("menuCake"));
    stage.addChild(menuCake);
    menuCake.x = menuCakeX;
    menuCake.y = menuCakeY;
    menuCake.name = "menu cake";

    //these will change
    menuCake.alpha = 1;
    menuCake.focus = false;

    menuCake.addEventListener("mousedown", handleMenuCakeTouch);

    var missingPiece = [{
        x: 30,
        y: -6
    }, {
        x: 21,
        y: -26
    }, {
        x: -23,
        y: -25
    }, {
        x: -29,
        y: 0
    }, {
        x: -17,
        y: 14
    }, {
        x: 27,
        y: 14
    }, {
        x: 0,
        y: 0
    }];
    cakeContainer = new createjs.Container();

    allCakes = [];
    var i;
    var c;
    for (i = 0; i < numberOfCakePieces + 1; i += 1) {
        c = new createjs.Bitmap(queue.getResult("cake" + i));
        c.regX = c.image.width / 2 | 0;
        c.regY = c.image.height / 2 | 0;
        c.missingPieceX = missingPiece[i].x;
        c.missingPieceY = missingPiece[i].y;
        c.name = "cake with " + i + " pieces";
        allCakes.push(c);
    }

    cakeContainer.x = 450;
    cakeContainer.y = 380;
    cakeContainer.name = "cake";

    allPieces = [];
    allSmashedPieces = [];
    var p;
    var sp;
    for (i = 1; i < numberOfCakePieces + 1; i += 1) {
        //move to function
        p = new createjs.Bitmap(queue.getResult("piece" + i));
        sp = new createjs.Bitmap(queue.getResult("smashedPiece" + i));
        p.regX = p.image.width / 2 | 0;
        p.regY = p.image.height / 2 | 0;
        p.x = 0;
        p.y = 0;
        p.alpha = 0;
        p.moved = false;
        p.smashed = false;
        p.name = "piece " + i;
        sp.regX = sp.image.width / 2 | 0;
        sp.regY = sp.image.height / 2 | 0;
        sp.name = "smashed piece " + i;

        //stage.addChild(p);
        allPieces.push(p);
        allSmashedPieces.push(sp);
    }

}

function addCakeBall() {
    "use strict";
    cakeBall = new createjs.Bitmap(queue.getResult("cakeBall"));
    cakeBall.regX = cakeBall.image.width / 2 | 0;
    cakeBall.regY = cakeBall.image.height / 2 | 0;
    cakeBall.name = "cake ball";
    restoreCakeBall(); //place in initial position
}

/**
 * @summary cake
 */

function moveCakePiece(character) {
    "use strict";
    var pieceNumber = character.pieceNumber;
    var x = character.pieceX;
    var y = character.pieceY;
    var playingSound = getPlayingSound();
    var piece = allPieces[pieceNumber];
    var nameClicked = getCharacterNameSound(pieceNumber);
    var nameSelected = getCharacterNameSound(selectedCharacterIndex);
    var correctCharacterClicked = (selectedCharacterIndex === pieceNumber);

    if (menuCake.focus &&
        (playingSound === "" ||
            (correctCharacterClicked && playingSound.slice(-3) === "but") ||
            (correctCharacterClicked && playingSound.slice(-9) === "wouldlike") ||
            (correctCharacterClicked && playingSound.slice(-7) === "whereis") ||
            (correctCharacterClicked && playingSound.slice(-3) === "tap"))) {
        //the condition above can be simplified

        if (playingSound.slice(-3) === "but") {
            removeNextSound();
            removeNextSound();
        } else if (playingSound.slice(-9) === "wouldlike") {
            removeNextSound();
            removeNextSound();
        } else if (playingSound.slice(-7) === "whereis") {
            removeNextSound();
        }

        var oldCake = allCakes[piecesLeft];
        piecesLeft -= 1;
        var newCake = allCakes[piecesLeft];
        cakeContainer.addChildAt(newCake, cakeContainer.getChildIndex(oldCake));
        piece.x = newCake.missingPieceX + cakeContainer.x;
        piece.y = newCake.missingPieceY + cakeContainer.y;
        table.addChild(piece);
        createjs.Tween.get(oldCake).to({
            alpha: 0.0
        }, 400, createjs.Ease.linear).call(function(evt) {
            cakeContainer.removeChild(oldCake);
        });
        createjs.Tween.get(piece).to({
            alpha: 1.0
        }, 200, createjs.Ease.linear).wait(10).to({
            x: x,
            y: y
        }, 700, createjs.Ease.linear);
        piece.moved = true;
        character.hasCake = true;

        nextSmash = randomFutureMillis(minSecNextSmash, maxSecNextSmash); //note: nextSmash is also updated when a cake bounce is started
        clearTimeout(nextSmashId);
        nextSmashId = setTimeout(smashNextPiece, nextSmash);

        var currentNumber = numberOfCakePieces - piecesLeft;
        if (correctCharacterClicked) {
            //"rätt" person klickad
            extendAndPlayQueue(["yes"]);
            extendAndPlayQueue([nameClicked + "gets" + currentNumber]);
            //showNumberId = setTimeout(showNumber, showNumberDelay, currentNumber);
            selectedCharacterIndex = -1;
            nextRandomCheck = randomFutureMillis(minSecSelectName, maxSecSelectName);
            clearTimeout(randomCheckId);
            randomCheckId = setTimeout(checkCharacter, nextRandomCheck);
        } else if (selectedCharacterIndex === -1) {
            //person utan tårtbit klickad, ingen person i kö för att bli klickad
            //exakt samma som tidigare, men ingen yes
            extendAndPlayQueue([nameClicked + "gets" + currentNumber]);
            //showNumberId = setTimeout(showNumber, showNumberDelay, currentNumber);
            selectedCharacterIndex = -1;
            nextRandomCheck = randomFutureMillis(minSecSelectName, maxSecSelectName);
            clearTimeout(randomCheckId);
            randomCheckId = setTimeout(checkCharacter, nextRandomCheck);
        } else {
            //"fel" person som inte än fått tårtbit klickad
            extendAndPlayQueue([nameClicked + "gets" + currentNumber, "silence300", nameSelected + "but", selectedName + "whereis", selectedName + "tap"]);
            //showNumberId = setTimeout(showNumber, showNumberDelay, currentNumber);
        }
        if (piecesLeft === 0) {
            extendAndPlayQueue(["tada"]);
            //tadaId=setTimeout(extendAndPlayQueue,tadaDelay,"tada");
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
    var smashX = allPieces[piecenumber].x;
    var smashY = allPieces[piecenumber].y; //+table.y; //cake.y + cakeComplete[piecenumber][0].y;
    var endX = startX + (smashX - startX) * 3.9;
    //should be 4 but this only affects movement outside canvas
    //it is slightly less than 4 to ensure that x tween finishes before y tween
    //as handleComplete is done by y tween and the x tween should be finished
    pieceNumberToSmash = piecenumber;
    table.addChild(cakeBall);
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
    table must exist when this function is called. At least I think so...
 * @summary cake
 */

function restoreCakeBall() {
    "use strict";
    table.removeChild(cakeBall);
    if (cakeBall.x > canvasWidth + 100 - tableX) {
        cakeBall.x = canvasWidth + 100 - tableX;
        cakeBall.y = 100 - tableY;
    } else if (cakeBall.x < -100 - tableX) {
        cakeBall.x = -100 - tableX;
        cakeBall.y = 100 - tableY;
    } else {
        cakeBall.x = canvasWidth + 100 - tableX;
        cakeBall.y = 100 - tableY;
    }
    cakeBall.rotation = 0;
}

/**
 * @summary cake
 */

function smashPiece() {
    "use strict";
    var p = allPieces[pieceNumberToSmash];
    playSingle("cakebounce");

    var character = getCharacter(pieceNumberToSmash);
    makeCharacterSad(character);
    p.smashed = true;
    var sp = allSmashedPieces[pieceNumberToSmash];
    sp.x = p.x;
    sp.y = p.y;
    table.removeChild(p);
    table.addChildAt(sp, table.getChildIndex(cakeBall));
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
    if (pieceNumber > -1) {
        return allCharacters[pieceNumber];
    } else {
        return {};
    }
}

/**
 * @summary cake
 
 * x position of center of characeter relative to table container
 * handPicX pos of left upper corner of handpic relative left upper of happypic
 * pieceX relative to table
 */

function Character(x, y, pieceNumber, pieceX, pieceY, happyPic, hasSadPic, hasHandPic, handPicX, handPicY, name) {
    "use strict";
    //constructor for character
    this.pieceNumber = pieceNumber;

    this.pieceX = pieceX;
    this.pieceY = pieceY;

    this.happyPic = new createjs.Bitmap(queue.getResult(happyPic));
    this.happyPic.character = this;
    //will this circular reference cause garbage?
    //Not according to
    //http://stackoverflow.com/questions/7347203/circular-references-in-javascript-garbage-collector

    this.happyPic.regX = this.happyPic.image.width / 2 | 0;
    this.happyPic.regY = this.happyPic.image.height / 2 | 0;
    this.happyPic.x = x; //+this.happyPic.image.width / 2 | 0;
    this.happyPic.y = y; //+this.happyPic.image.height / 2 | 0;
    this.happyPic.name = name + " happy";

    if (hasSadPic) {
        this.sadPic = new createjs.Bitmap(queue.getResult(happyPic + "Sad"));
        this.sadPic.character = this;
        this.sadPic.regX = this.happyPic.regX;
        this.sadPic.regY = this.happyPic.regY;
        this.sadPic.x = this.happyPic.x;
        this.sadPic.y = this.happyPic.y;
        this.sadPic.name = name + " sad";
    }

    if (hasHandPic) {
        this.handPic = new createjs.Bitmap(queue.getResult(happyPic + "Hand"));
        this.handPic.character = this;
        this.handPic.regX = this.happyPic.regX - handPicX;
        this.handPic.regY = this.happyPic.regY - handPicY;
        this.handPic.x = this.happyPic.x;
        this.handPic.y = this.happyPic.y;
        this.handPic.name = name + " hand";
    }
    this.name = name;
    restoreCharacter(this);
    addCharacterEventListener(this);
}

/**
 * @summary cake
 */

function hideAllNumbers() {
    "use strict";
    var i;
    for (i = 0; i < numbers.length; i += 1) {
        numbers[i].alpha = 0;
        stage.removeChild(numbers[i]);
    }
    stage.removeChild(numberBackground);
}

/**
 * @summary cake
 */

function showNumber(number) {
    "use strict";
    var n = numbers[number];

    if (number > 1) {
        numbers[number - 1].alpha = 0;
        stage.removeChild(numbers[number - 1]);
    }

    n.x = canvasWidth / 2; //880;
    n.y = canvasHeight / 2; //220;
    n.scaleX = 3.0;
    n.scaleY = 3.0;

    stage.addChild(numberBackground);

    stage.addChild(n);

    createjs.Tween.get(n).to({
        alpha: 1.0
    }, numberAppearTime, createjs.Ease.linear).wait(numberWaitTime).call(function(evt) {
        stage.removeChild(numberBackground);
    }).to({
        x: numberX,
        y: numberY,
        scaleX: 1.0,
        scaleY: 1.0
    }, numberMoveTime, createjs.Ease.linear);
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
        extendAndPlayQueue("where" + nextBall.color); //this sound is "watched" and will trigger pulsating ball
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
            if (ball.obstacleBall !== ball.lastObstacleBall) {
                //ball has bounced into another ball. stop running tween and start new tween in new direction
                if (isRunning(ballTween)) { //note isRunning(ballTween) is checking ALL running tweens due to a bug in tweenjs
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

function handleMenuBallTouch(evt) {
    "use strict";
    if (noGameRunning() && !isRunning()) {
        menuBall.focus = true;
        extendAndPlayQueue(["silence1000"]); //very weird. this sound is needed for first sound to play on iphone.
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
    changeBackground(ballBackgroundColor);
    showBalls();
    showBackButton();
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

function hideBallGame() {
    "use strict";
    menuBall.focus = false;
    createjs.Tween.removeAllTweens();
    nextBallTime = -1;
    clearTimeout(nextBallId);

    hideBalls();
    hideStar();
    hideBackButton();
    showSplashScreen();
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
    menuBall.name = "menu ball";

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

function showBalls() {
    "use strict";
    var i;
    for (i = 0; i < allBalls.length; i += 1) {
        stage.addChild(allBalls[i]);
    }
}

/**
 * @summary ball
 */

function hideBalls() {
    "use strict";
    var i;
    for (i = 0; i < allBalls.length; i += 1) {
        stage.removeChild(allBalls[i]);
    }
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
        if ((allBalls[i] !== thisBall) && allBalls[i].inside) {
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
        if (allBalls[i] !== thisBall && allBalls[i].inside) {
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

function handlePlayBallTouch(evt) {
    "use strict";
    var ball = evt.target;

    //if (!isRunning(ballTween)) { //note isRunning(ballTween) is checking ALL running tweens due to a bug in tweenjs
    if (getPlayingSound() === "") {
        if (ball === nextBall) {
            //correct ball is touched
            extendAndPlayQueue("yes" + ball.color);
            var otherBall = findRandomBall(ball);
            if (otherBall !== null) {
                var directionX = otherBall.x + 0.35 * otherBall.image.width * randomDirection();
                var directionY = otherBall.y + 0.35 * otherBall.image.width * randomDirection();
                ballTween = makeBallTween(ball, directionX, directionY, ballBounceSpeed);
                nextBall = null;
                nextBallTime = randomFutureMillis(minSecNextBall, maxSecNextBall);
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
            //wrong ball is touched
            var startRotation = ball.rotation;
            createjs.Tween.get(ball).to({
                rotation: startRotation + 360 * wrongBallNumberOfTurns
            }, wrongBallTurnTime, createjs.Ease.sineInOut);
            //createjs.Tween.get(ball).to({rotation:startRotation + 360 * 4}, 2000,createjs.Ease.sineInOut);

            extendAndPlayQueue(["thatwas" + ball.color, "where" + nextBall.color]);
        } else {
            //no ball chosen yet
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
    this.regX = this.image.width / 2 | 0;
    this.regY = this.image.height / 2 | 0;
    this.name = name;
    this.color = color;
    this.addEventListener("mousedown", handlePlayBallTouch);
    this.alpha = 0.0;
    this.radius = this.regX;
    this.last = false;
}

/* =========== CLOTHES ========== */

/**
 * @summary clothes
 */

function Clothes(linePicId, wearPicId, name, startRotation, startX, startY, wearX, wearY, movable) {
    "use strict";
    //note linepic and wearpic should have approximately the same size but must not be exact
    
    this.name = name;
    
    this.linePic = new createjs.Bitmap(queue.getResult(linePicId));
    this.linePic.clothes = this;
    this.wearPic = new createjs.Bitmap(queue.getResult(wearPicId));
    this.wearPic.clothes = this;

    this.linePic.startX = startX;

    this.linePic.startY = startY;

    this.linePic.regX = this.linePic.image.width / 2 | 0;
    this.linePic.regY = this.linePic.image.height / 2 | 0;

    this.linePic.startRotation = startRotation;

    this.linePic.wearX = wearX;
    this.linePic.wearY = wearY;
    this.linePic.kind = "linePic";

    this.wearPic.regX = this.wearPic.image.width / 2 | 0;
    this.wearPic.regY = this.wearPic.image.height / 2 | 0;

    this.wearPic.startRotation = startRotation;

    this.extraArea = new createjs.Shape();
    this.extraArea.graphics.beginFill(clothesBackgroundColor[0]).drawCircle(0, 0, 50, 50);
    this.extraArea.clothes = this;
    this.extraArea.startX = startX;
    this.extraArea.startY = startY;

    this.extraArea.kind = "extraArea";

    if (movable) {
        this.extraArea.addEventListener("mousedown", handlePrePressmoveMousedown);
        this.extraArea.addEventListener("pressmove", handlePressmove);
        this.extraArea.addEventListener("pressup", handlePostPressmovePressup);

        this.linePic.addEventListener("mousedown", handlePrePressmoveMousedown);
        this.linePic.addEventListener("pressmove", handlePressmove);
        this.linePic.addEventListener("pressup", handlePostPressmovePressup);

    }

    restorePieceOfClothes(this);
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
    menuClothes.name = "menu clothes";

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
    tore.startX = toreX;
    tore.x = toreX;

    tore.startY = toreY;
    tore.y = toreY;

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

    /* line pics on top of wear pics */
    clothesGameContainer.addChild(sockRight.wearPic);
    clothesGameContainer.addChild(sockLeft.wearPic);
    clothesGameContainer.addChild(trousers.wearPic);
    clothesGameContainer.addChild(shirt.wearPic);
    clothesGameContainer.addChild(sockRight.linePic);
    clothesGameContainer.addChild(sockLeft.linePic);
    clothesGameContainer.addChild(trousers.linePic);
    clothesGameContainer.addChild(shirt.linePic);

    clothesGameContainer.addChild(line);
    clothesGameContainer.name = "clothes game container";
}

/**
 * @summary clothes
 */

function handleMenuClothesTouch(evt) {
    "use strict";
    if (noGameRunning() && !isRunning()) {
        menuClothes.focus = true;
        extendAndPlayQueue(["silence1000"]); //very weird. this sound is needed for first sound to play on iphone.
        hideSplashScreen();
        showClothesGame();
        startClothesGame();
    }
}

/**
 * @summary clothes
 */

function startClothesGame() {
    "use strict";

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
    createjs.Tween.removeTweens(c.linePic);
    createjs.Tween.removeTweens(c.wearPic);
    c.linePic.tweening = false; //true if tweening back to position. Used because of bug in hasActiveTweens
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

function hideClothesGame() {
    "use strict";
    menuClothes.focus = false;
    createjs.Tween.removeAllTweens();
    restorePieceOfClothes(shirt);
    restorePieceOfClothes(trousers);
    restorePieceOfClothes(sockLeft);
    restorePieceOfClothes(sockRight);
    if (clothesGameContainer.drawingEnabled) {
        disableDrawing();
    }

    hideClothes();
    hideStar();
    hideBackButton();
    showSplashScreen();
}

/**
 * @summary clothes
 */

function hideClothes() {
    "use strict";
    createjs.Tween.get(clothesGameContainer).to({
        alpha: 0.0
    }, gameTransitionTime, createjs.Ease.linear).call(function(evt) {
        stage.removeChild(clothesGameContainer);
    });
}

/**
 * @summary clothes
 */

function showClothesGame() {
    "use strict";
    //createjs.Tween.get(clothesBackground).to({alpha:1.0},gameTransitionTime, createjs.Ease.linear);
    changeBackground(clothesBackgroundColor);
    showTore();
    showBackButton();
}

/**
 * @summary clothes
 */

function showTore() {
    "use strict";
    stage.addChild(clothesGameContainer);
}

/**
 * @summary clothes
 */

function handlePrePressmoveMousedown(evt) {
    "use strict";
    var t;
    var t2;
    //make sure t is always linepic, and t2 is extraarea
    if (evt.target.kind === "linePic") {
        t = evt.target;
        t2 = t.clothes.extraArea;
    } else if (evt.target.kind === "extraArea") {
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
    if (evt.target.kind === "linePic") {
        t = evt.target;
        t2 = t.clothes.extraArea;
    } else if (evt.target.kind === "extraArea") {
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
    if (evt.target.kind === "linePic") {
        t = evt.target;
        t2 = t.clothes.extraArea;
    } else if (evt.target.kind === "extraArea") {
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
        stage.removeChild(crayons[i]);
    }
    stage.removeChild(crayonOverlay);
}

/**
 * @summary clothes
 */

function handleClothesPaint() {
    "use strict";
    if (clothesGameContainer.clean) {
        clothesGameContainer.clean = false;
        tore.sad.alpha = 1.0;
        stage.update();
        clothesGameContainer.alpha = 0.0;
    }

}

/**
 * @summary clothes
 */

function handleInvisibleCrayonButton(evt) {
    "use strict";

    var x = evt.stageX;
    var y = evt.stageY;

    if (x >= canvasWidth - crayonShowLength && x <= canvasWidth &&
        y >= crayonTop && y <= crayonTop + numberOfCrayons * crayonDelta) {
        //a crayon is hit
        var oldCrayonColorIndex = crayonColorIndex;
        crayonColorIndex = Math.floor((y - crayonTop) / crayonDelta);
        crayonColor = crayonColors[crayonColorIndex];
        drawCrayons(crayonColorIndex, oldCrayonColorIndex, false);
        stage.update();
    }
}

/**
 * @summary clothes
 */

function handleStrokeMouseDown(evt) {
    "use strict";
    var x = evt.stageX;
    var y = evt.stageY;
    detectPaint(x, y);
    oldPt = new createjs.Point(x, y);
    oldMidPt = new createjs.Point(x, y);

    drawingCanvas.graphics.clear().beginFill(crayonColor).drawCircle(oldPt.x, oldPt.y, drawingStroke / 2, drawingStroke / 2);
    stage.update();

    stage.addEventListener("stagemousemove", handleStrokeMouseMove);
    stage.addEventListener("stagemouseup", handleStrokeMouseUp);

}

/**
 * @summary clothes
 */

function handleStrokeMouseMove(evt) {
    "use strict";
    var x = evt.stageX;
    var y = evt.stageY;
    detectPaint(x, y);

    var midPt = new createjs.Point(oldPt.x + x >> 1, oldPt.y + y >> 1);

    drawingCanvas.graphics.clear().setStrokeStyle(drawingStroke, 'round', 'round').beginStroke(crayonColor).
    moveTo(midPt.x, midPt.y).
    curveTo(oldPt.x, oldPt.y, oldMidPt.x, oldMidPt.y);

    oldPt.x = x;
    oldPt.y = y;

    oldMidPt.x = midPt.x;
    oldMidPt.y = midPt.y;

    stage.update();
}

/**
 * @summary clothes
 */

function handleStrokeMouseUp(evt) {
    "use strict";
    var x = evt.stageX;
    var y = evt.stageY;

    drawingCanvas.graphics.clear().setStrokeStyle(drawingStroke, 'round', 'round').beginStroke(crayonColor).
    moveTo(oldMidPt.x, oldMidPt.y).
    lineTo(x, y);
    refreshCrayons(); //show crayons if overdrawn and covered by paint
    stage.update();
    stage.removeEventListener("stagemousemove", handleStrokeMouseMove);
    stage.removeEventListener("stagemouseup", handleStrokeMouseUp);

}

/**
 * @summary clothes
 */

function detectPaint(x, y) {
    "use strict";
    var detected = false;
    var pt;
    var i;
    for (i = 0; i < paintDetect.length && !detected; i += 1) {
        pt = paintDetect[i].globalToLocal(x, y); //maybe this can be optimised by doing transformation only once
        if (paintDetect[i].hitTest(pt.x, pt.y)) {
            detected = true;
            handleClothesPaint();
        }
    }

}

/**
 * @summary clothes
 */

function drawCrayons(index, oldindex, keep) {
    "use strict";
    var i;
    for (i = 0; i < numberOfCrayons; i += 1) {
        crayons[i].y = crayonTop + i * crayonDelta;
        if (i === index) {
            crayons[i].x = canvasWidth - crayonShowLength;
        } else {
            if (i === oldindex) {
                crayonOverlay.y = crayons[i].y;
                crayonOverlay.x = canvasWidth - crayonShowLength;
                stage.addChild(crayonOverlay);
            }
            crayons[i].x = canvasWidth - crayonShowLength / 2;
        }
        stage.addChild(crayons[i]);
    }
    stage.update();
    if (!keep) {
        for (i = 0; i < numberOfCrayons; i += 1) {
            stage.removeChild(crayons[i]);
        }
        stage.removeChild(crayonOverlay);
    }
}

function refreshCrayons() {
    "use strict";
    drawCrayons(crayonColorIndex, crayonColorIndex, false);
}

/**
 * @summary clothes
 */

function makeCrayon(color, outlineColor, outlineWidth) {
    "use strict";
    var crayon = new createjs.Shape();
    crayon.name = color + " crayon";
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

function makeCrayonOverlay(color, outlineColor, outlineWidth) {
    "use strict";
    var crayon = new createjs.Shape();
    crayon.name = color + " crayon";
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
    lineTo(40, 0);
    return crayon;
}

function enableDrawing() {
    "use strict";
    if (helpContainer.visible) {
        //wait until helpContainer is gone
        setTimeout(enableDrawing, 2000);
    } else if (menuClothes.focus) {
        numberOfCrayons = crayonColors.length;
        crayonTop = canvasHeight - (numberOfCrayons + 1) * crayonDelta;
        clothesGameContainer.drawingEnabled = true;
        menuHelp.alpha = 0.0;
        stage.update();
        crayonColorIndex = 0;
        crayonColor = crayonColors[crayonColorIndex];

        var i;
        for (i = 0; i < crayonColors.length; i += 1) {
            crayons[i] = makeCrayon(crayonColors[i], "black", 3);

            crayons[i].index = i;
        }

        crayonOverlay = makeCrayonOverlay(clothesBackgroundColor[0], clothesBackgroundColor[0], 4);

        drawingCanvas = new createjs.Shape();
        drawingCanvas.name = "drawing canvas";
        stage.addEventListener("stagemousedown", handleStrokeMouseDown);
        stage.addEventListener("stagemousedown", handleInvisibleCrayonButton);
        stage.addChild(drawingCanvas);
        drawCrayons(crayonColorIndex, crayonColorIndex, true);

        stage.update(); //this is done in drawCrayons but an extra update seems to be needed for correct update in android webview
        stage.autoClear = false;
        drawCrayons(crayonColorIndex, crayonColorIndex, false);
    }
}
