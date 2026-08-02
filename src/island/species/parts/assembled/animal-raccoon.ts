/**
 * The raccoon — and Night Time's version of the badger's problem, with one more
 * mechanism available than the badger had.
 *
 * ONE SPECIES, ONE FILE. `register.ts` says why the one appended line in
 * `index.ts` is the whole of the wiring.
 *
 * ## What this animal IS, and what the texture system can and cannot say
 *
 * A raccoon is not a shape. It is **a black mask across the eyes and a ringed
 * tail**, and `animal-badger.ts` already wrote down, in detail, why a marking
 * that IS the animal is the hardest thing this kit does:
 *
 *   - **`Paint.patch`** — §4's way 2 — takes one number, `at`, and that number is
 *     a HEIGHT. It paints ONE level boundary across a whole part and it has no z
 *     term, so *"the front of this is dark"* is a sentence it cannot form; and a
 *     mask needs TWO boundaries, not one, so even a level band is out of reach.
 *   - **`byBand`** — §4's way 1 — can only cut where Kenney already cut.
 *   - **A flat card** is the third route, and `animal-salamander.ts` shipped it:
 *     a `plate-10` / `plate-11` blotch, spun onto another face and placed by
 *     hand, four times.
 *
 * The badger had none of the three reach its marking. This animal gets two of
 * them to reach part of it, and the part they do not reach is in the `flag`.
 *
 * ## FINDING: `box-36` CAN say "the front of this hull is a different colour"
 *
 * The badger's flag says that statement is unsayable. It is unsayable *with
 * `patch`*, and it is unsayable on `box-03`, which has **one** band over all 60
 * of its triangles. It is not unsayable on the panda's shell.
 *
 * `box-36` is a 1.250 cube — the same size, the same offset `[0, 0.80625, 0]`,
 * the same chamfer pattern, 72 triangles against the plain cube's 60 — and
 * Kenney cut it **front-to-back**:
 *
 *   - **Band 3, 28 triangles.** Both flat end faces entire — the front plane
 *     z = +0.625 is two triangles and both are band 3, and so is the rear plane —
 *     plus the chamfers that wrap up and around them, over local y -0.5 to
 *     +0.625.
 *   - **Band 15, 44 triangles.** The two sides, the top and the bottom.
 *
 * So one `byBand` entry paints **the whole 0.625-square face a raccoon's face is
 * drawn on**, in a colour of its own, with no geometry, no card and no patch.
 * That is the sentence the badger could not write, and it is written here.
 *
 * The cost is honest and is stated rather than hidden: **the rear face goes pale
 * with the front**, because Kenney's cut is symmetric — it was a panda's white
 * head and white rump. A raccoon's rump is not pale. That is 2 flat triangles
 * and their chamfers at the back of the animal, against a pale face at the front
 * of it, and it is a trade this file takes deliberately.
 *
 * ## THE MASK — what it actually is, measured
 *
 * `plate-11` is the cow's, dog's and giraffe's larger flank patch: 10 triangles,
 * **zero thickness** (`size[0]` is exactly 0), 0.400 x 0.433013, attaching `x +1`.
 * `{ axis: 'y', deg: -90 }` takes `x +1` to `z +1` and swings the card into the
 * x-y plane, **0.433013 wide and 0.400 tall** — rule 4 as amended, baked into the
 * copy's vertices. That is the salamander's trick on a third face.
 *
 * Three numbers place it and none of them is chosen:
 *
 *   - **x = 0.2165065, which is half the card's own width.** It is the only
 *     station at which the mirrored pair meets on the midline with no gap and no
 *     overlap, so the two cards build **one continuous bar 0.866026 wide** across
 *     the face rather than two patches. A raccoon's mask is a band, not a pair of
 *     spots.
 *   - **y = 0.933646, the eye card's own recorded height.** The bar is centred on
 *     the eye plane, so it runs **0.0399 clear above and below each eye** — the
 *     two cards' own built half-heights, 0.2000 against 0.1601.
 *   - **z = 0.6300, which is the midpoint of the pack's own card daylight.** The
 *     hull's front face is 0.625 and `EYE_CARD_Z` is 0.6350 — the 0.010 of air
 *     the pack gives a flat card, measured at standard deviation 0.0000 over all
 *     48 of them. The mask has to be OUTSIDE the hull and BEHIND the eye, and
 *     0.6300 is the one point that clears each by the same 0.005. Joined at
 *     0.625 with the bare donor transfer it would be coplanar with the face and
 *     z-fight it; that is the same problem `animal-salamander.ts` solved with the
 *     same 0.010, quoted rather than invented.
 *
 * **What it gives, measured.** A continuous dark bar 0.866026 x 0.400 across the
 * face at eye height, on a pale face, with the eyes sitting in it. Both eye cards
 * are inside it in y entire; in x each eye runs 0.0625 to 0.4625 and the bar
 * reaches 0.4330, so **the outer 0.0295 of each eye stands proud of the mask** —
 * about a fourteenth of the card. And the bar reaches past the flat front face
 * (+/-0.3125) onto the chamfer, exactly as **the pack's own eye card does on
 * sixteen of the twenty-four**: the eye reaches 0.4625 and the mask only 0.4330,
 * so nothing here stands further clear of the hull than Kenney's own eye already
 * does.
 *
 * **What it does not give is in the `flag`**: the white brow and white cheek that
 * frame a real raccoon's mask above and below are a second and a third boundary,
 * and there is no mechanism for either.
 *
 * ## THE TAIL — one ring, and it is the tail's own
 *
 * `box-23` is the fox's brush, and it is here on its merits rather than by
 * association: **its section is ROUND** — y and z both 0.910248, identical to six
 * decimals, where every other tail in the bank is 1.4:1 or worse — **it barely
 * narrows** (taper 0.961469 against the parrot's 0.839 and the beaver's 0.577),
 * and it is **1.67x the volume of any other tail**. A round, thick, untapering
 * cylinder of fur is a raccoon's tail more exactly than it is anything else's,
 * and it is the only thick tail in the bank Kenney cut in two.
 *
 * That cut is band 5: 30 of its 92 triangles, over local **y -0.0238 to +0.4551
 * and z -0.4551 to +0.0238**. The shape's facing is `z -1`, so local -z is the
 * end away from the body: band 5 is **the TOP half of the TIP half**, and it is
 * where the real fox's tail changes colour too. Painted dark it is a dark tail
 * tip, which is where a raccoon's tail also ends.
 *
 * **It is ONE boundary and it wraps only the upper half.** A raccoon has five to
 * seven full rings. There is no second cut on this shape and no other thick tail
 * in the bank has even one, so the rings are not awkward here, they are
 * unsayable — the badger's word, and it is the right one. In the `flag`.
 *
 * **`box-23` is shared** with `animal-squirrel`, which carries it UP the rear
 * chamfer, and with `animal-fennec-fox`, which is a fox and wears it as one.
 * Reuse is house style — Kenney drew one leg and used it 86 times.
 *
 * ## Every other number, and where it came from
 *
 *   - **The legs and the belly are the pack's own**, unmentioned below beyond one
 *     word: four `box-01` sunk 0.408163 on the row at y = 0.18125 that never
 *     moves, and the belly at **8/16** — the tiger's mammal line made exact, the
 *     only point on the pack's 1/16 grid inside §7's measured 0.4808-0.5481 zone,
 *     and also this cube's own equator. Unlike `animal-wolf.ts`'s hull, this one
 *     is all body, so the usual number is the right one here.
 *
 *   - **The ears are `box-02`, the beaver's and the polar bear's**, and the
 *     transfer is exact rather than an inference: four donor instances, one
 *     recorded value, and both donors wear it on a 1.250 cube. Joined at this
 *     hull's top face y = 1.43125 and sunk its own 0.777778, its centre lands on
 *     **y = 1.343750, the bank's recorded offset, recovered** — and the x 0.4475
 *     and z 0.2475 are the donors' own, untouched by the join. A small round
 *     button set well out on the head, which is a raccoon's ear.
 *
 *     Its **band 7 is Kenney's own inner-ear cut** — 10 triangles on the ear's
 *     forward face, x and y within +/-0.1057 at z = +0.1025 — painted pale for one
 *     line and no geometry, which is §4's first way to two-tone.
 *
 *   - **The muzzle is `tube-06`, the fox's, and it is here for its CUT.** It and
 *     the deer's `tube-03` are the same bounding box to six decimals and are
 *     different meshes; `tube-06` is the one Kenney split, into a lower 20
 *     triangles (band 3) and an upper 14 (band 7). The upper painted dark is the
 *     **bridge of the mask carried down the muzzle**, which is where a raccoon's
 *     mask actually goes, and it is the second thing the marking gets for free.
 *     Joined at the front face z = 0.625 and sunk its own 0.000, its centre lands
 *     on **z = 0.740710, the fox's own recorded offset to six decimals.**
 *
 *   - **THE NOSE IS `box-22` AND IT IS SUNK 0.5, WHICH IS A RECOVERY.** The
 *     bank records this shape's burial as 0.000, and that number is measured
 *     against the HULL — where it is true, because the fox's nose-tip is entirely
 *     outside its hull. But the fox does not wear its nose on its hull, it wears
 *     it on its muzzle, and against the muzzle the burial is different: this same
 *     `tube-06` presents its front plane at z = **0.856420** on a 1.250 cube, and
 *     the bank's recorded centre for `box-22` is **0.856799**. The fox centres its
 *     nose-tip ON the muzzle's front plane — 3.8e-4 apart, which is the bank's own
 *     rounding — and on a symmetric part that is `sink: 0.5` exactly. So the
 *     override is the fox's own placement recovered, not a number picked to make
 *     something fit; and `on: 'snout'` still anchors it to the muzzle's real
 *     placed plane rather than to an arithmetic this file would carry a copy of.
 *
 *     It is worth 0.078 of reach, which is the whole difference between this
 *     animal's keep-out and the fox's — see below. `pets:creature` marks it
 *     **`sunk 0.078 THIN`** and it is right to print it and wrong to read it as
 *     a fault, exactly as on `animal-salamander.ts`'s tail: 0.1249 is §3's floor
 *     for an EAR, and 0.078 is half of a nose 0.155703 deep. Deepening it past
 *     the fox's own arrangement to clear a threshold would be discarding a
 *     measurement to satisfy a warning.
 *
 * ## THE PALETTE IS NEW AND NOBODY HAS SIGNED IT OFF
 *
 * This species has never been in a collection file, so it has never been given
 * colours. Every one below is the first ever proposed for it and every one is
 * marked UNREVIEWED. **Joe should look at them**, particularly `face` — it is a
 * whole slot spent on Kenney's own front-and-rear cut, which is the finding this
 * animal turns on.
 *
 * **Flagged**, for the marking and for the palette. Nothing else strained.
 * Nothing is stretched at all — there is no non-uniform stretch anywhere on this
 * animal. Measured on the built model: height **1.5012** inside 1.43-2.02, feet
 * on y = 0; **keep-out 1.154 against the fox's own 1.154**, which is not a
 * coincidence — it is the same brush at the same burial and the same nose on the
 * same muzzle, so this animal is the fox's own footprint to three decimals; 658
 * triangles inside 422-951, 511 vertices inside 405-1626 and 383 in the body
 * inside 236-1114.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'
import { EYE_CARD_Z } from '../hulls'

/**
 * Half `plate-11`'s own width once it is turned onto the face — the one station
 * at which the mirrored pair meets on the midline with no gap and no overlap, so
 * the mask builds as ONE bar rather than two patches.
 */
