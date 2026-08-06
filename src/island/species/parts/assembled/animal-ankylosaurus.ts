/**
 * The Ankylosaurus — the armoured one, and the collection's only full use of
 * §8's chamfer idiom.
 *
 * Every other member here spends its budget on ONE big feature — a frill, a row
 * of plates, a sail, a neck. This animal is the opposite: it is a surface, and
 * the idiom exists for exactly that. §8: *"to make a cubic body read ROUND, put a
 * row of parts on each flat face and another row on the chamfer between them"*,
 * and Joe's own §3.1 note that *"the hog ears could potentially double up as
 * dragon or croc back ridges"*. Twelve scutes on the top and the two chamfers
 * make a cube read as a domed carapace without a dome existing.
 *
 * **THE SCUTE IS `wedge-04`, WHICH IS BOTH AN EAR AND A TOOTH.** The bank files
 * it under both roles — chick, monkey and penguin wear it as an ear, the bunny as
 * a front-of-face tooth — and it is `y +1`, which `animal-crocodile.ts` records
 * as *"the ONLY condition under which a donor's burial transfers to a radial
 * mount"*. It is chosen over the crocodile's own `wedge-06` for a budget reason
 * that is exact: **38 triangles against 62**, and twelve copies makes that a
 * 288-triangle difference, which is 30% of rule 9's whole ceiling. The animal
 * measures 908 against that ceiling of 951 as it stands.
 *
 * **THE TAIL IS THE ELEPHANT'S TRUNK WORN BACKWARDS WITH A CLUB ON ITS TIP.**
 * `box-18` spun 180 about y joins the rear face and reaches 0.425 — a short stiff
 * tail rather than a whip, which is what an ankylosaur's is — and `box-24`, the
 * hog's nose pad, hangs on its own built tip by `on:` rather than by a chosen
 * number. That pad is 0.400 x 0.400 x 0.200 and blunt on every axis, which is the
 * only club-shaped thing in 100 records.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

export const ANKYLOSAURUS_ASSEMBLY = defineCreature('animal-ankylosaurus', {
  palette: {
    coat: 0x7d7460,    // UNREVIEWED: a stony grey-brown
    belly: 0xd4c8a8,   // UNREVIEWED: the pale underside, and the sclera
    scute: 0x574f3f,   // UNREVIEWED: the dark armour, twelve plates and a club
    limb: 0x6b6352,    // UNREVIEWED: the short sprawled legs and the blunt snout
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* The 1.250 cube at 60 triangles. box-12, the widest, would suit an armoured
   * tank better and costs 120 more — and there is no room: this animal measures
   * 908 against rule 9's 951, so on box-12 it would be 1028. The shell is the
   * thing that gave way, and dropping the scute count from 4 to 3 (nine copies,
   * 794 triangles) is what buys it back. */
  hull: { part: 'box-03', paint: 'coat' },

  /* 6/16 — lower than this collection's usual 7/16, because an ankylosaur's
   * armour comes further down its flank than any other member's. It splits the
   * `coat` CELL and nothing else here paints from `coat`. */
  belly: 0.375,

  /* THE SPRAWL at the crocodile's own limit: 7/16 puts each leg's outer face
   * exactly on the cube's side at 0.625 — the pack's inside-the-footprint axiom
   * at its exact limit, and as wide as a fixed leg row can say. */
  legs: { x: 0.4375, z: 0.375, paint: 'limb' },

  /* A blunt beaked snout: the bunny's muzzle, the pack's shortest-reaching
   * rounded nose, at its own 0.75 burial so almost nothing stands out. */
  snout: { part: 'box-08', paint: 'limb' },

  /* TWELVE SCUTES, on the top face and both top chamfers — §8's idiom, and Joe's
   * own six-a-side note. The chamfer row is mirrored by the builder, so `count: 4`
   * is four on top and eight on the chamfers. `wedge-04` is `y +1`, which is what
   * makes its recorded burial transfer at all. */
  ridge: {
    part: 'wedge-04',
    paint: 'scute',
    name: 'scute',
    count: 4,
    rows: ['top', 'chamfer'],
  },

  /* THE TAIL. The elephant's trunk turned to face backwards — its `z +1` becomes
   * `z -1` — so the donor transfer joins it to the rear face at its own zero
   * burial and it reaches 0.425 stiffly rather than trailing 1.047. */
  tail: { part: 'box-18', paint: 'coat', spin: [{ axis: 'y', deg: 180 }], at: [0, 0.80625, -0.625] },

  extras: [
    /* THE CLUB, on the tail's own built tip rather than at a chosen coordinate.
     * The hog's nose pad is 0.400 x 0.400 x 0.200 and blunt on every axis — the
     * only club in 100 records. */
    { name: 'club', part: 'box-24', paint: 'scute', on: 'tail' },
  ],

  flag: 'THE COLLECTION\'S ONLY FULL USE OF SECTION 8\'S CHAMFER IDIOM, and the one member '
    + 'that is a SURFACE rather than one big feature. Twelve scutes on the top face and both '
    + 'top chamfers make a cube read as a domed carapace without a dome existing — which is '
    + 'worth noting against the DOME commission animal-pachycephalosaurus prices, because it is '
    + 'the same want answered by placement instead of by a shape. THE SCUTE IS wedge-04, which '
    + 'the bank files under BOTH ear and tooth (chick, monkey and penguin wear it as an ear, '
    + 'the bunny as a tooth) and which is y +1 — animal-crocodile.ts records that as the only '
    + 'condition under which a donor\'s burial transfers to a radial mount. It is taken over '
    + 'the crocodile\'s own wedge-06 for an exact budget reason: 38 triangles against 62, and '
    + 'twelve copies makes that 288, which is 30% of rule 9\'s ceiling. THE SHELL IS WHAT GAVE '
    + 'WAY FOR IT. box-12, the widest, is the right body for a tank and costs 120 triangles '
    + 'more; this animal is 908 against the ceiling of 951, so on box-12 it would be 1028 and '
    + 'would have to declare RULE 9. If you want the wider body, drop the scute count from 4 '
    + 'to 3 — nine copies, 794 triangles — and both fit. '
    + 'THE TAIL IS THE ELEPHANT\'S TRUNK WORN BACKWARDS with box-24, the hog\'s nose pad, on '
    + 'its own built tip — the only blunt-on-every-axis shape in 100 records, which is what a '
    + 'club is. NEW PALETTE, UNREVIEWED.',
})
