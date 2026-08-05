/**
 * A static-analysis guard, not a browser test — the actual runtime claim (the
 * task queue and backlog still render under `npm run workbench:plain` even
 * though that host cannot serve `words.ts`) was hand-verified against a real
 * running `workbench:plain` instance; see the task report for what was
 * observed. What THIS file pins is the source-level property that makes that
 * true, so it cannot regress silently.
 *
 * `npm run workbench:plain` (`tools/workbench/server.mjs`) has no `.ts` MIME
 * entry in `serveStatic` (`api.mjs`), and `words.ts` is real TypeScript a
 * browser cannot parse even if it arrived. A STATIC `import` is resolved
 * BEFORE the importing module's own body runs at all, so a static import of
 * `words.ts` would take the whole of `app.js` down under that host — the task
 * queue and the backlog included — which is exactly what `server.mjs`'s own
 * header exists to prevent ("a broken Vite config should not be able to take
 * Joe's task queue down with it"). A DYNAMIC `import()` does not have that
 * property: it is a plain Promise-returning call, so a rejection cannot
 * prevent the rest of the module from having already run.
 */
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const src = readFileSync(resolve(root, 'tools/workbench/public/app.js'), 'utf8')

describe('app.js stays loadable under the plain (non-Vite) host', () => {
  it('has no top-level static import of a .ts module', () => {
    const staticImportLines = src.split('\n').filter(line => /^\s*import\b/.test(line))
    for (const line of staticImportLines) {
      expect(line, `a top-level static import of a TypeScript module blocks the whole ` +
        `page under workbench:plain (no .ts MIME entry there): "${line.trim()}"`)
        .not.toMatch(/from\s+['"][^'"]*\.ts['"]/)
    }
  })

  it('still reaches words.ts, but lazily — a dynamic import, not a static one', () => {
    /* Not just "no static import" — the bench must still actually work under
     * Vite, which means the dynamic path has to exist somewhere. */
    expect(src).toMatch(/import\(\s*['"]\.\/words\.ts['"]\s*\)/)
  })
})
