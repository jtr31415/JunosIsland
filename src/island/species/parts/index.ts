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
    const flag = ASSEMBLED_BUILDS[id]?.flag
    return flag === undefined ? { id, name, collection } : { id, name, collection, flag }
  })
}

/** Build one assembled species. Throws by name rather than returning nothing. */
export function buildAssembled(id: string): THREE.Group {
  const spec = ASSEMBLED_BUILDS[id]
  if (!spec) throw new Error(`no assembly build for "${id}"`)
  return buildAssembly(spec)
}

export { buildAssembly } from './assembly'
export type { AssemblyBuild, Feature, Hull, Paint, Placement } from './assembly'
export { findShapes, hullShapes, SPIKE_QUERY } from './query'
export type { ShapeQuery } from './query'
export { assemblyTexture, assemblyTextureCount, detachAssemblyTextures, slotUv, paletteKey }
  from './texture'
export { ASSEMBLED_BUILDS, HEDGEHOG_ASSEMBLY } from './assembled'
