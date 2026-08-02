/**
 * The page half of "one button" — everything that can only be decided where the
 * game's own TypeScript is loaded.
 *
 * JOE_WORKBENCH_ONLY.
 *
 * ## The split, and why it is not arbitrary
 *
 * `tools/workbench/push.mjs` owns the filesystem: what exists, what must never
 * be written over, and where every path comes from. It runs under bare node and
 * therefore cannot import a single line of `src/`.
 *
 * This file owns the RULES. `creatureSpec` is the thing that decides whether a
 * definition is a legal animal — the ten axioms, the triangle budget, the pupil,
 * the ridge that leaves the hull — and it lives in TypeScript. Under
 * `npm run workbench` this page is served by Vite, which is the one place in the
 * system that both holds the definition Joe just edited and can execute those
 * rules against it. So the definition is run through `creatureSpec` HERE, before
 * a single byte is sent, and a species that will not build never reaches `src/`.
 *
 * The refusal is the real one, word for word — `creatureSpec`'s own message,
 * which names the rule, says what is wrong and says what to do instead. Wrapping
 * it in "could not push" would throw away the only part Joe can act on.
 *
 * ## The roster travels with the request
 *
 * `defineSpecies` records live in ROSTER order and
 * `tests/island/species-<c>.test.ts` asserts it element for element. The roster
 * is `COLLECTIONS` in `src/island/species/roster.ts`, which again only this side
 * can read — so the request carries `after`, the members of the collection that
 * come after this species. The server uses it to choose an insertion point and
 * for nothing else.
 */
import { creatureSpec } from '../../../../src/island/species/parts/creature'
import { COLLECTIONS } from '../../../../src/island/species/roster'
import { assemblyConstName, defToModuleSource } from './def'
import { auditRowFor, factRowFor, type SignoffView } from './signoff'
import type { CreatureDef } from '../../../../src/island/species/parts'

/** One of the nine places, and what happened to it. */
export interface Place {
  place: number
  path: string
  what: string
}

/** What is still a human's job, and why it is not this button's. */
export interface Left {
  place: number
  path: string
  why: string
}

export interface PushReply {
  speciesId?: string
  collection?: string
  wrote?: readonly Place[]
  skipped?: readonly Place[]
  left?: readonly Left[]
  say?: string
  error?: string
}

/** Everything the server needs, and nothing it could use to name a file. */
export interface PushRequest {
  speciesId: string
  collection: string
  exportName: string
  module: string
  record: string
  after: readonly string[]
  auditRow: ReturnType<typeof auditRowFor>
  factRow: ReturnType<typeof factRowFor>
}

/**
 * The collection's roster members that come after this species.
 *
 * Empty when the species is last, which the server reads as "put it at the end",
 * and empty when the id is not in the roster at all — which cannot happen,
 * because `signoffView` blocks that case long before this is reached.
 */
export function membersAfter(speciesId: string, collectionId: string): string[] {
  const members = COLLECTIONS.find(c => c.id === collectionId)?.members ?? []
  const at = members.indexOf(speciesId)
  return at === -1 ? [] : [...members.slice(at + 1)]
}

/**
 * The comment that goes above the record in the collection file.
 *
 * SHORT, and every sentence of it true. The species files already in those
 * collections carry twelve to eighteen lines apiece explaining why the animal is
 * `bespoke` and what its silhouette owes to what — that is real writing about a
 * real animal, and a generator that produced a paragraph in the same register
 * would be producing something that reads like an argument and is not one. What
 * this can honestly say is where the record came from and what has not been
 * looked at, so that is all it says.
 */
export function recordFor(speciesId: string, species: string, draftId: string, today: string): string {
  const from = draftId === '' ? 'the species editor' : `the species editor as ${draftId}`
  return [
    '  /*',
    `   * ${species}. Pushed from ${from} on ${today}.`,
    '   *',
    '   * `bespoke` sends it to the ASSEMBLY kit, and every measurement lives in',
    `   * \`parts/assembled/${speciesId}.ts\`. Its proportions and its palette are Joe's`,
    '   * own and have had no second pair of eyes; the derivations beside the numbers',
    '   * are the one thing the editor cannot write, and are still owed.',
    '   */',
    `  defineSpecies('${speciesId}', 'bespoke'),`,
  ].join('\n')
}

/**
 * Build the request, refusing first on anything that makes the push a bad idea.
 *
 * Throws with `creatureSpec`'s own words when the definition will not build.
 * Everything else it can check — the roster, the collection, the name, the fact
 * — has already been checked by `signoffView`, and `view.ready` is that answer;
 * re-deciding it here would be a second opinion that could disagree with the one
 * the panel is showing him.
 */
export function pushRequest(
  speciesId: string, def: CreatureDef, view: SignoffView, draftId: string, today: string,
): PushRequest {
  if (!view.ready) {
    throw new Error('the name-and-fact panel still has something in it that has to be fixed first')
  }
  /*
   * The gate, and it is deliberately not caught: `creatureSpec` throws with the
   * axiom, the offending value and the fix, which is more use to Joe than
   * anything this file could say about it.
   */
  creatureSpec(speciesId, def)

  return {
    speciesId,
    collection: view.collection,
    exportName: assemblyConstName(speciesId),
    module: defToModuleSource(speciesId, def),
    record: recordFor(speciesId, view.species, draftId, today),
    after: membersAfter(speciesId, view.collection),
    auditRow: auditRowFor(view),
    factRow: factRowFor(view),
  }
}
