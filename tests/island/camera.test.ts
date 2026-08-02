/**
 * The camera's pivot.
 *
 * Joe: "zoom to location. at the moment zoom and rotation is only around the
 * origin tile." Everything the orbit camera does happens about one point, and
 * that point was `new THREE.Vector3(0, 0, 0)` with nothing on the island ever
 * moving it. So an island grown out to one side was orbited about a corner:
 * spin swung the far edge away rather than turning it in place, and pinch flew
 * in on the home tile whatever the child was looking at.
 *
 * These are arithmetic tests, not mock tests. `camera.ts` needs nothing from
 * the DOM but `addEventListener`, so the real module runs here and the real
 * `THREE.PerspectiveCamera` reports where it actually ended up. The assertions
 * are about WHERE THE CAMERA IS, which is the contract the child experiences —
 * an assertion that `lookAt` was called would have passed before the fix, since
 * `lookAt` existed and no one called it.
 */
import { describe, it, expect } from 'vitest'
import * as THREE from 'three'
import { createOrbitCamera, DEFAULT_LIMITS, EASE } from '../../src/island/camera'
import { islandBounds } from '../../src/island/scene'
import { key } from '../../src/island/world/hex'
import type { Axial } from '../../src/island/world/hex'
import type { Island } from '../../src/island/world/grid'

/** A DOM stub: the camera only ever listens and unlistens. */
function stubDom() {
  const listeners = new Map<string, Array<(e: unknown) => void>>()
  const el = {
    addEventListener(type: string, fn: (e: unknown) => void) {
      const list = listeners.get(type) ?? []
      list.push(fn)
      listeners.set(type, list)
    },
    removeEventListener(type: string, fn: (e: unknown) => void) {
      listeners.set(type, (listeners.get(type) ?? []).filter(f => f !== fn))
    },
  } as unknown as HTMLElement
  const fire = (type: string, e: Record<string, unknown>): void => {
    for (const fn of [...(listeners.get(type) ?? [])]) fn(e)
  }
  return { el, fire, count: (t: string) => (listeners.get(t) ?? []).length }
}

/** Run the easing to a standstill: 0.88^140 is under a millionth. */
function settle(c: { update(): void }, frames = 140): void {
  for (let i = 0; i < frames; i++) c.update()
}

const v = (x: number, z: number): THREE.Vector3 => new THREE.Vector3(x, 0, z)

/** An island from a list of hexes, all grass. */
const island = (...at: Axial[]): Island =>
  ({ tiles: new Map(at.map(a => [key(a), 'grass' as const])) })

/** Hex size used by the tile pack, near enough for arithmetic. */
const SIZE = 1

/** The distance `frame` asks for, so tests state it once. */
const framedAt = (radius: number): number =>
  Math.min(DEFAULT_LIMITS.maxDistance,
    Math.max(DEFAULT_LIMITS.minDistance, radius * 2.6 + 7))

/* ------------------------------------------------------------------ *
 * (a) the drift: the island's own middle, not the world origin
 * ------------------------------------------------------------------ */

describe('islandBounds', () => {
  it('is the origin, with no radius, for Fred\'s lonely rock', () => {
    const b = islandBounds(island({ q: 0, r: 0 }), SIZE)
    expect(b.centre.x).toBeCloseTo(0)
    expect(b.centre.z).toBeCloseTo(0)
    expect(b.radius).toBeCloseTo(0)
  })

  it('follows the island when it grows to one side', () => {
    // Five hexes marching east. The middle of that is the third one, not the
    // home tile, and the camera should be looking at the middle.
    const b = islandBounds(
      island({ q: 0, r: 0 }, { q: 1, r: 0 }, { q: 2, r: 0 }, { q: 3, r: 0 }, { q: 4, r: 0 }),
      SIZE)
    expect(b.centre.x).toBeCloseTo(2 * Math.sqrt(3))
    expect(b.centre.z).toBeCloseTo(0)
  })

  it('measures the radius from that middle, not from the origin', () => {
    /*
     * This is the framing half of the bug. Measuring the furthest tile's
     * distance from {0,0} counts the whole span, so a one-sided island is held
     * at twice the distance it needs — smaller AND further away the more they
     * build.
     */
    const tiles = island(
      { q: 0, r: 0 }, { q: 1, r: 0 }, { q: 2, r: 0 }, { q: 3, r: 0 }, { q: 4, r: 0 })
    const b = islandBounds(tiles, SIZE)
    const fromOrigin = 4 * Math.sqrt(3)
    expect(b.radius).toBeCloseTo(fromOrigin / 2)
    expect(b.radius).toBeLessThan(fromOrigin)
  })

  it('handles an island grown in both directions', () => {
    const b = islandBounds(island({ q: -2, r: 0 }, { q: 2, r: 0 }), SIZE)
    expect(b.centre.x).toBeCloseTo(0)
    expect(b.radius).toBeCloseTo(2 * Math.sqrt(3))
  })

  it('never returns NaN for an empty island', () => {
    const b = islandBounds({ tiles: new Map() }, SIZE)
    expect(b.centre.x).toBe(0)
    expect(b.radius).toBe(0)
  })
})

