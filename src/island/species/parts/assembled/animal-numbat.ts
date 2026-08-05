/**
 * The numbat — the squirrel's carried tail on a striped animal.
 *
 * A numbat is two things at once and both are sayable here, which is why it is
 * built rather than priced:
 *
 *   - **THE TAIL IS HELD UP.** `chamfer: true` is the builder idiom that solves
 *     the rear-top chamfer midpoint AND the 45-degree turn onto its own normal
 *     together (`creature.ts`), and it is what makes a squirrel out of the fox's
 *     tail. A numbat's bottlebrush is carried erect over its back exactly like a
 *     squirrel's, so this is the idiom doing the job it was built for on the
 *     shape it was built with — `box-23`, the fox's brush, which barely narrows
 *     (taper 0.961), has a ROUND section (y and z both 0.910) and is 1.67x the
 *     volume of any other thick tail.
 *   - **THE STRIPES ARE `plate-10`, six of them**, which is `animal-zebra.ts`'s
 *     mechanism — flank marking cards, zero thickness, at the pack's own card
 *     plane — but at the shape's OWN size rather than stretched. A numbat's
 *     white bars run across the RUMP and stop, so three pairs at 2/16 spacing
 *     from z = -0.125 back to z = -0.375 is anatomically where they go, and it
 *     means nothing is cut or stretched. The zebra's are, and its flag says so.
 *
 * The face is `tube-07`, the giraffe's nose-tip and the longest muzzle in the
 * bank, at its own 0.376 burial so it grows out of the head; and the ears are
 * `wedge-04`, the chick's and monkey's — small, pointed, upright.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/** `box-03`'s own side face plus the pack's own card standoff of 0.010. */
const CARD_X = 0.635

/** The stripes' height: the hull's own centre, where a numbat's bars cross. */
const STRIPE_Y = 0.90625

export const NUMBAT_ASSEMBLY = defineCreature('animal-numbat', {
  palette: {
    coat: 0xb4652f,    // UNREVIEWED: the rufous back and shoulders
    belly: 0xe6d3b4,   // UNREVIEWED: the cream underside, and the sclera
    stripe: 0xf4efe4,  // UNREVIEWED: the white rump bars
    mark: 0x2f2823,    // UNREVIEWED: the nose and the eye stripe that is not there
    limb: 0x9c5628,    // UNREVIEWED: the legs and the muzzle, a shade under
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* The builder's default cube. */
  hull: { part: 'box-03', paint: 'coat' },

  /* 8/16 — the tiger's mammal line made exact, and this cube's own equator. */
  belly: 0.5,

  /* Low and close. A numbat runs with its body near the ground. */
  legs: { x: 0.3125, z: 0.3125 },

  /* The chick's and monkey's ear: small, pointed and upright, and a third the
   * height of the bilby's `box-06` beside it in this collection. */
  ears: { part: 'wedge-04', paint: 'coat' },

  /* The longest muzzle in the bank, at its own burial so it grows out of the
   * face — a numbat's is a long tapering probe for a termite gallery. */
  snout: { part: 'tube-07', paint: 'limb' },

  nose: { part: 'box-09', paint: 'mark', on: 'snout' },

  /* THE BOTTLEBRUSH, CARRIED. `chamfer: true` solves the rear-top chamfer
   * midpoint and the 45-degree turn onto its normal together; giving one by hand
   * and not the other is how a tail floats. The squirrel's own placement. */
  tail: { part: 'box-23', paint: 'coat', chamfer: true },

  extras: [
    /* THE RUMP BARS. Three mirrored pairs of the pack's own flank marking card,
     * at its own size, 2/16 apart across the rear half of the body. Nothing is
     * stretched — which is what separates this from the zebra's eight. */
    { name: 'bar-1', part: 'plate-10', paint: 'stripe', kind: 'pair', at: [CARD_X, STRIPE_Y, -0.125] },
    { name: 'bar-2', part: 'plate-10', paint: 'stripe', kind: 'pair', at: [CARD_X, STRIPE_Y, -0.25] },
    { name: 'bar-3', part: 'plate-10', paint: 'stripe', kind: 'pair', at: [CARD_X, STRIPE_Y, -0.375] },
  ],

  flag: 'NEW PALETTE, UNREVIEWED — the first numbat ever built. THE TAIL IS THE SQUIRREL\'S '
    + 'PLACEMENT ON THE SQUIRREL\'S SHAPE and it is the idiom doing exactly the job it was '
    + 'built for: chamfer: true solves the rear-top chamfer midpoint and the 45-degree turn '
    + 'onto its normal together, and a numbat carries its bottlebrush erect over its back the '
    + 'way a squirrel does. box-23 is the fox\'s brush — taper 0.961, a ROUND section at 0.910 '
    + 'on both axes, 1.67x the volume of any other thick tail in the bank. THE STRIPES ARE SIX '
    + 'FLANK CARDS AT THEIR OWN SIZE, three mirrored pairs of plate-10 across the rear half of '
    + 'the body at 2/16 spacing. That is animal-zebra.ts\'s mechanism WITHOUT its stretch: a '
    + 'zebra needs eight cards cut to 0.18 of their length and flags it, and a numbat\'s bars '
    + 'are short, few and confined to the rump, so the pack\'s own card is already the right '
    + 'size. WHAT IS NOT HERE is the black-and-white eye stripe, which is the third thing a '
    + 'guide names: it runs front-to-back along the FACE and Paint.patch paints one level line '
    + 'with no z term, so it is unsayable — the same wall animal-cockatiel.ts hit on its yellow '
    + 'face and animal-kingfisher.ts on its blue back stripe.',
})
