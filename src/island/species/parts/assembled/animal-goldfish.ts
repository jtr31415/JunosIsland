/**
 * The goldfish — Home Pets' SIXTEENTH, and the one that closes the collection.
 *
 * `home-pets.ts` never carried a record for it because the roster sends it to
 * the `swim` kit, which is declared in `types.ts` and has never been built. It
 * does not need one. Every part of a fish that this pack owns was donated by the
 * pack's own fish, and the assembly kit can place all of them — so the goldfish
 * closes on the route the slow worm and the corn snake already took, with
 * nothing invented and nothing waiting on a kit.
 *
 * With this file Home Pets is 16 of 16. `completion()` divides by ROSTER size,
 * so a collection that could never be fully built could never complete, never go
 * inactive and never release one of the four active slots JT-027 allows. Home
 * Pets has been holding one of those four permanently. It stops today.
 *
 * ## THE CARD'S PREMISE WAS HALF WRONG, AND MEASURING IT FIRST SAVED THE BUILD
 *
 * `PB-036`'s card says the bank "already has a real fish hull `box-20`". It has
 * a record the pack's fish donated as its hull, which is not the same claim.
 * Measured against `box-03`, the default cube:
 *
 *   - both are 1.250 on all three axes, both sit at `[0, 0.80625, 0]`, both have
 *     the same coordinate value set on every axis;
 *   - `box-20`'s unique point set is a strict SUPERSET of `box-03`'s — 40 points
 *     against 32, and not one of `box-03`'s is missing;
 *   - the eight extra points are `(+/-0.5, +/-0.5, +/-0.3125)`: the four vertical
 *     chamfer edges, each split once. That is a retriangulation, not a shape.
 *
 * **So `box-20` is the same chamfered cube as `box-03`, costing +18 triangles and
 * +20 vertices for no change to the silhouette.** It is still the right hull to
 * take — it is the shape this animal's own donor wore, the lineage is exact, and
 * the 18 triangles are wanted rather than wasted (see rule 9 below) — but a build
 * planned around "a fish-shaped body" would have found nothing there.
 *
 * **What actually makes Kenney's fish a fish is `box-19`**, the shell-ring, and
 * that is where this species' whole read lives.
 *
 * ## THE PACK'S OWN FISH WOULD FAIL RULE 9's FLOOR
 *
 * Worth stating plainly, because it is what shapes everything below. Kenney's
 * fish is a cube, a hoop, two eye cards and a mouth card: 78 + 92 + 60 + 12 =
 * **242 triangles against `MODEL_TRIS_MIN` 422, and 156 vertices against
 * `MODEL_VERTS_MIN` 405**. Rule 9's budget is a FLOOR as well as a ceiling —
 * `budget()` in `assembly-assert.ts` forgives a ceiling with a declared flag and
 * forgives a floor never — the floor was measured over 24 animals that all carry
 * four legs (176 triangles), and a fish carries none.
 *
 * **AND THE BINDING ONE IS THE VERTEX FLOOR, NOT THE TRIANGLE FLOOR.** That was
 * measured after the fact and it is the opposite way round from what it looks
 * like. This animal is 758 triangles and 480 vertices. Take the tail off and it
 * is 546 triangles — still clear of 422 — but 366 vertices, under 405. Take the
 * scales off instead and it is 454 triangles, again clear, but 288 vertices,
 * again under. Either part alone satisfies the triangles; **neither alone
 * satisfies the vertices**, and that is what made this a two-part answer rather
 * than a one-part one. Budget a legless species against the VERTEX floor first.
 *
 * The corn snake hit this same wall one species ago and paid it with fifteen
 * saddles. This one pays it with the two parts Kenney's fish most obviously
 * lacks and a goldfish most obviously has: **a tail, and scales.**
 *
 * ## Every number, and where it came from
 *
 *   - **The hull is `box-20`, the fish's own**, at its own recorded
 *     `[0, 0.80625, 0]`. Bottom 0.18125, top 1.43125, front face 0.625 — the same
 *     nine-hull family the cube belongs to, so the eye card, the belly fraction
 *     and the leg row would all be unchanged if it had legs. It has none.
 *
 *   - **`legs: false`, and the fin pays the 0.18125 back.** The same gate every
 *     legless species fails first: a hull with no legs has its own bottom, not
 *     the ground, as the lowest thing on it, and measures 1.250 — 0.18 under the
 *     pack's floor. The slow worm and the corn snake pay it with a coil. This one
 *     pays it with the fish's own fin ring, which is better than either, because
 *     a fish resting on its ventral fin is the animal rather than a prop.
 *
 *   - **THE FIN RING IS `box-19` AT ITS DONOR ORIENTATION, WHICH IS THE WHOLE
 *     SPECIES.** Measured off the raw positions it is an OPEN octagonal hoop, not
 *     a disc: no vertex comes near the axis, radius runs 0.65 at z = -0.26 out to
 *     0.702 across the middle and back to 0.65, with a chamfered lip at both
 *     ends. Worn upright and concentric with the body it stands 0.077 proud at
 *     the flanks and reaches above and below the back — which in one part is a
 *     dorsal fin, a ventral fin and a gill line. Kenney solved a fish with it and
 *     we are not going to solve one better.
 *
 *   - **IT IS ALSO THE TORTOISE'S RIM, AND THE TWO ARE ASSERTED APART.**
 *     `animal-tortoise.ts:142` wears this same shape spun `{ axis: 'x', deg: 90 }`
 *     — turned FLAT, into the ground plane, as a shell rim. This one is not spun
 *     at all: it stays in the plane its donor wore it in. Same shape, opposite
 *     axis, and the test says so both ways round so neither can drift into the
 *     other.
 *
 *   - **The ring's height is SOLVED, not chosen.** Its own attachment is `y +1`
 *     with the pack's recorded burial 0.945157, so it belongs on the hull's top
 *     face and its burial transfers — the axis is the donor's own, which is the
 *     one condition under which a burial means anything (see the corn snake's
 *     koala ear). Stretched on y until it stands `HULL_BOTTOM_Y` proud of the
 *     back, it reaches exactly `HULL_BOTTOM_Y` below the belly by symmetry, which
 *     puts its underside on y = 0 — the plane the feet would have stood on. The
 *     ring is therefore the hull's own 1.250 plus the leg row twice: 1.6125, and
 *     the animal measures 1.6125 tall.
 *
 *   - **The ring is halved in thickness, and rule 3 is the reason — the
 *     tortoise's own halving, unchanged.** Stretched to 1.6125 tall and left at
 *     its own 0.520 thick, the ring's bounding volume would be 1.177 against the
 *     hull's 1.953 — a ratio of 1.66, which is a second mass and is the fault
 *     that scrapped 72 animals. (The tortoise reached the same wall from the
 *     shape's own untouched 1.025 at a ratio of 1.9.) Halved to 0.260 it is
 *     0.589 and the ratio is 3.3, clear of the 3 the harness wants — and a fin is
 *     a thin thing anyway. The halving is `animal-tortoise.ts:149`'s number,
 *     reused rather than re-derived, for the reason the corn snake reused the
 *     slow worm's coil.
 *
 *   - **The eyes and the mouth are the fish's own cards, at the fish's own
 *     heights.** `plate-08`/`plate-09`, the round 0.400 x 0.400 eye rather than
 *     the oval `plate-01` sixteen species share, at the recorded y = 0.89375;
 *     and `plate-03`, the face-plate, at the recorded y = 0.686849. Both on the
 *     absolute `EYE_CARD_Z` 0.6350. A goldfish's face is a big round eye and a
 *     small round mouth, and the pack drew both.
 *
 *   - **THE TAIL IS THE LION'S, AND IT IS WHAT CARRIES RULE 9's FLOOR.** The bank
 *     has no fin, no flipper and no fluke — measured, and `docs/how-the-animals-
 *     are-made.md` §14 names that absence as the reason Ocean cannot be built at
 *     all. What it has is seven tails, and `wedge-15` is the only one nothing has
 *     spent: 0.280 across, 1.0824 tall, 0.5552 long, tapering to a half. Thin,
 *     tall and pointed backwards it is a vertical caudal fin, which is the one
 *     shape in this pack that can be. At 212 triangles and 114 vertices it is by
 *     far the heaviest part on the animal, which is the point: it takes the model
 *     from 242 to 454 in one step.
 *
 *   - **THE SCALE ROWS FINISH THE JOB, AND THEY ARE LOAD-BEARING TWICE.** Four
 *     `wedge-04` down each upper chamfer — §8's own idiom, the pack's way of
 *     making a cubic back read ROUND, which is the right thing to ask of the
 *     roundest animal in the collection. They are also what carries the vertex
 *     floor: 454 triangles and 288 vertices was still 117 vertices short, and
 *     eight scales at 24 each closes it. `wedge-04` is the corn snake's saddle
 *     shape and the pack's most-donated small wedge (bunny tooth, chick, monkey
 *     and penguin ear); the two animals share it and share nothing else, which
 *     the test asserts both ways round.
 *
 *   - **THE SCALE COUNT IS EVEN, AND THAT IS A MEASUREMENT.** An odd count puts
 *     a station at z = 0, which is exactly where the fin ring is. A part there
 *     reaches 0.782 out along the chamfer diagonal against the ring's own 0.788:
 *     it builds INSIDE the hoop, invisible, and is paid for in full. The first
 *     build did that four times over. Stations at plus or minus 0.500 and plus or
 *     minus 0.167 straddle the ring's 0.130 half-thickness with 0.037 to spare.
 *
 *   - **Where that leaves the budget:** 758 triangles and 480 vertices, inside
 *     422-951 and 405-1626.
 *
 *   - **The tail hangs at the body's own centre**, `[0, 0.80625, -0.625]`, not at
 *     the lion's recorded 1.204607. A lion's tail roots high on the rump; a
 *     fish's continues the body. Everything else about it is the donor's — its
 *     own facing, its own 0.137977 burial, no spin, no stretch.
 *
 *   - **The belly line is 6/16.** §7 measured the pack's mammal boundary
 *     wandering across 0.4808-0.5481; a fish's pale part is lower and narrower
 *     than a mammal's, and 0.375 is the nearest notch on the pack's own grid that
 *     stays clear of that zone. The same notch the slow worm took, for the
 *     unrelated reason that both animals are pale underneath and nowhere else.
 *
 * ## THE PALETTE IS NEW AND NOBODY HAS SIGNED IT OFF
 *
 * Like the corn snake's and the slow worm's, and for the same reason: this
 * species was never in `home-pets.ts` to be given colours, so the four below are
 * the first ever proposed for it and they are UNREVIEWED. They are the common
 * pet goldfish — orange body, paler orange fins, a cream underside. **Joe should
 * look at them**, and at whether the lion's tail reads as a fin at tablet
 * distance, which is a look and not a measurement. The `flag` says both where he
 * reads it, and nothing downstream treats either as agreed.
 *
 * **Flagged**, and only for that: no rule was strained. Measured on the built
 * model — 758 triangles and 480 vertices, inside 422-951 and 405-1626; height
 * 1.6125 inside 1.43-2.02, clearing the floor by 0.18; feet on y = 0 exactly;
 * keep-out 0.877 against the fox's 1.15; every part at its own measured burial or
 * at a fraction solved from the hull, and the one mass is the mass.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/* `RING_ACROSS` (1.404, `box-19`'s own measured diameter), `HULL_MID_Y`
 * (0.80625, `box-20`'s recorded centre and the same point seven other pack hulls
 * record) and `FIN_TALL` (1.6125) fed only the two constants below and went
 * unread with them. FIN_TALL was solved, not chosen: the ring is concentric with
 * the body — that is where its donor wore it — so whatever it stands proud of the
 * back it also reaches below the belly. Make that reach `HULL_BOTTOM_Y`, the
 * height the pack's legs hold every other animal up by, and the ring's underside
 * lands on y = 0: the plane this animal's feet would have stood on if it had
 * any. */

