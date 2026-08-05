/**
 * The sloth bear — the shaggy one, and the third of three black bears built in
 * one collection.
 *
 * Its two famous features are a **long pale mobile snout** and a **shaggy mane
 * over the shoulders**, and both are reachable without inventing anything:
 *
 *   - **The mane is the hedgehog's repeat-and-sink**, one row of five `cone-01`
 *     on the top face, spun a half turn so the points sweep BACKWARDS over the
 *     shoulder rather than standing up. `animal-kiwi.ts` established that a row
 *     of buried cones reads as hair rather than as spines and this is the second
 *     species to spend it. One row and not three: three would be a hedgehog, and
 *     a sloth bear's shag is on top of it and nowhere else.
 *   - **The snout is `tube-07` at 1.5x its own reach**, which is the long end of
 *     the three-bear muzzle family `animal-sun-bear.ts` sets out — 0.7 there,
 *     0.85 on `animal-moon-bear`, 1.0 on Woodland's `animal-bear`, 1.5 here. §3
 *     measured the pack's own snouts varying 2.90x naturally, so a 1.5 is well
 *     inside what Kenney himself drew.
 *
 * **`box-12`, the widest shell in the bank at 1.539484, and no bear is on it.**
 * Woodland's brown bear takes `box-41`, the frozen polar bear is on the cube and
 * the frozen panda on `box-36`; the sun bear and the moon bear here are on cubes
 * too. A sloth bear is broad-shouldered and rangy, and the widest shell is the
 * only way that can be said, since a hull is never scaled.
 *
 * ## Two things that are absent, and both on purpose
 *
 * **There is no tail.** A sloth bear's is a short tuft, and `box-18` at 80
 * triangles would have taken this animal from 903 to 983, over the pack's
 * measured 951. Given a choice between a tail nobody looks at and the CLAWS,
 * which are the second thing anybody says about the species, the claws won.
 *
 * **The chest Y is one card, not two strokes.** A sloth bear's mark is a V or a
 * Y; `plate-10` turned forward is a rectangle. `animal-sun-bear.ts` carries the
 * same limitation on the same week and `animal-moon-bear.ts` has the one hull
 * band in the pack that could have done better.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/** `box-12`'s flat front plate, plus the 0.010 of daylight the pack gives a card. */
const CHEST_Z = 0.635

/**
 * The long end of the three-bear muzzle family. `tube-07` is 0.532 x 0.300 x
 * 0.266 and is the deepest nose in the bank; 1.5 on its own reach takes it to
 * 0.399, and the 0.95 across and up keeps it narrow, which is what makes it read
 * as a snout rather than as a wider face.
 */
const SNOUT_STRETCH: [number, number, number] = [0.95, 0.95, 1.5]

export const SLOTH_BEAR_ASSEMBLY = defineCreature('animal-sloth-bear', {
  palette: {
    coat: 0x2a2422,    // UNREVIEWED: shaggy near-black, the first ever proposed here
    belly: 0xe2d9c6,   // UNREVIEWED: the sclera, and the chest mark
    muzzle: 0xd8cdb4,  // UNREVIEWED: the long pale snout, which is half the animal
    claw: 0xe8e2d2,    // UNREVIEWED: the ivory fore-claws
    mark: 0x171312,    // UNREVIEWED: the nose pad
    limb: 0x1e1a18,    // UNREVIEWED: the legs, a shade under the coat
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* THE WIDEST SHELL IN THE BANK, and no other bear in the project wears it. */
  hull: { part: 'box-12' },

  /* No belly line: a sloth bear is one colour underneath, and the chest mark is
   * a card rather than a boundary. */

  legs: { x: 0.36, z: 0.30 },

  /* THE MANE. One row of five, on the top face only, spun a half turn so the
   * points sweep back over the shoulder. Three rows would be a hedgehog. */
  ridge: {
    part: 'cone-01',
    name: 'shag',
    paint: 'coat',
    count: 5,
    rows: ['top'],
    spin: [{ axis: 'y', deg: 180 }],
  },

  /* The beaver's and the polar bear's round ear, made shaggy the only honest
   * way — 1.4x, which is inside the 2.97x §3 measured the pack's own ears
   * varying by, and is what PartDef.stretch says is safe for an ear. */
  ears: { part: 'box-02', paint: 'coat', stretch: [1.4, 1.4, 1.1] },

  /* THE LONG PALE SNOUT. See SNOUT_STRETCH and the header's family. */
  snout: { part: 'tube-07', paint: 'muzzle', stretch: SNOUT_STRETCH },

  /* The polar bear's nose, on the snout's own placed front plane. */
  nose: { part: 'box-40', paint: 'mark' },

  /* NO TAIL — see the header. The triangles went on the claws instead. */

  extras: [
    /* THE CLAWS. The hog's tusk, tipped forward and down at the forefeet.
     * animal-sloth.ts wears the same shape at the same job on a different hull;
     * a sloth bear's are longer than a sloth's and are the reason for the name. */
    {
      name: 'claw',
      part: 'wedge-13',
      paint: 'claw',
      kind: 'pair',
      spin: [{ axis: 'x', deg: -30 }],
      at: [0.36, 0.24, 0.46],
    },
    /* The chest Y, as one turned card. `{ y, -90 }` takes an `x +1` marking to
     * `z +1`; animal-sun-bear.ts is the other species doing this and the two
     * carry the same limitation. */
    {
      name: 'chest',
      part: 'plate-10',
      paint: 'belly',
      stretch: [1, 1, 1.6],
      spin: [{ axis: 'y', deg: -90 }],
      at: [0, 0.66, CHEST_Z],
    },
  ],

  flag: 'THE MANE IS THE HEDGEHOG\'S REPEAT-AND-SINK, ONE ROW ONLY, AND IT IS THE THING TO LOOK '
    + 'AT. Five cone-01 on the top face, spun a half turn so the points sweep BACK over the '
    + 'shoulder instead of standing up — animal-kiwi.ts found that a row of buried cones reads '
    + 'as hair rather than as spines and this is the second animal to spend it. It is ONE row: '
    + 'the builder\'s default is three (top, chamfer, side) and three would be a hedgehog, where '
    + 'a sloth bear\'s shag is over the shoulders and nowhere else. If it reads as spikes, the '
    + 'dial is the sink and then the count. THE SNOUT IS STRETCHED 1.5x and it is the long end '
    + 'of a family: animal-sun-bear wears tube-07 at 0.7, animal-moon-bear at 0.85, Woodland\'s '
    + 'animal-bear at 1.0, this at 1.5. §3 measured the pack\'s own snouts varying 2.90x, so all '
    + 'four are inside what Kenney drew. The ears are stretched 1.4x, which the same measurement '
    + 'covers. THERE IS NO TAIL, and that is a BUDGET decision said out loud: box-18 is 80 '
    + 'triangles and would have taken this animal from 903 to 983, over the pack\'s measured '
    + '951. A sloth bear\'s tail is a tuft nobody looks at and its CLAWS are the second thing '
    + 'anybody says about it, so the claws won. THE CHEST Y IS ONE RECTANGULAR CARD and a sloth '
    + 'bear\'s is a Y — the same gap animal-sun-bear carries, and animal-moon-bear is the one of '
    + 'the three that got Kenney\'s own hull band. box-12 AT 1.539484 IS THE WIDEST SHELL IN THE '
    + 'BANK and no other bear in the project is on it. NEW PALETTE, UNREVIEWED.',
})
