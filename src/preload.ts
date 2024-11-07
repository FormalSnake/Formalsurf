import exposeContexts from "./helpers/ipc/context-exposer";
import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld('api', {
  send: (channel: string, data: any) => ipcRenderer.invoke(channel, data),
  handle: (channel: string, callable: (arg0: any, arg1: any) => (event: Electron.IpcRendererEvent, ...args: any[]) => void, event: any, data: any) => ipcRenderer.on(channel, callable(event, data))
})

exposeContexts();
