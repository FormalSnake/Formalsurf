import { atom } from 'jotai'

interface HistoryItem {
  url: string
  title: string
  date: Date
}

export const historyAtom = atom<HistoryItem[]>([])
