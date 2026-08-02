/**
 * The chicken — Farm's hen, and **the EXEMPLAR the collection's other four
 * galliforms are cut from.** Rooster, turkey, guinea fowl and quail are all
 * derived from this file; `farm.ts:176` says so in as many words.
 *
 * ONE SPECIES, ONE FILE. `register.ts` says why the one appended line in
 * `index.ts` is the whole of the wiring.
 *
 * **Read `animal-budgie.ts` and `animal-cockatiel.ts` first.** Those two solved
 * the two idioms this file re-uses whole and does not re-litigate: **the WING is
 * `box-06`, the bunny's ear, laid along the flank as a SOLID** because the
 * island's camera looks DOWN and a zero-thickness card is edge-on and simply
 * gone from up there; and **a point on a crown is `cone-01`, unspun, at the
 * hull's own top face**, which is the cockatiel's crest. Both are inherited, one
 * of them with one number changed and the change argued in §3.
 *
 * ===========================================================================
 * ## 0. WHAT A SIBLING SHOULD TAKE FROM HERE, AND WHAT IT MUST NOT
 * ===========================================================================
 *
 * Four species derive from this one, so the parts below are sorted into what is
 * SHARED (take it unchanged and point at this file) and what is SPENT (this
 * species' own, and a sibling that copies it has not separated itself).
 *
 *   **Shared — take these unchanged.**
 *   - The wing: `box-06` at `sink: 0.5`, joined `[0.625, 0.80625, 0]`, §3.
 *   - The foot: `{ base: 'limb', patch: { below: 'foot', at: 0.25 } }`, §5.
 *   - The eye: `plate-08`, the pack's one ROUND card, §6.
 *   - Two legs in `extras` on `LEG_ROW`, at `box-01`'s own x and z = 0.
 *
 *   **Spent — a sibling needs its own answer.**
 *   - `box-18` as the tail. `box-38`, the FAN, is deliberately left unspent and
 *     is the TURKEY's (`farm.ts:152`: *"the only one with a fanned tail"*).
 *     `wedge-15`, `box-23` and `chamfer: true` are left for the ROOSTER's arched
 *     tail. §4.
 *   - THREE comb points at the shallow burial. The rooster's separation on this
 *     axis is COUNT and BURIAL, and §2 hands it both, measured.
 *   - `belly` and `byBand` are untouched here on purpose: the guinea fowl's
 *     spots and the quail's mottling are the two siblings that need a painted
 *     mechanism, and neither is spent. `box-03` has ONE band, so a sibling that
 *     wants `byBand` on the body wants a different shell — `box-41`, the
 *     tiger's, carries three (37 / 57 / 168 triangles) and is also the only
 *     hull bigger than this one, which makes it the turkey's on both counts.
 *
 * ===========================================================================
 * ## 1. THE DESIGN PROBLEM IS `animal-chick`, AND IT CANNOT BE EDITED
 * ===========================================================================
 *
 * `animal-chick` is one of the FROZEN base 24 (`registry.ts:55`) and it is a
 * yellow galliform on this exact shell — `box-03`'s fifteen donors include
 * `chick/body/hull`. `farm.ts:176` gives this species one job beside its own:
 * *"the one that must stay clear of the frozen `animal-chick`."*
 *
 * **Two of this animal's parts are the chick's own, and that is deliberate
 * rather than careless.** The hull is the chick's shell and the beak is
 * `tube-02`, the chick's and the penguin's own bill. A chick's beak IS a hen's
 * beak — it is the same animal eight weeks apart — and inventing a different one
 * to look different would be inventing. §6 shows what that choice buys: the bare
 * donor transfer recovers the bank's recorded offset on BOTH coordinates,
 * because the chick wears this beak on this shell.
 *
 * **So the separation is carried by four things a chick has none of**, and every
 * one of them is a thing this animal genuinely has:
 *
 *   1. **A COMB.** A chick has no comb at all. §2.
 *   2. **WINGS.** A chick's wings are not a silhouette; a hen's are. §3.
 *   3. **A TAIL.** A chick has no tail to speak of. §4.
 *   4. **COLOUR.** A chick is saturated lemon-yellow. This bird is warm buff-
 *      brown with a red comb and yellow legs, and weighted by surface area —
 *      `HANDOFF.md` §6's rule, never by vertex count — the buff is nearly all of
 *      it. That is the one a child reads first, and it is the one a chick can
 *      never take back, because a chick is frozen.
 *
 * ===========================================================================
 * ## 2. THE COMB IS THREE POINTS, AND BOTH NUMBERS ARE SOLVED
 * ===========================================================================
 *
 * **There is no comb in the bank and there never will be.** `BAKED_ROLES` is
 * `{hull, leg, ear, tail, eye, nose, band, card, tooth}` — every shape whose only
 * role was comb, wattle, horn or wing was discarded at generation time — and
 * JT-043 forbids authoring one. So a comb is a repurposed shape or it is nothing.
 *
 * **It is `cone-01`, the bee's and the caterpillar's ANTENNA**, and
 * `animal-cockatiel.ts:507-511` is the standing derivation: `taper` is 0 on
 * exactly TWO of the bank's 94 records, `cone-01` and `cone-06`, so this is one
 * of only two true points in the pack and the other is a parrot's beak. It is
 * placed the crest's way — **no spin**, because `cone-01`'s own attachment is
 * `y +1`, straight up, and a comb stands up; joined at `HULL_TOP_Y`, the hull's
 * own top face.
 *
 * **What is NOT the cockatiel's is that there are THREE of them and that they
 * are buried deeper, and those are the two things that make a comb rather than a
 * crest.** Both are solved and neither is chosen:
 *
 *   - **THREE, because a comb is SERRATED and one cone is a spike.** The cost is
 *     stated rather than hidden: `cone-01` is 34 triangles, so the second and
 *     third are **68 triangles, 12.5% of this animal's 542** — the single most
 *     expensive decision in the file. It buys the one feature a child names this
 *     bird by, and a single point on the crown of a bird is what
 *     `animal-cockatiel.ts` already spent on a COCKATIEL. Three is the fewest
 *     that reads as a row.
 *   - **`COMB_SINK` = 8/16, not the shape's own 5/16, and this is the dial the
 *     ROOSTER needs.** A hen's comb is markedly smaller than a cock's, and the
 *     bank offers exactly one honest way to say that: burial. `cone-01`'s own
 *     record is `sunkFractionMean` 0.312222 (0.125 units, which
 *     `animal-cockatiel.ts` correctly calls §3's own floor for an embedded part,
 *     so it is a MINIMUM and deeper is allowed). At 8/16 it buries **0.2002 —
 *     1.6x that floor — and stands 0.2002 proud against the cockatiel crest's
 *     0.275356, which is 27.3% less comb.** The rooster takes the shape's own
 *     5/16 and gets all of that back, with no stretch anywhere. `stretch` is what
 *     the easy answer would have been and Joe flagged exactly that on three
 *     animals on 2 August.
 *
 *     It is also the burial at which the arithmetic falls out clean: `shift =
 *     -s.lo - sink x extent` is `0.2002 - 0.5 x 0.4004 = 0`, so **the cone's
 *     centre lands exactly ON the hull's top face** and its base and its tip sit
 *     symmetrically either side of it.
 *
 *   - **`COMB_STEP` = 2/16, and it is the LARGEST grid step at which the three
 *     points still MEET.** This is what separates a comb from three spikes, and
 *     it is arithmetic rather than taste. `cone-01` is 0.328570 deep at its base
 *     and narrows linearly to a point, so at the crown — 0.2002 above a base
 *     buried 0.2002 — it is exactly **half that, 0.164285 across**. Two adjacent
 *     cones therefore touch at the crown while the step is under 0.164285:
 *
 *           2/16 = 0.1250   they OVERLAP by 0.039285 at the crown       ok
 *           3/16 = 0.1875   they stand 0.023215 APART at the crown      three spikes
 *
 *     So at 2/16 the three bases merge into one blade at the body and separate
 *     0.0479 above it into three points — which is what a comb is — and at 3/16
 *     they never touch at all. The pack's own 1/16 grid decides it.
 *
 *   - **`COMB_FRONT_Z` is `animal-cockatiel.ts`'s own `CREST_Z`**: the flat top
 *     face's own front reach (0.3125, measured off the shell rather than
 *     assumed) less `cone-01`'s own half-depth. The leading point's front edge
 *     lands exactly on the flat top's front edge — as far forward over the brow
 *     as this shell allows, which is where a comb starts — and the row then runs
 *     BACK from it at the step, to z = 0.148215, 0.023215 and -0.101785. The
 *     bound `§3, nothing floats` allows at this burial is `topFlatZ + depth` =
 *     0.3125 + 0.2002 = 0.5127, and the row does not go near it: **all three
 *     bases lie wholly on the FLAT top face**, footprint z -0.2661 to +0.3125
 *     against the face's own -0.3125 to +0.3125, so not one of them reaches the
 *     chamfer at all and the burial is provably straight down into the shell.
 *
 * **ROOSTER, THIS IS YOUR HEADROOM AND IT IS MEASURED.** Five points at the same
 * 2/16 step run from 0.148215 back to -0.351785, and at `cone-01`'s own 5/16
 * burial the bound is 0.4375, so **five taller points fit on the identical
 * solve** — 37.6% more comb than this bird and two more of it, for 68 triangles,
 * with nothing stretched and nothing re-derived.
 *
 * ===========================================================================
 * ## 3. THE WING IS THE CAGE BIRDS', AT THEIR OWN SINK, AND THE DEEPER ONE IS
 * ##    REFUSED WITH A NUMBER
 * ===========================================================================
 *
 * `box-06`, the bunny's ear, `axis: 'z', dir: -1`, `spin: [{ z: -90 }, { y: -90
 * }]`, `sink: 0.5`, joined at `[0.625, 0.80625, 0]` — byte for byte the budgie's,
 * the canary's and the cockatiel's, and `animal-budgie.ts` asked in writing that
 * it stay that way so the birds read as one family. It does here too.
 *
 * **A hen holds her wing tighter to the flank than a budgie does, and that was
 * measured rather than assumed.** `WING_SINK` = 0.5 is a FLOOR, not a preference:
 * `box-06`'s tip reaches |z| = 0.456649 where this shell's flat side face reaches
 * only 0.312500, so the tip stands over a surface that has receded 0.144149 —
 * 0.471328 of the part's own 0.305836 of thickness — and snapped up to the pack's
 * 1/16 grid that is 8/16. Deeper is available. The next notch up is what it buys:
 *
 *       8/16  buries 0.152918   stands 0.152918 proud
 *       9/16  buries 0.172033   stands 0.133803 proud
 *
 * **The whole difference is 0.019115 — 1.53% of the hull's own 1.250 of width.**
 * That is below anything the island's downward camera can show at album scale,
 * and it would break a four-species idiom to say it. So the anatomy is real, the
 * mechanism cannot express it, and the family number stands. Recorded here so
 * that the four galliforms deriving from this file inherit the same 0.5 and
 * nobody re-opens it — **nine birds, one wing.**
 *
 * ===========================================================================
 * ## 4. THE TAIL IS THE BANK'S ONLY STUB, AND THE FAN IS THE TURKEY'S
 * ===========================================================================
 *
 * **The fan is not available and that is a collection decision, not a
 * measurement.** `box-38` is the parrot's fan — `animal-canary.ts:439` wears it
 * as exactly the *"fan/folded"* tail — and `farm.ts:152` gives the TURKEY *"the
 * only one with a fanned tail"*. A turkey derived from this file cannot separate
 * itself on the one axis the collection assigned it if the exemplar has already
 * spent it.
 *
 * **So the tail is `box-18`, the elephant's TRUNK, worn backwards — the badger's
 * own line (`animal-badger.ts:149`), unchanged.** It is right for this bird for
 * three reasons, in the order they bind:
 *
 *   1. **It is the bank's only STUB, and it does not taper.** `taper` 0.994204,
 *      the least tapering of the bank's seven tails: a blunt straight block, not
 *      a plume. A farmyard hen's tail is a short blunt wedge of feathers held up
 *      behind her, and it is the only tail here that is a BLOCK.
 *   2. **It reaches 0.425211 clear of the rear face**, second shortest of the
 *      seven — only the beaver's `wedge-03` at 0.415328 reaches less, and that
 *      one is `animal-chinchilla.ts`'s. Its 0.623004 of HEIGHT against that
 *      0.425211 of reach is a silhouette that stands up more than it trails,
 *      which is the hen.
 *   3. **It is the only one of the seven this hull can carry at zero burial, and
 *      it fits by one thousandth.** `box-18`'s recorded `sunkFractionMean` is
 *      **exactly 0.000000** — alone in the bank — so nothing is buried and its
 *      WHOLE join cross-section has to land on real flat geometry or it floats.
 *      That cross-section is 0.345 x 0.623004, half-height **0.311502**, against
 *      `box-03`'s flat rear face reach of **0.312500**: it fits with **0.000998**
 *      to spare. Every other tail in the bank overhangs its face and pays for it
 *      with burial; this one does not have that option and does not need it.
 *
 * **The consequence is that the tail's HEIGHT is not a choice.** It sits at the
 * hull's own centre, 0.80625, because 0.000998 of margin means moving it up by
 * anything at all carries the top corner off the flat face and onto the chamfer,
 * with nothing buried to cover the fall. `animal-canary.ts` had 0.173205 of
 * burial against a 0.0436 overhang and could place its fan freely; this one is
 * pinned.
 *
 * **ROOSTER, THIS IS YOUR OTHER HEADROOM.** `wedge-15` (the lion's, 1.0824 long,
 * 212 triangles), `box-23` (the fox's brush) and — the one worth reaching for —
 * `chamfer: true`, which is a builder idiom that solves the rear-top chamfer
 * midpoint AND the 45-degree turn onto its normal together (`creature.ts:820`).
 * A tail that leaves the body at 45 degrees and up is precisely a cock's arched
 * sickle, `animal-squirrel.ts` and `animal-kinkajou.ts` are the worked examples,
 * and it is deliberately unspent here.
 *
 * ===========================================================================
 * ## 5. THE WATTLE IS REFUSED, AND THE REFUSAL IS THREE THINGS
 * ===========================================================================
 *
 * A hen has small wattles. This one has none, and the reasons are recorded so
 * that nobody helpfully adds them back — `animal-badger.ts`'s discipline.
 *
 *   1. **It is a third of the ROOSTER's separation.** `farm.ts:162` gives that
 *      species *"comb, wattle and a dark arched tail"* as the whole of what
 *      carries it away from this bird. A hen wearing a wattle takes one of the
 *      three, and the two animals share a body deliberately, so there is nothing
 *      else to give back.
 *   2. **The face has no room for it at the burial the part records.** The
 *      candidates are `box-09` and `box-10`, the bunny's and the cat's nose-tips
 *      and the smallest SOLID boxes in the bank at 0.182434 x 0.136825 — the flat
 *      cards `plate-12` and `plate-16` are not candidates at all, because
 *      `animal-budgie.ts:243-255` measured them for exactly this job and refused
 *      them for reading FLAT. The window under the beak is: the flat front face's
 *      own lower reach, y = 0.80625 - 0.3125 = **0.49375**, up to the beak's own
 *      underside, y = 0.72775 - 0.126 = **0.60175**. That is **0.108 tall, and
 *      the part is 0.136825.** Both boxes record a burial of 0.000000 and
 *      0.016119, so neither can stand on the chamfer below the window either —
 *      there is nothing buried to cover the fall.
 *   3. **Overruling the burial buys 0.0399 of wattle, which is nothing.** The
 *      window can be opened by sinking `box-09` past its record the way §3 sinks
 *      the wing: at 8/16 it buries 0.039913 of its own 0.079825 of thickness and
 *      the window becomes 0.147913, which does fit 0.136825. What then stands
 *      proud of the face is **0.039913 — 3.2% of the hull's width**, half of §3's
 *      already-invisible 0.019 doubled. And it would be the BUNNY'S NOSE hung on
 *      the midline directly under a bill, at the exact station a nose goes.
 *
 * ===========================================================================
 * ## 6. EVERY OTHER NUMBER, AND WHERE IT CAME FROM
 * ===========================================================================
 *
 *   - **THE HULL IS `box-03` AND NOTHING IS SAID ABOUT IT.** The builder's
 *     default, the pack's own bird body, and the chick's and the parrot's own
 *     shell. `box-41`, the tiger's — the one hull bigger than this on all three
 *     axes — is deliberately NOT taken: it is the only shell that can make a
 *     galliform look BIGGER than this one and `farm.ts:152` wants the turkey to
 *     be *"the biggest"*. A hen is a medium ground bird and this is the medium
 *     shell. Painted ONE FLAT SLOT: `box-03` has exactly one band, so there was
 *     nothing free to spend anyway.
 *
 *   - **THE BEAK IS `tube-02`, THE CHICK'S AND THE PENGUIN'S OWN, AND IT IS A
 *     PURE DONOR TRANSFER — no `at`, no `sink`, no `spin`.** 0.460 x 0.252 x
 *     0.200, `taper` **1.000**: a round-sectioned blunt bar, which is a hen's
 *     bill. `cone-06`, the alternative and the beak all four cage birds wear, is
 *     refused with `animal-canary.ts`'s own measurement of it: it is a PARROT's,
 *     its band 15 stands 0.041900 proud of its band 13, and that overhang — 14.6%
 *     of the shape's depth, or 29% read off the silhouette — is where a hook
 *     begins. A hen has no hook.
 *
 *     **The transfer's evidence is what it recovers.** Joined at this hull's
 *     front face z = 0.625 and sunk `tube-02`'s own 0.5, the shift solves to
 *     `0.100 - 0.5 x 0.200 = 0.000`, so the beak's centre lands on **z = 0.625
 *     and y = 0.727750 — the bank's own recorded offset for the shape, to six
 *     decimals, on BOTH coordinates.** That is exact rather than approximate
 *     because the chick wears this beak on this shell; §1 is why that is the
 *     point rather than the problem. It reaches 0.100 clear against `cone-06`'s
 *     0.183350, which is the short blunt bill this bird has.
 *
 *     It carries ONE band, so there is no upper/lower mandible to paint and the
 *     budgie's cere trick is not declined here so much as unavailable.
 *
 *   - **THE EYE IS `plate-08`, THE PACK'S OWN BIRD EYE**, 0.400 x 0.400,
 *     `symmetry: radial`, the only ROUND card in the bank and the one three of
 *     the pack's three birds donated. Painted from the dark slot with Kenney's
 *     own band 15 left as the glint — `animal-canary.ts`'s treatment, and right
 *     here for a different reason: a hen's iris is orange-amber in life, and an
 *     orange bead on a buff-brown bird is a marking that disappears. **The dark
 *     bead is what makes an eye readable on this coat**, and the amber iris is
 *     left available as a cheap separator for the guinea fowl, whose face
 *     genuinely is the loud part of it.
 *
 *   - **TWO LEGS, NOT FOUR, AND JT-044's TWO-TONE FOOT.** `legs: false` and one
 *     mirrored `box-01` pair in `extras`, on `LEG_ROW`'s own row — y = 0.18125
 *     and sink 0.408163, the two constants that put the feet on y = 0 exactly.
 *     **x = 0.25 is `box-01`'s OWN recorded offset** and **z = 0 is the hull's
 *     midline**, which is the only station a biped's legs can be at.
 *
 *     The patch is `{ below: 'foot', at: 0.25 }` and the 0.25 is derived, not
 *     preferred. `box-01`'s 80 points sit on three y-rows and the bevel from sole
 *     to full-width ring is 0.0625 of its 0.30625 of height, so the leg reaches
 *     full width at 0.204082 of itself; `at` must be k/16; **3/16 = 0.1875 lands
 *     INSIDE the bevel and the boundary follows a sloping face, and 4/16 = 0.2500
 *     clears it by 0.014063 onto the straight shank.** So 0.25 is the LOWEST grid
 *     point that draws a clean ring, and the three cage birds are all on it.
 *     `texture.ts:106-115` throws for anything off the grid.
 *
 *     **It is spent on the thing a hen actually has**: scaly deep-yellow toes
 *     under a paler yellow shank. `animal-ferret.ts` is the standing precedent
 *     for REFUSING this tool when a leg carries no boundary — a chicken's does.
 *
 *   - **NO BELLY LINE, NO `byBand`, NO MARKING CARDS.** A buff farmyard hen is
 *     one buff from throat to vent. All three are free, all three are declined,
 *     and §0 says why it matters: they are the guinea fowl's and the quail's.
 *
 *   - **NO EARS**, which needs no defending on a bird, **and no nose** — the beak
 *     IS the nose and `tube-02` carries the pack's own `nose` role.
 *
 *   - **IT FLAPS, AND THE COMB DOES NOT BOB.** `animal-budgie.ts` was the first
 *     species to declare a motion and every bird with a wing since has; this one
 *     takes `motion.ts`'s own measured defaults with nothing tuned. The
 *     cockatiel's second motion is explicitly NOT copied: `bob` is a position
 *     channel that raises and lowers a part, which is what a crest does and is
 *     precisely what a comb does not — a comb is fixed flesh. Neither moves a
 *     vertex nor enters the geometry fingerprint.
 *
 * ## THE PALETTE IS NEW AND NOBODY HAS SIGNED IT OFF
 *
 * `farm.ts:177` carried the words *"buff, combed, short-tailed"* for this bird
 * and nothing else, so the seven below are the first actual colours this species
 * has ever had and every one is **UNREVIEWED**. Four of the seven galliforms in
 * this collection will be recoloured off these, so they matter more than one
 * species' worth.
 *
 * **Flagged**, for the palette, for the comb, for the wattle that is not there,
 * and for the two parts this animal shares with the frozen chick. Nothing else
 * strained: height **1.6314** inside 1.43-2.02, **449 vertices and 542
 * triangles** comfortably inside rule 9's 405-1626 and 422-951 (the canary is
 * the animal that FLOOR binds on, not this one), keep-out **0.8876** against the
 * fox's 1.15, feet on y = 0, every part joined at a face of this hull or at a
 * station solved off the hull's own measured geometry, one mass, **nothing
 * authored and not one stretch of any kind anywhere on the animal.**
 */
