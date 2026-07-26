import { describe, it, expect, vi } from 'vitest'
import {
  handleWorldTap, handleChallengePassed, handleChallengeDismissed,
} from '../../src/island/interactions'
import type { InteractionPorts } from '../../src/island/interactions'
import {
  createFlow, tapEgg, tapSum, challengePassed, chooseTile,
  ROUNDS_PER_HATCH, SUMS_PER_TILE,
} from '../../src/island/flow'
import type { Flow } from '../../src/island/flow'
import { count } from '../../src/island/world/grid'

function ports(over: Partial<InteractionPorts> = {}): InteractionPorts {
  return {
    challengeOpen: () => false,
    storyPlaying: () => false,
    openRead: vi.fn(),
    openSum: vi.fn(),
    replayStory: vi.fn(),
    bouncePet: vi.fn(),
    say: vi.fn(),
    clearSay: vi.fn(),
    speak: vi.fn(),
    win: vi.fn(),
    ...over,
  }
}

/** Answer enough sums to actually earn a tile (pacing: SUMS_PER_TILE). */
function earnTile(f: Flow = createFlow()): Flow {
  for (let i = 0; i < SUMS_PER_TILE; i++) f = challengePassed(tapSum({ ...f, phase: 'free' }))
  return f
}

/** Read enough rounds to actually hatch (pacing: ROUNDS_PER_HATCH). */
function hatchOne(f: Flow = createFlow(), name = 'Bimo'): Flow {
  for (let i = 0; i < ROUNDS_PER_HATCH; i++) {
    f = challengePassed(tapEgg({ ...f, phase: 'free' }), { name, species: 'animal-fox' })
  }
  return f
}

/** A flow that has earned a tile and chosen water, awaiting a socket tap. */
function readyToPlace(): Flow {
  return chooseTile(earnTile(), 'water')
}

describe('tapping the egg', () => {
  it('opens a reading round from free play', () => {
    const p = ports()
    const next = handleWorldTap(createFlow(), { kind: 'egg' }, p)
    expect(next.phase).toBe('challenge')
    expect(next.challenge).toBe('read')
    expect(p.openRead).toHaveBeenCalledWith(next)
  })

  it('does NOT open a round when the phase forbids it', () => {
    // The swallowed-work bug: the transition no-ops, so the round must not
    // open. Otherwise the child reads it all and receives nothing.
    const p = ports()
    const placing = readyToPlace()
    const next = handleWorldTap(placing, { kind: 'egg' }, p)
    expect(next).toBe(placing)
    expect(p.openRead).not.toHaveBeenCalled()
  })

  it('ignores taps while a challenge is on screen', () => {
    const p = ports({ challengeOpen: () => true })
    const f = createFlow()
    expect(handleWorldTap(f, { kind: 'egg' }, p)).toBe(f)
    expect(p.openRead).not.toHaveBeenCalled()
  })

  it('ignores taps while the story is playing', () => {
    const p = ports({ storyPlaying: () => true })
    const f = createFlow()
    expect(handleWorldTap(f, { kind: 'egg' }, p)).toBe(f)
    expect(p.openRead).not.toHaveBeenCalled()
  })
})

describe('tapping Fred', () => {
  it('replays the story from free play', () => {
    const p = ports()
    handleWorldTap(createFlow(), { kind: 'fred' }, p)
    expect(p.replayStory).toHaveBeenCalled()
  })

  it('does NOT replay the story while placing', () => {
    // This exact sequence let the story call tapEgg (a no-op outside 'free')
    // and then open a round anyway — real work, no reward.
    const p = ports()
    handleWorldTap(readyToPlace(), { kind: 'fred' }, p)
    expect(p.replayStory).not.toHaveBeenCalled()
  })

  it('does NOT replay the story mid-challenge', () => {
    const p = ports()
    handleWorldTap(tapEgg(createFlow()), { kind: 'fred' }, p)
    expect(p.replayStory).not.toHaveBeenCalled()
  })
})

