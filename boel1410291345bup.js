var names=[
	"hunden",
	"tore",
	"pappa",
	"morfar",
	"mamma",
	"boel"];


var cardinal=[
	"noll",
	"en",
	"tvaa",
	"tre",
	"fyra",
	"fem",
	"sex"];
	
var ordinal=[
	"nollte",
	"foersta",
	"andra",
	"tredje",
	"fjaerde",
	"femte",
	"sjaette"];
	
var debug=true;

//variable definitions
var canvas;
var stage;
var background;
var queue;
var offset;
var update = false;
var nextupdate = false;
var ball,boel,cake,table;

var pieceParts,cakepieces;

var cakefiles;

var table_0008_mom,table_0007_granddad,table_0006_boel,table_0005b_dad,table_0005_tore,table_0004_table,table_0004_mom_hand,table_0003b_dad_hand,table_0003_tore_hand,table_0002_dog,table_0001_boel_hand,table_0000_granddad_hand;

var numbers=new Array();

var cakeComplete=new Array(); //xxx kan bli problem med global variabel om man har en cake med sex bitar, en annan med 4 bitar. 
//var cakeStatus=new Array();
var debugText;

var loadedFiles=0;
var filesToLoad;

var fps=24; //var 30

var rCanvasStart=134;
var gCanvasStart=219;
var bCanvasStart=213;

var rCanvas=rCanvasStart;//0x86;
var gCanvas=gCanvasStart;//0xDB;
var bCanvas=bCanvasStart;//0xD5;

var rDelta;//=(rfinal-r)/40;
var gDelta;//=(gfinal-g)/40;
var bDelta;//=(bfinal-b)/40;

var rCanvasNew;
var gCanvasNew;
var bCanvasNew;

var startChangeCanvasColor=false;
var finishedChangeCanvasColor=true;

var now=0;
var nextSmash=-1;
var nextRandomCheck=-1;

var minSecSelectName=15; //min random time before voice: "x vill ha tårta, var är x"
var maxSecSelectName=30; //max random time...

var numberOfRunningTweens=0;

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


function init() {	
	if (window.top != window) {
		document.getElementById("header").style.display = "none";
	}
	document.getElementById("loader").className = "loader";
	// create stage and point it to the canvas:
	canvas = document.getElementById("myCanvas");		
	canvas.style.backgroundColor=rgb(rCanvas,gCanvas,bCanvas);	

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

	//loading assets
	queue=new createjs.LoadQueue(false);
	
	queue.installPlugin(createjs.Sound);
	
	queue.addEventListener("complete",handleComplete);
	queue.addEventListener("error", handleFileError);
	queue.addEventListener("fileload", handleFileLoad);

	
	var soundfiles=[
		{id:"en",src:"assets/en.mp3"},
		{id:"tvaa",src:"assets/tvaa.mp3"},
		{id:"tre",src:"assets/tre.mp3"},
		{id:"fyra",src:"assets/fyra.mp3"},
		{id:"fem",src:"assets/fem.mp3"},
		{id:"sex",src:"assets/sex.mp3"},
		{id:"foersta",src:"assets/foersta.mp3"},
		{id:"andra",src:"assets/andra.mp3"},
		{id:"tredje",src:"assets/tredje.mp3"},
		{id:"fjaerde",src:"assets/fjaerde.mp3"},
		{id:"femte",src:"assets/femte.mp3"},
		{id:"sjaette",src:"assets/sjaette.mp3"},
		{id:"hunden",src:"assets/hunden.mp3"},
		{id:"tore",src:"assets/tore.mp3"},
		{id:"pappa",src:"assets/pappa.mp3"},
		{id:"morfar",src:"assets/morfar.mp3"},
		{id:"mamma",src:"assets/mamma.mp3"},
		{id:"boel",src:"assets/boel.mp3"},
		{id:"faar",src:"assets/faar.mp3"},
		{id:"vill_ha_taarta_var_aer",src:"assets/vill_ha_taarta_var_aer.mp3"},
		{id:"det_var_vael_inte",src:"assets/det_var_vael_inte.mp3"},
		{id:"det_aer_ju",src:"assets/det_aer_ju.mp3"},
		{id:"taartbit",src:"assets/taartbit.mp3"},
		{id:"taartbiten",src:"assets/taartbiten.mp3"},
		{id:"taartbitar",src:"assets/taartbitar.mp3"},
		{id:"tyst1000",src:"assets/tyst1000.mp3"},
		{id:"som",src:"assets/som.mp3"},
		{id:"ett_till_tjugo",src:"assets/ett_till_tjugo.mp3"}];
			
	
	
	var simpleimagefiles=[{id:"boelstart", src:"assets/boelstart.png"},{id:"boel", src:"assets/boel.png"},{id:"ball", src:"assets/ball.png"},{id:"dog", src:"assets/dog.png"},{id:"button", src:"assets/button.png"},{id:"cake_plate", src:"assets/cake_plate.png"}];
	
	
	var numberfiles=new Array();
	for (var i=0;i<10;i++) {
		numberfiles.push({id:i+"",src:"assets/"+i+".png"});
	}
	pieceParts=["smashed_piece","cake_base","cake_outsidelines"]; //should be pieceparts
	cakepieces=6;
	cakefiles=buildcakefiles(pieceParts,cakepieces);
	
	var tableparts=["table_0008_mom","table_0007_granddad","table_0006_boel","table_0005b_dad","table_0005_tore","table_0004_table","table_0004_mom_hand","table_0003b_dad_hand","table_0003_tore_hand","table_0002_dog","table_0001_boel_hand","table_0000_granddad_hand"];
	var tablefiles=new Array();
	for (var i=0;i<tableparts.length;i++) {
		tablefiles.push({id:tableparts[i],src:"assets/"+tableparts[i]+".png"});
	}
	

	var files=simpleimagefiles.concat(cakefiles,numberfiles,tablefiles,soundfiles);
	
	queue.loadManifest(files);
	filesToLoad=files.length;
}


