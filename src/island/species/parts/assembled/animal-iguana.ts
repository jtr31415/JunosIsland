/**
 * The iguana — a tall dorsal crest and a dewlap, and the dewlap is the first
 * hanging card in the project.
 *
 * Four reptiles are already built and the crocodile is the one this has to
 * survive: same sprawl, same cube, same keeled plates down the back. The
 * separation is made in three places and the first two are counted:
 *
 *   - **SIX SCUTES AT 0.46875 SPAN AGAINST THE CROCODILE'S FIVE AT 0.5.** Both
 *     wear `wedge-06`, the cat's ear — `animal-crocodile.ts` measured it as the
 *     tallest keeled plate the bank can stand on a back (`y +1`, which is the
 *     only condition under which a donor's burial transfers to a radial mount,
 *     and the shallowest of them at 0.573575, so 0.154466 stands proud). A green
 *     iguana's crest is denser and runs further forward, which is six at 3/16.
 *   - **THE DEWLAP.** `plate-11` — the cow's, dog's and giraffe's flank card,
 *     0.400 x 0.433 with **zero thickness in x** — hung under the chin with
 *     `axis: 'y', dir: -1`. Being a midline card it is a flat fan seen from the
 *     side, which is exactly what a dewlap is. No other species in the project
 *     hangs a card downward.
 *   - **A LONG TAIL WHERE A CROCODILE HAS A PADDLE.** `wedge-15`, the lion's, at
 *     the body's own centre. It is `animal-lemur.ts`'s shape TRAILED where that
 *     animal carries it up the chamfer — §3.1 exactly: one shape, two animals,
 *     told apart by placement.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/** The hull's own centre — where a tail that continues the back roots. */
const HULL_MID_Y = 0.80625

export const IGUANA_ASSEMBLY = defineCreature('animal-iguana', {
  palette: {
    coat: 0x5f9e46,    // UNREVIEWED: the dull green of an adult green iguana
    belly: 0xd9d59a,   // UNREVIEWED: the pale venter, and the sclera
    crest: 0x3f6b2c,   // UNREVIEWED: the six dorsal plates
    dewlap: 0xc9a83f,  // UNREVIEWED: the throat fan, which is the animal's flag
    limb: 0x4d8038,    // UNREVIEWED: the sprawled legs
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* A lizard's pale part is the venter only, so 7/16 — below the 0.4808-0.5481
   * zone §7 measured for the pack's mammals, and the same reading
   * `animal-gecko.ts` and `animal-crocodile.ts` made. */
  belly: 0.4375,

  /* The sprawl at its exact limit: `box-01` is 0.375 across, so at 0.4375 the
   * outer face of each leg lands on 0.625 — the hull's own side, flush and not
   * one thousandth past it. The pack's own inside-the-footprint axiom, checked
   * over 23 of 23, at its exact bound. */
  legs: { x: 0.4375, z: 0.34 },

  /* The pack's smallest card. An iguana's eye is a small bead in a big head. */
  eyes: { part: 'plate-06' },

  /* THE CREST. Six, top row only — §8's idiom exists to make a cubic back read
   * ROUND and an iguana's crest is a single line down the spine, exactly as
   * `animal-crocodile.ts` argues. A top row is not mirrored, so six stations
   * cost six parts rather than eighteen. */
  ridge: { part: 'wedge-06', paint: 'crest', name: 'scute', count: 6, rows: ['top'] },

  /* The lion's tail at the body's own centre, trailed. */
  tail: { part: 'wedge-15', paint: 'coat', at: [0, HULL_MID_Y, -0.625] },

  extras: [
    /* THE DEWLAP. `plate-11` is zero-thickness in x, so placed on the midline it
     * is a vertical fan in the y-z plane — a dewlap seen from the side. Joined
     * at y = 0.70 with the facing turned DOWN, it hangs to 0.30, and its z runs
     * 0.503 to 0.937 so the back half of it is inside the head and the front
     * half stands clear of the face. */
    {
      name: 'dewlap',
      part: 'plate-11',
      paint: 'dewlap',
      axis: 'y' as const,
      dir: -1 as const,
      at: [0, 0.7, 0.72] as [number, number, number],
    },
  ],

  flag: 'THE DEWLAP IS A FLAT CARD HUNG DOWNWARD AND IT IS THE FIRST ONE IN THE PROJECT. '
    + 'plate-11 is the cow\'s flank marking, 0.400 x 0.433 and ZERO thick in x, so on the '
    + 'midline it is a vertical sheet — which is what a dewlap is, and §3.1 is the whole '
    + 'argument: a part\'s identity is where it is placed, not what Kenney called it. It is '
    + 'one-sided, so from dead ahead it disappears; that is the honest cost and it is why it '
    + 'is flagged rather than taken quietly. THE CREST SHARES ITS SHAPE WITH '
    + 'animal-crocodile: wedge-06 is the tallest keeled plate the bank can stand on a back '
    + 'and there is no second candidate, so the separation is the COUNT and the SPAN — six at '
    + '3/16 against five at 1/2 — plus the dewlap and a long tail where a crocodile has a '
    + 'paddle. NEW PALETTE, UNREVIEWED.',
})
