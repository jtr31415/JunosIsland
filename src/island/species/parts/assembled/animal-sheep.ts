/**
 * The sheep — Farm's woolly one, and the exemplar the goat, the llama and the
 * alpaca are cut from.
 *
 * ONE SPECIES, ONE FILE. The invariants every assembled species carries are
 * `assertAssembly`; this file is what only a sheep can say.
 *
 * ## THE PROBLEM: THE BANK HAS NO FLEECE
 *
 * `collections/farm.ts` gives this animal one line — *"Fleece is carried by
 * PALETTE, not by geometry — the bank has no bumped or relief shape and JT-041
 * forbids authoring one."* That is the whole design brief and it is a statement
 * about the data: there is no tufted, bumped, dimpled or relief shape among the
 * 94 baked parts, `BAKED_ROLES` has no `fleece`, and rule 1 is adapt-before-
 * author. So woolliness has exactly two carriers and this file's job is to say
 * how far each one goes and to write down what the other two woolly species
 * inherit:
 *
 *   1. **PALETTE.** A matte, pale, low-contrast cream reads as wool; a saturated
 *      or glossy colour does not. This is the cheap half and it is spent below.
 *   2. **SILHOUETTE.** A rounder, fuller body than a goat's. That is a HULL
 *      choice, because `HullDef.stretch` is `never` and a proportion is a shell.
 *
 * And a third that was measured and REFUSED, which is the most useful thing here
 * for a sibling: a shell-ring BAND worn as a fleece collar. §2 is the arithmetic.
 *
 * ## 1. THE HULL IS `box-41`, AND `animal-horse.ts` ALREADY MEASURED IT
 *
 * The tiger's "bigger" shell: 1.350 x 1.300 x 1.350 at its recorded
 * (0, 0.83125, 0.05), against the cube's 1.250 at (0, 0.80625, 0). It is the
 * roundest, fullest body the pack owns and it is 0.100 wider and 0.100 deeper
 * than everything a goat can stand on, which is exactly the separation Farm's
 * two horned/woolly siblings need.
 *
 * **Do not re-measure it. `animal-horse.ts` §1 is the survey** — all six faces,
 * the muzzle boss at z = 0.725 that the pony, the degu, the ferret and the gecko
 * each mistook for a front face, the two ear ridges, the three bands, and the
 * finding that `box-41` IS `box-03` with its edges filled out. Four of its
 * planes are the cube's to the last decimal, which is why every constant below
 * that says IDENTICAL is a number a sibling on `box-03` can still use.
 *
 * ONE NUMBER THIS FILE ADDS, because three species now wear this shell and it is
 * better said once than discovered three times. The horse records that the boss
 * *"stops 0.0398 below the eye card"* — true of the card's CENTRE, and the card
 * is 0.320208 tall, so the boss is not clear of it. Rasterised against
 * `plate-01`'s own 27 drawn triangles rather than its bounding box, the boss
 * stands in front of **3.61%** of one eye card, in the inner-LOWER sliver.
 * `plate-08` would be 6.40% and `plate-14` 7.08%, which is the second reason
 * this species keeps the pack's own almond. It is not a defect: a muzzle
 * occluding the inner corner of an eye is what a muzzle does, `animal-pony.ts`
 * has the same overlap from `tube-06` on the cube, and rule 5 says an eye is
 * never adjusted — so nothing here is moved to avoid it.
 *
 * ## 2. THE FLEECE COLLAR, AND WHY THERE IS NONE — the trade all four inherit
 *
 * A shell-ring wrapping the chest is the single cheapest way to say "this animal
 * is wearing a coat", and it is the first thing anybody will reach for here. The
 * bank has five. Measured as how far each stands PROUD of the shell it wraps —
 * the band's own outer half-extent less the hull's:
 *
 *     band     across    on box-41 (0.675)   on box-03 (0.625)
 *     box-04    1.335       -0.0075 buried      +0.0425
 *     box-35    1.343       -0.0033 buried      +0.0467
 *     box-19    1.404       +0.0270             +0.0770
 *     box-11    1.445       +0.0473             +0.0973
 *     box-29    1.650       +0.1500             +0.2000
 *
 * **The stocky hull and a readable band are mutually exclusive, and the 0.100
 * that makes `box-41` round is exactly the 0.100 that eats the clearance.** Two
 * of the five go NEGATIVE on this shell — `box-04` and `box-35` are narrower
 * than the body and would be swallowed whole — and the two middle ones stand
 * 0.027 and 0.047 proud of a 1.350 body, which is under five times the pack's
 * own card standoff of 0.010 and is a welt rather than a coat.
 *
 * **`box-29`, the LION'S MANE ring, is the only one that reads, and it is
 * refused on its own arithmetic and not on cost.** It fits the body
 * astonishingly well in one direction — its aperture measures 1.3482 across
 * against this hull's 1.3500, so it slips over the barrel with 0.0018 of
 * interference and cannot float — but it is 1.650 across against a body 1.300
 * TALL, so wherever it is centred it must overhang by **0.350 in total**: at the
 * lion's own y it stands 0.250 above the crown and hangs 0.100 below the belly,
 * and set flush to the belly it stands 0.350 above the back. A ring that clears
 * an animal's own spine by a quarter of a unit is a MANE. It also fits the
 * budget with room — its 224 raw vertices on top of this species' measured 375
 * body vertices is still 599 against rule 9's ceiling of 1114 — so cost is not
 * the reason and nobody should re-try it hoping it is cheaper now.
 *
 * **The sheep therefore spends its roundness on the HULL and buys nothing
 * else** — and that is the trade the three siblings inherit, stated as a choice
 * rather than an omission: a species that wants a visible ruff has to go back to
 * `box-03`, where the same five bands stand 0.043 to 0.200 proud, and give up
 * the round body to get it. On this collection that is the goat's trade, not
 * this animal's, because a goat is lean and a sheep is not.
 *
 * ## 3. THE DARK FACE IS BAND 3, AND RULE 3 LEAVES NO HEAD TO PAINT
 *
 * A UK lowland sheep is a cream body with a dark face, dark ears and dark legs,
 * and that is what a child draws. Two of the three are parts; the face is not,
 * because rule 3 fuses head and body into one shell with no seam at the neck —
 * so there is nothing for a "head colour" to be a colour OF.
 *
 * Kenney solved it before we asked. `box-41` arrives cut into three bands and
 * **band 3 is 37 triangles: 31 of them the muzzle region on the front plate and
 * the boss standing out of it, 6 of them the underline.** Measured in this
 * shell's local frame, the front group runs |x| <= 0.3125, y -0.3375 to +0.0625,
 * z 0.575 to 0.675 — a patch **0.625 across and 0.400 tall** on the flat front
 * plate, with the 0.400-wide octagonal boss rising 0.100 out of the middle of
 * it. Painted dark that is a sheep's face: 0.400 of it stands proud as a blunt
 * muzzle and the rest is the flat mask around and under the eyes.
 *
 * It costs no geometry, no straight line and no second shape, and it is the same
 * entry `animal-horse.ts` spends the other way round for a Haflinger's pale
 * mealy muzzle. **One shell, one band, two opposite animals** — which is the
 * argument for using Kenney's own cut instead of drawing a horizontal.
 *
 * Two consequences, both accepted rather than worked around:
 *
 *   - **The 6 underline triangles go dark with the muzzle**, because they are one
 *     palette entry. They are the flat bottom face and the lower front chamfer,
 *     world y 0.18125 to 0.49375 — under the animal, between the legs, where the
 *     island camera never goes — and on a dark-faced sheep the dark does run down
 *     the throat onto the brisket. It reads as shadow and it is free.
 *   - **`belly` is REFUSED, and not only because it cannot be combined.** A
 *     fleece is uniform: a sheep has no pale underside, which is the whole
 *     difference between it and every mammal in this pack that carries
 *     `belly: 0.5`. The mechanical bar is real too — `creature.ts:585` turns
 *     `belly` into a `patch` on the hull's own paint and JT-044 never allows
 *     `patch` beside `byBand` on one part — but the animal refuses it first.
 *
 * **What could NOT be done, with the number that refuses it.** `blade-05`, the
 * lion's 1.000 x 1.000 x 0.125 muzzle PLATE, is the obvious way to make the dark
 * face bigger, and it is 28 verts and 18 triangles. Solved onto this hull it
 * joins at `frame.front` = 0.725 and spans z 0.725 to 0.850 across x +/-0.500 and
 * a full unit of height — in front of `EYE_CARD_Z` = 0.6350 across the whole of
 * both cards. It does not occlude the eyes, it deletes them.
 *
 * ## 4. THE LEGS: THE WHOLE OF `box-01`'s USABLE RANGE, ONCE, FOR FOUR SPECIES
 *
 * JT-044 — *"just use a two tone leg for hooves"* — and Joe's own note that it
 * is a general tool. `animal-pony.ts:289-321` derived the HOOF end of it. This
 * file derives the OTHER end, and then the range between them, because a fleece
 * line is the opposite marking on the same part and three siblings need it.
 *
 * `box-01` is 0.375 x 0.30625 x 0.375 and its 80 referenced points sit on three
 * y rows and no more: -0.153125 (the sole), -0.090625 (the full-width ring) and
 * +0.153125 (the top). Two facts follow and they are the only two lines on the
 * shape:
 *
 *     THE FOOT'S BEVEL      0.0625 up from the sole = 0.204082 of its height
 *     THE HULL'S BELLY      the leg is buried 0.125, so it SHOWS 0.18125,
 *                           which is 0.18125 / 0.30625 = 0.591837 of its height
 *
 * `at` must be k/16 (`texture.ts:106-115`, k in 1..15), and the DRAWN boundary is
 * not the ideal one: `patchUv` clamps the two end rows half a texel inside the
 * cell, so the leg reads v = 0.5 at the sole, 3.2658 at the bevel top and 15.5 at
 * the top, and a boundary at row k lands at
 *
 *     y(k) = -0.1531 + 0.0625            for k in the sole-to-bevel segment
 *     y(k) = -0.0906 + (k - 3.2658) / (15.5 - 3.2658) x 0.2437   above it
 *
 * Run over every grid point, measured from the sole and against the two lines:
 *
 *     k     drawn above sole    where it lands
 *     3     0.05651             INSIDE the foot's bevel — the line rakes
 *     4     0.07713             clears it by 0.0146. THE HOOF. (the pony's)
 *     5     0.09705
 *     6     0.11697
 *     7     0.13688
 *     8     0.15680             0.02445 below the belly. THE FLEECE LINE.
 *     9     0.17673             0.00452 below the belly — 2.5%, invisible
 *     10    0.19664             INSIDE THE HULL. nothing is drawn at all
 *
 * **So `k` in 4..9 is the whole usable range on the pack's universal leg, six
 * values, and both ends are forced by a measurement rather than a taste.** Below
 * 4 the boundary follows a sloping face; above 9 it is inside the body. That is
 * the sentence the goat, the llama and the alpaca should point at.
 *
 * **This sheep spends 8/16**, and the two nearest are refused with numbers:
 *
 *   - **9/16 refused.** It is the top of the range and it is nearly the right
 *     idea — a lowland sheep's wool stops AT the body line — but the clamp puts
 *     its drawn boundary 0.00452 under the belly, which is 2.5% of the 0.18125 a
 *     child can actually see and is sub-pixel in the album portrait. `animal-
 *     ferret.ts` refused a stocking on exactly this ground: a line you cannot see
 *     is a marking the animal does not have, and drawing one to use a feature is
 *     the failure the mechanism invites.
 *   - **4/16 refused**, though it is the pony's and five Farm species copy it. A
 *     sheep has no pale shank standing above a dark hoof; it has a dark leg with
 *     the fleece coming over the top of it. Same tool, opposite marking.
 *
 * 8/16 draws at 0.15680 above the sole, leaving **0.02445 of cream over 0.15680
 * of dark: 13.5% fleece, 86.5% leg**, which is "dark for most of its length" made
 * exact. Two checks on it that the choice never used: 8/16 is the pack's own half
 * and the tiger's mammal belly line, the number `belly: 0.5` spends on the HULL
 * everywhere else in this pack — so a sheep whose wool line on the leg is the
 * same fraction as the pack's belly line on the body says one thing twice instead
 * of inventing a second number; and it is the only grid point inside 4..9 that
 * lands on a value the pack already writes down.
 *
 * Within 4..9 the choice is the ANIMAL's and only the ends are forced. An alpaca
 * carrying fleece to its ankles belongs at 6/16 or 7/16 and should say so; a goat
 * belongs at 4/16 with the horse.
 *
 * ## 5. THE EAR, MEASURED OVER ALL SIXTEEN, AND WORN ON ITS SIDE
 *
 * A sheep's ear is SMALL and it is held out SIDEWAYS, which is two constraints
 * and the bank answers both with one shape nobody has spent yet.
 *
 * `cone-02` is the dog's and the pig's: 0.445455 x 0.377573 x 0.463702, and at
 * **60 vertices and 36 triangles it is the cheapest ear in the bank** — against a
 * median of 110 verts over the sixteen ear shapes, and against `box-02`'s 168 and
 * `box-34`'s 216. There is no pig in Farm's sixteen and no dog anywhere in the
 * project, so it is unspent.
 *
 * It is worn on its SIDE — `axis: 'x'` — which is the whole separation from the
 * horse standing beside it. The two ears in the digest's shortlist are both
 * refused by their own numbers:
 *
 *   - **`box-02`**, the beaver's and polar bear's top-face button, is a `y +1`
 *     ear and shows **0.0700** proud at its own burial. It is the hamster's
 *     already, it costs 168 verts for that 0.070, and it points UP.
 *   - **`tube-04`/`tube-05`**, the elephant's, is the one genuinely side-mounted
 *     ear in the bank and shows 0.3139 proud — but it is 0.61875 long, 1.64x this
 *     shape, and roster §4 gives the camelids their separation on neck and ear.
 *     **That pair is the llama's and the alpaca's; this file leaves it alone by
 *     measurement rather than by fiat.**
 *
 * Turned onto its x axis, `cone-02` is joined across its own 0.445455 and buried
 * its own recorded 0.594288 of it — 0.264726, more than twice §3's nothing-floats
 * floor of 0.125 — so it stands **0.180729 proud**, 0.463702 fore-and-aft and
 * 0.377573 tall. That is a leaf-shaped flap sticking out of each side of the
 * head, which is what a sheep's ear is from above.
 *
 * All three coordinates of the join are the shell's own or the pack's grid:
 *
 *   - **x = 0.675** is `box-41`'s maximum side reach — its flank PAD, the pair of
 *     raised plates the tiger carries at |x| = 0.675 over y 0.86035 to 1.13385 and
 *     z -0.2575 to 0.2575. Joining there rather than on the 0.625 flat flank means
 *     the ear is buried between 0.2147 and 0.2647 wherever the surface actually
 *     is, and can never float.
 *   - **y = 0.99710** is that pad's own vertical centre, (0.86035 + 1.13385) / 2.
 *     It puts the ear level with the eye card at 0.933646, which is where a
 *     relaxed sheep carries it, and it keeps the ear's whole 0.377573 of height
 *     backed by real shell.
 *   - **z = 0.2500** is 4/16 and is the horse's own ear z on this same shell, and
 *     it is inside the pad's 0.2575. **The two Farm species on `box-41` therefore
 *     stand their ears at the same station and differ only in the face they join
 *     to** — the horse on the crown ridges pointing up, this one on the flank
 *     pads pointing out. That is a separation a child reads instantly and neither
 *     animal had to be moved for it.
 *
 * ## 6. THE TAIL, AND THE ONE HEIGHT IT FITS
 *
 * `box-18` is Kenney's `tail` on the elephant and Kenney is wrong — it is the
 * TRUNK, which is why it is the only tail shape in the bank attached `z +1`.
 * `animal-hamster.ts` has the full argument for it as a stub and a sheep wants
 * the same thing for the same reason, spun 180 on y so the `z +1` becomes a
 * `z -1`, baked into the copy's vertices (rule 4).
 *
 * **One correction to that argument, re-measured.** The hamster calls it *"the
 * shortest tail shape in the bank by 0.130"*, and it is not: the beaver's
 * `wedge-03` reaches **0.4153** against this shape's **0.4252**. The claim needs
 * `assembly-pony.test.ts:379-397`'s qualifier — that file splits the seven tails
 * on THICKNESS at 0.4 with a 1.7x gap and nothing in it — and `wedge-03` is
 * 0.5885 thick where this is 0.3450, so it is a paddle. Inside the thin four this
 * shape is the shortest by 0.0417, and that is the true statement.
 *
 * The height is SOLVED and it is a two-thousandth-wide window. `box-41`'s flat
 * rear plate runs y 0.49375 to 1.11875 — 0.625 tall, IDENTICAL to `box-03`'s —
 * and this shape is **0.623004 tall**. So the whole of its root lands on flat
 * geometry only while its centre is inside [0.805252, 0.807248], a window
 * 0.001996 wide, and the midpoint of it is **0.80625 — the pack's own recorded
 * hull centre for `box-03`**, recovered from a solve that never read it. The
 * donor's own 0.482248 is not taken: it is measured on a cube where this shape
 * hangs off the rump's lower chamfer and reaches 0.0106 below the hull's bottom
 * face, which the hamster accepted for a nub near the ground and a sheep should
 * not, because a sheep's tail sets high on the croup.
 *
 * ## 7. THE PALETTE: FOUR SLOTS, AND THE FLEECE IS THE ONE THAT DOES THE WORK
 *
 * Insertion order IS the texture layout, so the list is data.
 *
 * Farm's header gives this species no colours, so all three are first proposals.
 * The fleece is the argument: **matte, pale and LOW-CONTRAST**, because that is
 * the half of "woolly" the geometry cannot carry. It is an oatmeal off-white with
 * a warm grey cast rather than a white — a saturated cream reads as a duckling
 * and a true white reads as plastic — and it is deliberately the lowest-chroma
 * body colour in this collection, against the horse's golden chestnut beside it.
 *
 * `limb` exists because of a mechanism and not a colour: `assembly.ts:487-501`
 * allows a slot exactly one painted boundary — *"one cell, one picture"* — so the
 * leg needs its own cell to carry the fleece line. It is taken a shade under the
 * coat, which is where wool under a body sits anyway. There is no `belly` slot,
 * so `under` falls back to the coat and the eye cards' sclera is fleece cream on
 * a dark face, which is a sheep's pale eye.
 *
 * **No flag.** Nothing was strained: height 1.48125 inside 1.43-2.02 and set by
 * the crown, 375 body vertices against 236-1114, 503 against 405-1626, 670
 * triangles against 422-951, the hull at the shell's own 1.350 x 1.300 x 1.350,
 * one spin, nothing authored, nothing stretched, and no number in this file that
 * is not a measurement off the bank or off the hull.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/* ===================================================================== *
 * `box-41`, world, at its recorded offset (0, 0.83125, 0.05).
 * `animal-horse.ts` is the full survey of this shell; these are only the
 * four planes this species actually joins to.
 * ===================================================================== */

