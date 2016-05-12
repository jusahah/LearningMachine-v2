module.exports = function(Box) {

	Box.Application.addModule('textnote', function(context) {
		var moduleName = 'textnote'; // Save here for easier copypaste of code between modules
		console.log("INITING TEXTNOTE VIEW MODULE");
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

				console.warn("Text note coming into view!");
				$('#globalLoadingBanner').hide();
				$el.show();
			});
			
		}
		

		// Public API
		return {
			messages: ['routechanged'],
			onclick: function(event, element, elementType) {
				console.log("CLICK IN TEXTNOTE: " + elementType);


			},
			onmessage: function(name, data) {
				console.log("MSG IN TEXTNOTE: " + name + " | " + data.route);
				if (data.route === moduleName) {
					activate();
				} else {
					deactivate();
				}				
				
			}


		};

	});

}