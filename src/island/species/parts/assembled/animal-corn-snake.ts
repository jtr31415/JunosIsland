/**
 * The corn snake — Home Pets' FIFTEENTH, and the collection's first legless
 * member. One of the two that has kept Home Pets at 14 of 16.
 *
 * `collections/home-pets.ts` never carried a record for it, for the same reason
 * `garden.ts` never carried one for the slow worm: `legs` is structural in the
 * quadruped kit — four boxes, always built, clamped at a 0.25 minimum — so that
 * kit cannot say "snake" without lying about the animal. `CreatureDef.legs`
 * takes `false`, so this kit can, and the gap closes with nothing invented.
 *
 * ## Why this animal is worth completing rather than skipping
 *
 * `completion()` divides by ROSTER size, so a collection that can never be fully
 * built can never complete, never goes inactive, and never releases one of the
 * four active slots JT-027 allows. Home Pets and Africa have been holding two of
 * those four permanently. This species and the goldfish are Home Pets' half of
 * that.
 *
 * ## The height, checked FIRST, because leglessness is what threatens it
 *
 * The same trap the slow worm documents, and it is worth restating rather than
 * cross-referencing, because it is the gate every legless species fails first:
 * a bare cube on standard legs measures exactly `HEIGHT_FLOOR`, 1.43125, of
 * which 0.18125 is the leg row holding the hull off the ground. **Take the legs
 * away and that 0.18125 goes with them**, leaving the hull's own 1.250 — 0.18
 * under the pack's own floor, with no feature able to pay it back except a crest
 * standing proud of the back, which a snake does not have.
 *
 * **The coil pays it, and it is the animal rather than a prop.** With no legs the
 * belly IS the foot, and the gap the pack reserves under every hull is exactly
 * the space a resting snake fills with its own body. The ring below is placed to
 * land its underside on y = 0 — the plane the feet would have stood on — so the
 * lowest thing on this animal is the animal.
 *
 * ## THE COIL IS THE SLOW WORM'S, DELIBERATELY, AND THAT IS NOT COPYING
 *
 * Same shape, same spin, same solved sink. This is the kit's ANSWER TO
 * LEGLESSNESS, not a decoration either species chose, and it was derived once
 * against the one plane in the kit that never moves. Re-deriving it here with a
 * different ring to look original would mean a second, unproven transform doing
 * a job a proven one already does — and the two animals are in different
 * collections, so they are never on a page together. **Where these two species
 * separate is everything above the belly**, which is the next section.
 *
 * ## Every number, and where it came from
 *
 *   - **The hull is the cube and the eyes are the eye plane**, neither mentioned
 *     below, because both are what `defineCreature` gives a definition that says
 *     nothing: `box-03` at the pack's own `[0, 0.80625, 0]`, two `plate-01` at
 *     the card's own recorded (0.2625, 0.933646) on the absolute z = 0.6350.
 *
 *   - **No snout, no nose, no ears, and each absence is the animal.** A snake's
 *     head runs straight out of its body with no neck and no muzzle to speak of,
 *     and it has no external ear at all. At 0.16 scale a muzzle on a snake would
 *     read as a mammal.
 *
 *   - **The coil is `box-04`, the bee's shell-ring, turned FLAT.** Its measured
 *     attachment is `x +1` — it is worn as a ring AROUND a torso — and
 *     `{ axis: 'x', deg: 90 }` lays that ring into the ground plane, baked into
 *     the copy's vertices (rule 4 as amended) rather than as a node transform.
 *     `axis: 'z', dir: 1` is the facing that spin turns into straight down, so
 *     the ring hangs UNDER the body rather than off its side.
 *
 *   - **The coil is shrunk to 1.000 across, and rule 3 is the reason.** At its
 *     own 1.335 the ring's bounding volume is 0.813 against the hull's 1.953, a
 *     ratio of 2.4 — under the harness's 3, and that number is the fault that
 *     scrapped 72 animals arriving as a hoop instead of as a head. At 1.000,
 *     16/16 on the pack's own authoring grid, it is 0.456 of the hull, the ratio
 *     is 4.3, and it sits INSIDE the hull's own 1.250 so it costs no keep-out.
 *
 *   - **The coil's sink is solved, not chosen.** Joined at `HULL_BOTTOM_Y` and
 *     sunk the fraction of its own thickness that leaves 0.18125 below that
 *     plane, which puts its underside on y = 0: `(0.456 - 0.18125) / 0.456`.
 *
 *   - **THE SADDLES ARE WHERE THIS ANIMAL SEPARATES FROM THE SLOW WORM**, and
 *     they are the one thing a child would name about a corn snake: the row of
 *     big blunt dorsal blotches down its back. The shape is `wedge-04`, the ear
 *     four of the pack's own animals share, and it is here for its BURIAL rather
 *     than its outline — the pack wears it sunk 0.651 of its own extent, so
 *     0.349 of a 0.341 part shows: **0.119 proud of the back**, against the slow
 *     worm's `box-08` annulation at 0.081. A coarse, tall, widely spaced blotch
 *     against a fine even one, which is exactly the difference between a corn
 *     snake's saddles and a slow worm's body rings. The two legless animals
 *     therefore differ in the one place either of them has anything at all.
 *
 *   - **A DONOR'S BURIAL ONLY TRANSFERS IF ITS AXIS DOES, and the first choice
 *     here was wrong for that reason.** `box-27`, the koala's ear, was picked
 *     first on its 0.933 burial, which should have shown 0.019. Built, the animal
 *     measured 1.572 — 0.141 proud, seven times the prediction. `box-27`'s
 *     attachment is `z +1`: it is a FORWARD-facing ear, and its burial was
 *     measured into a face the ridge does not mount on. A ridge mounts radially,
 *     so only a shape whose own attachment is `y +1` carries a number that means
 *     anything here. `box-08` is `y +1`, which is why the slow worm's 0.081 came
 *     out exact, and `wedge-04` is `y +1`, which is why this one's 0.119 does.
 *     **Check the donor's axis before trusting its sink.**
 *
 *   - **Five rows through a half turn make the body read ROUND**, §8's chamfer
 *     idiom used for exactly what §8 says it is for. Stations at +/-0.375 and 0
 *     are the hedgehog's own, well inside what the burial allows before the
 *     chamfer falls away.
 *
 *   - **Rule 9's budget is a FLOOR as well as a ceiling, and leglessness is what
 *     makes that bite.** A hull, a coil and two eye cards are 206 triangles,
 *     because four legs (176) went out with the `legs: false`. The saddles are
 *     therefore load-bearing twice — they are the marking AND they are what keeps
 *     this animal as dense as the pack it stands beside. At 15 copies of a
 *     38-triangle shape the model is 776, between the mouse's 732 and the pack's
 *     951.
 *
 *   - **The belly line is 7/16, one notch above the slow worm's 6/16.** §7
 *     measured the pack's mammal boundary wandering across 0.4808-0.5481; that is
 *     a mammal's line and this is a snake, whose pale part is the venter. But a
 *     corn snake's ventral scales are a single wide row that wraps visibly onto
 *     the flank, higher than a slow worm's, so 0.4375 rather than 0.375 — still
 *     below the mammal zone, and the nearest point on the pack's 1/16 grid.
 *
 * ## THE PALETTE IS NEW AND NOBODY HAS SIGNED IT OFF
 *
 * Like the slow worm's and for the same reason: this species was never in its
 * collection file to be given colours, so the three below are the first ever
 * proposed for it and they are UNREVIEWED. A corn snake is a rust-orange animal
 * with darker red saddles and a boldly pale belly — the amelanistic pet morph,
 * which is the one a child meets, rather than the wild grey-brown. **Joe should
 * look at them.** The `flag` says so where he reads it, and nothing downstream
 * treats them as agreed.
 *
 * **Flagged**, and only for that: no rule was strained. Measured on the built
 * model — 776 triangles inside 422-951; height 1.5504 inside 1.43-2.02, which is
 * the pack's own floor plus the saddles' 0.119; feet on y = 0 exactly; widest
 * 1.488, so keep-out 0.744 against the fox's 1.15; every part at its own measured
 * burial or at a fraction solved from the hull, and the one mass is the mass.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/* `COIL_THICK` (0.456) and `COIL_ACROSS` (1.335) were `box-04`'s own measured
 * thickness and diameter — the bank's z, and x/y, extent for the shape. They fed
 * only the two constants below and went unread with them. */
