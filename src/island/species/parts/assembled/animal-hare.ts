/**
 * The hare — Woodland's first animal, and the ears are the whole read.
 *
 * A child meets a rabbit in the base pack, so a hare has to be a DIFFERENT
 * animal at a glance rather than a bigger rabbit. Two things do that here and
 * both are the bank's own:
 *
 *   - **`box-06`, the tallest ear in the bank** (0.48 x 0.913 x 0.306), upright
 *     and unstretched. Nothing else comes close — the next tallest ear shape is
 *     `box-25`'s dish at 0.74 across — so "enormous ears" is a part choice and
 *     not a number anybody tuned.
 *   - **`box-18`, the shortest tail in the bank** (0.425 of reach against the
 *     next shortest at 0.555). A hare's scut is a dot; pairing the biggest ear
 *     with the smallest tail is the silhouette doing the separating.
 *
 * `box-31`, the lion's shallow hull, because a hare is long and low in the body
 * under all that ear — and depth is what `pets.ts:652` charges keep-out for, so
 * the shallower shell is what pays for the ears standing clear.
 *
 * Nothing is stretched and nothing is authored.
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

export const HARE_ASSEMBLY = defineCreature('animal-hare', {
  palette: {
    coat: 0xa8895f,
    belly: 0xf2e7d2,
    inner: 0xd8a08f,
    limb: 0x6d5439,
    pupil: PACK_PUPIL,  // the pack's own measured pupil; see texture.ts
  },

  hull: { part: 'box-31' },
  belly: 0.5,
  // No inner ear: `box-06` arrives as ONE band (5, all 60 triangles), so there
  // is no cut to paint into and a `byBand` here would be a silent no-op. `inner`
  // is spent on the nose instead.
  ears: { part: 'box-06', paint: 'coat' },
  tail: { part: 'box-18', paint: 'belly', spin: [{ axis: 'y', deg: 180 }], at: [0, REAR_PLATE_Y, -0.625] },
  snout: 'tube-01',
  nose: { part: 'box-09', paint: 'inner' },
})
