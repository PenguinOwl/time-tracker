const Store = require('electron-store');

const store = new Store();

var windowTime = {};
var lastTime = Date.now();
var lastSave = Date.now();
var display = "";

const { WorkerData, parentPort } = require('worker_threads')

windowTime = store.get("data", {});

parentPort.on("message", event => {
  var type = event.type;
  var key = event.key;
  if (type == "reset") {
    windowTime[key] = 0;
  }
  if (type == "delete") {
    delete windowTime[key];
  }
});


function updateResult() {
  //Calling functions of native addon 
  const activeWindows = require('electron-active-window');

  activeWindows().getActiveWindow().then((data)=>{
    var currtime = Date.now();
    var windowClass = data.windowClass;
    if (Number(data.idleTime) < 60) {
      if (windowTime.hasOwnProperty(windowClass)) {
        windowTime[windowClass] += currtime - lastTime;
      } else {
        windowTime[windowClass] = currtime - lastTime;
      };
      parentPort.postMessage({ data: windowTime, current: windowClass });
    }
    lastTime = currtime;
    if (currtime - lastSave > 15) {
      store.set("data", windowTime);
    }
  });
}

setInterval(updateResult, 100);
