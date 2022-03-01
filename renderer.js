function objToString (obj) {
    let str = "";
    for (const [p, val] of Object.entries(obj)) {
      str += `${p}: ${val}`;
      str += "<br>";
    }
    return str;
}

async function updateDOM() {
  var element = document.getElementById("debug");
  var data = await window.electronAPI.getWindowData();
  element.innerHTML = data;
}

setInterval(updateDOM, 100);
