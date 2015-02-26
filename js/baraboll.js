/*minivariant som bara innehåller bollspelet*/

var debug=true;
var debugAlwaysUpdate=false;

//variables that must be the same as attributes in index.html
//they could be retrived as canvas.height etc, but must sometimes be used before they can be retrieved. 
canvasWidth=1024;
canvasHeight=768;

//prototypes for subclasses
Ball.prototype=Object.create(createjs.Bitmap.prototype);

//setup parameters
var splashScreenBackgroundColor="#86DBD5";
var ballBackgroundColor="#FFFF00";

var wakeInterval=20*1000; //time between forced stage update in milliseconds
var timeToNewBallGame=5000; //ms
var ballBounceSpeed=0.4;//pixels per millisecond
var minSecNextBall=3.0;
var maxSecNextBall=3.2;
var progressBarHeight=20;
var progressBarColor="#060";
var progressBarErrorColor="#C00";
var progressBarFadeTime=400;
var useRAF=false;
var fps=24; //fps not used if useRAF=true;
var gameTransitionTime=700;
var startBallGameRotationTime=2000;
var startBallGameNoOfTurns=2;


var menuClothesX=412-3;
var menuClothesY=484;
var menuCakeX=menuClothesX+100+6; //was (menuCake.image.width/2|0)+20; 
var menuCakeY=menuClothesY; //was (menuCake.image.height/2|0)+20;
var menuBallX=menuClothesX; //was canvas.width-menuBall.image.width/2-20;
var menuBallY=menuClothesY+100+6; //was menuBall.image.height/2+20;
var menuHelpX=menuCakeX;
var menuHelpY=menuBallY;
var menuHelpRunningX=10;
var menuHelpRunningY=25;

var backButtonX=10; //menuCakeX;
var backButtonY=670;
var ballMinBorderDistance=150; //min distance from center of ball to border when placed randomly
var ballMinDistance=100; //min distance between balls. if min distance close to 200, the balls won't fit and the script will freeze
var wrongBallNumberOfTurns=4;
var wrongBallTurnTime=2000; //must be at least as long as the sound "det var ju blåa bollen", otherwise there might be an error if wrong ball is touched
var ballPulsateTime=1000;


//xxx possibly put setup parameters in a setup object:
//var setup={timeToNewBallGame:1500,ballBounceSpeed:0.4};

//xxx the clothes parameters are not really setup parameters, but determined by size on position of clothes images. 
//should be defined somewhere else....


var ballTween=new Object();



//help texts
var generalHelpText="Det finns tre olika spel, tårtspelet, bollspelet och klädspelet. Tårtspelet och bollspelet fungerar bäst om ljudet är på. Peka på knapparna för att välja ett av spelen. ";
var ballHelpText="Du ska försöka få bort alla bollarna från skärmen. Lyssna på rösten och peka på bollen med rätt färg. \n\nPeka på pilen för att komma till startsidan där du kan välja ett annat spel. ";

//help sounds
var generalHelpSound;
var ballHelpSound;

//global variable definitions


var soundFiles;

var nextBallId;

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
var menuBall
var backButton; 
var progressBar;
var blueBall,redBall,yellowBall,greenBall;
var allBalls;
var star;
var debugText;
var loadedFiles;
var filesToLoad;
var nowMillis;
var nextBall;
var nextBallTime;
var soundQueue=[];
var lastWakeTime=0;

var preload;


