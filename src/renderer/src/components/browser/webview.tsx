import { activeTabRefAtom, Tab, tabsAtom } from "@renderer/atoms/browser";
import { cn } from "@renderer/lib/utils";
import { useAtom } from "jotai";
import { useEffect, useRef } from "react";

export function WebView({ tab }: { tab: Tab }) {
  const [tabs, setTabs] = useAtom(tabsAtom);
  const [activeTabRef, setActiveTabRef] = useAtom(activeTabRefAtom);
  const ref = useRef<HTMLWebViewElement>(null);

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

  // if i am the current active tab, set the activeTabRef to me
  useEffect(() => {
    if (tab.isActive) {
      setActiveTabRef(ref);
    }
  }, [tab.isActive, setActiveTabRef]);

  useEffect(() => {
    const webview = ref.current;
    if (!webview) return;

    const handleDomReady = () => {
      // Set the current tab's title
      handleTitleUpdate();
    };

    const handleTitleUpdate = () => {
      // Set the current tab's title
      updateCurrentTab((t) => ({ ...t, title: webview.getTitle() }));
    };

    const handleFaviconUpdate = (event: any) => {
      // Set the current tab's favicon
      updateCurrentTab((t) => ({ ...t, favicon: event.favicons[0] }));
    };

    webview.addEventListener('dom-ready', handleDomReady);
    webview.addEventListener('page-title-updated', handleTitleUpdate);
    webview.addEventListener('page-favicon-updated', handleFaviconUpdate);

    // Cleanup event listener
    return () => {
      webview.removeEventListener('dom-ready', handleDomReady);
      webview.removeEventListener('page-title-updated', handleTitleUpdate);
      webview.removeEventListener('page-favicon-updated', handleFaviconUpdate);
    };
  }, [ref]);

  return (
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
