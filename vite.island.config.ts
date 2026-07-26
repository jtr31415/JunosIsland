import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))

/** A short, sortable stamp so a running build can be identified on sight. */
const stamp = new Date().toISOString().slice(5, 16).replace('T', ' ')

export default defineConfig({
  define: { __BUILD_STAMP__: JSON.stringify(stamp) },
  root: resolve(here, 'src/island'),
  base: '/JunosIsland/',
  plugins: [
    VitePWA({
      /*
       * autoUpdate alone is NOT enough, and this cost real debugging time:
       * a new worker installs but then WAITS for every existing tab to close
       * before taking over, so a reload keeps serving the old bundle. The
       * result is phantom regressions — fixes that are demonstrably in the
       * deployed JavaScript but not in what the browser runs.
       *
       * skipWaiting + clientsClaim make the new worker take over on the next
       * load. For a single-player offline-capable game with no server state
       * there is nothing to coordinate, so the usual caution does not apply.
       */
      registerType: 'autoUpdate',
      workbox: {
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
      },
      manifest: {
        name: "Juno's Island",
        short_name: "Juno's Island",
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
