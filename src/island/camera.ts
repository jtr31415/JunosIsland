/**
 * Orbit camera with gentle limits (brief section 14).
 *
 * Deliberately NOT three's OrbitControls: this needs a small, forgiving,
 * child-proof subset. You can spin the island and pinch to zoom; you cannot
 * get underneath it, flip it, fling it, or lose it off-screen. There is no
 * avatar — the finger is the player (brief section 2) — so the camera is the
 * only navigation there is, and it must be impossible to break.
 *
 * ## The pivot
 *
 * Everything here happens *about a pivot*: the camera sits on a sphere around
 * it and looks at it, so the pivot is the one point on the island that never
 * moves on screen. Spin turns the world about it; pinch flies in toward it.
 *
 * That pivot used to be the world origin and nothing ever moved it — Joe:
 * "zoom to location. at the moment zoom and rotation is only around the origin
 * tile." It compounds as the island grows, because `frame()` pulls the camera
 * back to hold the furthest tile in shot, so the far edge gets smaller AND
 * harder to reach: spinning swings it away rather than turning it in place.
 *
 * So the pivot moves now, by two routes and only two:
 *
 * - `frame()` — the island grew, so carry the pivot along by however far the
 *   island's own centre moved. With no deliberate focus that walks the pivot
 *   onto the centroid and keeps it there; with one, the focus survives.
 * - `lookAt()` — she asked to look at a place. Eased, never cut.
 *
 * **This is not panning, and must not become panning.** The pivot is clamped
 * inside the island's own footprint, so there is no gesture and no sequence of
 * gestures that puts the camera in the middle of an empty ocean with her island
 * somewhere off screen. A six-year-old cannot recover from that; she can always
 * recover from "I am looking at the wrong tile" by tapping the right one.
 */
import * as THREE from 'three'

export interface OrbitLimits {
  minDistance: number
  maxDistance: number
  minPolar: number
  maxPolar: number
}

export const DEFAULT_LIMITS: OrbitLimits = {
  minDistance: 6,
  maxDistance: 26,
  // Never below the horizon, never straight down: both are disorientating
  // and the second makes the diorama look flat.
  minPolar: 0.28,
  maxPolar: 1.19,
}

/**
 * How much of the remaining gap is closed per frame.
 *
 * One constant for all four eased quantities — azimuth, polar, distance and
 * now the pivot — because they are all the same gesture arriving. A pivot that
 * moved on a different curve from the zoom would read as two things happening.
 */
export const EASE = 0.12

export interface OrbitCamera {
  camera: THREE.PerspectiveCamera
  /** Call once per frame; eases toward the target for a soft, weighty feel. */
  update(): void
  /**
   * Look at a place: ease the pivot there, so spin and pinch work about it.
   *
   * The reusable half of "zoom to location". A tap on her own land calls this
   * with that tile; the album's "find it on the map" calls it with the pet's
   * spot. Clamped into the island's footprint (see the header), so no caller
   * can strand the camera over open sea.
   */
  lookAt(target: THREE.Vector3): void
  /** Where the pivot is heading. A copy — callers cannot write the pivot. */
  focus(): THREE.Vector3
  /** Where the pivot is right now, mid-ease. A copy. */
  pivot(): THREE.Vector3
  /**
   * The island's footprint changed: its centre and its radius about that
   * centre, in world units.
   *
   * Pulls the pivot along by the same amount the centre moved rather than
   * snapping it to the centre, which is what lets a deliberate focus survive
   * her building another tile. Also sets the framing distance, and defines the
   * region the pivot is allowed to be in.
   */
  frame(centre: THREE.Vector3, radius: number): void
  /**
   * Hold the pivot still — for the duration of a ceremony.
   *
   * A ceremony is an animation, not a moment of choice, and the island's
   * `refresh()` runs inside two of them. The pivot must not glide across a
   * held hatch shot just because something re-rendered underneath it. The
   * goal keeps moving while held; only the drawing waits, so releasing eases
   * to wherever the island ended up rather than snapping.
   *
   * Deliberately freezes the PIVOT only. Spin, tilt and zoom already eased
   * through ceremonies before any of this, and changing that would be an
   * unrelated change of feel smuggled in under a bug fix.
   */
  hold(on: boolean): void
  dispose(): void
}

