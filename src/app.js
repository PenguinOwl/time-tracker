const Store = require('electron-store');

const store = new Store();
const path = require('path');

const {
  Worker, isMainThread, parentPort, workerData
} = require('worker_threads');
const {app, BrowserWindow, ipcMain} = require('electron')

var data = store.get("data", {});

var lastSave = Date.now();
var worker = new Worker(path.join(require('electron').app.getAppPath().replace("app.asar", "app.asar.unpacked"), '/src/worker.js'), {workerData: data});
worker.on("message", (event) => {
  data = event;
  if (Date.now() - lastSave > 1500) {
    store.set("data", data.data);
    lastSave = Date.now();
  }
})
worker.onerror = function (event) {
  console.log(event.message, event);
};
ipcMain.handle('window-data', sendData);

function sendData() {
  return data;
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
});
