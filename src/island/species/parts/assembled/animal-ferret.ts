/**
 * The ferret's assembly, as a definition — Home Pets' long carnivore, and the
 * one member of that page whose PROPORTION is its whole read.
 *
 * ONE SPECIES, ONE FILE. `index.ts` says why one appended line is the whole of
 * the wiring, and it says why the line never precedes the file.
 *
 * ## WHAT SEPARATES THIS ANIMAL FROM ITS SIBLINGS
 *
 * `collections/home-pets.ts` says it in one line — *"a ferret is a tube on short
 * legs and the proportion is the whole read; nothing else here is shaped remotely
 * like it"* — and its header assigns the six rodents to separate on SHAPE first,
 * because four of them are sandy brown in life and colouring them apart would be
 * a lie a child can check against a picture book.
 *
 * **This species' axis is DEPTH AGAINST WIDTH, and it is measured, not claimed:
 * 2.0439 front to back against 1.2500 across — 1.635, where a rodent on the same
 * cube runs about 1.2.** Every other separation below is a second lever on top of
 * that one:
 *
 *   - The **wheelbase** goes to z = 6/16, one notch past `animal-civet.ts`'s
 *     5/16, and it is the widest station on the pack's own grid that still leaves
 *     daylight between the leg and the end of the body. See the legs.
 *   - The **muzzle** reaches 0.9499 in front and the **tail** trails to -1.0940
 *     behind, and neither is on any rodent here.
 *   - The **colour** is cream-and-sable, which no rodent on this page would want
 *     and which is this animal's own true scheme rather than a separation device.
 *
 * Where it OVERLAPS a sibling, said out loud, because reuse is house style and
 * silence about it is not:
 *
 *   - **`animal-hamster.ts` wears the same ear**, `box-02`. What makes ours not
 *     the hamster's: it is painted SABLE against a cream body where the hamster's
 *     is coat-coloured with a dark inner disc, and it sits on a body 1.635 times
 *     longer than it is wide against the hamster's round one. The ear is the
 *     bank's only truly round one and both animals have round ears; that is the
 *     animals agreeing, not the builder repeating himself.
 *   - **`animal-pony.ts` wears the same tail shape**, `box-38` — TURNED UPSIDE
 *     DOWN, narrow end hanging. This one wears it the parrot's own way up, at a
 *     height solved for this hull. §3.1 is explicit that a part's identity is its
 *     placement rather than Kenney's label, and an inverted fan and an upright one
 *     are two silhouettes from one shape.
 *
 * ## "LONG AND LOW" IS HALF SAYABLE, AND THIS IS WHICH HALF
 *
 * **Low is not sayable at all, and the arithmetic says so rather than the taste.**
 * `HEIGHT_FLOOR` is 1.43125 — a bare 1.250 cube on the pack's own leg row — and
 * `PACK_HEIGHT_MIN` is 1.43, so there is one part in a thousand of headroom under
 * a species that says nothing. Two routes down were measured and both are shut:
 *
 *   - **A flatter shell.** `box-13`, the crab's, is the only genuinely low hull in
 *     the bank: 1.332958 x **0.450556** x 1.347378 — the only one of the ten under
 *     1.0 tall, and 0.097 deeper than the cube into the bargain, so it is the
 *     obvious answer to "long and low" and it is refused twice over. Its centre is
 *     [0, 0.546250, 0], so its underside sits at 0.320972 while the leg row's own
 *     top is 0.306251: **the legs would not reach it, by 0.0147**, and §3 says
 *     nothing floats. And the whole model would stand 0.7715, which is not near
 *     the band — it is half of it.
 *   - **Sinking the body onto shorter legs.** `legs.y` became settable on Joe's
 *     ruling of 2 Aug (*"i cannot move the legs up... everything else moves
 *     down"*), and raising the row does drop the body — but `box-01`'s own
 *     measured burial over all 86 legs in the pack runs 0.0000 to
 *     **0.408163**, and `LEG_ROW.sink` already IS that maximum. The pack never
 *     buried a leg deeper than this animal's are buried, so the belly cannot go
 *     lower without inventing a depth Kenney never used.
 *
 * **Long is sayable, and only three ways, since there is no hull stretch, ever.**
 * The shell is chosen, the stance is spread, and things are hung off the front and
 * the back. All three are spent here and each is measured below.
 *
 * ## Every number, and where it came from
 *
 *   - **THE HULL IS `box-03`, THE 1.250 CUBE, AT ITS OWN RECORDED
 *     [0, 0.80625, 0]** — unmentioned in the definition because it is what
 *     `defineCreature` gives a species that says nothing. Two alternatives were
 *     measured and refused, and both are the ones a builder reaches for when the
 *     word is "long":
 *
 *       - **`box-41`, the tiger's**, is 1.350 x 1.300 x 1.350 — 0.100 deeper than
 *         the cube. It is refused because it is 0.100 WIDER as well, so the body's
 *         depth-against-width comes out at 1.000 exactly as the cube's does: it
 *         buys size, not proportion, and proportion is this animal. It also costs
 *         **262 triangles against the cube's 60**, which is 202 of the 951 budget
 *         for a ratio that did not move.
 *       - **`box-31`, the lion's**, is 1.125 deep — 0.125 SHORTER front to back,
 *         which is the wrong direction. `animal-civet.ts` refused it for the same
 *         reason on the same kind of animal and the refusal is quoted here rather
 *         than re-derived.
 *
 *   - **THE WHEELBASE IS z = 0.375 = 6/16, AND IT IS THE LONGEST STANCE THE
 *     PACK'S OWN GRID ALLOWS.** `box-01` is 0.375 deep, so at that station each
 *     leg's outer face lands on **0.5625 — one sixteenth inside the hull's own
 *     0.625**, which is exactly the margin `animal-wolf.ts` argued for on x,
 *     applied here to z. It costs no keep-out at all, because the legs stay inside
 *     the body's own box, and it is one notch past `animal-civet.ts`'s 5/16
 *     deliberately: the civet is the project's other long-bodied carnivore and a
 *     ferret is longer-bodied than a civet.
 *
 *     **`animal-crocodile.ts`'s 0.4375 is refused, and the refusal is a
 *     measurement.** `box-03`'s flat bottom face reaches only |z| = 0.3125 and the
 *     chamfer then rises 1:1, so the hull's underside at |z| is
 *     0.18125 + (|z| - 0.3125). The leg's own top is at **0.306251**, and the two
 *     meet at |z| = 0.4375 to within a millionth — so at the crocodile's station
 *     the leg's CENTRE would graze the chamfer rather than bed into it. At 6/16
 *     the leg is buried the full 0.125 over z 0.1875 to 0.3125 and only its outer
 *     0.125 of depth passes that line, which is a leg poking out from under a
 *     rounded flank and is what the builder's own default 0.25 does at exactly
 *     zero. One dial moved for one reason; x is left at the pack's 0.27.
 *
 *   - **THE TAIL IS `box-38`, THE PARROT'S FAN, AND IT IS CARRIED LOW.** §7 splits
 *     the seven tails on THICKNESS, not length, and finds a 1.7x gap with nothing
 *     in it: thin 0.200-0.345, thick 0.589-0.744. A ferret's tail is furred, so it
 *     is in the thick group — which is also what keeps it off the three rodents
 *     still to be built on this page, since a rat's, a gerbil's and a degu's tails
 *     are the bank's thin ropes. Inside the thick group the other two are refused
 *     on measurements:
 *
 *       - **`box-23`, the fox's brush**, on `animal-wolf.ts`'s own three numbers:
 *         taper **0.961469** (it barely narrows), section ROUND to six decimals
 *         (0.910248 on both axes), and 1.67x the volume of any other tail. It
 *         reads as a fox whatever it is painted, and `animal-gecko.ts` has it on
 *         this very page.
 *       - **`wedge-03`, the beaver's**, because it is **the only tail in the bank
 *         with a FLATTENED section**: 0.726000 across against 0.588533 through,
 *         a ratio of 0.811, where `box-38` is 0.625879/0.642124 = 0.975 and the
 *         brush is 1.000. A flattened tail is a paddle, and `animal-chinchilla.ts`
 *         has it on this page too.
 *
 *     So `box-38`: round in section, tapering **0.839147** against the brush's
 *     0.961, and **48 triangles — the cheapest tail in the bank**, which is what
 *     pays for the 184 the round ears cost.
 *
 *   - **THE TAIL'S HEIGHT IS SOLVED, NOT CHOSEN, AND IT IS WHAT LOW COSTS.** The
 *     fan's buried root — the only material inboard of the join plane, local
 *     z >= 0.147874 — runs local y **-0.4561 to -0.3561**. `box-03` cuts every edge
 *     and every corner, so its flat rear face is 0.625 square and runs world y
 *     **0.49375 to 1.11875**. The join point's y IS the part's centre y (the join
 *     moves it along z and nothing else), so the whole root is backed by flat face
 *     only for y in [0.94985, 1.47485], and **y = 1.0 = 16/16 is the lowest notch
 *     on the pack's own grid inside it** — root at 0.5439 to 0.6439, with 0.050 to
 *     spare below.
 *
 *     That is **0.0998 below the parrot's own recorded 1.099846**, and the whole
 *     of the difference is the animal: a parrot's tail is carried and a ferret's
 *     trails. It is also what puts this model at **1.5012 rather than 1.5559** —
 *     at the donor's height the fan's top would have been the tallest thing here.
 *     The z is untouched: the donor transfer joins it at this hull's rear face and
 *     its centre recovers the bank's recorded **-0.772857** to five decimals,
 *     which is the evidence the transfer is legitimate (§8), because the recovered
 *     number was never used to get there.
 *
 *   - **THE EARS ARE `box-02`, AND IT IS THE ONLY SMALL ROUND EAR THE PACK EVER
 *     STOOD ON A TOP FACE.** 0.315000 x 0.315000 x 0.205000 — circular to six
 *     decimals in front view, and of the fifteen ears in the bank that attach
 *     `y +1` only it and the panda's identical `box-34` are. (The bank's other
 *     round ear is `box-25`, the koala's dish, which is 2.36x across, mounts on
 *     the SIDE, and is `animal-chinchilla.ts`'s headline on this very page — round,
 *     but a chinchilla's rather than a ferret's.) The beaver and the polar bear
 *     wear `box-02` on `box-03`, this hull, so the transfer is EXACT rather than an
 *     inference: joined at this cube's top face y = 1.43125 and sunk the donors'
 *     own 0.777778, the centre lands on **1.343750, the bank's recorded offset to
 *     six decimals**, and its x and z are untouched by the join and are therefore
 *     recovered rather than picked.
 *
 *     Those two recovered numbers are why this shape is here and not another one.
 *     Measured over every top-mounted ear in the bank, **`box-02` sits at the
 *     widest x station (0.447500) and the rearmost z station (0.247500) of any of
 *     them** — small, round, wide and set back on the head, which is a ferret's
 *     ear placement written down by Kenney. `wedge-16`, the tiger's, is UNSPENT
 *     and was the alternative; it is refused because it is measurably not round
 *     (0.347458 x 0.388582) and sits 0.096 narrower and 0.136 further forward.
 *     `box-34`, the panda's, is the same bounding box as `box-02` to six decimals
 *     and is refused for costing **116 triangles against 92** for an identical
 *     silhouette.
 *
 *     It stands only **0.0700 proud** of the top face at the donors' own burial,
 *     and that is deliberate rather than tolerated: it is the tallest point on this
 *     animal, so the whole model is 1.5012 — 0.070 over the pack's floor. Nothing
 *     on a ferret reaches up. **Kenney's own band 7 — the 10-triangle inner-ear
 *     disc on the ear's forward face, local y -0.1057 to 0.1057 — is left
 *     unpainted on purpose**: at this burial only y > 0.0875 shows, so a `byBand`
 *     entry would buy a 0.018 crescent rather than an inner ear, and a highlight
 *     nobody asked for is worse than nothing.
 *
 *   - **The eyes are `plate-06`/`plate-07`, the caterpillar's — the SMALLEST card
 *     in the pack** at 0.329780 x 0.276342 against the default's 0.400 x 0.320208,
 *     and also the closest-SET, at x = 0.227390 against the pack's usual 0.262500.
 *     A small pointed face with small beady eyes close together, and it separates
 *     this animal from the big-eyed rodents around it — `animal-chinchilla.ts` and
 *     `animal-gecko.ts` both spend the pack's biggest, `plate-14`. Its z is
 *     `EYE_CARD_Z` and its sink is zero, neither of which is a field (rule 5).
 *
 *     **A DARK SCLERA WAS CONSIDERED AND REFUSED, and the reason is a number.**
 *     The mask cannot be drawn on the hull (see the flag), and the eye card is the
 *     one piece of geometry that already sits where the mask is — so painting its
 *     band 3 sable would put dark exactly there. It is refused because
 *     **`PACK_PUPIL` (0x4c4f5e) is LIGHTER than the sable (0x3a2c20)** — relative
 *     luminance 79.5 against 46.1 — so the pupil would read as a catch-light on a
 *     dark disc and the eye would invert. Recorded so the next builder does not
 *     helpfully try it.
 *
 *   - **The snout is `tube-06`, the fox's muzzle, and it is here for KENNEY'S OWN
 *     CUT.** It and the deer's `tube-03` are the same bounding box to six decimals
 *     — 0.532000 x 0.300000 x 0.231420 — and different meshes; `tube-06` is the
 *     ONLY muzzle in the bank Kenney split, into band 3 (20 triangles, local y
 *     -0.1500 to 0.0590, the lower half) and band 7 (14 triangles, -0.0092 to
 *     0.1500, the upper). A pale muzzle with a dark bridge over it is therefore one
 *     `byBand` entry and no geometry at all, and it is the front end of the mask.
 *     `animal-badger.ts` found that cut and `animal-civet.ts` and `animal-wolf.ts`
 *     spent it after; this is the fourth, and the reason is not habit — it is that
 *     the bank contains exactly one two-tone muzzle and every masked animal needs
 *     it. Placed entirely by the donor transfer: joined at the front face z = 0.625
 *     and sunk its own measured 0.000, its centre recovers the fox's recorded
 *     **z = 0.740710** and keeps the fox's own height 0.757432.
 *
 *   - **The nose is `box-10`, the cat's and the polar bear's**, anchored with
 *     `on: 'snout'` — automatic, since a snout exists — so the builder puts it on
 *     the muzzle's own PLACED front plane at z = 0.856420, measured off the built
 *     vertices rather than on an arithmetic this file would carry a stale copy of.
 *     At 0.182434 across against a 0.532000-wide muzzle face it is backed
 *     everywhere, which is the test `animal-mole.ts` fails and `animal-opossum.ts`
 *     passes. It is sunk its own measured 0.147004 — the mean of the cat's 0.000
 *     and the polar bear's 0.294 — so it beds into the muzzle rather than sitting
 *     on it. It is deliberately not `wedge-10`, which is measurably a nose TIP and
 *     reads as a tongue: Joe rejected that one by name on the hedgehog.
 *
 *     `pets:creature` marks the join **`sunk 0.016 THIN`** and it is right to
 *     print it and wrong to read it as a fault, exactly as on `animal-wolf.ts`'s
 *     nose and `animal-opossum.ts`'s tail: 0.1249 is §3's floor for an EAR, and
 *     0.016 is 0.147004 of an extent that is only 0.109650 to begin with — the
 *     burial the cat and the polar bear themselves gave this shape. `on: 'snout'`
 *     anchors it to the muzzle's placed outer face measured off the built
 *     vertices, so the join is inside the muzzle rather than near it, and
 *     deepening it would mean discarding a measurement to satisfy a warning.
 *
 *   - **The belly is PAINTED at 8/16**, §4's second way — no second shape and no
 *     split triangle. The tiger's own mammal line made exact: §7 measured the
 *     pack's boundary wandering across 0.4808-0.5481 and 8/16 is the only point on
 *     the pack's 1/16 grid inside that zone, as well as this hull's own equator.
 *
 *   - **THE LEGS ARE PAINTED FLAT FROM THE SABLE SLOT, AND JT-044'S TWO-TONE LEG
 *     WAS CONSIDERED AND REFUSED. This is the one decision in the file that went
 *     against the obvious move, so here is the arithmetic.**
 *
 *     JT-044 is real and it is general — `animal-hamster.ts` spends it on pale
 *     feet at 3/16 and `animal-gecko.ts` on splayed toe pads at 4/16, both on this
 *     page. `Paint.patch` takes `at` as a fraction of the part's OWN height and it
 *     must land on the pack's 1/16 grid. `box-01` is 0.375 x **0.306250** x 0.375
 *     and it is buried 0.408163 of itself, so the hull's underside cuts it at
 *     0.18125 and **only its bottom 0.181250 is visible — 0.591837 of its own
 *     height.** The grid points strictly inside that are k/16 for k = 1..9, and the
 *     highest, 9/16 = 0.5625, puts the line at world **0.172266 — 0.008984 below
 *     the hull's own bottom face.**
 *
 *     So every boundary this tool can draw on this leg stops SHORT of the body,
 *     and **a sable ferret's leg carries no boundary at all**: it is dark from the
 *     paw to the shoulder, and the only line a child sees on it is where the dark
 *     leg meets the cream flank. That line is the hull's own bottom face — it is
 *     geometry, it is free, and it is already there. Painting a stocking anywhere
 *     below it would be adding a marking the animal does not have, which is the
 *     one thing `animal-badger.ts` established we do not do; and painting it at
 *     10/16 (world 0.191406, inside the belly) would be a flat leg with a buried
 *     line in it, which is the same picture at more cost.
 *
 *     **What JT-044 does buy here is the thing that matters**: the legs are their
 *     own paint slot, so "dark legs against a cream body" is sayable at all. They
 *     take it from `sable` along with the ears, the nose, the muzzle's bridge and
 *     the tail, because on a sable ferret those five ARE one marking — the same
 *     reason `animal-civet.ts` gives for one `mark` slot doing six jobs.
 *
 * ## THE PALETTE IS NEW AND NOBODY HAS SIGNED IT OFF
 *
 * `collections/home-pets.ts` carries one line for this species and no colours —
 * the fourteen hand-assembled members are `defineSpecies(id, 'bespoke')` and
 * nothing more — so the four below are the first ever proposed for a ferret and
 * every one is marked UNREVIEWED. **Joe should look at them**, and particularly at
 * how much `sable` is doing: it is the mask, the ears, the legs, the nose and the
 * tail, because on this animal they are one thing.
 *
 * **FLAGGED, and only for the mask.** Nothing else strained: nothing is stretched,
 * nothing is spun, no part is authored, the hull is the shell at its own size, and
 * every join point above is either a recovered donor offset or a bound solved off
 * the hull's own measured faces. Measured on the built model: **height 1.5012**
 * inside the pack's 1.43-2.02 and 0.070 over its floor, feet on y = 0; **575
 * triangles** inside 422-951; **keep-out 1.022** against the fox's own 1.15,
 * spent almost entirely front to back — 1.250 across against **2.044 deep**,
 * which is the whole animal in two numbers.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/**
 * The lowest notch on the pack's 1/16 grid at which the fan's WHOLE buried root
 * is backed by the cube's flat rear face.
 *
 * `box-38`'s material inboard of the join plane (local z >= 0.147874) runs local
 * y -0.4561 to -0.3561; `box-03`'s flat rear face runs world y 0.49375 to
 * 1.11875. So the bound is [0.94985, 1.47485] and this is the lowest grid point
 * in it. It trails 0.0998 lower than the parrot carries the same shape, which is
 * the difference between a tail that is carried and a tail that trails.
 */
