/**
 * The pigeon — Farm's only town bird, and the only cool-coloured one.
 *
 * ONE SPECIES, ONE FILE. `register.ts` says why the one appended line in
 * `index.ts` is the whole of the wiring.
 *
 * `collections/farm.ts:192-194` settles the brief in one sentence: *"the only
 * town bird here, and the only blue-grey one. Separated from every galliform
 * by colour before shape, which is what a child reads first."* So this file is
 * a PALETTE argument wearing the cheapest plausible bird underneath it, and it
 * is deliberately shorter than its exemplars for that reason.
 *
 * ===========================================================================
 * ## 1. THE HULL IS `box-03`, NOT THE GOOSE'S, AND THAT IS THE SEPARATION
 * ===========================================================================
 *
 * `animal-goose.ts` stood `box-18` on end and leaned it 60 degrees to buy a
 * neck, because a goose that reads as a large duck becomes a duplicate the day
 * `animal-duck` ships. A pigeon has no such neighbour to avoid and every reason
 * to do the opposite: **a pigeon's neck is short and its head is small and
 * low**, so this animal takes NONE of the goose's neck machinery. There is no
 * `snout` standing off the hull, no lean, no stretch. The hull itself — a torso
 * and a head fused into one shell, same as every other galliform here — already
 * reads as short-necked, and standing visibly short beside the goose's 1.956 is
 * this animal's whole separation from it.
 *
 * The hull is `box-03`, the plain 1.250 cube at 60 triangles, not `box-41` (the
 * tiger's, 262 triangles) and not `box-21` (the fox's ears fused on its crown,
 * PB-076). A pigeon is a medium bird on the medium shell, same as the chicken,
 * and every part below is priced against that cheap a start.
 *
 * ===========================================================================
 * ## 2. THE TWO DARK WING BARS ARE REFUSED, AND THE REASON IS MEASURED
 * ===========================================================================
 *
 * `Paint.byBand` can only cut where Kenney already cut, along whatever bands a
 * donor's own UV atlas carries. `box-06` — the bunny's ear, worn here as the
 * cage birds' solid flank wing — has exactly ONE band across all 60 of its
 * triangles:
 *
 *     bands: [5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,
 *             5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5]
 *
 * There is nothing to redirect. This is not a case of the bars running the
 * wrong way across the wing — there is no second band anywhere on the part for
 * `byBand` to send to a different slot, so a `byBand` entry here would just
 * recolour the whole wing one flat hue, indistinguishable from `paint.base`.
 * `box-03`'s own bands are the same story (`animal-chicken.ts` already found
 * this: "box-03 has exactly one band, so there was nothing free to spend
 * anyway"), so there is no honest way to paint bars into the hull either.
 * `patch` cannot stand in for them: it draws exactly ONE boundary, a wing with
 * pale-below/dark-above, and a real bar pattern is wing-colour, dark, wing-
 * colour again — three regions, which nothing this kit owns can draw on one
 * part. **So the bars are refused rather than faked.** The wing wears a single
 * `flight` tone instead — one shade down from `coat`, the same anatomical
 * argument the goose and the chicken already made: a solid wing standing proud
 * in the identical body colour reads as a bulge rather than a wing from the
 * island's downward camera. It is shading, not a marking, and it is not the
 * bars.
 *
 * ===========================================================================
 * ## 3. THE IRIDESCENT NECK IS A PATCH ON THE HULL, NOT A PART
 * ===========================================================================
 *
 * With no neck part, the green-purple sheen has to be painted onto the fused
 * hull itself. `box-03` has one band (§2), so `byBand` is out here too; `patch`
 * is not, because it works off a part's own vertex HEIGHT and does not need a
 * band to already exist. `HullDef.paint` takes the same `Paint` shape a leg
 * does, so the hull wears `{ base: 'neck', patch: { below: 'coat', at: 0.75 } }`
 * directly — the same mechanism `belly` is sugar for, run with the small region
 * on top instead of the usual pale strip on the bottom.
 *
 * `NECK_PATCH_AT` = 0.75 (12/16) is not arbitrary: `HULL_CENTRE_Y + HULL_FLAT`
 * = 0.80625 + 0.3125 = **1.11875**, `box-03`'s own flat front face's top edge —
 * the same number `animal-chicken.ts` bounds its comb's footprint against.
 * Below that line (75% of the hull's height) is `coat`; above it (the crown and
 * the chamfer down to it, front and back) is `neck`. It sits **0.02500 above
 * the eye card's own top edge** (0.89375 + 0.2 = 1.09375), so the two markings
 * do not compete — the face stays plain blue-grey and the colour break reads as
 * the crown and nape, which is the closest a single horizontal line can get to
 * a real bird's neck sheen on a hull with no separate neck plate. Said plainly:
 * this is ONE flat hex standing in for a colour that actually shifts with the
 * light, because the material carries no such channel. Green is the half that
 * reads at album scale; the purple half is a limitation of a flat-shaded part
 * and not a claim this file makes.
 *
 * ===========================================================================
 * ## 4. THE PALE RUMP AND THE PINK FEET ARE THE CHEAP WINS
 * ===========================================================================
 *
 * **Tail = `box-18`, byte for byte `animal-chicken.ts`'s own stub** — same
 * spin, same join, same zero-margin fit against `box-03`'s flat rear face
 * (0.000998, §4 of that file, not re-derived here). The only thing that
 * changes is the paint slot: `rump` instead of `flight`. A pigeon's palest
 * marking is its rump, visible exactly where this part sits, and reusing the
 * chicken's stub with one slot swapped is the whole cost of it.
 *
 * **Legs = JT-044's two-tone, pushed to the top of the usable range.** The
 * cage birds and the chicken all patch `foot` at `k = 4` (0.25, drawn 0.07713).
 * §8.2's own table gives the usable range as `k = 4..9` before the grid runs
 * into `box-01`'s hull-belly line, and this animal takes `k = 8` (0.5, drawn
 * 0.15680 — "the sheep's dark-leg line") instead of the birds' floor: a
 * pigeon's pink leg is proportionally more of the visible limb than a hen's
 * small yellow foot, so more of the leg is patched, not just the toes. Both
 * slots are pink — `limb` the shank, `foot` the brighter toes one step up —
 * so raising `k` says "more of this leg is the brighter pink," not "give it a
 * marking it lacks" (contrast the ferret's refusal, §3 of the digest, for a
 * leg with no boundary to draw at all; this one plainly has one).
 *
 * ===========================================================================
 * ## 5. THE CERE, ADDED FOR RULE 9'S FLOOR AND KEPT BECAUSE IT IS REAL
 * ===========================================================================
 *
 * A six-part build measures 377 model vertices against rule 9's own floor of
 * 405 — the first thing this file tried was cheaper than the pack allows, not
 * cheaper than the brief asked for, and a single `box-09` only closes half the
 * gap (the assembly's own uv pass collapses several of its 45 recorded
 * vertices once the whole part is one flat colour, so the true yield is
 * smaller than the bank record suggests and has to be measured on the BUILT
 * mesh, not read off `bank.generated.ts` — the same warning `animal-goose.ts`
 * §5 gives for triangles applies to vertices here). `box-09`, the bunny's
 * smallest solid nose-tip (23 triangles; already refused by `animal-chicken.ts`
 * as a WATTLE in the cramped 0.108 window below the beak), fits a DIFFERENT
 * window here that finding never measured: **above** `tube-02`, between the
 * bill's own top edge (0.85375) and the hull's flat crown edge (1.11875) —
 * 0.265 clear, 1.9x the part's own 0.136825. A pigeon's cere — the pale fleshy
 * swelling at the base of the upper mandible — sits exactly there, and it is
 * genuinely PAIRED, one lobe either side of the midline over the nostrils, so
 * wearing it as a `pair` rather than a single centred bump is truer to the
 * animal AND is what closes the rest of the gap. It is pushed by the budget
 * and kept because it is real: painted `rump` — no eighth palette slot —
 * because the cere and the rump are the same pale highlight on an otherwise
 * blue-grey bird.
 *
 * ===========================================================================
 * ## 6. EVERYTHING ELSE IS THE CHICKEN'S, UNCHANGED
 * ===========================================================================
 *
 * Same hull, so every other join transfers without re-deriving anything:
 * `plate-08` eyes at the pack's own default offset, painted dark (a busy,
 * slightly stupid-looking bird wants a plain bead, not a bright iris to chase);
 * `tube-02` as a bare donor-transfer bill, blunt and round-sectioned, painted
 * `bill` — `cone-06`'s hook is exactly as wrong here as it is on a hen; the
 * cage birds' wing at their own sink, unchanged, painted `flight` (§2); two
 * legs in `extras`, named `leg` rather than `leg-front` (`animal-goose.ts`'s
 * own correction — the harness's body-vertex budget excludes only a feature
 * named exactly `leg`). No ears, no ridge, no second stretch, nothing
 * authored. `flap` is the only motion, `motion.ts`'s own defaults.
 *
 * Seven bank shapes, six of them already spent by the chicken this collection
 * is built from — the same parts, painted differently, which is farm.ts's own
 * claim about this species made literal.
 */
