/**
 * The tree kangaroo — the macropod that is NOT held up by the long hind leg, and
 * that is the most useful thing in this file.
 *
 * `animal-kangaroo.ts` is a PLACEHOLDER for three measured reasons, and
 * `animal-quokka`, `animal-emu` and `animal-ostrich` all wait on the first of
 * them. Every one of the three is checked here and every one turns out not to
 * apply:
 *
 *   1. **"A kangaroo is two thirds hind leg."** A tree kangaroo is not. It is the
 *      one macropod that reverted to climbing: its forelimbs and hind limbs are
 *      close to the same length, it walks on all four, and it cannot hop the way
 *      its ground cousins do. `box-01` at one absolute row height on four
 *      stations is therefore the RIGHT answer here, not a compromise.
 *   2. **"The hull cannot be stood up."** A tree kangaroo's trunk is horizontal.
 *      It does not want standing up.
 *   3. **"The tail is a third leg."** A ground kangaroo rests as a tripod; a tree
 *      kangaroo's tail is a long free counterweight it never bears weight on.
 *      `wedge-07` — the cat's and monkey's rope, 1.0466 of reach on a 0.200
 *      section, the thinnest long tail in the bank — trailing off the rear plate
 *      is exactly that.
 *
 * So **the commission that would finish the kangaroo, the quokka, the emu and the
 * ostrich buys this animal nothing**, and that is worth recording where the next
 * builder pricing it will read it.
 *
 * The rest is short. `box-34`, the panda's small round ear, by a pure donor
 * transfer that recovers its own recorded 1.34375. `tube-01`, the beaver's short
 * barrel, painted pale for the golden face. The belly at 8/16, the tiger's own
 * mammal line made exact.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/** `box-03`'s rear plate — its own centre, where a trailing tail roots. */
const REAR_PLATE_Y = 0.80625
const REAR_PLATE_Z = -0.625

export const TREE_KANGAROO_ASSEMBLY = defineCreature('animal-tree-kangaroo', {
  palette: {
    coat: 0x8a5a33,    // UNREVIEWED: the chestnut back of a Goodfellow's tree kangaroo
    belly: 0xe0c073,   // UNREVIEWED: the golden underside and face, and the sclera
    mark: 0x2e231a,    // UNREVIEWED: the nose
    limb: 0x6d4526,    // UNREVIEWED: the short heavy limbs
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  hull: { part: 'box-03', paint: 'coat' },

  /* 8/16 — the tiger's mammal line made exact, and this cube's own equator. */
  belly: 0.5,

  /* SHORT AND COMPACT, on all four. A tree kangaroo's limbs are close to equal
   * and it is a stocky climber rather than a runner, so the wheelbase comes in
   * rather than out — the opposite dial from every long-legged animal here. */
  legs: { x: 0.29, z: 0.28, paint: 'limb' },

  /* The panda's small round ear, at its own recorded station: joined at this
   * hull's crown y = 1.43125 and sunk its own 0.777778, its centre lands on
   * 1.343750, the bank's recorded offset, recovered rather than copied. */
  ears: { part: 'box-34', paint: 'coat' },

  /* The beaver's short barrel — the small end of the muzzle family at 0.312
   * against the fox's 0.532 — painted from the golden slot. A tree kangaroo's
   * face is short and blunt where a ground kangaroo's is long. */
  snout: { part: 'tube-01', paint: 'belly' },
  nose: { part: 'box-09', paint: 'mark' },

  /* THE COUNTERWEIGHT. The thinnest long tail in the bank — 0.200 across on
   * 1.0466 of reach — trailing off the rear plate's own centre. It is a
   * balancing pole and never a prop, which is the whole difference from
   * animal-kangaroo.ts's beaver paddle hung low as a tripod leg. */
  tail: { part: 'wedge-07', paint: 'coat', at: [0, REAR_PLATE_Y, REAR_PLATE_Z] },

  flag: 'THIS IS THE MACROPOD THAT IS NOT A PLACEHOLDER, and the reason is worth more than '
    + 'the animal. animal-kangaroo.ts is held up by three measured things and every one of '
    + 'them fails to apply here. (1) "A kangaroo is two thirds hind leg" — a tree kangaroo is '
    + 'the one macropod that went back up the trees, its fore and hind limbs are close to the '
    + 'same length, it walks on all four and it cannot hop like its ground cousins, so four '
    + 'box-01 on the pack\'s own row is the RIGHT answer and not a compromise. (2) "The hull '
    + 'cannot be stood up" — this animal\'s trunk is horizontal and does not want standing up. '
    + '(3) "The tail is a third leg" — a ground kangaroo rests as a tripod, and a tree '
    + 'kangaroo\'s tail is a long free counterweight it never bears weight on, which wedge-07 '
    + 'trailing off the rear plate is exactly. SO THE LONG HIND LEG COMMISSION — the one '
    + 'animal-kangaroo, animal-quokka, animal-emu and animal-ostrich all wait on — BUYS THIS '
    + 'ANIMAL NOTHING, and that is recorded here so whoever prices it knows the count is four '
    + 'and not five. WHAT IS MISSING is the GRIP: a tree kangaroo\'s hands and feet carry long '
    + 'curved claws and roughened soles, and box-01 is a plain stub with no claw shape in the '
    + 'bank baked at all (the `claw` role occurs zero times). Nothing here is stretched. '
    + 'NEW PALETTE, UNREVIEWED.',
})