function init(mode) {
	
	
	
	var filetype1;
	var filetype2;
	
	switch(mode) {
		case "mp3":
			filetype1="mp3";
			filetype2="none";
			preload=false;
			break;
		case "ogg":
			filetype1="ogg";
			filetype2="none";
			preload=false;
			break;
		case "mp3+ogg":
			filetype1="mp3";
			filetype2="ogg";
			preload=false;
			break;
		case "ogg+mp3":
			filetype1="ogg";
			filetype2="mp3";
			preload=false;
			break;
		case "mp3 preload":
			filetype1="mp3";
			filetype2="none";
			preload=true;
			break;
		case "ogg preload":
			filetype1="ogg";
			filetype2="none";
			preload=true;
			break;
		case "mp3+ogg preload":
			filetype1="mp3";
			filetype2="ogg";
			preload=true;
			break;
		case "ogg+mp3 preload":
			filetype1="ogg";
			filetype2="mp3";
			preload=true;
			break;
		case "no sound":
			filetype1="none";
			filetype2="none";
			preload=true;
			break;
	
		default:
			alert("unknown");
	}
	
	document.getElementById("startbutton").hidden=true;
	
	console.log("Baraboll game starting at "+Date());
	console.log("TweenJS version "+createjs.TweenJS.version);

	// create stage and point it to the canvas:
	canvas = document.getElementById("myCanvas");
	
	//canvas.style.height="527px"; //xxxxxxx tabort

	changeBackground(splashScreenBackgroundColor);
	
	//some initial values of "constans"
	//pixels, must be larger than canvas diagonal to make sure ball bounces outside of canvas
	minBounceDistance=Math.floor(Math.sqrt(canvasWidth*canvasWidth+canvasHeight*canvasHeight)*1.5); 

	//initial values. some of these must be reset to initial values when game is restarted
	loadedFiles=0;
	nowMillis=0;
	nextBallTime=-1;
	
	//check to see if we are running in a browser with touch support
	stage = new createjs.Stage(canvas);


	stage.name="The Stage";
	// enable touch interactions if supported on the current device:
	createjs.Touch.enable(stage);

	addProgressBar();
	addDebugText();

	//loading assets

	soundFiles=[
		{id:"tyst1000",src:"assets/tyst1000."+filetype1},
		{id:"detjublue",src:"assets/detjublue."+filetype1},
		{id:"detjuyellow",src:"assets/detjuyellow."+filetype1},
		{id:"detjugreen",src:"assets/detjugreen."+filetype1},
		{id:"detjured",src:"assets/detjured."+filetype1},
		{id:"jagreen",src:"assets/jagreen."+filetype1},
		{id:"jablue",src:"assets/jablue."+filetype1},
		{id:"jared",src:"assets/jared."+filetype1},
		{id:"jayellow",src:"assets/jayellow."+filetype1},
		{id:"vargreen",src:"assets/vargreen."+filetype1},
		{id:"varblue",src:"assets/varblue."+filetype1},
		{id:"varyellow",src:"assets/varyellow."+filetype1},
		{id:"varred",src:"assets/varred."+filetype1},
		{id:"tada",src:"assets/tada."+filetype1}];
				
		
	//simple as opposed to the more complex files making a cake and a table
	var simpleImageFiles=[
		{id:"boelToreSplash", src:"assets/boeltoresplash.png"},
		{id:"menuBall", src:"assets/menuball.png"},
		{id:"menuHelp", src:"assets/menuhelp.png"},
		{id:"backButton", src:"assets/backbutton.png"},
		{id:"star", src:"assets/star.png"},
		{id:"blueBall", src:"assets/blueball.png"},
		{id:"redBall", src:"assets/redball.png"},
		{id:"yellowBall", src:"assets/yellowball.png"},
		{id:"greenBall", src:"assets/greenball.png"}
		];
		
	var files;
	
	if (preload) {
		files=simpleImageFiles.concat(soundFiles);	
	} else {
		files=simpleImageFiles.concat([]);
	}
	

	queue=new createjs.LoadQueue(false);
	if (filetype2!="none") {
		createjs.Sound.alternateExtensions = [filetype2];
	}
	if (preload) {
		queue.installPlugin(createjs.Sound);
	}
	queue.addEventListener("complete",handleComplete);
	queue.addEventListener("error", handleFileError);
	queue.addEventListener("fileload", handleFileLoad);

	queue.loadManifest(files);
	filesToLoad=files.length;
	
} //init


