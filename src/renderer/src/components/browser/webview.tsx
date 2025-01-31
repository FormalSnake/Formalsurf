import { activeTabRefAtom, Tab, tabsAtom } from "@renderer/atoms/browser";
import { cn } from "@renderer/lib/utils";
import { useAtom } from "jotai";
import { useEffect, useRef, useState } from "react"; // Add useState
import uuid4 from "uuid4";
import { AnimatePresence, motion } from "framer-motion";

export function WebView({ tab }: { tab: Tab }) {
  const [tabs, setTabs] = useAtom(tabsAtom);
  const [activeTabRef, setActiveTabRef] = useAtom(activeTabRefAtom);
  const ref = useRef<HTMLWebViewElement>(null);
  const [isWebViewReady, setIsWebViewReady] = useState(false); // Track if webview is ready
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
    };

    const handleFaviconUpdate = (event: any) => {
      updateCurrentTab((t) => ({ ...t, favicon: event.favicons[0] }));
    };

    const handleTargetUrlUpdate = (event: any) => {
      setWebviewTargetUrl(event.url);
    };

    const navigateHandler = (event: any) => {
      updateCurrentTab((t) => ({ ...t, url: event.url }));
    };

    webview.addEventListener('dom-ready', handleDomReady);
    webview.addEventListener('page-title-updated', handleTitleUpdate);
    webview.addEventListener('page-favicon-updated', handleFaviconUpdate);
    webview.addEventListener('update-target-url', handleTargetUrlUpdate);
    webview.addEventListener('did-navigate', navigateHandler);
    webview.addEventListener('did-navigate-in-page', navigateHandler);

    return () => {
      webview.removeEventListener('dom-ready', handleDomReady);
      webview.removeEventListener('page-title-updated', handleTitleUpdate);
      webview.removeEventListener('page-favicon-updated', handleFaviconUpdate);
      webview.removeEventListener('update-target-url', handleTargetUrlUpdate);
      webview.removeEventListener('did-navigate', navigateHandler);
      webview.removeEventListener('did-navigate-in-page', navigateHandler);
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
        allowpopups
        partition="persist:webview"
        style={{ pointerEvents: 'unset' }}
      />
      <AnimatePresence>
        {webviewTargetUrl && (<motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="text-xs m-1 h-fit w-fit max-w-[500px] z-50 p-1 px-2 truncate bg-popover border-border border fixed bottom-4 right-4 rounded-lg pointer-events-none"
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

export function closeTab(tabId: string, setTabs: (updater: (prevTabs: Tab[]) => Tab[]) => void) {
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
