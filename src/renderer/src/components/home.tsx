import { tabsAtom } from '@renderer/providers/TabProvider'
import { atom, useAtom } from 'jotai'
import { useEffect, useRef, useState } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects
} from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { useSortable } from '@dnd-kit/sortable'
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable'
import { widgetRegistry, getWidgetComponent } from './widgets/registry'
import { WidgetInstance, WidgetSize } from './widgets/types'
import { Plus, X, Maximize2, Menu, ImageIcon } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Button } from './ui/button'
import { cn } from '@/lib/utils'

const homeOpenDefault = atom(false)

// homeOpen, setHomeOpen atoms
export const homeOpenAtom = atom(
  (get) => get(homeOpenDefault),
  (get, set, update: boolean) => {
    const tabs = get(tabsAtom)
    set(
      tabsAtom,
      tabs.map((tab) => ({ ...tab, isActive: false }))
    )
    set(homeOpenDefault, update)
  }
)

interface Widget {
  id: string
  title: string
  content: string
}

interface GridPosition {
  x: number
  y: number
}

function findAvailablePosition(
  widgets: WidgetInstance[],
  newSize: { w: number; h: number }
): GridPosition {
  const grid: boolean[][] = []
  const gridSize = { cols: 12, rows: 12 } // 12-column grid with 12 rows

  // Initialize grid
  for (let y = 0; y < gridSize.rows; y++) {
    grid[y] = []
    for (let x = 0; x < gridSize.cols; x++) {
      grid[y][x] = false
    }
  }

  // Mark occupied cells
  widgets.forEach((widget) => {
    for (let y = widget.y; y < widget.y + widget.h; y++) {
      for (let x = widget.x; x < widget.x + widget.w; x++) {
        if (y < gridSize.rows && x < gridSize.cols) {
          grid[y][x] = true
        }
      }
    }
  })

  // Find first available position that fits the widget
  for (let y = 0; y < gridSize.rows; y++) {
    for (let x = 0; x < gridSize.cols; x++) {
      let fits = true
      for (let dy = 0; dy < newSize.h && fits; dy++) {
        for (let dx = 0; dx < newSize.w && fits; dx++) {
          if (y + dy >= gridSize.rows || x + dx >= gridSize.cols || grid[y + dy][x + dx]) {
            fits = false
          }
        }
      }
      if (fits) {
        return { x, y }
      }
    }
  }
  return { x: 0, y: 0 } // Fallback position
}

const WIDGET_SIZES: Record<WidgetSize, { w: number; h: number }> = {
  small: { w: 3, h: 3 },
  medium: { w: 4, h: 4 },
  large: { w: 6, h: 6 }
}

function getNextSize(currentSize: WidgetSize): WidgetSize {
  const sizes: WidgetSize[] = ['small', 'medium', 'large']
  const currentIndex = sizes.indexOf(currentSize)
  return sizes[(currentIndex + 1) % sizes.length]
}

function DraggableWidget({
  widget,
  onRemove,
  onResize
}: {
  widget: WidgetInstance
  onRemove: () => void
  onResize: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: widget.id,
    transition: {
      duration: 150,
      easing: 'cubic-bezier(0.25, 1, 0.5, 1)'
    }
  })

  const style = {
    position: 'absolute',
    left: `${widget.x}px`,
    top: `${widget.y}px`,
    transform: transform ? CSS.Transform.toString(transform) : undefined,
    transition: transition || undefined,
    zIndex: isDragging ? 1000 : 1,
    touchAction: 'none',
    cursor: 'move',
    userSelect: 'none'
  }

  const Component = getWidgetComponent(widget.type)
  if (!Component) return null

  const widgetSize = WIDGET_SIZES[widget.size]
  const width = widgetSize.w * 100 // Each grid unit is 100px
  const height = widgetSize.h * 80 // Each grid unit is 80px

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={cn(
        'rounded-lg overflow-hidden border bg-background/80 backdrop-blur-lg text-card-foreground shadow-sm',
        isDragging && 'opacity-50'
      )}
      style={{
        ...style,
        width: `${width}px`,
        height: `${height}px`
      }}
    >
      <div className="flex justify-between items-center p-2 border-b bg-background/50">
        <h3 className="text-sm font-medium truncate">{widget.title}</h3>
        <div className="flex gap-1 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0"
            onClick={(e) => {
              e.stopPropagation()
              onResize()
            }}
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0"
            onClick={(e) => {
              e.stopPropagation()
              onRemove()
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="p-4 h-[calc(100%-44px)] overflow-auto">
        <Component widget={widget} />
      </div>
    </div>
  )
}

