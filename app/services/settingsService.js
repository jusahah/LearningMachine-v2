
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

	    return {

	    	newKeyCombos: newKeyCombos,
	    	getCurrentKeyCombos: getCurrentKeyCombos
	    };
	});


}
