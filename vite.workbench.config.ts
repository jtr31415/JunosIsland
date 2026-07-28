/**
 * The workbench host. DEV ONLY — this config has no `build` and is never run
 * by CI, by `npm run build`, or by anything that produces a deployable
 * artifact. `npm run channel` proves the other half: the sentinel in
 * `tools/workbench/` appears in neither shipped bundle, and nothing in `src/`
 * references the folder.
 *
 * Why Vite rather than the plain node server: the asset viewer imports the
 * game's own registries — `SPECIES`, `FEATURES`, `COVER`, `INCREMENTS`,
 * `loadTileModels`, `createPropField` — straight out of `src/`, in TypeScript.
 * That is the whole point of it. Every ID it shows is canonical because it
 * came from the table the game deals from, not from a list someone typed into
 * a tool and then let rot.
 *
 *   npm run workbench      → http://127.0.0.1:4173
 */
import { defineConfig } from 'vite'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { createApi } from './tools/workbench/api.mjs'
import { seed } from './tools/workbench/seed.mjs'

const here = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  root: resolve(here, 'tools/workbench/public'),
  /*
   * The game's runtime assets, at the same URLs the game uses.
   *
   * `pets/animal-fox.glb`, `props/tree_single_A.gltf`, `forest/*.gltf`,
   * `tiles/hex_grass.gltf` — the viewer passes `base = ''` to the game's own
   * loaders, so those paths must resolve exactly as they do under
   * `vite.island.config.ts` or the loaders would need a special case and stop
   * being the game's loaders.
   */
  publicDir: resolve(here, 'src/island/public'),
  define: {
    /*
     * Preview, so anything the imported modules gate on a channel behaves as
     * it does when Joe is looking at it locally. Nothing here is ever built.
     */
    __CHANNEL__: JSON.stringify('preview'),
    __BUILD_STAMP__: JSON.stringify('workbench'),
  },
  server: { port: 4173, host: '127.0.0.1', open: false },
  plugins: [
    {
      name: 'joe-workbench-api',
      configureServer(server) {
        const root = here
        const made = seed(root)
        if (made.length) server.config.logger.info(`workbench: seeded ${made.length} file(s) into joe/`)
        /*
         * BEFORE Vite's own middleware. `/api/state` must not be mistaken for
         * a module request, and the handler passes anything that is not
         * `/api/` straight on.
         */
        server.middlewares.use(createApi(root))
      },
    },
  ],
})
