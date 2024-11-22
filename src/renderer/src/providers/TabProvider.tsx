import { Button } from "@/components/ui/button";
import { atom, useAtom } from "jotai";
import { Globe, X, Pin, PinOff } from "lucide-react";
import React, { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { motion, AnimatePresence } from "framer-motion";


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

      // Update both atom and localStorage with the same sanitized value
      set(baseAtom, sanitizedValue);
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
    favicon: "",
    pinned: false,
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

      if (activeIndex === -1 || prevTabs[activeIndex].pinned) {
        // If no tab is found or the tab is pinned, return the current tabs
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

export function useTogglePinTab() {
  const [tabs, setTabs] = useAtom(tabsAtom);

  function togglePinTab(tabToToggle: any) {
    setTabs((prevTabs) =>
      prevTabs.map((tab) =>
        tab.id === tabToToggle.id ? { ...tab, pinned: !tab.pinned } : tab
      )
    );
  }

  return togglePinTab;
}

// Define the getFavicon function
function getFavicon(tab: any): string {
  // Assuming the favicon URL is stored in the tab object
  return tab.favicon || 'default-favicon-url'; // Replace 'default-favicon-url' with a fallback URL if needed
}

export const TabLink = ({ tab }: { tab: any }) => {
  const [tabs, setTabs] = useAtom(tabsAtom);
  const closeTab = useCloseTab();
  const togglePinTab = useTogglePinTab();
  const [isHovered, setIsHovered] = useState(false);

  const setActiveTab = () => {
    setTabs(
      tabs.map((item: { id: any }) => ({
        ...item,
        isActive: item.id === tab.id,
      }))
    );
  };

  const closeTabEvent = (event: any) => {
    event.stopPropagation(); // Prevent triggering setActiveTab when closing
    closeTab(tab);
  };

  const pinTabEvent = (event: any) => {
    event.stopPropagation(); // Prevent triggering setActiveTab when pinning
    togglePinTab(tab);
  };

  return (
    <AnimatePresence>
      <motion.div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.5, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="w-full"
      >
        <Button
          onClick={setActiveTab}
          className="flex items-center text-left w-full relative"
          variant={tab.isActive ? "secondary" : "ghost"}
        >
          {tab.favicon ? (
            <img src={getFavicon(tab)} className="h-4 w-4 mr-2" />
          ) : (
            <Globe className="h-4 w-4 mr-2" />
          )}
          <motion.span
            className="truncate flex-grow"
            animate={{ marginRight: isHovered ? '55px' : '0px' }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {tab.title}
          </motion.span>
          <AnimatePresence>
            {isHovered && (
              <motion.div
                className="flex space-x-1 absolute right-0 mr-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Button onClick={pinTabEvent} className="h-7 w-7" size="icon" variant="link">
                  {tab.pinned ? <PinOff size={16} /> : <Pin size={16} />}
                </Button>
                {!tab.pinned && ( // Only render the close button if the tab is not pinned
                  <Button onClick={closeTabEvent} className="h-7 w-7" size="icon" variant="link">
                    <X size={16} />
                  </Button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      </motion.div>
    </AnimatePresence>
  );
};
