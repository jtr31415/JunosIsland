/**
 * The alpaca — Farm's short, woolliest camelid, and the llama's twin problem
 * solved from the opposite end.
 *
 * `collections/farm.ts` gives the pair one line each: the llama is "the tall
 * camelid... separated from the alpaca on height, neck and ear", the alpaca is
 * "the short, woollier camelid. Paler, blunter-faced, no upright ear." Roster
 * §4 calls the two camelids one animal to a child unless the difference is
 * structural, so this file's job is to take the opposite pole on every axis
 * the llama takes, not just a different colour.
 *
 * ## THE HULL, THE FLEECE AND THE LEG RANGE ARE `animal-sheep.ts`'s, NOT RE-DERIVED
 *
 * This animal is on `box-41`, the same stocky "bigger" shell the sheep proved:
 * 1.350 x 1.300 x 1.350 against the cube's 1.250, the roundest body the pack
 * owns and the cheapest way to buy visible wool volume. `animal-sheep.ts` §1-2
 * is the survey of every flat plate, chamfer and band on this shell and the
 * full measurement of why a shell-ring fleece collar fails on it (all five
 * bands 0.050 less proud than on `box-03`, and the one that reads, `box-29`,
 * is a mane by its own overhang). None of that is repeated here — the alpaca
 * inherits it by sitting on the identical shell, painted uniformly, no band.
 *
 * ## THE LLAMA SEPARATION — the four axes, taken hard in the opposite direction
 *
 * The llama (being built in parallel) solves a long neck against
 * `PACK_HEIGHT_MAX` = 2.02 by standing `box-18` on end, goose-fashion, and
 * pairs it with long legs, an upright banana ear (`tube-04`/`05`, the elephant
 * ear) and a face left bare of wool. Four axes, four opposite answers here:
 *
 *   1. **HEIGHT/NECK: none.** No neck extra at all. Rule 3 already fuses head
 *      and body into one shell with no seam, which is what let the sheep paint
 *      a "face" out of `box-41`'s own band 3 with zero geometry — the same
 *      free head is used here. Where the llama spends a whole feature standing
 *      `box-18` on end to clear the height ceiling, this file spends nothing:
 *      the cheapest, most honest separation available is to not build the
 *      thing the llama is straining to fit under the ceiling.
 *   2. **LEG: the pack's own default row, no override, no two-tone.** See
 *      §THE LEG below.
 *   3. **EAR: small and round, not long and upright.** See §THE EAR below.
 *   4. **FACE: fully pale, not bare.** The llama's face is left UNCOVERED by
 *      wool — bare skin colour, distinct from its fawn body. This animal's
 *      wool runs all the way to the nose: no face band, no second face colour
 *      at all, the single palest slot in the collection painted edge to edge.
 *      That is a real anatomical fact (an alpaca's face carries more fleece
 *      than a llama's) and it is also the cheapest possible separation from
 *      the sheep, which paints the opposite choice — a DARK face — out of the
 *      same band on the same shell.
 *
 * ## THE EAR: THE CROWN PAD, NOT THE FLANK PAD THE SHEEP STANDS ON
 *
 * Small, round, forward-set — a teddy-bear ear, which is the animal's own
 * brief. `box-02` (the beaver's and polar bear's small button, 0.315 x 0.315 x
 * 0.205, 92 tris/168 verts) is the cheapest of the two candidates the digest
 * names; `box-34` is the same bounding box at six decimals for 116 tris, so
 * `box-02` is taken.
 *
 * It is NOT sited by the donor's own default transfer, and that matters on
 * this shell specifically. `box-41`'s crown is not one flat cap — its topmost
 * ring (local y = +0.65, world 1.48125) exists ONLY at local x = +/-0.3276,
 * and only across two z-bands: [-0.3075, -0.1883] (a rear ridge) and [0.0883,
 * 0.2075] (a front one) — read directly off the shell's own vertex list, the
 * same ray-casting `animal-sheep.ts` §1 warns any crown feature needs. `box-
 * 02`'s own recorded offset is x = 0.4475, PAST the ridge's 0.3276 edge, on
 * the sloped saddle between the crown and the flank pad the sheep already
 * spent — the exact trap the digest calls out generically for this shell.
 *
 * So the join is placed explicitly, on the FRONT ridge (closer to the eyes,
 * where an ear anatomically sits): `x = 0.25`, comfortably inside the 0.3276
 * span with 0.0776 to spare; `z = 0.1479`, the front ridge's own two measured
 * rows averaged; `y = 1.48125`, the ridge's own peak, recovered as `hull
 * centre 0.83125 + half-height 0.65` — the same number the donor transfer
 * would have solved had the x and z been on the ridge to begin with. The
 * ear's own half-width (0.1575) still runs 0.0325 past the ridge edge on the
 * outer side, but that side runs onto the DOWN-sloping saddle, so the excess
 * is over-buried rather than floating — the safe direction of the two.
 *
 * ## THE FRINGE, COSTED AND REFUSED
 *
 * The brief's own "fringe of fleece over the eyes" was tried as a small solid
 * over the brow — `box-09`, the bunny's nose-tip, the cheapest candidate in
 * the bank at 23 tris/45 verts, sited above the eye card's own top edge
 * (0.933646 + 0.320208/2 = 1.09375) and below the crown (1.43125), where the
 * flat front plate has 0.3375 of clear room. It is refused, not on cost —
 * 782 + 23 = 805 tris is nowhere near the pack's 951 — but on what a box can
 * and cannot say. A fringe needs graduated, soft coverage, which nothing in
 * the bank has; a hard-edged box standing proud of the brow either matches the
 * coat colour, in which case it is a bump too small to read as anything at a
 * portrait's resolution, or it is painted a second colour, in which case it
 * stops being "pale all over" and starts being a forehead blaze nobody asked
 * for. Both failure modes are real, so the fringe stays where the sheep's own
 * wool does: in the palette, not the geometry.
 *
 * ## THE LEG: NO BOUNDARY, BECAUSE THIS ANIMAL HAS NONE TO DRAW
 *
 * `animal-sheep.ts` §4 derives the whole usable two-tone range on `box-01` —
 * k = 4..9, both ends forced by the shape's own bevel and belly lines, k = 8
 * spending the sheep's own dark-for-most-of-its-length leg. That range is
 * inherited whole; it is not spent here. An alpaca's fleece runs the same pale
 * cream all the way to the ground — there is no hoof to blacken (JT-044 is a
 * general tool, not an obligation) and no dark leg to fade wool over, the way
 * the sheep has. Any k in 4..9 would still draw SOME boundary, and a boundary
 * this animal does not have is exactly what `animal-ferret.ts` refused a
 * stocking for. So `legs` is left out of this definition entirely: the pack's
 * own default row, painted through the ordinary fallback (no `limb` slot in
 * this palette, so a leg paints from `coat` like everything else), one colour
 * from hip to ground.
 *
 * ## THE NOSE AND TAIL ARE THE SHEEP'S OWN NUMBERS, ON THE SAME SHELL
 *
 * `box-14`, the deer's small nose-tip, at `animal-sheep.ts`'s own `BOSS_MID_Y`
 * / `BOSS_FRONT_Z` — the muzzle boss's measured centre and front plane on this
 * identical shell — painted `muzzle` rather than a dark `face`, because there
 * is no dark face here to match it to. No snout: the boss is already a
 * blunt, forward muzzle standing 0.100 proud, which is the whole of "no long
 * muzzle" for free, exactly as the sheep found. The tail is `box-18`, the
 * elephant's trunk worn backwards, at the sheep's own `TAIL_JOIN_Y` (0.80625)
 * against `REAR_PLATE_Z` (-0.625) — the one height at which this shape's whole
 * root lands on this shell's flat rear plate, solved once and good for every
 * species standing on it.
 *
 * ## THE PALETTE: THE PALEST, LOWEST-CHROMA BODY COLOUR IN THE COLLECTION
 *
 * `coat` at 0xede7d6: lightness 88.4%, chroma (max-min) 23 — paler AND lower-
 * chroma than the sheep's own oatmeal 0xe4dbc7 (lightness 83.7%, chroma 29),
 * which was already the collection's lowest-saturation body colour. `muzzle`
 * at 0xdcc9ba (lightness 79.6%, chroma 34) is a warm, dusty tone for the
 * nose-tip alone — visibly the same family as the coat and nowhere near the
 * sheep's near-black 0x3c3532 (lightness ~20%); it reads as a nose, not a
 * marking. No `limb` slot: see §THE LEG.
 *
 * **No flag.** 782 triangles (262 hull + 176 legs + 184 ears + 54 eyes + 26
 * nose + 80 tail) against the pack's 951, 496 vertices welded, height 1.5512
 * against the pack's 1.43-2.02 band, one spin, nothing authored, nothing
 * stretched.
 *
 * ## IS THE PAIR SEPARABLE AT A GLANCE?
 *
 * On the plan described for the llama — taller, longer legs, a standing neck,
 * long upright banana ears, a bare face — against this file's short/neckless,
 * round-hulled, small-round-eared, fully-pale-faced answer, the two should
 * read apart on silhouette alone before either palette is considered: neck
 * presence/absence and ear shape are both binary, structural differences a
 * child reads before colour. That is a claim about the PLAN, not the built
 * file — `animal-llama.ts` did not exist when this was written, so a visual
 * check once both are committed is still worth doing.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/* ===================================================================== *
 * `box-41`, world, at its recorded offset (0, 0.83125, 0.05). `animal-
 * horse.ts` and `animal-sheep.ts` are the full survey of this shell; these
 * are only the constants this file's own joins need.
 * ===================================================================== */

