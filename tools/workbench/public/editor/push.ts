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
import { APPROVED } from '../approver'
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

/* ------------------------------------------------- reading the reply honestly */

/**
 * Place 1 — `src/island/species/parts/assembled/<id>.ts`. The file that IS the
 * animal in the game.
 *
 * The other nine places register it, roster it, and record what Joe decided
 * about it. Only this one carries the shape, so only this one answers the
 * question he is actually asking when he presses the button.
 */
export const SPECIES_MODULE_PLACE = 1

/** Where place 1 lives, from the id alone — the same path `push.mjs` derives. */
export const speciesModulePath = (speciesId: string): string =>
  `src/island/species/parts/assembled/${speciesId}.ts`

/**
 * The only fields of a reply the verdict is allowed to read.
 *
 * Narrow on purpose: `skipped` and `left` are evidence for Joe to read, not
 * inputs to the decision, and naming them here would invite a future rule that
 * called a fully-skipped push a success again.
 */
export type PushVerdictInput = Pick<PushReply, 'speciesId' | 'wrote' | 'say' | 'error'>

/** How the page must present a push, decided from the reply and nothing else. */
export interface PushOutcome {
  /** Did the animal reach the game? Not "did the request succeed". */
  ok: boolean
  /** The text for `#push-note`. */
  note: string
  /** The class for `#push-note` — `note bad` whenever `ok` is false. */
  noteClass: string
  /** The text for the always-visible header line. */
  sayText: string
  /** Whether that header line is red. Always true when `ok` is false. */
  sayBad: boolean
}

/**
 * **What the push ACTUALLY did, judged by what it says it WROTE.**
 *
 * Joe's bug, 2 August: he edited the hedgehog, pressed the button, and the page
 * told him `animal-hedgehog is in the game` in green while the reply in front of
 * it said every single place had been SKIPPED and nothing had been written. The
 * hedgehog is already built, and `push.mjs` never writes over a species that is
 * already built — so the one thing that would have changed the animal, place 1,
 * was skipped, and the page called that success because the reply carried no
 * `error` key.
 *
 * **The absence of an error is not the presence of an animal.** A reply can be a
 * perfectly well-formed 200 that wrote the MOVES table and nothing else; it can
 * be a re-run that found every place already taken. In both the file that holds
 * the shape is untouched, and in both the honest sentence is "your edits are not
 * in the game".
 *
 * So the rule is one line and it is deliberately strict: **place 1 appears in
 * `wrote`, or this was not a push into the game.** Being strict in this
 * direction is the safe way round — the worst this can do is call a moves-only
 * push a non-change, which it is; the other way round is what cost him the
 * afternoon.
 *
 * The server's own `reply.say` is preferred for the explanation, because it is
 * written for him and knows why each place was skipped. What it may not do is
 * choose the COLOUR: the note goes `note bad` and the header goes red on every
 * path where the animal did not change, whatever the words are.
 */
export function pushOutcome(reply: PushVerdictInput, speciesId: string): PushOutcome {
  const id = speciesId || reply.speciesId || 'this animal'

  if (reply.error) {
    return {
      ok: false,
      note: reply.error,
      noteClass: 'note bad',
      sayText: `nothing was pushed: ${reply.error}`,
      sayBad: true,
    }
  }

  const wroteTheAnimal = (reply.wrote ?? []).some(p => p.place === SPECIES_MODULE_PLACE)
  if (!wroteTheAnimal) {
    const path = speciesModulePath(id)
    return {
      ok: false,
      note: `${id} did NOT change in the game — nothing was written to ${path}. `
        + (reply.say ? `${reply.say} ` : '')
        + 'Your edits are still only a saved draft. The list below says what happened to every '
        + 'place; a species that is already built is never written over, so if you meant to '
        + 'replace it, delete that file yourself and push again.',
      noteClass: 'note bad',
      sayText: `${id} did NOT reach the game — ${path} was not written`,
      sayBad: true,
    }
  }

  return {
    ok: true,
    note: reply.say ?? '',
    /* Still `warn`, not plain: a successful push leaves `npm test` red on
     * purpose and the server's sentence says so. Warn is "read this", `bad` is
     * "this did not happen", and the two must never be the same colour again. */
    noteClass: 'note warn',
    sayText: `${id} is in the game — read the list below before you close this`,
    sayBad: false,
  }
}

