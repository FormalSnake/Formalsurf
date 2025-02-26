import { useEffect, useState } from "react"
import { activeTabRefAtom, Tab, tabsAtom } from "@renderer/atoms/browser"
import { atom, useAtom } from "jotai"
import { Button } from "@renderer/components/ui/button"
import { ArrowLeft, ArrowRight, Plus, RefreshCw } from "lucide-react"
import { goBackTab, goForwardTab, reloadTab } from "./webview"
import { openAtom } from "./NewTabDialog"
import TabList from "./TabList"
import { lightOrDark } from "@renderer/lib/color"

export const sidebarVisibleAtom = atom(true)

export function Sidebar() {
  const [tabs, setTabs] = useAtom(tabsAtom);
  const [activeTabRef, setActiveTabRef] = useAtom(activeTabRefAtom);
  const [_tabDialogOpen, setTabDialogOpen] = useAtom(openAtom);
  const [color, setColor] = useState<any>('')
  const [isDark, setIsDark] = useState(true)

  const setActiveTab = (id: string) => {
    console.log("Setting active tab to:", id);

    const updateTabsRecursively = (tabs: Tab[]): Tab[] => {
      return tabs.map(tab => {
        const shouldBeActive = tab.id === id;

        return {
          ...tab,
          isActive: shouldBeActive,
        };
      });
    };

    const updatedTabs = updateTabsRecursively(tabs);
    setTabs(updatedTabs);

    // Find the active tab or subtab recursively
    const findActiveTab = (tabs: Tab[]): Tab | undefined => {
      for (const tab of tabs) {
        if (tab.id === id) return tab;
      }
      return undefined;
    };

    const activeTab = findActiveTab(updatedTabs);
    if (activeTab) {
      setActiveTabRef(activeTab.ref);
    }
  };

  const handleReload = () => {
    if (activeTabRef) {
      reloadTab(activeTabRef);
      console.log("Reloading")
    } else {
      console.error("No active tab reference found.");
    }
  };

  const handleGoBack = () => {
    console.log("Going back with ref:", activeTabRef);
    if (activeTabRef) {
      goBackTab(activeTabRef);
    } else {
      console.error("No active tab reference found.");
    }
  };

  const handleGoForward = () => {
    console.log("Going forward with ref:", activeTabRef);
    if (activeTabRef) {
      goForwardTab(activeTabRef);
    } else {
      console.error("No active tab reference found.");
    }
  };

  useEffect(() => {
    // set color to the color of the active tab
    const activeTab = tabs.find((tab) => tab.isActive)
    if (activeTab) {
      setColor(activeTab.color)
      if (!activeTab.color) return
      const isDarkColor = lightOrDark(activeTab.color)
      setIsDark(isDarkColor === 'dark')
    }
  }, [tabs])

  return (
    <div
      className="flex flex-row w-full h-[50px] items-center pl-20 pr-1.5 drag bg-background overflow-hidden"
      style={{ backgroundColor: color, color: isDark ? '#fff' : '#000' }}
    >
      {/* Left button group */}
      <div className="flex-none flex flex-row no-drag">
        <Button key="refresh" variant="ghost" size="icon" onClick={handleReload}>
          <RefreshCw className="h-4 w-4" />
        </Button>
        <Button key="back" variant="ghost" size="icon" onClick={handleGoBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Button key="forward" variant="ghost" size="icon" onClick={handleGoForward}>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Calculate offset to compensate for asymmetric padding */}
      <div className="flex-grow flex items-center relative">
        {/* This outer container has the offset */}
        <div className="absolute inset-0 flex justify-center items-center" style={{ marginLeft: "-140px" }}>
          {/* The TabList container */}
          <div className="overflow-x-scroll no-scrollbar">
            <TabList tabs={tabs} setActiveTab={setActiveTab} />
          </div>
        </div>
      </div>

      {/* Right button group */}
      <div className="flex-none no-drag">
        <Button key="newtab" variant="ghost" size="icon" onClick={() => setTabDialogOpen(true)}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
