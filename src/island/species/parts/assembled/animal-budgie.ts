/**
 * The budgie — Home Pets' first CAGE BIRD, and **the first species in the project
 * to wear a WING.**
 *
 * ONE SPECIES, ONE FILE. `register.ts` says why the one appended line in
 * `index.ts` is the whole of the wiring.
 *
 * Canary, cockatiel and lovebird are built next and are meant to read this file
 * first. Three things are stated before anything else because those three builds
 * turn on them: **what a wing is made of here**, **why `box-21` is not a taller
 * body and which bird should actually wear it**, and **which axes separate these
 * four from each other.**
 *
 * ===========================================================================
 * ## 1. THE WING. THE BANK HAS NONE, AND THIS ONE IS A BUNNY'S EAR.
 * ===========================================================================
 *
 * **The absence, measured.** `wing` is declared in `bank.generated.ts`'s
 * `PartRole` union and occurs **ZERO times in all 94 records**, alongside `horn`
 * and `claw`. `animal-nightjar.ts` and `animal-kiwi.ts` both pin that, and both
 * were entitled to: a perched nightjar's wings are folded inside its own outline
 * and a kiwi has none at all. **A budgie has neither excuse.** Its folded wing
 * lies down the flank in plain sight, barred black on yellow, and it is one of
 * the four things a child names the bird by. So this species could not do what
 * those two did, and JT-043 is Joe's ruling for exactly this case:
 *
 * > *"i am pretty sure i can build in the missing bits with what we have
 * > otherwise. bit of clever sizing and rotation will get a lot done."*
 *
 * **The absence is OURS, not the pack's, and that is worth a manager's eye.**
 * `tools/pets/parts-bank.ts:703`'s `BAKED_ROLES` is `hull, leg, ear, tail, eye,
 * nose, band, card, tooth` — **`wing` is censused and deliberately not baked**,
 * because baking all thirteen roles came to 763.8 KB and Garden needed none of it
 * (`parts-bank.ts:684-704`). §7 of the spec censuses **10 wing instances in 6
 * distinct shapes from 5 donor species, 0.362-0.693 x 0.200-0.450 x
 * 0.362-0.600** — and §7's own "known debt" paragraph says of the fin and the
 * insect wing that *"one line adds them"*. So the pack HAS wings; this module
 * does not. Whether to spend that line is not a species' call.
 * `tests/island/assembly-budgie.test.ts` pins the absence over `PARTS_BANK` so
 * the day it changes this file goes red and the substitute below is reconsidered
 * rather than quietly inherited by four birds.
 *
 * **What stands in: `box-06`, the BUNNY'S OWN EAR, laid along the flank.**
 *
 *   - **It is the longest small part in the bank**, and that is why it was
 *     reached for. Over the 23 ear shapes `longest` runs to **0.913298** on
 *     `box-06`/`box-07` against **0.742676** on the koala's `box-25` and
 *     **0.618750** on the elephant's `tube-04` — 1.23x and 1.48x. On a 1.250-deep
 *     body a folded wing wants to run most of the length, and nothing in the bank
 *     that is not a TAIL does.
 *   - **It is SOLID, and that decided it over the two flat alternatives.** The
 *     obvious cheap wing is a flank card — `plate-10`/`plate-11`, side-mounted at
 *     x = 0.635 — or a stretched `bespoke-triangle-01`, which JT-041 sanctions
 *     for everybody without a flag and which is genuinely the right OUTLINE.
 *     Both are ZERO THICKNESS (`plate-10`'s `size[0]` is exactly 0), and **the
 *     island's camera looks DOWN at these animals**: `animal-nightjar.ts` moves
 *     two of its four mottling cards onto the BACK for precisely that reason,
 *     because a flank card is edge-on from up there. A wing that disappears from
 *     the only angle a child plays at is not a wing. `box-06` is 0.305836 thick
 *     and stands 0.152918 proud, so it has a top face and reads from above.
 *     **That is the finding the other three birds should copy.**
 *   - **The pair built here is the pack's own pair.** `box-06` and `box-07` are
 *     the bunny's right and left ear and are `handed` — the same point set under
 *     a mirror. Rule 6 says a paired part is one mesh mirrored, so this places
 *     `box-06` as a `pair` and the mirror IS `box-07`. Nothing was invented to
 *     get a left wing.
 *
 * **Its orientation is two spins and an axis override, and all three are solved
 * rather than picked.** An ear's long axis and its facing are the same direction
 * — a bunny ear points along its own length — so hung on the side face unspun it
 * sticks 0.913 straight out. A folded wing needs the long axis running FORE-AFT
 * while the join stays on the FLANK, and `[{ axis: 'z', deg: -90 },
 * { axis: 'y', deg: -90 }]` is the axis-aligned pair that does it:
 *
 *       own x (0.481975) -> -y     the wing's HEIGHT
 *       own y (0.913298) -> +z     the wing's LENGTH, fore and aft
 *       own z (0.305836) -> -x     the wing's THICKNESS, out from the flank
 *
 * A rotation carries the facing with it (`assembly.ts:580`), so the facing has to
 * be the vector that LANDS on +x, which is `-z`: hence `axis: 'z', dir: -1`. That
 * is `animal-tortoise.ts`'s hoop trick and `animal-slow-worm.ts`'s coil, used a
 * third time and for the same reason — the spin is what the shape needs and the
 * override is what keeps the join honest.
 *
 * **`sink: 0.5` is SOLVED, and it is the tightest number on this animal.** The
 * wing's tip reaches |z| = 0.456649 (half its own 0.913298). `box-03`'s flat side
 * face only reaches |z| = 0.312500 — measured off the shell, which is §8 step 1's
 * warning that the flat face is not where it looks — and past that the chamfer
 * falls away 1:1. So the tip stands over a surface that has receded **0.144149**,
 * and §3's "nothing floats" makes that the MINIMUM burial: 0.144149 / 0.305836 =
 * **0.471328** of the part's own thickness. `box-06`'s own donor burial is
 * 0.366259 and is NOT enough — the one place on this animal where a donor
 * transfer had to be overruled, and it is overruled by a measurement rather than
 * by eye. Snapped UP to the pack's own 1/16 grid, which is `ridgeSpan`'s own
 * discipline (§8 step 4), that is **8/16 = 0.5**: buried 0.152918, which also
 * clears §3's 0.125 floor for an embedded part, and standing 0.152918 proud. The
 * test checks all four corners of the wing's inner face against the hull's own
 * triangles rather than trusting this paragraph.
 *
 * **All three join coordinates are the HULL'S OWN.** `[0.625, 0.80625, 0]` is
 * `box-03`'s side face, its own recorded centre height and its own midline — the
 * move `animal-badger.ts` makes for its tail, and for the same reason: a bird's
 * wing hangs at the shoulder, which is the body's mid-height, and the number was
 * not invented, it was the hull's.
 *
 * **Confidence.** The silhouette is right and the read is a judgement (rule 10,
 * which no test can take): a long solid panel down the flank, 73% of the body's
 * depth, standing 0.153 proud with a pale bar on it. What it is NOT is pointed —
 * `box-06`'s taper is 0.849275, so it is a rounded lozenge rather than a primary
 * feather. The `flag` says so where Joe reads it. **The wing is a shared idiom
 * and NOT a separator**: canary, cockatiel and lovebird should wear this same
 * part at this same sink, so four birds read as one family, and separate on §3
 * below.
 *
 * ===========================================================================
 * ## 2. `box-21` IS NOT A TALLER BODY. IT IS THIS HULL WITH THE FOX'S EARS ON.
 * ===========================================================================
 *
 * **Considered, measured and REFUSED**, and recorded here so the next builder
 * does not helpfully put it back — §2's third establishment, and the same trap
 * `animal-badger.ts` found in `box-12`.
 *
 * `hulls.ts:189` offers `box-21` as *"1.250 x 1.5051 x 1.250 — the fox's. TALLER,
 * and nothing else."* The budgie was to be the tallest of the four cage birds and
 * that is the only shell in the pack over 1.25 tall, so it was the obvious hull.
 * **It is not a taller body.** Measured off its own 340 welded points, sliced by
 * height (local, about its recorded centre y = 0.933788):
 *
 *   - **Below local y = +0.4975 it is the 1.250 cube.** Its side faces reach
 *     |x| = 0.625, its bottom chamfer closes at −0.7525 and its top face is 12
 *     points at |x|, |z| ≤ 0.3125 — the same closing ring `box-03` has at its own
 *     +0.625. In world terms that body runs **0.181288 to 1.431288**, which is
 *     `box-03`'s own 0.18125 to 1.43125 to four decimals.
 *   - **Above y = +0.4975 there is nothing on the midline at all.** Every one of
 *     the 150 points up there sits in one of two clusters at |x| between 0.218
 *     and 0.454 and z between 0.26 and 0.47 — forward and to each side, rising to
 *     two tips at y = +0.7525. They are EARS, and the confirmation the geometry
 *     cannot give on its own is that the fox has no separate ear record anywhere
 *     in the bank: the ears are in the shell, which is why this shape is 184
 *     triangles against the cube's 60.
 *   - **Band 5 — 10 triangles, y 0.3725 to 0.6047 — is Kenney's own inner-ear cut
 *     on those lugs**, exactly as band 5 of `box-12` is the cow's.
 *
 * So `box-21`'s extra 0.2551 of height is two ear tips, and a bird wearing it is
 * a bird with ears. Refused.
 *
 * **Two consequences, and both are for the manager rather than for this file:**
 *
 *   1. **`box-21` IS THE COCKATIEL'S HULL.** Two soft lugs standing off the top
 *      of the head, already carrying their own colour cut, are the closest thing
 *      in this bank to a CREST — and the cockatiel is the one cage bird defined
 *      by one (`home-pets.ts:103`, *"the crest ... the only one a child could
 *      name from silhouette alone"*). It also restores that file's own signed-off
 *      height ladder, where the cockatiel is 1.52 and the tallest and the budgie
 *      is 1.42.
 *   2. **THE BUDGIE THEREFORE CANNOT BE THE TALLEST, and nothing can fix that
 *      inside this species.** `home-pets.ts:194` says *"the tallest, slimmest,
 *      longest-tailed cage bird"* and the first of those three is now
 *      unbuildable: the pack drew ten hulls, nine of them are 1.25 tall or less,
 *      the tenth is `box-41` at 1.30 and is bigger on all three axes (1.35 wide),
 *      and `HullDef.stretch` is `never` so a body cannot be stretched to get
 *      there. Every cage bird on a 1.250 cube stands at **1.43125**, the pack's
 *      own `HEIGHT_FLOOR`. This bird takes the other two of the three and the
 *      separation moves onto the axes in §3.
 *
 * ===========================================================================
 * ## 3. WHAT SEPARATES THIS BIRD FROM THE OTHER THREE
 * ===========================================================================
 *
 * `home-pets.ts:68-105` is the brief: four small perching birds on one album
 * page, three of them parrots, with a fifth (`animal-parrot`, one of the frozen
 * Kenney 24) they must not read as either. Four axes are spent here and none of
 * them is height:
 *
 *   1. **TAIL — `wedge-15`, the LONGEST in the bank AND the second-thinnest.**
 *      1.0824 against `wedge-07`/`wedge-18` at 1.046587, the fox's brush at
 *      0.910248 and the parrot's own fan `box-38` at 0.912191; and 0.280 across
 *      against the fan's 0.625879 and the beaver's paddle's 0.726. It reaches
 *      **0.763846 clear of the rear face**. The obvious three for the others are
 *      `box-38` (the parrot's fan — the canary's *"fan/folded"*), `box-18` (the
 *      bank's only stub — the lovebird's *"short/tiny"*) and `wedge-18`.
 *   2. **DEPTH, and it is the keep-out.** 2.1971 deep against 1.5758 wide, a
 *      keep-out of **1.0986** — much the deepest thing this collection will
 *      build. `home-pets.ts:150-155` predicted this exact animal: *"the budgie is
 *      the widest of the four ... it is the one bird here whose depth, not width,
 *      sets its radius"*. The other three should stay well under it.
 *   3. **COLOUR — green over yellow, and nothing else here is green.**
 *   4. **EXTRAS — a wing bar and blue cheek patches.** No crest (the
 *      cockatiel's), no collar (the lovebird's), and not a bare face.
 *
 * **SLIM is not sayable on the BODY and it is worth saying why once.** The hull
 * is one of the pack's ten shells and is never scaled, so every bird on the
 * 1.250 cube has the same 1.25 / 1.43125 = 0.873 stockiness. What is slim on this
 * animal is the TAIL (0.280 across, above) and the STANCE: the legs stand at
 * x = 0.25, `box-01`'s own recorded offset and the narrowest station the pack
 * demonstrates, where `animal-kiwi.ts` stands at 0.4375 for the opposite reason.
 *
 * ===========================================================================
 * ## 4. Every other number, and where it came from
 * ===========================================================================
 *
 *   - **THE HULL IS `box-03`, AND IT IS THE PACK'S OWN BIRD BODY.** Not a default
 *     taken for want of a better: its fifteen donors include `parrot/body/hull`
 *     and `chick/body/hull`, so two of the pack's three birds wear this exact
 *     shell — which is what makes every donor transfer below a recovery rather
 *     than an inference. `animal-nightjar.ts` and `animal-kiwi.ts` chose it for
 *     the same reason and say so.
 *
 *   - **THE BEAK IS `cone-06` — THE PARROT'S OWN BEAK — and a budgie is a
 *     parrot.** Spec §5 lists "a hooked beak" as one of four shapes the pack was
 *     said not to have; §3.1 retired three of that four and this retires the
 *     fourth for anything parrot-shaped, because the pack drew one and nothing
 *     had spent it. It is 0.400 x 0.401429 x 0.286878, `taper 0.000` — a true
 *     point — and it is placed by the donor transfer ALONE: joined at this hull's
 *     front face z = 0.625 sunk its own measured 0.360878, its centre lands on
 *     **z = 0.664911, the bank's recorded offset for the shape to six decimals**,
 *     and its height on the shape's own y = 0.718036. That agreement is the
 *     evidence (§8) — the join was solved for and then checked against a number
 *     the solve never used — and here it is exact rather than argued, because the
 *     donor wears it on THIS shell.
 *
 *     It stands **0.183 proud** and `pets:creature` marks it `sunk 0.103 THIN`.
 *     That is a print and not a fault, for `animal-nightjar.ts`'s own reason:
 *     0.360878 is one measured value over one donor, and deepening it to clear a
 *     threshold would be discarding a measurement to satisfy a warning.
 *
 *   - **THE CERE IS THAT BEAK'S OWN UPPER BAND, and a separate cere was REFUSED
 *     with the measurement.** A budgie's cere is the fleshy blue patch
 *     immediately above the bill and it is the bird's signature. The obvious
 *     build is a flat pad on the face above the beak, and `blade-02` — the
 *     bunny's 0.4017 x 0.2700 x 0.0500 nose plate — is exactly the right shape.
 *     **There is nowhere to put it.** The beak's own top edge is at y = 0.718036
 *     + 0.200715 = **0.918751** and the eye cards span y **0.69375 to 1.09375**,
 *     so the beak already overlaps the eye card's own height by 0.225 and there
 *     is no band of clear face between them at all. A pad hung there would stand
 *     in front of each card's inner corner and occlude the eye, which brief §5
 *     keeps constant per species. So the cere is `cone-06`'s **band 15** instead,
 *     and that band is measurably the UPPER mandible: mean y **+0.0409** over its
 *     14 triangles against band 13's **-0.1221** over the other 14. Kenney's own
 *     cut, no geometry, and the blue lands on the top of the bill where a cere
 *     sits.
 *
 *   - **THE THROAT SPOTS CANNOT BE PLACED AT ALL, and this refusal cost the
 *     most.** A budgie wears three to six black spots in a row across the throat
 *     under the bill. The bank's nostril dots — `plate-12` (0.080) and
 *     `plate-16` (0.113137) — are exactly the shape, and §3.1 is the whole
 *     argument for spending a cow's nostril as a budgie's throat spot. **The
 *     window is 0.023571 tall.** The bill's own lower edge is at y = **0.517321**
 *     and `box-03`'s flat front face reaches only 0.3125 below its centre, ending
 *     at y = **0.49375**; below that the face has begun to fall away, and either
 *     dot tucked under the bill on the pack's own card plane z = 0.635 stands
 *     clear of the hull at its lower edge — **0.0664 for `plate-12`** and
 *     **0.0996 for `plate-16`**. `animal-mole.ts` and `animal-kiwi.ts` refuse the
 *     same two cards for the same measured reason from a different direction. So
 *     they are not here, and the flag says so.
 *
 *   - **THE CHEEK PATCHES ARE `plate-16`, AND BOTH STATIONS ARE SOLVED.** The
 *     violet-blue cheek patch sits directly under a budgie's eye, and unlike the
 *     throat spots it fits. **y = 0.637181** is the eye card's own lower edge
 *     (0.89375 - 0.400/2) minus the dot's own half-height, so the patch's top
 *     edge touches the eye's bottom edge exactly. **x = 0.255931** is the front
 *     face's own flat reach (0.3125, measured) minus that same half-height, so
 *     the patch's outer edge lands on the flat face's own edge and not one
 *     thousandth past it onto the chamfer — which puts it 0.0066 inboard of the
 *     eye's own x, as nearly under the eye as this shell allows. **z = 0.635** is
 *     the pack's own card plane, 0.010 proud of the 0.625 face, quoted and not
 *     invented (`CARD_STANDOFF`).
 *
 *   - **THE WING BAR IS `plate-10`, HUNG ON THE WING'S OWN OUTER FACE.** The
 *     cow's, dog's and giraffe's flank card — 0 x 0.244 x 0.252879, zero
 *     thickness, `x +1`, sunk 0 — so it needs no spin at all to lie flat on a
 *     flank-facing surface. `on: 'wing'` makes the builder solve the join off the
 *     wing's OWN BUILT VERTICES (`creature.ts:650-712`), landing it at
 *     x = 0.777918 with the 0.010 standoff a solved card gets, so a bar that
 *     floats or buries is a thing that cannot happen quietly.
 *     `animal-badger.ts` and `animal-kiwi.ts` use `on` for the same reason.
 *
 *   - **TWO LEGS, AND THE FEET ARE JT-044's TWO-TONE.** `legs: false` and one
 *     mirrored `box-01` pair in `extras` — `animal-nightjar.ts` and
 *     `animal-kiwi.ts` are the worked examples — at `LEG_ROW.y` = 0.18125 and
 *     `LEG_ROW.sink` = 0.408163, which put the feet on y = 0 exactly: the leg's
 *     centre solves onto `box-01`'s own recorded 0.153125 and its bottom onto
 *     zero. **x = 0.25 is `box-01`'s OWN recorded offset**, the narrowest station
 *     the pack demonstrates and the right one for the slimmest of four birds;
 *     **z = 0 is the hull's midline**, the only station a biped's legs can be at,
 *     since two legs carry the whole animal where four straddle it. JT-044's
 *     patch is `{ below: 'foot', at: 0.25 }` — 4/16 on the pack's own grid — so
 *     the bottom quarter of each leg is the darker toe against the pale shank,
 *     which is what a budgie's foot looks like. Joe ruled the mechanism for
 *     hooves; a bird's foot against its leg is the same tool.
 *
 *   - **THE EYE IS `plate-08` — THE PACK'S OWN BIRD EYE, and the only ROUND one.**
 *     0.400 x 0.400, `symmetry: radial`, donated by the chick, the parrot, the
 *     penguin, the fish and the monkey: three of its five donors are the pack's
 *     three birds. A budgie's eye is a round dark bead in a pale ring, and the
 *     card arrives pre-split at Kenney's own cut (bands 3 and 15), so the ring
 *     and the pupil cost two palette slots and no geometry.
 *     `animal-nightjar.ts` took the biggest card in the pack and
 *     `animal-kiwi.ts` the smallest; this is the third distinct answer in three
 *     birds, and it is the pack's own.
 *
 *   - **THE TAIL IS `wedge-15`, THE LION'S, TURNED TO POINT STRAIGHT BACK.**
 *     Joe's own precedent for re-siting a tail is `animal-goldfish.ts`, where
 *     this exact shape is worn as a caudal fin; here it stays a tail and only its
 *     posture changes. `axis: 'y', dir: 1` with `{ axis: 'x', deg: -90 }` is the
 *     same override the wing uses: the spin takes the shape's own long axis (its
 *     y, 1.0824) onto -z, and the facing that LANDS on `z -1` under that spin is
 *     `y +1`, so the sink is still measured along the direction the tail actually
 *     runs.
 *
 *     **Its height is the HULL'S own centre, and it is the only height that
 *     works** — `animal-badger.ts`'s move and its argument, arrived at
 *     independently. Spun, the tail's root section is 0.555215 tall, so it fits
 *     inside the flat rear face's 0.625 only while its centre is within
 *     **0.034892** of the hull's own 0.80625. The lion's own recorded 1.204607
 *     is 0.398 out and would leave the whole top of the root standing off a
 *     chamfer that has fallen away. At 0.80625 the root spans 0.528642 to
 *     1.083858 with 0.035 to spare at each end: the whole join plane is on real
 *     flat geometry. It is also the right posture — a perched budgie's tail
 *     leaves the body at mid-height and runs straight back, where a squirrel's
 *     goes up the chamfer.
 *
 *     **Band 5 lands at the TIP, and it is the lion's tuft.** Measured: band 5's
 *     40 triangles span the shape's own y 0.2905 to 0.5412, the top of the lion's
 *     tail; the spin takes +y to -z, so those triangles end up at the rearmost
 *     quarter. Painted blue that is a budgie's blue tail flash, from Kenney's own
 *     cut and no geometry.
 *
 *   - **`sink: 0.2943` ON THE TAIL IS THE ONE NUMBER CHOSEN FOR A REASON THAT IS
 *     NOT ANATOMY, and it is stated plainly.** `pets.ts:652` charges an obstacle
 *     keep-out of `max(width, depth) / 2`. At `wedge-15`'s own 0.137977 this bird
 *     measures 2.3664 deep and charges **1.1832**, past the fox's 1.15, which is
 *     the pack's own worst and the number the island already copes with. 0.2943
 *     is **`wedge-03`'s own measured burial — the deepest of the bank's seven
 *     tails** — and at that depth the animal measures 2.1971 and charges
 *     **1.0986**, inside the fox. The number is the pack's; only the reason for
 *     reaching past this shape's own is ours.
 *
 *   - **THE COAT IS §4's SECOND WAY, USED UPSIDE DOWN.** A wild green budgie is
 *     YELLOW above and GREEN below — yellow head and face, yellow-ground barred
 *     mantle and wings, green breast, belly and flanks. That is a level boundary,
 *     which is exactly what `Paint.patch` draws and the only marking on this
 *     animal the mechanism can say exactly. So the hull's BASE is the yellow and
 *     the patch paints the GREEN below it, which is the inverse of every belly
 *     line shipped so far and is the same mechanism unchanged. **8/16 is the
 *     hull's own equator and the pack's own measured mammal line** (§7: the only
 *     point on the 1/16 grid inside the tiger's zone), and it lands at world
 *     y = 0.80625 — over the bill's centre (0.718036) and under the eye cards'
 *     (0.89375), so the eye is in the mask and the breast is green, which is
 *     where a budgie's boundary is.
 *
 *   - **THE BARRING CANNOT BE DRAWN, and `animal-badger.ts` already proved why.**
 *     Its test measures every `card` shape in the bank and finds nothing longer
 *     than 0.44 and nothing thinner than 1:2.5, where a bar is 1:6 or worse — the
 *     pack has no stripe. `byBand` can only cut where Kenney already cut, and
 *     `box-03` has exactly one band. A patch is ONE level plane and a budgie's
 *     barring is twenty. So the wings carry the barring's own tone whole, dark
 *     against the yellow mantle, and the flag says what is missing.
 *
 *   - **IT FLAPS, and this is the first species to say `motion` at all.** Joe, 29
 *     July: *"the wings are currently animated. can that be done deterministically
 *     as well, or specified in the editor."* `motion.ts` is the answer and no
 *     species had used it; a bird with a wing is the species that should.
 *     `{ kind: 'flap', parts: ['wing'] }` takes the table's own measured defaults
 *     — 0.5 rad about z at 14 rad/s, the bee's and the parrot's own wingbeat off
 *     `pets.ts:74` — with nothing tuned. It moves no vertex and does not enter the
 *     geometry fingerprint (`motion.ts` keeps a second hash for that reason).
 *
 *   - **NO EARS**, which needs no defending on a bird, **and no nose** — the beak
 *     IS the nose and `cone-06` carries the pack's own `nose` role.
 *
 * ## THE PALETTE IS NEW AND NOBODY HAS SIGNED IT OFF
 *
 * `home-pets.ts` carried a colour WORD per cage bird under the old songbird kit
 * and nothing else, so the seven below are the first actual colours this species
 * has ever had and every one is **UNREVIEWED**. One deliberate departure: the old
 * header table at `home-pets.ts:101` says *blue* and the newer per-species line
 * at `home-pets.ts:194` says *"the only green one"*. Green is followed, because
 * it is the newer line and because it is the wild bird; the flag says so.
 *
 * **Flagged**, for the wing, the palette, the barring, the throat spots and the
 * height. Nothing else strained: 478 model vertices inside 405-1626, 592 triangles
 * inside 422-951, height 1.4312 on the floor, feet on y = 0, keep-out 1.0986
 * inside the fox's 1.15, every part joined at a face of this hull or at an anchor
 * solved off built geometry, one mass, **nothing authored and not one stretch of
 * any kind anywhere on the animal.**
 */
