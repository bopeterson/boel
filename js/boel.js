/* Boel och Tore - da game */

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
	
var debug=true;

//variable definitions
var canvas;
var stage;
var background;
var queue;
var offset;
var update = false;
//var nextupdate = false; not used
var ball,boel,cake;

var blueBall,redBall,yellowBall,greenBall;
var allBalls;

var pieceParts,cakepieces;

var cakefiles;

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

var loadedFiles=0;
var filesToLoad;

var fps=24; //var 30

var rCanvasStart=134;
var gCanvasStart=219;
var bCanvasStart=213;

var ballBackground;
var splashScreenBackground;

var now=0;
var nextSmash=-1;
var nextRandomCheck=-1;
var pieceNumberToSmash=-1;

var minSecSelectName=10; //min random time before voice: "x vill ha tårta, var är x"
var maxSecSelectName=15; //max random time...

//var numberOfRunningTweens=0;  not used anymore

//xx these two are initiated also in restoreCake, must only be done in one place
var selectedNameNumber=-1;
var selectedName=""; 

var soundQueue=[];

function rgb(r,g,b) {
	//returns a string "rgb(r,g,b)"
	r=Math.floor(r);r=Math.max(0,r);r=Math.min(255,r);
	g=Math.floor(g);g=Math.max(0,g);g=Math.min(255,g);
	b=Math.floor(b);b=Math.max(0,b);b=Math.min(255,b);
	return "rgb("+r+","+g+","+b+")";
}

/*
function changeCanvasColor(rTo,gTo,bTo,ticks) {
	//this function relies on global variables rCanvas, gCanvas, bCanvas, rDelta, gDelta, bDelta, startChangeCanvasColor,finishedChangeCanvasColor
	//do the following to start a transition to new background color: 
	//startChangeCanvasColor=true;
	//finishedChangeCanvasColor=false;
	//rCanvasNew=integer from 0 to 255;
	//gCanvasNew=integer from 0 to 255;
	//bCanvasNew=integer from 0 to 255;
	
	if (startChangeCanvasColor) {
		rDelta=(rTo-rCanvas)/ticks;
		gDelta=(gTo-gCanvas)/ticks;
		bDelta=(bTo-bCanvas)/ticks;
		startChangeCanvasColor=false;
	}
	var finished=true;
	if (Math.abs(rCanvas-rTo)>(0.99*Math.abs(rDelta))) {
		rCanvas+=rDelta;
		finished=false;
	}
	if (Math.abs(gCanvas-gTo)>(0.99*Math.abs(gDelta))) {
		gCanvas+=gDelta;
		finished=false;
	}
	if (Math.abs(bCanvas-bTo)>(0.99*Math.abs(bDelta))) {
		bCanvas+=bDelta;
		finished=false;					
	}
	canvas.style.backgroundColor=rgb(rCanvas,gCanvas,bCanvas);
	finishedChangeCanvasColor=finished;
}
*/

