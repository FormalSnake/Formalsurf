import { StatisticsWidget } from './StatisticsWidget'
import { ClockWidget } from './ClockWidget'
import { NotesWidget } from './NotesWidget'
import { WeatherWidget } from './WeatherWidget'
import { WidgetDefinition } from './types'

export const widgetRegistry: Record<string, WidgetDefinition> = {
  statistics: {
    id: 'statistics',
    type: 'statistics',
    title: 'Statistics',
    component: StatisticsWidget,
    defaultSize: { w: 4, h: 3 }
  },
  clock: {
    id: 'clock',
    type: 'clock',
    title: 'Clock',
    component: ClockWidget,
    defaultSize: { w: 3, h: 3 }
  },
  notes: {
    id: 'notes',
    type: 'notes',
    title: 'Quick Notes',
    component: NotesWidget,
    defaultSize: { w: 4, h: 4 }
  },
  weather: {
    id: 'weather',
    type: 'weather',
    title: 'Weather',
    component: WeatherWidget,
    defaultSize: { w: 3, h: 4 }
  }
}

export function registerWidget(widget: WidgetDefinition) {
  widgetRegistry[widget.type] = widget
}

export function getWidgetComponent(type: string) {
  return widgetRegistry[type]?.component
}
