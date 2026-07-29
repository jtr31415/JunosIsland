/**
 * The roster is a TRANSCRIPTION, so this file is a proofreader.
 *
 * `src/island/species/roster.ts` is 320 species typed out by hand from
 * `docs/pet-island-species-roster.md` §2. Hand-typed data fails in ways code
 * does not: a row loses a member and still parses, an id gains a capital and
 * still compiles, a species appears in two collections and the album quietly
 * deals it twice. None of that shows up at runtime until a child is looking at
 * it. So every claim the brief makes about its own table is asserted here
 * against the data, including the claims it makes in passing.
 *
 * The one test that is not proofreading is the base-24 name guard. Brief §19
 * forbids renaming a live animal, because the name is on a pet a child already
 * has. `SPECIES_NAMES` now duplicates `SPECIES_NAME` from `script.ts`, and two
 * copies of a truth is exactly how a rename happens by accident — so the copies
 * are compared key by key, and drift is a failing build rather than a surprise.
 */
import { describe, it, expect } from 'vitest'
import {
  COLLECTIONS,
  SPECIES_NAMES,
  SPECIES_COLLECTION,
  collectionOf,
  collection,
} from '../../src/island/species/roster'
import { SPECIES } from '../../src/island/pets'
import { SPECIES_NAME } from '../../src/island/script'

/** The brief's own `n` column, row for row. Typed from the table, not derived. */
const BRIEF_COUNTS: Readonly<Record<string, number>> = {
  base: 24,
  garden: 14,
  birds: 18,
  ocean: 16,
  africa: 16,
  critters: 16,
  'night-time': 16,
  'home-pets': 16,
  ice: 16,
  woodland: 16,
  outback: 16,
  jungle: 16,
  farm: 16,
  raptors: 16,
  dinosaurs: 16,
  prehistoric: 12,
  legendary: 12,
  'near-threatened': 12,
  vulnerable: 12,
  endangered: 12,
  'critically-endangered': 12,
}

/** The four Red List tiers, which §1 says the flagship base seven stay out of. */
const CONSERVATION = ['near-threatened', 'vulnerable', 'endangered', 'critically-endangered']

const allMembers = () => COLLECTIONS.flatMap((c) => c.members)

describe('the roster matches the brief it was transcribed from', () => {
  it('has the base set plus the brief\'s twenty collections, and no others', () => {
    expect(COLLECTIONS.map((c) => c.id)).toEqual([
      'base', 'garden', 'birds', 'ocean', 'africa', 'critters', 'night-time',
      'home-pets', 'ice', 'woodland', 'outback', 'jungle', 'farm', 'raptors',
      'dinosaurs', 'prehistoric', 'legendary', 'near-threatened', 'vulnerable',
      'endangered', 'critically-endangered',
    ])
  })

  it('lists exactly as many members per collection as the brief\'s n column claims', () => {
    const counted: Record<string, number> = {}
    for (const c of COLLECTIONS) counted[c.id] = c.members.length
    expect(counted).toEqual(BRIEF_COUNTS)
  })

  it('adds up to the brief\'s 296 new species, 320 with the live pack', () => {
    const base = COLLECTIONS.find((c) => c.id === 'base')!
    expect(allMembers().length - base.members.length).toBe(296)
    expect(allMembers().length).toBe(320)
  })

  it('gives every collection a printed name the album can use', () => {
    for (const c of COLLECTIONS) expect(c.name.length).toBeGreaterThan(0)
    expect(collection('night-time')!.name).toBe('Night Time')
    expect(collection('critically-endangered')!.name).toBe('Critically Endangered')
    expect(collection('base')!.name).toBe('Base Set')
  })
})

describe('no species appears twice anywhere — the brief claims it, so prove it', () => {
  it('never repeats an id inside a single collection', () => {
    for (const c of COLLECTIONS) {
      const dupes = c.members.filter((id, i) => c.members.indexOf(id) !== i)
      expect(dupes, `${c.id} repeats itself`).toEqual([])
    }
  })

  it('never puts the same id in two collections', () => {
    const seen = new Map<string, string>()
    const clashes: string[] = []
    for (const c of COLLECTIONS) {
      for (const id of c.members) {
        const first = seen.get(id)
        if (first !== undefined) clashes.push(`${id}: ${first} and ${c.id}`)
        else seen.set(id, c.id)
      }
    }
    expect(clashes).toEqual([])
    expect(seen.size).toBe(320)
  })
})

describe('ids are safe to write into a file path and a save', () => {
  it('spells every id as lowercase ASCII with single hyphens — no accents, no apostrophes', () => {
    const shape = /^animal-[a-z0-9]+(-[a-z0-9]+)*$/
    const bad = allMembers().filter((id) => !shape.test(id))
    expect(bad).toEqual([])
  })

  it('folds the accent out of the id and keeps it in the printed name', () => {
    expect(SPECIES_NAMES['animal-galapagos-penguin']).toBe('Galápagos Penguin')
  })

  it('deletes the apostrophe rather than hyphenating around it', () => {
    expect(SPECIES_NAMES['animal-spixs-macaw']).toBe("Spix's Macaw")
  })
})

