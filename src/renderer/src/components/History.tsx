import React from 'react'
import { useAtom } from 'jotai'
import { historyAtom } from '@renderer/atoms/history'
import { ScrollArea } from './ui/scroll-area'
import { Button } from './ui/button'
import { X } from 'lucide-react'
import * as motion from "motion/react-client"
import { AnimatePresence } from "motion/react"

interface HistoryProps {
  webviewRef: React.RefObject<WebviewElement>
  isHistoryOpen: boolean
  setIsHistoryOpen: React.Dispatch<React.SetStateAction<boolean>>
}

export const History: React.FC<HistoryProps> = ({ webviewRef, isHistoryOpen, setIsHistoryOpen }) => {
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
    <AnimatePresence>
      {isHistoryOpen && (
        <motion.div
          className="fixed right-0 top-0 h-full w-80 bg-sidebar/85 backdrop-blur  z-50 border-l border-border p-4"
          initial={{ translateX: 999 }}
          animate={{ translateX: 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          exit={{ translateX: 999 }}
        >
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
        </motion.div>
      )}
    </AnimatePresence>
  )
}
