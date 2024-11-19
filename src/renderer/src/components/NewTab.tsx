import React, { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogOverlay } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { atom, useAtom } from "jotai";
import { useCreateNewTab } from "@/providers/TabProvider";
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "./ui/command";

export const isNewTabDialogOpen = atom(false);

export function NewTabDialog() {
  const [open, setOpen] = useAtom(isNewTabDialogOpen);
  const [value, setValue] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const createNewTab = useCreateNewTab();

  // Keyboard shortcut for toggling the dialog
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "t" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [setOpen]);

  // Fetch autocomplete suggestions from DuckDuckGo API
  const fetchSuggestions = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    const endpoint = `https://corsproxy.io/?https://google.com/complete/search?q=${encodeURIComponent(query)}&output=toolbar`;

    try {
      const response = await fetch(endpoint);
      const text = await response.text();

      // Parse the XML response
      const parser = new DOMParser();
      const xml = parser.parseFromString(text, "application/xml");
      const suggestionNodes = xml.querySelectorAll("CompleteSuggestion > suggestion");

      // Extract data attributes into a list of suggestions
      const newSuggestions = Array.from(suggestionNodes).map((node) => node.getAttribute("data") || "");
      setSuggestions(newSuggestions);
    } catch (error) {
      console.error("Failed to fetch autocomplete suggestions:", error);
      setSuggestions([]);
    }
  }, []);

  // Debounced fetching of suggestions
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchSuggestions(value);
    }, 300); // Debounce API requests

    return () => clearTimeout(timeoutId);
  }, [value, fetchSuggestions]);

  // Handle Enter key press
  const handleEnterPress = useCallback((value: string) => {
    if (value.trim()) {
      const isURL = /^(https?|file):\/\/[^ "]+$/.test(value); // Updated regex to support http, https, and file protocols
      let url: string;

      if (isURL) {
        url = value;
      } else if (/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)) {
        // Matches plain domains like google.com
        url = `https://${value}`;
      } else {
        // Treat as a search query
        url = `https://www.google.com/search?q=${encodeURIComponent(value)}`;
      }

      createNewTab({ url });
      setOpen(false);
      setValue("");
      setSuggestions([]);
    }
  }, [value, createNewTab, setOpen]);

  return (
    <CommandDialog open={open} onOpenChange={setOpen} >
      <CommandInput placeholder="Search or type a url..." value={value} onValueChange={setValue} />
      <CommandList>
        {value !== "" ?
          (
            <CommandItem onSelect={(value) => {
              setValue(value);
              handleEnterPress(value)
            }} key={0} className="">
              {value}
            </CommandItem>
          )
          : <></>}
        {
          suggestions.map((suggestion, index) => {
            if (suggestion == value) return <></>
            return (
              <CommandItem onSelect={(value) => {
                setValue(value);
                handleEnterPress(value)
              }} key={index} className="">
                {suggestion}
              </CommandItem>
            )
          })
        }
      </CommandList>
    </CommandDialog>
  );
}
