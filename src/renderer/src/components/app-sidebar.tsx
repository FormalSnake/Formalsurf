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
import { TabLink, tabsAtom, useCreateNewTab } from "@/providers/TabProvider";
import { isNewTabDialogOpen } from "./NewTab";

const AddTabButton = React.memo(({ onClick }: { onClick: () => void }) => (
  <Button onClick={onClick} className="ml-2 h-7 w-7 group/addtab" size="icon" variant="ghost">
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
    <Button className={`ml-2 h-7 w-7 ${className}`} size="icon" variant="ghost" onClick={onClick}>
      <Icon className={hoverClass} size={16} />
    </Button>
  )
);

const TabList = React.memo(({ tabs }: { tabs: any[] }) => (
  <SidebarMenu>
    {tabs.map((item) => (
      <SidebarMenuItem key={item.title}>
        <SidebarMenuButton asChild>
          <TabLink tab={item} />
        </SidebarMenuButton>
      </SidebarMenuItem>
    ))}
  </SidebarMenu>
));

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [tabs, setTabs] = useAtom(tabsAtom);
  const [tabDialogOpen, setTabDialogOpen] = useAtom(isNewTabDialogOpen);
  const createNewTab = useCreateNewTab();

  const isMacOS = useMemo(
    () => typeof navigator !== "undefined" && /Mac/i.test(navigator.platform),
    []
  );

  const handleAddTab = useCallback(() => setTabDialogOpen(true), [setTabDialogOpen]);

  const handleAction = useCallback(
    (action: "reload" | "goBack" | "goForward") => {
      const activeTab = tabs.find((tab) => tab.isActive);
      if (activeTab && activeTab.webviewRef?.current) {
        if (action === "reload") activeTab.webviewRef.current.reload();
        if (action === "goBack") activeTab.webviewRef.current.goBack();
        if (action === "goForward") activeTab.webviewRef.current.goForward();
      }
    },
    [tabs]
  );

  return (
    <Sidebar {...props} className="draglayer" >
      <SidebarContent className={`${isMacOS ? "mt-6" : ""} draglayer`}>
        <SidebarGroup className="nodraglayer">
          <div className="flex h-full w-full flex-row gap-1 p-1 justify-evenly">
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
          <SidebarGroupContent>
            <TabList tabs={tabs} />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
