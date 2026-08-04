/**
 * Determinism, as an ENGINE invariant — not seventy per-animal pins.
 *
 * ## What this file used to be, and why it stopped
 *
 * It held one pinned hash per assembled species — about seventy of them — so
 * that any change to any animal went red by name with both hashes. The intent
 * was good and it did catch things. The cost was that every deliberate edit Joe
 * made in the editor arrived here as a failure, and the fix was always the same
 * mechanical act: read the new hash off `npm run pets:creature` and paste it in.
 * A pin that is re-pinned every time it moves is not evidence, it is a chore.
 *
 * Joe's ruling of 3 August, after seeing what 2 August cost: *"im building a
 * kids game, not a banking OS."* Per-animal fingerprints and world-space pins go
 * and are replaced by engine invariants — the properties that are true of the
 * BUILDER for every animal, which no species edit can ever falsify, and which
 * therefore only ever go red when something is genuinely wrong.
 *
 * The sign-off gate is what protects the child from a bad animal
 * (`signed-off.json`), and `git show` is what tells you whether a change was
 * deliberate. Neither of those needed a hash table to work.
 *
 * ## What is kept, and why each one still earns its place
 *
 * Both survivors are statements about the BUILDER that hold for every species,
 * so they need no maintenance when an animal changes:
 *
 *   1. **The same definition builds the same creature.** No clock, no random
 *      source, no dependence on how warm the texture cache is. This is the
 *      property Joe actually asked for — *"same definition in, same creature
 *      out"* — and it is checked over every assembled species rather than over a
 *      list somebody has to remember to extend.
 *   2. **The fingerprint MOVES when the creature changes.** Without this the
 *      first test passes trivially for a function that returns a constant, and
 *      determinism would be certified by a hash that could not detect anything.
 *
 * Covered by the fingerprint: positions, normals, UVs, indices, mesh names, bank
 * ids and node translations, quantised to 1e-6 — four orders below the pack's own
 * 1/16 authoring grid, so nothing a builder can express hides under it, and
 * `Math.cos` being implementation-defined cannot move it.
 */
import { describe, it, expect } from 'vitest'
import {
  creatureFingerprint, groupFingerprint, buildAssembly, buildAssembled,
  assembledSpecies, ASSEMBLED_BUILDS,
} from '../../src/island/species/parts'

describe('the assembly builder is deterministic', () => {
  it('builds the same creature every time, for every assembled species', () => {
    // Over the register itself, so a new species is covered the moment its file
    // exists and nobody has to remember to add it to a list here.
    const ids = assembledSpecies().map(r => r.id)
    expect(ids.length, 'no assembled species found — the register is empty')
      .toBeGreaterThan(0)

    for (const id of ids) {
      const a = groupFingerprint(buildAssembled(id))
      const b = groupFingerprint(buildAssembled(id))
      expect(b, `${id} is not deterministic`).toBe(a)
    }
  })

  it('gives different creatures different fingerprints', () => {
    /*
     * The check that stops the test above passing for the wrong reason. One
     * feature's join point, moved by a millimetre, and the hash has to notice —
     * otherwise "deterministic" is being certified by a function that cannot
     * tell two animals apart.
     *
     * Compared against the squirrel's OWN freshly-built hash rather than a
     * stored constant, so this stays true when Joe edits the squirrel.
     */
    const spec = ASSEMBLED_BUILDS['animal-squirrel']!
    const moved = {
      ...spec,
      features: spec.features.map(f => (f.name !== 'ear' || f.placement.kind !== 'pair'
        ? f
        : { ...f, placement: { ...f.placement, at: [0.336, 1.44, 0.320549] as const } })),
    }
    expect(groupFingerprint(buildAssembly(moved)))
      .not.toBe(creatureFingerprint('animal-squirrel'))
  })
})
