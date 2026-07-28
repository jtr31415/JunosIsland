/**
 * The workbench without Vite — the API and the plain pages, nothing else.
 *
 * JOE_WORKBENCH_ONLY
 *
 * That sentinel is load-bearing: `tools/smoke/channel.mjs` greps both shipped
 * bundles for it and greps `src/` for any reference to this folder, so "the
 * workbench cannot reach the tablet" is a checked fact rather than an
 * intention. Nothing in `src/` may ever import from here.
 *
 * `npm run workbench` starts the VITE host instead (vite.workbench.config.ts),
 * because the asset viewer imports the game's own TypeScript registries and
 * needs a module server. This file exists because the round-trip test wants a
 * host with no build step in it, and because a broken Vite config should not
 * be able to take Joe's task queue down with it.
 *
 *   node tools/workbench/server.mjs [--port N] [--root DIR]
 */
import { createServer } from 'node:http'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { exists } from './repo.mjs'
import { seed, REPO } from './seed.mjs'
import { createApi, serveStatic } from './api.mjs'

const PUBLIC = resolve(dirname(fileURLToPath(import.meta.url)), 'public')

export function makeServer(root = REPO) {
  const api = createApi(root)
  return createServer((req, res) => {
    void api(req, res, () => {
      if (serveStatic(PUBLIC, req, res)) return
      res.writeHead(404, { 'content-type': 'application/json' })
      res.end(JSON.stringify({ error: `not found: ${req.url}` }))
    })
  })
}

if (process.argv[1]?.endsWith('server.mjs')) {
  const pi = process.argv.indexOf('--port')
  const port = pi === -1 ? 4173 : Number(process.argv[pi + 1])
  const ri = process.argv.indexOf('--root')
  const root = ri === -1 ? REPO : resolve(process.argv[ri + 1])

  const made = seed(root)
  if (made.length) console.log(`seeded ${made.length} file(s) into joe/`)
  if (!exists(root, 'joe/tasks.json')) console.warn('warning: joe/tasks.json is missing and could not be seeded')

  makeServer(root).listen(port, '127.0.0.1', function () {
    /* The test parses this line, so its shape is a contract. */
    console.log(`WORKBENCH READY http://127.0.0.1:${this.address().port}`)
  })
}
