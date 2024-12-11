import React from 'react'

interface ReadingModeProps {
  shortcut?: string
}

export const ReadingMode: React.FC<ReadingModeProps> = ({ 
  shortcut = 'Cmd/Ctrl+Alt+Shift+R'
}) => {
  return (
    <div className="absolute inset-0 bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold">Reader Mode</h2>
        <p className="text-muted-foreground">
          Press {shortcut} to exit reader mode
        </p>
      </div>
    </div>
  )
}
