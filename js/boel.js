/* Boel och Tore - da game */

//debug settings
var debug=false;
var debugAlwaysUpdate=false;

var enableCakePieceTouch=false; //if true, cake pieces can be distributet by clicking cake

//prototypes for subclasses
Ball.prototype=Object.create(createjs.Bitmap.prototype);

//setup parameters
var timeToNewBallGame=1500; //ms
var ballBounceSpeed=0.4;//pixels per millisecond
var fps=24;
var minSecSelectName=2; //min random time before voice: "x vill ha tårta, var är x"
var maxSecSelectName=2.4; //max random time...
var minSecNextBall=3.0;
var maxSecNextBall=3.2;

//xxx possibly put setup parameters in a setup object:
//var setup={timeToNewBallGame:1500,ballBounceSpeed:0.4};

var ballTween=new Object();

var characters=new Object(); //to find character connected to piece through getCharacter function

var cardinal=[
	"noll",
	"en",
	"tvaa",
	"tre",
	"fyra",
	"fem",
	"sex"];
	
var ordinal=[
	"nolltetaartbiten",
	"foerstataartbiten",
	"andrataartbiten",
	"tredjetaartbiten",
	"fjaerdetaartbiten",
	"femtetaartbiten",
	"sjaettetaartbiten"];

//variable definitions
var canvas;
var minBounceDistance;
var stage;
var background;
var queue;
var offset;
var update = false;
var menuBall,menuCake;
var boel,cake;

var blueBall,redBall,yellowBall,greenBall;
var allBalls;

var pieceParts,cakepieces;

var cakefiles;

var cakeBall;

var table;
var tableBoel=new Object();
var tableMom=new Object();
var tableGrandDad=new Object();
var tableDad=new Object();
var tableTore=new Object();
var tableDog=new Object();
var tableTable;

var numbers=new Array();

var cakeComplete=new Array(); 
var debugText;

var loadedFiles;
var filesToLoad;


var ballBackground;
var splashScreenBackground;
var tableBackground

var now;
var nextSmash;
var nextRandomCheck;
var pieceNumberToSmash;

var nextBall;
var nextBallTime;

var selectedNameNumber;
var selectedName; 

var soundQueue=[];

function init() {
	console.log("Boel game starting at "+Date());
	console.log("TweenJS version "+createjs.TweenJS.version);

	document.getElementById("loader").className = "loader";
	// create stage and point it to the canvas:
	canvas = document.getElementById("myCanvas");
	
	//some initial values of "constans"
	//pixels, must be larger than canvas diagonal to make sure ball bounces outside of canvas
	minBounceDistance=Math.floor(Math.sqrt(canvas.width*canvas.width+canvas.height*canvas.height)*1.5); 

	//initial values. some of these must be reset to initial values when game is restarted
	loadedFiles=0;
	now=0;
	nextSmash=-1;
	nextRandomCheck=-1;
	pieceNumberToSmash=-1;
	nextBallTime=-1;
	selectedNameNumber=-1;
	selectedName=""; 

	//check to see if we are running in a browser with touch support
	stage = new createjs.Stage(canvas);
	stage.addEventListener("stagemousedown", handleStageMouseDown);

	stage.name="The Stage";
	// enable touch interactions if supported on the current device:
	createjs.Touch.enable(stage);

	//the background is an almost invisible object, there to be able to click the background
	//currently only used for testing and debugging
	background=createBackground("#FFFFFF",0.05);
	splashScreenBackground=createBackground("#86DBD5",1.0);
	ballBackground=createBackground("#FFFF00",0.0);
	tableBackground=createBackground("#FF95CB",0.0);
	
	stage.addChild(background);
	stage.addChild(splashScreenBackground);
	stage.addChild(ballBackground);
	stage.addChild(tableBackground);

	//loading assets
	queue=new createjs.LoadQueue(false);
	
	queue.installPlugin(createjs.Sound);
	
	queue.addEventListener("complete",handleComplete);
	queue.addEventListener("error", handleFileError);
	queue.addEventListener("fileload", handleFileLoad);

	var soundfiles=[
		{id:"andrataartbiten",src:"assets/andrataartbiten.mp3"},
		{id:"boelslut",src:"assets/boelslut.mp3"},
		{id:"boelstart",src:"assets/boelstart.mp3"},
		{id:"boelvill_",src:"assets/boelvill_.mp3"},
		{id:"detaerju",src:"assets/detaerju.mp3"},
		{id:"detaerjuentaartbit",src:"assets/detaerjuentaartbit.mp3"},
		{id:"detvarvaelinte",src:"assets/detvarvaelinte.mp3"},
		{id:"faar",src:"assets/faar.mp3"},
		{id:"femtetaartbiten",src:"assets/femtetaartbiten.mp3"},
		{id:"fjaerdetaartbiten",src:"assets/fjaerdetaartbiten.mp3"},
		{id:"foerstataartbiten",src:"assets/foerstataartbiten.mp3"},
		{id:"hundenslut",src:"assets/hundenslut.mp3"},
		{id:"hundenstart",src:"assets/hundenstart.mp3"},
		{id:"hundenvill_",src:"assets/hundenvill_.mp3"},
		{id:"ja",src:"assets/ja.mp3"},
		{id:"mammaslut",src:"assets/mammaslut.mp3"},
		{id:"mammastart",src:"assets/mammastart.mp3"},
		{id:"mammavill_",src:"assets/mammavill_.mp3"},
		{id:"morfarslut",src:"assets/morfarslut.mp3"},
		{id:"morfarstart",src:"assets/morfarstart.mp3"},
		{id:"morfarvill_",src:"assets/morfarvill_.mp3"},
		{id:"pappaslut",src:"assets/pappaslut.mp3"},
		{id:"pappastart",src:"assets/pappastart.mp3"},
		{id:"pappavill_",src:"assets/pappavill_.mp3"},
		{id:"sjaettetaartbiten",src:"assets/sjaettetaartbiten.mp3"},
		{id:"somfaar",src:"assets/somfaar.mp3"},
		{id:"toreslut",src:"assets/toreslut.mp3"},
		{id:"torestart",src:"assets/torestart.mp3"},
		{id:"torevill_",src:"assets/torevill_.mp3"},
		{id:"tredjetaartbiten",src:"assets/tredjetaartbiten.mp3"},
		{id:"tyst1000",src:"assets/tyst1000.mp3"},
		{id:"cakebounce",src:"assets/cakebounce.mp3"},
		{id:"detjublue",src:"assets/detjublue.mp3"},
		{id:"detjuyellow",src:"assets/detjuyellow.mp3"},
		{id:"detjugreen",src:"assets/detjugreen.mp3"},
		{id:"detjured",src:"assets/detjured.mp3"},
		//{id:"nejinteyellow",src:"assets/nejinteyellow.mp3"},
		//{id:"nejintegreen",src:"assets/nejintegreen.mp3"},
		//{id:"nejinteblue",src:"assets/nejinteblue.mp3"},
		//{id:"nejintered",src:"assets/nejintered.mp3"},
		{id:"jagreen",src:"assets/jagreen.mp3"},
		{id:"jablue",src:"assets/jablue.mp3"},
		{id:"jared",src:"assets/jared.mp3"},
		{id:"jayellow",src:"assets/jayellow.mp3"},
		{id:"vargreen",src:"assets/vargreen.mp3"},
		{id:"varblue",src:"assets/varblue.mp3"},
		{id:"varyellow",src:"assets/varyellow.mp3"},
		{id:"varred",src:"assets/varred.mp3"}];
				
		
		
		
	var simpleimagefiles=[
		{id:"boelSplashScreen", src:"assets/boelsplashscreen.png"},
		{id:"menuBall", src:"assets/menuball.png"},
		{id:"menuCake", src:"assets/menucake.png"},
		{id:"dog", src:"assets/dog.png"},
		{id:"button", src:"assets/button.png"},
		{id:"cake_plate", src:"assets/cake_plate.png"},
		{id:"blueball", src:"assets/blueball.png"},
		{id:"redball", src:"assets/redball.png"},
		{id:"yellowball", src:"assets/yellowball.png"},
		{id:"greenball", src:"assets/greenball.png"},
		{id:"cakeBall", src:"assets/cake_ball.png"}	
		];
		
	var numberfiles=new Array();
	for (var i=0;i<10;i++) {
		numberfiles.push({id:i+"",src:"assets/"+i+".png"});
	}
	pieceParts=["smashed_piece","cake_base","cake_outsidelines"]; //should be pieceparts
	cakepieces=6;
	cakefiles=buildcakefiles(pieceParts,cakepieces);
	

	//no camelCase in filenames (might lead to cross platform issues...)
	tablefiles=[
				{id:"tableMom",src:"assets/tablemom.png"},
				{id:"tableMomSad",src:"assets/tablemomsad.png"},
				{id:"tableGrandDad",src:"assets/tablegranddad.png"},
				{id:"tableGrandDadSad",src:"assets/tablegranddadsad.png"},
				{id:"tableBoel",src:"assets/tableboel.png"},
				{id:"tableBoelSad",src:"assets/tableboelsad.png"},
				{id:"tableDad",src:"assets/tabledad.png"},
				{id:"tableDadSad",src:"assets/tabledadsad.png"},
				{id:"tableTore",src:"assets/tabletore.png"},
				{id:"tableToreSad",src:"assets/tabletoresad.png"},
				{id:"tableTable",src:"assets/tabletable.png"},
				{id:"tableMomHand",src:"assets/tablemomhand.png"},
				{id:"tableDadHand",src:"assets/tabledadhand.png"},
				{id:"tableToreHand",src:"assets/tabletorehand.png"},
				{id:"tableDog",src:"assets/tabledog.png"},
				{id:"tableDogSad",src:"assets/tabledogsad.png"},
				{id:"tableBoelHand",src:"assets/tableboelhand.png"},
				{id:"tableGrandDadHand",src:"assets/tablegranddadhand.png"},
				];
	
	var files=simpleimagefiles.concat(cakefiles,numberfiles,tablefiles,soundfiles);
	
	queue.loadManifest(files);
	filesToLoad=files.length;
}

