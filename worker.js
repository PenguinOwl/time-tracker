function updateResult() {
  //Calling functions of native addon 
  const activeWindows = require('electron-active-window');

  activeWindows().getActiveWindow().then((result)=>{
    postMessage(result);
  });
  //communicating with main process of electron app.
}
setInterval(updateResult, 100);
