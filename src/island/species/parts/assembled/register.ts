/**
 * The assembly register: how a species file gets seen without anything editing
 * two places to see it.
 *
 * ## Why this exists
 *
 * `assembled.ts` used to be one file holding every species' `AssemblyBuild`, and
 * it was the most comment-dense file in the repo — every measured number in it
 * carries the reasoning that produced it. Thirteen Garden species being built in
 * parallel would have been thirteen agents editing that one file, and the first
 * thing lost in a merge is a comment nobody can tell was there.
 *
 * So a species is now ONE FILE, and the file registers itself as it is defined.
 * `index.ts` re-exports it in one line, and that single line does both jobs:
 * evaluating the re-export evaluates the species module, which calls
 * `defineAssembly` below, which is what puts it in `ASSEMBLED_BUILDS` and — via
 * `assemblyFor` — onto its collection record. Nothing else is edited. A species
 * is a file and a line.
 *
 * ## Why the register and not the barrel is what `define.ts` imports
 *
 * This module has NO runtime imports. `define.ts` is reached by every collection,
 * including the five that have no assembled species at all, and the barrel drags
 * `texture.ts` and therefore three.js behind it. Importing the register instead
 * costs those collections nothing: their species simply find no entry, which is
 * the correct answer.
 *
 * That does mean a collection whose species DO have assemblies has to import the
 * barrel once, so the species modules are evaluated before `defineSpecies` runs.
 * `collections/garden.ts` does, at the top, with a comment saying why — and it is
 * one line that is never edited again. `tests/island/assembly-constants.test.ts`
 * fails loudly if that import is ever dropped.
 */
import type { AssemblyBuild } from '../assembly'

/**
 * Registration order, which is the order `assembledSpecies()` reports.
 *
 * A `Map` and not an object literal so insertion order is a stated guarantee
 * rather than a property of how V8 happens to key strings. The hedgehog is first
 * because it shipped first (`docs/building-animals-from-parts.md` §6, one species
 * at a time) and `index.ts` says to APPEND for that reason.
 */
const REGISTERED = new Map<string, AssemblyBuild>()

/**
 * Declare one species' build, and put it on the register.
 *
 * Returns the spec unchanged, so a species file reads
 * `export const X_ASSEMBLY = defineAssembly('animal-x', { ... })` and the object
 * literal is still checked against `AssemblyBuild` exactly as an annotated
 * `const` was — including the `Hull` union that makes `stretch` without
 * `stretchWhy` a compile error.
 *
 * Throws on a second, different build for one id. Two species files claiming one
 * species is a copy-paste that would otherwise resolve to whichever module the
 * bundler evaluated last, which is not a thing to find out from a screenshot.
 */
export function defineAssembly(id: string, spec: AssemblyBuild): AssemblyBuild {
  const had = REGISTERED.get(id)
  if (had !== undefined && had !== spec) {
    throw new Error(
      `assembly: "${id}" is defined twice. One species is one file under `
      + 'parts/assembled/, named for its id.',
    )
  }
  REGISTERED.set(id, spec)
  return spec
}

/** Every registered build, by species id, in registration order. */
export const assembledBuilds = (): Readonly<Record<string, AssemblyBuild>> =>
  Object.fromEntries(REGISTERED)

/**
 * One species' build, or nothing.
 *
 * `define.ts` calls this so a collection record picks its assembly up by ID
 * rather than by an import and a field — which is what makes adding a species a
 * change to `collections/garden.ts` of exactly zero lines.
 */
export const assemblyFor = (id: string): AssemblyBuild | undefined => REGISTERED.get(id)

/** How many species are registered. For the wiring test. */
export const assembledCount = (): number => REGISTERED.size
