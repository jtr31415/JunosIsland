import { describe, it, expect, vi } from 'vitest'
import {
  handleWorldTap, handleChallengePassed, handleChallengeDismissed,
} from '../../src/island/interactions'
import type { InteractionPorts } from '../../src/island/interactions'
import {
  createFlow, tapEgg, tapSum, askForLand, challengePassed, chooseTile, placeTile,
  pagesForEgg,
} from '../../src/island/flow'
import type { Flow } from '../../src/island/flow'
import { count } from '../../src/island/world/grid'

function ports(over: Partial<InteractionPorts> = {}): InteractionPorts {
  return {
    challengeOpen: () => false,
    eggsPaused: () => false,
    landPaused: () => false,
    invite: vi.fn(),
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

/**
 * Site a plot and pay it off, so the island actually grows by one tile.
 *
 * Spec section 2 order: ask, choose, site, then build. Nothing is "banked"
 * any more — a tile is under construction in view, or it is real land.
 */
function earnTile(f: Flow = createFlow(), at = { q: 1, r: 0 }): Flow {
  f = askForLand({ ...f, phase: 'free' })
  f = placeTile(chooseTile(f, 'grass'), at)
  while (f.plot) f = challengePassed(tapSum({ ...f, phase: 'free' }))
  return f
}

/** A plot sited and part-built, but not yet paid off. */
function midBuild(f: Flow = createFlow(), at = { q: 0, r: 1 }): Flow {
  f = earnTile(f)                                   // past the one-sum intro
  f = askForLand({ ...f, phase: 'free' })
  f = placeTile(chooseTile(f, 'grass'), at)
  return f
}

/** Read enough rounds to actually hatch (pacing: ROUNDS_PER_HATCH). */
function hatchOne(f: Flow = createFlow(), name = 'Bimo'): Flow {
  for (let i = 0, n = pagesForEgg(f); i < n; i++) {
    f = challengePassed(tapEgg({ ...f, phase: 'free' }), { name, species: 'animal-fox' })
  }
  return f
}

/** The bank is open and a type is chosen, awaiting a socket tap. */
function readyToPlace(): Flow {
  return chooseTile(askForLand(createFlow()), 'water')
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
  it('SITES the plot rather than placing a finished tile', () => {
    /*
     * The land arrives when the sums are done, in view. Growing the island on
     * the socket tap is the old flow, in which the maths had already happened
     * invisibly and the tile simply appeared.
     */
    const p = ports()
    const before = readyToPlace()
    const next = handleWorldTap(before, { kind: 'socket', axial: { q: 1, r: 0 } }, p)
    expect(count(next.island)).toBe(count(before.island))
    expect(next.plot).toEqual({ at: { q: 1, r: 0 }, type: 'water' })
    expect(p.win).toHaveBeenCalled()
  })

  it('does nothing when no type has been chosen yet', () => {
    const p = ports()
    const open = askForLand(createFlow())                  // bank open, nothing picked
    const next = handleWorldTap(open, { kind: 'socket', axial: { q: 1, r: 0 } }, p)
    expect(next).toBe(open)
    expect(p.win).not.toHaveBeenCalled()
  })

  it('keeps the choice when the socket is not legal', () => {
    // A mis-tap must never cost her the work (brief section 18)
    const p = ports()
    const before = readyToPlace()
    const next = handleWorldTap(before, { kind: 'socket', axial: { q: 9, r: 9 } }, p)
    expect(next.chosen).toBe('water')
    expect(next.plot).toBeNull()
    expect(count(next.island)).toBe(count(before.island))
  })

  it('siting a plot opens the sums that build it', () => {
    /*
     * Without this the child picks a spot, watches a ghost hex appear, and is
     * handed back to an island with no obvious way to get on with it.
     */
    const p = ports()
    const next = handleWorldTap(readyToPlace(), { kind: 'socket', axial: { q: 1, r: 0 } }, p)
    expect(next.plot).toEqual({ at: { q: 1, r: 0 }, type: 'water' })
    expect(p.openSum).toHaveBeenCalledWith(next)
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
  it('opens the BANK from free play, not a sum', () => {
    /*
     * Spec section 2 builds the tile in view, so there is nothing for a sum to
     * advance until the child has said what she wants and where. Opening a
     * round here is the invisible progress the growing plot exists to abolish.
     */
    const p = ports()
    const next = handleWorldTap(createFlow(), { kind: 'tile', axial: { q: 0, r: 0 } }, p)
    expect(next.phase).toBe('placing')
    expect(p.openSum).not.toHaveBeenCalled()
    expect(p.say).toHaveBeenCalled()
  })

  it('opens a sum once a plot is under construction', () => {
    const p = ports()
    const f = midBuild()
    const next = handleWorldTap({ ...f, phase: 'free' }, { kind: 'tile', axial: { q: 0, r: 0 } }, p)
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

  it('a legitimately opened round earns the first pet', () => {
    // The curve makes the FIRST egg a single page, so one round hatches it
    const next = handleChallengePassed(tapEgg(createFlow()), { name: 'Bimo', species: 'animal-fox' })
    expect(next.pets).toHaveLength(1)
    expect(hatchOne().pets).toHaveLength(1)
  })

  it('leaving costs nothing — no pet, no plot, egg still there', () => {
    const building = midBuild()
    const mid = tapEgg({ ...building, phase: 'free' })
    const out = handleChallengeDismissed(mid)
    expect(out.phase).toBe('free')
    expect(out.plot).toEqual(building.plot)      // the site is still hers
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

  it('a legitimately passed sum finishes the sited plot', () => {
    const p = ports()
    const sited = handleWorldTap(readyToPlace(), { kind: 'socket', axial: { q: 1, r: 0 } }, p)
    const done = handleChallengePassed(tapSum({ ...sited, phase: 'free' }))
    expect(done.plot).toBeNull()
    expect(count(done.island)).toBe(2)
    expect(done.tilesEarned).toBe(1)
  })

  it('builds one plot at a time, and never loses the one in progress', () => {
    // Found at the M1 gate in its earlier form: a surplus hid the offer and a
    // tile she had earned became unreachable. The plot cannot be surplus —
    // there is only ever one, and asking again advances it.
    const p = ports()
    let f = earnTile()
    f = handleWorldTap({ ...f, phase: 'free' }, { kind: 'tile', axial: { q: 0, r: 0 } }, p)
    expect(f.phase).toBe('placing')
    f = handleWorldTap(chooseTile(f, 'water'), { kind: 'socket', axial: { q: 0, r: 1 } }, p)
    const plot = f.plot
    expect(plot).not.toBeNull()

    // Asking for land again advances this plot rather than starting another.
    const again = handleWorldTap({ ...f, phase: 'free' }, { kind: 'tile', axial: { q: 0, r: 0 } }, p)
    expect(again.plot).toEqual(plot)
    expect(again.challenge).toBe('sum')
  })
})

describe('a reward is only announced when it actually lands', () => {
  /*
   * The bug this pins: the hatch ceremony fired on EVERY completed page, so a
   * name was spoken and a friend announced when none had arrived. Under the
   * cost curve most pages do not hatch anything, so the game was promising a
   * friend several times per egg and delivering once.
   *
   * The observable rule: a pet appears in the flow, or nothing is announced.
   */
  it('a mid-egg page adds no pet, so there is nothing to announce', () => {
    // Get past the free first egg, then read ONE page of the next one
    const after = hatchOne()
    const mid = handleChallengePassed(
      tapEgg({ ...after, phase: 'free' }), { name: 'Ghost', species: 'animal-bee' })
    expect(mid.pets).toHaveLength(after.pets.length)   // no new friend
    expect(mid.readProgress).toBeGreaterThan(0)        // but real progress
  })

  it('the final page of an egg does add the pet', () => {
    const f = hatchOne(hatchOne(), 'Second')
    expect(f.pets).toHaveLength(2)
    expect(f.pets[1]!.name).toBe('Second')
  })

  it('a mid-plot sum adds no land, so there is nothing to announce', () => {
    const building = midBuild()
    const before = count(building.island)
    const mid = handleChallengePassed(tapSum({ ...building, phase: 'free' }))
    expect(count(mid.island)).toBe(before)              // no new land yet
    expect(mid.plot).not.toBeNull()                     // still building
    expect(mid.sumProgress).toBeGreaterThan(0)          // but real progress
  })
})

/*
 * The port-shaped blind spot, pinned.
 *
 * Every port here is a mock, so "openSum was called" only proves that a
 * function ran — not that the state handed to it was one the REAL port would
 * accept. main.ts's openSum begins `if (state.phase !== 'challenge' ||
 * state.challenge !== 'sum') return`, and siting a plot returns 'free'; the
 * call happened, the guard dropped it, and nothing opened. Green test,
 * dead feature, third time this shape has shipped.
 *
 * So these assert the CONTRACT the real port enforces, not the call.
 */
describe('what the ports are actually handed', () => {
  /** The guard from main.ts openSum/openRead, duplicated as an oracle. */
  const opensAs = (kind: 'read' | 'sum') => (f: Flow): boolean =>
    f.phase === 'challenge' && f.challenge === kind

  it('siting a plot hands openSum a state that will really open', () => {
    const p = ports()
    const next = handleWorldTap(readyToPlace(), { kind: 'socket', axial: { q: 1, r: 0 } }, p)
    const handed = (p.openSum as ReturnType<typeof vi.fn>).mock.calls[0]?.[0] as Flow
    expect(handed).toBeDefined()
    expect(opensAs('sum')(handed)).toBe(true)
    expect(handed.plot).toEqual({ at: { q: 1, r: 0 }, type: 'water' })
    // and the flow the caller keeps is the same one the port got
    expect(next).toEqual(handed)
  })

  it('asking for land with a plot hands openSum an openable state', () => {
    const p = ports()
    const f = midBuild()
    handleWorldTap({ ...f, phase: 'free' }, { kind: 'tile', axial: { q: 0, r: 0 } }, p)
    const handed = (p.openSum as ReturnType<typeof vi.fn>).mock.calls[0]?.[0] as Flow
    expect(opensAs('sum')(handed)).toBe(true)
  })

  it('tapping the egg hands openRead an openable state', () => {
    const p = ports()
    handleWorldTap(createFlow(), { kind: 'egg' }, p)
    const handed = (p.openRead as ReturnType<typeof vi.fn>).mock.calls[0]?.[0] as Flow
    expect(opensAs('read')(handed)).toBe(true)
  })
})

/*
 * Governors are INVITATIONS (spec §5), and an invitation that has already
 * moved the flow into a challenge is a trap: there is no overlay to finish or
 * dismiss, every later tap no-ops on the wrong phase, and only a reload gets
 * out. So a paused tap must leave the flow exactly where it was.
 */
describe('a governor diverts a tap, it never strands one', () => {
  it('a paused egg tap leaves the flow in free play', () => {
    const p = ports({ eggsPaused: () => true })
    const before = createFlow()
    const next = handleWorldTap(before, { kind: 'egg' }, p)
    expect(next).toBe(before)
    expect(next.phase).toBe('free')
    expect(p.openRead).not.toHaveBeenCalled()
    expect(p.invite).toHaveBeenCalledWith('nursery-queue')
  })

  it('a paused land tap does not open the bank', () => {
    const p = ports({ landPaused: () => true })
    const before = createFlow()
    const next = handleWorldTap(before, { kind: 'tile', axial: { q: 0, r: 0 } }, p)
    expect(next).toBe(before)
    expect(next.phase).toBe('free')
    expect(p.invite).toHaveBeenCalledWith('space-surplus')
  })

  it('never pauses a plot that is already under construction', () => {
    // §5: work in progress always finishes. The pause is on STARTING land.
    const p = ports({ landPaused: () => true })
    const f = midBuild()
    const next = handleWorldTap({ ...f, phase: 'free' }, { kind: 'tile', axial: { q: 0, r: 0 } }, p)
    expect(next.challenge).toBe('sum')
    expect(p.invite).not.toHaveBeenCalled()
  })
})
