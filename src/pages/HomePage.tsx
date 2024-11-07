import { tabsAtom, useCreateNewTab } from "@/providers/TabProvider";
import { useAtom } from "jotai";
import React, { useEffect } from "react";

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
        tab.webviewRef = React.createRef();
      }

      const webview = tab.webviewRef.current;

      if (webview && !webview.hasListeners) {
        // Listen for URL changes
        webview.addEventListener("did-navigate", (event) => {
          setTabs((prevTabs) =>
            prevTabs.map((prevTab, idx) =>
              idx === index ? { ...prevTab, url: event.url } : prevTab
            )
          );
        });

        // Listen for title changes
        webview.addEventListener("page-title-updated", (event) => {
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
          allowpopups="true"
          webpreferences="allowRunningInsecureContent"
          disablewebsecurity="true"
          nodeintegration="true"
        />
      ))}
    </div>
  );
}