const TAIL_Y = 1.0

export const FERRET_ASSEMBLY = defineCreature('animal-ferret', {
  /* NEW AND UNREVIEWED. `home-pets.ts` carries one line for this species and no
   * colours, so these four are the first ever proposed for a ferret. */
  palette: {
    coat: 0xd7c3a0,    // UNREVIEWED: the cream body of a standard sable
    belly: 0xf1e7d3,   // UNREVIEWED: the paler underside, the muzzle, the sclera
    sable: 0x3a2c20,   // UNREVIEWED: THE POINTS — the mask's bridge, the nose, the
    //                    ears, the legs and the tail, which on this animal are one
    //                    marking and therefore one slot
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* The points are one marking, so the legs and the nose default off the one slot
   * that draws them. JT-044's real purchase here is that a leg has its own paint
   * at all — see the header for why it has no PATCH. */
  limb: 'sable',

  /* The tiger's mammal line made exact — the only 1/16 point inside the pack's
   * own measured 0.4808-0.5481 zone, and this hull's own equator. */
  belly: 0.5,

  /* THE LONGEST STANCE THE GRID ALLOWS. 6/16 puts each leg's outer face on
   * 0.5625, one sixteenth inside the hull's own 0.625 — the wolf's own margin on
   * x, applied to z — and it costs no keep-out, because the legs stay inside the
   * body's own box. The crocodile's flush 0.4375 is refused: that is exactly
   * where `box-03`'s chamfer has risen to meet the leg's own top (0.306250
   * against 0.306251) and the join would graze rather than bed. */
  legs: { z: 0.375 },

  /* THE BANK'S ONLY TRULY ROUND EAR — 0.315000 x 0.315000, circular to six
   * decimals — at the widest (0.447500) and rearmost (0.247500) station of any
   * top-mounted ear in it. The beaver and the polar bear wear it on this cube, so
   * the transfer recovers 1.343750 exactly. Flat sable: Kenney's band-7 inner disc
   * is 82% buried at the donors' own depth and would buy a crescent, not an ear. */
  ears: { part: 'box-02', paint: 'sable' },

  /* The caterpillar's card: the SMALLEST in the pack (0.329780 x 0.276342) and the
   * closest-set (x 0.227390). A ferret's eye is a small bead in a pointed face,
   * and the big cards belong to the animals on this page whose eyes are their
   * character. The sclera is left pale — see the header for why a sable one
   * inverts against `PACK_PUPIL`. */
  eyes: { part: 'plate-06' },

  /* THE FRONT END OF THE MASK. The fox's muzzle is the only one of the bank's
   * twenty-eight that Kenney split, and the split is horizontal: band 3 the lower
   * 20 triangles, band 7 the upper 14. A cream muzzle with a dark bridge over it,
   * for one entry and no geometry. Placed entirely by the donor transfer — its
   * centre recovers the fox's own recorded z = 0.740710. */
  snout: { part: 'tube-06', paint: { base: 'belly', byBand: { 7: 'sable' } } },

  /* The cat's and the polar bear's nose-tip, on the muzzle's own placed front
   * plane (`on: 'snout'`, automatic), sunk its own measured 0.147004 so it beds in.
   * 0.182434 across on a 0.532000 face: backed everywhere. Not `wedge-10`, which
   * is measurably a nose TIP and reads as a tongue — Joe's ruling on the hedgehog. */
  nose: 'box-10',

  /* THE TAIL, CARRIED LOW. The parrot's fan: round in section (0.625879 /
   * 0.642124), tapering 0.839147 against the brush's 0.961469, and the cheapest
   * tail in the bank at 48 triangles. Its z is the pure donor transfer and
   * recovers the bank's recorded -0.772857; only its HEIGHT is this species', and
   * that is solved rather than chosen — see TAIL_Y. */
  tail: { part: 'box-38', paint: 'sable', at: [0, TAIL_Y, -0.625] },

  flag: 'THE SABLE MASK CANNOT BE EXPRESSED, and on a domestic ferret it is the '
    + 'marking a child names the animal by: a dark face and dark legs against a pale '
    + 'cream body. The LEGS landed and the FACE did not. `Paint.patch` takes one '
    + 'number and that number is a HEIGHT — it paints ONE LEVEL BOUNDARY across a part '
    + 'and has no z term, so it cannot even say "the front of this is dark"; `byBand` '
    + 'can only cut where Kenney already cut and `box-03` has exactly one band; and '
    + 'rule 3 is one mass, so there is no head to paint on its own. This is '
    + '`animal-badger.ts`\'s flag and `animal-civet.ts`\'s on a third animal, which is '
    + 'worth your eye as a PATTERN rather than as one species — every masked mammal we '
    + 'build will hit it. WHAT IS HERE INSTEAD is both ends of the mask and nothing '
    + 'between them: a cream muzzle carrying the fox nose\'s own dark upper band and a '
    + 'dark nose on the end of it (the front), dark round ears (the back), and the '
    + 'dark legs and dark tail entire. The run across the cheek and through the eye is '
    + 'missing. A dark EYE CARD was tried for it and refused on a number: `PACK_PUPIL` '
    + '(0x4c4f5e) is lighter than any sable, so the pupil would read as a highlight and '
    + 'the eye would invert. JT-044\'s two-tone leg was also considered and refused, '
    + 'and that one is worth a second\'s thought because two siblings on this page do '
    + 'spend it: only the bottom 0.181250 of a leg is visible, 0.591837 of its own '
    + 'height, so the highest boundary the 1/16 grid can draw sits 0.009 BELOW the '
    + 'belly — and a sable ferret\'s leg has no boundary on it at all, it is dark to '
    + 'the shoulder. The line a child sees there is the hull\'s own bottom face, which '
    + 'is free. And the PALETTE IS UNREVIEWED — `home-pets.ts` has never carried a '
    + 'colour for this species. Nothing was authored to fake any of it.',
})
