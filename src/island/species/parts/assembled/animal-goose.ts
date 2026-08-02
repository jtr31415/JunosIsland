/**
 * The goose — Farm's first bird, the tallest animal in the collection, and the
 * one species here whose whole design is a SEPARATION FROM AN ANIMAL THAT DOES
 * NOT EXIST YET.
 *
 * ONE SPECIES, ONE FILE. `register.ts` says why the one appended line in
 * `index.ts` is the whole of the wiring.
 *
 * `animal-pigeon` is derived from this file. Read §2, §3 and §5 before deriving
 * it: almost everything here is specific to a hull a pigeon must not take.
 *
 * ===========================================================================
 * ## 1. THE PROBLEM IS `animal-duck`, WHICH IS NOT BUILT
 * ===========================================================================
 *
 * `collections/farm.ts:80-83` states it and settles it in one sentence: *"The
 * goose has to leave room for `animal-duck`, which is rostered in Birds and is
 * NOT built yet. A goose that reads as a large duck today becomes a duplicate
 * the day Birds ships, so it is built deliberately big (2.20, the tallest bird
 * here) and long-necked (1.30), which is the separation a duck cannot later take
 * away."*
 *
 * So SIZE and NECK are not decoration on this animal, they are the entire brief,
 * and neither may be traded for tidiness. That sentence is what buys the
 * expensive hull in §2 and it is what settles every number in §3.
 *
 * The six other Farm birds are turkey, rooster, chicken, guinea fowl, quail and
 * pigeon. Five are galliforms and the sixth is a town pigeon; **this is the only
 * long-necked one, the only white one, and the tallest thing in the collection**
 * at 1.95604 where a bird on the 1.250 cube stands on `HEIGHT_FLOOR` = 1.43125.
 *
 * ===========================================================================
 * ## 2. THE HULL IS THE TIGER'S, AND ITS BOUNDING BOX LIES ON THREE FACES
 * ===========================================================================
 *
 * `box-41` — 1.350 x 1.300 x 1.350, `OTHER_HULLS.bigger`, the pack's only shell
 * larger than the cube on all three axes, and the tiger's own. Nothing had worn
 * it. It is taken for §1's reason and for no other, because it is EXPENSIVE:
 * **262 triangles against `box-03`'s 60**, which is 37% of everything this animal
 * spends and 28% of rule 9's ceiling on its own. See §5.
 *
 * **Its `size` field is not where its faces are.** Measured off its own 454
 * points, three of its six faces are set back behind the bounding box, and the
 * three that lie are the three a bird uses:
 *
 *   - **FRONT.** The box says 0.725, and `hulls.ts:97` records that. It is an
 *     OCTAGONAL PRISM — the tiger's muzzle boss — spanning only |x| <= 0.200 and
 *     world y 0.49375 to 0.89375, standing 0.100 proud. **The flat plate the eye
 *     cards land on is at z = 0.625**, exactly `box-03`'s, running x +/-0.3125 by
 *     y 0.49375 to 1.11875. §4 is what that boss costs.
 *   - **CROWN.** The box says 1.48125. That is two transverse ridges at |x| <=
 *     0.3276, world z -0.2575 to -0.1383 and +0.1383 to +0.2575, standing 0.050
 *     proud. **The flat crown is 1.43125** — `box-03`'s own — over the square
 *     x +/-0.3125 by z +/-0.3125. The neck is joined to that square.
 *   - **FLANK.** The box says 0.675. Two pads. **The flat flank is 0.625**, over
 *     y 0.49375 to 1.11875 by z +/-0.3125.
 *
 * The rear face does not lie: -0.625, and it is `box-03`'s. So the useful half of
 * the finding is that **`box-41`'s six flat plates are `box-03`'s six flat plates
 * at identical world coordinates, and so is its front-top chamfer** — measured
 * here, the crown's front edge is (1.43125, 0.3125) and the front plate's top
 * edge is (1.11875, 0.625), a rise of -0.3125 against a run of +0.3125, so that
 * chamfer is a true 45-degree plane whose midpoint (0, 1.275, 0.46875) is the
 * cube's. **Every join on this animal transfers from `box-03` unchanged.** What
 * does NOT transfer is anything solved off `size`, off `HULL_FRONT_Z['box-41']`
 * (0.725, the boss) or off the builder's own `hullFrame`, whose `top` is 1.48125
 * and whose chamfer solve is pulled off by the ridges. Nothing here uses any of
 * those three.
 *
 * `box-31` was not considered: PB-075 makes it an open shell with a 1.000 x 1.000
 * hole in the front of the head. `box-21` is taller and is the obvious reach for
 * a tall bird — it is refused because PB-076's two lugs sit on its crown at |x|
 * 0.218-0.454, z 0.2616-0.465, tips at +0.7525, which is exactly where this
 * animal's neck goes.
 *
 * ===========================================================================
 * ## 3. THE NECK: THE ELEPHANT'S TRUNK, STOOD ON END, AND A LEAN THE PACK'S
 * ##    OWN HEIGHT CEILING FORCES
 * ===========================================================================
 *
 * There is no neck in the bank. `box-18` is the elephant's TRUNK, the bank's only
 * tail attaching `z +1`, and `animal-terrapin.ts:443` established that worn
 * FORWARDS it is a neck — *"a thick tapering tube growing out of a face is a
 * turtle's neck"*. That is the substitution Joe signed off on 3 August. This
 * species takes it further in three ways and every one of them is measured.
 *
 *   1. **IT IS STOOD ON END.** `axis: 'y', dir: 1` overrides the shape's recorded
 *      `z +1` attachment — the tortoise-hoop trick, sanctioned on `PartDef.axis`.
 *      The terrapin wears the trunk along its 0.425211 of DEPTH, which is the
 *      bank's longest forward reach; stood on end it runs along its 0.623004 of
 *      HEIGHT instead, **1.465x longer** and the longest single reach any one bank
 *      part has. A goose's neck is the longest thing on it, so it takes the
 *      longest axis there is.
 *   2. **IT IS STRETCHED 1.75x IN y, TO 1.090257.** Free — a stretch costs no
 *      geometry — and it is the terrapin's own mechanism (`stretch: [1, 0.5, 1]`)
 *      run the other way. **0.681411 of that stands clear of the shell**, which
 *      with the head and the bill makes a head-and-neck assembly 1.012 long
 *      against a 1.350 body. It is not the largest stretch that fits: 2.0x also
 *      clears, at **2.004712 against a ceiling of 2.02**, and 0.0153 of margin on
 *      a number the harness pins exactly is not something to ship.
 *   3. **IT LEANS 60 DEGREES OFF VERTICAL, AND THAT IS FORCED.** At this neck's
 *      length the pack's own height ceiling admits exactly one station on the
 *      15-degree grid. Rebuilt with nothing but the spin changed:
 *
 *            upright   2.262627      OVER 2.02
 *            15 deg    2.239408      OVER
 *            30 deg    2.171336      OVER
 *            45 deg    2.063378      OVER
 *            60 deg    1.956041      the first that fits
 *
 *      **A goose that stands its neck up cannot be built in this pack at all**,
 *      and that is a fact about `PACK_HEIGHT_MAX` rather than about this animal.
 *      Leaning is how vertical headroom is converted into neck.
 *
 * **WHY NOT LEAN LESS AND ACCEPT A SHORTER NECK.** Because the trade is bad, and
 * it was measured at every station — the longest neck the ceiling allows, at each
 * lean, at the lowest 1/16 sink that still buries the root (below) and the
 * largest quarter-step stretch:
 *
 *       lean 45   visible 0.535394   plan 0.378581   height 1.960130
 *       lean 55   visible 0.584066   plan 0.478441   height 1.940380
 *       lean 60   visible 0.681411   plan 0.590119   height 1.956041
 *       lean 65   visible 0.876099   plan 0.794019   height 1.994150
 *
 * 45 degrees is the elegant answer — it is the hull's own chamfer angle (§2) —
 * and it buys 21% less neck for the same height. **`plan` is why the difference
 * matters more than it looks: the island camera looks DOWN**
 * (`animal-budgie.ts:55-58`), so what a child actually sees of a neck is its
 * projection on the ground, and 60 degrees shows 0.590119 of neck where 45 shows
 * 0.378581 — **56% more, for 0.004 of height.** Past 60 it keeps improving and
 * the animal stops being one: at 65 degrees the neck is 25 degrees off the
 * ground, which is a goose hissing rather than a goose standing, and §1 asked for
 * both.
 *
 * **WHERE IT JOINS, AND WHY THE SINK IS 6/16.** The join is `[0, 1.43125,
 * 0.1875]` — the flat crown (§2), 3/16 forward of the midline. That station is
 * solved: the root face lands `sink * L` back down the facing and spans
 * 0.425211 across the slope, so its rear corner sits at z = NECK_Z - 0.460374,
 * and **3/16 is the LOWEST station on the pack's grid at which that corner is
 * still on the crown's flat square** (2/16 puts it at -0.335374, past the crown's
 * rear edge at -0.3125 and out over the rear chamfer). Lowest is what is wanted,
 * because it seats the neck over the shoulders rather than over the breast.
 *
 * The SINK is solved too, and the rule generalises the terrapin's: a leaned root
 * face rides UP as it leans, so the burial has to keep up with it.
 *
 *       sink * L  >=  (0.425211 / 2) * tan(lean)  =  0.368244
 *
 * — so `s >= 0.337758`, and on the 1/16 grid that is **6/16**. At 5/16 the neck's
 * rear-top corner stands **0.013769 proud of the crown it is joined to**, which is
 * §3's "nothing floats" failing at a root instead of at a tip. 6/16 buries
 * **0.408846 — 3.27x §3's 0.125 floor** — and leaves 0.681411 standing.
 *
 * **It exits through the shell rather than standing on it**, and both edges were
 * checked: the rear-upper edge leaves through the flat crown at z = -0.237711,
 * and the front-lower edge leaves through the front-top chamfer at (1.321365,
 * 0.422385), which is on that chamfer's face (z between 0.3125 and 0.625) and
 * inside its flat |x| <= 0.3125.
 *
 * **ONE SEGMENT, NOT TWO.** A second `box-18` stacked on the first is the obvious
 * route to a longer neck and it does not work, for a reason that has nothing to
 * do with cost: **the neck's length is capped by the height ceiling and not by
 * the part.** Two segments under that cap are the same 0.681411 of neck with a
 * seam across the middle of it and 80 more triangles. The stretch buys the same
 * silhouette for nothing, which is why it is the mechanism.
 *
 * ===========================================================================
 * ## 4. THE EYE CANNOT BE ON THE HEAD, AND THAT IS RULE 5, NOT A SHORTCUT
 * ===========================================================================
 *
 * **Flagged for Joe, because it is the one thing here I would change if I could.**
 * `EYE_CARD_Z` is 0.635 and `CreatureDef.eyes` has no `z` field — rule 5 made
 * unsayable. This animal's head sits at y 1.772 and z 0.78 to 1.01, which is 0.78
 * above the pack's eye plane and entirely in front of it. **On a long-necked
 * animal there is no placement at which an eye card is on the head**, so the eyes
 * sit on the hull's front plate at the neck's root — exactly the compromise
 * `animal-terrapin.ts` shipped and Joe passed. If the eye should follow the head,
 * rule 5 has to change, and that is his call and not this species'.
 *
 * Given that, WHERE on the plate is solved rather than picked, and the tiger's
 * boss is what solves it. `plate-08` is a true disc — measured, maximum radius
 * 0.200000 over all 34 of its points — and the boss (§2) stands 0.100 proud of
 * the plate, so any part of the disc inside its footprint is hidden behind it.
 * The boss's nearest silhouette vertex to the card's own recorded x of 0.2625 is
 * **(0.1414, 0.83515)**, and the disc clears the boss entirely when
 *
 *       EYE_Y  =  0.83515 + sqrt(0.200^2 - (0.2625 - 0.1414)^2)  =  0.994319
 *
 * — the station at which the disc is exactly TANGENT to that corner. Below it the
 * card starts disappearing into the tiger's muzzle; above it costs height for
 * nothing.
 *
 * **The cost, stated: the plate is not tall enough for this card.** Its flat top
 * is 1.11875 and the boss's crown is 0.89375, so the clear band is **0.225 for a
 * 0.400 card** and there is no free placement at all. At 0.994319 the top of the
 * card crosses onto the front-top chamfer and floats at most **0.08557** — against
 * the 0.010 the pack gives a card on a flat face and the **0.135** the lion
 * demonstrates on `box-31` (`assembly-assert.ts:538-540`). Inside precedent, and
 * the smallest float available once the boss is cleared. The card's outer edge
 * rides the front-side chamfer exactly as it does on `box-03`, which is the
 * pack's own condition and not this hull's.
 *
 * The neck was checked against the same card and clears it: its front-lower edge
 * crosses z = 0.635 at y = 1.444119, which is 0.25 above the card's top edge.
 *
 * ===========================================================================
 * ## 5. WHAT THE BUDGET ACTUALLY SAYS, MEASURED ON THE BUILT MESHES
 * ===========================================================================
 *
 * **Do not price this animal off `bank.generated.ts`'s `verts` field.** The kit
 * WELDS, so the bank's raw sum of 1253 arrives as 541 — the hull alone goes 454
 * to 147. Triangles do not weld and are exact, which is why they are the budget
 * that binds here and the other two do not come close:
 *
 *       triangles      704  of 422-951      74% of the ceiling   <-- binds
 *       model verts    541  of 405-1626     33%
 *       body verts     477  of 236-1114     43%
 *
 * `box-41` is **262 of those 704** where `box-03` would have been 60, so §1's
 * separation costs 202 triangles — a quarter of what the whole animal is allowed.
 * It buys 0.100 of body in every direction and, much more importantly, it is the
 * only shell that is not the cube, so the goose is not the cube-plus-a-neck.
 *
 * What is left over is real: 247 triangles, which is a whole second animal's
 * worth of detail. **Nothing here was cut for cost.** The tail is a nose for the
 * reason in §6 and not for a budget reason, and the single neck segment is §3's
 * ceiling and not a saving. That is worth saying plainly, because the first
 * draft of this file refused both on a vertex arithmetic that did not survive
 * contact with the welder.
 *
 * **For `animal-pigeon`, which derives from this file:** a pigeon is small and
 * blue-grey and must NOT take `box-41` — on `box-03` it gets 202 triangles back
 * and loses every trap in §2 and §4 with them. The wing block and the leg block
 * transfer unchanged, because they are `box-03`'s numbers already. §3 and §4 are
 * this hull's and should be re-derived rather than copied.
 *
 * ===========================================================================
 * ## 6. EVERY OTHER PART, AND WHAT IT WAS SUBSTITUTED FROM
 * ===========================================================================
 *
 *   - **HEAD = `tube-06`, the fox's MUZZLE** — the same part and the same role
 *     `animal-terrapin.ts:451` wears as a head, hung `on: 'neck'` as a pure donor
 *     transfer: no `at`, no `sink`, no `spin`. It is 0.532 wide against the neck's
 *     0.345, **1.54x**, which is what a head is. Because the neck's tip face is
 *     leaned 60 degrees and the head's root plane is upright, the transfer lands
 *     the head's root face BISECTED by that plane — its lower-rear corner inside
 *     the neck and its upper-rear corner the same distance proud. That is a step
 *     where a head sits on an angled neck, not a float, and it is symmetric
 *     because `tube-06`'s own recorded sink is zero and the anchor is the tip
 *     face's centre. It ends up at y 1.622-1.922, which is **0.141 clear above the
 *     hull's own crown ridges**: the head is held above the body, not in front of
 *     it.
 *   - **BILL = `tube-02`, the CHICK'S AND PENGUIN'S BEAK**, painted orange, hung
 *     `on: 'head'`. Round-section, `taper: 1.000`, blunt all the way to the tip —
 *     0.460 wide on a 0.532 head (**86%**), which is a goose. **`cone-06` is
 *     refused and the refusal is its shape, not its cost**: it is the bank's only
 *     cone and it is the PARROT's, and `animal-canary.ts` measured its upper
 *     mandible standing 0.0838 proud of its lower — 29% of its depth. That
 *     overhang is a hook. A goose's bill is a straight blunt wedge with no hook in
 *     it at all, so the 0.083 of extra reach `cone-06` buys is bought by making
 *     the animal wrong. `tube-02`'s own recorded sink of 0.5 buries half of it in
 *     the head and leaves 0.100 standing, tip at z 1.109.
 *   - **TAIL = `tube-07`, THE GIRAFFE'S NOSE, WORN BACKWARDS — and the reason is
 *     that THE BANK HAS NO BIRD'S TAIL.** A standing bird's tail is held FLAT:
 *     wider than it is tall. Measured over all seven shapes the pack itself used
 *     as a tail, **not one of them is** — width over height runs 0.1911, 0.1911,
 *     0.2587, 0.5538, 0.6861, 0.8174, 0.8420, and every one is under 1. They are
 *     mammal tails, and the two that come closest are spent: `wedge-03` is the
 *     beaver's paddle and is `animal-chinchilla.ts`'s, and `box-23` is the fox's
 *     brush, which reads as a fox whatever colour it is. `tube-07` is **1.7733** —
 *     0.532 wide by 0.300 tall by 0.266 deep — and it is the only short broad
 *     blunt shape in reach. `spin: [{ axis: 'y', deg: 180 }]` turns its `z +1`
 *     facing onto `z -1` and the donor transfer then does everything else: the
 *     rear face at -0.625 and the shape's own height of 0.74375. Its root is
 *     0.532 x 0.300 on a rear plate that is 0.625 x 0.625, so **every corner of it
 *     is on flat geometry** and §3's 0.125 floor — which exists for a root over a
 *     chamfer — has nothing to bite on; the donor's own 0.100 of burial is left
 *     alone, which is `animal-nightjar.ts`'s argument. It reaches 0.166 clear,
 *     35% of what `box-38` would.
 *
 *     **`box-38` is separately the TURKEY's** — upright it is the fan
 *     `animal-canary.ts:439` wears, the digest assigns it to the turkey, and a
 *     goose wearing a fan reads as a small turkey in the collection with the
 *     densest look-alike group in the roster. Either reason alone would settle it.
 *   - **WINGS = `box-06`, THE BUNNY'S EAR, AS A SOLID ALONG THE FLANK**, at the
 *     four cage birds' idiom — with every one of its numbers RE-DERIVED on this
 *     hull rather than copied, because `box-41` is not `box-03`. `axis: 'z',
 *     dir: -1`, `spin: [{ z: -90 }, { y: -90 }]`. The join is `[0.625, 0.80625,
 *     0]`: 0.625 is this shell's FLAT flank (§2, not the 0.675 its box claims),
 *     and **0.80625 is that flat plate's own centre — NOT `box-41`'s recorded
 *     centre, which is 0.83125.** The two differ on this hull and agree on every
 *     other, and it is the plate's centre that is wanted, because at 0.80625 the
 *     whole 0.482 of wing stays inside the plate's 0.49375-1.11875. `WING_SINK` is
 *     solved and lands on the same 8/16: the tip reaches |z| 0.456649 where the
 *     flat flank reaches 0.3125, an overhang of 0.144149, which is 0.471328 of the
 *     shape's 0.305836 of thickness — its own recorded 0.366259 is not enough — so
 *     8/16 buries 0.152918, over §3's floor, and leaves 0.152918 standing.
 *     **Never a flat card**: the island camera looks down and a zero-thickness
 *     card on a flank is edge-on and simply gone.
 *   - **LEGS = two, and JT-044's two-tone as WEBBING.** `legs: false` plus one
 *     mirrored `box-01` pair, at the shape's own recorded x of 0.25 and on the
 *     midline, which is the only station a biped's legs can take. The paint is
 *     `{ base: 'limb', patch: { below: 'web', at: 0.25 } }` — `animal-pony.ts:322`
 *     exactly, and the slot name is `animal-terrapin.ts`'s. **It is not a marking
 *     and must not be read as one**: the bank has no webbed foot and a painted
 *     boundary is the only thing this kit can say the word with. 4/16 is the
 *     LOWEST grid station that clears `box-01`'s bevel — the leg reaches full
 *     width at 0.204082 of its own height, so 3/16 lands inside the bevel and the
 *     boundary follows a sloping face — and it puts 0.076563 of web against the
 *     0.18125 of leg that shows, **42% of the visible limb**, which is a goose's
 *     foot.
 *   - **THE FEATURE IS NAMED `leg`, NOT `leg-front`.** The four cage birds call
 *     their biped pair `leg-front`, which was copied along the four and means the
 *     harness's `counts()` charges those meshes to the BODY, because it excludes
 *     only a feature whose role is exactly `leg`. It changes nothing here — 477
 *     against a ceiling of 1114 either way — and it is still what the feature is:
 *     a bird has legs, not a front pair.
 *   - **NO BELLY LINE, NO `byBand` ANYWHERE, NO MARKING CARD, NO EARS, NO RIDGE,
 *     NO SECOND STRETCH.** A white farmyard goose is one colour top to bottom; it
 *     has no counter-shading to draw, and `belly` is free and is declined for
 *     `animal-canary.ts`'s reason. The only tonal break on the animal is the wing
 *     tract, below.
 *   - **IT FLAPS.** `motion.ts`'s own measured defaults, nothing tuned, as the
 *     budgie and the canary do. It moves no vertex.
 *
 * ## THE PALETTE IS NEW AND NOBODY HAS SIGNED IT OFF
 *
 * `farm.ts` carries no colour for this species at all, so all six below are the
 * first this animal has ever had and every one is UNREVIEWED.
 *
 *   - `coat` is a warm white and is nearly the whole animal by surface area.
 *   - `flight` is that white shaded down, on the wings and the tail — which are
 *     one feather tract on a real bird, so it is anatomy and not decoration. It
 *     exists because a solid wing standing 0.152918 proud in the identical white
 *     is a bulge rather than a wing from the island's downward camera;
 *     `animal-canary.ts` and `animal-kiwi.ts` argue exactly this. **It is not a
 *     marking.**
 *   - `limb` is the bill and the legs, which on a goose are the same orange, and
 *     it is the only saturated thing on the animal.
 *   - `web` is that orange one step down, for the webbing alone. See above.
 *   - `eye` is dark, for two cards, and lets Kenney's band 15 come through as the
 *     glint.
 *
 * **Flagged**, for the palette, for the eye rule 5 will not let onto the head,
 * for a tail that is a nose, and for a hull whose bounding box lies. Nothing
 * authored, no `byBand`, the hull unscaled, height 1.95604 inside the pack's
 * 1.43-2.02 with 0.064 to spare, feet on y = 0, keep-out 0.95001 against Farm's
 * own ratchet of 1.38 and the fox's 1.15, one mass, and the hull 9.24x the next
 * biggest thing on the animal.
 */
