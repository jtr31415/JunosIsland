/**
 * The egg, and its visible progress toward hatching.
 *
 * Reading progress is made PHYSICAL (slice-1 spec §3): the egg is not a
 * progress bar with a shell drawn on it, it is the progress bar. Every page
 * read moves it along a fixed sequence of states, so a child can see how close
 * her friend is without a number anywhere.
 *
 *   intact → hairline → crack → big cracks → wobble-and-glow → hatch
 *
 * Thresholds at 25% / 50% / 75% / 90% of the egg's page cost.
 *
 * It never expires and never regresses: cracks do not heal, and a wrong answer
 * changes nothing here (brief §19, and the spec's serene-right rule).
 */
import * as THREE from 'three'
import { createBlobShadow, SHADOW_LIFT } from './juice'

export type EggStage = 'intact' | 'hairline' | 'crack' | 'big' | 'wobble'

/** Which stage a given 0..1 progress shows. Pure, so it can be tested. */
export function stageFor(progress: number): EggStage {
  if (progress >= 0.9) return 'wobble'
  if (progress >= 0.75) return 'big'
  if (progress >= 0.5) return 'crack'
  if (progress >= 0.25) return 'hairline'
  return 'intact'
}

export interface Egg {
  group: THREE.Group
  setPosition(x: number, z: number): void
  /** Show the state for this 0..1 progress toward hatching. */
  setProgress(progress: number): void
  update(dt: number, t: number): void
  /**
   * Arrive, rather than simply be there.
   *
   * Every egg — including the very first — used to blink into existence at
   * full size. A thing that appears has always been there as far as a child
   * is concerned; a thing that ARRIVES came from somewhere, and the whole
   * premise is that eggs wash up on her shore.
   */
  arrive(): void
  /** Crack open: a shudder, a burst, then hide. Resolves when done. */
  hatch(): Promise<void>
  reset(): void
}

