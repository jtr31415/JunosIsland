/**
 * The terrapin's assembly, as a definition — a red-eared slider, and the species
 * whose whole job is TO NOT BE THE TORTOISE.
 *
 * ONE SPECIES, ONE FILE. `register.ts` says why the one appended line in
 * `index.ts` is the whole of the wiring.
 *
 * ## THE TWIN, STATED FIRST, BECAUSE IT IS THE RISK
 *
 * `animal-tortoise.ts` is built, signed off and shipped in Garden, and a terrapin
 * is the same animal with a flatter shell and webbed feet.
 * `species-garden.test.ts:261-286` exists to fail silhouette twins, and a terrapin
 * that is the tortoise again is exactly the failure it exists to catch. So the
 * divergence is not a hope, it is five measured decisions, and every one of them
 * is pinned by `tests/island/assembly-terrapin.test.ts`:
 *
 *   |  | tortoise | terrapin |
 *   |---|---|---|
 *   | hull | `box-03`, the 1.250 cube | **`box-31`**, 1.250 x 1.250 x **1.125** — the pack's only hull whose body is wider than it is deep |
 *   | shell | `box-19`, square 1.404, **halved in thickness** | **`box-11`**, oval 1.4445 x 0.8769, **unstretched** — aspect 1.647 against 1.000 |
 *   | crown | twelve `wedge-08` scutes, top row and both chamfers | **none at all** |
 *   | height | 1.48125 — its scutes stand 0.050 proud | **1.43125**, `HEIGHT_FLOOR` exactly |
 *   | front | nothing. Its silhouette ends at its shell | **0.7647 of neck, head and snout** |
 *   | `box-18` | worn BACKWARDS, spun 180, as a stub tail | worn **FORWARDS, unspun**, as a neck |
 *
 * **THE MEASURED AXIS THAT SEPARATES THEM IS THE FORWARD REACH.** The tortoise's
 * frontmost geometry is its own rim at z = 0.702 and it has no face parts at all;
 * this animal's is a snout tip at z = 1.2648, which is 0.7647 in front of its own
 * hull. Nothing in the pack reaches that far forward — the badger's muzzle and
 * nose together make 0.370 — and the tortoise reaches nothing.
 *
 * The second axis is HEIGHT, in the direction that is hard to get: this animal
 * measures **1.43125**, which is `HEIGHT_FLOOR` to the digit and the flattest
 * anything in this pack can be, because it puts nothing at all on top of its
 * hull. The tortoise is 0.050 taller and every millimetre of that is scutes.
 *
 * ## SEPARATION INSIDE HOME PETS
 *
 * `collections/home-pets.ts` assigns this species its axis in one line: *"The
 * shelled one. A terrapin is the only member whose body is armour, and the only
 * reptile here that is wider than it is long."* Both halves are honoured by
 * measurement rather than by assertion:
 *
 *   - **The armour** is `box-11` laid flat plus a painted carapace line, and no
 *     other member of this collection wears a `band` shape at all.
 *   - **Wider than it is long** is `box-31`, the one hull in the bank whose BODY
 *     is wider (1.250) than it is deep (1.125). `box-12` is wider on paper and is
 *     refused: the badger measured its 1.539 and found every millimetre of the
 *     extra to be two fused EAR LUGS on a 1.250 cube torso — a hull that is not
 *     actually wider, and that arrives wearing ears a turtle does not have.
 *
 * Against the **gecko** (four legs, fat tail, big eyes, sandy-yellow) and the
 * **corn snake** (legless), this is the only one of the three reptiles carrying a
 * second shape on its body at all, and the only one with a neck. The coat is
 * OLIVE-GREEN, which nothing else in the collection wants. The eye card is
 * `plate-08`, the pack's ROUND one — deliberately not `plate-14`, which at
 * 0.4355 x 0.4426 is the largest in the bank and belongs to whichever sibling is
 * actually described as big-eyed, which is the gecko and not this animal.
 *
 * ## Every number, and where it came from
 *
 *   - **HEIGHT FIRST, AND `box-13` IS REFUSED BY ARITHMETIC.** The crab's hull is
 *     1.332958 x **0.450556** x 1.347378, by far the flattest shape the pack drew,
 *     and it is the obvious answer to "what is shaped like a terrapin". It cannot
 *     be worn. At the bank's own recorded placement its top is 0.546250 +
 *     0.225278 = **0.771528** against a pack floor of 1.43, and `HEIGHT_FLOOR`
 *     shows there is no headroom under that floor at all: 0.658 of features would
 *     have to stand on top of the shell, which is more than the shell is tall.
 *     Raising it does not help, because the legs are the only thing underneath and
 *     they are 0.30625 long: the tallest anything on `box-13` can be is
 *     0.450556 + 0.30625 = **0.756806**, short of the floor by a factor of 1.89.
 *     **The tortoise already ran this search and got the same answer**, and §2 says
 *     do not re-run the search that produced a rejected part. This file re-runs
 *     only the arithmetic, because the commission asked whether the floor still
 *     lets `box-13` through. It does not, and it is not close.
 *
 *   - **So low is expressed by the HULL, and the hull is `box-31`.** The lion's,
 *     1.125 deep where the cube is 1.250, unmodified, at the proportions Kenney
 *     gave it — a different authored shell is adaptation and not a stretch, so
 *     there is no `stretchWhy` and there should not be one. Three things it buys,
 *     all measured off its own 28 welded points:
 *
 *       1. It is the **only hull wider than it is deep**, which is the axis the
 *          collection record assigned this species.
 *       2. Its **front face is a full 1.000 square** — four of its points are the
 *          (+/-0.5, +/-0.5, 0.5625) — where `box-03`'s flat front face is only
 *          0.625 square. That is what makes the neck's donor transfer legal, and
 *          it is the reason this hull was chosen rather than a consequence of it.
 *          Its REAR face is the usual 0.625 square, which is why the tail needs a
 *          height of its own and the neck does not.
 *
 *          **AND THAT FACE IS NOT THERE.** Those four points are joined by four
 *          edges each used by exactly ONE triangle — the only open loop in the
 *          shell, and `box-31`'s 50 triangles put none at all in the z = 0.5625
 *          plane. The square is an APERTURE. Every other hull the kit has worn is
 *          closed (`box-03` and `box-12` have no open edge at all), so nothing
 *          before this hull could have found it, and nothing in `assembly-assert`
 *          looks for a hole: it counts triangles, matches vertices and measures
 *          bounding boxes, and a missing face changes none of the three. See the
 *          `front-wall` extra, which is the whole of the answer.
 *       3. It is 0.125 shallower, and depth is the axis this animal spends: the
 *          keep-out is `max(width, depth) / 2` (`pets.ts:652`).
 *
 *     Its front face is 0.500 and the eye cards still sit at the absolute
 *     `EYE_CARD_Z` = 0.6350, floating 0.135 proud of the HULL. That is exactly what
 *     the lion does and `hulls.ts` says so; it is not a fault to be corrected. With
 *     the front wall on, the card's daylight is the pack's usual 0.010 again — the
 *     plate's own front lands on `HULL_FRONT_Z_USUAL` — which is the lion's
 *     arrangement recovered entire rather than a second thing to keep in step.
 *
 *   - **THE FRONT WALL IS `blade-05`, AND IT IS NOT DECORATION — IT IS THE FACE
 *     THIS HULL DOES NOT HAVE.** `box-31`'s front 1.000 square is an open loop
 *     (above), the assembly material is `MeshStandardMaterial` at its FrontSide
 *     default (`assembly.ts:509` sets `map`, `metalness` and `roughness` and no
 *     `side`), so a back face draws nothing and the aperture is see-through to the
 *     sky. Measured on this build before the plate: **36.0% of the 1.0 x 1.0 was
 *     covered by anything in front of it and 0.6405 of it was open**; head-on,
 *     26.8% of the animal's whole silhouette showed the background through its own
 *     chest. The plate closes it to **97.7%**, which is the frog's number to the
 *     digit, because the residue is Kenney's own corner bevel on his own plate and
 *     not anything this species chose.
 *
 *     Nothing about it is authored and nothing about it is aimed. `blade-05` is a
 *     bank part in the `nose` role at 1.000 x 1.000 x 0.125 — **the aperture's
 *     exact size, because it is the lion's face and this is the lion's hull** — and
 *     it arrives by the donor transfer entire: this hull's front face, the plate's
 *     own recorded height, its own measured sink of 0.000. `animal-frog.ts` already
 *     wears it on this same hull and its header carries the stacking argument
 *     (0.500 / 0.625 / 0.6350), so the transfer is precedent rather than inference.
 *
 *     **It is painted the hull's own two colours at the hull's own line**, so it
 *     reads as the wall and not as a face: `coat` patched `belly` at 0.5, which is
 *     the identical patch the hull carries — `assembly.ts:487` requires it to be
 *     identical or it throws — and `blade-05` is 1.000 tall centred on the same
 *     0.80625, so its boundary lands on the carapace line by construction. Kenney's
 *     band 5, which is the lion's mouth and which the frog repaints as its grin, is
 *     deliberately LEFT ALONE: this animal's mouth is the beak line on its head and
 *     a second one on its chest would be a second face.
 *
 *     The neck now emerges from the plate rather than from the bare hull, which is
 *     the right reading for a turtle and costs nothing measurable: the plate is
 *     entirely inside the animal's existing bounding box, so the height (1.43125),
 *     the keep-out (1.083) and the 0.7647 of forward reach past the hull are all
 *     unchanged, and the shell is still the largest feature at 3.11x.
 *
 *   - **THE NECK IS THE ANIMAL, AND IT IS THE ELEPHANT'S TRUNK WORN FORWARDS.**
 *     §3.1 is the whole of this — a part's identity is where you put it, not what
 *     Kenney called it — and the joke of it is that the tortoise wears the SAME
 *     SHAPE. `box-18` is filed as a tail because Kenney's node was called `tail`;
 *     it is really the elephant's TRUNK, it attaches `z +1`, and the tortoise and
 *     the badger both have to spin it 180 degrees to get it pointing backwards.
 *     Left alone it points FORWARD, which is what a trunk does: a thick tapering
 *     tube growing out of a face. That is a turtle's neck, and it needs no spin at
 *     all.
 *
 *     It is **the longest forward-attaching reach in the bank at 0.425211** —
 *     against every muzzle at 0.2314 or less, and against `wedge-11`'s 0.4452 at a
 *     measured sink of 0.376 which leaves it only 0.278. The test pins that over
 *     the whole bank, so if a longer forward part is ever banked this file goes red
 *     and the substitute is reconsidered.
 *
 *     **Its placement is the donor transfer entire, with no chosen number in it:**
 *     joined at THIS hull's front face z = 0.500, at the elephant's own recorded
 *     y = 0.482248, sunk the elephant's own 0.000.
 *
 *   - **The stretch is `[1, 0.5, 1]`, it is only in y, and it is what makes that
 *     transfer legal.** Unstretched, `box-18` is 0.623004 tall, so at the
 *     elephant's own y its root would span 0.170746 to 0.793750 — 0.1355 of it
 *     below the flat front face's lowest line (0.30625) and some of it below the
 *     hull's own bottom at 0.18125, hanging through the belly. Halved in height it
 *     spans 0.326497 to 0.637999 and the whole join plane is on flat geometry with
 *     **0.0202 to spare underneath**. §3, nothing floats, as arithmetic rather
 *     than as taste. §3 measured snouts varying 2.90x naturally, which is why a
 *     stretch is sanctioned on this role and on almost no other.
 *
 *     It is also the right shape twice over: 0.345 x 0.3115 in section is 1.11
 *     times as wide as it is tall, where the trunk's own is 0.55. **A trunk hangs
 *     and is therefore tall in section; a neck reaches and is therefore round.**
 *     And the neck's LENGTH is not stretched at all — 0.425211 is the bank's own
 *     number, and the reach comes from what is hung on the end of it.
 *
 *   - **The head is `tube-06`, on the neck's own placed front plane.** `on:
 *     'neck'` rather than an arithmetic this file would then carry a copy of: the
 *     builder puts it at z = 0.925211, measured off the neck's built vertices, so
 *     a head that floats or buries cannot happen quietly. It is the fox's own nose
 *     and the badger's muzzle, 0.532 x 0.300 x 0.23142, which is 1.54 times the
 *     neck's width and 0.96 times its height — a head is wider than the neck that
 *     carries it and no taller, and that is what this shape is.
 *
 *     **Its jaw line is Kenney's own cut and costs no geometry.** The badger
 *     measured this part's two bands and found band 7 the upper half and band 3 the
 *     lower; painting band 3 from the pale slot puts 20 of its 34 triangles under a
 *     horizontal line across the head. On a fox that is the underside of a muzzle.
 *     On a terrapin it is the BEAK LINE — a mouth, for one `byBand` entry and not
 *     one triangle.
 *
 *     **A mouth CARD was considered and refused.** `plate-13` `on: 'head'` would
 *     place now that `CARD_STANDOFF` has fixed the coplanar-card bug, but an `on:`
 *     anchor is the carrying feature's CENTRE projected onto its outer face, so the
 *     card could only sit dead centre; and the band split above already puts a
 *     mouth line where a mouth line goes, for 14 fewer triangles.
 *
 *     **`cone-06`, the parrot's BEAK, was considered and refused**, and it is worth
 *     recording because it is right on every measured axis: symmetric, `z +1`,
 *     0.400 x 0.4014 x 0.2869, and a terrapin genuinely has a beak. §3.2's own list
 *     of shapes whose identity SURVIVES being moved is "a tongue, a beak, a horn, a
 *     claw, an eye", and Joe rejected `wedge-10` by name on the hedgehog for exactly
 *     this class of error — no measured axis catches it, because the confusion is
 *     semantic. A bird's bill on a turtle's neck reads as a bird.
 *
 *   - **The snout tip is `tube-08`, the panda's nose-tip, on the head's own front
 *     plane.** 0.233877 x 0.125898 x 0.108111 and 23 triangles: 0.44 of the head's
 *     width, so the head ends in something narrower than itself rather than in a
 *     flat wall. That is the "small pointed head" this animal is named by, and it
 *     is the third link of a chain every joint of which was solved rather than
 *     typed — hull face, then `on: 'neck'`, then `on: 'head'`.
 *
 *   - **THE SHELL IS `box-11`, AND IT IS THE ONLY BAND IN THE BANK THAT IS NOT A
 *     SECOND MASS.** This is the decision the species turns on. Rule 3 is one mass
 *     and it is the fault that scrapped 72 animals; `assembly-assert.ts` enforces
 *     it as "the hull is more than 3x the next largest mesh by bounding box".
 *     Against this hull's 1.757813, laid flat, the pack's five bands measure:
 *
 *         box-29   1.361250   1.29x   the lion's mane
 *         box-19   1.025032   1.71x   THE TORTOISE'S, and it had to be halved
 *         box-35   0.897844   1.96x   the panda's rump-shell
 *         box-04   0.812695   2.16x   the bee's abdomen segment
 *         box-11   0.564716   3.11x   the caterpillar's body-segment
 *
 *     One of the five passes, and it passes because it is **the only band in the
 *     bank that is not square**: 1.4445 x 0.876880, aspect **1.647**, where the
 *     other four are 1.000 to six decimals. A dome seen from above is a circle and
 *     a slider's carapace is an ellipse, so the band that is measurably an ellipse
 *     is the one this animal wants — and it is also the only one it can afford,
 *     which is not a coincidence. **Nothing about it is stretched.** The tortoise
 *     had to halve its ring's thickness to stop it reading as a drum; this one is
 *     worn at the size Kenney drew it.
 *
 *     **It is not a ring, and that is why it works.** No point in `box-11` comes
 *     closer to the midline than |x| = 0.3182: it is TWO lateral plates, and laid
 *     flat they are two horizontal shelves that stand **0.0972 proud on each
 *     flank** (0.7222 against this hull's 0.625) and reach only z = +/-0.4384, so
 *     they are entirely inside the body fore and aft. That is not a shortfall, it
 *     is the shape: a turtle's shell is notched at both ends for the neck and the
 *     tail, and a margin that shows along the flanks and vanishes front and back is
 *     what the animal actually has. The tortoise's ring, being square, has to stand
 *     proud on all four sides.
 *
 *     **`{ axis: 'x', deg: 90 }` and not -90, and the difference is measured.**
 *     `box-11` is not symmetric end to end — its -y end reaches |x| = 0.6152 and
 *     its +y end only 0.3506 — and a quarter turn about x takes local y to world z.
 *     So +90 puts the BROAD end at the back and tapers the shelf toward the front,
 *     which is a turtle: broad over the hips, narrowing over the neck. -90 would
 *     put the shell on backwards, and nothing but this measurement says so.
 *
 *     **`axis: 'z', dir: -1` is the tortoise-hoop trick** — `PartDef.axis`'s own
 *     name for it — and it is mechanism rather than style. The band's measured
 *     attachment is `y +1`; after the quarter turn that points forward, and a sink
 *     measured along it would be measured across the shelf's 0.8769 of span instead
 *     of its 0.4458 of thickness. Overriding the pre-spin base to `z -1` lands the
 *     facing back on +y, so `sink: 0.5` means what it says: the shelf straddles the
 *     plane it is joined at, 0.222917 either way.
 *
 *   - **The join, `[0, 0.80625, -0.0625]`, is `box-31`'s OWN RECORDED OFFSET** —
 *     the lion's hull centre, not a number this file chose — and it is the same
 *     line the paint changes on. `belly: 0.5` is 8/16 of the hull's own height,
 *     world y = 0.80625, which is where the shelf is joined, by construction. So
 *     the shell edge and the colour change are ONE line and not two. That is the
 *     tortoise's construction used deliberately at a different number: 8/16 is the
 *     pack's own measured mammal line (§7, the tiger's, and the only point on the
 *     1/16 grid inside its zone) and it is this hull's own equator, where the
 *     tortoise's 6/16 sits below it. Above the line, olive carapace; below it, the
 *     pale yellow plastron that the legs and the neck come out of.
 *
 *   - **NO SCUTES, AND THE ABSENCE IS THE POINT.** The tortoise spends twelve
 *     `wedge-08` plates on §8's chamfer idiom — a row on the top face and a row on
 *     each upper chamfer — because the idiom exists to make a cubic back read
 *     ROUND, and a tortoise is a dome. **A slider's carapace is flat and smooth, so
 *     this species declines the idiom entirely**, and the price of a dome is
 *     exactly what it declines to pay: those plates stand 0.050 proud and are the
 *     whole of the tortoise's 1.48125, where this animal measures `HEIGHT_FLOOR`.
 *     Recorded as considered and refused so nobody helpfully adds a row back (§2's
 *     third establishment) — a ridge here would cost the one number that separates
 *     the two silhouettes from above.
 *
 *   - **The tail is `cone-01`, turned to point backwards, and it is SHORT.** The
 *     bee's and the caterpillar's small tapering spike — the hedgehog's own quill
 *     shape, §3.1 paying again — 0.160 x 0.400356 x 0.328570 and 34 triangles.
 *     `{ axis: 'x', deg: -90 }` takes its measured `y +1` to `z -1`, putting 0.160
 *     of width, 0.3286 of height and 0.4004 of length behind the animal, and its
 *     own measured sink of 0.312222 — which is **exactly 0.125 units, §3's own
 *     floor for an embedded part** — leaves **0.275356** of reach. Against the
 *     tortoise's `box-18` stub at 0.425211 that is 0.65x, and against the fox's
 *     brush it is under a third: short, pointed and thin enough to read as a
 *     swimmer's.
 *
 *     **Its height is the one number this species chooses, and it is derived
 *     rather than picked.** `box-31`'s flat REAR face is the usual 0.625 square, so
 *     its lowest line is 0.80625 - 0.3125 = 0.49375; adding the tail's own
 *     half-thickness after the quarter turn, 0.328570 / 2, puts the tail's
 *     underside exactly on that line. It therefore leaves the shell as low as a
 *     part can leave it without overhanging a chamfer that has already fallen away,
 *     which is where a slider's tail comes out.
 *
 *   - **THE WEBBED FEET ARE JT-044'S TWO-TONE LEG**, used as the general tool Joe
 *     ruled it to be rather than as a hoof workaround. `at` is a fraction of
 *     `box-01`'s OWN height and 0.25 is 4/16, on the pack's grid, which
 *     `texture.ts` requires: 0.25 x 0.30625 = **0.0765625** of dark foot against the
 *     0.18125 of leg that shows below the hull, so the web covers **42.2% of the
 *     visible limb**. It costs no geometry and adds no vertex except on the seam.
 *     It is a COLOUR and not a paddle — the bank has no webbed foot and this says
 *     "the foot is not the leg" and nothing more.
 *
 *     The `limb` cell is therefore SPLIT, and the neck, the head, the snout tip and
 *     the tail all paint from `limb` without a patch — which is safe, and is worth
 *     saying once because it is not obvious: an unpatched part reads its cell's
 *     CENTRE row, row 8 of 16, which is above a boundary at 4/16 and is therefore
 *     the `limb` colour. The badger's tail does the same thing on a split `coat`
 *     cell. It is also why there is no second patch anywhere on this animal: a
 *     patch belongs to a SLOT, and `assembly.ts:487` throws when one cell is asked
 *     to hold two pictures.
 *
 *   - **THE RED EAR PATCH IS `plate-10` THINNED, and it is the honest half of a
 *     marking the badger proved this bank cannot carry.**
 *     `assembly-badger.test.ts` measured every card in the pack and found none
 *     longer than 0.44 and none thinner than 1:2.5 — "nothing in the pack is a
 *     stripe" — and that finding stands unchanged. It does not refuse this one,
 *     because the two markings are different sizes: a badger's stripe needs about
 *     0.6 of run from nose to ear, and a slider's mark is a patch about 0.25 long
 *     sitting behind the eye. **`plate-10` already HAS 0.252879 of run**; the only
 *     thing wrong with it is its 0.244 of height. `stretch: [1, 0.25, 1]` thins one
 *     axis of a ten-triangle flat card to 0.061 and makes it 4.15:1, and that is
 *     rule 1's first clause and nothing more.
 *
 *     **Its station is the card's own recorded offset, mirrored.** `plate-10` sits
 *     at x = 0.635 — the pack's own flat-card shell, `EYE_CARD_Z` on the other
 *     axis, and 0.010 of daylight against this hull's 0.625 side face — at
 *     z = -0.186060, and this animal takes **+0.186060**, the front-to-back mirror
 *     of one station rather than a second chosen one. The arithmetic that makes
 *     that the right answer is the salamander's: 0.186060 + 0.252879 / 2 =
 *     **0.312500**, the exact front edge of this hull's flat side face, so the
 *     patch runs as far forward as a card can sit without floating. Its y is
 *     0.893750, which is **`plate-08`'s own recorded height — the eye this animal
 *     actually wears** — because that is what "behind the eye" means.
 *
 *     **The pale head stripe is the same card again at the same station**, painted
 *     from the plastron slot and sat at `plate-10`'s OWN recorded y of 0.996750, so
 *     the two stripes are 0.042 apart and neither height was invented. A slider's
 *     red patch is bordered above and below by yellow-green striping; this is the
 *     border above it, and both marks sit above the 0.80625 paint line so both
 *     read against the olive rather than against the plastron.
 *
 *   - **The legs and the eyes are otherwise what `defineCreature` gives a
 *     definition that says nothing**: four `box-01` sunk 0.408163 on the row at
 *     y = 0.18125 that never moves, standing at x = +/-0.27 and z = +/-0.225 (the z
 *     scaled by this hull's own 1.125 / 1.250), and two eye cards at the card's own
 *     recorded (0.2625, 0.89375) on the absolute z = 0.6350. Rule 5 is unsayable
 *     here, not merely obeyed. The neck's top is 0.638 and the eye cards start at
 *     0.6937, so the neck passes cleanly BELOW the face with 0.056 of daylight —
 *     which is the fox's own arrangement, and is why the eyes did not have to move.
 *
 *   - **The palette is five plausible red-eared-slider colours plus the measured
 *     pupil**, weighted by SURFACE AREA as §6 requires: the carapace is most of the
 *     animal and takes the olive; the plastron is the underside, the shell's pale
 *     shelf, the pale lower jaw and the sclera; a brighter olive-green is the skin
 *     — neck, head, snout, tail and legs; a darker green is the feet alone; and the
 *     red is spent on 0.0154 of card, which is all the marking gets.
 *
 * **FLAGGED, and only for the striping that is left.** Everything measurable
 * passes: height 1.43125 on the pack's own floor, keep-out 1.083 against the fox's
 * 1.15, one mass at 3.11, 599 triangles inside 422-951 and 450 vertices inside
 * 405-1626, every mesh a bank shape, nothing authored, and every sink either the
 * shape's own measured value or a number solved off this hull's own faces. What is
 * missing is the FINE YELLOW LINES down the neck and the limbs, and the flag says
 * exactly which mechanism falls short of what.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/**
 * Where the tail leaves the shell — the one number this species chooses, and it
 * is solved off this hull rather than picked.
 *
 * `box-31`'s flat REAR face is the usual 0.625 square (its rear points are the
 * four (+/-0.3125, +/-0.3125, -0.5625); only the FRONT face is a full 1.000), so
 * the lowest line it reaches is the hull centre 0.80625 less 0.3125. Adding
 * `cone-01`'s own half-thickness after its quarter turn — 0.328570 / 2, its z
 * becoming its y — puts the tail's underside exactly on that line, and no part of
 * its root over a chamfer.
 */
