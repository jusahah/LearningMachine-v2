// This is main process of Electron, started as first thing when your
// app starts. This script is running through entire life of your application.
// It doesn't have any windows which you can see on screen, but we can open
// window from here.

import { app, Menu } from 'electron';
import { devMenuTemplate } from './helpers/dev_menu_template';
import { editMenuTemplate } from './helpers/edit_menu_template';
import createWindow from './helpers/window';

// Special module holding environment variables which you declared
// in config/env_xxx.json file.
import env from './env';
var ipcMain = require('electron').ipcMain;
var uuid    = require('node-uuid');

// App-specific deps
var keyListener = require('./backgroundServices/keyComboListener')();
var localState  = require('./backgroundServices/localState')(app.getAppPath());

var currentCreationWindow;
var currentCreationWindowMsgPending;

var msgIdsToRenderers = {};


// Local background cache
var cachedCategoryTreeData;

// Setup listening of rendener msgs
ipcMain.on('msg', function(event, arg) {
    var msgID = arg.msgID; // We need this to send response back
    if (msgID) {
        // Save sending window to renderers map so we can use
        // msgID later to send msg back
        msgIdsToRenderers[msgID] = event.sender;
    }
    console.log("IPC MAIN RECEIVED MSG");
    console.log(arg);
    if (arg.type === 'askUser') {
        try {
            openCreationWindow(arg.openFor, arg.tempFile, msgID);
        } catch (e) {
            // Fail so bail out now
            // Creation window was never created so no need to worry about it
            garbageCollectRenderer(msgID); // Remove renderer - we have it already as event.sender
            event.sender.send('msg', {
                msgID: msgID,
                success: false,
            });
            // separate system msg too
            event.sender.send('systemMsg', {
                type: 'error',
                reason: 'Sulje ensin nykyinen luonti-ikkuna!'
            });
            
        }
    } else if (arg.type === 'creationdata') {
        receivedCreationData(arg.data);
    } else if (arg.type === 'categoryTreeData') {
        console.log("BG: Setting category tree")
        cachedCategoryTreeData = arg.data;
    } else if (arg.type === 'newKeys') {
        receiveNewKeys(arg.data);
    } else if (arg.type === 'newApiKey') {
        console.log("New api key");
        console.log(arg.data);
        receiveNewApiKey(arg.data);
    } else if (arg.type === 'needData') {
        var data = localState.getData();
        console.log("App data back to renderer");
        console.log(data);
        event.sender.send('msg', {
            msgID: msgID,
            success: true,
            data: data
        });
        // Purge right away
        garbageCollectRenderer(msgID);
    } else if (arg.type === 's3BaseUrl') {
        // Save
        var s3BaseUrl = arg.data;
        localState.updateS3(s3BaseUrl);
    }
    
});

var mainWindow;

var setApplicationMenu = function () {
    var menus = [editMenuTemplate];
    if (env.name !== 'production') {
        menus.push(devMenuTemplate);
    }
    Menu.setApplicationMenu(Menu.buildFromTemplate(menus));
};


app.on('will-quit', keyListener.removeListeners);

app.on('window-all-closed', function () {
    app.quit();
});

function broadcastNextTickToRenderer(msg) {
    setTimeout(function() {
        console.log("Broadcasting to renderer");
        console.log(msg);
        mainWindow.webContents.send('systemmsg', msg);
    }, 0);
}

function garbageCollectRenderer(msgID) {
    if (!msgIdsToRenderers.hasOwnProperty(msgID)) return;
    msgIdsToRenderers[msgID] = null;
    delete msgIdsToRenderers[msgID];
}

function receiveNewKeys(keys) {

    var keyCombos = keyListener.registerNewKeys(keys);
    localState.updateKeyCombos(keyCombos);
    broadcastNextTickToRenderer({
        type: 'broadcast',
        reason: 'keyCombosChanged',
        data: keyCombos
    });
}

