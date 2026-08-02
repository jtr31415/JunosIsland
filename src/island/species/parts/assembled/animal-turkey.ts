/**
 * The turkey — Farm's biggest, darkest galliform, and **the only one with a
 * fanned tail**. `collections/farm.ts:152` says exactly that and it is the whole
 * brief.
 *
 * **Read `animal-chicken.ts` first.** It is the exemplar all five galliforms are
 * cut from and this file does not re-litigate any of it: the WING is its
 * `box-06` solid-flank idiom at `sink: 0.5` (nine birds, one wing, argued in its
 * §3); the FOOT is JT-044's `{ below, at: 0.25 }` with the bevel derivation in
 * its §5; the EYE is `plate-08`, the pack's one round card; the BILL is
 * `tube-02`, the chick's and the penguin's. Four of this animal's eight parts
 * are inherited whole and the reasons live over there.
 *
 * `animal-sheep.ts` is the other file to have open: it is the standing survey of
 * `box-41` and it is where **band 3 as a painted face** was worked out.
 *
 * What is NEW here is four things, in the order they matter:
 *
 * ===========================================================================
 * ## 1. THE FAN. It stands VERTICAL, and every number is forced
 * ===========================================================================
 *
 * `box-38` is the parrot's fan and it was left unspent for this bird by name —
 * `animal-chicken.ts` §4 says so in writing. It is worn by exactly two other
 * animals and by neither of them like this: `animal-canary.ts:439` wears it
 * UNFLIPPED and unspun as a *"fan/folded"* tail lying back off the rump, and
 * `animal-pony.ts` wears it FLIPPED 180 degrees on z as a horse's hanging
 * switch, falling from y 0.206554 to 1.118754. This bird spins the same 48
 * triangles **+30 degrees on x** and they stand from **0.649806 to 1.587694**.
 * Same shape, three different animals, and nothing stretched on any of them.
 *
 * **+30 IS NOT A TASTE, IT IS THE SHAPE'S OWN ANGLE SUBTRACTED FROM VERTICAL.**
 * `box-38`'s root-to-tip axis, measured off its own points — the root quad's
 * centre to the tip vertex — is `(0, 0.866025, -0.500000)`, i.e. **60.000
 * degrees above horizontal**. A fan is not a fan when it lies back at 60
 * degrees; it is a fan when it is held up. 60 + 30 = 90, so **`FAN_SPIN` = 30 is
 * the unique spin on the x axis that stands the part's own long axis exactly
 * vertical.** No other value is derivable and none was tried for looks.
 *
 * **THE SPIN BREAKS THE RECORDED BURIAL, AND THE ARITHMETIC IS THE PROOF.** Worn
 * flat, `box-38` joins by its ROOT — a 0.170 x 0.200 quad square-on to the
 * attachment — and its recorded `sunkFractionMean` 0.269738 buries 0.173226 of
 * that root in the rear face. Stood upright, that root quad faces DOWNWARD and
 * can no longer meet a vertical rear plate at all. At the recorded burial the
 * fan's frontmost point lands at z = **-0.653014** against this shell's rear
 * plate at **-0.625000**: it hangs **0.028014 clear of the body and floats.**
 * That is the number that forces a new burial rather than a preference for one.
 *
 * On the pack's own 1/16 grid:
 *
 *       5/16 = 0.312500   front face -0.678   floats 0.053
 *       6/16 = 0.375000   front face -0.594   the FIRST notch that touches, 0.031 in
 *       7/16 = 0.437500   front face -0.560   0.065 in
 *       8/16 = 0.500000   front face -0.525   0.100 in — the plate BISECTS the slab
 *
 * **`FAN_SINK` = 8/16 and it is the only one of the four that says something.**
 * `shift = -s.lo - sink x extent` is `0.321100 - 0.500000 x 0.642200 = 0.000000`,
 * so **the fan's centre lands exactly ON its join point** — the same clean
 * landing `animal-chicken.ts` §2 gets for its comb, and for the same reason: the
 * part is symmetric about its own centre along the facing. The rear plate then
 * cuts the fan's 0.200 of thickness in half, 0.100049 of it inside the shell and
 * 0.100033 proud, so the join is a PLANE THROUGH the fan rather than a wall it
 * leans on. It is also the same 8/16 the wing takes, which is the whole burial
 * budget of this bird said once.
 *
 * **WHERE IT SITS: the rear plate's own TOP CORNER, and that is the highest
 * station there is.** `box-41`'s flat rear plate is z = -0.625 across x +/-0.3125
 * and y **0.49375 to 1.11875** — `box-03`'s plate at `box-03`'s coordinates,
 * §2. `REAR_PLATE_TOP_Y` = 1.11875 is its upper edge. The fan's centre goes
 * there, which puts the whole of its lower half against the plate and stands its
 * upper half clear above the shell.
 *
 * What that buys, all measured off the built silhouette:
 *
 *       join y    fan spans          top vs crown 1.48125   backed by the plate
 *       0.80625   0.337 .. 1.275     -0.206056              82.19%
 *       0.96269   0.494 .. 1.432     -0.049612              71.00%
 *       1.05000   0.581 .. 1.519     +0.037694              56.13%
 *       1.11875   0.650 .. 1.588     +0.106444              45.54%   <- this bird
 *       1.20000   0.731 .. 1.669     +0.187694              34.10%
 *
 * The top three rows are refusals with a number attached: **at the canary's and
 * the chicken's own tail height, 0.80625, the fan tops out 0.206056 BELOW this
 * hull's crown and never breaks the animal's silhouette at all** — from the
 * album's front-three-quarter it would not exist. 1.11875 is the last row that
 * is still a station on the shell rather than a point in the air above it, and
 * 45.54% is under half only because a fan is narrow at the root and wide at the
 * top; by height the plate backs the whole of the lower 0.468944 of it.
 *
 * **THE CEILING DOES NOT BIND AND THE CONTACT DOES.** `PACK_HEIGHT_MAX` is 2.02
 * and this animal is 1.5877, so there is 0.432 of headroom — the goose's problem
 * is not this one's. If Joe wants more fan over the back, `REAR_PLATE_TOP_Y` is
 * the single dial and the table above is what each notch costs in join.
 *
 * **THERE IS ONE FAN AND A SECOND IS GEOMETRICALLY IMPOSSIBLE.** `box-38` is
 * **0.625879 across** and the flat rear plate is **0.625000 across**: the part is
 * 0.000879 WIDER than the whole plate it joins to. There is no x at which a
 * second copy has any plate under it, so the choice of one is made by the shell
 * and not by the triangle budget (which has 307 spare).
 *
 * **AND NOTHING IS STRETCHED.** A 1.3x on the fan is the obvious way to make it
 * bigger and it is exactly what Joe flagged on three animals on 2 August. The
 * fan is already the widest tail in the bank at 0.625879; the answer to "bigger"
 * here was the burial and the station, both of which are recoveries.
 *
 * ===========================================================================
 * ## 2. `box-41`, AND THE THREE WING COORDINATES RE-DERIVED
 * ===========================================================================
 *
 * `animal-chicken.ts` §6 stayed on `box-03` and named `box-41` as the turkey's,
 * on both counts it separates on — the one hull bigger than a hen's, and the
 * only shell with more than one band to paint. Both are spent here.
 *
 * **The trap, and it is real.** `box-41`'s recorded offset is
 * `(0, 0.83125, 0.05)` and **that is not where any of its plates are.** The
 * shell is `box-03` with material added asymmetrically — a muzzle boss 0.100
 * further forward, crown pads 0.050 higher, flank pads 0.050 wider — so its
 * BOUNDING BOX centre drifted up 0.025 and forward 0.050 while its flat plates
 * did not move at all. Measured off its own 454 points:
 *
 *       flank PLATE   x +/-0.625   y 0.49375..1.11875 (mid 0.80625)   z +/-0.3125 (mid 0)
 *       rear  PLATE   z  -0.625    y 0.49375..1.11875 (mid 0.80625)   x +/-0.3125
 *       front PLATE   z  +0.625    y 0.49375..1.11875                 x +/-0.3125
 *       sole          y  0.18125,  0.625 across
 *       flank PADS    x +/-0.675   y 0.86035..1.13385                 z +/-0.2575
 *       muzzle BOSS   z  +0.725    y 0.49375..0.89375                 x +/-0.200
 *       crown PADS    y  1.48125   z 0.1383..0.2575 and -0.2575..-0.1383
 *
 * So the wing's three join coordinates re-derive to **0.625 / 0.80625 / 0.000 —
 * the chicken's own numbers, exactly** — and the danger was never the line, it
 * was reusing a constant called `HULL_CENTRE_Y`. Taking the hull's recorded
 * 0.83125 would have put the wing 0.025 above the plate's own centre line and off
 * the number four cage birds and a hen share.
 *
 * **One difference that IS real and is accepted.** Over the flank PAD — x 0.675,
 * y 0.86035 to 1.13385 — the wing stands **0.102900 proud instead of 0.152918**,
 * because the pad has come out 0.050 to meet it. That is the same condition
 * `WING_SINK` was solved for in the first place (a tip standing over receded
 * surface) with the sign flipped, and `animal-sheep.ts` measured the same 0.050
 * loss across all five band shapes. It is 4% of the hull's width and it is not
 * worth a second number.
 *
 * The legs need no re-derivation either: `box-41`'s sole is y **0.18125** and
 * 0.625 across, `box-03`'s own, so `LEG_ROW` and `box-01`'s recorded x = 0.25
 * transfer unchanged and the feet still land on y = 0.
 *
 * **AND THE COST IS STATED.** `box-41` is **262 triangles against `box-03`'s
 * 60** — 4.4x, and 41% of this whole animal. That is what "the biggest galliform"
 * costs and it buys two things at once: the bigger silhouette, and three painted
 * bands where a hen had one.
 *
 * ===========================================================================
 * ## 3. THE BARE RED HEAD IS PAINT, AND THE SNOOD IS AN UPSIDE-DOWN COMB
 * ===========================================================================
 *
 * A turkey's head is bare red-and-blue skin with a snood drooping over the bill,
 * and after the fan that is the second thing a child names it by. Neither exists
 * in the bank. Both are had anyway, and one of them is free.
 *
 * **THE FACE IS BAND 3 AND IT COSTS NOTHING.** `animal-sheep.ts` §3 found it:
 * `box-41` arrives cut into three bands and band 3 is 37 triangles — 31 of them
 * the front plate's muzzle region with the boss standing out of the middle of it
 * (world x +/-0.3125, y **0.49375 to 0.89375**, z 0.625 to 0.725), 6 of them the
 * underline. Painted red that is a bare-skinned turkey's face: a mask 0.625 wide
 * and 0.400 tall running from under the eye cards down to the throat, with a
 * 0.400-wide boss standing 0.100 out of the middle of it as the fleshy front of
 * the face. **One shell, one band, three opposite animals** — the sheep spends it
 * dark, the horse spends it pale-mealy, and this bird spends it red.
 *
 * The 6 underline triangles go red too, because they are one entry. On the sheep
 * that was accepted as shadow; here it is better than accepted — they are the
 * lower front chamfer and the bottom face, world y 0.18125 to 0.49375, and a
 * turkey's red skin genuinely does run down the throat onto the brisket. The
 * part of it that is the flat underside is between the legs where the island
 * camera (polar 0.86, 40.7 degrees above horizontal) and the album camera (6.4
 * degrees) never go.
 *
 * **THE SNOOD IS `cone-01` HUNG UPSIDE DOWN OFF THE BILL'S OWN TIP.** It is the
 * same shape `animal-chicken.ts` stands THREE of on its crown as a comb — one of
 * only two records in all 94 with `taper` 0, a true point — turned over by the
 * one spin that turns it over, `{ axis: 'x', deg: 180 }`, and joined with `on:
 * 'snout'` so its station is the bill's own outer-face anchor rather than a
 * number: `(0, 0.72775, 0.825)`. At the shape's own recorded burial (0.312222,
 * 0.125 units) the shift solves to 0.075186 and the cone hangs from
 * **y 0.852764 down to 0.452364**, x +/-0.080, z 0.660700 to 0.989300.
 *
 * **What it buys, against the number `animal-chicken.ts` §5 refused a wattle
 * with.** It droops **0.149386 below the bill's own underside** (y 0.60175) and
 * reaches **0.164300 past the bill's tip**. The hen's best available wattle stood
 * **0.039913** proud and was rightly called invisible; this is **3.74x that in
 * droop alone**, and unlike a nose-tip flat against a face it is a free-hanging
 * silhouette with sky behind it. It is the head feature this species needed and
 * the hen did not.
 *
 * **THE SEPARATE WATTLE IS STILL REFUSED, AND ON `box-41` THE WINDOW IS THE SAME
 * 0.108.** The front plate's own lower reach is y 0.49375 and the bill's
 * underside is y 0.60175, so the clear face under the bill is **0.108000** — the
 * identical number the hen measured, because both ends come from the same two
 * parts and this shell's front plate is `box-03`'s. The smallest SOLID box,
 * `box-09`, is 0.136825 tall and does not fit; overruling its recorded 0.000000
 * burial to 8/16 opens the window but leaves 0.039912 standing. `plate-12` and
 * `plate-16` are not candidates at all (`animal-budgie.ts:243-255` measured them
 * for this exact job and refused them for reading flat). **And the window is
 * occupied**: the snood crosses it at z 0.660700 to 0.989300, in front of the
 * boss's own 0.725, so a second part there would be a bunny's nose hidden behind
 * a snood.
 *
 * **THERE IS NO COMB, AND THAT IS ANATOMY BEFORE IT IS BUDGET.** A turkey has
 * none — caruncles and a snood, and no blade on the crown at all — which is the
 * cleanest separation from the chicken/rooster pair this bird could have, and
 * `farm.ts:162` gives *"comb, wattle and a dark arched tail"* to the ROOSTER as
 * the whole of its own separation. The mechanism agrees: `box-41`'s crown is not
 * `box-03`'s. Ray-cast over an (x, z) grid it is **1.43125 for |z| <= 0.0833,
 * ramping to two transverse PADS at 1.48125 over |z| 0.1383 to 0.2575**, so
 * `animal-chicken.ts`'s row at z 0.148215 / 0.023215 / -0.101785 would put its
 * leading point on a pad and the other two on the flat, 0.050 lower. Three comb
 * points at three heights is what that shell does to that idiom, and it is one
 * more reason a sibling should not have copied it.
 *
 * ===========================================================================
 * ## 4. EVERYTHING ELSE, SHORT
 * ===========================================================================
 *
 *   - **THE BILL is `tube-02` by pure donor transfer**, as the hen's is, and on
 *     this shell the solve lands it on `frame.front` = **0.725** (`hulls.ts:97`)
 *     rather than 0.625, recovering the bank's recorded **y 0.72775** exactly as
 *     the chicken did. It spans z 0.625 to 0.825, x +/-0.230, y 0.60175 to
 *     0.85375 — so **its back face lands on the front PLATE at 0.625**, and the
 *     0.030 each side by which it overhangs the 0.400-wide boss is still backed
 *     by plate. Nothing floats; 0.100 of bill stands clear of the boss.
 *   - **THE EYE is `plate-08` painted dark**, the hen's treatment unchanged. The
 *     amber iris stays the guinea fowl's (`animal-chicken.ts` §6 reserved it) and
 *     this bird has no use for it: a dark bead on a RED face is already the
 *     highest-contrast eye in the collection.
 *   - **TWO LEGS on `LEG_ROW`**, `box-01`'s own x = 0.25, z = 0 on the midline,
 *     with JT-044's foot patch at 4/16 — the chicken's line and the three cage
 *     birds', derived in `animal-chicken.ts` §5. Spent on the thing a turkey has:
 *     dull pink-grey shanks over darker scaly toes.
 *   - **IT FLAPS AND THE FAN DOES NOT WAG.** `MOTIONS.wag` is a rotation about y
 *     at 0.35 rad, and this fan's node sits at its own centre ON the rear plate:
 *     0.3129 of half-width turned 20 degrees moves the outer edge 0.107 in z,
 *     which is more than the 0.100 that is buried, so a wag swings the fan's
 *     embedded half straight out of the shell. It is also wrong for the animal —
 *     a displaying tom's fan is rigid; the stillness IS the display.
 *   - **NO EARS, NO NOSE, NO `belly`.** The bill carries the pack's `nose` role,
 *     and `belly` cannot sit beside `byBand` on one part (`assembly.ts:487-501`,
 *     one cell one picture) — the hull's three bands are the better spend and
 *     band 3's underline already does what a belly line would have.
 *
 * ## THE PALETTE IS NEW AND NOBODY HAS SIGNED IT OFF
 *
 * `farm.ts:152` carried only *"the biggest, darkest galliform"*, so all eight
 * slots are first colours and every one is UNREVIEWED. The argument is the
 * Bronze turkey, read by band: **band 15 (168 triangles, everything above y
 * 0.80625 — the back and shoulders) is the coppery bronze that names the breed;
 * band 7 (57 triangles, the flanks and breast below it) is near-black; band 3 is
 * the bare red skin.** Weighted by surface area the bird is dark, which is the
 * brief, and the one lit-looking plane is the top — where both cameras are.
 * Against `animal-chicken.ts`'s buff 0xb5824a this is the opposite end of Farm.
 *
 * **Flagged**, for the fan's spin and burial, for the snood, for the three-band
 * paint and for the palette. Nothing else strained: height **1.5877** inside
 * 1.43-2.02 with 0.432 to spare, **644 triangles** inside rule 9's 422-951, feet
 * on y = 0, one mass, every part joined at a plate of this hull or at a station
 * solved off its own measured points, **nothing authored and not one stretch
 * anywhere on the animal.**
 */
