import { SetStateAction } from 'jotai'
import { HistoryItem } from '@renderer/atoms/history'

export const addHistoryEntry = (
  setHistory: (update: SetStateAction<HistoryItem[]>) => void,
  entry: Omit<HistoryItem, 'date'>
) => {
  const historyEntry = {
    ...entry,
    date: new Date(),
    title: entry.title || new URL(entry.url).hostname
  }

  setHistory(prev => {
    // Remove any entries with the same URL from the last 30 seconds
    const recentEntries = prev.filter(item => 
      !(item.url === historyEntry.url && 
        Date.now() - item.date.getTime() < 30000)
    )

    // Add the new entry
    return [...recentEntries, historyEntry]
  })
}