export function createEgg(): Egg {
  const group = new THREE.Group()
  group.name = 'egg'

  /*
   * The egg proper. Everything that ROCKS lives in here; the ring and the
   * shadow stay on the outer group and never move.
   *
   * Tilting them with the egg was what made the shadow slice into the tile:
   * a flat disc lying on the ground has nowhere to go when you rotate it
   * except through the surface. Ground decals belong to the ground.
   */
  const body = new THREE.Group()
  group.add(body)

  const mat = (c: number): THREE.MeshStandardMaterial =>
    new THREE.MeshStandardMaterial({ color: c, metalness: 0, roughness: 1 })

  // Warm and bright: it must never be mistaken for the grey rocks it now
  // shares a tile with.
  const shell = new THREE.Mesh(new THREE.SphereGeometry(0.30, 18, 14), mat(0xfff8e0))
  shell.scale.set(1, 1.28, 1)
  shell.position.y = 0.38

  const spots = new THREE.Group()
  for (let i = 0; i < 5; i++) {
    const s = new THREE.Mesh(new THREE.SphereGeometry(0.075, 10, 8), mat(0x63c4f5))
    const a = (i / 5) * Math.PI * 2
    s.position.set(Math.cos(a) * 0.24, 0.38 + Math.sin(a * 1.7) * 0.16, Math.sin(a) * 0.24)
    s.scale.set(1, 0.6, 1)
    spots.add(s)
  }

  /*
   * Cracks are thin dark slivers laid on the shell, revealed one group at a
   * time. Built up front and hidden rather than created on demand, so a
   * hatching egg never stutters while geometry is allocated.
   */
  const crackMat = mat(0x8a7a5c)
  const crackGroups: THREE.Group[] = []
  const CRACK_LAYOUT: Array<Array<[number, number, number, number]>> = [
    // [angle, height, length, tilt] — hairline: one small sliver
    [[0.4, 0.46, 0.11, 0.5]],
    // crack: a longer one plus a branch
    [[0.4, 0.40, 0.17, 0.5], [0.9, 0.52, 0.10, -0.7]],
    // big cracks: several, spread around the shell
    [[2.2, 0.44, 0.19, 0.4], [3.4, 0.36, 0.15, -0.5], [5.0, 0.50, 0.13, 0.8]],
  ]
  for (const layout of CRACK_LAYOUT) {
    const g = new THREE.Group()
    for (const [angle, y, len, tilt] of layout) {
      const c = new THREE.Mesh(new THREE.BoxGeometry(0.022, len, 0.022), crackMat)
      c.position.set(Math.cos(angle) * 0.28, y, Math.sin(angle) * 0.28)
      c.rotation.set(tilt * 0.5, -angle, tilt)
      g.add(c)
    }
    g.visible = false
    crackGroups.push(g)
    body.add(g)
  }

  // The glow at the last stage: warmth from inside, never a threat.
  const glow = new THREE.Mesh(
    new THREE.SphereGeometry(0.34, 16, 12),
    new THREE.MeshBasicMaterial({ color: 0xffe6a0, transparent: true, opacity: 0 }),
  )
  glow.scale.set(1, 1.28, 1)
  glow.position.y = 0.38
  body.add(glow)

  /*
   * A soft ring on the ground beneath, always gently pulsing.
   *
   * The egg is THE thing to tap, and once the island grew scenery it sat
   * among rocks of a similar size and colour and simply read as another
   * stone. The ring is the island asking (brief §13) — an invitation that
   * survives whatever grows up around it, without making the egg garish.
   */
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(0.42, 0.6, 24),
    new THREE.MeshBasicMaterial({
      color: 0xfff0b8, transparent: true, opacity: 0.5,
      side: THREE.DoubleSide, depthWrite: false,
      // A ground decal like the blob, and it needs the same depth bias: the
      // egg group is scaled to 0.62, so a lift in local units shrinks to
      // almost nothing in the world and stops clearing the tile beneath.
      polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -2,
    }),
  )
  ring.rotation.x = -Math.PI / 2
  ring.position.y = SHADOW_LIFT
  group.add(ring)

  body.add(shell, spots)
  group.add(createBlobShadow(0.28))
  /*
   * Sized against the pets: bigger than the friend it holds, so it reads as
   * something a creature comes out of — but never a boulder. Raised from 0.42
   * because at that size it disappeared among the rocks.
   */
  group.scale.setScalar(0.62)
  group.userData.pick = { kind: 'egg' }

  let shudder = false
  /** 0..1 through the arrival, or -1 when it is not playing. */
  let arriveT = -1
  let stage: EggStage = 'intact'

  return {
    group,

    setPosition(x, z) { group.position.set(x, 0, z) },

    arrive() { arriveT = 0 },

    setProgress(progress) {
      stage = stageFor(progress)
      const shown =
        stage === 'intact' ? 0 :
        stage === 'hairline' ? 1 :
        stage === 'crack' ? 2 : 3
      crackGroups.forEach((g, i) => { g.visible = i < shown })
    },

    update(dt, t) {
      if (arriveT >= 0) {
        arriveT = Math.min(1, arriveT + dt * 1.5)
        if (arriveT >= 1) { arriveT = -1; group.scale.setScalar(0.62) }
        else {
          // Drops in and settles, with a squash as it meets the ground.
          const fall = 1 - Math.pow(1 - arriveT, 2)
          const bounce = Math.max(0, Math.sin((arriveT - 0.7) / 0.3 * Math.PI))
          group.position.y = 2.2 * (1 - fall)
          group.scale.set(
            0.62 * (1 + bounce * 0.16), 0.62 * (1 - bounce * 0.2), 0.62 * (1 + bounce * 0.16))
          return
        }
      }
      if (shudder) return
      /*
       * An egg on the ground ROCKS; it does not hover. The first version bobbed
       * it vertically by 0.04 world units, which at this scale is an eighth of
       * the egg's own height — enough to read as levitation rather than life.
       *
       * So the resting motion is a slow tilt around the base, with an
       * impatient shiver that grows more insistent as it nears hatching. The
       * island gently asking, never nagging (brief §13).
       */
      group.position.y = 0
      const breathe = Math.sin(t * 1.5) * 0.022
      const eager = stage === 'wobble' ? 1 : stage === 'big' ? 0.45 : 0.18
      const due = Math.sin(t * 0.7) > (0.93 - eager * 0.5)
      const shiver = due ? Math.sin(t * 26) * 0.09 * eager : 0
      body.rotation.z = breathe + shiver
      body.rotation.x = Math.cos(t * 1.1) * 0.015
      glow.material.opacity = stage === 'wobble'
        ? 0.18 + Math.sin(t * 3.2) * 0.12
        : 0
      // The invitation breathes, a little more insistently near hatching.
      const ringMat = ring.material as THREE.MeshBasicMaterial
      ringMat.opacity = 0.34 + Math.sin(t * 2.1) * 0.16 + eager * 0.12
    },

    hatch() {
      return new Promise<void>(resolve => {
        shudder = true
        const start = performance.now()
        const step = (): void => {
          const p = Math.min(1, (performance.now() - start) / 700)
          body.rotation.z = Math.sin(p * Math.PI * 9) * 0.34 * (1 - p)
          body.scale.setScalar(1 + Math.sin(p * Math.PI) * 0.18)
          glow.material.opacity = Math.sin(p * Math.PI) * 0.5
          if (p < 1) { requestAnimationFrame(step); return }
          group.visible = false
          shudder = false
          resolve()
        }
        requestAnimationFrame(step)
      })
    },

    reset() {
      group.visible = true
      arriveT = 0                     // and it arrives again, rather than pops
      body.scale.setScalar(1)
      body.rotation.set(0, 0, 0)
      glow.material.opacity = 0
      stage = 'intact'
      for (const g of crackGroups) g.visible = false
    },
  }
}
