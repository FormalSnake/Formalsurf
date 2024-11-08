import { tabsAtom, useCreateNewTab } from "@/providers/TabProvider";
import { useAtom } from "jotai";
import { Loader, LoaderCircle } from "lucide-react";
import React, { useEffect, useState } from "react";

export default function HomePage() {
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
    tabs.forEach((tab, index) => {
      if (!tab.webviewRef) {
        // @ts-ignore
        tab.webviewRef = React.createRef();
      }

      // @ts-ignore
      const webview = tab.webviewRef.current;

      if (webview && !webview.hasListeners) {
        // Listen for URL changes
        webview.addEventListener("did-navigate", (event: { url: any; }) => {
          setTabs((prevTabs) =>
            prevTabs.map((prevTab, idx) =>
              idx === index ? { ...prevTab, url: event.url } : prevTab
            )
          );
        });

        // Listen for title changes
        webview.addEventListener("page-title-updated", (event: { title: any; }) => {
          setTabs((prevTabs) =>
            prevTabs.map((prevTab, idx) =>
              idx === index ? { ...prevTab, title: event.title } : prevTab
            )
          );
        });

        webview.hasListeners = true; // Prevents duplicate listeners
      }
    });
  }, [tabs, setTabs]);

  return (
    <div className="w-full h-full">
      {tabs.map((tab, index) => (
        <webview
          key={index}
          ref={tab.webviewRef}
          src={tab.url}
          className={`w-full h-full ${tab.isActive ? "" : "hidden"}`} // Hide inactive webviews
          // @ts-ignore
          allowpopups="true"
          webpreferences="allowRunningInsecureContent"
          // @ts-ignore
          disablewebsecurity="true"
          // @ts-ignore
          nodeintegration="true"
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
  );
}
