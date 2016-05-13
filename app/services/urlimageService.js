var request = require('request');
var fs = require('fs');
var uuid = require('node-uuid');


module.exports = function(Box, tempFolder) {
	Box.Application.addService('urlimageService', function(application) {

		var currentlyTakingScreenshot = false;

	    // private methods here

	    var checkImageType = function(imageType) {

	    	var legalTypes = ['jpg', 'jpeg', 'png'];

	    	if (legalTypes.indexOf(imageType) === -1) throw "Unsupported image type";

	    }

	    var goFetchImageFromInternet = function(url) {

	    	var parts = url.split('.');

	    	if (parts.length < 2) throw "Invalid image url";
	    	var imageType = parts[parts.length-1];

	    	checkImageType(imageType);

			var tempFileName = uuid.v1();
			var tempFilePath = tempFolder + "/" + tempFileName + "." + imageType;
			console.log("Going to fetch from the nets into: " + tempFilePath);
	    	return request(url).pipe(fs.createWriteStream(tempFilePath));
	    }

	    var take = function() {
	        console.log("urlimage requested in T3 service!");

	        var pcService = application.getService('processCommunication');
	        pcService.sendToBackgroundProcess({
					type: 'askUser',
					openFor: 'urlimage'
			}).then(function(urlimageData) {
				// Data has been validated in the textnote window
				console.log("Text note data back to urlimageService");
				console.log(urlimageData);
				return [urlimageData, goFetchImageFromInternet(urlimageData.kuvaurl)];
			}).spread(function(imagedata, tempFile) {
				var scService = application.getService('storageCommunication');
				return scService.newUrlimage(imagedata, tempFile);				
			}).then(function(storageSuccess) {
				console.log("Storage was successful? " + storageSuccess);
			});
    	
	    }

	    return {

	        take: take

	    };
	});


}
