var fs = require('fs');
var Jimp = require("jimp"); // For testing
var Promise = require('bluebird');

module.exports = function(Box) {
	Box.Application.addService('thumbnailService', function(application) {

	    // private methods here

	    var toThumbnail = function(filePath) {
	    	return new Promise(function(resolve, reject) {
				Jimp.read(filePath, function (err, pic) {
				    if (err) return reject(err);
				    pic.resize(128, 128)            // resize
				         .quality(90)                 // set JPEG quality
				         .getBuffer(Jimp.MIME_JPEG, function(err, buffer) {
				         	if (err) return reject(err);
				         	console.log("Jpg buffer");
				         	var base64String = buffer.toString('base64');
				         	console.log(base64String);
				         	return resolve(base64String);
				    })
				        
				});

	    	})


		}

	    return {

	        toThumbnail: toThumbnail

	    };
	});


}

