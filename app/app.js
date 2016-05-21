// Here is the starting point for your application code.
// All stuff below is just to show you how it works. You can delete all of it.

// Use new ES6 modules syntax for everything.
import os from 'os'; // native node.js module
import { remote } from 'electron'; // native electron module
import jetpack from 'fs-jetpack'; // module loaded from npm
import { greet } from './hello_world/hello_world'; // code authored by you in this project
import env from './env';

require('handlebars');
var request = require('request');
var fs = require('fs');
var Jimp = require("jimp"); // For testing

console.log('Loaded environment variables:', env);

var app = remote.app;
var appDir = jetpack.cwd(app.getAppPath());

// Holy crap! This is browser window with HTML and stuff, but I can read
// here files like it is node.js! Welcome to Electron world :)
console.log('The author of this app is:', appDir.read('package.json', 'json').author);

// SERVICES REGISTRATION
// Args: Box, path_to_the_temporary_file_folder
// CHANGE FOR PRODUCTION THE FOLDER PATH!
require('./services/util/thumbnail')(Box); // Screenshotting API for view modules
require('./services/util/screenshot')(Box, app.getAppPath()); // Screenshotting API for view modules
require('./services/urlimageService')(Box, app.getAppPath()); // URL image taking/creation API for view modules
require('./services/uploadimageService')(Box, app.getAppPath()); // URL image taking/creation API for view modules
require('./services/textnoteService')(Box); // Textnote creation API for view modules
require('./services/settingsService')(Box); // Communication API with background process
require('./services/processCommunication')(Box); // Communication API with background process
require('./services/storageCommunication')(Box); // Communication API with note-storage layer

// VIEW MODULES REGISTRATION
// Send Box in so view modules can bind themselves into it
require('./views/viewmodules/menu/menu')(Box);
require('./views/viewmodules/screenshot/screenshot')(Box);
require('./views/viewmodules/urlimage/urlimage')(Box);
require('./views/viewmodules/uploadimage/uploadimage')(Box);
require('./views/viewmodules/textnote/textnote')(Box);
require('./views/viewmodules/errors/errors')(Box);
require('./views/viewmodules/keys/keys')(Box);
require('./views/viewmodules/serversettings/serversettings')(Box);
require('./views/viewmodules/categorytree/categorytree')(Box);

// THIS ENDS THE INITIALIZATION/LOADING PHASE AND KICKS THE APPLICATION 
// TO ITS RUNTIME STATE
setTimeout(function() {
	Box.Application.init({
		debug: true
	});
	Box.Application.broadcast('appStarts', null);
	// Show the app
	$('#appScreen').show();
	//git stestThumbnail();
}, 300);



//setTimeout(testUploadToAWS, 1100);
// WORKS LIKE FUCK!!!!
function testUploadToAWS() {

	console.log(app.getAppPath());
	var formData = {
	  key: 'appenv.js',
	  file: fs.createReadStream(app.getAppPath() + '/appEnv.js')
	};

	request.post({
		url:'http://[buckethere].s3.eu-central-1.amazonaws.com', 
		formData: formData
	}, function optionalCallback(err, httpResponse, body) {
		console.log(httpResponse);
		console.log(body);
	  if (err) {
	    return console.error('upload failed:', err);
	  }
	  console.log('Upload successful!  Server responded with:', body);
	  setTimeout(testGET, 4500);
	});

}

function testGET() {

	request('http://[buckethere].s3.eu-central-1.amazonaws.com/appenv.js', function (error, response, body) {
	    if (!error && response.statusCode == 200) {
	        console.log(body); // Show the HTML for the Modulus homepage.
	    }
	});
}


function testThumbnail() {


	console.log("Test png path: " + app.getPath("pictures") + "/testscreenshot.png");
// open a file called "lenna.png"
	Jimp.read(app.getPath("pictures") + "/soitot_ti.png", function (err, kehitysPng) {
	    if (err) throw err;
	    kehitysPng.resize(128, 128)            // resize
	         .quality(90)                 // set JPEG quality
	         .getBuffer(Jimp.MIME_JPEG, function(err, buffer) {
	         	console.log("Jpg buffer");
	         	var base64String = buffer.toString('base64');
	         	console.log(base64String);
	         	console.log(base64String.length)
	         })
	        
	});
}