import { defineCreature } from '../creature'
import { LEG_ROW } from '../hulls'
import { PACK_PUPIL } from '../texture'

/**
 * `box-41`'s two FLAT plates this animal joins to, measured off its own 454
 * points — not off its `size`, which overstates both (§2). Each is `box-03`'s own
 * number at the same world coordinate.
 */
const HULL_CROWN_Y = 1.43125
const HULL_SIDE_X = 0.625

/** The flat FLANK plate's own centre. `box-41`'s recorded centre is 0.83125. */
const FLANK_CENTRE_Y = 0.80625

/**
 * 3/16 forward of the midline: the LOWEST station on the pack's grid at which the
 * neck's whole root face is still on the crown's flat square. Its rear corner
 * lands at `NECK_Z - 0.460374`, so 2/16 would put it at -0.335374, past the
 * crown's rear edge at -0.3125 and out over the chamfer. Lowest is what is
 * wanted: it seats the neck over the shoulders rather than over the breast.
 */
const NECK_Z = 0.1875

/**
 * `box-18`'s own 0.623004 becomes 1.090257, of which 0.681411 stands clear —
 * a head-and-neck assembly 1.012 long against a 1.350 body. Not the largest
 * stretch that fits: 2.0x clears too, at 2.004712 against a ceiling of 2.02, and
 * 0.0153 of margin is not something to ship.
 */
