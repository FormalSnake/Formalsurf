import { tabsAtom, useCloseTab, useCreateNewTab } from "@/providers/TabProvider";
import { useAtom } from "jotai";
import React, { useEffect, useRef, useCallback, useState } from "react";
import BaseLayout from './Layout';
import { isNewTabDialogOpen } from "./components/NewTab";
import { sidebarOpenAtom, SidebarProvider, SidebarTrigger, useSidebar } from "./components/ui/sidebar";

// Debounce helper
function debounce(func: Function, wait: number) {
  let timeout: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Extracted Tab Component
const Tab = React.memo(({ tab, isActive }: { tab: any; isActive: boolean }) => (
  <webview
    ref={tab.webviewRef}
    src={tab.url}
    className={`w-full h-full bg-foreground ${isActive ? "" : "hidden"}`} // Hide inactive webviews
    // @ts-ignore
    allowpopups="true"
    webpreferences="allowRunningInsecureContent"
    // @ts-ignore
    disablewebsecurity="true"
    // @ts-ignore
    nodeintegration="true"
    // @ts-ignore
    plugins="true"
    partition="persist:webview"
  />
));

function App(): JSX.Element {
  const [tabs, setTabs] = useAtom(tabsAtom);
  const createNewTab = useCreateNewTab();
  const closeTab = useCloseTab()
  const initializedTabs = useRef<Set<number>>(new Set()); // Track initialized tabs
  const [tabDialogOpen, setTabDialogOpen] = useAtom(isNewTabDialogOpen);
  const [sidebarOpen, setSidebarOpen] = useAtom(sidebarOpenAtom)

  const handleOpenUrl = useCallback(
    (event: any, data: any) => {
      createNewTab({ url: data });
    },
    [createNewTab]
  );

  // @ts-ignore
  window.api.handle(
    "open-url",
    (event: any, data: any) =>
      function(event: any, data: any) {
        createNewTab({ url: data })
      },
    event
  );

  //@ts-ignore
  window.api.handle("close-active-tab",
    (event: any, data: any) =>
      function(event: any, data: any) {
        console.log("close-active-tab")
        closeTab()
        // remove api handler
        // @ts-ignore
        window.api.removeHandler("close-active-tab", closeTab);
      },
    event
  );

  // @ts-ignore
  window.api.handle("new-tab",
    (event: any, data: any) =>
      function(event: any, data: any) {
        console.log("new-tab")
        setTabDialogOpen(true);
        // remove api handler
        // @ts-ignore
        window.api.removeHandler("new-tab", setTabDialogOpen);
      },
    event
  );

  // toggle-sidebar listener
  // @ts-ignore
  window.api.handle("toggle-sidebar",
    (event: any, data: any) =>
      function(event: any, data: any) {
        console.log("toggle-sidebar")
        setSidebarOpen((open) => !open);
        console.log(sidebarOpen)
        // remove api handler
        // @ts-ignore
        window.api.removeHandler("toggle-sidebar", setSidebarOpen);
      },
    event
  );

  // useEffect(() => {
  //   // @ts-ignore
  //   window.api.handle("open-url", handleOpenUrl);
  //   return () => {
  //     // @ts-ignore
  //     window.api.removeHandler("open-url", handleOpenUrl);
  //   };
  // }, [handleOpenUrl]);

  useEffect(() => {
    // Initialize tabs and listeners only once
    tabs.forEach((tab: any, index: number) => {
      if (initializedTabs.current.has(index)) return;

      if (!tab.webviewRef) {
        // @ts-ignore
        tab.webviewRef = React.createRef();
      }

      const webview = tab.webviewRef.current;

      if (webview && !webview.hasListeners) {
        const updateTabState = debounce((update: any) => {
          setTabs((prevTabs: any) =>
            prevTabs.map((prevTab: any, idx: any) =>
              idx === index ? { ...prevTab, ...update } : prevTab
            )
          );
        }, 200);

        webview.addEventListener("did-navigate", (event: { url: string }) => {
          updateTabState({ url: event.url });
        });

        webview.addEventListener("page-title-updated", (event: { title: string }) => {
          updateTabState({ title: event.title });
        });

        webview.addEventListener("page-favicon-updated", (event: { favicons: string[] }) => {
          updateTabState({ favicon: event.favicons[0] });
        });

        webview.hasListeners = true;
      }

      initializedTabs.current.add(index); // Mark tab as initialized
    });
  }, [tabs, setTabs]);

  return (
    <BaseLayout>
      <div className="w-full h-full">
        {tabs.map((tab: any, index: number) => (
          <Tab key={index} tab={tab} isActive={tab.isActive} />
        ))}
        {tabs.length === 0 && (
          <div className="w-full h-full flex justify-center items-center text-foreground">
            <img
              className="z-0 w-full h-full flex-1 absolute object-cover"
              src="https://wallpapercat.com/w/full/5/c/0/2117697-3840x2160-desktop-4k-dark-wallpaper.jpg"
            />
            <div className="text-center z-10 mb-32">
              <p className="text-xl font-bold">No tabs open</p>
              <p className="text-sm">Click the + button to create a new tab</p>
            </div>
          </div>
        )}
      </div>
    </BaseLayout>
  );
}

export default App;
