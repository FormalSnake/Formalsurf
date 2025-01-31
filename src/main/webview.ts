import { BrowserWindow } from 'electron';
import { buildChromeContextMenu } from 'electron-chrome-context-menu'

export function webview(_event: { preventDefault: () => void; readonly defaultPrevented: boolean; }, webContents: Electron.WebContents, extensions: any) {
  if (webContents.getType() == 'webview') {
    const existingWindow = BrowserWindow.getAllWindows()[0]

    extensions.addTab(webContents, existingWindow)
    extensions.selectTab(webContents)
    console.log("Tab", webContents.id)

    webContents.setVisualZoomLevelLimits(1, 4)

    webContents.on('context-menu', (_e, params) => {
      const menu = buildChromeContextMenu({
        params,
        webContents,
        extensionMenuItems: extensions.getContextMenuItems(webContents, params),
        openLink: (url, _disposition) => {
          webContents.loadURL(url)
        }
      })

      menu.popup()
    })
  }
}
