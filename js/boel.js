//coordinates:
//bimaps and Sprites seem to get an original location at (0,0), with the upper left point as the reference
//Shapes get an original position defined by the first two parameters of drawRect(-128,-128,256,256), with the upper left
//corner as the reference. When bitmaps and shapes are moved by changing x and y, this is considered a transform, 
//and they still keep their original coordinates. globalTolocal and localToglobal can be used to change between systems. 
//The reference point can also be changed by changing regX and regY.

/*


boll i hörn
visa boel i början, byt mot bord om man klickar tårta
ljud???

lös idé:
slumpa fram x personer runt bord. 
visa tårta med så många bitar
en bit till varje person
visa siffror

Hur interagera?

Peka på varje person, så får personen en bit.

Eller dra en tårtbit till varje person

tore, boel, pappa, mamma, morfar, hunden

ok, något sådant. 

Första steg: klicka på tårta för att "öppna" tårtleken.

Sätt fyra pers runt bord. klicka på person för att person ska få bit. 

Sätt ut siffra för varja person som fått bit. 

Avlångt bord med personerna i profil, utom ev morfar på kanten




*/



	
var debug=false;

//variable definitions
var canvas;
var stage;
var background;
var queue;
var offset;
var update = true;

var ball,dog,boel,cake,table;

var cakeparts,cakepieces;

var cakefiles;


var table_0007_granddad,table_0006_boel,table_0005_tore,table_0004_table,table_0003_tore_hand,table_0002_dog,table_0001_boel_hand,table_0000_granddad_hand;

var cakepiecesound=new Array();

var numbers=new Array();

var cakeComplete=new Array(); //xxx kan bli problem med global variabel om man har en cake med sex bitar, en annan med 4 bitar. 
var cakeStatus=new Array();
var debugText;

var loadedFiles=0;
var filesToLoad;

var fps=30;

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
		
	debugText = new createjs.Text("", "12px Monaco", "#000");
	stage.addChild(debugText);
	debugText.x=20;
	debugText.y=canvas.height-20;
	if (debug) {
		debugText.text="Debug on";
	} else {
		debugText="";
	}
	//loading assets
	queue=new createjs.LoadQueue(false);
	
	
	//xxx vad är skillnaden mellan dessa?
	//createjs.Sound.initializeDefaultPlugins();
	queue.installPlugin(createjs.Sound);
	
	queue.addEventListener("complete",handleComplete);
	queue.addEventListener("error", handleFileError);
	queue.addEventListener("fileload", handleFileLoad);

	
	//weird: seems like no space is allowed before | in src:"assets/bark.mp3| assets/bark.ogg
	//var soundfiles=[];
	//var soundfiles=[{id:"cakepiece1",src:"assets/cakepiece1.mp3"}];
	var soundfiles=[{id:"cakepiece1",src:"assets/cakepiece1.mp3| assets/cakepiece1.ogg"},{id:"cakepiece2",src:"assets/cakepiece2.mp3| assets/cakepiece2.ogg"},{id:"cakepiece3",src:"assets/cakepiece3.mp3| assets/cakepiece3.ogg"},{id:"cakepiece4",src:"assets/cakepiece4.mp3| assets/cakepiece4.ogg"}];
	
	var simpleimagefiles=[{id:"boelstart", src:"assets/boelstart.png"},{id:"boel", src:"assets/boel.png"},{id:"ball", src:"assets/ball.png"},{id:"dog", src:"assets/dog.png"},{id:"button", src:"assets/button.png"},{id:"daisy", src:"assets/daisy.png"},{id:"dogs", src:"assets/dogsprites.png"},{id:"cake_plate", src:"assets/cake_plate.png"}];
	
	
	var numberfiles=new Array();
	for (var i=0;i<10;i++) {
		numberfiles.push({id:i+"",src:"assets/"+i+".png"});
	}
	cakeparts=["cake_base","cake_filling","cake_fillinglines","cake_outsidelines"];
	cakepieces=6;
	cakefiles=buildcakefiles(cakeparts,cakepieces);
	
	var tableparts=["table_0007_granddad","table_0006_boel","table_0005_tore","table_0004_table","table_0003_tore_hand","table_0002_dog","table_0001_boel_hand","table_0000_granddad_hand"];
	var tablefiles=new Array();
	for (var i=0;i<tableparts.length;i++) {
		tablefiles.push({id:tableparts[i],src:"assets/"+tableparts[i]+".png"});
	}
	

	var files=simpleimagefiles.concat(cakefiles,numberfiles,tablefiles,soundfiles);
	
	//xxx not a logical place for this code
	cakepiecesound.push("nosound"); //quick fix to handel array starts with 0, but error prone
	cakepiecesound.push("cakepiece1");
	cakepiecesound.push("cakepiece2");
	cakepiecesound.push("cakepiece3");
	cakepiecesound.push("cakepiece4");
	
	
	//for (var i=0;i<files.length;i++) {
	//	alert(files[i]['src']);
	//}
	
	queue.loadManifest(files);
	filesToLoad=files.length;
}

