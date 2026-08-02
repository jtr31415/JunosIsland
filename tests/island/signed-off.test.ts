/**
 * The sign-off mirror, held against the file it mirrors.
 *
 * `src/island/species/signed-off.json` is a COPY of a fact that lives in
 * `joe/names-audit.json`, and a copy is only ever as good as the thing that
 * proves it is still true. The game cannot read Joe's file — `joe/` is outside
 * the vite root — so a stale mirror would look perfectly healthy from inside
 * `src/` while withholding an animal he approved, or shipping one he did not.
 * Neither failure has a symptom anyone would notice until a child opened an egg.
 *
 * So the load-bearing assertion here is the drift guard: read his file off disk,
 * run the generator's OWN rule over it, and require the answer to equal what
 * `src/` ships. Not a restatement of the rule — the same function the generator
 * calls — because a second copy of the rule is exactly the thing that drifts.
 *
 * `docs/HANDOFF.md` §5 counts four dead features that shipped here behind tests
 * asserting a mock had been called. Nothing below mocks anything: every
 * assertion is over a real file on disk, the real generated module, and the real
 * registry.
 *
 * ZERO IS THE ANSWER TODAY, AND THE TESTS ARE WRITTEN FOR IT. No record carries
 * `signoff: 'ok'` yet; the rule is retroactive and Joe has not started ticking.
 * Nothing here asserts a non-zero count, so not one line needs editing on the
 * day he ticks his first row — the drift guard simply starts requiring that the
 * mirror was regenerated.
 */
import { describe, it, expect } from 'vitest'
import { readFileSync, writeFileSync, mkdirSync, mkdtempSync, existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { resolve, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createApi } from '../../tools/workbench/api.mjs'
import {
  signedOffFrom, mirrorText, AUDIT, MIRROR, SIGNED_OFF, SCHEMA_VERSION,
} from '../../tools/species/signoffs.mjs'
import { SIGNED_OFF_SPECIES, isSignedOff } from '../../src/island/species/signed-off'
import { speciesRecord } from '../../src/island/species/registry'

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const read = (rel: string): string => readFileSync(resolve(REPO, rel), 'utf8')

/** Joe's file, as it is on disk right now. Never written by this suite. */
const audit = JSON.parse(read(AUDIT)) as { names?: unknown[] }

/** The committed mirror, as text — the bytes matter as much as the values. */
const mirrorRaw = read(MIRROR)
const mirrorFile = JSON.parse(mirrorRaw) as { schemaVersion?: number, species?: string[] }

/** What the generator would write if it ran this second. */
const expected = signedOffFrom(audit)

const REGENERATE = 'Run `npm run signoffs` and commit the regenerated file.'

describe('the sign-off mirror agrees with the audit', () => {
  /*
   * THE assertion. If this fails, nothing is broken in the code — a human ticked
   * a box and the generated file did not follow, which is a one-command fix.
   */
  it('ships exactly the species Joe has ticked', () => {
    expect(
      [...SIGNED_OFF_SPECIES],
      `${MIRROR} disagrees with ${AUDIT}: a row has been signed off (or un-signed) `
      + `and the mirror was not regenerated, so the game would deal the wrong `
      + `animals. ${REGENERATE}`,
    ).toEqual(expected)
  })

  /* The same fact at the byte level: right values, wrong formatting still costs
   * a spurious diff on the next save, and CRLF has broken this repo before. */
  it('is byte-identical to what the generator would write', () => {
    expect(mirrorRaw, `${MIRROR} is not what the generator produces. ${REGENERATE}`)
      .toBe(mirrorText(expected))
  })

  it('carries the value the approver actually writes', () => {
    /* Read as TEXT rather than imported: the point is that the constant the
     * game filters on is the constant the workbench writes into the file, and
     * importing the writer would let both move together and still agree. */
    const approver = read('tools/workbench/public/approver.ts')
    const match = /APPROVED\s*=\s*'([^']*)'/.exec(approver)
    expect(match, 'could not find APPROVED in approver.ts').not.toBeNull()
    expect(match?.[1], 'the approver writes a signoff value the generator ignores')
      .toBe(SIGNED_OFF)
  })
})