function createBackground(color,alpha) {
	b = new createjs.Shape();
	b.graphics.beginFill(color).drawRect(0, 0, canvas.width, canvas.height);
	b.x = 0;
	b.y = 0;
	b.alpha=alpha;
	return b;
}


function handleBackgroundTouch(event) {
	console.log("background touch",event.stageX,event.stageY);
	printDebug(createjs.Tween.hasActiveTweens()+" ");
	background.touchX=event.stageX;
	background.touchY=event.stageY;
	debugAlwaysUpdate=false;
	stage.update();
}

function handleStageMouseDown(event) {
    printDebug("stageX:"+Math.floor(event.stageX)+", stageY:"+Math.floor(event.stageY)+" ");
    console.log("stageX:"+Math.floor(event.stageX)+", stageY:"+Math.floor(event.stageY)+" ");
}	

function printDebug(text) {
	console.log("printDebug ",text);
	if (debug) {
		debugText.text+=text;
		debugText.text=debugText.text.substring(debugText.text.length-68,debugText.text.length);
		stage.update();	
	}
}

function handleFileError(event) {
	var div = document.getElementById("loader");
	div.innerHTML = "File load error";
	div.style.backgroundColor = "#FF0000";
}
	
function handleFileLoad(event) {
	loadedFiles++;
	var div = document.getElementById("loader");
	div.innerHTML = "loaded resources: "+loadedFiles;
}

function handleComplete(event) {
	//event triggered even if file not loaded
	if (loadedFiles<filesToLoad) {
		var div = document.getElementById("loader");
		div.innerHTML = "Some resources were not loaded: "+(filesToLoad-loadedFiles);
	}

	addBoelSplashScreen();
	
	addTable();

	addCake(pieceParts,cakepieces,cakefiles);
	
	addBall();

	addButton();
	
	addNumbers();
	
	addDebugText();
	
	//setup almost complete, start the ticker
	background.addEventListener("mousedown", handleBackgroundTouch);
	document.getElementById("loader").className = "";
	createjs.Ticker.addEventListener("tick", handleTick);
	
	//RAF_SYNCHED TEST
	//createjs.Ticker.timingMode = createjs.Ticker.RAF_SYNCHED;
	//createjs.Ticker.setFPS(30);
	//no visible difference
	
	createjs.Ticker.setFPS(fps);
	stage.update();		
}

