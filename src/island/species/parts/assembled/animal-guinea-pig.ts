/**
 * The guinea pig's assembly, as a definition. Home Pets' BIG TAILLESS RODENT, and
 * the first species in the project built on `box-41`.
 *
 * ONE SPECIES, ONE FILE. Adding a species is this file and one appended line in
 * `index.ts`; `register.ts` says why that one line is enough.
 *
 * ## The axis this animal owns, against five siblings being built beside it
 *
 * `collections/home-pets.ts` names the risk in its own header: hamster, guinea
 * pig, gerbil, chinchilla, rat and degu are **six small brown-ish rodents on one
 * album page**, palette cannot carry the separation because four of the six are
 * sandy brown in life, and "making them different colours to tell them apart
 * would be a lie a child can check against a picture book". So the separation is
 * SHAPE, and this species' share of it is the cheapest and truest entry in the
 * table — the collection file says so in the row it wrote for this animal:
 *
 *     guinea pig   none   round   the only tailless rodent here, and famously so
 *
 * Three things carry it, and no sibling may take any of them:
 *
 *   - **NO TAIL AT ALL.** There is no `tail` line below. See the next section.
 *   - **THE BIGGEST BODY.** `box-41`, the tiger's, 1.350 x 1.300 x 1.350 — the
 *     only shell in the pack that is bigger than the 1.250 cube on every axis, so
 *     "largest of the six" is a real proportion margin (+8% linear, +21% volume,
 *     and 0.05 of extra height) and not an adjective. The hamster has round-with-
 *     a-stub-tail and golden-tan and neither is taken here.
 *   - **EARS SET LOW ON THE SIDES.** `tube-04`, halved. The bank holds exactly
 *     three ear shapes that attach on **x** — `box-25` and the mirrored pair
 *     `tube-04`/`tube-05` — and every other one of its twenty-three mounts on y or
 *     z, which is a top-of-the-head ear. `box-25` is the koala dish, the biggest
 *     and roundest in the bank, and it is the CHINCHILLA's separation ("a
 *     chinchilla's ears are enormous and round, and that is the separation the
 *     six-rodent problem needs most"). So the elephant's flap is the only
 *     side-mounted ear left, and it is the right one anyway: its recorded y is
 *     0.809375, which on this hull is 0.022 BELOW the body's own equator. Low, on
 *     the side, by the donor's own number.
 *
 * ## THE ABSENT TAIL IS THE ANIMAL. DO NOT ADD ONE.
 *
 * **`tail: false` is not a field and was never needed** — `creatureSpec` places a
 * tail only `if (def.tail !== undefined)`, so a species with no tail simply does
 * not mention one. That silence is this animal's primary separation and it is the
 * one thing here that a later builder could "fix" without noticing, so it is
 * written down twice: here, and as a comment where the `tail` line would go.
 *
 * **`box-18` is CONSIDERED AND REFUSED**, by name, so nobody helpfully adds it
 * back (§2's third establishment). It is the bank's only stub — the elephant's
 * trunk under Kenney's wrong name — it is what the badger, the vole and the mouse
 * reach for, and it is exactly what the HAMSTER's row in `home-pets.ts` is
 * promised ("a Syrian hamster's tail is a nub"). Putting a stub on this animal
 * would delete the collection's cheapest separation and hand the hamster's
 * silhouette to the wrong species. A cavy has no external tail at all: it has
 * four fused caudal vertebrae and nothing outside the skin. The refusal is not a
 * budget decision and no measurement will ever overturn it.
 *
 * ## `box-41`'s BOUNDING BOX IS NOT ITS BODY — measured, and it changed this build
 *
 * `hulls.ts` records this hull's front face as **0.725** and that is true of its
 * bounding box and false of its face. Measured off the shell's own 454 welded
 * points, the geometry at z = 0.675 local is **eight points forming a rounded
 * diamond on the midline** — (0, -0.3375), (+/-0.1414, -0.2789), (+/-0.20,
 * -0.1375), (+/-0.1414, +0.0039), (0, +0.0625) — no wider than 0.40 across and no
 * taller than 0.40. That is a MUZZLE, fused into the shell. The broad flat face
 * behind it is at z = 0.575 local, which is world **z = 0.625: the same front
 * face as the seven usual hulls.** Three consequences, and all three are this
 * animal:
 *
 *   - **There is no `snout` feature, and there must not be.** A guinea pig's head
 *     is blunt and broad with almost no neck and a SHORT muzzle, and this hull
 *     already wears one at the right size. Adding a `tube-06` or a `box-08` on top
 *     of it would be a second muzzle in front of the first — rule 3's fault in
 *     miniature. The badger's `box-12` carries its ears in the shell; this shell
 *     carries the muzzle. Same lesson, different face.
 *   - **The eye cards are untouched and still right.** `EYE_CARD_Z` is 0.6350
 *     always and the surface under the card here is the 0.625 face plane, so the
 *     pair floats the pack's own 0.010 of daylight — exactly as on `box-03`. The
 *     card's outer edge does overhang the flat face and stands up to 0.11 proud of
 *     the receding chamfer, and that is not ours to correct: `plate-01`'s sixteen
 *     donors include the TIGER, so this is the pack's own card on the pack's own
 *     hull at the pack's own height. `hulls.ts` makes the identical argument for
 *     the lion's 0.135.
 *   - **The nose transfer needs the tiger's burial, not the shape's mean.** See
 *     below; it is the one number in this file worth reading twice.
 *
 * The same shell tells the same lie about its SIDES. Its half-width is 0.675, but
 * x = 0.675 occurs only on **two small pads** — each spanning y 0.0291-0.3026 and
 * z -0.3075..-0.1883 and 0.0883..0.2075 local, the tiger's shoulder and haunch.
 * Everywhere else the flank is at **x = 0.625, the cube's own half-width**. The
 * donor transfer joins to the bounding box, so an ear or a card left to solve here
 * lands on the pads' plane and stands 0.05-0.06 clear of the flank it is supposed
 * to be on. §3 says nothing floats, so the ear and the flank cards below are given
 * the flank plane by hand — and 0.625 is not a chosen number, it is `box-03`'s.
 *
 * ## Every number, and where it came from
 *
 *   - **The legs and the eyes are never mentioned**, because they are what
 *     `defineCreature` gives a definition that says nothing: four `box-01` sunk
 *     0.408163 on the row at y = 0.18125 that never moves, and two `plate-01` at
 *     the card's own recorded (0.2625, 0.933646) on the absolute z = 0.6350. The
 *     leg stations scale with the hull, so this animal stands 0.2916 wide against
 *     the cube's 0.27 — the biggest body stands widest, for nothing said.
 *
 *   - **The ears are `tube-04`, HALVED, joined at the flank plane.** The elephant
 *     wears this shape on `box-03`, so the transfer is exact at full size and can
 *     be checked: joined at x = 0.625 and sunk its own 0.126087 of its own 0.359219
 *     width, the centre lands on **0.759317 — the bank's recorded offset for the
 *     shape, to six decimals.** That recovery is the evidence the join point is
 *     right; the halving is then applied on top of it.
 *
 *     **Why halved.** At its own size the elephant's flap is 0.6188 tall — the
 *     third tallest ear in the bank of twenty-three, behind only the rabbit's
 *     `box-06`/`box-07` and the koala's dish — and 48% of this hull's height. A
 *     guinea pig's ear is a small rounded petal. `stretch: [0.5, 0.5, 0.5]` is
 *     UNIFORM, so nothing is deformed and the shape stays Kenney's; it brings the
 *     ear to 0.1796 x 0.3094 x 0.1387, which sits just under the bank's own median
 *     ear height of 0.341432 and beside `box-02` (0.3150), the beaver's and polar
 *     bear's small round button. §3 measured ears varying 2.97x naturally and says
 *     in terms that "stretching a copy is safe for these two kinds and only these
 *     two"; JT-043 is Joe's own instruction that "a bit of clever sizing and
 *     rotation will get a lot done". This is that, at its plainest.
 *
 *     `pets:creature` marks these two **THIN** — the halved ear buries 0.0226,
 *     under the 0.125 §3 asks of an ear — and that is the ELEPHANT's own measured
 *     burial of its own ear, halved with everything else, not a shortcut. It is
 *     also unavoidable rather than chosen: a side ear only 0.18 wide cannot bury
 *     0.125 of itself and still be visible. Said out loud so nobody re-derives that
 *     it was looked at.
 *
 *   - **The nose is `box-32`, and it is the TIGER's own nose on the tiger's own
 *     hull.** Its provenance is `lion tiger` and the bank records the FIRST
 *     donor's placement, so a transfer here has to be checked rather than assumed —
 *     and checking it turned up the one trap in this build. `sunkFractionMean` is
 *     0.292906, which is the mean of two donors that bury this shape completely
 *     differently: the lion sinks it 0.000 (it sits on the flat `blade-05` face
 *     plate) and the tiger sinks it **0.585813**, because the tiger buries it in
 *     the muzzle described above. Their mean is a burial neither animal has. Sunk
 *     the tiger's own `sunkFractionMax` and joined at this hull's front face, the
 *     centre lands on **z = 0.710351 against the bank's recorded 0.710352** — six
 *     decimals, from a solve that never used the number. Its back face then rests
 *     on the 0.625 face plane and its front reaches 0.7959, so the nose spans the
 *     muzzle exactly as the tiger's does.
 *
 *     `pets:creature` marks it **THIN** at 0.100, under §3's 0.125, and that is
 *     arithmetic rather than a shortcut: the muzzle it is buried in is only 0.100
 *     deep (0.725 less the 0.625 face plane), so no part joined to this hull's
 *     front can bury more than that and still be a nose. The tiger's own is the
 *     deepest burial the shape has ever had.
 *
 *   - **The mouth is `plate-13`, and it SOLVES.** One of the tiger's own four
 *     cards, 0.219 x 0.100, joined at the muzzle's own apex on the midline where
 *     the diamond is 0.40 wide, floating `CARD_STANDOFF` — the 0.010 the pack
 *     itself gives a card. **Deliberately no hand-coded `at`**: the goldfish, the
 *     firefly and the glow-worm each typed `[0, 0.686849, 0.635]` to stop a mouth
 *     z-fighting into invisibility, and that was a workaround for a bug that
 *     `CARD_STANDOFF` has since fixed at source. This is the default doing the
 *     work those three did by hand.
 *
 *   - **The two flank blotches are `plate-11`, at the card's own recorded x.** See
 *     the coat section below for what they are for. `plate-10` was CONSIDERED AND
 *     REFUSED for a second, higher pair: measured against this hull's surface, its
 *     footprint (y 0.8748-1.1188, z -0.3125..-0.0596) lies almost entirely over
 *     the raised HAUNCH pad, whose x = 0.675 is 0.040 outside the card's own
 *     0.635 — so the middle of that blotch would be swallowed by the hull and only
 *     two slivers would show. It also overlaps `plate-11`'s footprint by
 *     0.019 x 0.061, and two coplanar zero-thickness cards z-fight.
 *
 * ## The coat: what a patched cavy needs, and how much of it is sayable
 *
 * A guinea pig is very often two- or three-coloured **in patches**, and §6 of
 * `docs/HANDOFF.md` is blunt that colour here is a texture lookup with no
 * positional information in it. What saves this animal is that the marking it
 * needs is not a stripe or a spot but a REGION, and `box-41` arrives already cut
 * into three of them by Kenney — 262 triangles across bands 3, 7 and 15, measured:
 *
 *     band 3    37 tris   y -0.650..0.063, |x| <= 0.500, z -0.362..0.675
 *                         the underside, and the muzzle: the tiger's pale
 *     band 7    57 tris   |x| 0.200..0.625, the full height, z -0.675..0.575
 *                         the lower flanks, the chest and the rump
 *     band 15  168 tris   |x| 0.313..0.675, y -0.025..0.650, z -0.362..0.263
 *                         the back and the upper flanks: the tiger's dark
 *
 * Band 15 is **two connected components of 84 triangles, a mirror pair** — one
 * unbroken region a side, not a set of stripes — which is the measurement that
 * makes it safe to paint. So the body is three colours for three `byBand` entries
 * and no geometry at all, and the boundaries between them are Kenney's own cuts.
 *
 * **THERE IS DELIBERATELY NO `belly` LINE.** §4's way 2 paints one exact level
 * plane, and §7's own measurement of this hull is that the pack's split-triangle
 * boundary here **wanders 0.067 of the hull's height** (pale reaching 0.548, dark
 * starting 0.481). For every other mammal that wander is the defect and `belly:
 * 0.5` is the correction. For this one it is the point: a ruled horizontal line is
 * the single least patch-like thing a coat can have. So this species takes the
 * wandering cut and refuses the exact one — the only species so far to want way 1
 * BECAUSE way 2 is too precise.
 *
 * On top of that the two `plate-11` cards put a cream blotch on each flank, at the
 * card's own recorded (0.635, 0.69375, 0.095994). x = 0.635 is not adjusted for
 * this hull and does not need to be: the card's donors wear it 0.010 proud of a
 * 0.625 flank, and this hull's flank plane is also 0.625, so the pack's own
 * daylight carries over untouched. Each blotch straddles the band 7 / band 15 cut,
 * which is what makes it read as a patch laid ACROSS the coat rather than as a
 * third stripe of it.
 *
 * **FLAGGED, and only for what is still missing** — the patching is symmetric and
 * cannot be anything else. Nothing else strained: 671 triangles and 505 vertices
 * against the pack's 422-951 and 405-1626, height 1.4812 inside 1.43-2.02,
 * keep-out 0.782 against the fox's 1.15, one mass, no authored geometry, no hull
 * stretch, and the only stretch on the animal is a uniform halving of an ear.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

export const GUINEA_PIG_ASSEMBLY = defineCreature('animal-guinea-pig', {
  palette: {
    coat: 0x8f4a26,
    saddle: 0x33251d,
    patch: 0xf2ece1,
    limb: 0x6b3a20,
    pupil: PACK_PUPIL,  // the pack's own measured pupil; see texture.ts
    'box-04': 0xe6e2e0,
  },

  under: 'patch',
  hull: { part: 'box-41', paint: { base: 'coat', byBand: { 3: 'patch', 15: 'saddle' } } },
  ears: {
    part: 'tube-04',
    paint: 'saddle',
    stretch: [0.7, 0.35, 0.7],
    at: [0.4125, 1.2875, 0.4],
    spin: [{ axis: 'y', deg: 90 }, { axis: 'x', deg: 90 }],
  },
  nose: { part: 'box-32', paint: 'saddle', sink: 0.585813 },
  extras: [
    { name: 'mouth', part: 'plate-13', paint: 'saddle' },
    {
      name: 'blotch',
      part: 'plate-11',
      kind: 'pair',
      paint: 'patch',
      at: [0.635, 0.69375, 0.095994],
    },
    {
      part: 'box-04',
      name: 'box-04',
      paint: 'box-04',
      spin: [{ axis: 'z', deg: 90 }, { axis: 'y', deg: 90 }],
      at: [-0.0125, 1.45, -0.0375],
      stretch: [0.85, 1, 0.85],
    },
  ],
  flag: 'THE PATCHING IS SYMMETRIC AND CANNOT BE ANYTHING ELSE, and a real guinea pig\'s '
    + 'patching is asymmetric by definition — that is what makes one cavy tell apart '
    + 'from the next in a hutch of six. What IS here is a genuine three-colour coat '
    + 'with irregular boundaries, and none of it is faked: `box-41` arrives cut into '
    + 'three regions by Kenney (band 3 the underside and muzzle, band 7 the lower '
    + 'flanks and rump, band 15 the back and upper flanks — measured as two connected '
    + 'components of 84 triangles, a mirror pair, so it is one unbroken region a side '
    + 'and not a set of stripes), plus one `plate-11` cream blotch on each flank laid '
    + 'across the band 7 / band 15 cut. There is deliberately NO painted belly line: '
    + '§4\'s way 2 draws one exact LEVEL plane, and on a patched animal a ruled '
    + 'horizontal is the giveaway — this hull\'s own split-triangle boundary wanders '
    + '0.067 of its height and that wander is the read. What is NOT sayable is the '
    + 'asymmetry. Every mechanism the kit has is mirrored in x — `byBand` paints both '
    + 'halves of a shape, a `pair` places both flanks, and `Paint.patch` is a level '
    + 'plane with no z term at all — so a blotch on ONE shoulder, or a white face on '
    + 'one side only, is not awkward here, it is unsayable. The bank also holds exactly '
    + 'two marking cards, `plate-10` (0.244 x 0.253) and `plate-11` (0.400 x 0.433), '
    + 'both near-square and both mounted on a hull SIDE, so a patch can never appear on '
    + 'the crown or across the rump. Nothing was authored to fake any of it. Also worth '
    + 'your eye, because it is not obvious from a screenshot: this animal has NO TAIL '
    + 'ON PURPOSE and no snout feature — `box-41`\'s bounding-box front of 0.725 is a '
    + 'MUZZLE fused into the shell, 0.40 across on the midline, and the broad face '
    + 'behind it is at the usual 0.625.',
})
