/**
 * The rooster — Farm's cock, and **`animal-chicken.ts` is the other half of it.**
 *
 * ONE SPECIES, ONE FILE. `register.ts` says why the one appended line in
 * `index.ts` is the whole of the wiring.
 *
 * **READ `animal-chicken.ts` FIRST AND THIS FILE SECOND.** The hen is the
 * exemplar; this animal shares her body **deliberately and not lazily**, because
 * a cock and a hen ARE one body with three things added. Everything below points
 * at her derivations rather than restating them:
 *
 *   - the WING (`box-06` worn as a solid along the flank, `sink: 0.5`) — her §3,
 *     which is the cage birds' own line and now runs to ten birds;
 *   - the BILL (`tube-02`, a pure donor transfer that recovers the bank's
 *     recorded z AND y) — her §6;
 *   - the EYE (`plate-08`, the pack's one round card, dark bead) — her §6;
 *   - the FOOT (JT-044's two-tone at `at: 0.25`) — her §6;
 *   - the HULL (`box-03`, and the turkey keeps `box-41`) — her §6;
 *   - two legs in `extras` on `LEG_ROW` at `box-01`'s own x.
 *
 * Not one of those is re-argued here. `farm.ts:162` says what IS this animal's:
 * *"Comb, wattle and a dark arched tail carry it; the two share a body
 * deliberately, because that is what they are."* Three things, and the hen left
 * all three unspent with the arithmetic already done so that they could be
 * inverted rather than re-derived. §§1-3 spend them. §4 is everything else.
 *
 * ===========================================================================
 * ## 1. THE COMB: FIVE POINTS AT THE SHAPE'S OWN BURIAL, AND THE EXTRA COMB IS
 * ##    ALL BLADE
 * ===========================================================================
 *
 * Same shape, same spacing, same lack of a spin: `cone-01`, the bee's and the
 * caterpillar's ANTENNA, standing unspun on the crown because its own attachment
 * is `y +1` and a comb stands up. The hen's §2 is the standing derivation of the
 * idiom and of why there is no comb in the bank to begin with.
 *
 * **What is inverted is the BURIAL, and the hen handed it over pre-solved.** She
 * takes `COMB_SINK` = 8/16 against `cone-01`'s own recorded 0.312222 and says in
 * as many words that the deeper burial is *"the dial the ROOSTER needs"*. This
 * animal takes the shape's own burial back, which is the whole of the difference:
 *
 *       hen    sink 8/16      buries 0.200178   stands 0.200178 proud
 *       cock   sink 0.312222  buries 0.125000   stands 0.275356 proud
 *
 * **37.55% more comb, and not one stretch anywhere** — `stretch` is the easy
 * answer and Joe flagged exactly that on three animals on 2 August. It is also
 * `animal-cockatiel.ts`'s crest height exactly, because it is the cockatiel's own
 * number: this bird gets back the 27.3% the hen gave up.
 *
 * **And it is not a `sink` at all, it is the absence of one.** Omitting `sink`
 * makes the builder use the part's own `sunkFractionMean`, and at that burial
 * `shift = -s.lo - sink x extent` = `0.2002 - 0.125` = 0.0752, which lands each
 * cone's centre on **y = 1.506436 against `cone-01`'s OWN RECORDED OFFSET of
 * 1.506428 — 0.0000084 apart, and the whole of that gap is the bank's own
 * rounding** (the builder solves the shift off the shape's POINTS, which span
 * 0.400400, where `sunkFractionMean` is a fraction of the recorded 0.400356).
 * The bee wears this cone on a crown at this height, so the comb is a donor
 * transfer recovered on the y coordinate, which is precisely the coordinate the
 * hen's deeper burial had to give up. Nothing here is chosen.
 *
 * **FIVE POINTS, NOT THREE, AND THE ROW IS CENTRED ON THE CROWN.** Two arguments
 * arrive at the same five and the same stations:
 *
 *   - **Anatomy.** A hen's single comb is a short blade over the brow. A cock's
 *     runs the whole length of the skull, from the base of the bill back past the
 *     ear. So the row is not pushed forward the way the hen's is (hers starts at
 *     `HULL_FLAT` and runs BACK); it is centred, and it uses the crown end to end.
 *   - **The shell, which forces the identical answer.** The hen's §2 gives the
 *     "nothing floats" bound as arithmetic: the flat top face ends at 0.3125 and
 *     the chamfer then falls away 1:1, so a base buried `d` stays in real geometry
 *     out to `HULL_FLAT + d`. At this burial d = 0.125, so the allowed footprint
 *     is z **-0.4375 to +0.4375, 0.875 long**. Five cones at 2/16 measure
 *     `4 x 0.125 + 0.328570` = **0.828570**. That is 0.046430 of slack for the
 *     whole row — **0.023215 at each end when centred, and there is nowhere else
 *     to put it.** Six would need 0.953570 and does not fit at all.
 *
 *   So the stations are z = 0.25, 0.125, 0, -0.125, -0.25, every one of them on
 *   the pack's own 1/16 grid, and `COMB_FRONT_Z` is just `2 x COMB_STEP`.
 *
 * **THE STEP STAYS AT 2/16, AND THIS IS THE ONE PLACE THE HEN'S NUMBER DOES NOT
 * INVERT.** Her 2/16 was *"the LARGEST grid step at which the three points still
 * MEET"* at HER burial. At this shallower one the cone is wider where it leaves
 * the crown and the largest meeting step is genuinely bigger:
 *
 *       width at the crown = 0.328570 x (1 - burial / 0.400356)
 *       hen    burial 0.200178   0.164285 across   3/16 gaps by 0.023215
 *       cock   burial 0.125000   0.225994 across   3/16 OVERLAPS by 0.038494
 *
 * So 3/16 is available to this bird and the hen's own rule would take it — and it
 * is refused with the footprint: five points at 3/16 measure 1.078570 against
 * 0.875 of crown, over by 0.203570, and four at 3/16 measure 0.891070, still over
 * by 0.016070. **Five points and 3/16 cannot both be had, and the count is worth
 * more than the step**, because the count is what a cock's comb has and the step
 * is only how hard the points overlap.
 *
 * **What the wider crown section buys instead is the BLADE, and this is the real
 * finding.** Two cones separate at the height where the section has narrowed to
 * the step, which is 0.248073 above the base for both birds, because it is the
 * same cone and the same 2/16. Measured from the CROWN:
 *
 *       hen    blade 0.047873 proud, then 0.152327 of free points
 *       cock   blade 0.123073 proud, then 0.152327 of free points
 *
 * **The serrations are identical — the same 0.152327 on both birds — and every
 * one of the extra 0.075200 is SOLID BLADE.** And that is not a coincidence, it
 * is an identity: the free point is `(H - burial) - (separation - burial)`, so
 * **the burial cancels and the free point is `H - separation` for ANY burial** —
 * a property of the cone and the step alone. Burying a comb deeper cannot change
 * its teeth; it can only eat the wall underneath them. So the hen's dial does
 * exactly one thing, and it is the right one: not sharper teeth, a deeper wall of
 * flesh carrying them, which is what separates a cock's comb from a hen's in
 * life. It is 2.571x the hen's blade, and the overlap at the crown is 0.100994
 * against her 0.039285, which is the same fact said at the base.
 *
 * Cost, stated the way the hen stated hers: five `cone-01` are **170 triangles,
 * 21.0% of this animal's 810**, and the two over her three are 68 of them. It is
 * the feature the species is named for.
 *
 * ===========================================================================
 * ## 2. THE WATTLE: TAKEN, AND `box-09` IS REFUSED WITH THE HEN'S OWN NUMBER
 * ===========================================================================
 *
 * The hen refused a wattle three times over (her §5) and the second and third
 * reasons were measurements she handed forward. The first — *"it is a third of
 * the ROOSTER's separation"* — is now spent, so what is left is the arithmetic,
 * and it does not say "no wattle". It says **"not `box-09`"**.
 *
 * **`plate-12` and `plate-16` are not candidates and are not re-measured.**
 * `animal-budgie.ts:243-255` measured both for this exact job and refused them
 * for reading FLAT — they are zero-thickness cards and the island's camera looks
 * DOWN. That is the same finding that makes the wing a solid.
 *
 * **`box-09`, the bunny's nose-tip and the smallest solid box in the bank, IS
 * refused, and on the hen's own number.** Her window under the bill is 0.108 (the
 * flat front face's lower reach 0.49375 up to the bill's underside 0.60175)
 * against the part's 0.136825; overruling its recorded 0.000000 burial to 8/16
 * opens the window to 0.147913, which fits, and leaves **0.039913 standing —
 * 3.2% of the hull's width.** She called that nothing and she was right. A cock's
 * wattle is the second-loudest thing on him after the comb; 0.0399 of it is not a
 * wattle, it is a bump, and it would be a rabbit's nose hung under a bill.
 *
 * **So it is `cone-01` again, turned upside down, in a mirrored PAIR — and a cock
 * has two wattles, which is the shape of the answer as much as the reason for
 * it.** The digest offers exactly this alternative and here is what it measures:
 *
 *   - **It stands 0.164285 proud of the front face** — half the cone's own
 *     0.328570 of depth, joined at `HULL_FRONT_Z`, the same plane the bill was
 *     transferred onto. That is **4.12x `box-09`'s 0.039913**, and 13.1% of the
 *     hull's width against box-09's 3.2%.
 *   - **It hangs 0.200178 below the bill**, which is the same proud length the
 *     HEN'S WHOLE COMB had. A wattle you can measure against her comb is a wattle.
 *   - **It is a taper to a point, which is what a hanging flap is.** `taper` is 0
 *     on two of the bank's 94 records; `box-09` is a blunt block.
 *   - `{ axis: 'x', deg: 180 }` is the whole of the spin: the shape's own `y +1`
 *     attachment becomes `y -1` and it hangs. `sink: 0.5` then solves `shift` to
 *     0.000022, so the join plane is the wattle's own middle: 0.2002 of it up
 *     inside the head and the bill, 0.2002 of it hanging in air.
 *
 * **The bottom 0.09220 of it hangs CLEAR of the shell and that is not a float.**
 * The flat front face stops at y = 0.49375 and the chamfer falls away below it, so
 * the lower third of the wattle has nothing behind it. That is what a wattle IS —
 * loose skin hanging below the jaw — and it is held by the 0.108 of it that is
 * against the flat face and the 0.200178 buried inside the head above that. The
 * one-mass rule is satisfied by geometry, not by hope.
 *
 * **`WATTLE_X` = 0.115 is the midpoint of the bill's own half-width** (`tube-02`
 * is 0.460 across, so 0.230 a side), which puts each wattle squarely under one
 * side of the bill with a 0.070 gap on the midline between the pair. The pair
 * reaches z = 0.789285 against the bill's own 0.725, so it hangs 0.064285 clear
 * in FRONT of the bill — which is where a wattle hangs, not tucked behind it.
 *
 * ===========================================================================
 * ## 3. THE TAIL: `wedge-15` RUN UP THE CHAMFER, AND `chamfer: true` IS REFUSED
 * ##    EVEN THOUGH IT WAS RESERVED FOR THIS ANIMAL
 * ===========================================================================
 *
 * The hen left three things here (her §4): `wedge-15`, `box-23` and the
 * `chamfer: true` idiom. **Two of the three are taken and the third is refused
 * with a rotation.**
 *
 * **`box-23`, the fox's brush, is refused on silhouette and it is not close.** It
 * is 0.744 x 0.910 x 0.910 with a section that is ROUND to six decimals
 * (`animal-squirrel.ts` chose it for exactly that) and `taper` 0.961 — a cylinder
 * of fur that holds its bulk to the tip. The pony, the wolf and the budgie all
 * refused it for reading as a fox whatever colour it is. A cock's sickle is a
 * BLADE: thin across, long, and tapering. Those are the two shapes at opposite
 * ends of the bank's seven tails and there is nothing to weigh.
 *
 * **`wedge-15`, the lion's, is the blade — and the 212 triangles are costed
 * honestly rather than waved through.** It is 0.280 x 1.0824 x 0.555215: **the
 * LONGEST tail in the bank and the second thinnest**, and 1.0824 / 0.280 = 3.87 to
 * one. §8.1 of the build digest is explicit that triangles and not vertices are
 * the budget, so: 212 triangles is **26.2% of this animal's 810**, it is 2.65x the
 * `box-18` stub the hen wears, and it is the single most expensive decision in
 * this file — more than the whole five-point comb. The degu, the gerbil and the
 * rat each refused this shape on that cost and each of them was right, because a
 * rodent's tail is not what its animal is for. **A rooster's tail IS what a
 * rooster is for**, and this is the one animal in the collection where the bank's
 * most expensive tail is the cheap answer: the alternative to spending 212
 * triangles here is an animal that reads as a large hen.
 *
 * **`chamfer: true` WAS RESERVED FOR THIS ANIMAL AND IT CANNOT BE USED, AND THE
 * REASON IS ONE ROTATION.** The idiom (`creature.ts:820`) solves two things
 * together — the rear-top chamfer midpoint and the 45-degree turn onto its
 * outward normal — and it emits the turn as `{ axis: 'x', deg: 45 }`, which is
 * right for `animal-squirrel.ts` because `box-23`'s facing is `z -1` and its
 * section is round, so which way the part is turned does not matter. It matters
 * here, because `wedge-15` is 3.87 to one:
 *
 *       chamfer: true    facing z -1, turned +45   the blade's 1.0824 long axis
 *                                                  lands on (0, +0.707, +0.707) —
 *                                                  up and FORWARD, lying ACROSS
 *                                                  the back rather than leaving it
 *       this file        facing y +1, turned -45   the long axis lands ON the
 *                                                  chamfer normal (0, .707, -.707)
 *                                                  and the blade RUNS up and back
 *
 * A sickle has to run up and back out of the rump. So the facing is overridden to
 * `y +1` — **which is `animal-budgie.ts`'s own move on this same shape**, made for
 * the same reason: the sink then measures along the direction the tail actually
 * runs, over the shape's own 1.0824 rather than across its 0.555215. The turn is
 * hand-written as `-45` and the join is hand-written as the chamfer midpoint,
 * because `chamfer: true` refuses to sit beside either — correctly, since giving
 * one without the other is how a tail floats. **The idiom's arithmetic is taken
 * and its rotation is not**, and the `at` below is the builder's own
 * `frame.chamYZ` solved by hand: `HULL_CENTRE_Y + 0.46875` and `-0.46875`, the
 * measured midpoint of `box-03`'s +y/-z edge chamfer, which is the same 0.46875
 * the squirrel and the hedgehog sit on because it is the same cube.
 *
 * **`TAIL_SINK` = 4/16, and the CEILING chose it.** `PACK_HEIGHT_MAX` is 2.02
 * (§8.1; the goose is the animal that found it). The tail's topmost vertex lands
 * at `1.275 + 0.7071 x shift + 0.504730`, where `shift = 0.541200 - sink x
 * 1.0824`:
 *
 *       sink 0.137977 (the shape's own)   2.0568   OVER the ceiling by 0.0368
 *       sink 3/16                         2.0189   under it by 0.0011
 *       sink 4/16                         1.9711   under it by 0.0489
 *
 * **3/16 "fits" by 0.0011 — one part in 1,850 of the ceiling — and that is not a
 * fit, it is a graze.** The comparison that settles it is `animal-goose.ts`, the
 * animal that FOUND this ceiling: it had a 2.2626 neck, leaned it to 1.9560 to
 * get under, and shipped with **0.064 of clearance, 59x more than 3/16 leaves
 * here.** Nothing else in this file is decided at a tolerance of one thousandth,
 * and a species that clears a pack-wide limit by less than the width of a comb
 * point is one re-bake of the bank away from being the animal that broke it. So
 * 4/16 is the shallowest burial on the pack's grid that clears the ceiling with
 * room in hand, and it still leaves **0.8118 of sickle standing proud —
 * 1.91x the reach of the hen's whole tail.** The burial is 0.2706 against the
 * shape's own 0.076607; the root's cross-section overhangs the chamfer band's own
 * 0.4419 by 0.0566 at each end onto the flat top and flat rear faces, and 0.2706
 * of burial covers a 0.040 fall four times over.
 *
 * Keep-out, which is what the island actually charges (`pets.ts:652`, from
 * `max(width, depth) / 2`): the tail reaches z = -1.0954 and the wattle z =
 * 0.789285, so the animal is 1.8847 deep against 1.250 wide and charges **0.9424
 * — inside the fox's 1.15**, which is the pack's own worst and the number the
 * island already copes with. The budgie's tail argument, arrived at from the
 * other end.
 *
 * ===========================================================================
 * ## 4. EVERYTHING ELSE, AND WHAT IS STILL BEING LEFT FOR SOMEBODY
 * ===========================================================================
 *
 *   - **`byBand` ON THE TAIL IS REFUSED, AND IT IS THE ONE THAT HURT.**
 *     `wedge-15` carries TWO bands and `animal-budgie.ts` measured them: band 5's
 *     40 triangles are the lion's TUFT, spanning the shape's own y 0.2905 to
 *     0.5412, and this spin carries +y to the far end, so they land on the SICKLE
 *     TIPS. A green flash on the tips for no geometry at all was one line away.
 *     It is declined because the hen's §0 reserves the painted mechanisms —
 *     `belly` and `byBand` — for the guinea fowl's spots and the quail's
 *     mottling, and those two siblings have nothing else. A cock's sickle is one
 *     colour along its length anyway; the iridescence is a sheen, not a band.
 *     **Guinea fowl, quail: still yours, and the tail's second band is a fourth
 *     thing nobody has spent.**
 *
 *   - **NO SPUR, and the arithmetic is short.** A cock's spur is the one thing on
 *     him this file does not say. The smallest true point in the bank is
 *     `cone-01` at 0.400356 long; `box-01`, the whole leg it would grow on, is
 *     0.30625 tall. **A spur can only be built at 1.307x the height of the entire
 *     leg**, which is not a spur, it is a second tail. `animal-ferret.ts` is the
 *     standing precedent for refusing a feature the mechanism cannot say.
 *
 *   - **THE EYE STAYS A DARK BEAD AND THE AMBER IS STILL THE GUINEA FOWL'S.** A
 *     cock's iris is orange-red in life and this coat is red-brown, so an amber
 *     bead on it is the hen's problem doubled — a marking that disappears into
 *     the thing it sits on. `plate-08` painted dark, Kenney's band 15 left as the
 *     glint, unchanged from her §6.
 *
 *   - **NO `belly`, NO `byBand` ON THE HULL, NO MARKING CARD, AND `box-41` IS NOT
 *     TAKEN.** All four are the turkey's, the guinea fowl's and the quail's; the
 *     hen left them and this bird does not need them, because it separates from
 *     her on three pieces of geometry and on saturation. `farm.ts:152` wants the
 *     turkey to be *"the biggest"* and this animal on `box-41` would take that.
 *
 *   - **IT FLAPS, AND — UNLIKE THE HEN — SOMETHING BOBS.** Her §6 declines `bob`
 *     with a reason worth keeping: it is a POSITION channel that raises and lowers
 *     a part, *"which is what a crest does and is precisely what a comb does not —
 *     a comb is fixed flesh."* That is still true of the comb here. **It is not
 *     true of a wattle**, which is the loosest tissue on the animal and the only
 *     part of this bird that genuinely swings. So `bob` lands on the wattle at
 *     `motion.ts`'s own measured defaults: 0.05 units against 0.200178 of burial,
 *     so it never unseats. Her refusal is not overturned, it is aimed at the part
 *     it was always about.
 *
 *   - **TWO LEGS, HER LEG LINE, HER FOOT PATCH.** `legs: false`, one mirrored
 *     `box-01` pair in `extras` at `box-01`'s own x = 0.25 on `LEG_ROW`'s row, and
 *     JT-044's `{ below: 'foot', at: 0.25 }` — 4/16, the lowest notch that clears
 *     the shape's own bevel onto the straight shank. A cock's shanks are the same
 *     scaly yellow as a hen's and there was nothing here to separate on.
 *
 * ## THE PALETTE IS NEW AND NOBODY HAS SIGNED IT OFF
 *
 * `farm.ts:162` carried *"comb, wattle and a dark arched tail"* and nothing about
 * colour, so these eight are the first this species has had and every one is
 * **UNREVIEWED**. They are built AGAINST the hen's seven rather than beside them,
 * because the pair share a body and the palette has to carry as much of the
 * separation as the geometry does:
 *
 *       hen coat   0xb5824a   buff-brown       cock coat   0x93501e   mahogany
 *       hen flight 0x96693a   the buff, down   cock flight 0x5e2410   dark chestnut
 *       hen comb   0xc0332e   red              cock comb   0xd23a2c   scarlet
 *
 * The move is **saturation and value, not hue**: the coat sits **9.1 degrees of
 * hue** from hers, at **91.5% saturation and 15.2% lightness against her 74.2%
 * and 26.5%** (three.js's own HSL, which is what the test measures), so the two
 * birds are obviously the same animal and obviously not the same bird. The
 * tail then does the rest — `sickle` 0x1b3325 is a dark green-black and is the
 * darkest slot on any Farm animal so far, against a hen whose tail is her own
 * coat one shade down. Weighted by SURFACE AREA (`HANDOFF.md` §6's rule, never by
 * vertex count) the mahogany is most of the bird and the sickle is the next
 * biggest single thing on it.
 *
 * `comb` paints the comb AND the wattle from ONE slot, because they are one
 * tissue on one animal and giving them two slots would invite them to drift
 * apart. `limb`, `foot` and `eye` are the hen's own three unchanged: a cock has a
 * hen's shanks, a hen's toes and a hen's eye, and inventing differences there
 * would be inventing.
 *
 * **Flagged**, for the palette, for the five-point comb, for the wattle the hen
 * refused, for `chamfer: true` going unused after being reserved, and for the 212
 * triangles in the tail. Nothing else strained: height **1.9711** inside
 * 1.43-2.02 with 0.0489 to spare, **810 triangles** inside rule 9's band, keep-out
 * 0.9424 against the fox's 1.15, feet on y = 0, one mass, every part joined at a
 * face of this hull or at a station solved off the hull's own measured geometry,
 * **nothing authored and not one stretch of any kind anywhere on the animal.**
 */
