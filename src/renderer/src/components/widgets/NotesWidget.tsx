import { useState, useEffect } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { WidgetInstance } from './types'

export function NotesWidget({ widget }: { widget: WidgetInstance }) {
  const [notes, setNotes] = useState<string>(() => {
    const saved = localStorage.getItem(`widget_${widget.id}_notes`)
    return saved || ''
  })

  useEffect(() => {
    localStorage.setItem(`widget_${widget.id}_notes`, notes)
  }, [notes, widget.id])

  return (
    <div className="h-full">
      <Textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Type your notes here..."
        className="h-full resize-none bg-transparent"
      />
    </div>
  )
}
