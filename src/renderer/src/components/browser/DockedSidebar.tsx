import { Button } from "@renderer/components/ui/button"
import { cn } from "@renderer/lib/utils"
import { PanelLeft } from "lucide-react"
import { JSX } from "react"
import { TabButton } from "./TabButton"
import { Tab } from "@renderer/atoms/browser"
import { AnimatedGroup } from "../ui/animated-group"
import { motion } from "framer-motion" // Import Framer Motion

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
    <motion.div
      initial={false} // Disable initial animation
      animate={{
        width: isVisible ? 300 : 0,
        opacity: isVisible ? 1 : 0,
      }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={cn(
        "flex flex-col pt-1.5 border-r ", // Add overflow-hidden to prevent content from spilling out
        !isVisible && "pointer-events-none" // Disable pointer events when hidden
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
      <AnimatedGroup className="flex flex-col p-2 space-y-2">
        {tabs.map((tab: Tab) => (
          <TabButton key={tab.id} tab={tab} setActiveTab={setActiveTab} />
        ))}
      </AnimatedGroup>
    </motion.div>
  )
}
