import { Moon, Sun, Monitor } from 'lucide-react'
import { useTheme } from '@/components/theme-provider'
import { Button } from '@/components/ui/button'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const cycleTheme = () => {
    const themes: Array<'light' | 'dark' | 'system'> = ['system', 'light', 'dark']
    const currentIndex = themes.indexOf(theme)
    const nextIndex = (currentIndex + 1) % themes.length
    setTheme(themes[nextIndex])
  }

  return (
    <Button variant="outline" className="w-[200px] justify-start" onClick={cycleTheme}>
      {theme === 'light' && (
        <>
          <Sun className="h-[1.2rem] w-[1.2rem] mr-2" />
          Light Mode
        </>
      )}
      {theme === 'dark' && (
        <>
          <Moon className="h-[1.2rem] w-[1.2rem] mr-2" />
          Dark Mode
        </>
      )}
      {theme === 'system' && (
        <>
          <Monitor className="h-[1.2rem] w-[1.2rem] mr-2" />
          System
        </>
      )}
    </Button>
  )
}
