import { tabsAtom, useCreateNewTab } from "@/providers/TabProvider";
import { useAtom } from "jotai";
import { Loader, LoaderCircle } from "lucide-react";
import React, { useEffect, useState } from "react";
import BaseLayout from './Layout'

function App(): JSX.Element {
  const [tabs, setTabs] = useAtom(tabsAtom);
  const createNewTab = useCreateNewTab();

  // @ts-ignore
  window.api.handle(
    "open-url",
    (event: any, data: any) =>
      function(event: any, data: any) {
        createNewTab({ url: data })
      },
    event
  );

  useEffect(() => {
    // Initialize each tab's webviewRef if null and add navigation listeners
    tabs.forEach((tab: any, index: number) => {
      if (!tab.webviewRef) {
        // @ts-ignore
        tab.webviewRef = React.createRef();
      }

      // @ts-ignore
      const webview = tab.webviewRef.current;

      if (webview && !webview.hasListeners) {
        // Listen for URL changes
        webview.addEventListener("did-navigate", (event: { url: any; }) => {
          setTabs((prevTabs: any) =>
            prevTabs.map((prevTab: any, idx: any) =>
              idx === index ? { ...prevTab, url: event.url } : prevTab
            )
          );
        });

        // Listen for title changes
        webview.addEventListener("page-title-updated", (event: { title: any; }) => {
          setTabs((prevTabs: any) =>
            prevTabs.map((prevTab: any, idx: any) =>
              idx === index ? { ...prevTab, title: event.title } : prevTab
            )
          );
        });
        // set favicon in tab when page-favicon-updated
        webview.addEventListener("page-favicon-updated", (event: { favicons: any; }) => {
          setTabs((prevTabs: any) =>
            prevTabs.map((prevTab: any, idx: any) =>
              idx === index ? { ...prevTab, favicon: event.favicons[0] } : prevTab
            )
          );
        });

        webview.hasListeners = true; // Prevents duplicate listeners
      }
    });
  }, [tabs, setTabs]);

  return (
    <BaseLayout>
      <div className="w-full h-full">
        {tabs.map((tab: any, index: number) => (
          <webview
            key={index}
            ref={tab.webviewRef}
            src={tab.url}
            className={`w-full h-full bg-foreground ${tab.isActive ? "" : "hidden"}`} // Hide inactive webviews
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
        ))}
        {tabs.length == 0 ? (
          <div className="w-full h-full flex justify-center items-center text-foreground">
            <img className="z-0 w-full h-full flex-1 absolute object-cover" src="https://wallpapercat.com/w/full/5/c/0/2117697-3840x2160-desktop-4k-dark-wallpaper.jpg" />
            <div className="text-center z-10 mb-32">
              <p className="text-xl font-bold">No tabs open</p>
              <p className="text-sm">Click the + button to create a new tab</p>
            </div>
          </div>
        ) : <></>
        }
      </div>
    </BaseLayout>
  )
}

export default App
