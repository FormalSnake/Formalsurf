import { Button } from "@renderer/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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

export const settingsOpenAtom = atom(false)

interface Model {
  name: string
  model: string
}

export function SettingsDialog() {
  const [open, setOpen] = useAtom(settingsOpenAtom)
  const [ollamaUrl, setOllamaUrl] = useState<string>("")
  const [models, setModels] = useState<Model[]>([])
  const [activeModel, setActiveModel] = useState<Model>({ name: "llama3.2:latest", model: "llama3.2:latest" })
  const [modelOpen, setModelOpen] = useState(false)

  useEffect(() => {
    window.api.getSettings('ollamaUrl').then((value) => {
      console.log("Setting ollamaUrl to:", value)
      setOllamaUrl(value)
    })
  }, [])

  const handleChangeOllamaUrl = (value: string) => {
    window.api.changeSetting('ollamaUrl', value).then((value) => { setOllamaUrl(value) })
  }

  useEffect(() => {
    if (ollamaUrl !== "") {
      handleChangeOllamaUrl(ollamaUrl)
      if (ollamaUrl.endsWith('/')) {
        const fetchedModels = fetch(`${ollamaUrl}api/tags`)
        fetchedModels.then(res => res.json()).then((value) => {
          if (value.models) {
            setModels(value.models)
          }
        })
      }
    }
  }, [ollamaUrl])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Browser Settings</DialogTitle>
          <DialogDescription>
            Make changes to your browser settings here. Click save when you're
            done.
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
            <Label htmlFor="ollama-url" className="text-right">
              Ollama URL
            </Label>
            <Input id="ollama-url" value={ollamaUrl} className="col-span-3" onChange={(e) => setOllamaUrl(e.target.value)} />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="active-model" className="text-right">
              Active Model
            </Label>
            <Popover value={activeModel} onValueChange={(value) => setActiveModel(value)} open={modelOpen} onOpenChange={setModelOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-[200px] justify-between"
                >
                  {activeModel.name}
                  <ChevronsUpDown className="opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent>
                <Command>
                  <CommandInput placeholder="Search models..." className="h-9" />
                  <CommandList>
                    <CommandEmpty>No results.</CommandEmpty>
                    {models.map((model) => (
                      <CommandItem key={model.name} value={model.name} onSelect={() => setActiveModel(model)}>
                        {model.name}
                        <Check
                          className={cn(
                            "ml-auto",
                            model === activeModel ? "opacity-100" : "opacity-0"
                          )}
                        />
                      </CommandItem>
                    ))}
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

