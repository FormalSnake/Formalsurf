import { Tab, tabsAtom } from "@renderer/atoms/browser";
import { cn } from "@renderer/lib/utils";
import { useAtom } from "jotai";
import { useEffect, useRef } from "react";

export function WebView({ tab }: { tab: Tab }) {
  const [tabs, setTabs] = useAtom(tabsAtom);
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

    const handleFaviconUpdate = (event) => {
      // Set the current tab's favicon
      updateCurrentTab((t) => ({ ...t, favicon: event.favicons[0] }));
    };

    webview.addEventListener('dom-ready', handleDomReady);
    webview.addEventListener('page-title-updated', handleTitleUpdate);
    webview.addEventListener('page-favicon-updated', handleFaviconUpdate);

    // Cleanup event listener
    return () => {
      webview.removeEventListener('dom-ready', handleDomReady);
    };
  }, [ref]);

  return (
    <webview
      ref={ref}
      key={tab.id}
      src={tab.url}
      id={tab.id}
      className={cn('w-full', !tab.isActive && 'hidden')}
      webpreferences="autoplayPolicy=document-user-activation-required,defaultFontSize=16,contextIsolation=true,nodeIntegration=false,sandbox=true,webSecurity=true"
      allowpopups
      partition="persist:webview"
      style={{ pointerEvents: 'unset' }}
    />
  );
}

export function reloadTab(tabs: Tab[]) {
  const activeTab = tabs.find((tab) => tab.isActive);
  if (activeTab) {
    activeTab.ref?.current?.reload();
  }
}