function loadSounds(soundFiles) {
	//test instead of preload
	console.log("-----------> manual sound load <------------");
	for (var i=0;i<soundFiles.length;i++) {
		var f=soundFiles[i];
		console.log(f.src);
		createjs.Sound.registerSound(f.src, f.id);
	}
}

function changeBackground(color) {	
	canvas.style.backgroundColor = color;
}




function createBackground(color,alpha) {
	b = new createjs.Shape();
	b.graphics.beginFill(color).drawRect(0, 0, canvasWidth, canvasHeight);
	b.x = 0;
	b.y = 0;
	b.alpha=alpha;
	return b;
}


//xxx only used for debugging, should be deleted
function handleBackgroundTouch(event) {
	if (debug) {
		console.log("background touch",event.stageX,event.stageY);
		background.touchX=event.stageX;
		background.touchY=event.stageY;
		stage.update();
	}
	hideHelp();
	
}


function printDebug(text) {
	//console.log("printDebug ",text);
	if (debug) {
		debugText.text+=text;
		debugText.text=debugText.text.substring(debugText.text.length-68,debugText.text.length);
		//stage.update();	
	}
}

function handleFileError(event) {
	//var div = document.getElementById("loader");
	//div.innerHTML = "File load error";
	//div.style.backgroundColor = "#FF0000";
}
	
function handleFileLoad(event) {
	console.log(event.item.src);
	printDebug(event.item.src+',');
	loadedFiles++;
	var progress=loadedFiles/filesToLoad;
	updateProgressBar(progress);
	//xxx the loader div is only for debugging and should be deleted
	//var div = document.getElementById("loader");
	//div.innerHTML = xxxxx;
}

function updateProgressBar(progress) {
	progressBar.scaleX=progress;
	stage.update();	
}

function addProgressBar() {
	progressBar=new createjs.Shape();
	progressBar.graphics.beginFill(progressBarColor).drawRect(0, 0, canvasWidth, progressBarHeight);
	progressBar.x = 0;
	progressBar.y = 0;
	progressBar.scaleX=0.05;
	progressBar.height=progressBarHeight;
	stage.addChild(progressBar);
}

function handleComplete(event) {
	
	if (!preload) {
		loadSounds(soundFiles);
	}
	
	//event triggered even if file not loaded
	if (loadedFiles<filesToLoad) {
		progressBar.graphics.beginFill(progressBarErrorColor).drawRect(0, 0, canvasWidth, progressBar.height);
		//xxx the loader div is only for debugging and should be deleted
		//var div = document.getElementById("loader");
		//div.innerHTML = "Some resources were not loaded: "+(filesToLoad-loadedFiles);
	} else {
		createjs.Tween.get(progressBar).to({alpha:0.0},progressBarFadeTime);
	}

	addBoelToreSplash();
	stage.removeChild(progressBar); //to make it visible on top of BoelToreSplash
	stage.addChild(progressBar);
	stage.removeChild(debugText);
	stage.addChild(debugText);
	addHelp();
	addBall();
	addBackButton();
	addStar();
	addBackground();
	
	//setup almost complete, start the ticker
	
	
	createjs.Ticker.addEventListener("tick", handleTick);
	
	
	if (useRAF) {
		createjs.Ticker.timingMode = createjs.Ticker.RAF;
	} else {
		createjs.Ticker.setFPS(fps);
	}
	stage.update();		
}

function addBackground() {
	//the background is an almost invisible object, there to be able to click the background
	//currently only used for testing and debugging
	//UPDATE: not so invisible anymore, there for preventing clicks behind it when help is shown. 
	background=createBackground("#FFFFFF",0.5); //should be less

	//stage.addChild(background); xxx done when help is shown
	background.addEventListener("mousedown", handleBackgroundTouch);
}

