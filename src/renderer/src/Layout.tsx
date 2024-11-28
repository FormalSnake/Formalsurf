import React from 'react'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { TabProvider } from '@/providers/TabProvider'
import { NewTabDialog } from '@/components/NewTab'
import { Settings } from 'lucide-react'
import { SettingsDialog } from './components/settings-dialog'

export default function BaseLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <NewTabDialog />
      <SidebarInset className="overflow-hidden">
        <TabProvider>
          <SettingsDialog />

          {children}
        </TabProvider>
      </SidebarInset>
    </SidebarProvider>
  )
}