export function Home() {
  const [widgets, setWidgets] = useState<WidgetInstance[]>(() => {
    const savedWidgets = localStorage.getItem('dashboard_widgets')
    return savedWidgets
      ? JSON.parse(savedWidgets)
      : [
          { id: 'widget-1', type: 'statistics', title: 'Statistics', x: 0, y: 0, size: 'medium' },
          { id: 'widget-2', type: 'clock', title: 'Clock', x: 4, y: 0, size: 'small' },
          { id: 'widget-3', type: 'weather', title: 'Weather', x: 7, y: 0, size: 'medium' },
          { id: 'widget-4', type: 'notes', title: 'Quick Notes', x: 0, y: 4, size: 'large' }
        ]
  })

  const [wallpaper, setWallpaper] = useState<string | null>(() => {
    return localStorage.getItem('dashboard_wallpaper')
  })

  // Save widgets to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('dashboard_widgets', JSON.stringify(widgets))
  }, [widgets])

  // Save wallpaper to localStorage whenever it changes
  useEffect(() => {
    if (wallpaper) {
      localStorage.setItem('dashboard_wallpaper', wallpaper)
    } else {
      localStorage.removeItem('dashboard_wallpaper')
    }
  }, [wallpaper])

  const [activeId, setActiveId] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
        tolerance: 1000 // Increase tolerance for movement
      }
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 100,
        tolerance: 1000 // Increase tolerance for movement
      }
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null)
    const { active, over } = event

    if (!over) return

    // Get the delta change from the event
    const delta = {
      x: event.delta.x,
      y: event.delta.y
    }

    // Update widget position based on the delta movement
    setWidgets((widgets) =>
      widgets.map((widget) => {
        if (widget.id === active.id) {
          // Calculate new position based on current position plus delta
          const newX = widget.x + delta.x
          const newY = widget.y + delta.y

          // Get container bounds
          const container = document.querySelector('.widget-container')
          if (!container) return widget

          const containerRect = container.getBoundingClientRect()
          const widgetSize = WIDGET_SIZES[widget.size]
          const widgetWidth = widgetSize.w * 100
          const widgetHeight = widgetSize.h * 80

          // Ensure widget stays within container bounds
          const maxX = containerRect.width - widgetWidth
          const maxY = containerRect.height - widgetHeight

          const boundedX = Math.max(0, Math.min(newX, maxX))
          const boundedY = Math.max(0, Math.min(newY, maxY))

          // Snap to grid
          const GRID_SIZE = 20
          const snappedX = Math.round(boundedX / GRID_SIZE) * GRID_SIZE
          const snappedY = Math.round(boundedY / GRID_SIZE) * GRID_SIZE

          return {
            ...widget,
            x: snappedX,
            y: snappedY
          }
        }
        return widget
      })
    )
  }

  const handleWallpaperUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setWallpaper(result)
      }
      reader.readAsDataURL(file)
    }
  }

  const openWallpaperPicker = () => {
    fileInputRef.current?.click()
  }

  const removeWallpaper = () => {
    setWallpaper(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removeWidget = (id: string) => {
    setWidgets((widgets) => widgets.filter((w) => w.id !== id))
  }

  const addWidget = (type: string) => {
    const widgetDef = widgetRegistry[type]
    if (widgetDef) {
      const defaultSize = widgetDef.defaultSize || { w: 1, h: 1 }
      const position = findAvailablePosition(widgets, defaultSize)

      setWidgets((widgets) => [
        ...widgets,
        {
          id: `widget-${Date.now()}`,
          type,
          title: widgetDef.title,
          x: position.x,
          y: position.y,
          w: defaultSize.w,
          h: defaultSize.h,
          size: 'medium'
        }
      ])
    }
  }

  const handleResize = (id: string) => {
    setWidgets((widgets) =>
      widgets.map((widget) => {
        if (widget.id === id) {
          const newSize = getNextSize(widget.size)
          return { ...widget, size: newSize }
        }
        return widget
      })
    )
  }

  return (
    <div className="h-screen bg-background">
      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div
          className="widget-container relative overflow-hidden h-screen"
          style={{
            width: '100%',
            position: 'relative',
            backgroundImage: wallpaper ? `url(${wallpaper})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="absolute top-4 right-4 z-50 flex gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleWallpaperUpload}
              accept="image/*"
              className="hidden"
            />
            <Button
              size="icon"
              variant="outline"
              onClick={openWallpaperPicker}
              title="Change wallpaper"
              className="bg-background/50 backdrop-blur-lg hover:bg-background/70"
            >
              <ImageIcon className="h-4 w-4" />
            </Button>
            {wallpaper && (
              <Button
                size="icon"
                variant="outline"
                onClick={removeWallpaper}
                title="Remove wallpaper"
                className="bg-background/50 backdrop-blur-lg hover:bg-background/70"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="icon"
                  variant="outline"
                  className="bg-background/50 backdrop-blur-lg hover:bg-background/70"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {Object.entries(widgetRegistry).map(([type, widget]) => (
                  <DropdownMenuItem key={type} onClick={() => addWidget(type)}>
                    {widget.title}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <SortableContext items={widgets.map((w) => w.id)} strategy={rectSortingStrategy}>
            {widgets.map((widget) => (
              <DraggableWidget
                key={widget.id}
                widget={widget}
                onRemove={() => removeWidget(widget.id)}
                onResize={() => handleResize(widget.id)}
              />
            ))}
          </SortableContext>
        </div>
      </DndContext>
    </div>
  )
}
