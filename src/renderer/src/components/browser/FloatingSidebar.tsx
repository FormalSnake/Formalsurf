import { Button } from "@renderer/components/ui/button"
import { cn } from "@renderer/lib/utils"
import { PanelLeftClose } from "lucide-react"
import { JSX } from "react"
import { motion } from "framer-motion" // Import Framer Motion
import TabList from "./TabList"

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
    <motion.div
      className={cn(
        "fixed left-0 top-0 h-full bg-popover/75 backdrop-blur-3xl z-40 border-r"
      )}
      initial={false} // Disable initial animation
      animate={{
        width: isVisible ? 300 : 10,
        opacity: isVisible ? 1 : 0,
        pointerEvents: isVisible ? "auto" : "none", // Control pointer events
      }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
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
        <div className="px-2">
          {/* @ts-expect-error */}
          <browser-action-list partition="persist:webview" id="actions"></browser-action-list>
        </div>
        <TabList tabs={tabs} setActiveTab={setActiveTab} />
      </div>
    </motion.div>
  )
}
