import React from "react";
import DragWindowRegion from "@/components/DragWindowRegion";
import NavigationMenu from "@/components/NavigationMenu";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar"
import { TabProvider } from "@/providers/TabProvider";

export default function BaseLayout({ children }: { children: React.ReactNode }) {
  return (
    <TabProvider>
      <SidebarProvider>
        <AppSidebar />
        {/* <div className="flex flex-row h-screen"> */}
        {/* <DragWindowRegion /> */}
        {/* <NavigationMenu /> */}
        <main className="flex-1">
          {children}
        </main>
        {/* </div> */}
      </SidebarProvider>
    </TabProvider>
  );
}
