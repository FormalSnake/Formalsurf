import { createContext, useContext, useEffect, useState } from 'react'

export type Theme = 'dark' | 'light' | 'system'
export type Colorscheme =
  | 'default'
  | 'flexoki'
  | 'catppuccin-mocha'
  | 'catppuccin-frappe'
  | 'catppuccin-macchiato'
  | 'tokyonight'

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  defaultColorScheme?: Colorscheme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
  colorScheme: Colorscheme
  setColorScheme: (colorScheme: Colorscheme) => void
}

const initialState: ThemeProviderState = {
  theme: 'system',
  setTheme: () => null,
  colorScheme: 'default',
  setColorScheme: () => null
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  defaultColorScheme = 'default',
  storageKey = 'vite-ui-theme',
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  )
  const [colorScheme, setColorScheme] = useState<Colorscheme>(
    () => (localStorage.getItem('vite-ui-color-scheme') as Colorscheme) || defaultColorScheme
  )

  useEffect(() => {
    const root = window.document.documentElement

    const applyTheme = (theme: Theme) => {
      root.classList.remove('light', 'dark')

      if (theme === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light'

        root.classList.add(systemTheme)
      } else {
        root.classList.add(theme)
      }
    }

    applyTheme(theme)

    const applyColorScheme = (colorScheme: Colorscheme) => {
      root.setAttribute('data-theme', colorScheme)
    }

    applyColorScheme(colorScheme)

    // Listen for system theme changes if the theme is set to "system"
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handleSystemThemeChange = (_e: MediaQueryListEvent) => {
        applyTheme('system')
      }

      mediaQuery.addEventListener('change', handleSystemThemeChange)

      return () => {
        mediaQuery.removeEventListener('change', handleSystemThemeChange)
      }
    }

    return () => {
    }
  }, [theme, colorScheme])

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme)
      setTheme(theme)
    },
    colorScheme,
    setColorScheme: (colorScheme: Colorscheme) => {
      localStorage.setItem('vite-ui-color-scheme', colorScheme)
      setColorScheme(colorScheme)
    }
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined) throw new Error('useTheme must be used within a ThemeProvider')

  return context
}
