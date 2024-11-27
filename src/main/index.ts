import { app, shell, BrowserWindow, ipcMain, Menu, dialog, session } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import contextMenu from 'electron-context-menu'

const isMac = process.platform === 'darwin'

const template = [
  // { role: 'appMenu' }
  ...(isMac
    ? [
        {
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
        }
      ]
    : []),
  // { role: 'fileMenu' }
  {
    label: 'File',
    submenu: [
      {
        label: 'New Tab',
        accelerator: 'CmdOrCtrl+T',
        click: (menuItem, browserWindow) => {
          if (browserWindow) {
            browserWindow.webContents.send('new-tab')
          }
        }
      },
      {
        label: 'Close Tab',
        accelerator: 'CmdOrCtrl+W',
        click: (menuItem, browserWindow) => {
          if (browserWindow) {
            browserWindow.webContents.send('close-active-tab')
          }
        }
      },
      {
        label: 'Open URL bar',
        accelerator: 'CmdOrCtrl+L',
        click: (menuItem, browserWindow) => {
          if (browserWindow) {
            browserWindow.webContents.send('open-url-bar')
          }
        }
      },
      {
        label: 'Set as Default Browser',
        click: async (menuItem, browserWindow) => {
          const protocols = ['http', 'https']
          let success = true

          for (const protocol of protocols) {
            if (!app.setAsDefaultProtocolClient(protocol)) {
              success = false
              break
            }
          }

          if (success) {
            dialog.showMessageBox(browserWindow!, {
              type: 'info',
              title: 'Default Browser',
              message: 'Successfully set as default browser',
              detail: 'This browser will now handle web links by default.',
              buttons: ['OK']
            })
          } else {
            dialog.showMessageBox(browserWindow!, {
              type: 'error',
              title: 'Error',
              message: 'Could not set as default browser',
              detail:
                'There was an error while trying to set this as your default browser. You may need to change this in your system settings.',
              buttons: ['OK']
            })
          }
        }
      }
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
              submenu: [{ role: 'startSpeaking' }, { role: 'stopSpeaking' }]
            }
          ]
        : [{ role: 'delete' }, { type: 'separator' }, { role: 'selectAll' }]),
      {
        label: 'Find',
        accelerator: 'CmdOrCtrl+F',
        click: (menuItem, browserWindow) => {
          if (browserWindow) {
            browserWindow.webContents.send('find')
          }
        }
      }
    ]
  },
  // { role: 'viewMenu' }
  {
    label: 'View',
    submenu: [
      { label: 'Reload app', role: 'reload', accelerator: 'option+CmdOrCtrl+R' },
      {
        label: 'Reload',
        accelerator: 'CmdOrCtrl+R',
        click: (menuItem, browserWindow) => {
          if (browserWindow) {
            browserWindow.webContents.send('reload')
          }
        }
      },
      { role: 'forceReload' },
      {
        label: 'Toggle DevTools (App)',
        accelerator: 'Alt+Command+Shift+I',
        role: 'toggleDevTools'
      },
      { type: 'separator' },
      { role: 'resetZoom' },
      { role: 'zoomIn' },
      { role: 'zoomOut' },
      { type: 'separator' },
      { role: 'togglefullscreen' },
      {
        label: 'Toggle sidebar',
        accelerator: 'CmdOrCtrl+shift+b',
        click: (menuItem, browserWindow) => {
          if (browserWindow) {
            browserWindow.webContents.send('toggle-sidebar')
          }
        }
      }
    ]
  },
  // { role: 'windowMenu' }
  {
    label: 'Window',
    submenu: [
      { role: 'minimize' },
      { role: 'zoom' },
      { type: 'separator' },
      {
        label: 'Next Tab',
        accelerator: 'Control+Tab',
        click: (menuItem, browserWindow) => {
          if (browserWindow) {
            browserWindow.webContents.send('next-tab')
          }
        }
      },
      {
        label: 'Previous Tab',
        accelerator: 'Control+Shift+Tab',
        click: (menuItem, browserWindow) => {
          if (browserWindow) {
            browserWindow.webContents.send('previous-tab')
          }
        }
      },
      ...(isMac
        ? [{ type: 'separator' }, { role: 'front' }, { type: 'separator' }, { role: 'window' }]
        : [{ role: 'close' }])
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

async function createWindow(): Promise<void> {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 12, y: 15 },
    backgroundColor: '#09090b',
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      webviewTag: true,
      nodeIntegration: true,
      contextIsolation: false
    }
  })

  // Set up permission handling
  mainWindow.webContents.session.setPermissionRequestHandler(
    (webContents, permission, callback) => {
      const allowedPermissions = ['media']
      if (allowedPermissions.includes(permission)) {
        callback(true)
      } else {
        callback(false)
      }
    }
  )
  // let blocker = await ElectronBlocker.fromPrebuiltAdsAndTracking(fetch) // ads only
  //
  // blocker.enableBlockingInSession(mainWindow.webContents.session)

  // @ts-ignore
  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.on('did-attach-webview', (_, contents) => {
    contents.setWindowOpenHandler((details) => {
      mainWindow.webContents.send('open-url', details.url)
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
      console.log('Show traffic lights')
    } else {
      mainWindow.setWindowButtonVisibility(false)
      console.log('Hide traffic lights')
    }
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
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')
  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('web-contents-created', (e, contents) => {
  if (contents.getType() == 'webview') {
    // set context menu in webview contextMenu({ window: contents, });
    contextMenu({
      window: contents,
      prepend: (defaultActions, params, mainWindow) => [
        // Can add custom right click actions here
      ],
      showInspectElement: true,
      showSaveImageAs: true,
      showSaveImage: true,
      showCopyImageAddress: true,
      showCopyImage: true,
      showCopyVideoAddress: true,
      showSaveVideo: true,
      showSaveVideoAs: true
    })
  }
})

// app.userAgentFallback = app.userAgentFallback.replace('Chrome/' + process.versions.chrome, 'Chrome')
const newUserAgent = app.userAgentFallback
  .replace(
    /Chrome\/[\d.]+/,
    'Chrome/130.0.0.0' // Example: Update to a recent Chrome version
  )
  .replace(/Electron\/[\d.]+/, '')
  .replace(/formalsurf-refactor\/[\d.]+/, '')

// also replace Electron/* with nothing, and replace formalsurf-refactor/* with nothing
app.userAgentFallback = newUserAgent // app.userAgentFallback = newUserAgent

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
