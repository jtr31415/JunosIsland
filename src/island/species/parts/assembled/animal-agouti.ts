/**
 * The agouti — the rodent whose whole design is a COLOURED RUMP, and the bank
 * has the exact part for it.
 *
 * ONE SPECIES, ONE FILE. `register.ts` says why the one appended line in
 * `index.ts` is the whole of the wiring.
 *
 * **`box-35` is the panda's rump-shell**, a 1.343 x 1.343 x 0.498 ring recorded
 * with `z -1` and `sunkFraction 1.000` — a band Kenney fitted round the back of
 * an animal so that its rear could be a different colour from its front. That is
 * precisely what an agouti is: dark brown in the shoulder, blazing orange over
 * the haunch. **It is the only way this project can say a FORE-AND-AFT boundary
 * at all**, because `Paint.patch` takes one HEIGHT and `byBand` cuts only where
 * Kenney already cut — the same wall Jungle's five patterned animals hit. Cut to
 * 0.55 of its own depth for `assembly-assert.ts`'s one-mass ratio: 0.4937
 * against `box-36`'s 1.9531, a ratio of 3.95 against a required 3.
 *
 * **Against `animal-capybara` and `animal-coypu`**, the project's other two big
 * rodents: this one has NO TAIL AT ALL — an agouti's is a nub you cannot see —
 * and the bank's smallest ear, `box-05` at 0.221 x 0.232. The capybara sets a
 * `box-02` button BEHIND the crown's midpoint and has a brick muzzle; the coypu
 * separates on orange teeth. Three rodents, three different subtractions.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/** The flat crown of the 1.250 cube, and `HEIGHT_FLOOR`. */
const CROWN_Y = 1.43125
/** The hull's own recorded centre — `box-36` sits where every cube sits. */
const HULL_CENTRE_Y = 0.80625

export const AGOUTI_ASSEMBLY = defineCreature('animal-agouti', {
  palette: {
    coat: 0x6b4a30,    // UNREVIEWED: dark coffee — the shoulders and head, on the HULL only
    belly: 0xd6bb95,   // UNREVIEWED: the pale underside, and the sclera
    /* The coat's own brown under a second name, for the parts that must not read
     * the belly split — `animal-stoat.ts`: a patch belongs to the SLOT. */
    fur: 0x6b4a30,     // UNREVIEWED: the same brown — the ears and the muzzle
    rump: 0xc4661f,    // UNREVIEWED: the burnt orange haunch. The whole animal, really
    mark: 0x2d1f14,    // UNREVIEWED: the nose
    limb: 0x543924,    // UNREVIEWED: the fine legs
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* The panda's cube. `box-03` is spent on six small mammals already and this
   * one wants a shell that no other rodent in the project is standing on. */
  hull: { part: 'box-36' },
  belly: 0.375,

  /* Narrow and long-striding — an agouti runs on its toes. */
  legs: { x: 0.24, z: 0.28 },

  eyes: { y: 0.99 },

  /* THE SMALLEST SHAPE IN THE BANK, sunk a third, forward on the crown. */
  ears: { part: 'box-05', paint: 'fur', sink: 0.3, at: [0.24, CROWN_Y, 0.1875] },

  /* The beaver's short blunt muzzle — a cavy face, not the capybara's brick. */
  snout: { part: 'tube-01', paint: 'fur' },
  nose: { part: 'box-09', paint: 'mark' },

  /* NO TAIL, deliberately. An agouti's is a bare nub under an inch long and
   * nothing in the bank is that small; drawing one would be inventing a feature
   * the animal is known for NOT having. It is also half the separation from the
   * coypu, whose tail is the thing you see first. */

  extras: [
    /* THE RUMP. The panda's own rump-shell doing the panda's own job. It stands
     * (1.3433 - 1.250) / 2 = 0.0467 proud of the cube on x and y — the ring the
     * pack itself leaves — and its z is cut to 0.55 for the one-mass ratio. */
    {
      name: 'rump',
      part: 'box-35',
      paint: 'rump',
      stretch: [1, 1, 0.55],
      sink: 1,
      at: [0, HULL_CENTRE_Y, -0.3125],
    },
  ],

  motion: [{ kind: 'twitch', parts: ['ear'] }],
})
