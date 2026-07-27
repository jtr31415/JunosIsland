import { describe, it, expect } from 'vitest'
import {
  activeGovernor, inGracePeriod, spaceSurplus, landPaused, eggsPaused, GOVERNOR_LINE,
  fieldsWanted,
} from '../../src/island/governors'
import { createFlow, challengePassed, tapEgg, chooseTile, placeTile } from '../../src/island/flow'
import type { Flow } from '../../src/island/flow'
import { sockets } from '../../src/island/world/grid'
import { balance } from '../../src/island/balance'

/**
 * Grow the island by n grass tiles, ignoring the economy.
 *
 * Prepaid: sumProgress well past any price the curve can name, so siting the
 * plot finishes it on the spot and the helper stays one step per tile.
 */
function grow(f: Flow, n: number): Flow {
  for (let i = 0; i < n; i++) {
    let g: Flow = { ...f, phase: 'placing', chosen: null, plot: null, sumProgress: 999 }
    g = chooseTile(g, 'grass')
    const s = sockets(g.island)[0]!
    f = placeTile(g, s)
  }
  return f
}

/** Hatch n pets, ignoring the economy. */
function withPets(f: Flow, n: number): Flow {
  for (let i = 0; i < n; i++) {
    f = challengePassed(tapEgg({ ...f, phase: 'free', readProgress: 999 }),
      { name: 'P' + i, species: 'animal-fox' })
  }
  return f
}

describe('the grace period', () => {
  it('holds while the island is new, so a beginner is never redirected', () => {
    // §5: governors never fire during the first ten minutes
    expect(inGracePeriod(createFlow())).toBe(true)
    expect(activeGovernor(createFlow())).toBe('none')
  })

  it('ends once there is a real island and real friends', () => {
    const f = withPets(grow(createFlow(), 5), 2)
    expect(inGracePeriod(f)).toBe(false)
  })
})

describe('the space-surplus governor', () => {
  it('pauses new land when there is far more room than friends', () => {
    const f = withPets(grow(createFlow(), 6), 2)
    expect(spaceSurplus(f)).toBeGreaterThanOrEqual(4)
    expect(activeGovernor(f)).toBe('space-surplus')
    expect(landPaused(f)).toBe(true)
  })

  it('lets a plot already under construction finish anyway', () => {
    // §5: a plot mid-build always finishes; work is never taken back. The
    // governor pauses STARTING land, never finishing it.
    let f = withPets(grow(createFlow(), 6), 2)
    f = { ...f, plot: { at: { q: 4, r: 0 }, type: 'grass' } }
    expect(activeGovernor(f)).toBe('space-surplus')
    expect(landPaused(f)).toBe(false)
  })

  it('lifts once enough friends have come home', () => {
    const f = withPets(grow(createFlow(), 6), 6)
    expect(activeGovernor(f)).toBe('none')
    expect(landPaused(f)).toBe(false)
  })

  it('never pauses reading — only new land', () => {
    const f = withPets(grow(createFlow(), 6), 2)
    expect(eggsPaused(f)).toBe(false)
  })
})

describe('the governor lines', () => {
  it('are want-framed: they ask for the other thing, never forbid this one', () => {
    for (const line of Object.values(GOVERNOR_LINE)) {
      expect(line).not.toMatch(/can'?t|cannot|not allowed|no more|stop/i)
      expect(line.length).toBeGreaterThan(10)
    }
    expect(GOVERNOR_LINE['space-surplus']).toMatch(/read/i)
    expect(GOVERNOR_LINE['nursery-queue']).toMatch(/home/i)
  })
})

describe('the corridor is a RATIO, not a fixed gap — Joe, 28 July', () => {
  /*
   * *"the tile/animal ratio seems to be 1:1, think that was more relaxed
   * before"*, then: *"for every tile, there needs to be one animal. we can be a
   * bit more relaxed with that, say 3 tiles for 2 animals. bit more maths than
   * reading since the maths goes quicker."*
   *
   * He was right about the symptom AND about it having been looser once. The
   * governors held `habitable - pets` inside an absolute corridor, so the gap
   * could never exceed four however big the island got — which drives the ratio
   * to 1:1 asymptotically while leaving the early game, where four is most of the
   * island, genuinely relaxed.
   *
   * These tests are written as PROPERTIES of the ratio rather than against
   * particular tile counts, so the target can be retuned in balance.json without
   * anything failing for the wrong reason. What must not silently come back is
   * the absolute corridor.
   */

  /** The largest field count that does not pause new land, at `pets` pets. */
  const ceiling = (pets: number): number => {
    for (let n = 1; n < 400; n++) {
      const f = withPets(grow(createFlow(), n), pets)
      if (activeGovernor(f) === 'space-surplus') return n - 1
    }
    throw new Error('never paused')
  }

  it('wants half again as many fields as pets', () => {
    expect(fieldsWanted(0)).toBe(0)
    expect(fieldsWanted(2)).toBe(3)
    expect(fieldsWanted(10)).toBe(15)
    expect(balance.governor.tilesPerPet).toBeGreaterThan(1)
  })

  it('lets the island hold MORE land per pet as the pets multiply', () => {
    /*
     * The property the old code could not have: with an absolute corridor the
     * ceiling rises by exactly one per pet, so this difference would be flat.
     */
    const low = ceiling(2)
    const high = ceiling(8)
    expect(high - low).toBeGreaterThan(8 - 2)
  })

  it('does not drive the ratio to 1:1 as the island grows', () => {
    // The actual complaint. At a decent number of pets the permitted field count
    // must be comfortably above one-for-one.
    const pets = 10
    expect(ceiling(pets) / pets).toBeGreaterThan(1.2)
  })

  it('still pauses land eventually, so the island cannot run away from her', () => {
    const f = withPets(grow(createFlow(), 40), 2)
    expect(activeGovernor(f)).toBe('space-surplus')
    expect(landPaused(f)).toBe(true)
  })

  it('keeps the two governors mutually exclusive', () => {
    // They read one number from opposite ends; if both could fire, the invitation
    // would depend on evaluation order rather than on the island.
    for (let tiles = 1; tiles <= 24; tiles++) {
      for (let pets = 0; pets <= 12; pets++) {
        const f = withPets(grow(createFlow(), tiles), pets)
        if (inGracePeriod(f)) continue
        expect(landPaused(f) && eggsPaused(f), `${tiles} fields, ${pets} pets`).toBe(false)
      }
    }
  })
})
