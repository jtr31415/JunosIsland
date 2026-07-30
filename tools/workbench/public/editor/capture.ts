/**
 * JOE_WORKBENCH_ONLY — the definitions of the built species, captured as they
 * are declared.
 *
 * >>> PROVISIONAL. Paired with the `joe-workbench-capture-defs` plugin in
 * `vite.workbench.config.ts`, which rewrites `defineCreature(` to `captureDef(`
 * in the fourteen `src/island/species/parts/assembled/animal-*.ts` files as the
 * dev server serves them. Read that plugin's comment before touching this file;
 * it says why the rewrite exists and what deletes it.
 *
 * Why any of this: the editor edits a `CreatureDef`, and `defineCreature`
 * returns the built `AssemblyBuild` and drops the definition on the floor. So
 * there is no way to OPEN a shipped species. The permanent fix is two lines in
 * `creature.ts`; this is the dev-only stand-in for it, and it calls the real
 * `defineCreature` so the geometry is not merely equivalent — it is the same.
 *
 * Imported from `./creature` and NOT from the barrel on purpose. The barrel
 * pulls in `assembled/index.ts`, which imports the animal files, which import
 * this one: a cycle, and in a cycle `defineCreature` can be `undefined` at the
 * moment a module-scope call reaches it. `creature.ts` imports only the bank,
 * the authored parts, the texture, the hulls, the motion resolver and
 * `assembled/register` — no edge back to a species file.
 */

import { defineCreature } from '../../../../src/island/species/parts/creature'
import type { AssemblyBuild } from '../../../../src/island/species/parts/assembly'
import type { CreatureDef } from '../../../../src/island/species/parts'

/**
 * Every definition as it was WRITTEN, by species id, in declaration order.
 *
 * Populated as a side effect of importing `assembled/index.ts` — see
 * `loadBuiltDefs()`. A `Map` rather than a record because insertion order is
 * the barrel's order, which is the order Joe's list should show.
 */
export const CAPTURED_DEFS = new Map<string, CreatureDef>()

/**
 * The stand-in for `defineCreature`. Records a DEEP COPY, then defines.
 *
 * The copy matters: the editor hands its working definition to `creatureSpec`
 * on every gesture, and if that object were the one the species module still
 * holds, an edit would rewrite the shipped species inside the running page and
 * every later rebuild would start from the edit. `structuredClone` is enough
 * because a `CreatureDef` is plain data by construction — numbers, strings,
 * booleans, arrays and objects of them.
 */
export function captureDef(id: string, def: CreatureDef): AssemblyBuild {
  CAPTURED_DEFS.set(id, structuredClone(def) as CreatureDef)
  return defineCreature(id, def)
}

/**
 * Import the species barrel for its side effects, then hand back what was
 * captured. Await this once before offering Joe a list.
 *
 * Throws rather than returning an empty map if the rewrite did not fire. An
 * editor with no species to open is a broken editor, and it should say which
 * layer broke rather than look like a tree with no animals in it.
 */
export async function loadBuiltDefs(): Promise<ReadonlyMap<string, CreatureDef>> {
  await import('../../../../src/island/species/parts/assembled/index')
  if (CAPTURED_DEFS.size === 0) {
    throw new Error(
      'no species definitions were captured. The joe-workbench-capture-defs plugin in '
      + 'vite.workbench.config.ts did not rewrite the animal-*.ts files — are you on the '
      + 'plain node server (npm run workbench:plain) instead of Vite?',
    )
  }
  return CAPTURED_DEFS
}
