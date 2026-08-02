/**
 * Which finished sentence is which baked clip — the lookup half of the player.
 *
 * `voice/scripts.json` is the contract: a line only exists on the island once it
 * has an entry there, and the bake turns those entries into the clips under
 * `src/island/public/voice/script/`. What is missing between the two is a table
 * that runs the other way, from the sentence the code has just finished building
 * to the ids that speak it, because the player is handed a string and nothing
 * else. That table is this file, and it is deliberately DOM-free: no `Audio`, no
 * `window`, nothing to mock — the question "which clips say this?" is a pure one
 * and answering it separately is what makes it testable against the real ledger.
 *
 * The texts below are copied byte for byte out of the ledger, ellipsis and em
 * dash included, and a test re-reads the file to prove they still are. That gate
 * matters more than it looks: reword a line in the code without rewording it in
 * the ledger and nothing breaks loudly — `resolveLine` simply stops recognising
 * the sentence and the player falls back to speech synthesis. That IS the right
 * degradation (voice.md §6 asks for exactly it, and a wrong clip would be far
 * worse than a synthetic voice), but it is silent, so drift has to be caught by
 * a test rather than by an ear.
 */

/** A line that plays as a single baked clip. */
export interface WholeLine { readonly kind: 'whole'; readonly id: string; readonly text: string }

/** A line baked in three pieces: a head, a numeral, and a tail that differs singular/plural. */
export interface TemplateLine { readonly kind: 'template'; readonly id: string; readonly template: string }

export type VoiceLine = WholeLine | TemplateLine

/** Every Fred line that can play as a baked clip. */
export const VOICE_LINES: readonly VoiceLine[] = [
  { kind: 'whole', id: 'open.intro', text: "I'm Fred. It's just me on this little rock." },
  { kind: 'whole', id: 'open.quiet', text: "It's ever so quiet out here." },
  { kind: 'whole', id: 'open.egg', text: 'Ooh! Look! An egg!' },
  { kind: 'whole', id: 'open.fromTheSea', text: 'Eggs come from far across the sea… and they only hatch for someone who reads to them.' },
  { kind: 'whole', id: 'open.askLand', text: 'Every new friend needs somewhere to live… can you find us some land?' },
  { kind: 'whole', id: 'land.counted', text: 'You have found some land for your friends!' },
  { kind: 'whole', id: 'gov.wriggleBreak', text: "Ooh, my legs have gone all wriggly! Let's jump up and have a run about — then come back, your island will be right here." },
  { kind: 'whole', id: 'offer.trickier', text: 'You are doing really well! Would you like some trickier questions? They will get you eggs and tiles faster.' },
  { kind: 'whole', id: 'offer.takingAway', text: 'Would you like to do some taking away?' },

  /*
   * The two counted governor lines (JT-019). Neither has a whole clip to play:
   * the number is a fact about the island at the moment Fred opens his mouth, so
   * the sentence is cut either side of the numeral and spoken as three clips.
   * The tail is baked BOTH ways rather than pluralised in code, because "1 more
   * friends will fill it up!" is a sentence a child learning to read must never
   * be shown, and an `s` rule is a rule that one day meets a word it is wrong
   * about, in front of the child.
   */
  { kind: 'template', id: 'gov.spaceSurplus', template: "Let's read with the egg — {n} more {friend|friends} will fill it up!" },
  { kind: 'template', id: 'gov.nurseryQueue', template: 'They need homes! {n} more {tile|tiles} will do it.' },
]

/**
 * Fred's ids that deliberately stay on speech synthesis, each with the reason.
 *
 * All six are one cause, and it is the splice law (voice.md §3): the shipped
 * code speaks the child's or the pet's name inside Fred's sentence, and a name
 * is not bakeable — it is different on every island. The law's answer is not to
 * splice a name clip into Fred's line but to make the name a line of its own, in
 * the teacher's voice, chained between Fred's, which is why the ledger's wording
 * for these six no longer contains a name at all.
 *
 * So this list is not a backlog of clips somebody forgot to bake. The clips
 * exist; what is out of date is the CODE, and bringing it onto the ledger's
 * wording is item 11 / PB-020's job. Until that lands these sentences never
 * match, which is correct — better a synthetic voice than Fred saying a name
 * he cannot pronounce.
 */
