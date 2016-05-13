var request = require('request');
var fs = require('fs');
var uuid = require('node-uuid');


module.exports = function(Box, tempFolder) {
	Box.Application.addService('uploadimageService', function(application) {

		var currentlyTakingScreenshot = false;

	    // private methods here

	    var checkImageType = function(imageType) {

	    	var legalTypes = ['jpg', 'jpeg', 'png'];

	    	if (legalTypes.indexOf(imageType) === -1) throw "Unsupported image type";

	    }



	    var uploadToTemp = function(imagePath) {
	    	var parts = imagePath.split('.');

	    	if (parts.length < 2) throw "Invalid image path (from disk)";
	    	var imageType = parts[parts.length-1];

			var tempFileName = uuid.v1();
			var tempFilePath = tempFolder + "/" + tempFileName + "." + imageType;

			return new Promise(function(resolve, reject) {
		        fs.readFile(imagePath, function (err, data) {
				    if (err) throw err;
				    fs.writeFile(tempFilePath, data, function (err) {
				        if (err) throw err;
				        console.log('It\'s saved!');
				        resolve(tempFilePath);
				    });
				});				
			})



	    }

	    var uploadFromDiskRequest = function(filePath) {
	        console.log("uploadimage requested in T3 service!");



	        var pcService = application.getService('processCommunication');
	        pcService.sendToBackgroundProcess({
					type: 'askUser',
					openFor: 'uploadimage'
			}).then(function(additionalData) {
					console.log("ADDITIONAL DATA BACK FROM BG");
					// Additionadata contains now imagepath for the image user chose to be uploaded
					console.log(additionalData);
					return [additionalData, uploadToTemp(additionalData.imagepath)];
			}).spread(function(additionalData, tempFilePath) {
					
					// Additionadata contains not filePath for the image user chose to be uploaded
					console.log("Temp file path for image uploaded from disk: " + tempFilePath);
					var scService = application.getService('storageCommunication');
					return scService.newImageFromDisk(additionalData, tempFilePath);
			}).then(function(storageSuccess) {
					console.warn("TO SERVER SAVE RESULT: " + storageSuccess);
			});

    	
	    }

	    return {

	        uploadFromDiskRequest: uploadFromDiskRequest

	    };
	});


}
