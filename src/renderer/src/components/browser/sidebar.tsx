import { useEffect, useState } from "react"
import { activeTabRefAtom, tabsAtom } from "@renderer/atoms/browser"
import { useAtom } from "jotai"
import { Button } from "@renderer/components/ui/button"
import { ArrowLeft, ArrowRight, RefreshCw } from "lucide-react"
import { goBackTab, goForwardTab, reloadTab } from "./webview"
import { DockedSidebar } from "./DockedSidebar"
import { FloatingSidebar } from "./FloatingSidebar"

export function Sidebar() {
  const [tabs, setTabs] = useAtom(tabsAtom)
  const [isSidebarVisible, setIsSidebarVisible] = useState(true)
  const [isHoveringEdge, setIsHoveringEdge] = useState(false)
  const [activeTabRef, setActiveTabRef] = useAtom(activeTabRefAtom)
  const ipcHandle = (show: boolean): void => window.api.toggleTrafficLights(show)

  useEffect(() => {
    ipcHandle(isSidebarVisible || isHoveringEdge)
  }, [isSidebarVisible, isHoveringEdge])

  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible)
  }

  const setActiveTab = (id: string) => {
    setTabs(tabs.map((tab) => (tab.id === id ? { ...tab, isActive: true } : { ...tab, isActive: false })))
  }

  // Action buttons array
  const actionButtons = [
    <Button key="refresh" variant="ghost" size="icon" onClick={() => reloadTab(activeTabRef)}>
      <RefreshCw className="h-4 w-4" />
    </Button>,
    <Button key="back" variant="ghost" size="icon" onClick={() => goBackTab(activeTabRef)}>
      <ArrowLeft className="h-4 w-4" />
    </Button>,
    <Button key="forward" variant="ghost" size="icon" onClick={() => goForwardTab(activeTabRef)}>
      <ArrowRight className="h-4 w-4" />
    </Button>,
  ]

  return (
    <>
      {/* Hover detection area */}
      <div
        className="fixed left-0 top-0 h-full w-2 z-50"
        onMouseEnter={() => setIsHoveringEdge(true)}
        onMouseLeave={() => setIsHoveringEdge(false)}
      />

      {/* Floating Sidebar */}
      <FloatingSidebar
        isVisible={isHoveringEdge && !isSidebarVisible}
        tabs={tabs}
        actionButtons={actionButtons}
        setActiveTab={setActiveTab}
        toggleSidebar={toggleSidebar}
        setIsHoveringEdge={setIsHoveringEdge}
      />

      {/* Docked Sidebar */}
      <DockedSidebar
        isVisible={isSidebarVisible}
        tabs={tabs}
        actionButtons={actionButtons}
        setActiveTab={setActiveTab}
        toggleSidebar={toggleSidebar}
      />
    </>
  )
}
