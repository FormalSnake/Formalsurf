import { Button } from "@renderer/components/ui/button"
import { cn } from "@renderer/lib/utils"
import { PanelLeftClose, PanelRightClose } from "lucide-react"
import { JSX } from "react"

interface FloatingSidebarProps {
  isVisible: boolean
  tabs: any[]
  actionButtons: JSX.Element[]
  setActiveTab: (id: string) => void
  toggleSidebar: () => void
  setIsHoveringEdge: (isHoveringEdge: boolean) => void
}

export function FloatingSidebar({
  isVisible,
  tabs,
  actionButtons,
  setActiveTab,
  toggleSidebar,
  setIsHoveringEdge,
}: FloatingSidebarProps) {
  return (
    <div
      className={cn(
        "fixed left-0 top-0 h-full bg-popover/75 backdrop-blur-3xl z-40 transition-all duration-300 ease-in-out border-r",
        isVisible ? "w-[300px]" : "w-[10px] opacity-0 pointer-events-none"
      )}
      onMouseEnter={() => setIsHoveringEdge(true)}
      onMouseLeave={() => setIsHoveringEdge(false)}
    >
      <div className="flex flex-col w-[300px] h-full pt-1.5">
        <div className="flex flex-row ml-18 space-x-2 items-center">
          <Button variant="ghost" size="icon" onClick={toggleSidebar}>
            <PanelLeftClose className="h-4 w-4" />
          </Button>
          {actionButtons}
        </div>
        <div className="flex flex-col p-2 space-y-2">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant="ghost"
              className={cn("justify-start w-full", tab.isActive && "bg-primary/90 text-primary-foreground")}
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
    </div>
  )
}
