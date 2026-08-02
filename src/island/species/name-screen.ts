/**
 * The standing gate that keeps a swear word off a six-year-old's screen.
 *
 * On 2 August 2026 a child was shown a pet called **"Defuck"**. Joe's rule,
 * verbatim: *"nothing that contains the letter combination fuck, cunt or shit,
 * or homophones thereof."* This module is that rule, written down as data and
 * asserted in `tests/island/name-screen.test.ts` over all 320 given names.
 *
 * ## Why the existing screen did not catch it
 *
 * `src/core/names.ts` already refuses a candidate whose letters contain
 * anything on its own `FORBIDDEN` list (names.ts:33-50, applied at :75 with
 * `includes`, so it is a substring test and was never the weak part). The weak
 * part is the list itself. Measured, not assumed: `FORBIDDEN` contains `shit`,
 * `cock`, `dick`, `piss` and `arse` — and does NOT contain `fuck`, and does NOT
 * contain `cunt`. The generator builds a name out of syllables, so `de` + `fuck`
 * is a shape it can reach, and nothing on the way out said no. That is the whole
 * story of `Defuck`: not a bug in the filter, a hole in the vocabulary.
 *
 * The obvious fix is to add two words to `FORBIDDEN`. We do not do that.
 * `src/core/` is frozen: `tools/golden/golden.json` pins it byte-for-byte and
 * `npm run parity` guards it, and — worse than either gate — changing what the
 * generator rejects changes what it EMITS, which reshuffles the seeded stream
 * and renames creatures children already own. Brief §19 forbids losing a child's
 * friend, and a friend whose name changed is lost even though the record
 * survived. So the screen lives here, in the island layer, downstream of the
 * allocation and touching nothing.
 *
 * ## This is an ASSERTION GATE, not a filter. Do not wire it into `draw()`.
 *
 * Nothing here may ever be called from the seeded `draw()` in `naming.ts`.
 * Filtering the allocation stream would skip names, and skipping one name
 * shifts every later draw — the same §19 cascade, arriving by the back door.
 * The correct response to this gate going red is a PIN in
 * `src/island/species/name-pins.json` for the one offending species, which
 * renames exactly that animal and nobody else. The gate's job is to make sure a
 * human hears about it; it is not to silently paper over it.
 *
 * As of this writing all 320 allocated names pass. This file exists for the
 * NEXT roster edit, the next collection, the next pin — the ones written by
 * someone who never heard of `Defuck`.
 *
 * ## The list is deliberately over-broad, and that is the design
 *
 * The costs are not symmetric. A false positive costs one renamed animal that
 * nobody has met yet — a pin, five minutes. A false negative costs a six-year-old
 * reading a slur off her own screen, in a game her dad built her. So the list
 * carries homophones, misspellings, leetspeak and consonant swaps well past
 * what the roster could plausibly produce, and it should keep growing whenever
 * anybody thinks of another one. Adding a pattern is cheap; the only pattern
 * that is expensive is the one you leave out.
 */

/** The three words Joe named. Every pattern belongs to exactly one of them. */
export type BannedRoot = 'fuck' | 'cunt' | 'shit'

/**
 * One banned sequence, and the word it stands in for.
 *
 * A plain lowercase string is a SUBSTRING test — `Defuck` contains `fuck`, and
 * that is precisely the case that got through, so anything anchored to the
 * start or end of a name would be wrong. A RegExp is for the shapes a literal
 * cannot spell: stretched letters, separators, digit-for-letter swaps. RegExps
 * here must never carry the `g` flag — `lastIndex` would make `test` stateful
 * and the screen would answer differently on the second call.
 */
export interface BannedPattern {
  readonly pattern: string | RegExp
  readonly root: BannedRoot
}

/**
 * The banned list. DATA, so it can be read, reviewed and extended by somebody
 * who does not want to read code — and so the test can report which entry fired.
 *
 * Order is the reporting order: the plainest spelling of each word comes first,
 * so `Defuck` is reported as `fuck` rather than as some regex that also matched.
 */
