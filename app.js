const {
  Worker, isMainThread, parentPort, workerData
} = require('worker_threads');
const {app, BrowserWindow, ipcMain} = require('electron')

var display = "";
var worker = new Worker('./worker.js');
worker.on("message", (event) => {
  console.log("cc");
  display = event.data;
  console.log(display);
})
worker.onerror = function (event) {
  console.log(event.message, event);
};
ipcMain.handle('window-data', sendData);

function sendData() {
  
  return worker.display;
}

