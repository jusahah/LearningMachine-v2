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

		var getCategoryTree = function() {
			// Use current access data to make fetch request either to server or disk
			// For now we fake this
			return new Promise(function(resolve, reject) {
				setTimeout(function() {
					resolve({
						fetchedTimestamp: Date.now(),
						tree: [
							{
								name: 'PHP' + Math.floor(Math.random()*10000),
								id: 'phpr72nME835jaj3OOPS8393',
								color: '#11eeaa',
								children: [
									{
										name: 'Laravel',
										id: 'laravel835jaj3OOPS8393',
										color: '#11ffee',								
									},
									{
										name: 'Codeigniter',
										id: 'ci835jaj3OOPS8393',
										color: '#44ffdd',								
									},
								]
							},
							{
								name: 'Javascript',
								id: 'javascript835jaj3OOPS8393',
								color: '#ee22cc',	
								children: null							
							}					

						]
					})
				}, 100 + Math.random()*500);
			}).tap(function(categoryTreeData) {
				// Send to background so it can use this when opening note creation windows
				// (those windows need to know what categories there are for user to select one)
				var pcService = application.getService('processCommunication');
				pcService.sendToBackgroundProcessNoResponse({
					type: 'categoryTreeData',
					data: categoryTreeData
				});

			});
		}

	    return {
	    	newImageFromDisk: newImageFromDisk,
	        newScreenshot: newScreenshot,
	        newTextnote: newTextnote,
	        newUrlimage: newUrlimage,
	        updateStorageAccessInfo: updateStorageAccessInfo,
	        getCategoryTree: getCategoryTree

	    };
	});


}