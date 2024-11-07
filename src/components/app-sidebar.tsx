import { Calendar, Home, Inbox, Search, Settings, Plus, RefreshCcw, ArrowLeft, ArrowRight } from "lucide-react"; // Add Plus icon for "New Tab" button
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import React from "react";
import { useAtom } from "jotai";
import { TabLink, tabsAtom, useCreateNewTab } from "@/providers/TabProvider";
import { Button } from "./ui/button";

export function AppSidebar() {
  const [tabs, setTabs] = useAtom(tabsAtom);
  const createNewTab = useCreateNewTab();


  // const createNewTab = () => {
  //   const newTab = {
  //     url: "https://www.google.com",
  //     title: "New tab",
  //     webviewRef: React.createRef(),
  //     isActive: true,
  //   };
  //
  //   // Set the new tab as active and deactivate others
  //   setTabs([
  //     ...tabs.map((tab) => ({ ...tab, isActive: false })), // Deactivate current tabs
  //     newTab, // Add new active tab
  //   ]);
  // };

  return (
    <Sidebar >
      <SidebarContent className="mt-6">
        <SidebarGroup>
          <SidebarGroupLabel>
            Tabs
            <Button onClick={() => {
              return createNewTab({ url: "https://www.google.com" })
            }} className="ml-2 h-7 w-7 group/addtab" size="icon" variant="ghost">
              <Plus className="group-hover/addtab:scale-110 ease-in-out transition-transform duration-200" size={16} /> {/* Icon for adding new tab */}
            </Button>
            <SidebarTrigger />
            <Button className="ml-2 h-7 w-7 group/refresh" size="icon" variant="ghost" onClick={() => {
              // get the active tab and reload it
              const activeTab = tabs.find((tab) => tab.isActive);
              if (activeTab) {
                activeTab.webviewRef.current.reload();
              }
            }}>
              <RefreshCcw className="group-hover/refresh:rotate-180 ease-in-out transition-transform duration-200" size={16} />
            </Button>
            <Button className="ml-2 h-7 w-7 group/goback" size="icon" variant="ghost" onClick={() => {
              // get the active tab and reload it
              const activeTab = tabs.find((tab) => tab.isActive);
              if (activeTab) {
                activeTab.webviewRef.current.goBack();
              }
            }}>
              <ArrowLeft className="group-hover/goback:translate-x-[-4px] ease-in-out transition-transform duration-200" size={16} />
            </Button>
            <Button className="ml-2 h-7 w-7 group/goforward" size="icon" variant="ghost" onClick={() => {
              // get the active tab and reload it
              const activeTab = tabs.find((tab) => tab.isActive);
              if (activeTab) {
                activeTab.webviewRef.current.goForward();
              }
            }}>
              <ArrowRight className="group-hover/goforward:translate-x-1 ease-in-out transition-transform duration-200" size={16} />
            </Button>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {tabs.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <TabLink tab={item} />
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
