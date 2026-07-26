/**
 * Orbit camera with gentle limits (brief section 14).
 *
 * Deliberately NOT three's OrbitControls: this needs a small, forgiving,
 * child-proof subset. You can spin the island and pinch to zoom; you cannot
 * get underneath it, flip it, fling it, or lose it off-screen. There is no
 * avatar — the finger is the player (brief section 2) — so the camera is the
 * only navigation there is, and it must be impossible to break.
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

export interface OrbitCamera {
  camera: THREE.PerspectiveCamera
  /** Call once per frame; eases toward the target for a soft, weighty feel. */
  update(): void
  /** Recentre on a point, e.g. as the island grows outward. */
  lookAt(target: THREE.Vector3): void
  frame(radius: number): void
  dispose(): void
}

export function createOrbitCamera(
  dom: HTMLElement,
  limits: OrbitLimits = DEFAULT_LIMITS,
): OrbitCamera {
  const camera = new THREE.PerspectiveCamera(46, 1, 0.1, 400)
  const target = new THREE.Vector3(0, 0, 0)

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
      azimuth += (wantAzimuth - azimuth) * 0.12
      polar += (wantPolar - polar) * 0.12
      distance += (wantDistance - distance) * 0.12
      camera.position.set(
        target.x + distance * Math.sin(polar) * Math.cos(azimuth),
        target.y + distance * Math.cos(polar),
        target.z + distance * Math.sin(polar) * Math.sin(azimuth),
      )
      camera.lookAt(target)
    },

    lookAt(t: THREE.Vector3) { target.copy(t) },

    /** Pull back just enough to hold an island of this radius. */
    frame(radius: number) {
      wantDistance = clamp(radius * 2.6 + 7, limits.minDistance, limits.maxDistance)
    },

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
