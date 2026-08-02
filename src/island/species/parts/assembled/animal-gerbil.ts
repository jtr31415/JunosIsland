/**
 * The gerbil's assembly, as a definition — Home Pets' tufted-tailed one, and the
 * species whose headline posture the kit cannot say.
 *
 * ONE SPECIES, ONE FILE. Adding a species is this file and one appended line in
 * `index.ts`; `register.ts` says why that one line is enough.
 *
 * ## What this animal has to do, and the axis it holds
 *
 * `collections/home-pets.ts` argues the six-rodent problem in its own header —
 * hamster, guinea pig, gerbil, chinchilla, rat and degu on one album page — and
 * rules that palette cannot carry it, because "four of the six are some shade of
 * sandy brown in life" and a colour lie is one a child can check against a
 * picture book. It also names the one genuine collision: **gerbil and degu are
 * both tufted.** So the separation has to be a measurement, and these are this
 * animal's, stated here so the agent building the degu can read them:
 *
 *   - **TAIL THICKNESS, which §7 says is the axis that separates the seven tail
 *     shapes.** This one is `wedge-18` at **0.200000** on its thin axis — with
 *     `wedge-07` the joint-thinnest in the bank. The thick group is 0.589 to
 *     0.744 (`wedge-03`, `box-38`, `box-23`), and a brush-tufted degu belongs in
 *     it: that is a **2.9x margin** on the one axis §7 measured for this.
 *   - **THE TUFT IS A CUT, NOT A SHAPE.** Kenney split this tail himself: band 3
 *     is 64 of its 212 triangles, spanning local y 0.2664 to 0.5233 — the outer
 *     **24.5% of its length, at the tip, furthest from the join**. Painted dark
 *     that is a distinct dark tip on a slim tail for one `byBand` entry and no
 *     geometry at all. A degu's brush is a THICKER TAIL SHAPE; a gerbil's tuft is
 *     the same slim tail with its last quarter painted.
 *   - **EAR SIZE.** `cone-04` is a low broad dome standing **0.0845 proud**
 *     against the chinchilla's and the degu's big round ears. `home-pets.ts` says
 *     a gerbil's are "small and folded back".
 *
 * And against the **RAT**, which owns the long BARE tail, one warning that has to
 * be written down here because it is invisible from either side alone:
 * **`wedge-07` and `wedge-18` are the same bounding box to six decimals**
 * (0.200000 x 1.046587 x 0.555215) and differ in exactly one measurable thing —
 * `wedge-07` carries ONE band and cannot say "dark tip" at all, and `wedge-18`
 * carries two. That is the cleanest expression of this page's own bare/tufted
 * split, and it also means the rat cannot separate from this animal on tail
 * SHAPE. It has to separate on size and on ear, and it has the room to: a rat is
 * the biggest rodent here bar the guinea pig and this one is on the plain 1.250
 * cube.
 *
 * ## THE POSTURE CANNOT BE EXPRESSED, AND IT IS WHAT A CHILD NAMES THIS ANIMAL BY
 *
 * A gerbil is a back-heavy animal on long hind legs that sits up like a small
 * kangaroo. The kit cannot say any of it, and it is worth being exact about which
 * mechanism falls short of what, the way `animal-badger.ts` is about its stripe:
 *
 *   - **`CreatureDef.legs` is ONE ROW.** Its five fields are `x`, `y`, `z`,
 *     `paint` and `name` — there is no `part`, no `stretch`, and no per-station
 *     height. Four legs of one shape at one height is the entire vocabulary, so
 *     "the back pair is longer than the front pair" is not a thing that can be
 *     written down here. `box-01` is also the bank's ONLY leg shape, 1 shape over
 *     86 instances (§7), so there is no second leg to reach for either.
 *   - **AND THERE IS NO TALLER SHELL.** The obvious substitute — carry the
 *     uprightness in the body — is measured out: `box-21` is 1.505 tall and
 *     `animal-wolf.ts` measured it as **the standard 1.250 cube from y 0.18125 to
 *     1.43125 with two fused EAR LUGS on top**, so it is a canid head and a
 *     species wearing it may not have an ear feature at all. Every other 1.250
 *     shell is the cube plus one donor's own lump. The pack's height floor is
 *     1.43125 and the ceiling is the same cube.
 *
 * So this gerbil stands on all fours, and the thing that is missing is the thing
 * the flag says is missing. Nothing was authored to fake it, and the two
 * substitutes that were reached for are both refused below by arithmetic rather
 * than by taste.
 *
 * ## What was CONSIDERED AND REFUSED, so nobody helpfully adds it back
 *
 *   - **`box-25` as a HAUNCH — refused by the chamfer.** The koala's 0.7427 dish
 *     is one of only three side-mounting solids in the bank and the only one big
 *     enough to read as a thigh. §8 step 4: the cube's flat side face reaches only
 *     |z| = 0.3125 before the chamfer falls away 1:1, so a 0.348-deep disc placed
 *     back on the rump at z = -0.25 runs its rear edge to z = -0.424, a tenth of a
 *     unit past the flat face, and stands clear of a surface that has already
 *     receded. §3 says nothing floats. `animal-hamster.ts` refused the same shape
 *     for a cheek pouch on the same arithmetic, and §3.2 adds the other half:
 *     a big round disc on a small rodent is an EAR at tablet distance, and this
 *     page already has two animals whose separation is that their ears are big.
 *   - **`box-41`, the tiger's bigger shell — refused, and it belongs to the
 *     degu.** `home-pets.ts` says a degu is "tufted like a gerbil's, but a bigger
 *     animal", so the one shell in the bank that is bigger than the cube in every
 *     direction (1.350 x 1.300 x 1.350) is the degu's separation and not this
 *     animal's to spend. `animal-hamster.ts` also measured the tiger's chest ridge
 *     standing 0.100 proud in front of both eye cards.
 *   - **`box-31`, the lion's 1.125-deep shell — refused.** It buys 0.125 of
 *     keep-out and a gerbil does not need it at 1.028, and it buys it by making
 *     the body SHORTER front-to-back, which is the wrong direction: after the rat
 *     this is the longest-bodied of the six.
 *   - **`wedge-15`, the LION's tail — refused, and this is the near miss.** It is
 *     the only other tail Kenney cut at the tip (band 5, 40 triangles over local y
 *     0.2905 to 0.5412) and it is genuinely a tuft on the donor. But it is
 *     **0.280000 thick against 0.200000**, 1.4x on the axis this species is
 *     separated by, and `animal-goldfish.ts` already wears it as a caudal fin
 *     under JT-043. The thinner tail with the same cut is strictly the better
 *     answer here.
 *   - **A TUFT AS ITS OWN PART, hung on `on: 'tail'` — refused.** The anchor
 *     mechanism would put a small solid exactly on the tail's placed tip, which is
 *     what it is for, and it is the right answer for a tail Kenney did not cut.
 *     He cut this one. Adding geometry to say what band 3 already says would be
 *     §4 way 1 and way 2 both, for the same tuft, at 40-plus triangles.
 *
 * ## Every number, and where it came from
 *
 *   - **The hull, the legs and the eye PLANE are the pack's own.** `box-03` at
 *     [0, 0.80625, 0], four `box-01` sunk 0.408163 on the row at y = 0.18125 that
 *     never moves, and the eye cards on the absolute z = 0.6350. The cube is the
 *     one body in the pack that is equal on all three axes with nothing added to
 *     it; `animal-hamster.ts` carries that measurement in full.
 *
 *   - **The eyes are `plate-14`, the LARGEST card in the bank, and they are
 *     DARK.** 0.435472 x 0.442601 against the default `plate-01`'s 0.400 x
 *     0.320208 — **1.5048x the area** — at the panda's own recorded (0.258676,
 *     0.920023) on the panda's own 1.250 cube, unmoved, because §8 is explicit
 *     that the eye is the one placement that is never adjusted. The sclera is
 *     painted from the dark slot rather than the pale one, so it reads as the
 *     black bead a gerbil's eye actually is — `animal-salamander.ts`'s move, and
 *     the pack's own measured pupil still sits inside it as the catch-light.
 *
 *   - **The ears are `cone-04`, the hog's, and the transfer is EXACT rather than
 *     an inference.** The hog wears this shape on `box-03` — this same shell — so
 *     the donor transfer joins it at this hull's top face y = 1.43125, sinks it
 *     its own measured 0.714383 of 0.296026, and its centre lands on
 *     **1.367793 against the bank's recorded 1.367787** — six parts in a million,
 *     recovered from a solve that never read the number.
 *
 *     It is a low broad DOME and not a button — 0.403234 across, 0.296026 tall,
 *     taper 0.249 — which is a small ear lying back on a head rather than the
 *     round `box-02` the hamster and the dormouse both wear. At the pack's own
 *     station (0.300476, 0.347018) this cube's surface has fallen to y = 1.396732,
 *     so each ear stands **0.0845 proud of the nominal top face** and is still
 *     buried **0.1769** below the real surface — §3's floor is 0.125.
 *
 *   - **THE TAIL IS `wedge-18` AND IT CHOOSES ONE NUMBER: THE HEIGHT.** Joined at
 *     this cube's rear face z = -0.625 and sunk the tiger's own measured 0.137977,
 *     which puts its centre at z = -0.825995 against the bank's recorded
 *     -0.826000 — the donor's placement recovered, not copied — and its tip at
 *     z = -1.103595.
 *
 *     The height cannot transfer the same way, for the reason `animal-dormouse.ts`
 *     writes out: the recorded y = 1.186701 was measured on **`box-41`, the
 *     tiger's own hull, which is 1.300 tall**, and a number carried between shells
 *     of different heights stops meaning what it meant. What replaces it here is
 *     not a fraction but a BOUND, because this tail's root is small and this hull's
 *     rear face is not: **1.017050 is the lowest a gerbil can carry this tail with
 *     its whole join cross-section still on flat geometry.** Twenty-six of the
 *     part's points end up inboard of the rear plane, they run local y -0.5233 to
 *     -0.3411 and x +/-0.100, and at this height they land on world y 0.49375 to
 *     0.67595 inside a flat rear face that runs 0.49375 to 1.11875 across
 *     x +/-0.3125 — the lowest vertex exactly ON its bottom edge. A hair lower and
 *     the join plane starts hanging off a chamfer that has fallen away; the tiger's
 *     own 1.186701 is 0.17 higher and carries the tail over the back like a cat's.
 *     §3's "nothing floats" as a number, and it is the only chosen coordinate in
 *     this file.
 *
 *     `pets:creature` marks the join **`sunk 0.077 THIN`**, and it is right to
 *     print it and wrong to read it as a fault — the same note `animal-wolf.ts`
 *     and `animal-salamander.ts` both carry. 0.1249 is §3's floor for an EAR, and
 *     0.077 is the tiger's own measured burial of its own tail (0.137977 of an
 *     extent of 0.555215). Deepening it would mean discarding a measurement to
 *     satisfy a warning, and the bound above already guarantees the whole join
 *     cross-section is inside real geometry rather than near it.
 *
 *     **Band 3 is the tuft**, and at that height it spans world y 1.28345 to
 *     1.54035 — clear above the animal's own back at 1.43125, which is where a
 *     dark tip wants to be if a child is to see it from the island's three-quarter
 *     camera.
 *
 *   - **The face is the pack's one rodent's muzzle and the most forward-reaching
 *     small button on it, because a POINTED face is not in the bank.** Measured
 *     over all 28 shapes in the nose family, only FIVE taper below 1.000 at all,
 *     and not one of them is a muzzle this animal can wear: `cone-06` at taper
 *     0.000 is the parrot's BEAK and is §3.2's travelling identity — a read that
 *     survives being moved, like a tongue or a claw; `wedge-01` and `wedge-02` at
 *     0.469 are the beaver's INCISORS, which the vole wears as teeth; `wedge-10`
 *     at 0.707 is measurably a nose TIP and reads as a tongue, and Joe rejected it
 *     by name on the hedgehog; and `box-08` at 0.890 is the bunny's BLUNT muzzle,
 *     which is barely a taper and which the vole already wears three-quarters
 *     buried in a top face. **Every actual muzzle in the family — every tube — is
 *     taper 1.000, which is to say a barrel.** So the pointed face is an
 *     approximation, and it is made of two honest parts:
 *
 *       - `tube-01`, the BEAVER's muzzle, and the beaver is the pack's one rodent.
 *         Joined at the front face z = 0.625 with the beaver's own sink of 0.000,
 *         its centre lands on z = 0.710803 — the recorded offset to six decimals,
 *         because the beaver wears it on this same cube.
 *       - `box-22`, the fox's nose, anchored `on: 'snout'` so the builder puts it
 *         on the muzzle's own placed front plane rather than near it. It is the
 *         furthest-REACHING of the pack's small nose buttons — 0.155703 of depth
 *         at the fox's own sink of 0.000, against `box-09`'s 0.079825 and
 *         `box-32`'s 0.170703 buried 0.293 — so it is as much point as the bank
 *         has. At 0.229 x 0.151 nothing about it reads as a fox.
 *
 *   - **THE BELLY IS PAINTED AT 6/16, AND 8/16 WOULD BE WRONG ON THIS ANIMAL.**
 *     This is the one marking a gerbil has that the mechanism can say EXACTLY, and
 *     it is worth saying why. `Paint.patch` paints one LEVEL boundary across the
 *     part, dead flat over every face and chamfer whatever the tessellation (§4) —
 *     and a Mongolian gerbil's belly line genuinely is level and genuinely is
 *     sharp: sandy agouti above, white below, with no gradient between them. The
 *     badger's marking was a z-region and unsayable; this one is a plane, so the
 *     mechanism is not a compromise here, it is the right tool.
 *
 *     The height is where it differs from every other mammal built so far. §7
 *     measured the pack's own boundary off the tiger as a ZONE running 0.4808 to
 *     0.5481 of the hull, and 8/16 is the only grid point inside it — that is the
 *     squirrel's, the mouse's, the dormouse's, the badger's and the hamster's. **A
 *     tiger's pale runs high up the flank and a gerbil's does not.** The white on
 *     this animal is the ventral surface and the bottom of the flank, and 6/16
 *     puts it there: world y **0.65**, which is 0.15625 above y = 0.49375, where
 *     this cube's own bottom chamfer finishes rising and the flat flank begins —
 *     an eighth of the hull's own height, 2/16 on the pack's grid. So the white
 *     covers the whole underside plus an eighth of the side, and stops in a
 *     straight line. 8/16 would be a tiger's belly on a
 *     gerbil, and 4/16 would paint the underside only and be invisible from the
 *     camera the island actually uses.
 *
 *   - **The palette has never been signed off**, because this species has never
 *     had colours: `home-pets.ts` carries one line per member and no palette, and
 *     the kit build that once had one was deleted with the other fifty-eight under
 *     PB-036. All four below are the first ever proposed for it and all four are
 *     marked UNREVIEWED.
 *
 * **FLAGGED**, for the posture and for the palette, and for nothing else. Nothing
 * was strained: 735 triangles and 531 vertices against the pack's 422-951 and
 * 405-1626 (403 in the body against 236-1114), height **1.5403** inside 1.43-2.02
 * with the feet on zero, keep-out **1.028** against the fox's own 1.15 — the tail
 * is what costs it, 2.056 of depth against 1.250 of width — the hull at the
 * shell's own size, every
 * part joined at a face its donor joined its own to, every sink the pack's own
 * measured value, nothing spun, nothing stretched and nothing authored.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

export const GERBIL_ASSEMBLY = defineCreature('animal-gerbil', {
  palette: {
    coat: 0xb8874a,    // UNREVIEWED: warm sandy agouti — the first proposed for this species
    belly: 0xf7f3e9,   // UNREVIEWED: the sharply demarcated white underside
    tuft: 0x2f2721,    // UNREVIEWED: the tail's dark tip, the nose, and the eye's own dark
    limb: 0x8f6636,    // UNREVIEWED: the legs and the muzzle, a shade under the coat
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* 6/16, NOT the usual 8/16. The pack's mammal line is the TIGER's, whose pale
   * runs high up the flank; a gerbil's white is the underside and the bottom of
   * the flank, cut level and cut sharp. 6/16 lands on world y 0.65, two sixteenths
   * above the 0.49375 where this cube's bottom chamfer finishes rising. */
  belly: 0.375,

  /* The hog's low broad dome, on the hog's own numbers on the hog's own hull — the
   * transfer recovers 1.367793 against the recorded 1.367787. Small and lying
   * back: 0.0845 proud, 0.1769 buried, against the big round ears the chinchilla
   * and the degu are separated by. */
  ears: 'cone-04',

  /* The bank's LARGEST eye card, 1.506x the default's area, at the panda's own
   * recorded point — and painted from the dark slot, because a gerbil's eye is a
   * black bead with no sclera showing. The pack's own pupil is the catch-light. */
  eyes: { part: 'plate-14', paint: 'tuft' },

  /* THE ANIMAL. The bank's joint-thinnest tail, 0.200 on its thin axis, with
   * Kenney's OWN tip cut painted dark: band 3 is the outer 24.5% of its length. A
   * degu's brush is a thicker SHAPE; this tuft is a cut on a slim tail.
   *
   * The one chosen coordinate in this file, and it is a bound rather than a taste:
   * 1.017050 is the lowest this tail can be carried with its whole join
   * cross-section still on the flat rear face — the inboard points land on
   * y 0.49375 to 0.67595 inside a face that runs 0.49375 to 1.11875. */
  tail: {
    part: 'wedge-18',
    paint: { base: 'coat', byBand: { 3: 'tuft' } },
    at: [0, 1.01705, -0.625],
  },

  /* The beaver's muzzle — the pack's one rodent's — recovering its own 0.710803,
   * with the fox's button on its placed front plane. Not `cone-06`, which is a
   * BEAK, and not `wedge-10`, which reads as a tongue: the bank has no pointed
   * muzzle and this is the nearest honest thing to one. */
  snout: 'tube-01',
  nose: { part: 'box-22', paint: 'tuft' },

  flag: 'THE UPRIGHT, BACK-HEAVY POSTURE CANNOT BE EXPRESSED, and it is what a child names '
    + 'a gerbil by: long hind legs that let it sit up like a tiny kangaroo. `CreatureDef.legs` '
    + 'is ONE ROW with five fields — x, y, z, paint, name — so there is no per-station height, '
    + 'no second leg shape (`box-01` is the bank\'s only leg, 1 shape over 86 instances) and no '
    + 'way to say "the back pair is longer". Carrying it in the BODY instead is measured out '
    + 'too: the pack\'s ten shells all stop at the 1.250 cube bar two — the tiger\'s, which is '
    + '1.300 and bigger in every direction (that is the degu\'s separation, not this animal\'s), '
    + 'and `box-21`, which `animal-wolf.ts` measured as the standard cube with two fused EAR '
    + 'LUGS on top, so it is a canid head and its wearer may have no ears at all. So this '
    + 'gerbil stands on all fours. What it DOES have is the rest '
    + 'of the animal, and all of it is measured: the bank\'s joint-thinnest tail (0.200 against '
    + 'the thick group\'s 0.589-0.744) wearing Kenney\'s own tip cut painted dark — band 3, the '
    + 'outer 24.5% of its length, which is the tuft and is what separates this animal from the '
    + 'degu\'s brush; the largest eye card in the pack painted as a black bead; small ears '
    + 'lying back at 0.0845 proud; and a WHITE BELLY cut level at 6/16 rather than the pack\'s '
    + 'usual 8/16, because the 8/16 line is the tiger\'s and a tiger\'s pale runs high up the '
    + 'flank where a gerbil\'s stops at the bottom of it. Also yours to rule on: THE PALETTE IS '
    + 'NEW AND UNREVIEWED — this species has never had colours in `home-pets.ts` and these four '
    + 'are the first ever proposed for it. Nothing here is stretched, spun or authored.',
})
