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
import { assemblyFor } from './parts/assembled/register'
import type { AssemblyBuild } from './parts/assembly'
import type { BuildSpec, KitId, Species, Threat } from './types'

/**
 * Build one species record, taking its printed name and its collection from the
 * roster rather than repeating them — and its ASSEMBLY off the register, for the
 * same reason.
 *
 * Throws on an unknown id. That is the point: the roster is the transcription of
 * Joe's brief, so a record that names a species the brief never listed is either
 * a typo or an invention, and both must stop the build rather than reach a
 * child. Roster §2's species list is closed.
 *
 * ## Why `assembly` is looked up rather than passed
 *
 * It was passed, once per species, as `assembly: HEDGEHOG_ASSEMBLY` beside an
 * import of the same name — and thirteen Garden species being built in parallel
 * would have been thirteen agents editing `collections/garden.ts`, which is a
 * file whose every entry is wrapped in a paragraph explaining the animal. The
 * name and the collection already come from a lookup by id; the assembly now
 * does too, off `parts/assembled/register.ts`, and adding a species touches no
 * collection file at all.
 *
 * An explicitly passed `assembly` still wins, so nothing that used to work
 * stopped working. The register is imported rather than the barrel on purpose:
 * the barrel pulls `texture.ts` and therefore three.js, and four of the five
 * collections have no assembled species in them. A collection that DOES must
 * import the barrel once itself so the species modules are evaluated first;
 * `collections/garden.ts` does, and `assembly-constants.test.ts` fails if it stops.
 */
export function defineSpecies(
  id: string,
  kit: KitId,
  extra: { build?: BuildSpec; assembly?: AssemblyBuild; threat?: Threat } = {},
): Species {
  const name = SPECIES_NAMES[id]
  const collection = SPECIES_COLLECTION[id]
  if (!name || !collection) {
    throw new Error(
      `species "${id}" is not in the roster — see docs/pet-island-species-roster.md §2`,
    )
  }
  const out: Species = { id, name, kit, collection, ...extra }
  const registered = extra.assembly ?? assemblyFor(id)
  if (registered !== undefined) out.assembly = registered
  return out
}
