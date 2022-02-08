function objToString (obj) {
    let str = "";
    for (const [p, val] of Object.entries(obj)) {
      str += `${p}: ${val}`;
      str += "<br>";
    }
    return str;
}

var worker = new Worker('./worker.js');

var windowTime = {};

var lastTime = Date.now();

worker.onmessage = function(event) { 
  console.log("worker : ", event.data);
  var currtime = Date.now();
  var windowClass = event.data.windowClass;
  if (windowTime.hasOwnProperty(windowClass)) {
    windowTime[windowClass] += currtime - lastTime;
  } else {
    windowTime[windowClass] = currtime - lastTime;
  };
  lastTime = currtime;
  document.getElementById('debug').innerHTML = objToString(windowTime);
}
worker.onerror = function (event) {
  console.log(event.message, event);
};
