/**
 * IS THERE AN ANIMAL HERE YET — the one question the album's view is filtered on.
 *
 * ## Why this file exists
 *
 * Joe, 2 August: *"i can still see all the empty slots from the blocky animals
 * in the albums by the way. we should remove them all and they get built up as
 * soon as i push new animals to the game."*
 *
 * `album.ts` drew one frame per ROSTER member, so PB-036 deleting fifty-nine
 * kit-built species left their frames behind: the roster never changed, and was
 * never meant to. Africa showed sixteen frames with one animal behind them.
 * `unlock.ts:133` had already written the symptom down and left it.
 *
 * His two rulings, both given explicitly and both settled:
 *
 *   1. **A slot appears when the species is BUILT**, not when it is signed off.
 *      He was shown the consequence and took it: the album will show animals the
 *      child cannot yet hatch, because the sign-off gate still governs what is
 *      DEALT (`pool.ts`) and nothing is signed off yet. That is deliberate. Do
 *      not "fix" it by reaching for `isSignedOff` here — these are two different
 *      questions with two different answers, and the album is asking the first.
 *   2. **A collection with nothing built does not appear at all.** No page, no
 *      name, no "coming soon". The album grows as he builds.
 *
 * ## Why not `shippedIn`
 *
 * `registry.ts:166`'s `shippedIn` counts REGISTERED records, and a record is not
 * an animal. `define.ts:60` looks an assembly up off the register and simply
 * omits it when there is none, so a `Species` record for a creature nobody has
 * modelled yet is legal, silent, and counted. That is not a hypothetical: the
 * method the last three collections were built by writes **all** of a
 * collection's records first, in one commit, and the species files afterwards
 * one at a time. Filtering on `shippedIn` would put sixteen empty Farm frames
 * back the moment that first commit landed — the exact bug, returned by a
 * different door. A manager already mis-measured this once, reporting 100 built
 * of 320 when the figure to spec was 17.
 *
 * ## What "built" resolves to, and why it is these three
 *
 * Exactly the three shapes `album.ts`'s own `shapeOf` can draw, in its order,
 * because the only honest meaning of "there is a slot for it" is "there is a
 * picture to put in it":
 *
 *   1. **An assembly** — `record.assembly`, present only when
 *      `parts/assembled/register.ts` answers to the id. This is the live route;
 *      every collection from Night Time on is built this way.
 *   2. **A kit build whose kit EXISTS** — `record.build` for one of the three
 *      implemented kits. `KITS` is asked rather than `BUILT_KITS` because the
 *      latter is the six kits the roster PLANS and `buildSpecies` throws by name
 *      for the three that were never written (swim, minibeast, bespoke). A
 *      record naming an unwritten kit draws a blank frame, which is the thing
 *      being removed. Garden's thirteen quadrupeds are why this clause is not
 *      dead code.
 *   3. **The frozen base pack** — an authored GLB, `kit: 'kenney'`, no `build`
 *      and no `assembly`. `pets.ts` loads these and the album gets them through
 *      `preview`. Twenty-four, frozen, and every one of them stays visible.
 *
 * A species with no record at all is not built. Note the asymmetry with
 * `shapeOf`, which still tries `preview` for an id it has never heard of: that
 * is the right guess for a PET out of a save from a later build, and the wrong
 * one for an empty frame. This module answers "should there be a frame", never
 * "can this pet be drawn".
 *
 * ## This module costs three.js, and one caller cannot pay
 *
 * `KITS` lives in `kit.ts`, which imports three, and `speciesRecord` comes from
 * `registry.ts` which reaches three through `collections/garden.ts`. `album.ts`
 * is a three consumer already so it pays nothing. **`unlock.ts` and `opened.ts`
 * deliberately are not**, and `save.ts` imports the latter — so importing this
 * module into either would put a renderer inside the save path.
 *
 * >>> SO THEY ARE FED BY INJECTION, AND AS OF JT-047 THERE IS NO SECOND OPINION
 * >>> LEFT. `main.ts` — which pays for three anyway — fills a map of
 * >>> `builtIn(id).length` per collection on every arrival and threads it in as
 * >>> `UnlockState.built`. `completion()` divides by THAT, and the hold on
 * >>> unbuilt collections derives from it too, so `unlock.ts`'s hand-written
 * >>> `NOT_BUILT_YET` list is gone.
 * >>>
 * >>> Until 3 August those were real divergences (PB-083): the album counted
 * >>> built animals while `completion()` divided by the roster, so Night Time
 * >>> read "13 of 13" on the page and 81% to the unlocker, and its next album
 * >>> never opened. Two functions answering one question is the whole failure —
 * >>> if you are about to add a third reader of "is it built", give it this
 * >>> module or give it the injected map, and never a list of your own.
 */
import { collection } from './roster'
import { speciesRecord } from './registry'
import { KITS } from './kit'

/**
 * Has anybody actually built this animal?
 *
 * THE single call. Both halves of the album's "N of M" and every frame it draws
 * come from this one predicate, so the count and the frames cannot disagree —
 * they used to be two separate reads of `set.members` three lines apart, which
 * is the shape `docs/HANDOFF.md` warns about with "the offer is DERIVED from the
 * choke point, not kept in step with it".
 */
export function isBuilt(speciesId: string): boolean {
  const record = speciesRecord(speciesId)
  if (!record) return false
  if (record.assembly) return true
  if (record.build) return KITS[record.build.kit] !== undefined
  return record.kit === 'kenney'
}

/**
 * A collection's built members, IN ROSTER ORDER.
 *
 * Roster order, not build order and not the order they were found: it is the
 * same on every island, which is what makes the shape of a half-finished album
 * something two children can talk about (roster §3, "playground currency"). This
 * FILTERS the roster and never reorders it — `naming.ts:218` allocates given
 * names over the full ratified roster precisely so that building a new animal
 * cannot rename one a child already owns, so nothing here may touch membership
 * or order. A new animal appearing must only ever INSERT a frame.
 *
 * An unknown collection id answers with an empty list rather than throwing, so
 * `builtIn(id).length > 0` is also the "this build can resolve that album" test
 * the album used to make separately.
 *
 * Memoised because the registry is static for the life of the page and the
 * album asks for the same collection on every page turn.
 */
const CACHE = new Map<string, readonly string[]>()

export function builtIn(collectionId: string): readonly string[] {
  const held = CACHE.get(collectionId)
  if (held) return held
  const members = collection(collectionId)?.members ?? []
  const built = Object.freeze(members.filter(isBuilt))
  CACHE.set(collectionId, built)
  return built
}
