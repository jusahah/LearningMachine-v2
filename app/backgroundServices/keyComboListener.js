var globalShortcut = require('electron').globalShortcut; // Provides listening functionality
var _ = require('lodash');

module.exports = function() {

	var comboEventCb
	var keyComboEnabled;
	var eventsToCombos = {
		'isEnabled': 0,
		'screenshot': 0,
		'textnote': 0,
		'uploadimage': 0,
		'urlimage': 0
	};

	var registerListeners = function(keys, isEnabled, eventCb) {
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
		_.forOwn(keys, function(keyCombo, eventName) {
			if (!isValid(keyCombo) || !eventsToCombos.hasOwnProperty(eventName)) return;
			console.log("INIT: Register key combo: " + eventName + " -> " + keyCombo);
			registerCombo(keyCombo, eventName, eventsToCombos.isEnabled);
		});

	}

	var unregisterAll = function() {
		_.forOwn(eventsToCombos, function(keyCombo, eventName) {
			if (keyCombo && globalShortcut.isRegistered(keyCombo)) {
				globalShortcut.unregister(keyCombo);

			}

			
		});		
	}

	var registerCombo = function(keyCombo, eventName, isRealReg) {
		console.log("INIT: Combo listener for: " + keyCombo);
		if (isRealReg) {
			var res = globalShortcut.register(keyCombo, function() {
				console.log("KEY COMBO PRESSED: " + keyCombo);
				if (!comboEventCb) throw "No combo events callback in place";
				comboEventCb(eventName);
			});
			if (res) eventsToCombos[eventName] = keyCombo;			
		} else {
			eventsToCombos[eventName] = keyCombo;
		}

		

	} 

	var unregisterCombo = function(keyCombo, eventName) {
		if (keyCombo && globalShortcut.isRegistered(keyCombo)) {
						// Remove old one first
			globalShortcut.unregister(keyCombo);
			if (eventsToCombos.hasOwnProperty(eventName)) {
				eventsToCombos[eventName] = 0;
			}
		}
	}

	//////////////////7
	var registerNewKeys = function(keys) {
		eventsToCombos.isEnabled = keys.isEnabled && keys.isEnabled !== '0' ? 1 : 0;

		if (!eventsToCombos.isEnabled) {
			unregisterAll();
		}

		_.forOwn(keys, function(keyCombo, eventName) {
			if (eventsToCombos.hasOwnProperty(eventName) && eventName !== 'isEnabled') {
				var oldCombo = eventsToCombos[eventName];

				if (isEmpty(keyCombo)) {
					return unregisterCombo(oldCombo, eventName);
				}
				if (!isValid(keyCombo)) return;
				unregisterCombo(oldCombo, eventName);

				console.log("Switch key combo for " + eventName + ": " + oldCombo + " -> " + keyCombo);
				registerCombo(keyCombo, eventName, eventsToCombos.isEnabled);
				
			}
			
		});

		
		console.log("Event combos after registerNewKeys");
		console.log(eventsToCombos);

		return eventsToCombos;

	}


	var getCombos = function() {
		return Object.assign({}, eventsToCombos);
	}

	var isEmpty = function(keyCombo) {
		return !keyCombo || keyCombo.trim() === '';
	}

	var isValid = function(keyCombo) {
		if (!keyCombo || keyCombo.trim() === '') return false;
		var parts = keyCombo.split("+");
		return parts[0] === 'CommandOrControl' && parts[1].length === 1;
	}

	return {
		registerListeners: registerListeners,
		removeListeners: function() {
			console.log("CLEANUP: Unregister all key combos")
			globalShortcut.unregisterAll();
		},
		registerNewKeys: registerNewKeys,
		getCombos: getCombos
	}

}