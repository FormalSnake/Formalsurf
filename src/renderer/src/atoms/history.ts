import { atom } from 'jotai'

export interface HistoryItem {
  url: string
  title: string
  date: Date
  tabId: string
}

export const historyAtom = atom<HistoryItem[]>([])