function handleTick(event) {
	//this set makes it so the stage only re-renders when an event handler indicates a change has happened.
	
	now=createjs.Ticker.getTicks(false)
	
	//xxx move to function
	if (now>nextSmash && nextSmash>0) {
		//console.log("smash");
		var movedAndNotSmashed=[];
		for (var pieceNumber in cakeComplete) {
			piece=cakeComplete[pieceNumber];
			if (piece.moved && !piece.smashed) {
				movedAndNotSmashed.push(pieceNumber);
			}
		}
		if (movedAndNotSmashed.length>0) {
			//här bestäms vilken som ska smashas. när bestäms däremot i moveCakePiece
			var randomIndex=Math.floor(Math.random()*movedAndNotSmashed.length);
			var randomPiece=movedAndNotSmashed[randomIndex];
			//console.log("smashar snart bit ",randomPiece);
			bounceToTable(randomPiece);
		}
		//nextSmash=-1;
		nextSmash=randomFutureTicks(10,10.01);//important that min time is greater than total boal bounce time
		
		//console.log("next smash om ", (nextSmash-now)/fps," s");

	}
	
	
	//tell which ball to touch
	//xxx move to function
	if (now>nextBallTime && nextBallTime>0) {
		
		nextBall=findRandomBall();
		extendAndPlayQueue("var"+nextBall.color); //this sound is "watched" and will trigger pulsating ball
		//createjs.Tween.get(ball).to({rotation:startRotation+360*3}, 1500,createjs.Ease.sineInOut).to({rotation:startRotation}, 1500,createjs.Ease.sineInOut);
		nextBallTime=-1	
	}
	
	//xxx move to function
	if (now>nextRandomCheck && nextRandomCheck>0) {
		//vem har inte fått tårtbit än?
		if (soundQueue.length==0 && selectedNameNumber==-1) {
			var notMoved=[];
			for (var pieceNumber in cakeComplete) {
				piece=cakeComplete[pieceNumber];

				if (!piece.moved) {
					notMoved.push(pieceNumber);
				}
			}
			if (notMoved.length>0) { 
				var randomIndex=Math.floor(Math.random()*notMoved.length);
				selectedNameNumber=notMoved[randomIndex];
				selectedName=getCharacterNameSound(selectedNameNumber);
				//xxx tried to pulsate character but this isn't working yet:
				var character=getCharacter(selectedNameNumber);
				//pulsate(character.happyPic,1000); //xxx 1) hand must be pulsated if available 2) must pulsate around center of character
				extendAndPlayQueue([selectedName+"vill_"]);//namn vill ha tårta, var är namn?
			}
		} 
		nextRandomCheck=-1;
	}
	
	if (update || debugAlwaysUpdate) {	
	    if (ballTween.hasOwnProperty("target")) {
					
			var ball=ballTween.target;
			
			//kolla om ball utanför canvas
			//plocka då bort den så att den inte kan studsas mot
			var inside=(ball.x-ball.radius)<canvas.width && (ball.y-ball.radius)<canvas.height && (ball.x+ball.radius)>0 && (ball.y+ball.radius)>0;
			if (!inside) {
				ball.inside=false;
				ball.alpha=0;
				ballTween.setPaused(true);
				if (ball.last) {
					//xxx kolla om det är sista bollen, starta då iom spelet
					startBallGame(timeToNewBallGame);
				}
				
			}
			
			
			//flytta mycket av detta till funktion, kanske tom if-satsen ovan. 
			if (detectBallCollision(ball,0)) {

				if (ball.obstacleBall!=ball.lastObstacleBall) {
					//ball has bounced into another ball. stop running tween and start new tween in new direction
					if (isRunning(ballTween)) {
						ballTween.setPaused(true); //funkar nog bäst
					}
					var centerToCenterAngle=Math.atan2(ball.y-ball.obstacleBall.y,ball.x-ball.obstacleBall.x);
					ball.bounceAngle=2*centerToCenterAngle-Math.PI-ball.startAngle;
					var deltaX=minBounceDistance*Math.cos(ball.bounceAngle); 
					var deltaY=minBounceDistance*Math.sin(ball.bounceAngle);
					var finalX=ball.x+deltaX;
					var finalY=ball.y+deltaY;
					ballTween=makeBallTween(ball,finalX,finalY,ballBounceSpeed); //ballBounceSpeed
				}
			
			}
		}
		stage.update(event); //pass event to make sure for example sprite animation works
	}
	
	update=createjs.Tween.hasActiveTweens();
	
}

function makeBallTween(ball,x,y,speed) {
	//speed in pixels per millisecond
	var distance=Math.sqrt((x-ball.x)*(x-ball.x)+(y-ball.y)*(y-ball.y));
	var time=Math.floor(distance/speed);
console.log("time",time,"x",x,"y",y);
	ball.startAngle=Math.atan2(y-ball.y,x-ball.x);
	return createjs.Tween.get(ball).to({x:x,y:y,rotation:ball.rotation+360},time, createjs.Ease.linear);//xxx rotation faster the shorter distance. Could be adjusted based on speed?
}

function isRunning(tween) {
		//old way: doesn't work, _paused not definded for running tween	
		//return !tween._paused; //getting a "private" property

		//new way: NOTE xxx doesn't check tween, but *ALL* running tweens
		//possibly somtehing like createjs.Tween.hasActiveTweens(tween.target???) might work, but 
		//due to bug in 0.5.1 it is not safe. Seems to work in NEXT version though. 
		return createjs.Tween.hasActiveTweens();
}

function handleCharacterTouch(event) {
	//ok, vi har ett event. detta är en bitmapimage. men hur veta vilken character den hör till?
	var c=event.target.character;
	moveCakePiece(c.pieceNumber,c.pieceDeltaX,c.pieceDeltaY,"character");
}

function handleCakePieceTouch(event) {
	pieceNumber=event.target.number;
	var c=getCharacter(pieceNumber);
	moveCakePiece(c.pieceNumber,c.pieceDeltaX,c.pieceDeltaY,"piece");
}

