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

import { Tab } from './components/Tab'

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

  const [homeOpen, setHomeOpen] = useAtom(homeOpenAtom)

  useEffect(() => {
    const createNewTab = useCreateNewTab();

    // Handler for extension-initiated tab creation
    //@ts-ignore
    window.api.handle('new-tab', (event: any, url: string) => {
      createNewTab({ url });
    });

    // Handler for extension-initiated tab selection
    //@ts-ignore
    window.api.handle('select-tab', (event: any, tabId: string) => {
      const tab = tabs.find(t => t.id === tabId);
      if (tab) {
        setActiveTab(tab);
      }
    });

    // Handler for extension-initiated tab removal
    //@ts-ignore
    window.api.handle('close-tab', (event: any, tabId: string) => {
      closeTab(tabId);
    });

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

  return (
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
  )
}

export default App
