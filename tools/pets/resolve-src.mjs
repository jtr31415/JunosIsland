/**
 * Let plain `node` import `src/` the way the bundler does.
 *
 * The repo is `"moduleResolution": "bundler"`, so every module under `src/`
 * imports its neighbours without a file extension — `./bank.generated`,
 * `./assembled`. Node's ESM resolver requires the extension and a directory's
 * `index`, so it cannot load those files at all, and a tool that wants to build a
 * creature outside the browser has to bridge that.
 *
 * This is the whole bridge: when a relative specifier fails to resolve, try it
 * with `.ts` and then as `<dir>/index.ts`. Nothing else is changed — no
 * transpiler, no bundler, no config. `node --experimental-strip-types` does the
 * types and this does the paths.
 *
 * Registered with `module.registerHooks` (Node 22.15+), which runs on the same
 * thread, so it is a `--import` away rather than a worker and a channel.
 *
 * The precedent is `tools/pets/parts-bank.ts`, which `npm run pets:parts` already
 * runs under `--experimental-strip-types`. It gets away without this only because
 * it imports nothing from `src/`.
 */
import { registerHooks } from 'node:module'
import { existsSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'

registerHooks({
  resolve(specifier, context, nextResolve) {
    try {
      return nextResolve(specifier, context)
    } catch (err) {
      if (!specifier.startsWith('.') && !specifier.startsWith('/')) throw err
      const base = new URL(specifier, context.parentURL ?? pathToFileURL(process.cwd() + '/'))
      for (const candidate of [`${base.href}.ts`, `${base.href}/index.ts`]) {
        if (existsSync(fileURLToPath(candidate))) {
          /* `module-typescript`, not `module`: the format is what tells node to
           * strip the types on the way in. Saying `module` loads a `.ts` file as
           * plain JavaScript and it fails on the first type annotation. */
          return { url: candidate, format: 'module-typescript', shortCircuit: true }
        }
      }
      throw err
    }
  },
})
