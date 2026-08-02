/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import * as THREE from 'three'
import { createSign, BOARD_BOTTOM, BOARD_Y, BOARD_H, POST_H, BOARD_W } from '../../src/island/sign'
import { WALKING_HEIGHT } from '../../src/island/world/props'
import { clearOf } from '../../src/island/pets'

/**
 * Joe, playing: "the vertical posts go half way into the sign, covering the
 * writing". They did — 0.065 of a 0.17-high board, and proud of the lettered
 * face rather than behind it, so they were drawn over the child's own name.
 *
 * The sign is the one place the world says the island is theirs, so the posts
 * are pinned below the writing rather than merely nudged.
 */
describe('the island sign', () => {
  it('stops the posts at the underside of the board', () => {
    expect(POST_H).toBeLessThanOrEqual(BOARD_BOTTOM)
  })

  it('puts no post geometry across the lettered face', () => {
    const sign = createSign('Juno')

    const posts: THREE.Mesh[] = []
    let board: THREE.Mesh | null = null
    sign.group.traverse(o => {
      const m = o as THREE.Mesh
      if (!m.isMesh) return
      if (m.name === 'sign-post') posts.push(m)
      if (m.name === 'sign-board') board = m
    })

    expect(posts).toHaveLength(2)
    expect(board).not.toBeNull()

    const boardBox = new THREE.Box3().setFromObject(board as unknown as THREE.Object3D)

    for (const post of posts) {
      const postBox = new THREE.Box3().setFromObject(post)
      /*
       * The whole of every post sits below the whole of the board. Not
       * "mostly below", and not "overlaps by less than the text height" —
       * any overlap at all is a stake standing in front of the child's name,
       * because the posts are deeper than the board and win the depth test.
       */
      expect(postBox.max.y).toBeLessThanOrEqual(boardBox.min.y + 1e-6)
    }

    sign.dispose()
  })

  it('keeps the board where the geometry says it is', () => {
    // Guards the derivation: if BOARD_Y or BOARD_H move, POST_H must follow.
    expect(BOARD_BOTTOM).toBeCloseTo(BOARD_Y - BOARD_H / 2, 10)
  })
})

/**
 * Joe, carded for Phase 5: *"pets walk through Juno's signpost"*.
 *
 * They did, and it is the third of exactly this kind — the egg, then Fred, now
 * the sign. Each was a hand-built object that the scenery pipeline never sees,
 * so `props.obstacles()` knew nothing about it and `publishObstacles()` was
 * never told, and pets walked straight through the one thing on the island
 * with the child's name on it.
 */
describe('the sign is solid', () => {
  /** A pet is about 0.24 tall and renders at 0.16 of its ~1.43-unit model. */
  const PET_RADIUS = (1.43 * 0.16) / 2

  it('declares a keep-out at all', () => {
    const sign = createSign('Juno')
    expect(sign.obstacle().r).toBeGreaterThan(0)
    sign.dispose()
  })

  it('MEASURES it rather than guessing, and covers both posts', () => {
    /*
     * Every keep-out on this island used to be `hexSize × a guess` and every
     * one of them was too small — a mountain measuring 0.9 across declared
     * 0.58 (HANDOFF §6). The posts stand at x = ±0.19 and are 0.045 square, so
     * the circle that actually covers them reaches 0.2125 in x. Asserted
     * against the geometry rather than against a number typed here, so moving
     * a post moves the expectation with it.
     */
    const sign = createSign('Juno')
    const posts: THREE.Mesh[] = []
    sign.group.traverse(o => {
      const m = o as THREE.Mesh
      if (m.isMesh && m.name === 'sign-post') posts.push(m)
    })
    sign.group.updateMatrixWorld(true)

    let furthest = 0
    for (const post of posts) {
      const box = new THREE.Box3().setFromObject(post)
      for (const x of [box.min.x, box.max.x]) {
        for (const z of [box.min.z, box.max.z]) furthest = Math.max(furthest, Math.hypot(x, z))
      }
    }
    expect(sign.obstacle().r).toBeCloseTo(furthest, 6)
    sign.dispose()
  })

  it('measures BELOW walking height, so the board is not in anybody\'s way', () => {
    /*
     * Pet-versus-scenery uses `footprintBelow(o, WALKING_HEIGHT)`, because a
     * pet under an overhang has not clipped anything. The board is 0.52 wide
     * and its underside sits at 0.355 — clear of a 0.24-tall pet and even of
     * Fred at 0.35 — so a keep-out taken from the full silhouette would have
     * pets swerving round thin air.
     */
    const sign = createSign('Juno')
    expect(BOARD_BOTTOM).toBeGreaterThan(WALKING_HEIGHT)
    expect(sign.obstacle().r).toBeLessThan(BOARD_W / 2)
    sign.dispose()
  })

  it('follows the sign to wherever main.ts stands it', () => {
    // `refresh()` sites the sign AFTER it is built, so a keep-out captured at
    // construction would be a keep-out at the origin.
    const sign = createSign('Juno')
    sign.group.position.set(1.7, 0, -0.9)
    const at = sign.obstacle()
    expect(at.x).toBeCloseTo(1.7, 6)
    expect(at.z).toBeCloseTo(-0.9, 6)
    sign.dispose()
  })

  it('pushes a pet out to its own SURFACE, not to the post itself', () => {
    /*
     * The other half of the clipping, and the half that was missed once
     * already: clamping a pet's CENTRE to the surface of an obstacle buries
     * half a pet in it. What has to touch is the two surfaces.
     */
    const sign = createSign('Juno')
    sign.group.position.set(2, 0, 1)
    const at = sign.obstacle()
    const pet = new THREE.Vector3(2.02, 0, 1.01)   // walking straight into it
    clearOf(pet, [at], PET_RADIUS)
    expect(Math.hypot(pet.x - 2, pet.z - 1)).toBeGreaterThanOrEqual(at.r + PET_RADIUS - 1e-6)
    sign.dispose()
  })
})

/**
 * The wiring, which is where this bug actually lived.
 *
 * The sign could have had a perfectly good keep-out and still been walked
 * through, because nothing handed it to the pet field — precisely what
 * happened to the egg and then to Fred. `main.ts` is untested glue, which
 * HANDOFF §5 names as this project's four-time offender, so this reads the
 * source the way `fred.test.ts` and `barrier.test.ts` do.
 */
describe('main.ts hands the signpost to the pet field', () => {
  const here = dirname(fileURLToPath(import.meta.url))
  const code = readFileSync(resolve(here, '../../src/island/main.ts'), 'utf8')
    .split('\n')
    .filter(l => !/^\s*(\/\/|\/\*|\*)/.test(l))
    .join('\n')

  it('publishes it as something a pet must walk round', () => {
    expect(code).toContain('sign.obstacle()')
  })

  it('publishes it in the list `publishObstacles` actually sends', () => {
    // Not merely mentioned somewhere in the file: in `solid`, which is what
    // reaches `pets.setObstacles`.
    expect(code).toMatch(/const solid = \[[^\]]*sign\.obstacle\(\)[^\]]*\]/)
    expect(code).toContain('pets.setObstacles(solid)')
  })
})
