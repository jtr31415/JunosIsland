/**
 * Run the parity gate over and over, and report honestly.
 *
 * Item 3's acceptance: "50 consecutive green runs in CI, scripted." A gate
 * that fails at random is a gate people stop reading, and the only way to know
 * a flake is gone is to fail to reproduce it a lot of times in a row.
 *
 * Not part of the five gates. One parity run is the per-commit check; this is
 * for proving a timing change actually settled something, and for CI to run on
 * its own schedule rather than on every push.
 *
 *   node tools/smoke/soak.mjs [runs]
 */
import { spawnSync } from 'node:child_process'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const runs = Number(process.argv[2] ?? 50)
const parity = resolve(here, 'parity.mjs')

const failures = []
let restless = 0
const started = Date.now()

for (let i = 1; i <= runs; i++) {
  const r = spawnSync(process.execPath, [parity], { encoding: 'utf8' })
  const out = (r.stdout ?? '') + (r.stderr ?? '')
  const green = r.status === 0 && out.includes('every step renders identically')

  /*
   * A run that passed while a step never went quiet is not really a pass — it
   * is the old failure mode being lucky. Counted separately so a soak that is
   * green but restless does not read as settled.
   */
  if (out.includes('never went quiet')) restless++

  if (!green) {
    failures.push({ run: i, out: out.split('\n').filter(l => l.includes('DIFF') || l.includes('Error')).slice(0, 6) })
    process.stdout.write('x')
  } else {
    process.stdout.write('.')
  }
  if (i % 50 === 0) process.stdout.write('\n')
}

const seconds = Math.round((Date.now() - started) / 100) / 10
process.stdout.write('\n\n')
console.log(`${runs - failures.length} / ${runs} green in ${seconds}s`)
if (restless) console.log(`${restless} run(s) had a step that never went quiet`)

for (const f of failures) {
  console.log(`\nrun ${f.run}:`)
  for (const line of f.out) console.log('  ' + line)
}

if (failures.length || restless) {
  console.log('\nThe gate is not settled.')
  process.exit(1)
}
console.log('\nSettled.')
