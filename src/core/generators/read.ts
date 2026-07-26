/**
 * Reading set generator. Port of generateRead (v0/junos-words.html:773-837).
 *
 * Mutates the state object exactly as the original mutates `store.read`.
 * Every RNG consumption stays in its original position: `take` draws, then the
 * neighbour loop shuffles indices, picks a candidate, and finally the whole
 * set is shuffled. Moving any of these changes every generated round.
 */
import { MIN, MAX } from '../constants'
import { groupOf } from '../wordlists'
import type { MarkedWord, PlainWord, WordClass } from '../wordlists'
import { plainWord } from '../segmentation'
import type { NeighbourMap } from '../neighbours'
import { ri, shuffle } from '../rng'
import type { Rng } from '../rng'
import { alienWord } from '../alien'

export interface ReadPick { w: MarkedWord; cls: WordClass }
export interface ReadState { history: ReadPick[][]; idx: number }
export interface ReadDeps {
  rng: Rng
  drawGreen: () => PlainWord
  drawRed: () => MarkedWord
  neigh: NeighbourMap
  level: number
}

export function generateRead(s: ReadState, d: ReadDeps): void {
  if (d.level === 2) {
    /* alien words: pure decoding — no shape memory, no first-letter shortcuts */
    const n = Math.min(8, MIN + s.history.length)
    const used = new Set<string>()
    const picks: ReadPick[] = []
    while (picks.length < n) {
      const w = alienWord(d.rng)
      if (used.has(w)) continue
      used.add(w)
      picks.push({ w, cls: 'green' })
    }
    s.history.push(picks)
    s.idx = s.history.length - 1
    return
  }

  const n = Math.min(MAX, MIN + s.history.length)
  const reds = n < 4 ? 1 : Math.round(n * 0.35)
  const used = new Set<string>()
  const usedGroups = new Set<number>()
  const picks: ReadPick[] = []

  const clash = (w: MarkedWord): boolean => {
    const pw = plainWord(w)
    return used.has(pw) || (groupOf[pw] !== undefined && usedGroups.has(groupOf[pw] as number))
  }
  const take = (draw: () => MarkedWord, cls: WordClass): void => {
    let w = draw()
    let guard = 0
    while (clash(w) && guard++ < 40) w = draw()
    const pw = plainWord(w)
    used.add(pw)
    if (groupOf[pw] !== undefined) usedGroups.add(groupOf[pw] as number)
    picks.push({ w, cls })
  }
  for (let i = 0; i < reds; i++) take(d.drawRed, 'red')
  for (let i = 0; i < n - reds; i++) take(d.drawGreen, 'green')

  /* neighbour distractors: plant a near-twin (sat/sit) so first-letter guessing loses */
  const pairTarget = Math.min(2, Math.max(1, Math.floor(n / 4)))
  const locked = new Set<number>()
  let made = 0
  for (const i of shuffle(d.rng, picks.map((_, j) => j))) {
    if (made >= pairTarget) break
    const pw = plainWord((picks[i] as ReadPick).w)
    const cands = (d.neigh[pw] ?? []).filter(c => {
      const cp = plainWord(c.raw)
      return !used.has(cp) &&
        !(groupOf[cp] !== undefined && usedGroups.has(groupOf[cp] as number))
    })
    if (!cands.length) continue
    const victim = picks.findIndex((_p, j) => j !== i && !locked.has(j))
    if (victim < 0) break
    const vp = plainWord((picks[victim] as ReadPick).w)
    used.delete(vp)
    if (groupOf[vp] !== undefined) usedGroups.delete(groupOf[vp] as number)
    const nb = cands[ri(d.rng, cands.length)] as { raw: MarkedWord; cls: WordClass }
    picks[victim] = { w: nb.raw, cls: nb.cls }
    used.add(plainWord(nb.raw))
    if (groupOf[plainWord(nb.raw)] !== undefined) usedGroups.add(groupOf[plainWord(nb.raw)] as number)
    locked.add(i); locked.add(victim); made++
  }

  shuffle(d.rng, picks)
  s.history.push(picks)
  s.idx = s.history.length - 1
}
