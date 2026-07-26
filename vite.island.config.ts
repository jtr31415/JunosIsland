import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  root: resolve(here, 'src/island'),
  base: '/JunosIsland/',
  plugins: [
    VitePWA({
      // Mandatory. Without autoUpdate a service worker serves stale assets
      // indefinitely after a fix is pushed, and you end up debugging a
      // phantom that was fixed three deploys ago.
      registerType: 'autoUpdate',
      manifest: {
        name: 'Pet Island',
        short_name: 'Pet Island',
        description: 'Read eggs home and count up some land.',
        start_url: '/JunosIsland/',
        scope: '/JunosIsland/',
        display: 'standalone',
        orientation: 'landscape',
        background_color: '#8fd6ff',
        theme_color: '#8fd6ff',
        icons: [],
      },
    }),
  ],
  build: {
    outDir: resolve(here, 'dist/island'),
    emptyOutDir: true,
  },
})