import { defineCreature } from '../creature'
import { LEG_ROW } from '../hulls'
import { PACK_PUPIL } from '../texture'

/** `box-03`'s own recorded centre, and where its side, rear and top faces are. */
const HULL_CENTRE_Y = 0.80625
const HULL_SIDE_X = 0.625
const HULL_REAR_Z = -0.625
const HULL_TOP_Y = 1.43125

/**
 * How far `box-03`'s flat faces reach before the chamfer starts falling away.
 *
 * Measured off the shell's own 32 points and the same on every face — §8 step 1's
 * warning that the flat face is not where it looks. Two stations on this animal
 * are solved off it: the comb's leading edge, and the tail's refusal to move.
 */
const HULL_FLAT = 0.3125

/**
 * The cage birds' wing sink, taken unchanged, and the deeper one refused.
 *
 * It is a FLOOR rather than a preference: `box-06`'s tip reaches |z| = 0.456649
 * where this shell's flat side face reaches only 0.312500, so the tip stands over
 * a surface receded 0.144149 — 0.471328 of the part's own 0.305836 of thickness —
 * and the pack's 1/16 grid snaps that up to 8/16.
 *
 * A hen holds her wing tighter than a budgie and 9/16 was measured for it: it
 * buries 0.172033 and leaves 0.133803 standing against 8/16's 0.152918. The whole
 * difference is 0.019115, **1.53% of the hull's own width**, which is under what
 * the island's downward camera can show — so the anatomy is real, the mechanism
 * cannot say it, and four cage birds plus five galliforms stay on one number.
 */
