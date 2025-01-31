import { Button } from "@renderer/components/ui/button"
import { cn } from "@renderer/lib/utils"
import { PanelLeft } from "lucide-react"
import { JSX } from "react"

interface DockedSidebarProps {
  isVisible: boolean
  tabs: any[]
  actionButtons: JSX.Element[]
  setActiveTab: (id: string) => void
  toggleSidebar: () => void
}

export function DockedSidebar({
  isVisible,
  tabs,
  actionButtons,
  setActiveTab,
  toggleSidebar,
}: DockedSidebarProps) {
  return (
    <div
      className={cn(
        "flex flex-col w-[300px] bg-transparent backdrop-blur-sm pt-1.5 max-w-[300px] min-w-[300px] transition-all duration-300 ease-in-out",
        !isVisible && "w-0 min-w-0 max-w-0 opacity-0"
      )}
    >
      <div className="flex flex-row ml-18 space-x-2 items-center">
        <Button variant="ghost" size="icon" onClick={toggleSidebar}>
          <PanelLeft className="h-4 w-4" />
        </Button>
        {actionButtons}
      </div>
      <div className="flex flex-col p-2 space-y-2">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant="ghost"
            className={cn("hover:bg-muted/40 justify-start w-full", tab.isActive && "bg-muted/60 hover:bg-muted/60")}
            onClick={() => setActiveTab(tab.id)}
          >
            <img src={tab.favicon} className="w-4 h-4 rounded-md" />
            <span className="ml-2 text-sm font-medium truncate max-w-[calc(100%-2rem)]">
              {tab.title}
            </span>
          </Button>
        ))}
      </div>
    </div>
  )
}
