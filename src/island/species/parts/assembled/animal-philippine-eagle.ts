/**
 * The Philippine eagle — the shaggy crest is a RIDGE, which nothing had used on
 * a head before, and the bill runs `animal-vulture.ts`'s own unfinished
 * experiment.
 *
 * Two raptors are built now and they separate cleanly:
 *
 *   - **THE SHELL.** `animal-vulture.ts` takes `box-36` and says outright that
 *     being the SMALLER of two birds is how it stays apart from the ostrich.
 *     This is the largest eagle in the world, so it takes `box-12`, the widest
 *     shell in the bank — and on a one-mass animal the shell is the head, which
 *     is the right place for the width to go on a bird whose head is its
 *     silhouette.
 *   - **THE CREST.** §8's repeat-and-sink was written for a hedgehog's back and
 *     every species that has spent it — hedgehog, porcupine, echidna, warthog,
 *     crocodile — puts it down the SPINE. Head and body are one mass here, so a
 *     ridge over the crown IS a crest, and nine `cone-01` leaned back 20 degrees
 *     over the top and both chamfers is the shaggy lance-feathered head this
 *     bird is known by.
 *
 * **THE BILL IS THE VULTURE'S OWN SUGGESTION, RUN.** That file's flag ends
 * *"WHAT TO TRY BY HAND: stretch it 1.6x on z and drop it a 16th so the dark lip
 * hangs over the pale base."* This does exactly that — `cone-06` at 1.6x on z,
 * hung at 10.5/16 — with Kenney's own band 15 painted dark, which
 * `animal-canary.ts` measured standing 0.041900 proud of band 13. It is still a
 * shallow hook and it is still the pack's one clearly-absent shape.
 */
import { defineCreature } from '../creature'
import { LEG_ROW } from '../hulls'
import { PACK_PUPIL } from '../texture'

/** `box-12`'s front face, which is `box-03`'s, and its rear plate's centre. */
const FRONT_Z = 0.625
const REAR_PLATE_Y = 0.80625
const REAR_PLATE_Z = -0.625

/** The vulture's own untried numbers: 1.6x on z, and a sixteenth lower. */
const BILL_STRETCH: [number, number, number] = [1.2, 1.2, 1.6]
const BILL_Y = 0.65625

export const PHILIPPINE_EAGLE_ASSEMBLY = defineCreature('animal-philippine-eagle', {
  palette: {
    coat: 0x6f5c48,    // UNREVIEWED: the warm brown back and wings
    belly: 0xf2ead7,   // UNREVIEWED: the cream underparts, and the crest
    bill: 0x5c6672,    // UNREVIEWED: the heavy blue-grey bill
    hook: 0x2b3138,    // UNREVIEWED: Kenney's own band 15 — the overhang, see the header
    limb: 0xd9bd52,    // UNREVIEWED: the yellow feet
    eye: 0xbcc6cd,     // UNREVIEWED: the pale blue-grey iris this eagle has
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* The widest shell in the bank against the vulture's box-36 — see the header.
   * No other bird in the project is on it. */
  hull: { part: 'box-12' },
  belly: 0.5,

  /* Pale, to the rim. A Philippine eagle's eye is the palest of any raptor's. */
  eyes: { part: 'plate-08', paint: 'eye' },

  /* THE BILL, running animal-vulture.ts's own written experiment — 1.6x on z
   * and dropped to 10.5/16, with band 15 dark so the overhang hangs over the
   * pale base. It reaches 0.918 clear of the midline, which is what the
   * keep-out is spent on and why nothing else here is lengthened. */
  snout: {
    part: 'cone-06',
    paint: { base: 'bill', byBand: { 15: 'hook' } },
    stretch: BILL_STRETCH,
    at: [0, BILL_Y, FRONT_Z],
  },

  /* The parrot's fan at the rear plate's own centre — a perched eagle's tail is
   * held square and flat. */
  tail: { part: 'box-38', paint: 'coat', spin: [{ axis: 'y', deg: 180 }], at: [0, REAR_PLATE_Y, REAR_PLATE_Z] },

  /* THE CREST, over the CROWN rather than down the spine. Nine copies — three
   * on the flat top, three on each chamfer — leaned back 20 degrees so they
   * sweep rather than stand, at a span of 5/16 which is inside §3's own
   * nothing-floats bound for this shape. */
  ridge: {
    part: 'cone-01',
    paint: 'belly',
    name: 'crest',
    count: 3,
    rows: ['top', 'chamfer'],
    span: 0.3125,
    spin: [{ axis: 'x', deg: -20 }],
  },

  legs: false,
  extras: [
    /* Two legs on the pack's own row at box-01's recorded x. */
    { name: 'leg', part: 'box-01', paint: 'limb', kind: 'pair', sink: LEG_ROW.sink, at: [0.25, LEG_ROW.y, 0] },

    /* The chick's and the parrot's wing, by pure donor transfer. It carries the
     * `wing` role, so the wingbeat attaches with nothing declared. */
    { name: 'wing', part: 'wedge-19', paint: 'coat', kind: 'pair' },
  ],

  flag: 'THE CREST IS A RIDGE ON A HEAD AND THAT IS NEW HERE. §8\'s repeat-and-sink was '
    + 'written for a hedgehog\'s back and every species that has spent it — hedgehog, '
    + 'porcupine, echidna, warthog, crocodile — runs it down the SPINE. Rule 3 fuses head and '
    + 'body into one mass, so a row over the crown IS a crest: nine cone-01 across the flat top '
    + 'and both chamfers, leaned back 20 degrees so they sweep. If it reads as a hedgehog to '
    + 'you, the dial is the lean and then the count. THE BILL IS animal-vulture.ts\'s OWN '
    + 'UNTRIED SUGGESTION, RUN: that file ends "stretch it 1.6x on z and drop it a 16th so the '
    + 'dark lip hangs over the pale base", and this is exactly that, with Kenney\'s band 15 '
    + 'painted dark — animal-canary.ts measured it standing 0.041900 proud of band 13 and '
    + 'called that "where a hook begins". IT IS STILL NOT A HOOKED BEAK. That shape is the one '
    + 'thing docs/how-the-animals-are-made.md §14 named as clearly absent and never retired, '
    + 'and this animal is the third to price it after the vulture and the canary. Compare the '
    + 'two bills side by side and rule on whether 1.6x was worth it. A WHOLE RAPTORS COLLECTION '
    + 'LANDED BESIDE THIS ONE and its eagles are on box-21, the fox\'s TALLER shell, with a '
    + 'box-24 hook spun 55 degrees on the snout and wedge-11 talons. Two things hold this bird '
    + 'apart from them: the widest shell in the bank rather than the tallest, and the CREST, '
    + 'which none of them has. NEW PALETTE, UNREVIEWED.',
})