const MASK_X = 0.433013 / 2

/**
 * The midpoint of the pack's own card daylight.
 *
 * The hull's front face is 0.625; `EYE_CARD_Z` is 0.6350, measured at standard
 * deviation 0.0000 over all 48 cards in the pack. The mask has to be outside the
 * hull and behind the eye, and this is the one point that clears each by the same
 * 0.005. Joined at 0.625 it would be coplanar with the face and z-fight it.
 */
const MASK_Z = (0.625 + EYE_CARD_Z) / 2

/** The eye card's own recorded height — the mask is centred on the eye plane. */
const EYE_Y = 0.933646

export const RACCOON_ASSEMBLY = defineCreature('animal-raccoon', {
  palette: {
    coat: 0x6f6a63,    // UNREVIEWED: grizzled grey-brown, the first proposed for this species
    belly: 0xc9c2b6,   // UNREVIEWED: the underside, the sclera, the inner ear
    face: 0xd9d3c7,    // UNREVIEWED: Kenney's own front-and-rear cut on box-36 — the pale face
    mask: 0x2b2a2e,    // UNREVIEWED: the mask bar, the muzzle's bridge, the nose, the tail's tip
    limb: 0x574f47,    // UNREVIEWED: the legs, a shade under the coat
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* THE FINDING. The panda's cube — same size, same offset, same chamfers as the
   * plain one, 72 triangles against 60 — cut FRONT-TO-BACK. Band 3 is both flat
   * end faces entire plus the chamfers around them, so one entry paints the whole
   * 0.625 square a face is drawn on. `animal-badger.ts` says that sentence cannot
   * be formed; it cannot be formed with `patch`, and it can be formed here. The
   * rear face goes pale with the front, which is the price and is paid knowingly. */
  hull: { part: 'box-36', paint: { base: 'coat', byBand: { 3: 'face' } } },

  /* 8/16 — the tiger's mammal line made exact, the only 1/16 point inside §7's
   * measured zone, and this cube's own equator. This hull is all body, so unlike
   * `animal-wolf.ts`'s the usual number is the right one. */
  belly: 0.5,

  /* The fox's brush, on its own merits: round section (0.910248 on both axes),
   * taper 0.961, 1.67x the volume of any other tail — and the only thick tail in
   * the bank Kenney cut. Band 5 is the top half of the TIP half, painted dark: a
   * dark tail tip, which is one boundary where a raccoon has five to seven. Pure
   * donor transfer otherwise — its own facing, its own 0.177404 burial, no spin,
   * no stretch, no `at`, so its centre recovers the fox's own recorded z. */
  tail: { part: 'box-23', paint: { base: 'coat', byBand: { 5: 'mask' } } },

  /* The beaver's and the polar bear's button, set well out on the head. Four
   * donor instances and one recorded value, both donors on a 1.250 cube, so the
   * transfer is exact: joined at y = 1.43125, sunk 0.777778, centre recovers
   * 1.343750. Band 7 is Kenney's own inner-ear cut on its forward face. */
  ears: { part: 'box-02', paint: { base: 'coat', byBand: { 7: 'belly' } } },

  /* The fox's muzzle, for Kenney's own horizontal cut: pale to the lip (band 3)
   * with the mask's bridge carried down over it (band 7, the upper 14). */
  snout: { part: 'tube-06', paint: { base: 'face', byBand: { 7: 'mask' } } },

  /* The fox's own nose-tip on the fox's own muzzle, at the fox's own depth. The
   * bank's 0.000 is measured against the HULL; against the muzzle the fox centres
   * this shape on the front plane (0.856799 recorded against 0.856420 placed —
   * 3.8e-4, the bank's rounding), and on a symmetric part that is sink 0.5. */
  nose: { part: 'box-22', paint: 'mask', sink: 0.5 },

  /* THE MASK. The cow's, dog's and giraffe's larger flank card, turned from its
   * own `x +1` onto `z +1` and swung into the x-y plane — 0.433013 wide, 0.400
   * tall, zero thickness, and given none. The pair meets exactly on the midline,
   * so it is ONE bar 0.866026 across the face, centred on the eye plane, sitting
   * in the middle of the pack's own 0.010 of card daylight. */
  extras: [
    {
      name: 'mask',
      part: 'plate-11',
      paint: 'mask',
      kind: 'pair',
      spin: [{ axis: 'y', deg: -90 }],
      at: [MASK_X, EYE_Y, MASK_Z],
    },
  ],

  flag: 'THE MASK IS HALF SAYABLE AND THE RINGS ARE NOT SAYABLE AT ALL, and on a raccoon '
    + 'they ARE the animal. What IS here: a continuous dark bar 0.866 x 0.400 across the '
    + 'face at eye height, built from two of the cow\'s flank cards turned onto the front '
    + 'and meeting exactly on the midline; a PALE FACE under it, which is a real find — '
    + '`box-36`, the panda\'s cube, is the same 1.250 shell as the plain one but Kenney cut '
    + 'it FRONT-TO-BACK, so one `byBand` entry paints the whole face plane, which is the '
    + 'sentence animal-badger.ts records as impossible and which `patch` genuinely cannot '
    + 'form; the mask\'s bridge carried down the muzzle on the fox nose\'s own upper band; '
    + 'and a dark tail TIP on the fox brush\'s own cut. What is MISSING, measured: the WHITE '
    + 'BROW and WHITE CHEEK that frame a real mask above and below are a second and a third '
    + 'boundary and there is no mechanism for either — `patch` takes one number and it is a '
    + 'height; and the TAIL RINGS are one half-wrapping boundary where a raccoon has five to '
    + 'seven, because band 5 is the only cut on the only thick tail in the bank that has one. '
    + 'Also: the pale front face comes with a pale REAR face, because Kenney\'s cut is '
    + 'symmetric — it was a panda\'s white head and white rump. NEW PALETTE, UNREVIEWED: this '
    + 'species has never been in a collection file, so these six colours are the first ever '
    + 'proposed for it. Nothing was authored and nothing was stretched to fake any of it.',
})
