/**
 * The water buffalo — Farm's darkest bovine, and the collection's ONE GENUINELY
 * OPEN QUESTION, which is written up in §7 for Joe.
 *
 * ONE SPECIES, ONE FILE. `register.ts` says why the one appended line in
 * `index.ts` is the whole of the wiring.
 *
 * ## READ `animal-horse.ts` FIRST. This file does not restate it.
 *
 * The hooved quadruped is solved there: JT-044's two-tone leg and why `at` is
 * k/16, the donor transfer, why a `byBand` hull and a `belly` line are exclusive,
 * and the survey that proved `box-41` safe. **None of it is re-argued here.**
 * What this file owns is four things the horse could not have:
 *
 *   1. **`box-12` measured off its own 112 vertices** — the cow's shell, which is
 *      `box-03` PLUS two fused ear lugs and nothing else. §1, and it settles both
 *      the ear question and one trap in `creature.ts`'s own solver.
 *   2. **HORNS, out of the elephant's tusk, three per side.** §2. The bank has no
 *      horn; this is `wedge-11` worn six times, rolled 135 degrees so its own
 *      curve points UP, and chained into a swept crescent 2.232 across. The ox
 *      reached the same shape first and takes it the other way — §2's last
 *      paragraph is the measured difference between the two.
 *   3. **A bovine FACE by three solves that all point the same way** — eye high,
 *      eye wide, muzzle low. §4.
 *   4. **A PALE STOCKING rather than a hoof**, which is JT-044 spent on a marking
 *      this animal actually has. §5.
 *
 * ## 1. `box-12` IS `box-03` WITH TWO EARS FUSED ON, AND THAT IS WHY IT IS HERE
 *
 * `animal-badger.ts:36-64` found this and it is confirmed here off the same 112
 * vertices. All SIX flat plates are the 1.250 cube's own, to the digit:
 *
 *     face        box-12                                    box-03
 *     front       z = +0.625, |x| <= 0.3125, y 0.49375-1.11875   identical
 *     rear        z = -0.625, same window                        identical
 *     flank       x = +-0.625, y 0.49375-1.11875, |z| <= 0.3125  identical
 *     top         y = 1.43125, |x| and |z| <= 0.3125             identical
 *
 * and all 0.289484 of the extra width is **30 points in two EAR LUGS**, at
 * |x| 0.625 to 0.7697, world y 1.17705 to 1.35375, z 0.3500 to 0.5000 — high,
 * forward, outboard. Kenney gave the cow and the deer no separate ear record
 * because their ears are IN the shell. That is what the 180 triangles buy over
 * the cube's 60, and it is the whole reason a bovine takes this hull.
 *
 * **So this species has no `ears` entry, and that is a measurement rather than an
 * omission.** A pair added here is a SECOND pair beside lugs already there; the
 * badger refused `box-30` for exactly that and the refusal transfers whole. What
 * is spent instead is the lugs' own cut: **band 5, 12 triangles, the flat forward
 * face of each lug**, painted `pale` for one `byBand` entry and no geometry. The
 * badger paints that band dark for a badger's ear; this paints it pale for a
 * buffalo's, which is the same mechanism used in opposite directions.
 *
 * **THE TRAP, and it is new: `frame.chamXY` IS WRONG ON THIS SHELL.**
 * `creature.ts:440` builds the x/y chamfer midpoint as
 * `(half[0] + inset(top)) / 2`, and on `box-12` `half[0]` is **0.7697 — the ear
 * lug, not the body**. It returns (0.5411, 0.5519) local, whose sum is 1.0930
 * against the real chamfer chord's `x + y = 0.9375`: **0.109955 outside the
 * chord, and 0.065761 outside the real surface — in the air.** Anything sited by
 * the `chamfer` ridge row on this hull floats by that much, and `box-03`'s own
 * solve for the same two faces is the correct (0.46875, 0.46875). The real
 * chamfer, ray-cast outward along (0.707, 0.707, 0) at every z from -0.3125 to
 * +0.3125, answers **(x 0.5, y 1.30625) — the cube's own corner-cut vertex,
 * standing 0.044194 proud of the chord along the 45-degree normal** — and past
 * z = 0.3125 it drops away fast (at z = 0.35 it is already 0.0394 BELOW the
 * chord). Both facts are spent in §2.
 *
 * ## 2. THE HORNS. THREE `wedge-11` A SIDE, ROLLED 135 DEGREES
 *
 * There is no horn shape in the bank at all — `BAKED_ROLES` has none — so this is
 * the elephant's TUSK, `wedge-11`/`wedge-12`, 0.3087 x 0.306936 x 0.445163,
 * taper 0.391, `roles: ['tooth']`. `animal-ox.ts` spent it first, on the same
 * shell and at the same chord; this file takes it somewhere else entirely and the
 * last paragraph of this section is the arithmetic. Only `wedge-11` is named
 * below: it is the RIGHT tusk and `kind: 'pair'` mirrors it in x, which
 * reproduces `wedge-12` exactly (the two are one handed shape at +-0.267072).
 *
 * **The shape is a CURVED cone and that is the finding.** Its 24 points are three
 * rings of eight, and their centres run
 *
 *     root   local (-0.009475,  0.008563, -0.1686)   radius 0.14490
 *     mid    local ( 0.042313, -0.041438,  0.0180)   radius 0.11205
 *     tip    local ( 0.094075, -0.091413,  0.2046)   radius 0.04830
 *
 * so over its 0.3732 of length the centreline drifts +0.10355 in x and -0.099975
 * in y: **the tusk bends, at 15.5 degrees out and 15.0 degrees down in its own
 * frame.** The bend direction is (0.71937, -0.69463), which is **-43.99 degrees**
 * round its long axis. **A roll of `{ axis: 'z', deg: 135 }` puts that at +91.01
 * degrees — 1.01 degrees off straight up.** Measured in world on the placed part,
 * segment one's bend comes out at (-0.01464, 0.99914, -0.04506): up, leaning very
 * slightly inward. That is a water buffalo's horn and it costs one spin.
 *
 * The proof that the roll is doing the work: segment one's FACING has rise
 * **0.0 degrees — dead level** — and its centreline still climbs from y 1.261448
 * at the root to **y 1.414357** at the tip. The horn curves because the shape
 * curves, not because it is aimed upward.
 *
 * **THE JOIN, and why all three are explicit.** `PartDef.on` would chain these in
 * one word and it is REFUSED, with the number: `creature.ts:708-712` anchors on
 * `centre + facing * s.hi`, which is the part's BOUNDING-BOX axis. On a straight
 * part that is the tip. On this one the tip ring centre is 0.139 off that axis,
 * so `on: 'horn'` starts the next segment 0.139 BELOW the tip it is chaining
 * from and the crescent comes apart — measured, and it is why every `at` below is
 * a number instead of a name. **This is a real gap in `on` for curved shapes and
 * the manager has it.**
 *
 * What replaces it is one rule, applied twice: **each segment's ROOT RING CENTRE
 * lands on the previous segment's own CENTRELINE at 0.75 of its length.** Solved
 * as `at = target - spin(rootLocal) - shift * facing`, residual 1e-16. 0.75 is
 * chosen for radius continuity and the arithmetic is in §2's table below.
 *
 *     seg  spin              stretch   facing rise / backsweep   tip ring centre
 *     1    z135 x  0 y108    17/16      0.0 deg / 18 deg         (0.7319, 1.4144,  0.1666)
 *     2    z135 x-10 y124    12/16     10.0 deg / 34 deg         (0.9276, 1.5472,  0.0031)
 *     3    z135 x-16 y136     9/16     16.0 deg / 46 deg         (1.0898, 1.6852, -0.1895)
 *
 * Read down the last column: the horn leaves the skull dead level, rises, and
 * turns back over the shoulder, ending 0.1895 BEHIND the hull's own midline.
 * **Envelope: |x| to 1.115939, y 1.1129 to 1.705395, z -0.2160 to +0.4378. Span
 * 2.231879, which is 1.4498x the hull's own 1.539484 of width.**
 *
 * **The cross-sections are on the pack's own 1/16 grid, and the sizes are
 * solved.** A tusk tapers 3:1 over its own length, so three of them nose-to-tail
 * unstretched taper 27:1 in three steps and read as bamboo. Matching the radii
 * EXACTLY at each elbow compounds the other way and wants 0.53 then 0.28, which
 * makes the outer limb a 0.041 wire — invisible at the island's 0.16 scale.
 * **17/16, 12/16 and 9/16** are the grid stations that split the difference, and
 * the residue is stated rather than hidden: the previous segment is 0.085186 and
 * 0.060131 thick where the next one roots, against root radii of 0.108675 and
 * 0.081506, so **each elbow shows a sleeve of 0.023489 and 0.021375** — half the
 * root radius, and the annular ridge a bovid horn actually has. Overall the horn
 * runs 0.153956 to 0.027169, a **5.7:1** taper, which is a real one. 17/16 on the
 * root is not decoration either: a horn's basal boss IS thicker than its shaft,
 * and it is the smallest grid step above 1 that clears the harness's own
 * thousandth-snap (see below).
 *
 * **ONE THING THAT IS NOT ANATOMY AND SHOULD BE WRITTEN DOWN.**
 * `assembly-assert.ts:181-204` identifies a mesh by un-spinning it and sorting
 * the points on values snapped to a thousandth. `wedge-11` has TWO points at
 * x = 0.1215 — exactly a snap boundary — so at cross-section 16/16 the two sort
 * in whichever order the rotation's own 1e-16 of dust decides, and the lineage
 * check fails on a shape that is provably the right shape. It is a real fragility
 * in the harness and not in this animal. **The margin, in thousandths, of the
 * nearest tie-breaking coordinate to a snap boundary: 17/16 gives 0.1437, 12/16
 * gives 0.0750, 9/16 gives 0.1563, and 16/16, 8/16 and 10/16 all give 0.0000.**
 * That is why the three numbers are the three they are, and a sibling wearing
 * this shape unstretched should expect to meet it.
 *
 * **THE ROOT IS FULLY EMBEDDED AND IT IS MEASURED.** Segment one joins at
 * (0.46875, 1.275, 0.25) — the CUBE's own x/y chamfer chord midpoint, not
 * `frame.chamXY`, per §1. The real surface stands 0.044194 proud of that chord
 * along the 45-degree normal — `animal-ox.ts` reads 0.044195 for the same chord
 * on the same shell, arrived at independently — so the part is embedded by
 * construction: **all 8 vertices behind the join plane are inside the hull, and
 * its centreline is inside for 35.5% of its length**, against the elephant's own
 * recorded burial of 0.375966, unchanged. No daylight anywhere — better than the
 * horse's ear, which ships with 0.028. `z = 0.2500` is 4/16 and is inside the
 * chamfer's flat span of +-0.3125 with 0.0625 to spare, which is §1's second
 * measurement being spent. **This is also the ceiling on the basal stretch**: at
 * 20/16 the root ring is 6 of 8 inside and shows daylight, at 18/16 it is 7 of 8,
 * and 17/16 is the largest grid station that keeps all eight — measured, and it
 * is why the boss is 17/16 and not fatter. The ox sits its own root at 2/16
 * instead, because a footprint bound is what it checked; this one is verified by
 * containment.
 *
 * **THREE A SIDE RATHER THAN TWO, and the cost is written out.** Two segments,
 * angled as hard as they can be, reach |x| 0.915487 — a span of 1.830974, only
 * 1.189x the body. Three reach 1.115939, a span of 2.231879 and 1.450x the body,
 * and they add the second change of direction that makes an ARC instead of a bent
 * stick. The bill is **76 triangles** (228 against 152) and **0.200 of keep-out**.
 * It is paid out of the hull: `box-12` is 180 triangles where the horse's
 * `box-41` is 262, so the cheaper shell buys the extra pair with 6 to spare. And
 * the keep-out it lands on, `max(width, depth) / 2` = **1.1159**, is inside
 * `animal-fox`'s 1.15 — the bound the horse's file works to — with 0.034 left.
 * **Four a side is refused there: it leaves the fox's bound and there is no
 * argument that buys it back.**
 *
 * **AGAINST THE OX, WHICH WEARS THE SAME SHAPE ON THE SAME SHELL.** Both animals
 * root a `wedge-11` pair on the cube's top-side chord, and there the two part.
 * Measured on both:
 *
 *     animal-ox            1 pair, stretched 1.125/1.125/1.5, spun y90 then z45
 *                          facing rise +45 deg, BACKSWEEP 0 deg
 *                          span 1.6915 = 1.099x the body   76 triangles
 *     this species         3 pairs, rolled 135, chained on the centreline
 *                          facing rise 0 / +10 / +16 deg, backsweep 18 / 34 / 46
 *                          span 2.2319 = 1.450x the body   228 triangles
 *
 * The ox's horn goes sideways and UP in one straight limb and never goes back at
 * all. This one leaves the skull LEVEL, curves along the tusk's own bend, and
 * finishes 0.1895 behind the hull's midline. **0.540 of span and 46 degrees of
 * back-sweep between them**, which is a bullock against a buffalo and is the
 * difference a child names them by. The two also disagree on the lugs' band 5 —
 * the ox darkens it, this one lines it pale — on the leg line (4/16 dark hoof
 * against 6/16 pale sock) and on the coat (0x8e3b21 against 0x4b525e).
 *
 * ## 3. THE HULL, AND WHY THIS ANIMAL IS SHORT
 *
 * `box-12` at its own recorded (0, 0.80625, 0), unstretched — there is no hull
 * stretch and the horse's file says why. It stands **1.705395** on the horns,
 * against the horse's 1.7566 and the pony's 1.7066, and the BODY itself tops out
 * at 1.43125, one and a quarter thousandths over `PACK_HEIGHT_MIN`. **That is
 * deliberate: this is the low, wide one.** Its width beats its height — 2.2319
 * against 1.7054 — and since a hull cannot be scaled, "massive" had to be said in
 * span rather than in stature. Every unit of the height above the body is horn.
 *
 * The legs come free with the shell. `creature.ts:740` scales the stations with
 * the body, so 0.27 x (1.539484 / 1.25) = **0.3325** — the buffalo stands 23%
 * wider-legged than a cube-bodied animal, and it does so because the cow has
 * ears. That is funny and it is also exactly the right answer.
 *
 * ## 4. THE FACE: THREE SOLVES THAT ALL SAY THE SAME THING
 *
 * The bank has no bovine muzzle, so it is `box-24`, the hog's nose-tip: a blunt
 * 0.400 x 0.400 disc standing 0.200 proud, sunk its own 0.000. **No `snout`** —
 * `farm.ts:46-50` measured a snout on this species at 1.59 of keep-out against
 * 1.38 without, and a two-box taper forward of a broad face is depth this animal
 * has no room for once the horns have had the width.
 *
 *   - **MUZZLE y = 0.69375**, which is `0.49375 + 0.200`: the LOWEST the disc can
 *     sit with its whole root on the flat front plate. Its 0.400 of width is also
 *     entirely inside the plate's 0.625, with 0.1125 a side to spare — zero
 *     overhang, which is the test `blade-05` fails (§6).
 *   - **EYE x = 0.3125**, the flat front plate's own half-width: the card centred
 *     on the plate's corner, which is as wide-set as this shell offers.
 *   - **EYE y = 0.958646**, which is `1.11875 - 0.320208 / 2`: the HIGHEST the
 *     card can sit with its whole height backed by flat plate.
 *
 * Three independent solves, and they all push the same way — **eye up, eye out,
 * muzzle down**, which is a bovine skull. They also had to. The pack's own eye
 * placement (0.2625, 0.933646) is the COW's, but the cow has a flat face; put a
 * 0.400 disc on it and the disc occludes **12.81% of the card's drawn area**,
 * measured by subdividing all 27 triangles. The solved pair takes that to
 * **4.87%**, between the horse's blessed 3.61% for `plate-01` and its 6.40% for
 * `plate-08`. Nothing here is a workaround; the numbers describe a buffalo.
 *
 * ## 5. THE STOCKING — JT-044 SPENT ON A MARKING THIS ANIMAL HAS
 *
 * `animal-sheep.ts:355-378` derives the whole usable range and it is not
 * re-derived: k in 4..9, the drawn boundary running 0.07713 to 0.17673, both ends
 * forced by `box-01`'s bevel and by the hull's belly.
 *
 * **k = 6, `at: 0.375`, drawn at 0.11697** — and it is a SOCK, not a hoof. Wild
 * Bubalus arnee and the domestic swamp buffalo both carry dirty-white stockings
 * on the lower leg, which is one of the two markings that separate them from
 * every other black bovine on sight. So the line sits **1.52x the pony's hoof
 * line at 4/16 and 0.75x the sheep's fleece line at 8/16** — this species' own
 * number, inside a range whose ends belong to the geometry. The hoof goes pale
 * with the sock, because a mud-caked buffalo's foot does and because
 * `assembly.ts:487-501` allows the slot one picture and this is it.
 *
 * The horse REFUSED a second two-tone line on the ferret's grounds and this file
 * does not need one: the mechanism is spent once, at full strength, on the only
 * boundary a slate-grey buffalo carries.
 *
 * ## 6. WHAT IS REFUSED, WITH THE ARITHMETIC
 *
 *   - **An `ears` entry — refused, because the hull already wears them.** §1. Any
 *     pair added is a second pair, and the badger measured that argument first.
 *   - **`blade-05`, the lion's muzzle plate — refused on overhang.** It is
 *     1.000 x 1.000 on a front plate that is 0.625 square, so it hangs 0.1875
 *     clear on all four sides with nothing behind it. The horse refused `tube-06`
 *     for 0.066 a side; this is nearly three times that, in both axes.
 *   - **`wedge-07`, the cat's tail — refused on cost.** 212 triangles against
 *     `box-18`'s 80. A water buffalo's tail is not what a child names it by, and
 *     132 triangles is more than half of the third horn pair. `box-18` is the
 *     bank's shortest thin tail and it is the badger's and the vole's.
 *   - **A tuft `patch` on the tail — refused.** The mechanism is already spent on
 *     the stocking, and a second boundary on a part 0.345 wide is 0.055 of world
 *     at the island's scale.
 *   - **`box-41`, the horse's shell — refused twice over.** It has no ear lugs, so
 *     a bovine on it needs an ear feature it cannot afford; and it is 262
 *     triangles against 180, which is 82 of the 76 the third horn pair costs.
 *   - **`PartDef.on` for the horn chain — refused with 0.139**, §2.
 *   - **A fourth horn segment a side — refused on keep-out**, §2.
 *
 * ## 7. THE OPEN QUESTION, FOR JOE: THIS ANIMAL AND AFRICA'S `animal-buffalo`
 *
 * `farm.ts:70-74` promised this note. **The ox is NOT the problem** — it shipped
 * an hour before this file, on this same `box-12` and this same `wedge-11`, and
 * the two are 0.540 of horn span, 46 degrees of back-sweep and 186 degrees of hue
 * apart (§2). Two animals sharing a shell is what a shell is for.
 *
 * Africa's `animal-buffalo` is the problem. It is the CAPE buffalo —
 * *"2.15, horns, round ears, tuft tail, near-black 0x413a36"* — and it is not
 * built yet. It is a fifth animal in the bovine shape and it is the one this
 * species can least afford to look like.
 *
 * What is separated, measured:
 *
 *   - **HUE.** `0x413a36` is a warm near-black at hue 33 degrees, L* about 25.
 *     This coat is `0x4b525e`, a cool blue-slate at hue 219 degrees, L* about 34.
 *     186 degrees apart and nine points of lightness. They are both dark and they
 *     are not the same dark.
 *   - **HORN.** This is the whole of it. A Cape buffalo's horns drop from a fused
 *     boss, hook out and come back UP close beside the head — a compact, downward
 *     shape. These sweep out DEAD LEVEL and back over the shoulder to a span of
 *     2.2319, 1.450x the body's own width, ending 0.1895 behind the hull's own
 *     midline. There is no angle at which the two silhouettes are confusable,
 *     and that is the one difference that survives both animals being dark.
 *   - **STOCKINGS.** A Cape buffalo has none. §5.
 *
 * What is NOT separated, and is the question: **`farm.ts` also gives that species
 * "round ears", and the only round-eared, wide-bodied hull in the bank is this
 * one.** If Africa builds `animal-buffalo` on `box-12` — and its brief points
 * straight at it — then THREE animals are on that shell, not two, all three with
 * four `box-01` legs on the same widened row and a `box-18` stub tail, and the
 * Cape buffalo would arrive with the one thing the ox does not have: it is dark,
 * like this one. The ox is held apart by colour before shape; the Cape buffalo
 * cannot be. Everything then rests on the horns alone.
 *
 * **The ruling that would settle it is not this file's to take.** Either Africa's
 * buffalo goes onto `box-41` or `box-03` and pays for an ear, or the two are
 * accepted as a genuine pair the way the chicken and the rooster are. Both are
 * defensible; one of them is Joe's.
 *
 * ## Budget, and the palette
 *
 * Height **1.705395**, inside 1.43-2.02, feet on y = 0. **762 triangles** against
 * `MODEL_TRIS_MAX`'s 951, of which 228 are the horns and 180 the shell. Keep-out
 * **1.1159** off `max(width, depth) / 2`, inside `animal-fox`'s 1.15. The hull is
 * more than 20x the volume of the next biggest mesh. Nothing is stretched but the
 * three horn pairs, and every one of those on the pack's own 1/16 grid; nothing
 * is authored; there is no `flag` and nothing needs one.
 *
 * FIVE SLOTS, because `pale` does four jobs off one fact — the horn, the
 * stocking, the ear lining and the sclera of a weathered grey buffalo are one
 * off-white — and because `limb` does two, the mud-dark leg and the tail being
 * the same wet dark on this animal.
 *
 * **NOT FLAGGED, and the palette is UNREVIEWED** — `farm.ts` gives this species a
 * one-line record and no colours, so all four below are the first ever proposed
 * for it. These animals ship unsigned; there is no `signoff` field anywhere.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'
import type { Vec3 } from '../assembly'

/* ===================================================================== *
 * `box-12`, MEASURED — world coordinates, off the shell's own 112 baked
 * vertices at its recorded offset of (0, 0.80625, 0).
 *
 * Every plate below is `box-03`'s own plate at the same coordinate; see §1.
 * A sibling moving to this hull should point at these rather than re-measure,
 * and should NOT use `frame.chamXY`, which the ear lugs break.
 * ===================================================================== */