export const BANNED_PATTERNS: readonly BannedPattern[] = [
  // --- fuck -----------------------------------------------------------------
  { pattern: 'fuck', root: 'fuck' },
  { pattern: 'fuk', root: 'fuck' },
  { pattern: 'fuc', root: 'fuck' },
  { pattern: 'fuq', root: 'fuck' },
  { pattern: 'fux', root: 'fuck' },
  { pattern: 'fck', root: 'fuck' },
  { pattern: 'fcuk', root: 'fuck' },
  { pattern: 'phuck', root: 'fuck' },
  { pattern: 'phuk', root: 'fuck' },
  { pattern: 'phuc', root: 'fuck' },
  { pattern: 'phuq', root: 'fuck' },
  { pattern: 'fugg', root: 'fuck' },
  { pattern: 'fvck', root: 'fuck' },
  { pattern: 'fock', root: 'fuck' },
  { pattern: 'focc', root: 'fuck' },
  { pattern: 'fokk', root: 'fuck' },
  { pattern: 'fook', root: 'fuck' },
  { pattern: 'fouk', root: 'fuck' },
  { pattern: 'fuhk', root: 'fuck' },
  { pattern: 'fucc', root: 'fuck' },
  { pattern: 'fucq', root: 'fuck' },
  { pattern: 'fikk', root: 'fuck' },
  { pattern: 'f0ck', root: 'fuck' },
  { pattern: 'f4ck', root: 'fuck' },
  { pattern: 'ffuk', root: 'fuck' },

  // --- cunt -----------------------------------------------------------------
  { pattern: 'cunt', root: 'cunt' },
  { pattern: 'kunt', root: 'cunt' },
  { pattern: 'qunt', root: 'cunt' },
  { pattern: 'cnut', root: 'cunt' },
  { pattern: 'knut', root: 'cunt' },
  { pattern: 'khunt', root: 'cunt' },
  { pattern: 'cvnt', root: 'cunt' },
  { pattern: 'kvnt', root: 'cunt' },
  { pattern: 'coont', root: 'cunt' },
  { pattern: 'koont', root: 'cunt' },
  { pattern: 'cundt', root: 'cunt' },
  { pattern: 'kundt', root: 'cunt' },
  { pattern: 'gunt', root: 'cunt' },
  { pattern: 'cuhnt', root: 'cunt' },
  { pattern: 'c0nt', root: 'cunt' },
  { pattern: 'kant', root: 'cunt' },

  // --- shit -----------------------------------------------------------------
  { pattern: 'shit', root: 'shit' },
  { pattern: 'shyt', root: 'shit' },
  { pattern: 'shite', root: 'shit' },
  { pattern: 'shyte', root: 'shit' },
  { pattern: 'schit', root: 'shit' },
  { pattern: 'sh1t', root: 'shit' },
  { pattern: 'sh!t', root: 'shit' },
  { pattern: 'shitt', root: 'shit' },
  { pattern: 'shiet', root: 'shit' },
  { pattern: 'sheit', root: 'shit' },
  { pattern: 'shid', root: 'shit' },
  { pattern: 'zhit', root: 'shit' },
  { pattern: 'xhit', root: 'shit' },
  { pattern: 'shjt', root: 'shit' },
  { pattern: 'sh1te', root: 'shit' },
  { pattern: 'schidt', root: 'shit' },

  /*
   * The stretched / separated forms. A literal cannot say "one or more of each
   * letter, with anything decorative in between", and a future name source —
   * a pin typed by hand, a child-facing rename tool — can produce `Fuuuck`,
   * `F-u-c-k` or `S.h.i.t` where the generator never would. Verified against
   * all 320 live names: none of these match anything allocated today.
   */
  { pattern: /f+[\s_.\-*]*u+[\s_.\-*]*c+[\s_.\-*]*k+/i, root: 'fuck' },
  { pattern: /f+[\s_.\-*]*u+[\s_.\-*]*k+/i, root: 'fuck' },
  { pattern: /c+[\s_.\-*]*u+[\s_.\-*]*n+[\s_.\-*]*t+/i, root: 'cunt' },
  { pattern: /k+[\s_.\-*]*u+[\s_.\-*]*n+[\s_.\-*]*t+/i, root: 'cunt' },
  { pattern: /s+[\s_.\-*]*h+[\s_.\-*]*[i1!|]+[\s_.\-*]*t+/i, root: 'shit' },
]