export function createOrbitCamera(
  dom: HTMLElement,
  limits: OrbitLimits = DEFAULT_LIMITS,
): OrbitCamera {
  const camera = new THREE.PerspectiveCamera(46, 1, 0.1, 400)
  /** The pivot as drawn this frame. Eased toward `goal`, never snapped. */
  const target = new THREE.Vector3(0, 0, 0)
  /** Where the pivot is heading. */
  const goal = new THREE.Vector3(0, 0, 0)

  /** The island's footprint: the pivot may not leave it. */
  const bound = new THREE.Vector3(0, 0, 0)
  let boundRadius = 0
  let framed = false
  /** True while a ceremony is playing: the pivot waits, the goal does not. */
  let held = false

  let azimuth = Math.PI * 0.25
  let polar = 0.86
  let distance = 14

  // Eased toward, never snapped: the weight is most of the pleasure.
  let wantAzimuth = azimuth
  let wantPolar = polar
  let wantDistance = distance

  const pointers = new Map<number, { x: number; y: number }>()
  let pinchStart = 0
  let pinchDistance = 0

  const clamp = (v: number, lo: number, hi: number): number => Math.min(hi, Math.max(lo, v))

  /**
   * Hold the pivot inside the island's footprint.
   *
   * Horizontal only — the island is flat, and clamping height would fight the
   * caller over a value that is always ground level anyway.
   */
  const clampGoal = (): void => {
    const dx = goal.x - bound.x
    const dz = goal.z - bound.z
    const d = Math.hypot(dx, dz)
    if (d <= boundRadius || d === 0) return
    const s = boundRadius / d
    goal.x = bound.x + dx * s
    goal.z = bound.z + dz * s
  }

  const onDown = (e: PointerEvent): void => {
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })
    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()]
      pinchStart = Math.hypot(a!.x - b!.x, a!.y - b!.y)
      pinchDistance = wantDistance
    }
  }

  const onMove = (e: PointerEvent): void => {
    const prev = pointers.get(e.pointerId)
    if (!prev) return
    const dx = e.clientX - prev.x
    const dy = e.clientY - prev.y
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })

    if (pointers.size === 1) {
      wantAzimuth -= dx * 0.006
      wantPolar = clamp(wantPolar - dy * 0.005, limits.minPolar, limits.maxPolar)
    } else if (pointers.size === 2 && pinchStart > 0) {
      const [a, b] = [...pointers.values()]
      const now = Math.hypot(a!.x - b!.x, a!.y - b!.y)
      wantDistance = clamp(pinchDistance * (pinchStart / Math.max(now, 1)),
        limits.minDistance, limits.maxDistance)
    }
  }

  const onUp = (e: PointerEvent): void => {
    pointers.delete(e.pointerId)
    if (pointers.size < 2) pinchStart = 0
  }

  const onWheel = (e: WheelEvent): void => {
    e.preventDefault()
    wantDistance = clamp(wantDistance + e.deltaY * 0.012,
      limits.minDistance, limits.maxDistance)
  }

  dom.addEventListener('pointerdown', onDown)
  dom.addEventListener('pointermove', onMove)
  dom.addEventListener('pointerup', onUp)
  dom.addEventListener('pointercancel', onUp)
  dom.addEventListener('pointerleave', onUp)
  dom.addEventListener('wheel', onWheel, { passive: false })

  return {
    camera,

    update() {
      azimuth += (wantAzimuth - azimuth) * EASE
      polar += (wantPolar - polar) * EASE
      distance += (wantDistance - distance) * EASE
      // The pivot rides the same curve as the zoom, for the same reason —
      // unless a ceremony is holding the shot, in which case it waits.
      if (!held) target.lerp(goal, EASE)
      camera.position.set(
        target.x + distance * Math.sin(polar) * Math.cos(azimuth),
        target.y + distance * Math.cos(polar),
        target.z + distance * Math.sin(polar) * Math.sin(azimuth),
      )
      camera.lookAt(target)
    },

    lookAt(t: THREE.Vector3) {
      goal.copy(t)
      clampGoal()
    },

    focus: () => goal.clone(),

    pivot: () => target.clone(),

    frame(centre: THREE.Vector3, radius: number) {
      /*
       * Carry the pivot by the centre's own movement, not to the centre.
       *
       * From a cold start the two are the same thing — pivot and centre both
       * begin at the origin, so every shift lands the pivot exactly on the
       * centroid, which is the drift fix. After a deliberate focus they are
       * not: the pivot keeps its offset and simply travels with the island,
       * so building a tile does not yank the view back to the middle.
       */
      goal.x += centre.x - bound.x
      goal.z += centre.z - bound.z
      bound.copy(centre)
      boundRadius = radius
      clampGoal()
      // The first island is not a move, it is where we came in. Easing to it
      // would open every session with an unexplained drift across the water.
      if (!framed) { framed = true; target.copy(goal) }
      wantDistance = clamp(radius * 2.6 + 7, limits.minDistance, limits.maxDistance)
    },

    hold(on: boolean) { held = on },

    dispose() {
      dom.removeEventListener('pointerdown', onDown)
      dom.removeEventListener('pointermove', onMove)
      dom.removeEventListener('pointerup', onUp)
      dom.removeEventListener('pointercancel', onUp)
      dom.removeEventListener('pointerleave', onUp)
      dom.removeEventListener('wheel', onWheel)
    },
  }
}
