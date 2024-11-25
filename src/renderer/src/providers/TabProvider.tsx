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
  const [tabs, setTabs] = useAtom(tabsAtom)

  const switchToNextTab = useCallback(() => {
    setTabs((prevTabs) => {
      const currentActiveIndex = prevTabs.findIndex((tab) => tab.isActive)
      if (currentActiveIndex === -1) return prevTabs

      const currentTab = prevTabs[currentActiveIndex]
      const pinnedTabs = prevTabs.filter((tab) => tab.pinned)
      const unpinnedTabs = prevTabs.filter((tab) => !tab.pinned)

      let nextIndex = currentActiveIndex
      if (currentTab.pinned) {
        // If current tab is pinned, find next pinned tab or first unpinned tab
        const currentPinnedIndex = pinnedTabs.findIndex((tab) => tab.id === currentTab.id)
        if (currentPinnedIndex < pinnedTabs.length - 1) {
          // Move to next pinned tab
          nextIndex = prevTabs.findIndex((tab) => tab.id === pinnedTabs[currentPinnedIndex + 1].id)
        } else if (unpinnedTabs.length > 0) {
          // Move to first unpinned tab
          nextIndex = prevTabs.findIndex((tab) => tab.id === unpinnedTabs[0].id)
        }
      } else {
        // If current tab is unpinned, find next unpinned tab or loop to start
        const currentUnpinnedIndex = unpinnedTabs.findIndex((tab) => tab.id === currentTab.id)
        if (currentUnpinnedIndex < unpinnedTabs.length - 1) {
          // Move to next unpinned tab
          nextIndex = prevTabs.findIndex(
            (tab) => tab.id === unpinnedTabs[currentUnpinnedIndex + 1].id
          )
        } else if (pinnedTabs.length > 0) {
          // Move to first pinned tab if there are any
          nextIndex = prevTabs.findIndex((tab) => tab.id === pinnedTabs[0].id)
        } else {
          // No pinned tabs, loop back to first unpinned tab
          nextIndex = prevTabs.findIndex((tab) => tab.id === unpinnedTabs[0].id)
        }
      }

      return prevTabs.map((tab, index) => ({
        ...tab,
        isActive: index === nextIndex
      }))
    })
  }, [])

  const switchToPreviousTab = useCallback(() => {
    setTabs((prevTabs) => {
      const currentActiveIndex = prevTabs.findIndex((tab) => tab.isActive)
      if (currentActiveIndex === -1) return prevTabs

      const currentTab = prevTabs[currentActiveIndex]
      const pinnedTabs = prevTabs.filter((tab) => tab.pinned)
      const unpinnedTabs = prevTabs.filter((tab) => !tab.pinned)

      let previousIndex = currentActiveIndex
      if (currentTab.pinned) {
        // If current tab is pinned, find previous pinned tab or last unpinned tab
        const currentPinnedIndex = pinnedTabs.findIndex((tab) => tab.id === currentTab.id)
        if (currentPinnedIndex > 0) {
          // Move to previous pinned tab
          previousIndex = prevTabs.findIndex(
            (tab) => tab.id === pinnedTabs[currentPinnedIndex - 1].id
          )
        } else if (unpinnedTabs.length > 0) {
          // Move to last unpinned tab
          previousIndex = prevTabs.findIndex(
            (tab) => tab.id === unpinnedTabs[unpinnedTabs.length - 1].id
          )
        }
      } else {
        // If current tab is unpinned, find previous unpinned tab or loop to end
        const currentUnpinnedIndex = unpinnedTabs.findIndex((tab) => tab.id === currentTab.id)
        if (currentUnpinnedIndex > 0) {
          // Move to previous unpinned tab
          previousIndex = prevTabs.findIndex(
            (tab) => tab.id === unpinnedTabs[currentUnpinnedIndex - 1].id
          )
        } else if (pinnedTabs.length > 0) {
          // Move to last pinned tab if there are any
          previousIndex = prevTabs.findIndex(
            (tab) => tab.id === pinnedTabs[pinnedTabs.length - 1].id
          )
        } else {
          // No pinned tabs, loop back to last unpinned tab
          previousIndex = prevTabs.findIndex(
            (tab) => tab.id === unpinnedTabs[unpinnedTabs.length - 1].id
          )
        }
      }

      return prevTabs.map((tab, index) => ({
        ...tab,
        isActive: index === previousIndex
      }))
    })
  }, [])

  useEffect(() => {
    // Listen for tab switching events from the main process
    window.electron.ipcRenderer.on('next-tab', switchToNextTab)
    window.electron.ipcRenderer.on('previous-tab', switchToPreviousTab)

    return () => {
      // Clean up listeners when component unmounts
      window.electron.ipcRenderer.removeAllListeners('next-tab')
      window.electron.ipcRenderer.removeAllListeners('previous-tab')
    }
  }, [switchToNextTab, switchToPreviousTab])

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
              <span className="truncate">{tab.isLoading ? 'Loading...' : tab.title}</span>
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
