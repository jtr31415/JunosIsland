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
 *
 * ## Why `strictPort`, and what it cost to learn
 *
 * Vite's default is to take the next free port when its own is busy. On 29 July
 * that turned a bookmark into a liar. A workbench server left running from the
 * previous day still held 4173; the new one announced 4174 in a line nobody
 * re-read; and Joe's 4173 tab kept answering — from the OLD process, whose
 * module graph predated the built-animals gallery entirely. Its `Gallery` union
 * had no `built` in it, so the tab he clicked fell through `shown()`'s else and
 * listed the props. The agent that had "verified in a real browser" was on
 * 4174 and was telling the truth; so was he. They were different servers.
 *
 * `strictPort` makes that impossible to reach. If 4173 is taken, Vite refuses
 * to start and says so, and the fix is to close the old one. A dev server that
 * moves quietly is a dev server that lets a stale bundle impersonate the
 * current one, and there is no test downstream that can catch it.
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
  server: { port: 4173, host: '127.0.0.1', open: false, strictPort: true },
  /*
   * ALL THREE PAGES ARE SCANNED AT STARTUP, and the reason is a 504 Joe hit on
   * 6 August: `504 (Outdated Optimize Dep)` on
   * `three_examples_jsm_controls_TransformControls__js?v=…`.
   *
   * The workbench is a MULTI-PAGE app — `index.html`, `viewer.html` and
   * `editor/index.html` — and Vite only pre-bundles what it has seen. Open the
   * queue page first and it optimises that page's deps; open the editor after
   * and it DISCOVERS `TransformControls`, re-optimises, and stamps a new `?v=`
   * hash. Every module the open tab already fetched still holds the old hash,
   * and those URLs are gone. The page 504s on a dependency that is present and
   * fine, which is why it reads as a server fault rather than a cache one.
   *
   * `entries` makes Vite crawl all three at boot, so the optimise happens once
   * before anything is served. `include` names the three example modules
   * outright: they are the only deps reached from a single page each, so they
   * are the only ones that can be discovered late. A reload clears the symptom;
   * this stops it recurring every time the editor is opened in a fresh session.
   *
   * DEV ONLY, like the rest of this file — never built, never in CI.
   */
  optimizeDeps: {
    entries: ['index.html', 'viewer.html', 'editor/index.html'],
    include: [
      'three/examples/jsm/controls/OrbitControls.js',
      'three/examples/jsm/controls/TransformControls.js',
      'three/examples/jsm/loaders/GLTFLoader.js',
    ],
  },
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
