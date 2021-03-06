function objToString (obj) {
    let str = "";
    for (const [p, val] of Object.entries(obj)) {
      str += `${p}: ${val}`;
      str += "<br>";
    }
    return str;
}

function toTitleCase(str) {
    return str.replace(/\w\S*/g, function(txt){
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}

var group = document.querySelector(".group");
var nodes = [];
var ease  = Power1.easeInOut;
var boxes = [];
var showHidden = false;
var hidden = [];
var autoStart = false;
var showHiddenButton = document.getElementById("show-hidden-button");
var autoStartButton = document.getElementById("auto-start-button");
var tooltips = {};

const showEvents = ['mouseenter', 'focus'];
const hideEvents = ['mouseleave', 'blur'];

function showTooltip(event) {
  event.target.tooltip.setAttribute('data-show', '');

  // We need to tell Popper to update the tooltip position
  // after we show the tooltip, otherwise it will be incorrect
  event.target.tooltip.popperInstance.update();
}

function hideTooltip(event) {
  event.target.tooltip.removeAttribute('data-show');
}

function createTooltip(parentobj, element, text, options) {
  var tooltip = document.createElement("div");
  tooltip.classList.add("tooltip");
  tooltip.innerText = text;
  popperInstance = Popper.createPopper(element, tooltip, options);
  showEvents.forEach((event) => {
    event.popperInstance = popperInstance;
    element.addEventListener(event, showTooltip);
  });
  hideEvents.forEach((event) => {
    element.addEventListener(event, hideTooltip);
  });
  element.tooltip = tooltip;
  tooltip.popperInstance = popperInstance;
  parentobj.appendChild(tooltip);
  return tooltip;
}

async function onload() {
  hidden = await window.electronAPI.getStoreValue("hidden", []);
  autoStart = await window.electronAPI.getStoreValue("autoStart", false);
  createTooltip(document.body, showHiddenButton, "Toggle Hidden", { placement: "top" });
  createTooltip(document.body, autoStartButton, "Toggle Launch on Startup ", { placement: "top" });
  var color = autoStart ? "rgb(220,255,220)" : "rgba(255, 220, 220, 0.5)";
  autoStartButton.style.color = color;
}

async function updateDOM() {
  var workerData = await window.electronAPI.getWindowData();
  var windowTime = workerData.data;
  var windowClass = workerData.current;
  var sortable = [];
  for (var windowData in windowTime) {
      sortable.push([windowData, windowTime[windowData]]);
  }
  sortable.sort(function(a, b) {
      return b[1] - a[1];
  });
  var max = Math.max(...sortable.map(x => x[1]));
  var reorder = false;
  sortable.forEach( function (data, index) {
    var key = data[0];
    var value = data[1];
    var element = document.getElementById("tracker-" + key);
    if (!element) {
      var newBox = document.createElement("div");
      newBox.classList.add("box-container");
      newBox.id = "tracker-" + key;
      document.getElementById("debug").appendChild(newBox);
      tooltips[key] = [];
      newBox.innerHTML = `
      <div class="box">
        <div class="clock">
          <div class="clock-text">
            <b class="clock-text-content"></b>
          </div>
        </div>
        <div class="window-name">
        </div>
        <div class="tile-menu" style="color: white;">
          <i tooltext="Remove" class="ri-close-line" onclick="trackerClose('${key}')"></i>
          <i tooltext="Reset" class="ri-refresh-line" onclick="trackerRefresh('${key}')"></i>
          <i tooltext="Hide" class="ri-eye-line" onclick="trackerHide('${key}')"></i>
          <i tooltext="Unhide" style="display: none" class="ri-eye-off-line" onclick="trackerUnhide('${key}')"></i>
        </div>
      </div>
      `
      element = newBox;
      tilemenu = element.querySelector(".tile-menu");
      children = tilemenu.children;
      for (var child of children) {
        tooltips[key].push(createTooltip(document.body, child, child.getAttribute("tooltext"), { placement: "left" }));
      }
      nodes.push(newBox);
      TweenLite.set(newBox, { x:0, y: 0 });
      boxes.push({
        x: newBox.offsetLeft,
        y: newBox.offsetTop,
        node: newBox
      });
    }

    boxElement              = element.querySelector(".box");
    clockTextContentElement = element.querySelector(".clock-text-content");
    windowNameElement       = element.querySelector(".window-name");
    hideElement             = element.querySelector(".ri-eye-line");
    unhideElement           = element.querySelector(".ri-eye-off-line");
    clockElement            = element.querySelector(".clock");

    if (boxElement.classList.contains('glow') != (key == windowClass)) {
      boxElement.classList.toggle('glow');
    }

    var isHidden  = hidden.includes(key);
    var time      = new Date(value).toISOString().substr(11, 8).replace(/^0(0:)?0?/, "");
    var opacity   = Math.pow(0.95, Math.log(1+max-value));
    var title     = toTitleCase(key.replaceAll('-', ' ').replaceAll('_', ' ').replaceAll('.exe', '').replaceAll('.app', ''));
    var color     = isHidden ? "180,40,40" : "70,70,70";
    var border    = (key == windowClass) ? "#ffff00" : "#b6b6b6";
    var clockFill = (key == windowClass) ? "#222" : "#555";

    hideDisplayMode   = isHidden ? "none" : "block";
    unhideDisplayMode = isHidden ? "block" : "none";

    if (hideElement.style.display != hideDisplayMode) {
      hideElement.style.display = hideDisplayMode;
    }

    if (unhideElement.style.display != unhideDisplayMode) {
      unhideElement.style.display = unhideDisplayMode;
    }

    if (clockElement.style.borderColor != border) {
      clockElement.style.borderColor = border;
    }

    if (clockElement.style.backgroundColor != clockFill) {
      clockElement.style.backgroundColor = clockFill;
    }

    if (element.style.order != index + 1)
      reorder = true;

    element.style.order = index + 1;

    isVisible = !hidden.includes(key) || showHidden;

    displayMode = isVisible ? "block" : "none";

    if (element.style.display != displayMode) {
      element.style.display = displayMode;
    }

    boxElement.style.backgroundColor = `rgba(${color},${opacity})`;

    if (clockTextContentElement.innerText != time)
      clockTextContentElement.innerText = time;

    if (windowNameElement.innerText != title)
      windowNameElement.innerText = title;

  })

  if (reorder)
    layout();
}

setInterval(updateDOM, 100);

function layout() {
  var total = boxes.length;

  for (var i = 0; i < total; i++) {

    var box = boxes[i];

    var lastX = box.x;
    var lastY = box.y;

    box.x = box.node.offsetLeft;
    box.y = box.node.offsetTop;

    // Continue if box hasn't moved
    if (lastX === box.x && lastY === box.y) continue;

    var transform_string = gsap.getProperty(box.node, "transform");
    const translateRegex = /translate\((?<x>\d+)px, (?<y>\d+)px\)/;
    var match = transform_string.match(translateRegex);
    //var transform = match.groups;
    var transform = match.groups;

    // Reversed delta values taking into account current transforms
    var x = transform.x + lastX - box.x;
    var y = transform.y + lastY - box.y;

    // Tween to 0 to remove the transforms
    TweenLite.fromTo(box.node, 0.5, { x, y }, { x: 0, y: 0, ease });
  }
}

async function trackerHide(key) {
  if (!hidden.includes(key))
    hidden.push(key);
  await window.electronAPI.setStoreValue("hidden", hidden);
}

async function trackerUnhide(key) {
  hidden = hidden.filter(item => item !== key);
  await window.electronAPI.setStoreValue("hidden", hidden);
}

async function trackerRefresh(key) {
  await window.electronAPI.resetTime(key);
}

async function trackerClose(key) {
  todelete = tooltips[key];
  for (var ttip of todelete) {
    ttip.remove();
  }
  document.getElementById("tracker-" + key).remove();
  nodes = nodes.filter(item => item.id !== "tracker-" + key);
  await window.electronAPI.removeKey(key);
}

function toggleHidden() {
  showHidden = !showHidden;
  var color = showHidden ? "rgb(255,80,80)" : "white";
  showHiddenButton.style.color = color;
}

async function toggleAutoStart() {
  autoStart = !autoStart;
  var color = autoStart ? "rgb(220,255,220)" : "rgba(255, 220, 220, 0.5)";
  autoStartButton.style.color = color;
  await window.electronAPI.setStoreValue("autoStart", autoStart);
  await window.electronAPI.updateAutoStart();
}