import { defineCreature } from '../creature'
import { LEG_ROW } from '../hulls'
import { PACK_PUPIL } from '../texture'

/** `box-03`'s own recorded centre, and where its faces are. The hen's constants. */
const HULL_CENTRE_Y = 0.80625
const HULL_SIDE_X = 0.625
const HULL_FRONT_Z = 0.625
const HULL_TOP_Y = 1.43125

/**
 * The measured midpoint of `box-03`'s +y / -z edge chamfer, as an offset from the
 * hull's own centre — `creature.ts`'s `frame.chamYZ`, solved by hand.
 *
 * The shell's 32 welded points are the permutations of (+/-0.625, +/-0.3125,
 * +/-0.3125) and (+/-0.5, +/-0.5, +/-0.5), so the chamfer runs from (y 0.625,
 * z -0.3125) to (y 0.3125, z -0.625) and its midpoint is (0.46875, -0.46875) —
 * not the 0.5625 you get from assuming a 1.000-wide face. It is the same 0.46875
 * `animal-squirrel.ts` and `animal-hedgehog.ts` sit on, because it is the same
 * cube. Written out here because `chamfer: true` cannot be used (§3) and this is
 * the half of that idiom which is still right.
 */
const CHAMFER_OFFSET = 0.46875

/**
 * The cage birds' wing sink, taken from `animal-chicken.ts` unchanged.
 *
 * Her §3 measured it and refused the deeper one with a number: `box-06`'s tip
 * reaches |z| 0.456649 where this shell's flat side reaches 0.312500, so the
 * burial has to cover 0.471328 of the part's own thickness and the pack's 1/16
 * grid snaps that up to 8/16; 9/16 buys 0.019115 more, 1.53% of the hull's width,
 * which is under what the island's downward camera can show. Four cage birds and
 * five galliforms on one number. **Ten birds, one wing.**
 */
