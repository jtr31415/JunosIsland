import { describe, it, expect } from 'vitest'
import {
  createFlow, tapEgg, tapSum, askForLand, cancelPlacing, challengePassed, challengeFailed,
  chooseTile, placeTile, tileOffer,
} from '../../src/island/flow'
import { hatchProgress, landProgress, pagesForEgg, sumsForTile } from '../../src/island/flow'
import type { Flow } from '../../src/island/flow'
import { itemPay } from '../../src/island/balance'

/*
 * A7 put every price in UNITS, at 2 per completed item. These tests count the
 * things a child actually answers — pages and sums — so they ask in items.
 */
const pagesInItems = (f: Flow): number => Math.ceil(pagesForEgg(f) / itemPay())
const sumsInItems = (f: Flow): number => Math.ceil(sumsForTile(f) / itemPay())
import { count } from '../../src/island/world/grid'

/**
 * Read enough pages to actually hatch. The cost comes from the CURVE, so
 * these helpers ask the flow what it wants rather than assuming a constant —
 * a test that hardcoded 5 would quietly rot the moment balance.json changed.
 */
function readUntilHatch(f: Flow, name = 'Bimo', species = 'animal-fox'): Flow {
  // In ITEMS: pagesForEgg is a price in units, and answering that many pages
  // would hatch the egg and then bank the surplus toward the next one.
  const need = pagesInItems(f)
  for (let i = 0; i < need; i++) f = challengePassed(tapEgg({ ...f, phase: 'free' }), { name, species })
  return f
}

/**
 * Site a plot at `at`, then answer enough sums to finish it.
 *
 * Spec section 2 order throughout: ask for land, pick a type, pick a socket,
 * THEN do the maths that builds it. A helper that skipped straight to the
 * sums would be testing a flow the game no longer has.
 */
function buildTile(f: Flow, at = { q: 1, r: 0 }, type: 'grass' | 'water' = 'grass'): Flow {
  f = askForLand({ ...f, phase: 'free' })
  f = chooseTile(f, type)
  f = placeTile(f, at)
  // A one-sum tile is finished by siting alone, so there may be nothing left.
  while (f.plot) f = challengePassed(tapSum({ ...f, phase: 'free' }))
  return f
}

