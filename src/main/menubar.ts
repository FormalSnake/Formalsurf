import { app, dialog } from "electron";

const isMac = process.platform === 'darwin'

export const template = [
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
      },
      {
        label: 'History',
        accelerator: 'CmdOrCtrl+Y',
        click: (menuItem, browserWindow) => {
          if (browserWindow) {
            browserWindow.webContents.send('toggle-history')
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
        label: 'Toggle DevTools (Renderer)',
        accelerator: 'Alt+Command+I',
        click: (menuItem, browserWindow) => {
          if (browserWindow) {
            browserWindow.webContents.send('toggle-devtools')
          }
        }
      },
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
          await shell.openExternal('https://surf.formalsnake.dev/')
        }
      }
    ]
  }
]
