import React, { useEffect, useRef, useCallback } from "react";
import { useAtom } from "jotai";
import { activeTabRefAtom, tabsAtom, useCloseTab, useCreateNewTab } from "@/providers/TabProvider";
import { isNewTabDialogOpen, tabBarUrl } from "./components/NewTab";
import { sidebarOpenAtom } from "./components/ui/sidebar";
import BaseLayout from "./Layout";

const Tab = React.memo(({ tab, isActive }: { tab: any; isActive: boolean }) => {
  const [tabs, setTabs] = useAtom(tabsAtom);
  const [activeTab, setActiveTab] = useAtom(activeTabRefAtom);

  // Ensure ref is always initialized, even if it wasn't before
  const ref = useRef<HTMLWebViewElement | null>(tab.webviewRef?.current || null);

  useEffect(() => {
    const webview = ref.current;

    // @ts-ignore
    if (webview && !webview.hasListeners) {
      console.log(`Adding listeners for tab ${tab.url}`);

      const updateTabState = (id: string, update: Partial<typeof tab>) => {
        setTabs((prevTabs) => {
          const tabExists = prevTabs.some((prevTab) => prevTab.id === id);
          if (!tabExists) {
            console.warn(`Tab with id ${id} not found!`);
            return prevTabs;
          }
          return prevTabs.map((prevTab) =>
            prevTab.id === id ? { ...prevTab, ...update } : prevTab
          );
        });
      };
      const navigateHandler = (id: string, event: { url: string }) => {
        console.log(`NavigateHandler triggered for id: ${id}, url: ${event.url}`);
        updateTabState(id, { url: event.url });
      };

      const titleHandler = (id: string, event: { title: string }) => {
        console.log(`TitleHandler triggered for id: ${id}, title: ${event.title}`);
        updateTabState(id, { title: event.title });
      };

      const faviconHandler = (id: string, event: { favicons: string[] }) => {
        console.log(`FaviconHandler triggered for id: ${id}, favicons: ${event.favicons}`);
        if (event.favicons.length > 0) {
          updateTabState(id, { favicon: event.favicons[0] });
        }
      };
      // Updated navigateHandler to use `id` instead of `url`
      webview.addEventListener('did-navigate', (event) => {
        // @ts-ignore
        navigateHandler(tab.id, event);
      });

      webview.addEventListener('page-title-updated', (event) => {
        // @ts-ignore
        titleHandler(tab.id, event);
      });

      webview.addEventListener('page-favicon-updated', (event) => {
        // @ts-ignore
        faviconHandler(tab.id, event);
      });
      // @ts-ignore

      // Prevent redundant listeners
      webview.hasListeners = true;

      // Cleanup function
      return () => {
        // @ts-ignore
        webview.removeEventListener('did-navigate', navigateHandler);
        // @ts-ignore
        webview.removeEventListener('page-title-updated', titleHandler);
        // @ts-ignore
        webview.removeEventListener('page-favicon-updated', faviconHandler);
        // @ts-ignore
        webview.hasListeners = false;
      };
    }
    return () => { };
  }, [ref, tab.url, setTabs]);

  // useEffect that changes setActiveTab to use the ref of the current active tabs webveiew
  useEffect(() => {
    const activeTab = tabs.find((tab) => tab.isActive);
    if (ref.current && activeTab && activeTab.url === tab.url) {
      setActiveTab(ref.current);
    }
    // if (ref.current && activeTab && activeTab.url === tab.url) {
    //   console.log("Setting active tab", ref.current);
    //   setActiveTab(ref.current);
    // }
  }, [tabs, setTabs]);

  return (
    <webview
      ref={ref}
      src={tab.url}
      className={`w-full h-full bg-foreground ${isActive ? "" : "hidden"}`}
      webpreferences="autoplayPolicy=user-gesture-required,defaultFontSize=16,contextIsolation=true,nodeIntegration=false,sandbox=true,webSecurity=true"
      // @ts-ignore
      allowpopups="true"
      partition="persist:webview"
    />
  );
});

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


  return (
    <BaseLayout>
      <div className="w-full h-full">
        {tabs.map((tab) => (
          <Tab key={tab.id} tab={tab} isActive={tab.isActive} />
        ))}
        {tabs.length === 0 && (
          <div className="w-full h-full flex justify-center items-center text-foreground">
            <img
              className="z-0 w-full h-full flex-1 absolute object-cover"
              src="https://preview.redd.it/i-made-a-set-of-totoro-wallpaper-for-pc-and-mobile-phone-v0-6hzef7qqqiqb1.jpg?width=4000&format=pjpg&auto=webp&s=281f33ceecd840fe909244283d2c006ff0ebdbd5"
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
