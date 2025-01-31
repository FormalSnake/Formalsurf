import { Sidebar } from '@renderer/components/browser/sidebar'
import { BrowserView } from '@renderer/components/browser/browserview'
import { JSX } from 'react'
import { CommandMenu } from './components/browser/NewTabDialog'

function App(): JSX.Element {
  // const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')

  return (
    <main className="min-h-screen antialiased flex">
      <CommandMenu />
      <Sidebar />
      <BrowserView />
    </main>
  )
}

export default App
