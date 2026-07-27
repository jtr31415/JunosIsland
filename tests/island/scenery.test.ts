/**
 * What the island actually plants, checked against the files on disk.
 *
 * Every name in these catalogues is a claim about a `.gltf` in
 * `src/island/public/`, and a claim about files that nothing checks is a claim
 * that goes wrong the first time someone re-exports the art — the same reasoning
 * as the coast table and the pet atlas. It matters more than usual here because
 * a missing model does not throw: `forestModel` rejects, the piece is quietly
 * dropped, and the tile just looks a little bare. That is a bug you can stare
 * straight at without seeing.
 */
import { describe, it, expect } from 'vitest'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { COVER, LEAFY_TREES, BARE_TREES, TREE_EVERY } from '../../src/island/world/props'
import type { Character } from '../../src/island/world/props'
import { PALETTE } from '../../src/island/world/increments'

const here = dirname(fileURLToPath(import.meta.url))
const PUBLIC = resolve(here, '../../src/island/public')

/** Forest Nature pieces live in `forest/` and are named `Thing_1_A_Color1`. */
const isForest = (name: string): boolean => /_Color\d+$/.test(name)

const exists = (name: string): boolean =>
  existsSync(resolve(PUBLIC, isForest(name) ? 'forest' : 'props', `${name}.gltf`))
  || existsSync(resolve(PUBLIC, isForest(name) ? 'forest' : 'props', `${name}.glb`))

const CHARACTERS: Character[] = ['meadow', 'wood', 'rocky', 'highland']

describe('every model the island can plant exists', () => {
  it('the leafy trees — all fifteen, typed out by hand', () => {
    const missing = LEAFY_TREES.filter(n => !exists(n))
    expect(missing).toEqual([])
    expect(LEAFY_TREES.length).toBeGreaterThanOrEqual(14)
  })

  it('the bare trees', () => {
    expect(BARE_TREES.filter(n => !exists(n))).toEqual([])
  })

  it('the ground cover, for every character', () => {
    for (const c of CHARACTERS) {
      expect(COVER[c].filter(n => !exists(n)), c).toEqual([])
    }
  })

  it('the growing plot palette, for every tile type', () => {
    for (const type of ['grass', 'water'] as const) {
      expect(PALETTE[type].filter(n => !exists(n)), type).toEqual([])
    }
  })
})

describe('the island is not too flat — Joe, 27 July', () => {
  /*
   * *"i'd also like to see more trees from the nature/forest kay pack. also
   * higher liklyhood of forest/trees, the environment is just a bit too
   * flat/boring."*
   *
   * Stated as properties rather than as exact weights, so the numbers can be
   * tuned by eye — which is how they have to be tuned — without a test failing
   * for no reason. What must not silently revert is the SHAPE of the answer.
   */

  it('plants trees from the Forest Nature pack at all', () => {
    // The omission Joe was describing: the pack ships fifteen leafy trees and
    // the island used to plant none of them, only the six bare trunks.
    expect(LEAFY_TREES.length).toBeGreaterThan(0)
    for (const n of LEAFY_TREES) expect(n).toMatch(/^Tree_\d/)
    for (const n of LEAFY_TREES) expect(n).not.toMatch(/Bare/)
  })

  it('gives every character a tree frequency, woods the highest', () => {
    for (const c of CHARACTERS) {
      expect(TREE_EVERY[c], c).toBeGreaterThan(0)
    }
    // One in N, so the SMALLEST number is the most wooded.
    const woodiest = CHARACTERS.reduce((a, b) => (TREE_EVERY[a] <= TREE_EVERY[b] ? a : b))
    expect(woodiest).toBe('wood')
    expect(TREE_EVERY.wood).toBeLessThan(TREE_EVERY.meadow)
    expect(TREE_EVERY.meadow).toBeLessThan(TREE_EVERY.rocky)
  })

  it('plants trees on the tiles she BUILDS too, not only the ones she is given', () => {
    /*
     * The landmine this project has already paid for twice: there are TWO
     * placement paths, `props.ts` for tiles the island grows and
     * `increments.ts` for the plot she builds herself, and fixing one is not
     * fixing the other (HANDOFF §6). Trees-inside-rocks was reported twice for
     * exactly this reason.
     */
    const trees = PALETTE.grass.filter(n => /^Tree_\d/.test(n))
    expect(trees.length, 'the growing plot grows no forest trees').toBeGreaterThanOrEqual(4)
  })

  it('still leaves open ground, because a landscape needs rests', () => {
    // The other half. Filling every hex would answer "too flat" by replacing it
    // with "too busy", and the rocky character is deliberately the sparse one.
    expect(TREE_EVERY.rocky).toBeGreaterThan(TREE_EVERY.wood * 2)
  })
})
