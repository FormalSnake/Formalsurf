import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'
// @ts-expect-error
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin({ exclude: ['electron-context-menu', 'electron-store'] })]
  },
  preload: {
    plugins: [externalizeDepsPlugin({ exclude: ['electron-context-menu', 'electron-store'] })]
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src')
      }
    },
    plugins: [
      react({
        babel: {
          plugins: [["babel-plugin-react-compiler"]],
        },
      }),
      tailwindcss()
    ]
  }
})
