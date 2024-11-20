import React from "react";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar"
import { TabProvider } from "@/providers/TabProvider";
import { NewTabDialog } from "@/components/NewTab";

export default function BaseLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <NewTabDialog />
      <SidebarInset className="overflow-hidden">
        <TabProvider>
          <main className="h-full w-full flex-1">
            {children}
          </main>
        </TabProvider>
      </SidebarInset>
    </SidebarProvider>
  );
}