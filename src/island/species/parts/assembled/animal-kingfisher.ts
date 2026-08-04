/**
 * The kingfisher — a dagger, a chestnut front, and almost no tail.
 *
 * **Read `animal-robin.ts` first.** Hull, legs, eyes and wing come from it
 * unchanged. What a kingfisher needs beyond that is three things and the bank
 * gives two of them cleanly:
 *
 *   - **The bill is TWO-TONE from Kenney's own cut.** `cone-06` arrives split
 *     into band 15, the upper mandible, and band 13, the lower — measured in
 *     `animal-canary.ts`, which found the upper standing 0.0419 proud of the
 *     lower. A female kingfisher's lower mandible is orange under a black upper,
 *     and that is one `byBand` entry and no geometry.
 *   - **Band 3 goes chestnut**, which is a kingfisher's front exactly: the
 *     forward-facing band the robin paints red, in the other warm colour.
 *   - **The tail is `box-18`, the bank's only stub**, at the rear plate's own
 *     centre. A kingfisher's tail is the shortest of any bird on this page and
 *     the stub is the shortest thing there is.
 *
 * What it does NOT get is the length of the bill, and that is the flag.
 */
import { defineCreature } from '../creature'
import { LEG_ROW } from '../hulls'
import { PACK_PUPIL } from '../texture'

/** The rear plate's own centre — see `animal-robin.ts`. */
const REAR_PLATE_Y = 0.80625
const REAR_PLATE_Z = -0.625

export const KINGFISHER_ASSEMBLY = defineCreature('animal-kingfisher', {
  palette: {
    coat: 0x1f7fb8,
    breast: 0xc4712c,
    flight: 0x14608f,
    bill: 0x1d1a18,
    lower: 0xd4762a,
    limb: 0xc4453a,
    eye: 0x120f0d,
    pupil: PACK_PUPIL,
  },

  /* The forward band, in chestnut. */
  hull: { part: 'box-39', paint: { base: 'coat', byBand: { 3: 'breast' } } },

  eyes: { part: 'plate-08', paint: 'eye' },

  /* THE TWO-TONE DAGGER. Band 15 is the upper mandible and band 13 the lower —
   * Kenney\'s own cut, measured in `animal-canary.ts` — so a black bill with an
   * orange lower half costs one entry. */
  snout: { part: 'cone-06', paint: { base: 'bill', byBand: { 13: 'lower' } } },

  /* The bank\'s only stub, and a kingfisher has the shortest tail here. */
  tail: {
    part: 'box-18',
    paint: 'flight',
    spin: [{ axis: 'y', deg: 180 }],
    at: [0, REAR_PLATE_Y, REAR_PLATE_Z],
  },

  legs: false,
  extras: [
    {
      name: 'leg-front',
      part: 'box-01',
      paint: 'limb',
      kind: 'pair',
      sink: LEG_ROW.sink,
      at: [0.25, LEG_ROW.y, 0],
    },

    {
      name: 'wing',
      part: 'wedge-19',
      paint: 'flight',
      kind: 'pair',
    },
  ],

  flag: 'THE BILL IS THE ANIMAL AND IT IS THE ONE THING THIS BANK CANNOT MAKE LONG ENOUGH. A '
    + 'kingfisher\'s dagger is about as long as the rest of its head; cone-06 is the pack\'s only '
    + 'true point (taper 0, the one shape of 28 noses with form "cone") and it reaches 0.183. '
    + 'There is nothing longer in the bank, stretching a nose is exactly what you flagged on 2 '
    + 'August, and §5 says we do not invent the missing parts — so the SHAPE is right and the '
    + 'PROPORTION is not, said plainly rather than hidden. If a long spear is worth '
    + 'commissioning, this is the species that would spend it, and the heron and the stork are '
    + 'behind it in the queue. WHAT DID LAND is Kenney\'s own two-tone cut on that bill: band 15 '
    + 'is the upper mandible and band 13 the lower (animal-canary.ts measured the upper standing '
    + '0.0419 proud), so a black bill with an orange lower half is one byBand entry and no '
    + 'geometry — and it is real anatomy, not decoration. THE CHESTNUT FRONT is box-39\'s own '
    + 'forward band, the one animal-robin.ts paints red. THE ELECTRIC BLUE BACK STRIPE, which is '
    + 'the other thing a child would name this bird by, is NOT here: it runs front to back along '
    + 'the spine, Paint.patch paints one level line with no z term, and the hull\'s two bands are '
    + 'spent. NEW PALETTE, UNREVIEWED, and it is the most saturated in the project — a real '
    + 'kingfisher is that bright, but it will read hot beside a robin.',
})
