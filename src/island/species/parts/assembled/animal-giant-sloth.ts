/**
 * The giant ground sloth — `animal-sloth` turned inside out: no face mask, no
 * hanging, and the claws made the loudest thing on the animal.
 *
 * `animal-sloth.ts` is a tree sloth and its whole design is a flat pale disc of
 * a face (`blade-05` on the lion's shallow shell) with two small hooks. A
 * *Megatherium* is the opposite animal at fifteen times the size: a deep barrel
 * body, a proper cervid-length muzzle, a heavy dragging tail, and front claws a
 * child would draw first. So:
 *
 *   - **NO MASK.** The face is the hull's own front plate with the deer's
 *     `tube-03` on it, which is the plainest muzzle in the bank and the one no
 *     xenarthran here wears. That single swap is most of the separation from the
 *     tree sloth, from `animal-anteater` and from `animal-pangolin`.
 *   - **THE CLAWS ARE TWO PAIRS AT TWO ANGLES**, which is `animal-elk.ts`'s
 *     antler trick used on a limb: `wedge-11` driven forward and down out of the
 *     lower chest, and `wedge-13` a shade below it and steeper. Their lowest
 *     point is y 0.16 and that is checked — the model grounds on its lowest
 *     point, so a longer claw lifts the feet rather than reaching further.
 *   - **THE COAT IS A ROW, NOT A RING.** Four `cone-01` on the TOP row only —
 *     `animal-warthog.ts`'s bristle idiom, and the second animal in this
 *     collection that must NOT read as round, because the chamfer rows are what
 *     make a back curve and a ground sloth's is a straight heavy ridge.
 *   - **THE TAIL IS THE BEAVER'S PADDLE**, `wedge-03`, the thickest tail in the
 *     bank at 0.726 across. A ground sloth's tail is a prop it sits on, and the
 *     paddle is the only shape here with that much bulk at the root.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/** Where a claw roots into the lower chest, and the height is the grounding check. */
const CLAW_Y = 0.5
const CLAW_Z = 0.58

export const GIANT_SLOTH_ASSEMBLY = defineCreature('animal-giant-sloth', {
  palette: {
    coat: 0x8a6f4e,    // UNREVIEWED: coarse reddish-brown shag
    pale: 0xd6c2a0,    // UNREVIEWED: the muzzle and the sclera — there is no belly line
    mane: 0x5e4830,    // UNREVIEWED: the dorsal bristles and the tail
    claw: 0x3c332a,    // UNREVIEWED: the four claws, horn-dark
    limb: 0x6f5940,    // UNREVIEWED: the heavy legs, a shade under the coat
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* The fish's plain 1.250 cube — one band, no lugs, nothing fused on. A ground
   * sloth is a barrel and the plainest shell in the bank is the honest one. */
  hull: { part: 'box-20', paint: 'coat' },
  /* No belly line: a ground sloth is one colour all over, so the pale slot is
   * the MUZZLE and the sclera. */
  under: 'pale',

  /* Wide and short — the animal walked on the sides of its feet. */
  legs: { x: 0.36, z: 0.30 },

  /* The deer's own muzzle, which no xenarthran here wears: 0.532 across and
   * 0.231 through, by pure donor transfer onto this hull's own front face. */
  snout: { part: 'tube-03', paint: 'pale' },
  nose: { part: 'box-14', paint: 'claw' },

  /* The beaver's paddle, the thickest tail in the bank at 0.726 across, by pure
   * donor transfer. A ground sloth props itself on its tail. */
  tail: { part: 'wedge-03', paint: 'mane' },

  /* THE SHAG, one row down the spine. `rows: ['top']` and not the default three,
   * because the chamfer rows are the idiom that makes a cubic back read ROUND
   * and this animal's back must not. */
  ridge: { part: 'cone-01', paint: 'mane', name: 'bristle', count: 4, rows: ['top'] },

  extras: [
    /* THE CLAWS, forward and down out of the lower chest. */
    {
      name: 'claw',
      part: 'wedge-11',
      paint: 'claw',
      kind: 'pair',
      stretch: [1, 1, 1.5],
      spin: [{ axis: 'x', deg: 35 }],
      at: [0.34, CLAW_Y, CLAW_Z],
    },

    /* THE SECOND CLAW, below and steeper — one shape, two angles, which is what
     * makes a hand out of a bank with no claw baked into it. */
    {
      name: 'claw-inner',
      part: 'wedge-13',
      paint: 'claw',
      kind: 'pair',
      stretch: [1, 1, 1.5],
      spin: [{ axis: 'x', deg: 55 }],
      at: [0.19, CLAW_Y - 0.04, CLAW_Z],
    },
  ],

  flag: 'THE POSE IS MISSING AND IT IS THE ANIMAL. A Megatherium rears on its hind legs and '
    + 'props on its tail; the leg row is four copies of ONE shape at ONE absolute height and a '
    + 'hull carries no rotation, so no species in this project stands up — '
    + 'animal-kangaroo.ts prices that in full as a LONG HIND LEG plus a hull that can be tilted, '
    + 'and this animal adds itself to both tallies. It walked on four limbs too, so the '
    + 'quadruped read is not a lie, only the smaller half of the truth. THE CLAWS ARE NOT CLAWS: '
    + 'the `claw` role has ten distinct shapes censused in docs §7 and has NEVER BEEN BAKED into '
    + 'the bank, so these are wedge-11 and wedge-13 — the elephant\'s and the hog\'s teeth — '
    + 'driven out of the chest at two angles, which is animal-elk.ts\'s two-angles-one-shape '
    + 'trick used on a limb. Their lowest point is y 0.16 and that is a checked number: the '
    + 'model grounds on its lowest point, so a longer claw lifts the feet off the floor instead '
    + 'of reaching further. THE SEPARATION FROM animal-sloth IS THE FACE: that animal is '
    + 'blade-05, a flat pale disc on the lion\'s shallow shell, and this one has no mask at all '
    + 'and wears the DEER\'s muzzle, which no other xenarthran here does. NEW PALETTE, UNREVIEWED.',
})
