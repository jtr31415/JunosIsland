/**
 * The llama — the tall camelid, and the only animal in Farm whose whole design is
 * an argument with a NUMBER rather than with another species.
 *
 * ONE SPECIES, ONE FILE. The invariants every assembled species carries are
 * `assertAssembly`; this file is what only a llama can say.
 *
 * `animal-goose.ts` §3 built the machinery this animal runs on — `box-18`, the
 * elephant's TRUNK, stood on end with `axis: 'y', dir: 1` overriding its recorded
 * `z +1`, and `tube-06` worn `on: 'neck'` as a head. Read it first. **What is NOT
 * transferable is any of its arithmetic**, because a goose leans 60 degrees and a
 * llama does not, and the whole of §2 below is that difference priced out.
 *
 * ===========================================================================
 * ## 1. THE PROBLEM IS `animal-alpaca`, AND THERE ARE ONLY FOUR AXES
 * ===========================================================================
 *
 * `collections/farm.ts:75` states it: the two camelids are *"separated on height,
 * leg, face and fleece"* — all four, because roster §4 says they are one animal
 * to a child unless the difference is structural. `animal-alpaca.ts` was written
 * beside this file and takes the opposite pole on every one of them: `box-41`,
 * the stocky shell; no neck extra at all; a small round `box-02` button ear; the
 * pack's own leg row with no two-tone; and wool run all the way to the nose.
 *
 * So this animal takes: **`box-03` (the lean shell), the longest neck the ceiling
 * admits, an upright `tube-04` banana ear, a bare pale face on a fawn body, and
 * JT-044's two-tone leg.** Every one of those is stated below with the number
 * that forced it, and two of them are stated as REFUSALS, because two of the four
 * things the brief asked for turn out not to be buildable in this pack at all.
 *
 * `box-41` is refused for a second reason beyond the alpaca's holding it: it is
 * **262 triangles against `box-03`'s 60** (`animal-goose.ts` §5). A llama is the
 * lean camelid and the cube is the lean shell, so the separation is free here in
 * a way it was expensive for the goose.
 *
 * ===========================================================================
 * ## 2. THE CEILING GIVES 0.58875 ABOVE THE CROWN, AND THIS ANIMAL WANTS TO
 * ##    SPEND IT THREE TIMES
 * ===========================================================================
 *
 * This is the whole file. `PACK_HEIGHT_MAX` is **2.02** and `box-03`'s crown is
 * **1.43125**, which is also `HEIGHT_FLOOR` — a bare cube on the pack's own legs
 * already stands that tall. So everything this animal puts on top of its body
 * shares **0.58875 of headroom and no more**, and a llama asks for three things
 * out of it:
 *
 *       a raised HEAD        `tube-06` is 0.300 tall, so 0.150 of half-height
 *       a long NECK          whatever rise is left
 *       an upright EAR       `tube-04` is 0.61875 long
 *
 * **Two of those three fit and the third does not, and it is not close.** An ear
 * buried to §3's own 0.125 floor still stands `0.61875 - 0.125 = 0.49375` proud.
 * Put it on the head and the head's own half-height goes under it:
 *
 *       1.43125 + 0.150 + 0.49375  =  2.07500        OVER 2.02, by 0.055
 *
 * — and that is with a neck of **ZERO LENGTH**, the head sitting directly on the
 * crown. Every real neck makes it worse, one for one. Stretching the ear shorter
 * does not rescue it either: at `[1, 0.65, 1]` the shape is 0.402 long, 5/16
 * buries 0.125684 (barely over the floor) and 0.276504 stands, which leaves
 * `2.02 - 1.43125 - 0.150 - 0.276504 = 0.162246` of rise for the neck — 0.19 of neck
 * at this lean, a stub and not a neck.
 *
 * **So: NO LONG-NECKED ANIMAL IN THIS PACK CAN HAVE AN ERECT EAR ON ITS HEAD.**
 * It is the same class of finding as the eye in §4 and it has the same shape — a
 * pack constant, not a species' failure — and the resolution is the same one the
 * goose and the terrapin already shipped: **the feature moves down to the one
 * mass.** §3 is where the ear goes and why that is coherent rather than a
 * consolation.
 *
 * ### 2.1 THE LEAN, AND WHY IT IS 30 DEGREES AND NOT THE GOOSE'S 60
 *
 * Fix the height and the trade is exact. The animal's top is
 *
 *       H  =  1.43125  +  rise·cos(lean)  +  max( halfDepth·sin(lean), 0.150 )
 *
 * where `rise` is the neck standing clear of the crown, `halfDepth` is the neck's
 * own half-section and 0.150 is the head's half-height. **The second term is a
 * `max` and the goose never had to write it**: below about 45 degrees the leaned
 * neck's own top corner drops under the head sitting on it, so on a llama it is
 * the HEAD that sets the height and on a goose it was the NECK. That is the first
 * place the two animals' arithmetic parts company.
 *
 * **THE LEAN IS NOT FORCED HERE, AND THAT IS THE SECOND PLACE THE TWO ANIMALS
 * PART.** A goose at its own length measures 2.2626 upright and is over the
 * ceiling at every station down to 45 degrees — it has one legal pose. This
 * animal has a whole grid, and the test rebuilds it at all thirty-five cells of
 * it. Height, by lean and by sink, measured rather than argued:
 *
 *              2/16     3/16     4/16     5/16     6/16     7/16     8/16
 *       0    2.1263   2.0874   2.0485   2.0095   1.9706   1.9317   1.8927
 *       15   2.1078   2.0702   2.0325   1.9949   1.9573   1.9197   1.8821
 *       30   2.0533   2.0196   1.9859   1.9521   1.9184   1.8847   1.8566
 *       45   1.9667   1.9391   1.9116   1.8841   1.8566   1.8566   1.8566
 *       60   1.8603   1.8566   1.8566   1.8566   1.8566   1.8566   1.8566
 *
 * **1.8566 is a FLOOR and it is the EAR** — the same ear §2 would not let onto
 * the head. Once the neck ducks below it the animal's height stops changing, and
 * the bottom-right of that table is one number repeated. So the ear the ceiling
 * refused is what this animal cannot get shorter than.
 *
 * **A VERTICAL NECK IS BUILDABLE, and it is refused on the goose's own bar.** At
 * 5/16 upright measures 2.0095 and 15 degrees measures 1.9949 — both inside 2.02
 * — but their margins are **0.0105 and 0.0251**, and `animal-goose.ts` §3 refused
 * a pose at **0.0153** in as many words: *"0.0153 of margin on a number the
 * harness pins exactly is not something to ship."* Upright is tighter than the
 * number a sibling already refused. Buying the margin back means going deeper —
 * upright at 6/16 measures 1.9706 with 0.0494 to spare — and that is where the
 * bill arrives:
 *
 *       lean 0  at 6/16    H 1.9706   margin 0.0494   neck 0.389378   plan 0.000000
 *       lean 15 at 6/16    H 1.9573   margin 0.0627   neck 0.389378   plan 0.100778
 *       lean 30 at 5/16    H 1.9521   margin 0.0679   neck 0.428315   plan 0.214158
 *
 * **30 degrees dominates on everything except uprightness itself**: 10% more neck
 * standing clear, the best margin of the three, and **more than double the plan
 * projection**, which is the one that matters most because the island camera looks
 * DOWN (`animal-budgie.ts:55-58`) and what a child sees of a neck is its shadow on
 * the ground. A vertical neck shows exactly none of itself from above; it is a
 * post with a head on it. And 30 is exactly HALF the goose's forced 60, on the
 * same 15-degree grid, so the separation between this pack's two long-necked
 * animals is a number and not an impression — and it is a real llama's carriage,
 * 60 to 70 degrees above the horizontal.
 *
 * ### 2.2 THE LENGTH IS NOT STRETCHED, AND THAT IS THE FINDING
 *
 * The goose stretched `box-18` **1.75x** in y to get a neck long enough. This
 * animal stretches it **not at all in y**, and the reason is the `cos(lean)` in
 * the formula above: at 30 degrees a neck spends 0.866 of its length on height
 * where the goose's spends 0.500, so the ceiling caps a llama's neck at roughly
 * 0.58 of the goose's. `box-18` is 0.623004 tall on its own, and
 *
 *       5/16 buries 0.194689 and leaves 0.428315 standing
 *
 * which is already the most this lean can carry. **The trunk's own length
 * overshoots what an upright neck is allowed to be**, so the stretch that was the
 * goose's mechanism is not available here and the sink is the dial instead. Two
 * neighbouring stations, both measured:
 *
 *       4/16   buries 0.155751   0.467253 stands   H = 1.9859   0.034 of margin
 *       5/16   buries 0.194689   0.428315 stands   H = 1.9521   0.068 of margin
 *       6/16   buries 0.233627   0.389378 stands   H = 1.9184   0.102 of margin
 *
 * 6/16 throws away 0.034 of height for nothing. **4/16 is the interesting refusal
 * and it is refused for two reasons, neither of them the ceiling.** It halves the
 * margin for 9% more neck, which is the goose's own trade at twice the size. And
 * at 1.9859 it would stand **0.030 taller than `animal-goose.ts`, which was
 * committed yesterday with "the tallest animal in the collection" in its header**
 * — so it buys a sibling's prose being wrong, with 9% of neck that separates this
 * animal from nothing, since the alpaca it actually has to be told apart from is
 * a body-length shorter at either station. 5/16 buries **1.56x §3's own 0.125
 * floor**, leaves 0.0679 of headroom, and lands 0.0039 under the goose on purpose.
 *
 * ### 2.3 THE SINK ALSO HAS TO CLEAR THE LEANED ROOT, AND HERE IT IS FREE
 *
 * `animal-goose.ts` §3 generalised §3's nothing-floats to a leaned root: the root
 * face rides UP as it leans, so `sink · L >= halfDepth · tan(lean)`. At 60 degrees
 * that rule BOUND the goose and forced 6/16. At 30 degrees, with this neck's
 * half-section of 0.180715 (§2.4),
 *
 *       need  =  0.180715 · tan(30)  =  0.104336        against 5/16's 0.194689
 *
 * — 1.87x, and comfortably under §3's own flat floor of 0.125 as well. **So the
 * two rules swap places between the two animals: the lean rule binds a goose and
 * the flat floor binds a llama**, and 5/16 clears both by 1.87x and 1.56x. That
 * is the honest statement of why the number is not the goose's.
 *
 * ### 2.4 THE NECK IS SLIMMED ACROSS AND KEPT DEEP, AND THE CROWN IS WHY
 *
 * `stretch: [0.8, 1, 0.85]` — nothing in y, which §2.2 is about, and two
 * reductions in section. A stretch costs no geometry, so both are free.
 *
 * **0.8 in x is solved off the crown.** `box-03`'s flat crown is a 0.625 square
 * and this animal parks THREE roots on it: the neck's and both ears'. §3 puts the
 * ear roots at x 0.17385 to 0.45115 a side, so the neck may have `|x| < 0.17385`,
 * i.e. 0.34770 of width, and `box-18` is 0.345 wide. **It fits by 0.00270 — 0.00135
 * a side** — and a clearance that small between two parts that are meant to read
 * as separate things is a coincidence and not a design. 0.8 takes the neck to
 * 0.276 and opens the gap to **0.0359 a side, 26x the accidental one**, which is
 * the whole reason the number exists.
 *
 * **0.85 in z rather than 0.8 keeps the section DEEPER THAN IT IS WIDE.** The
 * shape's own ratio is `0.425211 / 0.345 = 1.232`; slimmed it is
 * `0.361429 / 0.276 = 1.309`. A neck's cross-section is an oval standing
 * fore-and-aft, and matching x and z would have made a square post.
 *
 * ### 2.5 WHERE IT JOINS, AND BOTH EDGES CHECKED THROUGH THE SHELL
 *
 * `[0, 1.43125, 0.1875]` — the flat crown, 3/16 forward of the midline, and the
 * z is bounded at both ends by the crown's own flat square. With the slimmed
 * half-depth of 0.180715 the root face's two corners land at
 * `NECK_Z + 0.059161` and `NECK_Z - 0.253851`, so
 *
 *       NECK_Z <= 0.253339    or the front corner leaves the flat crown
 *       NECK_Z >= -0.058649   or the rear corner does
 *
 * 4/16 is inside that window by **0.003339**, which is a third of the daylight
 * the pack gives a flat card and is not a thing to ship; 3/16 sits 0.0666 inside
 * it. **This is the mirror of the goose's own choice and worth saying so**: the
 * goose took the LOWEST station its root would fit on, to seat a swan-neck over
 * the shoulders; a llama's neck rises off the front of the withers, so this one
 * takes the HIGHEST station that fits, and both animals land on 3/16.
 *
 * It exits THROUGH the shell rather than standing on it, and both edges were
 * solved. The rear-upper edge leaves through the flat crown at **z = -0.021174**,
 * well inside 0.3125. The front-lower edge starts at (1.172288, 0.246662) and
 * crosses the front-top chamfer's plane `y + z = 1.74375` at
 * **(1.378205, 0.365545)** — z between 0.3125 and 0.625, so on that chamfer's
 * face, and |x| <= 0.138 inside its flat 0.3125.
 *
 * ===========================================================================
 * ## 3. THE EAR IS THE ELEPHANT'S FLAP TURNED EDGE-ON AND STOOD ON THE CROWN
 * ===========================================================================
 *
 * `tube-04` — 0.359219 x 0.61875 x 0.277301, **aspect 1.72, and the only shape in
 * the bank's twenty-three ears that is much taller than it is broad**
 * (`animal-bushbaby.ts` measured that and `animal-canary.ts` tabulated it;
 * `animal-sheep.ts` then declined it in as many words, *"that pair is the llama's
 * and the alpaca's"*). `box-06`, the bunny's 0.913 upright, is longer still and is
 * the DONKEY's and the MULE's — `animal-mule.ts` is committed and wears it — so it
 * is not available and would in any case be 0.79 proud, which §2 has already ruled
 * out twice over.
 *
 * Three overrides, each with its own reason:
 *
 *   1. **`axis: 'y', dir: 1`** overrides the shape's recorded `x +1`. The elephant
 *      hangs this flap off the SIDE of its head across its 0.359219; stood on end
 *      it runs along its 0.61875 instead and is a banana pointing up. That is the
 *      same override `animal-goose.ts` makes on the trunk, for the same reason.
 *   2. **`spin: [{ axis: 'y', deg: 90 }]` turns the blade edge-on**, so its
 *      0.277301 lies across x and its 0.359219 runs fore-and-aft. Both halves of
 *      that pay: across x it is the narrow view, which is what a llama's ear is
 *      from the front, and fore-and-aft it is the long curved profile, which is
 *      what it is from the side. It also buys the clearance §2.4 spends —
 *      unturned, the ear's inner edge sits at 0.13289 and is INSIDE the neck.
 *   3. **`sink: 5/16`** replaces the elephant's own 0.126087, which along this
 *      axis would bury only `0.126087 x 0.61875 = 0.078` — under §3's 0.125 floor,
 *      the same correction `animal-bushbaby.ts` had to make for the same shape.
 *      5/16 buries **0.193359** and leaves **0.425391** standing, tip at 1.856641.
 *
 * **The join is `[0.3125, 1.43125, 0.125]` and all three coordinates are solved.**
 *
 *   - **x = 0.3125 is the flat crown's own half-width**, so the root straddles the
 *     crown's edge: the inner 0.13865 on the flat cap, the outer 0.13865 over the
 *     top-side chamfer. The chamfer falls away 1:1, so a root buried 0.193359 stays
 *     embedded out to `0.3125 + 0.193359 = 0.505859`, and this root reaches
 *     **0.45115** — inside by 0.0547. At 4/16 the same corner would be inside by
 *     only 0.016, which is the second reason 4/16 is not taken. The horse's own
 *     0.2276 on this same family is refused here for a reason the horse does not
 *     have: it would put the ear's inner face **0.027 inside the neck**.
 *   - **z = 0.125 keeps the whole root off the front-top chamfer.** The ear's
 *     0.17961 of half-depth reaches 0.30461, which is inside the crown's flat
 *     0.3125 by 0.008. The horse's and the sheep's own 4/16 would reach 0.42961
 *     and put the ear's outer-front CORNER over `box-03`'s corner cut — the facet
 *     through `x + y + z = 1.25` — where the shell has receded to 1.17549 and the
 *     root face is at 1.237891, a float of **0.101**. Corner cuts are the one place
 *     on this shell where a root can leave the surface without leaving the
 *     bounding box, and this is where that bites.
 *   - **y = 1.43125 is the flat crown**, the same plane the neck is joined to.
 *
 * **AND THE PALETTE IS WHAT MAKES IT READ.** An ear rooted at the withers with the
 * head 0.42 in front of it is §2's compromise and it is not a comfortable one. The
 * fix is not geometry, it is the parti-colour: the ears are painted `pale`, the
 * SAME slot as the neck and the head and not the fawn slot of the body they
 * actually grow out of, so the eye groups them with the head. §6 is why a llama can
 * carry that particular lie honestly and a uniformly-coloured animal could not.
 * The lean is doing its half too, and it is measured: at the ear's own MID height
 * of 1.5472 the neck's centre-line stands at **z = 0.2544**, inside the ear's own
 * -0.0546 to 0.3046, so the two run side by side up the middle of their length; by
 * the ear's TIP at 1.8566 the neck has travelled forward to 0.4331 and the head is
 * at z 0.4017 to 0.6331. **So the ear tips finish 0.0955 below the head and just
 * behind it** — which, from the island's camera, is an ear beside a head and not an
 * ear on a shoulder.
 *
 * ===========================================================================
 * ## 4. THE EYE IS AT THE NECK'S ROOT, AND THAT IS RULE 5
 * ===========================================================================
 *
 * `EYE_CARD_Z` is 0.635 and `CreatureDef.eyes` has no `z` field — rule 5 made
 * unsayable — so an eye card is nailed to the body's front plate. **This animal's
 * head is at y 1.65 to 1.95 and z 0.40 to 0.63, which is 0.87 above the pack's eye
 * plane, so there is no placement at which an eye lands on it.** The eyes sit at
 * the neck's ROOT, which is exactly what `animal-terrapin.ts` shipped and Joe
 * passed, and what `animal-goose.ts` §4 shipped again a day ago. **It is not this
 * species' to fix and it is not being fixed here.**
 *
 * What is different from the goose is that there is nothing left to solve once
 * that is accepted. The goose is on `box-41`, whose front carries the tiger's
 * muzzle boss, and it had to find the one station at which `plate-08`'s disc is
 * tangent to the boss's corner. **`box-03` has no boss**: its front plate is flat
 * from 0.49375 to 1.11875, `plate-01`'s own recorded (0.2625, 0.933646) puts the
 * card at y 0.773542 to 1.093750 entirely inside it, and the card floats the
 * pack's own 0.010. So the eye here is a **pure donor transfer with no argument
 * attached** — the whole of §4 of the goose's file evaporates on the cube, which
 * is worth writing down for whoever picks the shell next.
 *
 * `plate-01` and not `plate-08`: the round disc is the pack's BIRD and primate
 * eye, and a camelid's eye is a long almond. It is also the pack's own default,
 * so taking it costs no argument.
 *
 * ===========================================================================
 * ## 5. THE LEG ROW CANNOT BE LOWERED — SO "LONGER-LEGGED" IS PAINT
 * ===========================================================================
 *
 * A llama is leggier than an alpaca and `CreatureDef.legs.y` looks like the way to
 * say it: Joe's ruling of 2 Aug made the row movable, `buildAssembly` re-grounds
 * the animal on whatever ends up lowest, and dropping the row by one grid step
 * would buy 0.0625 of shank and 0.0625 of height. **It is refused, and the
 * arithmetic is exact and general.**
 *
 * `box-01` is 0.30625 tall and `LEG_ROW.sink` is its own measured 0.408163, so a
 * leg on the pack's row is buried
 *
 *       0.30625 x 0.408163  =  0.125000
 *
 * into the hull — **§3's nothing-floats floor, to six decimals, with no slack at
 * all.** Lowering the row moves the join down without changing the burial, so
 * one 1/16 step leaves 0.0625 inside the body, half the floor, and even 1/32
 * leaves 0.09375. **There is no step down that keeps the leg embedded**, and that
 * is not a fact about llamas — it is why `hulls.ts` says the row never moves and
 * why all twenty-four originals sit on it.
 *
 * So the leg separation is JT-044's two-tone, and it is the sheep's own range read
 * from the other end. `animal-sheep.ts` §4 derived it once for all four fleece
 * animals: `box-01` carries exactly two lines, the foot's bevel at 0.204082 of its
 * height and the hull's belly at 0.591837, and with `patchUv`'s half-texel clamp
 * **k in 4..9 is the whole usable range**, both ends forced. This animal takes
 * **4/16, the bottom of it**: the drawn boundary lands 0.07713 above the sole, so
 * **0.10412 of the 0.18125 a child can see is bare shank — 57% of the visible
 * leg** — and the rest is the foot.
 *
 * **The slot is `pad` and not `hoof`, and that is a fact about the animal.** Farm's
 * five hooved species spend this identical line on a horn hoof; a camelid has no
 * hoof at all. It walks on two soft leathery toe-pads, which is one of the few
 * things that is genuinely true of llamas and of nothing else in this collection,
 * so the same 4/16 boundary is painted the same way and named the right thing.
 *
 * And it is the opposite marking from the sibling on the same part: the alpaca
 * declines the two-tone entirely and lets its wool run to the ground, which reads
 * SHORT. Same tool, opposite end, and between them they are the leg axis
 * `farm.ts:75` asked for. **It is a marking this animal has**, which is
 * `animal-ferret.ts`'s bar and the one that matters.
 *
 * ===========================================================================
 * ## 6. THE TAIL, THE MUZZLE, AND THE PALETTE
 * ===========================================================================
 *
 *   - **TAIL = `box-18` A SECOND TIME**, turned around instead of stood up — the
 *     elephant's trunk under Kenney's wrong name, `spin: [{ axis: 'y', deg: 180 }]`
 *     so its `z +1` becomes a `z -1`. `animal-sheep.ts` §6 solved the height on this
 *     exact shell and it is taken unchanged: the rear plate is 0.625 tall and this
 *     shape is 0.623004, so the whole of its root lands on flat geometry only while
 *     its centre sits inside a window **0.001996 wide**, and the midpoint of that
 *     window is `box-03`'s own recorded 0.80625. It reaches 0.425211 clear.
 *
 *     **"Short, held UP" was asked for and is refused, by that same window.** There
 *     is exactly one height this root fits at, so a raised tail cannot be had by
 *     moving it; and tilting it costs a burial the shape does not have — `box-18`
 *     is the bank's only tail with `sunkFractionMean` of **exactly 0.000000**, and a
 *     20-degree tilt needs `(0.623004 / 2) · tan(20) = 0.11337` of it before §3's
 *     0.125 floor is even reached. The chamfer idiom does not rescue it either:
 *     `chamfer: true` would put the root on the rear-top chamfer facet, which is
 *     0.441942 across the slope, and this root face is **0.623004** across it and
 *     overhangs by 0.181 whatever is done with the burial. A short tail carried
 *     level is what the pack can say.
 *
 *   - **MUZZLE = `box-14`, THE DEER'S NOSE-TIP**, the pack's small ungulate nose and
 *     the sheep's own, hung `on: 'head'` as a pure donor transfer. It is 0.228845
 *     across a 0.532 head — **43%** — and it stands its own 0.126119 clear, because
 *     its recorded sink is 0. It is what stops `tube-06` reading as a knob: the head
 *     is a barrel and this gives it an end. **`tube-06` is deliberately UNSPUN and
 *     level** on a neck that leans 30 degrees, which lands its root face bisected by
 *     the neck's tip plane exactly as `animal-goose.ts` §6 describes — a step, not a
 *     float — and which is what a llama does, because a llama carries its head level
 *     on an inclined neck and that is most of the haughtiness.
 *
 *   - **THE PALETTE IS NEW AND NOBODY HAS SIGNED IT OFF.** `farm.ts` carries no
 *     colour for this species. It is a PARTI-COLOUR and that is the point: llamas
 *     commonly are, alpacas are commonly one shade, and hue is the axis a child
 *     reads before shape. `coat` is a warm mid fawn and is the body, the tail and
 *     nothing else. `pale` is a cream three steps up and carries the neck, the head
 *     and — §3 — the EARS, which is the slot doing structural work rather than
 *     decoration. `limb` is the leg, a shade under the coat so the standing column
 *     separates from the barrel; it exists as its own slot because
 *     `assembly.ts:487-501` gives a slot exactly one painted boundary and the leg
 *     needs its own cell. `pad` is the dark toe. `muzzle` is darker still and is one
 *     small part. The eye cards take `pale`, so the sclera is the face's own cream —
 *     which on a fawn body is the pale-eyed, down-the-nose look this animal is
 *     supposed to have.
 *
 * **Flagged**, for the two things the ceiling refuses and for the eye rule 5 will
 * not let onto the head. Nothing authored, no `byBand` anywhere, the hull unscaled,
 * the leg row the pack's own, feet on y = 0, and no number in this file that is not
 * a measurement off the bank or off the shell.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/* ===================================================================== *
 * `box-03`, world, at its recorded offset (0, 0.80625, 0). Its flat faces
 * ARE its bounding box — unlike `box-41`, nothing here lies.
 * ===================================================================== */

