/**
 * The quagga — `animal-zebra` with the stripes STOPPING, which is the whole
 * animal and is a thing this project can say exactly.
 *
 * A quagga is a zebra whose stripes fade out behind the shoulder into a plain
 * brown back end. Almost every marking this project has wanted has been refused
 * for the same reason — colour is a texture lookup with no positional
 * information, so a rosette, a blotch, a tail ring and a net are all impossible
 * — and this is the one case where the missing marking is *absence*. A card that
 * is not placed costs nothing and says exactly the right thing.
 *
 * So the build is `animal-zebra.ts`'s, deliberately and line for line — the
 * fox's shell, the dog's `cone-02` ear, the cat's rope tail spun 180 to hang,
 * the giraffe's muzzle painted dark — with three changes:
 *
 *   - **TWO stripe stations, not four**, and both forward of the hull's centre:
 *     z = 0.375 and 0.125, against the zebra's 0.375 / 0.125 / -0.125 / -0.375.
 *   - **A THIRD, SHORTER pair on the neck** at z = 0.5, because a quagga's head
 *     and neck are more strongly barred than a zebra's, not less.
 *   - **The ground colour is BAY, not chalk.** The zebra's argument is that the
 *     white is the ground and the black is the marking; a quagga's ground is a
 *     warm red-brown and the belly and legs go pale rather than the flanks.
 *
 * `belly` is 7/16 rather than 8/16, which is `animal-wolf.ts`'s derivation on
 * this same shell: `patch` takes its fraction of the hull's OWN height and
 * `box-21`'s 1.505 includes its two fused ear lugs, so 7/16 is the only point on
 * the pack's grid that lands inside §7's measured mammal zone once the ears are
 * out of the arithmetic.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/** `box-21`'s own recorded centre and its crown — the fox's shell is taller. */
const HULL_CENTRE_Y = 0.934
const CROWN_Y = 1.6865
const REAR_PLATE_Z = -0.625

/** The card shell — where the pack puts every flat flank marking, 0.010 proud. */
const CARD_X = 0.635

/** Two stations, BOTH FORWARD of centre. The zebra has four and spans the body. */
const STRIPE_Z = [0.375, 0.125]

/** `animal-zebra.ts`'s cut, unchanged: narrow enough to read as a bar. */
const STRIPE_STRETCH: [number, number, number] = [1, 1.4, 0.18]

export const QUAGGA_ASSEMBLY = defineCreature('animal-quagga', {
  palette: {
    coat: 0x8c5b38,    // UNREVIEWED: bay — the red-brown ground a quagga actually is
    belly: 0xe4d8c2,   // UNREVIEWED: the cream underside, legs and rump, and the sclera
    mark: 0x2b2622,    // UNREVIEWED: the shoulder bars, the muzzle and the tail
    limb: 0xd8ccb6,    // UNREVIEWED: the pale legs — a quagga's are nearly white
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* The fox's shell, taken for its ear lugs as `animal-zebra.ts` takes it. */
  hull: { part: 'box-21' },
  /* 7/16 and NOT the usual 8/16 — `animal-wolf.ts`'s derivation on this shell. */
  belly: 0.4375,

  /* The dog's and the pig's ear, placed inside the crown's own flat reach. */
  ears: { part: 'cone-02', paint: 'coat', at: [0.24, CROWN_Y, 0.15] },

  /* The cat's rope, spun the donkey's 180 so it hangs rather than curls up. */
  tail: {
    part: 'wedge-07',
    paint: 'mark',
    spin: [{ axis: 'z', deg: 180 }],
    at: [0, HULL_CENTRE_Y, REAR_PLATE_Z],
  },

  /* The giraffe's nose and the deer's nose-tip, painted dark: a quagga's face is
   * barred and its muzzle black, exactly as a zebra's is. */
  snout: { part: 'tube-07', paint: 'mark' },
  nose: { part: 'box-14', paint: 'mark' },

  extras: [
    /* TWO flank bars, both forward of centre — the stripes STOP behind them. */
    ...STRIPE_Z.map((z, i) => ({
      name: `stripe-${i}`,
      part: 'plate-11',
      kind: 'pair' as const,
      paint: 'mark',
      stretch: STRIPE_STRETCH,
      at: [CARD_X, 1.0, z] as [number, number, number],
    })),

    /* THE NECK BAR, forward of both and higher: a quagga's head and neck carry
     * the strongest barring on the animal, which is the opposite end of the same
     * fade the two flank bars are the middle of. */
    {
      name: 'stripe-neck',
      part: 'plate-11',
      kind: 'pair' as const,
      paint: 'mark',
      stretch: [1, 1.1, 0.18] as [number, number, number],
      at: [CARD_X, 1.16, 0.5] as [number, number, number],
    },
  ],

  flag: 'THIS IS animal-zebra.ts DELIBERATELY, WITH THE STRIPES STOPPED — and the stopping is '
    + 'the whole animal. Every other marking this project has wanted was refused because colour '
    + 'is a lookup with no positional information; a quagga is the one case where the missing '
    + 'marking is ABSENCE, and a card you do not place costs nothing and says exactly the right '
    + 'thing. THREE THINGS ARE DIFFERENT FROM THE ZEBRA: two flank bars instead of four and '
    + 'both forward of centre, a third shorter bar on the neck where a quagga is barred hardest, '
    + 'and a BAY ground instead of chalk — the zebra\'s file argues that the white is the ground '
    + 'and the black the marking, and on this animal the ground is red-brown and the pale is the '
    + 'belly and legs. THE FADE IS A HARD EDGE HERE AND A SOFT ONE IN LIFE: three cards stop and '
    + 'nothing gradates, because Paint.patch takes one HEIGHT and byBand cuts only where Kenney '
    + 'already cut. THE STRIPE COUNT, WIDTH AND SPACING ARE ONE NUMBER EACH AND ALL THREE ARE '
    + 'YOURS, exactly as animal-zebra.ts says of its own four. NEW PALETTE, UNREVIEWED.',
})
