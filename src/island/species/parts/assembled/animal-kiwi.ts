/**
 * The kiwi — Night Time's second bird, and the one whose whole animal is a shape
 * the bank does not contain.
 *
 * ONE SPECIES, ONE FILE. `register.ts` says why the one appended line in
 * `index.ts` is the whole of the wiring.
 *
 * ## THE WING QUESTION, AND WHY IT IS NOT A QUESTION HERE
 *
 * The `wing` role is declared in `bank.generated.ts`'s `PartRole` union and
 * occurs **ZERO times** in all 94 records, alongside `horn` and `claw`. That
 * absence keeps the ostrich and the vulture off `africa.ts` and the bat and the
 * sugar glider off `night-time.ts`, and it is not overturned here.
 *
 * **A kiwi is the one bird in the roster the absence costs nothing at all.** It
 * is famously, structurally wingless: what it has are vestigial stubs a few
 * centimetres long, buried under hair-like plumage and invisible on a living
 * bird. There is no wing to draw and drawing one would be wrong. So this species
 * is not built in spite of the gap — the gap is the animal, and it is the
 * clearest possible case of the line `night-time.ts` draws: *if the missing part
 * IS the animal, the species is blocked; if the animal is recognisable without
 * it, the species is built and the absence is flagged.*
 * `tests/island/assembly-kiwi.test.ts` MEASURES the absence rather than
 * asserting it, so the day somebody banks a wing shape the test says the
 * absence has changed.
 *
 * ## What this animal has to say
 *
 * Three things, and the third is the whole of the work: **no tail at all**;
 * **two stout wide-set legs**; and **a very long slender bill**. Nothing in the
 * bank is a long slender bill, so it is made out of two shapes that are, chained
 * front to back — and it is made **with no stretch of any kind**, which is the
 * result worth reading this file for.
 *
 * ## THE BILL, WHICH IS THE ONLY HARD PROBLEM HERE
 *
 * **What the bank has, measured.** The forward reach of every `z`-attached nose
 * in the bank, after its own burial: the widest is `tube-03`/`tube-06` at 0.2314
 * and the next is `box-24` at 0.200. The bank's longest forward-reaching small
 * part of any role is `box-18`, the elephant's trunk, at 0.4252 with a recorded
 * burial of zero — and **unstretched it is 0.345 wide by 0.623 TALL**, which is
 * taller than it is long. It is a muzzle block, not a bill.
 *
 * **And it cannot be turned into one.** `box-18`'s long axis is its `y`, which
 * is PERPENDICULAR to its `z +1` attachment: every spin that brings that axis
 * forward takes the attachment off the front face with it, and every spin that
 * keeps the attachment forward (about `z`) only trades width for height and
 * makes a duck's bill. That measurement is the whole reason
 * `animal-crocodile.ts` reaches for a NON-UNIFORM stretch of
 * `[1.812, 0.502, 1.000]` on this exact shape — and that stretch is one of the
 * three Joe flagged by name on 2 August. **This species does not do that.**
 *
 * **So the bill is a CHAIN, and every number in it is the pack's own:**
 *
 *   1. **`tube-02`, the chick's and the penguin's own BEAK, as the root.**
 *      Placed by the donor transfer alone — joined at this hull's front face
 *      z = 0.625, sunk its own measured 0.500 (half of it is meant to be buried)
 *      — so its centre lands on **z = 0.625, the bank's recorded offset for the
 *      shape to the digit**, and its height on the shape's own y = 0.72775. It
 *      is 0.460 wide and stands 0.100 proud: a broad root, which is what a
 *      kiwi's bill has where it meets the face.
 *
 *   2. **`cone-01`, the bee's and the caterpillar's ANTENNA, as the shaft — spun
 *      to point forward and anchored on the beak's own front plane.** It is 0.160
 *      wide by 0.4004 LONG and tapers to 0.000, a true point. `{ axis: 'x',
 *      deg: 90 }` takes its `y +1` facing to `z +1`, which puts its long axis
 *      forward and leaves it 0.160 across — **an aspect of 2.5 : 1, and the only
 *      thing in the bank that is genuinely slender.** §3.1 is the argument for
 *      using it: `animal-hedgehog.ts` wears this shape as a quill and
 *      `animal-shrew.ts` as a snout, because a part's identity is its placement.
 *
 *      **`on: 'snout'` is what joins them, and it is the point of that field.**
 *      The builder solves the anchor off the BEAK'S OWN BUILT VERTICES — its
 *      placed front plane, z = 0.725 — so a bill that floats or buries is a
 *      thing that cannot happen quietly. `animal-badger.ts` uses it for the same
 *      reason and says so.
 *
 *      **Its burial is `cone-01`'s own 0.312222, and the spin does NOT
 *      invalidate that.** A donor's burial only transfers if its attachment axis
 *      does, and this one is spun from `y +1` to `z +1` — so the fraction is
 *      explicitly NOT being read as a transferred attachment. It is being used
 *      as a DEPTH IN UNITS: 0.400356 x 0.312222 = **0.12503**, which is both the
 *      depth the pack itself buries this exact shape at (on the bee, on the
 *      caterpillar, on the hedgehog) and §3's own floor for an embedded part.
 *      A number that is right for two independent reasons is not a coincidence
 *      worth spending a stretch to avoid.
 *
 * **The result: a bill 0.375 long from the hull's face**, tapering from a 0.460
 * root to a true point, on an animal whose body is 1.250 deep. Against the same
 * measurement `animal-mole.ts`'s whole pointed muzzle reaches 0.183 and the
 * crocodile's STRETCHED jaw reaches 0.425. So this is within a fifth of what a
 * non-uniform stretch bought that animal, and it costs nothing.
 *
 * **NOT stretched, and it was checked rather than assumed.** No part on this
 * species carries a `stretch` of any kind, uniform or otherwise, and the test
 * pins that.
 *
 * ## THE NOSTRILS AT THE TIP CANNOT BE SAID, AND THAT IS THE FLAG
 *
 * A kiwi is the only bird in the world with its nostrils at the END of its bill
 * rather than at the base — it hunts by smell, probing leaf litter — and it is
 * the fact a child would be told about this animal. The bank has two nostril
 * dots, `plate-12` (0.080) and `plate-16` (0.1131), flat, `z +1`, sunk 0.
 * **Neither can go where they belong**, and the reason is measured and already
 * shipped: the bill's tip is a CONE'S APEX, taper 0.000, which has no width at
 * all, so a flat card hung there touches at a single point and floats
 * everywhere else. That is `animal-mole.ts`'s own refusal, verbatim, for the
 * same shape.
 *
 * Putting them at the BASE instead — where the geometry would take them happily
 * — would be worse than leaving them off, because "nostrils at the base" is what
 * every other bird has and is precisely the sentence a kiwi exists to
 * contradict. So they are not here, the flag says so, and nothing was authored
 * to fake it.
 *
 * ## Every other number, and where it came from
 *
 *   - **The hull is `box-03`, and it is THE PACK'S OWN BIRD BODY.** Not a
 *     default taken for want of a better: its fifteen donors include
 *     `parrot/body/hull` and `chick/body/hull`, so two of the pack's three birds
 *     wear this exact shell. It is also the roundest thing available once the
 *     plumage is on it — see the ridge.
 *
 *   - **NO TAIL, and the absence is a measurement.** A kiwi has none: no
 *     rectrices, no pygostyle worth the name, a rump that runs straight into the
 *     body. `tail` is simply not said, which is the only honest way to say it —
 *     and it is what lets the ridge run all the way back to z = -0.5 without
 *     colliding with anything, which is where a kiwi's plumage actually goes.
 *
 *   - **TWO LEGS, STOUT AND WIDE-SET.** `legs: false` and one mirrored `box-01`
 *     pair in `extras` — `animal-mole.ts` is the worked example — at `LEG_ROW.y`
 *     = 0.18125 and `LEG_ROW.sink` = 0.408163, the two constants that put feet
 *     on y = 0. The pack's own three birds carry `leg-front-left` and
 *     `leg-front-right` and nothing else, which is where the name comes from.
 *
 *     **A kiwi's legs are a third of its body weight and that is expressed by
 *     the STATIONS, never by a scale** — `box-01` is the pack's one leg, used 86
 *     times, and it is never resized. **x = 0.4375 is a solved bound, not a
 *     taste**: `box-01` is 0.375 across, so at 0.4375 the outer face of each leg
 *     lands on 0.625, flush with the hull's own side and not one thousandth
 *     past it. The pack's own axiom, checked over 23 of 23 animals, is that
 *     every leg sits inside the body's footprint; this is that axiom at its
 *     exact limit, and it is the same number `animal-crocodile.ts` solved for
 *     its sprawl. **z = 0 is the hull's own midline**, which is the only station
 *     a BIPED's legs can be at: two legs carry the whole animal and stand under
 *     its centre of mass, where four legs straddle it.
 *
 *   - **THE PLUMAGE IS `cone-01` AGAIN, REPEATED AND SUNK — AND IT IS SUNK
 *     ALMOST TWICE AS DEEP AS THE HEDGEHOG'S.** A kiwi's feathers are famously
 *     hair-like: coarse, shaggy, lying flat over a round body, nothing like a
 *     spine. §3.1's repeat-and-sink is Joe's own idea and §8's chamfer idiom is
 *     his too, and the only thing that separates shaggy from spiny in this
 *     vocabulary is HOW MUCH STANDS PROUD.
 *
 *     **`sink: 0.548` is §8's measured mean burial for an ear across the whole
 *     pack** — the range is 0.00 to 1.00 and 0.548 is the middle of it — against
 *     `cone-01`'s own 0.312222, which is what `animal-hedgehog.ts` uses. So this
 *     animal buries 0.2194 of each and leaves **0.1810 standing, against the
 *     hedgehog's 0.2754**. Two thirds the height, from the pack's own number
 *     rather than from a dial turned until it looked right.
 *
 *     **Two rows and not five, which is the other half of the separation.** The
 *     hedgehog runs top, both chamfers and both sides — five facings stepping
 *     through a half turn, because a hedgehog is spiny all the way round.
 *     `rows: ['top', 'chamfer']` gives three facings (0 and +/-45 degrees) and
 *     leaves the flanks bare, which is a shaggy BACK on a smooth body: fifteen
 *     copies rather than twenty, and 510 triangles rather than 680.
 *
 *     **Five to a row, and the span is solved.** The burial of 0.21942 puts the
 *     nothing-floats bound at 0.53192 (the flat face's own 0.3125 plus the
 *     depth, because the chamfer falls away 1:1), inside which the builder snaps
 *     the spacing down to the pack's own 1/16 grid — 4/16 — giving stations at
 *     0, +/-0.25 and +/-0.5. Spacing 0.250 against the shape's own 0.3286 of
 *     depth means neighbours overlap by a quarter, so a row reads as one
 *     continuous shag rather than as five separate tufts.
 *
 *     **Turned 180 degrees** (`spin: [{ axis: 'y', deg: 180 }]`), which is Joe's
 *     own instruction on the hedgehog and is right for the same reason here:
 *     `cone-01` leans FORWARD, and a half turn about y sweeps every one of them
 *     back over the rump, which is which way hair lies.
 *
 *     **Painted from its own slot, one shade under the coat.** Rule 8 is one hue
 *     per part; a kiwi is not two-tone, so the plumage slot is a shade of the
 *     coat rather than a contrast, which is what makes fifteen parts read as
 *     texture rather than as armour.
 *
 *   - **The eyes are `plate-06`/`plate-07`, THE SMALLEST CARD IN THE PACK.**
 *     0.329780 x 0.276342, the caterpillar's, against the default oval's 0.400 x
 *     0.320208 — an area of 0.0911 against 0.1281, and the bottom of a range
 *     that is only 1.44x wide. A kiwi has the smallest eye relative to body size
 *     of any bird alive: it is nearly blind, it hunts by smell and by the
 *     bristles round its bill, and its eye is a pinhead. **So this species and
 *     `animal-nightjar.ts` sit at opposite ends of rule 5's one dial — the
 *     smallest card in the pack and the biggest — which is as far apart as two
 *     birds in one collection can be put without stretching anything.**
 *
 *     **This card was UNWEARABLE until 2 August**, along with the panda's
 *     biggest, and the fix is in the shared harness rather than here:
 *     `assembly-assert.ts`'s §3 compared a built eye against the bank's
 *     `shape.size` field at four decimals, and the bank stores `positions` at
 *     FOUR decimals and `size` at SIX — so `plate-06` missed by 5.8e-5 and
 *     `plate-14` by 7.2e-5, and four of the bank's ten eye records failed an
 *     assertion about a stretch none of them had. It now says it twice, 3dp
 *     against the rounded field and EXACTLY at 4dp against the part's own
 *     referenced vertices, which is stronger than what it replaced.
 *     `animal-nightjar.ts` carries the same note from the other end.
 *
 *     **The eye cards STAY even though the animal is nearly blind** — rule 5
 *     makes the eye absolute and structural and all 24 originals carry one,
 *     which is `animal-mole.ts`'s argument for exactly this case. The small dark
 *     eye is then made in the PALETTE: the sclera painted from the plumage slot
 *     so the card reads as one dark bead with a grey glint, which is
 *     `animal-salamander.ts`'s idiom.
 *
 *   - **NO PAINTED BELLY LINE.** §4's second way is free and it is declined,
 *     which is `animal-mole.ts`'s argument arriving at the same answer: a kiwi
 *     is a uniform coarse brown top to bottom, because a flightless nocturnal
 *     ground bird has nothing to counter-shade against. The pale slots earn
 *     their place on the legs and the bill instead.
 *
 *   - **No ears**, which needs no defending on a bird.
 *
 * ## THE PALETTE IS NEW AND NOBODY HAS SIGNED IT OFF
 *
 * `night-time.ts` carries no colours for any of its thirteen, because the
 * collection has never had a record until now. The five below are the first ever
 * proposed for this species and every one of them is **UNREVIEWED**. Joe should
 * look at them; the `flag` says so where he reads it.
 *
 * **Flagged**, for the palette and for the nostrils. Nothing else strained: 571
 * model vertices inside 405-1626, 778 triangles inside 422-951, height 1.612
 * inside 1.43-2.02, feet on y = 0, keep-out well under the fox's 1.15, every
 * part joined at a face or an anchor solved off built geometry, one mass,
 * nothing authored, and **not one stretch of any kind anywhere on the animal.**
 */