/** The flat crown, and `HEIGHT_FLOOR`: a bare cube on the pack's legs is this tall. */
const HULL_CROWN_Y = 1.43125
/** How far the flat crown reaches in x and in z before the chamfers start. */
const CROWN_FLAT_HALF = 0.3125
/** The flat rear plate. `animal-sheep.ts` §6 solved the tail's join height on it. */
const REAR_PLATE_Z = -0.625

/* -------------------------------------------------------------- the neck --- */

/**
 * 30 degrees off vertical, and it is exactly HALF the goose's forced 60 — same
 * 15-degree grid, so the separation between this pack's two long-necked animals
 * is a number. It is also a real llama's carriage (60-70 degrees above the
 * horizontal) and it keeps 0.2129 of ground projection for a camera that looks
 * DOWN, where 15 degrees would show 0.0988. See §2.1 for the whole family.
 */
const NECK_LEAN = 30

/**
 * 5/16, and the DIAL IS THE SINK because the stretch is not available (§2.2): at
 * this lean a neck spends 0.866 of its length on height, so `box-18`'s own
 * 0.623004 already overshoots what the ceiling allows. It buries 0.194689 and
 * leaves 0.428315 standing, for H = 1.9521 and 0.068 of margin. 4/16 leaves
 * 0.467253 and 0.034 of margin, which is the goose's own refusal at twice the
 * size; 6/16 throws away 0.034 of the height this species exists for.
 *
 * It clears both floors at once, which is the other half of §2.3: §3's flat
 * nothing-floats floor by 1.56x, and the goose's leaned-root rule —
 * `sink · L >= halfDepth · tan(lean)` = 0.104336 — by 1.87x. On a goose that
 * second rule binds and the first does not; here it is the other way round.
 */
