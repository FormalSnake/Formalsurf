import { Button } from "@renderer/components/ui/button"
import { cn } from "@renderer/lib/utils"
import { PanelLeft } from "lucide-react"
import { JSX } from "react"
import { TabButton } from "./TabButton"
import { Tab } from "@renderer/atoms/browser"
import { AnimatedGroup } from "../ui/animated-group"

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
        "flex flex-col w-[300px] pt-1.5 max-w-[300px] min-w-[300px] transition-all duration-300 ease-in-out border-r",
        !isVisible && "w-0 min-w-0 max-w-0 opacity-0"
      )}
    >
      <div className="flex flex-row ml-18 space-x-2 items-center">
        <Button variant="ghost" size="icon" onClick={toggleSidebar}>
          <PanelLeft className="h-4 w-4" />
        </Button>
        {actionButtons}
      </div>
      <div className="px-2">
        <browser-action-list partition="persist:webview" id="actions"></browser-action-list>
      </div>
      <AnimatedGroup className="flex flex-col p-2 space-y-2" preset="blur-slide">
        {tabs.map((tab: Tab) => (
          <TabButton key={tab.id} tab={tab} setActiveTab={setActiveTab} />
        ))}
      </AnimatedGroup>
    </div>
  )
}
