import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@renderer/components/ui/select"

import { useTheme } from "@renderer/components/theme-provider"

export function SchemeSelect() {
  const { colorScheme, setColorScheme } = useTheme()
  return (
    <Select value={colorScheme} onValueChange={setColorScheme}>
      <SelectTrigger className="w-full col-span-3">
        <SelectValue placeholder="Select a color scheme" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="default">Default</SelectItem>
        <SelectItem value="flexoki">Flexoki</SelectItem>
      </SelectContent>
    </Select>
  )
}