function changeSplashScreen(alpha) {
	createjs.Tween.get(menuCake).to({alpha:alpha}, 400, createjs.Ease.linear);
	createjs.Tween.get(menuBall).to({alpha:alpha},400,createjs.Ease.linear);  
	createjs.Tween.get(boelSplashScreen).to({alpha:alpha}, 200, createjs.Ease.linear);
	createjs.Tween.get(splashScreenBackground).to({alpha:alpha},400, createjs.Ease.linear);
}

function showSplashScreen() {
	changeSplashScreen(1.0);
}

function hideSplashScreen() {
	changeSplashScreen(0.0);
}

function handleMenuCakeTouch(event) {
	
	//if (!menuBall.focus && !menuCake.focus) { //xxx quickfix, not needed anymore
	  menuCake.focus=true;
	  extendAndPlayQueue(["tyst1000"]);//xxx very weird. this sound is needed for first sound to play on iphone.
  
	
      hideSplashScreen()
	
	  //xxx to be moved to startcakegame
	  nextRandomCheck=randomFutureTicks(minSecSelectName,maxSecSelectName);
	  createjs.Tween.get(cake).to({alpha:1.0}, 400, createjs.Ease.linear);
	  createjs.Tween.get(table).to({alpha:1.0}, 400, createjs.Ease.linear);
      createjs.Tween.get(tableBackground).to({alpha:1.0},400, createjs.Ease.linear);


	//}
}

function handleButtonTouch(event) {
	if (menuBall.focus) {
		restoreMenuBall();
	} else if (menuCake.focus) {
		restoreMenuCake();
	}
}

function addDebugText() {
	debugText = new createjs.Text("", "24px Courier", "#000");
	debugText.x=20;
	debugText.y=canvas.height-30;
	if (debug) {
		debugText.text="Debug on";
	} else {
		debugText.text=" ";
	}
	stage.addChild(debugText);
}

function addBoelSplashScreen() {
	boelSplashScreen=new createjs.Bitmap(queue.getResult("boelSplashScreen"));
	stage.addChild(boelSplashScreen);
	boelSplashScreen.scaleX = boelSplashScreen.scaleY = boelSplashScreen.scale = 1;
	boelSplashScreen.x =0;
	boelSplashScreen.y =0;
}

function addNumbers() {
	for (var i=0;i<10;i++) {
		var number=new createjs.Bitmap(queue.getResult(i+""));
		number.x=canvas.width-200;
		number.y=0;
		number.scaleX=1.0;
		number.scaleY=1.0;
		number.visible=false;
		numbers.push(number);
		stage.addChild(numbers[i]);
	}
}


function handleMenuBallTouch(event) {
	menuBall.focus=true;
	extendAndPlayQueue(["tyst1000"]);//xxx very weird. this sound is needed for first sound to play on iphone.
	hideSplashScreen();
	startBallGame(0);
}

function startBallGame(delay) {
	  nextBallTime=randomFutureTicks(minSecNextBall,maxSecNextBall);
	  nextBall=null; //decided att next ball time
	  allBalls.forEach(setRandomPosition);
	  for (var i=0;i<allBalls.length;i++) {
		  allBalls[i].scaleX=0.1;allBalls[i].scaleY=0.1;
		  createjs.Tween.get(allBalls[i]).wait(delay).to({scaleX:1.0,scaleY:1.0,alpha:1.0,rotation:allBalls[i].rotation+2*360}, 2000, createjs.Ease.linear); //xxx tweentider och antal varv till trimvariabler
	  }
      createjs.Tween.get(ballBackground).wait(delay).to({alpha:1.0},400, createjs.Ease.linear);	
}

function restoreMenuBall() {
	menuBall.focus=false;

 	nextBallTime=-1;

	for (i=0;i<allBalls.length;i++) {	
		createjs.Tween.removeTweens(allBalls[i]);
	}
	
	showSplashScreen();
	hideBalls();
}

function addBall() {
	menuBall=new createjs.Bitmap(queue.getResult("menuBall"));
	stage.addChild(menuBall);
	
	//these parameters won't change
	menuBall.xStart=canvas.width-menuBall.image.width/2-20;
	menuBall.yStart=menuBall.image.height/2+20;
	menuBall.x = menuBall.xStart;
	menuBall.y = menuBall.yStart;
	menuBall.regX = menuBall.image.width/2|0;
	menuBall.regY = menuBall.image.height/2|0;
	menuBall.name = "menuBall";
	
	//these will change
	menuBall.alpha = 1.0;
	menuBall.focus=false;
	
	menuBall.addEventListener("mousedown", handleMenuBallTouch);
	
	//here are balls of different colors used in the ball game. 
	blueBall=new Ball("blueball","Blå boll","blue");
	redBall=new Ball("redball","Röd boll","red");
	yellowBall=new Ball("yellowball","Gul boll","yellow");
	greenBall=new Ball("greenball","Grön boll","green");
	allBalls=[blueBall,redBall,yellowBall,greenBall];
}

function hideBalls() {
	for (i=0;i<allBalls.length;i++) {	
		createjs.Tween.get(allBalls[i]).to({alpha:0.0}, 400, createjs.Ease.linear);
	}
	createjs.Tween.get(ballBackground).to({alpha:0.0},400, createjs.Ease.linear);
}

function setRandomPosition(ball) {
	var minBorderDistance=200; //from center of ball
	var free=false;
	var forceField=40; //if forcefield close to 100, the balls won't fit and the script will freeze
	while (!free) { //a for me rare occasion where I would consider repeat instead...
		ball.x=Math.floor(Math.random()*(canvas.width-minBorderDistance*2)+minBorderDistance);
		ball.y=Math.floor(Math.random()*(canvas.height-minBorderDistance*2)+minBorderDistance);
		free=!detectBallCollision(ball,forceField);
	}
	ball.rotation=Math.floor(Math.random()*360);
	ball.inside=true;
	ball.last=false;
	delete ball.obstacleBall;
	delete ball.lastObstacleBall;
}

function collides(ball1,ball2,forceField) {
	var cathX=ball1.x-ball2.x; //horizontal catheter
	var cathY=ball1.y-ball2.y;
	
	var distanceSquare=cathX*cathX+cathY*cathY;
	var centerDist=ball1.radius+ball2.radius+forceField;
	var centerDistSquare=centerDist*centerDist;
	return (distanceSquare<centerDistSquare);
}
	
