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

			var viewDataPromise = requestNewKeyCombos();

			viewDataPromise.then(function(keyCombos) {
				if (isHidden) return; // User already switched to another view			

				console.warn("keys coming into view!");
				console.log(keyCombos);
				$('#globalLoadingBanner').hide();
				renderNewKeyCombos(keyCombos);			

				$el.show();
			});
			
		}

		var renderNewKeyCombos = function(keyCombos) {
			$el.find('#keyCombosEnabled_el').val(keyCombos.isEnabled ? '1' : '0');
			$el.find('#kuvakaappaus_combo').val(keyCombos.screenshot || '');
			$el.find('#textnote_combo').val(keyCombos.textnote || '');
			$el.find('#uploadimage_combo').val(keyCombos.uploadimage || '');
			$el.find('#urlimage_combo').val(keyCombos.urlimage || '');		
		}

		var requestNewKeyCombos = function() {
			return context.getService('settingsService').getCurrentKeyCombos();
		
		}

		var gatherKeySettings = function() {
			var keys = {};
			keys.isEnabled    = $el.find('#keyCombosEnabled_el').val();
			keys.screenshot   = $el.find('#kuvakaappaus_combo').val();
			keys.textnote     = $el.find('#textnote_combo').val();
			keys.uploadimage  = $el.find('#uploadimage_combo').val();
			keys.urlimage     = $el.find('#urlimage_combo').val();

			console.log("Gathered keys from form");
			console.log(keys);

			context.getService('settingsService').newKeyCombos(keys);
		}

		

		// Public API
		return {
			messages: ['routechanged', 'keyCombosChanged'],
			onclick: function(event, element, elementType) {
				console.log("CLICK IN keys: " + elementType);

				if (elementType === 'savesettings') {
					gatherKeySettings();
				}



			},
			onmessage: function(name, data) {
				
				if (name === 'routechanged') {
					if (data.route === moduleName) {
						activate();
					} else {
						deactivate();
					}						
				} else if (name === 'keyCombosChanged') {
					console.log("BOX: keyCombosChanged event in keys.js");
					requestNewKeyCombos().then(renderNewKeyCombos);
				}
				
			}


		};

	});

}