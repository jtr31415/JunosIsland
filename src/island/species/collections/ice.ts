/**
 * The Ice collection — roster row 3, `ship: 9`, name band `medium`.
 *
 * NEW FILE, 5 August 2026. There has never been a `collections/ice.ts`; this one
 * was written on the assembly route from the first line, like Ocean and Birds
 * and unlike Woodland, Farm and Africa, which are rebuilds carrying kit-era
 * headers.
 *
 * ===========================================================================
 * ## WHAT THIS COLLECTION IS, AS A DESIGN PROBLEM: EVERYTHING IS WHITE AND
 * ## EVERYTHING HAS A TWIN
 * ===========================================================================
 *
 * Ice is the hardest roster §4 problem the project has had, and it is hard in a
 * way no earlier collection has been. Woodland's difficulty was that three
 * mustelids and two cats had to be told apart from each other. Ocean's was that
 * a whale, a shark and a dolphin are all grey legless things on a cube. **Ice
 * has both of those at once, and on top of them the whole collection is the
 * same colour.** Eight of these sixteen are white or near-white animals —
 * arctic fox, arctic hare, ermine, lemming, ptarmigan, snow petrel, snowy owl,
 * Dall sheep — which is a fact about the Arctic and not a failure of nerve, and
 * it means **palette carries almost none of the separation here**. It has to be
 * carried by shape, and shape is the thing the bank is short of.
 *
 * Every one of the sixteen collides with something already built. Counted:
 *
 *   - **arctic fox** against the FROZEN `animal-fox`, against
 *     `animal-fennec-fox` (which already wears the fox's own brush `box-23` AND
 *     `tube-01`), and against `animal-wildcat`.
 *   - **arctic hare** against the FROZEN `animal-bunny` and against
 *     `animal-hare`, whose whole argument is the bank's tallest ear.
 *   - **ermine** against `animal-stoat` and `animal-mink` — and it is worse than
 *     a resemblance, because an ermine IS a stoat in its winter coat.
 *   - **husky** against `animal-wolf`, on the same hull family and the same
 *     tail shape.
 *   - **orca, beluga and narwhal** against each other and against
 *     `animal-whale`, `animal-dolphin` and `animal-shark`.
 *   - **musk ox** against Africa's `animal-buffalo` and Farm's `animal-ox` and
 *     `animal-water-buffalo`.
 *   - **reindeer** against Woodland's `animal-elk` and the FROZEN `animal-deer`.
 *   - **dall sheep** against Farm's `animal-sheep` and `animal-goat`.
 *   - **snowy owl** against Birds' `animal-owlet`.
 *   - **ptarmigan** against Farm's five galliforms, `animal-quail` nearest.
 *   - **snow petrel** against Birds' `animal-seagull` and `animal-puffin`.
 *   - **seal and walrus** against `animal-whale` and each other.
 *   - **lemming** against six small cube rodents.
 *
 * That is sixteen of sixteen. The separations are made in the species files,
 * where the number they justify lives, and the four worth reading first are
 * named at the bottom of this header.
 *
 * ===========================================================================
 * ## THE MEASURED SURVEY — what the bank gave this collection
 * ===========================================================================
 *
 * **THE FLIPPER WAS ALREADY SOLVED AND NOBODY HAD TO RE-DERIVE IT.**
 * `docs/how-the-animals-are-made.md` §14 declared Ocean impossible for want of a
 * fin and was wrong for a week because a `wing` bake had quietly put the pack's
 * own fish fins into the bank. `collections/ocean.ts` carried that correction
 * back on 5 August, so this collection started by reading it rather than by
 * repeating the mistake: `blade-06` and `blade-07` are the penguin's wing, they
 * ARE flippers, and the seal, the walrus, the orca, the beluga and the narwhal
 * all take them without argument. **The lesson that generalised is the useful
 * one: read the last collection's header before measuring the bank yourself.**
 *
 * **THE BANK STILL HAS NO CURVE, AND ICE IS NOT THE FIRST TO SAY SO.**
 * All 100 baked shapes are straight or tapered along a single axis. Rule 4 as
 * amended bakes a ROTATION into a copy's vertices — it turns a part and cannot
 * bend one. `collections/birds.ts` priced it for the flamingo's downcurved bill;
 * `collections/ocean.ts` priced it for the seahorse's S and spiral. Ice wants it
 * three more times: a **Dall ram's spiral horn** (which is the whole animal, and
 * is why that species is the collection's one placeholder), a **musk ox's hooked
 * horn**, and a **narwhal's helical tusk**. The narwhal ships anyway, because a
 * narwhal's tusk reads as a straight spike at tablet distance; the Dall sheep
 * does not, because a ram without the curl is a white goat.
 *
 * **A DOME IS NOW WANTED BY FOUR SPECIES.** Ocean's header calls it *"the
 * clearest commission here"* for the jellyfish, the tortoise and the sea turtle.
 * `animal-beluga` is the fourth: a beluga's melon is a soft round forehead and
 * nothing among the 100 shapes is a hemisphere. What stands in is `box-25`, the
 * koala's ear, which is the only RADIAL shape of any size in the bank, spun onto
 * the crown. It is a disc rather than a dome and the file says so.
 *
 * **THE ONE-MASS RATIO IS A BUILD CONSTRAINT THIS COLLECTION HIT HARD, AND IT
 * IS WORTH WRITING DOWN ONCE.** `tests/island/assembly-assert.ts` requires the
 * hull's bounding volume to be more than **3x** the next largest mesh, and the
 * engine-wide sweep passes no per-animal escape for it. A musk ox is a curtain
 * of hair reaching the ground, and the only shape in the bank that can be one is
 * `box-29`, the lion's mane ring at 1.650 x 1.650 x 0.500 — which is 1.3612 of
 * volume against `box-41`'s 2.3693, a ratio of **1.74**. At full size the skirt
 * would BE a second mass. It is cut on DEPTH ONLY, to 0.52, giving 0.7078 and a
 * ratio of 3.35, because cutting x or y would shorten the reach to the ground,
 * which is the animal. `animal-vulture.ts` cut the same shape for the same
 * reason and cut the other two axes; the two files together are the worked
 * example of that trade.
 *
 * **THE HEIGHT BAND, BOTH ENDS.** Ocean established that a legless hull measures
 * 1.250 against the pack's 1.43 floor and that this is a norm which REPORTS
 * since Joe's ruling of 3 August. Two species here pay it — `animal-seal` at
 * 1.2813 and `animal-narwhal` at 1.3178 — and both say so. The **ceiling** bit
 * for the first time in this project: an orca's dorsal is the one fin in nature
 * that is taller than the animal is deep, and `box-06` at its own recorded
 * burial puts the animal at **2.026 against a 2.02 maximum**. Its sink is 0.25
 * for that reason and for no other, and `animal-orca.ts` records the arithmetic
 * so nobody re-tunes it to a prettier number.
 *
 * **KEEP-OUT.** `pets.ts:652` charges `max(width, depth) / 2` and Woodland's
 * header holds the ceiling at 1.6. The two widest here are the narwhal at
 * **1.294** (its tusk is charged as depth) and the Dall sheep at **1.120** (its
 * horns are charged as width). Both are inside, and both are the first thing to
 * check if either animal's signature part is lengthened by hand.
 *
 * ===========================================================================
 * ## WHAT IS NEW IN THE VOCABULARY, so the next collection can reach for it
 * ===========================================================================
 *
 *   - **`box-06` STANDS UP AS A DORSAL FIN.** Twenty-three species wear the
 *     bunny's ear as an ear or as a folded flank wing. `animal-orca` is the
 *     first to leave it unspun on its own `y +1` attachment and let it be a
 *     blade — 0.913 of reach, 1.52x the `wedge-19` every other cetacean stands
 *     on its crown. §3.1's multiplier, paid out on the largest shape in the ear
 *     family.
 *   - **`box-29` REACHES THE GROUND.** The vulture wears the lion's mane as a
 *     collar; the musk ox wears it as a skirt, by moving its centre down to the
 *     hull's own and cutting only its depth. A ring is a garment, and where on
 *     the body it sits is what it is a garment of.
 *   - **A TWO-SEGMENT HORN, CHAINED WITH `on`.** `animal-buffalo.ts`'s flag ends
 *     with an experiment it did not run: *"a second shorter pair of wedge-13
 *     spun up at the outer end of the first, hung off the horn with `on`."*
 *     `animal-dall-sheep` runs it. Two chords meeting at 70 degrees is a bent
 *     line and not a spiral, and whether it reads at all is the thing on the
 *     bench — but the mechanism works and the anchor is exact, so a third
 *     segment costs 38 triangles and one entry.
 *   - **AN EAR TIP HUNG ON AN EAR.** `animal-arctic-hare` puts a `cone-01` on
 *     `on: 'ear'`, so the black tip travels with the ear rather than with a
 *     coordinate. `box-06` is a single band and cannot be painted into, so this
 *     is the only way to say "black-tipped ear" at all.
 *
 * ===========================================================================
 * ## ONE PLACEHOLDER, AND WHY ONLY ONE
 * ===========================================================================
 *
 * Joe, 5 August: *"put something in for the unbuildable ones anyway so i can do
 * it manually. if there is no entry at all, i cant do that."* So every one of the
 * sixteen is a full entry — file, index line, record, `MOVES`, both ledger rows.
 * **Fifteen are real animals. `animal-dall-sheep` is a placeholder** and its own
 * first header line says so, names the missing shape (a curl), gives the
 * measurement that proves it (all 100 shapes straight or single-axis tapered),
 * says what is standing in (two chained straight segments) and what to try first
 * (a third segment on `on: 'horn-tip'`).
 *
 * Two other animals strain a rule without being placeholders, and both are
 * flagged where Joe reads: **`animal-musk-ox`** wants the same curve for its
 * horn hook and gets a straight droop instead — exactly the compromise
 * `animal-buffalo` shipped with in Africa — but its skirt carries the animal, so
 * it is built. **`animal-narwhal`** stretches `wedge-11` 3.2x along its own long
 * axis, which is the largest stretch in the collection and is named rather than
 * hidden.
 *
 * ===========================================================================
 * ## THE FOUR SEPARATIONS TO LOOK AT FIRST
 * ===========================================================================
 *
 *   1. **husky against wolf.** Same shape of tail (`box-38`), trailing on one
 *      and carried up the rear chamfer on the other. If the two still twin, that
 *      is the dial, and it is a one-word change.
 *   2. **ermine against stoat.** These are one animal in two coats and the file
 *      says so rather than pretending. The shape separations are a thicker rope
 *      tail (`wedge-15` against `wedge-18`), a full cube against the stoat's
 *      shallow `box-31`, and no belly line at all.
 *   3. **arctic fox against fennec fox.** The brush is refused and the muzzle is
 *      shared. Whether refusing the brush was right is the question.
 *   4. **beluga against narwhal.** Deliberately the same build twice, the way
 *      the mink and the stoat are, with the tusk and the mottling as the whole
 *      difference — because in life that is the whole difference.
 *
 * ## WHY THERE ARE NO `threat` RECORDS
 *
 * Roster §5 wants statuses "true, checkable", and `Threat.checkedDate` exists so
 * a status is a dated reading of the Red List rather than a memory. Writing
 * categories here from recall would produce records that LOOK checked. Absent
 * means "not recorded yet", which is honest — and it matters in this collection,
 * because several of these animals genuinely are listed and one of them is the
 * animal every child associates with a melting world.
 */