function handleBackgroundTouch(event) {
/*	
	startChangeCanvasColor=true;
	finishedChangeCanvasColor=false;
	rCanvasNew=Math.floor(Math.random()*255);
	gCanvasNew=Math.floor(Math.random()*255);
	bCanvasNew=Math.floor(Math.random()*255);
*/	
	//update=true;
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

	addBoel();
	boel.visible=false;
	addBoelstart();
	addBall();
	addTable();

	
	addCake(pieceParts,cakepieces,cakefiles);
	

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
		console.log('smash');
		nextSmash=-1;
	}
	
	
	if (now>nextRandomCheck && nextRandomCheck>0) {
		//vem har inte fått tårtbit än?
		if (soundQueue.length==0 && selectedNameNumber==-1) {
			var notMoved=[];
			for (pieceNumber in cakeComplete) {
				piece=cakeComplete[pieceNumber];

				if (!piece.moved) {
					notMoved.push(pieceNumber);
				}
			}
			if (notMoved.length>0) { 
				randomIndex=Math.floor(Math.random()*notMoved.length);
				selectedNameNumber=notMoved[randomIndex];
				selectedName=names[selectedNameNumber];
				extendAndPlayQueue([selectedName,"vill_ha_taarta_var_aer",selectedName]);
			}
		} 
		nextRandomCheck=-1;
	}
	
	
	
	
	
	if (startChangeCanvasColor || !finishedChangeCanvasColor) {
		changeCanvasColor(rCanvasNew,gCanvasNew,bCanvasNew,10);
		//printDebug("("+rCanvas.toFixed(2) +","+gCanvas.toFixed(2)+","+bCanvas.toFixed(2)+")");
	}
	
	if (update) {		
		stage.update(event); //pass event to make sure for example sprite animation works
	}
	if (!nextupdate) {
		update=false;
	}
}



function handleTable_0002_dogTouch(event) {
	moveCakePiece(0,-80,280);
}

function handleTable_0006_boelTouch(event) {
	moveCakePiece(5,-200,0);
}

function handleTable_0008_momTouch(event) {
	moveCakePiece(4,-150,-170);
}

function handleTable_0007_granddadTouch(event) {
	moveCakePiece(3,200,-180);
}

function handleTable_0005b_dadTouch(event) {
	moveCakePiece(2,250,-160);
}

function handleTable_0005_toreTouch(event) {
	moveCakePiece(1,270,200);
}

function handleCakePieceTouch(event) {
	
	piecenumber=event.target.number;
	
	/* disable move by cakepiecetouch
	switch (piecenumber) {
		case 0:
			nextSmash=now+fps*1; //should be random
			moveCakePiece(0,-80,280); //xxx used also in handleTable_0002_dogTouch, coordinates must be moved to central place
			break;
		case 1: 
			moveCakePiece(1,270,200);
			break;
		case 2:
			moveCakePiece(2,250,-160);
			break;
		case 3:
			moveCakePiece(3,200,-180);
			break;
		case 4:
			moveCakePiece(4,-150,-170);
			break;
		case 5:
			moveCakePiece(5,-200,0);
			break;
		default:
			break;
	}
	*/
}