function findRandomBall(thisBall) {
	//find random ball *other* than ball
	
	allBallsButThis=[];
	for (var i=0;i<allBalls.length;i++) {
		if (allBalls[i]!=thisBall && allBalls[i].inside) {
			allBallsButThis.push(allBalls[i]);
		}
	}
	var randomIndex=Math.floor(Math.random()*allBallsButThis.length);
	if (allBallsButThis.length>0) {
		return allBallsButThis[randomIndex];
	}else {
		return null;
	}
	
	
}



function detectBallCollision(thisBall,forceField) {
	//klumpigt kanske, men funkar för bara fyra bollar.
	var collision=false;
	var otherBall=new Object;
	for (var i=0;i<allBalls.length && !collision;i++) {
		if (allBalls[i]!=thisBall  && allBalls[i].inside) {
			otherBall=allBalls[i];
			collision=collides(thisBall,otherBall,forceField);
			if (collision) {
				if (thisBall.hasOwnProperty("obstacleBall")) {
					thisBall.lastObstacleBall=thisBall.obstacleBall;
				}
				thisBall.obstacleBall=otherBall;			
			}
		}
	}
	return collision;
}

function handlePlayBallTouch(event) {
	var ball=event.target;
	
	
	
	if (!isRunning(ballTween)) {
	  if (ball==nextBall) {
		  //correct ball is touched
		  console.log("correct ball touched");
		  extendAndPlayQueue("ja"+ball.color);
		  var otherBall=findRandomBall(ball);
		  if (otherBall!==null) {
			  ballTween=makeBallTween(ball,otherBall.x+70,otherBall.y+70,ballBounceSpeed);
			  nextBall=null;
			  nextBallTime=randomFutureTicks(minSecNextBall,maxSecNextBall);
		  } else {
			  //random direction for last ball
			  var angle=Math.random()*2*Math.PI;
			  var x=minBounceDistance*Math.cos(angle);
			  var y=minBounceDistance*Math.sin(angle);
			  ball.last=true;
			  ballTween=makeBallTween(ball,x,y,ballBounceSpeed);
			  //xxx some kind of automatic restart of the ball game here...
		  }
	  } else if (nextBall!==null) {
		console.log("next ball",nextBall);
		console.log("wrong ball touched");
		//wrong ball is touched
		var startRotation=ball.rotation;
		createjs.Tween.get(ball).to({rotation:startRotation+360*4}, 2000,createjs.Ease.sineInOut);//xxx 2000 och 4* ska till trimvariabel som dessutom ska va minst lika långt som "det var ju blåa boillen" ljuden. Om tween-tiden är kortare än tiden för ljudet kan det bli error när man klickar fel boll. 
		extendAndPlayQueue(["detju"+ball.color,"var"+nextBall.color]);  
	  } else {
		  //xxx this else is not needed, only for test
		  console.log("touching ball before next ball defined");  
	  }
	}
}