import { defineSpecies } from '../define'
/*
 * Evaluated for its SIDE EFFECT, not for a name: each species module under
 * `parts/assembled/` registers its own build as it defines it, and
 * `defineSpecies` picks that up by id. Without this line every record below
 * would find no assembly and would build as a bare hull.
 */
import '../parts/assembled'
import type { Species } from '../types'

/**
 * ALL SIXTEEN. Fifteen are real animals and one — the Dall sheep — is a
 * PLACEHOLDER that says so in the first line of its own file and in its `flag`.
 * A placeholder is not promoted into the built count to make the number look
 * better; the survey above prices it.
 *
 * IN ROSTER ORDER, which is the order `roster.ts:181-186` lists them and the
 * order the album shows them. A collection whose file order disagrees with its
 * roster order is a trap `species-garden.test.ts:149` already exists to catch,
 * so a member arriving later is INSERTED at its rostered place, never appended.
 *
 * Every record below is one line. The reasoning for a species' SHAPE lives in
 * its own `parts/assembled/animal-<id>.ts`, beside the number it justifies —
 * and for the placeholder, so does the price of finishing it, because that is
 * where the person doing it by hand will be reading.
 */
export const ICE_SPECIES: readonly Species[] = [

  /* Four `blade-06` and no legs — the only species in the project to spend the
   * penguin's flipper four times, and the hind pair is what is not a whale. */
  defineSpecies('animal-seal', 'bespoke'),

  /* The seal on the biggest shell, with tusks and a whisker pad on geometry
   * `box-41` already carries. The tusks are the one stretch. */
  defineSpecies('animal-walrus', 'bespoke'),

  /* Refuses the fox's brush, which the fennec already wears, and takes the
   * POLAR BEAR's round button ear — the smallest ears of any fox. */
  defineSpecies('animal-arctic-fox', 'bespoke'),

  /* The second antlered animal, and the rack is two SHAPES at angles that
   * straddle the vertical, where the elk's is one shape leaning back twice. */
  defineSpecies('animal-reindeer', 'bespoke'),

  /* `animal-owlet` inside out: no tufts, the round card instead of the biggest,
   * and four charcoal cards doing the silhouette a white bird has not got. */
  defineSpecies('animal-snowy-owl', 'bespoke'),

  /* The wolf's own tail shape CARRIED UP the rear chamfer instead of trailing.
   * One shape, two animals, told apart by placement. */
  defineSpecies('animal-husky', 'bespoke'),

  /* The bunny's ear standing on a whale's back, and the collection's one animal
   * held down by the pack's height CEILING rather than its floor. */
  defineSpecies('animal-orca', 'bespoke'),

  /* The hare's own ear cut to 0.55, with black tips hung `on: 'ear'` because
   * `box-06` is a single band and cannot be painted into. */
  defineSpecies('animal-arctic-hare', 'bespoke'),

  /* The lion's mane worn as a SKIRT reaching the ground, cut on depth only
   * because the one-mass ratio pays for the reach. */
  defineSpecies('animal-musk-ox', 'bespoke'),

  /* The rodent separated by subtraction — buried ears, no belly line, a stub —
   * plus the pale collar it is actually named for. */
  defineSpecies('animal-lemming', 'bespoke'),

  /* The only whale in the world with no dorsal fin, and the absence is the
   * design. The melon is the fourth species asking Ocean for a dome. */
  defineSpecies('animal-beluga', 'bespoke'),

  /* The beluga twice over, with a tusk and a mottling. The tusk is straight
   * because the bank holds no helix, and it is the largest stretch here. */
  defineSpecies('animal-narwhal', 'bespoke'),

  /* The galliform idiom in white, separated from the quail by two red brow
   * cards, a black tail, and a leg that is NOT split for a scaly foot. */
  defineSpecies('animal-ptarmigan', 'bespoke'),

  /* A stoat in its winter coat, which is what the word means, and the file says
   * so rather than inventing a shape difference. */
  defineSpecies('animal-ermine', 'bespoke'),

  /* PLACEHOLDER — the bank holds no curve and a Dall ram is a spiral horn. What
   * is here runs `animal-buffalo.ts`'s own suggested two-segment experiment. */
  defineSpecies('animal-dall-sheep', 'bespoke'),

  /* The plainest animal in the project, and its whole design is the bank's
   * SMALLEST eye card on a bird with no markings at all. */
  defineSpecies('animal-snow-petrel', 'bespoke'),
]