function smashPiece(piecenumber) {
			var piece=cakeComplete[piecenumber];
			piece.smashed=true;
			piece[0].visible=true;
			piece[1].visible=false;
			piece[2].visible=false;
			piece[3].visible=false;
}



function handleBallTouch(event) {
	if (!cake.focus  && !ball.focus) { //xxx quickfix
	  restoreCake();
	  cake.alpha=0.1;
	  tweenStart();
	  createjs.Tween.get(ball).to({x:canvas.width/2+200, y: canvas.height/2, scaleX:1.0, scaleY:1.0}, 400, createjs.Ease.linear).call(tweenStop);
	  tweenStart();
	  createjs.Tween.get(boelstart).to({alpha:0.0}, 200, createjs.Ease.linear).call(tweenStop);
	  
	  startChangeCanvasColor=true;
	  finishedChangeCanvasColor=false;
	  rCanvasNew=255;
	  gCanvasNew=255;
	  bCanvasNew=0;
  
	  ball.focus=true;
	  //update=true;
	}
}

function handleCakeTouch(event) {
	
	bounce();
	
	//alert('caketouch');
	if (!ball.focus && !cake.focus) { //xxx quickfix
	  extendAndPlayQueue(["tyst1000"]);//xxx very weird. this sound is needed for first sound to play on iphone.
	  nextRandomCheck=randomFutureTicks(minSecSelectName,maxSecSelectName);
	  restoreBall();
	  ball.alpha=0.1;
	  tweenStart();
	  createjs.Tween.get(cake).to({x:canvas.width/2+20, y: canvas.height/2+80, scaleX:0.50, scaleY:0.50}, 400, createjs.Ease.linear).call(tweenStop);
	  tweenStart();
	  createjs.Tween.get(table).to({alpha:1.0}, 400, createjs.Ease.linear).call(tweenStop);
	  tweenStart();
	  createjs.Tween.get(boelstart).to({alpha:0.0}, 200, createjs.Ease.linear).call(tweenStop);
  
	  startChangeCanvasColor=true;
	  finishedChangeCanvasColor=false;
	  rCanvasNew=255;
	  gCanvasNew=149;
	  bCanvasNew=203;
  
	  cake.focus=true;
	  //update=true;
	}
}