describe('every signed-off species is one the game can build', () => {
  it('is registered', () => {
    for (const id of SIGNED_OFF_SPECIES) {
      expect(
        speciesRecord(id),
        `${MIRROR} names '${id}', which no registry record matches. Either a `
        + `speciesId in ${AUDIT} is a typo, or the species was signed off before `
        + `it shipped — an egg for it could not be built.`,
      ).toBeDefined()
    }
  })

  it('is not a duplicate, and the list is sorted', () => {
    expect([...SIGNED_OFF_SPECIES]).toEqual([...new Set(SIGNED_OFF_SPECIES)].sort())
  })
})

describe('an empty mirror is legal', () => {
  /* It is also the truth today. These four assertions hold either way, which is
   * the property that matters: none of them has to be rewritten when he starts. */
  it('is well formed whether or not anything is signed off', () => {
    expect(Array.isArray(SIGNED_OFF_SPECIES)).toBe(true)
    for (const id of SIGNED_OFF_SPECIES) {
      expect(typeof id).toBe('string')
      expect(id).not.toBe('')
    }
  })

  it('answers isSignedOff from the list and from nothing else', () => {
    for (const id of ['animal-hedgehog', 'animal-tarsier', 'animal-wolf', 'animal-mole']) {
      expect(isSignedOff(id)).toBe(SIGNED_OFF_SPECIES.includes(id))
    }
    expect(isSignedOff('')).toBe(false)
    expect(isSignedOff('not-a-species-at-all')).toBe(false)
  })

  it('is frozen, because the file behind it is generated', () => {
    expect(Object.isFrozen(SIGNED_OFF_SPECIES)).toBe(true)
  })
})

describe('the rule itself', () => {
  /* A hand-made audit, so the rule is exercised on the states the real file will
   * reach one at a time over weeks and does not reach today. */
  const fixture = {
    schemaVersion: 1,
    names: [
      { id: 'natural/animal-tarsier', speciesId: 'animal-tarsier', signoff: 'ok' },
      { id: 'natural/animal-wolf', speciesId: 'animal-wolf', signoff: '' },
      { id: 'natural/animal-mole', speciesId: 'animal-mole' },
      { id: 'natural/animal-newt', speciesId: 'animal-newt', signoff: 'reject' },
      { id: 'natural/animal-badger', speciesId: 'animal-badger', signoff: 'ok' },
      { id: 'natural/animal-badger', speciesId: 'animal-badger', signoff: 'ok' },
      { id: 'natural/', speciesId: '', signoff: 'ok' },
    ],
  }

  it('takes only the ticked rows, sorted and unique', () => {
    expect(signedOffFrom(fixture)).toEqual(['animal-badger', 'animal-tarsier'])
  })

  it('treats absent, empty and rejected the same as not signed off', () => {
    const one = (row: Record<string, unknown>): string[] =>
      signedOffFrom({ names: [{ speciesId: 'animal-mole', ...row }] })
    expect(one({ signoff: 'ok' })).toEqual(['animal-mole'])
    expect(one({ signoff: '' })).toEqual([])
    expect(one({ signoff: 'reject' })).toEqual([])
    expect(one({ signoff: 'OK' })).toEqual([])
    expect(one({})).toEqual([])
  })

  it('survives a file with nothing in it', () => {
    expect(signedOffFrom({})).toEqual([])
    expect(signedOffFrom({ names: [] })).toEqual([])
    expect(signedOffFrom({ schemaVersion: 1, names: [null, 'nonsense'] })).toEqual([])
  })

  it('never uses the row id, which is a name id and not a species id', () => {
    /* `natural/animal-mole` is the id of a NAME. Keying on it would put a
     * prefix into the list and no registry lookup would ever match it. */
    expect(signedOffFrom(fixture).some(id => id.includes('/'))).toBe(false)
  })
})

/**
 * The half of the standing order that is a behaviour rather than a file.
 *
 * "A newly signed-off animal joins the pool with no further ceremony" means the
 * tick ALONE has to move the mirror. If the regeneration were only ever run by
 * hand, the ceremony he ruled out would have quietly come back as a step someone
 * has to remember. So this drives the real save endpoint against a throwaway
 * root and looks at what appeared on disk — no mock, no spy.
 */
