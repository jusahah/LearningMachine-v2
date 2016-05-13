var dialog = require('electron').remote.dialog;

module.exports = function(Box) {

	Box.Application.addModule('uploadimage', function(context) {
		var moduleName = 'uploadimage'; // Save here for easier copypaste of code between modules
		console.log("INITING uploadimage VIEW MODULE");
		var isHidden = true; // Keeps local state whether DOM element is visible or not
		var $el = $(context.getElement()); // Link to DOM element

		// Private stuff
		var deactivate = function() {
			if (!isHidden) {
				isHidden = true;
				$el.hide();
			}
		}

		var activate = function() {
			// hide right away in case we are reactivating view that is currently visible
			$el.hide();
			isHidden = false;

			var viewDataPromise = Promise.resolve();

			viewDataPromise.then(function(viewData) {
				if (isHidden) return; // User already switched to another view			

				//viewDataCached = viewData;

				//var dataObj = context.getService('derivedData').easify(viewData);			
				// viewData is always object with transforNames being keys and data being values
				console.warn("uploadimage coming into view!");
				$('#globalLoadingBanner').hide();
				//$el.find('#signalstable_body').empty().append(buildHTML(viewData.signalsTable));
				//$el.empty().append("<h3>" + JSON.stringify(viewData) + "</h3>");
				$el.show();
			});
			
		}

		var takeuploadimage = function() {

			context.getService('uploadimageService').uploadFromDiskRequest();
			/*
			var fileNames = dialog.showOpenDialog({
				filters: [
					{
						name: 'Images',
						extensions: ['jpg', 'jpeg', 'png']
					}
				],
				properties: ['openFile']
			});

			console.log(fileNames);



			if (fileNames && fileNames.length > 0) {
				// Now that we have a file name from UI dialog the responsibility shifts to service
				
			}
			*/
			

			
		}

		var uploadimageHasBeenSavedToTemp = function(tempFile) {
			console.log("uploadimage saved received in uploadimage view module: " + tempFile);

		}
		

		// Public API
		return {
			messages: ['routechanged'],
			onclick: function(event, element, elementType) {
				console.log("CLICK IN uploadimage: " + elementType);

				if (elementType === 'takeuploadimage') {
					takeuploadimage();
				}


			},
			onmessage: function(name, data) {
				console.log("MSG IN uploadimage: " + name + " | " + data.route);
				if (name === 'routechanged') {
					if (data.route === moduleName) {
						activate();
					} else {
						deactivate();
					}						
				} else if (name === 'uploadimageready') {
					uploadimageHasBeenSavedToTemp(data.tempFile);
				}
			
				
			}


		};

	});

}