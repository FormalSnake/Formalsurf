import React from "react"
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "../ui/command"
import { atom, useAtom } from "jotai"
import { tabsAtom } from "@renderer/atoms/browser"
import uuid4 from "uuid4"
import { newTab } from "./webview"

export const openAtom = atom(false)

export function CommandMenu() {
  const [open, setOpen] = useAtom(openAtom)
  const [tabs, setTabs] = useAtom(tabsAtom)
  const [input, setInput] = React.useState("")
  const [searchResults, setSearchResults] = React.useState<any[]>([])

  React.useEffect(() => {
    if (input.length === 0) {
      console.log("Input cleared, resetting search results.");
      setSearchResults([]);
      return;
    }

    console.log(`Fetching results for: ${input}`);

    fetch(`https://corsproxy.io/?https://api.project-jam.is-a.dev/api/v0/autosearch/google?q=${encodeURIComponent(input)}&src=google`)
      .then((res) => {
        console.log("API response received", res);
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        console.log("API data:", data);
        if (data && Array.isArray(data.suggestions)) {
          console.log("Setting search results:", data.suggestions);
          setSearchResults(data.suggestions);
        } else {
          console.error("Unexpected API response format:", data);
          setSearchResults([]);
        }
      })
      .catch((error) => {
        console.error("Fetch error:", error);
        setSearchResults([]);
      });

  }, [input]);

  const handleSubmit = (item: string) => {
    const createURL = (query: string) => `https://www.google.com/search?q=${encodeURIComponent(query)}`;

    newTab(createURL(item), item, setTabs)

    setInput("");
    setOpen(false);
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." value={input} onValueChange={setInput} />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        {searchResults.length > 0 && input.length > 0 ? (
          <CommandGroup heading="Suggestions">
            <CommandItem onSelect={() => handleSubmit(input)}>
              {input}
            </CommandItem>
            {searchResults.map((item, index) => (
              <CommandItem key={index} onSelect={() => handleSubmit(item)}>
                {item}
              </CommandItem>
            ))}
          </CommandGroup>
        ) : (
          <CommandEmpty>No results found.</CommandEmpty>
        )}

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

