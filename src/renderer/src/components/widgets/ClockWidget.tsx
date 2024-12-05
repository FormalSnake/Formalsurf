import { useEffect, useState } from 'react'
import { WidgetProps } from './types'

export function ClockWidget({ title }: WidgetProps) {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="text-center">
      <div className="text-2xl font-mono">{time.toLocaleTimeString()}</div>
      <div className="text-sm text-muted-foreground">{time.toLocaleDateString()}</div>
    </div>
  )
}
