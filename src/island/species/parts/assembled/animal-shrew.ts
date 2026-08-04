/**
 * The shrew's assembly, as a definition.
 *
 * ONE SPECIES, ONE FILE. Adding a species is this file and one appended line in
 * `index.ts`; `register.ts` says why that one line is enough.
 *
 * ## What this animal has to do, and how it does it
 *
 * The shrew is one of Garden's **four small brown ground creatures** — mouse,
 * shrew, dormouse, vole — and `garden.ts`'s own header says palette will never
 * separate four brown rodents at 0.16 scale, so the separation is structural and
 * no two of the four share an ears+tail pair. This one's share of that matrix is
 * **no ears at all** (`garden.ts`: "a shrew's are buried in fur"), against the
 * mouse's `box-25` dish — which the mouse's own file calls the largest
 * silhouette difference the bank has to offer — and a **whip** tail against the
 * vole's stub. On top of the matrix it gets the thing a shrew is actually known
 * for and no other animal here has: a long pointed snout.
 *
 * Read the three apart at pet scale: the mouse has the biggest ears in the bank,
 * the vole has no tail to speak of, and this one has a point on the front of its
 * face and nothing on the sides of its head.
 *
 * ## Every number, and where it came from
 *
 *   - **The hull is `box-31`, the LION's** — 1.250 x 1.250 x 1.125, the pack's
 *     one shallower hull, at the lion's own recorded `[0, 0.80625, -0.0625]`.
 *     `hulls.ts` is explicit that taking a different authored hull is NOT a
 *     stretch and needs no `stretchWhy`: the pack drew ten, and using one of them
 *     unmodified is rule 1's purest case. It is chosen for two reasons that both
 *     bite. It is 0.125 shallower front-to-back than the cube, and depth is what
 *     `pets.ts:652` charges keep-out for — this animal wears a snout in front AND
 *     a whip behind, which `garden.ts` records as "the most expensive combination
 *     this kit sells", at 1.15 a bigger obstacle circle than a fox. And its front
 *     face is at z = 0.500 rather than 0.625, so the snout starts a whole eighth
 *     of a unit further back and still clears the face. It stands 1.250 like the
 *     cube, so `HULL_BOTTOM_Y` and the leg row are untouched.
 *
 *   - **The legs and the eyes are the pack's own**, because nothing below
 *     mentions them: four `box-01` sunk 0.408163 on the row at y = 0.18125 that
 *     never moves, and two `plate-01` at the card's own recorded (0.2625,
 *     0.933646) on the absolute z = 0.6350. On THIS hull that card floats 0.135
 *     proud of a 0.500 front face, which is exactly what the lion does with it —
 *     `EYE_CARD_Z` carries that derivation. Rule 5 is not obeyed here; it is
 *     unsayable here.
 *
 *   - **NO EARS.** One absent line, and it is the largest single thing about the
 *     animal. `ears` is simply not said.
 *
 *   - **The tail is `wedge-18`, the TIGER's, and the donor transfer onto this
 *     hull is exact rather than an inference.** The tiger's hull is `box-41`,
 *     1.350 deep and offset forward 0.050, so its rear face is at
 *     0.05 - 0.675 = **-0.625** — and `box-31`'s rear face is
 *     -0.0625 - 0.5625 = **-0.625**, the same plane. So joining this tail at THIS
 *     hull's rear face and sinking it the tiger's own measured 0.137977 puts its
 *     centre at z = -0.825995 against the bank's recorded -0.826. One part in a
 *     million, and it was not aimed at.
 *
 *     Its shape is an ARC, which is the whole reason it reads as a whip and not
 *     as a fin: measured, its root sits at (z +0.278, y -0.368) and its tip at
 *     (z -0.278, y +0.523), so it leaves the rump low and sweeps up and back.
 *
 *   - **The tail's HEIGHT is the one number this species chooses.** The tiger's
 *     own recorded 1.186701 transfers cleanly and would leave the tip at
 *     y = 1.7100 — a tail carried up over the back, which is a tiger and is
 *     0.28 taller than the mouse. `garden.ts` signed off the opposite fact about
 *     this animal: "smallest height in the collection, which is true". So the
 *     whip is dropped to **y = 0.907957**, which is not a taste: it is
 *     `1.43125 - 1.046587/2`, the hull's own top face less the tail's own half
 *     height, so **the tip lands exactly on the line of its own back** and the
 *     animal measures 1.4313 — the bare hull on standard legs, the pack's floor.
 *     Its root then emerges at y = 0.540, inside the flat part of the rear face
 *     (which runs 0.494 to 1.119), so §3 is satisfied on the plane the join
 *     actually uses rather than on a nominal one.
 *
 *   - **The snout is `cone-01`, turned a quarter turn onto its nose.** This shape
 *     is already the bee's antenna, the hedgehog's spike and the squirrel's ear
 *     tuft; §3.1 is that a part's identity is its PLACEMENT and not Kenney's
 *     label, and this is that idea's fourth demonstration. It is the only shape
 *     in the bank with taper 0.000 — it comes to a TRUE point — and it is 0.160
 *     wide against 0.400 long, which is a shrew's face and is nothing like the
 *     beaver barrel the mouse wears.
 *
 *     `{ axis: 'x', deg: 90 }` takes its measured `y +1` facing to `z +1`, so it
 *     points forward instead of standing up, and it carries a bonus: the cone
 *     leans forward 0.063 at the tip (the lean the hedgehog spins 180 degrees to
 *     get rid of), and a quarter turn about x sends that lean DOWNWARD. The point
 *     droops, which is which way a shrew's snout goes.
 *
 *   - **The snout's height is the LION's own nose height on the LION's own
 *     hull.** A spun part has no face to solve against, so `at` is given — and
 *     every coordinate in it is recovered rather than picked: x = 0 is the
 *     midline the pack is bilateral about, z = 0.500 is `HULL_FRONT_Z['box-31']`,
 *     and y = 0.83902 is the recorded offset of `box-32`, the lion's nose-tip,
 *     which the lion wears on this very hull. Sunk its own 0.312222, which buries
 *     exactly 0.125 of it — §3's own floor — and leaves 0.275 standing proud.
 *
 *   - **NO NOSE BUTTON, and the reason is measured rather than tasteful.** The
 *     mouse hangs `box-09` on its muzzle's own front plane and it lands flush,
 *     because `tube-01` is a barrel and presents a flat face there. A cone
 *     presents a POINT. Every volumetric nose in the bank is at least 0.182
 *     across and the cone is 0.160 at its widest, so no nose in the bank can be
 *     backed by this snout at any depth: it would touch at one vertex, show
 *     daylight from the side, and blunt the one true point in the bank —
 *     which is the exact feature that makes this a shrew. The tip IS the nose.
 *
 *   - **The mouth is `plate-13`, the LION's own face-plate, and every coordinate
 *     of it is solved.** It replaces the nose as the face's second feature and it
 *     is the shortest thing in this file for a reason: `{ part: 'plate-13' }` and
 *     the donor transfer does the rest. It is a `card` — zero thickness, sunk its
 *     own measured 0.000 — so it joins on the midline, at the lion's own recorded
 *     y = 0.694, on THIS hull's front face z = 0.500. The lion and the tiger both
 *     wear it. No silhouette cost, no float, no chosen number, and the snout
 *     hides its middle so it reads as a mouth line curving out from underneath.
 *
 *     Note that this is NOT the eye card's absolute-plane rule. `EYE_CARD_Z` is
 *     pinned across all 48 cards in the pack at sd 0.0000 and rule 5 makes it
 *     unsayable; the face-plate family is not pinned, and its recorded z = 0.670
 *     is a 0.625-deep hull's number. Joined rather than copied, it lands on the
 *     face instead of 0.170 in front of it.
 *
 *   - **The teeth are `wedge-01`, MIRRORED — the beaver's own front pair.** The
 *     bank files this shape under `nose`, and §3.1 is that a part's identity is
 *     its placement: the beaver wears two of them at x = +/-0.073, y = 0.561,
 *     which is BELOW its own muzzle at y = 0.815. Two lobes under a muzzle are
 *     incisors, and the beaver's incisors are the pack's own rodent front teeth.
 *     Rule 6 gets them from one mesh: `kind: 'pair'` mirrors the +x copy, which
 *     is exactly `wedge-02`, the bank's own left-hand record of the same shape.
 *
 *     They are here because Garden's shrew is its one INSECTIVORE — a common
 *     shrew's teeth are the field mark it is identified on, and the four small
 *     brown creatures it has to be told apart from are all seed-eaters. Placed by
 *     the same transfer as everything else: the beaver's own x and y, this hull's
 *     own front face, sunk the shape's own 0.219. Painted from the pale slot, so
 *     they read at 0.16 scale against a dark muzzle.
 *
 *   - **THE FRONT FACE OF THIS HULL IS 1.000 SQUARE AND FLAT**, which is what
 *     lets three features share it without one of them floating. Measured, not
 *     assumed: `box-31`'s 28 welded points put its front four at
 *     (+/-0.5, +/-0.5, 0.5625), so the face runs x +/-0.500 and y 0.306-1.306 in
 *     world terms — nothing like the cube's 0.625 square. Its REAR face is the
 *     chamfered one, 0.625 square, y 0.494-1.119, which is the face the tail has
 *     to stay inside and does. The lion's hull is flat where its face is.
 *
 *   - **The belly is PAINTED at 8/16**, §4's second way: no second shape, no
 *     split triangle, no geometry at all. 0.5 is the pack's own mammal belly
 *     line made exact — the only point on the 1/16 grid inside the 0.4808-0.5481
 *     zone Kenney's split-triangle boundary wanders across — and on a 1.250-tall
 *     hull it is also the hull's own equator. Dark greyish-brown above, pale
 *     below, which is what a common shrew is.
 *
 *   - **The palette is `garden.ts`'s own signed-off four** for this species, plus
 *     the measured pupil. Nothing here is a new colour.
 *
 * **Why the face has three features and not one.** The mouth and the teeth were
 * not decoration and they are not there to be pretty: an animal with no ears and
 * no nose is SPARSER THAN ANYTHING KENNEY DREW, and rule 9's floors say so out
 * loud. Hull, legs, eyes, tail and snout alone come to 372 model vertices and 228
 * body vertices, under the pack's measured 405 and 236 — a red test, and the
 * right reading of it is not "relax the floor" but "this face is missing
 * something every animal in the pack has". So it got back the two things a shrew
 * has and the bank can actually carry, both by pure donor transfer, and the
 * counts landed at 420 and 292 without a number being aimed at either.
 *
 * **No flag.** Nothing was strained: 596 triangles against the pack's 422-951,
 * 420 vertices against 405-1626, height 1.4313 inside 1.43-2.02, keep-out 0.94
 * against the fox's 1.15, every part joined at a face its donor joined its own
 * to, and every number the pack's own but one.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

export const SHREW_ASSEMBLY = defineCreature('animal-shrew', {
  palette: {
    coat: 0x6d5b4a,
    belly: 0xc0ae9a,
    muzzle: 0x4a3d31,
    limb: 0x2e251d,
    pupil: PACK_PUPIL,  // the pack's own measured pupil; see texture.ts
    tooth: 0xeeebe7,
  },

  hull: { part: 'box-03' },
  belly: 0.5,
  tail: { part: 'wedge-18', paint: 'limb', at: [0, 1.1, -0.625] },
  snout: {
    part: 'cone-01',
    paint: 'muzzle',
    spin: [{ axis: 'x', deg: 90 }],
    at: [0, 0.7875, 0.5875],
  },
  extras: [
    {
      name: 'tooth',
      part: 'wedge-01',
      paint: 'tooth',
      kind: 'pair',
      at: [0.075, 0.6375, 0.625],
    },
  ],
})
