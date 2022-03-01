var windowTime = {};
var lastTime = Date.now();
var display = "";

const { WorkerData, parentPort } = require('worker_threads')

function updateResult() {
  //Calling functions of native addon 
  const activeWindows = require('electron-active-window');

  activeWindows().getActiveWindow().then((data)=>{
    var currtime = Date.now();
    var windowClass = data.windowClass;
    if (windowTime.hasOwnProperty(windowClass)) {
      windowTime[windowClass] += currtime - lastTime;
    } else {
      windowTime[windowClass] = currtime - lastTime;
    };
    lastTime = currtime;
    parentPort.postMessage({ data: windowTime, current: windowClass });
  });
}

setInterval(updateResult, 100);