import { defineCreature } from '../creature'
import { LEG_ROW } from '../hulls'
import { PACK_PUPIL } from '../texture'

/** `box-03`'s own recorded centre, and where its side and rear faces are. */
const HULL_CENTRE_Y = 0.80625
const HULL_SIDE_X = 0.625
const HULL_REAR_Z = -0.625

/** The cage birds' wing sink — `animal-chicken.ts`'s own number, unchanged. */
const WING_SINK = 0.5

/**
 * 12/16, and it is derived rather than picked, though it has to be WRITTEN as
 * the grid fraction rather than computed from it — floating point puts the
 * arithmetic below at 0.74999999999999989, which fails `texture.ts`'s exact
 * `Number.isInteger` grid check, so the number that survives contact with the
 * runtime is the literal.
 *
 * The boundary itself is `box-03`'s own flat front face's top edge: hull
 * centre (0.80625) plus how far the flat face reaches before the chamfer
 * falls away (0.3125) = 1.11875 — the same number `animal-chicken.ts` bounds
 * its comb's footprint against. `patch.at` is a FRACTION of the part's own
 * height (0 at its local bottom, 1 at its top, over the cube's 1.250), and
 * (1.11875 - 0.18125) / 1.25 = 0.75 exactly, in real arithmetic. Below it
 * (75% of the hull) stays `coat`; above it (the crown and the chamfer down to
 * it) is the iridescent `neck` slot. It clears the eye card's own top edge
 * (0.89375 + 0.2 = 1.09375) by 0.025, so the two markings never compete. See
 * §3.
 */
