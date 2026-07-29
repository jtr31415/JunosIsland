/**
 * The names have to be FROZEN, so this file is where they freeze.
 *
 * Roster §3 asks for a given name seeded deterministically from the creature,
 * "so every child's hedgehog is the same Bimo, forever". Forever is a testable
 * claim and this is the test of it: the expected names are pinned here as
 * string literals, so any future edit to the hash, to the redraw loop, to the
 * band table, or to `src/core/names.ts` breaks this file loudly rather than
 * quietly renaming every creature in the game — which brief §19 forbids.
 *
 * JT-029 (Joe, 29 July): *"we drop the colours, only the sets in their natural
 * color... lets just focus on the existing collections and their name."* A
 * given name is therefore keyed on SPECIES ALONE. This file used to assert the
 * opposite — that a species is called something different in every set — and
 * those assertions are now inverted, not deleted: the property worth testing is
 * that there is exactly ONE name per species and no way to ask for a per-set
 * variant. The hashed key kept its `natural/` prefix, so not one of the pinned
 * literals below moved. See 'renamed nobody', which is the evidence.
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
  givenName, nameSeed, nameBandOf, NAME_PINS, NATURAL_SET, _resolve,
} from '../../src/island/species/naming'
import {
  collection, collectionOf, COLLECTIONS, SPECIES_NAMES,
} from '../../src/island/species/roster'
import { NAME_BANDS } from '../../src/island/species/types'
import { SHIPPED_SPECIES } from '../../src/island/species/registry'
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
 * Every species the roster knows, which after JT-029 is the WHOLE naming axis.
 *
 * It used to be this list times `SETS` — 8,000 names, every one of them Joe's
 * to audit by hand. That factor of twenty-five is what the ruling removed, and
 * the tests below walk this axis instead so they measure the real surface.
 */
const ALL_SPECIES: readonly string[] = COLLECTIONS.flatMap((c) => c.members)

/**
 * The Garden collection, in roster member order.
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

/** FNV-1a, rebuilt here so the key shape is asserted and not merely trusted. */
function fnv1a(key: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}

describe('nameSeed', () => {
  it('is pure and stable for a species', () => {
    expect(nameSeed('animal-hedgehog')).toBe(nameSeed('animal-hedgehog'))
  })

  it('hashes `natural/${speciesId}` — the same shape as variantKey', () => {
    // Not an implementation detail: sets.ts:168 and collection.ts:43-50 both
    // spell a creature this way, and there must be exactly one spelling. It is
    // also why JT-029 renamed nobody — dropping the set from the SIGNATURE did
    // not drop the prefix from the hashed KEY.
    expect(NATURAL_SET).toBe('natural')
    for (const s of GARDEN.members) {
      expect(nameSeed(s), s).toBe(fnv1a(`natural/${s}`))
    }
    expect(nameSeed('animal-mouse')).not.toBe(fnv1a('animal-mouse'))
  })

  it('is a 32-bit unsigned integer', () => {
    for (const s of ALL_SPECIES) {
      const h = nameSeed(s)
      expect(Number.isInteger(h)).toBe(true)
      expect(h).toBeGreaterThanOrEqual(0)
      expect(h).toBeLessThanOrEqual(0xffffffff)
    }
  })
})

describe('givenName is frozen forever', () => {
  it('returns the same string on repeated calls', () => {
    for (const [id] of GARDEN_NATURAL) {
      const a = givenName(id)
      expect(givenName(id)).toBe(a)
      expect(givenName(id)).toBe(a)
    }
  })

  it('returns the same string for two independently computed seeds', () => {
    // Rebuild the draw from scratch, sharing nothing with the module's state.
    for (const [id, expected] of GARDEN_NATURAL) {
      const rng = mulberry32(nameSeed(id))
      const band = NAME_BANDS[nameBandOf(id)]
      let w = petName(rng)
      while (w.length < band.min || w.length > band.max) w = petName(rng)
      expect(w).toBe(expected)
    }
  })

  /** THE assertion. If this goes red, revert the generator — do not re-pin. */
  it('gives the Garden collection exactly these names', () => {
    for (const [id, expected] of GARDEN_NATURAL) {
      expect(givenName(id)).toBe(expected)
    }
  })

  /**
   * JT-029 COST NO CHILD A FRIEND.
   *
   * Keying on species alone could have been a rename of every creature in the
   * game, which is exactly what brief §19 forbids. It was not, because the
   * hashed key kept its shape: `givenName(species)` still seeds off the literal
   * string `natural/${speciesId}` that `givenName(species, 'natural')` seeded
   * off before the ruling. This test rebuilds each name the OLD way — a set id
   * spelled out by hand, glued on in front — and gets the same fourteen names.
   *
   * If this one ever goes red while 'gives the Garden collection exactly these
   * names' stays green, someone has changed the key shape and the audit batch
   * in `joe/names-audit.json` no longer describes the creatures it names.
   */
  it('renamed nobody: the pre-JT-029 two-part key draws the same fourteen', () => {
    const legacySetId = 'natural'
    for (const [id, expected] of GARDEN_NATURAL) {
      const rng = mulberry32(fnv1a(`${legacySetId}/${id}`))
      const band = NAME_BANDS[nameBandOf(id)]
      let w = petName(rng)
      while (w.length < band.min || w.length > band.max) w = petName(rng)
      expect(w, id).toBe(expected)
      expect(givenName(id), id).toBe(w)
    }
  })

  it('gives these names in other collections', () => {
    expect(givenName('animal-fox')).toBe('Zapvo')
    expect(givenName('animal-mammoth')).toBe('Ligchoo')
  })
})

