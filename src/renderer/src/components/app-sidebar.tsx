import React, { useCallback, useMemo } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "./ui/button";
import { Plus, RefreshCcw, ArrowLeft, ArrowRight } from "lucide-react";
import { useAtom } from "jotai";
import { activeTabRefAtom, TabLink, tabsAtom, useCreateNewTab } from "@/providers/TabProvider";
import { isNewTabDialogOpen } from "./NewTab";
import { Separator } from "./ui/separator";

const AddTabButton = React.memo(({ onClick }: { onClick: () => void }) => (
  <Button onClick={onClick} className="h-7 w-7 group/addtab" size="icon" variant="ghost">
    <Plus className="group-hover/addtab:scale-110 ease-in-out transition-transform duration-200" size={16} />
  </Button>
));

const ActionButton = React.memo(
  ({
    className,
    onClick,
    Icon,
    hoverClass,
  }: {
    className: string;
    onClick: () => void;
    Icon: any;
    hoverClass: string;
  }) => (
    <Button className={`h-7 w-7 ${className}`} size="icon" variant="ghost" onClick={onClick}>
      <Icon className={hoverClass} size={16} />
    </Button>
  )
);

const TabList = React.memo(({ tabs }: { tabs: any[] }) => {
  const pinnedTabs = tabs.filter((tab) => tab.pinned);
  const unpinnedTabs = tabs.filter((tab) => !tab.pinned);

  return (
    <SidebarMenu>
      {pinnedTabs.map((item) => (
        <SidebarMenuItem key={item.id}>
          <SidebarMenuButton asChild>
            <TabLink tab={item} />
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
      {pinnedTabs.length > 0 && <Separator />}
      {unpinnedTabs.map((item) => (
        <SidebarMenuItem key={item.id}>
          <SidebarMenuButton asChild>
            <TabLink tab={item} />
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
});

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [tabs, setTabs] = useAtom(tabsAtom);
  const [tabDialogOpen, setTabDialogOpen] = useAtom(isNewTabDialogOpen);
  const createNewTab = useCreateNewTab();
  const [activeTab, setActiveTab] = useAtom(activeTabRefAtom);

  const handleAddTab = useCallback(() => setTabDialogOpen(true), [setTabDialogOpen]);

  // handleAction but every time it is called it looks for the tab with the activeTab being true
  const handleAction = useCallback((action: "reload" | "goBack" | "goForward") => {
    console.log("Action", action)
    // const activeTab = tabs.find((tab) => tab.isActive);
    // console.log("Active tab", activeTab)
    if (activeTab) {
      if (action === "reload") activeTab.reload();
      if (action === "goBack") activeTab.goBack();
      if (action === "goForward") activeTab.goForward();
    }
  }, [tabs, activeTab]);

  // @ts-ignore
  window.api.handle("reload",
    (event: any, data: any) =>
      function(event: any, data: any) {
        console.log("reload")
        console.log("Current active tab:", activeTab);
        handleAction("reload")
        // remove api handler
      },
    event
  );

  return (
    <Sidebar {...props} className="draglayer" >
      <div className="flex flex-row mt-2.5 ml-16 justify-evenly nodraglayer">
        <AddTabButton onClick={handleAddTab} />
        <SidebarTrigger />
        <ActionButton
          className="group/refresh"
          onClick={() => handleAction("reload")}
          Icon={RefreshCcw}
          hoverClass="group-hover/refresh:rotate-180 ease-in-out transition-transform duration-200"
        />
        <ActionButton
          className="group/goback"
          onClick={() => handleAction("goBack")}
          Icon={ArrowLeft}
          hoverClass="group-hover/goback:translate-x-[-4px] ease-in-out transition-transform duration-200"
        />
        <ActionButton
          className="group/goforward"
          onClick={() => handleAction("goForward")}
          Icon={ArrowRight}
          hoverClass="group-hover/goforward:translate-x-1 ease-in-out transition-transform duration-200"
        />
      </div>
      <SidebarContent className={`draglayer`}>
        <SidebarGroup className="nodraglayer">
          <SidebarGroupContent>
            <TabList tabs={tabs} />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
