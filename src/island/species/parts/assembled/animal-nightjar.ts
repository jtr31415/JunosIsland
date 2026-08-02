/**
 * The nightjar — Night Time's first bird, and one of the two the collection had
 * to answer the wing question for before it could build either.
 *
 * ONE SPECIES, ONE FILE. `register.ts` says why the one appended line in
 * `index.ts` is the whole of the wiring.
 *
 * ## THE WING QUESTION, ANSWERED BEFORE ANYTHING ELSE WAS CHOSEN
 *
 * The `wing` role is declared in `bank.generated.ts`'s `PartRole` union and
 * occurs **ZERO times** in all 94 records, alongside `horn` and `claw`.
 * `africa.ts` has held the ostrich and the vulture off the shelf for exactly
 * that reason since PB-036 phase 2, and that ruling is not overturned here.
 *
 * **But the pack's own three birds have no wing part either.** Parrot, chick and
 * penguin are each a fused hull plus a beak, two legs and eye cards, and that is
 * the pack's own answer to what a bird IS. So the line `night-time.ts` draws is
 * the one that decided this species: *if the missing part IS the animal, the
 * species is blocked; if the animal is recognisable without it, the species is
 * built and the absence is flagged.*
 *
 * **A nightjar falls on the buildable side, and not by a technicality.** It is a
 * cryptic bird that spends the whole day lying LENGTHWISE and motionless along a
 * branch or on bare ground, wings folded flat against its back, relying on being
 * mistaken for bark. That posture is the only way anybody ever sees one, and in
 * it there is no wing to draw — a folded wing lies inside the body's own
 * silhouette. A spread-winged nightjar would need a shape the bank does not
 * have; a perched one needs none. `tests/island/assembly-nightjar.test.ts`
 * MEASURES that absence rather than asserting it, so the day somebody banks a
 * wing shape the test says the absence has changed.
 *
 * ## What this animal has to say, and how it says it
 *
 * A nightjar is four things and this build spends its whole budget on them:
 * **two legs and not four**; **a tiny bill over an enormous gape**; **eyes far
 * too big for its head**; and **mottled bark colouring**. Everything else is the
 * pack's own bird, unmodified.
 *
 * ## Every number, and where it came from
 *
 *   - **The hull is `box-03`, and it is THE PACK'S OWN BIRD BODY.** Not a
 *     default taken for want of a better: `box-03`'s fifteen donors include
 *     `parrot/body/hull` and `chick/body/hull`, so two of the pack's three birds
 *     wear this exact shell. Everything else here is worn by a species that
 *     wears it on this hull, which is what makes each donor transfer a recovery
 *     rather than an inference (§8).
 *
 *   - **TWO LEGS, NOT FOUR, and they are the pack's own bird leg row.** `legs:
 *     false` and a single mirrored `box-01` pair in `extras` — `animal-mole.ts`
 *     is the worked example of doing it by hand — at `LEG_ROW.y` = 0.18125 and
 *     `LEG_ROW.sink` = 0.408163, the two constants that put feet on y = 0 on
 *     nine of the pack's ten hulls. The pack's own three birds carry
 *     `leg-front-left` and `leg-front-right` and nothing else, which is where
 *     the mesh name comes from.
 *
 *     **Neither station was chosen.** x = 0.25 is `box-01`'s OWN recorded offset
 *     — the pack's leg, at the x the pack records for it — and z = 0 is the
 *     hull's own midline, which is the only station a BIPED's legs can be at:
 *     two legs carry the whole animal and must stand under its centre of mass,
 *     where four legs can straddle it. A four-legged species has a wheelbase to
 *     choose; this one does not.
 *
 *     **The cost was budgeted first, not discovered.** Two legs instead of four
 *     is 64 built vertices and 88 triangles rather than 128 and 176 — and rule 9
 *     is a FLOOR as well as a ceiling (405 model vertices, 422 triangles), which
 *     on a light animal binds long before the ceiling does. The mottling below
 *     is what pays it back, and it is also the right animal; see there.
 *
 *   - **THE EYES ARE `plate-14`/`plate-15`, THE PANDA'S — THE BIGGEST IN THE
 *     PACK.** 0.435472 x 0.442601 against the default oval's 0.400 x 0.320208
 *     and the caterpillar's 0.329780 x 0.276342 — an area of 0.1927 against the
 *     oval's 0.1281, and the pack's whole eye range is only 1.44x wide. A
 *     nightjar hunts moths in the dark on sight alone and its eye fills a third
 *     of its skull; there is nothing bigger in the bank and rule 5 forbids
 *     stretching one, so this is the loudest that sentence can be said. Placed
 *     at the card's own recorded (0.258676, 0.920023) on the absolute
 *     `EYE_CARD_Z` = 0.6350 — z, size and sink are not sayable here at all,
 *     which is rule 5 made unwritable rather than reviewed.
 *
 *     **This card was UNWEARABLE until 2 August and it is worth knowing why,
 *     because the fix is in the shared harness and not here.**
 *     `assembly-assert.ts`'s §3 compared a built eye against the bank's
 *     `shape.size` field at four decimals — and the bank stores `positions` at
 *     FOUR decimals and `size` at SIX, so for any card whose true extent has a
 *     sixth decimal the two cannot agree past the fourth. `plate-14` misses by
 *     7.2e-5 (0.435472 recorded, 0.435400 built) and `plate-06` by 5.8e-5, so
 *     four of the bank's ten eye records failed an assertion about a stretch
 *     none of them had. Every species built before this collection wore
 *     `plate-01` or `plate-08`, both of which are 0.400 wide to the digit, which
 *     is why nothing exposed it for seventeen animals. The harness now says it
 *     twice — 3dp against the rounded field, and EXACTLY at 4dp against the
 *     part's own referenced vertices — which is strictly stronger than what it
 *     replaced and is the same shape §1b already uses for the hull.
 *
 *     **Its sclera is painted `mark`, the dark slot**, which is `animal-
 *     salamander.ts`'s idiom: the card arrives pre-split at Kenney's own cut
 *     (bands 3 and 15), so a big dark eye with a grey glint costs two texture
 *     slots and no geometry at all. A nightjar's eye is a black bead.
 *
 *   - **The bill is `tube-02`, THE CHICK'S AND THE PENGUIN'S OWN BEAK, and it is
 *     placed by the donor transfer alone.** Joined at this hull's front face
 *     z = 0.625 and sunk its own measured 0.500 — half of it is meant to be
 *     buried — its centre lands on **z = 0.625, the bank's recorded offset for
 *     the shape to the digit**, and its height on the shape's own y = 0.72775.
 *     That agreement is the evidence the transfer is legitimate (§8): the join
 *     was solved for and then checked against a number not used in solving it.
 *
 *     It stands **0.100 proud** of the face, which is the smallest forward reach
 *     of any snout in the bank, and that is exactly the point. A nightjar's bill
 *     is almost nothing — a tiny hooked tip on the front of a mouth that opens
 *     to the width of its head.
 *
 *     `pets:creature` marks it **`sunk 0.100 THIN`**, and it is right to print
 *     that and wrong to read it as a fault — the same note `animal-salamander.ts`
 *     carries about its tail. 0.125 is §3's floor for an EAR, and 0.100 is what
 *     the pack itself buries this beak by: `sunkFractionMin` and
 *     `sunkFractionMax` are both 0.500 over its two donors, so there is one
 *     measured value and this is it. Deepening it to clear a threshold would
 *     mean discarding a measurement to satisfy a warning, and it would shorten
 *     the one dimension this species is trying to keep small anyway.
 *
 *   - **THE GAPE IS TWO OF THE PACK'S OWN MOUTH-LINE CARDS, ABUTTED AT THE
 *     MIDLINE.** `plate-03` is 0.2366 x 0.1009 and zero-thickness — the bee's,
 *     the caterpillar's, the fish's and the monkey's mouth — and one of them is
 *     narrower than the bill above it, which would say the opposite of what this
 *     animal is. Placed as a mirrored `pair` at x = **0.1183, which is the
 *     card's OWN half-width**, the two meet at x = 0 exactly and read as one
 *     line **0.4732 across** — wider than the 0.460 bill, and the widest mouth
 *     this bank can draw. Neither station is a taste: one is the card's own
 *     measurement and the other is where that measurement puts it.
 *
 *     **y = 0.5625 is 9/16 on the pack's own authoring grid**, and it is the one
 *     notch that tucks the line's top edge (0.61295) under the bill's own lower
 *     edge (0.60175). The gape therefore opens at the base of the bill, which is
 *     where a nightjar's does. **z = 0.635 is the pack's own flat-card shell** —
 *     the card's own recorded z, `EYE_CARD_Z` on the other axis, and the same
 *     0.010 of daylight over this cube's 0.625 face that every eye card in the
 *     pack gets. The bare donor transfer would join it AT 0.625 and z-fight the
 *     face; 0.010 is the pack's answer to that and is quoted, not invented.
 *
 *   - **THE RICTAL BRISTLES ARE `cone-01`, AND THEY ARE WHAT A NIGHTJAR HAS
 *     INSTEAD OF A BEAK.** The bee's and the caterpillar's ANTENNA: taper 0.000,
 *     a true point, 0.160 wide and 0.4004 long, 34 triangles. §3.1 is the whole
 *     argument for using it — `animal-hedgehog.ts` wears it as a quill and
 *     `animal-shrew.ts` as a snout, because a part's identity is its placement.
 *     A bristle is what this shape is actually shaped like.
 *
 *     They stand at **x = 0.2366, the gape's own outer edge** (twice the card's
 *     half-width), at **y = 0.5625, the gape's own height**, joined on the
 *     hull's front face z = 0.625 — every one of the three recovered from a
 *     number already on this animal. Sunk `cone-01`'s own measured 0.312222,
 *     which is the depth the pack itself buries this shape at.
 *
 *     **Spun forward and UP and OUT, deliberately, and not straight ahead.**
 *     `{ axis: 'x', deg: 55 }` takes the shape's `y +1` facing to (0, 0.574,
 *     0.819) — forward and 35 degrees above horizontal — and `{ axis: 'y', deg:
 *     25 }` then splays it outward, the mirror carrying the left one the other
 *     way for free (rule 6). Two spikes pointing straight forward beside a mouth
 *     read as TUSKS, and brief §19 is "bright, never scary"; the same guardrail
 *     is why `animal-crocodile.ts` has no teeth. Swept up and out they read as
 *     what they are, whiskers round a face.
 *
 *   - **THE TAIL IS `box-38`, THE PARROT'S FAN — THE PACK'S OWN BIRD TAIL — AND
 *     NOTHING IS SAID ABOUT IT.** Unspent until now. It is the only tail in the
 *     bank that is a broad shallow fan rather than a whip, a brush, a paddle or
 *     a stub (0.6259 x 0.9122 x 0.6421, taper 0.839), and the parrot wears it on
 *     `box-03` — THIS hull — so the transfer is exact rather than argued: joined
 *     at the rear face z = -0.625, sunk the parrot's own 0.269738, its centre
 *     lands on the bank's recorded (0, 1.099846, -0.772857). The height was not
 *     moved down to the body's centre the way `animal-crocodile.ts` moves the
 *     beaver's paddle, because unlike that case the donor is on the same shell:
 *     there is a measured answer here and it is the parrot's.
 *
 *   - **THE MOTTLING IS `plate-10` AND `plate-11`, THE COW'S, DOG'S AND
 *     GIRAFFE'S OWN FLANK CARDS, AND IT IS THIS ANIMAL'S WHOLE POINT.** Zero
 *     thickness (`size[0]` is exactly 0), given no stretch and no sink, painted
 *     flat in the dark slot. `animal-salamander.ts` places these four exact
 *     stations on this exact hull and verified every one of them lands EDGE-ON
 *     to the cube's own 0.625-square flat faces — eight of its ten measured
 *     bounds are the face's own edge to four decimals — so the geometry here is
 *     shipped and checked rather than re-derived. The salamander is the other
 *     species that shares these shapes and these stations, and it is in a
 *     different collection wearing them in vivid yellow.
 *
 *     **Two of the four are on the BACK, spun onto the top face**, `{ axis: 'z',
 *     deg: 90 }`, which takes an `x +1` card to `y +1` — rule 4 as amended,
 *     baked into the copy's vertices. That pair is not decoration: **the
 *     island's camera looks DOWN at these animals**, a flank card is edge-on
 *     from up there, and a nightjar's entire survival strategy is what it looks
 *     like FROM ABOVE. The two on the flanks are for the side view; the two on
 *     the back are for the view a child actually gets.
 *
 *     They also pay the vertex floor. Rule 9 is a floor as well as a ceiling and
 *     a two-legged bird is exactly the animal it binds on: without the eight
 *     cards this build is 373 model vertices against a floor of 405. That they
 *     are both the fix and the right animal is luck, and it is recorded here so
 *     the next reader does not have to work out which came first —
 *     `animal-salamander.ts` says the same about its own.
 *
 *   - **NO PAINTED BELLY LINE.** §4's second way is free and it is declined on
 *     purpose, which is `animal-mole.ts`'s argument arriving at the same answer
 *     from the opposite direction: a mole is uniform because it lives where
 *     there is no light to counter-shade against, and a nightjar is uniform
 *     because it spends the day in plain sight pretending to be a piece of bark.
 *     A pale underside would be the one part of it that did not match the log.
 *
 *   - **No ears**, which needs no defending on a bird, and no nose — a bill IS
 *     the nose, and `tube-02` carries the pack's own `nose` role.
 *
 * ## THE PALETTE IS NEW AND NOBODY HAS SIGNED IT OFF
 *
 * `night-time.ts` carries no colours for any of its thirteen, because the
 * collection has never had a record until now. The four below are the first ever
 * proposed for this species and every one of them is **UNREVIEWED**. Joe should
 * look at them; the `flag` says so where he reads it.
 *
 * **Flagged**, for the palette and for one thing the bank cannot say — see
 * below. Nothing else strained: 469 model vertices inside 405-1626, 514
 * triangles inside 422-951, height 1.556 inside 1.43-2.02, feet on y = 0, every
 * part joined at a face its donor joined its own to, one mass, nothing authored
 * and not one stretch anywhere on the animal.
 */
