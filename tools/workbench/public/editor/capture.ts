/**
 * JOE_WORKBENCH_ONLY — the definitions of the built species, read back off the
 * game's own register.
 *
 * Why any of this: the editor edits a `CreatureDef`, and a species file passes
 * its definition into `defineCreature` as an object literal and exports only the
 * built `AssemblyBuild`. `creature.ts` now keeps the definition too, in
 * `CREATURE_DEFS`, which is the whole of the mechanism — this file imports the
 * barrel for its side effects and copies what it finds.
 *
 * There used to be a `joe-workbench-capture-defs` plugin in
 * `vite.workbench.config.ts` that rewrote `defineCreature(` to a local
 * `captureDef(` in the fourteen `animal-*.ts` files as the dev server served
 * them, because the definitions were unrecoverable and this run could not touch
 * `src/`. The `src/` change has landed and the plugin is gone. Nothing here
 * rewrites anything now, and the editor works under the plain node server too.
 *
 * `CREATURE_DEFS` is imported from `./creature` and NOT from the barrel on
 * purpose. The barrel pulls in `assembled/index.ts`, which imports the animal
 * files, which import `creature.ts`: a cycle, and in a cycle a binding can still
 * be uninitialised at the moment a module-scope call reaches it. The barrel is
 * reached below by a dynamic import inside a function, which runs long after
 * every module has been evaluated.
 */

import { CREATURE_DEFS } from '../../../../src/island/species/parts/creature'
import type { CreatureDef } from '../../../../src/island/species/parts'

/**
 * Import the species barrel for its side effects, then hand back a COPY of every
 * definition it registered. Await this once before offering Joe a list.
 *
 * The import is what does the work: `CREATURE_DEFS` is written by
 * `defineCreature` at module scope, so it is empty until something evaluates the
 * species files, and a map does not populate itself.
 *
 * The copies matter. The editor hands its working definition to `creatureSpec`
 * on every gesture, and if that object were the one the species module still
 * holds, an edit would rewrite the shipped species inside the running page and
 * every later rebuild would start from the edit. `structuredClone` is deep
 * enough because a `CreatureDef` is plain data by construction — numbers,
 * strings, booleans, arrays and objects of them.
 *
 * Throws rather than returning an empty map. An editor with no species to open
 * is a broken editor, and it should say which layer broke rather than look like
 * a tree with no animals in it.
 */
export async function loadBuiltDefs(): Promise<ReadonlyMap<string, CreatureDef>> {
  await import('../../../../src/island/species/parts/assembled/index')
  if (CREATURE_DEFS.size === 0) {
    throw new Error(
      'no species definitions were registered. Importing parts/assembled/index left '
      + 'CREATURE_DEFS empty — either the barrel no longer evaluates the animal-*.ts '
      + 'files, or defineCreature in src/island/species/parts/creature.ts stopped '
      + 'writing the map.',
    )
  }
  const out = new Map<string, CreatureDef>()
  for (const [id, def] of CREATURE_DEFS) out.set(id, structuredClone(def) as CreatureDef)
  return out
}
