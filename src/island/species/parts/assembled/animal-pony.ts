/**
 * The pony — Home Pets' only large quadruped, and the FIRST species in the
 * project to wear JT-044's two-tone leg.
 *
 * ONE SPECIES, ONE FILE. `register.ts` says why the one appended line in
 * `index.ts` is the whole of the wiring.
 *
 * ## JT-044: A HOOF IS A TWO-TONE LEG, AND FIVE FARM SPECIES COPY THIS FILE
 *
 * Joe's ruling, and it is settled: *"just use a two tone leg for hooves."* The
 * word `hoof` occurs ZERO times in `bank.generated.ts` — measured, and
 * `tests/island/assembly-pony.test.ts` re-measures it — so there is no shape to
 * reach for and none is to be authored. The mechanism already existed:
 * `Paint.patch` (`assembly.ts:152`) paints a boundary INTO the base slot's cell,
 * and the part's vertices read across that cell by their own height, so it needs
 * no triangle edge to cut along and costs no geometry at all.
 *
 * **Read this as a general tool and not as a hoof workaround.** It is equally a
 * pale paw, a fur sock, a bird's scaly foot against a feathered leg, a wader's
 * dark shin: any part whose colour changes at a LEVEL rather than at a seam. The
 * three constraints below are the tool's, not the pony's.
 *
 *   1. **`at` is a fraction of the PART's own height and must be k/16.**
 *      `texture.ts:106` throws otherwise, because a boundary you cannot name in
 *      the pack's own authoring units is one nobody can check. The arithmetic
 *      that chose 4/16 here is under "the hoof" below, and it is a measurement
 *      off `box-01`, not a preference.
 *   2. **The patch applies to the BASE slot only** (`assembly.ts:366`). A
 *      triangle a `byBand` has already sent elsewhere keeps its flat colour — so
 *      `patch` and `byBand` must never be put on the same part, because half of
 *      the part would then silently ignore the line. Nothing on this animal does
 *      both: the legs patch and do not band, the muzzle bands and does not patch.
 *   3. **A spun part's boundary spins with it.** The line is defined on the
 *      part's own y, which is world-parallel only while the part is unspun.
 *      **Legs are never spun** — `creatureSpec` gives the leg row no `spin` field
 *      at all — so a hoof is safe by construction. A builder copying this onto
 *      something that IS spun (an ear, a tail, a ridge row) gets a boundary
 *      raked over at the spin angle, and that is a thing you might want and must
 *      not get by accident.
 *
 * One more, and it is the one that bites at build time rather than at review:
 * **two parts patching the SAME slot at different heights throws**
 * (`assembly.ts:487-501`, "one cell, one picture"). This species patches `limb`
 * for the hoof and `coat` for the belly — two different cells — and nothing else
 * may patch `limb` here.
 *
 * And one honest caveat for whoever copies this next, measured rather than
 * feared. The IMAGE is exact: rows 0-3 of the `limb` cell are the hoof colour and
 * rows 4-15 are the leg, and the test reads those twelve and four texels rather
 * than believing this sentence. What is approximate by a whisker is where that
 * texel edge lands on the MESH, because `patchUv` clamps the end rows to half a
 * texel (`texture.ts:182`) so no vertex samples its neighbour's cell on some
 * driver. `box-01` has only three vertex rows — at t = 0, 0.2041 and 1 — and the
 * clamp pulls the last of those to row 15.5 instead of 16, so interpolating from
 * the ring at row 3.2658 puts the boundary at **0.077120 above the sole against
 * the ideal 0.076563**. That is 0.00056, three tenths of one percent of
 * the visible leg, and it is the price of the half-texel guard rather than an
 * error in the arithmetic. On a part with more rows through the seam it shrinks
 * again. It is written down because a Farm species measuring its own hoof and
 * finding 0.0771 should recognise the number, not go looking for a bug.
 *
 * ## What a child names a pony by, and what each of those cost
 *
 * A long face, upright ears, a MANE, a FORELOCK, a long tail, four dark HOOVES,
 * and a stocky barrel on short legs. The leg row is fixed at y = 0.18125 on every
 * species, which is fortunate: a Shetland is short-legged and could not have said
 * so otherwise.
 *
 *   - **The hull is `box-03`, the 1.250 cube, and the two shells that looked
 *     likelier are refused.** `box-41` (the tiger's, `OTHER_HULLS.bigger`) is the
 *     obvious barrel at 1.350 x 1.300 x 1.350 and it is REFUSED on a measurement:
 *     its front face stands at z = 0.725 and reaches that far over local y
 *     -0.3375 to +0.2875, which is world 0.49375 to 1.11875 and takes in the eye
 *     card's own y = 0.933646 — while `EYE_CARD_Z` is 0.6350 and is not a
 *     parameter (rule 5, `hulls.ts:126`). Both eye cards would sit **0.090 behind
 *     that surface**, which is not a card floating too proud, it is a face with
 *     no eyes on it. `box-12`
 *     (the cow's) is refused for the reason `animal-badger.ts` measured: its extra
 *     0.289 of width is two fused EAR LUGS on the sides of a 1.250 cube, so
 *     wearing it would mean either four ears or no upright ears, and upright ears
 *     are half of what makes this animal a pony rather than a big dog.
 *
 *   - **THE EARS ARE `cone-01`, WIDENED, AND THE BUNNY'S EAR IS REFUSED.**
 *     Measured over the ten y+-attached ears in the bank, how far each stands
 *     proud of the head at its own recorded burial — `size[1] x (1 -
 *     sunkFractionMean)`:
 *
 *         box-06  0.5788   the bunny's, and 4.25x the median
 *         cone-01 0.2754
 *         box-05  0.2320
 *         wedge-06 0.1544  cat      cone-02 0.1532  dog/pig
 *         wedge-04 0.1192  chick    cone-04 0.0845  hog
 *         box-02 / box-34 0.0700   wedge-16 0.0623  tiger
 *
 *     `box-06` on this hull makes the animal **2.0101 tall**, which is
 *     `animal-fennec-fox`'s own height to four decimals and whose whole claim is
 *     that its height is ear. A Shetland is the opposite animal. So the pony takes
 *     **`cone-01`, the tallest upright ear in the bank that is not the rabbit's**,
 *     and takes it for three measured reasons and not for its provenance: it shows
 *     0.2754; its **taper is 0.000**, so it comes to a point, where the cat, dog,
 *     chick and tiger ears are blunt at 0.410 to 0.680 and a horse's ear is not;
 *     and its own burial is **0.3122 x 0.400356 = 0.125001**, which is §3's
 *     nothing-floats floor exactly, so it is placed at the pack's own minimum with
 *     nothing invented.
 *
 *     It is **stretched 2x in x, and only in x**. `cone-01` is 0.1600 across
 *     against 0.3286 deep — measurably a BLADE, because it is the bee's antenna
 *     and an antenna is flat. A horse's ear is round at the base, so 2x lands it
 *     at 0.3200 x 0.3286, round to within 2.6%. §3 measures ears varying 2.97x
 *     naturally and names them one of the two kinds a stretch is safe on.
 *
 *   - **Only the ears' z is chosen, and their y is a pure recovery.** Joined at
 *     this hull's top face y = 1.43125 and sunk `cone-01`'s own 0.3122, the centre
 *     lands at **y = 1.506437 — the bank's recorded offset for the shape**, the
 *     bee's own placement recovered rather than copied, because the bee's hull is
 *     this hull. The z is NOT taken over: the bee's recorded z = 0.4697 is past
 *     `box-03`'s flat top face, which reaches only 0.3125, and the chamfer falls
 *     away 1:1 — the surface there is at 1.43125 - 0.1572 = 1.27405 while the
 *     ear's underside is at 1.30625, so the copy would stand **0.032 clear of the
 *     hull**. §3 says nothing floats. At z = 0.2500 — 4/16, on the pack's grid —
 *     the join is on flat geometry and even the ear's front bottom corner
 *     (z = 0.4143, surface 1.32945) is inside the mass.
 *
 *   - **THE MANE AND THE FORELOCK ARE IMPROVISED, AND THIS IS THE PART TO LOOK AT
 *     FIRST.** There is no mane shape in the bank — no `mane`, no crest, no ridge
 *     of hair — and JT-043 is explicit that a missing part is improvised rather
 *     than reported: *"i am pretty sure i can build in the missing bits with what
 *     we have otherwise. bit of clever sizing and rotation will get a lot done."*
 *
 *     **The obvious route does not exist, and that is worth recording.** A `ridge`
 *     is the mechanism for a row along the top of a hull, and a mane is exactly
 *     that shape — but `creatureSpec`'s ridge branch resolves its part with
 *     `partById` ALONE (`creature.ts:761`), never `authoredById`, so **a ridge
 *     cannot wear one of JT-041's three base shapes** and throws by name if asked.
 *     A ridge of a bank part is possible and was rejected on the read: a row of
 *     discrete spikes along a back is a hedgehog, a dragon or a crocodile —
 *     `animal-hedgehog.ts` and `animal-crocodile.ts` are both already that — and a
 *     mane is a CONTINUOUS crest, not a row.
 *
 *     So the mane is one `bespoke-square-01` (JT-041, sanctioned for everybody,
 *     needs no flag), re-cut at 0.125 x 0.500 x 0.625 — a thin wall standing along
 *     the crest. Three of those numbers are the hull's own: 0.625 is exactly the
 *     length of `box-03`'s flat top face, and half of 0.500 buried at the
 *     primitive's own declared 0.5 sink leaves **0.250 proud, which is 4/16**. It
 *     runs z +0.250 to -0.375, from between the ears back to the withers, and its
 *     rear end is embedded 0.1875 where the chamfer has fallen 0.0625. The
 *     forelock is the same shape at 0.375 x 0.350 x 0.150 on the FRONT-TOP
 *     CHAMFER — midpoint (0, 1.2750, 0.46875) off `box-03`'s own measured 0.46875,
 *     turned onto that chamfer's normal by `{ axis: 'x', deg: 45 }` — which is §8's
 *     chamfer idiom used for one part instead of a row. Both are painted the mane
 *     slot, and together they are the pony's whole signature. The forelock's
 *     0.500 along its own normal is what carries it past the hull's top face and
 *     its front face at once — at 0.350 it sat flush inside the chamfer and
 *     vanished from the silhouette, which is a thing a still image hides.
 *
 *     A primitive is RE-CUT at its stretched size rather than multiplied
 *     (`authored.ts:284`), so both keep a chamfer that is still 0.25 of their own
 *     smallest dimension and still at 45 degrees. That is the only reason a
 *     0.125-thick wall is allowed to look like it belongs to this pack.
 *
 *   - **THE TAIL IS `box-38` TURNED UPSIDE DOWN, and the spin is the whole
 *     animal.** §7 splits the seven tails on THICKNESS, not length: thin 0.200 to
 *     0.345, thick 0.589 to 0.744, a 1.7x gap with nothing in it. A horse's tail is
 *     emphatically thick, which refuses `wedge-07`, `wedge-15`, `wedge-18` and
 *     `box-18` outright and costs nothing to say. Of the thick three, `box-23` is
 *     the fox's brush and `animal-wolf.ts` has already measured why it is left
 *     alone (taper 0.961, round section, 1.67x the volume of any other tail — it
 *     reads as a fox whatever colour it is painted), and `wedge-03` is the
 *     beaver's paddle at 0.726 across, 58% of this body's whole width.
 *
 *     `box-38` is the parrot's fan and it arrives the wrong way up: its narrow
 *     stalk — the ONLY part of it inboard of the join plane, 12 points at local
 *     y -0.4561 to -0.3561 with |x| <= 0.0850 — is at the BOTTOM, so it fans
 *     upward. **`{ axis: 'z', deg: 180 }` negates x and y and leaves the facing
 *     `z -1` untouched**, which puts the stalk at the top and the broad fall
 *     below it, tapering to a point at the tip. That is a dock at the top of the
 *     croup with the hair hanging off it, which is a horse's tail and is not a
 *     parrot's.
 *
 *   - **The tail's height is solved, not chosen.** Joined at y = 0.662654 the
 *     spun stalk occupies world y 1.01875 to **1.11875, which is where
 *     `box-03`'s flat rear face stops** (0.80625 + 0.3125) — the highest join at
 *     which the whole root is on real flat geometry rather than hanging off a
 *     chamfer that has already receded. The fall then reaches down to y = 0.2066,
 *     just under the belly at 0.18125, and its top never breaks the back line at
 *     1.43125. Everything else about it is the donor transfer: its centre lands on
 *     **z = -0.772919, the parrot's own recorded offset**, recovered.
 *
 *   - **The muzzle is `tube-06`, the fox's, and it is here for Kenney's own cut.**
 *     It and the deer's `tube-03` are the same bounding box to six decimals
 *     (0.532 x 0.300 x 0.231); `tube-06` is the one he split, band 3 being the
 *     lower 20 triangles and band 7 the upper 14. Painting band 3 pale gives a
 *     **mealy muzzle** — the pangaré pattern, which is genuinely characteristic of
 *     Shetlands and of the primitive pony type — for one `byBand` entry and no
 *     geometry. Note the direction: `animal-badger.ts` and `animal-wolf.ts` both
 *     paint the base pale and band 7 dark, and this is the inverse, base coat with
 *     band 3 pale, which is the same part reading as a different animal. Joined at
 *     the front face z = 0.625 sunk its own 0.000, its centre lands on
 *     **z = 0.740710, the fox's own recorded offset to six decimals.**
 *
 *   - **The nose is `box-14`, the DEER's**, on `on: 'snout'` so it hangs off the
 *     muzzle's own placed front plane at z = 0.85642 rather than off an arithmetic
 *     this file would otherwise keep a stale copy of. It is the pack's ungulate
 *     nose and it is small — 0.2288 x 0.1505 x 0.1261 — which is what a horse has
 *     against a dog's pad. Deliberately not `wedge-10`, which is measurably a nose
 *     TIP and reads as a tongue; Joe rejected that one by name on the hedgehog.
 *
 *   - **The belly is PAINTED at 8/16**, §4's second way: the tiger's own mammal
 *     line made exact, the only point on the pack's 1/16 grid inside its measured
 *     0.4808-0.5481 zone, and also this hull's own equator. It is the same pangaré
 *     pale as the muzzle, which is one colour doing two true jobs.
 *
 * ## Considered and REFUSED, so the next builder does not add them back
 *
 *   - **`box-41` and `box-12` as the hull** — the eye-card burial and the four-ear
 *     problem, both measured above.
 *   - **`box-06`, the bunny's ear** — 2.0101 tall, `animal-fennec-fox`'s own
 *     number, and a donkey's silhouette on a Shetland.
 *   - **`box-23`, the fox's brush, and `wedge-15`, the lion's** — the first on
 *     `animal-wolf.ts`'s measurement, the second because §7 puts it in the THIN
 *     group at 0.280 and because at 212 triangles it is the most expensive common
 *     part in the bank, four times `box-38`'s 48 for a tail that is the wrong
 *     shape.
 *   - **A MOUTH CARD.** `plate-03` / `plate-13` became placeable when
 *     `CARD_STANDOFF` landed, and this species still cannot use one. Solved, a
 *     card joins the HULL's front face and lands at (0, 0.6937, 0.635) — which is
 *     0.22 inside this animal's own muzzle, because the muzzle reaches z = 0.85642.
 *     Anchored `on: 'snout'` instead it lands dead centre on the muzzle's front
 *     plane, which is the one point the nose already occupies. A horse's mouth is
 *     UNDER its muzzle and neither the solve nor the anchor can say "under": both
 *     take a plane and neither takes an offset within it. Recorded rather than
 *     hard-coded — the `at: [0, 0.686849, 0.635]` that the goldfish, the firefly
 *     and the glow-worm each carry was a workaround for a bug that is now fixed,
 *     and inventing a fresh one here would be the same mistake with a new number.
 *   - **`plate-10` / `plate-11`, the flank cards, for a piebald.** Real on a
 *     Shetland and refused on size: they are 0.244 x 0.253 and 0.400 x 0.433,
 *     near-square blotches mounted at x = 0.635, and they are the COW's, the DOG's
 *     and the GIRAFFE's own markings. A pinto's patch covers a third of a flank in
 *     one irregular field; the largest card in the bank covers 0.35 of this hull's
 *     height as a blob. This pony is a solid bay, and the separation it needs is
 *     carried by the mane, the hooves and the tail, not by a marking.
 *
 * ## Silhouette, and the collection it stands in
 *
 * The pony is the only large quadruped in Home Pets, which is room rather than
 * safety. **Its signature is the MANE plus the HOOVES plus the long falling
 * TAIL** — no rodent, cage bird, gecko, terrapin or ferret has any of the three,
 * and no two of them can be arrived at by tuning a proportion. The coat is a
 * saturated red-bay that the six sandy rodents would not want and that no cage
 * bird could be.
 *
 * Measured on the built model: height **1.7066** inside 1.43-2.02 with the feet on
 * y = 0, keep-out **1.038** against the fox's own 1.15, stockiness 1.250/1.7066 =
 * 0.732 inside 0.55-1.35. Nothing is over budget, no rule is strained, the hull is
 * unstretched, and the only authored geometry is two of JT-041's three base
 * shapes, which need no flag and get none.
 *
 * **NOT FLAGGED, and the palette is the one thing here nobody has signed off** —
 * `home-pets.ts` gives this species a one-line record and no colours, so all five
 * below are the first ever proposed for it and are marked UNREVIEWED.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

export const PONY_ASSEMBLY = defineCreature('animal-pony', {
  palette: {
    coat: 0x9a5f33,
    belly: 0xe2cfae,
    mane: 0x33281f,
    limb: 0x6d4525,
    hoof: 0x2b2724,
    pupil: PACK_PUPIL,  // the pack's own measured pupil; see texture.ts
  },

  hull: 'box-03',
  belly: 0.5,
  legs: { paint: { base: 'limb', patch: { below: 'hoof', at: 0.25 } } },
  eyes: { x: 0.2625, y: 1.0625 },
  ears: { part: 'cone-01', stretch: [2, 1, 1], at: [0.2276, 1.43125, 0.25], paint: 'coat' },
  tail: {
    part: 'box-38',
    spin: [{ axis: 'z', deg: 180 }],
    at: [0, 0.662654, -0.625],
    paint: 'mane',
  },
  snout: {
    part: 'tube-06',
    paint: { base: 'coat', byBand: { 3: 'belly' } },
    stretch: [1, 3.05, 2.55],
    at: [0, 0.65, 0.4125],
  },
  nose: { part: 'box-14', paint: 'mane', stretch: [1, 3.05, 1], at: [0, 0.65, 0.9625] },
  extras: [
    {
      name: 'mane',
      part: 'bespoke-square-01',
      stretch: [0.1, 0.4, 0.5],
      at: [0, 1.4375, 0.125],
      paint: 'mane',
    },
    {
      name: 'forelock',
      part: 'bespoke-square-01',
      stretch: [0.3, 0.4, 0.12],
      spin: [{ axis: 'x', deg: 45 }, { axis: 'x', deg: 90 }],
      at: [0, 1.275, 0.46875],
      paint: 'mane',
    },
  ],
  motion: [{ kind: 'wag', parts: ['tail'] }, { kind: 'twitch', parts: ['ear'] }],
})
