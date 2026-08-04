/**
 * The lovebird — a peach-faced lovebird, Home Pets' FOURTH and LAST cage bird,
 * and the one that closes the collection's four-bird problem.
 *
 * ONE SPECIES, ONE FILE. `register.ts` says why the one appended line in
 * `index.ts` is the whole of the wiring.
 *
 * `animal-budgie.ts` was built first and is the file to read before this one: it
 * establishes the WING, it establishes that `box-21` is not a taller body, and it
 * establishes that height cannot separate these four. All three of those findings
 * are used here unchanged. What this file adds is the other end of the group —
 * and, because it is the last of the four, **the whole separation table, in one
 * paragraph, so that a builder who opens any one of these four files can find the
 * picture from this one.**
 *
 * ===========================================================================
 * ## 1. HOW THE FOUR CAGE BIRDS ENDED UP SEPARATED
 * ===========================================================================
 *
 * `collections/home-pets.ts:88-126` is the brief and it is honoured, with one
 * column of it half deleted by a measurement rather than by a preference. It asked
 * for six axes — height, tail, wing, extras, hue, proportion — and promised four
 * distinct values down each column. **The height LADDER it wrote is unbuildable
 * and the budgie proved it**: it runs 1.24 / 1.34 / 1.42 / 1.52 and three of those
 * four are under `HEIGHT_FLOOR` = 1.43125, which a bare cube on standard legs
 * already measures. Nine of the pack's ten hulls are 1.25 tall or less, the tenth
 * is bigger on all three axes rather than taller, and `HullDef.stretch` is `never`,
 * so a cage bird can only ever be made TALLER and never shorter. The table below is
 * how the four actually came out, and every row of it is now built and measured
 * rather than predicted:
 *
 *     bird        h       hull     tail       what a child names it by
 *     ---------   ------  -------  ---------  --------------------------------
 *     budgie      1.4312  box-03   wedge-15   the LONGEST tail in the bank
 *                                  (lion)     (1.0824), the slimmest, yellow
 *                                             over green, a wing bar and blue
 *                                             cheeks; keep-out 1.0986, the
 *                                             deepest of the four
 *     canary      1.4312  box-39   box-38     the SMALLEST and roundest — the
 *                         (penguin)(parrot)   penguin's shell, a folded fan
 *                                             tail, plain lemon-yellow, and
 *                                             exactly the pack's vertex floor
 *     cockatiel   1.7066  box-03   wedge-18   the CREST, and it is `cone-01`
 *                                  (tiger)    standing above the body rather
 *                                             than a hull — grey and yellow
 *                                             with one orange cheek dot, and
 *                                             the TALLEST of the four
 *     LOVEBIRD    1.4812  box-41   wedge-03   the STOCKIEST and BIG-HEADED —
 *                                  (beaver)   the SHORTEST-reaching tail in the
 *                                             bank, the heaviest bill, green
 *                                             with a PEACH face and a blue rump
 *
 * **Four tails, four hulls-or-crests, four coats, four silhouettes** — the budgie
 * and the cockatiel share `box-03` and are separated by that crest and by 0.275 of
 * height, and the height axis came back the only way it could, upward. The wing is
 * deliberately the SAME part on all four — `box-06` at `sink: 0.5`, the budgie's
 * own finding — because four birds on one album page should read as one family and
 * separate on everything else; and the eye card `plate-08`, the pack's own round
 * bird eye, is shared for the same reason.
 *
 * **One honest collision, and it is Joe's to settle.** `home-pets.ts:101` gives the
 * budgie *blue* and this bird *green*; `home-pets.ts:194` calls the budgie *"the
 * only green one"*. The budgie followed line 194 and flagged it. A peach-faced
 * lovebird is green in life and green in the collection's own table, so this bird
 * is green too — **and the four are therefore green, green, yellow and grey rather
 * than four hues.** Line 101's own answer is that the BUDGIE is the blue one. The
 * flag says so where he reads it. Nothing else in the two builds collides: this
 * one's green is a purer grass green under a peach face and over a blue rump, and
 * the budgie's is a yellow-based green under a yellow mask.
 *
 * ===========================================================================
 * ## 2. `box-41` IS `box-03` WITH ITS EDGES FILLED OUT — measured, and it is
 *    the reason this bird can be stocky AND wear the budgie's own numbers
 * ===========================================================================
 *
 * This is the only species in the pack that is *bigger* than the cube, and
 * `animal-guinea-pig.ts` already found half of what that means: its recorded front
 * face of 0.725 is a MUZZLE fused into the shell, 0.400 across on the midline, and
 * *"the broad flat face behind it is at z = 0.575 local, which is world z = 0.625:
 * the same front face as the seven usual hulls"*. That file also found the sides:
 * x = 0.675 occurs only on **two small pads**, the tiger's shoulder and haunch, and
 * the flank everywhere else is at the cube's own 0.625.
 *
 * **Measured over all six faces, that is the whole shell.** `box-41`'s six flat
 * plates are `box-03`'s six flat plates, at identical WORLD coordinates and
 * identical 0.625-square extents, to the digit:
 *
 *     face      box-41 (world)                         box-03 (world)
 *     -------   ------------------------------------   ----------------------
 *     flank     x  0.625, y 0.49375-1.11875, |z| 0.3125   same
 *     front     z  0.625, y 0.49375-1.11875, |x| 0.3125   same
 *     rear      z -0.625, y 0.49375-1.11875, |x| 0.3125   same
 *     top       y  1.43125, |x| 0.3125, |z| 0.3125        same
 *     bottom    y  0.18125, |x| 0.3125, |z| 0.3125        same
 *
 * Every one of the tiger's extra 0.100 is OUTSIDE those plates: a chamfer pushed
 * out 0.050 all round, a muzzle boss forward to z = 0.725, and four pads rising to
 * x = 0.675 and y = 1.48125. **So `box-41` is not a different animal's body. It is
 * the same cube with its edges filled out** — which is exactly, and unusually
 * literally, what "stocky" means. A lovebird is a budgie's length and half again
 * its weight; this shell is the budgie's shell with the weight added at the
 * corners, and there is nothing else in the bank that says that.
 *
 * Three consequences, and they are why this build is short:
 *
 *   1. **Every join the budgie solved transfers to this hull unchanged and
 *      EXACTLY.** The wing's sink of 8/16 was solved against a flat side face
 *      reaching |z| = 0.3125 and a 1:1 chamfer; this hull's flat side face reaches
 *      |z| = 0.3125, so the same number is right for the same reason. It is not
 *      argued: the test measures the built wing's inner corners against this
 *      shell's own triangles and gets **0.0473 of embedding, the budgie's own
 *      figure on a different hull** — because the surface binding both of them is
 *      the same plate.
 *   2. **The bounding box lies about three faces and not one**, and the third is
 *      new here. `frame.top` is 1.48125 and the flat crown is at 1.43125: the
 *      0.050 between them is two TRANSVERSE PADS over the shoulders and haunches,
 *      at z 0.200-0.250 and -0.250 to -0.200, running the full |x| <= 0.3276. The
 *      crown is therefore only planar in a strip about |z| <= 0.05 wide. That
 *      killed the rump card; see §6.
 *   3. **The height is 1.48125 and it is not a claim to be the tallest.** It is
 *      0.050 over the floor and every bit of it is those two pads — the crown a
 *      child sees is at 1.43125, the cube's own. The cockatiel's crest takes it to
 *      1.7066 and the budgie and the canary sit on the floor, so this bird is
 *      third of four by height and that is not an axis it is asking for.
 *
 * ===========================================================================
 * ## 3. THE PEACH FACE — the badger's problem, and the one hull it does not have
 * ===========================================================================
 *
 * A peach-faced lovebird is named for a marking on the FRONT OF ITS HEAD, and
 * `animal-badger.ts` is the shipped proof that this is normally unsayable:
 * `Paint.patch` takes one number and that number is a HEIGHT, so it paints a level
 * boundary with no z term and *"cannot even say the front of this is white"*; rule
 * 3 leaves no separate head to paint; `byBand` can only cut where Kenney already
 * cut. On `box-03` that is the end of the argument — the cube has ONE band.
 *
 * **`box-41` has three, and Kenney cut one of them exactly where a lovebird's peach
 * is.** Band 3 is 37 triangles and it is measured here, triangle by triangle:
 *
 *     31 of 37   the MUZZLE BOSS — z 0.575 to 0.675 local (world 0.625-0.725),
 *                |x| <= 0.200, y -0.3375 to +0.0625: the whole fleshy block the
 *                bill sits on, and the face immediately around it
 *      3 of 37   the CHIN — on the front plate itself, below the boss
 *      2 of 37   the THROAT — the lower-front chamfer, rising to the chin
 *      1 of 37   the BREAST — the front of the underside
 *
 * That run — muzzle, chin, throat, breast-front, on the midline, |x| never past
 * 0.200 — **is a peach-faced lovebird's peach bib**, and it arrives as one
 * `byBand` entry with no geometry at all. It is the tiger's own pale chin-and-chest,
 * spent as a face; §3.1's rule that a part's identity is its placement, applied to a
 * BAND for the first time.
 *
 * **What it does not reach, said plainly rather than hidden.** A real peach-faced
 * lovebird carries the peach up over the forehead and the crown and back across the
 * cheeks to behind the eye. Band 3 stops at the boss, so the cheeks and the crown
 * stay green: this is a peach MUZZLE-AND-BIB, not a peach head. The forehead gets
 * one `plate-16` blaze (§5) and nothing gets the cheeks — the two cards wide enough
 * to cross a brow, `plate-03` (0.2366) and `plate-13` (0.2192), both reach past the
 * eye cards' own inner edge at x = 0.0625 and would z-fight two coplanar
 * zero-thickness quads at `EYE_CARD_Z`. Also honest: the last two triangles of the
 * band run down the belly's midline, and a lovebird's belly is green. The strip is
 * a quarter of the body's width, on the underside, and the island's camera looks
 * DOWN. The flag says all of it.
 *
 * ===========================================================================
 * ## 4. THE TAIL IS THE SHORTEST-REACHING IN THE BANK, AND IT IS NOT THE STUB
 * ===========================================================================
 *
 * The collection asks this bird for a `short/tiny` tail and its own per-species
 * line calls it *"the stocky short-tailed cage bird"*. The obvious answer is
 * `box-18`, which `animal-badger.ts` measured as **the bank's only STUB** — and it
 * is spoken for twice over: it is the badger's, the vole's and the mouse's, and
 * `home-pets.ts` promises it to the HAMSTER (*"a Syrian hamster's tail is a nub"*),
 * whose whole separation from five sibling rodents it is. `box-38`, the parrot's
 * fan, is the canary's `fan/folded` and is already worn by the degu, the pony and
 * the nightjar.
 *
 * **So the seven were measured on the number that actually decides how long a tail
 * LOOKS, which is reach after its own burial** — `size[2] x (1 - sunkFractionMean)`,
 * how far it carries clear of the body once it is buried the way its donor buried
 * it. That is not the same ranking as raw size, and the result is the finding this
 * species is built on:
 *
 *     wedge-03  0.4153   the beaver's paddle    <- the SHORTEST reach in the bank
 *     box-18    0.4252   the elephant's trunk      the "stub", 2.4% longer
 *     wedge-07  0.4669   the cat's and monkey's
 *     box-38    0.4689   the parrot's fan
 *     wedge-15  0.4786   the lion's (the budgie's)
 *     wedge-18  0.4786   the tiger's
 *     box-23    0.7488   the fox's brush
 *
 * **The bank's stub is not its shortest tail.** `box-18` is buried 0.000 by its own
 * donor and every millimetre of its 0.4252 stands out; `wedge-03` buries 0.294300,
 * **the deepest of the seven**, and carries 0.4153. The badger's measurement (that
 * `box-18` has the least raw z-extent) is right and this is a different question
 * asked of the same seven records.
 *
 * And the shape is right as well as short. A peach-faced lovebird's tail is BROAD,
 * BLUNT and squared off, not a whip: `wedge-03` is 0.726 across against
 * `wedge-15`'s 0.280 and `wedge-07`/`wedge-18`'s 0.200, so it is **2.6x the width
 * of the budgie's tail at 87% of its reach** — the exact opposite end of §7's own
 * "thickness, not length, is the axis that separates the seven". It also costs 92
 * triangles against those three at 212, which is what pays for a 262-triangle hull.
 *
 * **Its height is the one number this species chooses, and it is the REAR PLATE's
 * own centre.** `animal-badger.ts` and `animal-budgie.ts` both make this move and
 * this is the third time, forced harder than either: at the beaver's own recorded
 * y = 1.050919 the root's lower corners sit **0.1195 OUTSIDE this shell** — it
 * floats, quietly, which is §3's exact failure. At **y = 0.80625**, the centre of
 * the flat rear plate (and `box-03`'s own recorded centre, and NOT this hull's
 * recorded 0.83125), the deepest buried plane is **0.0783 inside the shell at its
 * worst corner**. The root is 0.862 tall and the plate is 0.625, so its corners do
 * emerge through the chamfer rather than through the flat face — but that is the
 * BEAVER's own arrangement on its own hull, where this shape is likewise wider and
 * taller than the face it joins, and it is not something introduced here.
 *
 * ===========================================================================
 * ## 5. Every other number, and where it came from
 * ===========================================================================
 *
 *   - **THE BILL IS `cone-06`, THE PARROT'S OWN BEAK, AND IT IS SAID IN ONE WORD
 *     BECAUSE THE HULL SAYS THE REST.** A lovebird's bill is the largest and most
 *     strongly hooked of these four relative to its head — a stubby powerful
 *     parrot's bill on a big blunt face — and the budgie already established the
 *     part. Nothing is said about its placement here either, so it is a pure donor
 *     transfer against THIS hull's front face; and this hull's front face is the
 *     muzzle boss at z = **0.725**, not the plate at 0.625.
 *
 *     **That is worth 0.100 of bill and it costs nothing.** The bill's tip lands at
 *     z = 0.90835 against the budgie's 0.80835, and it stands on a 0.400-wide
 *     fleshy block that stands 0.100 proud of the face — where the budgie's bill
 *     emerges from a flat plate at a root only 0.2557 across. Measured from the
 *     same plane on both birds, the bill assembly reaches **0.283 here against
 *     0.183 there, 1.55x**, and is 0.400 wide at its base against 0.2557. There is
 *     no stretch and nothing invented: the tiger's muzzle is exactly `cone-06`'s
 *     own 0.400 wide, and it is doing the job a parrot's cere and bill-base do.
 *     The test checks the whole buried rim against this shell's own triangles.
 *
 *     `pets:creature` marks it **`sunk 0.103 THIN`**, the budgie's own print for
 *     the same part at the same fraction, and `animal-nightjar.ts` gives the
 *     argument: 0.360878 is one measured value over one donor and deepening it to
 *     clear a threshold would be discarding a measurement to satisfy a warning.
 *
 *     **The bill is painted FLAT, and the budgie's cere trick is deliberately not
 *     copied.** That file paints `cone-06`'s band 15 — measurably the upper
 *     mandible — blue, because a budgie's cere is its signature. A peach-faced
 *     lovebird has no coloured cere at all: its bill is one pale horn colour from
 *     base to tip and the peach runs straight up to it. So the band is left alone,
 *     which is one more separation between the two greenest birds for one word
 *     omitted.
 *
 *   - **THE FOREHEAD BLAZE IS `plate-16`, SINGLE, ON THE MIDLINE, AND BOTH ITS
 *     COORDINATES ARE SOLVED.** The forehead of a peach-faced lovebird is the
 *     reddest part of it, a blaze above the bill between the eyes. `plate-16` is
 *     the pig's nostril dot, 0.113137 square, which `animal-budgie.ts` spends as a
 *     cheek patch — §3.1 again. **y = 0.975319 is the bill's own top edge
 *     (0.718036 + 0.401429 / 2 = 0.918751) plus the dot's own half-height**, so its
 *     lower edge touches the bill exactly. **x = 0 is forced**: at 0.0566 of
 *     half-width it is the only marking card in the bank that fits between the eye
 *     cards' own inner edges at x = 0.0625 without overlapping them, and two
 *     coplanar zero-thickness quads at `EYE_CARD_Z` z-fight. z = 0.635 is the
 *     pack's own card plane, 0.010 proud of this hull's front plate — the same
 *     0.010 the eye cards get, because that plate is `box-03`'s.
 *
 *     It is SMALL — 0.113 on a 1.350 head — and that is stated rather than hidden.
 *     It is as large as this bank can put on a forehead.
 *
 *   - **THE WING IS THE BUDGIE'S, UNCHANGED, AND IT IS MEANT TO BE.** `box-06`,
 *     the bunny's ear, the longest small part in the bank at 0.913298, spun
 *     `[{z,-90},{y,-90}]` with `axis: 'z', dir: -1` so its length runs fore-and-aft
 *     and its 0.305836 of thickness stands out from the flank, sunk 8/16 and joined
 *     at [0.625, 0.80625, 0]. Every one of those numbers is solved in
 *     `animal-budgie.ts` and every one of them is still exactly right here, because
 *     §2 above says this hull's flank plate IS that hull's flank plate. **The wing
 *     is a shared idiom and not a separator**; it is SOLID rather than a flat card
 *     for the reason that file measures, which is that the island's camera looks
 *     DOWN and `plate-10`, `plate-11` and `bespoke-triangle-01` are all exactly
 *     zero thickness.
 *
 *     **It is painted `mantle` rather than carrying a bar.** A peach-faced
 *     lovebird's wing is a slightly deeper, duller green than its breast and has no
 *     bar on it at all; band 15 of this hull is the back and the upper flanks, so
 *     painting the wing from the same slot makes the folded wing continuous with
 *     the mantle it lies on. The budgie's `plate-10` wing bar is that bird's and is
 *     not taken.
 *
 *   - **TWO LEGS, AT THE OPPOSITE STATION FROM THE BUDGIE'S.** `legs: false` and
 *     one mirrored `box-01` pair in `extras`, on `LEG_ROW`'s own y = 0.18125 and
 *     sink = 0.408163, which put the feet on y = 0 exactly. **x = 0.4375 is a
 *     solved bound and not a taste**: `box-01` is 0.375 across, so at 0.4375 each
 *     leg's outer face lands on 0.625 — flush with this shell's own flank PLATE and
 *     not one thousandth past it. `animal-kiwi.ts` solved the same number on
 *     `box-03` and it carries over for the same reason §2 gives. The budgie stands
 *     at 0.25, `box-01`'s own recorded offset and the narrowest station the pack
 *     demonstrates, because it is the slimmest of the four; this is the stockiest
 *     and it stands at the widest. **z = 0 is the BOTTOM PLATE's own centre**, which
 *     is `box-03`'s and not this hull's recorded 0.05 — a biped stands under its own
 *     footprint. JT-044's two-tone is `{ below: 'foot', at: 0.25 }`, 4/16 on the
 *     pack's grid, so the bottom quarter of each shank is the darker toe.
 *
 *   - **THE EYE IS `plate-08`, THE PACK'S OWN ROUND BIRD EYE, PAINTED DARK.**
 *     0.400 x 0.400, `radial`, donated by the chick, the parrot, the penguin, the
 *     fish and the monkey. The budgie takes the same card and paints its band 3
 *     pale for a budgie's white iris ring; this one paints it from the MANTLE slot,
 *     so the card reads as one dark bead — `animal-salamander.ts`'s and
 *     `animal-nightjar.ts`'s idiom. That is not decoration: **the peach-faced
 *     lovebird is one of the lovebirds WITHOUT an eye-ring**, which is the single
 *     feature that separates it from Fischer's and the masked lovebird in every
 *     field guide, and a pale ring here would say the wrong species.
 *
 *     On this hull the card sits 0.010 proud of the 0.625 front plate exactly as it
 *     does on `box-03`, and its outer edge overhangs that plate onto the chamfer.
 *     `animal-guinea-pig.ts` pins that for this shell and `hulls.ts` makes the same
 *     argument for the lion's 0.135: `EYE_CARD_Z` is absolute and is not ours to
 *     correct.
 *
 *   - **THE BLUE RUMP IS THE TAIL, AND IT IS ONE STEP BACK FROM WHERE THE BIRD
 *     WEARS IT.** A peach-faced lovebird's rump and upper tail coverts are a
 *     brilliant cobalt, and the rump is a region of the BODY. `wedge-03` carries a
 *     single band, so it takes one flat colour, and painting it blue puts the blue
 *     at the back of the animal immediately behind where it belongs — the tail
 *     buries 0.173 into the rump and what stands proud is 0.415 of broad blue wedge.
 *     A card on the crown was the alternative and it is refused in §6. The real
 *     bird's tail feathers are green with a red and black bar, which is a stripe and
 *     is unsayable for `animal-badger.ts`'s measured reason; the flag says so.
 *
 *   - **NO PAINTED BELLY LINE.** §4's second way is free and it is declined, which
 *     is `animal-mole.ts`'s and `animal-nightjar.ts`'s argument arriving here from a
 *     third direction: a peach-faced lovebird is the same green from throat to vent
 *     and has no level boundary anywhere on it. Its ONE boundary is the face, which
 *     is a z-region, and §3 is how that is drawn instead. The budgie uses the patch
 *     and this one does not, which is one more axis between them.
 *
 *   - **NO EARS**, which needs no defending on a bird, **and no nose** — the bill IS
 *     the nose and `cone-06` carries the pack's own `nose` role.
 *
 *   - **IT FLAPS.** `{ kind: 'flap', parts: ['wing'] }` on `motion.ts`'s own
 *     measured defaults, which `animal-budgie.ts` spent first and which all four
 *     cage birds should carry. It moves no vertex and does not enter the geometry
 *     fingerprint.
 *
 * ===========================================================================
 * ## 6. CONSIDERED AND REFUSED, each with the measurement that refused it
 * ===========================================================================
 *
 *   - **A RUMP CARD ON THE CROWN.** `animal-nightjar.ts` puts `plate-10` on the
 *     BACK — `spin: [{ axis: 'z', deg: 90 }]`, at y = 1.44125 — precisely because
 *     the island's camera looks down, and a blue patch on the rump seen from above
 *     is the strongest read this bird could have. **It does not work on this hull.**
 *     Ray-cast straight down, `box-41`'s crown is 1.43125 on the midline, 1.44643 at
 *     |z| = 0.10, and **1.48125 at |z| = 0.20 to 0.25** — the two transverse pads of
 *     §2. A card at the nightjar's own 1.44125 is 0.010 proud at z = 0 and BURIED
 *     everywhere from |z| = 0.07 outward, and `plate-10` spun is 0.2529 long. The
 *     shortest card in the bank, `plate-13`, is 0.100 long and clears by 0.0025,
 *     which is inside the bank's own four-decimal storage. So there is no back card
 *     on this animal, and the blue goes on the tail.
 *
 *   - **A COLLAR.** `home-pets.ts:104` gives this bird `collar` in its extras
 *     column. Two reasons it is not here. It is not the animal: a peach-faced
 *     lovebird has no collar, and the collared lovebirds are Fischer's, the masked
 *     and the black-cheeked, which this is not. And the bank cannot draw one at this
 *     size: its five `band` shapes are 1.335 to 1.650 across, and on a 1.350-wide
 *     hull `box-04` (1.335) and `box-35` (1.343) are NARROWER than the body and
 *     would vanish inside it, while `box-19` (1.404) and `box-29` (1.650) stand
 *     0.027 to 0.150 proud and read as a lion's ruff. **What the collection was
 *     asking for is here as a colour boundary instead** — band 3's bib ends where a
 *     lovebird's peach ends — which is the honest version of the same sentence.
 *
 *   - **`box-21`.** Refused for this bird for the budgie's own measured reason and
 *     recorded again so it is not helpfully added back: everything above its local
 *     y = +0.4975 sits in two lugs at |x| between 0.218 and 0.454 with nothing on
 *     the midline, and a bird cannot wear ears. `animal-budgie.ts` predicted it
 *     would end up the COCKATIEL's, because those lugs are the nearest thing this
 *     bank has to a crest; **that is not what happened** — the cockatiel was built
 *     on `box-03` with a `cone-01` crest standing above the shell, which reaches
 *     1.7066 where `box-21` would have reached 1.686 and does not put ears on a
 *     bird either. So `box-21` is worn by nobody in this collection, and the
 *     prediction is corrected here rather than left where the next builder would
 *     find it.
 *
 *   - **A WING BAR.** `plate-10` on the wing's own outer face is the budgie's, it
 *     works, and it is not taken: a peach-faced lovebird's wing is plain.
 *
 *   - **STRETCHING THE BILL.** JT-043 sanctions clever sizing and `stretch` is safe
 *     on a snout, so a uniformly larger `cone-06` was the obvious way to say
 *     "biggest beak of the four". It is not here because it is not needed — the
 *     hull's own muzzle boss buys 1.55x of forward reach and 1.56x of base width for
 *     nothing — and because Joe flagged non-uniform stretch on three animals on
 *     2 August and this build carries **no stretch of any kind anywhere.**
 *
 * ## THE PALETTE IS NEW AND NOBODY HAS SIGNED IT OFF
 *
 * `home-pets.ts` carried a colour WORD per cage bird under the old songbird kit and
 * nothing else, so the seven below are the first actual colours this species has
 * ever had and every one is **UNREVIEWED**.
 *
 * **Flagged**, for the palette, for the peach face's reach, for the two greens, for
 * the tail bar and for the blue being on the tail rather than the rump. Nothing else
 * strained: height 1.4812 inside 1.43-2.02, feet on y = 0, keep-out 0.974 inside the
 * fox's 1.15 and well inside the budgie's 1.0986, every part joined at a plate of
 * this hull measured off its own vertices, one mass, **nothing authored and not one
 * stretch of any kind anywhere on the animal.**
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/*
 * THE SOLVED CONSTANTS WERE REMOVED HERE ON 4 AUGUST. The editor's push writes
 * the object literal only and carries the rest of the file over untouched
 * (`push.mjs`) — which is what protects these derivations — but it inlines the
 * VALUES, so every constant that fed the literal is left declared and unread and
 * `tsc --noEmit` fails the build on it. Nine species arrived that way at once.
 *
 * The reasoning, kept because the numbers are still in the definition:
 *
 *   PLATE_CENTRE_Y 0.80625   the world centre of `box-41`'s flat front, rear and
 *                            flank plates — and it is `box-03`'s own recorded
 *                            centre, NOT this hull's recorded 0.83125. Measured:
 *                            all three plates span y 0.49375 to 1.11875, exactly
 *                            as the cube's do. The tiger's shell is drawn 0.025
 *                            higher and 0.050 further forward in its bounding
 *                            box, and every bit of that is in the chamfer, the
 *                            muzzle boss and the four pads. A part joining a
 *                            plate wants the plate's centre.
 *   FLANK_X        0.625     `box-41`'s flat flank plane (its bounding half-width
 *                            is 0.675 — two pads)
 *   REAR_Z        -0.625     its rear plate, at `box-03`'s rear face to the digit
 *   WING_SINK      0.5       `animal-budgie.ts`'s solve used unchanged: `box-06`'s
 *                            tip reaches |z| = 0.456649 where this flank plate
 *                            reaches only 0.312500, so the donor's own 0.366259
 *                            is not enough and 8/16 is the pack's grid snapped up
 *   LEG_X          0.4375    each leg's outer face lands flush on 0.625
 *   CARD_Z         0.635     the pack's flat-card plane, 0.010 proud of 0.625
 *   BLAZE_Y        0.975320  the bill's top edge plus the dot's half-height, so
 *                            the dot's LOWER edge sits exactly on the bill
 */

