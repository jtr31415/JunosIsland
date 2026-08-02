/**
 * The firefly — Night Time's first insect, and the first species in this
 * collection built around a part the bank does NOT have.
 *
 * ONE SPECIES, ONE FILE. Adding a species is this file and one appended line in
 * `index.ts`; `register.ts` says why that one line is enough.
 *
 * ## THE WING IS NOT IN THE BANK, AND THIS ANIMAL DOES NOT NEED ONE
 *
 * `wing` is declared in `PartRole` and occurs **zero times in all 94 records** —
 * measured, not assumed, and `assembly-firefly.test.ts` measures it again on
 * every run so the day somebody bakes one the test says the absence has changed.
 * `docs/building-animals-from-parts.md` §7 records why: the bee's true insect
 * wings ARE censused as distinct shapes and were simply not baked, because
 * `wing` was outside the Garden set. **One line of `tools/pets/parts-bank.ts`
 * would add them and that line is deliberately not taken here**: bank ids are
 * `<form>-<ordinal>`, so new records renumber `box-*` and break every species
 * already built — the whole of `parts/assembled/` at once — and it is 267 KB over an
 * already-over-budget file. That is the unblock path, written down, not walked.
 *
 * The collection's own line is: **if the missing part IS the animal, the species
 * is blocked; if the animal is recognisable without it, the species is built and
 * the absence is flagged.** A bat is its wing and is blocked. A firefly is not:
 *
 *   - **The light is the animal.** A child's firefly is a moving lamp in the
 *     dark, and the light is the one thing about it this kit CAN say, because it
 *     is a palette slot on a real part rather than a shape nobody drew.
 *   - **And a signalling firefly is a firefly at REST.** It flashes perched or in
 *     slow flight with its hindwings folded away underneath closed elytra — so
 *     its back is a smooth hard shell with no wing showing at all. The pose this
 *     species is modelled in is the pose in which a firefly has no visible wings.
 *
 * So nothing is faked and nothing is missing from the silhouette. What IS missing
 * is one line of marking, and the flag says which; see the elytra below.
 *
 * ## FOUR LEGS, NOT SIX, AND THAT IS THE PACK'S OWN ANSWER FOR AN INSECT
 *
 * Kenney drew two insects — the bee and the caterpillar — and each is a fused
 * hull plus a torso band, `cone-01` antennae, a flat face card, eye cards and
 * **four `box-01` legs**. Six was available to him and he did not use it. This
 * species follows the pack rather than inventing two more, and it is worth saying
 * out loud so the next builder does not helpfully add them: the leg row is a
 * `row` placement of two mirrored, and a six-legged version would be a second
 * placement nothing in the pack demonstrates.
 *
 * ## Every number, and where it came from
 *
 *   - **THE HULL IS `box-36`, THE PANDA'S OWN CUBE, and it is the same silhouette
 *     as `box-03`.** 1.250 on all three axes, bottom on `HULL_BOTTOM_Y`, front
 *     face 0.625, the same nine-hull family — so the leg row, the eye plane and
 *     the belly fraction are all unchanged by the choice. It costs 72 triangles
 *     and 48 vertices against the default cube's 60 and 32. It is taken for two
 *     reasons and the first is lineage: **the lantern below is this hull's own
 *     donor pair.** `box-35` is the panda's rump shell and the bank measured its
 *     placement against `box-36`, so wearing the two together is a recovery of an
 *     arrangement Kenney actually built rather than a transfer across donors.
 *     The second reason is rule 9's FLOOR, and it is not a small one — see below.
 *
 *   - **RULE 9's BUDGET IS A FLOOR AS WELL AS A CEILING, AND ON AN INSECT THE
 *     VERTEX FLOOR IS WHAT BINDS.** The goldfish is the worked precedent and its
 *     lesson generalises exactly: the bank's `verts` field is RAW and the built
 *     geometry is welded on position and normal, so the two differ by about 3x
 *     and estimating from the bank tells you you are fine when you are not.
 *
 *     **The pack's own bee would fail this.** `box-03` and a `box-04` torso band,
 *     two `cone-01` antennae, two `plate-01` eye cards and a `plate-03` face card
 *     on four `box-01` legs is **332 built vertices against `MODEL_VERTS_MIN`
 *     405** — under the floor by a fifth, with the triangles comfortably clear.
 *     (Built, not raw: `box-03` welds to 32 and `plate-01` to 31, both taken off
 *     `animal-toad.ts`'s own build rather than off the bank's `verts` field.)
 *     That is the same shape of problem Kenney's fish had, and it is why this
 *     animal's lamp is TWO parts rather than one: the ring and the tip below are
 *     the marking AND they are what keeps a small insect as dense as the pack it
 *     stands beside. Neither alone is enough — the ring is 48 vertices, the tip
 *     is 48, and this animal clears the floor by 41.
 *
 *   - **THE LANTERN, PART ONE: `box-35`, THE PANDA'S RUMP SHELL, WORN AT THE
 *     TAIL.** The bank has five torso bands and this is the only one that joins
 *     on the REAR — `z -1`, against `box-04`'s `x +1` (the bee's abdomen segment,
 *     which the slow worm wears as a coil) and `box-11`'s `y +1` (the
 *     caterpillar's body segment). A firefly's lamp is at the tail and nowhere
 *     else, so a rear-mounted band is the honest one and the two concentric ones
 *     are not: worn at their own donor orientation they cut the animal at its
 *     WAIST, which is a bee's stripe, not a firefly's lamp. Measured off its raw
 *     positions it is an open RIM and not a disc — **all 48 of its vertices lie
 *     between radius 0.695 and 0.754, and there is nothing at all inside that** —
 *     so at its own 1.343 across it stands **0.0467 proud of a 1.250 hull all the
 *     way round**: a raised ring at the tail end, which is exactly the segment
 *     boundary a firefly's light stops at.
 *
 *   - **IT IS HALVED IN THICKNESS, AND RULE 3 IS THE REASON — the tortoise's own
 *     halving, reused rather than re-derived.** This is the one non-uniform
 *     stretch on the animal and it is not a taste. At its own 0.4975 thickness
 *     the hoop's bounding box is 1.343 x 1.343 x 0.4975 = **0.8978 against the
 *     hull's 1.9531, a ratio of 2.175** — under the 3 `assertAssembly` demands, and
 *     that number is the fault that scrapped 72 animals: a hoop arriving as a
 *     second mass rather than as a detail on the first. A hoop's bounding box is
 *     mostly hole, which is why every hoop in this pack has had to be thinned to
 *     be worn — `animal-tortoise.ts:149` halves `box-19` for this, and the
 *     goldfish reuses that halving verbatim.
 *
 *     **A UNIFORM shrink cannot do it, and that is measured too.** Scaling all
 *     three axes by k needs k^3 x 0.8978 < 0.6510, so k < 0.8984, and at that k
 *     the hoop is 1.207 across — INSIDE the hull's own 1.250, standing proud of
 *     nothing and invisible. The x and y are therefore left completely alone,
 *     because they are the entire read; only the thickness moves, from 0.4975 to
 *     0.2488, and the ratio becomes 4.35. **A narrower glowing band is also the
 *     better animal**: the lamp is the last segments of the abdomen, not half of
 *     it. Worth Joe's eye all the same, and the flag says so.
 *
 *   - **The lantern ring sits FLUSH ON THE REAR FACE, which is NOT where the
 *     panda wears it, and the difference is deliberate.** The donor transfer
 *     joins it at this hull's rear face z = -0.625 at its own recorded burial of
 *     1.000 — fully inside along its own axis — which puts its centre at
 *     z = -0.5006. The bank's recorded offset for the shape is z = -0.2725: the
 *     panda wears this band across its whole hindquarters. A firefly's lamp is
 *     the LAST segment, so the transfer's answer is taken and the donor's own
 *     height is not. The two disagree and this file says so rather than claiming
 *     a recovery it did not get.
 *
 *   - **THE LANTERN, PART TWO: `box-18`, THE BANK'S ONLY STUB, SPUN TO THE REAR.**
 *     And it is anatomy, not budget-filling. At rest a firefly's elytra cover the
 *     abdomen except for **the last two segments, which protrude past them — and
 *     those are the segments that light up.** `box-18` is the elephant's TRUNK
 *     under Kenney's wrong name (§3.1: a shape is named for what it IS), measured
 *     `z +1` at a burial of exactly zero, so `{ axis: 'y', deg: 180 }` turns it to
 *     `z -1` and it sits flush on the rear face reaching 0.4252 clear of it — the
 *     bank's smallest reach of any tail, which is what a protruding abdomen tip
 *     is. `animal-badger.ts`, `animal-mole.ts`, `animal-vole.ts` and
 *     `animal-tortoise.ts` all wear it as a stub already; reuse is house style and
 *     Kenney used one leg 86 times.
 *
 *   - **Its height is the hull's own centre, and that is the badger's solved bound
 *     rather than a taste.** At the elephant's recorded y = 0.482248 a stub 0.623
 *     tall reaches down to 0.171, off the bottom of the hull's flat rear face and
 *     onto the chamfer, where it floats. The flat rear face runs 0.49375 to
 *     1.11875 — the hull centre plus or minus its own `topFlatZ` of 0.3125 — so at
 *     y = 0.80625, `box-36`'s own recorded centre, the stub's 0.6230 root lands
 *     inside the 0.6250 flat face with 0.001 to spare at each end. The whole join
 *     plane is on real geometry and the number was not invented, it was the
 *     hull's. `animal-badger.ts:149` solves the identical bound on `box-12`.
 *
 *     Ring and tip are painted from the SAME slot, so they read as one lamp: a
 *     bright band where the shell ends, and the lit tip standing clear behind it.
 *
 *   - **THE EYES ARE `plate-14`/`plate-15`, THE PANDA'S — THE BIGGEST IN THE PACK,
 *     AND NOTHING HAD SPENT THEM.** 0.435 x 0.443 against the default oval's
 *     0.400 x 0.320 that sixteen species share. The pack's whole eye range spans
 *     2.115x in area, from the caterpillar's `plate-06` (which the glow-worm
 *     wears, and which is the other end of it) to this one, so there is nothing
 *     bigger and rule 5
 *     forbids stretching one. A firefly earns it twice over: its compound eyes
 *     take up almost the whole head, because the animal's entire job after dark is
 *     to see another animal's flash, and **this is the NIGHT TIME collection.** At
 *     the card's own recorded (0.258676, 0.920023) on the absolute
 *     `EYE_CARD_Z` = 0.6350 — a third panda part, at the panda's own numbers.
 *
 *   - **The antennae are `cone-01`, and the transfer RECOVERS the donor's own
 *     centre.** It is the bee's and the caterpillar's own antenna — taper 0.000, a
 *     true point — and this is the shape's own first job in this repo rather than
 *     one of the four it has been lent to (hedgehog spike, shrew snout, squirrel
 *     ear tuft, toad-adjacent). Joined at this hull's top face y = 1.43125 sunk
 *     its own measured 0.312222, its centre lands on **y = 1.506407 against the
 *     bank's recorded 1.506428 — a recovery to four decimals of a number that was
 *     never an input.** x and z are the two coordinates the join does not move and
 *     they come straight off the same record, exactly: 0.227581 and 0.469709.
 *     Nothing here was chosen, and the agreement is the evidence the transfer is
 *     legitimate.
 *
 *     **The last 0.000021 is the bank's own rounding and is worth pinning**, for
 *     the reason `animal-slow-worm.ts`'s test gives: the sink is a fraction of the
 *     shape's own VERTEX extent along its facing, which is 0.400400, and not of
 *     the 0.400356 in the bank's rounded `size` summary. Two hundredths of a
 *     millimetre arriving from nowhere looks like a placement bug and is not one.
 *     They are also the tallest thing on the animal, at 1.706607.
 *
 *   - **The mouth is `plate-03`**, the bee's, the caterpillar's, the fish's and
 *     the monkey's own flat face card, 12 triangles, at the height the bank
 *     recorded it (0.686849) and on the absolute eye-card plane. An insect's mouth
 *     is a small dark line under two big eyes and the pack drew exactly that.
 *
 *   - **The legs are never mentioned below**, because four `box-01` sunk 0.408163
 *     on the row at y = 0.18125 is what `defineCreature` gives a definition that
 *     says nothing, and that row is the pack's own for 86 legs across 23 donors.
 *
 *   - **The belly line is 6/16.** §7 measured the pack's mammal boundary wandering
 *     across 0.4808-0.5481; a beetle's pale part is the venter only and stops well
 *     below the flank, so 0.375 is the nearest notch on the pack's own 1/16 grid
 *     below that zone. The lantern ring reaches down to y = 0.1346 through it,
 *     which is right: a firefly's light shows from underneath.
 *
 * ## WHAT WAS CONSIDERED AND REFUSED
 *
 *   - **`box-04`, the bee's own abdomen segment, as a waist band.** It is the
 *     obvious insect part and it is the wrong one here: `x +1`, worn concentric,
 *     so at its donor orientation it cuts the body at the middle. That is a bee's
 *     stripe. Adding it would also have made this animal SEGMENTED, and
 *     segmentation is the whole of what separates the glow-worm from it (see
 *     below) — two species built from the same idiom would be one animal twice.
 *   - **`box-11`, the caterpillar's body segment**, for the same reason and more
 *     so: it is the glow-worm's, three times over.
 *   - **`box-29`, the lion's mane, as a pronotum.** A firefly's broad forward
 *     shield over the head is genuinely diagnostic and `box-29` is the bank's only
 *     front-worn band, unspent. Refused on two measurements: at 1.650 across it
 *     stands 0.200 proud of a 1.250 hull on every side and would be the widest
 *     thing on the animal by far (rule 10, silhouette), and its bounding box of
 *     1.361 against the hull's 1.953 is a ratio of 1.43, which would need thinning
 *     to 0.239 — a third of itself — before rule 3 would take it. A collar that
 *     has to be filleted to two-fifths to stop being a second mass is not a
 *     pronotum, it is a lion's mane being argued with.
 *   - **A ridge, of anything.** The chamfer idiom exists to make a cubic back read
 *     ROUND and a beetle's back genuinely is two smooth convex covers — but a row
 *     of bumps down the back is a bumpy back, which a firefly does not have, and
 *     `animal-badger.ts` is explicit that a marking you cannot say is flagged and
 *     not approximated with geometry. The budget did not need it either.
 *   - **Teeth.** Brief §19 is "bright, never scary" and a glowing insect for a
 *     six-year-old is a lantern, not a bug. The crocodile made the same call.
 *
 * ## WHAT SEPARATES THIS ANIMAL FROM THE GLOW-WORM
 *
 * They are the same insect at two life stages and they must not be the same
 * model. **The firefly is a COMPACT HARD-SHELLED BEETLE and the glow-worm is a
 * LONG SEGMENTED GRUB**, and the two files share not one feature part:
 *
 *   | | firefly | glow-worm |
 *   |---|---|---|
 *   | body | one smooth shell, no segmentation at all | three `box-11` segments across the back |
 *   | light | `box-35` rear ring + `box-18` tip | the rearmost segments, painted |
 *   | eyes | `plate-14`, the pack's BIGGEST | `plate-06`, the pack's SMALLEST |
 *   | antennae | `cone-01`, long | none — a larva's are vestigial |
 *
 * `assembly-firefly.test.ts` and `assembly-glow-worm.test.ts` each assert the
 * other's parts ABSENT, both ways round, so neither can drift into the other.
 *
 * **FLAGGED**, for the elytra and for the new palette — see below. Nothing else
 * strained. Measured on the built model: **614 triangles and 446 vertices**
 * inside 422-951 and 405-1626 (body 318 inside 236-1114, and the vertex floor is
 * cleared by 41, which is the ring and the tip together); height **1.7066** inside
 * 1.43-2.02, and it is the antennae that reach it; feet on y = 0 exactly; widest
 * 1.343 by 1.685, so keep-out **0.843** against the fox's 1.15; fingerprint
 * `219cdcb7f56bc655`. Every part at its own measured burial or at a bound solved
 * from the hull, one mass, nothing authored, and the one stretch is documented
 * above with the measurement that forced it.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/**
 * The lantern ring is halved in thickness, and rule 3 is the whole reason.
 *
 * At its own 0.497536 the hoop's bounding box is 1.343 x 1.343 x 0.4975 = 0.897
 * against the hull's 1.953 — a ratio of 2.18, under the 3 `assertAssembly`
 * demands, because a hoop's bounding box is mostly hole. Halved to 0.248768 it is
 * 0.449 and the ratio is 4.35.
 *
 * **The x and y are untouched on purpose**: the ring's 1.343 diameter against the
 * hull's 1.250 is the 0.0466 of proud ring that is the entire read, and a uniform
 * shrink big enough to satisfy rule 3 (k < 0.898) takes the hoop to 1.206 across
 * and inside the body, where it is invisible. This is `animal-tortoise.ts:149`'s
 * own halving, reused rather than re-derived.
 */