const TAIL_Y = 0.80625 - 0.3125 + 0.328570 / 2

/**
 * The pack's own flat-card shell, and the one z station this animal's two head
 * marks share: `plate-10`'s own recorded offset, mirrored front to back.
 *
 * 0.186060 + 0.252879 / 2 = 0.312500, which is the exact front edge of this
 * hull's flat side face — Kenney sized these cards to a 1.250 cube's face in the
 * first place, as `animal-salamander.ts` found — so a card on this station runs as
 * far forward as one can sit without floating over the chamfer.
 */
const MARK_X = 0.635
const MARK_Z = 0.186060

export const TERRAPIN_ASSEMBLY = defineCreature('animal-terrapin', {
  palette: {
    coat: 0x4a6234,    // the carapace: dark olive-green, and most of the animal
    belly: 0xe3d38f,   // the plastron, the shell's pale shelf, the jaw, the sclera
    limb: 0x6f8c46,    // the skin: neck, head, snout, tail and legs, brighter olive
    web: 0x3c5228,     // the webbed feet alone, darker still
    mark: 0xc0392b,    // the red ear patch, and nothing else
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* The lion's shell: 1.125 deep where the cube is 1.250, and the pack's ONLY hull
   * whose body is wider than it is deep. Unmodified — a different authored hull is
   * adaptation, not a stretch. Its front face is a full 1.000 square, which is
   * what makes the neck's donor transfer land on flat geometry. */
  hull: 'box-31',

  /* 8/16 — the pack's own measured mammal line and this hull's own equator, which
   * is also the line the shell shelf is joined at. One line, not two. */
  belly: 0.5,

  /* JT-044's two-tone leg as WEBBED FEET. 4/16 of box-01's own 0.30625 is 0.0765625
   * of dark foot against the 0.18125 of leg that shows: 42.2% of the visible limb.
   * A colour and not a paddle — the bank has no webbed foot. */
  legs: { paint: { base: 'limb', patch: { below: 'web', at: 0.25 } } },

  /* ROUND, and deliberately not the largest: plate-14 is 0.4355 x 0.4426 and
   * belongs to whichever sibling this collection actually calls big-eyed. */
  eyes: { part: 'plate-08' },

  /* THE NECK: the elephant's TRUNK, worn FORWARDS and unspun. The tortoise and the
   * badger both spin this exact shape 180 degrees to get a stub tail; left alone it
   * attaches `z +1`, because it is really a trunk, and a thick tapering tube
   * growing out of a face is a turtle's neck. Placed by the donor transfer entire —
   * this hull's front face, the elephant's own y, the elephant's own sink of
   * nothing. Halved in HEIGHT only, which is what makes that y legal here (at its
   * own 0.623004 the root hangs through the belly) and what turns a section that
   * hangs into one that reaches. Its 0.425211 of length is the bank's own, and is
   * the longest forward reach in it. */
  snout: { part: 'box-18', name: 'neck', stretch: [1, 0.5, 1] },

  /* THE HEAD, on the neck's own placed front plane rather than on an arithmetic.
   * The fox's nose: 1.54x the neck's width and 0.96x its height, which is what a
   * head is. Band 3 is Kenney's own lower half — the badger measured it — so a pale
   * lower jaw is one entry and no geometry, and on a terrapin that line is the
   * BEAK. Deliberately not `cone-06`: a parrot's beak is one of §3.2's shapes whose
   * identity survives being moved, and Joe rejected wedge-10 by name for that. */
  nose: {
    part: 'tube-06',
    name: 'head',
    on: 'neck',
    paint: { base: 'limb', byBand: { 3: 'belly' } },
  },

  extras: [
    /* THE FRONT WALL. `box-31` HAS NO FRONT FACE — measured, not inferred: its 50
     * triangles leave four edges used once each, the (+/-0.5, +/-0.5, 0.5625)
     * square, and no triangle at all lies in that plane. The material is
     * `MeshStandardMaterial` at its FrontSide default (`assembly.ts:509`), so the
     * inside of the shell is culled and the hole is see-through to the sky.
     * `blade-05` is the lion's own face plate, 1.000 x 1.000 x 0.125, the exact
     * size of that aperture and worn on this exact hull by its donor. Placed by the
     * donor transfer entire — this hull's front face, the plate's own recorded
     * height, its own measured sink of nothing — its front lands on 0.625, which is
     * `HULL_FRONT_Z_USUAL`: the plane every other hull in the pack presents, and the
     * one the eye card's 0.010 of daylight was measured against. Painted the hull's
     * own two colours at the hull's own line, so it closes the wall and says
     * nothing: `blade-05` is 1.000 tall centred on the same 0.80625, so `at: 0.5`
     * puts its boundary on the carapace line by construction rather than by aim.
     * Kenney's band 5 — the lion's mouth, and the frog's — is deliberately NOT
     * repainted: this animal's mouth is the beak line on its head. */
    {
      name: 'front-wall',
      part: 'blade-05',
      paint: { base: 'coat', patch: { below: 'belly', at: 0.5 } },
    },

    /* THE SHELL: the caterpillar's body-segment, laid flat. The ONLY band in the
     * bank that is not square (aspect 1.647) and the only one that is not a second
     * mass at the size Kenney drew it — 3.11x this hull, where the tortoise's
     * box-19 is 1.71x and had to be halved. It is two lateral plates rather than a
     * ring, so it reads as a shelf along each flank and stops short fore and aft,
     * which is where a turtle's shell is notched for the neck and the tail. `+90`
     * and not `-90` because the shape is broader at one end and the broad end
     * belongs at the BACK, over the hips. `axis: 'z'` puts the facing back on +y
     * after the turn, so `sink: 0.5` straddles the join plane — 0.222917 either
     * side of the hull's own recorded centre. */
    {
      name: 'shell',
      part: 'box-11',
      paint: 'belly',
      spin: [{ axis: 'x', deg: 90 }],
      axis: 'z',
      dir: -1,
      sink: 0.5,
      at: [0, 0.80625, -0.0625],
    },

    /* The panda's nose-tip on the head's own front plane: 0.44 of the head's width,
     * so the head ends in something narrower than itself. The third link of a chain
     * every joint of which was solved rather than typed. */
    { name: 'snout-tip', part: 'tube-08', paint: 'limb', on: 'head' },

    /* THE RED EAR PATCH: the cow's, dog's and giraffe's flank card, THINNED to
     * 4.15:1 on one axis. The badger proved no card in this bank IS a stripe and
     * that stands — but a badger's needs 0.6 of run and a slider's mark needs 0.25,
     * which this card already has. Its y is plate-08's own recorded height: the eye
     * this animal wears. */
    {
      name: 'ear-patch',
      part: 'plate-10',
      paint: 'mark',
      kind: 'pair',
      stretch: [1, 0.25, 1],
      at: [MARK_X, 0.893750, MARK_Z],
    },

    /* The pale border above it — the same card at the same station, at plate-10's
     * OWN recorded height, so neither y was invented and the two sit 0.042 apart.
     * Both are above the 0.80625 paint line, so both read against the olive. */
    {
      name: 'head-stripe',
      part: 'plate-10',
      paint: 'belly',
      kind: 'pair',
      stretch: [1, 0.25, 1],
      at: [MARK_X, 0.996750, MARK_Z],
    },
  ],

  /* SHORT and pointed: the bee's small tapering spike turned to face backwards,
   * sunk its own measured 0.312222 — exactly 0.125 units, §3's floor for an
   * embedded part — for 0.275356 of reach against the tortoise stub's 0.425211. */
  tail: {
    part: 'cone-01',
    paint: 'limb',
    spin: [{ axis: 'x', deg: -90 }],
    at: [0, TAIL_Y, -0.625],
  },

  flag: 'THE FINE YELLOW LINES DOWN THE NECK AND THE LEGS CANNOT BE DRAWN, and on a '
    + 'red-eared slider they are half the animal: olive skin ruled lengthwise with '
    + 'thin yellow stripes. Both mechanisms fail and it is worth being exact about '
    + 'which falls short of what. `byBand` can only cut where Kenney already cut, and '
    + 'the two parts that need it have no cut in them at all — `box-18`, the neck, '
    + 'carries ONE band with all 80 of its triangles in band 1, and `box-01`, the leg, '
    + 'is one band as well. `Paint.patch` needs no cut and WOULD say it, because a '
    + 'level boundary across a horizontal neck is a lengthwise line, which is exactly '
    + 'the right shape — but a patch belongs to a SLOT and not to a part, the `limb` '
    + 'cell is already spent on the webbed feet, and `assembly.ts:487` throws when one '
    + 'cell is asked to hold two pictures. And a CARD long enough to run the neck '
    + 'would overhang its chamfers at both ends. So the lines are not awkward here, '
    + 'they are unsayable, and nothing has been authored to fake them. THE RED EAR '
    + 'PATCH IS HALF-ANSWERED and you should look at it: the badger found that no card '
    + 'in this bank IS a stripe and that is still true, but a slider\'s mark is a 0.25 '
    + 'patch rather than a 0.6 run, so it is `plate-10` — the cow\'s flank card — '
    + 'thinned on one axis to 4.15:1, sat at the eye\'s own recorded height on the '
    + 'pack\'s own card shell, with a pale one above it for the border. It is a red '
    + 'mark behind the eye in the right place at the right size; it is not the streak '
    + 'that fades back along the neck, because there is no neck surface to fade along. '
    + 'THREE PARTS ARE STANDING IN FOR ANATOMY THE BANK DOES NOT HAVE, and they are '
    + 'the ones to look at first: the NECK is the elephant\'s trunk `box-18` worn '
    + 'FORWARDS, unspun, which is the same shape the Garden tortoise wears spun 180 as '
    + 'a stub tail; the SHELL is the caterpillar\'s body-segment `box-11` laid flat, '
    + 'the only band in the bank that is an ellipse rather than a square and the only '
    + 'one small enough not to be a second mass; and the TAIL is the bee\'s ear-spike '
    + '`cone-01` turned to point backwards. The crab\'s flat hull `box-13` was refused '
    + 'by arithmetic, as it was for the tortoise: 0.450556 tall plus a 0.30625 leg is '
    + '0.756806 against a floor of 1.43.',
})
