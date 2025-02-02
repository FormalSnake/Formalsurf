import { Tab, tabsAtom } from "@renderer/atoms/browser";
import { useAtom } from "jotai";
import { WebView } from "./webview";
import { useEffect, useState } from "react";
import { throttle } from "lodash"; // For throttling the mousemove event

export function BrowserView() {
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [tabs] = useAtom(tabsAtom);
  const [version, setVersion] = useState("");

  useEffect(() => {
    window.api.getVersion().then((version: string) => setVersion(version));
  }, []);

  useEffect(() => {
    const handleMouseMove = throttle((e) => {
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
  }, []);

  return (
    <div className="flex flex-row gap-x-2 w-full">
      {tabs.map((tab: Tab) => (
        <WebView key={tab.id} tab={tab} />
      ))}
      {tabs.length === 0 && (
        <div className="flex flex-col items-center justify-center w-full h-full">
          <div className="flex flex-col items-center justify-center w-full h-full relative">
            <div
              className="text-center transform-3d"
              style={{
                transform: `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
              }}
            >
              <p className="text-[12vw] font-extrabold tracking-widest [text-shadow:_4px_4px_15px_rgb(0_0_0_/_70%)]">
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
