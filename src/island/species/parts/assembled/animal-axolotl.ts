/**
 * PLACEHOLDER — NOT A FINISHED ANIMAL. Joe, 5 August: *"put something in for the
 * unbuildable ones anyway so i can do it manually."* This is that entry: it
 * opens in the workbench, it has a palette, a face and a stance you can judge,
 * and the part that is wrong names itself.
 *
 * ## What is missing, measured
 *
 * **A BRANCHED FROND.** An axolotl's gills are three feathery stalks a side,
 * each one splitting into filaments — and **every one of the 100 baked shapes is
 * a single solid mass, straight or tapered along one axis.** Not one branches,
 * and nothing in the pack does: Kenney drew ears, horns, tusks and tails, and a
 * branch is not among them. Rule 4 as amended bakes a rotation into a copy's
 * vertices; it cannot fork one.
 *
 * **What stands in:** `cone-01`, the bank's one true point (taper 0), six of
 * them — three a side — on the chamfer row of §8's own idiom, so they splay up
 * and out from the head at 45 degrees. It reads as a crown of spikes rather than
 * as feathery gills, and that is the whole of the complaint.
 *
 * ## What I would try first, doing it by hand
 *
 * Fork one frond. Take the six out of the `ridge` and place them as six
 * individual `extras`, then hang a second and a third `cone-01` off each with
 * `on: '<that frond>'` at a few degrees of splay each — the anchor is solved off
 * the placed part's own built vertices, so a fork cannot float. `animal-lynx.ts`
 * does the one-level version for its ear tufts. Three levels is a frond;
 * eighteen `cone-01` at 34 triangles each is 612, so it wants RULE 9 declared
 * and probably a cheaper point. If a forked spike still does not read, this
 * species wants a bespoke frond and no arrangement of the bank will finish it.
 *
 * Everything else here is real: the smile is `plate-13` stretched, the tail fin
 * is the beaver's paddle standing upright on its own recorded high root, and the
 * legs are the pack's four at a narrow stance.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/** `box-03`'s measured chamfer midpoint, offset from the hull's own centre. */
const CHAMFER = 0.46875
/** `box-03`'s own centre height, from the bank's recorded offset. */
const HULL_MID_Y = 0.80625

export const AXOLOTL_ASSEMBLY = defineCreature('animal-axolotl', {
  palette: {
    coat: 0xf0bcc8,    // UNREVIEWED: the pale pink leucistic axolotl every child sees
    belly: 0xfae4ea,   // UNREVIEWED: paler still underneath
    frill: 0xe0778f,   // UNREVIEWED: the gills and the tail fin, a deeper rose
    mark: 0xb5707c,    // UNREVIEWED: the mouth line
    limb: 0xe8adba,    // UNREVIEWED: the four small legs
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  hull: { part: 'box-03' },
  belly: 0.375,

  /* Small and narrow: an axolotl's legs are almost an afterthought on it. */
  legs: { x: 0.3, z: 0.28 },

  /* The bank's smallest card. An axolotl's eyes are lidless black beads. */
  eyes: { part: 'plate-06', paint: 'mark' },

  /* THE SMILE, and it is the second thing anyone names about this animal.
   * plate-13 is Kenney's own face plate, stretched 2.4x wide — wider than the
   * beluga's 1.8 and the dolphin's 1.5, because on an axolotl the mouth runs
   * the full width of the head. */
  extras: [
    { name: 'mouth', part: 'plate-13', paint: 'mark', stretch: [2.4, 1, 1], at: [0, 0.7, 0.635] },
  ],

  /* THE GILLS, AND THEY ARE THE PLACEHOLDER. Six cone-01 on the chamfer row of
   * §8's idiom — the row's own -45 degree turn is what splays them up and out —
   * pushed forward to a centre of 3/16 with a span of 3/16, so all three
   * stations a side sit over the head rather than down the back. The span is
   * well inside the 0.4375 that §3's nothing-floats bound allows. */
  ridge: {
    part: 'cone-01',
    paint: 'frill',
    name: 'gill',
    count: 3,
    rows: ['chamfer'],
    span: 0.1875,
    place: { chamfer: [CHAMFER, HULL_MID_Y + CHAMFER, 0.1875] },
  },

  /* THE TAIL FIN. The beaver's paddle by pure donor transfer — its own facing,
   * its own 0.2943 burial and its own high root at y = 1.050919, so the fin runs
   * along the top of the tail the way an axolotl's does. animal-crocodile.ts
   * drops the same shape to the body's centre for the opposite reason. */
  tail: { part: 'wedge-03', paint: 'frill' },

  flag: 'PLACEHOLDER, NOT A FINISHED ANIMAL — put in so you can do it by hand. THE GILLS ARE '
    + 'THE ONE THING WRONG. An axolotl has three FEATHERY BRANCHED stalks a side and all 100 '
    + 'baked shapes are single solid masses, straight or tapered along one axis — not one of '
    + 'them forks, because Kenney drew ears, horns, tusks and tails and a branch is not among '
    + 'them. Rule 4 as amended bakes a ROTATION into a copy\'s vertices and cannot FORK one. '
    + 'What is here is six cone-01 — the bank\'s one true point, taper 0 — on the chamfer row '
    + 'of the §8 idiom, so they splay up and out at 45 degrees over the head. It reads as a '
    + 'crown of spikes. WHAT TO TRY FIRST: take the six out of the ridge, place them as six '
    + 'individual extras, and hang a second and a third cone-01 off each with on: "<frond>" at '
    + 'a few degrees of splay — animal-lynx.ts does the one-level version for its ear tufts and '
    + 'the anchor is solved off the placed part\'s own built vertices, so a fork cannot float. '
    + 'Eighteen points is 612 triangles and wants RULE 9 declared. EVERYTHING ELSE IS REAL: '
    + 'the smile is plate-13 at 2.4x, wider than the beluga\'s 1.8 because an axolotl\'s mouth '
    + 'runs the whole width of its head, and the tail fin is the beaver\'s paddle by pure donor '
    + 'transfer on its own high root. NEW PALETTE, UNREVIEWED.',
})