import { defineCreature } from '../creature'
import { LEG_ROW } from '../hulls'
import { PACK_PUPIL } from '../texture'

/**
 * The widest a leg can stand and still be inside the body's footprint.
 *
 * `box-01` is 0.375 across, so at 0.4375 the outer face of each leg lands on
 * 0.625 — flush with `box-03`'s own side, and not one thousandth past it. The
 * pack's own axiom over 23 of 23 animals, at its exact limit.
 */
const LEG_X = 0.4375

/**
 * §8's measured mean burial for an ear over the whole pack, whose range is 0.00
 * to 1.00. Against `cone-01`'s own 0.312222 it leaves 0.1810 standing rather
 * than 0.2754 — which is the whole difference between shaggy and spiny, taken
 * from the pack's own number rather than from a dial.
 */
const PLUME_SINK = 0.548

export const KIWI_ASSEMBLY = defineCreature('animal-kiwi', {
  /* NEW AND UNREVIEWED — the first colours this species has ever had. */
  palette: {
    coat: 0x7c6349,    // UNREVIEWED: coarse hair-like brown, the ground colour
    plume: 0x5b4834,   // UNREVIEWED: the shaggy plumage, and the small dark eye
    limb: 0xb9a288,    // UNREVIEWED: the stout pale legs
    bill: 0xd8c3a4,    // UNREVIEWED: the long pale bill, root and shaft
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* No `hull` line: the builder's default IS `box-03`, and `box-03` is the
   * parrot's and the chick's own shell. Two of the pack's three birds. */

  /* NO TAIL. Not an omission — a kiwi has none, and saying nothing is the only
   * honest way to say that. It is also what lets the plumage run all the way
   * back to z = -0.5 without colliding with anything. */

  /* NO BELLY LINE. A flightless nocturnal ground bird has nothing to
   * counter-shade against; it is one coarse brown top to bottom. */

  /* THE PLUMAGE. The same shape the bill's shaft is, repeated and sunk — Joe's
   * own repeat-and-sink (§3.1) and his own chamfer idiom (§8). Buried at the
   * pack's own MEAN ear depth rather than at this shape's own, which leaves 0.181
   * standing against the hedgehog's 0.275: hair, not spines. Two rows and not
   * five, so the flanks stay smooth and only the back is shaggy. Turned 180
   * degrees to sweep every one of them back over the rump, which is Joe's own
   * instruction on the hedgehog and is which way hair lies. */
  ridge: {
    part: 'cone-01',
    paint: 'plume',
    name: 'plume',
    count: 5,
    rows: ['top', 'chamfer'],
    sink: PLUME_SINK,
    spin: [{ axis: 'y', deg: 180 }],
  },

  /* THE SMALLEST EYE IN THE PACK, the caterpillar's — a kiwi is nearly blind and
   * hunts by smell. The cards stay because rule 5 makes the eye structural
   * (animal-mole.ts's argument for a blind animal); the sclera is painted from
   * the plumage slot so it reads as one small dark bead with a grey glint. */
  eyes: { part: 'plate-06', paint: 'plume' },

  /* THE BILL, PART ONE: the chick's and the penguin's own beak as the ROOT,
   * placed by the donor transfer alone — joined at the front face, sunk its own
   * 0.500, centre recovered onto the bank's recorded z = 0.625. 0.460 across and
   * 0.100 proud, which is where a kiwi's bill meets its face. */
  snout: { part: 'tube-02', paint: 'bill' },

  /* TWO legs, and the bill's shaft. */
  legs: false,
  extras: [
    /* THE BILL, PART TWO, and the answer to this species' only hard problem: the
     * bee's antenna, turned to point forward, on the beak's OWN placed front
     * plane. 0.160 wide by 0.4004 long, tapering to a true point — the only
     * genuinely slender thing in the bank — and `on: 'snout'` makes the builder
     * solve the join off the beak's built vertices, so it cannot float or bury
     * quietly. No `sink`: the default is this shape's own 0.312222, which the
     * spin means is NOT a transferred attachment but is 0.12503 in units, both
     * the depth the pack buries this shape at and §3's own floor.
     *
     * TOTAL REACH 0.375 from the hull's face, AND NOT ONE STRETCH. The bank has
     * no long thin bill; this is two shapes that are, chained. */
    { name: 'bill', part: 'cone-01', paint: 'bill', on: 'snout',
      spin: [{ axis: 'x', deg: 90 }] },

    /* Stout and WIDE-SET, said with the stations and never with a scale: x is
     * the solved bound that puts each leg's outer face flush on the hull's own
     * side, and z = 0 is the midline a biped's legs must stand on. */
    { name: 'leg-front', part: 'box-01', paint: 'limb', kind: 'pair',
      sink: LEG_ROW.sink, at: [LEG_X, LEG_ROW.y, 0] },
  ],

  flag: 'NEW PALETTE, UNREVIEWED — night-time.ts has never carried colours for any '
    + 'of its thirteen, so these five are the first ever proposed for a kiwi. '
    + 'AND THE NOSTRILS AT THE TIP OF THE BILL CANNOT BE SAID, which on a kiwi is '
    + 'the one fact a child would be told: it is the only bird in the world whose '
    + 'nostrils are at the END of its bill rather than at the base, and it hunts by '
    + 'smell with them. The bank has two nostril dots, plate-12 (0.080) and '
    + 'plate-16 (0.1131), and neither can go there — the bill\'s tip is a CONE\'S '
    + 'APEX, taper 0.000, which has no width at all, so a flat card hung on it '
    + 'touches at a point and floats everywhere else (animal-mole.ts refuses a nose '
    + 'button on the same shape for the same measured reason). Putting them at the '
    + 'BASE, where the geometry would take them happily, would say what every OTHER '
    + 'bird is, so they are simply not here. WORTH YOUR EYE ON THE BILL ITSELF: the '
    + 'bank has no long slender bill and this one is a CHAIN — the chick\'s beak as '
    + 'a root with the bee\'s antenna spun forward onto its own front plane — '
    + 'reaching 0.375 with NO STRETCH OF ANY KIND. The crocodile solves the same '
    + 'problem with a non-uniform [1.812, 0.502, 1.000] on box-18 and reaches 0.425. '
    + 'NO WING, and on a kiwi that is not a gap but the animal: the wing role occurs '
    + 'zero times in all 94 bank records, and a kiwi is famously wingless — vestigial '
    + 'stubs under hair-like plumage, invisible on a living bird.',
})
