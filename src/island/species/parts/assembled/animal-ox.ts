/**
 * The ox — Farm's heavy draught bullock, and the first animal in the pack to
 * wear a HORN.
 *
 * ONE SPECIES, ONE FILE. `register.ts` says why the one appended line in
 * `index.ts` is the whole of the wiring.
 *
 * ## READ `animal-horse.ts` FIRST. This file does not restate it.
 *
 * The horse is the hooved-quadruped exemplar and four things come from it
 * unchanged and unargued here: JT-044's two-tone leg line, character for
 * character (`animal-horse.ts:373-392`, derived at `animal-pony.ts:289-321`);
 * that a hull can never be stretched, so proportion is a choice of shell;
 * that `patch` and `byBand` are separate mechanisms and only one of them can
 * own a boundary; and that the right answer to a feature this animal does not
 * have is to REFUSE it with the arithmetic rather than to spend it.
 *
 * The horse also left this species its hull on purpose (`animal-horse.ts:282`),
 * and this file is where that reservation is cashed.
 *
 * What is this animal's own, and what the water buffalo should take from it:
 *
 *   1. **`box-12`'s two fused ear lugs ARE this animal's ears, and that is why
 *      an ox takes the shell an equid cannot.** §1.
 *   2. **A HORN out of the elephant's tusk, and the two numbers that are forced
 *      rather than chosen.** §2 — including the proof that no UNIFORM scale of
 *      that tusk can read as a horn at all.
 *   3. **The muzzle fills the whole face below the eyes and stops there**, and
 *      neither of those two numbers was picked for the other. §3.
 *   4. **A second two-tone line, TAKEN this time** — the tail switch — where the
 *      horse refused its second one. The difference is arithmetic. §4.
 *
 * ## 1. THE HULL IS `box-12`, AND ITS EXTRA WIDTH IS THE EARS
 *
 * `animal-badger.ts:36-64` measured this shell and the finding is the whole
 * reason an ox is on it: **`box-12` is the 1.250 cube with two EAR LUGS fused
 * on.** Its torso is the cube to the millimetre and all 0.289 of its extra width
 * is 15 points a side running x = 0.625 out to 0.7697, at (world) y 1.17705 to
 * 1.35375 and z 0.3500 to 0.5000 — high, forward, and exactly where a cow and a
 * deer wear their ears. Neither donor has a separate ear record in the bank,
 * which is the confirmation.
 *
 * `animal-horse.ts:282-287` refuses the shell for precisely that: *"wearing it
 * is four ears or no upright ears, and upright ears are half of what makes this
 * a horse rather than a big dog."* **An ox wants no upright ears.** Its ears are
 * low, sideways lugs BELOW the horns, which is what these are, so the sentence
 * that disqualifies an equid is the sentence that qualifies a bovine. So there
 * is no `ears` entry on this species and none is missing — and `cone-01`, the
 * pony's and the horse's upright ear, is left where it was.
 *
 * The lugs carry Kenney's own inner-ear cut, **band 5, 12 triangles, the flat
 * forward face of each lug**, painted `limb`. That is a shaded ear hollow for
 * one `byBand` entry and no geometry, and it is deliberately the same line
 * `animal-badger.ts:141` and `animal-degu.ts:212` already wear: the cut is
 * Kenney's, the two of them found it, and there is nothing else those twelve
 * triangles could honestly be.
 *
 * The four flat plates this file then spends, measured off the shell's own 112
 * vertices at its recorded offset (0, 0.80625, 0). All four are **identical to
 * `box-03`'s**, because the lugs are the only thing `box-12` adds:
 *
 *     top plate      y = 1.43125, |x| and |z| <= 0.3125
 *     front plate    z =  0.625,  |x| <= 0.3125, y 0.49375 to 1.11875
 *     rear plate     z = -0.625,  |x| <= 0.3125, y 0.49375 to 1.11875
 *     flank          x = +-0.625, y 0.49375 to 1.11875
 *
 * ## 2. THE HORN: THE ELEPHANT'S TUSK, AND WHAT IS FORCED ABOUT IT
 *
 * **There is no horn in the bank.** `BAKED_ROLES` has no such role and every
 * shape whose only job was a horn was discarded at generation time. The most
 * horn-like thing in all 94 parts is `wedge-11`/`wedge-12` — the ELEPHANT'S
 * TUSK, 0.3087 x 0.306936 x 0.445163, taper 0.391, handed, `tooth` role, worn by
 * nothing in the pack until now. `kind: 'pair'` mirrors the right-hand
 * `wedge-11` into the left, so `wedge-12` is the same shape by another name and
 * is not reached for.
 *
 * **THE JOIN IS THE TOP-SIDE BEVEL'S CHORD MIDPOINT, (0.46875, 1.275), and it is
 * the same chord midpoint the horse used on its BROW** (`animal-horse.ts:219-236`)
 * — because both are the cube's own bevel and `box-12` is the cube. The facing
 * is that chord's own 45-degree normal, out and up, reached with
 * `{ y: 90 }` then `{ z: 45 }`: the first turns the tusk's +z axis into +x so it
 * points sideways, the second lifts it 45 degrees. Sideways, then up, which is
 * the shape of an ox's horn and is the reason those are the two angles.
 *
 * The horse's brow finding repeats here and is worth having on a second hull:
 * **the shell's real surface does not pass through the chord.** Ray-cast along
 * the 45-degree normal from (0.46875, 1.275), `box-12` answers at **0.044195
 * beyond it, constant for every |z| <= 0.3125** — Kenney bevels the cube through
 * its corner points (+-0.5, +-0.5, +-0.5) rather than as a flat 45-degree quad.
 * So a part joined at the chord midpoint is embedded by construction: the horn's
 * root sits 0.2511 + 0.0442 = **0.2953 below the real surface along its own
 * axis, and all 8 of its sub-plane vertices are inside the mass with NO
 * daylight** — against the horse's own best seating of 16 of 20 with 0.028.
 *
 * **z = 0.125 is 2/16 and is the largest grid station that fits.** The horn's own
 * z footprint is +-0.173700, so 2/16 puts it at -0.0487 to 0.2987, inside the
 * bevel's own +-0.3125 with 0.0138 to spare; 3/16 would run to 0.3612 and hang
 * off the corner. That also sets the horns behind the ear lugs (z 0.35 to 0.50)
 * rather than through them: **zero horn vertices land in the lug's box.**
 *
 * **THE STRETCH IS TWO NUMBERS, BOTH ON THE PACK'S 1/16 GRID, AND THE SECOND ONE
 * IS FORCED.** Take "a horn is longer than its own base is thick" as the bar —
 * below it the thing is a boss and not a horn:
 *
 *   - **x = y = 18/16 = 1.125.** The root then measures 0.347287 across the bevel
 *     chord's own 0.441942, which is 78.6% of it, leaving 0.047327 a side. That
 *     is as thick as this face carries with a margin, and thick-based is what an
 *     ox's horn is.
 *   - **z = 24/16 = 1.5, and a UNIFORM scale could never have worked.** At any
 *     uniform scale the tusk shows `0.445163 x 0.624034 = 0.277820` of length for
 *     `0.3087` of base — a ratio of **0.8999, fixed, whatever the scale is**. So
 *     the wedge is thicker than it is long, permanently, and the only way out is
 *     a non-uniform stretch. With the hull's own 0.044195 of bevel bulge also
 *     taken off the proud length, z must reach **1.40924** before the visible
 *     horn is as long as its base is thick. 24/16 is the first grid station past
 *     it. Measured out: length 0.6677, buried 0.2511, **0.4167 proud of the join
 *     plane and 0.3725 proud of the real surface**, against a 0.3473 base —
 *     **1.0726 times as long as it is thick. A SHORT horn, by one part in
 *     fourteen, which is the separation from the water buffalo's sweep.**
 *
 * It costs the animal nothing it did not already spend. The horns reach
 * |x| = 0.845756 where the lugs reach 0.7697, so they set the width at 1.691512
 * — but the DEPTH is 1.8752 (muzzle 0.825 to tail -1.0502), so `max(width,
 * depth) / 2` is still the depth's 0.9376 and the horns are free.
 *
 * **A DARK-TIPPED HORN IS REFUSED, and the reason is which way `patch` runs.**
 * `below` paints UNDER the line and this horn's low end is its ROOT (y 1.0052) —
 * so the tool can only darken the base and leave the tip pale, which is the
 * inverse of every real horn. There is no mechanism that draws it the right way
 * up on a part that points up. Plain pale bone, and the arithmetic is recorded so
 * the water buffalo and the goat do not try it.
 *
 * ## 3. THE MUZZLE: BROAD, BLUNT, AND IT STOPS AT THE EYE
 *
 * `box-24` is the HOG'S NOSE-TIP, 0.400 x 0.400 x 0.200, a blunt disc with zero
 * measured burial. Worn here as the whole muzzle rather than as a nose, stretched
 * **[1.5, 0.7, 1]** to 0.600 x 0.280 x 0.200: 0.600 across a front plate that is
 * 0.625 wide, so it is as broad as the face allows less 0.0125 a side, and 0.200
 * proud with no taper at all. That is a bovine muzzle — a flat wide pad — and it
 * is not `tube-06` (the fox barrel the pony, badger and wolf wear) or `tube-07`
 * (the horse's), both of which are round-sectioned faces on longer-nosed animals.
 *
 * **Its height is solved from the hull and lands on the eye card by accident.**
 * `box-24`'s measured burial is 0.000000, so — exactly as with `box-18` in §4 —
 * its whole join cross-section has to be on flat geometry, and that fixes it:
 * sit its bottom edge on the flat front plate's own bottom, 0.49375, and its
 * centre is `0.49375 + 0.140 = 0.63375` and its top edge is at **0.77375**. The
 * eye card's bottom edge — `plate-01`, 0.400 x 0.320208, at the card's own
 * recorded (0.2625, 0.933646) — is at **0.773542**. The two cross by
 * **0.000208**, which occludes **0.039%** of the card's drawn area against the
 * 3.61% `box-41`'s muzzle boss costs the horse (FARM-DIGEST §8.1). Neither
 * number was chosen for the other: one is where the hull's flat geometry starts
 * and the other is where the pack's eye card ends, and the plate wins the
 * 0.000208 because the plate is the thing the part has to be seated on. **The
 * muzzle fills the whole of the face below the eyes and stops there.**
 *
 * **NO `nose`.** `box-24` IS the pack's nose-tip; a nose-tip on a nose-tip is a
 * pimple. The muzzle is painted `hoof` — the same dark this animal's hooves are
 * — because a bovine's muzzle pad is bare slate skin and not hair.
 *
 * ## 4. THE TAIL, AND A SECOND TWO-TONE LINE THAT IS TAKEN
 *
 * `box-18` is the elephant's TRUNK under Kenney's wrong name, the bank's only
 * stub tail and the only one with `sunkFractionMean` exactly 0.000000 — so its
 * whole join cross-section has to land on flat geometry.
 * `animal-badger.ts:83-90` solved that on this exact hull and the solve is not a
 * choice: at **y = 0.80625, `box-12`'s own recorded centre**, its 0.6230 root
 * fits inside the 0.6250 flat rear plate with 0.001 to spare at each end, and no
 * other height does. `{ y: 180 }` turns its recorded `z +1` to `z -1` so it hangs
 * off the back. It runs from the plate at y 1.11775 back and down to a thin tip
 * at (y 0.49475, z -1.0502).
 *
 * **THE SWITCH IS A `patch`, and this is the second use of JT-044's tool on this
 * animal — where the horse refused its second one.** The difference is that a
 * flaxen chestnut carries no boundary above its coronet, and **every ox in the
 * world has a dark switch on the end of a red tail.** The tool is not being
 * spent to be spent; the marking is on the animal.
 *
 * And the number is the shape's, not a taste. `box-18`'s vertices sit in rings,
 * and there is a **0.1601 gap between the last ring of the thin whippy tip
 * (y 0.5839) and the first ring of the thick base (y 0.7440)** with no geometry
 * in it at all. k/16 for k in 3..6 all land inside that gap; k = 2 cuts across
 * the tip and k = 7 cuts across the base. **4/16 is the grid station nearest the
 * gap's own midpoint of 0.66395** — it draws at 0.65050, off by 0.01345, where
 * 5/16 is off by 0.02545. So the boundary falls in a hole in the mesh and crosses
 * no face, and the dark is exactly the tail's thin end.
 *
 * That it is the SAME 4/16 as the hoof line is a coincidence of two unrelated
 * derivations — the hoof's 4/16 is the lowest grid point that clears `box-01`'s
 * 0.0625 bevel (`animal-pony.ts:289-321`) and this one is the nearest grid point
 * to a gap in `box-18` — and it costs nothing, because the two patches own
 * DIFFERENT slots (`limb` and `coat`) and `splitsOf` (`assembly.ts:487-501`) only
 * throws when one slot is patched twice.
 *
 * `box-38` flipped, the horse's switch, is refused: it is 0.912 of parrot fan and
 * it reads as the flowing tail of a horse, which is the one animal this one must
 * not be mistaken for at the back end.
 *
 * ## 5. THE PALETTE: THE SEPARATION IS THAT THERE IS NO MARKING
 *
 * **THIS ANIMAL IS FOUR-WAY SEPARATED AND THREE OF THE FOUR CANNOT BE EDITED.**
 * `animal-cow` is one of the frozen base 24. Africa's `animal-buffalo` is
 * rostered near-black at 0x413a36. `animal-water-buffalo` is this species'
 * sibling and takes the dark, slate, big-swept-horn end of the bovine. So:
 *
 *   - **against the COW:** a cow's colour is a MAP — patches, an udder, a dairy
 *     face. This ox is ONE colour with three dark ends and a pale horn, and
 *     **not one thing on it is a marking.** Every non-coat colour is a surface
 *     that is not hair: horn, hoof, muzzle pad, sclera — plus the switch, which
 *     is hair and is the one exception and is universal on cattle. `belly` is
 *     refused for the same reason, and it is the cheapest thing in the kit: a
 *     pale underside is a *marking*, and the point of this animal is that it has
 *     none.
 *   - **against the WATER BUFFALO and the BUFFALO:** red-brown, not slate and not
 *     black; a short thick horn at 1.073 of its own base, not a sweep.
 *   - **against the HORSE:** the deepest red in Farm against its golden chestnut,
 *     the widest body in the pack (1.6915) against its 1.35, and 1.5300 tall
 *     against its 1.7566. **Low and wide is what heavy looks like when the hull
 *     cannot be scaled** — and the brief's word for this animal is low-headed.
 *   - **against the PONY:** `animal-pony`'s 0x9a5f33 is a red-BAY, lighter and
 *     more orange, with near-black points. This is 0x8e3b21, a deeper and redder
 *     Devon / Red Poll, with no points at all.
 *
 * FIVE SLOTS, the horse's discipline. `limb` is the leg above the hoof AND the
 * ear hollow, off one fact — a shade under the coat where the coat turns away
 * from the light. `hoof` is the three places a red ox is not red: the horn of the
 * feet, the slate of the muzzle, the black of the switch. `pale` is the horn and
 * the sclera.
 *
 * ## Silhouette, budget, and what is left for the sibling
 *
 * Height **1.529948**, set by the horn tips, inside the pack's 1.43-2.02 and
 * 0.098698 over `HEIGHT_FLOOR` — deliberately near the bottom of the band, beside
 * `animal-sheep`'s 1.48125 and well under the horse. Width **1.6915**, the widest
 * thing in the pack. Keep-out **0.9376** off `max(width, depth) / 2`, taken by
 * the depth and inside `animal-fox`'s 1.15. **610 triangles** and **422
 * vertices** against `MODEL_TRIS_MAX`'s 951 and 1626, of which the shell is 180
 * triangles — `box-12` is three times the cube's 60 because the ears are in it,
 * and this species is the one that gets that money back. Nothing is stretched
 * that may not be, nothing is authored, and there is no flag.
 *
 * **LEFT FOR THE WATER BUFFALO:** `box-12` is a hull and hulls are not exclusive,
 * but everything that made this an OX is spent here — so the sibling's own file
 * should say what it does differently, and the honest list is: the dark end of
 * the palette, a longer z-stretch on the same tusk for a swept horn, and the
 * upper half of the height band.
 *
 * **NOT FLAGGED, and the palette is UNREVIEWED** — `farm.ts` gives this species a
 * one-line record and no colours, so all five below are the first ever proposed
 * for it. These animals ship unsigned; there is no `signoff` field anywhere.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/* ===================================================================== *
 * `box-12`, MEASURED — every number this file spends, named once.
 *
 * World coordinates, off the shell's own 112 baked vertices at its recorded
 * offset of (0, 0.80625, 0). The four plates are IDENTICAL to `box-03`'s: the
 * two ear lugs are the only thing this shell adds to the cube.
 * ===================================================================== */

