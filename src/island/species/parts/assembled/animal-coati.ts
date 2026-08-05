/**
 * The coati — an upturned snout and the highest-rooted tail in the project.
 *
 * Four procyonids are now built and `animal-raccoon.ts` is the one this has to
 * survive: same family, same size, same ringed tail. Both separations are
 * placements rather than shapes, which is §3.1 paying:
 *
 *   - **THE SNOUT IS TURNED UP.** `tube-07`, the giraffe's nose, at 0.55 across
 *     and 2.1 along — 0.293 x 0.165 with 0.559 of reach — spun 18 degrees about
 *     x so it points up and forward. `animal-aardvark.ts` stretches the same
 *     shape 0.65/2.0 and leaves it level; a coati's snout is famously mobile and
 *     tipped up, and this is the only spun snout in the project. The raccoon
 *     wears the fox's blunt `tube-06` instead.
 *   - **THE TAIL STANDS UP OFF THE RUMP.** Joined at y = 1.11875 — the TOP EDGE
 *     of the hull's flat rear face, which is a solved bound and not a taste, the
 *     same class of number as `animal-crocodile.ts`'s `JAW_Y` — so `wedge-18`
 *     leaves the body at the highest point that is still flat geometry and
 *     sweeps up to 1.642. The raccoon's `box-23` trails at the body's centre;
 *     `animal-lemur` and `animal-howler-monkey` carry theirs up the 45-degree
 *     chamfer. This is a third, distinct answer and it is the one a coati makes.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/** `box-03`'s front face, and the top edge of its flat REAR face. */
const FRONT_Z = 0.625
const REAR_FLAT_TOP_Y = 1.11875

/** 0.55 across, 2.1 along: a narrow mobile snout with 0.559 of reach. */
const SNOUT_STRETCH: [number, number, number] = [0.55, 0.55, 2.1]

export const COATI_ASSEMBLY = defineCreature('animal-coati', {
  palette: {
    coat: 0x9c6a3f,    // UNREVIEWED: the warm russet brown
    belly: 0xe0c79c,   // UNREVIEWED: the pale underside, and the sclera
    face: 0x30251c,    // UNREVIEWED: the dark snout and the small nose
    limb: 0x7c5330,    // UNREVIEWED: the legs, a shade under the coat
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* The tiger's own mammal line made exact — the only 1/16 point inside the
   * pack's measured 0.4808-0.5481 zone, and this hull's own equator. */
  belly: 0.5,

  legs: { z: 0.3 },

  /* Small and round, at the shape's own recorded station: a coati's ears barely
   * break its outline, which is 0.070 proud at the beaver's own 0.778 burial. */
  ears: { part: 'box-02', paint: 'coat' },

  /* THE UPTURNED SNOUT. An explicit `at` because a spun part has no axis-aligned
   * face to solve a join against — the builder refuses to guess one, which is
   * the check that stops a diagonal feature floating. */
  snout: {
    part: 'tube-07',
    paint: 'face',
    stretch: SNOUT_STRETCH,
    spin: [{ axis: 'x', deg: -18 }],
    at: [0, 0.78, FRONT_Z],
  },

  /* The bunny's small nose-tip on the snout's placed front plane, measured off
   * the built vertices — so it follows the 18 degrees without being told. */
  nose: { part: 'box-09', paint: 'face' },

  /* THE VERTICAL TAIL. See the header: joined at the top edge of the flat rear
   * face rather than at the chamfer, which is what makes it a third answer
   * rather than the lemur's. */
  tail: { part: 'wedge-18', paint: 'coat', at: [0, REAR_FLAT_TOP_Y, -0.625] },

  flag: 'THE RINGS ARE NOT THERE, the same wall animal-lemur.ts hits: `byBand` can only '
    + 'recolour where Kenney already cut and wedge-18 carries one band, so the tail is a '
    + 'single flat colour where a coati\'s has eight rings. IT IS ALSO NOT VERTICAL, only '
    + 'high: the tail is joined at y = 1.11875, the top edge of the hull\'s flat rear face, '
    + 'which is as high as a part can join and still be on flat geometry, and it sweeps to '
    + '1.642. A truly upright tail would need the shape spun 90 degrees, and these tails are '
    + 'long along Y and short along Z — spinning one lays it flat backwards instead of '
    + 'standing it up. THE SNOUT IS THE ONLY SPUN SNOUT IN THE PROJECT and it is what holds '
    + 'this animal apart from animal-raccoon; if 18 degrees reads wrong, that number is the '
    + 'dial. NEW PALETTE, UNREVIEWED.',
})
