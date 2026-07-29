/**
 * The names have to be FROZEN, so this file is where they freeze.
 *
 * Roster §3 asks for a given name "seeded deterministically from `species +
 * set`, so every child's blue-set hedgehog is the same Bimo, forever". Forever
 * is a testable claim and this is the test of it: the expected names are pinned
 * here as string literals, so any future edit to the hash, to the redraw loop,
 * to the band table, or to `src/core/names.ts` breaks this file loudly rather
 * than quietly renaming every creature in the game — which brief §19 forbids.
 *
 * If you are reading this because these assertions went red: do NOT update the
 * literals. Revert whatever changed the generator. The literals are the
 * product; the code is just how they are produced.
 */
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  givenName, nameSeed, nameBandOf, NAME_PINS, _resolve,
} from '../../src/island/species/naming'
import {
  collection, collectionOf, SPECIES_NAMES,
} from '../../src/island/species/roster'
import { NAME_BANDS } from '../../src/island/species/types'
import { SETS } from '../../src/island/variants/sets'
import { petName, _rejected } from '../../src/core/names'
import { mulberry32 } from '../../src/core/rng'
import { createFlow, challengePassed } from '../../src/island/flow'
import type { Pet } from '../../src/island/flow'
import { toSave, fromSave } from '../../src/island/save'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const GARDEN = collection('garden')!
const PREHISTORIC = collection('prehistoric')!

/**
 * The Garden collection on the `natural` set, in roster member order.
 *
 * These fourteen are the batch in `joe/names-audit.json`, which is the surface
 * Joe reviews. They are pinned here as literals so the audit and the generator
 * can never drift apart in silence.
 */
const GARDEN_NATURAL: readonly [string, string][] = [
  ['animal-hedgehog', 'Nachet'],
  ['animal-squirrel', 'Chobad'],
  ['animal-mouse', 'Sallda'],
  ['animal-mole', 'Dormup'],
  ['animal-badger', 'Sandu'],
  ['animal-frog', 'Daweb'],
  ['animal-toad', 'Fiwoff'],
  ['animal-tortoise', 'Tupzu'],
  ['animal-newt', 'Watash'],
  ['animal-shrew', 'Dithit'],
  ['animal-dormouse', 'Zihuth'],
  ['animal-vole', 'Nawuck'],
  ['animal-slow-worm', 'Nunem'],
  ['animal-salamander', 'Loonpo'],
]

describe('nameSeed', () => {
  it('is pure and stable for a key', () => {
    expect(nameSeed('animal-hedgehog', 'natural'))
      .toBe(nameSeed('animal-hedgehog', 'natural'))
  })

  it('hashes `${setId}/${speciesId}` — the same shape as variantKey', () => {
    // Not an implementation detail: sets.ts:168 and collection.ts:43-50 both
    // spell a creature this way, and there must be exactly one spelling.
    expect(nameSeed('animal-mouse', 'cherry')).not.toBe(nameSeed('animal-cherry', 'mouse'))
  })

  it('is a 32-bit unsigned integer', () => {
    for (const set of SETS) {
      for (const s of GARDEN.members) {
        const h = nameSeed(s, set.id)
        expect(Number.isInteger(h)).toBe(true)
        expect(h).toBeGreaterThanOrEqual(0)
        expect(h).toBeLessThanOrEqual(0xffffffff)
      }
    }
  })
})

describe('givenName is frozen forever', () => {
  it('returns the same string on repeated calls', () => {
    for (const [id] of GARDEN_NATURAL) {
      const a = givenName(id, 'natural')
      expect(givenName(id, 'natural')).toBe(a)
      expect(givenName(id, 'natural')).toBe(a)
    }
  })

  it('returns the same string for two independently computed seeds', () => {
    // Rebuild the draw from scratch, sharing nothing with the module's state.
    for (const [id, expected] of GARDEN_NATURAL) {
      const rng = mulberry32(nameSeed(id, 'natural'))
      const band = NAME_BANDS[nameBandOf(id)]
      let w = petName(rng)
      while (w.length < band.min || w.length > band.max) w = petName(rng)
      expect(w).toBe(expected)
    }
  })

  /** THE assertion. If this goes red, revert the generator — do not re-pin. */
  it('gives the Garden collection exactly these names on the natural set', () => {
    for (const [id, expected] of GARDEN_NATURAL) {
      expect(givenName(id, 'natural')).toBe(expected)
    }
  })

  it('gives these names on other sets, and on other collections', () => {
    expect(givenName('animal-hedgehog', 'bluebell')).toBe('Fowot')
    expect(givenName('animal-hedgehog', 'cherry')).toBe('Tidta')
    expect(givenName('animal-fox', 'natural')).toBe('Zapvo')
    expect(givenName('animal-mammoth', 'natural')).toBe('Ligchoo')
  })
})

