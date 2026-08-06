/**
 * Word-building generator. Port of generateBuild (v0/junos-words.html:1161-1179).
 *
 * Splits the target into grapheme tiles (digraphs stay whole, plain runs split
 * to single letters), then adds exactly three decoys the word does not need.
 */
import type { MarkedWord, PlainWord } from '../wordlists'
import { plainWord, markDigraphs } from '../segmentation'
import { alienWord } from '../alien'
import { ri, shuffle } from '../rng'
import type { Rng } from '../rng'

export interface BuildItem { w: PlainWord; segs: string[]; tray: string[] }
export interface BuildState { history: BuildItem[]; idx: number }
export interface BuildDeps {
  rng: Rng
  drawGreen: () => MarkedWord
  level: number
  /** `graphemes` keeps `sh` as one tile; `letters` makes her assemble it. */
  granularity?: 'graphemes' | 'letters'
  /**
   * The deck for this level's approved rung words, or null where the level has
   * none — same contract as `ReadDeps.drawRung`, and cached by the same caller
   * for the same reason: a deck rebuilt per deal forgets what it dealt.
   *
   * Without it the build page spells a `GREEN` word whatever rung she has
   * climbed to, which is what it did until 6 August (PB-088): `buildStageFor`
   * computed a stage nothing then consumed.
   */
  drawRung?: (level: number) => (() => MarkedWord) | null
}

/* Verbatim from v0:1169-1170. Note it omits k, x, y and q deliberately. */
const DECOYS = ['b','c','d','f','g','h','j','l','m','n','p','r','s','t','v','w','z',
                'a','e','i','o','u','ch','sh','th','ee','oo','or','ck','ll','ng']

/** The finger-space tile. Joe, 5 August: *"a button with a finger for 'finger
 *  space' for a new word"* — the writing convention taught inside the game
 *  rather than beside it. A phrase is not built until the gap is placed. */
export const FINGER_SPACE = '\u{1F449}'

export function generateBuild(s: BuildState, d: BuildDeps): void {
  /*
   * Level 1 is walled off from the rung deck explicitly, as it is in `read.ts`:
   * `golden.json` pins its stream, and the pin should hold even if a list is
   * ever approved under id 1. A level with no approved words falls through to
   * `GREEN`, so an unstocked rung spells what it always spelt rather than
   * nothing at all.
   */
  const rungDraw = d.level !== 1 && d.level !== 2 ? (d.drawRung?.(d.level) ?? null) : null
  let w = ''
  let g = 0
  do {
    w = d.level === 2 ? alienWord(d.rng)
      : plainWord(rungDraw ? rungDraw() : d.drawGreen())
  } while (w.length < 2 && g++ < 20)

  /*
   * A PHRASE IS DETECTED, NOT DECLARED. The spec gave this a `phrase` flag on
   * the deps, which cannot express the ladder actually approved: rung id 8 is
   * "five-letter nouns AND phrases", so `the plant` and `torch` come off the
   * same list. A per-rung flag would make one of them wrong.
   *
   * A space in the target is the fact itself, so it needs no caller to be told.
   */
  const segs = w.includes(' ')
    ? w.split(' ').flatMap((word, i) => (i ? [FINGER_SPACE, word] : [word]))
    : d.granularity === 'letters'
      ? w.split('')
      : markDigraphs(w).flatMap(x => x.k === 'di' ? [x.txt] : x.txt.split(''))

  /* Letters-only means the digraph TILES go too, or she could still pick `sh`
     off the tray and never assemble it. */
  const pool = d.granularity === 'letters'
    ? DECOYS.filter(c => c.length === 1)
    : DECOYS
  const segSet = new Set(segs)
  const decoys: string[] = []
  let dg = 0
  while (decoys.length < 3 && dg++ < 60) {
    const c = pool[ri(d.rng, pool.length)] as string
    if (!segSet.has(c) && !decoys.includes(c)) decoys.push(c)
  }
  s.history.push({ w, segs, tray: shuffle(d.rng, [...segs, ...decoys]) })
  s.idx = s.history.length - 1
}
