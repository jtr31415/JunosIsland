/**
 * The bear — Woodland's biggest animal, and it has to not be `animal-polar`.
 *
 * `box-41` is the pack's only shell that is bigger on all three axes, so "the
 * biggest" is a real shape rather than a number anybody tuned — and its band 15
 * is 168 triangles covering everything above its own equator, which painted a
 * shade lighter is a grizzly's silvered back for no geometry at all.
 *
 * Against the two frozen bears a child already owns: `animal-polar` is white and
 * wears the pack's `box-02` ear, `animal-panda` is `box-36` and black-and-white.
 * This one takes the PANDA'S ear shape (`box-34`) on a brown body, which is the
 * separation the other way round, and the pack's broadest nose pad (`box-24`,
 * the hog's) on the giraffe's deep muzzle.
 *
 * The ears are placed by hand and not by donor transfer, and that is forced:
 * `box-41`'s crown is not flat. Ray-cast it is 1.43125 for |z| <= 0.0833 and
 * rises to two transverse pads at 1.48125 over |z| 0.1383 to 0.2575, so the
 * panda's own z = 0.3475 has no shell under it on this hull and an ear
 * transferred there would float. `CROWN_Z` is inside the flat band instead.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/**
 * Every one of the pack's ten hulls presents the SAME flat rear plate — world
 * z = -0.625, x +/-0.3125, y 0.49375 to 1.11875 — and this is its centre.
 *
 * `box-18`'s own recorded y is 0.482248, which is 0.0115 BELOW that plate, so a
 * stub taken by pure donor transfer meets a chamfer that has already fallen away
 * and stands clear of the body. `animal-badger.ts` measured that and solved it
 * with this number; every stub in Woodland takes the same solve.
 */
const REAR_PLATE_Y = 0.80625

/**
 * `box-41`'s own flat crown, and the only part of its top that is one height.
 *
 * Measured in `animal-turkey.ts` §3: 1.43125 for |z| <= 0.0833, then two
 * transverse pads at 1.48125. Joining the ears here buries them in real
 * material at the donors' own depth rather than over a slope.
 */
const CROWN_Y = 1.43125
const CROWN_Z = 0.05

export const BEAR_ASSEMBLY = defineCreature('animal-bear', {
  palette: {
    coat: 0x6b4a30,    // UNREVIEWED: dark chocolate brown — the first ever proposed for this species
    belly: 0xd8bb96,   // UNREVIEWED: the pale muzzle, and the sclera
    grizzle: 0x94734e, // UNREVIEWED: the silvered back — band 15, 168 triangles, no geometry
    mark: 0x231a13,    // UNREVIEWED: the nose pad
    limb: 0x46301f,    // UNREVIEWED: the legs, a shade under the coat
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* The one shell bigger than the cube on all three axes. Band 15 is everything
   * above its own equator — the back and shoulders — and a grizzly is named for
   * exactly that. */
  hull: { part: 'box-41', paint: { base: 'coat', byBand: { 15: 'grizzle' } } },

  /* The panda's ear on a brown bear, at the crown's own flat band. See the
   * header for why the donor's z = 0.3475 will not do on this shell. */
  ears: { part: 'box-34', paint: 'coat', at: [0.35, CROWN_Y, CROWN_Z] },

  /* The giraffe's muzzle: the deepest in the bank (0.266 through), which is what
   * a long straight bear's face wants, on `box-41`'s own front face at 0.725. */
  snout: { part: 'tube-07', paint: 'belly' },

  /* The hog's nose-tip, the broadest pad in the bank at 0.400 x 0.400, on the
   * muzzle's own placed front plane. */
  nose: { part: 'box-24', paint: 'mark' },

  /* A bear has almost no tail, and `box-18` is the bank's only stub — 0.425 of
   * reach against the next shortest at 0.555. Turned to hang off the back. */
  tail: { part: 'box-18', paint: 'coat', spin: [{ axis: 'y', deg: 180 }], at: [0, REAR_PLATE_Y, -0.625] },

  flag: 'NEW PALETTE, UNREVIEWED — the first bear ever built here and the first colours ever '
    + 'proposed for it. Worth your eye: the SILVERED BACK is box-41\'s own band 15, 168 '
    + 'triangles covering everything above the hull\'s equator, painted one shade lighter than '
    + 'the coat. That is a grizzly for zero geometry, and if it reads as dirt rather than as '
    + 'frost it is one hex. THE EARS ARE HAND-PLACED and the donor transfer is refused, which '
    + 'is the one number here nobody could recover: box-41\'s crown is NOT flat — ray-cast it '
    + 'is 1.43125 for |z| <= 0.0833 and rises to two transverse pads at 1.48125 over |z| 0.1383 '
    + 'to 0.2575 (animal-turkey.ts §3) — so the panda\'s own recorded z of 0.3475 has no shell '
    + 'under it here and a transferred ear would float. They sit at z = 0.05, inside the flat '
    + 'band, buried the panda\'s own 0.778. Against the frozen pair: animal-polar is white and '
    + 'wears box-02, animal-panda is box-36 and two-tone; this is the panda\'s EAR on a brown '
    + 'body, which is the separation run the other way. Nothing is stretched.',
})
