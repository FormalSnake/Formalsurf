import { Tab, tabsAtom } from "@renderer/atoms/browser";
import { Button } from "../ui/button";
import { cn } from "@renderer/lib/utils";
import { Trash, X } from "lucide-react";
import { closeTab } from "./webview";
import { useAtom } from "jotai";

export function TabButton({ tab, setActiveTab }: { tab: Tab; setActiveTab: (id: string) => void }) {
  const [tabs, setTabs] = useAtom(tabsAtom);

  const setActive = () => {
    setActiveTab(tab.id);
  }

  const close = (e: any) => {
    e.stopPropagation();
    console.log("Closing tab:", tab.id); // Log the tab ID being closed
    closeTab(tab.id, tabs, setTabs);
  }

  return (
    <Button
      key={tab.id}
      variant="ghost"
      className={cn(
        "justify-start w-full select-none",
        tab.isActive && "bg-accent/50"
      )}
      onClick={setActive}
    >
      <img src={tab.favicon} className="w-4 h-4 rounded-md" draggable={false} />
      <span className="ml-2 text-sm font-medium truncate max-w-[calc(100%-2rem)]">
        {tab.title}
      </span>
      <button
        className="ml-auto"
        onClick={close}
      >
        <X className="h-4 w-4" />
      </button>
    </Button>
  );
}