describe('framing an island that is not at the origin', () => {
  it('puts the camera on a sphere around the ISLAND, not around the origin', () => {
    const dom = stubDom()
    const c = createOrbitCamera(dom.el)
    const centre = v(9, -4)

    c.frame(centre, 3)
    settle(c)

    expect(c.camera.position.distanceTo(centre)).toBeCloseTo(framedAt(3), 3)
  })

  it('eases the pivot across, it does not cut', () => {
    /*
     * The distance already lerps at 0.12 and the pivot rides the same curve.
     * A cut would read as the island teleporting under their finger.
     */
    const dom = stubDom()
    const c = createOrbitCamera(dom.el)
    c.frame(v(0, 0), 0)             // where we came in
    settle(c)

    c.frame(v(10, 0), 2)            // they built out to the east
    expect(c.pivot().x).toBeCloseTo(0)
    c.update()
    expect(c.pivot().x).toBeCloseTo(10 * EASE)
    expect(c.pivot().x).toBeLessThan(10)
    settle(c)
    expect(c.pivot().x).toBeCloseTo(10)
  })

  it('arrives at the first island without a drift across the water', () => {
    // Loading a saved island must not open the session mid-swoop.
    const dom = stubDom()
    const c = createOrbitCamera(dom.el)
    c.frame(v(12, 5), 4)
    expect(c.pivot().x).toBeCloseTo(12)
    expect(c.pivot().z).toBeCloseTo(5)
  })
})

describe('spinning a grown island', () => {
  it('turns the far tile in place instead of swinging it away', () => {
    /*
     * The complaint itself. Drag to rotate, and the point they are looking at
     * must stay the same distance from the camera — that is what "rotating
     * about it" means. Before the fix the ORIGIN was what stayed fixed, and
     * the tile they were looking at travelled right across the screen.
     */
    const dom = stubDom()
    const c = createOrbitCamera(dom.el)
    const centre = v(11, 6)
    c.frame(centre, 4)
    settle(c)

    const before = c.camera.position.clone()

    dom.fire('pointerdown', { pointerId: 1, clientX: 400, clientY: 300 })
    dom.fire('pointermove', { pointerId: 1, clientX: 200, clientY: 300 })
    dom.fire('pointerup', { pointerId: 1 })
    settle(c)

    // It really did spin.
    expect(c.camera.position.distanceTo(before)).toBeGreaterThan(1)
    // About the island.
    expect(c.camera.position.distanceTo(centre)).toBeCloseTo(framedAt(4), 3)
    // NOT about the origin — the old pivot must no longer be preserved.
    const origin = new THREE.Vector3()
    expect(Math.abs(c.camera.position.distanceTo(origin)
      - before.distanceTo(origin))).toBeGreaterThan(0.5)
  })

  it('still spins and still pinches — the gestures are unchanged', () => {
    const dom = stubDom()
    const c = createOrbitCamera(dom.el)
    c.frame(v(0, 0), 0)
    settle(c)
    const start = c.camera.position.clone()

    dom.fire('pointerdown', { pointerId: 1, clientX: 300, clientY: 300 })
    dom.fire('pointermove', { pointerId: 1, clientX: 460, clientY: 300 })
    dom.fire('pointerup', { pointerId: 1 })
    settle(c)
    const spun = c.camera.position.clone()
    expect(spun.distanceTo(start)).toBeGreaterThan(0.5)
    // A spin changes the angle, never the range.
    expect(spun.length()).toBeCloseTo(start.length(), 3)

    dom.fire('pointerdown', { pointerId: 1, clientX: 300, clientY: 300 })
    dom.fire('pointerdown', { pointerId: 2, clientX: 400, clientY: 300 })
    dom.fire('pointermove', { pointerId: 2, clientX: 700, clientY: 300 })
    dom.fire('pointerup', { pointerId: 1 })
    dom.fire('pointerup', { pointerId: 2 })
    settle(c)
    // Fingers apart: closer in.
    expect(c.camera.position.length()).toBeLessThan(spun.length() - 0.5)
  })
})

