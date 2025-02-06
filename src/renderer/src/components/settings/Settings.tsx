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

export const settingsOpenAtom = atom(false)

export function SettingsDialog() {
  const [open, setOpen] = useAtom(settingsOpenAtom)
  const [ollamaUrl, setOllamaUrl] = useState("http://localhost:11434")

  useEffect(() => {
    window.api.getSettings('ollamaUrl').then((value) => {
      if (value) {
        console.log("Setting ollamaUrl to:", value)
        setOllamaUrl(value)
      }
    })
  }, [])

  const handleChangeOllamaUrl = (value: string) => {
    window.api.changeSetting('ollamaUrl', value).then((value) => { setOllamaUrl(value) })
  }

  useEffect(() => {
    handleChangeOllamaUrl(ollamaUrl)
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
        </div>
      </DialogContent>
    </Dialog>
  )
}

