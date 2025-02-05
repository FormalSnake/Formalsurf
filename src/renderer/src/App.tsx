import { Sidebar, sidebarVisibleAtom } from '@renderer/components/browser/sidebar'
import { BrowserView } from '@renderer/components/browser/browserview'
import { JSX, useEffect } from 'react'
import { CommandMenu, openAtom } from './components/browser/NewTabDialog'
import { closeTab, handleToggleDevTools, newTab, reloadTab } from './components/browser/webview'
import { useAtom } from 'jotai'
import { activeTabRefAtom, tabsAtom } from './atoms/browser'
import { Button } from './components/ui/button'

function App(): JSX.Element {
  const [tabs, setTabs] = useAtom(tabsAtom)
  const [newTabDialogOpen, setNewTabDialogOpen] = useAtom(openAtom)
  const [isSidebarVisible, setIsSidebarVisible] = useAtom(sidebarVisibleAtom)
  const [activeTabRef, setActiveTabRef] = useAtom(activeTabRefAtom);

  // const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')
  useEffect(() => {
    window.electron.ipcRenderer.on('open-url', (_event, url) => {
      console.log("Handling URL:", url)
      newTab(url, 'Loading...', setTabs)
    })

    // hotkeys
    // @ts-expect-error
    window.api.handle('new-tab', (event, data) => function(event, data) {
      setNewTabDialogOpen(true)
    })
    // @ts-expect-error
    window.api.handle('close-active-tab', (event, data) => function(event, data) {
      const activeTab = tabs.find((tab) => tab.isActive)
      if (activeTab) {
        closeTab(activeTab.id, tabs, setTabs)
      }
    })
    // @ts-expect-error
    window.api.handle('toggle-sidebar', (event, data) => function(event, data) {
      setIsSidebarVisible(!isSidebarVisible)
    })
    // @ts-expect-error
    window.api.handle('remove-tab', (event, data) => function(event, data) {
      const activeTab = tabs.find((tab) => tab.isActive)
      if (activeTab) {
        closeTab(activeTab.id, tabs, setTabs)
      }
    })
    // @ts-expect-error
    window.api.handle('reload', (event, data) => function(event, data) {
      if (activeTabRef) {
        reloadTab(activeTabRef)
      }
    })
    // @ts-expect-error
    window.api.handle('toggle-devtools', (event, data) => function(event, data) {
      if (activeTabRef) {
        console.log("Handling toggle devtools")
        handleToggleDevTools(activeTabRef)
      }
    })

    return () => {
      window.electron.ipcRenderer.removeAllListeners('open-url')
      window.api.removeHandler('new-tab')
      window.api.removeHandler('close-active-tab')
      window.api.removeHandler('toggle-sidebar')
      window.api.removeHandler('remove-tab')
      window.api.removeHandler('reload')
      window.api.removeHandler('toggle-devtools')
    }
  }, [tabs, setTabs, setNewTabDialogOpen, isSidebarVisible, setIsSidebarVisible, activeTabRef])

  return (
    <main className="min-h-screen antialiased flex">
      {/* <a href="/settings.html">Settings</a> */}
      <CommandMenu />
      <Sidebar />
      <BrowserView />
    </main>
  )
}

export default App
