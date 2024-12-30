import React from 'react'
import { useAtom } from 'jotai'
import { historyAtom } from '@renderer/atoms/history'
import { ScrollArea } from './ui/scroll-area'
import { Button } from './ui/button'
import { X } from 'lucide-react'

interface HistoryProps {
  webviewRef: React.RefObject<WebviewElement>
}

export const History: React.FC<HistoryProps> = ({ webviewRef }) => {
  const [history, setHistory] = useAtom(historyAtom)

  const handleHistoryClick = (url: string) => {
    if (webviewRef.current) {
      webviewRef.current.loadURL(url)
    }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString()
  }

  return (
    <div className="fixed right-0 top-0 h-full w-80 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50 border-l border-border p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">History</h2>
      </div>
      <ScrollArea className="h-[calc(100vh-2rem)] pr-4">
        <div className="space-y-4">
          {history
            .sort((a, b) => b.date.getTime() - a.date.getTime())
            .map((item, index) => (
              <div
                key={`${item.url}-${index}`}
                className="group flex flex-col space-y-1 border-b border-border/50 pb-2"
              >
                <button
                  onClick={() => handleHistoryClick(item.url)}
                  className="flex items-start justify-between hover:bg-accent p-2 rounded-md transition-colors"
                >
                  <div className="flex flex-col items-start text-left">
                    <span className="font-medium truncate max-w-[250px]">
                      {item.title || new URL(item.url).hostname}
                    </span>
                    <span className="text-xs text-muted-foreground truncate max-w-[250px]">
                      {item.url}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(item.date)}
                    </span>
                  </div>
                </button>
              </div>
            ))}
        </div>
      </ScrollArea>
    </div>
  )
}
