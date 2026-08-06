/**
 * The Pachycephalosaurus — the collection's one commission, and it is the DOME.
 *
 * This animal is a dome with a dinosaur under it. **There is no hemisphere in the
 * bank.** All ten hulls are chamfered boxes, all 100 shapes are straight or
 * tapered along a single axis, and the only round thing in the whole set is the
 * koala's ear. Ocean priced the same absence three times over — the jellyfish,
 * the sea turtle and `animal-tortoise`'s own flag, which says *"a domed carapace
 * is the one bespoke part this collection would pay to author"* — and this is the
 * **fourth species and the second collection** behind one shape.
 *
 * **THE AUTHORED CIRCLE IS REFUSED AND PLEASE DO NOT LET ANYONE "FIX" THAT.**
 * `bespoke-circle-01` exists, is stretchable, re-cuts the pack's own chamfer at
 * any size and needs no `RULE 1` flag — and `authored.ts` quotes JT-041 naming
 * the exception it is NOT: *"PRIMITIVES ONLY. A triangle, a circle and a square.
 * Not a fin, flipper, fluke, membranous wing, segmented leg, frill, plate, spine,
 * hooked beak..."* A dome is not on that list by name, but a cylinder is not a
 * dome and using one here would be reading the ruling sideways.
 *
 * **WHAT STANDS IN IS `box-25`, THE KOALA'S DISH, RE-AXISED AND SWOLLEN.** It is
 * the largest ear shape in the bank (0.743 across), the only RADIAL one, and the
 * only one the pack mounts on `x +1`. Turned a quarter about z it stands on the
 * crown; stretched 1.8x on its own thickness it becomes 0.743 x 0.743 x 0.626,
 * which is within 16% of a sphere on all three axes and is as near a dome as 100
 * measured shapes get. Sunk 9/16 it shows a rounded cap 0.325 proud.
 *
 * **If you are doing this by hand:** `DOME_SINK` is the cheapest dial — every
 * 1/16 shallower is another 0.0464 of skull — and the second ring of knobs a real
 * pachycephalosaur wears round the dome's base would be a `ridge` of `cone-01`
 * with `rows: ['top']`, at 34 triangles a copy against the 319 this animal
 * leaves under rule 9 — it measures 632 of 951 as it stands.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/** `box-03`'s own crown and centre. */
const CROWN_Y = 1.43125
const HULL_MID_Y = 0.80625

/**
 * 1.8x on `box-25`'s own 0.347996 of thickness, giving 0.626393.
 *
 * The stretch is applied on the part's OWN axes before the spin, so this is the
 * axis that ends up running fore-and-aft. At its own thickness the dish is a
 * standing DISC — 0.743 x 0.743 x 0.348, aspect 1 : 1 : 0.469 — and at 1.8x it is
 * 1 : 1 : 0.843, which is the roundest solid this bank can be made to hold.
 */
const DOME_STRETCH = 1.8

/**
 * 9/16, against `box-25`'s own recorded 0.533662.
 *
 * The koala buries this dish 0.396 of its 0.743 and shows 0.346 as an ear pressed
 * to a head. A skull boss should show LESS, not more: at 9/16 it buries 0.418 and
 * stands 0.325 proud, which puts the crown of the animal at 1.756 and reads as a
 * bulge in the skull rather than as a plate stood on it.
 */
const DOME_SINK = 0.5625

export const PACHYCEPHALOSAURUS_ASSEMBLY = defineCreature('animal-pachycephalosaurus', {
  palette: {
    coat: 0x94734f,    // UNREVIEWED: a warm ochre body
    belly: 0xe2d3b0,   // UNREVIEWED: the pale underside, and the sclera
    dome: 0xbf5f45,    // UNREVIEWED: the rust-red skull dome, which is the animal
    limb: 0x7c6042,    // UNREVIEWED: the two legs and the snout
    hide: 0x876a49,    // UNREVIEWED: the coat one step down, for the tail
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  hull: { part: 'box-03', paint: 'coat' },

  /* 8/16, the tiger's own mammal line. It splits the `coat` CELL and nothing else
   * here paints from `coat` — animal-stoat.ts's landmine. */
  belly: 0.5,

  /* The eye pushed up to 1.10 so it is under the dome rather than behind the
   * snout: the card's own 0.933646 sits inside the muzzle's 0.83-1.04. */
  eyes: { y: 1.1 },

  /* The bunny's muzzle at its own 0.75 burial — short, blunt and out of the way,
   * because everything about this animal is above it. */
  snout: { part: 'box-08', paint: 'limb', at: [0, 0.9375, 0.625] },

  /* The cat's rope laid straight back on animal-frilled-lizard.ts's idiom. */
  tail: {
    part: 'wedge-07',
    paint: 'hide',
    spin: [{ axis: 'x', deg: -90 }],
    axis: 'y',
    dir: 1,
    sink: 0.2,
    at: [0, HULL_MID_Y, -0.625],
  },

  extras: [
    /* THE DOME. The koala's dish turned a quarter about z — which takes its `x +1`
     * facing to `y +1` and leaves its two equal 0.743 extents where they were —
     * swollen 1.8x on the third axis and sunk deeper than the koala sinks it. */
    {
      name: 'dome',
      part: 'box-25',
      paint: 'dome',
      spin: [{ axis: 'z', deg: 90 }],
      stretch: [1, 1, DOME_STRETCH],
      sink: DOME_SINK,
      at: [0, CROWN_Y, 0.1875],
    },
  ],

  flag: 'THIS COLLECTION\'S ONE COMMISSION, AND IT IS THE DOME. This animal is a dome with a '
    + 'dinosaur under it and THERE IS NO HEMISPHERE IN THE BANK: all ten hulls are chamfered '
    + 'boxes, all 100 shapes are straight or tapered along a single axis, and the only round '
    + 'thing in the set is the koala\'s ear. Ocean priced the same absence three times — the '
    + 'jellyfish, the sea turtle, and animal-tortoise\'s own flag saying "a domed carapace is '
    + 'the one bespoke part this collection would pay to author" — so this is the FOURTH '
    + 'species and the SECOND collection behind one shape. THE AUTHORED CIRCLE IS REFUSED AND '
    + 'PLEASE DO NOT LET ANYONE FIX THAT: bespoke-circle-01 exists, is stretchable and needs no '
    + 'RULE 1 flag, and JT-041 — your own scoping — says PRIMITIVES ONLY and lists frill, plate '
    + 'and spine among the things the three base shapes are not for. A dome is not on that list '
    + 'by name, but a cylinder is not a dome and using one here would be reading the ruling '
    + 'sideways. If you want to give it, that is one line and it is yours. WHAT STANDS IN is '
    + 'box-25, the koala\'s dish — the largest ear in the bank at 0.743, the only RADIAL one, '
    + 'the only one mounted x +1 — turned a quarter about z so it stands on the crown and '
    + 'stretched 1.8x on its own thickness, which takes its aspect from 1:1:0.469 to 1:1:0.843. '
    + 'That is the roundest solid this bank can be made to hold. YOUR CHEAPEST DIAL IS '
    + 'DOME_SINK: every 1/16 shallower is another 0.0464 of skull, and at 9/16 it stands 0.325 '
    + 'proud against the koala\'s own 0.346. THE RING OF KNOBS a real pachycephalosaur wears '
    + 'round the dome\'s base is a ridge of cone-01 with rows [top] at 34 triangles a copy, and '
    + 'this animal measures 632 against the ceiling of 951, so there are 319 left. NEW '
    + 'PALETTE, UNREVIEWED.',
})