describe('one name per creature, not per species', () => {
  it('gives a species a different name in a different set', () => {
    const seen = new Set(SETS.map(s => givenName('animal-hedgehog', s.id)))
    // Roster §3's whole point: the blue hedgehog is not the red hedgehog.
    expect(seen.size).toBeGreaterThanOrEqual(SETS.length - 1)
  })

  it('gives different species different names within a set', () => {
    const seen = new Set(GARDEN.members.map(s => givenName(s, 'natural')))
    expect(seen.size).toBe(GARDEN.members.length)
  })

  it('collides rarely across all 25 sets x 14 Garden species', () => {
    // A collision is POSSIBLE — 350 draws out of ~647,000 names — and would not
    // be a bug, only two creatures sharing a name. It must stay rare.
    const names = SETS.flatMap(set => GARDEN.members.map(s => givenName(s, set.id)))
    expect(names).toHaveLength(350)
    const distinct = new Set(names).size
    expect(names.length - distinct).toBeLessThanOrEqual(3)
  })
})

describe('band obedience', () => {
  it('keeps every Garden name inside NAME_BANDS.short', () => {
    expect(GARDEN.band).toBe('short')
    const band = NAME_BANDS.short
    for (const set of SETS) {
      for (const s of GARDEN.members) {
        const n = givenName(s, set.id)
        expect(n.length, `${set.id}/${s} = ${n}`).toBeGreaterThanOrEqual(band.min)
        expect(n.length, `${set.id}/${s} = ${n}`).toBeLessThanOrEqual(band.max)
      }
    }
  })

  it('keeps a long-band collection inside NAME_BANDS.long', () => {
    expect(PREHISTORIC.band).toBe('long')
    const band = NAME_BANDS.long
    for (const set of SETS) {
      for (const s of PREHISTORIC.members) {
        const n = givenName(s, set.id)
        expect(n.length, `${set.id}/${s} = ${n}`).toBeGreaterThanOrEqual(band.min)
        expect(n.length, `${set.id}/${s} = ${n}`).toBeLessThanOrEqual(band.max)
      }
    }
  })

  it('falls back to medium for a species the roster has never heard of', () => {
    // A save from a future build must never leave a blank where her friend's
    // name goes — script.ts:132 speciesName() sets that precedent.
    expect(collectionOf('animal-not-a-real-species')).toBeUndefined()
    expect(nameBandOf('animal-not-a-real-species')).toBe('medium')
    const n = givenName('animal-not-a-real-species', 'natural')
    expect(n.length).toBeGreaterThanOrEqual(NAME_BANDS.medium.min)
    expect(n.length).toBeLessThanOrEqual(NAME_BANDS.medium.max)
  })
})

describe('the safety screen still applies', () => {
  it('produces no name rejected by src/core/names.ts', () => {
    // 350 names. `_rejected` is the real screen: length, REAL_BLOCK, ~90
    // forbidden substrings, triple letters, trailing bare 'e'. Filtering by
    // band in this layer must not smuggle anything past it.
    for (const set of SETS) {
      for (const s of GARDEN.members) {
        const n = givenName(s, set.id)
        expect(_rejected(n.toLowerCase()), `${set.id}/${s} = ${n}`).toBe(false)
      }
    }
  })

  it('capitalises exactly one leading letter', () => {
    for (const [, n] of GARDEN_NATURAL) {
      expect(n).toMatch(/^[A-Z][a-z]+$/)
    }
  })
})

describe('pins', () => {
  it('wins outright over the generated draw', () => {
    const pins = { 'natural/animal-hedgehog': 'Prickle' }
    expect(_resolve(pins, 'animal-hedgehog', 'natural')).toBe('Prickle')
    // ...and only for that exact creature.
    expect(_resolve(pins, 'animal-hedgehog', 'cherry')).toBe(givenName('animal-hedgehog', 'cherry'))
  })

  it('wins even when it breaks the band', () => {
    // A pin is a name a child already says out loud. No length rule outranks
    // that, so the band is not consulted at all on the pinned path.
    const pins = { 'natural/animal-frog': 'Bo' }
    expect(_resolve(pins, 'animal-frog', 'natural')).toBe('Bo')
    expect('Bo'.length).toBeLessThan(NAME_BANDS.short.min)
  })

  it('leaves givenName equal to the unpinned resolve today', () => {
    expect(givenName('animal-frog', 'natural')).toBe(_resolve({}, 'animal-frog', 'natural'))
  })

  /*
   * A DELIBERATE TRIPWIRE, not a bug.
   *
   * `name-pins.json` is empty on purpose. Joe, 29 July: *"i will give you
   * juno's already achieved animal's names as her latest save game later, you
   * can swap the first hard code out after."* Until that save arrives, nothing
   * may be guessed into the table — an invented pin invents a memory Juno does
   * not have.
   *
   * The day her save lands, this assertion is expected to be DELETED or
   * inverted (assert the pins that arrived, by name). Whoever does that: that
   * edit, plus the JSON, is the WHOLE change. No migration, no save rewrite.
   */
  it('is EMPTY until Juno\'s save arrives', () => {
    expect(Object.keys(NAME_PINS)).toHaveLength(0)
    const raw = JSON.parse(readFileSync(
      resolve(root, 'src/island/species/name-pins.json'), 'utf8')) as
      { schemaVersion: number; pins: Record<string, string> }
    expect(raw.schemaVersion).toBe(1)
    expect(Object.keys(raw.pins)).toHaveLength(0)
  })
})

