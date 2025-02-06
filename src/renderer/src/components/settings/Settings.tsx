import { Button } from "@renderer/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@renderer/components/ui/dialog"
import { Input } from "@renderer/components/ui/input"
import { Label } from "@renderer/components/ui/label"
import { atom, useAtom } from "jotai"
import { ModeToggle } from "../mode-toggle"
import { useEffect, useState } from "react"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@renderer/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@renderer/components/ui/popover"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@renderer/lib/utils"
import { SchemeSelect } from "../scheme-select"

export const settingsOpenAtom = atom(false)
export const activeModelAtom = atom<Model | null>(null)
export const ollamaUrlAtom = atom<string | null>(null)

interface Model {
  name: string
  model: string
}

export function SettingsDialog() {
  const [open, setOpen] = useAtom(settingsOpenAtom)
  const [ollamaUrl, setOllamaUrl] = useAtom(ollamaUrlAtom)
  const [models, setModels] = useState<Model[]>([])
  const [activeModel, setActiveModel] = useAtom(activeModelAtom)
  const [modelOpen, setModelOpen] = useState(false)

  useEffect(() => {
    window.api.getSettings('ollamaUrl').then((value) => {
      setOllamaUrl(value)
    })
    window.api.getSettings('activeModel').then((value) => {
      if (value) setActiveModel(value)
    })
  }, [])

  const handleChangeOllamaUrl = (value: string) => {
    // Normalize URL by ensuring it ends with a slash
    const normalizedValue = value.trim().replace(/\/?$/, '/')
    window.api.changeSetting('ollamaUrl', normalizedValue).then((savedValue) => {
      setOllamaUrl(savedValue)
    })
  }

  useEffect(() => {
    if (ollamaUrl) {
      // Properly construct API URL using URL constructor
      const apiUrl = new URL('api/tags', ollamaUrl).href

      fetch(apiUrl)
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch models')
          return res.json()
        })
        .then((data) => {
          setModels(data.models || [])
        })
        .catch((error) => {
          console.error('Error fetching models:', error)
          setModels([])
        })
    }
  }, [ollamaUrl])

  useEffect(() => {
    if (activeModel) {
      // Remove unnecessary state update in .then() callback
      window.api.changeSetting('activeModel', activeModel)
    }
  }, [activeModel])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Browser Settings</DialogTitle>
          <DialogDescription>
            Make changes to your browser settings here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="theme" className="text-right">
              Theme
            </Label>
            <ModeToggle />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="color-scheme" className="text-right">
              Color Scheme
            </Label>
            <SchemeSelect />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="ollama-url" className="text-right">
              Ollama URL
            </Label>
            <Input id="ollama-url" value={ollamaUrl} className="col-span-3" onChange={(e) => setOllamaUrl(e.target.value)} />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="active-model" className="text-right">
              Active Model
            </Label>
            <Popover open={modelOpen} onOpenChange={setModelOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="justify-between col-span-3"
                >
                  {activeModel?.name}
                  <ChevronsUpDown className="opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0">
                <Command>
                  <CommandInput placeholder="Search models..." className="h-9" />
                  <CommandList>
                    <CommandEmpty>No results.</CommandEmpty>
                    <CommandGroup heading="Models">
                      {models.map((model) => (
                        <CommandItem
                          key={model.name}
                          value={model.name}
                          onSelect={() => {
                            setActiveModel(model)
                            setModelOpen(false)
                          }}
                        >
                          {model.name}
                          <Check
                            className={cn(
                              "ml-auto",
                              model.model === activeModel?.model ? "opacity-100" : "opacity-0"
                            )}
                          />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
