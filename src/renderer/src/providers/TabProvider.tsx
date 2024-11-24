import { Button } from '@/components/ui/button'
import { atom, useAtom } from 'jotai'
import { Globe, X, Pin, PinOff } from 'lucide-react'
import React, { useEffect, useState, useCallback } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { motion, AnimatePresence } from 'framer-motion'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { LoadingSpinner } from '@/components/loading-spinner'

const atomWithLocalStorage = (key: string, initialValue: any) => {
  const getInitialValue = () => {
    const item = localStorage.getItem(key)
    if (item !== null) {
      return JSON.parse(item)
    }
    return initialValue
  }

  const baseAtom = atom(getInitialValue())

  const derivedAtom = atom(
    (get) => get(baseAtom),
    (get, set, update) => {
      const nextValue = typeof update === 'function' ? update(get(baseAtom)) : update

      // Remove `webviewRef` from each tab before saving
      const sanitizedValue = Array.isArray(nextValue)
        ? nextValue.map((tab) => ({ ...tab, webviewRef: undefined }))
        : nextValue

      // Update both atom and localStorage with the same sanitized value
      set(baseAtom, sanitizedValue)
      localStorage.setItem(key, JSON.stringify(sanitizedValue))
    }
  )

  return derivedAtom
}

// Define the tabsAtom with webviewRefs
export const tabsAtom = atomWithLocalStorage('FormalTabs', [
  {
    id: uuidv4(),
    url: 'https://www.google.com',
    title: 'Google',
    webviewRef: null,
    isActive: true,
    favicon: '',
    pinned: false,
    isLoading: false
  }
])

export const activeTabRefAtom = atom<any>(null)

export const TabProvider = ({ children }: { children: any }) => {
  return <>{children}</>
}

export function useCreateNewTab() {
  const [tabs, setTabs] = useAtom(tabsAtom)

  function createNewTab({ url = 'https://www.google.com' }: { url?: string }) {
    const newTab = {
      id: uuidv4(),
      url,
      title: 'New tab',
      webviewRef: React.createRef(),
      isActive: true,
      isLoading: false
    }

    setTabs([
      // @ts-ignore
      ...tabs.map((tab) => ({ ...tab, isActive: false })), // Deactivate current tabs
      // @ts-ignore
      newTab // Add new active tab
    ])
  }

  return createNewTab
}

export function useCloseTab() {
  const [tabs, setTabs] = useAtom(tabsAtom)

  function closeTab(tabToClose: any = null) {
    setTabs((prevTabs) => {
      let activeIndex

      if (tabToClose) {
        // Find the index of the specified tab
        activeIndex = prevTabs.findIndex((tab) => tab === tabToClose)
      } else {
        // Find the index of the active tab
        activeIndex = prevTabs.findIndex((tab) => tab.isActive)
      }

      if (activeIndex === -1 || prevTabs[activeIndex].pinned) {
        // If no tab is found or the tab is pinned, return the current tabs
        return prevTabs
      }

      // Remove the specified tab from the array
      const updatedTabs = prevTabs.filter((_, index) => index !== activeIndex)

      // If there are still tabs left, set the next closest one to active
      if (updatedTabs.length > 0) {
        const newActiveIndex =
          activeIndex >= updatedTabs.length ? updatedTabs.length - 1 : activeIndex
        updatedTabs[newActiveIndex].isActive = true
      }

      return updatedTabs
    })
  }

  return closeTab
}

export function useTogglePinTab() {
  const [tabs, setTabs] = useAtom(tabsAtom)

  function togglePinTab(tabToToggle: any) {
    setTabs((prevTabs) =>
      prevTabs.map((tab) => (tab.id === tabToToggle.id ? { ...tab, pinned: !tab.pinned } : tab))
    )
  }

  return togglePinTab
}

// Define the getFavicon function
function getFavicon(tab: any): string {
  // Assuming the favicon URL is stored in the tab object
  return tab.favicon || 'default-favicon-url' // Replace 'default-favicon-url' with a fallback URL if needed
}

