// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  for (const type of ['chrome', 'node', 'electron']) {
    replaceText(`${type}-version`, process.versions[type])
  }
})

const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  getWindowData: () => ipcRenderer.invoke('window-data'),
  setStoreValue: (key, value) => ipcRenderer.invoke('setStoreValue', key, value),
  getStoreValue: (key, other) => ipcRenderer.invoke('getStoreValue', key, other),
  resetTime: (key) => ipcRenderer.invoke('resetTime', key),
  removeKey: (key) => ipcRenderer.invoke('deleteKey', key)
})