export const LOVEBIRD_ASSEMBLY = defineCreature('animal-lovebird', {
  palette: {
    coat: 0x3fa14d,
    mantle: 0x2c7538,
    face: 0xf9f46c,
    rump: 0x2a5cc0,
    limb: 0xe0d3b4,
    foot: 0x9a8f78,
    pupil: PACK_PUPIL,  // the pack's own measured pupil; see texture.ts
    eye: 0xe15151,
  },

  hull: { part: 'box-41', paint: { base: 'coat', byBand: { 3: 'face', 15: 'mantle' } } },
  legs: false,
  eyes: { part: 'plate-08', paint: 'eye' },
  tail: {
    part: 'wedge-03',
    paint: 'rump',
    at: [0, 0.525, -0.8],
    spin: [{ axis: 'x', deg: -90 }],
  },
  snout: { part: 'cone-06', paint: 'limb', stretch: [0.7, 0.7, 0.7], at: [0, 0.6625, 0.7] },
  extras: [
    {
      name: 'leg-front',
      part: 'box-01',
      paint: { base: 'limb', patch: { below: 'foot', at: 0.25 } },
      kind: 'pair',
      sink: 0.408163,
      at: [0.4375, 0.18125, 0],
    },
    {
      name: 'wing',
      part: 'wedge-19',
      paint: 'mantle',
      kind: 'pair',
      axis: 'z',
      dir: -1,
      spin: [
        { axis: 'z', deg: -90 },
        { axis: 'y', deg: -90 },
        { axis: 'x', deg: 90 },
        { axis: 'y', deg: -90 },
        { axis: 'z', deg: -90 },
        { axis: 'z', deg: -90 },
        { axis: 'z', deg: -180 },
        { axis: 'x', deg: 180 },
        { axis: 'z', deg: 180 },
        { axis: 'z', deg: 180 },
      ],
      sink: 0.5,
      at: [0.9125, 0.8125, 0],
    },
  ],
  motion: [{ kind: 'flap', parts: ['wing'] }],
  flag: 'THE PEACH FACE IS HALF SAYABLE, AND THIS IS THE FIRST TIME ANY OF IT HAS BEEN. '
    + 'animal-badger.ts is the shipped proof that a marking on the FRONT of a head is '
    + 'normally unsayable — Paint.patch takes one number and that number is a HEIGHT, '
    + 'rule 3 leaves no separate head, and byBand can only cut where Kenney already '
    + 'cut, which on box-03 is one band. box-41 has three, and band 3 is the tiger\'s '
    + 'pale chin: measured triangle by triangle, 31 of its 37 are the MUZZLE BOSS and '
    + 'the other six run down the chin, throat and breast-front on the midline, |x| '
    + 'never past 0.200. Painted peach that is a lovebird\'s bib, for one byBand entry '
    + 'and no geometry. WHAT IT DOES NOT REACH: the CHEEKS and the CROWN, which on a '
    + 'real peach-faced lovebird are peach too and here stay green. The forehead gets '
    + 'one plate-16 blaze, 0.113 on a 1.350 head, and that is as large as this bank can '
    + 'put there — the two cards wide enough to cross a brow, plate-03 (0.2366) and '
    + 'plate-13 (0.2192), both reach past the eye cards\' own inner edge at x 0.0625 and '
    + 'would z-fight two coplanar zero-thickness quads. And the last two triangles of '
    + 'band 3 run down the BELLY midline, where a lovebird is green; the strip is a '
    + 'quarter of the body\'s width, on the underside, and the camera looks down. THE '
    + 'BLUE RUMP IS ON THE TAIL, one step back from where the bird wears it. The rump '
    + 'is a region of the BODY and no band or card can reach it: a crown card was tried '
    + 'and refused, because box-41\'s back is not flat — ray-cast down, the crown is '
    + '1.43125 on the midline and 1.48125 over two transverse pads at |z| 0.20-0.25, so '
    + 'animal-nightjar.ts\'s back-card idiom buries everywhere past |z| 0.07. AND THE '
    + 'TAIL\'S OWN RED-AND-BLACK BAR CANNOT BE DRAWN, for the badger\'s measured reason: '
    + 'nothing in the bank is a stripe, and wedge-03 carries a single band so it takes '
    + 'one flat colour. TWO OF THE FOUR CAGE BIRDS ARE NOW GREEN, and that is your call '
    + 'rather than a species\'. home-pets.ts:101 gives the budgie BLUE and this bird '
    + 'GREEN; home-pets.ts:194 calls the budgie "the only green one". The budgie '
    + 'followed 194 and flagged it. A peach-faced lovebird is green in life and green '
    + 'in the collection\'s own table, so it is green here — which leaves the four as '
    + 'green, green, yellow and grey. Line 101\'s own answer is that the BUDGIE is the '
    + 'blue one, and moving it is one word in that file. NEW PALETTE, UNREVIEWED — '
    + 'home-pets.ts only ever carried a colour word for this bird, so these seven are '
    + 'the first colours it has ever had. WORTH YOUR EYE ON THE HULL: box-41 is '
    + 'measurably box-03 WITH ITS EDGES FILLED OUT — all six of its flat plates are the '
    + 'cube\'s six flat plates at identical world coordinates, and the whole of its '
    + 'extra 0.100 is a fatter chamfer, a muzzle boss and four pads. That is why this '
    + 'bird can be the stocky one AND wear the budgie\'s own solved wing numbers '
    + 'unchanged, and it is why the bill is the heaviest of the four for no stretch at '
    + 'all: the tiger\'s muzzle boss is 0.400 across, exactly cone-06\'s own width, so '
    + 'the parrot\'s beak stands on a fleshy block 0.100 proud of the face and reaches '
    + '0.283 against the budgie\'s 0.183. THE COLLECTION\'S "collar" IS NOT HERE: a '
    + 'peach-faced lovebird has none (the collared ones are Fischer\'s and the masked), '
    + 'and the bank\'s five band shapes are 1.335-1.650 across, so on a 1.350 hull two '
    + 'of them vanish inside the body and two read as a lion\'s ruff. Nothing was '
    + 'authored and nothing is stretched.',
})
