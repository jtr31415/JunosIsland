/**
 * The guinea fowl — Farm's spotted galliform, and the species `farm.ts:179-180`
 * built the collection's whole byBand reservation for: *"the spotted one. Its
 * markings are the separation and they are painted by band, not built — the
 * cheapest distinct galliform in the group."*
 *
 * ONE SPECIES, ONE FILE. Derived from `animal-chicken.ts`, which is the
 * standing survey of the four things a chick-shell galliform separates itself
 * on (comb, wings, tail, colour) and of the wing/bill/foot idioms every
 * sibling inherits verbatim. **Read it first; this file does not re-argue
 * anything it already settled.** What follows is only what a guinea fowl adds
 * or refuses.
 *
 * ===========================================================================
 * ## 1. THE HULL IS `box-41`, RE-DERIVED — NOT COPIED — FROM THE CHICKEN'S CUBE
 * ===========================================================================
 *
 * `box-41`, `box-38` and `byBand` on a bird were reserved by the chicken's own
 * header for exactly three siblings — guinea fowl, turkey, quail — "so its
 * four siblings have somewhere to go." This is the first of the three to spend
 * the hull, and Wave-1's own correction (`animal-horse.ts` §1) matters more
 * here than anywhere else: **`box-41`'s recorded offset is `(0, 0.83125, 0.05)`,
 * and 0.83125 is the BOUNDING BOX centre, not the flank plate's.** The flat
 * flank/front/rear/top faces sit at the SAME world coordinates as `box-03`'s
 * own — 0.80625, 0.625, -0.625, 1.43125 respectively, to the decimal
 * (`animal-horse.ts` surveyed all six faces off the baked vertices). A wing
 * line copied onto `box-41` using its raw 0.83125 would be wrong by 0.025; this
 * file re-derives and states each of the three coordinates the wing and the
 * casque actually use, named `FLANK_PLATE_Y` and `TOP_PLATE_Y` below rather
 * than reused from the chicken's own `HULL_CENTRE_Y`.
 *
 * **The bird is round and hunched because the shell is.** `box-41` is 1.350 x
 * 1.300 x 1.350 against the cube's 1.250 — the same "stocky" shell the sheep
 * and horse already measured in full — and a guinea fowl's silhouette (a dark
 * ball with almost no visible neck) is exactly what the extra 0.1 of width and
 * depth buys a ground bird that a lean `box-03` hen does not have.
 *
 * ===========================================================================
 * ## 2. THE SPOTS: THREE BANDS, MEASURED BY AREA, AND A STRAIGHT VERDICT
 * ===========================================================================
 *
 * There is no speckle, dapple or spot ROLE in the bank and there never will be
 * — `BAKED_ROLES` has no such thing, and JT-043 forbids authoring one. The one
 * mechanism this collection reserved for the job is `Paint.byBand`: it recolours
 * a part's triangles by Kenney's OWN atlas cut, and `box-03` (the chicken's
 * shell) has exactly one band, so a species that wants this tool wants a
 * different shell — which is the whole reason `box-41` was held back. `box-41`
 * carries three: bands 3, 7 and 15, at 37, 57 and 168 triangles respectively —
 * and, measured off the baked mesh directly rather than assumed from triangle
 * count, they split the hull's surface AREA as follows (world coordinates,
 * this file's own measurement, `measure-box41b.mjs`):
 *
 *     band    tris   area (units^2)   share    up-facing share*   what it is
 *     3        37     1.2305          10.8%     1.2%      muzzle boss + underline
 *     7        57     5.8562          51.3%    71.0%      the flat shell: front/rear/flank/top-flat
 *     15      168     4.3201          37.9%    27.8%      the raised bits: 2 crown pads + 2 flank pads
 *
 *     * "up-facing" = triangles whose normal has y > 0.5, i.e. what a downward
 *       camera actually sees; these three add to 22.9% of the hull's own area.
 *
 * **The finding, stated plainly: band 7 — the largest by area despite the
 * FEWEST triangles — is the flat cube-equivalent shell,** because a flat
 * rectangular face costs Kenney almost no triangles per unit of area, while
 * `box-41`'s bumps (the crown pads, the flank pads, the muzzle boss) are small
 * but highly faceted and so cost MORE triangles for LESS area. That inversion
 * is why this file paints against triangle count and not the other way round.
 *
 * **The paint: `base: 'ground'` (band 7, the flat shell, 51.3% of the surface
 * and 71.0% of what a downward camera sees) stays the dark slate-grey ground.
 * `byBand: { 15: 'fleck' }` puts the pale speckle on the raised crown and flank
 * pads** — the two bumps that stand proud of the flat shell and are therefore
 * the first thing an elevated downward camera actually catches the light on,
 * which is the closest this mechanism comes to "spots catching the eye rather
 * than lying flat with everything else." `byBand: { 3: 'face' }` takes the
 * muzzle boss and the underline for the bare pale head, §3.
 *
 * **The straight verdict Joe asked for: this reads as two or three pale
 * PATCHES, not spots.** `box-41` gives exactly three regions to paint and no
 * more — there is no way to subdivide a band further without Kenney having cut
 * it, and JT-043 forbids cutting a new one. The pale patch (band 15) is a
 * single contiguous shape occupying the crown pads and the flank pads at once;
 * it does not read as a scatter of discrete dots, it reads as a pale saddle/cap
 * with two pale cheek-pads under it. A real helmeted guinea fowl's spots are
 * fine, dense and scattered over nearly the whole body, and nothing this file
 * does gets there. **This is the honest ceiling of `byBand` on a three-band
 * hull, and it is worth carrying into the turkey's and quail's own files
 * rather than re-discovering it twice more.** What the mechanism DOES deliver
 * honestly: a bird that is not a flat single colour, whose pale patches sit
 * where the shell itself is raised (so they catch light rather than lying on a
 * flat plane), at zero geometry cost. Given the choice `farm.ts` set up — "the
 * cheapest distinct galliform in the group" — cheap is what was ordered, and
 * cheap is what a three-way band split can deliver.
 *
 * ===========================================================================
 * ## 3. THE HEAD: BARE, PALE AND BLUE — BAND 3 SPENT THE WAY THE DIGEST SUGGESTS
 * ===========================================================================
 *
 * `animal-horse.ts` §3 found that `box-41`'s band 3 is the muzzle boss AND the
 * underline in one entry — "the pangare / mealy pattern... costs no geometry
 * and no straight line" — and spent it for a Haflinger's pale mealy muzzle;
 * `animal-sheep.ts` spent the SAME entry the other way, dark, for a lowland
 * sheep's masked face. This file is the third use and the one band 3 was
 * always going to suit best: **a guinea fowl's actual separating feature is
 * its bare, pale-blue-white head and upper neck against an otherwise dark
 * bird**, and band 3 sits exactly where the head meets the body — the front
 * plate the beak joins, plus the underline running back from it. Painted
 * `face`, that reads as the bare skin bleeding down from the head onto the
 * throat and breast, which is closer to a real guinea fowl than the spots are.
 * **This is arguably the stronger separation of the two,** as the brief
 * predicted, and it costs the same zero geometry the horse's muzzle did.
 *
 * The beak is `tube-02`, kept from the chicken on the bare donor transfer,
 * unmodified — no `at`, no `sink`, no `spin` — because it is still a galliform
 * bill on a still-frontal face. **One new thing box-41 introduces that box-03
 * never had to answer for: the muzzle boss, and the fact that `frame.front`
 * itself moves because of it.** `hullFrame` solves the join plane off the
 * hull's own BOUNDING BOX (`creature.ts:437`, `at[2] + half-z`), and box-41's
 * bounding box includes the boss — so the donor transfer's join point is
 * **z = 0.725, not the hen's 0.625**, and the whole bill sits 0.1 further
 * forward than it does on the chicken. With `sink = 0.5` unchanged the shift
 * is still zero, so the built bill's rear face lands flush on the flat plate
 * (0.625, a coincidence worth noting rather than choosing) and its tip reaches
 * 0.825 — 0.1 clear of `frame.front`, the SAME clearance the hen's own bill
 * has, and 0.1 past the boss's own end, not merely level with it.
 *
 * **Measured off the baked vertices, the boss is a true prism (no taper),
 * `|x| <= 0.200`, running the whole 0.100 of its own depth from z = 0.625 to
 * z = 0.725.** `tube-02` is `|x| <= 0.230` and does not taper either
 * (`taper: 1`, a uniform bar), so over the 0.100 of depth where the bill and
 * the boss overlap, the bill overhangs the boss by 0.030 a side, uniformly —
 * a WIDTH mismatch, which no burial removes, only a length one. **Measured
 * and disclosed rather than hidden: 0.030 is under half of the 0.066 overhang
 * `animal-horse.ts` §4 measured and refused for `tube-06` on this same boss.**
 * Kept rather than refused: the brief says keep `tube-02`, and 0.030 is a real
 * but small imperfection recorded for the turkey and the quail, who inherit
 * the same boss on the same hull.
 *
 * The small red-ish face real guinea fowl carry around the eye is refused on
 * `animal-chicken.ts` §5's own arithmetic, unchanged: the window under the
 * beak is 0.108 tall against the smallest solid box in the bank at 0.136825,
 * and even overruling `box-09`'s own burial buys only 0.0399 of standing
 * wattle — 3.2% of the hull's width, which reads as nothing. A guinea fowl
 * needs this feature exactly as little as the hen did, and it is not attempted
 * a second time.
 *
 * ===========================================================================
 * ## 4. THE CASQUE: ONE `cone-01`, BURIED TO HALF THE HEN'S OWN STAND
 * ===========================================================================
 *
 * A guinea fowl's helmet is a small bony knob, not a serrated comb — the whole
 * of the separation from the hen on this axis is COUNT (one, not three) and
 * BURIAL (deeper than the hen's already-shallow comb). Both dials are the
 * chicken's own: `cone-01`, the bee's and caterpillar's antenna, unspun,
 * because its own attachment is `y +1` and a casque stands straight up.
 *
 * **`CASQUE_SINK = 0.75`, 12/16 — deeper than the hen's own 8/16.** `cone-01`'s
 * extent along its attachment axis is 0.400356 (its `size[1]`), and `proud =
 * (1 - sink) x extent`: at the hen's 0.5 that is 0.200178 (`animal-chicken.ts`'s
 * own 0.2002), and at 0.75 it is **0.100089 — exactly half the hen's stand, to
 * the fifth decimal**, because 0.75 = 2 x 0.5 in burial terms on a fixed
 * extent. A single knob standing half as proud as the smallest comb in the
 * collection so far is the casque this bird has.
 *
 * **Where it stands matters as much as how deep, because `box-41`'s crown is
 * two TRANSVERSE PADS and not a uniform ridge** (`animal-horse.ts` §1's own
 * finding, re-verified here off the raw vertices): at `|x| <= 0.3125` the flat
 * saddle plate sits at y = 1.43125 out to `z = +-0.0833`, then rises through a
 * short slope to the pad's own y = 1.48125 by `z = +-0.1383`, staying there to
 * `z = +-0.2575`, before the flat plate resumes at 1.43125 out to the hull's
 * own `+-0.3125` flat-face reach. **The casque sits on the midline, `z = 0`,
 * squarely in the SADDLE — the dip between the two pads — joined at
 * `TOP_PLATE_Y = 1.43125`, identical to `box-03`'s own top and to
 * `animal-horse.ts`'s own constant of the same name.** That is deliberately
 * NOT the pony's/horse's ear station on the pad itself (`z = 0.25`, joined at
 * `CROWN_Y = 1.48125`): a helmet sits on the crown's own midline, not
 * off-centre on a pad, and the saddle is where the midline actually is.
 *
 * The cone's own base footprint reaches `+-0.164285` in z (half of `size[2] =
 * 0.32857`), which is wider than the saddle's own flat run to `+-0.0833` — the
 * outer 0.081 of the footprint on each side sits under the SLOPE up to the
 * pad, real geometry that is higher than the flat 1.43125 this file assumes.
 * That buries those edges MORE than the nominal solve, never less: §3's
 * "nothing floats" holds with margin to spare, not by luck.
 *
 * Cost: 34 triangles, one third of the hen's three-cone comb (102) for a
 * feature this collection needed to read as smaller, not bigger.
 *
 * ===========================================================================
 * ## 5. WHAT IS KEPT VERBATIM, AND WHAT IS REFUSED OUTRIGHT
 * ===========================================================================
 *
 * **KEPT, unmodified idiom (only the join coordinates re-derived where the
 * hull actually differs):**
 *   - `box-06` the wing, `animal-chicken.ts` §3's own recipe — spin, sink and
 *     axis all unchanged. Only the three join coordinates were re-checked
 *     against `box-41` rather than assumed: `x = HULL_SIDE_X = 0.625` and
 *     `z = 0` recover `box-03`'s own flank plate exactly, because
 *     `animal-horse.ts` §1 found the two hulls' flank plates identical to the
 *     decimal. The one number that is NOT the chicken's raw copy is `y`:
 *     `FLANK_PLATE_Y = 0.80625`, the flank plate's own vertical centre,
 *     **not** `box-41`'s recorded offset of 0.83125 — the exact substitution
 *     the digest warned this species to make. At that y the wing sits below
 *     the flank pad's own band (which starts at y = 0.86035, per
 *     `animal-sheep.ts`'s `FLANK_PAD_MID_Y`), so it never touches the pad at
 *     all — one fewer thing to re-derive, not zero.
 *   - `box-01`, JT-044's foot patch, byte for byte: `{ base: 'limb', patch: {
 *     below: 'foot', at: 0.25 } }`, on the pony's own derivation. Two legs, not
 *     four — a ground bird's own biped stance, `legs: false` plus a mirrored
 *     pair in `extras` at `box-01`'s own recorded `x = 0.25` and
 *     `LEG_ROW.y`, which is hull-independent by construction
 *     (`creature.ts:39`) and needs no re-derivation at all.
 *   - `plate-08`, the pack's one round bird eye. Painted from `eye`, spent on
 *     the AMBER iris the chicken's own header reserved by name — "the chicken
 *     kept a dark bead precisely so you could have the amber eye."
 *
 * **REFUSED, with the arithmetic:**
 *   - **The wattle/red face** — chicken's own §5, cited rather than re-run,
 *     §3 above.
 *   - **A tail.** `animal-chicken.ts`'s own header lists `box-18` under
 *     "Spent — a sibling needs its own answer," which this file takes at its
 *     word rather than copying the hen's stub regardless. A real guinea fowl's
 *     tail is short, drooping and carried low against the closed wings — from
 *     above it reads as no tail at all, which is also the one answer that
 *     costs nothing and does not compete with the turkey's fan (`box-38`) or
 *     the rooster's arched sickle (`wedge-15`/`box-23`/`chamfer: true`). `tail`
 *     is one of the fields with no default that means "small" — it is simply
 *     absent (`creature.ts`'s own fields table) — and that is this bird's own
 *     answer to a question the chicken deliberately left open.
 *   - **`belly`.** Cannot be combined with `byBand` on one part
 *     (`assembly.ts:358-366`, JT-044's own hard rule) and this hull's `byBand`
 *     is already spent twice over; there is nothing left to patch.
 *
 * ===========================================================================
 * ## THE PALETTE IS NEW AND NOBODY HAS SIGNED IT OFF
 * ===========================================================================
 *
 * `farm.ts` gives this species one line — "painted by band, not built" — and no
 * colours, so every slot below is a first proposal.
 *
 *   - `ground` — dark slate-grey, the flat shell (band 7) and the wing: the
 *     "dark ball" a guinea fowl actually is.
 *   - `fleck` — a pale, low-chroma off-white, the crown and flank pads (band
 *     15): the closest this mechanism gets to spots, and honestly a patch, §2.
 *   - `face` — pale blue-grey, the muzzle boss and underline (band 3) and the
 *     bill: the bare head bleeding onto the throat, §3.
 *   - `limb` — a leg shade under `ground`, because there is no natural
 *     boundary on a guinea fowl's uniformly dark shank and the contrast has to
 *     come from somewhere for JT-044's patch to read at all.
 *   - `foot` — near-black, JT-044's second tone: the toes a shade darker than
 *     the shank.
 *   - `eye` — amber, reserved by name for this species, §3 and
 *     `animal-chicken.ts` §6.
 *   - `pupil` — `PACK_PUPIL`, measured off 544 real eye texels; unreviewed by
 *     nobody, because nobody reviews it species by species.
 *
 * Height, vertex and triangle counts are measured on the built model below,
 * not guessed; see the test file for what actually shipped.
 */