/** The flat front plate's bottom edge. IDENTICAL to `box-03`'s. */
const FRONT_PLATE_BOTTOM_Y = 0.49375
/** The flat front plate's top edge. IDENTICAL to `box-03`'s. */
const FRONT_PLATE_TOP_Y = 1.11875
/** The flat rear plate. IDENTICAL to `box-03`'s -0.625. */
const REAR_PLATE_Z = -0.625

/**
 * The x/y chamfer's chord midpoint, taken from the CUBE and not from
 * `frame.chamXY`, which reads 0.5411 here because `half[0]` is the ear lug.
 * Ray-cast, the real surface is (0.5, 1.30625) at every z in +-0.3125 — 0.044194
 * proud of this chord along the 45-degree normal, so a part joined here is
 * embedded by construction.
 */
const POLL_CHAMFER_X = 0.46875
const POLL_CHAMFER_Y = 1.275
/** 4/16, inside the chamfer's flat z span of +-0.3125 with 0.0625 to spare. */
const HORN_ROOT_Z = 0.25

/**
 * The roll that makes a tusk a horn: the shape's own bend runs (0.71937,
 * -0.69463) about its long axis, which is -43.99 degrees, so +135 puts it at
 * +91.01 — 1.01 degrees off vertical. Measured in world, segment one's bend is
 * (-0.01464, 0.99914, -0.04506). Up, leaning slightly in.
 */
