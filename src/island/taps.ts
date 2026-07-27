/**
 * Telling a tap from a drag.
 *
 * The island is both a thing you turn and a thing you touch, and those two
 * gestures start identically. The first version acted on `pointerdown`, so the
 * moment a finger landed to rotate the world it had already opened a maths
 * round — Joe hit this repeatedly: "i have intended to rotate the island, but
 * ended up in a maths challenge."
 *
 * The rule is the ordinary one, and it is worth stating because it is easy to
 * get subtly wrong: a tap is a press that goes DOWN and comes UP in roughly
 * the same place, soon enough, with one finger. Anything else belongs to the
 * camera. Crucially the decision is made on release, not on contact — you
 * cannot know a press was a tap until it ends.
 *
 * Pure, so the thresholds are testable without a canvas. Everything that
 * actually decides something in this project lives somewhere it can be
 * asserted; historically every blocker has been in the untested glue.
 */

/**
 * How far a finger may wander and still count as a tap, in CSS pixels.
 *
 * Generous on purpose. This is a six-year-old on a tablet, and a child's tap
 * smears far more than an adult's mouse click — too tight a threshold turns
 * "I tapped the egg" into "nothing happened", which is a worse failure than
 * an occasional unwanted round.
 */
export const TAP_SLOP_PX = 14

/**
 * How long a press may last and still count as a tap, in milliseconds.
 *
 * A long press with no movement is someone resting a finger while they think,
 * or beginning a drag they have not committed to yet. Neither wants a round.
 */
export const TAP_MAX_MS = 800

/**
 * Movement below this counts as no movement at all.
 *
 * A press that never really moved can only mean "I pressed this thing",
 * however long it lasted — so a still press is exempt from the time limit
 * entirely. A child who puts her finger on the egg and holds it while she
 * looks at it must not be met with silence; there is no long-press gesture
 * here for the hold to be confused with, and an unwanted round can be
 * dismissed whereas a dead egg cannot be explained.
 */
export const STILL_PX = 4

export interface Press {
  x: number
  y: number
  /** Timestamp in milliseconds; any monotonic clock will do. */
  at: number
}

/**
 * Did this press end as a tap?
 *
 * `travelled` is the FURTHEST the pointer ever got from where it started, not
 * the distance between down and up. A finger that swings out to rotate the
 * island and happens to come back is still a drag, and measuring only the
 * endpoints would call it a tap.
 */
export function isTap(down: Press, up: Press, travelled: number): boolean {
  if (travelled > TAP_SLOP_PX) return false
  const drift = Math.hypot(up.x - down.x, up.y - down.y)
  if (drift > TAP_SLOP_PX) return false
  // A press that never moved is a tap however long it was held.
  if (travelled <= STILL_PX && drift <= STILL_PX) return true
  return up.at - down.at <= TAP_MAX_MS
}

/**
 * Tracks one press at a time and reports whether it ended as a tap.
 *
 * Single-pointer by design: a second finger means a pinch, and the first
 * finger's press is abandoned rather than fired on release. Two-finger zoom
 * that ends in a stray challenge is the same bug in another costume.
 */
export interface TapTracker {
  down(id: number, x: number, y: number, at: number): void
  move(id: number, x: number, y: number): void
  /** The press ended. Returns true only if it was a tap. */
  up(id: number, x: number, y: number, at: number): boolean
  /** Where the press began — where she was aiming. Null between presses. */
  origin(): { x: number; y: number } | null
  /** Cancelled by the browser. Without an id, forget everything. */
  cancel(id?: number): void
}

export function createTapTracker(): TapTracker {
  let press: (Press & { id: number }) | null = null
  let travelled = 0
  /**
   * Every pointer currently on the glass, not just the one being tracked.
   *
   * Counting matters: abandoning the press on a second finger is not enough
   * on its own, because with two fingers still down a THIRD contact looked
   * like a clean new press and its release fired a tap in the middle of a
   * pinch. A press only counts while it is the only pointer there is.
   */
  const downIds = new Set<number>()

  return {
    down(id, x, y, at) {
      downIds.add(id)
      // Anything but a single finger is a pinch or a resting palm, not a tap.
      if (downIds.size > 1) { press = null; return }
      press = { id, x, y, at }
      travelled = 0
    },

    move(id, x, y) {
      if (!press || press.id !== id) return
      travelled = Math.max(travelled, Math.hypot(x - press.x, y - press.y))
    },

    up(id, x, y, at) {
      downIds.delete(id)
      const started = press
      press = null
      if (!started || started.id !== id) return false
      return isTap(started, { x, y, at }, travelled)
    },

    /** Where the press BEGAN — where she was aiming. */
    origin: () => (press ? { x: press.x, y: press.y } : null),

    cancel(id) {
      if (id !== undefined) {
        downIds.delete(id)
        // A cancel from some other pointer — a pen leaving hover range, an
        // OS-cancelled second contact — must not kill a live press.
        if (press && press.id !== id) return
      } else {
        downIds.clear()
      }
      press = null
    },
  }
}

/**
 * Wire a tap tracker to an element, calling `onTap` at the point she AIMED.
 *
 * The aim point is where the press began, not where it ended. Up to a
 * finger's worth of drift is forgiven on release, and a child's finger rolls
 * as it lifts — picking at the release point meant an aim at the egg could
 * land on the tile beside it and open a sum, which is issue #7's own
 * complaint reproduced in miniature.
 *
 * Lives here rather than in main.ts so the binding itself is testable. The
 * pure thresholds were tested while the wiring that used them was not, and a
 * regression to acting on contact would have passed the whole suite.
 */
export function bindWorldTaps(
  el: {
    addEventListener(type: string, fn: (e: PointerEvent) => void): void
  },
  onTap: (x: number, y: number) => void,
): TapTracker {
  const tracker = createTapTracker()

  el.addEventListener('pointerdown', e => {
    tracker.down(e.pointerId, e.clientX, e.clientY, e.timeStamp)
  })
  el.addEventListener('pointermove', e => {
    tracker.move(e.pointerId, e.clientX, e.clientY)
  })
  el.addEventListener('pointercancel', e => tracker.cancel(e.pointerId))
  el.addEventListener('pointerleave', e => tracker.cancel(e.pointerId))
  el.addEventListener('pointerup', e => {
    const aim = tracker.origin()
    if (!tracker.up(e.pointerId, e.clientX, e.clientY, e.timeStamp)) return
    onTap(aim ? aim.x : e.clientX, aim ? aim.y : e.clientY)
  })

  return tracker
}