const WING_SINK = 0.5

/**
 * 8/16, deeper than `cone-01`'s own 5/16, and it is the ROOSTER's dial.
 *
 * The shape records `sunkFractionMean` 0.312222 — 0.125 units, which
 * `animal-cockatiel.ts` correctly calls §3's own floor for an embedded part, so
 * it is a minimum and deeper is honest. At 8/16 the comb buries 0.2002 (1.6x that
 * floor) and stands 0.2002 proud, against the cockatiel crest's 0.275356: **27.3%
 * less comb**, which is the difference between a hen's and a cock's, said in the
 * one dial the bank offers that is not a stretch.
 *
 * It also makes the arithmetic land clean. `shift = -s.lo - sink x extent` is
 * `0.2002 - 0.5 x 0.4004 = 0`, so the cone's centre sits exactly ON the hull's
 * top face with its base and its tip symmetric either side of it.
 */
const COMB_SINK = 0.5

/**
 * `animal-cockatiel.ts`'s own `CREST_Z`, and the same solve for the same reason.
 *
 * The flat top face's own front reach less `cone-01`'s own half-depth, so the
 * leading point's front edge lands exactly on the flat top's front edge — as far
 * forward over the brow as this shell allows, which is where a comb starts. A `z`
 * has to be given at all because the bare donor transfer would use `cone-01`'s
 * recorded 0.469709, which is 0.157 past where this hull's top face ends.
 */