/**
 * The save that a push makes to Joe's own file — or `null`, which is most of the
 * time.
 *
 * ## Pressing the button IS the sign-off
 *
 * Joe, 2 August 2026: *"there is no way for me to change it to status 'sign-off'
 * when i hit the 'push to game' button, that is me signing it off. get those
 * animals onto the game please once the unlocker has landed."*
 *
 * That closes a gap that had quietly stopped every animal. His earlier ruling is
 * *"only animals that i have signed off in the editor end up on the game, local
 * or live"*, and the egg pool was correctly wired to `signoff === 'ok'` — but the
 * field lived on `approver.ts`, a different page, and the editor could not write
 * it. The gate was real, the wiring was right, and the button that opens it was
 * not in the tool he uses. He does not want a second tick to go and find. The
 * push is the gesture.
 *
 * ## ONLY A PUSH THAT ACTUALLY WROTE MAY SIGN ANYTHING OFF
 *
 * This is the whole reason the function takes a `PushOutcome` and not a
 * `PushReply`. PB-076 was a push that returned a perfectly well-formed 200 having
 * written nothing at all, and told him in green that the animal was in the game.
 * If sign-off hung off the absence of an `error` key it would have signed off an
 * animal that never reached `src/` — and a false sign-off does not merely mislead
 * him, it puts an unreviewed animal in front of his daughter, which is the one
 * thing this gate exists to prevent.
 *
 * So the judgement is not made here and CANNOT be made here. `pushOutcome` above
 * owns it — place 1 in `wrote`, or the animal did not change — and this function
 * is handed its verdict already formed. There is exactly one `ok` test below and
 * no other input from which success could be re-derived, so the two can never
 * drift apart or disagree. Making it structurally impossible was the point;
 * asserting that two copies of a rule agree is how they stop agreeing.
 *
 * ## Why a separate write, and not a field on the push payload
 *
 * `auditRowFor` in `signoff.ts` still leaves `signoff` empty and MUST keep doing
 * so — `tests/tools/species-signoff.test.ts` holds it to that. The row travels in
 * the push REQUEST, which is built before the server has been asked to do
 * anything, and at that moment nothing has been written and there is nothing to
 * sign off. Only the reply knows whether the animal moved. That is the honest
 * ordering and it is what makes a failed push safe: the sign-off is a second act
 * that a failure never reaches.
 *
 * It goes through `/api/save`, which MERGES rather than overwrites (so his notes
 * and verdicts survive it) and which already calls `regenerateSignoffs` — so
 * `src/island/species/signed-off.json` is rewritten by his press of the button
 * and the animal joins the egg pool with no further ceremony. That is the
 * standing order in `MANAGER-ORDERS.md` working as written.
 */
export interface SignoffSave {
  what: 'names'
  patch: { id: string; signoff: string }
}

/**
 * The sign-off a successful push writes, or `null` if it did not succeed.
 *
 * `APPROVED` is imported from `approver.ts` rather than spelled again here. It is
 * the same field, on the same row, meaning the same thing, and a second copy of
 * `'ok'` in this file would be a second definition of what shipping means.
 */
export function signoffPatch(outcome: PushOutcome, speciesId: string): SignoffSave | null {
  /* THE one gate. Never `!reply.error`, never a re-reading of `wrote`. */
  if (!outcome.ok) return null
  const id = speciesId.trim()
  /* No id, no row to sign — and never a patch aimed at `natural/`. */
  if (!id) return null
  return { what: 'names', patch: { id: `natural/${id}`, signoff: APPROVED } }
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
  /**
   * **This is an EDIT of a species that is already built, not a new one.**
   *
   * Joe's bug, 2 August: `push.mjs` never writes over a built species, and all
   * thirty are built, so editing a shipped animal and pressing the button could
   * not change it — place 1 was skipped every time. The guard is right; what it
   * lacked was a way to say the request is the sanctioned circumstance its own
   * comment describes, which is "on purpose, in an editor, with git watching".
   *
   * So this is an explicit INTENT and not an inference. The server treats
   * anything but a literal `true` as a new species, and a new species whose id
   * collides with a built one still gets the refusal word for word — which is
   * the case the guard exists for and the one it must keep catching.
   *
   * Its value is PROVENANCE, not a constant: `main.ts` holds the map
   * `loadBuiltDefs()` returned, so `defs.has(speciesId)` is literally "the
   * definition on screen came out of the game". A species drawn from
   * `blankDef()` or `cloneAs`d under a new id is not in that map and pushes as a
   * create.
   */
  replace: boolean
  /**
   * How it gets about, Joe's own word — absent when he has not ruled on it.
   * Deliberately NOT sent inside `record`: `withRecord` skips a `defineSpecies`
   * call that already exists, and thirty species are already pushed, so a value
   * living there would be unreachable for exactly the animals it is for. This
   * travels on its own and is upserted straight into `moves.ts`'s table instead.
   */
  moves?: string
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
export function recordFor(speciesId: string, species: string, today: string): string {
  return [
    '  /*',
    `   * ${species}. Pushed from the species editor on ${today}.`,
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
/*
 * There is no `draftId` here any more, and there is nothing to replace it with.
 * A draft used to carry a dealt `SD-nnn` and the record said "pushed from the
 * species editor as SD-003"; a draft is now keyed by its `speciesId`, so the
 * sentence would have read "as animal-fennec-fox" two lines above the id itself.
 */
/*
 * `replace` is the caller's to state, and it is not defaulted. The one thing
 * that knows whether this animal is already in the game is the map
 * `loadBuiltDefs()` returned, which lives in `main.ts`; a default of `false`
 * here would quietly reinstate Joe's bug the day somebody added a second call
 * site, and a default of `true` would hand the "delete it yourself first"
 * refusal a way to be bypassed by a new species that never claimed to be an
 * edit.
 */
export function pushRequest(
  speciesId: string, def: CreatureDef, view: SignoffView, today: string, replace: boolean,
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
    record: recordFor(speciesId, view.species, today),
    after: membersAfter(speciesId, view.collection),
    auditRow: auditRowFor(view),
    factRow: factRowFor(view),
    moves: view.moves === '' ? undefined : view.moves,
    replace,
  }
}
