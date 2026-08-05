/**
 * The gaur — the biggest wild cattle in the world, and the only bovid in the
 * project on a TALL shell.
 *
 * A gaur is not a wide animal; it is a HIGH one. What everybody notices is the
 * shoulder — a gaur stands nearly two metres at the withers and carries a raised
 * ridge along its back that drops away halfway down the spine. Every other bovid
 * here is on `box-12` (the ox, the water buffalo, the wildebeest), on `box-41`
 * (the buffalo, the sheep, the musk ox) or on the plain cube (the goat), and all
 * three of those are ways of being wide or bulky. **`box-21` is 1.505075 tall
 * against the cube's 1.250 and is the only one of the pack's ten that is taller
 * without being bigger everywhere.** Only `animal-gibbon` and this collection's
 * `animal-snow-leopard` wear it, and no bovid does.
 *
 * ## The ridge, and the trick it borrows
 *
 * `animal-musk-ox.ts` puts the hog's nose disc across the brow as a boss —
 * *"the same job, rule 1 satisfied without spending a bespoke shape on it"* —
 * and this is the same move in a different place. `box-24` is 0.400 x 0.400 x
 * 0.200, its attachment overridden from `z +1` to `y +1` so it stands on the
 * crown, cut to 0.35 of its height and stretched 3x on what is now its length:
 * a slab **0.400 wide, 0.140 deep and 0.600 along the spine**, sunk 0.4 so it
 * stands about 0.08 proud. That is a dorsal ridge, out of a nose pad, and it
 * costs 44 triangles.
 *
 * ## The stockings, which are the other thing everybody knows
 *
 * A gaur has white lower legs — four white socks on a nearly black animal, and
 * it is the field mark. `box-01` is one band, so a leg can be one colour and not
 * two; the whole leg is painted the sock's colour rather than half of it.
 * **That is an overstatement of about 40% of each leg and it is deliberate**,
 * because the alternative is no socks at all and the socks are the animal.
 *
 * ## The horns
 *
 * `wedge-13`, the hog's tusk, out and up at 45 degrees. `animal-ox.ts` uses that
 * exact pair of spins with the ELEPHANT's `wedge-11`; `animal-buffalo.ts` uses
 * this shape at 15 degrees. So the shape is the buffalo's and the angle is the
 * ox's, and neither combination exists yet — which is the honest position: a
 * gaur's horns really are between those two animals' and inventing a third shape
 * to say so would be worse. The pale grey dome between them is absent; three
 * `box-24` on one animal is a pattern rather than a build.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/** `box-21`'s own crown: offset 0.933788 plus half of 1.505075. */
const CROWN_Y = 1.686326

/**
 * The dorsal ridge, out of the hog's nose pad. `box-24` is 0.400 x 0.400 x
 * 0.200; with its axis overridden to `y` the 0.400 becomes its height, so 0.35
 * cuts it to 0.140 and 3x on z runs it 0.600 down the spine.
 */
const RIDGE_STRETCH: [number, number, number] = [1, 0.35, 3]

