import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@renderer/components/ui/dialog'
import { Label } from '@renderer/components/ui/label'
import { atom, useAtom } from 'jotai'
import { ModeToggle } from '../mode-toggle'
import { SchemeSelect } from '../scheme-select'

export const settingsOpenAtom = atom(false)

export function SettingsDialog() {
  const [open, setOpen] = useAtom(settingsOpenAtom)

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
        </div>
      </DialogContent>
    </Dialog>
  )
}
