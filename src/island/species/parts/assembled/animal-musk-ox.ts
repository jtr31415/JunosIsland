/**
 * The musk ox — the SKIRT is the animal, and `box-29` is the only shape in the
 * bank that can be one.
 *
 * A musk ox in silhouette is a curtain of hair hanging from the shoulder to the
 * ground with a head sticking out of it. `box-29` is the lion's mane ring —
 * 1.650 x 1.650 x 0.500, the biggest shell-ring in the bank — and
 * `animal-sheep.ts` §2 already measured every one of the five against every
 * hull, and found this is the only one that reads on a stocky body: the other
 * four stand between 0.027 and 0.047 proud of `box-41` or go NEGATIVE and are
 * swallowed whole. This one stands 0.150 proud and 0.825 above and below its own
 * centre, which is exactly the overhang the sheep refused, in the one animal
 * that wants it: *"a ring that clears an animal's own spine by a quarter of a
 * unit is a MANE"*, and a musk ox's skirt is a mane that goes all the way round.
 *
 * **IT IS CUT TO 0.52 ON ITS OWN DEPTH AND THAT IS AN ENGINE INVARIANT, NOT A
 * TASTE.** `assembly-assert.ts`'s one-mass check requires the hull's bounding
 * volume to be more than 3x the next largest mesh. At full size this ring is
 * 1.3612 against `box-41`'s 2.3693 — a ratio of 1.74, so the skirt would BE a
 * second mass, which is the fault that scrapped 72 animals. At 0.52 on z it is
 * 0.7078 and the ratio is 3.35. `animal-vulture.ts` cut the same shape for the
 * same reason and its `RUFF_STRETCH` comment is the precedent; the difference is
 * that a vulture's ruff cuts x and y and this one must not, because the whole
 * point is that it reaches the ground.
 *
 * **The height is solved, not chosen.** Centred at y = 0.84 the ring runs
 * 0.015 to 1.665. Its bottom stays ABOVE zero, which matters: `buildAssembly`
 * grounds the model on its lowest point, so a ring that dipped below the feet
 * would lift the legs off the floor and `assembly-assert.ts` fails that outright.
 *
 * **THE HORNS ARE THE SAME GAP `animal-buffalo.ts` PRICED.** A musk ox's horns
 * come down the sides of the skull as a fused boss and hook up at the tips, and
 * rule 4 as amended bakes a ROTATION into a copy's vertices — it turns a part
 * and cannot bend one, and not one of the bank's 100 shapes is curved. So the
 * horns here are a straight pair driven out and DOWN, which is the half a
 * straight shape can say, and the boss is `box-24`, the hog's nose disc, flattened
 * across the brow. That boss is the one thing this file does better than the
 * buffalo: that animal used `bespoke-square-01`, an authored primitive, where a
 * lifted part does the same job under rule 1.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/** `box-41`'s FLAT plates, which are `box-03`'s at the same world coordinates. */
const CROWN_Y = 1.43125
const FLANK_PLATE_X = 0.625
/** The bounding front — the tiger's muzzle boss, 0.100 proud of the flat plate. */
const BOSS_Z = 0.725

/**
 * The skirt's depth, and it is the one-mass invariant rather than a preference.
 * `box-29` is 1.650 x 1.650 x 0.500 = 1.3612 and `box-41` is 2.3693; the harness
 * wants a ratio over 3, so the ring may occupy at most 0.7898. Cutting only its
 * DEPTH keeps the reach to the ground, which is the whole animal: 0.52 gives
 * 0.7078 and a ratio of 3.35.
 */
const SKIRT_STRETCH: [number, number, number] = [1, 1, 0.52]

/**
 * The skirt's centre. Its half-height is 0.825, so this puts its hem at 0.015 —
 * just above the ground, and deliberately not below it: the model is grounded on
 * its lowest point, so a hem under zero lifts the feet off the floor.
 */
const SKIRT_Y = 0.84