export const GAUR_ASSEMBLY = defineCreature('animal-gaur', {
  palette: {
    coat: 0x2f231c,    // UNREVIEWED: near-black chocolate, an old bull's colour
    pale: 0xe8dcc4,    // UNREVIEWED: the sclera, and the pale muzzle
    stocking: 0xf1ece0, // UNREVIEWED: THE WHITE SOCKS, and see the header on their extent
    horn: 0xcbbf9e,    // UNREVIEWED: pale horn, dark only at the tips in life
    ridge: 0x241a15,   // UNREVIEWED: the dorsal ridge, a shade under the coat
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* THE TALL SHELL, and no bovid in the project is on it. A gaur's height at the
   * shoulder is the one thing everybody says about it. */
  hull: { part: 'box-21' },
  /* No belly line. A gaur is one colour from chin to tail and the only two-tone
   * on it is at the feet. */
  under: 'pale',

  /* THE STOCKINGS. box-01 is one band so a leg is one colour; see the header for
   * why the whole leg is white rather than the bottom 60% of it. */
  legs: { x: 0.32, z: 0.28, paint: 'stocking' },

  eyes: { part: 'plate-01', y: 1.05 },

  /* The elephant's ear as a bovine's — large and hanging, hand-placed high on
   * the flank rather than at its own recorded y = 0.809375, which sits below
   * this taller shell's own middle. */
  ears: { part: 'tube-04', paint: 'coat', at: [0.625, 1.18, 0.20] },

  /* The hog's nose disc as a muzzle pad, widened. Donor transfer recovers the
   * bank's own z = 0.725 and y = 0.80875 exactly, because box-24's donor and
   * this hull are both 1.250 across and 1.250 deep. */
  snout: { part: 'box-24', paint: 'pale', stretch: [1.5, 0.9, 1] },

  /* THE SWITCH TAIL. The tiger's whip with Kenney's own band 3 — the third of
   * its length furthest from the join — painted dark, which is a tufted tail at
   * the pack's own cut and no second part. Donor transfer for the join. */
  tail: { part: 'wedge-18', paint: { base: 'coat', byBand: { 3: 'ridge' } } },

  extras: [
    /* THE HORNS. The buffalo's shape at the ox's angle; see the header. */
    {
      name: 'horn',
      part: 'wedge-13',
      paint: 'horn',
      kind: 'pair',
      stretch: [1, 1, 1.3],
      spin: [{ axis: 'y', deg: 90 }, { axis: 'z', deg: 45 }],
      at: [0.52, 1.50, 0.15],
    },

    /* THE DORSAL RIDGE. See RIDGE_STRETCH and animal-musk-ox.ts's boss, which is
     * the same shape doing the same kind of job in a different place. */
    {
      name: 'ridge',
      part: 'box-24',
      paint: 'ridge',
      axis: 'y',
      dir: 1,
      stretch: RIDGE_STRETCH,
      sink: 0.4,
      at: [0, CROWN_Y, 0.10],
    },
  ],

  flag: 'THE DORSAL RIDGE IS A NOSE PAD AND THE SHELL IS THE OTHER HALF OF THE ANIMAL. A gaur is '
    + 'not wide, it is HIGH — nearly two metres at the shoulder with a raised ridge along the '
    + 'front half of its back — and box-21 at 1.505075 is the only one of the pack\'s ten hulls '
    + 'that is taller without being bigger everywhere. No bovid in the project is on it; the ox, '
    + 'the water buffalo and the wildebeest take the widest, the buffalo, the sheep and the musk '
    + 'ox take the biggest. THE RIDGE IS box-24, THE HOG\'S NOSE DISC, with its attachment '
    + 'overridden from z+1 to y+1 so it stands on the crown, cut to 0.35 of its height and run '
    + '3x along the spine: a slab 0.400 wide, 0.140 deep and 0.600 long, sunk 0.4 so it stands '
    + 'about 0.08 proud. That is animal-musk-ox.ts\'s boss trick moved from the brow to the '
    + 'back, and it costs 44 triangles. THE WHITE SOCKS ARE THE WHOLE LEG AND THAT OVERSTATES '
    + 'THEM BY ABOUT 40% — box-01 carries one band, so a leg can be one colour and not two, and '
    + 'the choice was between an overstated sock and no sock at all. The socks are the field '
    + 'mark, so they won; if the animal reads as wearing wellingtons, painting the legs `coat` '
    + 'is a one-word retreat. THE HORNS ARE THE BUFFALO\'S SHAPE AT THE OX\'S ANGLE — wedge-13 '
    + 'out and up at 45, where animal-ox uses those two spins with the elephant\'s wedge-11 and '
    + 'animal-buffalo uses this shape at 15. A gaur\'s really are between those two animals\', '
    + 'and inventing a third shape to say so would be worse. THE PALE DOME between them is '
    + 'absent: three box-24 on one animal is a pattern rather than a build. NEW PALETTE, '
    + 'UNREVIEWED.',
})