const COMB_FRONT_Z = HULL_FLAT - 0.328570 / 2

/**
 * 2/16 — **the LARGEST step on the pack's grid at which the three points still
 * MEET**, which is the whole of what separates a comb from three spikes.
 *
 * `cone-01` is 0.328570 deep at its base and narrows linearly to a point, so at
 * the crown — 0.2002 above a base buried 0.2002 by `COMB_SINK` — it is exactly
 * half of that, 0.164285 across. Two adjacent cones therefore touch while the
 * step is under 0.164285:
 *
 *       2/16 = 0.1250   they OVERLAP 0.039285 at the crown   one blade
 *       3/16 = 0.1875   they stand 0.023215 APART            three spikes
 *
 * At 2/16 the bases merge into a single blade against the body and separate
 * 0.0479 above it into three points. That is a comb.
 */
const COMB_STEP = 0.125

/**
 * 4/16, and it is DERIVED. `box-01`'s bevel from sole to full-width ring is
 * 0.0625 of its own 0.30625 of height, so the leg reaches full width at 0.204082
 * of itself; `at` must be k/16 (`texture.ts:106-115` throws otherwise); 3/16 =
 * 0.1875 lands inside the bevel and the boundary follows a sloping face, and 4/16
 * clears it by 0.014063 onto the straight shank. The lowest grid point that draws
 * a clean ring, and the three cage birds are all on it.
 */