import { defineCreature } from '../creature'
import { LEG_ROW } from '../hulls'
import { PACK_PUPIL } from '../texture'

/** `box-03`'s own recorded centre, and where its side faces are. */
const HULL_CENTRE_Y = 0.80625
const HULL_SIDE_X = 0.625

/**
 * Half the wing buried, and it is SOLVED rather than picked.
 *
 * `box-06`'s tip reaches |z| = 0.456649; `box-03`'s flat side face reaches only
 * |z| = 0.312500 and the chamfer then falls away 1:1, so the tip stands over a
 * surface that has receded 0.144149 and §3's "nothing floats" makes that the
 * minimum burial — 0.471328 of the part's own 0.305836 thickness. The donor's own
 * 0.366259 is not enough. Snapped up to the pack's 1/16 grid, which is
 * `ridgeSpan`'s own discipline: 8/16. It leaves 0.152918 standing and buries
 * 0.152918, over §3's 0.125 floor for an embedded part.
 */
const WING_SINK = 0.5

/**
 * `wedge-03`'s own measured burial — the deepest of the bank's seven tails, and
 * the only number on this animal reached for because of the KEEP-OUT rather than
 * the anatomy.
 *
 * At `wedge-15`'s own 0.137977 this bird is 2.3664 deep and charges 1.1832
 * against the fox's 1.15 (`pets.ts:652`, `max(width, depth) / 2`). At the
 * beaver's it is 2.1971 and charges 1.0986.
 */