import { defineCreature } from '../creature'
import { LEG_ROW } from '../hulls'
import { PACK_PUPIL } from '../texture'

/** `box-41`'s flat flank/front/rear plate centre — IDENTICAL to `box-03`'s own
 * recorded offset, and NOT this hull's own recorded 0.83125. `animal-horse.ts`
 * §1 is the six-face survey; this is the one number the wing actually needs. */
const FLANK_PLATE_Y = 0.80625

/** `box-41`'s flat side reach — IDENTICAL to `box-03`'s, per the same survey. */
const HULL_SIDE_X = 0.625

/** The wing's own sink, unchanged from `animal-chicken.ts` §3: the geometry it
 * is measured against (the flank plate's own 0.3125 reach) is identical on
 * this hull, so the number that floor is derived from does not move. */
const WING_SINK = 0.5

/** `box-41`'s flat top plate — IDENTICAL to `box-03`'s own top and to
 * `animal-horse.ts`'s `TOP_PLATE_Y`. The casque joins here, on the midline,
 * where the crown's two transverse pads leave a flat saddle rather than on
 * either pad itself. See §4. */
const TOP_PLATE_Y = 1.43125

/** 12/16. Deeper than the hen's own comb burial (8/16), so the casque stands
 * exactly half as proud — 0.100089 against the hen's 0.200178 — because both
 * are `(1 - sink) x 0.400356` on the same shape. See §4. */
