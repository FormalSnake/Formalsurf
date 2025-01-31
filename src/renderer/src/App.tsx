import { Sidebar } from '@renderer/components/browser/sidebar'
import { BrowserView } from '@renderer/components/browser/browserview'
import { JSX } from 'react'

function App(): JSX.Element {
  // const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')

  return (
    <main className="min-h-screen antialiased flex">
      <Sidebar />
      <BrowserView />
    </main>
  )
}

export default App
