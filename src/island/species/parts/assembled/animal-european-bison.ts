/**
 * The European bison — the heaviest land animal in Europe, and the fifth bovid
 * in the project that has to not be the other four.
 *
 * ONE SPECIES, ONE FILE. `register.ts` says why the one appended line in
 * `index.ts` is the whole of the wiring.
 *
 * **The horn is the separation and it is a shape no bovid here has spent.**
 * `animal-ox.ts` and `animal-water-buffalo.ts` wear the elephant's `wedge-11`;
 * `animal-buffalo.ts` and `animal-musk-ox.ts` wear the hog's `wedge-13`. Both
 * are long sweeps. A European bison's horns are SHORT — barely past the ear —
 * and this is the one animal here for which the bank's small tapered wedge is
 * the right size rather than a compromise: `wedge-04`, filed by Kenney as the
 * bunny's tooth and the chick's, monkey's and penguin's ear, taper 0.605, 0.341
 * long. §3.1's multiplier, on a shape three species already wear as an ear.
 *
 * **The beard is `animal-wildebeest.ts`'s, and its placement is
 * `animal-goat.ts`'s**: rule 3 fuses head and body and leaves no chin, so a
 * beard hangs off the front-bottom chamfer. On this shell that chord is at
 * y 0.34375, z 0.5625 rather than the cube's 0.3375 / 0.46875 — `box-41` is
 * bigger on all three axes and the chamfer moves with it.
 *
 * The tail is the lion's tufted whip, which no bovid has taken, and there are no
 * ears worth drawing: `box-05`, the smallest shape in the bank, buried half its
 * own depth, because a bison's ears are inside its hair.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/** `box-41`'s FLAT plates — `animal-goose.ts` §5's warning; the bounds are 0.725 / 1.48125 / 0.675. */
const CROWN_Y = 1.43125
const FLANK_PLATE_X = 0.625
const BOSS_Z = 0.725
const REAR_PLATE_Z = -0.625
const REAR_PLATE_Y = 0.80625

/**
 * The front-bottom chamfer, `animal-goat.ts`'s beard station carried onto this
 * shell. The cube puts its chord midpoint at 0.75 of the half-extent; `box-41`
 * is centred (0, 0.83125, 0.05) with half-extents 0.675 / 0.650 / 0.675, so the
 * same fraction lands at y 0.34375 and z 0.5625 — both on the pack's 1/16 grid.
 */
const CHIN_Y = 0.34375
const CHIN_Z = 0.5625

export const EUROPEAN_BISON_ASSEMBLY = defineCreature('animal-european-bison', {
  palette: {
    coat: 0x6b5136,    // UNREVIEWED: warm umber — a wisent is browner than an American bison
    pale: 0xcfc4ab,    // UNREVIEWED: the horns and the sclera. There is no belly line
    mark: 0x2f2620,    // UNREVIEWED: the beard, the tail switch and the muzzle
    limb: 0x4e3c28,    // UNREVIEWED: the heavy forelegs, a shade under the coat
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* The biggest shell in the pack. No belly line — a bison is one colour, darker
   * at the head — so the pale slot is named for the horns and the sclera. */
  hull: { part: 'box-41' },
  under: 'pale',

  /* Heavy in front, at `animal-buffalo.ts`'s stations on this same shell. */
  legs: { x: 0.34, z: 0.30 },

  /* 17/16, clear of the tiger boss `animal-goose.ts` measured at y 0.494-0.894. */
  eyes: { y: 1.0625 },

  /* THE SMALLEST SHAPE IN THE BANK, 0.221 x 0.232, buried half its own depth so
   * about 0.116 breaks the outline. `animal-stoat.ts` wears the same ear for the
   * opposite reason — there it is small against the hare's huge one; here it is
   * small because a bison's ears are lost in its mane. */
  ears: { part: 'box-05', paint: 'coat', sink: 0.5, at: [0.26, CROWN_Y, 0.0625] },

  /* The polar bear's nose as a bovine muzzle pad, on the boss this shell already
   * carries — `animal-musk-ox.ts`'s own arrangement, and its reason: that
   * geometry IS a muzzle pad. Taken over the hog's `box-24` for 19 triangles,
   * which is what this animal had left under rule 9's 951 with the lion's
   * 212-triangle tail on the back of it. */
  snout: { part: 'box-40', paint: 'mark', stretch: [1.35, 0.9, 1], at: [0, 0.68, BOSS_Z] },

  /* THE LION'S TUFTED WHIP, and no other bovid in the project has taken it: the
   * ox, the water buffalo and the zebra hang `box-18` or `wedge-07`, and the
   * buffalo hangs the stub. 1.0824 of reach, and BAND 5 is Kenney's own tassel —
   * 40 of its 212 triangles, cut where the lion's tuft starts — so the switch is
   * paint rather than a second part and cannot come adrift from the tail. */
  tail: {
    part: 'wedge-15',
    paint: { base: 'mark', byBand: { 5: 'pale' } },
    spin: [{ axis: 'z', deg: 180 }],
    at: [0, REAR_PLATE_Y, REAR_PLATE_Z],
  },

  extras: [
    /* THE HORNS. `wedge-04` is a `y +1` shape, so ONE spin does the whole job:
     * -65 degrees about z takes its facing from (0, 1, 0) to (0.906, 0.423, 0) —
     * out of the temple and up, which is a wisent's whole horn. It is stretched
     * 1.3 along its own length and nothing else, which leaves it 0.443 long: two
     * fifths of `animal-ox.ts`'s sweep, and that shortness IS the animal. */
    {
      name: 'horn',
      part: 'wedge-04',
      kind: 'pair',
      paint: 'pale',
      stretch: [1, 1.3, 1],
      spin: [{ axis: 'z', deg: -65 }],
      at: [FLANK_PLATE_X, 1.22, 0.1875],
    },

    /* THE BEARD, `animal-wildebeest.ts`'s part and `animal-goat.ts`'s station,
     * re-solved onto this shell's own chamfer chord — see CHIN_Y. */
    {
      name: 'beard',
      part: 'cone-01',
      paint: 'mark',
      stretch: [1.5, 1.4, 1.5],
      spin: [{ axis: 'x', deg: 135 }],
      at: [0, CHIN_Y, CHIN_Z],
    },
  ],

  motion: [{ kind: 'wag', parts: ['tail'] }],
})
