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
 *
 * The other eleven are the FAN-OUT's pins, read off `npm run pets:creature` in
 * one pass once all eleven species files existed. Every one is a first pin — the
 * hash of the animal as it was built, recorded, not chosen — so none of them is
 * evidence of anything yet. What they buy is the second run: from here on, any of
 * these eleven moving is a change to that animal, by name, with both hashes.
 */
const PINNED: Readonly<Record<string, string>> = {
  'animal-hedgehog': 'a839dd97acf556e9',
  'animal-squirrel': '6a9ea9c7855c48c5',
  'animal-mouse': '896afcc9e7c39067',
  /* Moved once, on purpose, and this is the pin doing its job: `c54d4a52d6fce328`
   * was the shrew with its mouth EXACTLY IN its own front face — a zero-thickness
   * card the donor transfer joined and finished on the same plane, z-fighting the
   * hull and reading as no mouth at all. `CARD_STANDOFF` stands a solved card the
   * pack's own 0.010 proud, so the only thing that changed on this animal is the
   * mouth's z, 0.500 to 0.510. Nothing else on it has a zero extent. */
  'animal-shrew': '41947a98c5ff27be',
  'animal-dormouse': 'e1819320d0649b66',
  'animal-vole': '1a861003a11a28c9',
  'animal-frog': '95cc009b85563d69',
  'animal-toad': 'e6cd7840215fcda2',
  'animal-tortoise': '5d963604a4b492ba',
  'animal-salamander': 'bfd5d6d3faeb517d',
  'animal-newt': 'f6c36bd7e766cf11',
  'animal-badger': '394a0415661ac7af',
  'animal-mole': '51fa9409a320915b',
  'animal-slow-worm': 'b93b77ddd7fb4e23',
  // Home Pets' first assembled member, and the first pin here that is not a
  // Garden animal. Read off the built model on 2 Aug.
  'animal-corn-snake': '5c3ad79166c9e4d7',
  // The two that close Home Pets at 16 and take Africa to 14. Read off the built
  // models on 2 Aug.
  'animal-goldfish': '58c690f8271aaca6',
  'animal-crocodile': 'c4bafe77662805a1',

  /*
   * NIGHT TIME, all thirteen, read off `npm run pets:creature` in one pass on
   * 2 Aug once every species file existed.
   *
   * The first WHOLE COLLECTION to be pinned here at once, where everything above
   * arrived one or two animals at a time. That is worth knowing when one of them
   * moves: these thirteen were built in parallel against a single shared
   * measuring pass over the bank, so a change that moves several of them at once
   * is far more likely to be a change to `creature.ts`, `assembly.ts` or the bank
   * than thirteen independent species edits. Above this line the opposite is
   * true.
   *
   * Every one is a first pin — the hash of the animal as it was built, recorded
   * rather than chosen — so none is evidence of anything yet. What they buy is
   * the second run.
   *
   * Roster order for `night-time`. The three absences are `animal-bat`,
   * `animal-sugar-glider` and `animal-scorpion`, which want a membrane and a
   * pincer; `species-night-time.test.ts` measures that.
   */
  'animal-raccoon': '38e0f457d798b77d',
  'animal-wolf': '7774b15b1f2f3fa9',
  'animal-firefly': '219cdcb7f56bc655',
  'animal-opossum': 'a9b74dc642a99724',
  'animal-nightjar': '851c64f6e11330a0',
  'animal-tarsier': 'fcf3ef0666903d78',
  'animal-bushbaby': 'e82b0bf31b1a6cb5',
  'animal-fennec-fox': '2705ac21add47c67',
  'animal-civet': '97e2efd0654bbb1e',
  'animal-aye-aye': 'b8e2fa1e6a95a604',
  'animal-kiwi': '01a430e204093614',
  'animal-kinkajou': '07ed048ed805402c',
  'animal-glow-worm': 'ba579cc94d23eee3',

  /* HOME PETS (PB-073), ship 2 — the collection Juno meets straight after
   * Garden. Every one of these is a FIRST PIN: the hash of the animal as it was
   * built, recorded rather than chosen, so none is evidence of anything yet.
   * What they buy is the second run, exactly as the Garden fan-out's did.
   *
   * These animals are UNSIGNED. Joe reviews in the editor and that is his gate
   * alone, so a pin moving here before he has ever seen the animal is not a
   * regression — it is a build still being worked on. After his sign-off it is a
   * regression, and the pin is what makes the difference detectable at all. */
  'animal-chinchilla': '3005052c8bf1096a',
  'animal-guinea-pig': 'a084406595c0eaef',
  'animal-pony': '5f04f283cfa025c1',
  'animal-hamster': '002aad1e863ae490',
  'animal-degu': '1c718d0ba7ab53c5',
  'animal-gecko': 'c2c73918dc2b3fe6',
  'animal-gerbil': '0697d124f0024172',
  'animal-ferret': '7ae0bbef676c9405',
  'animal-budgie': 'a3ec6ebfd1942321',
  'animal-rat': '3a20a89951d61f13',
  'animal-terrapin': '1e74d030e89f620e',
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