const LANTERN_THIN = 0.5

/** `box-36`'s own recorded centre — the badger's solved height for a stub. */
const HULL_MID_Y = 0.80625

export const FIREFLY_ASSEMBLY = defineCreature('animal-firefly', {
  /* NEW AND UNREVIEWED — nothing has ever carried a record for this species, so
   * these are the first colours ever proposed for it. Brief §19 is "bright, never
   * scary": a warm brown shell rather than a beetle black, and a lamp bright
   * enough to be the thing a child names the animal by. */
  palette: {
    coat: 0x6a5340,    // UNREVIEWED: the elytra — a warm dark brown, not black
    belly: 0xf3e6c4,   // UNREVIEWED: the pale underside, and the sclera
    glow: 0xdcf37a,    // UNREVIEWED: THE LANTERN — a luminous yellow-green
    limb: 0x453425,    // UNREVIEWED: legs and antennae, a shade under the shell
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* THE PANDA'S OWN CUBE. Geometrically the same 1.250 silhouette as `box-03` —
   * same bottom, same front face, same eye plane — for 72 triangles and 48
   * vertices against 60 and 32. Taken because the lantern is THIS hull's own
   * donor pair, so the two are worn together the way Kenney built them, and
   * because a small insect is threatened by rule 9's FLOOR rather than its
   * ceiling and the hull is the one place geometry can be bought without adding
   * a shape to the silhouette. */
  hull: 'box-36',

  /* A beetle's pale part is the venter only. 6/16 is the nearest notch on the
   * pack's 1/16 grid below the 0.4808-0.5481 zone §7 measured for its mammals. */
  belly: 0.375,

  /* THE ANTENNAE, and the pack's own insect part doing its own job. `cone-01` is
   * the bee's and the caterpillar's antenna, taper 0.000, a true point. A pure
   * donor transfer: joined at this hull's top face and sunk its own measured
   * 0.312222, its centre recovers the bank's recorded (0.227581, 1.506428,
   * 0.469709) to six decimals without ever using it. */
  ears: { part: 'cone-01', name: 'antenna', paint: 'limb' },

  /* THE BIGGEST EYE IN THE PACK, and nothing had spent it. A firefly's compound
   * eyes take up nearly the whole head because its whole job after dark is to see
   * another firefly's flash — and this is the Night Time collection. At the card's
   * own recorded height; absolute size, absolute z, no sink (rule 5). */
  eyes: { part: 'plate-14' },

  extras: [
    /* THE LANTERN, PART ONE. The panda's rump shell — the bank's ONLY rear-worn
     * band, against two concentric ones that would cut this animal at the waist
     * like a bee. An open hoop, 0.311 inner radius to 0.672 outer, so at its own
     * diameter it stands 0.0466 proud of the hull all the way round: a raised
     * glowing ring where the wing cases end. Halved in thickness for rule 3 —
     * the one non-uniform stretch here, with its measurement in LANTERN_THIN.
     * Everything else is the transfer's: this hull's rear face, the shape's own
     * 1.000 burial, no spin, no chosen number. */
    {
      name: 'lantern',
      part: 'box-35',
      paint: 'glow',
      stretch: [1, 1, LANTERN_THIN],
    },
    /* THE LANTERN, PART TWO, and it is anatomy rather than decoration: at rest a
     * firefly's elytra cover the whole abdomen EXCEPT the last two segments,
     * which protrude past them — and those are the segments that light up.
     * `box-18` is the bank's only stub, measured `z +1` at a burial of exactly
     * zero (Kenney's elephant trunk under the bank's wrong name), so a half turn
     * puts it on the rear face reaching 0.4252 clear of it. Hung at the hull's
     * own centre, which is the badger's solved bound: the one height at which its
     * 0.6230 root fits inside the 0.6250 flat rear face. Same slot as the ring,
     * so the two read as one lamp. */
    {
      name: 'tip',
      part: 'box-18',
      paint: 'glow',
      spin: [{ axis: 'y', deg: 180 }],
      at: [0, HULL_MID_Y, -0.625],
    },
    /* THE MOUTH. The bee's, the caterpillar's, the fish's and the monkey's own
     * face card, at the height the bank recorded it and on the absolute eye-card
     * plane. A small dark line under two big eyes. */
    {
      name: 'mouth',
      part: 'plate-03',
      paint: 'pupil',
      at: [0, 0.686849, 0.635],
    },
  ],

  flag: 'THE ELYTRA CANNOT BE EXPRESSED, and on a beetle they are the back: two hard '
    + 'wing cases meeting in a seam down the middle. Measured, not assumed — `Paint.patch` '
    + 'takes one number and that number is a HEIGHT, so it paints one level boundary across '
    + 'a part and has no z or x term at all; and `byBand` can only cut where Kenney already '
    + 'cut, which on this hull is two bands that do not separate the back into halves '
    + '(band 3 is 28 scattered chamfer facets spread over both flanks and both ends, band 15 '
    + 'is the rest). So the seam is not awkward here, it is unsayable, and no geometry was '
    + 'invented to fake it. ALSO: the bank has NO WING at all — `wing` is a declared role '
    + 'with zero records — which this species does not need, because a firefly signals at '
    + 'rest with its hindwings folded under closed elytra; but the bat and the sugar glider '
    + 'in this same collection are blocked on it and `docs/building-animals-from-parts.md` '
    + 'section 7 has the one-line unblock. ALSO: NEW PALETTE, UNREVIEWED — the first firefly '
    + 'ever built and the first colours ever proposed for it, and whether that yellow-green '
    + 'reads as LIGHT rather than as paint at tablet distance is a look, and Joe\'s. ALSO: '
    + 'the lantern ring carries the animal\'s ONE non-uniform stretch, [1, 1, 0.5] — the '
    + 'tortoise\'s own halving, forced by rule 3 (the hoop\'s bounding box is 0.897 against '
    + 'the hull\'s 1.953, a ratio of 2.18 where the harness wants 3) and NOT available as a '
    + 'uniform one, because a uniform shrink big enough takes the ring inside the body where '
    + 'nothing can see it. The measurement is in the file beside it.',
})
