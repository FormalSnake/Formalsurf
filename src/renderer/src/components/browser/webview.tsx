import { activeTabRefAtom, Tab, tabsAtom } from '@renderer/atoms/browser'
import { cn } from '@renderer/lib/utils'
import { useAtom } from 'jotai'
import uuid4 from 'uuid4'
import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { extractReadableContent } from '@renderer/lib/readability'

export function WebView({ tab }: { tab: Tab }) {
  const [_tabs, setTabs] = useAtom(tabsAtom)
  const [_activeTabRef, setActiveTabRef] = useAtom(activeTabRefAtom)
  const ref = useRef<any>(null)
  const [isWebViewReady, setIsWebViewReady] = useState(false)
  // const [webviewTargetUrl, setWebviewTargetUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [readerContent, setReaderContent] = useState('')

  const ipcHandle = (ref: any): void => {
    if (ref.current && isWebViewReady) {
      try {
        const webContentsId = ref.current.getWebContentsId()
        if (webContentsId) {
          window.api.getActiveTab(webContentsId)
          setActiveTabRef(ref)
        }
      } catch (error) {
        console.log('Failed to get webContentsId during ipcHandle:', error)
      }
    }
  }

  // Reusable function to update the current tab's properties
  const updateCurrentTab = (updater: (tab: Tab) => Tab) => {
    setTabs((prevTabs) => {
      const updateTabInTree = (tabs: Tab[], targetId: string): Tab[] => {
        return tabs.map((t) => {
          if (t.id === targetId) {
            return updater(t)
          }
          return t
        })
      }
      return updateTabInTree(prevTabs, tab.id)
    })
  }

  useEffect(() => {
    // Set the current tab's ref
    updateCurrentTab((t) => ({ ...t, ref }))
  }, [setTabs])

  useEffect(() => {
    if (tab.readerMode && ref.current && isWebViewReady) {
      console.log('Extracting readable content')
      extractReadableContent(ref.current).then(async (content) => {
        console.log('Content extracted:', content)

        setReaderContent(content)
      })
    }
  }, [tab.readerMode, isWebViewReady])

  useEffect(() => {
    const webview = ref.current
    if (!webview) return

    // Only set src if it's different to avoid unnecessary reloads
    if (webview.src !== tab.url) {
      webview.src = tab.url
    }

    const handleDomReady = () => {
      setIsWebViewReady(true) // Mark webview as ready
      if (tab.isActive) {
        ipcHandle(ref) // Call ipcHandle if the tab is active
      }
      handleTitleUpdate()
      webview.executeJavaScript(`
    (function() {
      const style = window.getComputedStyle(document.body);
      const bgColor = style.getPropertyValue('background-color');
      // Return both values so you can decide which one to use
      return { bgColor };
    })()
  `).then(({ bgColor, bg }) => {
        console.log('Computed background-color:', bgColor);
        // For example, if background-color is transparent, you might use the background shorthand
        const effectiveBackground = (bgColor === 'rgba(0, 0, 0, 0)' || bgColor === 'transparent') ? bg : bgColor;
        console.log('Effective background:', effectiveBackground);

        updateCurrentTab((t) => ({ ...t, color: effectiveBackground }));
      });
    }

    const handleTitleUpdate = () => {
      updateCurrentTab((t) => ({ ...t, title: webview.getTitle() }))
      console.log('Title updated:', webview.getTitle())
    }

    const handleFaviconUpdate = (event: any) => {
      updateCurrentTab((t) => ({ ...t, favicon: event.favicons[0] }))
      console.log('Favicon updated:', event.favicons[0])
    }

    const handleFullNavigation = (event: any) => {
      if (event.isMainFrame) {
        console.log('Navigated to:', event.url)
        // get the background color of the tab's HTML element
        // const tabColor = window.getComputedStyle(ref.current).backgroundColor
        // console.log('Tab color:', tabColor)
        updateCurrentTab((t) => ({ ...t, url: event.url }))
      }
    }

    const handleInPageNavigation = (event: any) => {
      if (event.isMainFrame) {
        console.log('In-page navigation to:', event.url)
      }
    }

    const handleStartLoading = () => {
      setIsLoading(true)
    }

    const handleStopLoading = () => {
      setIsLoading(false)
    }

    webview.addEventListener('dom-ready', handleDomReady)
    webview.addEventListener('page-title-updated', handleTitleUpdate)
    webview.addEventListener('page-favicon-updated', handleFaviconUpdate)
    webview.addEventListener('did-navigate', handleFullNavigation)
    webview.addEventListener('did-navigate-in-page', handleInPageNavigation)
    webview.addEventListener('did-start-loading', handleStartLoading)
    webview.addEventListener('did-stop-loading', handleStopLoading)
    webview.addEventListener('did-finish-load', handleStopLoading)
    webview.addEventListener('did-fail-load', handleStopLoading)

    return () => {
      if (webview) {
        webview.removeEventListener('dom-ready', handleDomReady)
        webview.removeEventListener('page-title-updated', handleTitleUpdate)
        webview.removeEventListener('page-favicon-updated', handleFaviconUpdate)
        webview.removeEventListener('did-navigate', handleFullNavigation)
        webview.removeEventListener('did-navigate-in-page', handleInPageNavigation)
        webview.removeEventListener('did-start-loading', handleStartLoading)
        webview.removeEventListener('did-stop-loading', handleStopLoading)
        webview.removeEventListener('did-finish-load', handleStopLoading)
        webview.removeEventListener('did-fail-load', handleStopLoading)

        // Only clean up if the tab is being removed, not just hidden
        if (!tab.isActive && webview.getWebContentsId && isWebViewReady) {
          try {
            const webContentsId = webview.getWebContentsId()
            if (webContentsId) {
              window.api.closeTab(webContentsId)
            }
          } catch (error) {
            console.log('Failed to get webContentsId during cleanup:', error)
          }
        }
      }
    }
  }, [ref, tab.isActive])

  useEffect(() => {
    console.log('Tab activation changed:', tab.id, tab.isActive, isWebViewReady)
    if (tab.isActive && ref.current) {
      if (isWebViewReady) {
        ipcHandle(ref)
      } else {
        // If not ready, set up a one-time listener
        const handleOneTimeReady = () => {
          ipcHandle(ref)
          ref.current?.removeEventListener('dom-ready', handleOneTimeReady)
        }
        ref.current.addEventListener('dom-ready', handleOneTimeReady)
      }
    }
  }, [tab.isActive])

  return (
    <div className={cn('w-full h-full bg-white', !tab.isActive && 'hidden')}>
      <AnimatePresence>
        {isLoading && (
          <motion.div
            className="fixed top-0 left-0 right-0 h-1 bg-blue-500 z-50"
            initial={{ width: 0 }}
            animate={{ width: '90%' }}
            exit={{
              width: '100%',
              opacity: 0,
              transition: {
                width: { duration: 0.3 },
                opacity: { duration: 0.3, delay: 0.2 }
              }
            }}
            transition={{
              duration: 4,
              ease: 'linear'
            }}
          />
        )}
      </AnimatePresence>

      {/* The standard webview */}
      {
        tab.url !== "" && (
          <webview
            ref={ref}
            key={tab.id}
            src={tab.url}
            id={tab.id}
            className={cn('w-full h-full', tab.readerMode && 'hidden')}
            webpreferences="autoplayPolicy=document-user-activation-required,defaultFontSize=16,contextIsolation=true,nodeIntegration=false,sandbox=true,webSecurity=true,nativeWindowOpen=true"
            allowpopups
            partition="persist:webview"
            style={{ pointerEvents: 'unset' }}
          />
        )
      }

      {/* Reader mode view */}
      {tab.readerMode && (
        <div className="w-full h-full flex justify-center items-center bg-background">
          <div className="max-w-4xl w-full h-full overflow-y-auto p-8 prose prose-lg mx-auto dark:prose-invert">
            <div dangerouslySetInnerHTML={{ __html: readerContent }} />
          </div>
        </div>
      )}

      {/* <AnimatePresence> */}
      {/*   {webviewTargetUrl && ( */}
      {/*     <motion.div */}
      {/*       initial={{ scale: 0.5, opacity: 0 }} */}
      {/*       animate={{ scale: 1, opacity: 1 }} */}
      {/*       exit={{ scale: 0.5, opacity: 0 }} */}
      {/*       transition={{ type: 'spring', stiffness: 300, damping: 20 }} */}
      {/*       className="text-xs m-1 h-fit w-fit max-w-[500px] z-50 p-1 px-2 truncate bg-popover border-border border fixed bottom-4 right-4 rounded-lg pointer-events-none" */}
      {/*       layout */}
      {/*     > */}
      {/*       {webviewTargetUrl} */}
      {/*     </motion.div> */}
      {/*   )} */}
      {/* </AnimatePresence> */}
    </div>
  )
}

