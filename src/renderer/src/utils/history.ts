import { SetStateAction } from 'jotai'
import { HistoryItem } from '@renderer/atoms/history'

export const addHistoryEntry = (
  setHistory: (update: SetStateAction<HistoryItem[]>) => void,
  entry: Omit<HistoryItem, 'date'>
) => {
  const historyEntry = {
    ...entry,
    date: new Date()
  }

  setHistory(prev => {
    // Avoid duplicate entries within 1 second
    const isDuplicate = prev.some(item => 
      item.url === historyEntry.url && 
      Date.now() - item.date.getTime() < 1000
    )
    if (!isDuplicate) {
      return [...prev, historyEntry]
    }
    return prev
  })
}
