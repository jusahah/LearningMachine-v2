var request = require('request');
var Promise = require('bluebird');
var env     = require('../appEnv');

// Get server api address from enviroment file!

module.exports = function(Box) {

	var currentAccessData = {};
	var currentMetaData = null;

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
			console.warn("Storaging new text note!!");
			console.log(textData);
			return application.getService('settingsService').getApiKey()
			.then(function(apiKey) {
				return new Promise(function(resolve, reject) {
					var options = {
						url: env.API_URL + "newtext",
						method: 'POST',
						headers: {
							'X-Authorization': apiKey
						},
						form: {
							name: textData.nimi,
							category_id: textData.kategoria,
							summary: textData.teksti,
							note: textData.teksti,
							tags: textData.tagit
						}

					};					
					request(options, function(err, response, body) {
						if (err || response.statusCode !== 200) {
							console.error("New text note req rejected");
							return reject(err);
						}
						console.log("Text item went to server???");
						console.log(body);
						return resolve();

					})

				});				

			});
			/*
			.then(function(apiKey) {
				return new Promise(function(resolve, reject) {
					var options = {
						url: env.API_URL + "s3key",
						headers: {
							'X-Authorization': apiKey
						}

					};					
					request(options, function(err, response, body) {
						if (err || response.statusCode !== 200) {
							console.error("S3 key req rejected");
							return reject(err);
						}
						console.log("Response to S3 key req");
						console.log(JSON.parse(body));
						return resolve(JSON.parse(body).s3key);

					})

				});				

			})
			.then(function(s3key) {
				if (!s3key || s3key.trim() === '' || s3key.length < 24) throw "Amazon S3 key invalid";
				// Save to S3 instance
				return 
			})		
*/	
		}

		var newUrlimage = function(data, imageFile) {
			// Pretend we send image and data to server or disk here
			return new Promise(function(resolve, reject) {
				setTimeout(function() {
					console.log("Fake sending to URL: " + env.SERVER_URL);
					resolve(201); // Fake 201 Created response code
				}, 500 + Math.random()*1500);
			});					
		}

		var newImageFromDisk = function(data, imageFile) {
			// Pretend we send image and data to server or disk here
			return new Promise(function(resolve, reject) {
				setTimeout(function() {
					console.log("Fake sending to URL: " + env.SERVER_URL);
					resolve(201); // Fake 201 Created response code
				}, 500 + Math.random()*1500);
			});			
		}

		var downloadMetaData = function() {
			return application.getService('settingsService').getApiKey()
				.then(function(apiKey) {
					var options = {
						url: env.API_URL + "metadata",
						headers: {
							'X-Authorization': apiKey
						}

					};
					console.warn("Sending metadata request");
					console.log(options);
					return new Promise(function(resolve, reject) {
						request(options, function(err, response, body) {
							if (err || response.statusCode !== 200) {
								console.error("Metadata req rejected");
								return reject(err);
							}
							console.log("Response to metadata req");
							console.log(JSON.parse(body));
							return resolve(JSON.parse(body));

						})

					});
			});

		}

		var getMetaData = function(syncServer) {
			// Use current access data to make fetch request either to server or disk
			// For now we fake this
			var metaPromise;
			if (syncServer) {
				metaPromise = downloadMetaData();
			} else {
				metaPromise = Promise.resolve(currentMetaData);
			}

			return metaPromise.tap(function(metaData) {
				// Save locally here
				currentMetaData = metaData;
				// Send to background so it can use this when opening note creation windows
				// (those windows need to know what categories there are for user to select one)
				var pcService = application.getService('processCommunication');
				pcService.sendToBackgroundProcessNoResponse({
					type: 'categoryTreeData',
					data: metaData.categories
				});

			});
		}

	    return {
	    	newImageFromDisk: newImageFromDisk,
	        newScreenshot: newScreenshot,
	        newTextnote: newTextnote,
	        newUrlimage: newUrlimage,
	        updateStorageAccessInfo: updateStorageAccessInfo,
	        getMetaData: getMetaData

	    };
	});


}