const CASQUE_SINK = 0.75

/** JT-044's own hoof/foot line, unchanged: the lowest 1/16 grid point that
 * clears `box-01`'s bevel onto the straight shank. See `animal-chicken.ts` §6. */
const FOOT_AT = 0.25

export const GUINEA_FOWL_ASSEMBLY = defineCreature('animal-guinea-fowl', {
  palette: {
    ground: 0x45474d,  // UNREVIEWED: dark slate-grey — the flat shell and the wing
    fleck: 0xd7d3c6,   // UNREVIEWED: pale low-chroma speckle — the crown and flank pads (band 15)
    face: 0xaec1c8,    // UNREVIEWED: pale blue-grey — the bare head, muzzle boss and underline (band 3), the bill
    limb: 0x35363a,    // UNREVIEWED: the shank, a shade under ground — JT-044 needs the contrast to read
    foot: 0x1f2023,    // UNREVIEWED: near-black toes, JT-044's second tone
    eye: 0xc9821f,     // UNREVIEWED: amber — reserved for this species by animal-chicken.ts §6
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* THE ROUND STOCKY SHELL, re-derived rather than copied from the chicken's
   * cube. band 7 (the flat shell, 51.3% of the surface, 71.0% of what a
   * downward camera sees) stays the dark ground; bands 15 and 3 are the two
   * pale patches this hull can afford — see §2 and §3 for the honest read on
   * what byBand delivers here. */
  hull: { part: 'box-41', paint: { base: 'ground', byBand: { 15: 'fleck', 3: 'face' } } },

  eyes: { part: 'plate-08', paint: 'eye' },

  /* tube-02, the chick's and hen's own bill, on the bare donor transfer,
   * unmodified. box-41 adds a muzzle boss box-03 never had; the bill overhangs
   * it by 0.030 a side, measured and kept rather than hidden — see §3. */
  snout: { part: 'tube-02', paint: 'face' },

  /* NO TAIL. animal-chicken.ts's own header lists box-18 as "spent" — a
   * sibling needs its own answer, not a copy of the hen's stub — and a real
   * guinea fowl's tail is short, drooping and all but invisible from above.
   * See §5. */

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
      paint: 'ground',
      kind: 'pair',
      axis: 'z',
      dir: -1,
      spin: [{ axis: 'z', deg: -90 }, { axis: 'y', deg: -90 }],
      sink: WING_SINK,
      at: [HULL_SIDE_X, FLANK_PLATE_Y, 0],
    },

    {
      name: 'casque',
      part: 'cone-01',
      paint: 'face',
      sink: CASQUE_SINK,
      at: [0, TOP_PLATE_Y, 0],
    },
  ],

  motion: [{ kind: 'flap', parts: ['wing'] }],

  flag: 'byBand ON A THREE-BAND HULL READS AS PATCHES, NOT SPOTS, AND THAT IS '
    + 'REPORTED STRAIGHT RATHER THAN DRESSED UP: box-41 gives exactly three regions to '
    + 'paint (bands 3, 7 and 15, measured here at 10.8% / 51.3% / 37.9% of the hull\'s own '
    + 'surface area) and JT-043 forbids cutting a fourth, so the pale "fleck" slot is ONE '
    + 'contiguous patch across the crown and flank pads (band 15) rather than a scatter of '
    + 'dots. It was chosen over the alternative split (dark on the smaller bands, pale on '
    + 'band 7) specifically because band 7, despite having the fewest triangles, is 71.0% of '
    + 'what a downward camera actually sees — keeping it as the dark ground is what keeps '
    + 'this bird reading as "a dark bird with pale patches" instead of "a pale bird with a '
    + 'dark stripe." The bare pale head (band 3) is very likely the stronger of this '
    + 'species\' two separations, exactly as guessed going in, because it does not need to '
    + 'fake a texture the geometry cannot hold. NEW IMPROVISED PART: the casque is a single '
    + 'cone-01, the bee\'s antenna again, buried to 12/16 (0.100089 proud, exactly half '
    + 'animal-chicken.ts\'s own comb stand of 0.200178, since both are (1-sink) x the same '
    + '0.400356) and stood on box-41\'s crown SADDLE at z=0 rather than on either of its two '
    + 'transverse pads, which is where the actual midline is. THE BILL OVERHANGS THE NEW '
    + 'MUZZLE BOSS BY 0.030 A SIDE: the join plane itself moves on this hull, because '
    + '`frame.front` is solved off the hull\'s own BOUNDING box and box-41\'s includes the '
    + 'boss, so the bare donor transfer lands the bill at z=0.725 rather than the hen\'s '
    + '0.625 with the same zero shift — the bill\'s rear happens to land flush on the flat '
    + 'plate and its tip reaches 0.1 past the boss\'s own end, the same 0.1 clearance the '
    + 'hen\'s bill has past HER frame.front. Over the 0.100 where bill and boss overlap, '
    + 'tube-02\'s uniform 0.230 half-width is wider than the boss\'s uniform '
    + '0.200 half-width; kept anyway because it is under '
    + 'half animal-horse.ts\'s own refused 0.066 overhang for tube-06 on this same boss, and '
    + 'because the brief says keep tube-02. NO TAIL: animal-chicken.ts\'s own header calls '
    + 'box-18 "spent," and a guinea fowl\'s real tail is short, drooping and reads as absent '
    + 'from above, which is also the free answer. PALETTE UNREVIEWED throughout, as farm.ts '
    + 'never carried colours for this species.',
})
