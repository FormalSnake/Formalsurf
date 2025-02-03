
import './assets/index.css'
import { ThemeProvider } from "@renderer/components/theme-provider"

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="system" storageKey="theme">
      <p>Settings</p>
    </ThemeProvider>
  </React.StrictMode>
)
