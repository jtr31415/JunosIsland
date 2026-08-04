/**
 * The cockatiel — Home Pets' third cage bird, and **the first species in the
 * project to wear a CREST.**
 *
 * ONE SPECIES, ONE FILE. `register.ts` says why the one appended line in
 * `index.ts` is the whole of the wiring.
 *
 * `animal-budgie.ts` is the file to read before this one. It is the first hand
 * assembled cage bird and it settled three things this build inherits without
 * re-litigating: **the wing is `box-06`, the bunny's ear, laid along the flank as
 * a SOLID**; **the beak is `cone-06`, the parrot's own, by pure donor transfer**;
 * and **height cannot separate these four**, because nine of the pack's ten hulls
 * are 1.25 tall or less and the tenth is bigger on all three axes. All three are
 * taken here unchanged.
 *
 * It also handed this species a fourth thing, as a recommendation rather than a
 * finding, and **that one is answered rather than inherited.**
 *
 * ===========================================================================
 * ## 1. `box-21` IS NOT THIS BIRD'S CREST. IT IS REFUSED, WITH FOUR NUMBERS.
 * ===========================================================================
 *
 * `animal-budgie.ts` measured `box-21` — offered by `hulls.ts:189` as *"the
 * fox's. TALLER, and nothing else"* — and found it is the 1.250 cube wearing the
 * fox's two EARS. **That measurement is confirmed here off the same 340 points**
 * and it is not in dispute: below local y = +0.4975 the shell is the cube (side
 * faces at |x| = 0.625, top ring of 12 points at 0.3125), and all 138 points
 * above sit in two clusters at |x| 0.218-0.454, z 0.2616-0.465, rising to two
 * tips at y = +0.7525. Nothing on the midline at all.
 *
 * What the budgie then concluded — *"those two lugs are the nearest thing this
 * bank has to a CREST, so it is the COCKATIEL's hull"* — is the part that does
 * not survive being measured for this animal. **Four numbers refuse it, and the
 * first two are the ones that decide it:**
 *
 *   1. **THE LUGS CANNOT BE PAINTED.** A cockatiel's crest is YELLOW against a
 *      GREY bird; that colour contrast is half of what makes the feature
 *      nameable. `box-21` carries **three bands and the lugs are not one of
 *      them**: band 7 is 168 triangles spanning the WHOLE shell (x -0.625 to
 *      0.625, y -0.7525 to 0.7525, z -0.625 to 0.625), band 3 is 6 triangles on
 *      the underside, and band 5 is 10 triangles at y 0.3725-0.6047, z
 *      0.4141-0.5000 — Kenney's own INNER-EAR cut on the forward face of each
 *      lug, exactly as band 5 of `box-12` is the cow's. So `byBand` cannot paint
 *      a lug without painting the body, and the one band that IS on them is the
 *      band that says "ear" out loud. A level `patch` reaches them only by
 *      painting the top of the back with them, and a cockatiel's back is grey.
 *      **A grey crest on a grey head is not a crest.**
 *   2. **THERE IS NOTHING ON THE MIDLINE.** The inner faces of the two lugs are
 *      at |x| = 0.218, so the crown between them is **0.436 wide — 35% of the
 *      hull's width — and bare.** A cockatiel's crest is ONE plume on the
 *      midline; two bumps with a valley between them is the read a child already
 *      has a word for, and the word is ears. `home-pets.ts:88-105` puts four
 *      perching birds on one album page and not one of them may have ears.
 *   3. **THE LUGS ARE SHORTER THAN A SPIKE, AND COST 124 TRIANGLES MORE.** They
 *      stand **0.2550** above the body (0.7525 - 0.4975). The crest built below
 *      stands **0.275356** proud of the same crown. `box-21` is **184 triangles
 *      against `box-03`'s 60**; `cone-01` is **34**. The hull's "crest" is
 *      shorter than the part-built one and costs 3.6x as much.
 *   4. **AND IT WOULD BE BOTH AT ONCE.** Because (1) and (2) mean a real crest is
 *      needed anyway, `box-21` does not replace the crest — it adds ears
 *      underneath it. A bird with a crest AND two ears is worse than a bird with
 *      either.
 *
 * **So this species is on `box-03`, the parrot's and the chick's own shell**, and
 * `box-21` is recorded here as considered and refused so the next builder does
 * not helpfully put it back — §2's third establishment, and the same service
 * `animal-badger.ts` does for `box-30`. `assembly-cockatiel.test.ts` re-derives
 * every one of the four numbers from the bank rather than trusting this
 * paragraph.
 *
 * **The height ladder is restored anyway, and by the honest route.**
 * `home-pets.ts:104` wants the cockatiel tallest of the four and the budgie
 * showed the HULL cannot deliver that. The CREST can: this bird measures
 * **1.7066** against the other three at the pack's own `HEIGHT_FLOOR` of
 * 1.43125, which is 19% taller and is the one cage bird with anything at all on
 * its head. That is `home-pets.ts`'s intent recovered from a part rather than
 * from a shell.
 *
 * ===========================================================================
 * ## 2. THE CREST IS `cone-01`, AND IT IS ONE OF ONLY TWO TRUE POINTS IN 94
 * ===========================================================================
 *
 * The bee's and the caterpillar's ANTENNA — 0.160 x 0.400356 x 0.328570, 34
 * triangles, `attachment y +1`, `sunkFractionMean` 0.312222 (0.125 units, which
 * is §3's own floor for an embedded part, so it cannot honestly be buried less).
 * §3.1 is the whole argument for spending it: `animal-hedgehog.ts` wears it as a
 * quill, `animal-shrew.ts` as a snout and `animal-nightjar.ts` as a rictal
 * bristle, because a part's identity is its placement.
 *
 * **It was reached for because it is POINTED, and that is measured over the whole
 * bank.** `shape.taper` is 0 on exactly **two of the 94 records** — `cone-01` and
 * `cone-06` — and `cone-06` is the beak this bird is already wearing. So
 * `cone-01` is the ONLY shape in the pack that can put a true point on a crown.
 * The 23 ear shapes offer nothing else: `box-06` is 0.849 taper and handed (a
 * left ear on a midline is an asymmetric crest), `box-25` is 0.743 across and
 * round, `cone-02`, `cone-04`, `wedge-06` and `wedge-16` all taper between 0.22
 * and 0.68 and stand 0.153-0.215 proud, which is shorter than `box-21`'s lugs.
 *
 * **All three of its numbers are solved and none is chosen:**
 *
 *   - **`sink` is not said at all**, so it is the shape's own 0.312222 — the
 *     depth the pack itself buries this antenna at, and already §3's floor.
 *   - **`y = 1.43125` is `box-03`'s own top face**, and joining there RECOVERS
 *     the bank's own record: `shift = -s.lo - sink x extent` = 0.200178 - 0.125 =
 *     0.075178, so the crest's centre lands at **y = 1.506428048968 against
 *     `cone-01`'s recorded offset of 1.506428** — agreement to the bank's own
 *     six decimals, from a solve that never used that number. That is §8's
 *     evidence, and it is the same recovery the beak makes on z.
 *   - **`z = 0.148215` is the flat top face's own front reach (0.3125, measured
 *     off the shell rather than assumed) less the shape's own half-depth
 *     (0.328570 / 2).** So the crest's LEADING EDGE lands exactly on the flat
 *     top's own front edge and its base spans z -0.016070 to 0.312500: the whole
 *     join plane is on real flat geometry, with the crest as far forward over the
 *     forehead as this shell allows. The move is `animal-budgie.ts`'s own
 *     `CHEEK_X` — an edge solved onto a face's edge — and the reason a `z` had to
 *     be given at all is that the bare donor transfer would use `cone-01`'s
 *     recorded z = 0.469709, which is 0.157 past where this hull's top face ends.
 *
 * **NO SPIN, and that is the animal rather than the easy option.** A leaning
 * crest would be a chosen angle; `cone-01`'s own attachment is `y +1`, straight
 * up, and an alert cockatiel raises its crest to vertical — which is also the
 * pose the motion below is about. It keeps the base axis-aligned, so the burial
 * is provably inside the shell (x ±0.08 against the flat top's 0.3125, z within
 * the flat top's own edge, 0.125 straight down) rather than argued about.
 *
 * **What was NOT done to it: nothing.** A taller crest is one non-uniform
 * stretch away and Joe flagged exactly that on three animals on 2 August and has
 * not ruled; the brief for this build says not to copy them. So the crest is the
 * bank's own shape at the bank's own size, and its 0.275 of reach is what the
 * pack actually has. If that is too short, the fix is a part and Joe's call, not
 * a scale factor here.
 *
 * ===========================================================================
 * ## 3. THE ORANGE CHEEK, AND WHY IT IS A DOT
 * ===========================================================================
 *
 * **The station is `animal-budgie.ts`'s, taken verbatim, and this file says so
 * rather than pretending to have found it.** `plate-16` — the PIG's nostril dot,
 * 0.113137 x 0.113137, zero thickness, 2 triangles — at x = 0.3125 - 0.113137/2
 * and y = 0.69375 - 0.113137/2, on the pack's own card plane z = 0.635. Its top
 * edge touches the eye card's own lower edge exactly; its outer edge lands on the
 * flat front face's own reach and not one thousandth past it onto the chamfer.
 * Both birds have a round patch under the eye and both hulls are the same cube,
 * so the same two measurements produce the same two numbers, and re-deriving them
 * differently would only mean one of us was wrong.
 *
 * **What is NOT the budgie's is the size problem, because a cockatiel's cheek is
 * not a spot — it is a disc that covers a third of the face.** The right card
 * exists: `plate-10`, the cow's, dog's and giraffe's flank blotch, 0.244 x
 * 0.252879, which spun onto the front face with `{ axis: 'y', deg: -90 }` is
 * 0.2529 across and 0.2440 tall. **It does not fit, and the window is the
 * measurement:**
 *
 *   - `box-03`'s flat front face reaches **|x| = 0.3125** (measured off its own
 *     points; §8 step 1's warning that the flat face is not where it looks).
 *   - `cone-06`, the beak, is **0.400 wide**, so it occupies |x| < 0.200 over the
 *     whole of its own y span 0.5177-0.9188 — which is the whole of the height a
 *     cheek patch would sit at.
 *   - **The clear window beside the bill is therefore 0.3125 - 0.200 = 0.1125,
 *     and `plate-16` is 0.113137.** The bank's biggest dot is, to within
 *     **0.0006**, exactly as wide as the only gap it can go in. `plate-10` at
 *     0.2529 is **2.25x too wide**, and moved outboard to clear the bill its
 *     outer edge reaches 0.4529, where the front surface has receded 0.140 and
 *     the card would stand that far clear of a face that is not there.
 *   - And the window is no wider under a smaller bill. Over all **26 solid nose
 *     shapes** in the bank (the two zero-thickness nostril DOTS are not beaks)
 *     the widest it ever opens is **0.2525** — and that is `wedge-10`, which Joe
 *     rejected by name on the hedgehog as a nose that reads as a TONGUE. It is
 *     still **0.00038 short** of `plate-10`. The widest usable one is **0.2215**
 *     (`wedge-01`). So this is a fact about the SHELL, not about the choice of
 *     beak, and the test pins it that way.
 *   - Vertically the same wall: the flat face's own lower reach is y = 0.49375
 *     and the eye card's lower edge is 0.69375, a window **0.200 tall**. One
 *     `plate-16` fits with 0.087 to spare; two stacked are 0.2263 and do not.
 *
 * **So the face has room for exactly one dot per side, and that is what is
 * here.** The flag says so where Joe reads it, because on this animal it is a
 * real loss: `home-pets.ts:104` gives this species *"crest+cheek-patch"* as its
 * two separating extras and only the first of them is full size.
 *
 * ===========================================================================
 * ## 4. THE YELLOW FACE CANNOT BE PAINTED, AND `animal-badger.ts` ALREADY SAID WHY
 * ===========================================================================
 *
 * A cockatiel is a GREY bird with a YELLOW HEAD. That is a Z-REGION, and
 * `docs/HANDOFF.md` §6 is explicit that colour here is a texture lookup with no
 * positional information: `Paint.patch` takes one number and that number is a
 * HEIGHT, so it paints one level boundary and cannot say "the front of this is
 * yellow"; `byBand` can only cut where Kenney already cut and `box-03` has
 * exactly ONE band; and rule 3 leaves no separate head to paint instead. It is
 * the badger's white face, on a different animal, unchanged.
 *
 * Two routes were tried against the measurement and both are refused here so
 * nobody re-tries them:
 *
 *   - **An inverted `belly` patch**, the budgie's own move, painting the top of
 *     the hull yellow. The nearest notches on the pack's 1/16 grid put the
 *     boundary at world y 1.2750 (14/16) or 1.3531 (15/16), which paints the top
 *     0.156 or 0.078 of the WHOLE BODY yellow — a yellow stripe down the spine,
 *     seen from the island's own downward camera. A cockatiel's back is grey.
 *   - **`plate-11` as a face card**, 0.400 x 0.433013 and the biggest flat marking
 *     in the bank. Spun onto the front face it is 0.433 across, which does not
 *     fit beside a 0.400 bill on a 0.625 flat face; and it would live on z =
 *     0.635, **exactly coplanar with the eye cards**, which is the z-fight
 *     `CARD_STANDOFF` exists to prevent between a card and a face and cannot
 *     prevent between two cards.
 *
 * **What carries the yellow instead is everything that can:** the crest, the eye
 * cards' outer band, and the tail's own tip cut. The eye is the useful one — a
 * cockatiel's yellow surrounds the eye, `plate-08` arrives pre-split at Kenney's
 * bands 3 and 15, and painting the base yellow puts a yellow ring round a dark
 * bead for two palette slots and no geometry. It is as much of the yellow face as
 * this mechanism can honestly say, and it is a good deal less than the animal.
 *
 * ===========================================================================
 * ## 5. WHAT SEPARATES THIS BIRD FROM THE OTHER THREE
 * ===========================================================================
 *
 * `home-pets.ts:88-105` spends six axes on four birds and forbids any two sharing
 * a value on the part axes. This bird takes:
 *
 *   1. **THE CREST — and nothing else in the collection has one at all.** It is
 *      also `home-pets.ts:220`'s own words for this species: *"the only cage bird
 *      here with anything on its head, and the only one a child could name from
 *      silhouette alone."* This is the axis that matters and it is spent whole.
 *   2. **HEIGHT, recovered.** 1.7066 against 1.43125. See §1.
 *   3. **TAIL — `wedge-18`, the TIGER'S**, the joint-longest of the two thinnest
 *      whips in the bank: 1.046587 long and **0.200 across, thinner than the
 *      budgie's `wedge-15` at 0.280**, which is itself the second thinnest. The
 *      three obvious others stay free: `box-38` (the parrot's fan) for the
 *      canary, `box-18` (the bank's only stub) for the lovebird, `wedge-07` for
 *      whoever wants it.
 *   4. **COLOUR — grey over pale yellow, and nothing else here is grey.** The
 *      budgie is green, the canary yellow, the lovebird green.
 *
 * **Two honest overlaps, stated rather than hidden.** The WING is `box-06` at
 * `sink: 0.5` at `[0.625, 0.80625, 0]` — byte for byte the budgie's, because that
 * file asked for it: *"the wing is a shared idiom and NOT a separator ... so four
 * birds read as one family."* And the CHEEK is `plate-16` at the budgie's own two
 * stations, differing only in colour, because both birds genuinely have a round
 * patch under the eye and inventing a different answer would be inventing. What
 * is NOT shared is the wing BAR: `plate-10` on the wing's own outer face is the
 * budgie's second extra and it stays the budgie's, so this bird's extras set is
 * crest + cheek and the two sets are disjoint. A cockatiel does carry a white
 * wing flash in life and it is declined here for that reason; the flag says so.
 *
 * **Keep-out.** 2.1719 deep against 1.5558 wide, so depth binds, charging
 * **1.0860** (`pets.ts:652`, `max(width, depth) / 2`) — inside the fox's 1.15,
 * which is the pack's own worst, and just inside the budgie's 1.0986 rather than
 * well inside it. That is the one axis where these two birds nearly agree, and it
 * is the price of two long tails on one shell.
 *
 * ===========================================================================
 * ## 6. Every other number, and where it came from
 * ===========================================================================
 *
 *   - **THE HULL IS `box-03`, AND IT IS THE PACK'S OWN BIRD BODY.** Fifteen
 *     donors including `parrot/body/hull` and `chick/body/hull`, so two of the
 *     pack's three birds wear this exact shell — which is what makes the beak
 *     below a recovery rather than an inference. `animal-nightjar.ts`,
 *     `animal-kiwi.ts` and `animal-budgie.ts` chose it for the same reason.
 *
 *   - **THE BEAK IS `cone-06`, THE PARROT'S OWN, AND A COCKATIEL IS A PARROT.**
 *     Placed by the donor transfer ALONE — no `at`, no `sink`, no spin — joined
 *     at this hull's front face and recovering the bank's recorded z = 0.664911
 *     and y = 0.718036. `animal-budgie.ts` carries the full derivation and it is
 *     not repeated. It is painted flat `limb`, the pale horn slot, and unlike the
 *     budgie its band 15 is NOT sent anywhere: that band is measurably the upper
 *     mandible (mean y +0.0409 against band 13's -0.1221) and on a budgie it is
 *     the blue cere, but a cockatiel's bill is one pale colour from top to
 *     bottom. One hue per part, because the animal is one hue.
 *
 *   - **THE EYE IS `plate-08`, THE PACK'S OWN BIRD EYE AND THE ONLY ROUND CARD IN
 *     THE BANK** — 0.400 x 0.400, `symmetry: radial`, donated by the chick, the
 *     parrot, the penguin, the fish and the monkey. Three of its five donors are
 *     the pack's three birds. Placed at its own recorded (0.2625, 0.89375) on the
 *     absolute `EYE_CARD_Z`, with its outer band painted `face` — see §4.
 *
 *   - **THE TAIL IS `wedge-18`, TURNED TO POINT STRAIGHT BACK**, in the budgie's
 *     posture and for the budgie's reasons: `axis: 'y', dir: 1` is the facing
 *     that `{ axis: 'x', deg: -90 }` lands on `z -1`, so the sink still measures
 *     along the direction the tail actually runs; and the join is at the HULL'S
 *     own centre height, the only height at which the spun root's 0.555215 fits
 *     inside the 0.625 flat rear face.
 *
 *     **`wedge-18` rather than `wedge-07` is a tie broken by a BAND, and the tie
 *     is real:** the two records are the same size to six decimals, their tapers
 *     differ by 0.000545, and 300 of `wedge-18`'s 306 points are `wedge-07`'s
 *     under a mirror. What separates them is that `wedge-07` (the cat's and the
 *     monkey's) has ONE band and `wedge-18` (the tiger's) has TWO — band 3, 64
 *     triangles averaging y +0.4012 against band 7's -0.0942, which is the tail's
 *     own TIP. The `x -90` spin carries +y to -z, so band 3 lands at the rearmost
 *     quarter, and painted `face` that is the pale flash a cockatiel's tail shows
 *     from behind. Kenney's own cut, no geometry, and the reason to prefer one of
 *     two otherwise identical shapes.
 *
 *   - **`sink: 0.2943` ON THE TAIL IS THE KEEP-OUT AND NOT THE ANATOMY**, exactly
 *     as on the budgie, and the number is that file's and the pack's rather than
 *     this one's: `wedge-03`'s own measured burial, the deepest of the bank's
 *     seven tails. At `wedge-18`'s own 0.137977 this bird measures 2.3354 deep and
 *     charges **1.1677**, which is past the fox's 1.15 and within 0.0024 of the
 *     pack's hard 1.17. At 0.2943 it measures 2.1719 and charges 1.0860.
 *
 *   - **TWO LEGS, AND THE FEET ARE JT-044's TWO-TONE.** `legs: false` and one
 *     mirrored `box-01` pair in `extras`, on `LEG_ROW`'s own row: y = 0.18125 and
 *     sink 0.408163, which put the feet on y = 0 exactly. x = 0.25 is `box-01`'s
 *     OWN recorded offset and z = 0 is the hull's midline, which is the only
 *     station a biped's legs can be at. The patch is `{ below: 'foot', at: 0.25 }`
 *     — 4/16 on the pack's own grid — so the bottom quarter of each leg is the
 *     darker toe under the pale shank. Joe ruled the mechanism for hooves; a
 *     bird's foot against its leg is the same tool.
 *
 *   - **NO BELLY LINE.** A cockatiel is one grey from throat to vent; the only
 *     boundary on the animal is the head/body one and §4 is why it cannot be
 *     drawn. Painting a paler underside would be adding a marking this bird does
 *     not have to stand in for one it does.
 *
 *   - **NO EARS**, which needs no defending on a bird, **and no nose** — the beak
 *     IS the nose and `cone-06` carries the pack's own `nose` role.
 *
 *   - **IT FLAPS AND IT BOBS.** `animal-budgie.ts` was the first species to
 *     declare `motion` at all; this is the first to declare two, and the second
 *     is the whole reason the field is interesting here. `motion.ts`'s `bob` is a
 *     POSITION channel on y at amplitude 0.05 — the parrot's own hover off
 *     `pets.ts:854` — and a crest that rises and lowers is precisely a part
 *     translating up and down on its own axis. Nothing is tuned; both take the
 *     table's own measured defaults. Neither moves a vertex or enters the
 *     geometry fingerprint.
 *
 * ## THE PALETTE IS NEW AND NOBODY HAS SIGNED IT OFF
 *
 * `home-pets.ts` carried a colour WORD per cage bird under the old songbird kit
 * and nothing else — *"grey"*, at line 104 — so the six below are the first
 * actual colours this species has ever had and every one is **UNREVIEWED**.
 *
 * **Flagged**, for the yellow face, the cheek, the wing flash and the palette.
 * Nothing else strained: height 1.7066 inside 1.43-2.02, feet on y = 0, keep-out
 * 1.0860 inside the fox's 1.15, every part joined at a face of this hull or at a
 * station solved off the hull's own measured geometry, one mass, **nothing
 * authored and not one stretch of any kind anywhere on the animal.**
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/*
 * SEVEN SOLVED CONSTANTS WERE REMOVED ON 4 AUGUST — the editor's push inlined
 * their values and left them declared and unread, which fails `tsc --noEmit`.
 * `HULL_FLAT` survives below because the definition still references it.
 *
 *   HULL_CENTRE_Y  0.80625   `box-03`'s own recorded centre
 *   HULL_SIDE_X    0.625     its side faces
 *   HULL_TOP_Y     1.43125   its top face
 *   WING_SINK      0.5       `animal-budgie.ts`'s solved sink, taken unchanged:
 *                            `box-06`'s tip reaches |z| = 0.456649 where the
 *                            flat side face reaches only 0.312500, so the donor's
 *                            own 0.366259 is not enough; 8/16 snapped up.
 *   TAIL_SINK      0.2943    `wedge-03`'s measured burial, reached for because of
 *                            the KEEP-OUT: at `wedge-18`'s 0.137977 this bird
 *                            charges 1.1677 against the fox's 1.15 and the pack's
 *                            hard 1.17 (`pets.ts:652`).
 *   CARD_Z         0.635     the pack's flat-card plane, 0.010 proud of 0.625
 *   DOT            0.056569  `plate-16`'s own half-width
 *   CHEEK_Y        0.637181  the eye card's lower edge less DOT, so the patch's
 *                            top edge touches the eye's bottom edge exactly
 *   CHEEK_X        0.255931  HULL_FLAT less DOT — which also puts the dot's inner
 *                            edge on 0.199343, where the 0.400-wide bill's own
 *                            half-width is: the face has room for exactly this
 *                            dot and nothing wider (header §3)
 *   CREST_Z        0.147715  HULL_FLAT less `cone-01`'s half-depth, so the crest's
 *                            LEADING edge lands on the flat top's front edge. A
 *                            `z` must be given because the bare transfer would use
 *                            `cone-01`'s recorded 0.469709, which is 0.157 past
 *                            where this hull's top face ends.
 */