const HORN_ROLL = 135

/**
 * SOLVED, not chosen: the root ring centre of segment 2 lands on segment 1's own
 * centreline at 0.75 of its length. `at = target - spin(root) - shift * facing`,
 * residual 1e-16. `on: 'horn'` cannot say this — see §2.
 */
const HORN_MID_AT: Vec3 = [0.72889045, 1.40524794, 0.13548218]
/** The same solve again, on segment 2's centreline. */
const HORN_TIP_AT: Vec3 = [0.92968799, 1.54261982, -0.02523458]

/**
 * The only height at which `box-18`'s whole root lands on the flat rear plate:
 * the plate is 0.625 tall and the shape is 0.623004, a window 0.001996 wide whose
 * midpoint is the hull's own recorded centre. Derived at
 * `animal-sheep.ts:318-323` on `box-41`, and it transfers unchanged because this
 * shell's rear plate IS the cube's rear plate (§1).
 */
const TAIL_JOIN_Y = 0.80625

/** `0.49375 + 0.200` — the lowest `box-24` sits with its whole root on the plate. */
const MUZZLE_Y = FRONT_PLATE_BOTTOM_Y + 0.2
/** The flat front plate's own half-width: the widest-set eye this shell offers. */
const EYE_X = 0.3125
/** `1.11875 - 0.320208 / 2` — the highest the card sits fully backed by plate. */
const EYE_Y = FRONT_PLATE_TOP_Y - 0.160104