const NECK_STRETCH = 1.75

/**
 * 6/16, and it is SOLVED. A leaned root face rides up as it leans, so the burial
 * has to keep up: `sink * L >= (0.425211 / 2) * tan(60) = 0.368244`, i.e.
 * `s >= 0.337758`. At 5/16 the neck's rear-top corner stands 0.013769 proud of
 * the crown it is joined to. 6/16 buries 0.408846 — 3.27x §3's 0.125 floor.
 */
const NECK_SINK = 0.375

/**
 * 60 degrees off vertical, and it is FORCED by `PACK_HEIGHT_MAX` rather than
 * chosen. At this neck's length: upright 2.262627, 15 deg 2.239408, 30 deg
 * 2.171336, 45 deg 2.063378 — all over 2.02 — and 60 deg 1.956041. A goose that
 * stands its neck up cannot be built in this pack. Leaning also pays: the island
 * camera looks DOWN, so what is seen of a neck is its ground projection, and this
 * shows 0.590119 where the hull's own 45-degree chamfer angle would show
 * 0.378581. See §3 for the whole table and for why it stops at 60.
 */
const NECK_LEAN = 60

/**
 * Where the eye can sit at all, solved against the tiger's muzzle boss.
 *
 * `plate-08` is a disc of radius 0.200000 (measured, all 34 points) and the boss
 * is an octagonal prism standing 0.100 proud of the front plate, so anything of
 * the disc inside its footprint is hidden. (0.1414, 0.83515) is the boss vertex
 * nearest the card's own recorded x, and this is the station at which the disc is
 * exactly tangent to it. The card's top then crosses onto the front-top chamfer
 * and floats at most 0.08557 — the pack's own daylight is 0.010 and the lion
 * demonstrates 0.135. See §4: the plate is 0.225 clear for a 0.400 card, so
 * there is no placement that costs nothing.
 */