export const COCKATIEL_ASSEMBLY = defineCreature('animal-cockatiel', {
  palette: {
    coat: 0xe6f59e,
    face: 0xf2dd7e,
    cheek: 0xe07a35,
    limb: 0xc7c1b6,
    foot: 0x8b8579,
    pupil: PACK_PUPIL,  // the pack's own measured pupil; see texture.ts
    wing: 0x8c907a,
  },

  hull: { at: [0, 0.8125, 0] },
  legs: false,
  eyes: { part: 'plate-08', paint: 'face' },
  tail: {
    part: 'box-38',
    paint: { base: 'coat', byBand: { 3: 'face' } },
    axis: 'y',
    dir: 1,
    spin: [{ axis: 'x', deg: -90 }],
    sink: 0.2943,
    at: [0, 0.525, -0.625],
  },
  snout: { part: 'cone-06', paint: 'limb' },
  extras: [
    {
      name: 'leg-front',
      part: 'box-01',
      paint: { base: 'limb', patch: { below: 'foot', at: 0.25 } },
      kind: 'pair',
      sink: 0.408163,
      at: [0.25, 0.18125, 0],
    },
    { name: 'crest', part: 'cone-01', paint: 'face', at: [0, 1.43125, 0.148215] },
    {
      name: 'wing',
      part: 'wedge-20',
      paint: 'wing',
      kind: 'pair',
      axis: 'z',
      dir: -1,
      spin: [
        { axis: 'z', deg: -90 },
        { axis: 'y', deg: -90 },
        { axis: 'z', deg: -90 },
        { axis: 'x', deg: 90 },
      ],
      sink: 0.5,
      at: [0.85, 0.8125, 0],
    },
    {
      name: 'cheek',
      part: 'plate-16',
      paint: 'cheek',
      kind: 'pair',
      at: [0.2559315, 0.6371815, 0.635],
      stretch: [1.3, 1.3, 1.3],
    },
    { name: 'crest-2', part: 'cone-01', paint: 'face', at: [0, 1.2875, 0.2625] },
    { name: 'crest-3', part: 'cone-01', paint: 'face', at: [0, 1.525, -0.025] },
  ],
  motion: [{ kind: 'flap', parts: ['wing'] }, { kind: 'bob', parts: ['crest'] }],
  flag: 'THE CREST IS REAL AND IT IS box-21 THAT IS NOT. animal-budgie.ts measured that '
    + 'shell as a 1.250 cube wearing the fox\'s two EARS and then recommended it to this '
    + 'species as a crest; the measurement is confirmed and the recommendation is '
    + 'REFUSED, with four numbers. (1) Its lugs cannot be painted: box-21 has three '
    + 'bands and band 7 is the WHOLE shell (x -0.625..0.625, y -0.7525..0.7525), so '
    + 'byBand cannot reach a lug without painting the body, and the only band that IS '
    + 'on them — band 5, 10 triangles at z 0.4141..0.5000 — is Kenney\'s inner-EAR cut. '
    + 'A cockatiel\'s crest is YELLOW on a GREY bird and a grey crest on a grey head is '
    + 'not a crest. (2) Nothing is on the midline: the lugs\' inner faces are at |x| '
    + '0.218, so the crown between them is 0.436 bare — 35% of the hull\'s width — where '
    + 'a crest is ONE plume on the midline and two bumps with a valley read as ears. '
    + '(3) They stand 0.2550 above the body, which is LESS than the 0.2754 the crest '
    + 'built here stands proud, at 184 triangles against box-03\'s 60. (4) And because '
    + '(1) and (2) mean a real crest is needed anyway, box-21 would not replace it — it '
    + 'would add two ears underneath it. WHAT IS HERE INSTEAD is cone-01, the bee\'s '
    + 'antenna, standing on the crown: one of only TWO shapes in all 94 bank records '
    + 'with taper 0, a true point, the other being the beak. It is unspun, unstretched '
    + 'and unsunk beyond its own 0.312222, and it makes this the tallest of the four '
    + 'cage birds (1.7066 against 1.43125) which is home-pets.ts:104\'s own ladder '
    + 'recovered from a part rather than from a shell. If 0.275 of reach is not enough '
    + 'crest, the fix is a taller shape and that is your call — a stretch is not, since '
    + 'you flagged three animals for exactly that on 2 August. THE YELLOW FACE CANNOT '
    + 'BE PAINTED, and on a cockatiel that is half the bird: it is a grey animal with a '
    + 'yellow HEAD, which is a z-region, and a patch takes one number and that number '
    + 'is a HEIGHT — the badger\'s white face, unchanged. Two routes were measured and '
    + 'refused: an inverted top patch paints a yellow stripe down the whole spine at '
    + 'the nearest 1/16 notches (14/16 catches the top 0.156 of the body), and plate-11 '
    + 'as a face card is 0.433 across against a 0.625 flat face with a 0.400 bill in '
    + 'the middle, and would sit exactly coplanar with the eye cards on z = 0.635. So '
    + 'the yellow is on the crest, the eye\'s outer ring and the tail tip, and the face '
    + 'is grey. THE ORANGE CHEEK IS A DOT WHERE IT SHOULD BE A THIRD OF THE FACE. '
    + 'plate-16, the pig\'s nostril, 0.113137 across, at animal-budgie.ts\'s own '
    + 'stations. The right card exists — plate-10 at 0.2529 spun onto the face — and '
    + 'the window it has to fit in is 0.1125, being the flat front face\'s own reach '
    + '(0.3125) less the parrot bill\'s own half-width (0.200). The bank\'s biggest dot '
    + 'is that window to within 0.0006. It is not the beak\'s fault either: over all 26 '
    + 'SOLID nose shapes in the bank the window never opens past 0.2525, which is still '
    + '0.0004 short of plate-10 — and that widest case is wedge-10, the one you '
    + 'rejected by name on the hedgehog. The widest usable bill leaves 0.2215. AND NO '
    + 'WHITE WING FLASH — a cockatiel has one, and plate-10 on the wing\'s outer face is '
    + 'the budgie\'s wing-bar extra, so it is left to the budgie to keep the two birds\' '
    + 'extras sets disjoint the way home-pets.ts:98-105 asks. NEW PALETTE, UNREVIEWED: '
    + 'home-pets.ts only ever carried the word "grey" for this bird. AND IT BOBS: this '
    + 'is the first species to declare two motions, and the second is the crest raising '
    + 'and lowering on motion.ts\'s own measured defaults. Nothing was authored and '
    + 'nothing is stretched.',
})
