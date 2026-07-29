/**
 * The species records — the roster turned into things the game can build.
 *
 * PB-036, phase 1. `roster.ts` says WHICH species exist and which collection
 * each belongs to; this file says what each one IS. The split is deliberate and
 * it is the shipping unit: the roster is transcribed once, in full, from Joe's
 * ratified brief, whereas the registry grows **one collection at a time**, which
 * is what the roster's own header demands — "Not a build order — collections
 * ship one at a time, on the existing 85% unlock cadence."
 *
 * SO THE REGISTRY IS DELIBERATELY INCOMPLETE. Today it holds the live 24 and
 * nothing else. A species in the roster with no record here is a species that
 * has not shipped, and `tests/island/species-roster.test.ts` asserts exactly
 * that rather than demanding the registry be full. Do not "finish" this file.
 *
 * ADDING A COLLECTION (phase 2, one agent per collection):
 *   1. Write a `Species` record per member, with a `build` its kit understands.
 *   2. `defineSpecies` pulls the printed name out of the roster, so the two can
 *      never disagree and a typo is a thrown error at module load, not a pet
 *      called "Hedghog" forever.
 *   3. The collection is not playable until its kit exists — `buildSpecies`
 *      throws by name for the five kits that are declared but unbuilt
 *      (`kit.ts`), which is the loud failure HANDOFF §6 (line 565) asks for.
 */
import { defineSpecies } from './define'
import { GARDEN_SPECIES } from './collections/garden'
import { HOME_PETS_SPECIES } from './collections/home-pets'
import { WOODLAND_SPECIES } from './collections/woodland'
import { AFRICA_SPECIES } from './collections/africa'
import type { Species } from './types'

/**
 * The invention guard now lives in `./define` so `collections/*.ts` can import
 * it without a cycle back through this file. Re-exported because callers and
 * tests import it from here and there is no reason to move them.
 */
export { defineSpecies } from './define'

/**
 * THE LIVE 24, FROZEN.
 *
 * Roster §1: "The live 24 are frozen (`animal-beaver … animal-tiger`). Never
 * rebuilt, never restyled." `kit: 'kenney'` is how that is said in code — it
 * means "an authored GLB exists for this; `pets.ts:554` loads it and no kit may
 * touch it". None of them carries a `build`, and `buildSpecies` throws if asked
 * to construct one, so there is no path by which a future kit quietly restyles
 * an animal Juno already owns. Brief §19.
 *
 * The order is `SPECIES` order from `pets.ts:19-26`, which a test pins.
 */
export const BASE_SPECIES: readonly Species[] = [
  'animal-beaver', 'animal-bee', 'animal-bunny', 'animal-cat', 'animal-caterpillar',
  'animal-chick', 'animal-cow', 'animal-crab', 'animal-deer', 'animal-dog',
  'animal-elephant', 'animal-fish', 'animal-fox', 'animal-giraffe', 'animal-hog',
  'animal-koala', 'animal-lion', 'animal-monkey', 'animal-panda', 'animal-parrot',
  'animal-penguin', 'animal-pig', 'animal-polar', 'animal-tiger',
].map(id => defineSpecies(id, 'kenney'))

/**
 * >>> NOT YET RECORDED: the seven base-24 threat badges.
 *
 * Roster §5 names them exactly — "any base-24 species that is threatened in
 * reality (tiger, elephant, giraffe, lion, koala, polar bear, panda) carries a
 * small status badge in the album wherever it lives". So WHICH seven is settled
 * and is transcribed below. What is NOT settled is each one's IUCN category, and
 * it is deliberately absent rather than guessed.
 *
 * Two reasons, and they are the same reason twice. Roster §5 requires the facts
 * be "true, checkable"; and `Threat.checkedDate` exists precisely so a status is
 * a dated reading of the Red List rather than a memory. Writing a category here
 * from recall would produce a record that LOOKS checked and is not, which is
 * worse than an absent one — `Species.threat` being optional already means "not
 * recorded yet", and that is an honest state.
 *
 * WHAT UNBLOCKS IT: someone reads the current Red List entry for each of these
 * seven, stamps the real date, and adds `threat` to the records above. That is a
 * ten-minute job for whoever has a browser, and it must happen before any badge
 * is shown. It is not blocked on Joe — but note roster §6 asks whether the badge
 * prints the IUCN category name or a softer child-facing phrase, and THAT is his.
 */
export const BADGED_BASE_SPECIES: readonly string[] = [
  'animal-tiger', 'animal-elephant', 'animal-giraffe', 'animal-lion',
  'animal-koala', 'animal-polar', 'animal-panda',
]

/**
 * The collections built in PB-036 phase 2, one file each.
 *
 * Each was written by its own agent against the finished quadruped kit and is
 * DELIBERATELY PARTIAL — every one of them has members waiting on a kit that
 * does not exist yet, and each collection's own test names those members and
 * asserts they are absent, so the gap is a tripwire rather than an oversight.
 * `SHIPPED_SPECIES` is the honest total; `roster.ts` is the ambition.
 *
 * Phase 2 measured that NO collection in the roster is 100% quadruped — the
 * closest is Garden at 13 of 14 — which is why JT-030 asks Joe whether a
 * collection may unlock with a hole in it. Until he rules, nothing here is
 * wired to a child.
 */
export const PHASE2_SPECIES: readonly Species[] = [
  ...GARDEN_SPECIES, ...HOME_PETS_SPECIES, ...WOODLAND_SPECIES, ...AFRICA_SPECIES,
]

/** Everything that has actually shipped: the frozen 24 plus the built collections. */
export const SHIPPED_SPECIES: readonly Species[] = [...BASE_SPECIES, ...PHASE2_SPECIES]

/** Every species that has actually shipped, by id. */
export const REGISTRY: ReadonlyMap<string, Species> = new Map(
  SHIPPED_SPECIES.map(s => [s.id, s]),
)

/** The record, or undefined if the species is in the roster but has not shipped. */
export function speciesRecord(id: string): Species | undefined {
  return REGISTRY.get(id)
}

/**
 * The species of one collection that have actually shipped.
 *
 * Returns fewer members than the roster lists while a collection is mid-build,
 * which is the normal state of every collection except `base`. The collection
 * deck (`collection.ts:87`) must be primed from THIS, never from the roster, or
 * a child is dealt an egg containing a creature that cannot be built.
 */
export function shippedIn(collectionId: string): readonly Species[] {
  return SHIPPED_SPECIES.filter(s => s.collection === collectionId)
}
