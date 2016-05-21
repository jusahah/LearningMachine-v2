var request = require('request');
var Promise = require('bluebird');
var env     = require('../appEnv');
var fs      = require('fs');

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

		var getNewFileKeyForS3 = function(apiKey) {

			return new Promise(function(resolve, reject) {
				var options = {
					url: env.API_URL + "s3key",
					method: 'GET',
					headers: {
						'X-Authorization': apiKey
					}
				};					
				request(options, function(err, response, body) {
					if (err || response.statusCode !== 200) {
						return reject(err);
					}
					console.log("S3 key back from server");
					console.log(body);
					return resolve(JSON.parse(body).s3key);

				})

			});					
		}

		var sendFileToS3 = function(s3BaseUrl, fileKey, file) {
			console.warn("S3 send data");
			console.log(s3BaseUrl);
			console.log(fileKey);
			console.log(file);
			return new Promise(function(resolve, reject) {
				var formData = {
				  key: fileKey,
				  file: fs.createReadStream(file)
				};

				request.post({
					url:s3BaseUrl, 
					formData: formData
				}, function optionalCallback(err, httpResponse, body) {
					console.log(httpResponse);
					console.log(body);
				  if (err) {
				  	console.error(err);
				    return reject(err)

				  }
				  return resolve();
				});
			});

			// Fake for now
		}

		var sendImageMetaDataToLaravel = function(apiKey, imageData, fileKey) {
			console.log("Sending to laravel image data");

			return new Promise(function(resolve, reject) {
				console.log("Promise runs!");
				var options = {
					url: env.API_URL + "newimage",
					method: 'POST',
					headers: {
						'X-Authorization': apiKey
					},
					form: {
			            name: imageData.nimi,
			            summary: imageData.teksti,
			            category_id: imageData.kategoria,
			            tags: imageData.tagit,
			            filekey: fileKey,
			            thumbnail: imageData.thumbnail
					}

				};				
				console.log("Täällä taas 1")
				// We need a timeout here!
				// There is some technical issue with request library 
				// that needs to yield control to runtime before making this call
				setTimeout(function() {
					console.log("Timeout runs");
					request(options, function(err, response, body) {
						console.log("Täällä taas 2");
						if (err || response.statusCode !== 200) {
							console.error("New image req rejected");
							console.log(body);
							return reject(err);
						}
						console.log("Image item went to server???");
						console.log(body);
						return resolve(true);

					});					
				}, 0);	


			});	

			console.log("Reached here");			
		}

		var newScreenshot = function(data, screenshotFile) {
			var apiKeyProm = application.getService('settingsService').getApiKey();
			var s3UrlProm  = application.getService('settingsService').getS3Url();
			var s3FileKey  = application.getService('settingsService').getS3Url();

			return Promise.all([apiKeyProm, s3UrlProm])
			.spread(function(apiKey, s3BaseUrl) {
				console.log("Getting file key from server api with key: " + apiKey);
				return [apiKey, s3BaseUrl, getNewFileKeyForS3(apiKey)];
			})
			.spread(function(apiKey, s3BaseUrl, fileKey) {
				console.warn("SCREENSHOT REQUEST TO S3 STARTING");
				console.log(apiKey + " | " + s3BaseUrl + " | " + fileKey);
				return [apiKey, fileKey, sendFileToS3(s3BaseUrl, fileKey, screenshotFile)];			
			})
			.spread(function(apiKey, fileKey, s3Result) {
				console.log("Screenshot request to laravel starting");
				return sendImageMetaDataToLaravel(apiKey, data, fileKey);
			})
			.then(function(res) {
				console.warn("DONE ALL!");
			})
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
				pcService.sendToBackgroundProcessNoResponse({
					type: 's3BaseUrl',
					data: metaData.s3BaseUrl
				});

			});
		}

		var validateApiKey = function(apiKey) {
			var options = {
				url: env.API_URL + "checkkey/" + apiKey,
			};

			return new Promise(function(resolve, reject) {
				request(options, function(err, response, body) {
					if (err || response.statusCode !== 200) {
						console.error("Check key req rejected");
						return reject(err);
					}
					console.log("Response to checkkey req");
					console.log(JSON.parse(body));
					return resolve(JSON.parse(body).result);

				})

			});			
		}

	    return {
	    	newImageFromDisk: newImageFromDisk,
	        newScreenshot: newScreenshot,
	        newTextnote: newTextnote,
	        newUrlimage: newUrlimage,
	        updateStorageAccessInfo: updateStorageAccessInfo,
	        getMetaData: getMetaData,
	        validateApiKey: validateApiKey

	    };
	});


}