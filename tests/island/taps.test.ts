/**
 * Tap versus drag.
 *
 * Joe, repeatedly: "several times i have intended to rotate the island, but
 * ended up in a maths challenge." The island is both a thing you turn and a
 * thing you touch, and the two gestures begin identically — so these tests
 * are mostly about the gestures that must NOT open a round.
 */
import { describe, it, expect } from 'vitest'
import {
  isTap, createTapTracker, bindWorldTaps, TAP_SLOP_PX, TAP_MAX_MS,
} from '../../src/island/taps'

const at = (x: number, y: number, t = 0): { x: number; y: number; at: number } =>
  ({ x, y, at: t })

describe('isTap', () => {
  it('accepts a still, brief press', () => {
    expect(isTap(at(100, 100, 0), at(100, 100, 90), 0)).toBe(true)
  })

  it('forgives the smear of a small finger', () => {
    // A child's tap wanders. Too tight a threshold turns "I tapped the egg"
    // into "nothing happened", which is worse than an unwanted round.
    expect(isTap(at(100, 100, 0), at(108, 104, 120), 9)).toBe(true)
  })

  it('rejects a press that travelled too far', () => {
    expect(isTap(at(100, 100, 0), at(180, 100, 200), 80)).toBe(false)
  })

  it('rejects a drag that RETURNED to where it started', () => {
    /*
     * The subtle one. Swinging out to rotate the island and coming back lands
     * the finger where it began, so comparing only the endpoints calls it a
     * tap. The furthest distance reached is what settles it.
     */
    expect(isTap(at(100, 100, 0), at(100, 100, 400), 120)).toBe(false)
  })

  it('accepts a long press that never moved', () => {
    /*
     * A child puts her finger on the egg and holds it while she looks at it.
     * There is no long-press gesture here for that to be confused with, so
     * the only thing it can mean is "I pressed this". Meeting it with silence
     * is the worst failure available: an unwanted round can be dismissed, a
     * dead egg cannot be explained.
     */
    expect(isTap(at(100, 100, 0), at(100, 100, 3000), 0)).toBe(true)
  })

  it('still rejects a long press that wandered', () => {
    // Moved AND slow: a drag that was thought better of, not a tap.
    expect(isTap(at(100, 100, 0), at(108, 100, TAP_MAX_MS + 1), 10)).toBe(false)
  })

  it('holds exactly at the thresholds rather than one pixel inside them', () => {
    expect(isTap(at(0, 0, 0), at(TAP_SLOP_PX, 0, TAP_MAX_MS), TAP_SLOP_PX)).toBe(true)
    expect(isTap(at(0, 0, 0), at(TAP_SLOP_PX + 1, 0, 10), TAP_SLOP_PX + 1)).toBe(false)
  })
})

describe('the tracker', () => {
  it('reports a still press as a tap', () => {
    const t = createTapTracker()
    t.down(1, 50, 50, 0)
    expect(t.up(1, 50, 50, 100)).toBe(true)
  })

  it('does not report a drag, even one that comes home', () => {
    const t = createTapTracker()
    t.down(1, 50, 50, 0)
    t.move(1, 200, 50)
    t.move(1, 50, 50)
    expect(t.up(1, 50, 50, 300)).toBe(false)
  })

  it('abandons the press when a second finger lands — that is a pinch', () => {
    const t = createTapTracker()
    t.down(1, 50, 50, 0)
    t.down(2, 200, 200, 10)          // pinch to zoom
    expect(t.up(1, 50, 50, 200)).toBe(false)
    expect(t.up(2, 200, 200, 200)).toBe(false)
  })

  it('ignores an up from a pointer that never went down here', () => {
    const t = createTapTracker()
    expect(t.up(9, 50, 50, 0)).toBe(false)
  })

  it('cancels cleanly, and a cancelled press never fires', () => {
    const t = createTapTracker()
    t.down(1, 50, 50, 0)
    t.cancel()
    expect(t.up(1, 50, 50, 100)).toBe(false)
  })

  it('never fires twice for one press', () => {
    // A double-fire would open a round and immediately open another.
    const t = createTapTracker()
    t.down(1, 50, 50, 0)
    expect(t.up(1, 50, 50, 100)).toBe(true)
    expect(t.up(1, 50, 50, 100)).toBe(false)
  })

  it('starts each press fresh, so an earlier drag cannot veto a later tap', () => {
    const t = createTapTracker()
    t.down(1, 50, 50, 0)
    t.move(1, 400, 400)
    expect(t.up(1, 400, 400, 300)).toBe(false)

    t.down(2, 50, 50, 400)
    expect(t.up(2, 50, 50, 460)).toBe(true)
  })
})

/**
 * A fake element that records listeners so they can be driven directly.
 *
 * The binding is tested, not just the thresholds. The first version tested
 * the pure rule beautifully while main.ts still acted on contact — a
 * regression to pointerdown-firing would have passed the entire suite.
 */