function handleTick(event) {
	nowMillis=createjs.Ticker.getTime(false);

	if (nowMillis-lastWakeTime>wakeInterval) {
		//this update is good for two reasons:
		//1: it prevents certain browsers to sleep
		//2: it assures that the stage is updatedet even if a tween is too fast and not caught by handleTick
		update=true;
		lastWakeTime=nowMillis;
	}


	//things to do only when a tween is running or something is dragged
	if (update || debugAlwaysUpdate) {
		if (menuBall.focus)  {
			checkBallOutsideAndBallBounce();
		}
		stage.update(event); //pass event to make sure for example sprite animation works
	}
	update=createjs.Tween.hasActiveTweens();//xxxtickxxx
}

function handleNextBall() {
	//xxxsettimeout denna delen ska bort om man inte kör med settimeout
	if (isRunning() || helpContainer.visible) {
		console.log("not ready for next ball yet");
		nextBallId=setTimeout(handleNextBall,2000);
	} else if (menuBall.focus) {
		nextBall=findRandomBall();
		extendAndPlayQueue("var"+nextBall.color); //this sound is "watched" and will trigger pulsating ball
		nextBallTime=-1; //no new nextBall until this nextBall is touched 
	}
}

function checkBallOutsideAndBallBounce() {
	if (ballTween.hasOwnProperty("target")) {				
		var ball=ballTween.target;
		//check if ball is outside of canvas
		//if it is, delete it (set .inside to false) so you can't bounce against it
		var inside=(ball.x-ball.radius)<canvasWidth && (ball.y-ball.radius)<canvasHeight && (ball.x+ball.radius)>0 && (ball.y+ball.radius)>0;
		if (!inside) {
			ball.inside=false;
			ball.alpha=0;
			ballTween.setPaused(true);
			if (ball.last) {
				//restart game if it is the last ball
				extendAndPlayQueue("tada");				
				startBallGame(timeToNewBallGame);
			}	
		}		
		//check if ball has bounced into another ball 
		if (detectBallCollision(ball,0)) {
			if (ball.obstacleBall!=ball.lastObstacleBall) {
				//ball has bounced into another ball. stop running tween and start new tween in new direction
				if (isRunning(ballTween)) {
					ballTween.setPaused(true); //funkar nog bäst
				}
				//calculate bounce direction
				var centerToCenterAngle=Math.atan2(ball.y-ball.obstacleBall.y,ball.x-ball.obstacleBall.x);
				ball.bounceAngle=2*centerToCenterAngle-Math.PI-ball.startAngle;
				var deltaX=minBounceDistance*Math.cos(ball.bounceAngle); 
				var deltaY=minBounceDistance*Math.sin(ball.bounceAngle);
				var finalX=ball.x+deltaX;
				var finalY=ball.y+deltaY;
				ballTween=makeBallTween(ball,finalX,finalY,ballBounceSpeed);
			}
		}
	}
}


function makeBallTween(ball,x,y,speed) {
	//speed in pixels per millisecond
	var distance=Math.sqrt((x-ball.x)*(x-ball.x)+(y-ball.y)*(y-ball.y));
	var time=Math.floor(distance/speed);
	ball.startAngle=Math.atan2(y-ball.y,x-ball.x);
	var rotationAngle=randomDirection()*Math.floor(360*distance/600.0); //600 deliberately not a setup variable, although it could have been
	return createjs.Tween.get(ball).to({x:x,y:y,rotation:ball.rotation+rotationAngle},time, createjs.Ease.linear);
}

function randomDirection() {
	return (Math.random()<0.5)	? -1.0 : 1.0;
}

function randomSpeedAndDirection() {
	//returns random value betwwen -1 and 1
	return 2*Math.random()-1.0;
}

//xxx code is kinda clean until this point, but much of the cake code hereafter needs clean up. 

function isRunning(tween) {
		//if no argument is given it should check all running tweens, but if argument is given only that tween should be checked
		//however, due to a bug in 0.5.1, all tweens are checked, with or without tween argument. 

		//possibly somtehing like createjs.Tween.hasActiveTweens(tween.target???) might work, but 
		//in NEXT version
		//NOTE: if this is fixed in a future version make sure this function works both with and without argument.  
		return createjs.Tween.hasActiveTweens();
}

