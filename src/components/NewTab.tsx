import * as React from "react"
import { CommandDialog } from "@/components/ui/command"
import { Input } from "./ui/input"
import { useCreateNewTab } from "@/providers/TabProvider"
import { atom, useAtom } from "jotai"

export const isNewTabDialogOpen = atom(false)

export function NewTabDialog() {
  // const [open, setOpen] = React.useState(false)
  const [open, setOpen] = useAtom(isNewTabDialogOpen)
  const [value, setValue] = React.useState("")
  const createNewTab = useCreateNewTab();

  React.useEffect(() => {
    console.log(value)
  }, [value, setValue])

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "t" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  // Define the function to be executed on Enter
  const handleEnterPress = () => {
    console.log("Enter pressed! Value:", value)
    // check if value is a valid URL, if not change the value to a google search
    if (value.match(/^(http|https):\/\/[^ "]+$/)) {
      createNewTab({ url: value })
    } else {
      createNewTab({ url: "https://www.google.com/search?q=" + value })
    }
    // createNewTab({ url: value })
    setOpen(false)
    setValue("")
  }

  return (
    <>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <Input
          className="ring-0"
          placeholder="Go somewhere or look something up..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleEnterPress()
            }
          }}
        />
      </CommandDialog>
    </>
  )
}
