import { app, shell, BrowserWindow, ipcMain, Menu, dialog, session } from 'electron'
import path, { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import contextMenu from 'electron-context-menu'
import { ElectronBlocker } from '@ghostery/adblocker-electron'
import fetch from 'cross-fetch' // required 'fetch'
import Store from 'electron-store'
import { setAsDefaultBrowserLinux } from './linux-utils'
import electronUpdater, { type AppUpdater } from 'electron-updater';
import { ElectronChromeExtensions } from 'electron-chrome-extensions'
import { installChromeWebStore, installExtension, updateExtensions } from 'electron-chrome-web-store'
import { buildChromeContextMenu } from 'electron-chrome-context-menu'

const isMac = process.platform === 'darwin'

const store = new Store()

export function getAutoUpdater(): AppUpdater {
  // Using destructuring to access autoUpdater due to the CommonJS module of 'electron-updater'.
  // It is a workaround for ESM compatibility issues, see https://github.com/electron-userland/electron-builder/issues/7976.
  const { autoUpdater } = electronUpdater;

  // Configure auto updater
  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;

  // Setup all event handlers
  autoUpdater.on('checking-for-update', () => {
    console.log('Checking for updates...');
  });

  autoUpdater.on('update-available', (info) => {
    dialog.showMessageBox({
      type: 'info',
      title: 'Update Available',
      message: `Version ${info.version} is available`,
      detail: 'A new version is being downloaded. You will be notified when it is ready to install.',
      buttons: ['OK']
    });
  });

  autoUpdater.on('update-not-available', () => {
    console.log('Update not available');
  });

  autoUpdater.on('error', (err) => {
    console.error('Update error:', err);
    dialog.showMessageBox({
      type: 'error',
      title: 'Update Error',
      message: 'An error occurred while updating',
      detail: err.message,
      buttons: ['OK']
    });
  });

  autoUpdater.on('download-progress', (progress) => {
    console.log(`Download progress: ${progress.percent}%`);
  });

  autoUpdater.on('update-downloaded', () => {
    dialog.showMessageBox({
      type: 'info',
      title: 'Update Ready',
      message: 'A new version has been downloaded',
      detail: 'The application will restart to install the update',
      buttons: ['Restart Now', 'Later']
    }).then((result) => {
      if (result.response === 0) {
        autoUpdater.quitAndInstall(false, true);
      }
    });
  });

  return autoUpdater;
}

const template = [
  // { role: 'appMenu' }
  ...(isMac
    ? [
      {
        label: app.name,
        submenu: [
          { role: 'about' },
          { type: 'separator' },
          {
            label: 'Settings',
            accelerator: 'CmdOrCtrl+,',
            click: (menuItem, browserWindow) => {
              if (browserWindow) {
                browserWindow.webContents.send('show-settings')
              }
            }
          },
          {
            label: 'Check for updates',
            click: async () => {
              const autoUpdater = getAutoUpdater();
              // dialog.showMessageBox({
              //   type: 'info',
              //   title: 'Updates',
              //   message: 'Checking for updates...',
              //   buttons: ['OK']
              // });
              await autoUpdater.checkForUpdates();
            }
          },
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
            // Prevent the window from closing on Linux
            if (process.platform === 'linux') {
              browserWindow.setClosable(false)
              browserWindow.webContents.send('close-active-tab')
              // Re-enable window closing after a short delay
              setTimeout(() => {
                if (!browserWindow.isDestroyed()) {
                  browserWindow.setClosable(true)
                }
              }, 100)
            } else {
              browserWindow.webContents.send('close-active-tab')
            }
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
          if (process.platform === 'linux') {
            const result = await setAsDefaultBrowserLinux()
            if (result.success) {
              dialog.showMessageBox(browserWindow!, {
                type: 'info',
                title: 'Default Browser',
                message: 'Successfully set as default browser',
                detail: 'This browser will now handle web links by default.',
                buttons: ['OK']
              })
            } else {
              console.log('Failed to set as default browser on Linux:', result.error)
            }
          } else {
            const protocols = ['http', 'https', 'file', 'pdf', 'html', 'htm']
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
              console.log('Failed to set as default browser')
            }
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
      },
      {
        label: 'Reading Mode',
        accelerator: 'CmdOrCtrl+Alt+Shift+R',
        click: (menuItem, browserWindow) => {
          if (browserWindow) {
            browserWindow.webContents.send('toggle-reading-mode')
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

// Handle command line argument URL if provided
const url = process.argv[process.argv.length - 1]
if (url && !url.startsWith('-') && url !== '.' && url !== './') {
  let processedUrl = url
  // Check if it's a valid URL or domain name
  if (!url.match(/^https?:\/\//)) {
    // Basic domain validation
    if (url.match(/^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/)) {
      processedUrl = `https://${url}`
    }
  }
  if (processedUrl.match(/^https?:\/\/.+\..+/)) {
    // If we have an existing window, use it
    const existingWindow = BrowserWindow.getAllWindows()[0]
    if (existingWindow) {
      existingWindow.webContents.send('open-url', processedUrl)
      if (existingWindow.isMinimized()) existingWindow.restore()
      existingWindow.focus()
    } else {
      // Store URL to be opened after window creation
      app.once('browser-window-created', (_, window) => {
        window.once('ready-to-show', () => {
          window.webContents.send('open-url', processedUrl)
        })
      })
    }
  }
}


// Set up extensions before creating any windows
async function setupExtensions(sharedSession: Electron.Session): Promise<void> {
  console.log('setupExtensions', sharedSession)
  // Install extensions to the shared session
  await installChromeWebStore({
    session: sharedSession,
    modulePath: path.join(__dirname, 'electron-chrome-web-store'),
  })

  // Install core extensions
  await installExtension('fmkadmapgofadopljbjfkapdkoienihi', { // React Dev Tools
    loadExtensionOptions: { allowFileAccess: true },
    session: sharedSession,
  })

  await installExtension('gebbhagfogifgggkldgodflihgfeippi', { // Return YouTube Dislike
    session: sharedSession
  })

  await installExtension('ponfpcnoihfmfllpaingbgckeeldkhle', {
    session: sharedSession
  }) // Youtube enhancer

  await installExtension('ddkjiahejlhfcafbddmgiahcphecmpfh', { // uBlock Origin Lite
    session: sharedSession
  })

  await installExtension('eimadpbcbfnmbkopoojfekhnkhdbieeh', { // dark reader
    session: sharedSession
  })

  // Check for extension updates
  await updateExtensions()
}

// Store shared session and extensions map as module-level variables
let sharedSession: Electron.Session
const initializedExtensions = new Map<string, ElectronChromeExtensions>()
let browserSession: Electron.Session

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
      contextIsolation: false,
      session: browserSession
    }
  })

  // await installChromeWebStore({ session: session.defaultSession })

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

  if (store.get('searchEngine') === null) {
    store.set('searchEngine', 'google')
  }

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

  // A 'change-setting' event receiver that does store.set and store.get using a provided value with the event.
  ipcMain.handle('change-setting', async (event, key, value) => {
    store.set(key, value)
    // Notify all windows about the setting change
    BrowserWindow.getAllWindows().forEach((window) => {
      window.webContents.send('setting-changed', key, value)
    })
    return store.get(key)
  })

  // A 'get-setting' event receiver that does store.get using a provided value with the event.
  ipcMain.handle('get-setting', async (event, key) => {
    console.log('get-setting', key)
    return store.get(key)
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (process.env['ELECTRON_START_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_START_URL'])
  } else if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
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
  electronApp.setAppUserModelId('com.formalsnake')

  // Create shared session after app is ready
  sharedSession = session.fromPartition('persist:webview')

  // Set up extensions first
  if (sharedSession) {
    console.log('sharedSession', sharedSession)
    await setupExtensions(sharedSession)
  }
  // await setupExtensions(sharedSession)

  // Initialize and check for updates
  const autoUpdater = getAutoUpdater();
  try {
    await autoUpdater.checkForUpdates();
  } catch (err) {
    console.error('Error checking for updates:', err);
  }
  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // Handle URLs when app is launched with a URL
  app.on('open-url', (event, url) => {
    event.preventDefault()

    // Handle local files by converting to proper file:// URL
    let processedUrl = url
    if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('file://')) {
      // Remove any protocol prefix if present (like pdf://)
      const cleanPath = url.replace(/^[a-zA-Z]+:\/\//, '')
      // Convert to proper file URL, handling spaces and special characters
      processedUrl = `file://${encodeURI(cleanPath)}`
    }

    // If we already have a window, use it
    const existingWindow = BrowserWindow.getAllWindows()[0]
    if (existingWindow) {
      existingWindow.webContents.send('open-url', processedUrl)
      if (existingWindow.isMinimized()) existingWindow.restore()
      existingWindow.focus()
    } else {
      // If no window exists, create one and wait for it to be ready
      createWindow().then(() => {
        const window = BrowserWindow.getAllWindows()[0]
        if (window) {
          window.webContents.send('open-url', processedUrl)
        }
      })
    }
  })

  // Handle local files when opened directly
  app.on('open-file', (event, filePath) => {
    event.preventDefault()

    // Convert the file path to a proper file:// URL
    const fileUrl = `file://${encodeURI(filePath)}`

    // If we already have a window, use it
    const existingWindow = BrowserWindow.getAllWindows()[0]
    if (existingWindow) {
      existingWindow.webContents.send('open-url', fileUrl)
      if (existingWindow.isMinimized()) existingWindow.restore()
      existingWindow.focus()
    } else {
      // If no window exists, create one and wait for it to be ready
      createWindow().then(() => {
        const window = BrowserWindow.getAllWindows()[0]
        if (window) {
          window.webContents.send('open-url', fileUrl)
        }
      })
    }
  })

  createWindow()

  app.on('activate', function() {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('web-contents-created', async (e, contents) => {
  console.log('web-contents-created')
  if (contents.getType() == 'webview') {
    console.log('webview created')
    const existingWindow = BrowserWindow.getAllWindows()[0]

    // Set zoom limits
    contents.setVisualZoomLevelLimits(1, 4)

    // await installChromeWebStore({ session: contents.session }).catch(() => console.log("yo", contents.session))

    // Get or create extension handler for the session
    let extensions = initializedExtensions.get('persist:webview')
    if (!extensions) {
      extensions = new ElectronChromeExtensions({
        license: "GPL-3.0",
        session: sharedSession,
        modulePath: path.join(__dirname, 'electron-chrome-extensions'),
      })
      initializedExtensions.set('persist:webview', extensions)
    }

    // Add the tab to extension handler
    extensions.addTab(contents, existingWindow)

    // Set up context menu
    contents.on("context-menu", (event, params) => {
      const menu = buildChromeContextMenu({
        params,
        webContents: contents,
        extensionMenuItems: extensions.getContextMenuItems(contents, params),
        openLink: (url: string) => {
          existingWindow.webContents.send('open-url', url)
        }
      })
      menu.popup()
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