describe('every species has a name, and every name has a species', () => {
  it('names every id that appears in a collection', () => {
    const nameless = allMembers().filter((id) => SPECIES_NAMES[id] === undefined)
    expect(nameless).toEqual([])
  })

  it('names nothing that is not in a collection', () => {
    const members = new Set(allMembers())
    const orphans = Object.keys(SPECIES_NAMES).filter((id) => !members.has(id))
    expect(orphans).toEqual([])
  })

  it('prints every name in UK Title Case, never a bare slug', () => {
    for (const [id, name] of Object.entries(SPECIES_NAMES)) {
      expect(name, id).not.toContain('-animal')
      expect(name.charAt(0), id).toBe(name.charAt(0).toUpperCase())
    }
  })
})

describe('the live 24 are frozen — brief §19', () => {
  it('carries the base collection as SPECIES itself, in order', () => {
    expect(collection('base')!.members).toEqual([...SPECIES])
  })

  it('renames not one live animal: every base name still matches script.ts', () => {
    for (const id of SPECIES) {
      expect(SPECIES_NAMES[id], `${id} drifted from SPECIES_NAME`).toBe(SPECIES_NAME[id])
    }
  })

  it('keeps the three that script.ts argued about: Wild Boar, Polar Bear, Bunny', () => {
    expect(SPECIES_NAMES['animal-hog']).toBe('Wild Boar')
    expect(SPECIES_NAMES['animal-polar']).toBe('Polar Bear')
    expect(SPECIES_NAMES['animal-bunny']).toBe('Bunny')
  })
})

describe('ship order and name band', () => {
  it('numbers the ship queue 0..20 with no gaps and no ties', () => {
    const ships = COLLECTIONS.map((c) => c.ship).sort((a, b) => a - b)
    expect(ships).toEqual([...Array(21).keys()])
  })

  it('starts with the base set already shipped', () => {
    expect(collection('base')!.ship).toBe(0)
  })

  it('follows roster §6\'s proposal: Garden, Home Pets, Birds, Ocean, Farm, Critters', () => {
    const early = [...COLLECTIONS]
      .filter((c) => c.ship >= 1 && c.ship <= 6)
      .sort((a, b) => a.ship - b.ship)
      .map((c) => c.id)
    expect(early).toEqual(['garden', 'home-pets', 'birds', 'ocean', 'farm', 'critters'])
  })

  it('leaves Legendary and the conservation tiers until last', () => {
    const late = [...COLLECTIONS]
      .filter((c) => c.ship >= 16)
      .sort((a, b) => a.ship - b.ship)
      .map((c) => c.id)
    expect(late).toEqual([
      'near-threatened', 'vulnerable', 'endangered', 'critically-endangered', 'legendary',
    ])
  })

  it('rides the name band on ship order, as §3 requires', () => {
    for (const c of COLLECTIONS) {
      const want = c.ship <= 6 ? 'short' : c.ship <= 14 ? 'medium' : 'long'
      expect(c.band, `${c.id} ships at ${c.ship}`).toBe(want)
    }
  })
})

describe('roster §1\'s exclusions hold', () => {
  it('keeps the seven flagship base animals out of the Red List collections', () => {
    const excluded = new Set([
      'animal-lion', 'animal-giraffe', 'animal-elephant', 'animal-tiger',
      'animal-koala', 'animal-polar', 'animal-panda',
    ])
    const excludedNames = new Set([
      'Lion', 'Giraffe', 'Elephant', 'Tiger', 'Koala', 'Polar Bear', 'Panda',
    ])
    for (const id of CONSERVATION) {
      for (const member of collection(id)!.members) {
        expect(excluded.has(member), `${member} is live in the base set`).toBe(false)
        expect(excludedNames.has(SPECIES_NAMES[member] ?? ''), `${member}`).toBe(false)
      }
    }
  })

  it('still ships their near-namesakes, which are different species', () => {
    expect(collectionOf('animal-red-panda')!.id).toBe('endangered')
    expect(collectionOf('animal-snow-leopard')!.id).toBe('vulnerable')
    expect(collectionOf('animal-emperor-penguin')!.id).toBe('near-threatened')
  })
})

describe('the lookups round-trip', () => {
  it('finds the collection of every single species', () => {
    for (const c of COLLECTIONS) {
      for (const id of c.members) {
        expect(collectionOf(id), id).toBe(c)
        expect(SPECIES_COLLECTION[id], id).toBe(c.id)
      }
    }
  })

  it('returns the same object from both doors', () => {
    for (const c of COLLECTIONS) {
      expect(collection(c.id)).toBe(c)
      expect(collectionOf(c.members[0] ?? '')).toBe(collection(c.id))
    }
  })

  it('shrugs at an id it does not know rather than throwing', () => {
    expect(collectionOf('animal-wyvern')).toBeUndefined()
    expect(collection('mythical')).toBeUndefined()
  })
})
