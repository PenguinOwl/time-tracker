const Store = require('electron-store');

const store = new Store();

const {
  Worker, isMainThread, parentPort, workerData
} = require('worker_threads');
const {app, BrowserWindow, ipcMain} = require('electron')

var display = "";
var worker = new Worker('./src/worker.js');
worker.on("message", (event) => {
  display = event;
})
worker.onerror = function (event) {
  console.log(event.message, event);
};
ipcMain.handle('window-data', sendData);

function sendData() {
  return display;
}

ipcMain.handle('getStoreValue', (event, key, other) => {
  return store.get(key, other);
});

ipcMain.handle('setStoreValue', (event, key, value) => {
  return store.set(key, value);
});

ipcMain.handle('resetTime', (event, key) => {
  return worker.postMessage({type: "reset", key: key})
});

ipcMain.handle('deleteKey', (event, key) => {
  return worker.postMessage({type: "delete", key: key})
  console.log(key);
});

