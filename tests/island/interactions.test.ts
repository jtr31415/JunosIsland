import { describe, it, expect, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
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

/**
 * A FAITHFUL `invite`, not a stub that always says the same thing.
 *
 * The real one in `main.ts` remembers the last thing Fred asked for and clears
 * that memory the moment she overrides it, so the sequence is ask, override,
 * ask, override. A `vi.fn()` returning `undefined` would make every tap an
 * override and every one of these tests pass for the wrong reason — which is
 * HANDOFF §5, the mock that hid four dead features. Assert the contract.
 */
function askOnce() {
  let asked: string | null = null
  return vi.fn((which: 'space-surplus' | 'nursery-queue'): 'asked' | 'again' => {
    if (asked === which) { asked = null; return 'again' }
    asked = which
    return 'asked'
  })
}

function ports(over: Partial<InteractionPorts> = {}): InteractionPorts {
  return {
    challengeOpen: () => false,
    eggsPaused: () => false,
    landPaused: () => false,
    invite: askOnce(),
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
  /*
   * He used to replay the whole opening, and Joe hit it mid-game: the intro
   * restarted, handed over an animal after one challenge and a tile after the
   * next, in the middle of a session she was already playing. A tap on a
   * friendly character has to be the smallest thing in the game.
   */
  it('hops and says his name, like any other friend', () => {
    const p = ports()
    handleWorldTap(createFlow(), { kind: 'fred' }, p)
    expect(p.greetFred).toHaveBeenCalled()
  })

  it('changes nothing at all', () => {
    // Not "changes little" — a greeting must not move the flow one inch,
    // whatever she happens to be in the middle of.
    for (const f of [createFlow(), readyToPlace(), tapEgg(createFlow())]) {
      expect(handleWorldTap(f, { kind: 'fred' }, ports())).toBe(f)
    }
  })

  it('never opens a round', () => {
    const p = ports()
    handleWorldTap(createFlow(), { kind: 'fred' }, p)
    expect(p.openRead).not.toHaveBeenCalled()
    expect(p.openSum).not.toHaveBeenCalled()
  })
})

describe('tapping her own land', () => {
  /*
   * Joe: "annoying UX if you only want to look around the island." Any patch
   * of grass used to start a maths round, so turning the camera to look at
   * what she had built handed her a sum instead.
   */
  it('starts no challenge when there is no plot under construction', () => {
    const p = ports()
    const f = createFlow()
    expect(handleWorldTap(f, { kind: 'tile', axial: { q: 0, r: 0 } }, p)).toBe(f)
    expect(p.openSum).not.toHaveBeenCalled()
  })

  /*
   * Joe: "zoom to location. at the moment zoom and rotation is only around the
   * origin tile." The tile tap was the one gesture in the game that did
   * nothing at all, and "look here" is the only thing it can unambiguously
   * mean — so that is what it now does. It moves the camera and NOTHING else.
   */
  it('turns the island about the tile she tapped', () => {
    const p = ports()
    const f = createFlow()
    const next = handleWorldTap(f, { kind: 'tile', axial: { q: 3, r: -2 } }, p)
    expect(p.focusOn).toHaveBeenCalledWith({ q: 3, r: -2 })
    // Costs nothing and changes nothing: it is a camera move.
    expect(next).toBe(f)
  })

  it('focuses without starting a challenge, ever', () => {
    // The whole point of choosing a gesture that was previously inert.
    const p = ports()
    handleWorldTap(createFlow(), { kind: 'tile', axial: { q: 1, r: 0 } }, p)
    expect(p.openSum).not.toHaveBeenCalled()
    expect(p.openRead).not.toHaveBeenCalled()
    expect(p.say).not.toHaveBeenCalled()
  })

  it('does not focus while a challenge is on screen', () => {
    const p = ports({ challengeOpen: () => true })
    handleWorldTap(createFlow(), { kind: 'tile', axial: { q: 1, r: 0 } }, p)
    expect(p.focusOn).not.toHaveBeenCalled()
  })

  it('does not focus while the story owns the taps', () => {
    const p = ports({ storyPlaying: () => true })
    handleWorldTap(createFlow(), { kind: 'tile', axial: { q: 1, r: 0 } }, p)
    expect(p.focusOn).not.toHaveBeenCalled()
  })

  it('does NOT carry on a plot she walked away from — PB-048', () => {
    /*
     * It used to, and Joe reported what that costs: Juno taps an ANIMAL, misses
     * — `picking.ts` answers with whatever IS under the ray, so a near-miss is
     * the tile her friend is standing on — and she is dropped into building a
     * tile she had left. Her plot is still hers; she picks it back up by tapping
     * a glowing socket, which asks her where and what afresh.
     */
    const p = ports()
    const f = midBuild()
    const free = { ...f, phase: 'free' as const }
    const next = handleWorldTap(free, { kind: 'tile', axial: { q: 0, r: 0 } }, p)
    expect(next).toBe(free)                      // a camera move changes nothing
    expect(next.plot).toEqual(f.plot)            // and the plot is still standing
    expect(p.openSum).not.toHaveBeenCalled()
  })

  it('one tap, one thing: it moves the camera and opens nothing', () => {
    /*
     * A tap that both opened a round and swung the view would be the worst of
     * both: she loses the place she was looking at AND is handed a sum she did
     * not ask for. That rule is why the tile tap could not do two things at
     * once — and since PB-048 the one thing it does is LOOK, whether a plot is
     * standing or not.
     */
    const p = ports()
    const f = midBuild()
    const free = { ...f, phase: 'free' as const }
    const next = handleWorldTap(free, { kind: 'tile', axial: { q: 0, r: 0 } }, p)
    expect(next.challenge).toBeNull()
    expect(p.openSum).not.toHaveBeenCalled()
    expect(p.focusOn).toHaveBeenCalledWith({ q: 0, r: 0 })
  })

  it('leaves a socket tap alone — asking for land is not looking at land', () => {
    const p = ports()
    handleWorldTap(createFlow(), { kind: 'socket', axial: { q: 1, r: 0 } }, p)
    expect(p.focusOn).not.toHaveBeenCalled()
  })

  it('leaves the sea alone — there is nothing out there to orbit', () => {
    const p = ports()
    handleWorldTap(createFlow(), { kind: 'sea' }, p)
    expect(p.focusOn).not.toHaveBeenCalled()
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

  it('ASKS for land from free play — the glowing outline is the way in', () => {
    /*
     * It used to do nothing here, because land was asked for by tapping any
     * grass. That made looking round the island a minefield, so the socket
     * took the job over: it is the one place building can happen and the only
     * thing that starts it.
     */
    const p = ports()
    const next = handleWorldTap(createFlow(), { kind: 'socket', axial: { q: 1, r: 0 } }, p)
    expect(next.phase).toBe('placing')
    expect(p.say).toHaveBeenCalled()
  })

  it('lets the land governor have its say before building', () => {
    // The governor guards the path that STARTS new land, and that path moved.
    const p = ports()
    p.landPaused = vi.fn(() => true)
    const f = createFlow()
    expect(handleWorldTap(f, { kind: 'socket', axial: { q: 1, r: 0 } }, p)).toBe(f)
    expect(p.invite).toHaveBeenCalledWith('space-surplus')
    expect(p.openSum).not.toHaveBeenCalled()
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
  it('does NOT open the bank from free play any more', () => {
    /*
     * Joe: "annoying UX if you only want to look around the island." Turning
     * the camera to admire what she built used to hand her a maths round. The
     * bank is opened from a socket now.
     */
    const p = ports()
    const f = createFlow()
    expect(handleWorldTap(f, { kind: 'tile', axial: { q: 0, r: 0 } }, p)).toBe(f)
    expect(p.openSum).not.toHaveBeenCalled()
    expect(p.say).not.toHaveBeenCalled()
  })

  it('does NOT open a sum once a plot is under construction either — PB-048', () => {
    /*
     * The last route by which looking at her own island could hand her a maths
     * round. A plot standing in free play is one she has walked away from, and
     * the way back into it is a glowing socket.
     */
    const p = ports()
    const f = midBuild()
    const free = { ...f, phase: 'free' as const }
    const next = handleWorldTap(free, { kind: 'tile', axial: { q: 0, r: 0 } }, p)
    expect(next).toBe(free)
    expect(p.openSum).not.toHaveBeenCalled()
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
    //
    // Asking now happens at a SOCKET; carrying on happens at either.
    const p = ports()
    let f = earnTile()
    f = handleWorldTap({ ...f, phase: 'free' }, { kind: 'socket', axial: { q: 1, r: 0 } }, p)
    expect(f.phase).toBe('placing')
    f = handleWorldTap(chooseTile(f, 'water'), { kind: 'socket', axial: { q: 0, r: 1 } }, p)
    const plot = f.plot
    expect(plot).not.toBeNull()

    // ...and looking at her own land neither starts a second one nor resumes
    // this one (PB-048). The plot she is building is untouched by the tap.
    const seen = ports()
    const again = handleWorldTap({ ...f, phase: 'free' }, { kind: 'tile', axial: { q: 0, r: 0 } }, seen)
    expect(again.plot).toEqual(plot)
    expect(seen.openSum).not.toHaveBeenCalled()
    expect(seen.focusOn).toHaveBeenCalledWith({ q: 0, r: 0 })
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

  it('a tap on her land with a plot standing hands the ports no round at all', () => {
    /*
     * This used to assert that the RESUMED state handed to openSum would really
     * open. PB-048 deleted the resumption, so the contract that matters is the
     * negative one: nothing is opened, and there is no state for the real port
     * to drop on the floor.
     */
    const p = ports()
    const f = midBuild()
    handleWorldTap({ ...f, phase: 'free' }, { kind: 'tile', axial: { q: 0, r: 0 } }, p)
    expect(p.openSum).not.toHaveBeenCalled()
    expect(p.openRead).not.toHaveBeenCalled()
  })

  it('a socket tap with a plot standing hands say the question, not a sum', () => {
    // The path that replaced it: she rechooses where and what, on entry.
    const p = ports()
    const f = midBuild()
    const next = handleWorldTap({ ...f, phase: 'free' }, { kind: 'socket', axial: { q: 1, r: -1 } }, p)
    expect(next.phase).toBe('placing')
    expect(opensAs('sum')(next)).toBe(false)
    expect(p.openSum).not.toHaveBeenCalled()
    expect(p.say).toHaveBeenCalled()
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

  it('a paused ask does not open the bank', () => {
    // The governor guards the path that STARTS new land, and that path is the
    // socket now.
    const p = ports({ landPaused: () => true })
    const before = createFlow()
    const next = handleWorldTap(before, { kind: 'socket', axial: { q: 1, r: 0 } }, p)
    expect(next).toBe(before)
    expect(next.phase).toBe('free')
    expect(p.invite).toHaveBeenCalledWith('space-surplus')
  })
})

/*
 * PB-042 / JT-012 — THE OVERRIDE. The half of rule 1 that was never true.
 *
 * Joe: *"it should start with invitation first, then let the user run with
 * whatever they want to do up to a point."* He found the missing half deployed,
 * with a six-year-old on it: *"erroneously forcing tile building"*. Fred asking
 * and then refusing forever is a lockout with a warm line on it.
 *
 * The tap that overrides is a SECOND tap on the SAME thing, so the ask is never
 * skipped and the override is never silent — Joe asked for an announcement, and
 * this is how it stays one.
 */
describe('she can ignore Fred and go ahead anyway', () => {
  it('opens the egg on the second tap even while the nursery is queued', () => {
    const p = ports({ eggsPaused: () => true })
    const before = createFlow()

    const first = handleWorldTap(before, { kind: 'egg' }, p)
    expect(first).toBe(before)                    // the ask spends the first tap
    expect(p.openRead).not.toHaveBeenCalled()

    const second = handleWorldTap(first, { kind: 'egg' }, p)
    expect(second).not.toBe(first)                // ...and the second overrides
    expect(second.phase).toBe('challenge')
    expect(second.challenge).toBe('read')
    expect(p.openRead).toHaveBeenCalledOnce()
  })

  it('starts land on the second tap even while there is spare land', () => {
    const p = ports({ landPaused: () => true })
    const before = createFlow()

    const first = handleWorldTap(before, { kind: 'socket', axial: { q: 1, r: 0 } }, p)
    expect(first).toBe(before)
    expect(p.openSum).not.toHaveBeenCalled()

    const second = handleWorldTap(first, { kind: 'socket', axial: { q: 1, r: 0 } }, p)
    expect(second).not.toBe(first)
    expect(second.phase).toBe('placing')
  })

  it('asks again next time rather than waving her through in silence', () => {
    /*
     * The memory clears ON the override, so every override costs one tap and
     * comes with Fred's line. A memory that persisted would make the second and
     * every later override SILENT, which is the silent tax Joe ruled out.
     */
    const p = ports({ eggsPaused: () => true })
    let f = createFlow()
    for (let round = 0; round < 3; round++) {
      const asked = handleWorldTap(f, { kind: 'egg' }, p)
      expect(asked).toBe(f)                       // asked, every single round
      f = handleWorldTap(asked, { kind: 'egg' }, p)
      expect(f.phase).toBe('challenge')           // and overridden, every round
      f = { ...f, phase: 'free', challenge: null }
    }
    expect(p.invite).toHaveBeenCalledTimes(6)
  })

  it('does not let one governor unlock the other', () => {
    /*
     * Fred's memory is keyed on WHICH thing he asked for. Tapping the egg then
     * the socket must not count as "she tapped twice"; each ask is overridden
     * only by a repeat of itself.
     */
    const p = ports({ eggsPaused: () => true, landPaused: () => true })
    const f = createFlow()
    const afterEgg = handleWorldTap(f, { kind: 'egg' }, p)
    const afterSocket = handleWorldTap(afterEgg, { kind: 'socket', axial: { q: 1, r: 0 } }, p)
    expect(afterSocket).toBe(f)                   // an ask, not an override
    expect(p.openSum).not.toHaveBeenCalled()
  })

  it('is wired that way in main.ts, not only in the mock', () => {
    /*
     * `askOnce` above is a faithful copy of the real port, but a faithful copy
     * is still a copy — HANDOFF §5 is four dead features shipped because a mock
     * was asserted. `main.ts` needs a browser to run, so the real `invite` is
     * pinned by its source, exactly as the wriggle-break delivery is in
     * `stretch.test.ts`. If someone reverts it to `void`, this fails.
     */
    const here = dirname(fileURLToPath(import.meta.url))
    const main = readFileSync(resolve(here, '../../src/island/main.ts'), 'utf8')
    const body = main.slice(main.indexOf('function invite(which: Nudge)'))
    const impl = body.slice(0, body.indexOf('\n  }'))
    expect(impl).toContain("'asked' | 'again'")     // it reports, it does not just do
    expect(impl).toContain("return 'again'")        // ...and the override is real
    expect(impl).toContain('asked = null')          // ...and it clears, so Fred asks again
    expect(impl).toContain("which !== 'wriggle-break'")  // the break is exempt
  })
})

describe('a governor diverts a tap, it never strands one (continued)', () => {

  it('never pauses a plot that is already under construction', () => {
    /*
     * §5: work in progress always finishes. The pause is on STARTING land.
     *
     * Asserted at the SOCKET since PB-048, because that is where carrying on now
     * happens — a tile tap opens nothing to be paused. The governor's own rule
     * (`!flow.plot && landPaused`) is PB-042's and is unchanged.
     */
    const p = ports({ landPaused: () => true })
    const f = midBuild()
    const next = handleWorldTap({ ...f, phase: 'free' }, { kind: 'socket', axial: { q: 1, r: -1 } }, p)
    expect(next.phase).toBe('placing')
    expect(p.invite).not.toHaveBeenCalled()
  })
})
