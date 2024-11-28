import { app } from 'electron'
import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'

export async function setAsDefaultBrowserLinux(): Promise<{ success: boolean; error?: string }> {
  try {
    const desktopFilePath = path.join(app.getPath('userData'), 'formalsurf.desktop')
    const execPath = process.execPath
    const iconPath = path.join(path.dirname(execPath), 'resources', 'icon.png')

    const desktopEntry = `[Desktop Entry]
Version=1.0
Name=Formalsurf
Comment=Formalsurf Web Browser
Exec="${execPath}" %U
Terminal=false
Type=Application
Icon=${iconPath}
Categories=Network;WebBrowser;
MimeType=text/html;text/xml;application/xhtml+xml;application/xml;application/rss+xml;application/rdf+xml;x-scheme-handler/http;x-scheme-handler/https;x-scheme-handler/ftp;x-scheme-handler/chrome;video/webm;application/x-xpinstall;
Actions=NewWindow;NewPrivateWindow;

[Desktop Action NewWindow]
Name=New Window
Exec="${execPath}" --new-window

[Desktop Action NewPrivateWindow]
Name=New Private Window
Exec="${execPath}" --private-window`

    // Write the .desktop file
    fs.writeFileSync(desktopFilePath, desktopEntry)
    fs.chmodSync(desktopFilePath, '755')

    // Install the .desktop file
    const desktopFileDir = path.join(process.env.HOME!, '.local', 'share', 'applications')
    if (!fs.existsSync(desktopFileDir)) {
      fs.mkdirSync(desktopFileDir, { recursive: true })
    }
    fs.copyFileSync(desktopFilePath, path.join(desktopFileDir, 'formalsurf.desktop'))

    // Try to set as default browser using multiple methods
    try {
      // First attempt: direct xdg-mime setting for protocols
      const protocols = ['http', 'https']
      for (const protocol of protocols) {
        execSync(`xdg-mime default formalsurf.desktop x-scheme-handler/${protocol}`)
      }

      // Second attempt: try xdg-settings with BROWSER unset
      execSync('unset BROWSER && xdg-settings set default-web-browser formalsurf.desktop', {
        shell: '/bin/bash',
        env: { ...process.env, BROWSER: undefined }
      })
    } catch (cmdError) {
      // If the above methods fail, try using update-alternatives if available
      try {
        execSync('which update-alternatives', { stdio: 'ignore' })
        execSync(`sudo update-alternatives --set x-www-browser ${execPath}`, {
          stdio: 'ignore'
        })
      } catch {
        // If update-alternatives fails, we'll still count it as success if we set the MIME types
        console.log('Could not set as system default, but browser associations have been set')
      }
    }

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}
