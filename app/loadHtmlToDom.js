
console.log("INIT: LOADING HTMLS TO DOM")
// STATIC MENU
// Refactored so that menu template is in index.html so obsolete call
//$('#valikkoContainer').load('views/viewmodules/menu/menu.html');

// VIEW MODULES
$('#uploadimageContainer').load('views/viewmodules/uploadimage/uploadimage.html');
$('#urlimageContainer').load('views/viewmodules/urlimage/urlimage.html');
$('#screenshotContainer').load('views/viewmodules/screenshot/screenshot.html');
$('#textnoteContainer').load('views/viewmodules/textnote/textnote.html');
$('#keysContainer').load('views/viewmodules/keys/keys.html');
$('#categorytreeContainer').load('views/viewmodules/categorytree/categorytree.html');