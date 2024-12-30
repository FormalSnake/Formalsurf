import React, { useEffect, useRef, useState } from 'react'
import { useAtom } from 'jotai'
import { activeTabRefAtom, tabsAtom, useCreateNewTab } from '@/providers/TabProvider'
import { readingModeTabsAtom } from '@/atoms/reading-mode'
import { ReadingMode } from './ReadingMode'
import { Button } from './ui/button'
import { TriangleAlert, WifiOff } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { Snake } from './snake'
import { FindInPage } from './FindInPage'
import { historyAtom } from '@renderer/atoms/history'

export const Tab = React.memo(({ tab, isActive }: { tab: any; isActive: boolean }) => {
  const [tabs, setTabs] = useAtom(tabsAtom)
  const [activeTab, setActiveTab] = useAtom(activeTabRefAtom)
  const createNewTab = useCreateNewTab()
  const [hasLoadFailed, setHasLoadFailed] = useState(false)
  const [failedLoadMessage, setFailedLoadMessage] = useState('')
  const [failedLoadDescription, setFailedLoadDescription] = useState('')
  const [history, setHistory] = useAtom(historyAtom)

  // Ensure ref is always initialized, even if it wasn't before
  const ref = useRef<WebviewElement | null>(tab.webviewRef?.current || null)
  const hasListenersRef = useRef(false)

  // Local state to manage the webview's src independently
  const initialSrc = useRef(tab.url) // Store initial URL to prevent re-renders
  const [currentUrl, setCurrentUrl] = React.useState(initialSrc.current)

  const [targetUrlOpen, setTargetUrlOpen] = useState(false)
  const [targetUrl, setTargetUrl] = useState('')
  const [readingModeTabs, setReadingModeTabs] = useAtom(readingModeTabsAtom)
  const isReadingMode = readingModeTabs[tab.id] || false

  useEffect(() => {
    const handleReadingMode = () => {
      if (isActive) {
        setReadingModeTabs(prev => {
          const newState = {
            ...prev,
            [tab.id]: !prev[tab.id]
          };
          // If we're disabling reading mode, refresh the tab
          // if (prev[tab.id] && !newState[tab.id] && ref.current) {
          //   ref.current.reload();
          // }
          return newState;
        });
      }
    }

    window.electron.ipcRenderer.on('toggle-reading-mode', handleReadingMode)
    return () => {
      window.electron.ipcRenderer.removeListener('toggle-reading-mode', handleReadingMode)
    }
  }, [setReadingModeTabs, isActive, tab.id])

  useEffect(() => {
    const webview = ref.current

    if (webview && !hasListenersRef.current) {
      console.log(`Adding listeners for tab ${tab.url}`)
      hasListenersRef.current = true

      const updateTabState = (id: string, update: Partial<typeof tab>) => {
        setTabs((prevTabs) => {
          const tabExists = prevTabs.some((prevTab) => prevTab.id === id)
          if (!tabExists) {
            console.warn(`Tab with id ${id} not found!`)
            return prevTabs
          }
          return prevTabs.map((prevTab) =>
            prevTab.id === id ? { ...prevTab, ...update } : prevTab
          )
        })
      }

      const navigateHandler = (id: string, event: { url: string }) => {
        updateTabState(id, { url: event.url })
        setHistory(prev => [...prev, { url: event.url, title: tab.title, date: new Date() }])
      }

      const titleHandler = (id: string, event: { title: string }) => {
        updateTabState(id, { title: event.title })
      }

      const faviconHandler = (id: string, event: { favicons: string[] }) => {
        if (event.favicons.length > 0) {
          updateTabState(id, { favicon: event.favicons[0] })
        }
      }

      const startLoadingHandler = () => {
        updateTabState(tab.id, { isLoading: true })
        setHasLoadFailed(false)
      }

      const stopLoadingHandler = () => {
        updateTabState(tab.id, { isLoading: false })
      }

      const didNavigateHandler = (event: any) => {
        navigateHandler(tab.id, event)
        const historyEntry = {
          url: event.url,
          title: tab.title || 'Untitled',
          date: new Date(),
          tabId: tab.id
        }
        setHistory(prev => {
          // Avoid duplicate entries
          const isDuplicate = prev.some(item => 
            item.url === historyEntry.url && 
            Date.now() - item.date.getTime() < 1000
          )
          if (!isDuplicate) {
            return [...prev, historyEntry]
          }
          return prev
        })
      }

      const didNavigateInPageHandler = (event: any) => {
        if (event.isMainFrame) {
          navigateHandler(tab.id, event)
          const historyEntry = {
            url: event.url,
            title: tab.title || 'Untitled',
            date: new Date(),
            tabId: tab.id
          }
          setHistory(prev => {
            // Avoid duplicate entries
            const isDuplicate = prev.some(item => 
              item.url === historyEntry.url && 
              Date.now() - item.date.getTime() < 1000
            )
            if (!isDuplicate) {
              return [...prev, historyEntry]
            }
            return prev
          })
        }
      }

      const pageTitleHandler = (event: any) => {
        titleHandler(tab.id, event)
      }

      const pageFaviconHandler = (event: any) => {
        faviconHandler(tab.id, event)
      }

      const failLoadHandler = (event: any) => {
        if (event.errorCode !== -3 && event.errorCode !== -27) {
          setHasLoadFailed(true)
          setFailedLoadMessage(event.errorCode)
          setFailedLoadDescription(event.errorDescription)
          updateTabState(tab.id, { isLoading: false, title: 'Failed to load' })
        }
      }

      const newWindowHandler = (event: any) => {
        event.preventDefault()
        createNewTab({ url: event.url })
      }

      const updateTargetUrlHandler = (event: any) => {
        event.preventDefault()
        if (event.url) {
          setTargetUrlOpen(true)
          setTargetUrl(event.url)
        } else {
          setTargetUrlOpen(false)
        }
      }

      webview.addEventListener('did-start-loading', startLoadingHandler)
      webview.addEventListener('did-stop-loading', stopLoadingHandler)
      webview.addEventListener('did-navigate', didNavigateHandler)
      webview.addEventListener('did-navigate-in-page', didNavigateInPageHandler)
      webview.addEventListener('page-title-updated', pageTitleHandler)
      webview.addEventListener('page-favicon-updated', pageFaviconHandler)
      webview.addEventListener('did-fail-load', failLoadHandler)
      webview.addEventListener('new-window', newWindowHandler)
      webview.addEventListener('update-target-url', updateTargetUrlHandler)

      // Return cleanup function
      return () => {
        if (webview) {
          webview.removeEventListener('did-start-loading', startLoadingHandler)
          webview.removeEventListener('did-stop-loading', stopLoadingHandler)
          webview.removeEventListener('did-navigate', didNavigateHandler)
          webview.removeEventListener('did-navigate-in-page', didNavigateInPageHandler)
          webview.removeEventListener('page-title-updated', pageTitleHandler)
          webview.removeEventListener('page-favicon-updated', pageFaviconHandler)
          webview.removeEventListener('did-fail-load', failLoadHandler)
          webview.removeEventListener('new-window', newWindowHandler)
          webview.removeEventListener('update-target-url', updateTargetUrlHandler)
          hasListenersRef.current = false
        }
      }
    }
  }, [tab.id, tab.url])

  // Keep the active tab reference updated
  useEffect(() => {
    if (isActive && ref.current) {
      setActiveTab(ref.current)
    }
  }, [isActive, setActiveTab])

  return (
    <div className={`tab-container w-full h-full ${isActive ? '' : 'hidden'}`} key={tab.id}>
      <AnimatePresence>
        {targetUrlOpen && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="text-xs m-1 h-fit w-fit max-w-[500px] z-50 p-1 px-2 truncate bg-popover border-border border fixed bottom-4 right-4 rounded-lg pointer-events-none"
          >
            {targetUrl}
          </motion.div>
        )}
      </AnimatePresence>
      <webview
        ref={ref}
        src={initialSrc.current}
        className={`w-full h-full bg-foreground ${hasLoadFailed ? 'hidden' : ''}`}
        webpreferences="autoplayPolicy=user-gesture-required,defaultFontSize=16,contextIsolation=true,nodeIntegration=false,sandbox=true,webSecurity=true,enableCamera=true,enableMicrophone=true"
        allowpopups="true"
        partition="persist:webview"
        key={tab.id}
      />
      {hasLoadFailed && (
        <div className="w-full h-full flex flex-col items-center justify-center">
          <div className="flex flex-col w-fit space-y-2">
            {failedLoadMessage == '-106' ? (
              <>
                <WifiOff className="w-10 h-10" />
                <Snake />
              </>
            ) : (
              <TriangleAlert className="w-10 h-10" />
            )}
            <span>
              <a href={tab.url}>{tab.url}</a> failed to load
            </span>
            <span className="text-neutral-600">
              {failedLoadDescription} ({failedLoadMessage})
            </span>
            <Button
              onClick={() => {
                ref.current?.reload()
              }}
            >
              Reload
            </Button>
          </div>
        </div>
      )}
      {isActive && (
        <>
          <FindInPage webviewRef={ref} />
          {isReadingMode && <ReadingMode webviewRef={ref} />}
        </>
      )}
    </div>
  )
})