function fakeCanvas() {
  const listeners = new Map<string, Array<(e: PointerEvent) => void>>()
  const el = {
    addEventListener(type: string, fn: (e: PointerEvent) => void) {
      const list = listeners.get(type) ?? []
      list.push(fn)
      listeners.set(type, list)
    },
  }
  const fire = (type: string, e: Partial<PointerEvent>): void => {
    for (const fn of listeners.get(type) ?? []) fn(e as PointerEvent)
  }
  return { el, fire, types: () => [...listeners.keys()] }
}

describe('bindWorldTaps', () => {
  it('does NOT act when the finger lands — only when it lifts', () => {
    /*
     * The whole point of issue #7. You cannot know a press was a tap until it
     * ends, so acting on contact turns every attempt to rotate the island
     * into a maths round.
     */
    const c = fakeCanvas()
    const taps: Array<[number, number]> = []
    bindWorldTaps(c.el, (x, y) => taps.push([x, y]))

    c.fire('pointerdown', { pointerId: 1, clientX: 50, clientY: 50, timeStamp: 0 })
    expect(taps).toHaveLength(0)          // nothing yet, and that is the fix

    c.fire('pointerup', { pointerId: 1, clientX: 50, clientY: 50, timeStamp: 80 })
    expect(taps).toEqual([[50, 50]])
  })

  it('reports where she AIMED, not where her finger ended up', () => {
    /*
     * A child's finger rolls as it lifts. Picking at the release point meant
     * an aim at the egg could land on the tile beside it and open a sum —
     * issue #7's own complaint, reproduced in miniature at the boundary
     * between two tappable things.
     */
    const c = fakeCanvas()
    const taps: Array<[number, number]> = []
    bindWorldTaps(c.el, (x, y) => taps.push([x, y]))

    c.fire('pointerdown', { pointerId: 1, clientX: 100, clientY: 100, timeStamp: 0 })
    c.fire('pointermove', { pointerId: 1, clientX: 108, clientY: 106 })
    c.fire('pointerup', { pointerId: 1, clientX: 108, clientY: 106, timeStamp: 120 })

    expect(taps).toEqual([[100, 100]])
  })

  it('stays silent through a drag', () => {
    const c = fakeCanvas()
    const taps: unknown[] = []
    bindWorldTaps(c.el, (x, y) => taps.push([x, y]))

    c.fire('pointerdown', { pointerId: 1, clientX: 100, clientY: 100, timeStamp: 0 })
    c.fire('pointermove', { pointerId: 1, clientX: 260, clientY: 140 })
    c.fire('pointerup', { pointerId: 1, clientX: 260, clientY: 140, timeStamp: 400 })

    expect(taps).toHaveLength(0)
  })

  it('listens for the cancel paths, so a lost pointer cannot fire later', () => {
    const c = fakeCanvas()
    const taps: unknown[] = []
    bindWorldTaps(c.el, () => taps.push(1))
    expect(c.types()).toEqual(
      expect.arrayContaining(['pointerdown', 'pointermove', 'pointerup', 'pointercancel']))

    c.fire('pointerdown', { pointerId: 1, clientX: 50, clientY: 50, timeStamp: 0 })
    c.fire('pointercancel', { pointerId: 1 })
    c.fire('pointerup', { pointerId: 1, clientX: 50, clientY: 50, timeStamp: 60 })
    expect(taps).toHaveLength(0)
  })

  it('survives a cancel from an UNRELATED pointer', () => {
    // A pen leaving hover range, or an OS-cancelled second contact, must not
    // kill the press the child is actually making.
    const c = fakeCanvas()
    const taps: unknown[] = []
    bindWorldTaps(c.el, () => taps.push(1))

    c.fire('pointerdown', { pointerId: 1, clientX: 50, clientY: 50, timeStamp: 0 })
    c.fire('pointercancel', { pointerId: 7 })
    c.fire('pointerup', { pointerId: 1, clientX: 50, clientY: 50, timeStamp: 60 })
    expect(taps).toHaveLength(1)
  })
})

describe('many fingers', () => {
  it('does not fire for a third contact while two are still down', () => {
    /*
     * Abandoning the press on a second finger is not enough on its own: with
     * two fingers still on the glass, a third contact looked like a clean new
     * press and its release fired a tap in the middle of a pinch.
     */
    const t = createTapTracker()
    t.down(1, 10, 10, 0)
    t.down(2, 200, 200, 5)
    t.down(3, 120, 120, 10)
    expect(t.up(3, 120, 120, 90)).toBe(false)
  })

  it('recovers once every finger has left', () => {
    const t = createTapTracker()
    t.down(1, 10, 10, 0)
    t.down(2, 200, 200, 5)
    t.up(1, 10, 10, 100)
    t.up(2, 200, 200, 110)

    t.down(3, 50, 50, 200)
    expect(t.up(3, 50, 50, 260)).toBe(true)
  })
})