describe('flow — the earn loop', () => {
  it('starts in free play with one rock and no pets', () => {
    const f = createFlow()
    expect(f.phase).toBe('free')
    expect(count(f.island)).toBe(1)
    expect(f.pets).toHaveLength(0)
    expect(f.bankedTiles).toBe(0)
  })

  it('tapping the egg opens a reading challenge', () => {
    // Reading hatches eggs (brief section 4) — the world law, not a menu
    const f = tapEgg(createFlow())
    expect(f.phase).toBe('challenge')
    expect(f.challenge).toBe('read')
  })

  it('the FIRST egg costs a single page, so the loop teaches itself', () => {
    // Slice-1 spec §1 beat 2 and §4: base 1. The very first hatch must be
    // almost free, or the child never sees what reading is FOR.
    const f = challengePassed(tapEgg(createFlow()), { name: 'Bimo', species: 'animal-fox' })
    expect(f.pets).toHaveLength(1)
  })

  it('later eggs cost progressively more', () => {
    let f = readUntilHatch(createFlow())
    const second = pagesInItems(f)
    expect(second).toBeGreaterThan(1)
    for (let i = 1; i < second; i++) {
      f = challengePassed(tapEgg({ ...f, phase: 'free' }), { name: 'Two', species: 'animal-bee' })
      expect(f.pets).toHaveLength(1)      // not yet
    }
    f = challengePassed(tapEgg({ ...f, phase: 'free' }), { name: 'Two', species: 'animal-bee' })
    expect(f.pets).toHaveLength(2)
    expect(f.readProgress).toBe(0)
  })

  it('reports progress toward the next hatch and the next tile', () => {
    let f = readUntilHatch(createFlow())          // past the free first egg
    const need = pagesInItems(f)
    f = challengePassed(tapEgg({ ...f, phase: 'free' }), { name: 'B', species: 'animal-bee' })
    expect(hatchProgress(f)).toBeCloseTo(1 / need)
    expect(landProgress(createFlow())).toBe(0)
  })

  it('progress is never lost by a wrong answer', () => {
    let f = readUntilHatch(createFlow())
    f = challengePassed(tapEgg({ ...f, phase: 'free' }), { name: 'B', species: 'animal-bee' })
    const before = f.readProgress
    f = challengeFailed(tapEgg(f))
    expect(f.readProgress).toBe(before)
  })

  it('a hatched pet keeps its name and species forever', () => {
    let f = readUntilHatch(createFlow(), 'Sheptun', 'animal-crab')
    f = readUntilHatch(f, 'Corbell', 'animal-bee')
    expect(f.pets.map(p => p.name)).toEqual(['Sheptun', 'Corbell'])
    expect(f.pets.map(p => p.species)).toEqual(['animal-crab', 'animal-bee'])
  })

  it('asking for land opens the bank, not a sum', () => {
    /*
     * Spec section 2: "pick a tile type -> pick a socket -> ghost hex appears
     * -> each correct sum advances the build". With nothing under construction
     * there is no plot for a sum to advance, so the first tap opens the offer
     * instead. Doing the maths first is exactly the invisible progress the
     * growing plot exists to abolish.
     *
     * The spec says one of THREE; there are two kinds of land in the game so
     * far, so there are two buttons. It becomes a real pick-of-several when
     * the biome ladder lands.
     */
    const f = askForLand(createFlow())
    expect(f.phase).toBe('placing')
    expect(f.plot).toBeNull()
    expect(tileOffer(f).length).toBeGreaterThan(1)
  })

  it('asking again once a plot is under construction re-opens the bank — PB-048', () => {
    /*
     * It used to open the next sum instead, and that resumption IS the bug Joe
     * reported. A standing plot in free play is one she has walked away from —
     * the sum overlay stays up across every sum of a tile, so there is no other
     * way to be back on the island mid-build — and resuming it dropped her into
     * a build she had left, off a tap she had aimed at an animal.
     *
     * His ruling: *"the progress towards reward is saved, the location and type
     * is not."* So asking again asks WHERE and WHAT afresh, and every sum she has
     * answered comes along untouched.
     */
    // The intro tile is one sum, so it is paid off and out of the way; the
    // SECOND is priced above one sum, which is what leaves a plot standing with
    // real work in it after a single correct answer.
    let f = buildTile(createFlow())
    f = askForLand({ ...f, phase: 'free' })
    f = placeTile(chooseTile(f, 'grass'), { q: 0, r: 1 })
    expect(sumsInItems(f)).toBeGreaterThan(1)
    f = challengePassed(tapSum({ ...f, phase: 'free' }))
    expect(f.plot, 'the fixture must still be mid-build').not.toBeNull()
    expect(f.sumProgress).toBeGreaterThan(0)

    const g = askForLand({ ...f, phase: 'free' }, { q: 1, r: -1 })
    expect(g.phase).toBe('placing')
    expect(g.challenge).toBeNull()
    expect(g.chosen).toBeNull()
    expect(g.pending).toEqual({ q: 1, r: -1 })
    expect(g.sumProgress, 'nothing she has answered is spent').toBe(f.sumProgress)
  })

  it('refuses a sum when there is no plot to advance', () => {
    const f = createFlow()
    expect(tapSum(f)).toBe(f)
  })

  describe('changing her mind at the offer', () => {
    /*
     * Joe: "when user clicks on empty tile to do a tile challenge, he cannot
     * change his mind at the selecting of the tile type stage."
     *
     * Quite right, and it is the same fault as tapping any grass starting a
     * maths round: it makes touching the island a commitment. Asking for land
     * costs nothing yet, so backing out must cost nothing either.
     */
    it('returns to the island', () => {
      const f = cancelPlacing(askForLand(createFlow(), { q: 1, r: 0 }))
      expect(f.phase).toBe('free')
      expect(f.chosen).toBeNull()
      expect(f.pending).toBeNull()
    })

    it('keeps every scrap of progress — brief §19', () => {
      // The guardrail, stated over the fields that could carry a loss.
      const earned = { ...createFlow(), bankedTiles: 2, sumProgress: 3, readProgress: 4 }
      const f = cancelPlacing(askForLand(earned))
      expect(f.bankedTiles).toBe(2)
      expect(f.sumProgress).toBe(3)
      expect(f.readProgress).toBe(4)
    })

    it('never abandons a plot already under construction', () => {
      /*
       * The dangerous case. A plot holds every sum she has spent on it, so a
       * dismissal that dropped it would throw away real work — and a restored
       * save can put the flow in 'placing' WITH a plot standing.
       */
      let f = askForLand(createFlow())
      f = placeTile(chooseTile(f, 'grass'), { q: 1, r: 0 })
      f = askForLand({ ...f, phase: 'free' })
      f = placeTile(chooseTile(f, 'grass'), { q: 0, r: 1 })
      expect(f.plot).not.toBeNull()

      const back = cancelPlacing({ ...f, phase: 'placing' })
      expect(back.plot).toEqual(f.plot)
    })

    it('she can ask again straight afterwards', () => {
      // A way out is only a way out if the way back in still works.
      const f = cancelPlacing(askForLand(createFlow(), { q: 1, r: 0 }))
      expect(askForLand(f, { q: 1, r: 0 }).phase).toBe('placing')
    })

    it('does nothing in any other phase', () => {
      for (const phase of ['free', 'challenge', 'opening'] as const) {
        const f = { ...createFlow(), phase }
        expect(cancelPlacing(f)).toBe(f)
      }
    })
  })

  it('the INTRO tile costs exactly one sum once sited', () => {
    /*
     * The curve prices the first tile at 1. Spec section 2's "Intro tile =
     * all ten in one go" is about the INCREMENTS — ten pieces of scenery
     * arriving in a single burst because there is only one sum to spread
     * them over — not about the tile being free.
     */
    let f = askForLand(createFlow())
    f = placeTile(chooseTile(f, 'grass'), { q: 1, r: 0 })
    expect(sumsInItems(f)).toBe(1)
    expect(f.plot).not.toBeNull()

    f = challengePassed(tapSum({ ...f, phase: 'free' }))
    expect(f.plot).toBeNull()
    expect(count(f.island)).toBe(2)
    expect(f.tilesEarned).toBe(1)
  })

  it('later tiles are built by sums, one plot at a time', () => {
    let f = buildTile(createFlow())                    // the free intro tile
    const need = sumsInItems(f)
    expect(need).toBeGreaterThan(1)

    f = askForLand({ ...f, phase: 'free' })
    f = placeTile(chooseTile(f, 'grass'), { q: 0, r: 1 })
    expect(f.plot).toEqual({ at: { q: 0, r: 1 }, type: 'grass' })

    const before = count(f.island)
    for (let i = 1; i < need; i++) {
      f = challengePassed(tapSum({ ...f, phase: 'free' }))
      // Under construction, and NOT yet on the island.
      expect(f.plot).not.toBeNull()
      expect(count(f.island)).toBe(before)
    }
    f = challengePassed(tapSum({ ...f, phase: 'free' }))
    expect(f.plot).toBeNull()
    expect(count(f.island)).toBe(before + 1)
    expect(f.sumProgress).toBe(0)
  })

  it('offers one button per KIND of land, with no duplicates', () => {
    /*
     * It used to offer ['grass', 'water', 'grass'] — a pick-of-three with
     * grass listed twice, from slice-1 §7's weighting of the first-run draw.
     * Joe: "the type strangely being land, water, land — I don't see why two
     * land options are needed?" Weighting a random draw is one thing; showing
     * a child the same button twice and asking her to pick is another, and she
     * cannot tell them apart because there is nothing to tell.
     *
     * It grows on its own when the biome ladder lands and there are spring,
     * desert and ice to choose from.
     */
    const offer = tileOffer(askForLand(createFlow()))
    expect(new Set(offer).size).toBe(offer.length)
    expect(offer).toEqual(['grass', 'water'])
  })

  it('builds the type that was chosen', () => {
    const f = buildTile(createFlow(), { q: 1, r: 0 }, 'water')
    expect(f.island.tiles.get('1,0')).toBe('water')
  })

  it('cannot site a plot where there is no socket', () => {
    let f = askForLand(createFlow())
    f = chooseTile(f, 'grass')
    const before = count(f.island)
    const g = placeTile(f, { q: 9, r: 9 })   // far out at sea
    expect(count(g.island)).toBe(before)
    expect(g.plot).toBeNull()
    expect(g.chosen).toBe('grass')           // the choice is kept
  })

  it('cannot site a plot before a type is chosen', () => {
    const f = askForLand(createFlow())
    expect(placeTile(f, { q: 1, r: 0 })).toBe(f)
  })

  it('a wrong answer costs nothing — no tile, no pet, nothing lost', () => {
    // Brief section 18: wrong answers cost nothing but a wobble
    let f = buildTile(createFlow())
    f = askForLand({ ...f, phase: 'free' })
    f = placeTile(chooseTile(f, 'grass'), { q: 0, r: 1 })
    f = challengePassed(tapSum({ ...f, phase: 'free' }))
    const progressBefore = f.sumProgress
    const tilesBefore = count(f.island)

    f = challengeFailed(tapSum({ ...f, phase: 'free' }))
    // The plot stands exactly where it stood. Nothing un-grows (spec 2).
    expect(f.sumProgress).toBe(progressBefore)
    expect(f.plot).not.toBeNull()
    expect(count(f.island)).toBe(tilesBefore)
    expect(f.phase).toBe('free')

    let g = tapEgg(createFlow())
    g = challengeFailed(g)
    expect(g.pets).toHaveLength(0)
    expect(g.phase).toBe('free')
  })

  it('never consumes the egg on a failed reading challenge', () => {
    // The egg must still be there to try again — nothing expires
    let f = tapEgg(createFlow())
    f = challengeFailed(f)
    expect(f.eggPresent).toBe(true)
    f = tapEgg(f)
    expect(f.phase).toBe('challenge')
  })

  it('a fresh egg arrives after a hatch, so there is always something to read to', () => {
    let f = tapEgg(createFlow())
    f = challengePassed(f, { name: 'Bimo', species: 'animal-fox' })
    expect(f.eggPresent).toBe(true)
  })

  it('is immutable — every transition returns a new state', () => {
    const a = createFlow()
    const b = tapEgg(a)
    expect(a.phase).toBe('free')
    expect(b.phase).toBe('challenge')
    expect(a).not.toBe(b)
  })

  it('ignores a siting when the bank was never opened', () => {
    const f = createFlow()
    const g = placeTile(f, { q: 1, r: 0 })
    expect(count(g.island)).toBe(count(f.island))
    expect(g.plot).toBeNull()
  })

  it('offers only tile types the child can actually use', () => {
    const f = askForLand(createFlow())
    for (const t of tileOffer(f)) expect(['grass', 'water']).toContain(t)
  })

  it('offers nothing outside the bank', () => {
    expect(tileOffer(createFlow())).toHaveLength(0)
  })
})

