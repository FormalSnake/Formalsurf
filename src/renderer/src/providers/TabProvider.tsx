import { Button } from "@/components/ui/button";
import { ipcRenderer } from "electron";
import { atom, useAtom } from "jotai";
import { Globe, X } from "lucide-react";
import React, { useEffect } from "react";

const atomWithLocalStorage = (key: string, initialValue: any) => {
  const getInitialValue = () => {
    const item = localStorage.getItem(key);
    if (item !== null) {
      return JSON.parse(item);
    }
    return initialValue;
  };

  const baseAtom = atom(getInitialValue());

  const derivedAtom = atom(
    (get) => get(baseAtom),
    (get, set, update) => {
      const nextValue = typeof update === 'function' ? update(get(baseAtom)) : update;

      // Remove `webviewRef` from each tab before saving
      const sanitizedValue = Array.isArray(nextValue)
        ? nextValue.map((tab) => ({ ...tab, webviewRef: undefined }))
        : nextValue;

      set(baseAtom, nextValue);
      localStorage.setItem(key, JSON.stringify(sanitizedValue));
    }
  );

  return derivedAtom;
};


// Define the tabsAtom with webviewRefs
export const tabsAtom = atomWithLocalStorage("FormalTabs", [
  {
    url: "https://www.google.com",
    title: "Google",
    webviewRef: null,
    isActive: true,
    favicon: ""
  },
]);

export const activeTabRefAtom = atom<any>(null);

export const TabProvider = ({ children }: { children: any }) => {
  return <>{children}</>;
};

export function useCreateNewTab() {
  const [tabs, setTabs] = useAtom(tabsAtom);

  function createNewTab({ url = "https://www.google.com" }: { url?: string }) {
    const newTab = {
      url,
      title: "New tab",
      webviewRef: React.createRef(),
      isActive: true,
    };

    setTabs([
      // @ts-ignore
      ...tabs.map((tab) => ({ ...tab, isActive: false })), // Deactivate current tabs
      // @ts-ignore
      newTab, // Add new active tab
    ]);
  }

  return createNewTab;
}

export function useCloseTab() {
  const [tabs, setTabs] = useAtom(tabsAtom)

  function closeTab() {
    setTabs((prevTabs) => {
      // Find the index of the active tab
      const activeIndex = prevTabs.findIndex((tab) => tab.isActive);

      if (activeIndex === -1) {
        // If no active tab is found, return the current tabs (shouldn't happen in a valid state)
        return prevTabs;
      }

      // Remove the active tab from the array
      const updatedTabs = prevTabs.filter((_, index) => index !== activeIndex);

      // If there are still tabs left, set the next closest one to active
      if (updatedTabs.length > 0) {
        const newActiveIndex =
          activeIndex >= updatedTabs.length ? updatedTabs.length - 1 : activeIndex;
        updatedTabs[newActiveIndex].isActive = true;
      }

      return updatedTabs;
    });
  }

  return closeTab
}

export const TabLink = ({ tab }: { tab: any }) => {
  const [tabs, setTabs] = useAtom(tabsAtom);
  const closeTab = useCloseTab();

  const setActiveTab = () => {
    setTabs(tabs.map((item: { url: any; }) => ({
      ...item,
      isActive: item.url === tab.url,
    })));
  };

  const closeTabEvent = (event: any) => {
    event.stopPropagation(); // Prevent triggering setActiveTab when closing
    closeTab();
    // setTabs((prevTabs: any[]) => {
    //   const updatedTabs = prevTabs.filter((item) => item.webviewRef !== tab.webviewRef);
    //
    //   // If the closed tab was active, make another tab active
    //   if (tab.isActive && updatedTabs.length > 0) {
    //     updatedTabs[0].isActive = true;
    //   }
    //
    //   return updatedTabs;
    // });
  };

  return (
    <Button onClick={setActiveTab} className="flex-grow text-left w-full" variant={tab.isActive ? "secondary" : "ghost"}>
      {tab.favicon ? <img src={"https://corsproxy.io/?" + tab.favicon} className="h-4 w-4 mr-2 " /> : <Globe className="h-4 w-4 mr-2" />}
      <span className="w-full truncate">{tab.title}</span>
      <Button onClick={closeTabEvent} className="h-7 w-7" size="icon" variant="link">
        <X size={16} />
      </Button>
    </Button>
  );
};
