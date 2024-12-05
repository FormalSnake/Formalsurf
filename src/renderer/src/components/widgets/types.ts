export type WidgetSize = 'small' | 'medium' | 'large'

export interface WidgetDefinition {
  id: string
  type: string
  title: string
  component: React.ComponentType<{ id: string; title: string }>
  defaultSize?: { w: number; h: number }
}

export interface WidgetProps {
  id: string
  title: string
  onRemove?: () => void
}

export interface WidgetInstance {
  id: string
  type: string
  title: string
  x: number
  y: number
  size: WidgetSize
  data?: any
}
