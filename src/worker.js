const { workerData, parentPort } = require('worker_threads')

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

var windowTime = workerData;
var lastTime = Date.now();

function updateResult() {
  //Calling functions of native addon 
  const activeWindows = require('electron-active-window');

  activeWindows().getActiveWindow().then((data)=>{
    var currtime = Date.now();
    var windowClass = data.windowClass;
    if (!windowClass.match(/\w/))
      return;
    if (Number(data.idleTime) < 60) {
      if (windowTime.hasOwnProperty(windowClass)) {
        windowTime[windowClass] += currtime - lastTime;
      } else {
        windowTime[windowClass] = currtime - lastTime;
      };
      parentPort.postMessage({ data: windowTime, current: windowClass });
    }
    lastTime = currtime;
  });
}

setInterval(updateResult, 100);