function changeSplashScreen(alpha) {
	createjs.Tween.get(menuBall).to({alpha:alpha},gameTransitionTime,createjs.Ease.linear);  
	createjs.Tween.get(backButton).to({alpha:(1-alpha)},gameTransitionTime,createjs.Ease.linear);  
	createjs.Tween.get(boelToreSplash).to({alpha:alpha},gameTransitionTime/2, createjs.Ease.linear);
	//splashScreenBackground.alpha=alpha;//xxxyyy createjs.Tween.get(splashScreenBackground).to({alpha:alpha},gameTransitionTime, createjs.Ease.linear);
	
	
	
	if (alpha>0.9) {
		changeBackground(splashScreenBackgroundColor);
		createjs.Tween.get(menuHelp).to({x:menuHelpX,y:menuHelpY},gameTransitionTime/2, createjs.Ease.linear); 
	} else {
		createjs.Tween.get(menuHelp).to({x:menuHelpRunningX,y:menuHelpRunningY},gameTransitionTime/2, createjs.Ease.linear); 
	}
	
}

function showSplashScreen() {
	changeSplashScreen(1.0);
}

function hideSplashScreen() {
	changeSplashScreen(0.0);
}

function handleMenuHelpTouch(evt) {
	if (noGameRunning()) {
		showHelp(generalHelpText,generalHelpSound);	
	} else if (menuBall.focus) {
		showHelp(ballHelpText,ballHelpSound);
	}
}

function showHelp(text,sound) {
	console.log("showHelp");
	//xxx ska man pausa tweens? pausa ljud? blir lite knepigt...
	helpTextBox.text=text;
	helpContainer.visible=true;
	stage.addChild(background);
	stage.addChild(helpContainer);
	stage.update();
}

function hideHelp() {
	helpTextBox.text="";
	stage.removeChild(helpContainer);
	stage.removeChild(background);
	helpContainer.visible=false;
	stage.update();
}

function handleBackButtonTouch(event) {
	//update=true; //xxxtick nu funkar det att gå tillbaka men utan tween, istället pang på!
	if (menuBall.focus) {
		restoreMenuBall();
	} else if (menuCake.focus) {
		restoreMenuCake();
	} else if (menuClothes.focus) {
		restoreMenuClothes();
	}
}

function addStar() {
	star=new createjs.Bitmap(queue.getResult("star"));
	stage.addChild(star);
	star.regX=star.image.width/2|0;
	star.regY=star.image.height/2|0;
	star.x=canvasWidth/2|0;
	star.y=canvasHeight/2|0;
	hideStar();
}

function addDebugText() {
	debugText = new createjs.Text("", "24px Courier", "#000");

	debugText.x=20;
	debugText.y=canvasHeight-30;
	if (debug) {
		debugText.text="Debug on";
	} else {
		debugText.text=" ";
	}
	stage.addChild(debugText);
}

function addBoelToreSplash() {
	boelToreSplash=new createjs.Bitmap(queue.getResult("boelToreSplash"));
	stage.addChild(boelToreSplash);
}

function handleMenuBallTouch(event) {
	if (noGameRunning()) {
		menuBall.focus=true;
		extendAndPlayQueue(["tyst1000"]);//very weird. this sound is needed for first sound to play on iphone.
		hideSplashScreen();
		showBallGame();
		startBallGame(0);
	}
}

function noGameRunning() {
	return (!menuBall.focus);
}



function showBallGame() {
	 //ballBackground.alpha=1.0;//xxx yyy createjs.Tween.get(ballBackground).to({alpha:1.0},gameTransitionTime, createjs.Ease.linear);
	 changeBackground(ballBackgroundColor);	
}

