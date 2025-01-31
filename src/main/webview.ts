import { buildChromeContextMenu } from 'electron-chrome-context-menu'

export function webview(event: { preventDefault: () => void; readonly defaultPrevented: boolean; }, webContents: Electron.WebContents) {
  webContents.on('context-menu', (e, params) => {
    const menu = buildChromeContextMenu({
      params,
      webContents,
      openLink: (url, disposition) => {
        webContents.loadURL(url)
      }
    })

    menu.popup()
  })
}
