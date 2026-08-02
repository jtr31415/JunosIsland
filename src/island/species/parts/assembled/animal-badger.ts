/**
 * The badger's assembly, as a definition — and Garden's first FLAGGED species.
 *
 * ONE SPECIES, ONE FILE. Adding a species is this file and one appended line in
 * `index.ts`; `register.ts` says why that one line is enough.
 *
 * ## What this animal has to do, and the one thing it cannot
 *
 * A badger is not a shape, it is a MARKING: a white face carrying two black
 * stripes that run lengthwise from the nose, through the eye, back to the ear.
 * `garden.ts` says so in its own words — *"the badger is the one Garden species
 * whose marking IS its colour scheme"* — and the texture system cannot draw it.
 *
 * Both halves of the marking fail, for the same reason, and it is worth being
 * exact about which mechanism falls short of what:
 *
 *   - **The white face.** `Paint.patch` is §4's way 2 and it takes one number,
 *     `at`, a HEIGHT: it paints one boundary, level, across the whole part, and
 *     it has no z term at all. "The front of this hull is white" is a statement
 *     the mechanism has no way to make. And there is no head to paint separately,
 *     because rule 3 is one mass.
 *   - **The stripes.** §4's way 1, `byBand`, can only cut where Kenney already
 *     cut, and `box-12` has two bands: the shell and the ear lugs. The remaining
 *     route is a flat card, and **the bank has none that could carry a stripe** —
 *     measured, not assumed. The only marking cards in it are the cow's, dog's
 *     and giraffe's flank patches, `plate-10` (0.244 x 0.253) and `plate-11`
 *     (0.400 x 0.433): near-square blotches, and both mount on the hull's SIDE at
 *     x = 0.635. The two face cards, `plate-03` and `plate-13`, are 0.22-0.24 by
 *     0.10 — a mouth line. Nothing in the pack is a stripe.
 *
 * So this species is built under §2's escape clause: the best honest attempt,
 * flagged where Joe reads it, with no authored geometry pretending otherwise.
 * What is here is both ENDS of the stripe and nothing between them. What the flag
 * says is what is missing.
 *
 * ## `box-12` IS NOT A WIDER BODY — measured, and it changed this build
 *
 * The plan took `box-12` as "1.539 wide, the widest authored hull", a broad low
 * body for a broad low animal. **It is not.** Its torso is the 1.250 cube to the
 * millimetre — half-width 0.625 at every (y, z) through the whole body — and all
 * 0.289 of the extra width is **two fused EAR LUGS**: 15 points a side at
 * x = ±0.7697 down to ±0.625, y 0.3255-0.5475, z 0.3500-0.5000, high and forward
 * on the head, exactly where the cow and the deer wear their ears. Neither donor
 * has a separate ear record in the bank, which is the confirmation: the ears are
 * IN the shell. `box-12` is 180 triangles against the cube's 60 for that reason.
 *
 * Two consequences, and both of them are this animal:
 *
 *   - **There is no ear feature.** The plan's `box-30` would have been a SECOND
 *     pair — the lion's ear joins on `z +1`, so the donor transfer puts it on the
 *     front face at x = ±0.375, beside lugs that are already there. It also
 *     floats: at the lion's own y = 1.336986 this hull's front surface has
 *     receded to z = 0.4539 and a copy sunk its measured 0.1289 below z = 0.625
 *     leaves its back face at 0.4961, standing 0.042 clear of the mass. §3 says
 *     nothing floats, rule 10 says readable in silhouette, and four ears is
 *     neither. **`box-30` is recorded here as considered and refused so the next
 *     builder does not helpfully add it back** (§2's third establishment).
 *   - **The lugs carry Kenney's own inner-ear cut**: band 5, 12 triangles, the
 *     flat forward face of each lug. Painted `mark`, that is a dark ear on a grey
 *     head for one `byBand` entry and no geometry at all.
 *
 * `box-12` is still the right hull, for a better reason than the one it was
 * picked for: it is the cube-bodied hull that already wears a pair of small round
 * high-set lugs, which is a badger's ear, and it is one mass by construction.
 *
 * ## Every number, and where it came from
 *
 *   - **The legs and the eyes are never mentioned**, because they are what
 *     `defineCreature` gives a definition that says nothing: four `box-01` sunk
 *     0.408163 on the row at y = 0.18125 that never moves, and two `plate-01` at
 *     the card's own recorded (0.2625, 0.933646) on the absolute z = 0.6350. The
 *     leg stations scale with the hull, so this animal stands 0.3325 wide against
 *     the cube's 0.27 — wider-set legs on the same body, for free.
 *
 *   - **The tail is `box-18`, spun 180 degrees, and it is the bank's only STUB.**
 *     §7 splits the seven tails on thickness and this is the smallest of them by
 *     both measures that matter — 0.4252 of reach against the fox's 0.9102 —
 *     which is the whole reason it is here. The bank inherited Kenney's name for
 *     it and the name is WRONG: `box-18` is the elephant's TRUNK, measured `z +1`
 *     so it hangs off a face. `{ axis: 'y', deg: 180 }` turns it to `z -1` and the
 *     donor transfer then joins it at this hull's rear face, z = -0.625.
 *
 *   - **The tail's height is the one number this species chooses, and it is the
 *     hull's own.** The elephant's recorded y = 0.482248 is 0.324 below this
 *     hull's centre, past the 0.3125 the flat rear face reaches, so at the donor's
 *     own height the stub stands 0.0115 clear of a chamfer that has already fallen
 *     away — it floats, quietly. Joined at **y = 0.80625, `box-12`'s own recorded
 *     centre**, its 0.6230 root lands inside the 0.6250 flat rear face with 0.001
 *     to spare at each end: the whole join plane is on real geometry, and the
 *     number was not invented, it was the hull's.
 *
 *   - **The snout is `tube-06`, the fox's muzzle, and it is painted WHITE.** The
 *     donor transfer joins it at the front face z = 0.625 sunk its own measured
 *     0.000, which puts its centre at z = 0.74071 — **the fox's own recorded
 *     offset, recovered to six decimals** and never used to get there. `garden.ts`
 *     ruled that a badger under the quadruped kit could not afford a snout (a
 *     keep-out of 1.63 against the pack's 1.17); assembled, the same animal wears
 *     one at a keep-out of 1.02. The muzzle is where the white face lives.
 *
 *   - **Band 7 of that muzzle is painted `mark`** — Kenney's own horizontal cut
 *     through the fox's nose, upper half — which puts black along the TOP of a
 *     white muzzle. That is the front end of the badger's stripe, in the right
 *     place, for no geometry. It is as far back as the stripe gets.
 *
 *   - **The nose is `box-26`, the koala's**, anchored with `on: 'snout'` rather
 *     than by an arithmetic this file would otherwise carry a copy of: the
 *     builder puts it on the muzzle's own placed front plane, z = 0.85642, so a
 *     nose that floats or buries is a thing that cannot happen quietly. It is the
 *     bank's broadest nose PAD that still fits a 0.532 muzzle, which is what a
 *     digging animal has, and it is deliberately not `wedge-10` — measurably a
 *     nose tip, and it reads as a tongue (Joe's ruling on the hedgehog).
 *
 *   - **The belly is PAINTED at 8/16**, §4's second way: the tiger's own mammal
 *     line made exact, the only point on the pack's 1/16 grid inside its measured
 *     zone, and also this hull's own equator. `garden.ts`'s signed-off note for
 *     this species is "white underside", and this is it, with no split triangle.
 *
 *   - **The palette is `garden.ts`'s own signed-off four**, renamed to what each
 *     does here, plus the measured pupil. Nothing here is a new colour.
 *
 * **FLAGGED**, and only for the marking. Nothing else strained: 568 triangles
 * and 412 vertices against the pack's 422-951 and 405-1626, height 1.4312 on the
 * floor, keep-out 1.02 against the fox's 1.15, every part joined at a face its
 * donor joined its own to, one mass, and nothing authored.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

export const BADGER_ASSEMBLY = defineCreature('animal-badger', {
  palette: {
    coat: 0x9aa0a8,
    belly: 0xf8f6f0,
    mark: 0x2a2b30,
    limb: 0x1c1d21,
    pupil: PACK_PUPIL,  // the pack's own measured pupil; see texture.ts
    'box-04': 0x2a2b30,
  },

  hull: { part: 'box-12', paint: { base: 'coat', byBand: { 5: 'mark' } } },
  belly: 0.5,
  tail: { part: 'box-18', spin: [{ axis: 'y', deg: 180 }], at: [0, 0.80625, -0.625] },
  snout: { part: 'tube-06', paint: { base: 'belly', byBand: { 7: 'mark' } } },
  nose: { part: 'box-26', paint: 'mark' },
  extras: [
    {
      part: 'box-04',
      name: 'box-04',
      stretch: [0.95, 0.75, 0.45],
      spin: [{ axis: 'y', deg: 90 }],
      at: [-0.2, 0.975, -0.6],
      paint: 'box-04',
    },
    {
      part: 'box-04',
      name: 'box-04-2',
      stretch: [0.95, 0.75, 0.45],
      spin: [{ axis: 'y', deg: 90 }],
      at: [0.2, 0.975, -0.6],
      paint: 'box-04',
    },
  ],
  flag: 'THE BLACK FACE STRIPES CANNOT BE EXPRESSED, and on a badger they ARE the '
    + 'animal: a white face carrying two stripes that run lengthwise from the nose, '
    + 'through the eye, back to the ear. `Paint.patch` takes one number and that number '
    + 'is a HEIGHT — it paints ONE LEVEL BOUNDARY across a part and has no z term, so '
    + 'it cannot even say "the front is white"; `byBand` can only cut where Kenney '
    + 'already cut; and the bank has no card that could carry a stripe — its only '
    + 'marking cards are the cow\'s flank blotches, `plate-10` (0.244 x 0.253) and '
    + '`plate-11` (0.400 x 0.433), near-square and side-mounted. So the marking is not '
    + 'awkward here, it is unsayable. What is here instead is both ENDS of the stripe '
    + 'and nothing between them: a WHITE MUZZLE carrying the fox nose\'s own dark upper '
    + 'band and a big dark nose pad (the front end), dark on the hull\'s own fused ear '
    + 'lugs (the back end), and the pack\'s 8/16 mammal line for the pale underside. The '
    + 'run between them, across the cheek and through the eye, is the marking a child '
    + 'would name this animal by, and it is missing. Also worth your eye: `box-12`\'s '
    + '1.539 width is TWO FUSED EARS on a 1.250 cube body, not a wider body, so this '
    + 'badger has no ear part and needs none. Nothing was authored to fake any of it.',
})
