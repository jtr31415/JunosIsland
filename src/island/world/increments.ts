/**
 * The growing plot: maths progress made physical (slice-1 spec §2).
 *
 * A tile is not awarded finished. It is BUILT, in view, one increment per
 * correct sum — soil, then colour, then pebbles, a rock, tufts, a bush, a
 * sapling that becomes a tree, a second prop, and a flourish. Ten canonical
 * steps, so a child watches her arithmetic turn into ground she owns. That
 * continuous cause-and-effect is the entire pedagogical point of building it
 * this way rather than handing over a completed hex.
 *
 * Two rules from the spec, both load-bearing:
 *   - Pieces NEVER un-grow. A wrong answer advances nothing and removes
 *     nothing (the serene-right rule).
 *   - When a tile costs fewer than ten sums — which the early curve
 *     guarantees — each sum advances SEVERAL increments, and the intro tile
 *     plays all ten at once. The queue simply runs faster; the sequence
 *     itself never changes.
 */
import * as THREE from 'three'
import type { TileType } from './grid'

/** The ten canonical steps, in order. */
export const INCREMENTS = [
  'soil', 'colour', 'pebbles', 'rock', 'tufts',
  'bush', 'sapling', 'tree', 'prop', 'flourish',
] as const

export type Increment = typeof INCREMENTS[number]

/**
 * How many increments are visible after `sumsDone` of `cost` sums.
 *
 * The "plays faster" rule as arithmetic: ten steps spread across however many
 * sums the tile actually costs, so a one-sum intro tile shows all ten and a
 * sixteen-sum tile shows roughly one every other sum.
 */
export function incrementsShown(sumsDone: number, cost: number): number {
  if (cost <= 0) return INCREMENTS.length
  const done = Math.max(0, Math.min(cost, sumsDone))
  return Math.round((done / cost) * INCREMENTS.length)
}

export const isComplete = (sumsDone: number, cost: number): boolean =>
  incrementsShown(sumsDone, cost) >= INCREMENTS.length

export interface GrowingPlot {
  group: THREE.Group
  /** Show the state for this many completed sums. Never regresses. */
  setProgress(sumsDone: number, cost: number): void
  /** Ease the newly-revealed pieces in. Call per frame. */
  update(dt: number): void
  dispose(): void
}

/**
 * The visible plot under construction.
 *
 * Built from primitives rather than the KayKit props, because each piece has
 * to appear on cue and GROW — a pre-assembled clump can only pop into
 * existence, and popping is not growing.
 */
