import { Tab, tabsAtom } from '@renderer/atoms/browser'
import { Button } from '../ui/button'
import { cn } from '@renderer/lib/utils'
import { X } from 'lucide-react'
import { closeTab } from './webview'
import { useAtom } from 'jotai'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger
} from '@renderer/components/ui/context-menu'
import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

export function TabButton({ tab, setActiveTab }: { tab: Tab; setActiveTab: (id: string) => void }) {
  const [tabs, setTabs] = useAtom(tabsAtom)

  const setActive = (tab: Tab) => {
    console.log('Setting tab active:', tab.id)

    setTabs((prevTabs) => {
      const updateTabs = (tabs: Tab[]): Tab[] => {
        return tabs.map((t) => {
          // Handle subtabs recursively

          return {
            ...t,
            isActive: t.id === tab.id
          }
        })
      }

      return updateTabs(prevTabs)
    })

    // Always call setActiveTab after updating the tabs state
    setActiveTab(tab.id)
  }

  const close = (e: any, tab: Tab) => {
    e.stopPropagation()
    closeTab(tab.id, tabs, setTabs)
  }

  return (
    <div className="flex flex-col">
      <TabComponent key={tab.id} tab={tab} setActive={setActive} close={close} />
    </div>
  )
}

const TabComponent = ({ tab, setActive, close }) => {
  return (
    <Button
      variant="ghost"
      className={cn('justify-start w-full select-none pl-2 ', tab.isActive && 'bg-accent/50')}
      onClick={() => setActive(tab)}
      id={tab.id}
    >
      <img src={tab.favicon} className="w-4 h-4 rounded-md" draggable={false} />
      <span
        className="ml-2 text-sm font-medium truncate
 max-w-[calc(100%-4rem)]"
      >
        {tab.title}
      </span>
      <div className="ml-auto p-1 hover:bg-accent/20 rounded" onClick={(e) => close(e, tab)}>
        <X className="h-4 w-4" />
      </div>
    </Button>
  )
}
