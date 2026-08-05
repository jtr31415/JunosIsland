/**
 * PLACEHOLDER — NOT A FINISHED ANIMAL. Joe, 5 August: *"put something in for the
 * unbuildable ones anyway so i can do it manually."* This is that entry.
 *
 * ## What is missing, measured, and it is THREE things and not one
 *
 * **1. THE HIND LEG. There is one leg shape in the bank and it is 0.30625 tall.**
 * `box-01` occurs 86 times across 23 of the 24 originals and it is ONE shape, at
 * one absolute row height (`LEG_ROW.y` = 0.18125, which is what puts feet on
 * y = 0 on nine of the pack's ten hulls). A kangaroo is two thirds hind leg.
 * `animal-ostrich.ts` hit this wall first and its flag says it plainly: there is
 * no dial that lengthens a leg. Stretching one is not available either — `legs`
 * takes stations and a paint and nothing else.
 *
 * **2. THE HULL CANNOT BE STOOD UP.** `HullDef` is `part`, `at` and `paint`, and
 * that is the whole of it: no `spin`, no `stretch` (`never`, on Joe's ruling of
 * 2 August). Every hull in this project lies with its long axis along z. A
 * kangaroo's trunk is UPRIGHT, and rule 3 forbids a second mass, so the body
 * cannot be tilted and cannot be split into an upright chest and a haunch.
 *
 * **3. THE TAIL IS A THIRD LEG and nothing here can bear weight on it.** A
 * resting kangaroo is a tripod. Every tail in the bank joins the rear face and
 * trails; the only tail idiom that leaves the body at an angle is
 * `chamfer: true`, which carries it UP, which is the opposite.
 *
 * ## What is standing in
 *
 * `box-33`, the monkey's plain cube — chosen over `box-21`, the tallest, for a
 * measured reason: `animal-wolf.ts` established that `box-21` is a 1.250 cube
 * with two fused EAR LUGS on top, so a kangaroo on it would have four ears. Two
 * `box-01` legs at the hull's midline, on the pack's own row, which is
 * `animal-chicken.ts`'s biped station. `box-06`, the bunny's ear and the biggest
 * in the bank at 0.913 — that is real, a kangaroo's ears are its tallest point,
 * and it takes the animal to 2.0100 against the pack's 2.02 ceiling, which is
 * `animal-fennec-fox.ts`'s own number on the same shell. `wedge-03`, the
 * beaver's paddle, which is the most strongly tapering tail in the bank (0.58
 * against the six others' 0.84 to 0.99) and therefore the nearest thing to a
 * thick tapering prop, hung LOW on the rear face so it trails to the ground.
 *
 * **If you are doing this by hand:** the tail's height is the cheapest dial —
 * dropping it below 0.4938 takes its root off the flat rear face onto the
 * chamfer, so 0.55 is close to the floor already. Everything else wants a
 * commissioned long hind leg, and that one part would also finish the quokka,
 * the emu and the ostrich.
 */
import { defineCreature } from '../creature'
import { LEG_ROW } from '../hulls'
import { PACK_PUPIL } from '../texture'

/**
 * As low on the rear face as the tail's root can sit and stay on flat geometry.
 *
 * `box-33`'s flat rear face runs y 0.4938 to 1.1187 — the hull centre plus or
 * minus its own 0.3125 — and `wedge-03` is 0.862 tall, so its root spans
 * 0.431 either side of wherever it is centred. 0.55 is the lowest 1/16 notch
 * that keeps the whole cross-section reachable; lower and the root hangs off the
 * bottom-rear chamfer with nothing buried to cover the fall.
 */
const TAIL_Y = 0.5625

export const KANGAROO_ASSEMBLY = defineCreature('animal-kangaroo', {
  palette: {
    coat: 0x9d6f4e,    // UNREVIEWED: the red kangaroo's rusty buck
    belly: 0xe3d4bc,   // UNREVIEWED: the pale chest and underside, and the sclera
    mark: 0x3b2f26,    // UNREVIEWED: the dark nose and the ear rims
    limb: 0x86593a,    // UNREVIEWED: the legs and the muzzle, a shade under
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* The monkey's plain cube. NOT box-21: animal-wolf.ts measured that shell as a
   * cube with two fused ear lugs, and this animal needs its own ears. */
  hull: { part: 'box-33', paint: 'coat' },

  /* 8/16 — the tiger's mammal line made exact, and this cube's own equator. */
  belly: 0.5,

  /* THE EARS, and the one thing on this animal that is honestly right. The
   * bunny's ear on the bunny's own cube: joined at 1.43125, sunk its own
   * 0.366259, crown at 2.0100 against the pack's 2.02. Nothing may stand above
   * it — animal-fennec-fox.ts's own warning, on the same shape and shell. */
  ears: { part: 'box-06', paint: { base: 'coat', byBand: { 5: 'mark' } } },

  /* The deer's muzzle, the longest plain tube in the bank at 0.532 of reach. */
  snout: { part: 'tube-03', paint: 'limb' },

  nose: { part: 'box-09', paint: 'mark', on: 'snout' },

  /* THE PROP. The beaver's paddle, taper 0.58 — the most strongly tapering tail
   * in the bank against six that run 0.84 to 0.99 — hung as low on the flat rear
   * face as its own root allows. See TAIL_Y. */
  tail: { part: 'wedge-03', paint: 'coat', at: [0, TAIL_Y, -0.625] },

  legs: false,
  extras: [
    /* TWO legs on the pack's own row, at `box-01`'s own recorded x and the hull's
     * midline — animal-chicken.ts's biped station, and the only one there is. */
    {
      name: 'leg',
      part: 'box-01',
      paint: 'limb',
      kind: 'pair',
      sink: LEG_ROW.sink,
      at: [0.25, LEG_ROW.y, 0],
    },
  ],

  flag: 'PLACEHOLDER, NOT A FINISHED ANIMAL — put in so you can do it by hand. THREE things '
    + 'are missing and all three are measured. (1) THE HIND LEG: box-01 is the only leg shape '
    + 'in the bank, it occurs 86 times across 23 of the 24 originals, it is 0.30625 tall, and '
    + 'it sits at one absolute row height of 0.18125 because that is what puts feet on y = 0. '
    + 'A kangaroo is two thirds hind leg and there is no dial that lengthens one — '
    + 'animal-ostrich.ts hit the same wall and said the same thing. (2) THE HULL CANNOT BE '
    + 'STOOD UP: HullDef is part, at and paint and nothing else — no spin, and stretch is '
    + '`never` on your own ruling of 2 August — so the upright trunk that makes a kangaroo a '
    + 'kangaroo is unsayable, and rule 3 forbids splitting it into a chest and a haunch. (3) '
    + 'THE TAIL IS A THIRD LEG: a resting kangaroo is a tripod, every tail in the bank joins '
    + 'the rear face and trails, and the one idiom that angles a tail (chamfer: true) carries '
    + 'it UP. WHAT IS HERE is the monkey\'s plain cube — box-21 is taller but animal-wolf.ts '
    + 'measured it as a cube with two fused EAR LUGS and this animal needs its own ears — two '
    + 'legs on the biped station, the bunny\'s ear which really is the tallest thing on a '
    + 'kangaroo and takes it to 2.0100 against a 2.02 ceiling, and the beaver\'s paddle hung '
    + 'low as the prop, that being the most strongly tapering tail in the bank at 0.58 against '
    + 'the other six\'s 0.84 to 0.99. THE ONE PART THAT WOULD FIX THIS is a long hind leg, and '
    + 'it would finish the quokka, the emu and the ostrich in the same commission.',
})
