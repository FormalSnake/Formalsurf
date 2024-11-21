import { app, shell, BrowserWindow, ipcMain, Menu } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
// import contextMenu from 'electron-context-menu';

const isMac = process.platform === 'darwin'

// contextMenu({
//   showSaveImageAs: true
// });

const template = [
  // { role: 'appMenu' }
  ...(isMac
    ? [{
      label: app.name,
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    }]
    : []),
  // { role: 'fileMenu' }
  {
    label: 'File',
    submenu: [
      {
        label: "New Tab",
        accelerator: "CmdOrCtrl+T",
        click: (menuItem, browserWindow) => {
          if (browserWindow) {
            browserWindow.webContents.send("new-tab");
          }
        },
      },
      {
        label: "Close Tab",
        accelerator: "CmdOrCtrl+W",
        click: (menuItem, browserWindow) => {
          if (browserWindow) {
            browserWindow.webContents.send("close-active-tab");
          }
        },
      },
      // {
      //   label: "Open URL bar",
      //   accelerator: "CmdOrCtrl+L",
      //   click: (menuItem, browserWindow) => {
      //     if (browserWindow) {
      //       browserWindow.webContents.send("open-url-bar");
      //     }
      //   },
      // }
    ]
  },
  // { role: 'editMenu' }
  {
    label: 'Edit',
    submenu: [
      { role: 'undo' },
      { role: 'redo' },
      { type: 'separator' },
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' },
      ...(isMac
        ? [
          { role: 'pasteAndMatchStyle' },
          { role: 'delete' },
          { role: 'selectAll' },
          { type: 'separator' },
          {
            label: 'Speech',
            submenu: [
              { role: 'startSpeaking' },
              { role: 'stopSpeaking' }
            ]
          }
        ]
        : [
          { role: 'delete' },
          { type: 'separator' },
          { role: 'selectAll' }
        ])
    ]
  },
  // { role: 'viewMenu' }
  {
    label: 'View',
    submenu: [
      { role: 'reload' },
      { role: 'forceReload' },
      { role: 'toggleDevTools' },
      { type: 'separator' },
      { role: 'resetZoom' },
      { role: 'zoomIn' },
      { role: 'zoomOut' },
      { type: 'separator' },
      { role: 'togglefullscreen' },
      {
        label: 'Toggle sidebar',
        accelerator: "CmdOrCtrl+shift+b",
        click: (menuItem, browserWindow) => {
          if (browserWindow) {
            browserWindow.webContents.send("toggle-sidebar");
          }
        },
      }
    ]
  },
  // { role: 'windowMenu' }
  {
    label: 'Window',
    submenu: [
      { role: 'minimize' },
      { role: 'zoom' },
      ...(isMac
        ? [
          { type: 'separator' },
          { role: 'front' },
          { type: 'separator' },
          { role: 'window' }
        ]
        : [
          { role: 'close' }
        ])
    ]
  },
  {
    role: 'help',
    submenu: [
      {
        label: 'Learn More',
        click: async () => {
          const { shell } = require('electron')
          await shell.openExternal('https://electronjs.org')
        }
      }
    ]
  }
]

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    titleBarStyle: "hiddenInset",
    trafficLightPosition: { x: 12, y: 15 },
    backgroundColor: "#09090b",
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      webviewTag: true,
      // webSecurity: false,
    }
  })
  // @ts-ignore
  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.on("did-attach-webview", (_, contents) => {
    contents.setWindowOpenHandler((details) => {
      mainWindow.webContents.send('open-url', details.url);
      return { action: 'deny' }
    })
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  ipcMain.on('toggle-traffic-lights', (event, show) => {
    if (show) {
      mainWindow.setWindowButtonVisibility(true)
      console.log("Show traffic lights")
    } else {
      mainWindow.setWindowButtonVisibility(false)
      console.log("Hide traffic lights")
    }
  });

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
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })


  createWindow()

  app.on('activate', function() {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.userAgentFallback = app.userAgentFallback.replace('Chrome/' + process.versions.chrome, 'Chrome');

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
