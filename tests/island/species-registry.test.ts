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

  it('has shipped the base 24 plus five collections across two kits', () => {
    // If this number moves, a collection shipped. That should be a deliberate,
    // reviewed act with a kit behind it — not a side effect of someone tidying.
    //
    // Phase 2 built four collections against the one finished kit (quadruped)
    // and every one was PARTIAL, each shortfall waiting on a kit that did not
    // exist. Phase 3 built the SONGBIRD kit and spent it on the three
    // collections it could finish or nearly finish, so two of those holes are
    // now closed and one new collection arrived whole.
    //
    // The shortfalls that remain are still not sloppiness — each names a kit
    // that does not exist yet (bespoke, swim, raptor). The per-collection tests
    // name those members, so each is a tripwire the day its kit lands.
    expect(REGISTRY.size).toBe(96)
    expect(shippedIn('base')).toHaveLength(24)
    expect(shippedIn('garden')).toHaveLength(13)      // 14 rostered, slow-worm needs bespoke
    expect(shippedIn('home-pets')).toHaveLength(14)   // 16 rostered, 1 bespoke + 1 swim
    expect(shippedIn('woodland')).toHaveLength(16)    // COMPLETE
    expect(shippedIn('africa')).toHaveLength(13)      // 16 rostered, 2 bespoke + 1 raptor
    expect(shippedIn('farm')).toHaveLength(16)        // COMPLETE
  })

  it('leaves 224 species rostered but unshipped, on purpose', () => {
    // The gap is the point. Nobody should "finish" the registry — a species
    // without a built kit renders as nothing, which is worse than absent.
    //
    // 246 after phase 2; 224 after phase 3 built the songbird kit and spent it
    // on 22 more (woodland +2, home-pets +4, farm +16).
    const rostered = COLLECTIONS.flatMap(c => c.members)
    expect(rostered).toHaveLength(320)
    expect(rostered.filter(id => !speciesRecord(id))).toHaveLength(224)
  })

  it('has TWO complete collections now — woodland and farm', () => {
    // This test used to assert ZERO, and said in its own comment: "if this test
    // ever goes red, a second kit landed and that question became live." That
    // is exactly what happened, so it is inverted rather than deleted — the
    // invariant worth holding was never "nothing is complete", it was "we know
    // precisely which collections are complete and it is not an accident".
    //
    // Songbird was chosen as the second kit for this reason. Woodland needed
    // two game birds and farm needed seven fowl; nothing else in either
    // collection was missing. So the first two complete collections in the game
    // arrived together, and JT-030 — may a collection unlock with a hole in it?
    // — is now answerable the easy way for at least these two: they have no
    // hole. Every further kit shrinks that question, which is the best answer
    // available while it is unanswered.
    const complete = COLLECTIONS
      .filter(c => c.id !== 'base')
      .filter(c => c.members.every(id => speciesRecord(id)))
      .map(c => c.id)
    expect([...complete].sort()).toEqual(['farm', 'woodland'])
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
