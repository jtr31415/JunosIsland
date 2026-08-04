/**
 * The canary — Home Pets' second CAGE BIRD, and the plainest animal in the
 * project.
 *
 * ONE SPECIES, ONE FILE. `register.ts` says why the one appended line in
 * `index.ts` is the whole of the wiring.
 *
 * **Read `animal-budgie.ts` first.** It is the built precedent for all four cage
 * birds and it solved three things this file does not re-litigate: that a WING
 * here is `box-06`, the bunny's ear, laid along the flank as a SOLID because the
 * island's camera looks DOWN and a flat card is edge-on from up there; that
 * **`box-21` is not a taller body but this same cube with the fox's EARS fused
 * on**, and is the COCKATIEL's; and that height cannot separate these four,
 * because nine of the pack's ten hulls are 1.25 tall or less and every cage bird
 * therefore stands on `HEIGHT_FLOOR` = 1.43125. All three are inherited whole.
 *
 * ===========================================================================
 * ## 1. THE DESIGN PROBLEM IS THAT A CANARY HAS NOTHING ON IT
 * ===========================================================================
 *
 * A child names this bird by five things and not one of them is a feature:
 * **bright uniform lemon-yellow all over**, a **small round compact body**, a
 * **short conical pink bill**, a **short tail**, and **one bright black eye**.
 * No crest, no cheek patch, no barring, no collar, no colour break anywhere on
 * the animal at all. It is the plainest and the roundest of the four.
 *
 * That is a real problem and not a saving. Every other species in this directory
 * spends its budget on the thing that makes it itself — the nightjar's mottling,
 * the kiwi's chained bill, the chinchilla's ears, the budgie's cheek patches.
 * **This one has nothing to spend it on, so it has to read by PROPORTION and by
 * COLOUR, and everything else has to be got out of the way.** §3 below is the
 * list of free mechanisms this species deliberately declines; `animal-guinea-
 * pig.ts` is the precedent for treating a stated, pinned ABSENCE as a design
 * choice rather than as a gap, and its tail is the same argument.
 *
 * **Plainness has one cost and it is measured.** Rule 9's budget is a FLOOR as
 * well as a ceiling — **405 model vertices and 422 triangles** — and a bird with
 * no extras at all is exactly the animal it binds on. `animal-nightjar.ts` found
 * the same wall from further away and paid it with eight mottling cards it also
 * wanted; this species has nothing it also wants. Hull, two legs, two eye cards,
 * a bill, a tail and two wings is the whole of this creature, and on `box-03`
 * that is **383 vertices and 404 triangles — twenty-two and eighteen UNDER both
 * floors.** The hull is the only place they could come from, which is §2, and
 * the animal ends up sitting on the vertex floor **exactly: 405 of 405**, with
 * two triangles to spare. That is not a near miss. It is the correct reading of
 * what the floor is for, on the simplest animal in the project.
 *
 * ===========================================================================
 * ## 2. FOUR OF THE PACK'S TEN HULLS ARE ONE SHELL, MEASURED — AND THIS BIRD
 * ##    TAKES THE PENGUIN'S
 * ===========================================================================
 *
 * `hulls.ts` names four alternatives to the 1.250 cube and treats the other five
 * hull records as distinct shapes. **Three of them are not distinct at all.**
 * Every one of `box-20`'s 140 points, `box-36`'s 112 and `box-39`'s 130 lies on
 * `box-03`'s own surface, tested against all sixty of its triangles' planes:
 *
 *       box-20   max |distance to box-03's surface|   0.000000
 *       box-36                                        0.000000
 *       box-39                                        0.000028
 *
 * — against `box-12`'s 0.212644, `box-21`'s 0.334013, `box-31`'s 0.052003 and
 * **`box-33`'s 0.166410**, which is the one that matters most because `box-33`
 * looked like the same cube too: it is a 1.250 cube by its bounding box and its
 * flat faces reach the same 0.3125, but 0.1664 of it is set INSIDE the shell, so
 * the monkey's shape is genuinely dished and is not this one. The four that ARE
 * one shell differ only in how they are cut up: **60, 78, 72 and 80 triangles
 * over the identical solid**, plus different Kenney band cuts.
 *
 * **So the choice among those four is free of geometry, and rule 9's FLOOR is
 * what makes it.** This animal was built four times, once on each, with
 * everything else held fixed, and the counts measured off the built meshes:
 *
 *       box-03  the parrot's and chick's   383 verts / 404 tris  BOTH FLOORS FAIL
 *       box-36  the panda's                399       / 416      BOTH FLOORS FAIL
 *       box-20  the fish's                 395       / 422      the VERTEX floor fails
 *       box-39  the PENGUIN's              405       / 424      the only one that clears
 *
 * **Exactly one of the four lets an animal with nothing on it stand up, and it
 * is the bird's.** That is not a hull chosen for triangles over a hull chosen
 * for the animal — there was no choice left to make. `box-03` is the parrot's
 * and the chick's and `animal-nightjar.ts`, `animal-kiwi.ts` and
 * `animal-budgie.ts` have all three taken it; nothing had ever spent the
 * penguin's. Three bird shells in the pack, and this is the one still on the
 * shelf, and it is the one that fits.
 *
 * **`box-33` is the line that had to be checked rather than assumed.** It builds
 * to 433 / 458 and would have cleared both floors with room to spare, and it is
 * a 1.250 cube by every field the bank prints. Measured, it is not this solid,
 * so it is not available.
 *
 * **Every donor transfer on this animal is still exact.** That follows from the
 * measurement rather than from hope: `box-39`'s offset is `(0, 0.80625, 0)` to
 * the digit, its front face is at z = **0.625** and its flat reach is **0.3125**
 * on all six faces — `box-03`'s own numbers — so the parrot's bill and the
 * parrot's tail land on precisely the coordinates they land on for the budgie.
 * The test re-derives all of that off the two records rather than trusting this
 * paragraph.
 *
 * ===========================================================================
 * ## 3. THE SIX FREE MECHANISMS THIS SPECIES DECLINES, AND THE ONE SENTENCE
 * ===========================================================================
 *
 * Each of these costs nothing, each was available, and each is refused for the
 * same reason: **a canary has no colour break on it anywhere.** Recorded so the
 * next builder does not helpfully add one back — `animal-badger.ts`'s
 * discipline, applied six times.
 *
 *   1. **The painted belly line.** `belly` is §4's second way to two-tone and is
 *      free. Declined, which is `animal-mole.ts`'s and `animal-kiwi.ts`'s move
 *      arriving from the opposite direction: those two are uniform because they
 *      live where there is no light to counter-shade against, and this one is
 *      uniform because a domestic yellow canary was bred to be exactly one
 *      colour. `animal-budgie.ts` uses this mechanism and it is half of what
 *      separates the two birds.
 *
 *   2. **The hull's own band cut, and it is the sharpest refusal here.**
 *      `box-39` arrives pre-split at Kenney's own cut: **band 3 is 22 triangles
 *      whose mean z is +0.5114 — the FRONT FACE — and band 15 is the other 58**.
 *      That is the penguin's white shirt, a ready-made two-tone front for no
 *      geometry at all, on the hull this species chose for other reasons. It is
 *      painted the same lemon as everything else. A canary has no bib.
 *
 *   3. **JT-044's two-tone leg.** Joe ruled the patch a general tool and
 *      `animal-budgie.ts` spends it on a bird's dark toes against a pale shank,
 *      which is what a budgie's foot looks like. A canary's legs and toes are one
 *      pale pink from the hock down. Declined — and the `paint` on the leg is a
 *      bare slot name with no `patch` at all, which the test pins.
 *
 *   4. **`byBand` on the bill.** `cone-06` carries bands 13 and 15, and
 *      `animal-budgie.ts` measured which is which (band 15 means y +0.0409, band
 *      13 means -0.1221, so 15 is the upper mandible) and painted 15 blue for the
 *      cere. A canary's bill is one pale pink, upper and lower. Declined.
 *
 *   5. **Markings of any kind.** `plate-10`/`plate-11` are the flank cards
 *      `animal-salamander.ts` and `animal-nightjar.ts` wear, and `plate-12` /
 *      `plate-16` are the nostril dots the budgie spends as cheek patches. This
 *      species carries none of the four. `extras` holds two legs and two wings
 *      and nothing else.
 *
 *   6. **A crest, a collar, a cheek patch, a wing bar.** Those are the other
 *      three birds' — see §4 — and the temptation to give this one *something* is
 *      the thing to resist. Its whole charm is that it is a small round yellow
 *      bird.
 *
 * **What the palette does instead is spend one slot on the eye.** Four colours,
 * and the fourth exists solely because the eye is the only dark point on the
 * animal; see the palette note below.
 *
 * ===========================================================================
 * ## 4. WHAT SEPARATES THIS BIRD FROM THE OTHER THREE
 * ===========================================================================
 *
 * `home-pets.ts:88-125` is the brief: four small perching birds on one album
 * page, three of them parrots, with a fifth (`animal-parrot`, one of the frozen
 * Kenney 24) they must not read as either. `home-pets.ts:102` is this species'
 * own row — *"smallest, roundest ... fan/folded ... none ... yellow"* — and all
 * four of those words are honoured. Height is not an axis; `animal-budgie.ts` §2
 * says why.
 *
 *   1. **TAIL — `box-38`, THE PARROT'S OWN FAN, and the shortest reach any bird
 *      here can honestly take.** Measured over the bank's seven tails as the
 *      forward extent left after each shape's own recorded burial, this reaches
 *      **0.468919** clear of the rear face against the budgie's `wedge-15` at
 *      **0.763846** — the budgie's tail is **1.63x** this one's. **Three of the
 *      seven reach less and not one of the three is available**: `wedge-03` at
 *      0.415328 is the beaver's broad paddle and is the chinchilla's on this same
 *      album page; `box-18` at 0.425211 is the bank's only stub and is the
 *      hamster's; and `wedge-07` at 0.466912 — 0.002 shorter, which is nothing —
 *      is the cat's whip, 0.200 across and 1.0466 tall standing vertically, which
 *      is a posture and not a fan. So among the shapes that are actually a bird's
 *      tail this is the shortest there is, and it is the pack's own. It is also
 *      the cheapest tail in the bank at 48 triangles, which on an animal fighting
 *      the FLOOR is worth saying is a cost and not a saving.
 *
 *   2. **PROPORTION, and this is what "roundest" and "smallest" actually mean.**
 *      The hull cannot say either — it is one of the pack's ten shells and is
 *      never scaled, so every bird on the 1.250 cube has the same body. What
 *      differs is the whole animal's PLAN: this one measures **1.9023 deep by
 *      1.5558 wide, a ratio of 1.223**, against the budgie's 2.1971 by 1.5758 and
 *      **1.394**. Nearest to square is roundest, and it is 14.5% smaller by
 *      bounding volume. The keep-out (`pets.ts:652`, `max(width, depth) / 2`) is
 *      **0.9511** against the budgie's 1.0986 — comfortably the smallest of the
 *      four, exactly as `home-pets.ts:149-155` predicts.
 *
 *   3. **COLOUR — pure saturated lemon, and it is claimed deliberately.** Yellow
 *      is contested: the cockatiel is grey with a yellow FACE and the budgie
 *      carries a soft primrose mask over green. This bird takes the saturated
 *      lemon whole, over its entire surface, and the other two should stay off
 *      it. Weighted by surface area — `HANDOFF.md` §6's rule, never by vertex
 *      count — this animal is one colour and the rest is a bill, two legs and two
 *      eyes.
 *
 *   4. **EXTRAS — NONE.** The budgie has a wing bar and two cheek patches, the
 *      cockatiel has a crest, the lovebird has a collar. This one has nothing,
 *      and that is its entry in the column rather than an omission from it.
 *
 * ===========================================================================
 * ## 5. Every number, and where it came from
 * ===========================================================================
 *
 *   - **THE WING IS `box-06` AT THE BUDGIE'S OWN THREE NUMBERS, AND IT WAS
 *     CHECKED FOR SIZE RATHER THAN COPIED.** The bunny's ear, `axis: 'z',
 *     dir: -1`, `spin: [{ z: -90 }, { y: -90 }]`, `sink: 0.5`, joined at
 *     `[0.625, 0.80625, 0]` — every one of them solved in `animal-budgie.ts` and
 *     re-derived in this species' test rather than inherited on trust.
 *
 *     **The size question was real and the answer is that it fits.** `box-06` is
 *     **0.913298** long on a 1.250-deep body — **73.1%** — and a live canary's
 *     folded wing runs about 85% of its body from bill-base to tail-base, so this
 *     is if anything a little short rather than too big. The budgie's wing is
 *     proportionally longer in life than the canary's, and the bank cannot say
 *     that difference: there is nothing between 0.9133 and the next shape down.
 *
 *     **What the bank has, measured over all 23 ear shapes.** Sorted extents,
 *     longest over middle, is the aspect that decides whether a shape can be a
 *     wing at all — and **only two of the twenty-three exceed 1.5**:
 *
 *           box-06 / box-07   0.9133 / 0.4820 / 0.3058    1.8949
 *           tube-04 / tube-05 0.6188 / 0.3592 / 0.2773    1.7225
 *           every other ear                               1.0000 - 1.2185
 *
 *     So the choice was between exactly two shapes, and **`box-25` — the koala's
 *     dish, which is the obvious reach for the roundest bird — is refused with a
 *     number.** Its aspect is **1.0000**: x and y equal to six decimals,
 *     `symmetry: radial`, `taper: 1.000` — a DISC. Laid on the flank it is a
 *     shield, not a wing. It is also **spent inside this collection**:
 *     `animal-chinchilla.ts:22` claims it as that species' whole separation and
 *     asks in writing that nothing else on this album page wear it.
 *
 *     **`tube-04`/`tube-05` are refused with two numbers.** They are the
 *     elephant's ears and are a genuine handed pair (`dir` +1 and -1), and one
 *     spin would do where `box-06` needs two: `{ axis: 'x', deg: 90 }` takes
 *     their own y onto z and leaves the `x +1` facing alone. But at **0.618750**
 *     they are **49.5%** of the body's depth, which is a stub rather than a short
 *     wing; and their recorded burial is **0.126087**, which on a 0.359219
 *     attachment is **0.0453 of a unit — a third of §3's 0.125 floor** for an
 *     embedded part, so the join would have to be overruled anyway.
 *
 *   - **THE BILL IS `cone-06`, AND IT IS THE ONLY CONE IN THE BANK.** A canary is
 *     a finch and a finch's bill is a short deep cone. Measured over the bank's
 *     **28 nose shapes, `shape.form === 'cone'` occurs exactly once** — the other
 *     27 are 11 boxes, 6 tubes, 5 blades, 3 wedges and 2 plates. There is no
 *     second candidate, and the alternative worth naming is `tube-02`, the chick's and
 *     the penguin's own beak: `taper 1.000`, a blunt bar whose tip is still 0.373
 *     across, reaching **0.100** where this one reaches **0.183350**. Half the
 *     reach and none of the taper.
 *
 *     **The honest caveat, measured, is that this is a parrot's bill.** Split at
 *     Kenney's own upper/lower cut, band 15's geometry reaches z = **0.143400**
 *     and band 13's only **0.101500**, so the upper mandible **overhangs the
 *     lower by 0.041900 — 14.6%** of the shape's own 0.286878 depth. Read off the
 *     silhouette instead it is bigger: the forward-most point of the bill sits at
 *     y +0.1122 and the forward-most point of its bottom edge 0.0838 behind it,
 *     which is 29%. That overhang is where a parrot's hook begins. Every bird has
 *     some of it and a canary's bill genuinely does overhang, so both readings
 *     are inside honesty; but it is stated in the flag rather
 *     than buried, because it is the one place this animal wears a part whose
 *     donor is a different KIND of bird. Its section also narrows front-to-back
 *     (0.3129 tall at the tip against 0.3864 at the root, a ratio of 0.81) and
 *     its axis drops — the front section's centre is 0.0518 below the root's over
 *     a 0.1932 run, about 15 degrees — which is a seed-eater's set.
 *
 *     **It is placed by the donor transfer ALONE** — no `at`, no `sink`, no
 *     `spin`. Joined at this hull's front face z = 0.625 and sunk its own
 *     0.360878, its centre lands on **z = 0.664911 and y = 0.718036, the bank's
 *     own recorded offset for the shape to six decimals.** That agreement is the
 *     evidence (§8): the join was solved for and then checked against numbers the
 *     solve never used. `pets:creature` marks it `sunk 0.103 THIN` and that is a
 *     print rather than a fault, for `animal-nightjar.ts`'s reason — 0.360878 is
 *     one measured value over one donor and deepening it to clear a threshold
 *     would be discarding a measurement to satisfy a warning.
 *
 *   - **THE TAIL IS AT THE HULL'S OWN CENTRE HEIGHT, AND THAT IS THE ONE THING
 *     MOVED OFF THE PARROT'S NUMBERS.** `animal-nightjar.ts` wears `box-38` as a
 *     bare donor transfer and argues correctly that the parrot's own 1.099846 is
 *     a measured answer on this same shell. **A canary is not a parrot and does
 *     not cock its tail**, and the transfer's own arithmetic says so: at 1.099846
 *     the fan's top edge reaches **1.555942**, which is 0.1247 ABOVE the hull's
 *     own 1.43125, so the model's height would be 1.5559 and this bird would
 *     stand TALLER than the budgie. `home-pets.ts` asks for the shortest of the
 *     four. At the hull's own 0.80625 — `animal-badger.ts`'s move and
 *     `animal-budgie.ts`'s — the fan spans **0.350154 to 1.262346**, entirely
 *     inside the hull's own 0.18125-1.43125, the animal stands on
 *     `HEIGHT_FLOOR`, and the tail runs straight back where a canary's does.
 *
 *     **Nothing floats, and the root was checked rather than assumed.**
 *     `box-38`'s join cross-section is 0.3561 half-height where the flat rear
 *     face reaches only 0.3125, so its top and bottom corners stand over a
 *     surface that has receded **0.0436**; the shape's own recorded burial is
 *     0.269738 of 0.642124 = **0.173205**, four times what the overhang needs. No
 *     override, unlike the wing, where the budgie found the donor's own burial was
 *     0.1051 short and had to overrule it.
 *
 *   - **TWO LEGS, NOT FOUR, AND NO TWO-TONE ON THEM.** `legs: false` and one
 *     mirrored `box-01` pair in `extras` — `animal-nightjar.ts` and
 *     `animal-kiwi.ts` are the worked examples — at `LEG_ROW.y` = 0.18125 and
 *     `LEG_ROW.sink` = 0.408163, the two constants that put the feet on y = 0
 *     exactly. **x = 0.25 is `box-01`'s OWN recorded offset**, the pack's number
 *     rather than a choice, and **z = 0 is the hull's midline**, which is the only
 *     station a biped's legs can be at: two legs carry the whole animal where four
 *     straddle it. The paint is one flat slot; see §3.3.
 *
 *   - **THE EYE IS `plate-08`, THE PACK'S OWN BIRD EYE AND THE ONLY ROUND CARD IN
 *     THE BANK — PAINTED DARK.** 0.400 x 0.400, `symmetry: radial`, and three of
 *     its five donors are the pack's three birds. `animal-budgie.ts` wears the
 *     same card with a PALE iris ring, which is a budgie's white-irised eye; a
 *     canary's is a plain black bead, so this one paints the sclera from its own
 *     dark slot and lets Kenney's band 15 come through as the glint —
 *     `animal-salamander.ts`'s and `animal-kiwi.ts`'s idiom, two texture slots and
 *     no geometry. Same card, opposite treatment, which is the separation this
 *     axis can carry without stretching anything (rule 5 makes the eye absolute).
 *
 *   - **IT FLAPS.** `{ kind: 'flap', parts: ['wing'] }` on `motion.ts`'s own
 *     measured defaults, nothing tuned — the budgie is the first species to
 *     declare a motion and a second bird with a wing is the second that should.
 *     It moves no vertex and does not enter the geometry fingerprint.
 *
 *   - **NO EARS**, which needs no defending on a bird, **no nose** — the bill IS
 *     the nose and `cone-06` carries the pack's own `nose` role — and **no
 *     ridge**, **no belly**, **no mouth card** and **no `stretch` of any kind
 *     anywhere on the animal.**
 *
 * ## THE PALETTE IS NEW AND NOBODY HAS SIGNED IT OFF
 *
 * `home-pets.ts` carried the word *yellow* for this bird under the old songbird
 * kit and nothing else, so the five below are the first actual colours this
 * species has ever had and every one is **UNREVIEWED**. It is the shortest
 * palette any bird here will have, and three of the five are the same hue:
 *
 *   - `coat` is the bird. Weighted by surface area it is very nearly all of it.
 *   - `flight` is that same lemon **one shade down**, worn by the wings and the
 *     tail — which are one feather tract on a real bird, so this is anatomy and
 *     not decoration. It exists because rule 8 is one hue per part and a solid
 *     wing standing 0.1529 proud in the identical colour is a bulge rather than a
 *     wing from the island's own downward camera. `animal-kiwi.ts` argues exactly
 *     this for its plumage: *a shade of the coat rather than a contrast*. **It is
 *     not a marking and must not be read as one.**
 *   - `limb` is the bill and the legs, which on a canary are the same pale pink.
 *   - `eye` is the fourth colour and it exists for one card each side, because
 *     **the eye is the only dark thing on this animal** — which is the whole of
 *     §1 restated as a palette.
 *
 * **Flagged**, for the palette, for the bill's parrot overhang, for the hull
 * chosen partly for triangles, and for the plainness itself, which is the thing
 * most likely to look like an unfinished animal and is not. Nothing else
 * strained, and one thing exactly at its limit: **405 model vertices against a
 * floor of 405 and 424 triangles against a floor of 422**, which is §1's whole
 * argument arriving as two numbers; height 1.4312 on `HEIGHT_FLOOR`; feet on
 * y = 0; keep-out 0.9511 well inside the fox's 1.15; every part joined at a face
 * of this hull; one mass, **nothing authored and not one stretch of any kind
 * anywhere.**
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/*
 * THE SOLVED CONSTANTS WERE REMOVED HERE ON 4 AUGUST — the editor's push inlined
 * their values and left them declared and unread, which fails `tsc --noEmit`.
 * Their derivations, because the numbers are still in the definition:
 *
 *   HULL_CENTRE_Y  0.80625   `box-39`'s own recorded centre — and its side and
 *   HULL_SIDE_X    0.625     rear faces are `box-03`'s to the digit, because
 *   HULL_REAR_Z   -0.625     measured they are the same solid.
 *   WING_SINK      0.5       half the wing buried, and it is `animal-budgie.ts`'s
 *                            SOLVED number rather than a copied one: `box-06`'s
 *                            tip reaches |z| = 0.456649 where this shell's flat
 *                            side face reaches only 0.312500, so the tip stands
 *                            over a surface receded by 0.144149. The shape's own
 *                            recorded 0.366259 is NOT enough; 8/16 is the pack's
 *                            own grid snapped up, burying 0.152918 — over §3's
 *                            0.125 floor — and leaving 0.152918 standing.
 */

