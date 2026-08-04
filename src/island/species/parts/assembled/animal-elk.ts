/**
 * The elk — the tallest thing in Woodland, and an antler is a PLACEMENT.
 *
 * `box-21` is the pack's one tall shell and `animal-wolf.ts` measured what it
 * actually is: the standard 1.250 cube from y 0.18125 to 1.43125 with two fused
 * ear lugs on top reaching 1.6863. That is why this animal has no ear feature
 * and must never be given one — it would be four ears — and it is also why every
 * cube placement transfers to it unchanged. An elk's erect ears come free with
 * the shell, so the whole budget goes on the rack.
 *
 * **THE BANK HAS NO ANTLER.** Every horn-shaped record in it is a tusk. So the
 * rack is §3.1 taken seriously — a part's identity is its placement, not
 * Kenney's label: TWO PAIRS of `wedge-11`, the elephant's tusk that `animal-ox`
 * and `animal-water-buffalo` already wear as horns, at two angles off the same
 * crown. A swept beam and a brow tine, four copies, 152 triangles, nothing
 * authored and nothing stretched.
 *
 * The two angles are the only chosen numbers on this animal. `{ axis: 'x', deg }`
 * takes a `z +1` facing to `(0, -sin, cos)`, so -120 is up-and-back
 * (0, 0.866, -0.500) and -70 is up-and-forward (0, 0.940, 0.342).
 *
 * Against the FROZEN `animal-deer`: that one is `box-12`, wide and short, with
 * its antlers fused into the shell. This is the tall hull, a rack that stands
 * clear of the silhouette, and the deer's own muzzle, because an elk is a deer.
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
 * The flat crown of the CUBE inside `box-21`, and NOT the hull's own top.
 *
 * `hullFrame` takes `top` off the bounding box, which on this shell is 1.6863 —
 * the tip of the ear lugs, with nothing under it across most of the crown. The
 * flat top face is 1.43125 running +/-0.3125 in x and z (`animal-wolf.ts`), and
 * that is what a part may join to. Getting this wrong is a rack floating above
 * two ears.
 */
const CROWN_Y = 1.43125

/** Clear of the lugs, which sit forward at z 0.191 to 0.470. */
const BEAM_Z = -0.1
const TINE_Z = -0.28
const RACK_X = 0.22

export const ELK_ASSEMBLY = defineCreature('animal-elk', {
  palette: {
    coat: 0x9b7d55,
    belly: 0xdcc9a8,
    neck: 0x46331f,
    antler: 0xc8b189,
    mark: 0x2b2119,
    limb: 0x5c4429,
    pupil: PACK_PUPIL,
  },

  /* The fox's shell, taken for its EARS, exactly as `animal-wolf.ts` takes it:
   * a 1.250 cube with two erect forward lugs fused on top. Band 5 is Kenney's
   * own inner-ear cut on those lugs, so a dark ear costs one entry. */
  hull: { part: 'box-21', paint: { base: 'coat', byBand: { 5: 'neck' } } },

  /* 7/16 and NOT the usual 8/16, and the derivation is `animal-wolf.ts`'s on
   * this same shell: `patch` takes its fraction of the hull's OWN height, which
   * here includes the ear lugs, so 7/16 is the only grid point that lands inside
   * the pack's measured mammal zone once the ears are out of the arithmetic. */
  belly: 0.4375,

  /* The deer's own muzzle and the deer's own nose-tip. An elk IS a deer, and
   * the pack has exactly one cervid face; taking it is adaptation rather than
   * imitation, and the separation from `animal-deer` is carried by the hull and
   * the rack instead. */
  snout: { part: 'tube-03', paint: 'neck' },
  nose: { part: 'box-14', paint: 'mark' },

  /* An elk's tail is a flap. `box-18` is the bank's only stub, turned to hang
   * off the back rather than forward off the face. */
  tail: { part: 'box-18', paint: 'belly', spin: [{ axis: 'y', deg: 180 }], at: [0, REAR_PLATE_Y, -0.625] },

  extras: [
    /* THE MAIN BEAM, swept up and back. `wedge-11` faces `z +1`; -120 degrees
     * about x takes that to (0, 0.866, -0.500), so the tusk becomes a beam
     * carried over the shoulders. Joined on the flat crown at the elephant's own
     * burial of 0.376, which puts a third of it inside the skull. */
    {
      name: 'antler-beam',
      part: 'wedge-11',
      paint: 'antler',
      kind: 'pair',
      spin: [{ axis: 'x', deg: -120 }],
      at: [RACK_X, CROWN_Y, BEAM_Z],
    },

    /* THE BROW TINE, up and slightly forward at -70 degrees — (0, 0.940, 0.342).
     * One shape, two angles, and that is the whole of what makes a rack out of a
     * bank with no antler in it. */
    {
      name: 'antler-tine',
      part: 'wedge-11',
      paint: 'antler',
      kind: 'pair',
      spin: [{ axis: 'x', deg: -70 }],
      at: [RACK_X, CROWN_Y, TINE_Z],
    },
  ],

  flag: 'THE RACK IS THE ANIMAL AND THE BANK HAS NO ANTLER IN IT, so look at it first. Every '
    + 'horn-shaped record in the bank is a TUSK; this one is wedge-11, the elephant\'s, which '
    + 'animal-ox and animal-water-buffalo already wear as horns. What makes it a rack rather '
    + 'than a horn is that there are TWO PAIRS at TWO ANGLES off one crown — a beam swept up '
    + 'and back at -120 degrees on x, (0, 0.866, -0.500), and a brow tine up and forward at -70, '
    + '(0, 0.940, 0.342). Those two angles are the only chosen numbers on this animal and they '
    + 'are the thing to rule on; everything else is a donor transfer. A real elk rack has six '
    + 'points a side and this has two, which is an approximation and is named as one. '
    + 'THE JOIN HEIGHT IS 1.43125 AND NOT THE HULL\'S OWN TOP, and that is a trap rather than a '
    + 'preference: box-21\'s bounding box tops out at 1.6863 because of its two fused EAR LUGS, '
    + 'and there is no shell under that height across most of the crown, so a rack transferred '
    + 'to the hull\'s "top" would float above two ears. THERE IS NO EAR PART and there must not '
    + 'be one — animal-wolf.ts measured box-21 as the standard cube plus two erect forward lugs, '
    + 'so a pair on top would be four ears. THE MUZZLE IS THE DEER\'S OWN, deliberately: an elk '
    + 'is a deer and the pack has one cervid face, so the separation from the frozen animal-deer '
    + 'is carried by the hull (tall against wide) and by the rack, not by the nose. NEW PALETTE, '
    + 'UNREVIEWED, all six slots. Nothing is stretched.',
})