/* ------------------------------------------------------------------ *
 * (b) zoom to location
 * ------------------------------------------------------------------ */

describe('lookAt — zoom to location', () => {
  it('moves the pivot onto the place they asked for', () => {
    const dom = stubDom()
    const c = createOrbitCamera(dom.el)
    c.frame(v(0, 0), 8)              // a big island centred on home
    settle(c)

    const far = v(6, -5)
    c.lookAt(far)
    settle(c)

    expect(c.pivot().x).toBeCloseTo(6)
    expect(c.pivot().z).toBeCloseTo(-5)
    expect(c.camera.position.distanceTo(far)).toBeCloseTo(framedAt(8), 3)
  })

  it('eases there on the same curve as the zoom', () => {
    const dom = stubDom()
    const c = createOrbitCamera(dom.el)
    c.frame(v(0, 0), 12)
    settle(c)

    c.lookAt(v(10, 0))
    c.update()
    expect(c.pivot().x).toBeCloseTo(10 * EASE)
    c.update()
    expect(c.pivot().x).toBeCloseTo(10 * (1 - (1 - EASE) ** 2))
  })

  it('then spins about THAT tile', () => {
    const dom = stubDom()
    const c = createOrbitCamera(dom.el)
    c.frame(v(0, 0), 8)
    const far = v(6, -5)
    c.lookAt(far)
    settle(c)

    dom.fire('pointerdown', { pointerId: 1, clientX: 400, clientY: 300 })
    dom.fire('pointermove', { pointerId: 1, clientX: 120, clientY: 300 })
    dom.fire('pointerup', { pointerId: 1 })
    settle(c)

    expect(c.camera.position.distanceTo(far)).toBeCloseTo(framedAt(8), 3)
  })

  it('hands back copies, so a caller cannot write the pivot behind its back', () => {
    const dom = stubDom()
    const c = createOrbitCamera(dom.el)
    c.frame(v(0, 0), 8)
    c.lookAt(v(4, 0))
    c.focus().set(999, 999, 999)
    c.pivot().set(999, 999, 999)
    expect(c.focus().x).toBeCloseTo(4)
    expect(c.pivot().x).toBeCloseTo(0)
  })
})

describe('the pivot cannot leave the island — this is not panning', () => {
  it('clamps a request out at sea back onto the island\'s edge', () => {
    const dom = stubDom()
    const c = createOrbitCamera(dom.el)
    const centre = v(2, 2)
    c.frame(centre, 5)

    c.lookAt(v(2 + 300, 2))
    expect(c.focus().x).toBeCloseTo(2 + 5)
    expect(c.focus().z).toBeCloseTo(2)

    // On the bearing asked for, at the island's own radius.
    c.lookAt(v(2 - 100, 2 - 100))
    expect(Math.hypot(c.focus().x - 2, c.focus().z - 2)).toBeCloseTo(5)
  })

  it('pins the pivot to the home rock while that is the whole island', () => {
    // Radius nought: there is nowhere else to look, so there is no way to
    // orbit an empty sea on the very first screen they ever see.
    const dom = stubDom()
    const c = createOrbitCamera(dom.el)
    c.frame(v(0, 0), 0)
    c.lookAt(v(50, 50))
    expect(c.focus().x).toBeCloseTo(0)
    expect(c.focus().z).toBeCloseTo(0)
  })

  it('leaves a request inside the island exactly where it was asked for', () => {
    const dom = stubDom()
    const c = createOrbitCamera(dom.el)
    c.frame(v(0, 0), 5)
    c.lookAt(v(3, 1))
    expect(c.focus().x).toBeCloseTo(3)
    expect(c.focus().z).toBeCloseTo(1)
  })
})