export const CANARY_ASSEMBLY = defineCreature('animal-canary', {
  palette: {
    coat: 0xf5c81c,
    flight: 0xdcae12,
    limb: 0xe8a9a0,
    eye: 0xf9f7f5,
    pupil: PACK_PUPIL,  // the pack's own measured pupil; see texture.ts
  },

  hull: { part: 'box-39', paint: 'coat' },
  legs: false,
  eyes: { part: 'plate-08', paint: 'eye' },
  tail: {
    part: 'box-38',
    paint: 'flight',
    at: [0, 0.5375, -0.85],
    spin: [{ axis: 'x', deg: -90 }],
  },
  snout: { part: 'cone-06', paint: 'limb' },
  extras: [
    {
      name: 'leg-front',
      part: 'box-01',
      paint: 'limb',
      kind: 'pair',
      sink: 0.408163,
      at: [0.25, 0.18125, 0],
    },
    {
      name: 'wing',
      part: 'wedge-19',
      paint: 'flight',
      kind: 'pair',
      axis: 'z',
      dir: -1,
      spin: [
        { axis: 'z', deg: -90 },
        { axis: 'y', deg: -90 },
        { axis: 'z', deg: 90 },
        { axis: 'x', deg: -90 },
      ],
      sink: 0.5,
      at: [0.85, 0.8125, 0],
    },
  ],
  motion: [{ kind: 'flap', parts: ['wing'] }],
  flag: 'THIS BIRD IS DELIBERATELY PLAIN AND THAT IS THE WHOLE DESIGN — if it looks '
    + 'unfinished beside the budgie, that is the thing to judge, not a gap to fill. A '
    + 'canary has no crest, no cheek patch, no barring, no collar and no colour break '
    + 'anywhere on it, so SIX free mechanisms are refused on purpose: the painted belly '
    + 'line; box-39\'s own band 3, which is 22 triangles of the PENGUIN\'S WHITE SHIRT '
    + 'across the front face and is free two-tone on the hull this bird already wears; '
    + 'JT-044\'s two-tone foot, which the budgie spends and a canary\'s one-pink legs do '
    + 'not want; byBand on the bill, where the budgie puts its cere; all four marking '
    + 'cards; and extras of every kind — it has none at all. It reads by PROPORTION and '
    + 'COLOUR instead: 1.9023 deep by 1.5558 wide is a plan ratio of 1.223 against the '
    + 'budgie\'s 1.394, 14.5% smaller by volume, keep-out 0.9511 against 1.0986, which '
    + 'is home-pets.ts\'s "smallest, roundest" said in the only numbers this kit has. '
    + 'THE HULL IS THE PENGUIN\'S AND IT WAS PARTLY CHOSEN FOR TRIANGLES, stated '
    + 'plainly: measured against all sixty of box-03\'s face planes, box-20, box-36 and '
    + 'box-39 are that SAME SOLID (max deviation 0.000000, 0.000000 and 0.000028) cut '
    + 'into 78, 72 and 80 triangles instead of 60 — four of the pack\'s ten hull records '
    + 'are one shell, which nothing had recorded. THE PACK\'S MEASURED FLOORS (rule nine '
    + 'is a floor as well as a ceiling, and this is the animal it binds on) are 405 '
    + 'vertices and 422 triangles, and this one was built four times to find out which '
    + 'of the four cuts of that solid it can stand up in: box-03 the parrot\'s and '
    + 'chick\'s gives 383/404 and fails both, box-36 the panda\'s 399/416 and fails both, '
    + 'box-20 the fish\'s 395/422 and fails the vertex floor, and box-39 the PENGUIN\'S '
    + 'gives 405/424 and is the ONLY ONE THAT CLEARS. So it sits exactly on the vertex '
    + 'floor, 405 of 405 — which is the honest reading of what that floor is for on the '
    + 'simplest animal in the project, and not a scrape. It is also right for its own '
    + 'sake: box-03 is the parrot\'s and the chick\'s and three birds have taken it, and '
    + 'the penguin\'s was the one bird shell nobody had spent. THE BILL IS A PARROT\'S '
    + 'AND IT OVERHANGS: cone-06 is the only shape in the bank with form "cone" out of '
    + '28 noses, which is exactly what a finch\'s seed bill is, and the alternative '
    + '(tube-02, the chick\'s) is a blunt bar reaching 0.100 against this one\'s 0.183. '
    + 'The overhang, measured: split at Kenney\'s own upper/lower cut, band 15 reaches z '
    + '0.1434 and band 13 only 0.1015, so the upper mandible stands 0.0419 proud of the '
    + 'lower — 14.6% of the shape\'s depth, or 29% if you read it off the silhouette '
    + 'instead — which is where a parrot\'s hook starts. Every bird overhangs a little '
    + 'and a canary does too, so this is inside honesty, but it is the one part here '
    + 'whose donor is a different KIND of bird and you should look at it. THE WING IS '
    + 'THE BUDGIE\'S BOX-06 AT ITS OWN NUMBERS and was checked rather than copied: it is '
    + '73.1% of the body\'s depth where a live canary\'s folded wing is about 85%, so it '
    + 'is if anything short. Only 2 of the bank\'s 23 ears have an aspect over 1.5; the '
    + 'koala\'s box-25, the obvious reach for the roundest bird, is aspect 1.0000 — a '
    + 'disc, a shield rather than a wing — and animal-chinchilla.ts claims it in '
    + 'writing for this same album page. NEW PALETTE, UNREVIEWED — home-pets.ts only '
    + 'ever carried the word "yellow" for this bird. Three of the five slots are one '
    + 'hue, and the "flight" slot on the wings and tail is that lemon ONE SHADE DOWN so '
    + 'a solid wing standing 0.1529 proud reads as a wing from the island\'s downward '
    + 'camera; it is not a marking and a canary has none. Nothing was authored and '
    + 'nothing is stretched.',
})