describe('one name per species — JT-029', () => {
  /*
   * THIS TEST IS AN INVERSION, deliberately.
   *
   * It used to read "gives a species a different name in a different set" and
   * assert that a hedgehog is called twenty-five different things. Joe ruled
   * the colours out on 29 July, so the property is now the opposite one: a
   * species has ONE name, and the module exposes no way to ask for another.
   * The arity checks are the load-bearing half — an optional second argument
   * would be an invitation to pass a real set id and quietly recreate the
   * 8,000 names the ruling removed.
   */
  it('takes no set argument, so a per-set name cannot be asked for', () => {
    expect(givenName.length).toBe(1)
    expect(nameSeed.length).toBe(1)
    expect(_resolve.length).toBe(2)

    // Force one past the type system, as stale phase-1 calling code would.
    const sneak = givenName as unknown as (s: string, setId: string) => string
    const one = givenName('animal-hedgehog')
    for (const set of SETS) {
      expect(sneak('animal-hedgehog', set.id), set.id).toBe(one)
    }
  })

  it('gives different species different names', () => {
    const seen = new Set(GARDEN.members.map(s => givenName(s)))
    expect(seen.size).toBe(GARDEN.members.length)
  })

  it('collides rarely across the whole roster', () => {
    // 320 names, not the 8,000 that species x sets implied — that is JT-029's
    // headline number and the reason it was raised. A collision is POSSIBLE —
    // 320 draws out of ~647,000 names — and would not be a bug, only two
    // creatures sharing a name. Today there is exactly one. It must stay rare.
    expect(ALL_SPECIES).toHaveLength(320)
    const names = ALL_SPECIES.map(s => givenName(s))
    expect(names).toHaveLength(ALL_SPECIES.length)
    for (const n of names) expect(n.length).toBeGreaterThan(0)
    const distinct = new Set(names).size
    expect(names.length - distinct).toBeLessThanOrEqual(3)
  })
})

describe('band obedience', () => {
  it('keeps every Garden name inside NAME_BANDS.short', () => {
    expect(GARDEN.band).toBe('short')
    const band = NAME_BANDS.short
    for (const s of GARDEN.members) {
      const n = givenName(s)
      expect(n.length, `${s} = ${n}`).toBeGreaterThanOrEqual(band.min)
      expect(n.length, `${s} = ${n}`).toBeLessThanOrEqual(band.max)
    }
  })

  it('keeps a long-band collection inside NAME_BANDS.long', () => {
    expect(PREHISTORIC.band).toBe('long')
    const band = NAME_BANDS.long
    for (const s of PREHISTORIC.members) {
      const n = givenName(s)
      expect(n.length, `${s} = ${n}`).toBeGreaterThanOrEqual(band.min)
      expect(n.length, `${s} = ${n}`).toBeLessThanOrEqual(band.max)
    }
  })

  it('keeps every species in the roster inside its own collection band', () => {
    for (const s of ALL_SPECIES) {
      const band = NAME_BANDS[nameBandOf(s)]
      const n = givenName(s)
      expect(n.length, `${s} = ${n}`).toBeGreaterThanOrEqual(band.min)
      expect(n.length, `${s} = ${n}`).toBeLessThanOrEqual(band.max)
    }
  })

  it('falls back to medium for a species the roster has never heard of', () => {
    // A save from a future build must never leave a blank where her friend's
    // name goes — script.ts:132 speciesName() sets that precedent.
    expect(collectionOf('animal-not-a-real-species')).toBeUndefined()
    expect(nameBandOf('animal-not-a-real-species')).toBe('medium')
    const n = givenName('animal-not-a-real-species')
    expect(n.length).toBeGreaterThanOrEqual(NAME_BANDS.medium.min)
    expect(n.length).toBeLessThanOrEqual(NAME_BANDS.medium.max)
  })
})

