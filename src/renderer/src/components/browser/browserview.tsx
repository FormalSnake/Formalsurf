import { Tab, tabsAtom } from "@renderer/atoms/browser"
import { useAtom } from "jotai"
import { WebView } from "./webview"

export function BrowserView() {
  const [tabs] = useAtom(tabsAtom)

  return (
    <>
      {
        tabs.map((tab: Tab) => (
          <WebView key={tab.id} tab={tab} />
        ))
      }
    </>
  )
}
