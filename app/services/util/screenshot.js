var shell = require("shelljs");
var shellglobal = require('shelljs/global');
var uuid = require('node-uuid');
var fs = require('fs');

module.exports = function(Box, tempFolder) {
	Box.Application.addService('screenshotService', function(application) {

		var currentlyTakingScreenshot = false;

	    // private methods here

	    var take = function() {
	        console.log("Screenshot requested in T3 service!");
	        if (currentlyTakingScreenshot) return;
			console.log("Taking screenshot");
			currentlyTakingScreenshot = true;

			// Generate unique identifier from temp file name 
			var tempFileName = uuid.v1();
			var tempFilePath = tempFolder + "/" + tempFileName + ".jpg";

		    shell.exec("gnome-screenshot -w -f " + tempFilePath, function(){
		    	currentlyTakingScreenshot = false;
		    	console.log("Screenshot saved to temp file: " + tempFilePath);
		    	// Broadcast for fun etc. Nobody actually should need this
		    	Box.Application.broadcast('screenshotready', {tempFile: tempFilePath});

		    	// Show screenshot to user and ask him to fill additional details
				// For this we need another process to spawn new window tho
				var pcService = application.getService('processCommunication');
				pcService.sendToBackgroundProcess({
					type: 'askUser',
					openFor: 'screenshot', 
					tempFile: tempFilePath,

				}).then(function(additionalData) {
					console.log("ADDITIONAL DATA BACK FROM BG");
					console.log(additionalData);
					var scService = application.getService('storageCommunication');
					return scService.newScreenshot(additionalData, tempFilePath);
				}).then(function(storageSuccess) {
					console.warn("TO SERVER SAVE RESULT: " + storageSuccess);
				});




		    });






	        	
	    }

	    return {

	        take: take

	    };
	});


}

