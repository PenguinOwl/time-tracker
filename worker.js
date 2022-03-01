var windowTime = {};
var lastTime = Date.now();
var display = "";

const { WorkerData, parentPort } = require('worker_threads')

function toTitleCase(str) {
    return str.replace(/\w\S*/g, function(txt){
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}

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
    var sortable = [];
    for (var windowData in windowTime) {
        sortable.push([windowData, windowTime[windowData]]);
    }
    sortable.sort(function(a, b) {
        return b[1] - a[1];
    });
    var max = Math.max(...sortable.map(x => x[1]));
    var string = "";
    for (const [key, value] of sortable) {
      var glow = "";
      if (key == windowClass) {
        glow = "glow";
      }
      var time = new Date(value).toISOString().substr(11, 8).replace(/^0(0:)?0?/, "");
      var opacity = Math.pow(0.95, Math.log(1+max-value)+1);
      var title = toTitleCase(key.replace('-', ' '));
      console.log(Math.log(1+max-value)+1);
      string += `
      <div class="box-container">
        <div class="box ${glow}" style="background-color:rgba(92, 92, 92, ${opacity});">
            <div class="vertical-center clock">
              <div class="clock-text vertical-center">
                <b>${time}</b>
              </div>
            </div>
            <div class="vertical-center window-name">
              ${key}
            </div>
        </div>
      </div>
      `
    }
    display = string;
  });
  parentPort.postMessage({ data: display });
}

setInterval(updateResult, 100);
