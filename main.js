const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let mainWindow;
let mealWindow;

function createMainWindow() {
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 700,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true
        }
    });

    const fs = require('fs');

    const filePath = path.join(__dirname, 'renderer', 'index.html');

    console.log('Looking for:', filePath);
    console.log('File exists:', fs.existsSync(filePath));
    
    mainWindow.loadFile(
    path.join(__dirname, 'renderer', 'index.html'));

    mainWindow.webContents.openDevTools();

    mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
        console.log('Failed to load:', errorCode, errorDescription);
    });
}


function createMealWindow(mealName) {
    if (mealWindow && !mealWindow.isDestroyed()) {
        mealWindow.focus();

        mealWindow.webContents.send('selected-meal', mealName);
        return;
    }

    mealWindow = new BrowserWindow({
        width: 800,
        height: 650,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true
        }
    });

    mealWindow.loadFile(
        path.join(__dirname, 'renderer', 'mealplan.html')
    );

    mealWindow.webContents.on('did-finish-load', function() {
        mealWindow.webContents.send('selected-meal', mealName);
    });
}


ipcMain.on('open-meal-window', (event, mealName) => {
    createMealWindow(mealName);
});

app.whenReady().then(createMainWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createMainWindow();
    }
});
