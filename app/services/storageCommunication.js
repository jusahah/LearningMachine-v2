var request = require('request');
var Promise = require('bluebird');
var env     = require('../appEnv');

// Get server api address from enviroment file!

module.exports = function(Box) {

	var currentAccessData = {};

	Box.Application.addService('storageCommunication', function(application) {
		// To load new server API keys or disk folder paths or etc...
		var updateStorageAccessInfo = function(accessData) {
			
			// Validate accessData here first

			currentAccessData = Object.assign({}, accessData);

		}

		var newScreenshot = function(data, screenshotFile) {

			// Pretend we send file to server or disk here
			return new Promise(function(resolve, reject) {
				setTimeout(function() {
					resolve(201); // Fake 201 Created response code
				}, 500 + Math.random()*1500);
			});
		}

		var newTextnote = function(textData) {
			// Pretend we send text data to server or disk here
			return new Promise(function(resolve, reject) {
				setTimeout(function() {
					console.log("Fake sending to URL: " + env.SERVER_URL);
					resolve(201); // Fake 201 Created response code
				}, 500 + Math.random()*1500);
			});			
		}

	    return {

	        newScreenshot: newScreenshot,
	        newTextnote: newTextnote,
	        updateStorageAccessInfo: updateStorageAccessInfo

	    };
	});


}