import { defineCreature } from '../creature'
import { LEG_ROW } from '../hulls'
import { PACK_PUPIL } from '../texture'

/**
 * `box-41`'s flat rear plate — z = -0.625, and IDENTICAL to `box-03`'s.
 *
 * The shell's recorded offset is (0, 0.83125, 0.05); the plates are not there.
 * Measured off its own points the rear plate spans x +/-0.3125 and y 0.49375 to
 * 1.11875, exactly `box-03`'s, because `box-41` grew forward, upward and sideways
 * in bosses and pads and left every flat plate where it was.
 */
const REAR_PLATE_Z = -0.625

/**
 * That plate's upper edge, and the highest station on the shell the fan can join.
 *
 * With `FAN_SINK` the fan's centre lands here, so the plate backs the whole of
 * its lower half — 0.468944 of height, 45.54% of its silhouette area — and the
 * upper half stands clear above the crown. See the header table for what each
 * notch up and down costs; this is the last row that is a plate coordinate.
 */
const REAR_PLATE_TOP_Y = 1.11875

/**
 * +30 degrees, and it is arithmetic. `box-38`'s own root-to-tip axis is
 * (0, 0.866025, -0.500000) — **60.000 degrees above horizontal** — so 30 is the
 * unique x spin that stands it exactly vertical. `animal-canary.ts:439` takes 0
 * of it and lies the fan back; `animal-pony.ts` takes 180 on z and hangs it as a
 * switch. This is the third reading of one part and it is the only upright one.
 */
