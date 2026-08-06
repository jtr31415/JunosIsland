/**
 * The jackalope — a hare with antlers, which is a joke a taxidermist in Wyoming
 * made in the 1930s and the easiest species in this collection to say.
 *
 * The rabbit half is `animal-hare.ts` almost line for line: `box-06`, the
 * bunny's own ear and the tallest in the bank at 0.913, unstretched; `tube-01`
 * as a muzzle and `box-09` as a nose; and `box-18` spun 180 at the rear plate's
 * own centre as a scut, which is `animal-badger.ts`'s solve and every Woodland
 * stub since. The separation from the hare is the hull — `box-03`'s cube against
 * its `box-31` — and after that the antlers.
 *
 * ## THE ANTLER IS TWO PARTS AND IT FORKS
 *
 * There is no antler in the bank. The `horn` role is censused at 19 instances
 * and 15 distinct shapes with the deer among its donors, and it has **never been
 * baked** — §7's table says `BAKED: no` and the 100 records confirm it. So this
 * is a stand-in, and the stand-in is built rather than merely picked:
 *
 *   - **THE BEAM** is `cone-01`, the bank's only shape with `taper: 0.000`,
 *     stretched to 0.24 x 0.80 x 0.36 and raked -60 about x so it sweeps UP AND
 *     BACK off the crown. That is the unicorn's horn shape at the dragon's rake
 *     carried further, which is the third use of one part in this collection and
 *     is §3.1 paying out inside a single file. The angle is BOUNDED rather than
 *     chosen: at -45 the rack put the animal at 2.0305, over the pack's own 2.02,
 *     and at -60 the ears are the tallest thing on it again at 2.0100.
 *   - **THE TINE** is the same shape again, smaller, hung `on: 'antler'` — so it
 *     joins the beam's own BUILT tip, solved off its vertices rather than off an
 *     arithmetic this file would keep a stale copy of — and spun -85, which is
 *     all but horizontal. Two straight lengths meeting at 25 degrees is a FORK,
 *     and a fork is what makes a spike read as an antler rather than as a horn.
 *
 * That is `animal-golden-eagle.ts`'s hooked-bill mechanism used for a completely
 * different animal: two straight parts and an angle standing in for a shape the
 * bank cannot bend. **What it cannot do is branch twice** — a real jackalope
 * postcard has a four-point rack — and a third length would cost 68 more
 * triangles and read as clutter at tablet distance. One fork is the honest
 * version and the flag says so.
 *
 * `wedge-13`, the hog's TUSK, was the first candidate and is refused on a
 * measurement rather than a feeling: it is 0.411 long and `PartDef.stretch` is
 * only measured-safe on ears and snouts (§3, 2.97x and 2.90x natural spread),
 * so an antler-length copy of it would be a stretch nothing in the pack
 * supports. `cone-01` is an `ear`, so it may be stretched, and it is the only
 * shape in the bank that comes to a point.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/** `box-03`'s flat crown, +/-0.3125 in x and z. */
const CROWN_Y = 1.43125

/**
 * The rear plate's own centre — every one of the pack's ten hulls presents the
 * same flat rear plate at z = -0.625, y 0.49375 to 1.11875. `box-18`'s own
 * recorded y is 0.482, which is 0.0115 BELOW it, so a stub at pure donor
 * transfer meets a chamfer that has already fallen away. `animal-badger.ts`
 * measured that and this is its number.
 */
const REAR_PLATE_Y = 0.80625

/** Inboard of the ears, which take the crown's front at the shape's own x. */
const ANTLER_X = 0.16
const ANTLER_Z = -0.05

