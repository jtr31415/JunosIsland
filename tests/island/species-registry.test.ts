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

  it('has shipped the base 24 plus PB-036 phase 2\'s four collections', () => {
    // If this number moves, a collection shipped. That should be a deliberate,
    // reviewed act with a kit behind it — not a side effect of someone tidying.
    //
    // Phase 2 built four collections against the one finished kit (quadruped).
    // Every one of them is PARTIAL, and the shortfall is not sloppiness: each
    // missing member needs a kit that does not exist. The per-collection tests
    // name those members and assert their absence, so each becomes a tripwire
    // the day its kit lands.
    expect(REGISTRY.size).toBe(74)
    expect(shippedIn('base')).toHaveLength(24)
    expect(shippedIn('garden')).toHaveLength(13)      // 14 rostered, slow-worm needs bespoke
    expect(shippedIn('home-pets')).toHaveLength(10)   // 16 rostered, 4 songbird + 1 bespoke + 1 swim
    expect(shippedIn('woodland')).toHaveLength(14)    // 16 rostered, 2 game birds
    expect(shippedIn('africa')).toHaveLength(13)      // 16 rostered, 2 bespoke + 1 raptor
  })

  it('leaves 246 species rostered but unshipped, on purpose', () => {
    // The gap is the point. Nobody should "finish" the registry — a species
    // without a built kit renders as nothing, which is worse than absent.
    const rostered = COLLECTIONS.flatMap(c => c.members)
    expect(rostered).toHaveLength(320)
    expect(rostered.filter(id => !speciesRecord(id))).toHaveLength(246)
  })

  it('still has no collection that is 100% shipped except the frozen base', () => {
    // Measured across all 20 collections in phase 2: not one has every member
    // buildable by the quadruped kit alone. That fact is what JT-030 asks Joe
    // about — whether a collection may unlock with a hole in it. If this test
    // ever goes red, a second kit landed and that question became live.
    const complete = COLLECTIONS
      .filter(c => c.id !== 'base')
      .filter(c => c.members.every(id => speciesRecord(id)))
    expect(complete).toHaveLength(0)
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
