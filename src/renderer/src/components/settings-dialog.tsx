import * as React from 'react'
import {
  Bell,
  Check,
  ChevronsUpDown,
  Globe,
  Home,
  Keyboard,
  Link,
  Lock,
  Menu,
  MessageCircle,
  Paintbrush,
  Settings,
  Settings2,
  Video
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider
} from '@/components/ui/sidebar'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from './ui/command'
import { ThemeToggle } from './theme-toggle'
import { set } from 'electron-settings'
import { cn } from '@renderer/lib/utils'

const data = {
  nav: [
    { name: 'General', icon: Settings2 },
    { name: 'Appearance', icon: Paintbrush }
  ]
}

const searchEngines = [
  {
    value: 'google',
    label: 'Google'
  },
  {
    value: 'bing',
    label: 'Bing'
  },
  {
    value: 'duckduckgo',
    label: 'DuckDuckGo'
  },
  {
    value: 'perplexity',
    label: 'Perplexity'
  }
]

export function SettingsDialog() {
  const [open, setOpen] = React.useState(false)
  const [activePage, setActivePage] = React.useState('General')

  const [searchEngineOpen, setSearchEngineOpen] = React.useState(false)
  const [searchEngine, setSearchEngine] = React.useState('')
  const isInitialMount = React.useRef(true)

  React.useEffect(() => {
    //@ts-ignore
    window.api.handle(
      'show-settings',
      (event: any, data: any) =>
        function (event: any, data: any) {
          console.log('show-settings')
          setOpen(!!!open)
          // remove api handler
          // @ts-ignore
          window.api.removeHandler('show-settings', setOpen)
        },
      event
    )
  }, [])

  React.useEffect(() => {
    // @ts-ignore
    window.api
      .getSettings('searchEngine')
      .then((data: any) => {
        console.log(data)
        setSearchEngine(data)
      })
      .catch((error: any) => {
        console.error('Error fetching search engine setting:', error)
      })
  }, [open, activePage])

  React.useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }

    // Only save when searchEngine has a value
    if (searchEngine !== '') {
      // @ts-ignore
      window.api
        .changeSetting('searchEngine', searchEngine)
        .then(() => {
          console.log('Search engine setting updated successfully')
        })
        .catch((error: any) => {
          console.error('Error updating search engine setting:', error)
        })
    }
  }, [searchEngine])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="overflow-hidden p-0 md:max-h-[500px] md:max-w-[700px] lg:max-w-[800px]">
        <DialogTitle className="sr-only">Settings</DialogTitle>
        <DialogDescription className="sr-only">Customize your settings here.</DialogDescription>
        <SidebarProvider className="items-start">
          <Sidebar collapsible="none" className="hidden md:flex">
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {data.nav.map((item) => (
                      <SidebarMenuItem key={item.name}>
                        <SidebarMenuButton asChild isActive={item.name === activePage}>
                          <a href="#" onClick={() => setActivePage(item.name)}>
                            <item.icon />
                            <span>{item.name}</span>
                          </a>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>
          <main className="flex-1 overflow-y-auto p-4">
            <h2 className="text-lg font-semibold">{activePage}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Customize your {activePage} settings here.
            </p>
            {activePage === 'General' && (
              <div className="mt-4">
                <p className="text-sm text-muted-foreground mb-1">Search Engine</p>
                <Popover open={searchEngineOpen} onOpenChange={setSearchEngineOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={searchEngineOpen}
                      className="w-[200px] justify-between"
                    >
                      {searchEngine
                        ? searchEngines.find((framework) => framework.value === searchEngine)?.label
                        : 'Select framework...'}
                      <ChevronsUpDown className="opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[200px] p-0">
                    <Command>
                      <CommandInput placeholder="Search framework..." />
                      <CommandList>
                        <CommandEmpty>No framework found.</CommandEmpty>
                        <CommandGroup>
                          {searchEngines.map((framework) => (
                            <CommandItem
                              key={framework.value}
                              value={framework.value}
                              onSelect={(currentValue) => {
                                setSearchEngine(currentValue === searchEngine ? '' : currentValue)
                                setSearchEngineOpen(false)
                              }}
                            >
                              {framework.label}
                              <Check
                                className={cn(
                                  'ml-auto',
                                  searchEngine === framework.value ? 'opacity-100' : 'opacity-0'
                                )}
                              />
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            )}
            {activePage === 'Appearance' && (
              <div className="mt-4 space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Theme</p>
                  <ThemeToggle />
                </div>
              </div>
            )}
          </main>
        </SidebarProvider>
      </DialogContent>
    </Dialog>
  )
}