describe('flow — work in progress is never lost', () => {
  it('keeps a half-built plot across a wrong answer and a walk away', () => {
    /*
     * The plot is the only record of sums already done, so anything that
     * clears it silently destroys work the child has finished (brief 18).
     */
    let f = buildTile(createFlow())
    f = askForLand({ ...f, phase: 'free' })
    f = placeTile(chooseTile(f, 'grass'), { q: 0, r: 1 })
    f = challengePassed(tapSum({ ...f, phase: 'free' }))

    const plot = f.plot
    const progress = f.sumProgress
    f = challengeFailed(tapSum({ ...f, phase: 'free' }))
    f = tapEgg({ ...f, phase: 'free' })
    f = challengeFailed(f)

    expect(f.plot).toEqual(plot)
    expect(f.sumProgress).toBe(progress)
  })

  it('finishes a plot that was already paid for the moment it is sited', () => {
    /*
     * How a save from the OLD flow lands here: it banked a finished tile,
     * which save.ts restores as fully-paid progress. Charging for it again
     * would take back land she had already earned.
     */
    let f = createFlow()
    f = { ...f, phase: 'placing', sumProgress: 999 }
    const price = sumsForTile(f)
    f = placeTile(chooseTile(f, 'water'), { q: 1, r: 0 })
    expect(f.plot).toBeNull()
    expect(f.island.tiles.get('1,0')).toBe('water')
    /*
     * The tile's price is SPENT, and what is left over is left over. This used
     * to assert a flat 0, which was indistinguishable from the truth while every
     * sum paid 2 and every price was a multiple of 2 — progress landed exactly
     * on the price and there was never a remainder to see. A pay-3 honeymoon sum
     * can overshoot, and §19 does not let the overshoot be swept up, so commit
     * now subtracts the price rather than zeroing. 999 is a synthetic
     * overpayment; the change from it belongs to her.
     */
    expect(f.sumProgress).toBe(999 - price)
  })

  it('never lets a plot be chosen or sited mid-challenge', () => {
    let f = buildTile(createFlow())
    f = { ...f, phase: 'challenge', challenge: 'read' }
    expect(chooseTile(f, 'water').chosen).toBeNull()
    const placed = placeTile(f, { q: 0, r: 1 })
    expect(count(placed.island)).toBe(count(f.island))
  })

  it('cannot open the bank twice and lose the first plot', () => {
    let f = buildTile(createFlow())
    f = askForLand({ ...f, phase: 'free' })
    f = placeTile(chooseTile(f, 'grass'), { q: 0, r: 1 })
    const plot = f.plot
    // Asking again with a plot under construction advances it, never
    // replaces it - otherwise the sums already paid would vanish.
    const g = askForLand({ ...f, phase: 'free' })
    expect(g.plot).toEqual(plot)
  })
})