const NECK_PATCH_AT = 0.75

/**
 * 8/16 — the sheep's own "dark-leg line" station from §8.2's table, not the
 * cage birds' 4/16 floor. Raised because more of THIS leg is the brighter
 * pink, not because the leg needed a marking it lacked. See §4.
 */
const FOOT_AT = 0.5

export const PIGEON_ASSEMBLY = defineCreature('animal-pigeon', {
  /* NEW AND UNREVIEWED — farm.ts carries no colour for this species at all. */
  palette: {
    coat: 0x6d7480,    // UNREVIEWED: blue-grey, the majority of the body
    neck: 0x3f6e5c,    // UNREVIEWED: the iridescent crown/nape patch — see §3
    flight: 0x565c66,  // UNREVIEWED: the coat one shade down — the wing alone
    rump: 0xd8d4c9,    // UNREVIEWED: the pale rump — the tail alone
    bill: 0x2b2b2e,    // UNREVIEWED: dark, blunt, no hook
    limb: 0xb23a50,    // UNREVIEWED: the pink shank
    foot: 0xe2607a,    // UNREVIEWED: JT-044's second tone — the brighter toes
    eye: 0x241f1c,     // UNREVIEWED: a plain dark bead
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* THE FUSED HULL, painted with §3's cap: a small iridescent region above
   * NECK_PATCH_AT, `coat` for the rest. No byBand — box-03 has one band. */
  hull: { paint: { base: 'neck', patch: { below: 'coat', at: NECK_PATCH_AT } } },

  eyes: { part: 'plate-08', paint: 'eye' },

  snout: { part: 'tube-02', paint: 'bill' },

  /* THE PALE RUMP: the chicken's own stub, unchanged, one slot swapped. */
  tail: {
    part: 'box-18',
    paint: 'rump',
    spin: [{ axis: 'y', deg: 180 }],
    at: [0, HULL_CENTRE_Y, HULL_REAR_Z],
  },

  legs: false,
  extras: [
    /* TWO legs, named `leg` (animal-goose.ts's own correction). JT-044's
     * two-tone pink, pushed to k = 8 — see §4. */
    {
      name: 'leg',
      part: 'box-01',
      paint: { base: 'limb', patch: { below: 'foot', at: FOOT_AT } },
      kind: 'pair',
      sink: LEG_ROW.sink,
      at: [0.25, LEG_ROW.y, 0],
    },

    /* THE WING: the cage birds' solid flank idiom, byte for byte. No bars —
     * see §2. `flight` is shading, the goose's and the chicken's own argument
     * for why a solid wing needs a tone break at all. */
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

    /* THE CERE: two nostril lobes, not one — see §5. Pushed by rule 9's own
     * vertex floor, kept because a pigeon genuinely has this feature and it
     * genuinely is paired either side of the midline. */
    {
      name: 'cere',
      part: 'box-09',
      paint: 'rump',
      kind: 'pair',
      at: [0.045, 0.97, 0.625],
    },
  ],

  motion: [{ kind: 'flap', parts: ['wing'] }],

  flag: 'THE TWO DARK WING BARS ARE REFUSED, MEASURED RATHER THAN ASSUMED: box-06 '
    + '(the bunny\'s ear, worn as the flank wing) carries exactly ONE band across all 60 of '
    + 'its triangles, so byBand has nothing to redirect — not a case of the bars running the '
    + 'wrong way, but of there being no second band anywhere on the part at all. box-03\'s own '
    + 'bands are the same story (animal-chicken.ts already found this). patch cannot stand in '
    + 'either: it draws exactly one boundary and a bar pattern needs three regions. So the wing '
    + 'wears a single flight tone instead, one shade down from coat — the goose\'s and the '
    + 'chicken\'s own argument that a solid wing needs a tone break to read as a wing at all — '
    + 'and that tone is shading, not the bars. THE IRIDESCENT NECK IS A PATCH ON THE FUSED '
    + 'HULL, because there is no neck part on a short-necked bird and box-03 has one band too, '
    + 'so byBand is out there as well; patch works off vertex height instead and needs no band. '
    + 'The hull wears { base: \'neck\', patch: { below: \'coat\', at: 0.75 } } — the same '
    + 'mechanism belly is sugar for, run with the small region on TOP. 0.75 is HULL_CENTRE_Y + '
    + 'HULL_FLAT = 1.11875, box-03\'s own flat front face\'s top edge, the same number the '
    + 'chicken bounds its comb against; it clears the eye card\'s own top edge by 0.025 so the '
    + 'two markings never compete. IT IS ONE FLAT HEX STANDING IN FOR A COLOUR THAT SHIFTS WITH '
    + 'THE LIGHT, because the material has no such channel — green is the half that reads at '
    + 'album scale and the purple half is a limitation of a flat-shaded part, not a claim this '
    + 'file makes. DOES NOT TAKE THE GOOSE\'S NECK: no `neck` feature at all, no stretch, no '
    + 'lean — the fused hull alone is already short-necked, and standing visibly short beside '
    + 'the goose\'s 1.956 is this animal\'s whole separation from it. THE TAIL IS THE CHICKEN\'S '
    + 'STUB, BYTE FOR BYTE, one slot swapped from flight to rump, because box-18 fits box-03\'s flat rear '
    + 'face by exactly 0.000998 and that was not worth re-deriving. THE LEGS ARE JT-044\'S '
    + 'TWO-TONE PUSHED TO k = 8 (0.5, drawn 0.15680) rather than the cage birds\' k = 4 floor, '
    + 'because more of a pigeon\'s leg is the brighter pink than a hen\'s small yellow foot — '
    + 'both slots here are pink, so raising k says "more of the leg is the bright tone," not '
    + '"add a marking." THE CERE (box-09, the bunny\'s smallest solid nose-tip, already refused '
    + 'as a WATTLE below the beak by animal-chicken.ts) IS PUSHED BY THE PACK\'S OWN VERTEX '
    + 'FLOOR, NOT BY THE BRIEF: six parts measured 377 model vertices against MODEL_VERTS_MIN '
    + '(405), so a seventh shape was needed whatever the brief wanted, and the true yield '
    + 'of one flat-painted copy of a part is smaller than bank.generated.ts\'s own vertex field '
    + 'once the uv pass collapses it — do not price a species off that field for vertices any '
    + 'more than animal-goose.ts §5 says to price one off it for triangles. It is worn as a '
    + 'PAIR rather than swapped for something arbitrary, because it fits a window the chicken '
    + 'never measured — ABOVE the beak, between its own top edge (0.85375) and the hull\'s flat '
    + 'crown edge (1.11875), 0.265 clear against the part\'s own 0.136825 — and a pigeon '
    + 'genuinely carries two nostril lobes there, not one; painted the same `rump` slot rather '
    + 'than an eighth colour. Six of the seven bank shapes are the chicken\'s own: this species '
    + 'is farm.ts\'s claim that colour separates it from every galliform, made literal. Nothing '
    + 'authored, nothing stretched, the hull unscaled.',
})