/**
 * The crown's FRONT transverse ridge, read off `box-41`'s own vertex list:
 * the topmost ring (local y = 0.65) exists only at local x = +/-0.3276, over
 * two z-bands. This is the forward one, [0.0883, 0.2075], averaged — closer
 * to the eyes, where an ear anatomically sits. The rear band, [-0.3075,
 * -0.1883], is the nape and is not used.
 */
const CROWN_RIDGE_Z = 0.1479
/** Inside the ridge's 0.3276 span, with 0.0776 to spare from its outer edge. */
const CROWN_RIDGE_X = 0.25
/** The ridge's own peak: hull centre 0.83125 + half-height 0.65. */
const CROWN_RIDGE_Y = 1.48125

/** `animal-sheep.ts`'s own boss centre and front plane; identical shell. */
const BOSS_MID_Y = 0.69375
const BOSS_FRONT_Z = 0.725

/** `animal-sheep.ts`'s own solve: the one height at which `box-18`'s whole
 * root lands on this shell's flat rear plate. */
const TAIL_JOIN_Y = 0.80625
const REAR_PLATE_Z = -0.625

export const ALPACA_ASSEMBLY = defineCreature('animal-alpaca', {
  /* Three slots. No `limb` — see the leg section above: this animal has no
   * boundary to paint, so a leg falls through to `coat` like everything else
   * not named here. */
  palette: {
    coat: 0xede7d6,    // UNREVIEWED: palest, lowest-chroma cream in the collection
    muzzle: 0xdcc9ba,  // UNREVIEWED: warm dusty nose-tip tone, not a marking
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* THE ROUND ONE, uniformly painted. No band-3 face: the sheep spends this
   * same band on this same shell for a DARK face; this animal refuses that
   * and paints edge to edge in `coat`, because its wool runs to the nose. */
  hull: { part: 'box-41', paint: 'coat' },

  /* box-02, the beaver's and polar bear's small button ear, cheapest of the
   * two round candidates. Sited on the crown's FRONT ridge, explicitly —
   * see the derivation above for why the donor's own x (0.4475) is not used. */
  ears: { part: 'box-02', at: [CROWN_RIDGE_X, CROWN_RIDGE_Y, CROWN_RIDGE_Z], paint: 'coat' },

  /* No snout: the boss is already a blunt muzzle. box-14, the deer's small
   * nose-tip, at the boss's own measured centre — see above. */
  nose: { part: 'box-14', paint: 'muzzle', at: [0, BOSS_MID_Y, BOSS_FRONT_Z] },

  /* box-18, the elephant's trunk worn backwards, at the one height its root
   * lands flush on this shell's rear plate. Identical to `animal-sheep.ts`. */
  tail: {
    part: 'box-18',
    paint: 'coat',
    spin: [{ axis: 'y', deg: 180 }],
    at: [0, TAIL_JOIN_Y, REAR_PLATE_Z],
  },

  /* Placid, like the sheep: only the ears flick. */
  motion: [{ kind: 'twitch', parts: ['ear'] }],
})