function init() {
	console.log("Boel game starting at "+Date());
	console.log("TweenJS version "+createjs.TweenJS.version);
	if (window.top != window) {
		document.getElementById("header").style.display = "none";
	}
	document.getElementById("loader").className = "loader";
	// create stage and point it to the canvas:
	canvas = document.getElementById("myCanvas");		
	canvas.style.backgroundColor=rgb(0,0,0); //xxx behövs detta	

	//check to see if we are running in a browser with touch support
	stage = new createjs.Stage(canvas);

	stage.name="The Stage";
	// enable touch interactions if supported on the current device:
	createjs.Touch.enable(stage);


	//the background is an almost invisible object, there to be able to click the background
	background = new createjs.Shape();
	background.graphics.beginFill("#FFFFFF").drawRect(0, 0, canvas.width, canvas.height);
	background.x = 0;//canvas.width/2|0;
	background.y = 0;//canvas.height/2|0;
	background.alpha=0.05;
	background.name = "background";
	stage.addChild(background);


	//XXXXXXXXXXX
	//some color changing backgrounds
	ballBackground = new createjs.Shape();
	ballBackground.graphics.beginFill("#FFFF00").drawRect(0, 0, canvas.width, canvas.height);
	ballBackground.x = 0;//canvas.width/2|0;
	ballBackground.y = 0;//canvas.height/2|0;
	ballBackground.alpha=0.0;
	ballBackground.name = "ballBackground";
	stage.addChild(ballBackground);

	splashScreenBackground = new createjs.Shape();
	splashScreenBackground.graphics.beginFill("#86DBD5").drawRect(0, 0, canvas.width, canvas.height);
	splashScreenBackground.x = 0;//canvas.width/2|0;
	splashScreenBackground.y = 0;//canvas.height/2|0;
	splashScreenBackground.alpha=1.0;
	splashScreenBackground.name = "splashScreenBackground";
	stage.addChild(splashScreenBackground);
	
	tableBackground = new createjs.Shape();
	tableBackground.graphics.beginFill("#FF95CB").drawRect(0, 0, canvas.width, canvas.height);
	tableBackground.x = 0;//canvas.width/2|0;
	tableBackground.y = 0;//canvas.height/2|0;
	tableBackground.alpha=0.0;
	tableBackground.name = "tableBackground";
	stage.addChild(tableBackground);



/*
=134; 86DBD5
var gCanvasStart=219;
var bCanvasStart=213
*/



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
		{id:"cakebounce",src:"assets/cakebounce.mp3"}];
			
	
	
	var simpleimagefiles=[
		{id:"boelSplashScreen", src:"assets/boelsplashscreen.png"},
		{id:"ball", src:"assets/ball.png"},
		{id:"dog", src:"assets/dog.png"},
		{id:"button", src:"assets/button.png"},
		{id:"cake_plate", src:"assets/cake_plate.png"},
		{id:"blueball", src:"assets/blueball.png"},
		{id:"redball", src:"assets/redball.png"},
		{id:"yellowball", src:"assets/yellowball.png"},
		{id:"greenball", src:"assets/greenball.png"}		
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
				{"id":"tableMom","src":"assets/tablemom.png"},
				{"id":"tableMomSad","src":"assets/tablemomsad.png"},
				{"id":"tableGrandDad","src":"assets/tablegranddad.png"},
				{"id":"tableGrandDadSad","src":"assets/tablegranddadsad.png"},
				{"id":"tableBoel","src":"assets/tableboel.png"},
				{"id":"tableBoelSad","src":"assets/tableboelsad.png"},
				{"id":"tableDad","src":"assets/tabledad.png"},
				{"id":"tableDadSad","src":"assets/tabledadsad.png"},
				{"id":"tableTore","src":"assets/tabletore.png"},
				{"id":"tableToreSad","src":"assets/tabletoresad.png"},
				{"id":"tableTable","src":"assets/tabletable.png"},
				{"id":"tableMomHand","src":"assets/tablemomhand.png"},
				{"id":"tableDadHand","src":"assets/tabledadhand.png"},
				{"id":"tableToreHand","src":"assets/tabletorehand.png"},
				{"id":"tableDog","src":"assets/tabledog.png"},
				{"id":"tableDogSad","src":"assets/tabledogsad.png"},
				{"id":"tableBoelHand","src":"assets/tableboelhand.png"},
				{"id":"tableGrandDadHand","src":"assets/tablegranddadhand.png"}
				];
	
	var files=simpleimagefiles.concat(cakefiles,numberfiles,tablefiles,soundfiles);
	
	queue.loadManifest(files);
	filesToLoad=files.length;
}


function handleBackgroundTouch(event) {
	console.log("background touch",event.stageX,event.stageY);
	printDebug(createjs.Tween.hasActiveTweens()+" ");
	background.touchX=event.stageX;
	background.touchY=event.stageY;
	
	stage.update();
}

