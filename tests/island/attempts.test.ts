/**
 * The attempt model as arithmetic (A2).
 *
 * No DOM here on purpose — `overlay.test.ts` proves the renderers are wired to
 * these calls, and this file proves the calls mean what the spec and Joe's
 * rulings (JT-008) say they mean. Splitting them is what stops a rule being
 * "tested" by a test that would pass with the rule deleted.
 */
import { describe, it, expect, vi } from 'vitest'
import { createAttemptTally } from '../../src/island/attempts'
import type { AttemptEvent } from '../../src/island/attempts'
import { MASH_WRONGS } from '../../src/island/governors'

/** A tally with a hand-cranked clock, so latency is asserted and not sampled. */
function setup() {
  const seen: AttemptEvent[] = []
  let t = 1000
  const tally = createAttemptTally(e => seen.push(e), () => t)
  return { seen, tally, tick: (ms: number) => { t += ms }, at: () => t }
}

describe('correctness — the same test on all three paths', () => {
  it('sum: correct iff the first pad tap is right', () => {
    const { seen, tally } = setup()
    tally.pageStarted('sum')
    tally.right()
    expect(seen).toHaveLength(1)
    expect(seen[0]).toMatchObject({ kind: 'sum', index: 0, correct: true })
  })

  it('sum: one wrong chip before the right one makes it incorrect', () => {
    const { seen, tally } = setup()
    tally.pageStarted('sum')
    tally.wrong()
    tally.right()
    expect(seen[0]).toMatchObject({ correct: false })
  })

  it('build: correct iff completed with zero wrong tile taps', () => {
    const { seen, tally } = setup()
    tally.pageStarted('build')
    tally.wrong()
    tally.right()
    expect(seen).toHaveLength(1)
    expect(seen[0]).toMatchObject({ kind: 'build', index: 0, correct: false })
  })

  it('find: one attempt per target, judged on ITS own first tap', () => {
    const { seen, tally } = setup()
    tally.pageStarted('find')
    tally.right()               // word 1, clean
    tally.wrong()               // a wrong guess at word 2
    tally.right()
    tally.right()               // word 3, clean again
    expect(seen.map(e => e.correct)).toEqual([true, false, true])
    expect(seen.map(e => e.index)).toEqual([0, 1, 2])
    expect(seen.every(e => e.kind === 'find')).toBe(true)
  })

  it("find: a wrong tap does not follow her to the next word", () => {
    // The renderers reset their own wrong counter on a correct tap (v0), and
    // the model must agree: word 2 is a fresh question, not a damaged one.
    const { seen, tally } = setup()
    tally.pageStarted('find')
    tally.wrong()
    tally.right()
    tally.right()
    expect(seen.map(e => e.correct)).toEqual([false, true])
  })
})

describe('latency — question put, not page mounted', () => {
  it('a sum starts its clock at the mount, where the question already is', () => {
    const { seen, tally, tick } = setup()
    tally.pageStarted('sum')
    tick(2400)
    tally.right()
    expect(seen[0]?.latencyMs).toBe(2400)
  })

  it('find and build start theirs when the prompt is issued', () => {
    const { seen, tally, tick } = setup()
    tally.pageStarted('build')
    tick(900)                   // the prompt timer, which is not her thinking
    tally.prompted()
    tick(1500)
    tally.right()
    expect(seen[0]?.latencyMs).toBe(1500)
  })

  it('re-reads do not restart the clock', () => {
    // sayAgain, the 650ms retry and the slow rescue all speak again. None of
    // them is a fresh question, and a clock that restarted on them would
    // measure a struggling child as the fastest in the game.
    const { seen, tally, tick } = setup()
    tally.pageStarted('find')
    tally.prompted()
    tick(1000)
    tally.prompted()
    tick(1000)
    tally.right()
    expect(seen[0]?.latencyMs).toBe(2000)
  })

  it('each find target is timed from its OWN prompt', () => {
    const { seen, tally, tick } = setup()
    tally.pageStarted('find')
    tally.prompted()
    tick(500)
    tally.right()               // word 1 took 500ms
    tick(800)                   // wordFind.ts:68 — the gap before word 2 is asked
    tally.prompted()
    tick(3000)
    tally.right()
    expect(seen.map(e => e.latencyMs)).toEqual([500, 3000])
  })

  it('is measured to the FIRST tap, right or wrong', () => {
    const { seen, tally, tick } = setup()
    tally.pageStarted('sum')
    tick(700)
    tally.wrong()
    tick(5000)
    tally.right()
    expect(seen[0]?.latencyMs).toBe(700)
  })

  it('is null when she answers before the prompt was ever issued', () => {
    const { seen, tally, tick } = setup()
    tally.pageStarted('find')
    tick(200)
    tally.right()
    expect(seen[0]?.latencyMs).toBeNull()
  })
})

