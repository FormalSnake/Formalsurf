import { Sidebar } from '@renderer/components/browser/sidebar'
import { BrowserView } from '@renderer/components/browser/browserview'
import { JSX, useEffect } from 'react'
import { CommandMenu, openAtom } from './components/browser/NewTabDialog'
import { closeTab, newTab } from './components/browser/webview'
import { useAtom } from 'jotai'
import { activeTabRefAtom, tabsAtom } from './atoms/browser'

function App(): JSX.Element {
  const [tabs, setTabs] = useAtom(tabsAtom)
  const [newTabDialogOpen, setNewTabDialogOpen] = useAtom(openAtom)

  // const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')
  useEffect(() => {
    window.electron.ipcRenderer.on('open-url', (_event, url) => {
      console.log("Handling URL:", url)
      newTab(url, 'New Tab', setTabs)
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
        closeTab(activeTab.id, setTabs)
      }
    })

    return () => {
      window.electron.ipcRenderer.removeAllListeners('open-url')
      window.api.removeHandler('new-tab')
      window.api.removeHandler('close-active-tab')
    }
  }, [tabs, setTabs, setNewTabDialogOpen])

  return (
    <main className="min-h-screen antialiased flex">
      <CommandMenu />
      <Sidebar />
      <BrowserView />
    </main>
  )
}

export default App