import { defineCreature } from '../creature'
import { LEG_ROW } from '../hulls'
import { PACK_PUPIL } from '../texture'

/**
 * `plate-03`'s own recorded half-width, to the bank's own six decimals. Two
 * copies at this station abut at x = 0 exactly and read as one 0.473-wide line.
 */
const GAPE_HALF = 0.236581 / 2

/**
 * 9/16 on the pack's authoring grid: the one notch that puts the mouth line's
 * top edge (0.61295) under the bill's own lower edge (0.72775 - 0.252/2 =
 * 0.60175), so the gape opens at the base of the bill.
 */
const GAPE_Y = 0.5625

/** The pack's own flat-card shell — 0.010 proud of this cube's 0.625 face. */
const CARD_Z = 0.635

/** `box-03`'s front face, and where a part joined to it starts. */
const HULL_FRONT = 0.625

export const NIGHTJAR_ASSEMBLY = defineCreature('animal-nightjar', {
  /* NEW AND UNREVIEWED — the first colours this species has ever had. */
  palette: {
    coat: 0x9c8a6d,    // UNREVIEWED: lichen-and-bark buff, the ground colour
    mark: 0x53442f,    // UNREVIEWED: the mottling, the gape, the bristles, the dark iris
    limb: 0x7d6a4e,    // UNREVIEWED: the tiny legs and the tiny bill
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* No `hull` line: the builder's default IS `box-03`, and `box-03` is the
   * parrot's and the chick's own shell. Two of the pack's three birds. */

  /* NO BELLY LINE. A nightjar spends the day in plain sight pretending to be
   * bark; a pale underside is the one part that would not match the log. */

  /* THE BIGGEST EYE IN THE PACK, at the panda's own station, with its sclera
   * painted dark so the card reads as one black bead with a grey glint. There
   * is nothing bigger, and rule 5 forbids stretching one. */
  eyes: { part: 'plate-14', paint: 'mark' },

  /* The chick's and the penguin's own beak, entirely by the donor transfer:
   * joined at the front face, sunk its own 0.500, centre recovered onto the
   * bank's recorded z = 0.625. It stands 0.100 proud, the smallest forward
   * reach of any snout in the bank, and that is the animal. */
  snout: { part: 'tube-02', paint: 'limb' },

  /* The parrot's FAN, on the parrot's own hull, at the parrot's own numbers —
   * no spin, no stretch, no `at`. The pack's own bird tail, unspent until now. */
  tail: 'box-38',

  /* TWO legs, not four, on the row that never moves. x is `box-01`'s own
   * recorded offset and z = 0 is the hull's midline: a biped's legs stand under
   * its centre of mass, where a quadruped's straddle it. */
  legs: false,
  extras: [
    { name: 'leg-front', part: 'box-01', paint: 'limb', kind: 'pair',
      sink: LEG_ROW.sink, at: [0.25, LEG_ROW.y, 0] },

    /* THE GAPE. Two of the pack's own mouth-line cards, abutted at the midline
     * at the card's own half-width, reading 0.4732 across — wider than the
     * 0.460 bill above them, which is the whole of what a nightjar is. */
    { name: 'gape', part: 'plate-03', paint: 'mark', kind: 'pair',
      at: [GAPE_HALF, GAPE_Y, CARD_Z] },

    /* THE RICTAL BRISTLES. The bee's antenna — taper 0.000, a true point — at
     * the gape's own outer edge and the gape's own height, sunk its own
     * 0.312222. Swept forward, UP 35 degrees and outward rather than straight
     * ahead: two spikes pointing forward beside a mouth read as tusks, and brief
     * 19 is "bright, never scary". The mirror carries the left one for free. */
    { name: 'bristle', part: 'cone-01', paint: 'mark', kind: 'pair',
      spin: [{ axis: 'x', deg: 55 }, { axis: 'y', deg: 25 }],
      at: [2 * GAPE_HALF, GAPE_Y, HULL_FRONT] },

    /* THE MOTTLING, and the reason a child would believe this is a nightjar.
     * The cow's, dog's and giraffe's own flank cards on the pack's own flat-card
     * shell, at their own recorded stations — `animal-salamander.ts` measured
     * every one of these onto this exact hull and found them edge-on to its
     * 0.625-square flat faces. The back pair is the same card turned onto the
     * top face, because the island's camera looks DOWN and that is the view a
     * cryptic bird is cryptic in. */
    { name: 'mottle-upper', part: 'plate-10', paint: 'mark', kind: 'pair',
      at: [CARD_Z, 0.99675, -0.18606] },
    { name: 'mottle-lower', part: 'plate-11', paint: 'mark', kind: 'pair',
      at: [CARD_Z, 0.69375, 0.095994] },
    { name: 'mottle-back-fore', part: 'plate-10', paint: 'mark', kind: 'pair',
      spin: [{ axis: 'z', deg: 90 }], at: [0.1905, 1.44125, 0.18606] },
    { name: 'mottle-back-aft', part: 'plate-10', paint: 'mark', kind: 'pair',
      spin: [{ axis: 'z', deg: 90 }], at: [0.1905, 1.44125, -0.18606] },
  ],

  flag: 'NEW PALETTE, UNREVIEWED — night-time.ts has never carried colours for any '
    + 'of its thirteen, so these four are the first ever proposed for a nightjar. '
    + 'AND THE GAPE CANNOT BE AS WIDE AS THE ANIMAL. A nightjar\'s mouth opens to '
    + 'very nearly the width of its head; the bank\'s only mouth shapes are two flat '
    + 'cards, plate-03 (0.2366 x 0.1009) and plate-13 (0.2192 x 0.100), and TWO '
    + 'plate-03 abutted at the midline is 0.4732 — the widest line this pack can '
    + 'draw, against a 1.250 head. That is as far as it goes without authoring a '
    + 'shape, and nothing was authored. THE EYE IS AS BIG AS THE PACK GOES: '
    + 'plate-14, the panda\'s, 0.4355 x 0.4426 against the default oval\'s 0.400 x '
    + '0.3202, and there is nothing bigger to reach for — rule 5 makes stretching '
    + 'one unsayable, so if this eye still is not enormous enough for a nightjar '
    + 'that is a bespoke shape and it is your call. NO WING, and here that is the right answer '
    + 'rather than a gap: the wing role occurs zero times in all 94 bank records, '
    + 'and a nightjar is only ever seen perched lengthwise with its wings folded '
    + 'flat inside its own outline. A SPREAD-winged one would need a shape that does '
    + 'not exist, and this is not that bird.',
})
