Boel och Tore
====

An html5 canvas game with createjs as game engine. Based on the Boel and Tore characters by Helena Davidsson Neppelberg. Developed in cooperation with Landskrona vision and Prosper development. 

##Successfully tested on the following platforms

- Safari MacOS, iOS
- Firefox MaxOS, Win7, 
- Chrome MaxOS, Win7, iOS, Android 4.3+
- IE11 Win7

##Known issues

- Media player or the Media pack must be installed on Windows, ohterwise sounds won't play
- A fix for Firefox is needed to force firefox to load ogg instead of mp3. 
- The files must be loaded from a server, not from the filesystem, otherwise there will be a  XMLHttpRequest cannot load file error (file:///Users/k3bope/Sites/djallo/boel150226/WebAudioPluginTest.fail. Cross origin requests are only supported for protocol schemes: http, data, chrome, chrome-extension, https, chrome-extension-resource.soundjs-0.6.0.min.js:18 c._isFileXHRSupported). This is hopefully not a problem for a sandboxed webview. See more at <http://stackoverflow.com/questions/21012385/error-in-chrome-only-xmlhttprequest-cannot-load-file-url-no-access-control-all>. 
- Drawing on the canvas in the clothes game sometimes stops working after rapid tapping on Android devices. A solution is being developed
- Files won't load properly on Android devices with less than 1 GB RAM. 