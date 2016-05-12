var globalShortcut = require('electron').globalShortcut; // Provides listening functionality
var _ = require('lodash');

module.exports = function() {

	var comboEventCb

	var registerListeners = function(keyCombosToEvents, eventCb) {
		console.log("INIT: Registering key combo listeners")
		// keyCombosToEvents is a map with form like:
		/*
			{
				'Ctrl+Z' : 'screenshot',
				'Ctrl+K' : 'textnote',
				...
			}

		*/

		// Save eventCb first
		comboEventCb = eventCb;

		// Iterate and register one by one
		_.forOwn(keyCombosToEvents, function(eventName, keyCombo) {
			registerCombo(keyCombo, eventName);
		});

	}

	var registerCombo = function(keyCombo, eventName) {
		console.log("INIT: Combo listener for: " + keyCombo);
		var res = globalShortcut.register(keyCombo, function() {
			console.log("KEY COMBO PRESSED: " + keyCombo);
			if (!comboEventCb) throw "No combo events callback in place";
			comboEventCb(eventName);
		});
	} 

	return {
		registerListeners: registerListeners,
		removeListeners: function() {
			console.log("CLEANUP: Unregister all key combos")
			globalShortcut.unregisterAll();
		}
	}

}