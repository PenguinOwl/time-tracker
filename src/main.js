// Modules to control application life and create native browser window
const Store = require('electron-store');
const store = new Store();
const { app, BrowserWindow, Menu, nativeImage, Tray, ipcMain } = require('electron')
const path = require('path')
const electronReload = require('electron-reload')(__dirname)
const AutoLaunch = require('auto-launch');

let tray = null
function createTray () {
  const icon = path.join(__dirname, '/app.png') // required.
  const trayicon = nativeImage.createFromPath(icon)
  tray = new Tray(trayicon.resize({ width: 16 }))
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show App',
      click: () => {
        createWindow()
      }
    },
    {
      label: 'Quit',
      click: () => {
        app.quit() // actually quit the app.
      }
    },
  ])
  tray.on('click', function(e){
    if (mainWindow) {
      mainWindow = null;
    } else {
      createWindow();
    }
  });

  tray.setContextMenu(contextMenu)
  tray.setIgnoreDoubleClickEvents(true)
}

const gotTheLock = app.requestSingleInstanceLock()

var autoLaunch;

if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // Someone tried to run a second instance, we should focus our window.
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    } else {
      createWindow();
    }
  })


  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.whenReady().then(() => {
    createWindow()

    autoLaunch = new AutoLaunch({
      name: 'TimeTracker'
    });

    app.on('activate', function () {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
  })
}


function createWindow () {
  if (!tray) { // if tray hasn't been created already.
    createTray()
  }

  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      nodeIntegrationInWorker: true,
    }
  })

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
  
  mainWindow.on('closed', function () {
    mainWindow = null
  })
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform == 'darwin') app.dock.hide()
})

ipcMain.handle('updateAutoStart', () => {
  enabled = store.get("autoStart", false);
  autoLaunch.isEnabled().then(function(autoLaunchEnabled){
    if (enabled == autoLaunchEnabled) {
      return;
    }
    if (autoLaunchEnabled){
      autoLaunch.disable();
    } else {
      autoLaunch.enable();
    }
  });
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

require("./app.js")
