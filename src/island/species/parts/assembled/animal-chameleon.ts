/**
 * The chameleon — a casque, two turret eyes and a coiled tail, and every one of
 * the three is a bank shape doing a job Kenney never drew it for (§3.1).
 *
 *   - **THE CASQUE IS `box-25`, THE KOALA'S EAR** — the largest ear shape in the
 *     bank at 0.7427 across, filed under `ear` and worn here as the helmet on the
 *     back of the head. Its attachment is `x +1`, so `{ axis: 'z', deg: 90 }`
 *     stands it UP, and at its own 0.5337 burial 0.347 of it is proud.
 *   - **THE TURRETS ARE `box-02` ON THE FLANKS OF THE HEAD.** A chameleon's eyes
 *     are two cones on the sides, and rule 5 pins the eye CARD to the absolute
 *     z = 0.6350 on the front — so the turrets are geometry and the cards stay on
 *     the face. That is the one thing here that is genuinely wrong and the flag
 *     says so.
 *   - **THE TAIL IS A COIL, and the bank holds no curve at all.** `box-04`, the
 *     bee's abdomen ring, stood on edge with `{ axis: 'y', deg: 90 }` and cut to
 *     0.45 of itself. `animal-corn-snake.ts` lays the same ring FLAT as the
 *     kit's answer to leglessness; this one stands it up as a curl, which is
 *     §3.1 exactly — one shape, two animals, told apart by placement.
 *
 * The crest is five `cone-01` on the top row only, fine rather than tall.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/** `box-03`'s flat crown. */
const CROWN_Y = 1.43125
/** Its flat side face, and the hull's own centre height. */
const SIDE_X = 0.625
const HULL_MID_Y = 0.80625

export const CHAMELEON_ASSEMBLY = defineCreature('animal-chameleon', {
  palette: {
    coat: 0x4fa05a,    // UNREVIEWED: the leaf green a veiled chameleon rests at
    belly: 0xdcd888,   // UNREVIEWED: the yellow underside, and the sclera
    crest: 0xe0b73c,   // UNREVIEWED: the casque and the dorsal spikes
    limb: 0x3d8047,    // UNREVIEWED: the gripping feet
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* A lizard's pale part is the venter only, so 7/16 — the same reading
   * `animal-gecko.ts` and `animal-crocodile.ts` made, one notch apart. */
  belly: 0.4375,

  /* The sprawl at its exact limit: `box-01` is 0.375 across, so at 0.4375 the
   * outer face of each leg lands on 0.625 — this hull's own side, flush and not
   * past it. `animal-crocodile.ts` solved the same bound for the same reason. */
  legs: { x: 0.4375, z: 0.3 },

  /* The pack's SMALLEST eye card, and it is the right one twice over: a
   * chameleon's visible eye is a pinhole in a cone of skin, and the two turrets
   * below are where the size of the eye actually lives. */
  eyes: { part: 'plate-06' },

  /* THE DORSAL CREST — five `cone-01`, the bank's only true point, on the TOP
   * ROW ALONE. §8's idiom exists to make a cubic back read round; a chameleon's
   * crest is a single line down the spine, so the chamfer and side rows are
   * left off exactly as `animal-crocodile.ts` leaves them off. */
  ridge: { part: 'cone-01', paint: 'crest', name: 'crest', count: 5, rows: ['top'] },

  extras: [
    /* THE CASQUE. The koala's ear stood on end and set back on the crown. */
    {
      name: 'casque',
      part: 'box-25',
      paint: 'crest',
      spin: [{ axis: 'z' as const, deg: 90 }],
      at: [0, CROWN_Y, 0.1] as [number, number, number],
    },

    /* THE TURRETS. `box-02` mounted on the SIDE of the head — `axis: 'x'`
     * overrides the shape's own `y +1`, which is the tortoise-hoop trick — and
     * buried 0.35 rather than the beaver's 0.778, so 0.205 of each stands proud.
     * Placed inside the flat side face's own 0.49375-1.11875 in y and +/-0.3125
     * in z, so neither one is over a chamfer. */
    {
      name: 'turret',
      part: 'box-02',
      kind: 'pair' as const,
      paint: 'coat',
      axis: 'x' as const,
      dir: 1 as const,
      sink: 0.35,
      at: [SIDE_X, 1.05, 0.3] as [number, number, number],
    },

    /* THE COIL. The bee's ring stood on edge and cut to 0.45, sunk 0.3 of its
     * own thickness so two thirds of the curl is clear of the rump. */
    {
      name: 'coil',
      part: 'box-04',
      paint: 'coat',
      spin: [{ axis: 'y' as const, deg: 90 }],
      stretch: [0.45, 0.45, 1] as [number, number, number],
      sink: 0.3,
      at: [0, HULL_MID_Y, -0.625] as [number, number, number],
    },
  ],

  flag: 'THE EYES ARE IN THE WRONG PLACE AND IT IS RULE 5 THAT PUTS THEM THERE. A '
    + 'chameleon\'s eyes are two independently swivelling turrets on the SIDES of its head; '
    + 'the eye card\'s z is EYE_CARD_Z and not a parameter, so both cards are pinned to the '
    + 'front at 0.6350 whatever the animal is. What is here instead is two box-02 mounted on '
    + 'the flanks with axis: x, buried 0.35 so 0.205 stands proud, and the smallest card in '
    + 'the pack left on the face as the pinhole. If it reads wrong to you, the turrets are '
    + 'the part to move and the cards cannot follow them. THE TAIL IS NOT A CURVE: the bank '
    + 'holds no curved shape in any of its 100 records and rule 4 as amended bakes a ROTATION '
    + 'into a copy\'s vertices — it turns a part, it cannot bend one — so the coil is the '
    + 'bee\'s abdomen ring stood on edge, which is a circle rather than a spiral. '
    + 'collections/ocean.ts priced the same wall for the seahorse. NEW PALETTE, UNREVIEWED, '
    + 'and note a chameleon\'s whole trick is CHANGING colour, which one flat palette per '
    + 'species cannot say at all.',
})
