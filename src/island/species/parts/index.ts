/**
 * The door into the assembly kit. Two functions: what exists, and build one.
 *
 * `name` and `collection` are READ OFF THE ROSTER and are never written here.
 * §0 of `building-animals-from-parts.md`: "The names and the facts survive and
 * are never regenerated." A geometry rebuild touches geometry.
 */
import type * as THREE from 'three'
import { SPECIES_NAMES, SPECIES_COLLECTION } from '../roster'
import { ASSEMBLED_BUILDS } from './assembled'
import { buildAssembly } from './assembly'

/** One row per species the assembly kit can build. */
export interface AssembledSpecies {
  id: string
  name: string
  collection: string
  /**
   * §2's escape clause, carried out to the viewer. Present when the build
   * strained a rule, or changed course to avoid straining one, and Joe should
   * be looking at it knowing that.
   */
  flag?: string
  /**
   * Present only when this species' HULL departs from its authored proportions,
   * and then it says why (`Hull.stretchWhy`). The hedgehog shipped with the
   * shared 1.250 cube quietly stretched to 1.350 x 1.150 and Joe's first note
   * back was "body cubic, its currently too wide" — so a stretch is no longer
   * something a species can do without saying so where he reads.
   */
  hullStretchWhy?: string
}

/**
 * What the assembly kit can build today, with the roster's own name and
 * collection beside each. Throws on a spec for a species the roster does not
 * have, which is the same guard `define.ts` puts on an invented species.
 */
export function assembledSpecies(): AssembledSpecies[] {
  return Object.keys(ASSEMBLED_BUILDS).map((id) => {
    const name = SPECIES_NAMES[id]
    const collection = SPECIES_COLLECTION[id]
    if (!name || !collection) {
      throw new Error(
        `assembled species "${id}" is not in the roster — see docs/pet-island-species-roster.md §2`,
      )
    }
    const spec = ASSEMBLED_BUILDS[id]
    const row: AssembledSpecies = { id, name, collection }
    if (spec?.flag !== undefined) row.flag = spec.flag
    if (spec?.hull.stretchWhy !== undefined) row.hullStretchWhy = spec.hull.stretchWhy
    return row
  })
}

/** Build one assembled species. Throws by name rather than returning nothing. */
export function buildAssembled(id: string): THREE.Group {
  const spec = ASSEMBLED_BUILDS[id]
  if (!spec) throw new Error(`no assembly build for "${id}"`)
  return buildAssembly(spec)
}

export { buildAssembly } from './assembly'
export type { AssemblyBuild, Feature, Hull, Paint, Placement, Spin } from './assembly'
export { findShapes, hullShapes, SPIKE_QUERY } from './query'
export type { ShapeQuery } from './query'
export {
  assemblyTexture, assemblyTextureCount, detachAssemblyTextures, slotUv, paletteKey,
  PACK_PUPIL, PACK_SCLERA,
} from './texture'
export { ASSEMBLED_BUILDS, HEDGEHOG_ASSEMBLY } from './assembled'