export const JACKALOPE_ASSEMBLY = defineCreature('animal-jackalope', {
  palette: {
    coat: 0xa08056,    // UNREVIEWED: jackrabbit sand, warmer than the Woodland hare
    belly: 0xf0e6d0,   // UNREVIEWED: the pale underside
    antler: 0xcbb489,  // UNREVIEWED: dry bone, so the rack reads against the coat
    inner: 0xd8a08f,   // UNREVIEWED: the nose
    limb: 0x6f5738,    // UNREVIEWED: the legs, a shade under the coat
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* The cube, which is the separation from `animal-hare` — that animal is on
   * `box-31`, the lion's shallower shell. */
  hull: 'box-03',
  belly: 0.5,

  /* The bunny's own ear, the tallest in the bank at 0.913 and unstretched, which
   * is `animal-hare.ts`'s whole argument for what a hare IS. No inner ear:
   * `box-06` arrives as one band (5, all 60 triangles), so a `byBand` here would
   * be a silent no-op — the hare found that first. */
  ears: { part: 'box-06', paint: 'coat', at: [0.28, CROWN_Y, 0.15] },

  snout: 'tube-01',
  nose: { part: 'box-09', paint: 'inner' },

  /* The scut. `animal-badger.ts`'s solve for every stub in the project. */
  tail: { part: 'box-18', paint: 'belly', spin: [{ axis: 'y', deg: 180 }], at: [0, REAR_PLATE_Y, -0.625] },

  extras: [
    /* THE BEAM, swept up and back off the crown: the unicorn's horn shape at the
     * dragon's rake carried further, which is the third job one part does in this
     * collection. The -60 is bounded rather than chosen: at -45 the rack put the
     * whole animal at 2.0305, over the pack's 2.02, and at -60 the ears are the
     * tallest thing on it again at 2.0100. */
    {
      name: 'antler',
      part: 'cone-01',
      paint: 'antler',
      kind: 'pair',
      stretch: [1.5, 2.0, 1.1],
      spin: [{ axis: 'x', deg: -60 }],
      at: [ANTLER_X, CROWN_Y, ANTLER_Z],
    },

    /* THE TINE, on the beam's own BUILT tip and turned nearly flat. Two straight
     * lengths meeting at 30 degrees is a FORK, and a fork is what separates an
     * antler from a horn — `animal-golden-eagle.ts`'s hook mechanism doing an
     * entirely different job. */
    {
      name: 'tine',
      part: 'cone-01',
      paint: 'antler',
      kind: 'pair',
      stretch: [1.2, 1.1, 1.05],
      spin: [{ axis: 'x', deg: -85 }],
      on: 'antler',
    },
  ],

  flag: 'THE ANTLER IS A STAND-IN AND IT IS THE ONLY THING HERE THAT IS NOT ALREADY '
    + 'SHIPPED. There is no antler in the bank: §7 censuses the `horn` role at 19 '
    + 'instances and 15 distinct shapes with the DEER among its donors, and it has NEVER '
    + 'BEEN BAKED — the 100 records confirm it. So the rack is TWO cone-01 per side: a '
    + 'BEAM stretched to 0.24 x 0.80 x 0.36 and raked -60 off the crown, and a TINE, the '
    + 'same shape smaller, hung with `on` so it joins the beam\'s own BUILT tip and spun '
    + '-85, which is all but horizontal. Two straight lengths meeting at 25 degrees is a '
    + 'FORK, and a fork is what makes a spike read as an antler rather than as a horn — it '
    + 'is animal-golden-eagle.ts\'s hooked-bill mechanism doing a completely different job, '
    + 'because the bank holds no curve and no branch. WHAT IT CANNOT DO IS BRANCH TWICE: a '
    + 'real jackalope postcard has a four-point rack and a third length costs 68 more '
    + 'triangles and reads as clutter at tablet distance. If you want the four-pointer, '
    + 'that is a bespoke shape and the first collection to ask for one. wedge-13, the '
    + 'HOG\'S TUSK, was the first candidate and is refused on measurement: it is 0.411 '
    + 'long and PartDef.stretch is only measured-safe on ears and snouts (§3), so an '
    + 'antler-length copy of a tooth is a stretch nothing in the pack supports; cone-01 IS '
    + 'an ear, so it may be stretched, and it is the only shape in the bank with taper '
    + '0.000. THE RABBIT HALF IS animal-hare.ts almost line for line — box-06 unstretched, '
    + 'tube-01, box-09, and box-18 spun 180 as a scut — and the separation from that '
    + 'animal is the CUBE against its box-31, plus the rack. NEW PALETTE, UNREVIEWED: '
    + 'jackrabbit sand, warmer than the Woodland hare, with a dry-bone rack.',
})
