import React, { useCallback, useMemo, useState, useEffect, useRef } from 'react'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger
} from '@/components/ui/sidebar'
import { Button } from './ui/button'
import { Plus, RefreshCcw, ArrowLeft, ArrowRight, HomeIcon } from 'lucide-react'
import { useAtom } from 'jotai'
import { activeTabRefAtom, TabLink, tabsAtom, useCreateNewTab } from '@/providers/TabProvider'
import { isNewTabDialogOpen } from './NewTab'
import { Separator } from './ui/separator'
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects
} from '@dnd-kit/core'
import { SortableContext, arrayMove, horizontalListSortingStrategy } from '@dnd-kit/sortable'
import { cn } from '@renderer/lib/utils'
import { homeOpenAtom } from './home'

const AddTabButton = React.memo(({ onClick }: { onClick: () => void }) => (
  <Button onClick={onClick} className="h-7 w-7 group/addtab" size="icon" variant="ghost">
    <Plus
      className="group-hover/addtab:scale-110 ease-in-out transition-transform duration-200"
      size={16}
    />
  </Button>
))

const ActionButton = React.memo(
  ({
    className,
    onClick,
    Icon,
    hoverClass
  }: {
    className: string
    onClick: () => void
    Icon: any
    hoverClass: string
  }) => (
    <Button className={`h-7 w-7 ${className}`} size="icon" variant="ghost" onClick={onClick}>
      <Icon className={hoverClass} size={16} />
    </Button>
  )
)

const TabList = React.memo(({ tabs }: { tabs: any[] }) => {
  const [, setTabs] = useAtom(tabsAtom)
  const [activeId, setActiveId] = useState<string | null>(null)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5 // Start dragging after moving 5px
      }
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    setActiveId(active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    if (active.id !== over.id) {
      setTabs((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)

        // Create a new array with the moved item
        const newItems = [...items]
        const [movedItem] = newItems.splice(oldIndex, 1)
        newItems.splice(newIndex, 0, movedItem)

        // Return new array while preserving all properties including refs
        return newItems.map((item) => {
          // Find the original item to preserve all its properties
          const originalItem = items.find((oldItem) => oldItem.id === item.id)
          if (!originalItem) return item

          // Keep the exact same object reference if it hasn't moved
          if (
            originalItem.id === item.id &&
            items.indexOf(originalItem) === newItems.indexOf(item)
          ) {
            return originalItem
          }

          // For moved items, preserve all properties but update position
          return {
            ...originalItem,
            ...item
          }
        })
      })
    }
  }

  const handleDragCancel = () => {
    setActiveId(null)
  }

  const pinnedTabs = tabs.filter((tab) => tab.pinned)
  const unpinnedTabs = tabs.filter((tab) => !tab.pinned)
  const activeTab = tabs.find((tab) => tab.id === activeId)

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <SidebarMenu>
        {pinnedTabs.length > 0 && (
          <SortableContext
            items={pinnedTabs.map((tab) => tab.id)}
            strategy={horizontalListSortingStrategy}
          >
            {pinnedTabs.map((item) => (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton asChild>
                  <TabLink tab={item} isDragging={item.id === activeId} />
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
            <Separator />
          </SortableContext>
        )}
        <SortableContext
          items={unpinnedTabs.map((tab) => tab.id)}
          strategy={horizontalListSortingStrategy}
        >
          {unpinnedTabs.map((item) => (
            <SidebarMenuItem key={item.id}>
              <SidebarMenuButton asChild>
                <TabLink tab={item} isDragging={item.id === activeId} />
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SortableContext>
      </SidebarMenu>
      <DragOverlay
        modifiers={[]}
        dropAnimation={{
          duration: 200,
          easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
          sideEffects: defaultDropAnimationSideEffects({
            styles: {
              active: {
                opacity: '0.8'
              }
            }
          })
        }}
      >
        {activeId && activeTab ? <TabLink tab={activeTab} isDragging={true} /> : null}
      </DragOverlay>
    </DndContext>
  )
})

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [tabs, setTabs] = useAtom(tabsAtom)
  const [tabDialogOpen, setTabDialogOpen] = useAtom(isNewTabDialogOpen)
  const createNewTab = useCreateNewTab()
  const [activeTab, setActiveTab] = useAtom(activeTabRefAtom)

  const [homeOpen, setHomeOpen] = useAtom(homeOpenAtom)

  const handleAddTab = useCallback(() => setTabDialogOpen(true), [setTabDialogOpen])

  // handleAction but every time it is called it looks for the tab with the activeTab being true
  const handleAction = useCallback(
    (action: 'reload' | 'goBack' | 'goForward') => {
      console.log('Action', action)
      if (activeTab) {
        if (action === 'reload') activeTab.reload()
        if (action === 'goBack') activeTab.goBack()
        if (action === 'goForward') activeTab.goForward()
      }
    },
    [activeTab]
  )

  const handlerRef = useRef((event: any, data: any) => {
    console.log('reload')
    handleAction('reload')
  })

  useEffect(() => {
    handlerRef.current = (event: any, data: any) => {
      console.log('reload')
      handleAction('reload')
    }
  }, [handleAction])

  useEffect(() => {
    const handler = (event: any, data: any) => handlerRef.current(event, data)
    window.electron.ipcRenderer.on('reload', handler)

    return () => {
      window.electron.ipcRenderer.removeListener('reload', handler)
    }
  }, [])

  return (
    <Sidebar {...props} className="draglayer">
      <div
        className={cn(
          'flex flex-row mt-2.5 justify-evenly nodraglayer',
          // process.platform === 'darwin' && 'ml-16'
          window.isMac && 'ml-16'
        )}
      >
        <AddTabButton onClick={handleAddTab} />
        <SidebarTrigger />
        <ActionButton
          className="group/refresh"
          onClick={() => handleAction('reload')}
          Icon={RefreshCcw}
          hoverClass="group-hover/refresh:rotate-180 ease-in-out transition-transform duration-200"
        />
        <ActionButton
          className="group/goback"
          onClick={() => handleAction('goBack')}
          Icon={ArrowLeft}
          hoverClass="group-hover/goback:translate-x-[-4px] ease-in-out transition-transform duration-200"
        />
        <ActionButton
          className="group/goforward"
          onClick={() => handleAction('goForward')}
          Icon={ArrowRight}
          hoverClass="group-hover/goforward:translate-x-1 ease-in-out transition-transform duration-200"
        />
      </div>
      <div className="nodraglayer">
        <browser-action-list partition="persist:webview" id="actions">
        </browser-action-list>
      </div>
      <SidebarContent className={`draglayer`}>
        <SidebarGroup className="nodraglayer">
          <SidebarGroupContent className="mb-1">
            <SidebarMenuButton
              onClick={() => setHomeOpen(true)}
              isActive={homeOpen}
              tooltip={'Home'}
            >
              <HomeIcon />
              <span>Home</span>
            </SidebarMenuButton>
          </SidebarGroupContent>
          <SidebarGroupContent>
            <TabList tabs={tabs} />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
