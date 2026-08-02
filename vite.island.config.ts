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
         *
         * FRED'S BAKED VOICE MUST BE PRECACHED TOO, and `opus` is why it is in
         * the list. The 41 clips are 628 KiB — a fifth of the pet pack — and
         * unlike a pet model there is no "next one" to predict: the clip is
         * needed the instant Fred opens his mouth, and the player has no network
         * path to go and get it. Left out, the failure is invisible everywhere
         * it would be caught: every test stays green, the dev server serves the
         * files happily, and the only place it shows is a tablet in aeroplane
         * mode, where Fred silently reverts to the device's robot voice. That is
         * the same trap the font above was nearly lost to.
         *
         * This is not the ~5MB of voice.md §5.5 — that figure is the teacher's
         * ~1,700 name and word clips, which are not baked and, when they are,
         * should be weighed against the budget on their own terms.
         *
         * `voice/manifest.json` is named on its own line and MUST stay. It is
         * the index: the player fetches it first and, without it, has no idea
         * which clips exist or where — so 41 precached clips sit in the cache
         * unreachable and Fred is robotic offline anyway. Precaching the audio
         * and forgetting its index is the whole trap wearing a second coat.
         * Named literally rather than as `**\/*.json` so that a data file
         * dropped into publicDir later cannot join the offline bundle by
         * accident; today it would be the only other match.
         */
        globPatterns: ['**/*.{js,css,html,woff2,opus}', 'voice/manifest.json'],
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
      },
      manifest: {
        name: "Juno's Island",
        short_name: "Juno's Island",
        description: 'Read to your eggs and find land for your friends.',
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
