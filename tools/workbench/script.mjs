/**
 * `voice/scripts.json` → a flat list of things to bake.
 *
 * The ledger was written before the bake existed, so until now it had no
 * consumer at all: `bake.mjs` reads LESSONS, and every spoken line in the game
 * was recorded in `voice/scripts.json` and then never rendered. This module is
 * the missing half — it turns the ledger into bake units of exactly the shape
 * `bakeOne` already takes, so the console's staleness contract, its manifest
 * and its measured `ms` all apply to Fred's script for free.
 *
 * Three things it must get right, all of them laws from `docs/pet-island-voice.md`:
 *
 * 1. **A unit is per CHARACTER.** §3's splice law forbids cross-voice splices,
 *    so the character on the line picks the cast entry, and a caller asks for
 *    the characters it wants. Nothing here bakes "everything": the teacher's
 *    ~1,700 clips and `dad`'s booth recordings are not this file's business and
 *    a stray flag must not be able to fire them.
 *
 * 2. **A template is never baked as written.** `gov.spaceSurplus` reads
 *    "Let's read with the egg — {n} more {friend|friends} will fill it up!" and
 *    the number is a fact about her island at the moment Fred opens his mouth.
 *    It cuts into a head, a spliced numeral, and a tail — and the TAIL BAKES
 *    TWICE, once singular and once plural, because "1 more friends will fill it
 *    up" is a sentence a child learning to read must never be shown.
 *
 * 3. **`count.` is Fred's.** The numerals spliced into Fred's sentences are
 *    Fred's own larynx, not the teacher's, for the same §3 reason. They are
 *    generated rather than written out in `lines[]`, so they are expanded here
 *    from the `generated` entry's declared range.
 *
 * The other three generated families are deliberately NOT expandable here.
 * `name.`, `word.` and `species.` are the teacher's and are sourced from other
 * files entirely (the name table, the band packs, `src/island/script.ts`);
 * `phoneme.` is `dad`, from the sound booth, and is blocked on Joe. Asking for
 * them throws rather than silently baking nothing, so a future run that wants
 * them has to come here and say where the words come from.
 */
import { readJson } from './repo.mjs'

export const SCRIPTS = 'voice/scripts.json'

/** Where a script clip lands, unless `joe/voices.json` overrides it. */
export const DEFAULT_SCRIPT_DIR = 'src/island/public/voice/script'

export class ScriptError extends Error {}

/**
 * Fred's numerals, as WORDS.
 *
 * Baked from "three" rather than from "3" so what is synthesized is what was
 * audited. Azure normalises digits itself and its choice is neither visible in
 * this file nor stable across voices; a word is a word.
 */
export const NUMERAL_WORDS = [
  'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
  'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen',
  'eighteen', 'nineteen', 'twenty',
]

/** The families this module knows how to turn into text. */
const EXPANDABLE = {
  'count.': entry => {
    const m = /^(\d+)\s*-\s*(\d+)$/.exec(String(entry.count ?? ''))
    if (!m) throw new ScriptError(`the count. family's "count" must read like "1-20", not ${JSON.stringify(entry.count)}`)
    const [from, to] = [Number(m[1]), Number(m[2])]
    if (from < 1 || to > NUMERAL_WORDS.length) {
      throw new ScriptError(`count. asks for ${from}-${to} but only 1-${NUMERAL_WORDS.length} have words in NUMERAL_WORDS`)
    }
    const out = []
    for (let n = from; n <= to; n++) out.push({ id: `count.${n}`, script: NUMERAL_WORDS[n - 1] })
    return out
  },
}

export const loadScripts = root => readJson(root, SCRIPTS, null)

/** A line is a template iff its text carries a slot. */
export const isTemplate = text => /\{[^}]*\}/.test(String(text ?? ''))

/**
 * Cut a template into the pieces that can actually be baked.
 *
 * The seam is where `{n}` sits, which by script design is already a natural
 * pause — the em dash in `gov.spaceSurplus`, the exclamation in
 * `gov.nurseryQueue` — as §3 asks. The head keeps its own punctuation, so what
 * Azure is handed ends on the same breath Fred would take anyway.
 *
 * Returns `[{ suffix, script }]`. `head` always; then either one `tail`, or
 * `tail.one` and `tail.many` when the tail carries an `{a|b}` noun slot.
 */
