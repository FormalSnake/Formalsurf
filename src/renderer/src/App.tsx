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
import { Search, ArrowUp, ArrowDown } from 'lucide-react' // Importing icons from Lucide
import { Input } from './components/ui/input'
import { AnimatePresence, motion } from 'framer-motion'
import { ipcRenderer } from 'electron'

const findInPageVisibleAtom = atom(false)

const FindInPage = ({ webviewRef }: { webviewRef: React.RefObject<WebviewElement> }) => {
  const [isVisible, setIsVisible] = useAtom(findInPageVisibleAtom)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSearch = () => {
    if (webviewRef.current) {
      webviewRef.current.findInPage(searchTerm)
    }
  }

  const handleNext = () => {
    if (webviewRef.current) {
      webviewRef.current.findInPage(searchTerm, { forward: true })
      setCurrentIndex((prev) => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (webviewRef.current) {
      webviewRef.current.findInPage(searchTerm, { forward: false })
      setCurrentIndex((prev) => Math.max(prev - 1, 0))
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSearch()
    } else if (event.key === 'Escape') {
      if (webviewRef.current) {
        webviewRef.current.stopFindInPage('clearSelection')
      }
      setIsVisible(false)
    }
  }

  useEffect(() => {
    if (isVisible && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isVisible])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="find-in-page-bar bg-popover border-border border fixed top-4 right-4  rounded-lg flex flex-row space-x-2"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          <Input
            ref={inputRef}
            value={searchTerm}
            className=" ring-0 outline-none border-none focus-visible:ring-offset-0 focus-visible:ring-0"
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Find in page..."
          />
          <Button size="icon" variant={'ghost'} onClick={handleSearch} className="min-w-10">
            <Search />
          </Button>
          <Button size="icon" variant={'ghost'} onClick={handlePrevious} className="min-w-10">
            <ArrowUp />
          </Button>
          <Button size="icon" variant={'ghost'} onClick={handleNext} className="min-w-10">
            <ArrowDown />
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

const Tab = React.memo(({ tab, isActive }: { tab: any; isActive: boolean }) => {
  const [tabs, setTabs] = useAtom(tabsAtom)
  const [activeTab, setActiveTab] = useAtom(activeTabRefAtom)

  // Ensure ref is always initialized, even if it wasn't before
  const ref = useRef<WebviewElement | null>(tab.webviewRef?.current || null)

  // Local state to manage the webview's src independently
  const initialSrc = useRef(tab.url) // Store initial URL to prevent re-renders
  const [currentUrl, setCurrentUrl] = React.useState(initialSrc.current)

  useEffect(() => {
    const webview = ref.current

    if (webview && !webview.hasListeners) {
      console.log(`Adding listeners for tab ${tab.url}`)

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
        console.log(`NavigateHandler triggered for id: ${id}, url: ${event.url}`)
        if (event.url !== currentUrl) {
          setCurrentUrl(event.url) // Update local state without triggering a WebView reload
          updateTabState(id, { url: event.url })
        }
      }

      const titleHandler = (id: string, event: { title: string }) => {
        console.log(`TitleHandler triggered for id: ${id}, title: ${event.title}`)
        updateTabState(id, { title: event.title })
      }

      const faviconHandler = (id: string, event: { favicons: string[] }) => {
        console.log(`FaviconHandler triggered for id: ${id}, favicons: ${event.favicons}`)
        if (event.favicons.length > 0) {
          updateTabState(id, { favicon: event.favicons[0] })
        }
      }

      webview.addEventListener('did-navigate', (event) => {
        navigateHandler(tab.id, event)
      })

      webview.addEventListener('did-navigate-in-page', (event) => {
        if (event.isMainFrame) {
          navigateHandler(tab.id, event)
        }
      })

      webview.addEventListener('page-title-updated', (event) => {
        titleHandler(tab.id, event)
      })

      webview.addEventListener('page-favicon-updated', (event) => {
        faviconHandler(tab.id, event)
      })

      webview.hasListeners = true

      // Cleanup function
      return () => {
        webview.removeEventListener('did-navigate', navigateHandler)
        webview.removeEventListener('did-navigate-in-page', navigateHandler)
        webview.removeEventListener('page-title-updated', titleHandler)
        webview.removeEventListener('page-favicon-updated', faviconHandler)
        webview.hasListeners = false
      }
    }
    return () => { }
  }, [ref, tab.id, setTabs, currentUrl])

  // Keep the active tab reference updated
  useEffect(() => {
    if (isActive && ref.current) {
      setActiveTab(ref.current)
    }
  }, [isActive, setActiveTab])

  return (
    <div className={`tab-container w-full h-full ${isActive ? '' : 'hidden'}`}>
      <webview
        ref={ref}
        src={initialSrc.current}
        className="w-full h-full bg-foreground"
        webpreferences="autoplayPolicy=user-gesture-required,defaultFontSize=16,contextIsolation=true,nodeIntegration=false,sandbox=true,webSecurity=true"
        allowpopups="true"
        partition="persist:webview"
      />
      {isActive && <FindInPage webviewRef={ref} />}
    </div>
  )
})

function App(): JSX.Element {
  const [tabs, setTabs] = useAtom(tabsAtom)
  const createNewTab = useCreateNewTab()
  const closeTab = useCloseTab()
  const initializedTabs = useRef<Set<number>>(new Set()) // Track initialized tabs
  const [tabDialogOpen, setTabDialogOpen] = useAtom(isNewTabDialogOpen)
  const [sidebarOpen, setSidebarOpen] = useAtom(sidebarOpenAtom)
  const [isUpdate, setIsUpdate] = useAtom(isUpdateAtom)
  const [, setFindInPageVisible] = useAtom(findInPageVisibleAtom)
  const toggleFindInPage = () => {
    setFindInPageVisible((prev) => !prev)
  }

  const handleOpenUrl = useCallback(
    (event: any, data: any) => {
      console.log('handleOpenUrl')
      createNewTab({ url: data })
    },
    [createNewTab]
  )

  const memoizedHandleOpenUrl = useCallback((event: any, data: any) => {
    console.log('open-url', data);
    handleOpenUrl(event, data);
  }, [tabs]);

  useEffect(() => {
    // @ts-ignore
    window.api.handle(
      'open-url',
      (event: any, data: any) =>
        function(event: any, data: any) {
          console.log('open-url', data)
          memoizedHandleOpenUrl(event, data)
          // handleOpenUrl(event, data)
        },
      event
    )
  }, [tabs])

  useEffect(() => {
    //@ts-ignore
    window.api.handle(
      'close-active-tab',
      (event: any, data: any) =>
        function(event: any, data: any) {
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
        function(event: any, data: any) {
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
        function(event: any, data: any) {
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
        function(event: any, data: any) {
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
        function(event: any, data: any) {
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

  // useEffect(() => {
  //   // @ts-ignore
  //   window.api.handle("open-url", handleOpenUrl);
  //   return () => {
  //     // @ts-ignore
  //     window.api.removeHandler("open-url", handleOpenUrl);
  //   };
  // }, [handleOpenUrl]);

  return (
    <BaseLayout>
      <div className="w-full h-full">
        {tabs.map((tab) => (
          <Tab key={tab.id} tab={tab} isActive={tab.isActive} />
        ))}
        {tabs.length === 0 && (
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
  )
}

export default App