export const TabLink = React.memo(
  ({ tab, isDragging: isParentDragging }: { tab: any; isDragging?: boolean }) => {
    const [tabs, setTabs] = useAtom(tabsAtom)
    const closeTab = useCloseTab()
    const togglePinTab = useTogglePinTab()
    const [isHovered, setIsHovered] = useState(false)
    const [isHoveringButtons, setIsHoveringButtons] = useState(false)

    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
      id: tab.id,
      disabled: isHoveringButtons
    })

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      position: 'relative' as const,
      width: '100%',
      ...(isDragging ? { opacity: 0.4 } : {})
    }

    const setActiveTab = useCallback(
      (e: React.MouseEvent) => {
        if (!isDragging && !isHoveringButtons) {
          setTabs((prevTabs) => {
            const activeTabExists = prevTabs.some((t) => t.isActive && t.id === tab.id)
            if (activeTabExists) return prevTabs

            return prevTabs.map((item) => ({
              ...item,
              isActive: item.id === tab.id
            }))
          })
        }
      },
      [isDragging, isHoveringButtons, tab.id]
    )

    const closeTabEvent = useCallback(
      (event: React.MouseEvent) => {
        event.stopPropagation()
        closeTab(tab)
      },
      [tab]
    )

    const pinTabEvent = useCallback(
      (event: React.MouseEvent) => {
        event.stopPropagation()
        togglePinTab(tab)
      },
      [tab]
    )

    const textMargin = () => {
      if (isHovered) {
        if (tab.pinned) {
          return '20px'
        }
        return '45px'
      }
      return '0px'
    }

    return (
      <AnimatePresence>
        <motion.div
          ref={setNodeRef}
          style={style}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{
            scale: 1,
            opacity: 1,
            boxShadow: isDragging ? '0 5px 15px rgba(0,0,0,0.3)' : 'none'
          }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className={`w-full relative ${isDragging ? 'opacity-40' : ''}`}
        >
          <Button
            onClick={setActiveTab}
            className={`flex items-center text-left w-full relative group ${isDragging ? 'pointer-events-none' : ''}`}
            variant={tab.isActive ? 'secondary' : 'ghost'}
          >
            <div
              {...attributes}
              {...listeners}
              className={`absolute left-0 top-0 bottom-0 w-8 
              before:absolute before:inset-y-2 before:left-2 before:w-[2px] before:rounded-full
              before:bg-foreground/20 before:transition-colors
              hover:before:bg-foreground/40 active:before:bg-foreground/60 transition-colors duration-200 ease-in-out
              ${isDragging ? 'before:bg-foreground/60' : ''}
              cursor-grab active:cursor-grabbing`}
            />
            <div className="flex items-center relative pl-2">
              {tab.favicon ? (
                <img src={getFavicon(tab)} className="h-4 w-4 mr-2" />
              ) : (
                <Globe className="h-4 w-4 mr-2" />
              )}
            </div>
            <motion.span
              animate={{ marginRight: textMargin() }}
              transition={{ duration: 0.2 }}
              className="truncate relative flex-1 flex items-center gap-2"
            >
              {tab.isLoading && <LoadingSpinner />}
              {tab.isLoading ? 'Loading...' : tab.title}
            </motion.span>
            <AnimatePresence>
              {isHovered && !isDragging && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.1 }}
                  className="absolute right-2 flex gap-1 z-10"
                  onMouseEnter={() => setIsHoveringButtons(true)}
                  onMouseLeave={() => setIsHoveringButtons(false)}
                >
                  <Button
                    onClick={pinTabEvent}
                    className="h-5 w-5 hover:bg-accent"
                    size="icon"
                    variant="ghost"
                  >
                    {tab.pinned ? <PinOff className="h-3 w-3" /> : <Pin className="h-3 w-3" />}
                  </Button>
                  {!tab.pinned && (
                    <Button
                      onClick={closeTabEvent}
                      className="h-5 w-5 hover:bg-accent"
                      size="icon"
                      variant="ghost"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </Button>
        </motion.div>
      </AnimatePresence>
    )
  }
)
