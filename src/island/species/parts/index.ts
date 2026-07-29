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
export { findShapes, hullShapes, SPIKE_QUERY, BRUSH_QUERY } from './query'
export type { ShapeQuery } from './query'
export {
  assemblyTexture, assemblyTextureCount, detachAssemblyTextures, slotUv, patchUv, paletteKey,
  PACK_PUPIL, PACK_SCLERA, SLOT_PX, SLOT_W,
} from './texture'
export type { SlotSplit, SlotSplits } from './texture'
/**
 * The assembled species. `export *` deliberately: `assembled/index.ts` gains one
 * line per species and this door must not be a second place that has to be
 * edited to see it. `ASSEMBLED_BUILDS`, `assemblyFor` and every species' own
 * `<NAME>_ASSEMBLY` const come through here without being named twice.
 */
export * from './assembled'
/** The measured facts every species build reaches for, rather than re-measuring. */
export {
  HULL_BOTTOM_Y, LEG_ROW, HULL_FRONT_Z, HULL_FRONT_Z_USUAL, EYE_CARD_Z,
  PACK_HEIGHT_MIN, PACK_HEIGHT_MAX, HEIGHT_FLOOR, HEIGHT_FLOOR_MARGIN,
  BODY_VERTS_MIN, BODY_VERTS_MAX, MODEL_VERTS_MIN, MODEL_VERTS_MAX,
  MODEL_TRIS_MIN, MODEL_TRIS_MAX, OTHER_HULLS, hullFrontZ, hullFacts,
} from './hulls'
/**
 * The shapes Joe sanctioned us to author. Exported so a review surface can
 * LABEL them — a `bespoke-*` part is one he ruled on, and §9.2's discipline
 * about showing the flag applies to showing this too. Deliberately not merged
 * into `PARTS_BANK`; see `authored.ts`.
 */
export { AUTHORED_PARTS, authoredById } from './authored'
