import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { injectBrowserAction } from 'electron-chrome-extensions/dist/browser-action'

// Custom APIs for renderer
const api = {
  send: (channel: string, data: any) => ipcRenderer.invoke(channel, data),
  handle: (
    channel: string,
    callable: (arg0: any, arg1: any) => (event: Electron.IpcRendererEvent, ...args: any[]) => void,
    event: any,
    data: any
  ) => ipcRenderer.on(channel, callable(event, data)),
  toggleTrafficLights: (show: boolean) => ipcRenderer.send('toggle-traffic-lights', show),
  getActiveTab: (webContentsId: string) => ipcRenderer.invoke('get-active-tab', webContentsId),
  getVersion: () => ipcRenderer.invoke('get-version'),
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
    injectBrowserAction()
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api

  injectBrowserAction()
}