const TAIL_SINK = 0.2943

/** The pack's own flat-card plane — 0.010 proud of this hull's 0.625 front face. */
const CARD_Z = 0.635

/** `plate-16`'s own half-width. Both cheek stations are solved off it. */
const DOT = 0.113137 / 2

/**
 * The eye card's own lower edge (0.89375 - 0.400/2) less the dot's own half-width,
 * so the cheek patch's top edge touches the eye's bottom edge exactly.
 */
const CHEEK_Y = 0.69375 - DOT

/**
 * The front face's own flat reach (0.3125, measured off `box-03`) less that same
 * half-width, so the patch's outer edge lands on the flat face's own edge and not
 * one thousandth past it onto the chamfer. 0.0066 inboard of the eye's own x.
 */
const CHEEK_X = 0.3125 - DOT

export const BUDGIE_ASSEMBLY = defineCreature('animal-budgie', {
  /* NEW AND UNREVIEWED — the first colours this species has ever had. */
  palette: {
    coat: 0x5aa832,    // UNREVIEWED: budgie green — breast, belly, flanks, rump
    mask: 0xf2d94a,    // UNREVIEWED: the yellow head and the yellow mantle ground
    bar: 0x2a2a26,     // UNREVIEWED: the wings and the tail — the barring's own tone
    cere: 0x5f86d8,    // UNREVIEWED: the cere, the cheek patches, the tail flash
    limb: 0xc8c2cf,    // UNREVIEWED: the pale shanks, the bill, the eye's iris ring
    foot: 0x8a8494,    // UNREVIEWED: JT-044's second tone — the darker toes
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* No `part` line: the builder's default IS `box-03`, and `box-03` is the
   * parrot's and the chick's own shell — two of the pack's three birds. NOT
   * `box-21`: measured, that shell is this same cube with the fox's two EARS
   * fused on top, and the header says so at length.
   *
   * §4's second way, INVERTED: a wild green budgie is yellow above and green
   * below, which is a level boundary and the one marking on this animal the
   * mechanism can draw exactly. 8/16 is the hull's own equator and the pack's own
   * mammal line — world y 0.80625, over the bill's 0.718036 and under the eye
   * cards' 0.89375. */
  hull: {
    paint: { base: 'mask', patch: { below: 'coat', at: 0.5 } },
  },

  /* THE PACK'S OWN BIRD EYE, and the only ROUND card in it — 0.400 x 0.400,
   * radial, the chick's, the parrot's and the penguin's. The iris ring is band 3
   * and the pupil band 15, pre-split at Kenney's own cut. */
  eyes: { part: 'plate-08', paint: 'limb' },

  /* THE PARROT'S OWN BEAK, and a budgie is a parrot. Placed by the donor transfer
   * alone — joined at this hull's front face, sunk its own 0.360878, centre
   * recovered onto the bank's recorded z = 0.664911 and y = 0.718036, and exact
   * rather than inferred because the donor wears it on THIS shell. Band 15 is
   * measurably the UPPER mandible (mean y +0.0409 against band 13's -0.1221), so
   * painting it blue puts the CERE where a cere sits, for no geometry at all. A
   * separate cere pad was refused: there is no clear face between the bill's top
   * edge (0.918751) and the eye cards (0.69375 up). */
  snout: { part: 'cone-06', paint: { base: 'limb', byBand: { 15: 'cere' } } },

  /* THE LONGEST TAIL IN THE BANK — 1.0824 against 1.046587 and the parrot's fan
   * at 0.912191 — and the second thinnest, turned to point STRAIGHT BACK rather
   * than up. `axis: 'y', dir: 1` is the facing this spin lands on `z -1`, so the
   * sink still measures along the tail's own run. Joined at the HULL'S own centre
   * height, which is the only height at which its 0.555215 root fits inside the
   * 0.625 flat rear face — 0.035 to spare at each end. Band 5 is the lion's tuft,
   * which the spin carries to the rearmost quarter: a blue tail flash from
   * Kenney's own cut. Sunk the beaver's 0.2943 rather than the lion's 0.137977,
   * for the keep-out and for nothing else; see TAIL_SINK. */
  tail: {
    part: 'wedge-15',
    paint: { base: 'bar', byBand: { 5: 'cere' } },
    axis: 'y',
    dir: 1,
    spin: [{ axis: 'x', deg: -90 }],
    sink: TAIL_SINK,
    at: [0, HULL_CENTRE_Y, -0.625],
  },

  legs: false,
  extras: [
    /* TWO legs, on the row that never moves, at `box-01`'s own recorded x — the
     * narrowest station the pack demonstrates, which is the right one for the
     * slimmest of four birds — and on the hull's midline, the only station a
     * biped's legs can be at. JT-044's two-tone: 4/16 of the leg's own height is
     * the darker toe under the pale shank. */
    {
      name: 'leg-front',
      part: 'box-01',
      paint: { base: 'limb', patch: { below: 'foot', at: 0.25 } },
      kind: 'pair',
      sink: LEG_ROW.sink,
      at: [0.25, LEG_ROW.y, 0],
    },

    /* THE WING, and the reason to read this file. The bunny's own ear — the
     * longest small part in the bank at 0.913298 — turned so its long axis runs
     * fore-and-aft and its 0.305836 of thickness stands out from the flank, which
     * is what makes it read from the island's own downward camera where a flat
     * card would not. Two spins and an axis override, all three solved; the join
     * is the hull's own side face at the hull's own centre on the hull's own
     * midline; the sink is the depth the tip needs, snapped to the 1/16 grid. The
     * mirror is `box-07`, which is the pack's own left ear. */
    {
      name: 'wing',
      part: 'box-06',
      paint: 'bar',
      kind: 'pair',
      axis: 'z',
      dir: -1,
      spin: [{ axis: 'z', deg: -90 }, { axis: 'y', deg: -90 }],
      sink: WING_SINK,
      at: [HULL_SIDE_X, HULL_CENTRE_Y, 0],
    },

    /* THE WING BAR. The cow's, dog's and giraffe's flank card — zero thickness,
     * `x +1`, sunk 0 — so it lies flat on a flank-facing surface with no spin at
     * all. `on: 'wing'` solves the join off the wing's own built vertices and
     * gives it the pack's own 0.010 of daylight. */
    { name: 'wing-bar', part: 'plate-10', paint: 'mask', kind: 'pair', on: 'wing' },

    /* THE CHEEK PATCHES. The pig's nostril dot spent as a budgie's violet-blue
     * cheek — §3.1, a part's identity is its placement. Both stations solved: the
     * top edge on the eye card's own lower edge, the outer edge on the front
     * face's own flat reach. On the pack's card plane, 0.010 proud. */
    { name: 'cheek', part: 'plate-16', paint: 'cere', kind: 'pair',
      at: [CHEEK_X, CHEEK_Y, CARD_Z] },
  ],

  /* THE FIRST SPECIES TO SAY `motion`. Joe asked whether the wingbeat could be
   * declarative; `motion.ts` is the answer and a bird with a wing is the animal
   * that should spend it. The table's own measured defaults, nothing tuned. */
  motion: [{ kind: 'flap', parts: ['wing'] }],

  flag: 'THE WING IS A BUNNY\'S EAR, AND IT IS THE FIRST WING IN THE PROJECT — look at '
    + 'this one before the canary, the cockatiel and the lovebird copy it. The wing '
    + 'role occurs ZERO times in all 94 bank records, but that is OUR module and not '
    + 'the pack: tools/pets/parts-bank.ts:703 bakes nine roles and censuses the rest, '
    + 'and the census counts 10 wing instances in 6 distinct shapes from 5 donor '
    + 'species. Adding them is one entry in a Set and a re-run of npm run pets:parts, '
    + 'and that is your call, not a species\'. What is here instead is box-06, the '
    + 'bunny\'s ear — the longest small part in the bank (0.9133 against the koala '
    + 'ear\'s 0.7427) — spun so its long axis runs fore-and-aft down the flank and '
    + 'half buried, standing 0.153 proud. It is SOLID on purpose: the two cheap wings '
    + '(a plate-10 flank card, or a stretched bespoke-triangle-01, which JT-041 allows '
    + 'without a flag) are both ZERO THICKNESS and the island\'s camera looks DOWN, '
    + 'where a flat card is edge-on and gone. What it is NOT is pointed — box-06\'s '
    + 'taper is 0.849, a rounded lozenge rather than a primary feather. '
    + 'AND THIS BIRD CANNOT BE THE TALLEST OF THE FOUR, which home-pets.ts:194 asks '
    + 'for: box-21 is not a taller body. Measured off its own points, everything above '
    + 'its local y 0.4975 sits in TWO LUGS with nothing on the midline — it is this '
    + 'same 1.250 cube with the fox\'s EARS fused on, exactly as box-12 is a cube with '
    + 'the cow\'s, and a bird cannot wear it. Nine of the pack\'s ten hulls are 1.25 '
    + 'tall or less and the tenth (box-41) is bigger on all three axes, so every cage '
    + 'bird stands at 1.43125 and the height axis is gone. TWO THINGS FOLLOW AND BOTH '
    + 'ARE YOURS: box-21\'s two lugs are the nearest thing this bank has to a CREST, '
    + 'so it is the COCKATIEL\'s hull; and these four separate on tail, depth, colour '
    + 'and extras instead, which is what this one does. '
    + 'THE BLACK BARRING CANNOT BE DRAWN, and on a budgie that is half the animal — '
    + 'the fine black bars across the nape and the wings. animal-badger.ts measured '
    + 'every card in the bank for its own stripe and found nothing longer than 0.44 '
    + 'and nothing thinner than 1:2.5, where a bar is 1:6; byBand can only cut where '
    + 'Kenney already cut and box-03 has ONE band; a patch is one level plane and the '
    + 'barring is twenty. So the wings carry the barring\'s own tone whole. THE THROAT '
    + 'SPOTS ARE MISSING TOO, and that one is geometry rather than mechanism: the '
    + 'window between the bill\'s lower edge (y 0.5173) and the flat front face\'s own '
    + 'bottom (y 0.4938) is 0.0236 tall, and tucked under the bill either nostril dot '
    + 'stands clear of a face that has fallen away — 0.066 and 0.100. '
    + 'NEW PALETTE, UNREVIEWED — '
    + 'home-pets.ts only ever carried a colour WORD for this bird, and note it says '
    + 'blue at line 101 and green at line 194; green is followed, because it is the '
    + 'newer line and the wild bird. AND IT FLAPS: this is the first species in the '
    + 'project to declare `motion` at all, on motion.ts\'s own measured defaults, '
    + 'which is your question of 29 July answered in one line. Nothing was authored '
    + 'and nothing is stretched.',
})
