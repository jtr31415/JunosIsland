/**
 * The stoat — long, low, and known by the black tip of its tail.
 *
 * The one fact a child is told about a stoat is the black tip, so the animal is
 * built around making that legible at 0.16 scale:
 *
 *   - **`wedge-18`, the tiger's whip** — the bank's thinnest long tail (0.20
 *     across, 1.046 of reach). A stoat's tail is a rope, not a brush, and this is
 *     the shape that says so beside the fox's `box-23` and the squirrel's plume.
 *   - **The TIP is painted, not added.** `byBand` puts `mark` on the whip's own
 *     end band, so the black costs no geometry and cannot come adrift from the
 *     tail it is on.
 *
 * `box-31` again, the shallow hull: a stoat is the lowest thing in the
 * collection and depth is the axis a child reads that on from the side.
 *
 * **The ears are `box-05`, the SMALLEST in the bank** (0.22 x 0.23), which is
 * the other half of the separation — the hare beside it wears the biggest.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

export const STOAT_ASSEMBLY = defineCreature('animal-stoat', {
  palette: {
    coat: 0xb87f42,
    belly: 0xfaf3e4,
    mark: 0x241d16,
    limb: 0x8a5c2f,
    pupil: PACK_PUPIL,  // the pack's own measured pupil; see texture.ts
  },

  hull: { part: 'box-31' },
  // High, because a stoat's underside is a bright unbroken line from chin to
  // tail — 10/16 is the highest point on the pack's grid still inside the flank.
  belly: 0.625,
  // `box-05` is one band (15, all 48 triangles), so there is no inner ear to
  // paint into it and a `byBand` here would be a silent no-op.
  ears: { part: 'box-05', paint: 'coat' },
  // Band 3 is the third of the whip furthest from the join — Kenney's own cut,
  // so the black tip is paint rather than a second part and cannot come adrift.
  tail: { part: 'wedge-18', paint: { base: 'coat', byBand: { 3: 'mark' } } },
  snout: 'tube-01',
  nose: { part: 'box-09', paint: 'mark' },
})
