var jsonfile = require('jsonfile');

// Default data settings
var appData = {
	keyCombos: {
		'isEnabled': 0,
		'screenshot': 0,
		'textnote': 0,
		'uploadimage': 0,
		'urlimage': 0
	}
};

module.exports = function(dataPath) {
	var fileName = dataPath + "/appdata.json";

	try {
		appData = jsonfile.readFileSync(fileName);
	} catch (e) {
		console.log("Appdata.json does not exist? Creating it first time");
		jsonfile.writeFileSync(fileName, appData);
	}

	var writeToDisk = function() {
		console.log("Writing app data to disk...");
		console.log(appData);
		jsonfile.writeFile(fileName, appData, function (err) {
		  console.error(err);
		});		
	}

	return {

		updateKeyCombos: function(combos) {
			appData.keyCombos = combos;
			return writeToDisk();
		},
		getData: function() {
			return Object.assign({}, appData);
		}
	}

}