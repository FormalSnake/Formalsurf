import { activeTabRefAtom, Tab, tabsAtom } from "@renderer/atoms/browser";
import { cn } from "@renderer/lib/utils";
import { useAtom } from "jotai";
import uuid4 from "uuid4";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export function WebView({ tab }: { tab: Tab }) {
  const [tabs, setTabs] = useAtom(tabsAtom);
  const [activeTabRef, setActiveTabRef] = useAtom(activeTabRefAtom);
  const ref = useRef<HTMLWebViewElement>(null);
  const [isWebViewReady, setIsWebViewReady] = useState(false);
  const [webviewTargetUrl, setWebviewTargetUrl] = useState("");

  const ipcHandle = (ref: any): void => {
    if (ref.current && isWebViewReady) {
      window.api.getActiveTab(ref.current.getWebContentsId());
    }
  };

  // Reusable function to update the current tab's properties
  const updateCurrentTab = (updater: (tab: Tab) => Tab) => {
    setTabs((prevTabs) =>
      prevTabs.map((t) => (t.id === tab.id ? updater(t) : t))
    );
  };

  useEffect(() => {
    // Set the current tab's ref
    updateCurrentTab((t) => ({ ...t, ref }));
  }, [setTabs]);

  useEffect(() => {
    const webview = ref.current;
    if (!webview) return;

    const handleDomReady = () => {
      setIsWebViewReady(true); // Mark webview as ready
      if (tab.isActive) {
        ipcHandle(ref); // Call ipcHandle if the tab is active
      }
      handleTitleUpdate();
    };

    const handleTitleUpdate = () => {
      updateCurrentTab((t) => ({ ...t, title: webview.getTitle() }));
      console.log("Title updated:", webview.getTitle());
    };

    const handleFaviconUpdate = (event: any) => {
      updateCurrentTab((t) => ({ ...t, favicon: event.favicons[0] }));
      console.log("Favicon updated:", event.favicons[0]);
    };

    const handleTargetUrlUpdate = (event: any) => {
      setWebviewTargetUrl(event.url);
      console.log("Target URL updated:", event.url);
    };

    const handleFullNavigation = (event: any) => {
      if (event.isMainFrame) {
        console.log("Navigated to:", event.url); // Log full navigation
        updateCurrentTab((t) => ({ ...t, url: event.url }));
      }
    };

    const handleInPageNavigation = (event: any) => {
      if (event.isMainFrame) {
        console.log("In-page navigation to:", event.url); // Log in-page navigation
      }
    };

    webview.addEventListener('dom-ready', handleDomReady);
    webview.addEventListener('page-title-updated', handleTitleUpdate);
    webview.addEventListener('page-favicon-updated', handleFaviconUpdate);
    webview.addEventListener('update-target-url', handleTargetUrlUpdate);
    webview.addEventListener('did-navigate', handleFullNavigation); // Full page navigation
    webview.addEventListener('did-navigate-in-page', handleInPageNavigation); // In-page navigation

    return () => {
      webview.removeEventListener('dom-ready', handleDomReady);
      webview.removeEventListener('page-title-updated', handleTitleUpdate);
      webview.removeEventListener('page-favicon-updated', handleFaviconUpdate);
      webview.removeEventListener('update-target-url', handleTargetUrlUpdate);
      webview.removeEventListener('did-navigate', handleFullNavigation);
      webview.removeEventListener('did-navigate-in-page', handleInPageNavigation);
    };
  }, [ref, tab.isActive]);

  // Execute ipcHandle when the active tab changes
  useEffect(() => {
    if (tab.isActive && isWebViewReady) {
      ipcHandle(ref); // Call ipcHandle only if the webview is ready
    }
  }, [tab.isActive, activeTabRef, isWebViewReady]);

  return (
    <>
      <webview
        ref={ref}
        key={tab.id}
        src={tab.url}
        id={tab.id}
        className={cn('w-full bg-white', !tab.isActive && 'hidden')}
        webpreferences="autoplayPolicy=document-user-activation-required,defaultFontSize=16,contextIsolation=true,nodeIntegration=false,sandbox=true,webSecurity=true"
        allowpopups="true"
        partition="persist:webview"
        style={{ pointerEvents: 'unset' }}
      />
      <AnimatePresence>
        {webviewTargetUrl && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="text-xs m-1 h-fit w-fit max-w-[500px] z-50 p-1 px-2 truncate bg-popover border-border border fixed bottom-4 right-4 rounded-lg pointer-events-none"
            layout
          >
            {webviewTargetUrl}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export function reloadTab(activeTabRef: any) {
  if (activeTabRef.current) {
    activeTabRef.current?.reload();
  }
}

export function goBackTab(activeTabRef: any) {
  if (activeTabRef.current) {
    activeTabRef.current?.goBack();
  }
}

export function goForwardTab(activeTabRef: any) {
  if (activeTabRef.current) {
    activeTabRef.current?.goForward();
  }
}

export function newTab(url: string, title: string, setTabs: any) {
  const newTab = {
    id: uuid4(),
    title: title,
    url: url,
    favicon: "",
    isActive: true,
  };

  setTabs((prevTabs: any[]) => {
    // Set all existing tabs to inactive
    const updatedTabs = prevTabs.map(tab => ({
      ...tab,
      isActive: false,
    }));

    // Add the new tab
    return [...updatedTabs, newTab];
  });
}

export function closeTab(
  tabId: string,
  tabs: Tab[], // Pass the tabs array as an argument
  setTabs: (updater: (prevTabs: Tab[]) => Tab[]) => void
) {
  console.log("Closing tab with ID:", tabId); // Log the tab ID being closed

  // Find the tab being closed
  const tabToClose = tabs.find((tab) => tab.id === tabId);
  if (!tabToClose) {
    console.error("Tab not found");
    return;
  }

  // Get the webview element associated with the tab
  const webview = tabToClose.ref.current;
  if (!webview) {
    console.error("Webview not found");
    return;
  }

  // Get the webContentsId from the webview
  const webContentsId = webview.getWebContentsId();

  console.log("Closing tab", webContentsId)
  // Send the webContentsId to window.api instead of tabId
  window.api.closeTab(webContentsId);

  // Update the tabs state
  setTabs((prevTabs) => {
    console.log("Closing tab with ID:", tabId); // Log the tab ID being closed
    console.log("Current tabs:", prevTabs); // Log the current tabs

    const updatedTabs = prevTabs.filter((tab) => tab.id !== tabId);

    console.log("Updated tabs after closing:", updatedTabs); // Log the updated tabs

    if (updatedTabs.length === 0) {
      return [];
    }

    const wasActiveTabClosed = prevTabs.find((tab) => tab.id === tabId)?.isActive;
    if (wasActiveTabClosed) {
      updatedTabs[0].isActive = true;
    }

    return updatedTabs;
  });
}
