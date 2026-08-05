/**
 * The zebra — the stripes are the animal, and the stripes are the strained part.
 *
 * Four equids are already built and none of them is on `box-21`, the fox's
 * TALLER shell: the horse and the mule are `box-41`, the pony and the donkey the
 * plain cube. So the silhouette separation is the shell — a zebra is the tall,
 * long-legged one — and everything else is the pattern.
 *
 * **THE STRIPES ARE `plate-11` CUT NARROW.** That is the cow's, the dog's and
 * the giraffe's own FLANK MARKING CARD, four to a side on the pack's own card
 * shell x = 0.635, stretched 1.4x tall and to 0.18 of its own length so it reads
 * as a bar rather than a patch. Ten triangles a copy is why: `bespoke-square-01`,
 * the donkey's dorsal stripe, is 60 a copy, and eight of those is 480 triangles —
 * half this animal's whole budget for one marking.
 *
 * **The 0.18 is the flagged number.** §3 sanctions a stretch on an EAR or a
 * SNOUT and measured the pack's own varying 2.90x; a marking card is neither,
 * and this is a narrowing rather than an enlargement. Four, wider, fewer or none
 * is one number each — see the flag.
 *
 * The tail is `wedge-07` hung the donkey's way. A zebra's and a wildebeest's
 * tails are the same long dark switch, and `animal-wildebeest.ts` wears the same
 * shape rather than inventing a difference between two animals that share it.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/** `box-21`'s own recorded centre (0.934) and its crown. The fox's shell is taller. */
const HULL_CENTRE_Y = 0.934
const CROWN_Y = 1.6865
const REAR_PLATE_Z = -0.625

/** The card shell — where the pack puts every flat flank marking, 0.010 proud. */
const CARD_X = 0.635

/** Four stations along the flank, on the pack's 1/16 grid, 4/16 apart. */
const STRIPE_Z = [0.375, 0.125, -0.125, -0.375]

/** Narrow enough to read as a bar. See the header for why this is the flag. */
const STRIPE_STRETCH: [number, number, number] = [1, 1.4, 0.18]

export const ZEBRA_ASSEMBLY = defineCreature('animal-zebra', {
  palette: {
    coat: 0xf0ead8,    // UNREVIEWED: chalk white — the ground the stripes sit on
    belly: 0xfaf6ec,   // UNREVIEWED: the paler underside, and the sclera
    mark: 0x2d2a26,    // UNREVIEWED: the stripes, the mane muzzle and the tail
    limb: 0x3a352f,    // UNREVIEWED: the dark lower leg
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  hull: { part: 'box-21' },
  belly: 0.4375,

  /* The dog's and the pig's ear, which no built equid wears — the horse and the
   * pony take `cone-01` and the donkey and the mule `box-06`. Placed inside the
   * crown's own flat reach rather than at the shape's recorded z. */
  ears: { part: 'cone-02', paint: 'coat', at: [0.24, CROWN_Y, 0.15] },

  /* The cat's rope, spun the donkey's 180 so it hangs rather than curls up, and
   * painted dark entire: a zebra's tail is black from the hock down. */
  tail: {
    part: 'wedge-07',
    paint: 'mark',
    spin: [{ axis: 'z', deg: 180 }],
    at: [0, HULL_CENTRE_Y, REAR_PLATE_Z],
  },

  /* The giraffe's nose, by pure donor transfer, painted dark — a zebra's muzzle
   * is a black snip and it is the one marking on the face. */
  snout: { part: 'tube-07', paint: 'mark' },
  nose: { part: 'box-14', paint: 'mark' },

  extras: STRIPE_Z.map((z, i) => ({
    name: `stripe-${i}`,
    part: 'plate-11',
    kind: 'pair' as const,
    paint: 'mark',
    stretch: STRIPE_STRETCH,
    at: [CARD_X, 1.0, z] as [number, number, number],
  })),

  flag: 'THE STRIPES ARE A STRETCHED MARKING CARD AND THAT IS THE ONE THING TO RULE ON. '
    + 'The bank has no stripe: eight copies of plate-11 — the cow\'s, dog\'s and giraffe\'s '
    + 'own flank patch — cut to 0.18 of their own length and 1.4x their height, four a side '
    + 'on the pack\'s card shell at x 0.635. Ten triangles each is the whole reason: '
    + 'bespoke-square-01, which animal-donkey.ts wears as a dorsal stripe, is 60 a copy and '
    + 'eight would be 480 triangles for one marking. RULE 1 SANCTIONS A STRETCH ON AN EAR OR '
    + 'A SNOUT (the pack\'s own vary 2.90x) AND A MARKING CARD IS NEITHER, so this is the '
    + 'flag: the count, the width and the spacing are one number each and all four are yours. '
    + 'A zebra without stripes is a brown horse, which is why the strain was taken rather '
    + 'than the animal refused. NEW PALETTE, UNREVIEWED.',
})
