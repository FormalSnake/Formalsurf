import { atom } from 'jotai'
import uuid4 from 'uuid4'

export interface Tab {
  id: string
  url: string
  title: string
  favicon: string
  isActive: boolean
  readerMode: boolean
}

export const tabsAtom = atom<Tab[]>([
  {
    id: uuid4(),
    url: 'https://github.com/FormalSnake/Formalsurf',
    title: 'GitHub',
    favicon: 'https://www.github.com/favicon.ico',
    isActive: false,
    readerMode: false
  },
  {
    id: uuid4(),
    url: 'https://www.formalsnake.dev/blog/07-nix/',
    title: 'formalsnake.dev',
    favicon: 'https://www.formalsnake.dev/favicon.ico',
    isActive: true,
    readerMode: false
  },
  {
    id: uuid4(),
    url: 'https://chromewebstore.google.com/',
    title: 'Chrome Web Store',
    favicon: 'https://chromewebstore.google.com/favicon.ico',
    isActive: false,
    readerMode: false
  }
])

export const activeTabRefAtom = atom<any>(null)