describe('tapping a socket', () => {
  it('places the chosen tile and grows the island', () => {
    const p = ports()
    const before = readyToPlace()
    const next = handleWorldTap(before, { kind: 'socket', axial: { q: 1, r: 0 } }, p)
    expect(count(next.island)).toBe(count(before.island) + 1)
    expect(p.win).toHaveBeenCalled()
  })

  it('does nothing when no tile has been chosen yet', () => {
    const p = ports()
    const banked = earnTile()                              // banked, not chosen
    const next = handleWorldTap(banked, { kind: 'socket', axial: { q: 1, r: 0 } }, p)
    expect(next).toBe(banked)
    expect(p.win).not.toHaveBeenCalled()
  })

  it('keeps the tile when the socket is not legal', () => {
    // A mis-tap must never cost her the land she earned (brief section 18)
    const p = ports()
    const before = readyToPlace()
    const next = handleWorldTap(before, { kind: 'socket', axial: { q: 9, r: 9 } }, p)
    expect(next.bankedTiles).toBe(1)
    expect(count(next.island)).toBe(count(before.island))
  })

  it('does nothing in free play', () => {
    const p = ports()
    const f = createFlow()
    expect(handleWorldTap(f, { kind: 'socket', axial: { q: 1, r: 0 } }, p)).toBe(f)
  })
})

describe('tapping a pet', () => {
  it('bounces it and says its name', () => {
    const p = ports()
    const f = hatchOne()
    const id = f.pets[0]!.id
    const next = handleWorldTap(f, { kind: 'pet', id }, p)
    expect(next).toBe(f)                       // tapping a pet changes nothing
    expect(p.bouncePet).toHaveBeenCalledWith(id)
    expect(p.speak).toHaveBeenCalledWith('Bimo')
  })

  it('does not speak for a pet that is not there', () => {
    const p = ports()
    handleWorldTap(createFlow(), { kind: 'pet', id: 'ghost' }, p)
    expect(p.speak).not.toHaveBeenCalled()
  })
})

describe('tapping the island', () => {
  it('opens a sum from free play', () => {
    const p = ports()
    const next = handleWorldTap(createFlow(), { kind: 'tile', axial: { q: 0, r: 0 } }, p)
    expect(next.challenge).toBe('sum')
    expect(p.openSum).toHaveBeenCalledWith(next)
  })

  it('does NOT open a sum while placing', () => {
    const p = ports()
    const placing = readyToPlace()
    expect(handleWorldTap(placing, { kind: 'tile', axial: { q: 0, r: 0 } }, p)).toBe(placing)
    expect(p.openSum).not.toHaveBeenCalled()
  })
})

describe('finishing and leaving a challenge', () => {
  it('a completed round that never legitimately opened changes nothing', () => {
    // The shape of the swallowed-work bug, pinned directly.
    const free = createFlow()
    const next = handleChallengePassed(free, { name: 'Bimo', species: 'animal-fox' })
    expect(next).toBe(free)
    expect(next.pets).toHaveLength(0)
  })

  it('a legitimately opened round counts toward the hatch', () => {
    const next = handleChallengePassed(tapEgg(createFlow()), { name: 'Bimo', species: 'animal-fox' })
    expect(next.readProgress).toBe(1)
    expect(hatchOne().pets).toHaveLength(1)
  })

  it('leaving costs nothing — no pet, no tile, egg still there', () => {
    const banked = earnTile()
    const mid = tapEgg({ ...banked, phase: 'free' })
    const out = handleChallengeDismissed(mid)
    expect(out.phase).toBe('free')
    expect(out.bankedTiles).toBe(1)
    expect(out.eggPresent).toBe(true)
    expect(out.pets).toHaveLength(0)
  })

  it('sea taps do nothing at all', () => {
    const p = ports()
    const f = createFlow()
    expect(handleWorldTap(f, { kind: 'sea' }, p)).toBe(f)
    expect(handleWorldTap(f, null, p)).toBe(f)
  })
})

describe('a completed round is never discarded', () => {
  it('a sum passed outside a challenge phase still changes nothing', () => {
    // The tombstone for the swallowed-work bug, from the sum side.
    const placing = readyToPlace()
    expect(handleChallengePassed(placing)).toBe(placing)
  })

  it('a legitimately passed sum counts toward the tile', () => {
    const next = handleChallengePassed(tapSum(createFlow()))
    expect(next.sumProgress).toBe(1)
    expect(earnTile().bankedTiles).toBe(1)
  })

  it('two banked tiles drain one at a time without stranding either', () => {
    // Found at the M1 gate: returning to free with a surplus hid the offer
    // and the second tile could never be spent.
    let f = earnTile()
    f = earnTile(f)
    expect(f.bankedTiles).toBe(2)
    const p = ports()
    f = chooseTile(f, 'grass')
    f = handleWorldTap(f, { kind: 'socket', axial: { q: 1, r: 0 } }, p)
    expect(f.phase).toBe('placing')
    f = chooseTile(f, 'water')
    f = handleWorldTap(f, { kind: 'socket', axial: { q: 0, r: 1 } }, p)
    expect(f.bankedTiles).toBe(0)
    expect(f.phase).toBe('free')
    expect(count(f.island)).toBe(3)
  })
})
