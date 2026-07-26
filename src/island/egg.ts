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
 * changes nothing here (brief §18, and the spec's serene-right rule).
 */
import * as THREE from 'three'
import { createBlobShadow } from './juice'

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
  /** Crack open: a shudder, a burst, then hide. Resolves when done. */
  hatch(): Promise<void>
  reset(): void
}

export function createEgg(): Egg {
  const group = new THREE.Group()
  group.name = 'egg'

  const mat = (c: number): THREE.MeshStandardMaterial =>
    new THREE.MeshStandardMaterial({ color: c, metalness: 0, roughness: 1 })

  const shell = new THREE.Mesh(new THREE.SphereGeometry(0.30, 18, 14), mat(0xfff4dc))
  shell.scale.set(1, 1.28, 1)
  shell.position.y = 0.38

  const spots = new THREE.Group()
  for (let i = 0; i < 5; i++) {
    const s = new THREE.Mesh(new THREE.SphereGeometry(0.075, 10, 8), mat(0x8fd6ff))
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
    group.add(g)
  }

  // The glow at the last stage: warmth from inside, never a threat.
  const glow = new THREE.Mesh(
    new THREE.SphereGeometry(0.34, 16, 12),
    new THREE.MeshBasicMaterial({ color: 0xffe6a0, transparent: true, opacity: 0 }),
  )
  glow.scale.set(1, 1.28, 1)
  glow.position.y = 0.38
  group.add(glow)

  group.add(shell, spots, createBlobShadow(0.28))
  /*
   * Sized against the pets, not the tile. An egg should look like something a
   * creature comes out of — a little bigger than the pet it holds, never a
   * boulder sitting on the grass.
   */
  group.scale.setScalar(0.42)
  group.userData.pick = { kind: 'egg' }

  let shudder = false
  let stage: EggStage = 'intact'

  return {
    group,

    setPosition(x, z) { group.position.set(x, 0, z) },

    setProgress(progress) {
      stage = stageFor(progress)
      const shown =
        stage === 'intact' ? 0 :
        stage === 'hairline' ? 1 :
        stage === 'crack' ? 2 : 3
      crackGroups.forEach((g, i) => { g.visible = i < shown })
    },

    update(_dt, t) {
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
      group.rotation.z = breathe + shiver
      group.rotation.x = Math.cos(t * 1.1) * 0.015
      glow.material.opacity = stage === 'wobble'
        ? 0.18 + Math.sin(t * 3.2) * 0.12
        : 0
    },

    hatch() {
      return new Promise<void>(resolve => {
        shudder = true
        const start = performance.now()
        const step = (): void => {
          const p = Math.min(1, (performance.now() - start) / 700)
          group.rotation.z = Math.sin(p * Math.PI * 9) * 0.34 * (1 - p)
          group.scale.setScalar(0.42 * (1 + Math.sin(p * Math.PI) * 0.18))
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
      group.scale.setScalar(0.42)
      group.rotation.z = 0
      glow.material.opacity = 0
      stage = 'intact'
      for (const g of crackGroups) g.visible = false
    },
  }
}
