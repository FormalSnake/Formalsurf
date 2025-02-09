import { atom } from 'jotai'
import uuid4 from "uuid4";

export interface Tab {
  id: string
  url: string
  title: string
  favicon: string
  isActive: boolean
  readerMode: boolean
  subTabs: Tab[]
}

export const tabsAtom = atom<Tab[]>([
  {
    id: uuid4(),
    url: 'https://github.com/FormalSnake/Formalsurf',
    title: 'GitHub',
    favicon: 'https://www.github.com/favicon.ico',
    isActive: false,
    readerMode: false,
    subTabs: [{
      id: uuid4(),
      url: 'https://surf.formalsnake.dev/',
      title: 'Formalsurf',
      favicon: '',
      isActive: false,
      readerMode: false,
      subTabs: [],
    }],
  },
  {
    id: uuid4(),
    url: 'https://www.formalsnake.dev/blog/07-nix/',
    title: 'formalsnake.dev',
    favicon: 'https://www.formalsnake.dev/favicon.ico',
    isActive: true,
    readerMode: false,
    subTabs: [],
  },
  {
    id: uuid4(),
    url: 'https://chromewebstore.google.com/',
    title: 'Chrome Web Store',
    favicon: 'https://chromewebstore.google.com/favicon.ico',
    isActive: false,
    readerMode: false,
    subTabs: [
      {
        id: uuid4(),
        url: 'https://chromewebstore.google.com/detail/ultimate-car-driving-game/aomkpefnllinimbhddlfhelelngakbbn',
        title: 'Ultimate Car Driving Game',
        favicon: 'https://chrome.google.com/favicon.ico',
        isActive: false,
        readerMode: false,
        subTabs: [],
      },
      {
        id: uuid4(),
        url: 'https://chromewebstore.google.com/detail/dark-reader/eimadpbcbfnmbkopoojfekhnkhdbieeh',
        title: 'Dark Reader',
        favicon: 'https://chrome.google.com/favicon.ico',
        isActive: false,
        readerMode: false,
        subTabs: [{
          id: uuid4(),
          url: 'https://darkreader.org/',
          title: 'Dark Reader',
          favicon: 'https://chrome.google.com/favicon.ico',
          isActive: false,
          readerMode: false,
          subTabs: []
        }],
      }
    ],
  },
])

export const activeTabRefAtom = atom<any>(null)
