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
export interface BuildDeps { rng: Rng; drawGreen: () => MarkedWord; level: number }

/* Verbatim from v0:1169-1170. Note it omits k, x, y and q deliberately. */
const DECOYS = ['b','c','d','f','g','h','j','l','m','n','p','r','s','t','v','w','z',
                'a','e','i','o','u','ch','sh','th','ee','oo','or','ck','ll','ng']

export function generateBuild(s: BuildState, d: BuildDeps): void {
  let w = ''
  let g = 0
  do {
    w = d.level === 2 ? alienWord(d.rng) : plainWord(d.drawGreen())
  } while (w.length < 2 && g++ < 20)

  const segs = markDigraphs(w).flatMap(x => x.k === 'di' ? [x.txt] : x.txt.split(''))
  const segSet = new Set(segs)
  const decoys: string[] = []
  let dg = 0
  while (decoys.length < 3 && dg++ < 60) {
    const c = DECOYS[ri(d.rng, DECOYS.length)] as string
    if (!segSet.has(c) && !decoys.includes(c)) decoys.push(c)
  }
  s.history.push({ w, segs, tray: shuffle(d.rng, [...segs, ...decoys]) })
  s.idx = s.history.length - 1
}
