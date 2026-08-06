/**
 * The Velociraptor — the small one, and the one that prices the CLAW.
 *
 * **THE SICKLE CLAW IS NOT HERE AND CANNOT BE.** §7 of
 * `docs/building-animals-from-parts.md` censuses **claw: 10 instances, 10 distinct
 * shapes, donors crab, lion, tiger and polar — BAKED: no**, and the roles actually
 * present in `PARTS_BANK` are band, card, ear, eye, hull, leg, nose, oddment,
 * tail, tooth and wing. The crab's pincer and the big cats' claws are sitting in
 * GLBs in this repo and the generator has never baked them. `animal-lobster.ts`
 * priced the same absence for Ocean; this is the second species behind it, and
 * the fix is **one line in `tools/pets/parts-bank.ts` and it is Joe's**, because
 * baking a role renumbers the whole bank silently.
 *
 * **WHAT STANDS IN IS `wedge-13`, THE HOG'S TUSK** — handed, `z +1`, taper 0.586,
 * a recorded burial of 0.39 — mirrored into a pair of HAND claws on the chest
 * rather than a foot claw. That placement is chosen for a measured reason and not
 * a squeamish one: a claw at the ankle would have to sit below y = 0.20 to read,
 * and `buildAssembly` grounds the animal on its LOWEST point, so anything under
 * the feet lifts the legs off the floor and the harness fails it by name.
 *
 * `box-31`, the lion's shallow shell — 1.125 deep, the lowest hull that still
 * stands on legs — is the whole separation from the four other bipeds here, all
 * of which are on the cube or on the fox's tall shell. A raptor is a low, level,
 * fast-looking thing and depth is the axis a child reads that on from the side.
 */
import { defineCreature } from '../creature'
import { LEG_ROW } from '../hulls'
import { PACK_PUPIL } from '../texture'

/** `box-31`'s own measured centre and front — 1.125 deep, offset back 0.0625. */
const HULL_MID_Y = 0.80625

export const VELOCIRAPTOR_ASSEMBLY = defineCreature('animal-velociraptor', {
  palette: {
    coat: 0x7a6440,    // UNREVIEWED: a barred russet-brown
    belly: 0xd8c8a4,   // UNREVIEWED: the pale underside, and the sclera
    quill: 0x4a3b28,   // UNREVIEWED: the darker feathered tail and jaw
    claw: 0xe9e0c8,    // UNREVIEWED: pale bone, for the two hand claws
    limb: 0x6a563a,    // UNREVIEWED: the two legs
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* THE SHALLOW SHELL, 1.125 deep — the lowest hull in the bank that still stands
   * on legs, 50 triangles, and the only thing separating this animal from four
   * other bipedal theropods in the same collection. Its front face is 0.500, so
   * the eye card floats 0.135 proud rather than 0.010 — that is the lion's own
   * arrangement and not a fault; see EYE_CARD_Z in hulls.ts. */
  hull: { part: 'box-31', paint: 'coat' },

  /* 8/16, the tiger's own mammal line. It splits the `coat` CELL and every other
   * part here paints from a slot of its own. */
  belly: 0.5,

  /* THE JAW. The deer's muzzle at its own zero burial on a hull whose front face
   * is 0.500, so all 0.532 of it stands clear — animal-echidna.ts's argument for
   * the same part, on the same shell, for a longer reach than the shell has. */
  snout: { part: 'tube-03', paint: 'quill' },

  /* The cat's rope, the thinnest long tail after the tiger's whip, laid straight
   * back on animal-frilled-lizard.ts's idiom. A raptor's tail is a stiff rod held
   * level, which is the one thing about it that is not a claw. */
  tail: {
    part: 'wedge-07',
    paint: 'quill',
    spin: [{ axis: 'x', deg: -90 }],
    axis: 'y',
    dir: 1,
    sink: 0.16,
    at: [0, HULL_MID_Y, -0.625],
  },

  legs: false,
  extras: [
    /* TWO legs at the chicken's and the goose's biped station. */
    { name: 'leg', part: 'box-01', paint: 'limb', kind: 'pair', sink: LEG_ROW.sink, at: [0.25, LEG_ROW.y, 0] },

    /* THE HANDS. The hog's tusk mirrored, at its own facing and its own burial —
     * a pure donor transfer with only the join moved onto the chest. It is the
     * nearest thing the bank holds to a claw and it is not one; see the header
     * and the flag. */
    { name: 'claw', part: 'wedge-13', paint: 'claw', kind: 'pair', at: [0.30, 0.62, 0.42] },
  ],

  flag: 'THE SICKLE CLAW IS MISSING AND IT IS A BAKE, NOT A COMMISSION. Section 7 of '
    + 'building-animals-from-parts.md censuses claw at 10 instances and 10 distinct shapes, '
    + 'donors crab, lion, tiger and polar, BAKED: no — and the roles actually in PARTS_BANK are '
    + 'band, card, ear, eye, hull, leg, nose, oddment, tail, tooth and wing. The crab\'s pincer '
    + 'and the big cats\' claws are in GLBs in this repo and the generator has never baked '
    + 'them. animal-lobster.ts priced the same absence for Ocean; this is the second species '
    + 'behind it. THE LINE IS YOURS AND NOT A BUILDER\'S: baking a role RENUMBERS THE WHOLE '
    + 'BANK — adding `wing` on 2 August moved box-31 from the lion\'s hull to its mane band and '
    + 'turned the newt\'s crest into bee wings, and nothing failed to compile. WHAT STANDS IN '
    + 'is wedge-13, the hog\'s tusk, mirrored as a pair of HAND claws on the chest. The '
    + 'placement is measured, not squeamish: a foot claw would have to sit below y = 0.20 to '
    + 'read, and buildAssembly grounds the animal on its LOWEST point, so anything under the '
    + 'feet lifts the legs off the floor and the harness fails it by name. THE SHELL IS THE '
    + 'SEPARATION: box-31, 1.125 deep, the lowest hull that still stands on legs, against four '
    + 'other bipedal theropods in this collection on the cube and on the fox\'s tall shell. Its '
    + 'front face is 0.500 so the eye card floats 0.135 proud instead of 0.010 — the lion\'s '
    + 'own arrangement, see EYE_CARD_Z, not a fault to correct. NEW PALETTE, UNREVIEWED.',
})