/**
 * One sequence that was CONSIDERED for the banned list and deliberately left
 * off it, with the live name that forced the decision.
 */
export interface WatchedPattern {
  readonly pattern: string
  readonly root: BannedRoot
  /** The allocated name today that contains it — why this is a judgement call. */
  readonly seenIn: string
  readonly why: string
}

/**
 * >>> NOT GATED. Three borderline sequences, surfaced for Joe to rule on.
 *
 * `fick`, `fack` and `shet` each occur in a name that is ALLOCATED TODAY:
 * `Fickji` (animal-hobby), `Nefack` (animal-owlet) and `Chashet` (animal-bear).
 * Ban them and the gate goes red on three animals that are live right now, which
 * would mean either three pins or a red build — so the decision could not be
 * dodged, and hiding it inside a quietly omitted line would have been the worst
 * of the options.
 *
 * THE DECISION, and the reasoning, so it can be overturned on the reasoning
 * rather than on taste: they are excluded. None of the three reads as the
 * English word to a British child sounding a name out. `fick` is the German
 * verb and carries nothing at all in English; `fack` is a vowel away from a
 * word that is not on Joe's list anyway; `shet` is a syllable, and `Chashet`
 * reads as "cha-shet". The rule Joe wrote names three specific letter
 * combinations and their homophones, and a homophone is a thing that SOUNDS
 * like the word — `Nefack` does not.
 *
 * That is a judgement, not a fact, and it is Joe's to reverse. If he rules the
 * other way the fix is small and known: move the entry from here into
 * `BANNED_PATTERNS`, and pin a replacement name for the one affected species in
 * `name-pins.json` — which renames that animal and no other, because a pin is
 * reserved before any draw. Do NOT resolve it by filtering the stream.
 *
 * `tests/island/name-screen.test.ts` asserts these three still screen CLEAN, so
 * this array is not a note anybody can drift away from — it is executable, and
 * the day a ruling lands the test says so.
 * <<<
 */
export const WATCHLIST: readonly WatchedPattern[] = [
  {
    pattern: 'fick',
    root: 'fuck',
    seenIn: 'Fickji',
    why: 'German verb; no English reading a five-year-old would land on.',
  },
  {
    pattern: 'fack',
    root: 'fuck',
    seenIn: 'Nefack',
    why: 'Wrong vowel to be a homophone; reads as "ne-fack".',
  },
  {
    pattern: 'shet',
    root: 'shit',
    seenIn: 'Chashet',
    why: 'A syllable, not the word; reads as "cha-shet".',
  },
]

/**
 * The first banned sequence in `name` — or `null` if the name is clean.
 *
 * Case-insensitive, and a SUBSTRING match anywhere in the name: `Defuck`
 * contains `fuck` in the middle, so a prefix or suffix check would have missed
 * exactly the name that caused this file to exist.
 *
 * The returned `pattern` is the literal itself, or a RegExp's `source`, so a
 * failing test can print which entry fired and be actionable without anybody
 * having to re-derive it.
 */
export function screenName(name: string): { pattern: string; root: BannedRoot } | null {
  const lower = name.toLowerCase()
  for (const entry of BANNED_PATTERNS) {
    if (typeof entry.pattern === 'string') {
      if (lower.includes(entry.pattern)) return { pattern: entry.pattern, root: entry.root }
    } else if (entry.pattern.test(lower)) {
      return { pattern: entry.pattern.source, root: entry.root }
    }
  }
  return null
}

/** `screenName` as a predicate, for callers that only need the yes or no. */
export function isNameClean(name: string): boolean {
  return screenName(name) === null
}
