module.exports = function(Box) {

	Box.Application.addModule('serversettings', function(context) {
		var moduleName = 'serversettings'; // Save here for easier copypaste of code between modules
		console.log("INITING serversettings VIEW MODULE");
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

			var viewDataPromise = requestApiKey();

			viewDataPromise.then(function(apiKey) {
				if (isHidden) return; // User already switched to another view			

				console.warn("serversettings coming into view!");
				$('#globalLoadingBanner').hide();
				renderApiKey(apiKey);			

				$el.show();
			});
			
		}

		var renderApiKey = function(apiKey) {
			console.log("Server settings renders api key: " + apiKey);
			$el.find('#apikey_input').val(apiKey);
		}

		var requestApiKey = function() {
			return context.getService('settingsService').getApiKey();
		
		}

		var gatherserversettingsettings = function() {
			var serversettings = {};
			serversettings.apikey    = $el.find('#apikey_input').val();

			console.log("Gathered serversettings from form");
			console.log(serversettings);

			context.getService('settingsService').apiKeyUpdated(serversettings.apikey);
		}

		

		// Public API
		return {
			messages: ['routechanged', 'keyCombosChanged'],
			onclick: function(event, element, elementType) {
				console.log("CLICK IN serversettings: " + elementType);

				if (elementType === 'savesettings') {
					gatherserversettingsettings();
				}



			},
			onmessage: function(name, data) {
				
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