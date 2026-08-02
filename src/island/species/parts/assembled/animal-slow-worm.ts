/**
 * The slow worm — Garden's FOURTEENTH, and the one that has never been built.
 *
 * `collections/garden.ts` says why, and this file is that note being discharged:
 *
 * > A slow worm is a legless lizard; `legs` is structural in this kit (four
 * > boxes, always built) and clamps at a 0.25 minimum, so the quadruped kit
 * > cannot express it without lying about the animal. [...] a species missing
 * > from a collection is an honest gap, and a lizard with four legs is not.
 *
 * That was true of the QUADRUPED kit and it is not true of this one:
 * `CreatureDef.legs` takes `false`, and a species that says so gets no leg
 * feature at all. So the gap closes with `legs: false` and nothing invented —
 * which is the whole species in one field, and the reason it is the first thing
 * below.
 *
 * ## The height, checked FIRST, because dropping the legs is what threatened it
 *
 * `HEIGHT_FLOOR` says 1.43 is a floor with 0.00125 of headroom, and a bare cube
 * on standard legs is exactly that 1.43125: the hull is 1.250 tall and the leg
 * row holds its bottom at `HULL_BOTTOM_Y` = 0.18125 above the ground.
 *
 * **Take the legs away and 0.18125 of that goes with them.** The hull's own
 * 1.250 is all that is left, the animal is 0.18 UNDER the pack's own minimum,
 * and no amount of ears or tails put it back — a feature on top would have to
 * stand 0.18 proud of the back to pay for it, which is a crest, not a lizard.
 * This species fails the first gate before anything else is decided.
 *
 * **The coil is what pays it, and that is not a convenience.** A legless animal
 * has to sit on something: with the legs gone the belly IS the foot, and the
 * 0.18125 the pack reserves under every hull is the gap a slow worm fills with
 * its own body. So the ring below is placed to land its underside exactly on
 * y = 0 — the plane the feet would have stood on — and the animal measures the
 * pack's own floor plus whatever the back rows add. Nothing is propped up: the
 * lowest thing on this animal is the animal.
 *
 * ## Every number, and where it came from
 *
 *   - **The hull is the cube and the eyes are the eye plane**, neither mentioned
 *     below, because both are what `defineCreature` gives a definition that says
 *     nothing: `box-03` at the pack's own `[0, 0.80625, 0]`, two `plate-01` at
 *     the card's own recorded (0.2625, 0.933646) on the absolute z = 0.6350.
 *     A slow worm has small dark eyes with lids — it is a lizard and not a snake
 *     — and the pack's card is small and dark. Rule 5 is unsayable here anyway.
 *
 *   - **There is no snout, no nose, no ears and no tail, and each absence is the
 *     animal.** A slow worm's head is a continuation of its body with no neck
 *     and barely a muzzle, and its tail is the same: no join, no taper anybody
 *     can see at 0.16 scale. The four features every other Garden species
 *     separates on are all absent here, which is itself the separation — no
 *     other member of the collection is a bare body.
 *
 *   - **The coil is `box-04`, the bee's abdomen shell-ring, turned FLAT.** Its
 *     measured attachment is `x +1` — it is worn as a ring AROUND a torso — and
 *     `{ axis: 'x', deg: 90 }` lays that ring down into the ground plane, which
 *     is a rotation baked into the copy's vertices (rule 4 as amended) and not a
 *     node transform. `axis: 'z', dir: 1` is the facing that spin turns into
 *     straight down, so the ring hangs UNDER the body rather than off its side.
 *
 *   - **The coil is shrunk to 1.000 across, and rule 3 is the reason.** At its
 *     own 1.335 the ring's bounding volume is 0.813 against the hull's 1.953 —
 *     a ratio of 2.4, under the harness's 3, and that number is the fault that
 *     scrapped 72 animals arriving as a hoop instead of as a head. Stretched to
 *     **1.000 — 16/16 on the pack's own authoring grid** — it is 0.456 of the
 *     hull and the ratio is 4.3. It is also then INSIDE the hull's own 1.250, so
 *     the coil costs no keep-out at all; the widest thing on this animal is the
 *     back row, not the coil. Rule 1's first verb is "stretch", and this is it:
 *     one shape, its own proportions in-plane, its own thickness untouched.
 *
 *   - **The coil's sink is solved, not chosen.** Joined at `HULL_BOTTOM_Y` —
 *     the one plane in the kit that never moves — and sunk the fraction of its
 *     own 0.456 thickness that leaves 0.18125 of it below that plane, which puts
 *     its underside on y = 0. `(0.456 - 0.18125) / 0.456 = 0.6025`. The top of
 *     the ring is then 0.275 up inside the belly, where the hull is still
 *     0.5875 wide against the ring's own 0.5, so it is embedded and not perched.
 *     It is painted from the pale slot, like the belly patch it continues: the
 *     coil is this animal's underside, not a plinth under it.
 *
 *   - **The back rows are the chamfer idiom, used for exactly what §8 says it is
 *     for.** "Any species whose whole silhouette question is 'does the back read
 *     as a curve'" — which is the whole of this animal, since a legless lizard
 *     is nothing but the curve of its body. Five rows (top, both chamfers, both
 *     sides) put five facings evenly through a half turn, and the cube reads
 *     round. The shape is `box-08`, a rounded box the pack itself wears BURIED
 *     0.752 of its own extent, so it is placed at that measured burial and 0.081
 *     of it shows: an annulation, which a slow worm has, rather than a spine,
 *     which it does not. Stations at +/-0.375 and 0 — the hedgehog's own, and
 *     well inside the 0.558 the sink allows before the chamfer falls away.
 *
 *   - **Rule 9's budget is a FLOOR as well as a ceiling, and this is where it
 *     bites.** The pack's own lightest model is 422 triangles; a hull, a coil
 *     and two eye cards are 206, because four legs (176) went out with the
 *     `legs: false`. The rows are therefore load-bearing twice over — they are
 *     what makes the body read round AND what keeps this animal as dense as the
 *     pack it stands beside — and at 15 copies of a 38-triangle shape the model
 *     is 776, between the mouse's 732 and the pack's 951.
 *
 *   - **The belly line is 6/16, not the mouse's 8/16.** §7 measured the pack's
 *     mammal belly boundary wandering across 0.4808-0.5481; that is a mammal's
 *     line and this is a lizard, whose pale part is the venter only. 0.375 is
 *     the nearest point on the pack's own 1/16 grid below that zone.
 *
 * ## THE PALETTE IS NEW AND NOBODY HAS SIGNED IT OFF
 *
 * Every other species in this directory paints from four colours that were
 * agreed in `collections/garden.ts` before the geometry was built. **This one
 * has none** — the slow worm was never in that file to be given any, so the
 * four below are the first ever proposed for it and they are UNREVIEWED. They
 * are: a glossy coppery-brown coat, a paler underside, and one dark slot for the
 * dorsal line and the flanks, which is the marking a female slow worm carries
 * and the only patterning the animal has. **Joe should look at them.** The
 * `flag` says so where he reads it, and nothing downstream treats them as
 * agreed.
 *
 * **Flagged**, and only for that: no rule was strained. 776 triangles inside
 * 422-951, height on the pack's own floor before the back rows lift it, keep-out
 * 0.71 against the fox's 1.15, every part at its own measured burial or at a
 * fraction solved from the hull, and the one mass is the mass.
 */
