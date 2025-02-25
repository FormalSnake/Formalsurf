import { Tab, tabsAtom } from '@renderer/atoms/browser'
import { Button } from '../ui/button'
import { cn } from '@renderer/lib/utils'
import { Globe, X } from 'lucide-react'
import { closeTab } from './webview'
import { useAtom } from 'jotai'

export function TabButton({ tab, setActiveTab, itemId }: { tab: Tab; setActiveTab: (id: string) => void; itemId: any }) {
  const [tabs, setTabs] = useAtom(tabsAtom)

  const setActive = (tab: Tab) => {
    console.log('Setting tab active:', tab.id)

    setTabs((prevTabs) => {
      const updateTabs = (tabs: Tab[]): Tab[] => {
        return tabs.map((t) => {
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
    <Button
      variant="ghost"
      className={cn('justify-start select-none pl-2 item w-[178px] transition-all duration-100 ease-linear', tab.isActive && 'bg-accent/50 w-[478px]')}
      onClick={() => setActive(tab)}
      id={tab.id}
      key={itemId} data-swapy-item={itemId}
    >
      {
        tab.favicon !== "" ? (
          <img src={tab.favicon} className="w-4 h-4 rounded-md" draggable={false} />
        ) : (
          <Globe className="w-4 h-4 rounded-md" />
        )
      }
      <span
        className="ml-2 text-sm font-medium truncate
 max-w-[calc(100%-4rem)]"
      >
        {tab.title}
      </span>
      <div className="ml-auto p-1 hover:bg-accent/20 rounded" onClick={(e) => close(e, tab)} data-swapy-no-drag>
        <X className="h-4 w-4" />
      </div>
    </Button>
  )
}