function startBallGame(delay) {
	hideStar();	
	nextBallTime=delay+randomFutureMillis2(minSecNextBall,maxSecNextBall);
	//xxxsettimeout note: change randomFutureMillis2 to randomFutureMillis if settimeout is not used anymore
	nextBallId=setTimeout(handleNextBall,nextBallTime);
	
	nextBall=null; //decided att next ball time
	allBalls.forEach(setRandomPosition);
	for (var i=0;i<allBalls.length;i++) {
		allBalls[i].scaleX=0.1;allBalls[i].scaleY=0.1;
		createjs.Tween.get(allBalls[i]).wait(delay).to({scaleX:1.0,scaleY:1.0,alpha:1.0,rotation:allBalls[i].rotation+randomSpeedAndDirection()*startBallGameNoOfTurns*360}, startBallGameRotationTime, createjs.Ease.linear);
	}
}

function restoreMenuBall() {
	menuBall.focus=false;
 	nextBallTime=-1;
	clearTimeout(nextBallId);
	for (i=0;i<allBalls.length;i++) {	
		createjs.Tween.removeTweens(allBalls[i]);
	}
	showSplashScreen();
	hideBalls();
}

function addHelp() {
	menuHelp=new createjs.Bitmap(queue.getResult("menuHelp"));
	stage.addChild(menuHelp);
	menuHelp.x=menuHelpX;
	menuHelp.y=menuHelpY;
	menuHelp.alpha=1.0;
	menuHelp.addEventListener("mousedown", handleMenuHelpTouch);


	helpContainer = new createjs.Container();
	helpContainer.x=100;
	helpContainer.y=100;
	helpContainer.visible=false;
	
	helpFrame = new createjs.Shape();
	
	helpFrame.graphics.
	beginFill("white").
	beginStroke("orange").setStrokeStyle(20, 'round', 'round').
	drawRect(0,0,canvasWidth-100*2,canvasHeight-100*2);


	
	helpTextBox = new createjs.Text("", "36px sans-serif", "#000");
	helpTextBox.lineHeight=42;
	helpTextBox.lineWidth=canvasWidth-4*100;
	helpTextBox.x=100;
	helpTextBox.y=100;
	helpContainer.addChild(helpFrame);
	helpContainer.addChild(helpTextBox);

	
	menuHelp.focus=false; //xxx ska detta in som gamerunning? inte riktigt kanke. den ska nog bort
}


function addBall() {
	menuBall=new createjs.Bitmap(queue.getResult("menuBall"));
	stage.addChild(menuBall);
	
	//these parameters won't change
	menuBall.x = menuBallX;
	menuBall.y = menuBallY;
	menuBall.name = "menuBall";
	
	//these will change
	menuBall.alpha = 1.0;
	menuBall.focus=false;
	
	menuBall.addEventListener("mousedown", handleMenuBallTouch);
	
	//here are balls of different colors used in the ball game. 
	blueBall=new Ball("blueBall","Blå boll","blue");
	redBall=new Ball("redBall","Röd boll","red");
	yellowBall=new Ball("yellowBall","Gul boll","yellow");
	greenBall=new Ball("greenBall","Grön boll","green");
	allBalls=[blueBall,redBall,yellowBall,greenBall];
}

function hideBalls() {
	for (i=0;i<allBalls.length;i++) {	
		createjs.Tween.get(allBalls[i]).to({alpha:0.0}, gameTransitionTime, createjs.Ease.linear);
	}
	//createjs.Tween.get(ballBackground).to({alpha:0.0},gameTransitionTime, createjs.Ease.linear);
}