export function splitTemplate(text) {
  const src = String(text)
  const at = src.indexOf('{n}')
  if (at === -1) throw new ScriptError(`a template must carry the {n} slot: ${JSON.stringify(src)}`)

  const head = src.slice(0, at).trim()
  const tail = src.slice(at + 3).trim()
  if (!head) throw new ScriptError(`nothing to bake before the {n} slot: ${JSON.stringify(src)}`)
  if (!tail) throw new ScriptError(`nothing to bake after the {n} slot: ${JSON.stringify(src)}`)

  const pieces = [{ suffix: 'head', script: head }]

  const noun = /\{([^}|]*)\|([^}]*)\}/.exec(tail)
  if (!noun) {
    /*
     * Kept as its own message because it is the more diagnostic one: a lone
     * `{friend}` in a tail is a noun pair somebody forgot to write both halves
     * of, and saying so is more use than the general sweep below saying a brace
     * got through.
     */
    if (isTemplate(tail)) throw new ScriptError(`unrecognised slot in a tail: ${JSON.stringify(tail)}`)
    pieces.push({ suffix: 'tail', script: tail })
  } else {
    /*
     * Both forms, always. This is the whole reason the ledger spells the noun out
     * as `{friend|friends}` rather than the code bolting on an `s`: a plural rule
     * in code is a rule that will one day meet a word it is wrong about, in front
     * of a child who is reading it.
     */
    pieces.push({ suffix: 'tail.one', script: tail.replace(noun[0], noun[1]).trim() })
    pieces.push({ suffix: 'tail.many', script: tail.replace(noun[0], noun[2]).trim() })
  }

  /*
   * The sweep runs over EVERY piece and on every path, head included.
   *
   * It used to sit inside the noun-pair branch, so a template whose tail had no
   * `{a|b}` returned early and a slot in the HEAD went unchecked — Azure would
   * have read the braces out loud. Today's two templates both carry noun pairs
   * and so both reached the guard, which is exactly the kind of luck that hides
   * a hole until the line nobody has written yet arrives.
   */
  const rest = pieces.map(p => p.script).find(isTemplate)
  if (rest) throw new ScriptError(`a slot survived the cut, so the line would be baked with braces in it: ${JSON.stringify(rest)}`)
  return pieces
}

/**
 * Every bakeable unit for the characters asked for.
 *
 * A unit is `{ id, script, character, out, from }` — `from` naming the ledger
 * entry it came from, so the console and the CLI can say *why* a clip exists
 * without re-deriving it. `out` is a full repo-relative path, which is what
 * tells `bakeOne` this is a script clip and not a lesson.
 *
 * Lines carrying a `ref` but no text of their own (`open.nameSlot`) are slots,
 * not lines: they are filled from a generated family at speak time and there is
 * no sentence to render. They are skipped, not failed.
 */
export function scriptUnits(root, { characters = ['fred'], scriptDir = DEFAULT_SCRIPT_DIR } = {}) {
  const file = loadScripts(root)
  if (!file) throw new ScriptError(`${SCRIPTS} is missing — there is nothing to bake`)

  const wanted = new Set(characters)
  const units = []
  const push = (id, script, character, from) => {
    /*
     * `status: 'vetted'` is a statement about the FILE, not a rubber stamp. A
     * lesson is drafted in the console and vetted by Joe's red pen, so its
     * status is per-lesson; a line only reaches `voice/scripts.json` once it is
     * the agreed wording, which is what "no spoken line may be added to the
     * island without an entry here" means. Without it `bakeState` would report
     * every one of Fred's lines as `unscripted`, which is the lesson
     * vocabulary and is simply untrue of them.
     */
    units.push({ id, script, character, out: `${scriptDir}/${id}.opus`, from, status: 'vetted' })
  }

  for (const line of file.lines ?? []) {
    if (!wanted.has(line.character)) continue
    if (!line.text?.trim()) continue /* a slot line; its clip comes from a generated family */

    if (!isTemplate(line.text)) { push(line.id, line.text.trim(), line.character, line.id); continue }

    if (!line.ref) throw new ScriptError(`${line.id} is a template but names no generated family in "ref"`)
    for (const piece of splitTemplate(line.text)) {
      push(`${line.id}.${piece.suffix}`, piece.script, line.character, line.id)
    }
  }

  for (const entry of file.generated ?? []) {
    if (!wanted.has(entry.character)) continue
    const expand = EXPANDABLE[entry.idPrefix]
    if (!expand) {
      throw new ScriptError(
        `the ${entry.idPrefix} family (${entry.character}) has no text source in script.mjs, so it cannot be baked from this file. ` +
        `Its words live elsewhere — see the family's "source" field — and wiring them up is a deliberate act, not a default.`,
      )
    }
    for (const u of expand(entry)) push(u.id, u.script, entry.character, entry.idPrefix)
  }

  const seen = new Set()
  for (const u of units) {
    if (seen.has(u.id)) throw new ScriptError(`two units claim the id ${u.id}`)
    seen.add(u.id)
  }
  return units
}