describe('asking for land AT a socket', () => {
  /**
   * Joe: "with the outline tile selection, you can drop the question where it
   * is supposed to go — that has already been selected."
   *
   * Quite so. Land used to be asked for by tapping any grass, so the game had
   * no idea where she wanted it and had to ask a second question after she had
   * picked a kind. Asking happens at a glowing socket now, so the answer is
   * already in hand.
   */
  const socket = { q: 1, r: 0 }

  it('remembers which socket she asked at', () => {
    const f = askForLand(createFlow(), socket)
    expect(f.phase).toBe('placing')
    expect(f.pending).toEqual(socket)
  })

  it('sites the plot the moment she picks a kind — no second tap', () => {
    const asked = askForLand(createFlow(), socket)
    const sited = chooseTile(asked, 'water')
    expect(sited.plot).toEqual({ at: socket, type: 'water' })
    expect(sited.phase).toBe('free')
    expect(sited.pending).toBeNull()
    expect(sited.chosen).toBeNull()
  })

  it('still waits for a tap when nobody said where', () => {
    /*
     * The opening script asks for land on her behalf and has nowhere in mind,
     * so the two-step path has to keep working — this is not a replacement,
     * it is a shortcut for the case where the answer is already known.
     */
    const asked = askForLand(createFlow())
    expect(asked.pending).toBeNull()
    const chosen = chooseTile(asked, 'grass')
    expect(chosen.chosen).toBe('grass')
    expect(chosen.plot).toBeNull()
    expect(chosen.phase).toBe('placing')
  })

  it('refuses a socket that is not one', () => {
    // A save can be hand-edited, and the island shrinks in nobody's memory but
    // its own. An illegal site leaves her in the offer rather than anywhere odd.
    const asked = askForLand(createFlow(), { q: 9, r: 9 })
    const out = chooseTile(asked, 'grass')
    expect(out.plot).toBeNull()
  })

  it('RELOCATES a plot already under construction — PB-048', () => {
    /*
     * It used to refuse, on the ground that siting over a plot threw away both
     * the spot she chose and every sum she had spent on it. Only half of that was
     * ever true: `sumProgress` lives on the Flow, so the sums were never at risk
     * and the spot was the only thing in the balance — and the spot is hers to
     * change. Joe: *"the progress towards reward is saved, the location and type
     * is not."*
     */
    const first = chooseTile(askForLand(createFlow(), socket), 'grass')
    // One sum short of paying for it, so there is real work to carry across and
    // the re-siting cannot quietly complete the tile instead.
    const paid = { ...first, sumProgress: 1 }
    expect(sumsForTile(paid)).toBeGreaterThan(1)
    const again = chooseTile({ ...paid, phase: 'placing', pending: { q: 0, r: 1 } }, 'grass')
    expect(again.plot).toEqual({ at: { q: 0, r: 1 }, type: 'grass' })
    expect(again.plot).not.toEqual(first.plot)
    expect(again.sumProgress, 'the work follows her to the new socket').toBe(1)
  })
})