function addTable() {
	
	
	table=new createjs.Container();
	
	
	
	//borde ha en array allCharacters som allBalls. Och character som class som ball
	tableMom.pieceNumber=4;
	tableMom.pieceDeltaX=-95;
	tableMom.pieceDeltaY=-55;
	tableMom.happyPic=new createjs.Bitmap(queue.getResult("tableMom"));
	tableMom.happyPic.character=tableMom; 
	//will this circular reference cause garbage? 
	//Not according to 	
	//http://stackoverflow.com/questions/7347203/circular-references-in-javascript-garbage-collector
	tableMom.sadPic=new createjs.Bitmap(queue.getResult("tableMomSad"));
	tableMom.sadPic.character=tableMom;
	tableMom.handPic=new createjs.Bitmap(queue.getResult("tableMomHand"));
	tableMom.handPic.character=tableMom;
	tableMom.name="Mamma"; 

	tableGrandDad.pieceNumber=3;
	tableGrandDad.pieceDeltaX=80;
	tableGrandDad.pieceDeltaY=-90;
	tableGrandDad.happyPic=new createjs.Bitmap(queue.getResult("tableGrandDad"));
	tableGrandDad.happyPic.character=tableGrandDad;
	tableGrandDad.sadPic=new createjs.Bitmap(queue.getResult("tableGrandDadSad"));
	tableGrandDad.sadPic.character=tableGrandDad;
	tableGrandDad.handPic=new createjs.Bitmap(queue.getResult("tableGrandDadHand"));
	tableGrandDad.handPic.character=tableGrandDad;
	tableGrandDad.name="Morfar";
	
	tableBoel.pieceNumber=5;
	tableBoel.pieceDeltaX=-120;
	tableBoel.pieceDeltaY=35;
	tableBoel.happyPic=new createjs.Bitmap(queue.getResult("tableBoel"));
	tableBoel.happyPic.character=tableBoel;
	tableBoel.sadPic=new createjs.Bitmap(queue.getResult("tableBoelSad"));
	tableBoel.sadPic.character=tableBoel;
	tableBoel.handPic=new createjs.Bitmap(queue.getResult("tableBoelHand"));
	tableBoel.handPic.character=tableBoel;
	tableBoel.name="Boel"; 

	tableDad.pieceNumber=2;
	tableDad.pieceDeltaX=104;
	tableDad.pieceDeltaY=-68;
	tableDad.happyPic=new createjs.Bitmap(queue.getResult("tableDad"));
	tableDad.happyPic.character=tableDad;
	tableDad.sadPic=new createjs.Bitmap(queue.getResult("tableDadSad"));
	tableDad.sadPic.character=tableDad;
	tableDad.handPic=new createjs.Bitmap(queue.getResult("tableDadHand"));
	tableDad.handPic.character=tableDad;
	tableDad.name="Pappa"; 

	tableTore.pieceNumber=1;
	tableTore.pieceDeltaX=115;
	tableTore.pieceDeltaY=100;
	tableTore.happyPic=new createjs.Bitmap(queue.getResult("tableTore"));
	tableTore.happyPic.character=tableTore;
	tableTore.sadPic=new createjs.Bitmap(queue.getResult("tableToreSad"));
	tableTore.sadPic.character=tableTore;
	tableTore.handPic=new createjs.Bitmap(queue.getResult("tableToreHand"));
	tableTore.handPic.character=tableTore;
	tableTore.name="Tore"; 

	tableDog.pieceNumber=0;
	tableDog.pieceDeltaX=-60;
	tableDog.pieceDeltaY=140;
	tableDog.happyPic=new createjs.Bitmap(queue.getResult("tableDog"));
	tableDog.happyPic.character=tableDog;
	tableDog.sadPic=new createjs.Bitmap(queue.getResult("tableDogSad"));
	tableDog.sadPic.character=tableDog;
//	tableDog.handPic=new createjs.Bitmap(queue.getResult("tableDogHand")); no dog hand
//	tableDog.handPic.character=tableDog;
	tableDog.name="Hunden"; 

	tableTable=new createjs.Bitmap(queue.getResult("tableTable"));

	table.addChild( tableMom.happyPic,
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
					
	table.x=100;
	table.y=50;
	table.alpha=0.0;
	table.scaleX=table.scaleY=1.0;
	
	//make an object (with integer id-s, making it look like an array) used for looking up character 
	//associated to cake piece
	characters[tableMom.pieceNumber]=tableMom;
	characters[tableGrandDad.pieceNumber]=tableGrandDad;
	characters[tableBoel.pieceNumber]=tableBoel;
	characters[tableDad.pieceNumber]=tableDad;
	characters[tableTore.pieceNumber]=tableTore;
	characters[tableDog.pieceNumber]=tableDog;

	addCharacterEventListener(tableMom);
	makeCharacterHappy(tableMom);

	addCharacterEventListener(tableGrandDad);
	makeCharacterHappy(tableGrandDad);

	addCharacterEventListener(tableBoel);
	makeCharacterHappy(tableBoel);

	addCharacterEventListener(tableDad);
	makeCharacterHappy(tableDad);

	addCharacterEventListener(tableTore);
	makeCharacterHappy(tableTore);

	addCharacterEventListener(tableDog);
	makeCharacterHappy(tableDog);

	stage.addChild(table);
	
	
	//xxx only a test
	table.addEventListener("mousedown", handleTableTouch);
}

function handleTableTouch(event) {
	console.log("xxx not used right now, but prevents from clicking through table");
}

function addCharacterEventListener(character) {
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

function makeCharacterHappy(character) {
	var c=character;
	if (c.hasOwnProperty("happyPic")) {
		c.happyPic.visible=true;
	}
	if (c.hasOwnProperty("sadPic")) {
		c.sadPic.visible=false;
	}
}

function makeCharacterSad(character) {
	var c=character;
	if (c.hasOwnProperty("happyPic")) {
		c.happyPic.visible=false;
	}
	if (c.hasOwnProperty("sadPic")) {
		c.sadPic.visible=true;
	}
}


function addCake(pieceParts,cakepieces,cakefiles) {
	//these won't change
	menuCake=new createjs.Bitmap(queue.getResult("menuCake"));
	stage.addChild(menuCake);
	menuCake.xStart=(menuCake.image.width/2|0)+20;
	menuCake.yStart=(menuCake.image.height/2|0)+20;
	menuCake.x = menuCake.xStart;
	menuCake.y = menuCake.yStart;
	menuCake.regX = menuCake.image.width/2|0;
	menuCake.regY = menuCake.image.height/2|0;
	menuCake.name = "menuCake";

	//these will change
	menuCake.alpha = 1;
	menuCake.focus=false;

	menuCake.addEventListener("mousedown", handleMenuCakeTouch);


	cake = new createjs.Container();
	
	//alltså, behöver en cake som är en multidimensionell array, som dels består av alla bitar och varje bit av 5? delar
	//första index är bit, andra index är del. 
	
	
	
	//xxx bättre göra varje bit till en container istället för hela tårtan väl...
	//nu finns det en 2-dim array cakeComplete som pieces och parts
	//sedan är varje part child till cake, istället för att varje part är child till piece som 
	//är child till part. 
	//eg skulle jag inte behöva cakeComplete
	var k=0;
	for (var i=0;i<cakepieces;i++) {
		var onePiece=new Array(); 
		for (var j=0;j<pieceParts.length+1;j++) { //+1 because cake_outsidelines doubled
			var part=new createjs.Bitmap(queue.getResult(cakefiles[k]["id"]));
			k++;
			part.number=i; //first piece has number 0, all parts get number i
			part.name="part"+j+"piece"+i;
			onePiece.push(part);
			if (enableCakePieceTouch) {
				part.addEventListener("mousedown", handleCakePieceTouch);
			}
			if (j==0 || j==2 || j==3) {
				part.visible=false;
			}
		}
		onePiece.moved=false;
		onePiece.smashed=false;
		cakeComplete.push(onePiece);

	}
	
	var cake_plate=new createjs.Bitmap(queue.getResult("cake_plate"));
	cake.addChild(cake_plate);		

	
	var pieceOrder=[3,4,2,5,1,6];
	for (var i=0;i<cakeComplete.length;i++) {
		for (var j=0;j<cakeComplete[i].length;j++) { 
			cake.addChild(cakeComplete[pieceOrder[i]-1][j]); //-1 because piece 1 has index 0 etc
		}
	}
		
		
		
		
		
	//ok, hyfsat, men skulle behöva samla kakkonstruktion istället för att ha det så utspritt. 
				
				
				
				
				
				
	stage.addChild(cake);
	cake.scaleStart=1.0;
	cake.scaleX = cake.scaleY = cake.scale = cake.scaleStart;
	
	cake.width=cakeComplete[0][0].image.width;
	cake.height=cakeComplete[0][0].image.height;
	cake.xStart=table.x+450; //550
	cake.yStart=table.y+380;  //  430;
	cake.x = cake.xStart;
	cake.y = cake.yStart;
	cake.rotation = 0;
	cake.regX = cake.width/2;
	cake.regY = cake.height/2;
	cake.name = "Tårta";


		
	cakeBall=new createjs.Bitmap(queue.getResult("cakeBall"));
	cakeBall.x=canvas.width+100; //start to the right of canvas
	cakeBall.y=100;
	cakeBall.regX=cakeBall.image.width/2|0;
	cakeBall.regY=cakeBall.image.height/2|0;
	cakeBall.rotation=0;
		
	stage.addChild(cakeBall);


	cake.alpha=0.0;

	

}

function restoreMenuCake() {
	
	if (menuCake.focus) {
		soundQueue=[];
		nextRandomCheck=-1;
		selectedNameNumber=-1
		selectedName="";
		hideNumber();
		makeCharacterHappy(tableMom);
		makeCharacterHappy(tableGrandDad);
		makeCharacterHappy(tableBoel);
		makeCharacterHappy(tableDad);
		makeCharacterHappy(tableTore);
		makeCharacterHappy(tableDog);

		
		for (var i=0;i<cakeComplete.length;i++) {
			//xxx måste ha en funktion istället som återställer tårtbit. den kan också 
			//anropas när tårtbit skapas
			piece=cakeComplete[i];
			for (j=0;j<piece.length;j++) {
				if (j==0 || j==2 || j==3) {
					piece[j].visible=false;
				} else {
					piece[j].visible=true;
				}
				piece.smashed=false;
				piece.moved=false;
			}
			moveCakePiece(i,0,0,"restore");
		}
		
		menuCake.focus=false;

	}
	
	//detta kan paketeras i en funktion XXXXXXXXXX. I guess these are the same as in handlemenucaketouch but show<->hide
	//show
	showSplashScreen()

	//hide
	createjs.Tween.get(cake).to({alpha:0.0}, 400, createjs.Ease.linear);
	createjs.Tween.get(table).to({alpha:0.0}, 400, createjs.Ease.linear);
	createjs.Tween.get(tableBackground).to({alpha:0.0},400, createjs.Ease.linear);

}



function addButton() {
	button=new createjs.Bitmap(queue.getResult("button"));
	stage.addChild(button);
	button.scaleX = button.scaleY = button.scale = 0.25;
	button.x = button.scale*button.image.width/2+20;
	button.y = canvas.height-button.scale*button.image.height/2-20;
	button.rotation = 0;
	button.regX = button.image.width/2;
	button.regY = button.image.height/2;
	button.name = "Menu button";
	
	button.addEventListener("mousedown",handleButtonTouch);
}


function buildcakefiles(pieceParts,cakepieces) {	
	var cakefiles=new Array(); //((pieceParts.length+1)*cakepieces); //+1 because cake_outsidelines doubled
	var shared=pieceParts[pieceParts.length-1];
	var k=0;
	for (var i=1;i<cakepieces+1;i++) {
		for (var j=0;j<pieceParts.length-1;j++) {
			cakefiles.push({id:pieceParts[j]+i, src:"assets/"+pieceParts[j]+i+".png"});
			k++;
		}
		//here is some tricky code to find outside lines...
		var first=i;
		var second=((i%cakepieces)+1);
		var third=(i-2+cakepieces)%cakepieces+1;
		var index=first+""+second;
		cakefiles.push({id:shared+index, src:"assets/"+shared+index+".png"});
		k++;
		index=first+""+third;
		cakefiles.push({id:shared+index, src:"assets/"+shared+index+".png"});
		k++;
	}
	return cakefiles;
}

function moveCakePiece(piecenumber,x,y,action) {
	//action can be character, piece or restore
	
	
	//komplikation 1: samma funktion används för att flytta ut som för att återställa tårtan
	//denna skulle bli mycket enklare om återställningen sköts av egen funktion, restore piece
	
	var movePerformed=false;
	if (menuCake.focus  && soundQueue.length==0) {
		var piece=cakeComplete[piecenumber];
	
		if ((x!=0 || y!=0) && !piece.moved) {
			for (var j=0;j<piece.length;j++) {
				
				createjs.Tween.get(piece[j]).to({x:x, y:y}, 200, createjs.Ease.linear);
				piece.moved=true;
				movePerformed=true;
			}
		} else if (x==0 && y==0) { //used in restoreCake
			for (var j=0;j<piece.length;j++) {
				piece[j].x=0;
				piece[j].y=0;
				piece.moved=false;
			}
		}
		var movedPieces=0;
		for (var k=0;k<cakeComplete.length;k++) {
			//om bit är på plats men nästa bit ej på plats: visa skiljelinje
			piece=cakeComplete[k];
			nextPiece=cakeComplete[(k+1)%cakeComplete.length];
			if (!piece.moved && nextPiece.moved) {
				piece[2].visible=true;	
			} else {
				piece[2].visible=false;
			}
			prevPiece=cakeComplete[(k-1+cakeComplete.length)%cakeComplete.length];
			if (!piece.moved && prevPiece.moved) {
				piece[3].visible=true;	
			} else {
				piece[3].visible=false;
			}
			
			if (piece.moved) {	
				//flyttad bit
				movedPieces++;
				if (!piece.smashed) {
					piece[2].visible=true;
					piece[3].visible=true;
				}
			}
		
		}
		
		var nameClicked=getCharacterNameSound(piecenumber);
		var nameSelected=getCharacterNameSound(selectedNameNumber);
		
		if (movePerformed && (x!=0 || y!=0)) {
			//här bestämmer vi tid för nästa smash. Vilken bit som smashas bestäms dock inte här
			//utan i handleTick
			nextSmash=randomFutureTicks(10,10.01);
			//console.log("next smash om ", (nextSmash-now)/fps," s");
			if (selectedNameNumber==piecenumber) {	
				//"rätt" person klickad		
				if (action=="character") {
					extendAndPlayQueue(["ja"]);
				}
				extendAndPlayQueue([nameClicked+"start","faar",ordinal[movedPieces]]);
				selectedNameNumber=-1;
				nextRandomCheck=randomFutureTicks(minSecSelectName,maxSecSelectName);
			} else if (selectedNameNumber==-1) {	
				//person utan tårtbit klickad		
				extendAndPlayQueue([nameClicked+"start","faar",ordinal[movedPieces]]);//somma som föregående
				nextRandomCheck=randomFutureTicks(minSecSelectName,maxSecSelectName);	
			} else {
				//"fel" person som inte än fått tårtbit klickad
				extendAndPlayQueue(["detvarvaelinte",nameSelected+"slut"]);
				if (action=="character") {
					extendAndPlayQueue(["detaerju",nameClicked+"start","somfaar",ordinal[movedPieces]]);//xxx inte helt nöjd med denna
				} else if (action=="piece") {
					extendAndPlayQueue(["detaerju",ordinal[movedPieces]]);
				}
			}
		}
		
		if (!movePerformed && (x!=0 || y!=0) && selectedNameNumber!=piecenumber && selectedNameNumber!=-1) {
			//"fel" person som redan fått tårtbit klickad
			extendAndPlayQueue(["detvarvaelinte",nameSelected+"slut"]);
			if (action=="character") {
				extendAndPlayQueue(["detaerju",nameClicked+"start"]);
			} else if (action=="piece") {
				extendAndPlayQueue(["detaerjuentaartbit"]);
			}
		}

	}
}

function extendAndPlayQueue(sounds) {
	var soundQueueLengthBefore=soundQueue.length;
	soundQueue=soundQueue.concat(sounds);
	if (soundQueueLengthBefore==0) { //queue was empty, no sound was playing
		playQueue();
	}
}

function playQueue() {
	console.log("playQueue: ", soundQueue);
	var soundinstance;
	if (soundQueue.length>0) {
		sq0=soundQueue[0];
		watchSound(sq0);
		printDebug(sq0);
		soundinstance=createjs.Sound.play(sq0);
		if (soundinstance.playState!="playFailed") {
			soundinstance.addEventListener("complete",handleNextSound);
		} else {
			console.log("play failed");
			handleNextSound(null);
		}
	}
}

function playSingle(sound) {
	var soundinstance;
	soundinstance=createjs.Sound.play(sound);
}


function handleNextSound(evt) {
	soundQueue=soundQueue.splice(1);
	playQueue();
}

function watchSound(s0) {
	for (var i=0;i<ordinal.length;i++) {
		if (s0==ordinal[i]) {
			showNumber(i);	
		}
	}
	if (s0=="varblue" || s0=="varred" || s0=="varyellow" || s0=="vargreen") {
		console.log("watchSound found varcolor sound");
		pulsate(nextBall,1000); //xxx tiden 1000 till trimvariabel

	}
}

function hideNumber() {
	for (var i=0;i<numbers.length;i++) {
		numbers[i].visible=false;
	}
}

function showNumber(number) {
	hideNumber();
	
	n=numbers[number];
	
	n.x=canvas.width/2|0;
	n.y=canvas.height/2|0;
	n.scaleX=n.scaleY=1.0;
	n.visible=true;
	
	createjs.Tween.get(n).to({x:canvas.width-200, y:0}, 400, createjs.Ease.linear);
	
	
}

function randomFutureTicks(minsec,maxsec) {
	//returns a time in ticks in the future, minsec to maxsec seconds from now
	randomSec=minsec+Math.random()*(maxsec-minsec);
	randomTimeTicks=Math.floor(now+fps*randomSec);
	return randomTimeTicks;

}

function bounceToTable(piecenumber) {
	var time = 1500.0;
	
	var startX=cakeBall.x;
	var startY=cakeBall.y;
	
	//console.log("startX",startX,"startY",startY);
	
	var smashX=cake.x+cakeComplete[piecenumber][0].x;
	var smashY=cake.y+cakeComplete[piecenumber][0].y;
	
	//antag startX=10, smashX=40. då ska endX bli 70
	
	var endX=startX+(smashX-startX)*3.9; 
	//should be 4 but this only affects movement outside canvas
	//it is slightly less than 4 to ensure that x tween finishes before y tween
	var endY=startY;
	

	pieceNumberToSmash=piecenumber;
	
	
	createjs.Tween.get(cakeBall).to({
		x: endX, rotation:4*360
	}, 3.9 * time, createjs.Ease.linear);
	
	createjs.Tween.get(cakeBall).to({
		y: smashY
	}, time, createjs.Ease.getPowIn(2)).call(smashPiece).to({
		y: startY
	}, time, createjs.Ease.getPowOut(2)).to({
		y: smashY
	}, time, createjs.Ease.getPowIn(2)).to({
		y: startY
	}, time, createjs.Ease.getPowOut(2)).call(handleBounceComplete);
}

function handleBounceComplete() {
	if (cakeBall.x>canvas.width+100) {
		cakeBall.x=canvas.width+100;
	} else if (cakeBall.x<-100) {
		cakeBall.x=-100;
	}
	cakeBall.rotation=0;
}

function smashPiece() {
			var piece=cakeComplete[pieceNumberToSmash];
			playSingle("cakebounce");
			
			var character=getCharacter(pieceNumberToSmash);
			makeCharacterSad(character);
				
			piece.smashed=true;
			piece[0].visible=true;
			piece[1].visible=false;
			piece[2].visible=false;
			piece[3].visible=false;
}

function getCharacterNameSound(pieceNumber) {
	var character=getCharacter(pieceNumber);
	if (character.hasOwnProperty("name")) {
		return character.name.toLowerCase();
	} else {
		return "";
	}
}

function getCharacter(pieceNumber) {
	var character=new Object();
	if (characters.hasOwnProperty(pieceNumber)) {
		character=characters[pieceNumber];
	}
	return character;
}

	
function pulsate(bitmap,pulsetime) {
	console.log("bitmap",bitmap);
	var partTime=Math.floor(pulsetime/4);
	createjs.Tween.get(bitmap).to({scaleX:1.1,scaleY:1.1},partTime,createjs.Ease.sineInOut).to({scaleX:1.0,scaleY:1.0},partTime,createjs.Ease.sineInOut).to({scaleX:1.1,scaleY:1.1},partTime,createjs.Ease.sineInOut).to({scaleX:1.0,scaleY:1.0},partTime,createjs.Ease.sineInOut);
}

	
function Ball(imageid,name,color) {	
	createjs.Bitmap.call(this,queue.getResult(imageid));
	stage.addChild(this);
	this.regX=this.image.width/2|0;
	this.regY=this.image.height/2|0;
	this.name=name;
	this.color=color;
	this.addEventListener("mousedown",handlePlayBallTouch);
	this.alpha=0.0;
	this.radius=this.regX;
	this.last=false;
}
