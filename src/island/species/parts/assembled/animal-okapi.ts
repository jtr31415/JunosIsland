/**
 * The okapi — the giraffe's own muzzle, the zebra's own stripes, and neither of
 * those is a borrowing.
 *
 * It is the animal in this collection that looks most like two other animals at
 * once, and the honest answer is that it IS: an okapi is a giraffid with striped
 * hindquarters, so the parts it shares are shared for the right reason.
 *
 *   - **`tube-07` is the GIRAFFE's own nose-tip**, and `animal-giraffe` is one of
 *     the FROZEN 24 standing in the same album. Taking it is `animal-dingo.ts`'s
 *     argument — *"a dingo IS a dog and inventing a difference would be
 *     inventing"* — applied to the giraffe's only living relative.
 *   - **The stripes are `animal-zebra.ts`'s stretched `plate-11`**, and the two
 *     separations from that animal are the COUNT and the PLACE: four a side
 *     along the whole flank there, **two a side on the RUMP** here, which is
 *     where an okapi's are and where a zebra's are not.
 *   - **The legs are two-tone at 6/16** — JT-044's foot patch spent on white
 *     stockings rather than on hooves, which is the other half of the marking.
 *   - **The OSSICONES are `cone-01` leaned back 25 degrees.** The pack's own
 *     giraffe has its ossicones fused into its hull and they cannot be lifted;
 *     `cone-01` is the bee's and caterpillar's ear, taper 0, and at its own 0.312
 *     burial it stands 0.2755 clear. Leaning them back is what stops them
 *     reading as a second pair of ears beside the real ones.
 *
 * The ears are `box-06`, the biggest in the bank, cut to 0.65 — large, held wide
 * and mobile, which is the first thing anybody notices about a live okapi and is
 * inside the 2.97x §3 measured the pack's own ears varying by.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/** `box-03`'s flat crown, and the pack's own card shell 0.010 proud of its side. */
const CROWN_Y = 1.43125
const CARD_X = 0.635

/** Two stations on the RUMP, on the pack's 1/16 grid — not four on the flank. */
const STRIPE_Z = [-0.25, -0.4375]

/** The zebra's bar, one notch wider and one shorter: an okapi's stripes are bolder. */
const STRIPE_STRETCH: [number, number, number] = [1, 1.3, 0.20]

export const OKAPI_ASSEMBLY = defineCreature('animal-okapi', {
  palette: {
    coat: 0x5b3524,    // UNREVIEWED: the dark chocolate of the body
    pale: 0xf0e6d2,    // UNREVIEWED: the white stripes and stockings, and the sclera
    limb: 0x6d4029,    // UNREVIEWED: the legs above the stockings
    horn: 0x4a2c1d,    // UNREVIEWED: the ossicones
    mark: 0x241813,    // UNREVIEWED: the nose
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  hull: { part: 'box-03', paint: 'coat' },

  /* No painted belly line. An okapi's underside is the same chocolate as its
   * back and the pale is spent entirely on the stripes and the stockings, so
   * `under` is named for the sclera and nothing else. */
  under: 'pale',

  /* JT-044's two-tone foot at 6/16 rather than 4/16 — an okapi's white does not
   * stop at the hoof, it runs a third of the way up the leg. animal-chicken.ts
   * derived the grid: 3/16 lands inside box-01's own bevel and follows a sloping
   * face, and every notch above 4/16 is on the straight shank. */
  legs: { x: 0.32, z: 0.34, paint: { base: 'limb', patch: { below: 'pale', at: 0.375 } } },

  /* The bank's biggest ear cut to 0.65: large, held wide, and the first thing
   * anybody notices about a live okapi. Inside §3's measured 2.97x. */
  ears: { part: 'box-06', paint: 'coat', stretch: [1, 0.65, 1], at: [0.32, CROWN_Y, 0.30] },

  /* The giraffe's own nose-tip, on the giraffe's only living relative. */
  snout: { part: 'tube-07', paint: 'coat' },
  nose: { part: 'box-14', paint: 'mark' },

  /* The tiger's whip, hanging from the rump. An okapi's tail is a thin rope with
   * a tuft, and this is the thinnest long tail in the bank at 0.200 across. */
  tail: { part: 'wedge-18', paint: 'coat', at: [0, 0.90, -0.625] },

  extras: [
    /* THE OSSICONES, leaned back 25 degrees so they do not read as a second pair
     * of ears. An explicit `at` is required and not optional: a spun part faces
     * a diagonal, and the builder refuses to guess which hull face to join a
     * diagonal to rather than letting one float. */
    {
      name: 'ossicone',
      part: 'cone-01',
      paint: 'horn',
      kind: 'pair' as const,
      spin: [{ axis: 'x' as const, deg: -25 }],
      at: [0.14, CROWN_Y, 0.06] as [number, number, number],
    },

    /* THE RUMP STRIPES. animal-zebra.ts's mechanism at a different count and a
     * different place — two a side at the back rather than four along the whole
     * flank, on the pack's own card shell. */
    ...STRIPE_Z.map((z, i) => ({
      name: `stripe-${i}`,
      part: 'plate-11',
      kind: 'pair' as const,
      paint: 'pale',
      stretch: STRIPE_STRETCH,
      at: [CARD_X, 0.95, z] as [number, number, number],
    })),
  ],

  flag: 'THE STRIPES ARE animal-zebra.ts\'s STRETCHED MARKING CARD AND THE SAME RULE IS '
    + 'STRAINED. plate-11 — the cow\'s, dog\'s and giraffe\'s own flank patch — cut to 0.20 of '
    + 'its own length and 1.3x its height, on the pack\'s card shell at x 0.635. §3 sanctions '
    + 'a stretch on an EAR or a SNOUT (the pack\'s own vary 2.90x) and a marking card is '
    + 'neither, so the count, the width and the spacing are one number each and all three are '
    + 'yours. THE SEPARATION FROM THE ZEBRA IS THE COUNT AND THE PLACE: four a side along the '
    + 'whole flank there, TWO a side on the RUMP here, which is where an okapi\'s actually '
    + 'are. TWO PARTS ARE SHARED WITH FROZEN ANIMALS ON PURPOSE — tube-07 is the GIRAFFE\'s '
    + 'own nose-tip and this is the giraffe\'s only living relative, which is animal-dingo.ts\'s '
    + 'argument ("a dingo IS a dog and inventing a difference would be inventing") applied to a '
    + 'giraffid. THE OSSICONES cannot be lifted from the giraffe: the pack fuses them into its '
    + 'hull, so what is here is cone-01, the bee\'s ear, leaned back 25 degrees to stop it '
    + 'reading as a second pair of ears — and 25 is the dial. NEW PALETTE, UNREVIEWED.',
})