const NECK_SINK = 0.3125

/**
 * 3/16 forward of the midline, and it is the HIGHEST station on the pack's grid
 * that keeps the whole root face on the crown's flat square: the root's corners
 * land at `NECK_Z + 0.059161` and `NECK_Z - 0.253851`, so the window is
 * -0.058649 to 0.253339 and 4/16 sits 0.003339 inside it — a third of the
 * daylight the pack gives a flat card. The goose took the LOWEST station its own
 * root would fit on, for a swan-neck over the shoulders; a llama's rises off the
 * front of the withers. Both land on 3/16.
 */
const NECK_Z = 0.1875

/* --------------------------------------------------------------- the ear --- */

/**
 * The flat crown's own half-width. The ear's root straddles it — 0.13865 on the
 * flat cap and 0.13865 over the top-side chamfer, which falls away 1:1, so a root
 * buried 0.193359 stays embedded out to 0.505859 and this one reaches 0.45115.
 * The horse's 0.2276 would put the ear's inner face 0.027 inside the neck.
 */
const EAR_X = CROWN_FLAT_HALF

/**
 * 2/16, and it is the corner cut that sets it. Turned edge-on the ear is 0.17961
 * deep, so at 2/16 it reaches z = 0.30461 and stays inside the crown's flat
 * 0.3125. At the horse's and the sheep's own 4/16 it would reach 0.42961 and put
 * its outer-front corner over `box-03`'s corner facet (`x + y + z = 1.25`), where
 * the shell has receded to 1.17549 against a root face at 1.237891 — a float of
 * 0.101.
 */