function stop() {
	createjs.Ticker.removeEventListener("tick", tick);
}



function handleBackgroundTouch(event) {
/*	
	startChangeCanvasColor=true;
	finishedChangeCanvasColor=false;
	rCanvasNew=Math.floor(Math.random()*255);
	gCanvasNew=Math.floor(Math.random()*255);
	bCanvasNew=Math.floor(Math.random()*255);
*/	
	update=true;
}


function printDebug(text) {
	if (debug) {
		debugText.text+=text;
		debugText.text=debugText.text.substring(debugText.text.length-136,debugText.text.length);		
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

	//addDaisy();
	//createjs.Tween.get(daisy).to({alpha:0.5, y: daisy.y + 300}, 4000, createjs.Ease.linear);

	addDog();
	dog.visible=false;
	addBoel();
	boel.visible=false;
	addBoelstart();
	addBall();
	addTable();

	
	addCake(cakeparts,cakepieces,cakefiles);
	

	addButton();
	
	addNumbers();
	
	
	
	//addOldDog();

	//setup almost complete, start the ticker
	background.addEventListener("mousedown", handleBackgroundTouch);
	document.getElementById("loader").className = "";
	createjs.Ticker.addEventListener("tick", tick);
	createjs.Ticker.setFPS(fps);		
}

function tick(event) {
	//this set makes it so the stage only re-renders when an event handler indicates a change has happened.
	now=createjs.Ticker.getTicks(false)
	
	if (startChangeCanvasColor || !finishedChangeCanvasColor) {
		changeCanvasColor(rCanvasNew,gCanvasNew,bCanvasNew,10);
		printDebug("("+rCanvas.toFixed(2) +","+gCanvas.toFixed(2)+","+bCanvas.toFixed(2)+")");
	}
	
	if (update) {		
		stage.update(event);
	}
}


function handleTable_0006_boelTouch(event) {
	moveCakePiece(3,-200,-70);
}

function handleTable_0002_dogTouch(event) {
	moveCakePiece(0,-80,280);
}


function handleTable_0007_granddadTouch(event) {
	moveCakePiece(2,100,-150);
}

function handleTable_0005_toreTouch(event) {
	moveCakePiece(1,230,50);
}




function handleDogTouch(event) {
	restoreBall();
	restoreCake();
	createjs.Tween.get(dog).to({x:canvas.width/2+100, y: canvas.height/2, scaleX:1.0, scaleY:1.0}, 400, createjs.Ease.linear);
	
	startChangeCanvasColor=true;
	finishedChangeCanvasColor=false;
	rCanvasNew=33;
	gCanvasNew=118;
	bCanvasNew=180;

	dog.focus=true;
	
	update=true;
}

function handleBallTouch(event) {
	if (!cake.focus) { //xxx quickfix
	restoreDog();
	restoreCake();
	createjs.Tween.get(ball).to({x:canvas.width/2+200, y: canvas.height/2, scaleX:1.0, scaleY:1.0}, 400, createjs.Ease.linear);
	createjs.Tween.get(boelstart).to({alpha:0.0}, 200, createjs.Ease.linear);
	
	startChangeCanvasColor=true;
	finishedChangeCanvasColor=false;
	rCanvasNew=255;
	gCanvasNew=255;
	bCanvasNew=0;

	ball.focus=true;
	update=true;
	}
}

function handleCakeTouch(event) {
	if (!ball.focus) { //xxx quickfix
	restoreDog();
	restoreBall();
	createjs.Tween.get(cake).to({x:canvas.width/2+20, y: canvas.height/2+80, scaleX:0.50, scaleY:0.50}, 400, createjs.Ease.linear);
	createjs.Tween.get(table).to({alpha:1.0}, 400, createjs.Ease.linear);
	createjs.Tween.get(boelstart).to({alpha:0.0}, 200, createjs.Ease.linear);

	startChangeCanvasColor=true;
	finishedChangeCanvasColor=false;
	rCanvasNew=255;
	gCanvasNew=149;
	bCanvasNew=203;

	cake.focus=true;
	update=true;
	}
}

function handleOldDogTouch(event) {
	
	oldDog.gotoAndPlay("walkright");
	createjs.Tween.get(oldDog).to({x:event.stageX, y: event.stageY, scaleX:1.0, scaleY:1.0}, 400, createjs.Ease.linear);


	update=true;
}



function handleButtonTouch(event) {
	restoreDog();
	restoreBall();
	restoreCake();
	startChangeCanvasColor=true;
	finishedChangeCanvasColor=false;
	rCanvasNew=rCanvasStart;
	gCanvasNew=gCanvasStart;
	bCanvasNew=bCanvasStart;

	update=true;
}

function addDaisy() {
	daisy=new createjs.Bitmap(queue.getResult("daisy"));
	
	stage.addChild(daisy);
	daisy.x = 200;//canvas.width * Math.random()|0;
	daisy.y = 300;//canvas.height * Math.random()|0;
	daisy.rotation = 0;//360 * Math.random()|0;
	daisy.regX = daisy.image.width/2|0;
	daisy.regY = daisy.image.height/2|0;
	daisy.scaleX = daisy.scaleY = daisy.scale = 0.5; //Math.random()*0.4+0.6;
	daisy.name = "daisy";
	daisy.addEventListener("pressmove",function(evt) {
		// currentTarget will be the container that the event listener was added to:
		//var offset = {x:evt.currentTarget.x-evt.stageX, y:evt.currentTarget.y-evt.stageY};
		//offset not working
		evt.currentTarget.x = evt.stageX;//+offset.x;
		evt.currentTarget.y = evt.stageY;//+offset.y;
		// make sure to redraw the stage to show the change:
		update=true;   
	});	
}

function addOldDog() {
	//create the dog
	dogs = new createjs.Bitmap(queue.getResult("dogs"));		
	var spriteSheet = new createjs.SpriteSheet({
		// image to use
		images: [dogs.image], 
		// width, height & registration point of each sprite
		frames: {width: 256, height: 256, regX: 128, regY: 128}, 
		animations: {	
			walkleft: [0,11,"walkleft",0.5],
			walkright: [12,23,"walkright",0.5],
			upleft: {
				frames:[24,25,26,27],
				next: "walkleft",
				speed: 0.5
			},
			upright: {
				frames:[28,29,30,31],
				next: "walkright",
				speed: 0.5
			},
			wagleft: {
				frames:[32,33,34,35,36,37,38,39,32,33,34,35,36,37,38,39],
				next: false,
				speed: 1
			},
			wagright: {
				frames:[40,41,42,43,44,45,46,47,40,41,42,43,44,45,46,47],
				next: false,
				speed: 1
			},
			downleft: {
				frames:[27,26,25,24],
				next: false,
				speed: 0.5
			},
			downright: {
				frames:[31,30,29,28],
				next: false,
				speed: 0.5
			}

		}
	});
	
	oldDog = new createjs.Sprite(spriteSheet);
			
	oldDog.gotoAndStop(28); 

	oldDog.name="Fido";
	oldDog.x=150;
	oldDog.y=100;
	oldDog.rotation=0;//180;//xxx
	 
	stage.addChild(oldDog);
	oldDog.addEventListener("mousedown", handleOldDogTouch);

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

function addDog() {
	dog=new createjs.Bitmap(queue.getResult("dog"));
	stage.addChild(dog);
	dog.scaleStart=0.25;
	dog.scaleX = dog.scaleY = dog.scale = dog.scaleStart;
	dog.xStart=canvas.width-dog.scale*dog.image.width/2-20;
	dog.yStart=canvas.height-dog.scale*dog.image.height/2-20;

	dog.x = dog.xStart;
	dog.y = dog.yStart;
	dog.rotation = 0;
	dog.regX = dog.image.width/2;
	dog.regY = dog.image.height/2;
	dog.name = "Hunden";
	
	dog.focus=false;
	
	dog.addEventListener("mousedown", handleDogTouch);
}

function restoreDog() {
	if (dog.focus) {
		createjs.Tween.get(dog).to({x:dog.xStart, y: dog.yStart, scaleX:dog.scaleStart, scaleY:dog.scaleStart}, 400, createjs.Ease.linear);
		dog.focus=false;
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
		createjs.Tween.get(ball).to({x:ball.xStart, y: ball.yStart, scaleX:ball.scaleStart, scaleY:ball.scaleStart}, 400, createjs.Ease.linear);
		createjs.Tween.get(boelstart).to({alpha:1.0}, 400, createjs.Ease.linear);
		ball.focus=false;
	}
}

//xxx test code, this should be deleted
/*
function handleCakePieceTouch(event) {
	//event.target.visible=false;
	piecenumber=event.target.number;
	showCakePiece(piecenumber,false);
	showCakePiece((piecenumber+1)%cakeStatus.length,true);
}
*/

function addTable() {
	table=new createjs.Container();
	
	
	table_0007_granddad=new createjs.Bitmap(queue.getResult("table_0007_granddad"));
	table_0006_boel=new createjs.Bitmap(queue.getResult("table_0006_boel"));
	table_0005_tore=new createjs.Bitmap(queue.getResult("table_0005_tore"));
	table_0004_table=new createjs.Bitmap(queue.getResult("table_0004_table"));
	table_0003_tore_hand=new createjs.Bitmap(queue.getResult("table_0003_tore_hand"));
	table_0002_dog=new createjs.Bitmap(queue.getResult("table_0002_dog"));
	table_0001_boel_hand=new createjs.Bitmap(queue.getResult("table_0001_boel_hand"));
	table_0000_granddad_hand=new createjs.Bitmap(queue.getResult("table_0000_granddad_hand"));
	table.addChild(table_0007_granddad,table_0006_boel,table_0005_tore,table_0004_table,table_0003_tore_hand,table_0002_dog,table_0001_boel_hand
,table_0000_granddad_hand);
	table.x=100;
	table.y=80;
	table.alpha=0.0;
	table.scaleX=table.scaleY=1.0;
	
	table_0007_granddad.addEventListener("mousedown", handleTable_0007_granddadTouch);
	table_0006_boel.addEventListener("mousedown", handleTable_0006_boelTouch);
	table_0005_tore.addEventListener("mousedown", handleTable_0005_toreTouch);
	table_0002_dog.addEventListener("mousedown", handleTable_0002_dogTouch);
	
	
	stage.addChild(table);
	
}


function addCake(cakeparts,cakepieces,cakefiles) {
	
	cake = new createjs.Container();
	
	//alltså, behöver en cake som är en multidimensionell array, som dels består av alla bitar och varje bit av 5? delar
	//första index är bit, andra index är del. 
	
	
	
	//bättre göra varje bit till en container istället för hela tårtan väl...
	var k=0;
	for (var i=0;i<cakepieces;i++) {
		var onePiece=new Array(); 
		for (var j=0;j<cakeparts.length+1;j++) { //+1 because cake_outsidelines doubled
			var part=new createjs.Bitmap(queue.getResult(cakefiles[k]["id"]));
			k++;
			part.number=i; //first piece has number 0
			onePiece.push(part);
			if (j==3 || j==4) {
				part.visible=false;
			}
		}
		cakeComplete.push(onePiece);
		cakeStatus.push(true); //visible, or actually visible in cake
		
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
		for (var i=0;i<cakeComplete.length;i++) {
			moveCakePiece(i,0,0);
		}
		createjs.Tween.get(cake).to({x:cake.xStart, y: cake.yStart, scaleX:cake.scaleStart, scaleY:cake.scaleStart}, 400, createjs.Ease.linear);
		createjs.Tween.get(table).to({alpha:0.0}, 400, createjs.Ease.linear);
		createjs.Tween.get(boelstart).to({alpha:1.0}, 400, createjs.Ease.linear);
		cake.focus=false;
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


function buildcakefiles(cakeparts,cakepieces) {	
	var cakefiles=new Array(); //((cakeparts.length+1)*cakepieces); //+1 because cake_outsidelines doubled
	var shared=cakeparts[cakeparts.length-1];
	var k=0;
	for (var i=1;i<cakepieces+1;i++) {
		for (var j=0;j<cakeparts.length-1;j++) {
			cakefiles.push({id:cakeparts[j]+i, src:"assets/"+cakeparts[j]+i+".png"});
			k++;
		}
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
	if (cake.focus) {
		var piece=cakeComplete[piecenumber];
	
		if (x!=0 || y!=0) {
			for (var j=0;j<piece.length;j++) {
				createjs.Tween.get(piece[j]).to({x:x, y:y}, 200, createjs.Ease.linear);

				//piece[j].x=x;
				//piece[j].y=y;
				cakeStatus[piecenumber]=false;
			}
		} else {
			for (var j=0;j<piece.length;j++) {
				piece[j].x=0;
				piece[j].y=0;
				cakeStatus[piecenumber]=true;
			}
		}
		var movedPieces=0;
		for (var k=0;k<cakeStatus.length;k++) {
			//om bit är på plats men nästa bit ej på plats: visa skiljelinje
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
			
			if (!cakeStatus[k]) {	
				//flyttad bit
				movedPieces++;
				cakeComplete[k][3].visible=true;
				cakeComplete[k][4].visible=true;
			}
		
		}
		
		//xxx tillfällig klumpig konstruktion
		for (var i=0;i<numbers.length;i++) {
			numbers[i].visible=false;
		}
		if (movedPieces>0 && (x!=0 || y!=0)) {
			numbers[movedPieces].visible=true;
			createjs.Sound.play(cakepiecesound[movedPieces]);
		}
	}
}
