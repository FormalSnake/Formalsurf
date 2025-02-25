import { Sidebar, sidebarVisibleAtom } from '@renderer/components/browser/sidebar'
import { BrowserView } from '@renderer/components/browser/browserview'
import { JSX, useEffect } from 'react'
import { CommandMenu, openAtom } from './components/browser/NewTabDialog'
import { closeTab, handleToggleDevTools, newTab, reloadTab, toggleReadingMode } from './components/browser/webview'
import { useAtom } from 'jotai'
import { activeTabRefAtom, tabsAtom } from './atoms/browser'
import { SettingsDialog, settingsOpenAtom } from './components/settings/Settings'

function App(): JSX.Element {
  const [tabs, setTabs] = useAtom(tabsAtom)
  const [_newTabDialogOpen, setNewTabDialogOpen] = useAtom(openAtom)
  const [isSidebarVisible, setIsSidebarVisible] = useAtom(sidebarVisibleAtom)
  const [activeTabRef, _setActiveTabRef] = useAtom(activeTabRefAtom);
  const [settingsOpen, setSettingsOpen] = useAtom(settingsOpenAtom)

  // const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')
  useEffect(() => {
    window.electron.ipcRenderer.on('open-url', (_event, url) => {
      console.log("Handling URL:", url)
      newTab(url, 'Loading...', setTabs)
    })

    // hotkeys
    // @ts-expect-error
    window.api.handle('new-tab', (event: any, data: any) => function(event: any, data: any) {
      setNewTabDialogOpen(true)
    })
    // @ts-expect-error
    window.api.handle('close-active-tab', (event: any, data: any) => function(event: any, data: any) {
      const activeTab = tabs.find((tab) => tab.isActive)
      if (activeTab) {
        closeTab(activeTab.id, tabs, setTabs)
      }
    })
    // @ts-expect-error
    window.api.handle('toggle-sidebar', (event: any, data: any) => function(event: any, data: any) {
      setIsSidebarVisible(!isSidebarVisible)
    })
    // @ts-expect-error
    window.api.handle('remove-tab', (event: any, data: any) => function(event: any, data: any) {
      const activeTab = tabs.find((tab) => tab.isActive)
      if (activeTab) {
        closeTab(activeTab.id, tabs, setTabs)
      }
    })
    // @ts-expect-error
    window.api.handle('reload', (event: any, data: any) => function(event: any, data: any) {
      if (activeTabRef) {
        reloadTab(activeTabRef)
      }
    })
    // @ts-expect-error
    window.api.handle('toggle-devtools', (event: any, data: any) => function(event: any, data: any) {
      if (activeTabRef) {
        console.log("Handling toggle devtools")
        handleToggleDevTools(activeTabRef)
      }
    })
    // @ts-expect-error
    window.api.handle('show-settings', (event: any, data: any) => function(event: any, data: any) {
      setSettingsOpen(!settingsOpen)
    })
    // @ts-expect-error
    window.api.handle('toggle-reading-mode', (event: any, data: any) => function(event: any, data: any) {
      toggleReadingMode(tabs.find((tab) => tab.isActive), setTabs)
    })

    return () => {
      window.electron.ipcRenderer.removeAllListeners('open-url')
      window.api.removeHandler('new-tab')
      window.api.removeHandler('close-active-tab')
      window.api.removeHandler('toggle-sidebar')
      window.api.removeHandler('remove-tab')
      window.api.removeHandler('reload')
      window.api.removeHandler('toggle-devtools')
      window.api.removeHandler('show-settings')
      window.api.removeHandler('toggle-reading-mode')
    }
  }, [tabs, setTabs, setNewTabDialogOpen, isSidebarVisible, setIsSidebarVisible, activeTabRef, settingsOpen, setSettingsOpen])

  return (
    <main className="min-h-screen antialiased flex flex-col h-screen">
      {/* <a href="/settings.html">Settings</a> */}
      <CommandMenu />
      <Sidebar />
      <BrowserView />
      <SettingsDialog />
    </main>
  )
}

export default App
