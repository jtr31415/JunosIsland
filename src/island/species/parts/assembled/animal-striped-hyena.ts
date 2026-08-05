/**
 * The striped hyena — built against `animal-hyena`, which is the spotted one,
 * and every separation is a different part rather than a different number.
 *
 * ONE SPECIES, ONE FILE. `register.ts` says why the one appended line in
 * `index.ts` is the whole of the wiring.
 *
 * Four things, and Africa's animal holds the opposite of each:
 *
 *   - **THE SHELL.** `box-03`, the plain cube, against that animal's `box-12`,
 *     the widest in the pack. A striped hyena is half the weight of a spotted
 *     one and this is the only way the pack can say so.
 *   - **THE EAR.** `box-06`, the bank's TALLEST at 0.913 and pointed, against
 *     `box-25`, the koala's dish, which is the bank's widest at 0.743 and round.
 *     Those are the two extremes of the ear bank and they are on the two hyenas.
 *   - **THE CREST.** Six `cone-01` standing along the spine — the tallest thing
 *     on the animal, which is what an erect dorsal mane is. The spotted hyena
 *     carries `bespoke-square-01` flat along its back at 0.06 tall; these stand
 *     0.28 clear.
 *   - **THE STRIPES.** `animal-zebra.ts`'s idiom, and its flag applies here
 *     unchanged: `plate-11` cut narrow, five pairs on the pack's own card shell.
 *     The bank has no stripe and this is the honest approximation, not a shape.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/** The flat crown of the 1.250 cube, and `HEIGHT_FLOOR`. */
const CROWN_Y = 1.43125
/** The card shell — where the pack puts every flat flank marking, 0.010 proud. */
const CARD_X = 0.635

/**
 * Six stations along the spine on the pack's own 1/16 grid, 2/16 apart. The
 * outermost is 0.3125, which is exactly how far `box-03`'s flat crown reaches
 * before its chamfer starts falling away, so every root lands on the flat.
 */
const CREST_Z = [0.3125, 0.1875, 0.0625, -0.0625, -0.1875, -0.3125]

/** Five stations along the flank, 3/16 apart, centred on the body. */
const STRIPE_Z = [0.375, 0.1875, 0, -0.1875, -0.375]

/** `animal-zebra.ts`'s cut, one step wider — a hyena's bars are broader. */
const STRIPE_STRETCH: [number, number, number] = [1, 1.3, 0.22]

export const STRIPED_HYENA_ASSEMBLY = defineCreature('animal-striped-hyena', {
  palette: {
    coat: 0xc9b98e,    // UNREVIEWED: pale straw, much lighter than the spotted hyena's buff
    pale: 0xeee4cc,    // UNREVIEWED: the sclera — there is no belly line
    mark: 0x2a241d,    // UNREVIEWED: the stripes, the crest, the muzzle and the tail
    limb: 0xb0a077,    // UNREVIEWED: the legs above the dark bars
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* The plain cube. No belly line — a striped hyena is one straw colour with
   * bars on it — so the pale slot is named for the sclera. */
  hull: { part: 'box-03' },
  under: 'pale',

  /* Long in front, short behind, which is the family's stance. */
  legs: { x: 0.27, z: 0.27, paint: { base: 'limb', patch: { below: 'mark', at: 0.375 } } },

  /* THE BANK'S TALLEST EAR, by pure donor transfer — the bunny's own station on
   * the bunny's own cube. Against `animal-hyena`'s round koala dish. */
  ears: { part: 'box-06', paint: 'coat' },

  /* The deer's nose, the longest plain tube in the bank, and the polar bear's
   * big black nose on the end of it. Africa's hyena wears the giraffe's heavier
   * `tube-07`, so the two muzzles are different shapes as well as different
   * lengths. */
  snout: { part: 'tube-03', paint: 'coat' },
  nose: { part: 'box-40', paint: 'mark' },

  /* THE FOX'S BRUSH. A striped hyena's tail is a long shaggy plume and `box-23`
   * is the only plume in the bank; Africa's hyena wears the parrot's short fan.
   * `animal-wolf.ts` refused this shape because a grey canid wearing the fox's
   * own tail IS a fox — that warning is about where an identity travels, and a
   * crested striped scavenger is not somewhere it travels to. */
  tail: { part: 'box-23', paint: 'mark' },

  extras: [
    /* THE CREST. Six spikes on the flat crown, each showing 0.28 of a 0.400
     * shape stretched 1.7 tall. `cone-01` is the bank's only taper-0.000 shape —
     * it ends in a point, which is what standing hair does. */
    ...CREST_Z.map((z, i) => ({
      name: `crest-${i}`,
      part: 'cone-01',
      paint: 'mark',
      stretch: [1.1, 1.7, 1.2] as [number, number, number],
      sink: 0.3,
      at: [0, CROWN_Y, z] as [number, number, number],
    })),

    /* THE STRIPES — `animal-zebra.ts`'s cards, and its flag applies unchanged. */
    ...STRIPE_Z.map((z, i) => ({
      name: `stripe-${i}`,
      part: 'plate-11',
      kind: 'pair' as const,
      paint: 'mark',
      stretch: STRIPE_STRETCH,
      at: [CARD_X, 0.85, z] as [number, number, number],
    })),
  ],

  motion: [{ kind: 'twitch', parts: ['ear'] }],

  flag: 'THE STRIPES ARE A STRETCHED MARKING CARD, exactly as animal-zebra.ts flagged it: the '
    + 'bank has no stripe, so five pairs of plate-11 — the cow\'s, dog\'s and giraffe\'s own '
    + 'flank patch — are cut to 0.22 of their length on the pack\'s card shell at x 0.635. Rule '
    + '1 sanctions a stretch on an EAR or a SNOUT (the pack\'s own vary 2.90x) and a marking '
    + 'card is neither, so the count, the width and the spacing are one number each and all '
    + 'three are yours. THE CREST IS THE OTHER THING TO LOOK AT: six cone-01 stretched 1.7 tall '
    + 'and sunk 0.3, showing about 0.28 each, standing on the flat crown at 2/16 spacing. It is '
    + 'the tallest thing on the animal, which is right — a striped hyena raises its mane and '
    + 'looks twice its size — but six discrete spikes is a row of quills where the real thing '
    + 'is a continuous ridge of hair, and the honest alternative would be one taller '
    + 'bespoke-square-01 bar (which is what animal-hyena.ts wears flat). REPEATED SHAPES, ALL '
    + 'STATED: box-06 is the hare\'s and the kangaroo\'s ear, and box-23 is the FOX\'s brush, '
    + 'which animal-wolf.ts refused by name for a grey canid — taken here because a striped '
    + 'hyena\'s tail really is a long plume and box-23 is the only one in the bank. NEW '
    + 'PALETTE, UNREVIEWED.',
})
