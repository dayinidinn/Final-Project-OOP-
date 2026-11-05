const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    openMealWindow: (mealName) => {
        ipcRenderer.send('open-meal-window', mealName);},

    receiveMeal: (callback) => {
        ipcRenderer.on('selected-meal', (event, mealName) => {
            callback(mealName);
        });}
});