const WING_SINK = 0.5

/**
 * 2/16 — the hen's own step, kept, and this is the one number of hers that does
 * NOT invert.
 *
 * Hers was *"the LARGEST grid step at which the three points still MEET"* at HER
 * burial. At this shallower one the cone leaves the crown 0.225994 across rather
 * than 0.164285, so 3/16 would overlap by 0.038494 and her rule would take it.
 * It is refused on FOOTPRINT: five points at 3/16 measure 1.078570 against the
 * 0.875 of crown this burial allows, and four at 3/16 measure 0.891070, still
 * over. Five points and 3/16 cannot both be had and the count is worth more.
 *
 * What the wider section buys instead is the blade. Two cones separate where the
 * section has narrowed to the step, 0.248073 above the base on both birds because
 * it is the same cone: this one is solid for **0.123073 above the crown against
 * her 0.047873**, and then carries the identical 0.152327 of free points. Every
 * bit of the extra comb is wall, which is what a cock's comb is.
 */
const COMB_STEP = 0.125

/**
 * The leading point's station, and the row is CENTRED rather than pushed forward.
 *
 * A hen's comb is a short blade over the brow, so `animal-chicken.ts` starts hers
 * at the flat top's front edge and runs BACK. A cock's single comb runs the whole
 * length of the skull, so this row uses the crown end to end — and the shell
 * forces the same answer. "Nothing floats" as arithmetic: the flat top ends at
 * 0.3125 and the chamfer falls away 1:1, so a base buried 0.125 stays in real
 * geometry out to +/-0.4375, a footprint of 0.875. Five cones at 2/16 measure
 * `4 x 0.125 + 0.328570 = 0.828570` and leave 0.023215 at each end when centred.
 * Six would need 0.953570 and does not fit at all.
 */
