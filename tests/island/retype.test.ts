/**
 * Changing their mind about a tile they have already sited.
 *
 * Joe, 27 July, relaying it live: *"while im writing I got a user complaint:
 * she'd like to change her mind if shes picked a wrong type of tile."* Folded in
 * on the 28th alongside the mountain tile, which is what made it urgent — a third
 * button is a third chance to pick the wrong one.
 *
 * THE FACT THIS RESTS ON is that `sumProgress` lives on the Flow and not on the
 * plot, so changing what is being built keeps every sum already answered. That is
 * why this is allowed at any point in a build rather than only before they start:
 * a child nine sums into the wrong tile is the one who needs it most. If a future
 * change moves progress onto the plot, these tests are what will notice.
 */
import { describe, it, expect, vi } from 'vitest'
import {
  createFlow, askForLand, chooseTile, placeTile, askToRetype, tileOffer, tapSum,
  challengePassed, sumsForTile,
} from '../../src/island/flow'
import type { Flow } from '../../src/island/flow'
import { handleWorldTap } from '../../src/island/interactions'
import type { InteractionPorts } from '../../src/island/interactions'
import { place } from '../../src/island/world/grid'
import type { Island } from '../../src/island/world/grid'
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))

function ports(over: Partial<InteractionPorts> = {}): InteractionPorts {
  return {
    challengeOpen: () => false,
    eggsPaused: () => false,
    landPaused: () => false,
    invite: vi.fn(),
    storyPlaying: () => false,
    openRead: vi.fn(),
    openSum: vi.fn(),
    greetFred: vi.fn(),
    bouncePet: vi.fn(),
    focusOn: vi.fn(),
    say: vi.fn(),
    clearSay: vi.fn(),
    speak: vi.fn(),
    win: vi.fn(),
    ...over,
  }
}

/** A flow with a grass plot standing at (1,0), nothing paid toward it. */
function sited(): Flow {
  const f = askForLand({ ...createFlow(), phase: 'free' })
  return placeTile(chooseTile(f, 'grass'), { q: 1, r: 0 })
}

describe('tapping the plot re-opens the question', () => {
  it('does nothing when no plot is standing', () => {
    const f = { ...createFlow(), phase: 'free' as const }
    expect(askToRetype(f)).toBe(f)
  })

  it('does nothing mid-challenge, so it cannot interrupt a round', () => {
    const f = { ...sited(), phase: 'challenge' as const }
    expect(askToRetype(f)).toBe(f)
  })

  it('asks again about the SAME hex, leaving the plot where it stands', () => {
    const f = sited()
    const asked = askToRetype(f)
    expect(asked.phase).toBe('placing')
    expect(asked.pending).toEqual({ q: 1, r: 0 })
    expect(asked.chosen).toBeNull()
    // The plot itself is untouched — this is a question, not a demolition.
    expect(asked.plot).toEqual(f.plot)
  })

  it('offers the kinds the rules actually allow at that hex', () => {
    const asked = askToRetype(sited())
    const offer = tileOffer(asked)
    expect(offer).toContain('grass')
    expect(offer.length).toBeGreaterThan(0)
  })

  it('is reached by a tap on the plot, and says so', () => {
    const say = vi.fn()
    const f = sited()
    const next = handleWorldTap(f, { kind: 'plot' }, ports({ say }))
    expect(next.phase).toBe('placing')
    expect(next.pending).toEqual({ q: 1, r: 0 })
    expect(say).toHaveBeenCalled()
  })

  it('a tap on the plot mid-challenge is ignored like every other world tap', () => {
    const f = sited()
    const next = handleWorldTap(f, { kind: 'plot' }, ports({ challengeOpen: () => true }))
    expect(next).toBe(f)
  })
})

