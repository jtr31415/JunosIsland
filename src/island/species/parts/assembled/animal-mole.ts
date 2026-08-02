/**
 * The mole's assembly, as a definition.
 *
 * ONE SPECIES, ONE FILE. `index.ts` says why one appended line is the whole of
 * the wiring; `creature.ts` says why a definition is this short.
 *
 * ## What this animal has to do, and how it does it
 *
 * A mole is the one Garden species whose whole character is a thing this pack
 * cannot express: **low**. `HEIGHT_FLOOR` is 1.43125 — a bare 1.250 cube on the
 * standard leg row — against a band that starts at 1.43, so there is no headroom
 * underneath at all and nothing to be gained by trying for it. Height was checked
 * first, it came out on the floor, and everything below was chosen knowing that.
 *
 * So the mole is separated from every other small dark Garden creature by
 * ANATOMY, in the order §2's brief asks for — ears, then tail, then an extra:
 *
 *   - **No ears at all, and that is the real thing.** A mole has no external ear;
 *     the pinna is skin. It is the only Garden species that gets to say that AND
 *     wear a snout, and against the mouse's 0.743 koala dish it is the biggest
 *     silhouette difference the bank can produce without adding a shape.
 *   - **The bank's only STUB tail.** Seven shapes carry the `tail` role and six of
 *     them are whips and brushes, 0.555 to 0.910 of reach. `box-18` reaches
 *     0.425 — the shortest in the bank by a fifth — which is what a mole's tail is.
 *   - **Pink spade hands, on front legs painted differently from the back.** That
 *     is the animal. Everything else about a mole is a dark tube.
 *
 * ## Every number, and where it came from
 *
 *   - **The hull and the eye plane are the pack's own**, unmentioned below because
 *     `defineCreature` supplies them: `box-03` at `[0, 0.80625, 0]` and two
 *     `plate-01` at the card's recorded (0.2625, 0.933646) on the absolute
 *     z = 0.6350. **The eye cards stay** even though a mole is nearly blind: all
 *     24 originals have them and rule 5 makes the eye absolute and structural.
 *     Small dark eyes — the belly grey against `PACK_PUPIL` — read correctly on a
 *     near-black face, which is the one place this animal gets its anatomy free.
 *
 *   - **The tail is `box-18`, and Kenney's name for it is wrong.** The bank
 *     inherited `tail` from the elephant's own node name, but its measured
 *     attachment is `z +1` — it points FORWARD, alone among the seven tails —
 *     because it is the elephant's TRUNK. §3.1: a part's identity is its
 *     placement, not the label. Spun 180 degrees it is a stub tail and there is
 *     no other in the bank.
 *
 *     Its join point is **forced, not chosen**. The donor transfer would put it at
 *     the trunk's own y = 0.482248, and on THIS hull that height is past the
 *     bottom-rear chamfer: the stub is 0.623004 tall, so its lower third would
 *     hang below y = 0.18125 with no hull behind it. §3, nothing floats. `box-03`'s
 *     flat rear face is **0.625 square** (its 32 welded points are the
 *     permutations of ±0.625/±0.3125/±0.3125), the stub's join face is 0.345 by
 *     0.623004, and 0.625 − 0.623004 leaves a two-thousandth window: the ONLY y at
 *     which it is fully backed is the hull's own centre, 0.80625. Everything else
 *     about it is the pack's — sunk the elephant's own 0.000, and its centre then
 *     lands on −0.837606, the bank's recorded offset mirrored.
 *
 *   - **The snout is `cone-06`, the parrot's beak, and it is the only true POINT
 *     in the pack's nose family** — taper 0.000, where every muzzle in the bank is
 *     1.000. A mole's face is a pink wedge with a nose on the end of it, so the
 *     shape is the animal and the donor's trade is irrelevant (§3.1 again).
 *     Nothing is said about its placement: the donor transfer joins it at the
 *     cube's front face z = 0.625, sinks it the parrot's own 0.360878, and
 *     recovers z = 0.664912 against the bank's recorded 0.664911 — one part in a
 *     million, which is the evidence the transfer is legitimate.
 *
 *   - **No nose button.** `box-09` on the snout's own front is the mouse's idiom
 *     and it is wrong here: the anchor is a CONE'S APEX, which has no width at
 *     all, so a 0.182-wide button hung there touches at a point and floats
 *     everywhere else. §3. The cone's own tip is the nose, and it is pink.
 *
 *   - **The legs are the pack's leg row, split in two so the front pair can be
 *     PINK.** Same shape, same `LEG_ROW.sink`, same `LEG_ROW.y` that puts the feet
 *     on zero, same 0.27 and 0.25 stations the builder solves for this hull — two
 *     mirrored pairs instead of one row, and the only thing that differs between
 *     them is the slot they are painted from. Colour is a texture slot; nothing
 *     here is a material tint.
 *
 *   - **The spades are `box-24`, the hog's snout disc, at the front legs' own
 *     front face.** A neutral 0.4 disc, and all three of its coordinates are
 *     recovered rather than picked: x is the leg row's own station, z = 0.4375 is
 *     the front leg's front face (its station 0.25 plus box-01's own 0.375 depth,
 *     halved), and y = 0.2 is the disc's OWN half-height, which is what rests its
 *     rim on y = 0. A digging hand belongs on the earth.
 *
 *   - **The claws are `wedge-01`, the BEAVER'S OWN INCISOR** — the bank calls it a
 *     nose because Kenney called the node `nose-tip`, and it is a handed pair of
 *     pointed wedges sitting at x ±0.073 under the beaver's muzzle, which is a
 *     rodent's front teeth. It is the only pointed keratin in the pack, and a
 *     claw and a tooth are the same object. Two per palm, one 1/16 station either
 *     side of the leg row's own 0.27, at the disc's own centre height and on the
 *     disc's own front plane — placed at the pack's authoring grid rather than by
 *     eye, sunk the beaver's own 0.218566, and painted from the pale slot because
 *     a claw is horn.
 *
 *   - **No painted belly line.** §4's second way is free and it is declined on
 *     purpose: a mole is uniform velvet top and bottom, because an animal that
 *     lives in the dark has nothing to counter-shade against. The pale slot still
 *     earns its place twice over — the eye cards' sclera, and the claws.
 *
 *   - **The palette is `garden.ts`'s own signed-off four**, in that record's own
 *     roles: `detail` is the spade hands and `accent` is the snout. Nothing here
 *     is a new colour, and the pupil is the measured one.
 *
 * **No flag.** Nothing was strained: 486 triangles against the pack's 422-951,
 * height 1.4312 on the floor, keep-out 0.93 against the fox's 1.15, every part
 * joined to a face something is actually behind, and every number either the
 * pack's own or forced by one.
 */
