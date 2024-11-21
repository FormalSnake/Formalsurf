import { Button } from "@/components/ui/button";
import { ipcRenderer } from "electron";
import { atom, useAtom } from "jotai";
import { Globe, X } from "lucide-react";
import React, { useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

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
    id: uuidv4(),
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
      id: uuidv4(),
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
  const [tabs, setTabs] = useAtom(tabsAtom);

  function closeTab(tabToClose: any = null) {
    setTabs((prevTabs) => {
      let activeIndex;

      if (tabToClose) {
        // Find the index of the specified tab
        activeIndex = prevTabs.findIndex((tab) => tab === tabToClose);
      } else {
        // Find the index of the active tab
        activeIndex = prevTabs.findIndex((tab) => tab.isActive);
      }

      if (activeIndex === -1) {
        // If no tab is found, return the current tabs
        return prevTabs;
      }

      // Remove the specified tab from the array
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

  return closeTab;
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
    closeTab(tab);
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
  // "https://corsproxy.io/?" + tab.favicon
  const getFavicon = (tab: any) => {
    // Updated regex patterns to handle trailing slashes
    const validIP4Regex = /^(https?:\/\/)?(?:[0-9]{1,3}\.){3}[0-9]{1,3}(?::\d+)?\/?$/i;
    const localhostRegex = /^(https?:\/\/)?localhost(?::\d+)?\/?$/i;

    console.log("Tab URL:", tab.url);
    console.log("Testing for IP address:", validIP4Regex.test(tab.url));
    console.log("Testing for localhost:", localhostRegex.test(tab.url));

    if (tab.favicon.startsWith("data:image/png;base64,")) {
      console.log("Returning favicon directly (base64):", tab.favicon);
      return tab.favicon;
    }

    if (validIP4Regex.test(tab.url) || localhostRegex.test(tab.url)) {
      console.log("URL is localhost or an IP address, returning favicon directly:", tab.favicon);
      return tab.favicon;
    }

    const proxiedFavicon = "https://corsproxy.io/?" + tab.favicon;
    console.log("Applying proxy to favicon:", proxiedFavicon);
    return proxiedFavicon;
  };
  return (
    <Button onClick={setActiveTab} className="flex-grow text-left w-full" variant={tab.isActive ? "secondary" : "ghost"}>
      {tab.favicon ? <img src={getFavicon(tab)} className="h-4 w-4 mr-2 " /> : <Globe className="h-4 w-4 mr-2" />}
      <span className="w-full truncate">{tab.title}</span>
      <Button onClick={closeTabEvent} className="h-7 w-7" size="icon" variant="link">
        <X size={16} />
      </Button>
    </Button>
  );
};