/** The hull's own recorded centre. `box-18`'s only fitting tail height (§4). */
const HULL_CENTRE_Y = 0.80625
/** Where the flat FRONT and REAR plates start. IDENTICAL to `box-03`'s. */
const FLAT_PLATE_BOTTOM_Y = 0.49375
/** The flat rear plate. IDENTICAL to `box-03`'s -0.625. */
const REAR_PLATE_Z = -0.625
/** The flat front plate. IDENTICAL to `box-03`'s +0.625. */
const FRONT_PLATE_Z = 0.625
/** Half of `box-24` stretched to 0.280 tall — the muzzle's own half height. */
const MUZZLE_HALF_HEIGHT = 0.14
/**
 * SOLVED: the muzzle's bottom edge on the flat plate's bottom edge, because
 * `box-24`'s burial is 0.000000 and its whole root must be on flat geometry. Its
 * top then lands on 0.77375 against the eye card's own 0.773542 — 0.000208 apart,
 * and neither number was chosen for the other. See the header §3.
 */
const MUZZLE_Y = FLAT_PLATE_BOTTOM_Y + MUZZLE_HALF_HEIGHT
/** The top-side bevel's chord midpoint — the cube's own, and the horse's brow. */
const BEVEL_CHORD_X = 0.46875
const BEVEL_CHORD_Y = 1.275
/** 2/16, the largest grid station whose +-0.1737 footprint clears the bevel. */
const HORN_Z = 0.125

