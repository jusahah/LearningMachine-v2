var _ = require('lodash');
var Handlebars = require('handlebars');

module.exports = function(Box) {

	Box.Application.addModule('categorytree', function(context) {
		var moduleName = 'categorytree'; // Save here for easier copypaste of code between modules
		console.log("INITING categorytree VIEW MODULE");
		var isHidden = true; // Keeps local state whether DOM element is visible or not
		var $el = $(context.getElement()); // Link to DOM element
		var $purgeable = $el.find('#categoryTreeList');

		// Local cache
		var cachedCategoryData;

		// Templates
		var categoryItemTemplate;

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
				// viewData is always object with transforNames being categorytree and data being values
				console.warn("categorytree coming into view!");
				console.log(cachedCategoryData);
				render();
				$('#globalLoadingBanner').hide();
				$el.show();
			});
			
		}

		var purgeOld = function() {
			$purgeable.empty();
		}

		var renderEmpty = function() {
			$purgeable.append('<h1>No category tree present</h1>');
			$purgeable.append('<p>This may be due network problem or you are not registered to LearningMachine server-side service');
		}

		var render = function() {
			purgeOld();
			if (!cachedCategoryData) return renderEmpty();
			var tree = cachedCategoryData.tree;
			var ts   = cachedCategoryData.fetchedTimestamp;

			var gatheringArray = [];

			var oneDepthDown = function(items, depth) {
				_.each(items, function(item) {
					var treeItem = {color: item.color, name: item.name, depth: depth, margin: depth*10};
					gatheringArray.push(treeItem);
					if (item.children || Array.isArray(item.children)) {
						// recurse
						oneDepthDown(item.children, depth + 1);
					}
				})
			}

			oneDepthDown(tree, 0);

			// Render flat gatheringArray
			var totalHtml = _.reduce(gatheringArray, function(html, item) {
				return html + categoryItemTemplate(item);
			}, '');
			console.log(totalHtml);
			$purgeable.append(totalHtml);

		}

		var downloadLatestCategoryTree = function() {
			context.getService('storageCommunication').getCategoryTree().then(function(results) {
				cachedCategoryData = results;
				render();
			}).catch(function(e) {
				console.error("INIT: Category tree fetching failed");
				console.error(e);
			});
		}

		var init = function() {

			console.log("Compile template");
			var source   = $el.find("#categoryitem_template").html();
			categoryItemTemplate = Handlebars.compile(source);

			console.log("Category tree view module asking for initial data");

			context.getService('storageCommunication').getCategoryTree().then(function(results) {
				cachedCategoryData = results;
			}).catch(function(e) {
				console.error("INIT: Category tree fetching failed");
				console.error(e);
			});
		}

	

		// Public API
		return {
			messages: ['routechanged', 'appStarts'],
			onclick: function(event, element, elementType) {
				console.log("CLICK IN categorytree: " + elementType);

				if (elementType === 'downloadCategoryTree') {
					downloadLatestCategoryTree();
				}



			},
			onmessage: function(name, data) {
				console.log("MSG IN categorytree: " + name);
				if (name === 'routechanged') {
					if (data.route === moduleName) {
						activate();
					} else {
						deactivate();
					}						
				} else if (name === 'appStarts') {
					init();
				}
				
			}


		};

	});

}