const FAN_SPIN = 30

/**
 * 8/16, overruling the shape's recorded 0.269738, and the overrule is forced.
 *
 * Stood upright the fan's root quad faces DOWN and cannot meet a vertical rear
 * plate at all, so the recorded burial stops describing anything: at it, the
 * fan's frontmost point lands at z -0.653014 against the plate's -0.625000 and
 * the whole part **floats 0.028014 clear of the body**. 6/16 is the first notch
 * that touches at all (0.031 in). 8/16 is the one that means something: `shift =
 * 0.321100 - 0.500000 x 0.642200 = 0`, so the fan's centre sits ON its join point
 * and the plate BISECTS its 0.200 of thickness — 0.100 inside, 0.100 proud. It is
 * the wing's burial too, so this bird has exactly one.
 */
const FAN_SINK = 0.5

/** The flank PLATE's own x. Not 0.675 — that is the pad. */
const FLANK_PLATE_X = 0.625

/**
 * The flank plate's own vertical centre, (0.49375 + 1.11875) / 2.
 *
 * **This is the number `box-41` is a trap about**: the hull's recorded centre is
 * 0.83125 and the plate's is 0.80625, 0.025 lower, because the bounding box grew
 * upward at the crown and the plate did not move. It is also `box-03`'s own
 * recorded centre, which is why the cage birds' wing line transfers here whole.
 */
