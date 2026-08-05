/**
 * PLACEHOLDER — NOT A FINISHED ANIMAL. Joe, 5 August: *"put something in for the
 * unbuildable ones anyway so i can do it manually."* This is that entry.
 *
 * ## What is missing, measured
 *
 * **A DISC. There is no round flat fan anywhere in the bank, and the animal is
 * one.** All 100 baked shapes were censused for this: the only zero-thickness
 * parts are the eye cards and four marking cards (`plate-03`, `-10`, `-11`,
 * `-13`), the biggest of which is 0.400 x 0.433, and nothing in the bank is a
 * circle. A frilled lizard's frill is a single membrane the diameter of the
 * animal's own body, standing behind the jaw.
 *
 * **THE AUTHORED CIRCLE WAS CONSIDERED AND IS REFUSED, and this is the part not
 * to "fix".** `bespoke-circle-01` exists, is stretchable, re-cuts the pack's own
 * chamfer at any size, and needs no `RULE 1` flag — and `authored.ts` names the
 * exception it is NOT: JT-041 is *"PRIMITIVES ONLY. A triangle, a circle and a
 * square. **Not a fin, flipper, fluke, membranous wing, segmented leg, FRILL,
 * plate, spine, hooked beak**..."* Joe listed a frill by name as the thing the
 * three base shapes may not be used for. Using the circle here would be reading
 * his ruling backwards, so it is written down and left alone; if he wants it, it
 * is one line and it is his to give.
 *
 * **AND THE FRILL HAS NOWHERE TO STAND.** Rule 3 is that head and body are one
 * mass — 24 of 24, no seam at the neck — so there is no neck for a collar to sit
 * behind. Whatever stands in has to grow out of the front of the body itself.
 *
 * ## What is standing in
 *
 * **Four `box-25`, the koala's dish** — the largest ear shape in the bank at
 * 0.743 across, radial, and the only side-mounted one — arranged as a ring
 * rather than a pair: one pair out of the flanks and one pair turned 45 degrees
 * onto the top chamfers, which is §8's chamfer idiom applied around a body
 * rather than along it. Sunk 4/16 rather than the koala's own 0.534 so each one
 * stands 0.261 clear instead of 0.162. On `box-31`, the crocodile's own shallow
 * shell, with `tube-03` as the jaw and `wedge-07`, the cat's rope, as the tail.
 *
 * **If you are doing this by hand:** the four discs are the whole of it. Their
 * `sink` is the cheapest dial — every 1/16 shallower is another 0.0218 of frill
 * — and a fifth and sixth copy on the lower chamfers would close the ring, at 92
 * triangles each against 69 left under rule 9's 951. The animal reads at 882
 * today.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/** `box-31`'s own side face, its centre, and its front. */
const HULL_SIDE_X = 0.625
const HULL_MID_Y = 0.80625

/**
 * `box-31`'s x/y edge chamfer midpoint, measured: half-extents 0.625 and 0.625
 * with a flat-face inset of 0.3125 each way, so the midpoint is
 * (0.625 + 0.3125) / 2 = 0.46875 on both — §8 step 1's own number, and NOT the
 * 0.5625 you get by assuming a 1.000-wide face.
 */
const CHAMFER = 0.46875

/**
 * 4/16 rather than `box-25`'s own recorded 0.534.
 *
 * The koala buries this dish 0.534 of its own 0.348 of thickness, standing 0.162
 * proud, which is an ear pressed to a head. A frill stands OUT. At 4/16 it
 * buries 0.087 and stands 0.261 — 61% more — and it is still an embedded part by
 * §3, with more than the 0.125 minimum every eared species in the pack buries.
 */
const FRILL_SINK = 0.25

/** As far forward as the frill can sit: level with the jaw's own root. */
const FRILL_Z = 0.25