const FOOT_AT = 0.25

export const CHICKEN_ASSEMBLY = defineCreature('animal-chicken', {
  palette: {
    coat: 0xb5824a,    // UNREVIEWED: warm buff-brown — nearly the whole bird
    flight: 0x96693a,  // UNREVIEWED: that buff one shade down — wings and tail
    comb: 0xc0332e,    // UNREVIEWED: the comb, and the only red on the animal
    limb: 0xe0b96a,    // UNREVIEWED: the pale yellow shanks, and the same bill
    foot: 0xc2913a,    // UNREVIEWED: JT-044's second tone — the scaly toes
    eye: 0x2a2018,     // UNREVIEWED: the dark bead; see §6 for the amber refused
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  eyes: { part: 'plate-08', paint: 'eye' },

  snout: { part: 'tube-02', paint: 'limb' },

  tail: {
    part: 'box-18',
    paint: 'flight',
    spin: [{ axis: 'y', deg: 180 }],
    at: [0, HULL_CENTRE_Y, HULL_REAR_Z],
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
      name: 'comb-front',
      part: 'cone-01',
      paint: 'comb',
      sink: COMB_SINK,
      at: [0, HULL_TOP_Y, COMB_FRONT_Z],
    },
    {
      name: 'comb-mid',
      part: 'cone-01',
      paint: 'comb',
      sink: COMB_SINK,
      at: [0, HULL_TOP_Y, COMB_FRONT_Z - COMB_STEP],
    },
    {
      name: 'comb-rear',
      part: 'cone-01',
      paint: 'comb',
      sink: COMB_SINK,
      at: [0, HULL_TOP_Y, COMB_FRONT_Z - 2 * COMB_STEP],
    },
  ],

  motion: [{ kind: 'flap', parts: ['wing'] }],

  flag: 'THE COMB IS THREE COPIES OF THE BEE\'S ANTENNA AND IT IS THIS COLLECTION\'S FIRST '
    + 'IMPROVISED PART, so look at it first: there is no comb, wattle, horn or wing role in the '
    + 'bank at all — every shape whose only job was one of those was discarded at generation '
    + 'time — so cone-01, one of only TWO records in all 94 with taper 0 (a true point, the '
    + 'other being a parrot\'s beak), stands unspun on the crown three times. BOTH ITS NUMBERS '
    + 'ARE SOLVED. It is buried 8/16 rather than the shape\'s own 5/16, which stands it 0.2002 '
    + 'proud against animal-cockatiel.ts\'s crest at 0.275356 — 27.3% LESS COMB, which is the '
    + 'difference between a hen\'s and a cock\'s said in the only dial the bank has that is not '
    + 'a stretch, and the rooster deriving from this file takes the shape\'s own burial back and '
    + 'gets all of it. And the spacing is 2/16 because that is the LARGEST step on the pack\'s '
    + 'grid at which the three points still MEET: cone-01 is 0.328570 across at its base and '
    + 'exactly half that, 0.164285, at the crown, so at 2/16 the bases overlap 0.039285 and read '
    + 'as ONE serrated blade, and at 3/16 they stand 0.023215 apart and read as three spikes. '
    + 'The second and third cones cost 68 triangles, 12.5% of the whole animal, and they are the '
    + 'most expensive decision in the file. THERE IS NO WATTLE, deliberately, three times over: '
    + 'farm.ts:162 gives the ROOSTER "comb, wattle and a dark arched tail" as the whole of its '
    + 'separation from this bird and the two share a body on purpose; the window under the beak '
    + 'is 0.108 tall (the flat front face\'s own lower reach 0.49375 up to the bill\'s underside '
    + '0.60175) against the smallest SOLID box in the bank at 0.136825, and the flat cards '
    + 'plate-12 and plate-16 are not candidates because animal-budgie.ts:243-255 already '
    + 'measured and refused them for this exact job for reading FLAT; and overruling box-09\'s '
    + 'own 0.000 burial to 8/16 opens the window enough but leaves only 0.039913 of wattle '
    + 'standing, 3.2% of the hull\'s width, and it would be the BUNNY\'S NOSE hung on the '
    + 'midline directly under a bill. TWO PARTS HERE ARE THE FROZEN CHICK\'S AND THAT IS THE '
    + 'THING TO JUDGE: the hull is box-03, which chick/body/hull donated, and the beak is '
    + 'tube-02, the chick\'s and the penguin\'s own bill. A chick\'s beak IS a hen\'s beak eight '
    + 'weeks earlier and inventing a different one would be inventing — the transfer recovers '
    + 'the bank\'s recorded offset on BOTH coordinates (z 0.625, y 0.727750) precisely because '
    + 'the chick wears this beak on this shell. So the separation from animal-chick is carried '
    + 'by four things a chick has none of: the comb, the wings, the tail, and above all COLOUR, '
    + 'a chick being saturated lemon and this bird warm buff-brown. If it still reads as a big '
    + 'chick to you, that is the judgement to make and the fix is the palette, not the parts. '
    + 'THE FAN IS NOT SPENT: box-38 is the parrot\'s fan and farm.ts:152 gives the TURKEY "the '
    + 'only one with a fanned tail", so this bird takes box-18, the bank\'s only STUB (taper '
    + '0.994204, the least tapering of the seven tails) and the elephant\'s TRUNK worn backwards '
    + 'at animal-badger.ts:149\'s own line. It is also the only tail this hull can carry at zero '
    + 'burial and it fits by ONE THOUSANDTH: box-18 records sunkFractionMean 0.000000, alone in '
    + 'the bank, so its whole join cross-section must land on flat geometry, and its half-height '
    + 'of 0.311502 against box-03\'s flat rear reach of 0.312500 clears by 0.000998 — which also '
    + 'means the tail\'s height is not a choice and cannot be raised. wedge-15, box-23 and the '
    + 'chamfer: true idiom are all left unspent for the rooster\'s arched sickle. AND THE WING '
    + 'IS THE CAGE BIRDS\', UNCHANGED: a hen holds its wing tighter and 9/16 was measured for it, '
    + 'but the whole difference between 8/16 and 9/16 is 0.019115 of standing wing, 1.53% of the '
    + 'hull\'s width, which is under what the island\'s downward camera shows — so nine birds '
    + 'stay on one number rather than eight and one. NEW PALETTE, UNREVIEWED: farm.ts:177 only '
    + 'ever carried "buff, combed, short-tailed", and four more galliforms will be recoloured '
    + 'off these seven slots. Nothing was authored and nothing is stretched.',
})
