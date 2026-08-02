/**
 * The goat — the sheep's horned, un-woolly sibling, and the collection's first
 * animal whose whole design is one SEPARATION.
 *
 * `collections/farm.ts` gives it two sentences and the second is the brief:
 * *"Horns are the separation and they are a repurposed tusk; a goat that reads
 * as a small sheep has failed."* So this file is derived from `animal-sheep.ts`
 * and it POINTS at it rather than restating it. Everything the two share — the
 * whole k = 4..9 derivation of `box-01`'s patch line, why no band in the bank
 * can be a fleece collar, why `belly` and `byBand` can never be combined, why
 * `box-18` is the elephant's TRUNK — is argued there, once, and is not argued
 * again here. What is below is only what makes this animal a goat.
 *
 * **The separation is taken at SIX places and each one is the sheep's own answer
 * inverted**, which is the only way two animals that a child would draw with the
 * same body stay apart:
 *
 *     the sheep                          this goat
 *     -----------------------------------------------------------------
 *     `box-41`, the fullest shell        `box-03`, the plain cube: LEAN
 *     hornless                           two horns, and they are the animal
 *     no beard                           a beard, the cheapest goat signal
 *     a DARK face carried by band 3      a TAN face carried by PARTS (§1)
 *     no snout — a sheep's face is short a snout — a goat's is not (§5)
 *     tail back and level, 0.4252 long   tail UP the croup at 45 degrees
 *     8/16 on the leg: dark to the top   4/16: a tan leg on a dark hoof
 *
 * ## 1. THE HULL IS `box-03`, AND THE CUBE HAS EXACTLY ONE BAND
 *
 * The plain 1.250 cube at its own recorded (0, 0.80625, 0). It is the lean
 * silhouette the sheep's own §2 promised this animal — *"a species that wants a
 * visible ruff has to go back to `box-03` ... On this collection that is the
 * goat's trade"* — and it is also the cheap one: **`box-03` is 60 triangles
 * against `box-41`'s 262**, so the leaner body pays for the horns, the beard and
 * the snout four times over and this species still lands 333 triangles under the
 * ceiling.
 *
 * **THE FINDING THIS FILE ADDS, and it is a warning rather than a discovery.**
 * Both exemplars spend the hull's own `byBand` as a face — the sheep paints band
 * 3 dark for a Suffolk's mask, the horse paints the same 37 triangles pale for a
 * Haflinger's mealy muzzle — and **neither trick exists on the cube.** Measured
 * over `box-03`'s 60 triangles: they are ALL BAND 5. One band, no cut, nothing
 * to redirect. `box-41` arrives split into three because it is the tiger's shell
 * and Kenney striped a tiger; the cube is fourteen species' shared body and he
 * left it plain.
 *
 * Two consequences, both accepted rather than worked around:
 *
 *   - **A species on the cube has NO head colour at all.** Rule 3 fuses head and
 *     body into one shell, and on `box-41` Kenney's own cut gives that shell a
 *     face anyway; here it does not. So every marking this goat has is carried by
 *     a PART — the muzzle, the ears, the beard, the horns and the legs are the
 *     five things that are not white, and there is no sixth available. That is
 *     why the palette below reads as a list of organs and the sheep's reads as a
 *     list of regions. **Donkey, mule, llama and alpaca: if you want a painted
 *     face you want `box-41`, and that is the real price of the cube.**
 *   - **`belly` is REFUSED**, which is the one line the cube does offer. It is a
 *     horizontal at k/16 of the hull's HEIGHT and this animal's markings are all
 *     on its ends, not on its underside: a swiss-marked goat is white over the
 *     whole barrel and tan on the head and legs. The sheep refused `belly`
 *     because a fleece has no underside; this one refuses it because its
 *     markings are not a line. Same refusal, different animal, and drawing one
 *     anyway would be `animal-ferret.ts`'s failure — a marking added to use a
 *     feature.
 *
 * The four flat faces this file joins to are the cube's own and are the four the
 * horse marks IDENTICAL on `box-41`, so nothing below needed re-deriving:
 * top 1.43125, front 0.625, rear -0.625, flank +/-0.625, each 0.625 square, with
 * both chamfer chord midpoints at 0.46875 from the centre.
 *
 * ## 2. THE HORNS. THE BANK HAS NONE, SO THEY ARE THE HOG'S TUSK
 *
 * `BAKED_ROLES` has no `horn` — every shape whose only role was one was
 * discarded at generation time — so a horn is a repurposed TOOTH and there are
 * three candidates. Measured, with what each stands proud at its own recorded
 * burial:
 *
 *     id                  size                 taper   proud    tris  donor
 *     wedge-11/12   0.3087 x 0.3069 x 0.4452   0.391   0.2778    38   elephant
 *     wedge-13/14   0.2604 x 0.3231 x 0.4114   0.586   0.2509    38   hog
 *     cone-01       0.1600 x 0.4004 x 0.3286   0.000   0.2754    34   bee
 *
 * **`cone-01` is refused on its taper.** 0.000 is a true straight point — it is
 * the pony's and the horse's EAR and the chicken's comb, and this file already
 * spends it twice (§3). A horn is a blunt tapering ridge and not a needle.
 *
 * **`wedge-11`, the elephant's, is refused on its SHAPE and left to the
 * bovines**, and the shape argument is the better half. The two tusks differ by
 * more than size: the elephant's is 0.3087 across by 0.3069 deep, which is SQUARE
 * to three decimal places, and the hog's is 0.2604 across by 0.3231 deep, which
 * is **1.240722x deeper than it is wide.** A part joined to a flat face and then
 * leaned can only lean until the far corner of its own base rises back out of the
 * mass, and that bound is `atan(buried / the half-extent it leans ACROSS)`:
 *
 *     shape        lean about x (BACKSWEEP)      lean about z (SPLAY)
 *     wedge-13          44.8156 deg                  50.9515 deg
 *     wedge-11          47.4804 deg                  47.3168 deg
 *
 * The two bounds are an arctangent of the same numerator, so **their TANGENTS are
 * in the shape's own aspect ratio, exactly**: 1.232760 / 0.993583 = 1.240722, the
 * hog tusk's depth over its width to six decimal places. That is not a
 * coincidence, it is the algebra — and it means **the hog's tusk asks to be
 * splayed and the elephant's asks, very slightly, to be swept BACK**, which is
 * what an ox's and a water buffalo's horns do. The reservation in the digest
 * turns out to be a recommendation.
 *
 * **THE MEASURED ENVELOPE, and it is stronger than the arithmetic.** The bounds
 * above assume the crown is an infinite plane and it is not: it is 0.625 square
 * and falls away past its edge, so a leaned base corner leaves the mass long
 * before the algebra says it must. Solved against `box-03`'s own 60 triangles at
 * the station this species uses — 4/16 out and 3/16 forward, which is where a
 * goat's horns are — the whole clean window is
 *
 *     BACKSWEEP    none. not one degree, and 0 degrees is not clean either
 *     SPLAY        13 to 29 degrees, seated deepest at 24
 *
 * **So the splay is not decoration; it is the thing that SEATS the horn.** A tusk
 * stood bolt upright there leaves its base **0.018192 outside** the shell,
 * because its own 0.323089 of depth overruns the crown's forward edge. Leaning it
 * out swings that deep corner inboard and by 13 degrees it is inside; leaning it
 * BACK drives the same corner further forward and is never clean at any angle at
 * all. The shape said lean me out and the shell says it far more loudly.
 *
 * **25 degrees is shipped** — one degree past the window's deepest point of 24,
 * seated **0.006873 inside** the mass, against the 0.028 of daylight
 * `animal-horse.ts` ships and the 0.038 it records for the pony. The ceiling's
 * own 29 is left unspent because there the margin is 0.000068, and a horn that
 * survives somebody nudging the hull is worth 0.016 of tip travel.
 *
 * The station is 4/16 out and 3/16 forward on the crown, both forced:
 *
 *   - **z = 0.1875** is the FORWARD-most 1/16 station whose whole base is
 *     embedded — 4/16 leaves 4 vertices 0.0278 outside — and forward is where a
 *     goat's horns are, just behind the brow.
 *   - **x = 0.2500** is 4/16 and is clean by 0.006873. The tusk's own recorded
 *     0.294346 was tried first and REFUSED: the hog wore this shape on this very
 *     cube, so the donor transfer's x is available here in a way it usually is
 *     not, and it still leaves 0.00326 of daylight at the base. That is a
 *     twelfth of the 0.038 `animal-pony.ts` ships, so it would have passed — it
 *     is refused because 4/16 is free and is cleaner.
 *
 * ## 3. THE BEARD AND THE TAIL: ONE SHAPE, ONE ANGLE, TWO OPPOSITE CHAMFERS
 *
 * A chin tuft is the cheapest "this is a goat" signal there is and the bank has
 * no beard, no wattle and no droop. `cone-01` is the answer to both this and the
 * tail, and it is the same entry twice at 180 degrees, which is why they are
 * argued together:
 *
 *     beard   spin x +135   joined at the FRONT-BOTTOM chamfer   hangs down-forward
 *     tail    spin x  -45   joined at the REAR-TOP    chamfer   stands up-back
 *
 * Both are the horse's forelock idiom — join at the chamfer's chord midpoint and
 * turn 45 degrees onto its normal — and `animal-horse.ts` §5 already established
 * the thing that makes it safe on this shell: **the cube's real surface bulges
 * 0.052083 proud of that chord**, 0.036828 along the 45-degree normal, so a part
 * joined there is embedded by construction. Both come out at the same measured
 * seating, 0.04247 of margin, which is the deepest of anything on this animal.
 *
 * **Why `cone-01` and not something else.** It is the only true point in the bank
 * (taper 0.000) and the narrowest ear shape there is at 0.160 across — a beard is
 * narrow and comes to a point, and nothing else here does both. At 34 triangles
 * it is also the cheapest shape in the bank that shows 0.2754, so the beard and
 * the tail together cost 68 triangles, which is a quarter of what the stocky
 * hull would have cost on its own.
 *
 * **THE TAIL: both of the obvious answers are refused with arithmetic, and this
 * is the useful part for a sibling.**
 *
 *   - **`box-18`, the sheep's own tail, CANNOT be carried up. It is not a
 *     preference, it is geometrically impossible on this shell** and the digest's
 *     own §8.1 half-says it. Its join cross-section is 0.623004 tall against the
 *     flat rear plate's 0.625 and its recorded burial is exactly 0.000000, so it
 *     fills the plate with 0.001996 to spare and has nothing to rotate INTO: tilt it
 *     by any angle at all and the lower corner of a zero-buried, plate-height
 *     cross-section swings straight off the plate's bottom edge. Solved at 20
 *     degrees with the sink forced to 0.267 to buy room, the low corner lands at
 *     (y 0.4748, z -0.6249) where the rump's chamfer has already pulled the
 *     surface in — outside the mass, and every extra degree makes it worse. **The
 *     sheep's tail and a raised tail are mutually exclusive on the cube.**
 *   - **`wedge-07`, the thin whip, is refused on cost and on read.** 212
 *     triangles is 6.2x `cone-01` and more than three times this animal's hull;
 *     it is 1.0466 long where a goat's tail is a stub; and it is the cat's, the
 *     tiger's and the monkey's, which is what it looks like whatever colour it is.
 *
 * `chamfer: true` exists for exactly this job and could NOT be used, which is
 * worth writing down once. It applies `{ axis: 'x', deg: 45 }` to whatever the
 * shape's own facing is, and that only comes out up-and-back for a `z -1` tail —
 * the five shapes Kenney attached that way. `cone-01` is `y +1`, so the same
 * spin sends it up-and-FORWARD, and overriding the axis to `z -1` to fix the
 * facing lays the cone on its side. Hence the explicit `at` and `spin` below.
 * **A sibling wanting a raised tail off a `y +1` shape wants these two lines.**
 *
 * ## 4. THE EAR IS THE HOG'S, WORN ON ITS SIDE, AND SUNK 5/16
 *
 * The sheep's §5 surveyed all sixteen ear shapes and this file takes that survey
 * as given, with **one correction: `tube-04`/`tube-05` is NOT "the one genuinely
 * side-mounted ear in the bank".** There are two. `box-25`, the koala's, is also
 * recorded `axis: 'x'` and stands 0.3463 proud, more than the elephant's 0.3139.
 * It is refused here on its own numbers — 0.7427 across is a disc more than half
 * the height of the body it hangs on, it costs 92 triangles for that, and it
 * measured 14 vertices and 0.119 outside the mass at the flank — but the sheep's
 * sentence should not be quoted as it stands.
 *
 * The elephant's pair is left where the sheep left it, for the camelids, and this
 * file adds the reason that is about the ANIMAL rather than about the roster.
 * Mounted on x an ear presents a cross-section, and its aspect is what a child
 * reads from above:
 *
 *     tube-04/05  0.6188 tall x 0.2773 deep   2.23 : 1 TALL   an elephant's flap
 *     cone-04/05  0.2960 tall x 0.4060 deep   1.37 : 1 DEEP   a goat's leaf
 *
 * **A goat's ear is longer front-to-back than it is tall and the elephant's is
 * the other way round by a factor of three.** So the ear is `cone-04`, the HOG's,
 * which is the same donor as the horns — one animal, two organs — and which is
 * unspent because there is no hog and no pig anywhere in the roster.
 *
 * **Its recorded burial of 0.7144 is OVERRIDDEN, and the replacement is derived.**
 * The hog wore this flap on a fat cheek and buried 0.288064 of its 0.403234, leaving
 * **0.1152 proud — which is smaller than the sheep's ear and would be invisible
 * in the album portrait.** On a flat cube flank that burial is simply wrong. §3's
 * floor is the bound: *"every eared species embeds its ear into the hull, by at
 * least 0.125"*, so the shallowest legal sink is 0.125 / 0.403234 = 0.309994 — and
 * **5/16 = 0.3125 is the first point on the pack's own authoring grid above it**,
 * burying 0.126 and standing **0.2772 proud, 1.53x the sheep's 0.1807.** Nothing
 * is chosen: the floor picks the number and the grid rounds it.
 *
 * Both stations are the extreme of their own range and both were solved against
 * the shell:
 *
 *   - **y = 1.0625 = 17/16 is the HIGHEST 1/16 station at which the whole ear is
 *     embedded.** 18/16 leaves 4 vertices 0.00025 outside — it fails by a quarter
 *     of a thousandth, which is worth recording so nobody re-tries it. High is
 *     what a goat wants: this puts the ear base 0.129 above the eye card and runs
 *     its top edge to 1.2105, up onto the head's own chamfer.
 *   - **z = 0.1250 = 2/16 is the FORWARD-most.** The ear's own 0.406 of depth
 *     against a 0.625 flank plate leaves only 0.1095 of travel if the whole rim is
 *     to stay on the flat; measured against the real shell, which lets the rim run
 *     onto the chamfer while staying buried, it reaches 2/16 and 3/16 leaves 5
 *     vertices 0.0313 outside.
 *
 * ## 5. THE SNOUT THE SHEEP COULD NOT HAVE, AND WHAT IT COSTS THE EYE
 *
 * `tube-06` is the fox's muzzle and the digest's default ungulate one, and the
 * two exemplars each refused it for a reason that does not apply here.
 * **`animal-sheep.ts` refused it on the ANIMAL** — a sheep's face is short, and
 * on `box-41` every 0.532 barrel stands forward of the eye plane anyway.
 * **`animal-horse.ts` refused it on the SHELL** — the boss's flat front is only
 * 0.400 across, so it overhangs by 0.066 a side, and that file says explicitly
 * *"a sibling on `box-03` knows to put it back: on the cube's 0.625 square front
 * face it fits."* This is that sibling. Every field is the donor transfer's: no
 * `at`, no `sink`, no `stretch`, and it beds flush on the front plate exactly as
 * `animal-pony.ts:357` already ships it.
 *
 * It is the third separation from the sheep and the cheapest, at 34 triangles.
 * `collections/farm.ts` reached the same conclusion from the other end when this
 * collection was still kit-built: *"the goat, whose head is 0.86, can afford
 * one."*
 *
 * **What it costs, measured and NOT fixed.** The muzzle stands 0.231 forward of
 * a front face at 0.625, so it crosses `EYE_CARD_Z` = 0.635 and stands in front
 * of the inner-lower corner of both eye cards. Rasterised against `plate-01`'s
 * own 27 drawn triangles rather than its bounding box, it covers **9.81%** of one
 * card — against the 3.61% `animal-sheep.ts` measured for `box-41`'s muzzle boss,
 * so the cube's snout is 2.7x the sheep's occlusion. It is recorded rather than
 * corrected for two reasons: rule 5 says an eye is never adjusted, and this is
 * `animal-pony.ts`'s shipped arrangement unchanged — same hull, same snout, same
 * card, same z.
 *
 * ## 6. THE LEGS: 4/16, WHICH THE SHEEP PREDICTED BY NAME
 *
 * The whole derivation of `box-01`'s two lines and of k in 4..9 as the whole
 * usable range is `animal-sheep.ts` §4 and it is not repeated. That file names
 * this animal's number for it — *"a goat belongs at 4/16 with the horse"* — and
 * this file takes it, having checked the prediction rather than copied it: a
 * farm goat has a hard dark hoof under a leg that is one colour to the coronet,
 * and 4/16 draws at 0.07713 above the sole, which is 0.0146 clear of the foot's
 * own bevel and the only marking the animal has. It is the pony's line character
 * for character and the horse's instruction is to leave it alone.
 *
 * **A second two-tone line is REFUSED, on `animal-horse.ts` §6's grounds.** A
 * swiss-marked goat carries no boundary between the hoof and the belly — no
 * sock, no stocking, no dark cannon — so every k in 5..9 would draw a marking
 * this animal does not have. The mechanism is used once, at full strength, and
 * this is the second Farm species to decline the second use.
 *
 * ## 7. THE PALETTE: FIVE SLOTS, AND FOUR OF THEM ARE ORGANS
 *
 * Insertion order IS the texture layout, so the list is data. `farm.ts` gives
 * this species no colours, so all four below are first proposals.
 *
 * Because the cube has one band (§1) there is no region to paint, so the palette
 * is a list of PARTS and the separation from the sheep is carried at the two
 * places a child looks. **The sheep is cream with near-black points; this goat is
 * white with TAN points** — a hue inversion at the ears, the muzzle and the legs
 * simultaneously. Measured on the two axes at once, in chroma `(max - min) / max`
 * and value `max / 255`:
 *
 *                   chroma            value
 *     sheep coat     0.127             0.894
 *     sheep face     0.167  (+0.040)   0.235  (-0.659)
 *     goat  coat     0.074             0.961
 *     goat  face     0.560  (+0.486)   0.659  (-0.302)
 *
 * **The two animals mark themselves along different axes entirely.** The sheep's
 * face is separated from its fleece almost purely by VALUE and hardly at all by
 * chroma — it is the same colour made dark. This goat's is separated almost
 * purely by CHROMA at less than half the drop in value — it is the same
 * brightness made coloured. A sheep's points are BLACK and a goat's are BROWN,
 * and that is a difference that survives the album thumbnail.
 *
 * **One correction to `animal-sheep.ts`, made deliberately.** That file calls its
 * oatmeal *"the lowest-chroma body colour in this collection"* and this white is
 * 0.074 against its 0.127, so the sentence is now this species'. It was worth
 * taking: wool scatters and reads warm, a short-haired white goat does not, and
 * the two animals are told apart by their POINTS and not by their bodies anyway.
 * What the goat's white does own is VALUE — 0.961 against the fleece's 0.894 —
 * which is the difference between a white and a cream at a glance.
 *
 * `limb` is not a second colour, it is a second CELL: `assembly.ts:487-501`
 * allows a slot exactly one painted boundary, so the leg needs its own to carry
 * the hoof line and the ears cannot share it. It is taken one step lighter than
 * `face` because a goat's legs catch light where the side of its muzzle is
 * shaded; the two are the same tan. There is no `belly` slot (§1), so `under`
 * falls back to the coat and the eye cards' sclera is the body white — which on
 * this one animal is also the truth, because a goat's pale sclera is the most
 * recognisable eye in the farmyard.
 *
 * **No flag.** Nothing was strained: height **1.6435** inside 1.43-2.02 and set
 * by the horn tips, keep-out 0.9022 against `animal-fox`'s 1.15 and Farm's own
 * ratchet of 1.38, **618 triangles** against 422-951 of which only 60 are the
 * hull, the hull unstretched and at its own recorded offset, nothing authored,
 * three spins, and no number in this file that is not a measurement off the bank
 * or off the shell.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/* ===================================================================== *
 * `box-03`, world, at its own recorded offset (0, 0.80625, 0).
 *
 * The cube's 120 points weld to six rows per axis — +/-0.625, +/-0.5, +/-0.3125
 * about the centre — so every flat face is 0.625 square and both chamfers run in
 * two steps rather than one. `animal-horse.ts` §1 and §5 are the full survey and
 * mark four of these IDENTICAL on `box-41`; these are only the ones this species
 * actually joins to.
 * ===================================================================== */