describe('JT-008(1) — the peek is no attempt at all', () => {
  it('emits nothing for a peeked sum', () => {
    const { seen, tally } = setup()
    tally.pageStarted('sum')
    tally.help('peek')
    tally.right()               // the reveal path, whatever it fires
    expect(seen).toEqual([])
  })

  it('leaves the page ending silent as well', () => {
    const { seen, tally } = setup()
    tally.pageStarted('sum')
    tally.help('peek')
    tally.pageEnded()
    expect(seen).toEqual([])
  })

  it('does not void the next page', () => {
    const { seen, tally } = setup()
    tally.pageStarted('sum')
    tally.help('peek')
    tally.pageEnded()
    tally.pageStarted('sum')
    tally.right()
    expect(seen).toHaveLength(1)
    expect(seen[0]?.correct).toBe(true)
  })
})

describe('JT-008(2) — a hinted answer counts', () => {
  it('is emitted, and emitted as CORRECT when she then gets it right', () => {
    // The spec said help was "free but uncounted"; Joe overruled it. The long
    // latency is what carries the cost, in the speed tier.
    const { seen, tally, tick } = setup()
    tally.pageStarted('sum')
    tally.help('dots')
    tick(9000)
    tally.right()
    expect(seen).toHaveLength(1)
    expect(seen[0]).toMatchObject({ correct: true, helped: true, latencyMs: 9000 })
  })

  it("marks Fred's sounding-out the same way", () => {
    const { seen, tally } = setup()
    tally.pageStarted('build')
    tally.help('fred')
    tally.right()
    expect(seen[0]).toMatchObject({ helped: true, correct: true })
  })

  it('help does not leak from one find target to the next', () => {
    const { seen, tally } = setup()
    tally.pageStarted('find')
    tally.help('dots')
    tally.right()
    tally.right()
    expect(seen.map(e => e.helped)).toEqual([true, false])
  })
})

describe('JT-008(3) — abandonment is a pause, not a failure', () => {
  it('discards the word she was in the middle of', () => {
    const { seen, tally } = setup()
    tally.pageStarted('find')
    tally.wrong()
    tally.pageEnded()
    expect(seen).toEqual([])
  })

  it('keeps every word she DID answer', () => {
    const { seen, tally } = setup()
    tally.pageStarted('find')
    tally.right()
    tally.right()
    tally.wrong()               // halfway through the third
    tally.pageEnded()
    expect(seen.map(e => e.index)).toEqual([0, 1])
    expect(seen.every(e => e.correct)).toBe(true)
  })

  it('never emits an incorrect attempt for leaving', () => {
    const { seen, tally } = setup()
    tally.pageStarted('build')
    tally.pageEnded()
    expect(seen).toEqual([])
  })
})

describe('the rescue is recorded, never excluded', () => {
  it('flags the attempt the renderer rescued', () => {
    const { seen, tally } = setup()
    tally.pageStarted('sum')
    for (let i = 0; i < MASH_WRONGS; i++) tally.wrong()
    tally.right()
    expect(seen[0]).toMatchObject({ rescued: true, correct: false })
  })

  it('a rescued attempt is incorrect by construction, so flagging it is free', () => {
    // MASH_WRONGS wrongs are needed to summon one, and one wrong is already
    // enough to lose the attempt. There is no reachable rescued-and-correct.
    expect(MASH_WRONGS).toBeGreaterThan(0)
  })

  it('two rescues on one stubborn target are still one fact', () => {
    const { seen, tally } = setup()
    tally.pageStarted('find')
    for (let i = 0; i < MASH_WRONGS * 2; i++) tally.wrong()
    tally.right()
    expect(seen[0]?.rescued).toBe(true)
  })

  it('does not follow her to the next target', () => {
    const { seen, tally } = setup()
    tally.pageStarted('find')
    for (let i = 0; i < MASH_WRONGS; i++) tally.wrong()
    tally.right()
    tally.right()
    expect(seen.map(e => e.rescued)).toEqual([true, false])
  })
})

describe('nothing is counted outside a page', () => {
  it('ignores taps before the first page and after the last', () => {
    const { seen, tally } = setup()
    tally.wrong()
    tally.right()
    tally.help('dots')
    tally.pageStarted('sum')
    tally.pageEnded()
    tally.right()
    expect(seen).toEqual([])
  })

  it('a fresh page starts at index 0 with a clean slate', () => {
    const { seen, tally } = setup()
    tally.pageStarted('find')
    tally.wrong()
    tally.right()
    tally.pageEnded()
    tally.pageStarted('find')
    tally.right()
    expect(seen[1]).toMatchObject({ index: 0, correct: true, helped: false, rescued: false })
  })

  it('defaults its clock to Date.now when none is injected', () => {
    const seen: AttemptEvent[] = []
    const now = vi.spyOn(Date, 'now').mockReturnValue(4242)
    const tally = createAttemptTally(e => seen.push(e))
    tally.pageStarted('sum')
    tally.right()
    expect(seen[0]?.at).toBe(4242)
    now.mockRestore()
  })
})
