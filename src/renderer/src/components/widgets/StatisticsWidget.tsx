import { useState } from 'react'
import { WidgetProps } from './types'

export function StatisticsWidget({ title }: WidgetProps) {
  const [count, setCount] = useState(0)

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <span>Total Count: {count}</span>
        <button
          onClick={() => setCount((c) => c + 1)}
          className="px-2 py-1 bg-primary text-primary-foreground rounded-md"
        >
          Increment
        </button>
      </div>
    </div>
  )
}
