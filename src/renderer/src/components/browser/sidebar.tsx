import { useEffect, useState } from "react"
import { activeTabRefAtom, Tab, tabsAtom } from "@renderer/atoms/browser"
import { atom, useAtom } from "jotai"
import { Button } from "@renderer/components/ui/button"
import { ArrowLeft, ArrowRight, Plus, RefreshCw } from "lucide-react"
import { goBackTab, goForwardTab, reloadTab } from "./webview"
import { DockedSidebar } from "./DockedSidebar"
import { FloatingSidebar } from "./FloatingSidebar"
import { openAtom } from "./NewTabDialog"

export const sidebarVisibleAtom = atom(true)

export function Sidebar() {
  const [tabs, setTabs] = useAtom(tabsAtom);
  const [isSidebarVisible, setIsSidebarVisible] = useAtom(sidebarVisibleAtom);
  const [isHoveringEdge, setIsHoveringEdge] = useState(false);
  const [activeTabRef, setActiveTabRef] = useAtom(activeTabRefAtom);
  const [tabDialogOpen, setTabDialogOpen] = useAtom(openAtom);

  const ipcHandle = (show: boolean): void => window.api.toggleTrafficLights(show);

  useEffect(() => {
    ipcHandle(isSidebarVisible || isHoveringEdge);
  }, [isSidebarVisible, isHoveringEdge]);

  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

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
    console.log("Reloading tab with ref:", activeTabRef);
    if (activeTabRef) {
      reloadTab(activeTabRef);
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

  const actionButtons = [
    <Button key="refresh" variant="ghost" size="icon" onClick={handleReload}>
      <RefreshCw className="h-4 w-4" />
    </Button>,
    <Button key="newtab" variant="ghost" size="icon" onClick={() => setTabDialogOpen(true)}>
      <Plus className="h-4 w-4" />
    </Button>,
    <Button key="back" variant="ghost" size="icon" onClick={handleGoBack}>
      <ArrowLeft className="h-4 w-4" />
    </Button>,
    <Button key="forward" variant="ghost" size="icon" onClick={handleGoForward}>
      <ArrowRight className="h-4 w-4" />
    </Button>,
  ];

  return (
    <>
      <div
        className="fixed left-0 top-0 h-full w-2 z-50"
        onMouseEnter={() => setIsHoveringEdge(true)}
        onMouseLeave={() => setIsHoveringEdge(false)}
      />

      <FloatingSidebar
        isVisible={isHoveringEdge && !isSidebarVisible}
        tabs={tabs}
        actionButtons={actionButtons}
        setActiveTab={setActiveTab}
        toggleSidebar={toggleSidebar}
        setIsHoveringEdge={setIsHoveringEdge}
      />

      <DockedSidebar
        isVisible={isSidebarVisible}
        tabs={tabs}
        actionButtons={actionButtons}
        setActiveTab={setActiveTab}
        toggleSidebar={toggleSidebar}
      />
    </>
  );
}
