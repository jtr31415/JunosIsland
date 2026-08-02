/**
 * Every name the game can deal has a file behind it.
 *
 * The asset viewer exists partly to make this visible to Joe, but a thing you
 * have to open a browser to notice is a thing that gets noticed late. These
 * tables are indexed by a hash at runtime, so a name with no file is a 404 that
 * fires on one tile in twenty, on one island in ten, and looks like a flake.
 * `props/*.gltf` referencing a texture that does not ship cost two agents a day
 * for exactly this reason (BACKLOG #45).
 *
 * The reverse direction — files nobody names — is deliberately NOT a failure.
 * The Forest Nature pack ships 93 models and the island uses about two thirds
 * on purpose; unused is a judgement, and the viewer reports it as a count for
 * Joe rather than as a red build.
 */
import { describe, it, expect } from 'vitest'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { SPECIES } from '../../src/island/pets'
import {
  FEATURES, COVER, MOUNTAIN_HEXES, LEAFY_TREES, BARE_TREES, WATER_PIECES,
} from '../../src/island/world/props'
import { PALETTE } from '../../src/island/world/increments'
import { TILE_URL } from '../../src/island/world/tiles'

const PUBLIC = resolve(dirname(fileURLToPath(import.meta.url)), '../../src/island/public')

/** The game's own rule, from `PropField.load`: a leading capital is the forest pack. */
const fileFor = (id: string): string =>
  `${/^[A-Z]/.test(id) ? 'forest' : 'props'}/${id}.gltf`

const missing = (names: readonly string[], to: (id: string) => string): string[] =>
  names.filter(Boolean).filter(id => !existsSync(resolve(PUBLIC, to(id))))

describe('every asset the code names is on disk', () => {
  it('has a GLB for all 24 species', () => {
    expect(SPECIES).toHaveLength(24)
    expect(missing(SPECIES, id => `pets/${id}.glb`)).toEqual([])
  })

  it('has a glTF for every tile render kind', () => {
    expect(missing(Object.values(TILE_URL), f => f)).toEqual([])
  })

  it('has a glTF for every tile feature, in every character', () => {
    const names = Object.values(FEATURES).flat().map(f => f.name)
    expect(missing(names, fileFor)).toEqual([])
  })

  it('has a glTF for every mountain hex', () => {
    expect(missing(MOUNTAIN_HEXES.map(h => h.name), fileFor)).toEqual([])
  })

  it('has a glTF for every piece of ground cover, in every character', () => {
    expect(missing(Object.values(COVER).flat(), fileFor)).toEqual([])
  })

  it('has a glTF for every tree, leafy and bare', () => {
    expect(missing([...LEAFY_TREES, ...BARE_TREES], fileFor)).toEqual([])
  })

  it('has a glTF for every water piece', () => {
    expect(missing(WATER_PIECES, fileFor)).toEqual([])
  })

  it('has a glTF for everything a plot they built can grow', () => {
    /* The SECOND placement path — the one that gets forgotten. HANDOFF §6. */
    expect(missing(Object.values(PALETTE).flat(), fileFor)).toEqual([])
  })
})
