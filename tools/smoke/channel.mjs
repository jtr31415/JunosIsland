/**
 * Prove the production bundle cannot reach the dev overlay.
 *
 * Item 4's acceptance: "same commit produces prod bundle without dev overlay
 * code paths reachable (test via build output grep + runtime flag probe)."
 * The runtime probe is `tests/platform/flags.test.ts`; this is the grep, and
 * it is the half that matters, because "I believe Rollup drops the branch" is
 * not the same as knowing it did.
 *
 * Reads whatever is in dist/island and checks it against the channel it claims
 * to be, so it cannot be fooled by being run against the wrong build.
 *
 *   node tools/smoke/channel.mjs
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, resolve, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const DIST = resolve(here, '../../dist/island')

/** The string that must never appear in a production build. */
const MARKER = 'PREVIEW_ONLY_BALANCE_OVERLAY'

function everyFile(dir) {
  const out = []
  for (const name of readdirSync(dir)) {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) out.push(...everyFile(path))
    else out.push(path)
  }
  return out
}

const files = everyFile(DIST)
const text = files.filter(f => /\.(js|css|html|json)$/.test(f))
const bodies = new Map(text.map(f => [f, readFileSync(f, 'utf8')]))

/*
 * Which build this is meant to be — stated, not sniffed.
 *
 * The first version inferred it by looking for the channel string in the
 * output, and got it wrong. Fair warning about clever checks: a verifier that
 * can be confused is worse than none, because it reports confidently either
 * way. CI builds immediately before running this, so there is nothing to
 * infer.
 *
 *   node tools/smoke/channel.mjs [production|preview]
 */
const channel = process.argv[2] === 'preview' ? 'preview' : 'production'

const leaked = [...bodies.entries()]
  .filter(([, body]) => body.includes(MARKER))
  .map(([f]) => f.slice(DIST.length + 1))

console.log(`channel      ${channel}`)
console.log(`files        ${files.length} (${text.length} searchable)`)

if (channel === 'production') {
  if (leaked.length) {
    console.error(`\nFAIL: the dev balance overlay reached a PRODUCTION build:`)
    for (const f of leaked) console.error('  ' + f)
    console.error('\nThe branch in balance/index.ts is meant to fold away at build time.')
    process.exit(1)
  }
  console.log('overlay      absent, as it must be')
} else {
  if (!leaked.length) {
    console.error('\nFAIL: a PREVIEW build cannot load the dev overlay either.')
    console.error('The point of preview is that it can. Check the dynamic import.')
    process.exit(1)
  }
  console.log('overlay      present in ' + leaked.join(', '))
}

console.log('\nchannel check passed')