export const OX_ASSEMBLY = defineCreature('animal-ox', {
  /* Insertion order IS the texture layout, so this list is data. Five slots:
   * `limb` is the leg and the ear hollow, `hoof` is the three places a red ox is
   * not red, `pale` is the horn and the sclera. Nothing here is a MARKING — see
   * the header §5, which is the whole separation from the frozen `animal-cow`. */
  palette: {
    coat: 0x8e3b21,   // UNREVIEWED: ruby red — the Devon / Red Poll draught ox
    pale: 0xe3d6b4,   // UNREVIEWED: pale bone — the horns, and the sclera
    limb: 0x74301b,   // UNREVIEWED: the leg above the hoof, and the band-5 ear hollow
    hoof: 0x453a30,   // UNREVIEWED: dark horn — the feet, the muzzle pad, the tail switch
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* There is no `belly` slot and there is deliberately no belly line (§5): name
   * the pale one so it paints the eye cards' sclera. */
  under: 'pale',

  /* THE COW'S AND THE DEER'S SHELL, cashed here because its extra 0.289 of width
   * is TWO FUSED EAR LUGS and an ox is the animal that wants exactly that — low
   * sideways ears under the horns, and no upright pair. So there is no `ears`
   * entry on this species and none is missing. Band 5 is Kenney's own inner-ear
   * cut on those lugs, 12 triangles, shaded for free. Header §1. */
  hull: { part: 'box-12', paint: { base: 'coat', byBand: { 5: 'limb' } } },

  /* JT-044, VERBATIM — the horse's line, which is the pony's line, character for
   * character. `box-01`'s bevel runs 0.0625 up from its sole, so 4/16 is the
   * LOWEST grid point that clears it onto the straight shank. DO NOT RETUNE IT:
   * it is a measurement off the leg and the leg is the same on every species. */
  legs: { paint: { base: 'limb', patch: { below: 'hoof', at: 0.25 } } },

  /* THE HOG'S NOSE-TIP WORN AS A WHOLE MUZZLE — broad, blunt, zero burial, no
   * taper. 0.600 across a 0.625 plate; 0.280 tall, sat on the flat plate's own
   * bottom edge, which puts its top 0.000208 over the eye card's bottom edge.
   * Painted `hoof`: a bovine's muzzle pad is bare slate skin, not hair. There is
   * no `nose` — this part IS the pack's nose-tip. Header §3. */
  snout: {
    part: 'box-24',
    stretch: [1.5, 0.7, 1],
    at: [0, MUZZLE_Y, FRONT_PLATE_Z],
    paint: 'hoof',
  },

  /* THE ELEPHANT'S TRUNK under Kenney's wrong name, turned to face backwards.
   * The y is the badger's solve on this same shell and is not a choice: it is the
   * only height at which the 0.6230 root fits inside the 0.6250 flat rear plate.
   * The switch is a `patch` at 4/16, which lands in a 0.1601 gap between the
   * tail's own vertex rings and so crosses no face. Header §4. */
  tail: {
    part: 'box-18',
    spin: [{ axis: 'y', deg: 180 }],
    at: [0, HULL_CENTRE_Y, REAR_PLATE_Z],
    paint: { base: 'coat', patch: { below: 'hoof', at: 0.25 } },
  },

  extras: [
    /* THE HORN — the elephant's TUSK, the bank's most horn-like shape and worn
     * by nothing until now. `kind: 'pair'` mirrors the right-hand `wedge-11`
     * into the left, so `wedge-12` is the same shape by another name.
     *
     * Joined at the top-side bevel's chord midpoint, facing that chord's own
     * 45-degree normal — sideways first (`y: 90` turns +z into +x), then up
     * (`z: 45`). The shell's real surface stands 0.044195 proud of the chord, so
     * the root is 0.2953 deep and all 8 sub-plane vertices are inside the mass
     * with no daylight. Stretched 18/16 and 24/16: the first is 78.6% of the
     * bevel's own chord width, the second is FORCED, because at any uniform scale
     * this tusk is 0.8999 as long as it is thick and no uniform scale can make it
     * a horn. Header §2. */
    {
      name: 'horn',
      part: 'wedge-11',
      kind: 'pair',
      stretch: [1.125, 1.125, 1.5],
      spin: [{ axis: 'y', deg: 90 }, { axis: 'z', deg: 45 }],
      at: [BEVEL_CHORD_X, BEVEL_CHORD_Y, HORN_Z],
      paint: 'pale',
    },
  ],

  /* A standing bullock swishes and nothing else. There is no `ear` feature to
   * twitch — the ears are in the shell (§1) — and `resolveMotion` checks every
   * name against the features this species actually has, at definition time. */
  motion: [
    { kind: 'wag', parts: ['tail'] },
  ],
})