export const FRILLED_LIZARD_ASSEMBLY = defineCreature('animal-frilled-lizard', {
  palette: {
    coat: 0x8f7048,    // UNREVIEWED: the dusty grey-brown body
    belly: 0xd6c3a0,   // UNREVIEWED: the pale underside, and the sclera
    frill: 0xc2662e,   // UNREVIEWED: the orange-rust frill, which is the animal
    jaw: 0x6d5436,     // UNREVIEWED: the long jaw, a shade under the coat
    limb: 0x7d6140,    // UNREVIEWED: the sprawled legs
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* The crocodile's own shallow shell — 1.125 deep, the lowest hull that still
   * stands on legs, and the right body for any lizard in this project. */
  hull: { part: 'box-31', paint: 'coat' },

  /* 7/16, the crocodile's own: a lizard's pale part is its whole underside and
   * it stops below the flank. */
  belly: 0.4375,

  /* THE SPRAWL, at the crocodile's own station: 7/16 puts each leg's outer face
   * exactly on this hull's side at 0.625, which is the pack's own
   * inside-the-footprint axiom at its exact limit. */
  legs: { x: 0.4375, z: 0.375 },

  /* THE JAW. The deer's muzzle at its own zero burial, so all 0.532 of it stands
   * clear of a face whose front plate is the biggest in the bank. */
  snout: { part: 'tube-03', paint: 'jaw' },

  /* The cat's rope, LAID BACK. Unspun this shape stands 1.047 UP and reaches
   * only 0.467, because a cat carries its tail; a lizard's runs straight out
   * behind. The spin turns the length into z, and the facing is declared `y +1`
   * because `creature.ts` builds the base facing from `axis`/`dir` and then
   * SPINS it — a -90 turn about x sends (0,1,0) to (0,0,-1), so the tail joins
   * the rear face after the turn. Declaring `z -1` here would spin that instead
   * and stand the tail on end. */
  tail: {
    part: 'wedge-07',
    paint: 'coat',
    spin: [{ axis: 'x', deg: -90 }],
    axis: 'y',
    dir: 1,
    sink: 0.2,
    at: [0, HULL_MID_Y, -0.625],
  },

  extras: [
    /* THE FRILL, PAIR ONE: straight out of the flanks on the koala's own facing,
     * sunk shallower than the koala sinks it. See FRILL_SINK. */
    {
      name: 'frill-side',
      part: 'box-25',
      paint: 'frill',
      kind: 'pair',
      sink: FRILL_SINK,
      at: [HULL_SIDE_X, HULL_MID_Y, FRILL_Z],
    },

    /* THE FRILL, PAIR TWO: the same dish turned 45 degrees onto the top chamfer
     * and joined at its measured midpoint — §8's chamfer idiom, used to step a
     * ring around a body rather than a run along it. `{ axis: 'z', deg: 45 }`
     * takes an `x +1` facing to the bisector of the edge's two bevel normals. */
    {
      name: 'frill-top',
      part: 'box-25',
      paint: 'frill',
      kind: 'pair',
      spin: [{ axis: 'z', deg: 45 }],
      sink: FRILL_SINK,
      at: [CHAMFER, HULL_MID_Y + CHAMFER, FRILL_Z],
    },
  ],

  flag: 'PLACEHOLDER, NOT A FINISHED ANIMAL — put in so you can do it by hand. THE BANK HAS NO '
    + 'DISC: censused over all 100 shapes, the only zero-thickness parts are the eye cards and '
    + 'four marking cards, the biggest 0.400 x 0.433, and not one shape in the pack is a circle. '
    + 'A frilled lizard IS a disc the diameter of its own body. THE AUTHORED CIRCLE WAS '
    + 'CONSIDERED AND REFUSED, and please do not let anyone "fix" that: bespoke-circle-01 would '
    + 'do this beautifully and needs no RULE 1 flag, but JT-041 — your own scoping of the three '
    + 'base shapes — says PRIMITIVES ONLY and lists a FRILL by name among the things they are '
    + 'not for. If you want to give it, that is one line and it is yours. AND THERE IS NOWHERE '
    + 'TO STAND IT: rule 3 is head and body as one mass, 24 of 24 with no seam at the neck, so '
    + 'there is no neck for a collar to sit behind and the stand-in has to grow out of the front '
    + 'of the body. WHAT IS HERE is four copies of box-25, the koala\'s dish — the largest ear '
    + 'in the bank at 0.743 across and the only side-mounted one — as a RING: one pair out of '
    + 'the flanks and one turned 45 degrees onto the top chamfers at its measured 0.46875 '
    + 'midpoint, which is §8\'s chamfer idiom stepped around the body instead of along it. They '
    + 'are sunk 4/16 rather than the koala\'s own 0.534, standing 0.261 clear against 0.162, '
    + 'and that sink is your cheapest dial — every notch shallower is another 0.0218 of frill. '
    + 'A fifth and sixth copy on the lower chamfers would close the ring and there are 69 '
    + 'triangles left under the 951 ceiling, which is not quite two of them. WATCH THE '
    + 'KEEP-OUT: 2.364 across is 1.182, above the fox\'s 1.15 and the widest animal in this '
    + 'collection, and every bit of the overrun is frill. NEW PALETTE, UNREVIEWED.',
})
