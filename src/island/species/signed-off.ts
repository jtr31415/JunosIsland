/**
 * Which species Joe has signed off — the only list the game may ship from.
 *
 * THE RULE, which is his and is not open: an animal that is not signed off
 * never reaches a child, and one that is signed off always does. There is no
 * third state and no approval step beyond his tick — the moment a creature is
 * ticked it joins the pool eggs are dealt from, with no further ceremony. Any
 * code that wants to know "may this animal ship" asks `isSignedOff`, and any
 * code that wants the pool starts from `SIGNED_OFF_SPECIES` and intersects it
 * with what is actually registered (`registry.ts`) — signed off and buildable
 * are two different questions and both have to be yes.
 *
 * WHAT THIS MIRRORS. `joe/names-audit.json` is the truth: one record per
 * creature, field `signoff`, value `'ok'` when he has ticked it. This module
 * does not read that file, and cannot.
 *
 * WHY A GENERATED MIRROR RATHER THAN A READ OF HIS FILE. Two hard walls, and
 * each one alone would be enough:
 *
 *   - `joe/` is outside the vite root. The island is built with `src/island` as
 *     its root (`vite.island.config.ts`), so his folder is never served in dev
 *     and never bundled for production. An import or a fetch of it would fail
 *     in the browser, not merely be untidy.
 *   - `src/` may not name the dev tooling that maintains it. `npm run channel`
 *     (`tools/smoke/channel.mjs`) greps every shipped file for a reference to
 *     the workbench and fails the build if it finds one — including inside a
 *     comment. That gate is why this comment says "the workbench" in words.
 *
 * So the boundary is crossed once, in node, by a script that belongs to neither
 * side: `tools/species/signoffs.mjs` reads his file and writes
 * `./signed-off.json`. The data flows one way only.
 *
 * HOW IT STAYS CURRENT. The generator runs on every save of the names audit
 * from the local editing tool, so Joe's tick alone changes this file in the
 * working tree and the next push ships the animal. It can also be run by hand:
 * `npm run signoffs`. If the mirror ever disagrees with his file,
 * `tests/island/signed-off.test.ts` fails and names the command to run — the
 * drift is loud rather than silent, which is the entire reason a mirror is
 * acceptable at all.
 *
 * EMPTY IS A LEGAL AND CURRENT ANSWER. No record carries `signoff: 'ok'` yet;
 * the rule was made after the audit rows were generated and applies backwards.
 * An empty list means nothing has been approved, which is exactly what it
 * should mean. Do not seed it, and do not write a caller that assumes it is
 * non-empty.
 */
import mirror from './signed-off.json'

/**
 * Every signed-off species id, sorted and unique. Frozen — the file behind it is
 * generated, so a caller that mutated this would be editing a fact about Joe's
 * judgement and losing the edit on the next save.
 */
export const SIGNED_OFF_SPECIES: readonly string[] = Object.freeze(
  [...((mirror as { species?: readonly string[] }).species ?? [])],
)

const LOOKUP: ReadonlySet<string> = new Set(SIGNED_OFF_SPECIES)

/** Has Joe signed this creature off? THE single call. */
export function isSignedOff(speciesId: string): boolean {
  return LOOKUP.has(speciesId)
}