const COMB_FRONT_Z = 2 * COMB_STEP

/**
 * The bill's own underside — `tube-02`'s recorded centre less half its height.
 *
 * `animal-chicken.ts`'s §5 measured it as the top of the window she refused a
 * wattle in; here it is the station the wattle hangs FROM.
 */
const BILL_UNDER_Y = 0.72775 - 0.252 / 2

/**
 * The midpoint of the bill's own half-width. `tube-02` is 0.460 across, so 0.230
 * a side, so each wattle sits squarely under one side of the bill and the pair
 * leaves a 0.070 gap on the midline. A cock has two wattles, one either side of
 * the chin, and this is where they are.
 */
const WATTLE_X = 0.115

/**
 * `sink: 0.5` on the wattle, and it is the join plane rather than a burial depth.
 *
 * `shift = -s.lo - sink x extent` solves to 0.000022 at this value, so the cone's
 * own middle lands on `BILL_UNDER_Y`: 0.200178 of it up inside the head and the
 * bill, 0.200178 of it hanging below. The hanging half is the same length as the
 * HEN'S WHOLE COMB, and 4.12x what `box-09` could have stood proud (§2).
 */
const WATTLE_SINK = 0.5

/**
 * 4/16, and `PACK_HEIGHT_MAX` chose it.
 *
 * The topmost vertex of the spun blade lands at `1.275 + 0.7071 x shift +
 * 0.504730` with `shift = 0.541200 - sink x 1.0824`. The shape's own 0.137977
 * puts it at 2.0568, over the pack's 2.02 ceiling by 0.0368. 3/16 lands 2.0189 —
 * under by 0.0011, one part in 1,850, where `animal-goose.ts` (which found this
 * ceiling) shipped with 0.064 of clearance, 59x more. **4/16 is the shallowest
 * notch on the pack's grid that clears it with room in hand**, at 1.9711, and it still
 * leaves 0.8118 of sickle standing — 1.91x the reach of the hen's whole tail.
 */
