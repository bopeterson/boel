// JavaScript Document
function init() {
	var canvas = document.getElementById("myCanvas");
	canvas.style.backgroundColor = "red";
	canvas.style.height="500px";
	setTimeout(screenSize,1000);
	setTimeout(screenSize,2000);
	setTimeout(screenSize,3000);
}

function screenSize() {
	
	
	alert(">>>"+window.innerWidth+" "+window.innerHeight+" "+screen.width+" "+screen.height+" "+screen.availWidth+" "+screen.availHeight+" "+window.outerWidth+" "+window.outerHeight+" "+navigator.userAgent);
}