/**
 * Run B's honeymoon — the economic half (runA.md:233, *"pay 3, 2 sessions,
 * cost-index frozen"*), and Joe's Option A ruling on JT-018: MATHS ONLY.
 *
 * The harness decides WHEN (`honeymoonActive`, a marker only); every test here
 * hands the flag straight in, which is exactly what main.ts does, so what is
 * driven is the real transition and not a stand-in for it.
 */
describe('flow — the honeymoon', () => {
  const pet = { name: 'Bimo', species: 'animal-fox' }

  /** Site a plot and leave it standing, so sums have somewhere to land. */
  function sited(f: Flow, at = { q: 1, r: 0 }): Flow {
    f = askForLand({ ...f, phase: 'free' })
    f = chooseTile(f, 'grass')
    return placeTile(f, at)
  }

  /** A flow far enough up the curve that one sum cannot finish the tile. */
  const dearTile = (): Flow => ({ ...createFlow(), tilesEarned: 3 })

  it('pays 3 for a maths page in a honeymoon and 2 out of one', () => {
    const standing = sited(dearTile())
    expect(standing.plot).not.toBeNull()

    const inside = challengePassed(tapSum({ ...standing, phase: 'free' }), undefined, true)
    const outside = challengePassed(tapSum({ ...standing, phase: 'free' }))

    expect(inside.sumProgress).toBe(3)
    expect(outside.sumProgress).toBe(2)
  })

  it('pays 2 for a reading page IN a honeymoon — Option A, maths only', () => {
    /*
     * JT-018: *"i have an unlimited amount of tiles but a limited stash of
     * animals as rewards."* Pages buy eggs and eggs come out of that stash, so
     * the generous rate is not offered here. This is the ruling, not a gap in
     * the threading — the flag IS passed and is deliberately not read.
     */
    let f = challengePassed(tapEgg(createFlow()), pet)
    expect(f.pets).toHaveLength(1)
    expect(pagesForEgg(f)).toBeGreaterThan(itemPay())   // an egg worth reading to

    const inside = challengePassed(tapEgg({ ...f, phase: 'free' }), pet, true)
    const outside = challengePassed(tapEgg({ ...f, phase: 'free' }), pet)

    expect(inside.readProgress).toBe(2)
    expect(inside.readProgress).toBe(outside.readProgress)
  })

  it('does not advance the tile index for a tile bought in a honeymoon', () => {
    const before = createFlow()
    const price = sumsForTile(before)

    let f = sited(before)
    while (f.plot) f = challengePassed(tapSum({ ...f, phase: 'free' }), undefined, true)

    expect(f.tilesEarned).toBe(1)
    expect(f.honeymoonTiles).toBe(1)
    // The tile is REAL — she has the land — and the next one costs what this
    // one did. That is the freeze, as a permanent offset.
    expect(count(f.island)).toBe(count(before.island) + 1)
    expect(sumsForTile(f)).toBe(price)
  })

  it('DOES advance it for an ordinary tile', () => {
    const before = createFlow()
    const price = sumsForTile(before)

    let f = sited(before)
    while (f.plot) f = challengePassed(tapSum({ ...f, phase: 'free' }))

    expect(f.tilesEarned).toBe(1)
    expect(f.honeymoonTiles).toBe(0)
    expect(sumsForTile(f)).toBeGreaterThan(price)
  })

  it('resumes the climb from the offset once the honeymoon is over', () => {
    // Not a pause that catches up later: the honeymoon tile never counts again.
    let f = createFlow()
    const first = sumsForTile(f)
    f = sited(f)
    while (f.plot) f = challengePassed(tapSum({ ...f, phase: 'free' }), undefined, true)
    expect(sumsForTile(f)).toBe(first)

    f = sited(f, { q: 0, r: 1 })
    while (f.plot) f = challengePassed(tapSum({ ...f, phase: 'free' }))
    expect(f.tilesEarned).toBe(2)
    expect(f.honeymoonTiles).toBe(1)
    // Two tiles on the island, priced as the second — not as the third.
    expect(sumsForTile(f)).toBe(sumsForTile({ ...createFlow(), tilesEarned: 1 }))
  })

  it('carries a 1-unit overshoot into the next tile instead of eating it', () => {
    /*
     * Prices are quantised to whole `pay.item` units, so pay-2 sums land ON the
     * price and commit had nothing to carry. A pay-3 sum can step over it, and
     * the step-over is work she did. §19: nothing she owns is lost.
     */
    const before = dearTile()
    const price = sumsForTile(before)
    expect(price % 3).toBe(2)            // ...so the last sum overshoots by 1

    let f = sited(before)
    let sums = 0
    while (f.plot) {
      f = challengePassed(tapSum({ ...f, phase: 'free' }), undefined, true)
      sums++
    }
    expect(sums * 3 - price).toBe(1)     // a 1-unit remainder existed to lose
    expect(f.sumProgress).toBe(1)        // and it did not get lost
  })

  it('spends the carried remainder on the tile after it', () => {
    // Carrying it is only half the promise; it has to BUY something.
    let f = dearTile()
    let paid = 0
    let spent = 0
    for (const at of [{ q: 1, r: 0 }, { q: 0, r: 1 }, { q: -1, r: 1 }]) {
      spent += sumsForTile(f)
      f = sited(f, at)
      while (f.plot) {
        f = challengePassed(tapSum({ ...f, phase: 'free' }), undefined, true)
        paid += 3
      }
    }
    // Every unit answered either bought a tile or is still standing to her name.
    expect(f.sumProgress).toBe(paid - spent)
    expect(f.tilesEarned).toBe(6)          // the three she built, on top of 3
    expect(f.honeymoonTiles).toBe(3)
    // ...and all three were free of the curve, so she is still paying tile 4's
    // price after building three of them.
    expect(sumsForTile(f)).toBe(sumsForTile(dearTile()))
  })

  it('never carries a NEGATIVE remainder when a banked credit pays', () => {
    /*
     * The other end of the same subtraction. A tile finished by a credit
     * carried over from a previous flow (see `placeTile`) has no sums behind it
     * at all, so `sumProgress - price` goes below zero — and progress that ran
     * negative would make the NEXT tile quietly dearer than its list price,
     * which is the same §19 harm from the opposite direction.
     */
    let f: Flow = { ...createFlow(), bankedTiles: 1, phase: 'placing' }
    expect(sumsForTile(f)).toBeGreaterThan(0)
    f = placeTile(chooseTile(f, 'grass'), { q: 1, r: 0 })
    expect(f.plot).toBeNull()
    expect(f.bankedTiles).toBe(0)
    expect(f.sumProgress).toBe(0)
  })

  it('leaves an ordinary run with no remainder at all', () => {
    // The carry must be invisible outside a honeymoon: pay-2 into a price that
    // is a multiple of 2 lands exactly, and commit still reads 0.
    let f = dearTile()
    f = sited(f)
    while (f.plot) f = challengePassed(tapSum({ ...f, phase: 'free' }))
    expect(f.sumProgress).toBe(0)
    expect(f.honeymoonTiles).toBe(0)
  })

  it('never asks the curve for a tile before the first one', () => {
    /*
     * A hand-edited save can claim more honeymoon tiles than tiles earned; the
     * index is a subtraction and must not run off the bottom of the curve.
     *
     * TWO CLAMPS HOLD THIS, and the test is deliberately written against the
     * behaviour rather than either line: `sumsForTile` floors the index at 1,
     * and `exactCost` floors its own `n`. Removing just one of them leaves this
     * green — measured, not assumed. Removing both turns it red.
     */
    const absurd = { ...createFlow(), tilesEarned: 2, honeymoonTiles: 99 }
    expect(sumsForTile(absurd)).toBe(sumsForTile(createFlow()))
    expect(sumsForTile(absurd)).toBeGreaterThan(0)
  })
})