export const NOT_PLAYED: readonly { readonly id: string; readonly why: string }[] = [
  { id: 'open.greet', why: "the code still speaks the child's name — 'Oh! Hello, [NAME].' (item 11)" },
  { id: 'open.askRead', why: "the code still speaks the child's name — 'Will you read to it, [NAME]?' (item 11)" },
  { id: 'open.foundName', why: "the clip is only a PREFIX of what the code speaks: 'You found its name! [PETNAME] has arrived.' (item 11)" },
  { id: 'open.homeAtLast', why: 'the beat is not yet three chained lines, so this wording is never spoken (item 11)' },
  { id: 'hatch.homeAtLast', why: "the code still speaks '[PETNAME] has arrived!' (item 11)" },
  { id: 'hatch.isHere', why: "the code still speaks '[PETNAME] is here!' (item 11)" },
]

/**
 * The numerals that were baked. A count outside this range has no clip.
 *
 * Twenty covers every count the corridor can ask for in ordinary play, but the
 * count is unbounded in principle — it is however far past the wall a child has
 * walked. A number with no clip is therefore an ordinary event and not an error:
 * `resolveLine` answers null and the whole sentence falls back to synthesis,
 * because half a spliced sentence with a hole where the number goes is the one
 * outcome worth avoiding.
 */
export const COUNT_MIN: 1 = 1
export const COUNT_MAX: 20 = 20

/** Render a template exactly as `governorLine` does, so a match can be proved by re-rendering. */
export function renderTemplate(template: string, count: number): string {
  return template
    .replace('{n}', String(count))
    .replace(/\{([^|{}]*)\|([^|{}]*)\}/g, (_, one: string, many: string) =>
      count === 1 ? one : many)
}

/** Every character regex gives a meaning of its own, made literal again. */
const escape = (literal: string): string => literal.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/**
 * A template as a pattern over finished sentences, with the numeral captured.
 *
 * Built from the ledger string rather than written out beside it, so there is
 * one wording in this file and not two that could drift apart.
 */
const patternFor = (template: string): RegExp => {
  let out = ''
  let at = 0
  const slot = /\{n\}|\{([^|{}]*)\|([^|{}]*)\}/g
  for (let m = slot.exec(template); m; m = slot.exec(template)) {
    out += escape(template.slice(at, m.index))
    out += m[0] === '{n}' ? '(\\d+)' : `(?:${escape(m[1] ?? '')}|${escape(m[2] ?? '')})`
    at = m.index + m[0].length
  }
  return new RegExp(`^${out + escape(template.slice(at))}$`)
}

const PATTERNS = new Map<string, RegExp>(
  VOICE_LINES.filter((l): l is TemplateLine => l.kind === 'template')
    .map(l => [l.id, patternFor(l.template)]),
)

/**
 * The clip ids that speak this finished sentence, in order, or null if none do.
 * Returning null is the normal, expected path for every line that is not Fred's.
 */
export function resolveLine(text: string): readonly string[] | null {
  for (const line of VOICE_LINES) {
    if (line.kind === 'whole') {
      if (line.text === text) return [line.id]
      continue
    }

    const found = PATTERNS.get(line.id)?.exec(text)
    if (!found) continue

    const n = Number(found[1])
    if (!Number.isSafeInteger(n) || n < COUNT_MIN || n > COUNT_MAX) return null

    /*
     * Parse, then render the template back and insist on the same sentence.
     * Belt and braces on purpose: a regex that matched loosely — a leading zero,
     * a noun agreeing the other way than the number does — would still produce a
     * clip chain, and that chain would put a WRONG NUMBER in Fred's mouth while
     * sounding entirely fluent. Silence is recoverable; being lied to is not.
     */
    if (renderTemplate(line.template, n) !== text) return null

    return [`${line.id}.head`, `count.${n}`, `${line.id}.tail.${n === 1 ? 'one' : 'many'}`]
  }
  return null
}
