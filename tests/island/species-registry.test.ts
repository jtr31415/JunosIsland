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
    //
    // 97, not 96, and the +1 is GARDEN COMPLETING. The ASSEMBLY kit built
    // `animal-slow-worm`, which every count in this file used to call out as
    // "needs bespoke". It still does need bespoke for a `build` — that kit is
    // still unbuilt and its record still has none — but `assembly` is additive
    // (§9.2 of `docs/building-animals-from-parts.md`), so the species has shipped
    // on the strength of an assembly alone. It is the first record in the repo
    // that is real without a `build`, and this is the number that says so.
    // 98 since 2 Aug, and the +1 was the CORN SNAKE — the assembly kit spent a
    // second time, and the first time on something that is not a Garden animal.
    // Same shape of record as the slow worm's: no `build`, an `assembly`, and
    // `bespoke` naming the route rather than a kit that exists.
    //
    // 100 later the same day, and the +2 are the GOLDFISH and the CROCODILE, on
    // that same route. The goldfish is the one that matters most here: it was
    // rostered against the `swim` kit, which has never been built and now never
    // needs to be, and with it HOME PETS IS THE FOURTH COMPLETE COLLECTION.
    // `completion()` divides by ROSTER size, so a collection that can never be
    // fully built can never complete, never go inactive and never release one of
    // the four active slots JT-027 allows — and Home Pets had been holding one
    // of those four permanently.
    expect(REGISTRY.size).toBe(100)
    expect(shippedIn('base')).toHaveLength(24)
    expect(shippedIn('garden')).toHaveLength(14)      // COMPLETE — the slow worm is assembled
    expect(shippedIn('home-pets')).toHaveLength(16)   // COMPLETE — corn snake and goldfish assembled
    expect(shippedIn('woodland')).toHaveLength(16)    // COMPLETE
    expect(shippedIn('africa')).toHaveLength(14)      // 16 rostered, ostrich + vulture want wings
    expect(shippedIn('farm')).toHaveLength(16)        // COMPLETE
  })

  it('leaves 222 species rostered but unshipped, on purpose', () => {
    // The gap is the point. Nobody should "finish" the registry — a species
    // without a built kit renders as nothing, which is worse than absent.
    //
    // 246 after phase 2; 224 after phase 3 built the songbird kit and spent it
    // on 22 more (woodland +2, home-pets +4, farm +16); 223 once the assembly
    // kit built the slow worm, which is one animal and not a collection; 222
    // once it built the corn snake, likewise; 220 once it built the goldfish and
    // the crocodile.
    //
    // The rate is the thing to read here, not the number: the assembly kit
    // closes ONE animal at a time, which is why it is the right tool for the
    // members a kit cannot express and the wrong one for a collection. Four
    // animals is four runs — and it is also what it took to close a collection
    // that four kits could not.
    const rostered = COLLECTIONS.flatMap(c => c.members)
    expect(rostered).toHaveLength(320)
    expect(rostered.filter(id => !speciesRecord(id))).toHaveLength(220)
  })

  it('has FOUR complete collections now — garden, home-pets, woodland and farm', () => {
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
    //
    // GARDEN IS NOW THE THIRD, and it is the first one the ASSEMBLY kit closed:
    // its one shortfall was `animal-slow-worm`, a legless lizard no kit could
    // express, and the assembly kit built it from the pack's own geometry. Garden
    // is roster row 1 and ship 1 — the first collection a child meets after the
    // base 24 — so this is the collection where "may it unlock with a hole in it"
    // mattered most, and the question no longer has to be answered for it.
    //
    // HOME PETS IS NOW THE FOURTH, and it is the one that took two assembly runs
    // rather than one: the corn snake, which the quadruped kit would have put
    // four legs on, and the goldfish, which was rostered against a `swim` kit
    // that has never been built. NEITHER MISSING KIT WAS EVER BUILT — both
    // animals left the deferred list by being assembled from the pack's own
    // geometry instead. That is the pattern worth reading off this line: a
    // collection's shortfall is not a queue of kits, it is a queue of animals,
    // and the assembly route can clear it one at a time without waiting.
    const complete = COLLECTIONS
      .filter(c => c.id !== 'base')
      .filter(c => c.members.every(id => speciesRecord(id)))
      .map(c => c.id)
    expect([...complete].sort()).toEqual(['farm', 'garden', 'home-pets', 'woodland'])
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
