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

/* The ladder's length, mirrored rather than imported: `core/` may not depend on
   `island/`. `tests/island/reading-ladder.test.ts` pins the two together. */
const STAGES_READING_LENGTH = 10

export interface ReadPick { w: MarkedWord; cls: WordClass }
export interface ReadState { history: ReadPick[][]; idx: number }
export interface ReadDeps {
  rng: Rng
  drawGreen: () => PlainWord
  drawRed: () => MarkedWord
  neigh: NeighbourMap
  level: number
  /**
   * The deck for this level's approved rung words, or null when the level has
   * none. Supplied by the caller because the DECK must outlive one deal — a
   * deck rebuilt per page forgets what it has dealt and the no-repeat guarantee
   * goes with it. See `main.ts`, where it is created beside `drawGreen`.
   */
  drawRung?: (level: number) => (() => MarkedWord) | null
  /**
   * Near-twins for this level's rung words, or null when the level has none.
   *
   * Separate from `neigh` because that one is built over `GREEN`/`RED` and
   * knows nothing about a rung's vocabulary. Supplied by the caller for the
   * same reason as the deck: the map is derived from the whole word list and
   * is worth building once per level rather than once per page.
   */
  rungNeigh?: (level: number) => NeighbourMap | null
  /** 0-based position on `STAGES.reading`. Defaults to the bottom, which is the
   *  historical two-twin behaviour, so an old caller is unchanged. */
  rungIndex?: number
}

/**
 * How many near-twins to plant on a page of `n` words at ladder position
 * `rungIndex` (0-based, the INDEX into `STAGES.reading`, not the generator id).
 *
 * Joe, 5 August: *"there is evidence of her searching for the first word only."*
 * The near-twin mechanism (`neighbours.ts`, one edit apart, `sat`/`sit`) has
 * always existed to make first-letter guessing lose — it was just set to two per
 * page, so a twelve-word page left ten words winnable on the first letter.
 *
 * A DIAL AND NOT A RUNG. Rungs are exclusive: a child is dealt from one
 * generator at a time, so a "whole word reading" rung is one she meets and then
 * CLIMBS PAST, and the habit returns on the next rung, where the words are least
 * familiar. A habit is not a stage.
 *
 * The floor is the historical formula (`min(2, max(1, floor(n / 4)))`), so the
 * bottom rung behaves exactly as every page did before this — `golden.json`
 * pins level 1's stream at every page length from 3 to 12 words, not just the
 * full page, so the floor must match the old formula's output at EVERY n, not
 * just settle on 2. The ceiling is half the page, because each twin REPLACES
 * a word already picked — asking for more than half would spend the whole page
 * on pairs and leave nothing for the twins to sit among.
 */
export function twinTarget(rungIndex: number, n: number): number {
  const floor = Math.min(2, Math.max(1, Math.floor(n / 4)))
  const ceiling = Math.floor(n / 2)
  const span = Math.max(1, STAGES_READING_LENGTH - 1)
  const t = Math.min(1, Math.max(0, rungIndex / span))
  return Math.max(1, Math.min(ceiling, Math.round(floor + t * (ceiling - floor))))
}

/**
 * Swap `target` of the page's words for near-twins of the words already on it,
 * so a child cannot win by reading only the first letter.
 *
 * LIFTED VERBATIM out of the level-1 body rather than rewritten, and that is
 * load-bearing: `golden.json` pins level 1's stream, so every `shuffle` and
 * `ri` here has to happen in exactly the order it did when this was inline.
 * It is a move, not a reimplementation.
 *
 * It is shared because the rung pages need it too. Until 6 August they did not
 * have it: the rung branch returned before this loop, so every new rung planted
 * ZERO twins — the ladder switched off the counter-measure at exactly the point
 * a child climbs past the words she knows, which is the opposite of what the
 * dial was built for (PB-087).
 *
 * `used` and `usedGroups` are mutated in place: a twin that replaces a word has
 * to free that word's confusable group, or the page can end up holding both
 * `to` and `too` by the back door.
 */
function plantTwins(
  picks: ReadPick[], neigh: NeighbourMap, rng: Rng,
  used: Set<string>, usedGroups: Set<number>, target: number,
): void {
  const locked = new Set<number>()
  let made = 0
  for (const i of shuffle(rng, picks.map((_, j) => j))) {
    if (made >= target) break
    const pw = plainWord((picks[i] as ReadPick).w)
    const cands = (neigh[pw] ?? []).filter(c => {
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
    const nb = cands[ri(rng, cands.length)] as { raw: MarkedWord; cls: WordClass }
    picks[victim] = { w: nb.raw, cls: nb.cls }
    used.add(plainWord(nb.raw))
    if (groupOf[plainWord(nb.raw)] !== undefined) usedGroups.add(groupOf[plainWord(nb.raw)] as number)
    locked.add(i); locked.add(victim); made++
  }
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

  /*
   * A RUNG PAGE. Its own words, its own early return, and NOTHING below this
   * point runs for it — the same shape the alien branch uses above, and for the
   * same reason: `golden.json` pins level 1's stream, so the level-1 body must
   * consume randomness exactly as it always has. Level 1 is therefore walled
   * off explicitly (not just left to `drawRung` returning null for it) — the
   * pin holds even if a caller ever wires an approved list under id 1.
   *
   * A rung with no approved words FALLS THROUGH deliberately. Unvetted is
   * invisible, and an empty rung that dealt an empty page would be a blank
   * screen; falling back to the page every child already gets is the graceful
   * half of that rule.
   */
  const rungDraw = d.level !== 1 ? (d.drawRung?.(d.level) ?? null) : null
  if (rungDraw) {
    const n = Math.min(MAX, MIN + s.history.length)
    const used = new Set<string>()
    /* The same confusable protection the legacy body below applies — the spec
     * lists it under "what this does not change", and a drafted rung can
     * perfectly well contain both `to` and `too`. A listening game with both
     * on screen is a trap, not a test (wordlists.ts). */
    const usedGroups = new Set<number>()
    const picks: ReadPick[] = []
    let guard = 0
    while (picks.length < n && guard++ < n * 40) {
      const w = rungDraw()
      const pw = plainWord(w)
      if (used.has(pw) || (groupOf[pw] !== undefined && usedGroups.has(groupOf[pw] as number))) continue
      used.add(pw)
      if (groupOf[pw] !== undefined) usedGroups.add(groupOf[pw] as number)
      picks.push({ w, cls: 'green' })
    }
    /*
     * AND THE RUNG GETS ITS TWINS TOO (PB-087). Before this it returned here,
     * so every rung above the starting page planted none at all — the dial that
     * exists because Joe watched his daughter hunt on first letters was switched
     * off for precisely the pages she climbs to.
     *
     * The map comes from the caller and is built over THIS RUNG'S OWN WORDS.
     * `d.neigh` is built from `GREEN`/`RED` (`buildPool`), so it holds no entry
     * for `frost` or `playground` and planting from it would find nothing —
     * a silent no-op that would have looked exactly like the bug being fixed.
     */
    const rungNeigh = d.rungNeigh?.(d.level) ?? null
    if (rungNeigh) {
      plantTwins(picks, rungNeigh, d.rng, used, usedGroups,
        twinTarget(d.rungIndex ?? 0, picks.length))
    }
    shuffle(d.rng, picks)
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
  plantTwins(picks, d.neigh, d.rng, used, usedGroups, twinTarget(d.rungIndex ?? 0, n))

  shuffle(d.rng, picks)
  s.history.push(picks)
  s.idx = s.history.length - 1
}
