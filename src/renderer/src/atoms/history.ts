import { atom } from 'jotai'

interface HistoryItem {
  url: string
  title: string
  date: Date
  tabId: string
}

export const historyAtom = atom<HistoryItem[]>([])
