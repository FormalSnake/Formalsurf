import React, { useState, useEffect, useCallback } from 'react'
import { Dialog, DialogContent, DialogOverlay } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { atom, useAtom } from 'jotai'
import { tabsAtom, useCreateNewTab } from '@/providers/TabProvider'
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandSeparator,
  CommandList
} from './ui/command'

export const isNewTabDialogOpen = atom(false)
export const tabBarUrl = atom('')
export const isUpdateAtom = atom(false)

export function NewTabDialog() {
  const [open, setOpen] = useAtom(isNewTabDialogOpen)
  const [value, setValue] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const createNewTab = useCreateNewTab()
  const [tabs, setTabs] = useAtom(tabsAtom)
  const [isUpdate, setIsUpdate] = useAtom(isUpdateAtom)

  const fetchSuggestions = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        setSuggestions(tabs.map((tab) => tab.title)) // Reset to tab titles if query is empty
        return
      }
      const endpoint = `https://corsproxy.io/?https://google.com/complete/search?q=${encodeURIComponent(query)}&output=toolbar`
      try {
        const response = await fetch(endpoint)
        const text = await response.text()
        // Parse the XML response
        const parser = new DOMParser()
        const xml = parser.parseFromString(text, 'application/xml')
        const suggestionNodes = xml.querySelectorAll('CompleteSuggestion > suggestion')
        // Extract data attributes into a list of suggestions
        const newSuggestions = Array.from(suggestionNodes).map(
          (node) => node.getAttribute('data') || ''
        )
        // Merge new suggestions with tab titles
        const tabTitles = tabs.map((tab) => tab.title)
        setSuggestions([...new Set([...newSuggestions, ...tabTitles])])
      } catch (error) {
        console.error('Failed to fetch autocomplete suggestions:', error)
        setSuggestions(tabs.map((tab) => tab.title)) // Reset to tab titles on error
      }
    },
    [tabs]
  )

  useEffect(() => {
    if (isUpdate && open) {
      const activeTab = tabs.find((tab) => tab.isActive)
      if (activeTab) {
        setValue(activeTab.url)
      }
    }
  }, [isUpdate, open, tabs])

  const handleEnterPress = useCallback(
    (value: string) => {
      if (value.trim()) {
        const validIP4Regex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/i
        const unicodeRegex = /[^\u0000-\u00ff]/
        const isURLRegex = /^(https?|file):\/\/[^ "]+$/i
        const localhostRegex = /^localhost(:\d+)?$/i
        const matchingTab = tabs.find((tab) => tab.title === value)
        if (matchingTab) {
          // Switch to the matching tab
          setTabs(tabs.map((tab) => ({ ...tab, isActive: tab.id === matchingTab.id })))
          setOpen(false)
          setValue('')
          setSuggestions([])
          return
        }

        let url: string

        if (isURLRegex.test(value)) {
          url = value
        } else if (validIP4Regex.test(value)) {
          url = `https://${value}`
        } else if (localhostRegex.test(value)) {
          url = `http://${value}`
        } else if (/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)) {
          url = `https://${value}`
        } else if (unicodeRegex.test(value)) {
          url = `https://www.google.com/search?q=${encodeURIComponent(value)}`
        } else {
          url = `https://www.google.com/search?q=${encodeURIComponent(value)}`
        }

        if (isUpdate) {
          const activeTab = tabs.find((tab) => tab.isActive)
          if (activeTab) {
            setTabs(tabs.map((tab) => (tab.id === activeTab.id ? { ...tab, url } : tab)))
          }
        } else {
          createNewTab({ url })
        }

        setOpen(false)
        setValue('')
        setSuggestions([])
      }
    },
    [createNewTab, setOpen, setValue, setSuggestions, tabs, setTabs, isUpdate]
  )

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchSuggestions(value)
    }, 300) // Debounce API requests

    // Add open tab titles to suggestions
    const tabTitles = tabs.map((tab) => tab.title)
    setSuggestions((prevSuggestions) => [...new Set([...prevSuggestions, ...tabTitles])])

    return () => clearTimeout(timeoutId)
  }, [value, fetchSuggestions, tabs])

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search or type a url..." value={value} onValueChange={setValue} />
      <CommandList>
        {value !== '' && (
          <CommandGroup heading="Search">
            <CommandItem
              onSelect={(value) => {
                setValue(value)
                handleEnterPress(value)
              }}
              key="search"
              className=""
            >
              {value}
            </CommandItem>
          </CommandGroup>
        )}
        {tabs.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Open Tabs">
              {tabs.map((tab, index) => (
                <CommandItem
                  onSelect={(value) => {
                    setValue(value)
                    handleEnterPress(value)
                  }}
                  key={`tab-${index}`}
                  className=""
                >
                  {tab.title}
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
        {suggestions.filter(
          (suggestion) => suggestion !== value && !tabs.some((tab) => tab.title === suggestion)
        ).length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Suggestions">
              {suggestions
                .filter(
                  (suggestion) =>
                    suggestion !== value && !tabs.some((tab) => tab.title === suggestion)
                )
                .map((suggestion, index) => (
                  <CommandItem
                    onSelect={(value) => {
                      setValue(value)
                      handleEnterPress(value)
                    }}
                    key={`suggestion-${index}`}
                    className=""
                  >
                    {suggestion}
                  </CommandItem>
                ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  )
}
