import { Sidebar } from '@renderer/components/browser/sidebar'
import { BrowserView } from '@renderer/components/browser/browserview'
import { JSX, useEffect } from 'react'
import { CommandMenu } from './components/browser/NewTabDialog'
import { newTab } from './components/browser/webview'
import { useAtom } from 'jotai'
import { tabsAtom } from './atoms/browser'

function App(): JSX.Element {
  const [tabs, setTabs] = useAtom(tabsAtom)
  // const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')
  useEffect(() => {
    window.electron.ipcRenderer.on('open-url', (_event, url) => {
      console.log("Handling URL:", url)
      newTab(url, 'New Tab', setTabs)
    })

    return () => {
      window.electron.ipcRenderer.removeAllListeners('open-url')
    }
  }, [newTab])

  return (
    <main className="min-h-screen antialiased flex">
      <CommandMenu />
      <Sidebar />
      <BrowserView />
    </main>
  )
}

export default App
