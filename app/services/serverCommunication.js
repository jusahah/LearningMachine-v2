var request = require('request');

module.exports = function(Box, tempFolder) {
	var idsToResolves = {};

	Box.Application.addService('processCommunication', function(application) {

		// Register listening service for incoming msgs from background
		ipcRenderer.on('msg', function(event, arg) {
			console.log("Incoming msg to processCommunication service");

			// check if it has resolve stashed
			var msgID = arg.msgID;
			if (!idsToResolves.hasOwnProperty(msgID)) {
				// Probably error
				console.error('Error? Process communication received msg with no resolve stashed: ' + msgID);
				return; // Just return
			}

			// Call resolve with arg
			idsToResolves[msgID](arg.data);

		});

		var saveResolve = function(resolveFun, msgID) {
			idsToResolves[msgID] = resolveFun;
		}

		var sendToBackgroundProcess = function(msg) {
			msg.msgID = uuid.v4(); // Random msg identifier
			ipcRenderer.send('msg', msg);

			return new Promise(function(resolve, reject) {
				// Basically here we just stash resolve so we can
				// call it when results come back;
				// Also consider doing some timeout/race stuff in case background never answers back
				saveResolve(resolve, msg.msgID);
			});

		}

	    return {

	        sendToBackgroundProcess: sendToBackgroundProcess

	    };
	});


}