describe('joe/names-audit.json', () => {
  interface AuditEntry {
    id: string; setId: string; speciesId: string; species: string
    collection: string; band: string; name: string
    verdict: string; replacement: string; note: string
  }
  const audit = JSON.parse(readFileSync(
    resolve(root, 'joe/names-audit.json'), 'utf8')) as
    { schemaVersion: number; names: AuditEntry[] }

  it('is the Garden x natural batch, in roster member order', () => {
    expect(audit.schemaVersion).toBe(1)
    expect(audit.names.map(e => e.speciesId)).toEqual([...GARDEN.members])
  })

  it('cannot drift from the generator', () => {
    for (const e of audit.names) {
      expect(e.name, e.id).toBe(givenName(e.speciesId, e.setId))
      expect(e.id).toBe(`${e.setId}/${e.speciesId}`)
      expect(e.species).toBe(SPECIES_NAMES[e.speciesId])
      expect(e.collection).toBe(collectionOf(e.speciesId)?.id)
      expect(e.band).toBe(collectionOf(e.speciesId)?.band)
    }
  })

  it('starts unreviewed, with Joe\'s three fields his own', () => {
    for (const e of audit.names) {
      expect(['', 'ok', 'reject']).toContain(e.verdict)
      expect(typeof e.replacement).toBe('string')
      expect(typeof e.note).toBe('string')
    }
  })
})

/*
 * BRIEF §19 — a child's friend may never be lost.
 *
 * `Pet.id` EMBEDS the name (`flow.ts:327`: `` `pet${n}-${hatch.name}` ``), so a
 * module that "corrected" a stored name would silently break the id that
 * addresses the pet as well. Which is why `naming.ts` never reads, rewrites or
 * regenerates a stored name — it only answers questions about `species + set`.
 *
 * The test hatches a pet under the OLD, pre-naming.ts scheme (a random draw)
 * and round-trips it through the real save. Both fields must come back
 * byte-identical with `naming.ts` imported and in play.
 */
describe('brief §19: a pet already in a save is untouched', () => {
  it('round-trips an old-scheme pet with its name AND id intact', () => {
    const legacyName = petName(mulberry32(1))
    // Under the new scheme this species+set would be called something else.
    expect(legacyName).not.toBe(givenName('animal-hedgehog', 'natural'))

    const f = { ...createFlow(), phase: 'challenge' as const, challenge: 'read' as const, readProgress: 999 }
    const hatched = challengePassed(f, { name: legacyName, species: 'animal-hedgehog' })
    expect(hatched.pets).toHaveLength(1)
    const before = hatched.pets[0] as Pet
    expect(before.name).toBe(legacyName)
    expect(before.id).toBe(`pet1-${legacyName}`)

    // Through JSON, exactly as the store writes and reads it.
    const after = fromSave(JSON.parse(JSON.stringify(toSave(hatched, true, 'Juno')))).flow
    expect(after.pets).toHaveLength(1)
    const back = after.pets[0] as Pet
    expect(back.name).toBe(legacyName)
    expect(back.id).toBe(before.id)
    expect(back.species).toBe(before.species)
    expect(back).toEqual(before)
  })

  it('never renames a pet whose stored name disagrees with the generator', () => {
    // The whole surface area: naming.ts exports three functions, all of which
    // take ids and return strings. There is no code path from a stored Pet to
    // a regenerated name, and this asserts the absence stays absent.
    const pet: Pet = { id: 'pet1-Bimo', name: 'Bimo', species: 'animal-hedgehog', at: { q: 0, r: 0 } }
    const f = { ...createFlow(), pets: [pet] }
    const back = fromSave(JSON.parse(JSON.stringify(toSave(f, true)))).flow
    expect(back.pets[0]).toEqual(pet)
    expect(givenName('animal-hedgehog', 'natural')).not.toBe('Bimo')
  })
})
