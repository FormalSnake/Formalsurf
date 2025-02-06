import { Moon, Sun, Monitor } from "lucide-react"
import { Button } from "@renderer/components/ui/button"
import { Theme, useTheme } from "@renderer/components/theme-provider"

export function ModeToggle() {
  const { setTheme, theme } = useTheme()

  const cycleTheme = () => {
    const themes: Theme[] = ["light", "dark", "system"]
    const currentIndex = themes.indexOf(theme)
    const nextIndex = (currentIndex + 1) % themes.length
    setTheme(themes[nextIndex])
  }

  const getThemeIcon = () => {
    switch (theme) {
      case "dark":
        return <Moon className="h-[1.2rem] w-[1.2rem]" />
      case "system":
        return <Monitor className="h-[1.2rem] w-[1.2rem]" />
      default:
        return <Sun className="h-[1.2rem] w-[1.2rem]" />
    }
  }

  return (
    <Button variant="outline" onClick={cycleTheme} className="col-span-3">
      <div className="flex items-center gap-2">
        {getThemeIcon()}
        <span>{theme.charAt(0).toUpperCase() + theme.slice(1)}</span>
      </div>
    </Button>
  )
}
