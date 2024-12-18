import React, { useEffect, useRef, useState } from 'react'
import { atom, useAtom } from 'jotai'
import { extractReadableContent } from '../lib/readability-utils'
import { AnimatePresence, motion } from 'framer-motion'
import { Search, ArrowUp, ArrowDown, Bot } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import ReactMarkdown from 'react-markdown'

export const findInPageVisibleAtom = atom(false)

interface FindInPageProps {
  webviewRef: React.RefObject<WebviewElement>
}

export const FindInPage: React.FC<FindInPageProps> = ({ webviewRef }) => {
  const [isVisible, setIsVisible] = useAtom(findInPageVisibleAtom)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [aiResponse, setAIResponse] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleAskAI = async (question: string) => {
    if (!webviewRef.current || !question.trim()) return
    setIsLoading(true)
    try {
      // @ts-ignore
      const apiKey = await window.api.getSettings('openAIKey')
      if (!apiKey) {
        setAIResponse("Please set your OpenAI API key in settings first")
        return
      }

      // Get readable content
      const readableContent = await extractReadableContent(webviewRef.current)
      const title = await webviewRef.current.getTitle()

      // Strip HTML tags and truncate if needed
      const strippedContent = readableContent.replace(/<[^>]*>/g, ' ')
      const truncatedContent = strippedContent.substring(0, 3000) +
        (strippedContent.length > 3000 ? '...' : '')

      setAIResponse('')
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4o",
          stream: true,
          messages: [
            {
              role: "system",
              content: `You are a helpful AI assistant. Provide brief, clear responses. Use bullet points only when listing multiple items or steps. The user is browsing a page titled "${title}". Here is the page content: ${truncatedContent}`
            },
            {
              role: "user",
              content: question
            }
          ]
        })
      })

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) throw new Error('No reader available')

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ') && line !== 'data: [DONE]') {
            try {
              const json = JSON.parse(line.slice(6))
              const content = json.choices[0]?.delta?.content
              if (content) {
                setAIResponse(prev => prev + content)
              }
            } catch (e) {
              console.error('Error parsing JSON:', e)
            }
          }
        }
      }
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
            className="w-44 ring-0 outline-none border-none focus-visible:ring-offset-0 focus-visible:ring-0"
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Find in page..."
          />
          <Button size="icon" variant={'ghost'} onClick={handleSearch} className="min-w-10">
            <Search />
          </Button>
          <Button
            size="icon"
            variant={'ghost'}
            onClick={() => handleAskAI(searchTerm)}
            disabled={isLoading}
            className="min-w-10"
          >
            <Bot />
          </Button>
          <Button size="icon" variant={'ghost'} onClick={handlePrevious} className="min-w-10">
            <ArrowUp />
          </Button>
          <Button size="icon" variant={'ghost'} onClick={handleNext} className="min-w-10">
            <ArrowDown />
          </Button>
        </motion.div>
      )}

      {isVisible && aiResponse && (
        <motion.div
          className="find-in-page-response bg-popover border-border border fixed top-20 right-4 p-4 rounded-lg max-w-[400px]"
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -10, opacity: 0 }}
        >
          <ReactMarkdown className="prose prose-sm dark:prose-invert max-w-none">
            {aiResponse}
          </ReactMarkdown>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