describe('choosing again swaps the build without costing them anything', () => {
  it('changes the type and hands the child back to the island', () => {
    const asked = askToRetype(sited())
    const changed = chooseTile(asked, 'water')
    expect(changed.plot?.type).toBe('water')
    expect(changed.plot?.at).toEqual({ q: 1, r: 0 })
    expect(changed.phase).toBe('free')
    expect(changed.pending).toBeNull()
    expect(changed.chosen).toBeNull()
  })

  it('KEEPS every sum already answered — the whole point', () => {
    /*
     * The tile has to be EXPENSIVE for this test to mean anything. Their first
     * costs a single sum, so one correct answer pays it off, the plot commits and
     * progress resets — there would be nothing banked to preserve and the test
     * would pass whatever the code did. Eight tiles in, the curve asks about a
     * dozen.
     */
    let f = askForLand({ ...createFlow(), phase: 'free', tilesEarned: 8 })
    f = placeTile(chooseTile(f, 'grass'), { q: 1, r: 0 })
    expect(sumsForTile(f)).toBeGreaterThan(2)

    f = challengePassed(tapSum({ ...f, phase: 'free' }))
    const banked = f.sumProgress
    expect(banked).toBeGreaterThan(0)
    expect(f.plot).not.toBeNull()            // not paid off yet

    const changed = chooseTile(askToRetype(f), 'water')
    expect(changed.sumProgress).toBe(banked)
    expect(changed.plot?.type).toBe('water')
    // ...and the price did not move under them either.
    expect(sumsForTile(changed)).toBe(sumsForTile(f))
  })

  it('never moves the site they chose', () => {
    let f = askForLand({ ...createFlow(), phase: 'free' })
    f = placeTile(chooseTile(f, 'grass'), { q: 0, r: 1 })
    const changed = chooseTile(askToRetype(f), 'water')
    expect(changed.plot?.at).toEqual({ q: 0, r: 1 })
  })

  it('does not add a tile, or spend one', () => {
    const f = sited()
    const changed = chooseTile(askToRetype(f), 'water')
    expect(changed.island.tiles.size).toBe(f.island.tiles.size)
    expect(changed.tilesEarned).toBe(f.tilesEarned)
    expect(changed.bankedTiles).toBe(f.bankedTiles)
  })

  it('is still bound by the placement rules, and yields grass rather than nothing', () => {
    /*
     * Re-choosing goes through `tileTypeFor` exactly as the first choice did, so
     * it cannot be used to smuggle a tile past the coastline rules. Here water is
     * impossible — the hex is ringed by their fields — and the answer is grass,
     * not a broken pond and not a refusal.
     */
    // Five of their fields around the socket at (1,0), so a pond there could not
    // carry its own beach — nineteen of sixty-four neighbourhoods are drawable
    // and this is not one of them.
    let island: Island = createFlow().island
    for (const [q, r] of [[1, -1], [0, 1], [2, -1], [1, 1]] as const) {
      island = place(island, { q, r }, 'grass')
    }
    let f: Flow = { ...createFlow(), island, phase: 'free' }
    f = placeTile(chooseTile(askForLand(f), 'grass'), { q: 1, r: 0 })
    expect(f.plot).not.toBeNull()
    const changed = chooseTile(askToRetype(f), 'water')
    expect(changed.plot?.type).toBe('grass')
    // ...and the offer would not have shown them the water button either.
    expect(tileOffer(askToRetype(f))).not.toContain('water')
  })

  it('picking the same kind again is harmless', () => {
    const f = sited()
    const changed = chooseTile(askToRetype(f), 'grass')
    expect(changed.plot?.type).toBe('grass')
    expect(changed.phase).toBe('free')
  })
})

/**
 * The half-built tile must be ON THE ISLAND when the panel is not.
 *
 * Joe, 28 July: *"there is never a half built tile, when leaving the incremental
 * build, map goes back to blank and it only resumes when i pick any blank tile
 * socket, without option to change."*
 *
 * `stageFor('sum')` re-parents the plot onto the overlay's turntable, and the
 * turntable goes away with the panel. One `overlay.close()` in main.ts closed
 * without handing the plot back, so it stayed alive — still in `flow.plot`, still
 * holding their sums — parented to something no longer on screen. Their island
 * showed an empty socket. Tapping any socket called `askForLand`, which resumes
 * a standing plot and re-staged it: "it only resumes when I pick a socket".
 *
 * It is asserted against the SOURCE because the fault is in the glue rather than
 * in any function: every unit here behaved correctly and the sequence still lost
 * their tile. That is the same class of bug, and the same kind of test, as the
 * wiring assertions in stretch.test.ts.
 */
describe('no overlay.close() strands the plot on the hidden stage', () => {
  const MAIN = resolve(here, '../../src/island/main.ts')

  /** Comments stripped, so a `close()` written about in prose is not a match. */
  const code = (): string => readFileSync(MAIN, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/[^\n]*/g, '')

  it('hands the stage back before closing, at every single site', () => {
    const lines = code().split('\n')
    const stranded: string[] = []
    lines.forEach((line, i) => {
      if (!line.includes('overlay.close()')) return
      // The teardown may share the line or sit just above it.
      const window = lines.slice(Math.max(0, i - 3), i + 1).join('\n')
      if (!window.includes('stageFor(null)')) stranded.push(`${i + 1}: ${line.trim()}`)
    })
    expect(stranded, 'these close the panel while it still holds their plot')
      .toEqual([])
  })

  it('is checking something — the sites exist to be checked', () => {
    // Guards the guard: a rename of `overlay.close()` would make the test above
    // pass by finding nothing at all.
    const hits = code().split('\n').filter(l => l.includes('overlay.close()'))
    expect(hits.length).toBeGreaterThanOrEqual(4)
  })
})