export function createGrowingPlot(type: TileType, hexSize: number): GrowingPlot {
  const group = new THREE.Group()
  group.name = 'growing-plot'

  const mat = (c: number, opacity = 1): THREE.MeshStandardMaterial =>
    new THREE.MeshStandardMaterial({
      color: c, metalness: 0, roughness: 1,
      transparent: opacity < 1, opacity,
    })

  const water = type === 'water'
  const parts: THREE.Object3D[] = []
  const add = (o: THREE.Object3D): void => {
    o.visible = false
    o.userData.targetScale = 1
    group.add(o)
    parts.push(o)
  }

  // 1 soil mound / water rising
  const ground = new THREE.Mesh(
    new THREE.CylinderGeometry(hexSize * 0.86, hexSize * 0.86, 0.16, 6),
    mat(water ? 0x3f8fc4 : 0x6b4a2f))
  ground.rotation.y = Math.PI / 6
  ground.position.y = 0.06
  add(ground)

  // 2 ground colour floods
  const surface = new THREE.Mesh(
    new THREE.CylinderGeometry(hexSize * 0.87, hexSize * 0.87, 0.06, 6),
    mat(water ? 0x59b6e8 : 0x3b903a))
  surface.rotation.y = Math.PI / 6
  surface.position.y = 0.15
  add(surface)

  // 3 pebbles
  const pebbles = new THREE.Group()
  for (let i = 0; i < 5; i++) {
    const p = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 5), mat(0x9aa0a4))
    const a = (i / 5) * Math.PI * 2
    p.position.set(Math.cos(a) * hexSize * 0.5, 0.18, Math.sin(a) * hexSize * 0.5)
    p.scale.y = 0.6
    pebbles.add(p)
  }
  add(pebbles)

  // 4 a big rock
  const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(0.16), mat(0x8c979c))
  rock.position.set(-hexSize * 0.34, 0.22, hexSize * 0.22)
  add(rock)

  // 5 grass tufts / reeds
  const tufts = new THREE.Group()
  for (let i = 0; i < 6; i++) {
    const t = new THREE.Mesh(
      new THREE.ConeGeometry(0.045, water ? 0.34 : 0.16, 4),
      mat(water ? 0x4e9b56 : 0x69c34a))
    const a = (i / 6) * Math.PI * 2 + 0.4
    t.position.set(Math.cos(a) * hexSize * 0.42, water ? 0.3 : 0.22, Math.sin(a) * hexSize * 0.42)
    tufts.add(t)
  }
  add(tufts)

  // 6 bush / lilypad
  const bush = water
    ? new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.03, 10), mat(0x4e9b56))
    : new THREE.Mesh(new THREE.SphereGeometry(0.2, 9, 7), mat(0x51a83c))
  bush.position.set(hexSize * 0.3, water ? 0.19 : 0.27, -hexSize * 0.26)
  add(bush)

  // 7 sapling / lily flower
  const sapling = new THREE.Group()
  if (water) {
    const flower = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 6), mat(0xffd6ef))
    flower.position.set(hexSize * 0.3, 0.25, -hexSize * 0.26)
    sapling.add(flower)
  } else {
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.3, 6), mat(0x7a5433))
    trunk.position.set(-hexSize * 0.1, 0.32, -hexSize * 0.3)
    const crown = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.3, 7), mat(0x3f8f2c))
    crown.position.set(-hexSize * 0.1, 0.56, -hexSize * 0.3)
    sapling.add(trunk, crown)
  }
  add(sapling)

  // 8 the tree grows / a fish jumps
  const tree = new THREE.Group()
  if (water) {
    const fish = new THREE.Mesh(new THREE.SphereGeometry(0.09, 7, 6), mat(0xff9d4d))
    fish.scale.set(1.5, 0.8, 0.6)
    fish.position.set(-hexSize * 0.2, 0.3, hexSize * 0.1)
    tree.add(fish)
  } else {
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 0.5, 6), mat(0x7a5433))
    trunk.position.set(-hexSize * 0.1, 0.42, -hexSize * 0.3)
    const crown = new THREE.Mesh(new THREE.ConeGeometry(0.27, 0.56, 8), mat(0x357f26))
    crown.position.set(-hexSize * 0.1, 0.86, -hexSize * 0.3)
    tree.add(trunk, crown)
  }
  add(tree)

  // 9 a second prop
  const second = water
    ? new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.03, 10), mat(0x59a862))
    : new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 6), mat(0x67b83f))
  second.position.set(hexSize * 0.36, water ? 0.19 : 0.24, hexSize * 0.3)
  add(second)

  // 10 completion flourish
  const flourish = new THREE.Group()
  for (let i = 0; i < 8; i++) {
    const s = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 5),
      mat(i % 2 ? 0xfff2a8 : 0xffd166, 0.9))
    const a = (i / 8) * Math.PI * 2
    s.position.set(
      Math.cos(a) * hexSize * 0.6, 0.7 + Math.sin(a * 2) * 0.2, Math.sin(a) * hexSize * 0.6)
    flourish.add(s)
  }
  add(flourish)

  const grown = new Set<number>()
  const easing = new Map<number, number>()

  return {
    group,

    setProgress(sumsDone, cost) {
      const show = incrementsShown(sumsDone, cost)
      for (let i = 0; i < parts.length; i++) {
        if (i < show && !grown.has(i)) {
          grown.add(i)
          easing.set(i, 0)
          const o = parts[i] as THREE.Object3D
          o.visible = true
          o.scale.setScalar(0.001)
        }
      }
      // Nothing here ever hides a piece already shown: growth is one-way.
    },

    update(dt) {
      for (const [i, t] of easing) {
        const next = Math.min(1, t + dt * 3.2)
        const o = parts[i] as THREE.Object3D
        // Overshoot slightly then settle, so a piece arrives rather than appears.
        const s = next < 1 ? 1.12 * Math.sin(next * Math.PI * 0.5) : 1
        o.scale.setScalar(Math.max(0.001, s))
        if (next >= 1) { o.scale.setScalar(1); easing.delete(i) } else easing.set(i, next)
      }
    },

    dispose() {
      group.traverse(o => {
        const m = o as THREE.Mesh
        if (m.isMesh) { m.geometry.dispose(); (m.material as THREE.Material).dispose() }
      })
    },
  }
}