function receiveNewApiKey(apiKey) {
    localState.updateApiKey(apiKey);
    broadcastNextTickToRenderer({
        type: 'broadcast',
        reason: 'apiKeyChanged',
        data: apiKey
    });
}


function openCreationWindow(openFor, tempFile, msgID) {
    if (currentCreationWindow) {
        // already one creation window open... can not open two at the same time
        console.log("Trying to open two creation windows at the same time");
        throw "MULTIPLE_CREATION_WINDOWS_FORBIDDED";
    }
    console.log("Opening window for: " + openFor);
    // Random identifier for the window
    var winId = uuid.v1();
    var newWindow = createWindow(winId, {
            width: 800,
            height: 800
    });
    // First job is to bind listener for closed-event
    // When window closes we must allow currentCreationWindow -> null

    newWindow.on('closed', function() {
        currentCreationWindow = null;
    });

    if (env.name !== 'production') {
        //newWindow.openDevTools();
    }
    // Stash the link so we can later close it
    currentCreationWindow = newWindow;
    currentCreationWindowMsgPending = msgID;

    // Perhaps refactor later dynamically using openFor-variable as file name

    // ADD HERE FOR NEW TYPES OF CREATIONS
    if (openFor === 'screenshot') {
        newWindow.loadURL('file://' + __dirname + '/views/creationwindows/screenshot.html');
    } else if (openFor === 'textnote') {
        newWindow.loadURL('file://' + __dirname + '/views/creationwindows/textnote.html');
    } else if (openFor === 'urlimage') {
        newWindow.loadURL('file://' + __dirname + '/views/creationwindows/urlimage.html');
    } else if (openFor === 'uploadimage') {
        newWindow.loadURL('file://' + __dirname + '/views/creationwindows/uploadimage.html');
    }
    
    // This part is same for all - they all need category data injected in
    // We need to send the data afterwards so its presented to user then
    newWindow.webContents.on('dom-ready', function() {
        console.log("Sending category tree...");
        newWindow.focus();
        newWindow.webContents.send('focusnow', {});        
        newWindow.webContents.send('renderPayload', {
            tree: cachedCategoryTreeData,
            tempFile: tempFile, // Only screenshot needs this, the rest just ignore it
        });
    });
    // We should also have some kind of "did-not-load" or "dom-failed" listener!

}

function receivedCreationData(data) {
    // This code should be abstracted as ALL responses back follow this scheme
    console.log("Received creation data from creation window");

    // Close the window
    if (currentCreationWindow) currentCreationWindow.close();
    //currentCreationWindow = null; // Window.on('closed') listeners takes care of this

    // Route data back to our main renderer window which knows what to do with it
    var msgID = currentCreationWindowMsgPending;

    if (!msgIdsToRenderers.hasOwnProperty(msgID)) {
        console.error("Msg ID did not match anything in the ids->renderers mapping: " + msgID);
        throw "NO_RENDERER_PRESENT_IN_ROUTING_TABLE";
    }

    var renderer = msgIdsToRenderers[msgID];

    renderer.send('msg', {
        msgID: currentCreationWindowMsgPending,
        success: true,
        data: data
    });

    // Clean up ids->renderers table
    garbageCollectRenderer(msgID);
}


function keyComboPressed(eventName) {

    console.log("Key combo event: " + eventName);

    // Route it to renderer who knowns what to do
    // Plus this way we get more unified flow
    broadcastNextTickToRenderer({
        type: 'broadcast',
        reason: 'keyComboEvent',
        data: eventName
    });

}













////////////////
/// APP RUNTIME STARTS
////////////////
app.on('ready', function() {
    // Set key listeners
    // In real app they come from settings file or server
    // Settings file makes more sense

    var appData = localState.getData();

    keyListener.registerListeners(appData.keyCombos, keyComboPressed);
    setApplicationMenu();

    mainWindow = createWindow('main', {
        width: 1000,
        height: 680
    });

    mainWindow.loadURL('file://' + __dirname + '/index.html');

    if (env.name !== 'production') {
        mainWindow.openDevTools();
    }
});