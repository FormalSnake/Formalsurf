import { tabsAtom } from "@renderer/atoms/browser"
import { useAtom } from "jotai"
import { Button } from "@renderer/components/ui/button"
import { cn } from "@renderer/lib/utils"
import { RefreshCw } from "lucide-react"
import { reloadTab } from "./webview"

export function Sidebar() {
  const [tabs, setTabs] = useAtom(tabsAtom)

  const setActiveTab = (id: string) => {
    setTabs(tabs.map((tab) => (tab.id === id ? { ...tab, isActive: true } : { ...tab, isActive: false })))
  }

  return (
    <div className="flex flex-col w-sidebar bg-transparent pt-1.5 max-w-sidebar min-w-sidebar">
      <div className="flex flex-row ml-18 space-x-2 items-center">
        <Button variant="ghost" size="icon" onClick={() => reloadTab(tabs)}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex flex-col p-2 space-y-2">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant="ghost"
            className={cn("hover:bg-muted/40 justify-start", tab.isActive && "bg-muted/60 hover:bg-muted/60")}
            onClick={() => setActiveTab(tab.id)}
          >
            <img src={tab.favicon} className="w-4 h-4 rounded-md" />
            <span className="ml-2 text-sm font-medium truncate">{tab.title}</span>
          </Button>
        ))}
      </div>
    </div>
  )
}
