import React, { useEffect } from 'react'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { TabProvider } from '@/providers/TabProvider'
import { NewTabDialog } from '@/components/NewTab'
import { Settings } from 'lucide-react'
import { SettingsDialog } from './components/settings-dialog'
import { ThemeProvider } from './components/theme-provider'

export default function BaseLayout({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = React.useState<'dark' | 'light' | 'system'>('system')

  useEffect(() => {
    // @ts-ignore
    window.api
      .getSettings('theme')
      .then((savedTheme: any) => {
        if (savedTheme) {
          setTheme(savedTheme)
        }
      })
      .catch((error: any) => {
        console.error('Error fetching theme setting:', error)
      })

    // Listen for theme changes
    // @ts-ignore
    window.api.onSettingChanged((event: any, key: string, value: any) => {
      if (key === 'theme') {
        setTheme(value || 'system')
      }
    })
  }, [])

  return (
    <ThemeProvider defaultTheme={theme}>
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
