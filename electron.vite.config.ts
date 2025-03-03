import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'
// @ts-expect-error
import tailwindcss from '@tailwindcss/vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'

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
      tailwindcss(),
      viteStaticCopy({
        targets: [
          {
            // require.resolve('electron-chrome-web-store/preload')
            src: resolve('node_modules/electron-chrome-web-store/preload'),
            dest: resolve('src/main/preload'),
          },
          {
            // require.resolve('electron-chrome-extensions/preload')
            src: resolve('electron-chrome-extensions/preload'),
            dest: resolve('src/main/preload'),
          },
        ]
      })
    ]
  }
})