const FLANK_PLATE_MID_Y = 0.80625

/**
 * The cage birds' wing sink, taken unchanged — `animal-chicken.ts` §3 is the
 * derivation and its conclusion was "nine birds, one wing". This is the tenth.
 */
const WING_SINK = 0.5

/**
 * 4/16, derived in `animal-chicken.ts` §5: the lowest grid notch that clears
 * `box-01`'s own sole-to-shank bevel (0.204082 of its height) onto straight
 * material, by 0.014063. `texture.ts:106-115` throws off the grid.
 */
const FOOT_AT = 0.25

export const TURKEY_ASSEMBLY = defineCreature('animal-turkey', {
  palette: {
    coat: 0x2f2721,    // UNREVIEWED: near-black warm brown — band 7, the breast and flanks
    bronze: 0x6a4826,  // UNREVIEWED: the coppery back and shoulders — band 15, 168 triangles
    flight: 0x4d3720,  // UNREVIEWED: dark chestnut — the wings and the FAN
    face: 0xb03a30,    // UNREVIEWED: the bare red skin — band 3's mask AND the snood, one slot
    limb: 0x9a8778,    // UNREVIEWED: horn-grey — the bill and the shanks
    foot: 0x6b5b4c,    // UNREVIEWED: JT-044's second tone — the darker scaly toes
    eye: 0x241d16,     // UNREVIEWED: the dark bead, read against a red face
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  hull: {
    part: 'box-41',
    paint: { base: 'coat', byBand: { 3: 'face', 15: 'bronze' } },
  },

  eyes: { part: 'plate-08', paint: 'eye' },

  snout: { part: 'tube-02', paint: 'limb' },

  tail: {
    part: 'box-38',
    paint: 'flight',
    sink: FAN_SINK,
    spin: [{ axis: 'x', deg: FAN_SPIN }],
    at: [0, REAR_PLATE_TOP_Y, REAR_PLATE_Z],
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
      at: [FLANK_PLATE_X, FLANK_PLATE_MID_Y, 0],
    },

    {
      name: 'snood',
      part: 'cone-01',
      paint: 'face',
      on: 'snout',
      spin: [{ axis: 'x', deg: 180 }],
    },
  ],

  motion: [{ kind: 'flap', parts: ['wing'] }],

  flag: 'THE FAN IS THE ANIMAL AND ITS TWO NUMBERS ARE FORCED, SO LOOK AT IT FIRST. box-38 is '
    + 'the parrot\'s fan, left unspent for this bird by name (farm.ts:152, "the only one with a '
    + 'fanned tail"; animal-chicken.ts §4 says it is being held). animal-canary.ts:439 wears it '
    + 'UNSPUN and lying back; animal-pony.ts wears it FLIPPED 180 on z as a hanging switch. This '
    + 'is the third reading and the only upright one: spun +30 on x, because the shape\'s own '
    + 'root-to-tip axis is (0, 0.866025, -0.500000) = 60.000deg above horizontal and 60 + 30 = 90, '
    + 'so THIRTY IS THE UNIQUE SPIN THAT STANDS IT VERTICAL and no other value is derivable. '
    + 'Standing it up BREAKS the recorded burial and that is what forces the second number: worn '
    + 'flat the part joins by its root quad, and stood upright that quad faces DOWNWARD and cannot '
    + 'meet a vertical rear plate at all — at the recorded sink 0.269738 the fan\'s frontmost '
    + 'point is z -0.653014 against the plate\'s -0.625000 and the whole thing FLOATS 0.028014 '
    + 'clear of the body. 6/16 is the first grid notch that touches (0.031 in); 8/16 is the one '
    + 'that says something, because shift = 0.321100 - 0.5 x 0.642200 = 0 exactly, so the fan\'s '
    + 'CENTRE lands on its join point and the rear plate BISECTS its 0.200 of thickness, 0.100 '
    + 'inside and 0.100 proud. It is the wing\'s burial too. Sited at the rear plate\'s own TOP '
    + 'CORNER y 1.11875 — the highest station on the shell — the fan spans y 0.649806 to 1.587694 '
    + 'and clears the crown by 0.106444, with 45.54% of its silhouette backed by plate (under half '
    + 'only because a fan is narrow at the root and wide at the top). AT THE CANARY\'S OWN TAIL '
    + 'HEIGHT 0.80625 IT WOULD TOP OUT 0.206056 BELOW THE CROWN AND NEVER BREAK THE SILHOUETTE, '
    + 'which is the refusal; the join height is the one dial and the file tabulates five rows of '
    + 'it. There is ONE fan and a second is impossible: box-38 is 0.625879 across and the flat '
    + 'rear plate is 0.625000, so the part is 0.000879 WIDER than the whole plate and no x has any '
    + 'plate under it. Nothing is stretched — a 1.3x is exactly what you flagged on 2 August. '
    + 'THE BARE RED HEAD IS PAINT AND COSTS NOTHING: box-41 arrives cut into three bands and band '
    + '3 is animal-sheep.ts\'s find — 31 triangles of front-plate muzzle with the 0.400-wide boss '
    + 'standing 0.100 out of the middle of it, world y 0.49375 to 0.89375, plus 6 underline. The '
    + 'sheep paints it dark and the horse paints it pale-mealy; this bird paints it RED and gets a '
    + 'bare turkey face for zero triangles. The 6 underline triangles go red with it, which on '
    + 'this animal is right rather than tolerated — a turkey\'s skin does run down the throat onto '
    + 'the brisket. Band 15 (168 tris, everything above y 0.80625) is the coppery back and band 7 '
    + '(57) the near-black flanks: THE FIRST BIRD IN THE PACK TO SPEND byBand, which '
    + 'animal-chicken.ts held back for exactly this. THE SNOOD IS AN UPSIDE-DOWN COMB: the same '
    + 'cone-01 the hen stands three of on her crown, turned over by { axis: x, deg: 180 } and hung '
    + 'with on: "snout" off the bill\'s own tip anchor (0, 0.72775, 0.825) at the shape\'s own '
    + 'burial. It droops 0.149386 below the bill\'s underside and 0.164300 past its tip — against '
    + 'the 0.039913 of standing wattle animal-chicken.ts §5 refused as invisible, that is 3.74x in '
    + 'droop and it hangs free with sky behind it. THE SEPARATE WATTLE IS STILL REFUSED: the '
    + 'window under the bill on this shell is 0.108000, the identical number the hen measured, '
    + 'against box-09\'s 0.136825; and the snood already crosses that window in front of the boss. '
    + 'THERE IS NO COMB, deliberately: a turkey has none, farm.ts:162 gives comb and wattle to the '
    + 'ROOSTER, and box-41\'s crown will not take the hen\'s row anyway — ray-cast it is 1.43125 '
    + 'for |z| <= 0.0833 and rises to two transverse PADS at 1.48125 over |z| 0.1383 to 0.2575, so '
    + 'her three points would stand at two different heights. box-41 IS THE OTHER HALF OF "BIGGEST" '
    + 'AND IT COSTS 262 TRIANGLES AGAINST box-03\'S 60, 41% of the animal. Its recorded offset '
    + '(0, 0.83125, 0.05) is NOT where its plates are: the flank plate is x 0.625, y 0.49375 to '
    + '1.11875 (mid 0.80625) and z +/-0.3125 (mid 0) — box-03\'s own, at box-03\'s coordinates — '
    + 'so the wing\'s three join numbers re-derive to the chicken\'s 0.625 / 0.80625 / 0, and the '
    + 'trap was only ever reusing a constant named HULL_CENTRE_Y. Over the flank PAD the wing '
    + 'stands 0.102900 proud instead of 0.152918, accepted, 4% of the hull\'s width. THE FAN DOES '
    + 'NOT WAG: MOTIONS.wag is 0.35 rad about y and this fan\'s node is its own centre on the '
    + 'plate, so 0.3129 of half-width turned 20deg moves the edge 0.107 in z against the 0.100 '
    + 'that is buried — a wag swings the embedded half out of the shell, and a displaying tom\'s '
    + 'fan is rigid anyway. NEW PALETTE, UNREVIEWED, all eight slots: farm.ts:152 only ever '
    + 'carried "the biggest, darkest galliform", and this is the opposite end of Farm from the '
    + 'hen\'s buff 0xb5824a.',
})
