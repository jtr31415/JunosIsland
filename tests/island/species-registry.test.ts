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
    // spec on one of these is the beginning of restyling an animal they own.
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
    // 113 since 2 Aug, and the +13 is NIGHT TIME — the first WHOLE COLLECTION
    // built on the assembly route and the first with no kit build anywhere in
    // it. Every count above it was a kit spending itself on sixteen animals at
    // once, with the assembly kit closing single stragglers afterwards; this one
    // inverts that. Joe's ruling the same day is why: "do not build any more of
    // them. all the rest must be built in the same way as the garden animals."
    //
    // It is THIRTEEN and not sixteen, and the three missing are not pending —
    // bat and sugar glider want a membrane, scorpion wants a pincer, and the
    // `wing`, `horn` and `claw` roles occur zero times in the bank.
    // `species-night-time.test.ts` measures that absence rather than asserting
    // it, so the day a wing is banked the ruling reopens by itself.
    // 54 SINCE LATER THE SAME DAY, and the −59 is the whole kit route being
    // RETIRED. Joe, having looked at them: *"only the garden animals have been
    // built to spec. the ones i can see in outline in the album for africa and
    // home pets are the old blocky ones that can be deleted to be honest"*, then
    // *"remove all the blocky ones from the game completely, including the
    // album."* Deleting rather than replacing was safe only because he confirmed
    // the fact that made it safe — *"she has not collected any of them yet"* —
    // so no save points at one and §19 is untouched.
    //
    // The number went DOWN and that is the point rather than a regression: he
    // wants a clean baseline to rebuild from on the assembly route. Every
    // survivor below is hand-assembled, except `base`, which is Kenney's own
    // pack and was never ours.
    // AND THEN IT WENT BACK UP, which is what the baseline was for. PB-073 built
    // Home Pets' fourteen missing species by hand assembly, one per commit, so
    // this collection is 16 of 16 again — this time every member assembled and
    // not one of them spent by a kit. 54 + 14 = 68.
    // 84 SINCE 3 AUG, and the +16 is FARM, shipped whole on the parts route
    // (PB-074) — sixteen of sixteen, every one hand-assembled. It is the first
    // collection to arrive complete in a single run since the kit route was
    // retired, and the second collection the parts route has closed.
    // 100 SINCE 4 AUG, and it is WOODLAND being rebuilt on the parts route —
    // the third collection the kit purge emptied and the last one still empty.
    // It arrives a few species at a time rather than whole, so this number and
    // the woodland line below move together and the two are the same fact.
    expect(REGISTRY.size).toBe(100)
    expect(shippedIn('base')).toHaveLength(24)
    expect(shippedIn('garden')).toHaveLength(14)      // COMPLETE — the slow worm is assembled
    expect(shippedIn('home-pets')).toHaveLength(16)   // COMPLETE — all 16 hand-assembled (PB-073)
    expect(shippedIn('woodland')).toHaveLength(16)    // COMPLETE — all 16 hand-assembled
    expect(shippedIn('africa')).toHaveLength(1)       // crocodile; 13 kit-built deleted
    expect(shippedIn('farm')).toHaveLength(16)        // COMPLETE — all 16 hand-assembled (PB-074)
    expect(shippedIn('night-time')).toHaveLength(13)  // 16 rostered; bat, sugar glider, scorpion
  })

  it('leaves 236 species rostered but unshipped, on purpose', () => {
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
    //
    // 207 since 2 Aug, and the −13 is NIGHT TIME. That is the sentence above
    // corrected by evidence: the assembly route closes one animal at a time only
    // when it is used that way. Measured ONCE for the whole collection and then
    // dispatched in parallel, it built thirteen in a single run — which is why
    // this is the first drop of more than four in the assembly era, and why the
    // remaining 207 are a schedule rather than a wall.
    // 252 since 3 Aug, and the −14 is HOME PETS, built the same way Night Time
    // was: measured once for the whole collection, then dispatched one species
    // per worker in parallel. That is now twice, so it is a method rather than a
    // fluke — the wall is a schedule, and the schedule is roughly a collection
    // per run.
    // 236 since 3 Aug, and the −16 is FARM (PB-074), measured and dispatched the
    // same way a third time. Three runs, three collections, and this one is the
    // largest single drop the assembly route has made — sixteen rather than
    // thirteen or fourteen, because Farm had no member the bank could not
    // express. So the schedule above now has a rate to read off it, and the
    // remaining 236 are about fifteen runs rather than an unknown quantity.
    // 220 since 4 Aug, and the −16 is WOODLAND, the last collection the kit purge
    // emptied. It is also the first to arrive with a GAME BIRD in it that is not
    // a quadruped in disguise: the pheasant and the capercaillie are built on the
    // galliform idiom animal-chicken.ts established out of the pack's own parts.
    const rostered = COLLECTIONS.flatMap(c => c.members)
    expect(rostered).toHaveLength(320)
    expect(rostered.filter(id => !speciesRecord(id))).toHaveLength(220)
  })

  it('has FOUR complete collections — garden, and home-pets, farm and woodland rebuilt properly', () => {
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
    //
    // NIGHT TIME IS DELIBERATELY NOT ON THIS LIST, and that is the useful thing
    // about it. It is thirteen of sixteen and the three it lacks are not waiting
    // on effort or on a kit — they want shapes the pack does not contain. So it
    // is the first collection that can NEVER complete on the current bank, which
    // makes JT-030 (may a collection unlock with a hole in it?) live again in the
    // hardest form: for Home Pets the answer could be dodged by building the
    // last two animals, and here it cannot.
    // AND THEN THERE WAS ONE. Later on 2 Aug Joe retired the kit route outright
    // and had the 59 kit-built species deleted, so farm and woodland lost all
    // sixteen each and home-pets lost fourteen. Everything above is kept rather
    // than rewritten because it is the reasoning that produced those four, and
    // because the thing it got wrong is worth seeing: the count was never the
    // achievement. A collection is complete when Joe wants what is in it, and
    // three of these four were complete only in the sense that a kit had
    // finished spending itself on them.
    //
    // GARDEN IS THE ONE THAT SURVIVED, and it survived because it is the only
    // collection built the way he wanted in the first place. That is the whole
    // lesson of the day in one array.
    // AND NOW THERE ARE TWO, which is the same assertion inverted a third time
    // and is worth keeping for that reason alone. HOME PETS IS BACK, and the
    // distinction the paragraph above draws is exactly what makes it a different
    // event from the first time: it was complete once because a kit had finished
    // spending itself on it, and it is complete now because fourteen animals were
    // each measured, argued and built one at a time (PB-073).
    //
    // So the array is no longer a count of finished collections, it is a list of
    // collections built the way Joe wanted. That is the only sense in which this
    // number has ever meant anything, and the second entry is the first evidence
    // that the first one was repeatable.
    //
    // NOTE both are UNSIGNED beyond Garden: completeness here means every
    // rostered member has a record, not that Joe has approved them. He signs off
    // in the editor and that gate is his alone.
    //
    // AND NOW THERE ARE THREE. FARM shipped 16 of 16 on the parts route (PB-074),
    // which is the same method a third time and the first collection to arrive
    // whole in a single run — Home Pets needed two earlier assembly runs before
    // PB-073 closed it. Farm is also the collection this file has watched go both
    // ways: it was 16 of 16 once on the songbird kit, then 0 when those sixteen
    // were deleted, and it is 16 again now on animals that were each measured and
    // argued. Same number, and the paragraphs above are why it is not the same
    // event. Farm is UNSIGNED too, on the same terms as Home Pets.
    const complete = COLLECTIONS
      .filter(c => c.id !== 'base')
      .filter(c => c.members.every(id => speciesRecord(id)))
      .map(c => c.id)
    //
    // AND NOW THERE ARE FOUR. WOODLAND, on 4 August, and it is the first
    // collection whose completeness required a BIRD that is not a quadruped in
    // disguise. The kit era left animal-pheasant and animal-capercaillie out by
    // name — 'they are game birds, the songbird kit did not exist, and a bird
    // pressed into the quadruped kit is a four-legged pheasant' — and on the
    // parts route they are built on the galliform idiom animal-chicken.ts
    // established out of the pack's own shapes: two legs on LEG_ROW, box-06 as a
    // folded flank wing, tube-02 as the bill, plate-08 as the round eye. So the
    // last hole the kit era left in this collection closed without a kit.
    // Woodland is UNSIGNED, like Home Pets and Farm.
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