const EYE_X = 0.2625
const EYE_RADIUS = 0.2
const BOSS_CORNER_X = 0.1414
const BOSS_CORNER_Y = 0.83515
const EYE_Y = BOSS_CORNER_Y
  + Math.sqrt(EYE_RADIUS ** 2 - (EYE_X - BOSS_CORNER_X) ** 2)

/**
 * Half the wing buried, re-derived on THIS shell rather than inherited from the
 * cage birds. The tip reaches |z| 0.456649 and `box-41`'s flat flank reaches only
 * 0.3125, so 0.144149 of it stands over a surface that has receded — 0.471328 of
 * the shape's own 0.305836 of thickness, where its recorded burial is 0.366259
 * and is not enough. Snapped up to the pack's 1/16 grid: 8/16.
 */
const WING_SINK = 0.5

export const GOOSE_ASSEMBLY = defineCreature('animal-goose', {
  /* NEW AND UNREVIEWED — farm.ts carries no colour for this species at all. */
  palette: {
    coat: 0xf2efe4,    // UNREVIEWED: warm white — nearly the whole bird
    flight: 0xbdbab0,  // UNREVIEWED: that white shaded down — wings and tail
    limb: 0xe08a24,    // UNREVIEWED: the bill and the legs, one orange
    web: 0xc26d15,     // UNREVIEWED: that orange one step down — the webbing only
    eye: 0x2a2520,     // UNREVIEWED: the only dark thing on the animal
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* THE TIGER'S SHELL, never worn before, taken for §1's separation and priced in
   * §5. Painted ONE FLAT SLOT: no belly line, no band cut, no marking. */
  hull: { part: 'box-41', paint: 'coat' },

  /* Solved against the muzzle boss — see EYE_Y. Rule 5 nails z and this animal's
   * head is 0.78 above it; §4 is the flag. */
  eyes: { part: 'plate-08', paint: 'eye', x: EYE_X, y: EYE_Y },

  /* THE NECK: the elephant's TRUNK stood on end and leaned as far as the pack's
   * height ceiling makes it. §3 carries all four numbers. */
  snout: {
    part: 'box-18',
    name: 'neck',
    paint: 'coat',
    axis: 'y',
    dir: 1,
    stretch: [1, NECK_STRETCH, 1],
    spin: [{ axis: 'x', deg: NECK_LEAN }],
    sink: NECK_SINK,
    at: [0, HULL_CROWN_Y, NECK_Z],
  },

  /* THE HEAD: the fox's muzzle, the terrapin's own choice for this job, as a pure
   * donor transfer onto the neck's tip. */
  nose: { part: 'tube-06', name: 'head', on: 'neck', paint: 'coat' },

  /* THE GIRAFFE'S NOSE WORN BACKWARDS, because not one of the bank's seven tails
   * is wider than it is tall and a standing bird's tail is (§6) — and because the
   * fan is the turkey's. Turned, then placed by the donor transfer entire. */
  tail: { part: 'tube-07', paint: 'flight', spin: [{ axis: 'y', deg: 180 }] },

  legs: false,
  extras: [
    /* TWO legs, named `leg` because that is what they are. JT-044's patch as
     * WEBBING, not as a marking. */
    {
      name: 'leg',
      part: 'box-01',
      paint: { base: 'limb', patch: { below: 'web', at: 0.25 } },
      kind: 'pair',
      sink: LEG_ROW.sink,
      at: [0.25, LEG_ROW.y, 0],
    },

    /* THE WING, a SOLID along the flank, at the cage birds' idiom with all three
     * join coordinates re-derived on this shell (§6). */
    {
      name: 'wing',
      part: 'box-06',
      paint: 'flight',
      kind: 'pair',
      axis: 'z',
      dir: -1,
      spin: [{ axis: 'z', deg: -90 }, { axis: 'y', deg: -90 }],
      sink: WING_SINK,
      at: [HULL_SIDE_X, FLANK_CENTRE_Y, 0],
    },

    /* THE BILL: the chick's and the penguin's, blunt and straight. `cone-06` is
     * the parrot's hook and is refused on shape, not on cost (§6). */
    { name: 'bill', part: 'tube-02', paint: 'limb', on: 'head' },
  ],

  motion: [{ kind: 'flap', parts: ['wing'] }],

  flag: 'THE EYE CANNOT BE ON THE HEAD AND THAT IS THE ONE THING HERE I WOULD CHANGE '
    + 'IF THE RULES LET ME. EYE_CARD_Z is 0.635 and CreatureDef.eyes has no z field — '
    + 'rule 5 made unsayable — and this animal\'s head is at y 1.77 and z 0.78 to 1.01, '
    + 'which is 0.78 above the pack\'s eye plane and entirely in front of it. On a '
    + 'long-necked animal there is NO placement at which an eye card lands on the head, '
    + 'so the eyes sit on the body\'s front plate at the neck\'s root, which is exactly '
    + 'what animal-terrapin.ts shipped. If the eye should follow the head, rule 5 has '
    + 'to change and that is your call. Given that, WHERE on the plate is solved rather '
    + 'than picked: plate-08 is a disc of radius 0.200000 and box-41\'s front carries '
    + 'the TIGER\'S MUZZLE BOSS, an octagonal prism standing 0.100 proud over |x| <= '
    + '0.200 and y 0.494-0.894, so y = 0.994319 is the station where the disc is '
    + 'exactly tangent to the boss\'s corner at (0.1414, 0.83515) and none of it is '
    + 'hidden. It costs a top edge floating 0.08557 where it crosses onto the chamfer, '
    + 'against the pack\'s own 0.010 and the lion\'s 0.135 — the plate is only 0.225 '
    + 'clear above that boss and the card is 0.400, so there is no free placement. '
    + 'BOX-41\'S BOUNDING BOX LIES ON THREE OF SIX FACES and all three are ones a bird '
    + 'uses: the front 0.725 is that boss and the flat plate is 0.625; the crown '
    + '1.48125 is two transverse ridges and the flat crown is 1.43125; the flank 0.675 '
    + 'is two pads and the flat flank is 0.625. All three flat plates, and the '
    + 'front-top chamfer, are box-03\'s own at identical world coordinates, so every '
    + 'join transfers — but nothing solved off `size`, off HULL_FRONT_Z (0.725) or off '
    + 'the builder\'s hullFrame (top 1.48125) will land. THE NECK IS THE ELEPHANT\'S '
    + 'TRUNK STOOD ON END: box-18 with its axis overridden to y so it runs along its '
    + '0.623004 rather than its 0.425211, stretched 1.75x, leaned 60 degrees. '
    + 'animal-terrapin.ts:443 is the precedent for wearing a trunk as a neck. THE LEAN '
    + 'IS FORCED, NOT A POSE: at this length the same animal measures 2.262627 upright, '
    + '2.239408 at 15 degrees, 2.171336 at 30 and 2.063378 at 45, all over the pack\'s '
    + 'ceiling of 2.02, and 1.956041 at 60. A GOOSE THAT STANDS ITS NECK UP CANNOT BE '
    + 'BUILT IN THIS PACK. It pays twice over, because the island camera looks down and '
    + 'what is seen of a neck is its ground projection: 0.590119 at 60 degrees against '
    + '0.378581 at the hull\'s own 45-degree chamfer angle, 56% more for 0.004 of '
    + 'height. THE TAIL IS A NOSE, because the bank has no bird\'s tail: a standing '
    + 'bird\'s tail is held flat, wider than tall, and measured over all seven shapes '
    + 'the pack used as a tail NOT ONE IS — width over height runs 0.1911 to 0.8420 and '
    + 'every one is under 1. tube-07, the giraffe\'s nose, is 1.7733. box-38 is '
    + 'separately the TURKEY\'S fan and a goose wearing one reads as a small turkey. '
    + 'NOTHING HERE WAS CUT FOR COST — the kit welds, so the bank\'s raw 1253 vertices '
    + 'arrive as 541, and this animal is 704 triangles of 951, 541 model vertices of '
    + '1626 and 477 body vertices of 1114. Triangles are the tight one at 74%, and '
    + 'box-41 is 262 of them where box-03 would be 60, which is what the size '
    + 'separation costs. NEW PALETTE, UNREVIEWED — farm.ts carried no colour for this '
    + 'species at all. The "flight" slot on the wings and tail is the coat shaded down '
    + 'so a solid wing standing 0.152918 proud reads as a wing from above, and the '
    + '"web" slot is JT-044\'s patch saying WEBBED because the bank has no webbed foot; '
    + 'neither is a marking and a white goose has none. Nothing was authored, nothing '
    + 'but the neck is stretched, and the hull is not scaled.',
})
