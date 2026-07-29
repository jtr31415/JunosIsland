/**
 * Every species the assembly kit can build — one line each, and nothing else.
 *
 * This was one 562-line file holding two species' records. Thirteen Garden
 * species are now being built in parallel and that file was the most
 * comment-dense in the repo: every number in an `AssemblyBuild` carries the
 * measurement that produced it, in a comment beside it, and a comment lost in a
 * merge is a reason lost with nothing left to show it was ever there.
 *
 * So the records live one per file under this directory, named for the species
 * id, and this file is the whole of the shared surface.
 *
 * ## ADDING A SPECIES IS A FILE AND A LINE
 *
 *   1. Write `parts/assembled/animal-<name>.ts`. It exports one const, defined
 *      through `defineAssembly('animal-<name>', { ... })`.
 *   2. APPEND one `export { ... } from './animal-<name>'` line to the list below.
 *
 * Nothing else. Not `parts/index.ts` (it re-exports this whole module with a
 * `export *`), not `collections/garden.ts` (`defineSpecies` picks the assembly up
 * by id off the register), not `assembledSpecies()`, not `buildAssembled()`.
 *
 * **Why one line is enough.** Evaluating a re-export evaluates the module it
 * names, and a species module calls `defineAssembly` as it defines its const —
 * so the same line that publishes the name is what puts the species on the
 * register that `ASSEMBLED_BUILDS` and `assemblyFor` read. See `register.ts`.
 *
 * **APPEND, do not sort.** The list order is the order `assembledSpecies()`
 * reports and the order the approver bench shows. §6 of
 * `docs/building-animals-from-parts.md` is one species at a time, in the order
 * they shipped, and the hedgehog is first because it was first.
 *
 * §0 still holds over all of it: the names and the facts are never regenerated,
 * and a species that is not in the roster throws rather than being invented.
 */
export { HEDGEHOG_ASSEMBLY } from './animal-hedgehog'
export { SQUIRREL_ASSEMBLY } from './animal-squirrel'
export { MOUSE_ASSEMBLY } from './animal-mouse'
/* -- append the next species' line directly above this one -- */

import { assembledBuilds } from './register'

/**
 * Every species the assembly kit can build, by species id.
 *
 * Derived from the register rather than typed out, which is the half of the
 * split that stops "added the file, forgot the map" being a thing that can
 * happen. Frozen at module load: every re-export above has already been
 * evaluated by the time this line runs, because `export ... from` is hoisted.
 */
export const ASSEMBLED_BUILDS = assembledBuilds()

export { assemblyFor, assembledCount } from './register'