function setRandomPosition(ball) {
	var free=false;
	forceField=ballMinDistance/2;
	while (!free) { //a for me rare occasion where I would consider repeat instead...
		ball.x=Math.floor(Math.random()*(canvasWidth-ballMinBorderDistance*2)+ballMinBorderDistance);
		ball.y=Math.floor(Math.random()*(canvasHeight-ballMinBorderDistance*2)+ballMinBorderDistance);
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
	//find random ball *other than thisBall
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
		  extendAndPlayQueue("ja"+ball.color);
		  var otherBall=findRandomBall(ball);
		  if (otherBall!==null) {
    		  var directionX=otherBall.x+0.35*otherBall.image.width*randomDirection();
			  var directionY=otherBall.y+0.35*otherBall.image.width*randomDirection();
			  ballTween=makeBallTween(ball,directionX,directionY,ballBounceSpeed);
			  nextBall=null;
			  nextBallTime=randomFutureMillis2(minSecNextBall,maxSecNextBall);
	//xxxsettimeout note: change randomFutureMillis2 to randomFutureMillis if settimeout is not used anymore

			  console.log("Next ball time: ",nextBallTime);
			  nextBallId=setTimeout(handleNextBall,nextBallTime);
		  } else {
			  //random direction for last ball
			  var angle=Math.random()*2*Math.PI;
			  var x=minBounceDistance*Math.cos(angle);
			  var y=minBounceDistance*Math.sin(angle);
			  ball.last=true;
			  ballTween=makeBallTween(ball,x,y,ballBounceSpeed);
		  }
	  } else if (nextBall!==null) {
		console.log("next ball",nextBall);
		console.log("wrong ball touched");
		//wrong ball is touched
		var startRotation=ball.rotation;
		createjs.Tween.get(ball).to({rotation:startRotation+360*wrongBallNumberOfTurns}, wrongBallTurnTime,createjs.Ease.sineInOut);
		//createjs.Tween.get(ball).to({rotation:startRotation+360*4}, 2000,createjs.Ease.sineInOut);

		extendAndPlayQueue(["detju"+ball.color,"var"+nextBall.color]);  
	  } else {
		  //nothing should be done here
	  }
	}
}

function addBackButton() {
	backButton=new createjs.Bitmap(queue.getResult("backButton"));
	stage.addChild(backButton);
	backButton.x = backButtonX;
	backButton.y = backButtonY;
	backButton.alpha=0;
	//button.regX = button.image.width/2; //should be deleted xxx
	//button.regY = button.image.height/2;
	backButton.name = "Back button";
	backButton.addEventListener("mousedown",handleBackButtonTouch);
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
	if (s0=="varblue" || s0=="varred" || s0=="varyellow" || s0=="vargreen") {
		pulsate(nextBall,ballPulsateTime);

	}
	if (s0=="tada") {
		showStar();
	}
}

function showStar() {
	createjs.Tween.get(star).
				to({alpha:0.7,scaleX:2.3,scaleY:2.3},2000,createjs.Ease.getElasticOut(1,0.3)).
				wait(1000).
				to({alpha:0},1000).
				to({scaleX:0.1,scaleY:0.1},10); //xxx temporry fix!!!!! only with tore start
}

function hideStar() {
	createjs.Tween.removeTweens(star);
	star.alpha=0;
	star.scaleX=0.1;
	star.scaleY=0.1;
}
function randomFutureMillis(minSec,maxSec) {
	//note: input in milliseconds and seconds, output in milliseconds
	randomSec=minSec+Math.random()*(maxSec-minSec);
	return nowMillis+1000*randomSec;
}

function randomFutureMillis2(minSec,maxSec) {
	//xxxsettimeout this one does not add nowMillis
	//note: input in milliseconds and seconds, output in milliseconds
	randomSec=minSec+Math.random()*(maxSec-minSec);
	return 1000*randomSec;
}


function pulsate(bitmap,pulsetime) {
	//console.log("bitmap",bitmap,"pulsetime",pulsetime);
	var partTime=Math.floor(pulsetime/4);
	createjs.Tween.get(bitmap).to({scaleX:1.1,scaleY:1.1},partTime,createjs.Ease.sineInOut).to({scaleX:1.0,scaleY:1.0},partTime,createjs.Ease.sineInOut).to({scaleX:1.1,scaleY:1.1},partTime,createjs.Ease.sineInOut).to({scaleX:1.0,scaleY:1.0},partTime,createjs.Ease.sineInOut);
}

function Ball(imageid,name,color) {	
	//constructor for ball
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

function log(text) {
	console.log(text);
	console.log("active tweens: "+createjs.Tween.hasActiveTweens());
}