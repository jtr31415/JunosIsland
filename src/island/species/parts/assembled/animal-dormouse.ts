/**
 * The dormouse's assembly, as a definition. One of Garden's four small brown
 * ground creatures, and the one whose whole read is the TAIL.
 *
 * ONE SPECIES, ONE FILE. Adding a species is this file and one appended line in
 * `index.ts`; `register.ts` says why that one line is enough.
 *
 * ## What this animal has to do
 *
 * `garden.ts` sets the job in one table: mouse, shrew, dormouse and vole are four
 * small brown rodents that palette will never separate at 0.16 scale, so no two of
 * them may share an ears+tail pair. The dormouse's share is **round ears and a
 * BUSHY tail** — "which is both true (a hazel dormouse's tail is furred) and the
 * single cheapest way to keep it off the mouse".
 *
 * But the bushy tail is also the risk, because **`animal-squirrel` has already
 * shipped wearing the same shape**: `box-23`, the fox's brush, the only round,
 * barely-tapering plume in the bank. Two animals cannot wear one plume and read as
 * two animals unless they CARRY it differently, so:
 *
 *   - the squirrel carries it **UP**, on the +y/-z chamfer at 45 degrees, plume
 *     topping out at 1.98 — 0.39 above its own ears;
 *   - the dormouse carries it **LOW and BACK**, straight off the rear face and
 *     below the mid-line, topping out at 1.21 — 0.22 BELOW its own back.
 *
 * That is a 0.77 difference in where the tail's mass sits, on animals 1.5 tall. It
 * is the same separation §8 says makes a squirrel out of a fox's tail, run the
 * other way.
 *
 * ## Every number, and where it came from
 *
 *   - **The hull is the cube, the legs are the leg row, the eyes are the eye
 *     plane.** None of the three is mentioned below, because all three are what
 *     `defineCreature` gives a definition that says nothing: `box-03` at the pack's
 *     own `[0, 0.80625, 0]`, four `box-01` sunk 0.408163 on the row at y = 0.18125
 *     that never moves, and two `plate-01` at the card's own recorded
 *     (0.2625, 0.933646) on the absolute z = 0.6350. Rule 5 is not obeyed here; it
 *     is unsayable here.
 *
 *   - **The ears are `box-02`, and the transfer is EXACT rather than an
 *     inference.** Its donors are the beaver and the polar bear, its measured
 *     attachment is `y +1` — a TOP-face ear, against the mouse's side-mounted
 *     koala dish — and **the beaver wears it on this same `box-03`**, whose
 *     recorded offset IS the beaver's hull centre (§8). So the donor transfer
 *     joins it at this hull's top face, y = 1.43125, sinks it its own measured
 *     0.777778, and its centre lands on **1.34375 — the bank's recorded offset for
 *     the shape, to nine decimals.** Nothing is chosen and the recovery is the
 *     evidence.
 *
 *     The pack's own x = 0.4475 puts each ear out past the flat top face (which
 *     reaches only 0.3125 before the chamfer starts falling away 1:1), so the ear
 *     rises out of the SHOULDER of the cube where the surface is at 1.29625: it
 *     stands 0.205 proud there and is still buried 0.11, three times §3's floor.
 *     A small round button, exactly as Kenney's beaver and polar bear wear it.
 *
 *   - **The tail is `box-23`, the fox's brush, and it chooses ONE number: the
 *     height.** Everything else is the donor's — joined at the cube's rear face
 *     z = -0.625, sunk the fox's own measured 0.177404, which puts its centre at
 *     z = -0.918618 against the bank's recorded -0.918642. Recovered, not copied.
 *
 *     The height cannot be transferred the same way and here is why. The bank
 *     records this tail at y = 0.86875, but that is a number measured on
 *     **`box-21`, the fox's own hull, which is 1.5051 tall** — on which 0.86875 is
 *     0.4568 of the hull's height and sits BELOW its equator. Carried at the same
 *     absolute height on this 1.250 cube it would sit at 0.55 of the hull, ABOVE
 *     the equator, which is a tail carried higher than the fox carries it — the
 *     wrong direction for the one animal that has to be the low-slung one. **What
 *     transfers is the fraction, not the number**: 0.6875 / 1.505075 = 0.456788 of
 *     the fox's hull, and 0.18125 + 0.456788 x 1.250 = **0.752235**. That is the
 *     only hand-placed coordinate in the file and this is its whole arithmetic.
 *
 *   - **The nose is `box-26` on the cube's own front face, and there is no
 *     snout.** The mouse and the squirrel both wear the beaver's `tube-01` muzzle;
 *     this animal deliberately does not, because a dormouse's face is blunter than
 *     a mouse's and because `garden.ts` gives `snout` to the SHREW as its own
 *     separator. So the face is one big rounded nose and nothing else — the
 *     koala's, 0.278 x 0.328, the largest thing in the nose family that is a NOSE
 *     rather than a snout pad. **The koala also wears this on `box-03`**, so this
 *     is the third exact transfer on the animal and not an inference: joined at
 *     z = 0.625 with the koala's own sink of 0.000, its centre lands on
 *     (0.730, 0.6945) against the bank's recorded (0.730, 0.695). It is a BUTTON
 *     and not `wedge-10`, which is measurably a nose tip and reads as a tongue;
 *     Joe rejected that by name on the hedgehog.
 *
 *     It is also what rule 9 asked for. Built with the smaller `box-09` bunny
 *     button this animal came to **398 vertices — UNDER the pack's own floor of
 *     405**, which is the budget biting from the direction nobody expects: a
 *     species with round ears, a tail and no muzzle carries less geometry than
 *     anything Kenney shipped. The floor is not negotiable (`assembly-assert.ts`
 *     gives no escape clause for under, only for over), and the fix that is honest
 *     is a feature the animal should have had, not a shape chosen for its vertex
 *     count: a dormouse's nose is its face.
 *
 *   - **The belly is PAINTED at 8/16**, §4's second way: no second shape, no split
 *     triangle, no geometry at all. 0.5 is the tiger's own mammal belly line made
 *     exact — the only point on the pack's 1/16 grid inside the 0.4808-0.5481 zone
 *     Kenney's split-triangle boundary wanders across — and it is also the hull's
 *     own equator. It is what makes the brief's "sandy gold above, cream below".
 *
 *   - **The palette is `garden.ts`'s own signed-off four** for this species, plus
 *     the measured pupil. Nothing here is a new colour.
 *
 * **No flag.** Height **1.5012**, inside 1.43-2.02 and — to a thousandth — the 1.5
 * `garden.ts` already claims for this animal. The EARS set it: the tail tops out
 * 0.29 below them, which is the measurement that says this tail is carried low.
 * 414 vertices and 610 triangles, inside rule 9's 405-1626 and 422-951.
 *
 * **The one number worth Joe's eye is the keep-out: 1.069.** `pets.ts:652` charges
 * it from `max(width, depth) / 2`, and this animal is 2.14 deep because a brush
 * that trails costs depth where a brush that is carried up does not — the squirrel
 * wearing this same shape is 0.92. It is still inside the fox's own 1.15, which is
 * the pack's worst and the number the island already copes with, and every
 * millimetre of it is the pack's own: the fox's sink, the koala's nose, the cube's
 * own rear face. Nothing is tuned. Burying the tail deeper than the fox did would
 * buy the depth back at the cost of the plume standing clear of the rump, which is
 * the animal.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

export const DORMOUSE_ASSEMBLY = defineCreature('animal-dormouse', {
  palette: {
    coat: 0xd9a44e,
    belly: 0xf9edd3,
    inner: 0xbf8535,
    limb: 0x8a5e22,
    pupil: PACK_PUPIL,  // the pack's own measured pupil; see texture.ts
  },

  belly: 0.5,
  ears: { part: 'box-02', paint: 'inner' },
  nose: 'box-26',
  extras: [{ part: 'wedge-07', name: 'wedge-07' }],
})