describe('a deliberate focus survives the island growing under it', () => {
  it('travels with the island rather than snapping back to the middle', () => {
    /*
     * The child looks at their eastern shore, then earns a tile and builds
     * it. The island's middle shifts a little; the camera must shift by that
     * little, not haul them back to the centre of everything.
     */
    const dom = stubDom()
    const c = createOrbitCamera(dom.el)
    c.frame(v(0, 0), 6)
    c.lookAt(v(5, 0))
    settle(c)

    c.frame(v(0.4, 0), 6.2)          // one more tile to the east
    expect(c.focus().x).toBeCloseTo(5.4)
    expect(c.focus().z).toBeCloseTo(0)
  })

  it('walks the pivot onto the centroid when the child has NOT chosen a spot', () => {
    // From a cold start pivot and centre are the same point, so every shift
    // lands the pivot exactly on the island's middle. That is the drift fix.
    const dom = stubDom()
    const c = createOrbitCamera(dom.el)
    c.frame(v(0, 0), 0)
    c.frame(v(1.7, 0.4), 2)
    c.frame(v(3.1, 1.2), 4)
    expect(c.focus().x).toBeCloseTo(3.1)
    expect(c.focus().z).toBeCloseTo(1.2)
  })

  it('keeps a focus inside the new footprint when the island shifts away', () => {
    const dom = stubDom()
    const c = createOrbitCamera(dom.el)
    c.frame(v(0, 0), 4)
    c.lookAt(v(4, 0))
    c.frame(v(0, 0), 1)              // an improbable shrink; still must hold
    expect(Math.hypot(c.focus().x, c.focus().z)).toBeLessThanOrEqual(1 + 1e-9)
  })
})

describe('a ceremony holds the shot', () => {
  it('does not glide the pivot while a ceremony is playing', () => {
    /*
     * `refresh()` runs inside the hatch and land ceremonies, so anything that
     * re-renders can reach the camera mid-shot. A ceremony is an animation,
     * not a moment of choice: the pivot waits.
     */
    const dom = stubDom()
    const c = createOrbitCamera(dom.el)
    c.frame(v(0, 0), 8)
    settle(c)

    c.hold(true)
    c.lookAt(v(6, 0))
    settle(c)
    expect(c.pivot().x).toBeCloseTo(0)
    // The goal moved all the same; only the drawing waited.
    expect(c.focus().x).toBeCloseTo(6)
  })

  it('eases to wherever the island ended up when the ceremony releases', () => {
    // Releasing must not snap: the pivot picks up the same curve it would
    // have followed, from where it actually is.
    const dom = stubDom()
    const c = createOrbitCamera(dom.el)
    c.frame(v(0, 0), 8)
    settle(c)

    c.hold(true)
    c.lookAt(v(6, 0))
    settle(c)
    c.hold(false)
    c.update()
    expect(c.pivot().x).toBeCloseTo(6 * EASE)
    settle(c)
    expect(c.pivot().x).toBeCloseTo(6)
  })

  it('still lets the island be re-framed while held', () => {
    // The distance and the footprint are bookkeeping; only the pivot's
    // movement is what would be seen.
    const dom = stubDom()
    const c = createOrbitCamera(dom.el)
    c.frame(v(0, 0), 1)
    settle(c)
    c.hold(true)
    c.frame(v(0, 0), 6)
    settle(c)
    expect(c.camera.position.length()).toBeCloseTo(framedAt(6), 3)
  })
})

describe('framing distance', () => {
  it('pulls back further for a bigger island, within the child-proof limits', () => {
    const dom = stubDom()
    const c = createOrbitCamera(dom.el)
    c.frame(v(0, 0), 0)
    settle(c)
    const near = c.camera.position.length()

    c.frame(v(0, 0), 5)
    settle(c)
    expect(c.camera.position.length()).toBeGreaterThan(near)
    expect(c.camera.position.length()).toBeLessThanOrEqual(DEFAULT_LIMITS.maxDistance + 1e-6)

    c.frame(v(0, 0), 500)
    settle(c)
    expect(c.camera.position.distanceTo(new THREE.Vector3()))
      .toBeCloseTo(DEFAULT_LIMITS.maxDistance, 3)
  })
})

describe('housekeeping', () => {
  it('unbinds everything it bound', () => {
    const dom = stubDom()
    const c = createOrbitCamera(dom.el)
    for (const t of ['pointerdown', 'pointermove', 'pointerup', 'pointercancel',
      'pointerleave', 'wheel']) expect(dom.count(t)).toBe(1)
    c.dispose()
    for (const t of ['pointerdown', 'pointermove', 'pointerup', 'pointercancel',
      'pointerleave', 'wheel']) expect(dom.count(t)).toBe(0)
  })
})
