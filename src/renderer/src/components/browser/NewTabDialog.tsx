import React from "react"
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "../ui/command"
import { atom, useAtom } from "jotai"
import { tabsAtom } from "@renderer/atoms/browser"
import uuid4 from "uuid4"

export const openAtom = atom(false)

export function CommandMenu() {
  const [open, setOpen] = useAtom(openAtom)
  const [tabs, setTabs] = useAtom(tabsAtom)
  const [input, setInput] = React.useState("")

  // React.useEffect(() => {
  //   const down = (e: KeyboardEvent) => {
  //     if (e.key === "t" && (e.metaKey || e.ctrlKey)) {
  //       e.preventDefault()
  //       setOpen((open) => !open)
  //     }
  //   }
  //   document.addEventListener("keydown", down)
  //   return () => document.removeEventListener("keydown", down)
  // }, [])

  // query the google search api
  const [searchResults, setSearchResults] = React.useState<any[]>([])
  React.useEffect(() => {
    if (input.length > 0) {
      fetch(`https://corsproxy.io/?https://api.project-jam.is-a.dev/api/v0/autosearch/google?q=${encodeURIComponent(input)}&src=google`)
        .then((res) => {
          if (!res.ok) {
            throw new Error(`HTTP error! Status: ${res.status}`);
          }
          return res.json();
        })
        .then((data) => {
          if (data && data.suggestions) {
            setSearchResults(data.suggestions);
            console.log(data.suggestions)
          } else {
            console.error("Unexpected API response:", data);
          }
        })
        .catch((error) => console.error("Fetch error:", error));
    }
  }, [input]);

  const handleSubmit = (item: string) => {
    const createURL = (url: string) => {
      // create google search url from the input
      const urlObject = "https://www.google.com/search?q=";
      const encodedURL = encodeURIComponent(url);
      return urlObject + encodedURL;
    }

    tabs.push({
      id: uuid4(),
      title: item,
      url: createURL(item),
      favicon: "",
      isActive: true,
    })
    setTabs(tabs)
    setInput("")
    setOpen(false)
  }

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." value={input} onValueChange={setInput} />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Suggestions">
          {searchResults.map((item) => (
            <CommandItem key={item} onSelect={() => {
              setInput(item)
              handleSubmit(item)
            }
            }>
              <a href={item.link} target="_blank" rel="noreferrer">
                {item}
              </a>
            </CommandItem>
          ))}
        </CommandGroup>
        {tabs.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Tabs">
              {tabs.map((tab) => (
                <CommandItem key={tab.id}>
                  <a href={tab.url} target="_blank" rel="noreferrer">
                    {tab.title}
                  </a>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  )
}

