import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { atomFamily } from 'jotai/utils'
import { v4 as uuidv4 } from 'uuid'

export interface Tab {
  id: string
  url: string
  title: string
  isActive: boolean
  isPinned?: boolean
  favicon?: string
  webviewRef?: any
}

// Main tabs storage
export const tabsAtom = atomWithStorage<Tab[]>('FormalTabs', [
  {
    id: uuidv4(),
    url: 'https://www.formalsnake.dev',
    title: '',
    isActive: true,
    favicon: ''
  }
])

// Active tab reference
export const activeTabRefAtom = atom<any>(null)

// Tab family for individual tab operations
export const tabFamily = atomFamily((id: string) => {
  const baseAtom = atom(
    (get) => get(tabsAtom).find((tab) => tab.id === id),
    (get, set, update: Partial<Tab>) => {
      const tabs = get(tabsAtom)
      const index = tabs.findIndex((tab) => tab.id === id)
      if (index !== -1) {
        const newTabs = [...tabs]
        newTabs[index] = { ...newTabs[index], ...update }
        set(tabsAtom, newTabs)
      }
    }
  )
  return baseAtom
})

// Derived atoms for computed states
export const activeTabAtom = atom((get) => get(tabsAtom).find((tab) => tab.isActive))
export const pinnedTabsAtom = atom((get) => get(tabsAtom).filter((tab) => tab.isPinned))
export const unpinnedTabsAtom = atom((get) => get(tabsAtom).filter((tab) => !tab.isPinned))
export const tabCountAtom = atom((get) => get(tabsAtom).length)