/** The flank PAD: `box-41`'s maximum side reach, y 0.86035-1.13385, z +/-0.2575. */
const FLANK_PAD_X = 0.675
/** That pad's own vertical centre, (0.86035 + 1.13385) / 2. The ear's height. */
const FLANK_PAD_MID_Y = 0.9971
/** The flat rear plate. IDENTICAL to `box-03`'s -0.625. */
const REAR_PLATE_Z = -0.625
/**
 * The only height at which `box-18`'s whole root lands on that plate: the plate
 * is 0.625 tall and the shape is 0.623004, so the centre must sit inside a
 * window 0.001996 wide and this is its midpoint. It recovers `box-03`'s own
 * recorded hull centre, which the solve never used.
 */
const TAIL_JOIN_Y = 0.80625

/**
 * The muzzle boss's own vertical centre: the hull centre 0.83125 less 0.1375,
 * which is the mid-height of the octagon's y span of -0.3375 to +0.0625. The
 * nose sits here so that its whole 0.228845 of width is backed by boss — the
 * octagon is 0.1688 wide at the nose's lowest row and 0.1740 at its highest.
 */
const BOSS_MID_Y = 0.69375
/** The boss's own front plane, and `frame.front` for this shell. */
const BOSS_FRONT_Z = 0.725

