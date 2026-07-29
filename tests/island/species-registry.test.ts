/**
 * The registry holds what has SHIPPED, and the roster holds what exists.
 *
 * These tests exist to keep that gap open. The natural instinct on reading
 * `registry.ts` is that it is unfinished and wants completing; the roster's own
 * header forbids that — "Not a build order — collections ship one at a time".
 * So the gap is asserted, loudly, with the reason attached.
 */
import { describe, expect, it } from 'vitest'
import { SPECIES } from '../../src/island/pets'
import { SPECIES_NAMES, COLLECTIONS } from '../../src/island/species/roster'
import {
  BADGED_BASE_SPECIES, BASE_SPECIES, REGISTRY, defineSpecies, shippedIn, speciesRecord,
} from '../../src/island/species/registry'

describe('the species registry', () => {
  it('holds the live 24, in the order pets.ts loads them', () => {
    expect(BASE_SPECIES.map(s => s.id)).toEqual([...SPECIES])
  })

  it('takes every printed name from the roster, so the two cannot disagree', () => {
    for (const s of BASE_SPECIES) expect(s.name).toBe(SPECIES_NAMES[s.id])
  })

  it('marks all 24 as kenney and gives none of them a build', () => {
    // Roster §1: the live 24 are frozen, never rebuilt, never restyled. A build
    // spec on one of these is the beginning of restyling an animal she owns.
    for (const s of BASE_SPECIES) {
      expect(s.kit).toBe('kenney')
      expect(s.build).toBeUndefined()
    }
  })

  it('refuses a species the roster has never heard of', () => {
    // The guard against invention. Joe's brief closed the species list; a record
    // for something not on it is a typo or a fabrication, and both must stop the
    // build rather than reach a child.
    expect(() => defineSpecies('animal-wumpus', 'quadruped')).toThrow(/not in the roster/)
  })

  it('has shipped exactly the base collection and nothing else yet', () => {
    // If this number moves, a collection shipped. That should be a deliberate,
    // reviewed act with a kit behind it — not a side effect of someone tidying.
    expect(REGISTRY.size).toBe(24)
    expect(shippedIn('base')).toHaveLength(24)
    expect(shippedIn('garden')).toHaveLength(0)
  })

  it('leaves 296 species rostered but unshipped, on purpose', () => {
    const rostered = COLLECTIONS.flatMap(c => c.members)
    expect(rostered).toHaveLength(320)
    expect(rostered.filter(id => !speciesRecord(id))).toHaveLength(296)
  })

  it('names the seven base animals roster §5 gives a threat badge', () => {
    expect([...BADGED_BASE_SPECIES].sort()).toEqual([
      'animal-elephant', 'animal-giraffe', 'animal-koala', 'animal-lion',
      'animal-panda', 'animal-polar', 'animal-tiger',
    ])
    for (const id of BADGED_BASE_SPECIES) expect(speciesRecord(id)).toBeDefined()
  })

  it('records no threat status yet, because none has been checked', () => {
    // Deliberate. `Threat.checkedDate` exists so a status is a dated reading of
    // the Red List rather than a memory; an absent status is honest and a
    // remembered one only looks checked. Delete this test the day someone reads
    // the seven entries properly and stamps a real date.
    for (const s of BASE_SPECIES) expect(s.threat).toBeUndefined()
  })
})