export function reloadTab(activeTabRef: any) {
  if (activeTabRef.current) {
    activeTabRef.current?.reload()
  }
}

export function goBackTab(activeTabRef: any) {
  if (activeTabRef.current) {
    activeTabRef.current?.goBack()
  }
}

export function goForwardTab(activeTabRef: any) {
  if (activeTabRef.current) {
    activeTabRef.current?.goForward()
  }
}

export function newTab(url: string, title: string, setTabs: any) {
  const newTab = {
    id: uuid4(),
    title: title,
    url: url,
    favicon: '',
    isActive: true,
    readerMode: false,
  } as Tab

  setTabs((prevTabs: Tab[]) => {
    const deactivateAllTabs = (tabs: Tab[]): Tab[] => {
      return tabs.map((tab) => ({
        ...tab,
        isActive: false,
      }))
    }

    return [...deactivateAllTabs(prevTabs), newTab]
  })
}

export function closeTab(
  tabId: string,
  // @ts-expect-error
  tabs: Tab[],
  setTabs: (updater: (prevTabs: Tab[]) => Tab[]) => void
) {
  // Helper function to find the next tab to activate
  const findNextTabToActivate = (tabs: Tab[], excludeId: string): Tab | undefined => {

    const currentIndex = tabs.findIndex((t) => t.id === excludeId)

    // Try to get the next tab, or the previous if there is no next
    return tabs[currentIndex + 1] || tabs[currentIndex - 1]
  }

  setTabs((prevTabs) => {
    // Helper function to remove tab and handle webview cleanup
    const removeTab = (tabs: Tab[], targetId: string): [Tab[], boolean] => {
      const result: Tab[] = []
      let removed = false
      let wasActive = false
      removed = removed

      for (const tab of tabs) {
        if (tab.id === targetId) {
          // Clean up webview
          if (tab.ref?.current) {
            try {
              const webContentsId = tab.ref.current.getWebContentsId()
              if (webContentsId) {
                window.api.closeTab(webContentsId)
              }
            } catch (error) {
              console.log('Failed to cleanup webview:', error)
            }
          }
          wasActive = tab.isActive
          removed = true
          continue
        }

        result.push(tab)
      }

      return [result, wasActive]
    }

    const [updatedTabs, wasActiveTabClosed] = removeTab(prevTabs, tabId)

    // If we closed the active tab, activate the next available tab
    if (wasActiveTabClosed && updatedTabs.length > 0) {
      const nextTab = findNextTabToActivate(prevTabs, tabId)
      if (nextTab) {
        return updatedTabs.map((tab) => ({
          ...tab,
          isActive: tab.id === nextTab.id,
        }))
      }
    }

    return updatedTabs
  })
}

export const handleToggleDevTools = (activeTabRef: any) => {
  if (activeTabRef.current) {
    if (activeTabRef.current.isDevToolsOpened()) {
      activeTabRef.current.closeDevTools()
    } else {
      activeTabRef.current.openDevTools()
    }
  }
}

// Updated toggleReadingMode that correctly updates state.
export const toggleReadingMode = (
  tab: Tab | undefined,
  setTabs: any
) => {
  if (!tab) return
  setTabs((prevTabs) =>
    prevTabs.map((t) => (t.id === tab.id ? { ...t, readerMode: !t.readerMode } : t))
  )
  console.log('Toggled reading mode for:', tab.title)
}
