import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { injectBrowserAction } from 'electron-chrome-extensions/dist/browser-action'

// Inject <browser-action-list> element into our page
// if (location.href === 'webui://browser-chrome.html') {
injectBrowserAction()
// }

// Custom APIs for renderer
const api = {
  send: (channel: string, data: any) => ipcRenderer.invoke(channel, data),
  handle: (
    channel: string,
    callable: (arg0: any, arg1: any) => (event: Electron.IpcRendererEvent, ...args: any[]) => void,
    event: any,
    data: any
  ) => ipcRenderer.on(channel, callable(event, data)),
  toggleTrafficLights: (show) => ipcRenderer.send('toggle-traffic-lights', show),
  changeSetting: (key, value) => ipcRenderer.invoke('change-setting', key, value),
  getSettings: (setting) => ipcRenderer.invoke('get-setting', setting),
  onSettingChanged: (callback: (event: any, key: string, value: any) => void) =>
    ipcRenderer.on('setting-changed', callback),
  onNewTabFromExtension: (callback: (event: any, url: string) => void) =>
    ipcRenderer.on('new-tab-from-extension', callback),
  onSelectTab: (callback: (event: any, tabId: string) => void) =>
    ipcRenderer.on('select-tab', callback),
  onCloseTab: (callback: (event: any, tabId: string) => void) =>
    ipcRenderer.on('close-tab', callback),
  onCloseActiveTab: (callback: (event: any) => void) =>
    ipcRenderer.on('close-active-tab', callback)
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.log("not isolated")
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
