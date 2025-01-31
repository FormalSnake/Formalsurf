import { Tab, tabsAtom } from "@renderer/atoms/browser";
import { Button } from "../ui/button";
import { cn } from "@renderer/lib/utils";
import { Trash } from "lucide-react";
import { closeTab } from "./webview";
import { useAtom } from "jotai";

export function TabButton({ tab, setActiveTab }: { tab: Tab; setActiveTab: (id: string) => void }) {
  const [tabs, setTabs] = useAtom(tabsAtom);
  return (
    <Button
      key={tab.id}
      variant="ghost"
      className={cn(
        "justify-start w-full",
        tab.isActive && "bg-primary/90 text-primary-foreground"
      )}
      onClick={() => setActiveTab(tab.id)}
    >
      <img src={tab.favicon} className="w-4 h-4 rounded-md" />
      <span className="ml-2 text-sm font-medium truncate max-w-[calc(100%-2rem)]">
        {tab.title}
      </span>
      <button
        className="ml-auto"
        onClick={(e) => {
          e.stopPropagation();
          console.log("Closing tab:", tab.id); // Log the tab ID being closed
          closeTab(tab.id, setTabs);
        }}
      >
        <Trash className="h-4 w-4" />
      </button>
    </Button>
  );
}