function handleButtonTouch(event) {
	restoreBall();
	restoreCake();
	startChangeCanvasColor=true;
	finishedChangeCanvasColor=false;
	rCanvasNew=rCanvasStart;
	gCanvasNew=gCanvasStart;
	bCanvasNew=bCanvasStart;

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

function addBoel() {
	boel=new createjs.Bitmap(queue.getResult("boel"));
	stage.addChild(boel);
	boel.scaleX = boel.scaleY = boel.scale = 1;
	boel.x = canvas.width/2-200;
	boel.y = canvas.height/2;
	boel.rotation = 0;
	boel.regX = boel.image.width/2|0;
	boel.regY = boel.image.height/2|0;
	boel.name = "Boel";
}

function addBoelstart() {
	boelstart=new createjs.Bitmap(queue.getResult("boelstart"));
	stage.addChild(boelstart);
	boel.scaleX = boel.scaleY = boel.scale = 0.2;
	boel.x = canvas.width/2-200;
	boel.y = canvas.height/2;
	boel.rotation = 0;
	boel.regX = boel.image.width/2|0;
	boel.regY = boel.image.height/2|0;
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
	ball=new createjs.Bitmap(queue.getResult("ball"));
	stage.addChild(ball);
	ball.scaleStart=0.25;
	ball.scaleX = ball.scaleY = ball.scale = ball.scaleStart;

	ball.xStart=canvas.width-ball.scale*ball.image.width/2-20;
	ball.yStart=ball.scale*ball.image.height/2+20;
	ball.x = ball.xStart;
	ball.y = ball.yStart;
	ball.rotation = 0;
	ball.regX = ball.image.width/2;
	ball.regY = ball.image.height/2;
	ball.name = "Pappa";
	
	ball.focus=false;
	ball.addEventListener("mousedown", handleBallTouch);

}

function restoreBall() {
	if (ball.focus) {
		tweenStart();
		createjs.Tween.get(ball).to({x:ball.xStart, y: ball.yStart, scaleX:ball.scaleStart, scaleY:ball.scaleStart}, 400, createjs.Ease.linear).call(tweenStop);
		tweenStart();
		createjs.Tween.get(boelstart).to({alpha:1.0}, 400, createjs.Ease.linear).call(tweenStop);
		ball.focus=false;
		cake.alpha=1;

	}
}



function addTable() {
	table=new createjs.Container();
	
	table_0008_mom=new createjs.Bitmap(queue.getResult("table_0008_mom"));
	table_0007_granddad=new createjs.Bitmap(queue.getResult("table_0007_granddad"));
	table_0006_boel=new createjs.Bitmap(queue.getResult("table_0006_boel"));
	table_0005b_dad=new createjs.Bitmap(queue.getResult("table_0005b_dad"));
	table_0005_tore=new createjs.Bitmap(queue.getResult("table_0005_tore"));
	table_0004_table=new createjs.Bitmap(queue.getResult("table_0004_table"));
	table_0004_mom_hand=new createjs.Bitmap(queue.getResult("table_0004_mom_hand"));
	table_0003b_dad_hand=new createjs.Bitmap(queue.getResult("table_0003b_dad_hand"));
	table_0003_tore_hand=new createjs.Bitmap(queue.getResult("table_0003_tore_hand"));
	table_0002_dog=new createjs.Bitmap(queue.getResult("table_0002_dog"));
	table_0001_boel_hand=new createjs.Bitmap(queue.getResult("table_0001_boel_hand"));
	table_0000_granddad_hand=new createjs.Bitmap(queue.getResult("table_0000_granddad_hand"));
	table.addChild(table_0008_mom,table_0007_granddad,table_0006_boel,table_0005b_dad,table_0005_tore,table_0004_table,table_0004_mom_hand,table_0003b_dad_hand,table_0003_tore_hand,table_0002_dog,table_0001_boel_hand
,table_0000_granddad_hand);
	table.x=100;
	table.y=80;
	table.alpha=0.0;
	table.scaleX=table.scaleY=1.0;
	
	table_0008_mom.addEventListener("mousedown", handleTable_0008_momTouch);
	table_0007_granddad.addEventListener("mousedown", handleTable_0007_granddadTouch);
	table_0006_boel.addEventListener("mousedown", handleTable_0006_boelTouch);
	table_0005b_dad.addEventListener("mousedown", handleTable_0005b_dadTouch);
	table_0005_tore.addEventListener("mousedown", handleTable_0005_toreTouch);
	table_0002_dog.addEventListener("mousedown", handleTable_0002_dogTouch);
	
	
	stage.addChild(table);
	
}


function addCake(pieceParts,cakepieces,cakefiles) {
	
	cake = new createjs.Container();
	
	//alltså, behöver en cake som är en multidimensionell array, som dels består av alla bitar och varje bit av 5? delar
	//första index är bit, andra index är del. 
	
	
	
	//bättre göra varje bit till en container istället för hela tårtan väl...
	var k=0;
	for (var i=0;i<cakepieces;i++) {
		var onePiece=new Array(); 
		for (var j=0;j<pieceParts.length+1;j++) { //+1 because cake_outsidelines doubled
			var part=new createjs.Bitmap(queue.getResult(cakefiles[k]["id"]));
			k++;
			part.number=i; //first piece has number 0
			onePiece.push(part);
			part.addEventListener("mousedown", handleCakePieceTouch);
			if (j==0 || j==2 || j==3) {
				part.visible=false;
			}
		}
		onePiece.moved=false;
		onePiece.smashed=false;
		cakeComplete.push(onePiece);
		//cakeStatus.push(true); //visible, or actually visible in cake. Maybe I should say: Not moved
		
		//xxx test code
		//cakeComplete[i][0].addEventListener("mousedown", handleCakePieceTouch);
		//xxx end test code
	
	//xxx test code
		//cakeComplete[i][0].addEventListener("mousedown", handleCakePieceTouch);
	//xxx test code		
	
	}
	
	var cake_plate=new createjs.Bitmap(queue.getResult("cake_plate"));
	cake.addChild(cake_plate);		

	
	var pieceOrder=[3,4,2,5,1,6]; //xxx funkar ju bara för sexbitarstårta
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
		for (var i=0;i<cakeComplete.length;i++) {
			moveCakePiece(i,0,0);
		}
		tweenStart();
		createjs.Tween.get(cake).to({x:cake.xStart, y: cake.yStart, scaleX:cake.scaleStart, scaleY:cake.scaleStart}, 400, createjs.Ease.linear).call(tweenStop);
		tweenStart();
		createjs.Tween.get(table).to({alpha:0.0}, 400, createjs.Ease.linear).call(tweenStop);
		tweenStart();
		createjs.Tween.get(boelstart).to({alpha:1.0}, 400, createjs.Ease.linear).call(tweenStop);
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

/*
function showCakePiece(piecenumber,show) {
	//piecenumber: piece to show or hide
	//show: true to show, false to hide
	var piece=cakeComplete[piecenumber];
	if (!show) {
		for (var j=0;j<piece.length;j++) {
			piece[j].visible=false;
			cakeStatus[piecenumber]=false;
		}
	} else {
		for (var j=0;j<piece.length;j++) {
			piece[j].visible=true;
			cakeStatus[piecenumber]=true;
		}
	}
	
	for (var k=0;k<cakeStatus.length;k++) {
		//om bit är synlig men nästa bit ej synlig: visa skiljelinje
		if (cakeStatus[k] && !cakeStatus[(k+1)%cakeStatus.length]) {
			cakeComplete[k][3].visible=true;	
		} else {
			cakeComplete[k][3].visible=false;
		}
		if (cakeStatus[k] && !cakeStatus[(k-1+cakeStatus.length)%cakeStatus.length]) {
			cakeComplete[k][4].visible=true;	
		} else {
			cakeComplete[k][4].visible=false;
		}
	
	}
}
*/
function moveCakePiece(piecenumber,x,y) {
	//piecenumber: piece to show or hide
	//show: true to show, false to hide
	var movePerformed=false;
	if (cake.focus  && soundQueue.length==0) {
		var piece=cakeComplete[piecenumber];
	
		if ((x!=0 || y!=0) && !piece.moved) {//cakeStatus[piecenumber]) { //mycket klumpig konstruktion
			for (var j=0;j<piece.length;j++) {
				tweenStart();
				createjs.Tween.get(piece[j]).to({x:x, y:y}, 200, createjs.Ease.linear).call(tweenStop);
				piece.moved=true; //cakeStatus[piecenumber]=false;
				movePerformed=true;
			}
		} else if (x==0 && y==0) { //used in restoreCake
			for (var j=0;j<piece.length;j++) {
				piece[j].x=0;
				piece[j].y=0;
				piece.moved=false; //cakeStatus[piecenumber]=true;
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
			
			if (piece.moved && !piece.smashed) {	
				//flyttad bit
				movedPieces++;
				piece[2].visible=true;
				piece[3].visible=true;
			}
		
		}
		
	
		if (movePerformed && (x!=0 || y!=0)) {
			
			
			
			
			if (selectedNameNumber==piecenumber || selectedNameNumber==-1) {	
				//"rätt" person klickad		
				extendAndPlayQueue([names[piecenumber],"faar",ordinal[movedPieces],"taartbiten"]);
				selectedNameNumber=-1;
				nextRandomCheck=randomFutureTicks(minSecSelectName,maxSecSelectName);
			} else {
				//"fel" person klickad
				extendAndPlayQueue(["det_var_vael_inte",names[selectedNameNumber],"det_aer_ju",names[piecenumber],"som","faar",ordinal[movedPieces],"taartbiten"]);
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
		soundinstance.addEventListener("complete",handleNextSound);
	}
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
	numberOfRunningTweens++;
	update=true;
	nextupdate=true;
}

function tweenStop() {
	numberOfRunningTweens--;
	if (numberOfRunningTweens==0) {
		//this is to allow one last tick after tweens have stopped
		nextupdate=false;
	} else {
		nextupdate=true;
	}
}

function randomFutureTicks(minsec,maxsec) {
	//returns a time in ticks in the future, minsec to maxsec seconds from now
	randomSec=minsec+Math.random()*(maxsec-minsec);
	printDebug(" "+Math.floor(randomSec));
	randomTimeTicks=Math.floor(now+fps*randomSec);
	return randomTimeTicks;

}






function bounce() {
	var time = 500.0;
	
	tweenStart();
	createjs.Tween.get(ball).to({
		x: ball.x - 200
	}, 2 * time, createjs.Ease.linear).call(tweenStop);
	createjs.Tween.get(ball).to({
		y: canvas.height-100
	}, time, createjs.Ease.getPowIn(2)).to({
		y: 100
	}, time, createjs.Ease.getPowOut(2)).call(handleBounceComplete);
}

function handleBounceComplete() {
	tweenStop();
}
