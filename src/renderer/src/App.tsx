import React, { useEffect, useRef, useCallback, useState } from 'react'
import { atom, useAtom } from 'jotai'
import { activeTabRefAtom, tabsAtom, useCloseTab, useCreateNewTab } from '@/providers/TabProvider'
import { isNewTabDialogOpen, isUpdateAtom, NewTabDialog, tabBarUrl } from './components/NewTab'
import { sidebarOpenAtom } from './components/ui/sidebar'
import BaseLayout from './Layout'
import { Button } from './components/ui/button'
import Particles from './components/magicui/Particles'
import Meteors from './components/magicui/Meteor'
import BlurIn from './components/magicui/BlurIn'
import { TriangleAlert, WifiOff } from 'lucide-react' // Importing icons from Lucide
import { Input } from './components/ui/input'
import { AnimatePresence, motion } from 'framer-motion'
import { ipcRenderer } from 'electron'
import { Snake } from './components/snake'
import { ThemeProvider } from './components/theme-provider'
import { Home, homeOpenAtom } from './components/home'

import { FindInPage, findInPageVisibleAtom } from './components/FindInPage'

const Tab = React.memo(({ tab, isActive }: { tab: any; isActive: boolean }) => {
  const [tabs, setTabs] = useAtom(tabsAtom)
  const [activeTab, setActiveTab] = useAtom(activeTabRefAtom)
  const createNewTab = useCreateNewTab()
  const [hasLoadFailed, setHasLoadFailed] = useState(false)
  const [failedLoadMessage, setFailedLoadMessage] = useState('')
  const [failedLoadDescription, setFailedLoadDescription] = useState('')

  // Ensure ref is always initialized, even if it wasn't before
  const ref = useRef<WebviewElement | null>(tab.webviewRef?.current || null)
  const hasListenersRef = useRef(false)

  // Local state to manage the webview's src independently
  const initialSrc = useRef(tab.url) // Store initial URL to prevent re-renders
  const [currentUrl, setCurrentUrl] = React.useState(initialSrc.current)

  const [targetUrlOpen, setTargetUrlOpen] = useState(false)
  const [targetUrl, setTargetUrl] = useState('')

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
      }

      const didNavigateInPageHandler = (event: any) => {
        if (event.isMainFrame) {
          navigateHandler(tab.id, event)
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
      {isActive && <FindInPage webviewRef={ref} />}
    </div>
  )
})

function App(): JSX.Element {
  const [tabs, setTabs] = useAtom(tabsAtom)
  const closeTab = useCloseTab()
  const initializedTabs = useRef<Set<number>>(new Set()) // Track initialized tabs
  const [tabDialogOpen, setTabDialogOpen] = useAtom(isNewTabDialogOpen)
  const [sidebarOpen, setSidebarOpen] = useAtom(sidebarOpenAtom)
  const [isUpdate, setIsUpdate] = useAtom(isUpdateAtom)
  const [activeTab, setActiveTab] = useAtom(activeTabRefAtom)
  const [, setFindInPageVisible] = useAtom(findInPageVisibleAtom)
  const toggleFindInPage = () => {
    setFindInPageVisible((prev) => !prev)
  }

  const [theme, setTheme] = React.useState<'dark' | 'light' | 'system'>('system')
  const [homeOpen, setHomeOpen] = useAtom(homeOpenAtom)

  React.useEffect(() => {
    // @ts-ignore
    window.api
      .getSettings('theme')
      .then((savedTheme: any) => {
        if (savedTheme) {
          setTheme(savedTheme)
        }
      })
      .catch((error: any) => {
        console.error('Error fetching theme setting:', error)
      })

    // Listen for theme changes
    // @ts-ignore
    window.api.onSettingChanged((event: any, key: string, value: any) => {
      if (key === 'theme') {
        setTheme(value || 'system')
      }
    })
  }, [])

  useEffect(() => {
    //@ts-ignore
    window.api.handle(
      'close-active-tab',
      (event: any, data: any) =>
        function (event: any, data: any) {
          console.log('close-active-tab')
          closeTab()
          // remove api handler
          // @ts-ignore
          window.api.removeHandler('close-active-tab', closeTab)
        },
      event
    )

    // @ts-ignore
    window.api.handle(
      'new-tab',
      (event: any, data: any) =>
        function (event: any, data: any) {
          console.log('new-tab')
          setIsUpdate(false)
          setTabDialogOpen(true)
          // Pass false to indicate creating a new tab
          // <NewTabDialog isUpdate={false} />
          // remove api handler
          // @ts-ignore
          window.api.removeHandler('new-tab', setTabDialogOpen)
        },
      event
    )

    // toggle-sidebar listener
    // @ts-ignore
    window.api.handle(
      'toggle-sidebar',
      (event: any, data: any) =>
        function (event: any, data: any) {
          console.log('toggle-sidebar')
          setSidebarOpen((open) => !open)
          console.log(sidebarOpen)
          // remove api handler
          // @ts-ignore
          window.api.removeHandler('toggle-sidebar', setSidebarOpen)
        },
      event
    )

    // @ts-ignore
    window.api.handle(
      'open-url-bar',
      (event: any, data: any) =>
        function (event: any, data: any) {
          console.log('open-url-bar')
          setIsUpdate(true)
          setTabDialogOpen(true)
          // Pass true to indicate updating an existing tab
          // <NewTabDialog isUpdate={true} />
          // remove api handler
          // @ts-ignore
          window.api.removeHandler('open-url-bar', setTabDialogOpen)
        },
      event
    )

    // @ts-ignore
    window.api.handle(
      'find',
      (event: any, data: any) =>
        function (event: any, data: any) {
          console.log('find')
          toggleFindInPage()
          // Pass true to indicate updating an existing tab
          // <NewTabDialog isUpdate={true} />
          // remove api handler
          // @ts-ignore
          window.api.removeHandler('find', toggleFindInPage)
        },
      event
    )

    // Cleanup function to remove handlers
    // return () => {
    //   // @ts-ignore
    //   window.api.removeHandler('open-url', handleOpenUrl)
    //   // @ts-ignore
    //   window.api.removeHandler('close-active-tab', closeTab)
    //   // @ts-ignore
    //   window.api.removeHandler('new-tab', setTabDialogOpen)
    //   // @ts-ignore
    //   window.api.removeHandler('toggle-sidebar', setSidebarOpen)
    //   // @ts-ignore
    //   window.api.removeHandler('open-url-bar', setTabDialogOpen)
    //   // @ts-ignore
    //   window.api.removeHandler('find', toggleFindInPage)
    // }
  }, [])

  return (
    <ThemeProvider defaultTheme={theme}>
      <div className="min-h-screen bg-background">
        <BaseLayout>
          <div className="w-full h-full">
            {homeOpen && <Home />}
            {tabs.map((tab) => (
              <Tab key={tab.id} tab={tab} isActive={tab.isActive} />
            ))}
            {tabs.length === 0 && !homeOpen && (
              <div className="w-full h-full flex justify-center items-center text-foreground">
                <Particles className="absolute inset-0" quantity={100} ease={80} refresh />
                <Meteors number={5} />
                <div className="text-center z-10 mb-32 space-y-4">
                  <BlurIn word="Formalsurf" className="text-sm font-bold" />
                  <p>The vast universe is waiting for you to explore.</p>
                </div>
              </div>
            )}
          </div>
        </BaseLayout>
      </div>
    </ThemeProvider>
  )
}

export default App