const EAR_Z = 0.125

/**
 * 5/16, replacing the elephant's own 0.126087, which along this axis would bury
 * 0.078 — under §3's 0.125 floor, the same correction `animal-bushbaby.ts` made
 * for this shape. It buries 0.193359 and leaves 0.425391 standing, tip at
 * 1.856641, which is under the head's own top and so costs no height at all.
 */
const EAR_SINK = 0.3125

/* -------------------------------------------------------------- the tail --- */

/**
 * `animal-sheep.ts` §6's solve, unchanged: the flat rear plate is 0.625 tall and
 * `box-18` is 0.623004, so the whole of its root lands on flat geometry only
 * while its centre is inside a window 0.001996 wide, and this is the midpoint —
 * `box-03`'s own recorded hull centre, recovered from a solve that never read it.
 */
const TAIL_JOIN_Y = 0.80625

export const LLAMA_ASSEMBLY = defineCreature('animal-llama', {
  /* NEW AND UNREVIEWED — farm.ts carries no colour for this species at all. A
   * PARTI-COLOUR, deliberately: llamas commonly are and alpacas commonly are not,
   * and hue is what a child reads before shape. See §6. */
  palette: {
    coat: 0xc0864a,    // UNREVIEWED: warm mid fawn — the body and the tail
    pale: 0xeee3cb,    // UNREVIEWED: cream — the neck, the head and (§3) the EARS
    limb: 0xb07c46,    // UNREVIEWED: the leg, a shade under the coat
    pad: 0x40362e,     // UNREVIEWED: the soft toe-pad a camelid has instead of a hoof
    muzzle: 0x372f29,  // UNREVIEWED: darker still, one small part
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* THE LEAN SHELL. `box-03` at 60 triangles against `box-41`'s 262 — the alpaca
   * holds the stocky one and a llama is the lean camelid, so this separation is
   * free here where the goose paid 202 triangles for the opposite one. Painted ONE
   * FLAT SLOT: no belly line, no band cut, no marking. */
  hull: { part: 'box-03', paint: 'coat' },

  /* A PURE DONOR TRANSFER, and §4 is why there is nothing to solve: `box-03` has
   * no muzzle boss, so the card's own recorded station lands entirely inside the
   * flat front plate at the pack's own 0.010 of daylight. The almond and not the
   * disc — a camelid's eye is long. Rule 5 nails z and this animal's head is 0.87
   * above it; the eyes are at the neck's ROOT, as the terrapin's and the goose's
   * are, and that is flagged rather than fixed. */
  eyes: { part: 'plate-01', paint: 'pale' },

  /* THE NECK: the elephant's TRUNK stood on end, `animal-goose.ts` §3's machinery
   * with none of its arithmetic. NOT stretched in y — at this lean the shape's own
   * length already overshoots the ceiling, so the sink is the dial. Slimmed 0.8
   * across so it clears the ear roots by 0.0359 a side instead of by 0.00135, and
   * 0.85 deep so the section stays deeper than it is wide. §2 carries every
   * number. */
  snout: {
    part: 'box-18',
    name: 'neck',
    paint: 'pale',
    axis: 'y',
    dir: 1,
    stretch: [0.8, 1, 0.85],
    spin: [{ axis: 'x', deg: NECK_LEAN }],
    sink: NECK_SINK,
    at: [0, HULL_CROWN_Y, NECK_Z],
  },

  /* THE HEAD: the fox's muzzle, the terrapin's and the goose's own choice for this
   * job, as a pure donor transfer onto the neck's tip. Deliberately UNSPUN — a
   * llama carries its head level on an inclined neck, which is most of the
   * haughtiness, and the level root face on a leaned tip lands as a step rather
   * than a float. */
  nose: { part: 'tube-06', name: 'head', on: 'neck', paint: 'pale' },

  /* THE BANANA EAR: the elephant's side flap, stood on end and turned edge-on.
   * The bank's ONLY ear much taller than it is broad (1.72), and it is on the
   * CROWN and not on the head because §2 proves no long-necked animal in this pack
   * can carry an erect ear up there — 1.43125 + 0.150 + 0.49375 = 2.075 with a
   * neck of zero length. Painted `pale` with the head, which is what makes it
   * read. */
  ears: {
    part: 'tube-04',
    paint: 'pale',
    axis: 'y',
    dir: 1,
    spin: [{ axis: 'y', deg: 90 }],
    sink: EAR_SINK,
    at: [EAR_X, HULL_CROWN_Y, EAR_Z],
  },

  /* THE TRUNK A SECOND TIME, turned around instead of stood up, at the sheep's own
   * solved height — the only one at which its whole root lands on the flat rear
   * plate. Short and level: §6 refuses "held up" with the 0.001996 window, the
   * shape's zero sink and the chamfer facet's 0.441942. */
  tail: {
    part: 'box-18',
    paint: 'coat',
    spin: [{ axis: 'y', deg: 180 }],
    at: [0, TAIL_JOIN_Y, REAR_PLATE_Z],
  },

  /* JT-044, at the BOTTOM of the sheep's own 4..9 range, and the slot is `pad`
   * because a camelid has no hoof — it walks on two soft toe-pads, which is one of
   * the few things true of llamas and of nothing else in Farm. 4/16 draws 0.07713
   * above the sole and leaves 57% of the visible leg as bare shank; the alpaca
   * declines the tool entirely and reads short. §5 is why the ROW itself cannot be
   * lowered to say the same thing with geometry. */
  legs: { paint: { base: 'limb', patch: { below: 'pad', at: 0.25 } } },

  /* The deer's nose-tip, the pack's small ungulate nose, on the head's own front
   * by pure transfer. 43% of the head's width and 0.126119 clear, which is what
   * stops `tube-06` reading as a knob. */
  extras: [
    { name: 'muzzle', part: 'box-14', paint: 'muzzle', on: 'head' },
  ],

  /* Alert and still. The ears flick and nothing else moves — a llama stands and
   * looks at you, which is the whole expression. */
  motion: [{ kind: 'twitch', parts: ['ear'] }],

  flag: 'TWO THINGS THIS ANIMAL WAS ASKED FOR CANNOT BE BUILT IN THIS PACK AND BOTH '
    + 'REFUSALS ARE ARITHMETIC, NOT TASTE. (1) NO LONG-NECKED ANIMAL CAN HAVE AN '
    + 'ERECT EAR ON ITS HEAD. PACK_HEIGHT_MAX is 2.02 and box-03\'s crown is 1.43125, '
    + 'so everything above the body shares 0.58875. tube-06 as a head costs 0.150 of '
    + 'half-height and tube-04 buried to rule 3\'s own 0.125 floor still stands '
    + '0.49375 proud: 1.43125 + 0.150 + 0.49375 = 2.075, over the ceiling by 0.055 '
    + 'WITH A NECK OF ZERO LENGTH, and every real neck makes it worse one for one. '
    + 'Stretching the ear to 0.65x leaves 0.162246 of rise for the neck, which is a '
    + 'stub. So the ears are on the CROWN, flanking the neck\'s root, and the '
    + 'PALETTE is what ties them to the head — they are painted the same cream as the '
    + 'neck and the head, not the fawn of the body they grow out of. (2) THE LEG ROW '
    + 'CANNOT BE LOWERED, so "leggier than an alpaca" is paint and not geometry. '
    + 'box-01 is 0.30625 tall and LEG_ROW.sink is 0.408163, so a leg on the pack\'s '
    + 'row is buried 0.30625 x 0.408163 = 0.125000 — rule 3\'s nothing-floats floor to '
    + 'six decimals, with no slack at all. One 1/16 step down leaves 0.0625 inside '
    + 'the body, half the floor; even 1/32 leaves 0.09375. There is no step that '
    + 'keeps the leg embedded. (3) THE EYE CANNOT BE ON THE HEAD — EYE_CARD_Z is '
    + '0.635, CreatureDef.eyes has no z, and this head is at y 1.65-1.95, 0.87 above '
    + 'the eye plane. The eyes sit at the neck\'s root, exactly as animal-terrapin.ts '
    + 'and animal-goose.ts ship it. Not fixed here; it is your call. THE NECK LEANS '
    + '30 DEGREES, EXACTLY HALF THE GOOSE\'S FORCED 60, and unlike the goose it is '
    + 'NOT STRETCHED: at 30 degrees a neck spends 0.866 of its length on height '
    + 'against the goose\'s 0.500, so box-18\'s own 0.623004 already overshoots and '
    + 'the SINK is the dial instead. 5/16 buries 0.194689, leaves 0.428315 standing '
    + 'and measures 1.9521 with 0.0679 of margin. A VERTICAL NECK IS BUILDABLE AND IS '
    + 'REFUSED ON THE GOOSE\'S OWN BAR: at the same sink, upright measures 2.0095 and '
    + '15 degrees measures 1.9949, margins of 0.0105 and 0.0251 against the 0.0153 '
    + 'animal-goose.ts refused in as many words. Buying the margin back means sinking '
    + 'to 6/16, where upright measures 1.9706 but the neck drops to 0.389378 and its '
    + 'GROUND PROJECTION drops to zero — and the island camera looks down, so a '
    + 'vertical neck shows a child none of itself. 30 degrees shows 0.214158, more '
    + 'than double what 15 degrees would, with 10% more neck and the best margin of '
    + 'the three. 4/16 at 30 degrees measures 1.9859 and is refused twice: it halves '
    + 'the margin, and it would stand 0.030 taller than the goose, which shipped '
    + 'yesterday saying it is the tallest animal in the collection — for 9% of neck '
    + 'that separates this animal from nothing, since the alpaca is a body-length '
    + 'shorter either way. 1.8566 is a FLOOR on this animal and it is the EAR: below '
    + '45 degrees of lean the height stops changing because the neck has ducked under '
    + 'the ear the ceiling would not let onto the head. The two nothing-floats rules '
    + 'SWAP PLACES between the two animals: the leaned-root rule '
    + '(sink x L >= halfDepth x tan(lean) = 0.104336) binds a goose at 60 and the '
    + 'flat 0.125 floor binds a llama at 30; 5/16 clears them by 1.87x and 1.56x. '
    + 'THE NECK IS SLIMMED 0.8 ACROSS because box-03\'s 0.625 crown has to carry '
    + 'THREE roots — the neck\'s and both ears\' — and unslimmed they clear by '
    + '0.00135 a side, which is a coincidence and not a design; 0.8 makes it 0.0359. '
    + 'NEW PALETTE, UNREVIEWED — farm.ts carried no colour for this species. It is a '
    + 'PARTI-COLOUR on purpose: llamas commonly are and alpacas commonly are not, and '
    + 'hue is what a child reads before shape.',
})
