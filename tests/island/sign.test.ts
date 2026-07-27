/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from 'vitest'
import * as THREE from 'three'
import { createSign, BOARD_BOTTOM, BOARD_Y, BOARD_H, POST_H } from '../../src/island/sign'

/**
 * Joe, playing: "the vertical posts go half way into the sign, covering the
 * writing". They did — 0.065 of a 0.17-high board, and proud of the lettered
 * face rather than behind it, so they were drawn over her own name.
 *
 * The sign is the one place the world says the island is hers, so the posts
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
       * any overlap at all is a stake standing in front of her name, because
       * the posts are deeper than the board and win the depth test.
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