export const WATER_BUFFALO_ASSEMBLY = defineCreature('animal-water-buffalo', {
  /* Insertion order IS the texture layout, so this list is data. Five slots:
   * `pale` is the horn, the stocking, the ear lining and the sclera, because on
   * a weathered grey buffalo those are one off-white; `limb` is the leg above
   * the stocking AND the tail, because both are the mud-wet dark. */
  palette: {
    coat: 0x4b525e,   // UNREVIEWED: cool blue-slate. 186 deg of hue off Africa's 0x413a36 — see §7
    pale: 0xc4bfb3,   // UNREVIEWED: weathered horn — the horns, the stockings, the ear lining, the sclera
    limb: 0x3d434e,   // UNREVIEWED: the leg above the stocking and the tail, mud-darkened under the coat
    muzzle: 0x2e333c, // UNREVIEWED: the broad blunt nose pad, the darkest thing on the animal
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* There is no `belly` slot, so name the pale one: it paints the eye cards'
   * sclera and anything else that asks for the under colour. */
  under: 'pale',

  /* THE COW'S OWN SHELL, and it is the cube with two ears fused on — see §1.
   * BAND 5 is those lugs' flat forward face, 12 triangles, Kenney's own
   * inner-ear cut: painted `pale` that is a lined ear for one entry and no
   * geometry. The badger paints the same band dark for the opposite animal.
   *
   * NOT `belly`, which `creature.ts:585` would turn into a `patch` on this same
   * paint, and JT-044 forbids `patch` and `byBand` on one part. */
  hull: { part: 'box-12', paint: { base: 'coat', byBand: { 5: 'pale' } } },

  /* ===================================================================== *
   * JT-044, AND THIS SPECIES' OWN NUMBER INSIDE IT.
   *
   * `animal-sheep.ts:355-378` derives the whole range — k in 4..9, drawn 0.07713
   * to 0.17673, both ends forced by `box-01`'s bevel and the hull's belly — and
   * it is not re-derived. 6/16 draws at 0.11697: 1.52x the pony's hoof line and
   * 0.75x the sheep's fleece line.
   *
   * IT IS A SOCK AND NOT A HOOF. Wild and swamp water buffalo both carry
   * dirty-white stockings on the lower leg; that is a marking this animal has,
   * which is the bar the ferret set for using this mechanism at all. The hoof
   * goes pale with it, because one slot gets one picture
   * (`assembly.ts:487-501`) and because a wallowing buffalo's foot is pale mud.
   *
   * The only patch on this species — the hull bands rather than patches — and
   * the legs are never spun, so the boundary cannot rake.
   * ===================================================================== */
  legs: { paint: { base: 'limb', patch: { below: 'pale', at: 0.375 } } },

  /* NO `ears`. The hull is wearing them: 30 vertices at |x| up to 0.7697, world
   * y 1.17705-1.35375, z 0.3500-0.5000. A pair added here is a SECOND pair, and
   * `animal-badger.ts:49-57` refused `box-30` on this shell for that reason with
   * the float arithmetic, and `animal-ox.ts` reaches the same answer. Recorded so
   * nobody helpfully adds them back. */

  /* Eye up and eye out, both solved off the flat front plate, both forced by the
   * muzzle below: at the pack's own (0.2625, 0.933646) — which is the COW's, on
   * the cow's own shell — a 0.400 disc occludes 12.81% of the card's drawn area.
   * Here it occludes 4.87%, between the horse's 3.61% and its 6.40%. See §4. */
  eyes: { x: EYE_X, y: EYE_Y },

  /* NO `snout`: `farm.ts:46-50` measured one on this species at 1.59 of keep-out
   * against 1.38 without, and the horns have already spent the width.
   *
   * The hog's nose-tip instead — a blunt 0.400 disc standing its own 0.200 proud,
   * sunk its own 0.000, which is a bovine muzzle. Sat at the lowest y its whole
   * root still lands on the flat plate. `blade-05` is refused at §6: 1.000 square
   * on a 0.625 plate hangs 0.1875 clear on four sides.
   *
   * The ox wears the same shape STRETCHED to 0.600 x 0.280 as a `snout`, filling
   * the plate; this one is unstretched and set low, which is why the eyes had to
   * move and the ox's did not. Same part, two animals, two faces. */
  nose: { part: 'box-24', paint: 'muzzle', at: [0, MUZZLE_Y, 0.625] },

  /* The elephant's TRUNK, which the bank calls a tail and which is its only
   * `z +1` tail shape; spun 180 on y it becomes the bank's shortest thin stub.
   * The argument is `animal-vole.ts:37-46` and the height window is
   * `animal-sheep.ts:318-323`; both transfer unchanged because this shell's rear
   * plate is the cube's. Painted `limb`, with the legs: on a buffalo the tail and
   * the lower legs are the same wet dark. */
  tail: {
    part: 'box-18',
    paint: 'limb',
    spin: [{ axis: 'y', deg: 180 }],
    at: [0, TAIL_JOIN_Y, REAR_PLATE_Z],
  },

  extras: [
    /* ================================================================= *
     * THE HORNS. Three `wedge-11` a side — the elephant's tusk, which is the
     * only horn-like shape in 94 parts. `animal-ox.ts` wears one pair of it on
     * this same shell, rooted on this same chord, going sideways and up at 45
     * degrees with no back-sweep at all: 1.6915 of span against this animal's
     * 2.2319. See the header §2 for the full comparison.
     *
     * Every one of the six carries the same 135-degree ROLL, which is the whole
     * trick: it turns the tusk's own 15.5-out/15.0-down bend into an up-and-
     * slightly-inward curl, so the crescent curves because the SHAPE curves.
     * Segment one proves it — its facing is dead level at 0.0 degrees of rise and
     * its centreline still climbs 0.152909 from root to tip.
     *
     * Then the two aims: `x` tips the nose up, `y` swings it out and back.
     * 0 / -10 / -16 of rise against 108 / 124 / 136 of swing is level, then
     * rising, then up and back over the shoulder. Span 2.231879, 1.4498x the
     * body's own width, tips ending 0.1895 behind the hull's midline.
     *
     * The three cross-sections are 17/16, 12/16 and 9/16 — the pack's own grid,
     * each about seven tenths of the last, which is what keeps the profile
     * continuous across the elbows. See the header §2 for what happens at 16/16.
     * ================================================================= */

    /* ROOT. Joined on the CUBE's x/y chamfer chord — NOT `frame.chamXY`, which
     * this shell's ear lugs push 0.0658 off the real surface (§1). That surface
     * is 0.044194 proud of the chord, so all 8 vertices behind the join plane are
     * inside the hull and the centreline is embedded for 35.5% of its length. No
     * daylight at all, where the horse's ear ships with 0.028.
     *
     * 17/16 is the largest grid station the seating survives: at 18/16 the root
     * shows one point clear and at 20/16 it shows two. A horn's basal boss is
     * thicker than its shaft and this is exactly how much thicker it can be. */
    {
      name: 'horn',
      part: 'wedge-11',
      kind: 'pair',
      paint: 'pale',
      stretch: [1.0625, 1.0625, 1.0625],
      spin: [{ axis: 'z', deg: HORN_ROLL }, { axis: 'x', deg: 0 }, { axis: 'y', deg: 108 }],
      at: [POLL_CHAMFER_X, POLL_CHAMFER_Y, HORN_ROOT_Z],
    },
    /* MID. Rooted on segment 1's own centreline at 0.75 of its length — solved,
     * because `on:` anchors on the bounding-box axis and would start this 0.139
     * below the tip (§2). Cross-section 12/16: the host is 0.085186 thick where
     * this roots and this root is 0.108675, so the elbow shows a 0.023489 sleeve
     * — half the root radius, and the ridge a horn has. */
    {
      name: 'horn-mid',
      part: 'wedge-11',
      kind: 'pair',
      paint: 'pale',
      stretch: [0.75, 0.75, 1],
      spin: [{ axis: 'z', deg: HORN_ROLL }, { axis: 'x', deg: -10 }, { axis: 'y', deg: 124 }],
      at: HORN_MID_AT,
    },
    /* TIP. The same solve on segment 2. Cross-section 9/16 against a host
     * 0.060131 thick: a 0.021375 sleeve. The whole horn runs 0.153956 to
     * 0.027169 — a 5.7:1 taper, where three unstretched tusks would have been
     * 27:1 in three steps. */
    {
      name: 'horn-tip',
      part: 'wedge-11',
      kind: 'pair',
      paint: 'pale',
      stretch: [0.5625, 0.5625, 1],
      spin: [{ axis: 'z', deg: HORN_ROLL }, { axis: 'x', deg: -16 }, { axis: 'y', deg: 136 }],
      at: HORN_TIP_AT,
    },
  ],

  /* A buffalo standing in the water swishes and nothing else. There is no ear
   * feature to twitch — the hull is wearing the ears — which `resolveMotion`
   * would have caught at definition time if this said otherwise. */
  motion: [
    { kind: 'wag', parts: ['tail'] },
  ],
})
