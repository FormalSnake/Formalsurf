import { atom } from 'jotai'
import uuid4 from "uuid4";

export interface Tab {
  id: string
  url: string
  title: string
  favicon: string
  isActive: boolean
  ref: React.RefObject<HTMLWebViewElement | null> | null
}

export const tabsAtom = atom<Tab[]>([
  {
    id: uuid4(),
    url: 'https://www.github.com/',
    title: 'GitHub',
    favicon: 'https://www.github.com/favicon.ico',
    isActive: true,
    ref: null
  },
  {
    id: uuid4(),
    url: 'https://www.formalsnake.dev/',
    title: 'formalsnake.dev',
    favicon: 'https://www.formalsnake.dev/favicon.ico',
    isActive: false,
    ref: null
  }
])
