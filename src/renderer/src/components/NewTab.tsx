import React, { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogOverlay } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { atom, useAtom } from "jotai";
import { tabsAtom, useCreateNewTab } from "@/providers/TabProvider";
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "./ui/command";

export const isNewTabDialogOpen = atom(false);
export const tabBarUrl = atom("");
export const isUpdateAtom = atom(false);

export function NewTabDialog() {
  const [open, setOpen] = useAtom(isNewTabDialogOpen);
  const [value, setValue] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const createNewTab = useCreateNewTab();
  const [tabs, setTabs] = useAtom(tabsAtom);
  const [isUpdate, setIsUpdate] = useAtom(isUpdateAtom);

  useEffect(() => {
    if (isUpdate && open) {
      const activeTab = tabs.find((tab) => tab.isActive);
      if (activeTab) {
        setValue(activeTab.url);
      }
    }
  }, [isUpdate, open, tabs]);

  const handleEnterPress = useCallback(
    (value: string) => {
      if (value.trim()) {
        const validIP4Regex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/i;
        const unicodeRegex = /[^\u0000-\u00ff]/;
        const isURLRegex = /^(https?|file):\/\/[^ "]+$/i;
        const localhostRegex = /^localhost(:\d+)?$/i;

        let url: string;

        if (isURLRegex.test(value)) {
          url = value;
        } else if (validIP4Regex.test(value)) {
          url = `https://${value}`;
        } else if (localhostRegex.test(value)) {
          url = `http://${value}`;
        } else if (/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)) {
          url = `https://${value}`;
        } else if (unicodeRegex.test(value)) {
          url = `https://www.google.com/search?q=${encodeURIComponent(value)}`;
        } else {
          url = `https://www.google.com/search?q=${encodeURIComponent(value)}`;
        }

        if (isUpdate) {
          const activeTab = tabs.find((tab) => tab.isActive);
          if (activeTab) {
            setTabs(tabs.map((tab) =>
              tab.id === activeTab.id ? { ...tab, url } : tab
            ));
          }
        } else {
          createNewTab({ url });
        }

        setOpen(false);
        setValue("");
        setSuggestions([]);
      }
    },
    [createNewTab, setOpen, setValue, setSuggestions, tabs, setTabs, isUpdate]
  );

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
