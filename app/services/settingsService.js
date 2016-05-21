
module.exports = function(Box, tempFolder) {
	Box.Application.addService('settingsService', function(application) {

		var newKeyCombos = function(keys) {
			var pcService = application.getService('processCommunication');

			pcService.sendToBackgroundProcessNoResponse({
				type: 'newKeys',
				data: keys
			}).then(function(confirmedKeys) {
				console.log(confirmedKeys);
			});

		}

		// REFACTOR Abstract these three into common method later!!!
		var getCurrentKeyCombos = function() {
			var pcService = application.getService('processCommunication');
			return pcService.sendToBackgroundProcess({
				type: 'needData'
			}).then(function(appData) {
				console.log(appData);
				return appData.keyCombos;
			});
		}

		var getApiKey = function() {
			var pcService = application.getService('processCommunication');
			return pcService.sendToBackgroundProcess({
				type: 'needData'
			}).then(function(appData) {
				console.log(appData);
				return appData.apiKey;
			});
		}

		var getS3Url = function() {
			var pcService = application.getService('processCommunication');
			return pcService.sendToBackgroundProcess({
				type: 'needData'
			}).then(function(appData) {
				console.log(appData);
				return appData.s3BaseUrl;
			});			
		}
		// REFACTOR_END

		var apiKeyUpdated = function(apiKey) {
			// Validate on server
			return application.getService('storageCommunication').validateApiKey(apiKey)
			.tap(function(validationResult) {

				if (!validationResult) {
					return false;
				}
				var pcService = application.getService('processCommunication');

				pcService.sendToBackgroundProcessNoResponse({
					type: 'newApiKey',
					data: apiKey
				}).then(function(confirmedKeys) {
					console.log(confirmedKeys);
				});	
			}).catch(function(err) {
				alert(err);
			});


		}

	    return {

	    	newKeyCombos: newKeyCombos,
	    	getCurrentKeyCombos: getCurrentKeyCombos,
	    	getApiKey: getApiKey,
	    	apiKeyUpdated: apiKeyUpdated,
	    	getS3Url: getS3Url
	    };
	});


}