describe('a tick alone regenerates the mirror', () => {
  const row = (speciesId: string) => ({
    id: `natural/${speciesId}`, setId: 'natural', speciesId, species: speciesId,
    collection: 'night-time', band: 'medium', name: 'Hooteb',
    verdict: '', replacement: '', note: '',
  })

  /** A root of Joe's files with nothing generated in it yet. */
  function bench() {
    const root = mkdtempSync(join(tmpdir(), 'signed-off-'))
    mkdirSync(join(root, 'joe'), { recursive: true })
    writeFileSync(
      join(root, 'joe/names-audit.json'),
      JSON.stringify({ schemaVersion: 1, names: [row('animal-tarsier'), row('animal-wolf')] }, null, 2) + '\n',
    )
    const api = createApi(root)
    const save = (body: unknown): Promise<Record<string, unknown>> => new Promise(ok => {
      const req = {
        url: '/api/save', method: 'POST',
        on(ev: string, fn: (chunk?: string) => void) {
          if (ev === 'data') fn(JSON.stringify(body))
          if (ev === 'end') fn()
        },
      }
      const res = { writeHead() {}, end: (text: string) => ok(JSON.parse(text)) }
      /* The handler reads `url`, `method` and the body events, and writes a head
       * and a body — nothing else of a node request or response. Spawning a real
       * server to supply the other seventy properties would test node's http
       * stack, not this. `workbench.test.ts` does own the spawned-server case. */
      void (api as unknown as (
        req: unknown, res: unknown, next: () => void,
      ) => Promise<void>)(req, res, () => ok({ error: 'unhandled' }))
    })
    const mirror = join(root, MIRROR)
    return { root, save, mirror, read: () => JSON.parse(readFileSync(mirror, 'utf8')).species }
  }

  it('adds the animal when Joe ticks it, and takes it back when he un-ticks', async () => {
    const b = bench()
    expect(existsSync(b.mirror), 'nothing generated before the first save').toBe(false)

    expect(await b.save({ what: 'names', patch: { id: 'natural/animal-tarsier', signoff: SIGNED_OFF } }))
      .toMatchObject({ saved: AUDIT })
    expect(b.read(), 'his tick alone must be enough — no second step').toEqual(['animal-tarsier'])

    await b.save({ what: 'names', patch: { id: 'natural/animal-wolf', signoff: SIGNED_OFF } })
    expect(b.read()).toEqual(['animal-tarsier', 'animal-wolf'])

    /* Withdrawing approval is the same one act in reverse. An animal he has
     * taken back must stop shipping just as immediately. */
    await b.save({ what: 'names', patch: { id: 'natural/animal-tarsier', signoff: '' } })
    expect(b.read()).toEqual(['animal-wolf'])
  })

  it('writes inside its own root and never the committed mirror', async () => {
    const before = read(MIRROR)
    const b = bench()
    await b.save({ what: 'names', patch: { id: 'natural/animal-wolf', signoff: SIGNED_OFF } })
    expect(b.mirror.startsWith(b.root)).toBe(true)
    expect(read(MIRROR), 'a test must never rewrite the checked-in mirror').toBe(before)
  })

  it('leaves the other writable files alone', async () => {
    const b = bench()
    expect(await b.save({ what: 'backlog', value: { cards: [], nextId: 1 } }))
      .toMatchObject({ saved: 'joe/backlog.json' })
    expect(existsSync(b.mirror), 'only a names save touches the mirror').toBe(false)
  })
})

describe('the committed file', () => {
  it('parses, and carries the envelope', () => {
    expect(mirrorFile.schemaVersion).toBe(SCHEMA_VERSION)
    expect(Array.isArray(mirrorFile.species)).toBe(true)
  })

  it('has LF endings and a trailing newline', () => {
    expect(mirrorRaw.includes('\r'), `${MIRROR} contains a carriage return`).toBe(false)
    expect(mirrorRaw.endsWith('\n')).toBe(true)
  })

  it('is what the module exports', () => {
    expect([...SIGNED_OFF_SPECIES]).toEqual(mirrorFile.species)
  })
})
