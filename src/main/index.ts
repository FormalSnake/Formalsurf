import { app, shell, BrowserWindow, ipcMain, webContents, session, Session } from 'electron'
import path, { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { webview } from './webview'
// import { installExtension, REACT_DEVELOPER_TOOLS } from 'electron-devtools-installer';
// import { installExtension as installExtensionDev, REACT_DEVELOPER_TOOLS } from "electron-extension-installer";
import { ElectronChromeExtensions } from 'electron-chrome-extensions'
import { installChromeWebStore, updateExtensions } from 'electron-chrome-web-store'

let mainWindow: BrowserWindow;
let sharedSession: Session
let extensions: ElectronChromeExtensions

function createWindow(): void {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 12, y: 15 },
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      webviewTag: true,
      nodeIntegration: true,
      contextIsolation: true,
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(async () => {
  // installExtension(REACT_DEVELOPER_TOOLS, { loadExtensionOptions: { allowFileAccess: true } })
  //   .then((react) => console.log(`Added Extension: ${react.name}`))
  //   .catch((err) => console.log('An error occurred: ', err));
  // await installExtensionDev(REACT_DEVELOPER_TOOLS, {
  //   loadExtensionOptions: {
  //     allowFileAccess: true,
  //   },
  // });

  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  sharedSession = session.fromPartition('persist:webview')

  const modulePathExtensions = path.join(app.getAppPath(), 'node_modules/electron-chrome-extensions')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC events
  ipcMain.on('toggle-traffic-lights', (_event, show) => {
    // Check if the platform supports window button visibility
    if (process.platform === 'darwin' && mainWindow?.setWindowButtonVisibility) {
      if (show) {
        mainWindow.setWindowButtonVisibility(true)
        console.log('Show traffic lights')
      } else {
        mainWindow.setWindowButtonVisibility(false)
        console.log('Hide traffic lights')
      }
    } else {
      console.log('Window button visibility not supported on this platform')
    }
  })

  ipcMain.handle('get-active-tab', async (_event, webContentsId) => {
    console.log('get-active-tab', webContentsId)
    return extensions.selectTab(webContents.fromId(webContentsId) as any)
  })

  extensions = new ElectronChromeExtensions({
    license: "GPL-3.0",
    session: sharedSession,
    modulePath: modulePathExtensions,
    // createTab(details) {
    //   // use the existing open-url function to open the new tab
    //   const window = BrowserWindow.getAllWindows()[0]
    //   if (window) {
    //     window.webContents.send('open-url', details.url)
    //   }
    //   // return the webContents and the window
    //   return [window.webContents, window]
    // },
    // createWindow(details) {
    //   const window = new BrowserWindow()
    //   return window
    // },
  })

  // const modulePathWebstore = path.join(app.getAppPath(), 'node_modules/electron-chrome-web-store')

  // installChromeWebStore({ session: sharedSession, modulePath: modulePathWebstore }).catch((e) => console.error(e));

  // Check and install updates for all loaded extensions
  // updateExtensions()

  createWindow()

  app.on('activate', function() {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })

  app.on('web-contents-created', (event, webContents) => {
    webview(event, webContents, extensions);
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.

const newUserAgent = app.userAgentFallback
  .replace(
    /Chrome\/[\d.]+/,
    'Chrome/130.0.0.0' // Example: Update to a recent Chrome version
  )
  .replace(/Electron\/[\d.]+/, '')
  .replace(/formalsurf\/[\d.]+/, '')

// also replace Electron/* with nothing, and replace formalsurf-refactor/* with nothing
app.userAgentFallback = newUserAgent // app.userAgentFallback = newUserAgent
