//coordinates:
//bimaps and Sprites seem to get an original location at (0,0), with the upper left point as the reference
//Shapes get an original position defined by the first two parameters of drawRect(-128,-128,256,256), with the upper left
//corner as the reference. When bitmaps and shapes are moved by changing x and y, by this is considered a transform, 
//and they still keep their original coordinates. globalTolocal and localToglobal can be used to change between systems. 
//The reference point can also be changed by changing regX and regY.
	
var debug=true;

//variable definitions
var canvas;
var stage;
var background;
var queue;
var offset;
var update = true;

var dad,dog,boel,cake;


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
		
	debugText = new createjs.Text("", "10px Helvetica", "#000");
	stage.addChild(debugText);
	debugText.x=20;
	debugText.y=20;
	debugText.text="";
	
	//loading assets
	queue=new createjs.LoadQueue(false);
	queue.installPlugin(createjs.Sound);
	queue.addEventListener("complete",handleComplete);
	queue.addEventListener("error", handleFileError);
	queue.addEventListener("fileload", handleFileLoad);
	//weird: seems like no space is allowed before | in src:"assets/bark.mp3| assets/bark.ogg
	var files=[{id:"boel", src:"assets/boel.png"},{id:"dad", src:"assets/dad.png"},{id:"cake", src:"assets/cake.png"},{id:"dog", src:"assets/dog.png"},{id:"button", src:"assets/button.png"},{id:"daisy", src:"assets/daisy.png"},{id:"dogs", src:"assets/dogsprites.png"}];
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
		debugText.text=debugText.text.substring(debugText.text.length-140,debugText.text.length);		
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
		div.innerHTML = "Some resources were not loaded";
	}

	//addDaisy();
	//createjs.Tween.get(daisy).to({alpha:0.5, y: daisy.y + 300}, 4000, createjs.Ease.linear);

	addDog();

	addBoel();
	
	addDad();
	
	addCake();
	
	addButton();

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

function handleDogTouch(event) {
	restoreDad();
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

function handleDadTouch(event) {
	restoreDog();
	restoreCake();
	createjs.Tween.get(dad).to({x:canvas.width/2+200, y: canvas.height/2, scaleX:1.0, scaleY:1.0}, 400, createjs.Ease.linear);
	
	startChangeCanvasColor=true;
	finishedChangeCanvasColor=false;
	rCanvasNew=255;
	gCanvasNew=255;
	bCanvasNew=0;

	dad.focus=true;
	update=true;
}

function handleCakeTouch(event) {
	restoreDog();
	restoreDad();
	createjs.Tween.get(cake).to({x:canvas.width/2+100, y: canvas.height/2, scaleX:1.0, scaleY:1.0}, 400, createjs.Ease.linear);
	
	startChangeCanvasColor=true;
	finishedChangeCanvasColor=false;
	rCanvasNew=255;
	gCanvasNew=149;
	bCanvasNew=203;

	cake.focus=true;
	update=true;
}


function handleButtonTouch(event) {
	restoreDog();
	restoreDad();
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

function addDad() {
	dad=new createjs.Bitmap(queue.getResult("dad"));
	stage.addChild(dad);
	dad.scaleStart=0.25;
	dad.scaleX = dad.scaleY = dad.scale = dad.scaleStart;

	dad.xStart=canvas.width-dad.scale*dad.image.width/2-20;
	dad.yStart=dad.scale*dad.image.height/2+20;
	dad.x = dad.xStart;
	dad.y = dad.yStart;
	dad.rotation = 0;
	dad.regX = dad.image.width/2;
	dad.regY = dad.image.height/2;
	dad.name = "Pappa";
	
	dad.focus=false;
	dad.addEventListener("mousedown", handleDadTouch);

}

function restoreDad() {
	if (dad.focus) {
		createjs.Tween.get(dad).to({x:dad.xStart, y: dad.yStart, scaleX:dad.scaleStart, scaleY:dad.scaleStart}, 400, createjs.Ease.linear);
		dad.focus=false;
	}
}

function addCake() {
	cake=new createjs.Bitmap(queue.getResult("cake"));
	stage.addChild(cake);
	cake.scaleStart=0.25;
	cake.scaleX = cake.scaleY = cake.scale = cake.scaleStart;
	cake.xStart=cake.scale*cake.image.width/2+20;
	cake.yStart=cake.scale*cake.image.height/2+20;
	cake.x = cake.xStart;
	cake.y = cake.yStart;
	cake.rotation = 0;
	cake.regX = cake.image.width/2;
	cake.regY = cake.image.height/2;
	cake.name = "Tårta";
	cake.focus=false;
	cake.addEventListener("mousedown", handleCakeTouch);


}

function restoreCake() {
	if (cake.focus) {
		createjs.Tween.get(cake).to({x:cake.xStart, y: cake.yStart, scaleX:cake.scaleStart, scaleY:cake.scaleStart}, 400, createjs.Ease.linear);
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
