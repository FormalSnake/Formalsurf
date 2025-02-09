import { Tab, tabsAtom } from "@renderer/atoms/browser";
import { useAtom } from "jotai";
import { WebView } from "./webview";
import { Fragment, useEffect, useState } from "react";
import { throttle } from "lodash"; // For throttling the mousemove event

export function BrowserView() {
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [tabs] = useAtom(tabsAtom);
  const [version, setVersion] = useState("");

  useEffect(() => {
    if (tabs.length !== 0) return;
    window.api.getVersion().then((version: string) => setVersion(version));
  }, [tabs]);

  useEffect(() => {
    if (tabs.length !== 0) return;
    const handleMouseMove = throttle((e: { clientX: any; clientY: any; }) => {
      const { clientX, clientY } = e;
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const deltaX = (clientX - centerX) / centerX; // Normalize to [-1, 1]
      const deltaY = (clientY - centerY) / centerY; // Normalize to [-1, 1]
      const rotationX = -deltaY * 20; // Vertical movement affects rotateX
      const rotationY = deltaX * 20; // Horizontal movement affects rotateY
      setRotation({ x: rotationX, y: rotationY });
    }, 50); // Throttle to 50ms

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [tabs]);

  return (
    <div className="flex flex-row gap-x-2 w-full relative">
      {tabs.map((tab: Tab) => {
        const renderTabs = (tab: Tab): JSX.Element[] => {
          const elements: JSX.Element[] = [];
          
          // Add the WebView for this tab
          elements.push(<WebView key={tab.id} tab={tab} />);
          
          // Recursively render subtabs
          if (tab.subTabs?.length > 0) {
            tab.subTabs.forEach(subTab => {
              elements.push(...renderTabs(subTab));
            });
          }
          
          return elements;
        };
        
        const allWebViews = renderTabs(tab);
        return <Fragment key={tab.id}>{allWebViews}</Fragment>;
      })}
      {tabs.length === 0 && (
        <div className="flex flex-col items-center justify-center w-full h-full">
          <div className="flex flex-col items-center justify-center w-full h-full relative">
            <div
              className="text-center transform-3d"
              style={{
                transform: `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
              }}
            >
              <p className="text-[12vw] font-extrabold tracking-widest [text-shadow:_4px_4px_15px_rgb(0_0_0_/_70%)] select-none">
                FORMAL
              </p>
            </div>
            <p className="text-sm font-medium font-mono text-muted-foreground">
              v{version}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
