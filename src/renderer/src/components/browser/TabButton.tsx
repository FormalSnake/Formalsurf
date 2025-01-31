import { Tab } from "@renderer/atoms/browser";
import { Button } from "../ui/button";
import { cn } from "@renderer/lib/utils";

export function TabButton({ tab, setActiveTab }: { tab: Tab; setActiveTab: (id: string) => void }) {
  return (
    <Button
      key={tab.id}
      variant="ghost"
      className={cn("justify-start w-full", tab.isActive && "bg-primary/90 text-primary-foreground")}
      onClick={() => setActiveTab(tab.id)}
    >
      <img src={tab.favicon} className="w-4 h-4 rounded-md" />
      <span className="ml-2 text-sm font-medium truncate max-w-[calc(100%-2rem)]">
        {tab.title}
      </span>
    </Button>
  )
}