export const SHEEP_ASSEMBLY = defineCreature('animal-sheep', {
  /* Four slots. `coat` is the whole argument — see §7: matte, pale and
   * low-contrast is the half of "woolly" that geometry cannot carry. */
  palette: {
    coat: 0xe4dbc7,    // UNREVIEWED fleece: oatmeal off-white, warm grey cast, lowest chroma in Farm
    face: 0x3c3532,    // UNREVIEWED points: the band-3 muzzle and underline, the ears, the nose, the leg
    limb: 0xd0c5ad,    // UNREVIEWED: the leg above the fleece line, a shade under the coat
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* THE ROUND ONE. `box-41` is 1.350 x 1.300 x 1.350 against the cube's 1.250 —
   * the fullest body the pack owns, and the separation from a lean goat. The
   * survey of this shell is `animal-horse.ts` §1; do not re-measure it.
   *
   * BAND 3 IS THE DARK FACE: 31 triangles of muzzle patch and boss on the front
   * plate, 6 of underline, in one entry and no geometry. The horse spends the
   * same band the other way round for a pale mealy muzzle. NOT `belly` — a
   * fleece has no pale underside, and `creature.ts:585` would turn it into a
   * `patch` beside this `byBand`, which JT-044 forbids on one part. */
  hull: { part: 'box-41', paint: { base: 'coat', byBand: { 3: 'face' } } },

  /* ===================================================================== *
   * JT-044 AT THE OTHER END: THE FLEECE LINE, AND THE RANGE ITSELF.
   *
   * `box-01`'s 80 points sit on three y rows, giving exactly two lines on the
   * shape: the foot's bevel at 0.204082 of its height, and the hull's belly at
   * 0.591837 of it. With `patchUv`'s half-texel clamp the drawn boundary for
   * `at = k/16` lands at
   *
   *     k = 3   0.05651   inside the bevel — it rakes
   *     k = 4   0.07713   the HOOF (animal-pony.ts, and five Farm species)
   *     k = 8   0.15680   0.02445 under the belly — 13.5% fleece, 86.5% leg
   *     k = 9   0.17673   0.00452 under the belly — 2.5%, sub-pixel
   *     k = 10  0.19664   inside the hull; nothing is drawn at all
   *
   * SO k IN 4..9 IS THE WHOLE USABLE RANGE, six values, both ends forced. 9/16
   * is refused for the ferret's reason — a line you cannot see is a marking the
   * animal does not have — and 4/16 is the opposite marking on the same part.
   * 8/16 is also the pack's own half, the number `belly` spends on every hull
   * here, so the leg's wool line is the body's belly line said twice.
   *
   * SIBLINGS: this number is the ANIMAL's and only the ends are forced. An
   * alpaca with fleece to its ankles belongs at 6/16 or 7/16; a goat belongs at
   * 4/16 with the horse. Retune it deliberately, not by copying.
   *
   * `patch` and never `byBand` on the same part; the hull bands and does not
   * patch, so "one cell, one picture" cannot fire; and the legs carry no spin,
   * so the boundary cannot rake.
   * ===================================================================== */
  legs: { paint: { base: 'limb', patch: { below: 'face', at: 0.5 } } },

  /* The dog's and the pig's ear, WORN ON ITS SIDE — the cheapest ear in the bank
   * at 60 verts and 36 tris against a median of 110, and unspent by any species
   * in the project. Joined across its own 0.445455 and buried its own 0.594288
   * of it, so it stands 0.180729 proud: a leaf-shaped flap, 0.463702 fore-and-
   * aft, level with the eye. `box-02` points UP and shows 0.070 for 168 verts;
   * `tube-04` is 1.64x longer and belongs to the camelids. The z is the horse's
   * own 4/16 on this same shell, so the two differ only in the face they join. */
  ears: {
    part: 'cone-02',
    axis: 'x',
    at: [FLANK_PAD_X, FLANK_PAD_MID_Y, 0.25],
    paint: 'face',
  },

  /* The deer's nose — the pack's small ungulate one, the pony's and the horse's.
   * There is NO SNOUT: the boss already is a 0.400-wide blunt muzzle standing
   * 0.100 proud, and a sheep's face is short where a horse's is long, so the
   * 0.532 barrels the horse and the pony wear are refused outright. Placed on
   * the boss's own centre rather than at the donor's 0.832178, which would put
   * its top 0.0137 above the octagon's apex with nothing behind it. */
  nose: { part: 'box-14', paint: 'face', at: [0, BOSS_MID_Y, BOSS_FRONT_Z] },

  /* The elephant's TRUNK under Kenney's wrong name — the only `z +1` tail shape
   * in the bank and the shortest-reaching of the four THIN ones, 0.4252 against
   * 0.4669 for the next. Spun 180 so it faces backwards, baked into the copy.
   * The height is the midpoint of the 0.001996-wide window in which its whole
   * root lands on the flat rear plate, and it recovers the pack's own 0.80625. */
  tail: {
    part: 'box-18',
    paint: 'coat',
    spin: [{ axis: 'y', deg: 180 }],
    at: [0, TAIL_JOIN_Y, REAR_PLATE_Z],
  },

  /* Placid. The ears flick and nothing else moves, which is the difference
   * between this animal and a horse that swishes. */
  motion: [{ kind: 'twitch', parts: ['ear'] }],
})