/*
 * TWO SOLVED CONSTANTS WERE REMOVED ON 4 AUGUST — the editor's push inlined their
 * values and left them declared and unread, which fails `tsc --noEmit`:
 *
 *   FIN_STRETCH_Y  1.148504  FIN_TALL / RING_ACROSS — the y stretch that takes
 *                            `box-19`'s own 1.404 to the ring's solved height
 *   FIN_SINK       0.887597  the share of its own stretched height the ring is
 *                            buried by. Joined at the hull's TOP face, which is
 *                            the face its donor's `y +1` attachment names, so the
 *                            transfer is legitimate rather than assumed: what
 *                            must stand ABOVE that plane is `HULL_BOTTOM_Y` and
 *                            the rest is buried.
 */

export const GOLDFISH_ASSEMBLY = defineCreature('animal-goldfish', {
  palette: {
    coat: 0xe8752a,
    belly: 0xf7e6c8,
    fin: 0xf2a054,
    scale: 0xc8541b,
    pupil: PACK_PUPIL,  // the pack's own measured pupil; see texture.ts
  },

  hull: 'box-20',
  belly: 0.375,
  legs: false,
  eyes: { part: 'plate-08', y: 0.89375 },
  ridge: {
    part: 'wedge-04',
    paint: 'scale',
    name: 'scale',
    count: 4,
    rows: ['chamfer'],
    span: 0.5,
  },
  extras: [
    { name: 'mouth', part: 'plate-03', paint: 'pupil', at: [0, 0.686849, 0.635] },
    {
      part: 'bespoke-triangle-01',
      name: 'bespoke-triangle-01',
      at: [0, 0.8875, -0.8],
      stretch: [1, 0.45, 0.45],
      spin: [{ axis: 'z', deg: 90 }],
    },
  ],
  flag: 'NEW PALETTE, UNREVIEWED — the first goldfish ever built, and the first colours '
    + 'ever proposed for it: nothing in home-pets.ts signed these off. And the TAIL is '
    + 'a look, not a measurement: the pack has no fin, flipper or fluke at all, so this '
    + 'is the lion\'s tail standing in for a caudal fin. Whether it reads as one at '
    + 'tablet distance is Joe\'s call.',
})
