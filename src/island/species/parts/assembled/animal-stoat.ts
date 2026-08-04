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
 *
 * ## `fur` EXISTS BECAUSE `belly: 0.625` WAS QUIETLY REPAINTING TWO OTHER PARTS
 *
 * This is a measured fault rather than a preference, and it was found by
 * `tests/tools/editor-own-colour.test.ts`, which samples the real atlas at each
 * mesh's own baked UV rather than trusting the definition.
 *
 * `belly` splits the CELL of whatever slot the hull is painted from — here
 * `coat` — and a split cell is read by EVERY part painted from that slot, not
 * only by the hull. The ears and the tail both said `coat`, so with the split as
 * high as 10/16 all three of those meshes were sampling the pale half: the ears
 * rendered `0xfaf3e4` and the tail rendered `0xfaf3e4` with its black tip, when
 * the file's own prose says chestnut. **A cream-eared, cream-tailed stoat is not
 * what any line of this file asked for and nobody could see it in the numbers.**
 *
 * Every other species that sets `belly` splits at 8/16 and none of them trips
 * this — measured over all 81 registered definitions, the stoat was the only
 * one, because 10/16 is the only split high enough to swallow the parts that
 * share the cell. So the fix is local: the ears and the tail take a slot of
 * their own, `fur`, seeded with the coat's own chestnut. Nothing else moves, the
 * split stays at 10/16 where the header argues it belongs, and the hull is the
 * only thing reading it.
 *
 * **The general shape of it is worth knowing before the next high belly line:**
 * a `patch` is a property of a SLOT, not of the part that declared it, so a part
 * sharing that slot inherits a boundary nobody wrote for it.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

export const STOAT_ASSEMBLY = defineCreature('animal-stoat', {
  palette: {
    coat: 0xb87f42,
    belly: 0xfaf3e4,
    /* The coat's own chestnut, under a second name. It exists so the ears and
     * the tail can be that colour at all — see the header. */
    fur: 0xb87f42,
    mark: 0x241d16,
    limb: 0x8a5c2f,
    pupil: PACK_PUPIL,  // the pack's own measured pupil; see texture.ts
  },

  hull: { part: 'box-31' },
  // High, because a stoat's underside is a bright unbroken line from chin to
  // tail — 10/16 is the highest point on the pack's grid still inside the flank.
  // It splits the `coat` CELL, which is why nothing else may be painted from it.
  belly: 0.625,
  // `box-05` is one band (15, all 48 triangles), so there is no inner ear to
  // paint into it and a `byBand` here would be a silent no-op.
  ears: { part: 'box-05', paint: 'fur' },
  // Band 3 is the third of the whip furthest from the join — Kenney's own cut,
  // so the black tip is paint rather than a second part and cannot come adrift.
  tail: { part: 'wedge-18', paint: { base: 'fur', byBand: { 3: 'mark' } } },
  snout: 'tube-01',
  nose: { part: 'box-09', paint: 'mark' },
})
