module.exports = function(Box, tempFolder) {
	Box.Application.addService('textnoteService', function(application) {

		var currentlyTakingScreenshot = false;

	    // private methods here

	    var openTextnoteForm = function() {
	        console.log("textnote requested in T3 service!");

	        var pcService = application.getService('processCommunication');
	        pcService.sendToBackgroundProcess({
					type: 'askUser',
					openFor: 'textnote'
			}).then(function(textnoteData) {
				// Data has been validated in the textnote window
				console.log("Text note data back to textnoteService");
				console.log(textnoteData);

				var scService = application.getService('storageCommunication');
				return scService.newTextnote(textnoteData);
			}).then(function(storageSuccess) {
				console.log("Text note save was: " + storageSuccess);
			});




		  






	        	
	    }

	    return {

	        openTextnoteForm: openTextnoteForm

	    };
	});


}