describe('the safety screen still applies', () => {
  it('produces no name rejected by src/core/names.ts', () => {
    // Every name in the game. `_rejected` is the real screen: length,
    // REAL_BLOCK, ~90 forbidden substrings, triple letters, trailing bare 'e'.
    // Filtering by band in this layer must not smuggle anything past it.
    for (const s of ALL_SPECIES) {
      const n = givenName(s)
      expect(_rejected(n.toLowerCase()), `${s} = ${n}`).toBe(false)
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
    expect(_resolve(pins, 'animal-hedgehog')).toBe('Prickle')
    // ...and only for that species.
    expect(_resolve(pins, 'animal-squirrel')).toBe(givenName('animal-squirrel'))
  })

  it('is keyed `natural/${speciesId}`, the same string the seed hashes', () => {
    // The pin table's keys did not move under JT-029 either, so a pin written
    // against the old scheme still lands on the creature it was written for.
    expect(_resolve({ [`${NATURAL_SET}/animal-mole`]: 'Digger' }, 'animal-mole'))
      .toBe('Digger')
    expect(_resolve({ 'animal-mole': 'Digger' }, 'animal-mole'))
      .toBe(givenName('animal-mole'))
  })

  it('wins even when it breaks the band', () => {
    // A pin is a name a child already says out loud. No length rule outranks
    // that, so the band is not consulted at all on the pinned path.
    const pins = { 'natural/animal-frog': 'Bo' }
    expect(_resolve(pins, 'animal-frog')).toBe('Bo')
    expect('Bo'.length).toBeLessThan(NAME_BANDS.short.min)
  })

  it('leaves givenName equal to the unpinned resolve today', () => {
    expect(givenName('animal-frog')).toBe(_resolve({}, 'animal-frog'))
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

  it('covers exactly the species that have actually been BUILT', () => {
    // Was "the Garden batch" through phase 1, when Garden was the only
    // collection with names generated. PB-036 phase 2 shipped four collections
    // and JT-029 collapsed the surface from species×set to species alone, so
    // the bench now carries all fifty built creatures.
    //
    // The invariant that matters is the one asserted here: the bench covers the
    // BUILT species and only those. A row for a species with no kit would ask
    // Joe to audit and voice-bake a name for a creature that cannot yet exist —
    // and `animal-slow-worm` was exactly that, so it came out when the fifty
    // went in. When a new kit lands and its species are built, they must be
    // added here in the same pass, and this test is what says so.
    expect(audit.schemaVersion).toBe(1)
    const built = SHIPPED_SPECIES.filter(s => s.build !== undefined).map(s => s.id)
    expect([...audit.names.map(e => e.speciesId)].sort()).toEqual([...built].sort())
    expect(audit.names).toHaveLength(50)
  })

  it('gives every creature its own name, so the playground question works', () => {
    // Roster §3: the given name is "playground currency" — "have you got
    // Bimo?" has to identify ONE creature. A collision does not break the
    // build, so nothing here throws; it is surfaced for Joe to settle with a
    // `replacement`, which is precisely what the bench is for.
    //
    // TODAY THERE IS ONE: `Gichesh` is drawn for both the warthog (africa) and
    // the otter (woodland). Flagged in the PB-036 handoff for his review hour.
    // When he sets a replacement this count drops and the expectation tightens.
    const byName = new Map<string, string[]>()
    for (const e of audit.names) {
      const chosen = e.replacement || e.name
      byName.set(chosen, [...(byName.get(chosen) ?? []), e.speciesId])
    }
    const clashes = [...byName.entries()].filter(([, ids]) => ids.length > 1)
    expect(clashes.length, `name collisions: ${JSON.stringify(clashes)}`)
      .toBeLessThanOrEqual(1)
  })

  it('cannot drift from the generator', () => {
    // The rows still carry `setId: "natural"` and ids like
    // `natural/animal-hedgehog`, and they are still correct: that string is the
    // key `nameSeed` hashes, ruling or no ruling. Only the CALL lost an
    // argument.
    for (const e of audit.names) {
      expect(e.name, e.id).toBe(givenName(e.speciesId))
      expect(e.setId).toBe(NATURAL_SET)
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
 * regenerates a stored name — it only answers questions about a species.
 *
 * The test hatches a pet under the OLD, pre-naming.ts scheme (a random draw)
 * and round-trips it through the real save. Both fields must come back
 * byte-identical with `naming.ts` imported and in play.
 */
describe('brief §19: a pet already in a save is untouched', () => {
  it('round-trips an old-scheme pet with its name AND id intact', () => {
    const legacyName = petName(mulberry32(1))
    // Under the new scheme this species would be called something else.
    expect(legacyName).not.toBe(givenName('animal-hedgehog'))

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
    expect(givenName('animal-hedgehog')).not.toBe('Bimo')
  })
})