const TAIL_SINK = 0.25

/**
 * 4/16, and it is DERIVED — `animal-chicken.ts`'s §6, unchanged and unargued.
 *
 * `box-01`'s bevel from sole to full-width ring is 0.0625 of its own 0.30625 of
 * height, so the leg reaches full width at 0.204082 of itself; `at` must be k/16
 * (`texture.ts:106-115` throws otherwise); 3/16 lands inside the bevel and 4/16
 * clears it by 0.014063 onto the straight shank.
 */
const FOOT_AT = 0.25

export const ROOSTER_ASSEMBLY = defineCreature('animal-rooster', {
  palette: {
    coat: 0x93501e,    // UNREVIEWED: mahogany — the hen's buff, 9.1deg of hue away, deeper and hotter
    flight: 0x5e2410,  // UNREVIEWED: dark chestnut — the wings, one step below the coat
    sickle: 0x1b3325,  // UNREVIEWED: green-black — the arched tail, and the darkest slot in Farm
    comb: 0xd23a2c,    // UNREVIEWED: scarlet — the comb AND the wattle, because they are one tissue
    limb: 0xe0b96a,    // the hen's own pale yellow shanks, and the same bill
    foot: 0xc2913a,    // the hen's own JT-044 second tone — the scaly toes
    eye: 0x2a2018,     // the hen's own dark bead; the amber is still the guinea fowl's
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  eyes: { part: 'plate-08', paint: 'eye' },

  snout: { part: 'tube-02', paint: 'limb' },

  tail: {
    part: 'wedge-15',
    paint: 'sickle',
    axis: 'y',
    dir: 1,
    spin: [{ axis: 'x', deg: -45 }],
    sink: TAIL_SINK,
    at: [0, HULL_CENTRE_Y + CHAMFER_OFFSET, -CHAMFER_OFFSET],
  },

  legs: false,
  extras: [
    {
      name: 'leg-front',
      part: 'box-01',
      paint: { base: 'limb', patch: { below: 'foot', at: FOOT_AT } },
      kind: 'pair',
      sink: LEG_ROW.sink,
      at: [0.25, LEG_ROW.y, 0],
    },

    {
      name: 'wing',
      part: 'box-06',
      paint: 'flight',
      kind: 'pair',
      axis: 'z',
      dir: -1,
      spin: [{ axis: 'z', deg: -90 }, { axis: 'y', deg: -90 }],
      sink: WING_SINK,
      at: [HULL_SIDE_X, HULL_CENTRE_Y, 0],
    },

    {
      name: 'wattle',
      part: 'cone-01',
      paint: 'comb',
      kind: 'pair',
      spin: [{ axis: 'x', deg: 180 }],
      sink: WATTLE_SINK,
      at: [WATTLE_X, BILL_UNDER_Y, HULL_FRONT_Z],
    },

    {
      name: 'comb-1',
      part: 'cone-01',
      paint: 'comb',
      at: [0, HULL_TOP_Y, COMB_FRONT_Z],
    },
    {
      name: 'comb-2',
      part: 'cone-01',
      paint: 'comb',
      at: [0, HULL_TOP_Y, COMB_FRONT_Z - COMB_STEP],
    },
    {
      name: 'comb-3',
      part: 'cone-01',
      paint: 'comb',
      at: [0, HULL_TOP_Y, COMB_FRONT_Z - 2 * COMB_STEP],
    },
    {
      name: 'comb-4',
      part: 'cone-01',
      paint: 'comb',
      at: [0, HULL_TOP_Y, COMB_FRONT_Z - 3 * COMB_STEP],
    },
    {
      name: 'comb-5',
      part: 'cone-01',
      paint: 'comb',
      at: [0, HULL_TOP_Y, COMB_FRONT_Z - 4 * COMB_STEP],
    },
  ],

  motion: [
    { kind: 'flap', parts: ['wing'] },
    { kind: 'bob', parts: ['wattle'] },
  ],

  flag: 'THIS ANIMAL IS animal-chicken WITH THREE THINGS ADDED AND IT IS MEANT TO BE — a cock and '
    + 'a hen are one body, farm.ts:162 says the comb, the wattle and the dark arched tail are the '
    + 'whole of what carries them apart, and the hen left all three unspent with the arithmetic '
    + 'already done so that it could be INVERTED rather than re-derived. THE COMB IS FIVE POINTS '
    + 'AT THE SHAPE\'S OWN BURIAL, which is the dial animal-chicken.ts named for this species in '
    + 'writing: she buries cone-01 at 8/16 and stands 0.200178 proud, this one omits sink '
    + 'entirely and takes the record\'s 0.312222, standing 0.275356 — 37.55% more comb with no '
    + 'stretch anywhere, and the omission lands each cone\'s centre on y = 1.506436 against '
    + 'cone-01\'s OWN RECORDED OFFSET of 1.506428 — 0.0000084 apart, all of it the bank\'s own '
    + 'rounding — because the bee wears this cone on a crown at this '
    + 'height. FIVE and not three because a cock\'s single comb runs the whole skull where a '
    + 'hen\'s is a blade over the brow, and the shell forces the same answer: at this burial the '
    + '"nothing floats" bound is z +/-0.4375, a footprint of 0.875, and five cones at 2/16 '
    + 'measure 0.828570 and centre with 0.023215 at each end — six need 0.953570 and do not fit. '
    + 'THE STEP STAYS 2/16 AND THAT IS THE ONE NUMBER OF HERS THAT DOES NOT INVERT: at this '
    + 'shallower burial the cone leaves the crown 0.225994 across rather than 0.164285 so 3/16 '
    + 'would overlap by 0.038494 and her own rule would take it, but five points at 3/16 measure '
    + '1.078570 against 0.875 of crown and even four measure 0.891070, so the count wins. What '
    + 'the wider section buys instead is the BLADE, and this is the finding worth looking at: the '
    + 'points separate 0.248073 above the base on both birds because it is the same cone, so this '
    + 'comb is SOLID for 0.123073 above the crown against her 0.047873 — 2.571x — and then carries '
    + 'the IDENTICAL 0.152327 of free serrations. That identity is exact and not luck: the free '
    + 'point is (H - burial) - (separation - burial), so the BURIAL CANCELS and it is H - '
    + 'separation for any burial at all. Burying a comb deeper cannot change its teeth, only eat '
    + 'the wall under them — so the extra comb is all wall, which is exactly what separates a '
    + 'cock\'s comb from a hen\'s in life. THE WATTLE IS TAKEN AND box-09 IS '
    + 'REFUSED ON HER OWN NUMBER: she measured that overruling the bunny-nose box\'s burial to '
    + '8/16 opens her 0.108 window but leaves 0.039913 standing, 3.2% of the hull\'s width, and '
    + 'she was right that it is nothing. So the wattle is cone-01 AGAIN, turned upside down by '
    + '{x, 180} into a mirrored PAIR because a cock has two — it stands 0.164285 proud of the '
    + 'front face, 4.12x box-09, and hangs 0.200178 below the bill, which is the same length as '
    + 'THE HEN\'S ENTIRE COMB. Its bottom 0.09220 hangs clear of the shell where the chamfer has '
    + 'fallen away and that is not a float, it is what a wattle is; it is held by the 0.108 '
    + 'against the flat face and the 0.200178 buried inside the head. plate-12 and plate-16 were '
    + 'never candidates — animal-budgie.ts:243-255 measured them for this exact job and refused '
    + 'them for reading FLAT. THE TAIL IS wedge-15 AND chamfer: true WAS RESERVED FOR THIS ANIMAL '
    + 'AND COULD NOT BE USED, which is the thing to check hardest. The idiom emits its 45-degree '
    + 'turn as {x, +45}, which is right for animal-squirrel.ts because box-23\'s section is ROUND '
    + 'and it does not matter which way it turns; wedge-15 is 3.87 to one, and +45 lands its long '
    + 'axis on (0, +0.707, +0.707) — up and FORWARD, lying ACROSS the back instead of leaving it. '
    + 'A sickle has to RUN up and back, so the facing is overridden to y +1 (animal-budgie.ts\'s '
    + 'own move on this same shape, so the sink measures along the 1.0824 the tail runs rather '
    + 'than across its 0.555215) and the turn is hand-written as -45, which lands the long axis '
    + 'exactly ON the chamfer normal. The idiom\'s arithmetic is taken and its rotation is not: '
    + 'the `at` is creature.ts\'s own frame.chamYZ solved by hand at 0.46875, the same midpoint '
    + 'the squirrel sits on. 212 TRIANGLES, 26.2% OF THE ANIMAL and 2.65x the hen\'s stub, and it '
    + 'is costed rather than waved through — the degu, gerbil and rat all refused this shape on '
    + 'that cost and were right, but a rooster\'s tail is what a rooster IS and the alternative '
    + 'is a bird that reads as a large hen. box-23, the fox\'s brush, is refused on silhouette: '
    + 'round to six decimals and taper 0.961, a cylinder of fur, where a sickle is a blade. '
    + 'TAIL_SINK IS 4/16 AND THE CEILING CHOSE IT: at the shape\'s own 0.137977 the tip lands '
    + '2.0568, over PACK_HEIGHT_MAX 2.02; at 3/16 it lands 2.0189, under by 0.0011 — one part '
    + 'in 1,850, where animal-goose.ts, the animal that FOUND this ceiling, shipped with 0.064 '
    + 'of clearance, 59x more — so 3/16 is a graze rather than a fit; 4/16 lands 1.9711 with '
    + '0.0489 to spare and still stands 0.8118 of '
    + 'sickle proud, 1.91x the hen\'s whole tail. WHAT IS STILL LEFT FOR SOMEBODY: wedge-15 '
    + 'carries TWO bands and band 5 is the lion\'s TUFT, which this spin puts on the SICKLE TIPS '
    + '— a green flash for no geometry at all, one line away, and DECLINED because the hen '
    + 'reserved belly and byBand for the guinea fowl\'s spots and the quail\'s mottling and those '
    + 'two have nothing else. box-41, belly, marking cards and the amber iris are all still '
    + 'unspent too. NO SPUR: the smallest true point in the bank is cone-01 at 0.400356 against '
    + 'box-01\'s whole 0.30625 of leg, so a spur can only be built at 1.307x the height of the '
    + 'leg it grows on. IT BOBS, AND THE HEN\'S REFUSAL IS NOT OVERTURNED: she declined bob '
    + 'because it is a POSITION channel and a comb is fixed flesh, which is still true here — so '
    + 'bob is aimed at the WATTLE, the only loose tissue on the bird, at 0.05 units against '
    + '0.200178 of burial so it never unseats. NEW PALETTE, UNREVIEWED, eight slots: the '
    + 'separation from the hen is SATURATION AND VALUE, not hue — coat 0x93501e against her '
    + '0xb5824a is 9.1 degrees of hue away at 91.5% saturation and 15.2% lightness against her '
    + '74.2% and 26.5%, so the two read as obviously the same animal and obviously not the same '
    + 'bird — plus sickle '
    + '0x1b3325, the darkest slot on any Farm animal. limb, foot and eye are HERS unchanged, '
    + 'because a cock has a hen\'s shanks and a hen\'s eye. Nothing was authored and nothing is '
    + 'stretched.',
})
