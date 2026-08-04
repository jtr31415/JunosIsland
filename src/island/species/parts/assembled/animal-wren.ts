/**
 * The wren — the roundest and plainest, and the only COCKED tail in the project.
 *
 * **Read `animal-robin.ts` first.** The passerine idiom is settled there and
 * every part of it is taken unchanged except the tail.
 *
 * **A WREN CANNOT BE SMALL, and the arithmetic says so rather than the taste.**
 * `HEIGHT_FLOOR` is 1.43125 — a bare hull standing on the pack's own leg row —
 * and `PACK_HEIGHT_MIN` is 1.43, so there is one part in a thousand of headroom
 * under a species that says nothing. A hull is never scaled. So this bird stands
 * the same height a swan would, and the smallness has to be spent on SHAPE:
 * nothing sticks out of it anywhere except the one thing that must.
 *
 * **THE COCKED TAIL.** A wren holds its tail straight up, and it is the first
 * thing anybody says about one. `box-18` is the bank's only stub — 0.425 of
 * reach against the next shortest at 0.555 — and the placement is
 * `animal-squirrel.ts`'s rear chamfer idiom (§8), written out rather than taken
 * with `chamfer: true` because the shape needs a spin of its own first and the
 * builder refuses `chamfer` beside a hand-written `spin`:
 *
 *   - `box-18` measures `z +1`, so `{ axis: 'y', deg: 180 }` turns it to `z -1`
 *     and it hangs off the back the way every other stub in the project does.
 *   - `{ axis: 'x', deg: 45 }` then takes that to (0, 0.7071, -0.7071), which is
 *     the outward normal of the cube's own +y/-z edge chamfer, measured.
 *   - The join is that chamfer's own midpoint, `(0, 0.46875, -0.46875)` off the
 *     hull centre — the same 0.46875 the hedgehog's rows and the squirrel's tail
 *     sit on, because it is the same solid.
 *
 * Nothing is chosen there: it is the squirrel's placement with the bank's
 * smallest tail in it instead of its biggest.
 */
import { defineCreature } from '../creature'
import { LEG_ROW } from '../hulls'
import { PACK_PUPIL } from '../texture'

/**
 * The +y/-z edge chamfer's own midpoint on the shared 1.250 cube, measured off
 * its 32 welded points rather than assumed: the chamfer runs (y 0.625,
 * z -0.3125) to (y 0.3125, z -0.625) about the hull's centre, so its midpoint is
 * 0.46875 either way — NOT the 0.5625 you get from assuming a 1.000-wide face,
 * which §8 says costs a whole row.
 */
const CHAMFER_Y = 0.80625 + 0.46875
const CHAMFER_Z = -0.46875

export const WREN_ASSEMBLY = defineCreature('animal-wren', {
  palette: {
    coat: 0x8a6236,
    belly: 0xd8c3a2,
    flight: 0x6d4c28,
    limb: 0x9a8464,
    eye: 0x191410,
    pupil: PACK_PUPIL,
  },

  /* BAND 3 IS DELIBERATELY UNSPENT. The robin and the blue tit both colour the
   * forward band; a wren has no breast patch — it is barred brown over a paler
   * underside, and the pale is the painted line below rather than a band. */
  hull: { part: 'box-39', paint: 'coat' },

  /* The tiger's own mammal line made exact — the only point on the pack's 1/16
   * grid inside its measured 0.4808-0.5481 zone, and this hull's own equator. */
  belly: 0.5,

  eyes: { part: 'plate-08', paint: 'eye' },

  snout: { part: 'cone-06', paint: 'limb' },

  /* THE COCKED TAIL — the squirrel's chamfer placement with the bank's smallest
   * tail in it. See the header for all three numbers; none is chosen. */
  tail: {
    part: 'box-18',
    paint: 'flight',
    spin: [{ axis: 'y', deg: 180 }, { axis: 'x', deg: 45 }],
    at: [0, CHAMFER_Y, CHAMFER_Z],
  },

  legs: false,
  extras: [
    {
      name: 'leg-front',
      part: 'box-01',
      paint: 'limb',
      kind: 'pair',
      sink: LEG_ROW.sink,
      at: [0.25, LEG_ROW.y, 0],
    },

    {
      name: 'wing',
      part: 'wedge-19',
      paint: 'flight',
      kind: 'pair',
    },
  ],

  flag: 'THE COCKED TAIL IS THE ANIMAL, and it is animal-squirrel.ts\'s rear-chamfer placement '
    + 'with the bank\'s SMALLEST tail in it instead of its biggest. box-18 measures z +1, so '
    + '{ axis: y, deg: 180 } turns it to z -1 and { axis: x, deg: 45 } then takes that to '
    + '(0, 0.7071, -0.7071) — the measured outward normal of the cube\'s own +y/-z edge chamfer '
    + '— and the join is that chamfer\'s own midpoint at 0.46875, the same number the hedgehog\'s '
    + 'rows and the squirrel\'s tail sit on. It is written out rather than taken with '
    + 'chamfer: true because the builder refuses chamfer beside a hand-written spin, and this '
    + 'shape needs its own 180 first. Nothing there is chosen. A WREN CANNOT BE SMALL and the '
    + 'arithmetic says so: HEIGHT_FLOOR is 1.43125, a bare hull on the pack\'s own leg row, '
    + 'PACK_HEIGHT_MIN is 1.43, and a hull is never scaled — so this bird stands the height a '
    + 'swan would and the smallness is spent on SHAPE, which is why nothing sticks out of it '
    + 'anywhere else. BAND 3 IS DELIBERATELY UNSPENT: the robin and the blue tit both colour the '
    + 'forward band and a wren has no breast patch at all, so the pale underside is the painted '
    + 'line at 8/16 instead. The BARRING is not here and cannot be — no per-pixel mechanism '
    + 'exists — and the coat is a flat warm brown named as an approximation. NEW PALETTE, '
    + 'UNREVIEWED.',
})
