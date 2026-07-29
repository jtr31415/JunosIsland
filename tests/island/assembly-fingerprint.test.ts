/**
 * The fingerprints. Determinism, pinned, so drift is CAUGHT rather than found.
 *
 * Joe asked for a builder that is deterministic as well as fast — *"same
 * definition in, same creature out"* — and gave two reasons for it that this file
 * is the enforcement of:
 *
 *   1. **A species can be reviewed, corrected and rebuilt without drift.** He
 *      looks at an animal, sends a note, one number in its definition changes and
 *      nothing else about the animal moves. If something else moves, this is red,
 *      by name, with both hashes.
 *   2. **A correction to the BUILDER improves every animal at once.** The pupil
 *      fix should have been that kind of change. When one is made deliberately,
 *      every hash below moves together — which is itself the evidence that the
 *      change reached every species rather than the one that was being looked at.
 *
 * ## How to change a number here
 *
 * Run `npm run pets:creature` — it prints the fingerprint of every species — and
 * paste the new value in, in the same commit as the change that moved it, with
 * the reason. **A fingerprint updated on its own, or updated to make a test pass,
 * is the failure this file exists to make visible.** The hash is not a checksum of
 * the source; it is a checksum of the ANIMAL.
 *
 * ## What it covers, and what it does not
 *
 * Positions, normals, UVs, indices, mesh names, bank ids and node translations,
 * quantised to 1e-6 — four orders below the pack's own 1/16 authoring grid, so
 * nothing a builder can express hides under it, and `Math.cos` being
 * implementation-defined cannot move it. Not the palette (that has its own tests),
 * not the material, not the order of the group's children.
 */
import { describe, it, expect } from 'vitest'
import {
  creatureFingerprint, groupFingerprint, buildAssembly, buildAssembled,
  assembledSpecies, ASSEMBLED_BUILDS,
} from '../../src/island/species/parts'

/**
 * Every assembled species, and the creature it builds today.
 *
 * The hedgehog's and the squirrel's are the CONVERSION EVIDENCE: both were
 * hand-written `AssemblyBuild` records and are now `defineCreature` definitions,
 * and these are the hashes the hand-written records produced. They did not
 * change. Every vertex, normal, uv, index and node translation of both animals is
 * the same as the day Joe reviewed them.
 */
const PINNED: Readonly<Record<string, string>> = {
  'animal-hedgehog': 'a839dd97acf556e9',
  'animal-squirrel': '6a9ea9c7855c48c5',
  'animal-mouse': '896afcc9e7c39067',
}

describe('every assembled species has a pinned fingerprint', () => {
  it('has one pin per species, and one species per pin', () => {
    // A new species with no pin is the gap that makes the rest of this file
    // decorative, so it fails here rather than being noticed later.
    expect(assembledSpecies().map(r => r.id).sort()).toEqual(Object.keys(PINNED).sort())
  })

  for (const [id, want] of Object.entries(PINNED)) {
    it(`${id} builds the creature it built before`, () => {
      expect(creatureFingerprint(id)).toBe(want)
    })
  }

  it('is the same creature every time it is built', () => {
    // Same definition in, same creature out — no clock, no random source, no
    // dependence on how many times the texture cache has been warmed.
    for (const id of Object.keys(PINNED)) {
      const a = groupFingerprint(buildAssembled(id))
      const b = groupFingerprint(buildAssembled(id))
      expect(b, `${id} is not deterministic`).toBe(a)
    }
  })

  it('MOVES when the animal changes — otherwise it is pinning nothing', () => {
    // The check that stops this file passing for the wrong reason. One feature's
    // join point, moved by a millimetre, and the hash has to notice.
    const spec = ASSEMBLED_BUILDS['animal-squirrel']!
    const moved = {
      ...spec,
      features: spec.features.map(f => (f.name !== 'ear' || f.placement.kind !== 'pair'
        ? f
        : { ...f, placement: { ...f.placement, at: [0.336, 1.44, 0.320549] as const } })),
    }
    expect(groupFingerprint(buildAssembly(moved)))
      .not.toBe(PINNED['animal-squirrel'])
  })
})
