var jsonfile = require('jsonfile');

// Default data settings
var appData = {
	keyCombos: {
		'isEnabled': 1,
		'screenshot': 0,
		'textnote': 'CommandOrControl+T',
		'uploadimage': 'CommandOrControl+U',
		'urlimage': 0
	},
	apiKey: '82f382044e1f7b21af868e5cdcc2a59635077621',
	s3BaseUrl: ''
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
		updateApiKey: function(apiKey) {
			appData.apiKey = apiKey;
			return writeToDisk();
		},
		updateKeyCombos: function(combos) {
			appData.keyCombos = combos;
			return writeToDisk();
		},
		getData: function() {
			return Object.assign({}, appData);
		},
		updateS3: function(baseUrl) {
			appData.s3BaseUrl = baseUrl;
			return writeToDisk();
		}
	}

}