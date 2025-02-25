import { useEffect, useMemo, useRef, useState } from 'react'
import { TabButton } from './TabButton'
import { Tab } from '@renderer/atoms/browser'
import { createSwapy, Swapy, SlotItemMapArray, utils } from 'swapy'

function TabList({ tabs, setActiveTab }: { tabs: Tab[], setActiveTab: (id: string) => void }) {
  const swapy = useRef<Swapy>(null)
  const container = useRef<any>(null)
  const [slotItemMap, setSlotItemMap] = useState<SlotItemMapArray>(utils.initSlotItemMap(tabs, 'id'))
  const slottedItems = useMemo(() => utils.toSlottedItems(tabs, 'id', slotItemMap), [tabs, slotItemMap])

  useEffect(() => utils.dynamicSwapy(swapy.current, tabs, 'id', slotItemMap, setSlotItemMap), [tabs])

  useEffect(() => {
    swapy.current = createSwapy(container.current!, {
      manualSwap: true,
      animation: 'spring',
      autoScrollOnDrag: true,
      // swapMode: 'drop',
      // enabled: true,
      // dragAxis: 'x',
      // dragOnHold: true
    })

    swapy.current.onSwap((event) => {
      setSlotItemMap(event.newSlotItemMap.asArray)
    })

    return () => {
      swapy.current?.destroy()
    }
  }, [])

  return (
    <div className="flex flex-col p-2 space-y-2 container" ref={container}>
      {slottedItems.map(({ slotId, itemId, item }) => (
        <div className="flex flex-col slot" key={slotId} data-swapy-slot={slotId}>
          {
            item && <TabButton key={item.id} tab={item} setActiveTab={setActiveTab} itemId={itemId} />
          }
        </div>
      ))}
    </div>
  )
}

export default TabList
