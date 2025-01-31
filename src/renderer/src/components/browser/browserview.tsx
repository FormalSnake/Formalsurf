import { Tab, tabsAtom } from "@renderer/atoms/browser"
import { useAtom } from "jotai"
import { WebView } from "./webview"
import { useEffect, useState } from "react"

export function BrowserView() {
  const [tabs] = useAtom(tabsAtom)
  const [version, setVersion] = useState("")

  useEffect(() => {
    window.api.getVersion().then((version: string) => setVersion(version))
  }, [])

  return (
    <div className="flex flex-row gap-x-2 w-full">
      {
        tabs.map((tab: Tab) => (
          <WebView key={tab.id} tab={tab} />
        ))
      }
      {
        tabs.length === 0 && <div className="flex flex-col items-center justify-center w-full h-full">
          <div className="flex flex-col items-center justify-center w-full h-full">
            <div className="text-center">
              <p className="text-[12vw] font-extrabold tracking-widest">FORMAL</p>
              <p className="text-sm font-medium font-mono text-muted-foreground">v{version}</p>
            </div>
          </div>
        </div>
      }
    </div>
  )
}
