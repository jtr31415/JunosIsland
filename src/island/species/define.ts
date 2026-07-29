/**
 * The invention guard, on its own so a collection can import it.
 *
 * PB-036 phase 2. `defineSpecies` lived in `registry.ts` through phase 1, when
 * the registry was the only file that called it. Phase 2 is a fan-out — one file
 * per collection under `collections/` — and the registry has to import those
 * files to assemble `REGISTRY`. Had they imported the guard back out of the
 * registry, that is a module cycle: `registry -> collections/garden -> registry`.
 * ESM would probably survive it (function declarations are hoisted at
 * instantiation) but "probably" is not a thing to build 296 species on, and the
 * failure mode is a `defineSpecies is not a function` at import time in one
 * bundler and not another. So the guard moved down here, where nothing imports
 * anything, and `registry.ts` re-exports it so every existing caller is unchanged.
 */
import { SPECIES_NAMES, SPECIES_COLLECTION } from './roster'
import type { BuildSpec, KitId, Species, Threat } from './types'

/**
 * Build one species record, taking its printed name and its collection from the
 * roster rather than repeating them.
 *
 * Throws on an unknown id. That is the point: the roster is the transcription of
 * Joe's brief, so a record that names a species the brief never listed is either
 * a typo or an invention, and both must stop the build rather than reach a
 * child. Roster §2's species list is closed.
 */
export function defineSpecies(
  id: string,
  kit: KitId,
  extra: { build?: BuildSpec; threat?: Threat } = {},
): Species {
  const name = SPECIES_NAMES[id]
  const collection = SPECIES_COLLECTION[id]
  if (!name || !collection) {
    throw new Error(
      `species "${id}" is not in the roster — see docs/pet-island-species-roster.md §2`,
    )
  }
  return { id, name, kit, collection, ...extra }
}
