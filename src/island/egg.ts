/**
 * The egg.
 *
 * There is always one waiting, and it never expires (brief section 18 — no
 * timers on eggs). It wobbles when it can be worked on, because the island
 * should gently ask rather than nag (brief section 13).
 */
import * as THREE from 'three'
import { createBlobShadow } from './juice'

export interface Egg {
  group: THREE.Group
  setPosition(x: number, z: number): void
  update(dt: number, t: number): void
  /** Crack open: a short shudder, then hide. Resolves when done. */
  hatch(): Promise<void>
  reset(): void
}

export function createEgg(): Egg {
  const group = new THREE.Group()
  group.name = 'egg'

  // Built from primitives: a sphere squashed into an egg, warm cream with
  // friendly spots. Nothing here should read as fragile or precious-scary.
  const shell = new THREE.Mesh(
    new THREE.SphereGeometry(0.30, 18, 14),
    new THREE.MeshStandardMaterial({ color: 0xfff4dc, metalness: 0, roughness: 1 }),
  )
  shell.scale.set(1, 1.28, 1)
  shell.position.y = 0.38

  const spots = new THREE.Group()
  for (let i = 0; i < 5; i++) {
    const s = new THREE.Mesh(
      new THREE.SphereGeometry(0.075, 10, 8),
      new THREE.MeshStandardMaterial({ color: 0x8fd6ff, metalness: 0, roughness: 1 }),
    )
    const a = (i / 5) * Math.PI * 2
    s.position.set(Math.cos(a) * 0.24, 0.38 + Math.sin(a * 1.7) * 0.16, Math.sin(a) * 0.24)
    s.scale.set(1, 0.6, 1)
    spots.add(s)
  }

  group.add(shell, spots, createBlobShadow(0.28))
  group.userData.pick = { kind: 'egg' }

  let shudder = 0

  return {
    group,

    setPosition(x, z) { group.position.set(x, 0, z) },

    update(_dt, t) {
      if (shudder > 0) return
      // A slow bob, with an occasional impatient wobble — the invitation.
      group.position.y = Math.sin(t * 1.5) * 0.04
      const wobble = Math.sin(t * 0.7) > 0.93 ? Math.sin(t * 26) * 0.09 : 0
      group.rotation.z = wobble
    },

    hatch() {
      return new Promise<void>(resolve => {
        shudder = 1
        const start = performance.now()
        const step = (): void => {
          const p = Math.min(1, (performance.now() - start) / 700)
          group.rotation.z = Math.sin(p * Math.PI * 9) * 0.34 * (1 - p)
          group.scale.setScalar(1 + Math.sin(p * Math.PI) * 0.18)
          if (p < 1) { requestAnimationFrame(step); return }
          group.visible = false
          shudder = 0
          resolve()
        }
        requestAnimationFrame(step)
      })
    },

    reset() {
      group.visible = true
      group.scale.setScalar(1)
      group.rotation.z = 0
    },
  }
}