/*
 * TWO SOLVED CONSTANTS WERE REMOVED ON 4 AUGUST — the editor's push inlined their
 * values and left them declared and unread, which fails `tsc --noEmit`:
 *
 *   COIL_STRETCH  0.749064  the coil laid flat is 1.000 across — 16/16 on the
 *                           pack's grid, and not a taste: at the ring's own 1.335
 *                           its bounding volume is 0.813 against the cube's
 *                           1.953, a ratio of 2.4, where rule 3 wants a feature
 *                           to be a detail on the mass rather than a second one.
 *                           At 1.000 the ratio is 4.3 and the ring is inside the
 *                           hull's own width, so it costs no keep-out either.
 *   COIL_SINK     0.602522  sunk so the coil's underside lands on y = 0, where
 *                           the feet would have been: joined at `HULL_BOTTOM_Y`,
 *                           the share of its thickness below that plane is the
 *                           0.18125 the pack reserves under every hull.
 */

export const CORN_SNAKE_ASSEMBLY = defineCreature('animal-corn-snake', {
  palette: {
    coat: 0xd98a5a,
    belly: 0xf4ece1,
    saddle: 0xb5432f,
    pupil: PACK_PUPIL,  // the pack's own measured pupil; see texture.ts
  },

  belly: 0.4375,
  legs: false,
  ridge: { part: 'wedge-04', paint: 'saddle', name: 'saddle', count: 3, span: 0.375 },
  extras: [
    {
      name: 'coil',
      part: 'box-04',
      paint: 'belly',
      spin: [{ axis: 'x', deg: 90 }, { axis: 'x', deg: 90 }],
      stretch: [0.7490636704119851, 0.7490636704119851, 1],
      axis: 'z',
      dir: 1,
      at: [0, 0.725, -0.65],
      sink: 0.6025219298245615,
    },
  ],
  flag: 'NEW PALETTE, UNREVIEWED — the first corn snake ever built, and the first '
    + 'colours ever proposed for it: nothing in home-pets.ts signed these off. They are '
    + 'the amelanistic pet morph, not the wild grey-brown.',
})
