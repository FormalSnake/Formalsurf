import React, { useEffect, useRef, useState } from 'react'
import { atom, useAtom } from 'jotai'
import { AnimatePresence, motion } from 'framer-motion'
import { Search, ArrowUp, ArrowDown, Bot } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from './ui/dialog'
import { Textarea } from './ui/textarea'

export const findInPageVisibleAtom = atom(false)

interface FindInPageProps {
  webviewRef: React.RefObject<WebviewElement>
}

export const FindInPage: React.FC<FindInPageProps> = ({ webviewRef }) => {
  const [isVisible, setIsVisible] = useAtom(findInPageVisibleAtom)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAIDialogOpen, setIsAIDialogOpen] = useState(false)
  const [aiResponse, setAIResponse] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [question, setQuestion] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleAskAI = async () => {
    if (!webviewRef.current) return
    
    setIsLoading(true)
    try {
      // @ts-ignore
      const apiKey = await window.api.getSettings('openAIKey')
      if (!apiKey) {
        setAIResponse("Please set your OpenAI API key in settings first")
        return
      }

      const url = await webviewRef.current.getURL()
      const title = await webviewRef.current.getTitle()

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: `You are a helpful AI assistant. The user is browsing: ${url} (${title})`
            },
            {
              role: "user",
              content: question
            }
          ]
        })
      })

      const data = await response.json()
      setAIResponse(data.choices[0].message.content)
    } catch (error) {
      setAIResponse("Sorry, there was an error processing your request.")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = () => {
    if (webviewRef.current) {
      webviewRef.current.findInPage(searchTerm)
    }
  }

  const handleNext = () => {
    if (webviewRef.current) {
      webviewRef.current.findInPage(searchTerm, { forward: true })
      setCurrentIndex((prev) => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (webviewRef.current) {
      webviewRef.current.findInPage(searchTerm, { forward: false })
      setCurrentIndex((prev) => Math.max(prev - 1, 0))
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSearch()
    } else if (event.key === 'Escape') {
      if (webviewRef.current) {
        webviewRef.current.stopFindInPage('clearSelection')
      }
      setIsVisible(false)
    }
  }

  useEffect(() => {
    if (isVisible && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isVisible])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="find-in-page-bar bg-popover border-border border fixed top-4 right-4  rounded-lg flex flex-row space-x-2"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          <Input
            ref={inputRef}
            value={searchTerm}
            className=" ring-0 outline-none border-none focus-visible:ring-offset-0 focus-visible:ring-0"
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Find in page..."
          />
          <Button size="icon" variant={'ghost'} onClick={handleSearch} className="min-w-10">
            <Search />
          </Button>
          <Button size="icon" variant={'ghost'} onClick={handlePrevious} className="min-w-10">
            <ArrowUp />
          </Button>
          <Button size="icon" variant={'ghost'} onClick={handleNext} className="min-w-10">
            <ArrowDown />
          </Button>
          <Button size="icon" variant={'ghost'} onClick={() => setIsAIDialogOpen(true)} className="min-w-10">
            <Bot />
          </Button>
        </motion.div>
      )}

      <Dialog open={isAIDialogOpen} onOpenChange={setIsAIDialogOpen}>
        <DialogContent>
          <DialogTitle>Ask AI about this page</DialogTitle>
          <DialogDescription>
            Ask a question about the current webpage
          </DialogDescription>
          <div className="space-y-4">
            <Textarea 
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="What would you like to know?"
              className="min-h-[100px]"
            />
            <Button 
              onClick={handleAskAI}
              disabled={isLoading || !question.trim()}
              className="w-full"
            >
              {isLoading ? "Thinking..." : "Ask AI"}
            </Button>
            {aiResponse && (
              <div className="mt-4 p-4 rounded-lg bg-muted">
                <p className="whitespace-pre-wrap">{aiResponse}</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </AnimatePresence>
  )
}