/** The flat top face, and `frame.top`. The horns stand here. */
const CROWN_Y = 1.43125
/** The flat flank, and `frame.side`. The ears join here. */
const FLANK_X = 0.625
/**
 * Both chamfer chord midpoints, as an offset from the hull's centre —
 * `(0.625 + 0.3125) / 2`, the same number in y and in z because the cube is
 * cut identically on every edge. The beard hangs off the front-bottom one and
 * the tail stands off the rear-top one, at 45 degrees to each.
 */
const CHAMFER_OFF = 0.46875
const HULL_CENTRE_Y = 0.80625
const CHAMFER_UP_Y = HULL_CENTRE_Y + CHAMFER_OFF     // 1.27500
const CHAMFER_DOWN_Y = HULL_CENTRE_Y - CHAMFER_OFF   // 0.33750

/**
 * `cone-04`'s sink, DERIVED and not the shape's own 0.7144.
 *
 * §3's floor is 0.125 of burial, which on this ear's 0.403234 of reach is a sink
 * of 0.309994; 5/16 is the first point on the pack's authoring grid above it.
 * It buries 0.126 and leaves 0.2772 proud, against the hog's own 0.1152.
 */
const EAR_SINK = 0.3125

export const GOAT_ASSEMBLY = defineCreature('animal-goat', {
  /* Five slots, and four of them are ORGANS rather than regions — because the
   * cube has exactly one band (§1) there is no face to paint, so every marking
   * this animal has is a part. The sheep is cream with near-black points; this
   * is white with TAN points, which is the same inversion said at the ears, the
   * muzzle and the legs at once. */
  palette: {
    coat: 0xf5efe3,    // UNREVIEWED: warm white — chroma 0.074, value 0.961 against the fleece's 0.127 / 0.894
    face: 0xa8794a,    // UNREVIEWED: the tan-brown head — the muzzle and the ears
    limb: 0xb5854e,    // UNREVIEWED: the leg above the hoof. One step lighter than `face`; the same tan
    horn: 0x453b31,    // UNREVIEWED: the dark points — both horns, the hooves, the nose and the beard
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* THE LEAN ONE. The plain 1.250 cube against the sheep's 1.350 x 1.300 x 1.350,
   * which is the trade `animal-sheep.ts` §2 wrote down for this animal, and it is
   * 60 triangles against that shell's 262.
   *
   * NO `byBand` IS POSSIBLE HERE. All 60 of the cube's triangles are band 5 —
   * Kenney striped a tiger and left the shared body plain — so the sheep's dark
   * face and the horse's mealy muzzle are both `box-41`-only tricks and there is
   * no head colour on this shell at all. NOT `belly` either: it is a horizontal
   * at k/16 of the hull's height, and this goat's markings are on its ends. */
  hull: { part: 'box-03', paint: 'coat' },

  /* JT-044 at the HOOF end. 4/16 is the lowest grid point that clears `box-01`'s
   * own bevel onto the straight shank, drawn at 0.07713 above the sole, and it is
   * the pony's line character for character — `animal-horse.ts` §JT-044 says do
   * not retune it and this file does not. `animal-sheep.ts` §4 predicted this
   * animal's k by name: "a goat belongs at 4/16 with the horse."
   *
   * A SECOND LINE REFUSED: a swiss-marked goat has no sock and no dark cannon,
   * so every k in 5..9 draws a marking it does not have. This is the only patch
   * on the species — the hull cannot band (see above) — so "one cell, one
   * picture" cannot fire, and the leg row has no spin, so the line cannot rake. */
  legs: { paint: { base: 'limb', patch: { below: 'horn', at: 0.25 } } },

  /* THE HOG'S EAR, WORN ON ITS SIDE. Its cross-section is 0.406 deep by 0.296
   * tall — 1.37 : 1 the DEEP way, which is what a goat's ear is from above, where
   * the elephant's `tube-04` is 2.23 : 1 the TALL way and is a flap. Left for the
   * camelids on the sheep's reservation and refused here on the animal too.
   *
   * The sink is DERIVED (see EAR_SINK): the hog's own 0.7144 leaves 0.1152 proud,
   * which is less than the sheep's ear and invisible in the portrait. Both
   * stations are extremes solved against the shell — 17/16 is the highest y whose
   * whole ear is embedded (18/16 fails by 0.00025) and 2/16 is the forward-most z
   * (3/16 leaves 5 vertices 0.0313 outside). */
  ears: {
    part: 'cone-04',
    axis: 'x',
    sink: EAR_SINK,
    at: [FLANK_X, 1.0625, 0.125],
    paint: 'face',
  },

  /* The fox's muzzle, which BOTH exemplars refused and neither could have had:
   * the sheep on the animal (a sheep's face is short) and the horse on the shell
   * (`box-41`'s boss is only 0.400 across, so this overhangs it by 0.066 a side).
   * On the cube's 0.625-square front plate it fits, which `animal-horse.ts` §6
   * says in as many words. Every field is the donor transfer's — no `at`, no
   * `sink`, no `stretch` — and it is `animal-pony.ts:357`'s own arrangement.
   * It occludes 9.81% of each eye card and that is recorded, not fixed: rule 5
   * says an eye is never adjusted. */
  snout: { part: 'tube-06', paint: 'face' },

  /* The deer's nose-tip, the pack's small ungulate one. `on: 'snout'` is
   * automatic once a snout exists (`creature.ts:873-879`), so it hangs off the
   * muzzle's own placed front plane rather than off an arithmetic this file would
   * keep a stale copy of. Dark with the horns and the hooves. */
  nose: { part: 'box-14', paint: 'horn' },

  /* THE TAIL, HELD UP — the sheep's inverted, and the two obvious answers are
   * both refused with numbers in the header. `box-18` cannot be tilted at all:
   * its join cross-section is 0.623004 tall against a 0.625 plate at zero
   * recorded burial, so it has nothing to rotate into. `wedge-07` is 212
   * triangles and 1.0466 long and reads as a cat.
   *
   * So it is `cone-01` on the REAR-TOP chamfer, turned 45 degrees onto its
   * normal — the horse's forelock idiom, where the cube's real surface bulges
   * 0.036828 proud of the chord and embeds the part by construction. `chamfer:
   * true` could not be used: it applies `{ x, 45 }`, which only comes out
   * up-and-back for a `z -1` tail, and this shape is `y +1`. Painted `coat`,
   * because a goat's tail is its body colour and painting it dark to make it read
   * would be a marking the animal does not have. */
  tail: {
    part: 'cone-01',
    paint: 'coat',
    spin: [{ axis: 'x', deg: -45 }],
    at: [0, CHAMFER_UP_Y, -CHAMFER_OFF],
  },

  extras: [
    /* THE HORNS, and they are the species. The hog's tusk, worn as a pair from
     * the +x copy so rule 6 holds, stood on end by `{ x, -90 }` and then SPLAYED
     * 25 degrees by `{ z, -25 }`.
     *
     * THE SPLAY IS WHAT SEATS IT, and that is the whole argument. This tusk is
     * 1.240722x deeper than it is wide, so its two lean bounds have tangents in
     * exactly that ratio; and measured against `box-03`'s own 60 triangles at
     * this station the clean window is 13 to 29 degrees of SPLAY and no
     * backsweep at any angle — a horn stood bolt upright here leaves its base
     * 0.018192 outside the shell. 25 is one degree past the window's deepest
     * point. The elephant's `wedge-11` is square, leans back marginally better
     * than it splays, and is left to the ox and the water buffalo.
     *
     * z = 3/16 is the forward-most clean station (4/16 leaves 4 vertices 0.0278
     * outside) and x = 4/16 is clean by 0.006873, where the tusk's OWN recorded
     * 0.294346 — available here because the hog wore it on this very cube —
     * leaves 0.00326 of daylight. */
    {
      name: 'horn',
      part: 'wedge-13',
      kind: 'pair',
      paint: 'horn',
      spin: [{ axis: 'x', deg: -90 }, { axis: 'z', deg: -25 }],
      at: [0.25, CROWN_Y, 0.1875],
    },
    /* THE BEARD. The same shape and the same 45 degrees as the tail, on the
     * opposite chamfer and turned the opposite way, so one stands and one hangs.
     * Rule 3 fuses head and body and leaves this animal no chin, so the
     * front-bottom chamfer — the lowest point of the head end — is where a beard
     * can hang from; it reaches down to y = 0.0984 and z = 0.6295, in front of
     * the chest and clear of both front legs, and it never becomes the floor.
     * `cone-01` because it is the bank's only true point (taper 0.000) and its
     * narrowest ear at 0.160 across, which is what a beard is. Dark, so it reads
     * against a white chest at portrait size. */
    {
      name: 'beard',
      part: 'cone-01',
      paint: 'horn',
      spin: [{ axis: 'x', deg: 135 }],
      at: [0, CHAMFER_DOWN_Y, CHAMFER_OFF],
    },
  ],

  /* Busier than the sheep, which is the last separation and the cheapest: that
   * animal is placid and only its ears move. A goat's tail flicks all day. */
  motion: [
    { kind: 'wag', parts: ['tail'] },
    { kind: 'twitch', parts: ['ear'] },
  ],
})