function printDebug(text) {
	if (debug) {
		debugText.text+=text;
		debugText.text=debugText.text.substring(debugText.text.length-68,debugText.text.length);		
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
		nextSmash=randomFutureTicks(30,30.01);
		//console.log("next smash om ", (nextSmash-now)/fps," s");

	}
		
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
				extendAndPlayQueue([selectedName+"vill_"]);//namn vill ha tårta, var är namn?
			}
		} 
		nextRandomCheck=-1;
	}
	
	
	
	
/*	
	if (startChangeCanvasColor || !finishedChangeCanvasColor) {
		changeCanvasColorXXX(rCanvasNew,gCanvasNew,bCanvasNew,10);
		//printDebug("("+rCanvas.toFixed(2) +","+gCanvas.toFixed(2)+","+bCanvas.toFixed(2)+")");
	}
	*/
	

	
	if (update) {		
	    if (ballTween.hasOwnProperty("target")) {
			var ball=ballTween.target;
			if (detectBallCollision(ball,0)) {
				console.log(ball.name+" collided into "+ball.obstacleBall.name);

				if (isRunning(ballTween)) {  
					ballTween.setPaused(true); //funkar nog bäst
					
					//xxxxxxxxxxxxxxxx current
					var centerToCenterAngle=Math.atan2(ball.y-ball.obstacleBall.y,ball.x-ball.obstacleBall.x);
	        		console.log("-centerToCenterAngle:",-centerToCenterAngle*180/Math.PI)
	
	
	
					ball.bounceAngle=2*centerToCenterAngle-Math.PI-ball.startAngle;
					console.log("-bounceAngle:",-ball.bounceAngle*180/Math.PI)

					var deltaX=2000*Math.cos(ball.bounceAngle);
					var deltaY=2000*Math.sin(ball.bounceAngle);
					var finalX=ball.x+deltaX;
					var finalY=ball.y+deltaY;



					//createjs.Tween.get(ball).to({x:finalX,y:finalY}, 500, createjs.Ease.linear);
					ballTween=makeBallTween(ball,finalX,finalY,0.5);

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
	ball.startAngle=Math.atan2(y-ball.y,x-ball.x);
	return createjs.Tween.get(ball).to({x:x,y:y},time, createjs.Ease.linear);
}

function isRunning(tween) {
	return !tween._paused; //getting a "private" property
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

function handleBallTouch(event) {
	if (!cake.focus  && !ball.focus) { //xxx quickfix
	  restoreCake();
	  cake.alpha=0.1;
	  tweenStart();
	  createjs.Tween.get(ball).to({x:canvas.width/2+200, y: canvas.height/2, scaleX:1.0, scaleY:1.0}, 350, createjs.Ease.linear).to({alpha:0.0},50,createjs.Ease.linear).call(tweenStop);
	  tweenStart();
	  createjs.Tween.get(boelSplashScreen).to({alpha:0.0}, 200, createjs.Ease.linear).call(tweenStop);

	  tweenStart();
	  createjs.Tween.get(blueBall).to({alpha:1.0}, 400, createjs.Ease.linear).call(tweenStop);
	  tweenStart();
	  createjs.Tween.get(redBall).to({alpha:1.0}, 400, createjs.Ease.linear).call(tweenStop);
	  tweenStart();
	  createjs.Tween.get(yellowBall).to({alpha:1.0}, 400, createjs.Ease.linear).call(tweenStop);
	  tweenStart();
	  createjs.Tween.get(greenBall).to({alpha:1.0}, 400, createjs.Ease.linear).call(tweenStop);


      createjs.Tween.get(ballBackground).to({alpha:1.0},400, createjs.Ease.linear);
	  createjs.Tween.get(splashScreenBackground).to({alpha:0.0},400, createjs.Ease.linear);


	  /*
	  startChangeCanvasColor=true;
	  finishedChangeCanvasColor=false;
	  rCanvasNew=255;
	  gCanvasNew=255;
	  bCanvasNew=0;
  		*/
  
	  ball.focus=true;
	  //update=true;
	}
}

function handleCakeTouch(event) {
	
	
	//alert('caketouch');
	if (!ball.focus && !cake.focus) { //xxx quickfix
	  extendAndPlayQueue(["tyst1000"]);//xxx very weird. this sound is needed for first sound to play on iphone.
	  nextRandomCheck=randomFutureTicks(minSecSelectName,maxSecSelectName);
	  restoreBall();
	  //ball.alpha=0.1;
	  ball.x=canvas.width+200; //move outside
	  tweenStart();
	  createjs.Tween.get(cake).to({x:canvas.width/2+20, y: canvas.height/2+50, scaleX:0.50, scaleY:0.50}, 400, createjs.Ease.linear).call(tweenStop);
	  tweenStart();
	  createjs.Tween.get(table).to({alpha:1.0}, 400, createjs.Ease.linear).call(tweenStop);
	  tweenStart();
	  createjs.Tween.get(boelSplashScreen).to({alpha:0.0}, 200, createjs.Ease.linear).call(tweenStop);
  
  /*
	  startChangeCanvasColor=true;
	  finishedChangeCanvasColor=false;
	  rCanvasNew=255;
	  gCanvasNew=149;
	  bCanvasNew=203;
 	*/
      createjs.Tween.get(tableBackground).to({alpha:1.0},400, createjs.Ease.linear);
	  createjs.Tween.get(splashScreenBackground).to({alpha:0.0},400, createjs.Ease.linear);
	 
  
  
	  cake.focus=true;
	  //update=true;
	}
}

function handleButtonTouch(event) {
	restoreBall();
	restoreCake();

	//update=true;
}

function addDebugText() {
	debugText = new createjs.Text("", "24px Courier", "#000");
	debugText.x=20;
	debugText.y=canvas.height-30;
	if (debug) {
		debugText.text="Debug on";
	} else {
		debugText="";
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
		number.scaleX=0.5;
		number.scaleY=0.5;
		number.visible=false;
		numbers.push(number);
		stage.addChild(numbers[i]);
	}
}


function addBall() {
	ball=new createjs.Bitmap(queue.getResult("ball")); //this is a general ball used to select ballgame. It is also used in table game. but not in the ball game. xxx not very logical...
	stage.addChild(ball);
	ball.scaleStart=0.25;
	ball.scaleX = ball.scaleY = ball.scale = ball.scaleStart;

	ball.xStart=canvas.width-ball.scale*ball.image.width/2-20;
	ball.yStart=ball.scale*ball.image.height/2+20;
	ball.x = ball.xStart;
	ball.y = ball.yStart;
	ball.rotation = 0;
	ball.regX = ball.image.width/2|0;
	ball.regY = ball.image.height/2|0;
	ball.name = "Boll";
	
	ball.focus=false;
	ball.addEventListener("mousedown", handleBallTouch);
	
	//here are balls of different colors used in the ball game. 
	

	blueBall=new createjs.Bitmap(queue.getResult("blueball"));
	stage.addChild(blueBall);
	blueBall.regX=blueBall.image.width/2|0;
	blueBall.regY=blueBall.image.height/2|0;
	blueBall.name="Blå boll";
	blueBall.color="blue";
	blueBall.addEventListener("mousedown",handlePlayBallTouch);
	blueBall.alpha=0.0;
	blueBall.radius=blueBall.regX;

	redBall=new createjs.Bitmap(queue.getResult("redball"));
	stage.addChild(redBall);
	redBall.regX=redBall.image.width/2|0;
	redBall.regY=redBall.image.height/2|0;
	redBall.name="Röd boll";
	redBall.color="red";
	redBall.addEventListener("mousedown",handlePlayBallTouch);
	redBall.alpha=0.0;
	redBall.radius=redBall.regX;


	yellowBall=new createjs.Bitmap(queue.getResult("yellowball"));
	stage.addChild(yellowBall);
	yellowBall.regX=yellowBall.image.width/2|0;
	yellowBall.regY=yellowBall.image.height/2|0;
	yellowBall.name="Gul boll";
	yellowBall.color="yellow";
	yellowBall.addEventListener("mousedown",handlePlayBallTouch);
	yellowBall.alpha=0.0;
	yellowBall.radius=yellowBall.regX;
	
	greenBall=new createjs.Bitmap(queue.getResult("greenball"));
	stage.addChild(greenBall);
	greenBall.regX=greenBall.image.width/2|0;
	greenBall.regY=greenBall.image.height/2|0;
	greenBall.name="Grön boll";
	greenBall.color="green";
	greenBall.addEventListener("mousedown",handlePlayBallTouch);
	greenBall.alpha=0.0;
	greenBall.radius=greenBall.regX;

	allBalls=[blueBall,redBall,yellowBall,greenBall];

	setRandomPosition(blueBall);
	setRandomPosition(redBall);
	setRandomPosition(yellowBall);
	setRandomPosition(greenBall);
	
	/*
	greenBall.x=-50;greenBall.y=-50;yellowBall.x=-50;yellowBall.y=-50;
	*/
	/*
	blueBall.x=600;blueBall.y=200;
	redBall.x=300;redBall.y=200;
	*/
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
		if (allBalls[i]!=thisBall) {
			console.log("pushing");
			allBallsButThis.push(allBalls[i]);
		}
	}
	var randomIndex=Math.floor(Math.random()*allBallsButThis.length);

	var other=allBallsButThis[randomIndex];
	console.log("random ball",other.name);
	return other;
	
	
}



function detectBallCollision(thisBall,forceField) {
	//klumpigt kanske, men funkar för bara fyra bollar.
	var collision=false;
	var otherBall=new Object;
	for (var i=0;i<allBalls.length && !collision;i++) {
		if (allBalls[i]!=thisBall) {
			otherBall=allBalls[i];
			collision=collides(thisBall,otherBall,forceField);
			if (collision) {
				thisBall.obstacleBall=otherBall;
			}
		}
	}
	return collision;
}

function handlePlayBallTouch(event) {
	console.log(event.target.name," touched");
	
	var ball=event.target;
	
	//xxx först kolla att det är rätt boll
	
	
	//om det är rätt boll
	var otherBall=findRandomBall(ball);
	ballTween=makeBallTween(ball,otherBall.x+70,otherBall.y+70,0.5);
	

}

function restoreBall() {
	if (ball.focus) {
		ball.alpha=1.0;
		tweenStart();
		createjs.Tween.get(ball).to({x:ball.xStart, y: ball.yStart, scaleX:ball.scaleStart, scaleY:ball.scaleStart}, 400, createjs.Ease.linear).call(tweenStop);
		tweenStart();
		createjs.Tween.get(boelSplashScreen).to({alpha:1.0}, 400, createjs.Ease.linear).call(tweenStop);
		
	    createjs.Tween.get(ballBackground).to({alpha:0.0},400, createjs.Ease.linear);
	    createjs.Tween.get(splashScreenBackground).to({alpha:1.0},400, createjs.Ease.linear);

		
		
		blueBall.alpha=0.0;
		redBall.alpha=0.0;


		yellowBall.alpha=0.0;
		greenBall.alpha=0.0;
		
		setRandomPosition(blueBall);
		setRandomPosition(redBall);

		setRandomPosition(yellowBall);
		setRandomPosition(greenBall);
		
/*
	greenBall.x=-50;greenBall.y=-50;yellowBall.x=-50;yellowBall.y=-50;
*/
	/*
	blueBall.x=600;blueBall.y=200;
	redBall.x=300;redBall.y=200;
	*/
		
		
		ball.focus=false;
		cake.alpha=1;

	}
}

function addTable() {
	table=new createjs.Container();
	
	tableMom.pieceNumber=4;
	tableMom.pieceDeltaX=-150;
	tableMom.pieceDeltaY=-110;
	tableMom.happyPic=new createjs.Bitmap(queue.getResult("tableMom"));
	tableMom.happyPic.character=tableMom; 
	//will this circular reference cause garbage? 
	//Not according to 	
	//http://stackoverflow.com/questions/7347203/circular-references-in-javascript-garbage-collector
	tableMom.sadPic=new createjs.Bitmap(queue.getResult("tableMomSad"));
	tableMom.sadPic.character=tableMom;
	tableMom.handPic=new createjs.Bitmap(queue.getResult("tableMomHand"));
	tableMom.name="Mamma"; 

	tableGrandDad.pieceNumber=3;
	tableGrandDad.pieceDeltaX=200;
	tableGrandDad.pieceDeltaY=-180;
	tableGrandDad.happyPic=new createjs.Bitmap(queue.getResult("tableGrandDad"));
	tableGrandDad.happyPic.character=tableGrandDad;
	tableGrandDad.sadPic=new createjs.Bitmap(queue.getResult("tableGrandDadSad"));
	tableGrandDad.sadPic.character=tableGrandDad;
	tableGrandDad.handPic=new createjs.Bitmap(queue.getResult("tableGrandDadHand"));
	tableGrandDad.name="Morfar";
	
	tableBoel.pieceNumber=5;
	tableBoel.pieceDeltaX=-200;
	tableBoel.pieceDeltaY=70;
	tableBoel.happyPic=new createjs.Bitmap(queue.getResult("tableBoel"));
	tableBoel.happyPic.character=tableBoel;
	tableBoel.sadPic=new createjs.Bitmap(queue.getResult("tableBoelSad"));
	tableBoel.sadPic.character=tableBoel;
	tableBoel.handPic=new createjs.Bitmap(queue.getResult("tableBoelHand"));
	tableBoel.name="Boel"; 

	tableDad.pieceNumber=2;
	tableDad.pieceDeltaX=250;
	tableDad.pieceDeltaY=-135;
	tableDad.happyPic=new createjs.Bitmap(queue.getResult("tableDad"));
	tableDad.happyPic.character=tableDad;
	tableDad.sadPic=new createjs.Bitmap(queue.getResult("tableDadSad"));
	tableDad.sadPic.character=tableDad;
	tableDad.handPic=new createjs.Bitmap(queue.getResult("tableDadHand"));
	tableDad.name="Pappa"; 

	tableTore.pieceNumber=1;
	tableTore.pieceDeltaX=270;
	tableTore.pieceDeltaY=200;
	tableTore.happyPic=new createjs.Bitmap(queue.getResult("tableTore"));
	tableTore.happyPic.character=tableTore;
	tableTore.sadPic=new createjs.Bitmap(queue.getResult("tableToreSad"));
	tableTore.sadPic.character=tableTore;
	tableTore.handPic=new createjs.Bitmap(queue.getResult("tableToreHand"));
	tableTore.name="Tore"; 

	tableDog.pieceNumber=0;
	tableDog.pieceDeltaX=-80;
	tableDog.pieceDeltaY=280;
	tableDog.happyPic=new createjs.Bitmap(queue.getResult("tableDog"));
	tableDog.happyPic.character=tableDog;
	tableDog.sadPic=new createjs.Bitmap(queue.getResult("tableDogSad"));
	tableDog.sadPic.character=tableDog;
	tableDog.handPic=new createjs.Bitmap(queue.getResult("tableDogHand"));
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
	table.y=50; //80;
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
}

function addCharacterEventListener(character) {
	if (character.hasOwnProperty("happyPic")) {
		character.happyPic.addEventListener("mousedown", handleCharacterTouch);
	}
	if (character.hasOwnProperty("sadPic")) {
		character.sadPic.addEventListener("mousedown", handleCharacterTouch);
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
			part.addEventListener("mousedown", handleCakePieceTouch);
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
	cake.scaleStart=0.25;
	cake.scaleX = cake.scaleY = cake.scale = cake.scaleStart;
	
	cake.width=cakeComplete[0][0].image.width;
	cake.height=cakeComplete[0][0].image.height;
	
	cake.xStart=cake.scale*cake.width/2+20;
	cake.yStart=cake.scale*cake.height/2+20;
	cake.x = cake.xStart;
	cake.y = cake.yStart;
	cake.rotation = 0;
	cake.regX = cake.width/2;
	cake.regY = cake.height/2;
	cake.name = "Tårta";
	cake.focus=false;
	cake.addEventListener("mousedown", handleCakeTouch);
	

}

function restoreCake() {
	
	if (cake.focus) {
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
		
		
		
		
		tweenStart();
		createjs.Tween.get(cake).to({x:cake.xStart, y: cake.yStart, scaleX:cake.scaleStart, scaleY:cake.scaleStart}, 400, createjs.Ease.linear).call(tweenStop);
		tweenStart();
		createjs.Tween.get(table).to({alpha:0.0}, 400, createjs.Ease.linear).call(tweenStop);
		tweenStart();
		createjs.Tween.get(boelSplashScreen).to({alpha:1.0}, 400, createjs.Ease.linear).call(tweenStop);
		createjs.Tween.get(tableBackground).to({alpha:0.0},400, createjs.Ease.linear);
	    createjs.Tween.get(splashScreenBackground).to({alpha:1.0},400, createjs.Ease.linear);

		
		
		cake.focus=false;
		ball.alpha=1;
	}
	
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
	if (cake.focus  && soundQueue.length==0) {
		var piece=cakeComplete[piecenumber];
	
		if ((x!=0 || y!=0) && !piece.moved) {
			for (var j=0;j<piece.length;j++) {
				tweenStart();
				createjs.Tween.get(piece[j]).to({x:x, y:y}, 200, createjs.Ease.linear).call(tweenStop);
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
	var soundinstance;
	if (soundQueue.length>0) {
		sq0=soundQueue[0];
		watchSound(sq0);
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
	tweenStart();
	createjs.Tween.get(n).to({x:canvas.width-200, y: 0, scaleX:0.5, scaleY:0.5}, 400, createjs.Ease.linear).call(tweenStop);
	
	
}

function tweenStart() {
	/* not used any more
	numberOfRunningTweens++;
	update=true;
	nextupdate=true;
	*/
}

function tweenStop() {
	/* not used any more
	numberOfRunningTweens--;
	console.log("number of running tweens",numberOfRunningTweens);
	if (numberOfRunningTweens<=0) {
		//this is to allow one last tick after tweens have stopped
		numberOfRunningTweens=0;
		//nextupdate=false; xxxxx
	} else {
		//nextupdate=true; xxxxx
	}
	*/
}

function randomFutureTicks(minsec,maxsec) {
	//returns a time in ticks in the future, minsec to maxsec seconds from now
	randomSec=minsec+Math.random()*(maxsec-minsec);
	randomTimeTicks=Math.floor(now+fps*randomSec);
	return randomTimeTicks;

}

function bounceToTable(piecenumber) {
	var time = 1500.0;
	
	var startX=ball.x;
	var startY=ball.y;
	
	//console.log("startX",startX,"startY",startY);
	
	var smashX=cake.x+cake.scaleX*cakeComplete[piecenumber][0].x;
	var smashY=cake.y+cake.scaleY*cakeComplete[piecenumber][0].y;
	
	//antag startX=10, smashX=40. då ska endX bli 70
	
	var endX=startX+(smashX-startX)*3.9; 
	//should be 4 but this only affects movement outside canvas
	//it is slightly less than 4 to ensure that x tween finishes before y tween
	var endY=startY;
	
	ball.alpha=1.0;
	
	pieceNumberToSmash=piecenumber;
	
	tweenStart();
	createjs.Tween.get(ball).to({
		x: endX
	}, 3.9 * time, createjs.Ease.linear).call(tweenStop);
	tweenStart();
	createjs.Tween.get(ball).to({
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
	if (ball.x>canvas.width+100) {
		ball.x=canvas.width+100;
	} else if (ball.x<-100) {
		ball.x=-100;
	}
	tweenStop();
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

