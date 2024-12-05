import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Settings } from 'lucide-react'

interface WeatherData {
  temp: number
  description: string
  icon: string
  feelslike: number
  humidity: number
  windSpeed: number
}

interface WidgetInstance {
  id: string
}

export function WeatherWidget({ widget }: { widget: WidgetInstance }) {
  const [city, setCity] = useState<string>(() => {
    const saved = localStorage.getItem(`widget_${widget.id}_city`)
    return saved || 'San Francisco'
  })
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [open, setOpen] = useState(false)

  const API_KEY = 'd245617337db4565819225609241301'

  useEffect(() => {
    localStorage.setItem(`widget_${widget.id}_city`, city)
  }, [city, widget.id])

  const fetchWeather = async () => {
    try {
      const response = await fetch(
        `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${encodeURIComponent(city)}&aqi=no`
      )
      const data = await response.json()

      if (data.current) {
        setWeather({
          temp: Math.round(data.current.temp_c),
          description: data.current.condition.text,
          icon: data.current.condition.icon,
          feelslike: Math.round(data.current.feelslike_c),
          humidity: data.current.humidity,
          windSpeed: Math.round(data.current.wind_kph)
        })
      }
    } catch (error) {
      console.error('Error fetching weather:', error)
    }
  }

  useEffect(() => {
    fetchWeather()
    // Refresh every 5 minutes
    const interval = setInterval(fetchWeather, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [city])

  const handleCityChange = (newCity: string) => {
    setCity(newCity)
    setOpen(false)
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Settings className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Configure Weather Location</DialogTitle>
            </DialogHeader>
            <div className="flex gap-2">
              <Input
                placeholder="Enter city name"
                defaultValue={city}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCityChange(e.currentTarget.value)
                  }
                }}
              />
              <Button
                onClick={(e) =>
                  handleCityChange(
                    (e.currentTarget.previousElementSibling as HTMLInputElement).value
                  )
                }
              >
                Save
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center min-h-0">
        {weather ? (
          <div className="flex flex-col items-center w-full space-y-2 text-center">
            <img
              src={weather.icon}
              alt={weather.description}
              className="w-16 h-16 object-contain"
            />
            <div className="text-3xl font-bold tracking-tighter">{weather.temp}°C</div>
            <div className="text-sm text-muted-foreground capitalize">{weather.description}</div>
            <div className="grid grid-cols-2 gap-2 w-full text-sm text-muted-foreground mt-2">
              <div className="flex items-center justify-center gap-1">
                <span>Feels like:</span>
                <span className="font-medium">{weather.feelslike}°C</span>
              </div>
              <div className="flex items-center justify-center gap-1">
                <span>Humidity:</span>
                <span className="font-medium">{weather.humidity}%</span>
              </div>
              <div className="flex items-center justify-center gap-1">
                <span>Wind:</span>
                <span className="font-medium">{weather.windSpeed} km/h</span>
              </div>
              <div className="flex items-center justify-center">
                <span className="font-medium truncate">{city}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-muted-foreground animate-pulse">Loading weather...</div>
        )}
      </div>
    </div>
  )
}
