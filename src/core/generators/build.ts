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
  /** True on a phrase rung: the target is words, split on the finger space. */
  phrase?: boolean
}

/* Verbatim from v0:1169-1170. Note it omits k, x, y and q deliberately. */
const DECOYS = ['b','c','d','f','g','h','j','l','m','n','p','r','s','t','v','w','z',
                'a','e','i','o','u','ch','sh','th','ee','oo','or','ck','ll','ng']

/** The finger-space tile. Joe, 5 August: *"a button with a finger for 'finger
 *  space' for a new word"* — the writing convention taught inside the game
 *  rather than beside it. A phrase is not built until the gap is placed. */
export const FINGER_SPACE = '\u{1F449}'

export function generateBuild(s: BuildState, d: BuildDeps): void {
  let w = ''
  let g = 0
  do {
    w = d.level === 2 ? alienWord(d.rng) : plainWord(d.drawGreen())
  } while (w.length < 2 && g++ < 20)

  const segs = d.phrase
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
