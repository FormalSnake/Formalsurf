import { Tab, tabsAtom } from "@renderer/atoms/browser"
import { useAtom } from "jotai"
import { WebView } from "./webview"

export function BrowserView() {
  const [tabs] = useAtom(tabsAtom)

  return (
    <div className="flex flex-row gap-x-2 w-full">
      {
        tabs.map((tab: Tab) => (
          <WebView key={tab.id} tab={tab} />
        ))
      }
    </div>
  )
}