import { defineCreature } from '../creature'
import { HULL_BOTTOM_Y } from '../hulls'
import { PACK_PUPIL } from '../texture'

/** `box-04`'s own thickness, measured: the bank's z extent for the shape. */
const COIL_THICK = 0.456
/** `box-04`'s own diameter, measured: the bank's x and y extent for the shape. */
const COIL_ACROSS = 1.335
/**
 * The coil, laid flat, is 1.000 across — 16/16 on the pack's own grid.
 *
 * Not a taste: at the ring's own 1.335 its bounding volume is 0.813 against the
 * cube's 1.953, a ratio of 2.4, and rule 3 wants a feature to be a detail on the
 * mass rather than a second one. At 1.000 the ratio is 4.3 and the ring is
 * inside the hull's own width, so it costs no keep-out either.
 */
const COIL_STRETCH = 1 / COIL_ACROSS

/**
 * Sunk so the coil's underside lands on y = 0 — where the feet would have been.
 *
 * Joined at `HULL_BOTTOM_Y`, so the share of its own thickness that must sit
 * BELOW that join plane is the 0.18125 the pack reserves under every hull, and
 * the share buried above it is the rest. 0.602522.
 */
const COIL_SINK = (COIL_THICK - HULL_BOTTOM_Y) / COIL_THICK

export const SLOW_WORM_ASSEMBLY = defineCreature('animal-slow-worm', {
  palette: {
    coat: 0x9c7a4e,
    belly: 0xc9b493,
    flank: 0x4b3a2c,
    pupil: PACK_PUPIL,  // the pack's own measured pupil; see texture.ts
  },

  belly: 0.375,
  legs: false,
  ridge: { part: 'box-08', paint: 'flank', name: 'scale', count: 3, span: 0.375 },
  extras: [
    {
      name: 'coil',
      part: 'box-04',
      paint: 'belly',
      spin: [{ axis: 'x', deg: 90 }, { axis: 'x', deg: 90 }],
      stretch: [0.749064, 0.749064, 1.1],
      axis: 'z',
      dir: 1,
      at: [0, 0.7875, -0.575],
      sink: 0.6025219298245615,
    },
  ],
  flag: 'NEW PALETTE, UNREVIEWED — the first slow worm ever built, and the first '
    + 'colours ever proposed for it: nothing in garden.ts signed these off. The coil is '
    + 'the bee\'s shell-ring worn flat, which no donor did.',
})
