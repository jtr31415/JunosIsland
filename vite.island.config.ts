import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))

/** A short, sortable stamp so a running build can be identified on sight. */
const stamp = new Date().toISOString().slice(5, 16).replace('T', ' ')

/**
 * Which channel this build is (Phase 3 item 4).
 *
 * Production is what Juno's PWA pins to and is built only from a tagged
 * release; preview is main. Anything that is not exactly 'preview' is treated
 * as production, so a typo in the environment fails towards the safe answer
 * rather than shipping half-built features to a six-year-old.
 *
 * A DEFINE rather than an env lookup, deliberately. The literal string is
 * substituted into the bundle, so `__CHANNEL__ !== 'production'` folds to
 * false and Rollup deletes the branch — which is what lets balance.dev.json
 * and the Pet-o-matic be absent from production output rather than merely
 * unreachable.
 *
 * `npm run dev` is always preview. Otherwise the dev server would default to
 * production, every flag would be off, and the Pet-o-matic — which exists to
 * be looked at locally — could not be opened at all.
 */
const channelFor = (command: string): string =>
  process.env.ISLAND_CHANNEL === 'preview' || command === 'serve'
    ? 'preview'
    : 'production'

export default defineConfig(({ command }) => ({
  define: {
    __BUILD_STAMP__: JSON.stringify(stamp),
    __CHANNEL__: JSON.stringify(channelFor(command)),
  },
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
        /*
         * THE FONT MUST BE PRECACHED, and by default it is not.
         *
         * vite-plugin-pwa precaches js, css and html only. Andika is the whole
         * point of the reading surface — a single-storey `a` and a hooked `l`,
         * which is what a child is taught — so a first offline load without it
         * silently falls back to Roboto and gives her the two letterforms she
         * cannot read. 40KB, latin subset, regular and bold.
         *
         * The pet models have the same gap and are deliberately NOT added here:
         * they are 3.21 MiB against a 5MB budget and warming them at runtime was
         * measured to close the render delay instead. See pets.ts `warm`.
         */
        globPatterns: ['**/*.{js,css,html,woff2}'],
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
}))
