import { Tab, tabsAtom } from "@renderer/atoms/browser";
import { Button } from "../ui/button";
import { cn } from "@renderer/lib/utils";
import { ChevronRight, Trash, X } from "lucide-react";
import { closeTab } from "./webview";
import { useAtom } from "jotai";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@renderer/components/ui/context-menu"
import { useEffect, useState } from "react";

export function TabButton({ tab, setActiveTab, depth = 0 }: {
  tab: Tab;
  setActiveTab: (id: string) => void; depth?: number
}) {
  const [tabs, setTabs] = useAtom(tabsAtom);
  const [isExpanded, setIsExpanded] = useState(depth === 0); // Top-level tab start expanded

  const setActive = (tab: Tab) => {
    console.log("Setting tab active:", tab.id);
    
    setTabs((prevTabs) => {
      const updateTabs = (tabs: Tab[]): Tab[] => {
        return tabs.map(t => {
          // Handle subtabs recursively
          const updatedSubTabs = t.subTabs ? updateTabs(t.subTabs) : [];
          
          return {
            ...t,
            isActive: t.id === tab.id,
            subTabs: updatedSubTabs
          };
        });
      };

      return updateTabs(prevTabs);
    });

    // Always call setActiveTab after updating the tabs state
    setActiveTab(tab.id);
  }

  const close = (e: any, tab: Tab) => {
    e.stopPropagation();
    closeTab(tab.id, tabs, setTabs);
  }

  const toggleExpand = (e: any) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  }

  return (
    <div className="flex flex-col">
      <TabComponent
        key={tab.id}
        tab={tab}
        setActive={setActive}
        close={close}
        depth={depth}
        isExpanded={isExpanded}
        hasChildren={tab.subTabs?.length > 0}
        toggleExpand={toggleExpand}
      />
      {isExpanded && tab.subTabs?.length > 0 && (
        <div className="ml-4 border-l border-border">
          {tab.subTabs.map((subTab) => (
            <TabButton
              key={subTab.id}
              tab={subTab}
              setActiveTab={setActiveTab}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

const TabComponent = ({ tab, setActive, close, depth, isExpanded, hasChildren, toggleExpand }) => {
  return (
    <Button
      variant="ghost"
      className={cn(
        "justify-start w-full select-none pl-2",
        tab.isActive && "bg-accent/50"
      )}
      style={{ paddingLeft: `${depth * 1.5}rem` }}
      onClick={() => setActive(tab)}
      id={tab.id}
    >
      {hasChildren && (
        <button
          onClick={toggleExpand}
          className="mr-1 p-1 hover:bg-accent/20 rounded"
        >
          <ChevronRight className={cn(
            "h-3 w-3 transition-transform",
            isExpanded && "rotate-90"
          )} />
        </button>
      )}
      <img
        src={tab.favicon}
        className="w-4 h-4 rounded-md"
        draggable={false}

      />
      <span className="ml-2 text-sm font-medium truncate
 max-w-[calc(100%-4rem)]">
        {tab.title}
      </span>
      <div
        className="ml-auto p-1 hover:bg-accent/20 rounded"
        onClick={(e) => close(e, tab)}
      >
        <X className="h-4 w-4" />
      </div>
    </Button>
  )
}

