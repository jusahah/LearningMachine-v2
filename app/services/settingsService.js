
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

		var apiKeyUpdated = function(apiKey) {
			var pcService = application.getService('processCommunication');

			pcService.sendToBackgroundProcessNoResponse({
				type: 'newApiKey',
				data: apiKey
			}).then(function(confirmedKeys) {
				console.log(confirmedKeys);
			});

		}

	    return {

	    	newKeyCombos: newKeyCombos,
	    	getCurrentKeyCombos: getCurrentKeyCombos,
	    	getApiKey: getApiKey,
	    	apiKeyUpdated: apiKeyUpdated
	    };
	});


}