import { defineCreature } from '../creature'
import { LEG_ROW } from '../hulls'
import { PACK_PUPIL } from '../texture'

export const MOLE_ASSEMBLY = defineCreature('animal-mole', {
  palette: {
    coat: 0x3d3d47,
    belly: 0x6b6b78,
    paw: 0xd79a86,
    snout: 0xe8ac96,
    pupil: PACK_PUPIL,  // the pack's own measured pupil; see texture.ts
    'leg-back': 0xd79a86,
  },

  legs: false,
  tail: { part: 'box-18', spin: [{ axis: 'y', deg: 180 }], at: [0, 0.80625, -0.625] },
  snout: { part: 'cone-06', paint: 'snout' },
  extras: [
    {
      name: 'leg-back',
      part: 'box-01',
      paint: 'leg-back',
      kind: 'pair',
      sink: 0.408163,
      at: [0.27, 0.18125, -0.25],
    },
    {
      name: 'leg-front',
      part: 'box-01',
      paint: 'paw',
      kind: 'pair',
      sink: 0.408163,
      at: [0.27, 0.18125, 0.25],
    },
    {
      name: 'claw-inner',
      part: 'wedge-01',
      paint: 'belly',
      kind: 'pair',
      at: [0.2125, 0.1, 0.4125],
      spin: [{ axis: 'x', deg: -90 }],
    },
    {
      name: 'claw-outer',
      part: 'wedge-01',
      paint: 'belly',
      kind: 'pair',
      at: [0.3125, 0.0625, 0.3625],
      spin: [{ axis: 'x', deg: -90 }],
    },
  ],
})
