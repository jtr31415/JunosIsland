import { describe, it, expect } from 'vitest'
import {
  activeGovernor, inGracePeriod, spaceSurplus, landPaused, eggsPaused, GOVERNOR_LINE,
} from '../../src/island/governors'
import { createFlow, challengePassed, tapEgg, tapSum, chooseTile, placeTile } from '../../src/island/flow'
import type { Flow } from '../../src/island/flow'
import { sockets } from '../../src/island/world/grid'

/** Grow the island by n grass tiles, ignoring the economy. */
function grow(f: Flow, n: number): Flow {
  for (let i = 0; i < n; i++) {
    let g = challengePassed(tapSum({ ...f, phase: 'free', sumProgress: 999 }))
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

  it('lets a plot already paid for finish anyway', () => {
    // §5: a plot mid-build always finishes; work is never taken back
    let f = withPets(grow(createFlow(), 6), 2)
    f = { ...f, bankedTiles: 1 }
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
