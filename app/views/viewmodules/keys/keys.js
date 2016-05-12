module.exports = function(Box) {

	Box.Application.addModule('keys', function(context) {
		var moduleName = 'keys'; // Save here for easier copypaste of code between modules
		console.log("INITING keys VIEW MODULE");
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
				console.warn("keys coming into view!");
				$('#globalLoadingBanner').hide();
				//$el.find('#signalstable_body').empty().append(buildHTML(viewData.signalsTable));
				//$el.empty().append("<h3>" + JSON.stringify(viewData) + "</h3>");
				$el.show();
			});
			
		}

		

		// Public API
		return {
			messages: ['routechanged'],
			onclick: function(event, element, elementType) {
				console.log("CLICK IN keys: " + elementType);



			},
			onmessage: function(name, data) {
				console.log("MSG IN keys: " + name + " | " + data.route);
				if (name === 'routechanged') {
					if (data.route === moduleName) {
						activate();
					} else {
						deactivate();
					}						
				}
				
			}


		};

	});

}