export const MUSK_OX_ASSEMBLY = defineCreature('animal-musk-ox', {
  palette: {
    coat: 0x4a3b2e,    // UNREVIEWED: the saddle, a dusty brown
    skirt: 0x241c16,   // UNREVIEWED: near-black, the hanging guard hair
    horn: 0xd0c3a6,    // UNREVIEWED: pale horn and the boss
    pale: 0xc8bda9,    // UNREVIEWED: the sclera, and a musk ox's pale stockings
    mark: 0x1a1512,    // UNREVIEWED: the muzzle pad
    limb: 0xbfb39c,    // UNREVIEWED: the legs — a musk ox's are pale below the skirt
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  hull: { part: 'box-41' },
  /* No belly line. A musk ox is one colour above the skirt and the skirt is
   * where every boundary on this animal actually is. */
  under: 'pale',

  /* Short and planted. The skirt hides most of the leg, which is the point. */
  legs: { x: 0.34, z: 0.28 },

  eyes: { part: 'plate-01', y: 1.02 },

  /* The polar bear's nose, on the boss this shell already carries — a bovine's
   * muzzle pad is what that geometry is for. */
  snout: { part: 'box-40', paint: 'mark', at: [0, 0.70, BOSS_Z] },

  /* NO TAIL. A musk ox's is buried in the skirt and is not visible on a living
   * animal; a stub here would be 80 triangles of something nobody can see. */

  extras: [
    /* THE SKIRT. See the header: cut on DEPTH only, because the reach to the
     * ground is the animal and the one-mass ratio is what pays for it. */
    {
      name: 'skirt',
      part: 'box-29',
      paint: 'skirt',
      stretch: SKIRT_STRETCH,
      sink: 0.5,
      at: [0, SKIRT_Y, 0.05],
    },

    /* THE HORNS, out and DOWN. `{ y, 90 }` takes wedge-13's `z +1` to `x +1` —
     * `animal-ox.ts`'s own first spin — and `{ z, -35 }` then drops it to
     * (0.819, -0.574, 0). The buffalo's rise 15 degrees; these fall 35, which is
     * the only half of a musk ox's horn a straight shape can say. */
    {
      name: 'horn',
      part: 'wedge-13',
      paint: 'horn',
      kind: 'pair',
      stretch: [1, 1, 1.4],
      spin: [{ axis: 'y', deg: 90 }, { axis: 'z', deg: -35 }],
      at: [FLANK_PLATE_X, 1.20, 0.16],
    },

    /* THE BOSS, and it is a LIFTED part rather than the buffalo's authored bar.
     * The hog's nose disc flattened across the brow: same job, rule 1 satisfied
     * without spending a bespoke shape on it. */
    {
      name: 'boss',
      part: 'box-24',
      paint: 'horn',
      stretch: [1.7, 0.45, 0.8],
      sink: 0.35,
      at: [0, CROWN_Y, 0.20],
    },
  ],

  flag: 'THE SKIRT IS THE ANIMAL AND IT IS CUT BY AN ENGINE RULE, NOT BY EYE. box-29 is the '
    + 'LION\'S MANE ring, 1.650 x 1.650 x 0.500, and animal-sheep.ts §2 already measured that '
    + 'it is the only one of the bank\'s five shell-rings that reads on a stocky hull — the '
    + 'other four stand 0.027 to 0.047 proud or go negative and are swallowed. That file '
    + 'REFUSED it because a ring clearing the spine by a quarter of a unit is a mane; a musk '
    + 'ox\'s skirt is a mane that goes all the way round, so this is the animal it was always '
    + 'right for. It is stretched to 0.52 on DEPTH ONLY and that number is assembly-assert.ts\'s '
    + 'one-mass ratio: at full size the ring is 1.3612 against box-41\'s 2.3693, a ratio of '
    + '1.74, and the harness demands over 3. Cutting x or y instead would shorten the reach to '
    + 'the ground, which is the whole animal, so the depth is what pays. Its hem sits at 0.015 '
    + 'and MUST NOT go below zero: the model grounds on its lowest point, so a longer skirt '
    + 'lifts the feet off the floor. THE HORNS ARE THE SAME GAP animal-buffalo.ts PRICED — a '
    + 'musk ox\'s horns drop down the skull and hook up, rule 4 bakes a rotation and cannot '
    + 'bend a part, and no shape in the bank is curved. These fall 35 degrees and stop, which '
    + 'is the half a straight shape can say. THE BOSS IS A LIFTED PART and not the buffalo\'s '
    + 'bespoke bar: box-24, the hog\'s nose disc, flattened across the brow. NEW PALETTE, '
    + 'UNREVIEWED. THERE IS NO TAIL, deliberately — a musk ox\'s is inside the skirt.',
})
