/**
 * The Ocean collection — roster row 4, `ship: 4`, name band `short`.
 *
 * NEW FILE, 5 August 2026. There has never been a `collections/ocean.ts`; this
 * one was written on the assembly route from the first line.
 *
 * ===========================================================================
 * ## THE PREMISE THIS COLLECTION WAS GIVEN WAS FALSE, AND MEASURING IT FIRST
 * ## IS THE MOST USEFUL THING IN THIS FILE
 * ===========================================================================
 *
 * `docs/how-the-animals-are-made.md` §14 has said since 29 July:
 *
 * > **Ocean (16)** — there is no fin, flipper or fluke in the pack. The fish's
 * > are fused into its shell.
 *
 * and §5 counts Ocean among the "64 impossible". `animal-goldfish.ts` repeats
 * it in its own words — *"The bank has no fin, no flipper and no fluke —
 * measured"* — and reached for the LION'S TAIL as a caudal fin on the strength
 * of it.
 *
 * **All of that is now false, and it is false because of a bake nobody wrote
 * down against this collection.** The `wing` role was baked into the parts bank
 * on the morning of 4 August, for the budgie. Measured off `PARTS_BANK` today,
 * the six shapes it added are:
 *
 *       box-42 / box-43   0.362 x 0.450 x 0.362   provenance `fish:wing`
 *       blade-06 / -07    0.693 x 0.200 x 0.600   provenance `bee:wing, penguin:wing`
 *       wedge-19 / -20    0.573 x 0.200 x 0.600   provenance `chick:wing, parrot:wing`
 *
 * **`box-42` and `box-43` ARE THE PACK'S OWN FISH'S FINS** — that is their
 * donor and that is their `roles` entry — and they are a handed mirrored pair
 * attaching at `x -1` and `x +1`, which is to say already placed on a flank.
 * `collections/birds.ts` names them as "the fish's fins" in passing, one
 * collection ago, while surveying something else. Nobody carried it back to
 * Ocean, because Ocean had already been declared impossible.
 *
 * §3.1 warned about exactly this: the 64-impossible figure *"was counted under
 * the assumption that a part's role is fixed by its label, and that assumption
 * is wrong."* Here the assumption was not even needed — the fin was sitting in
 * the bank under the word `wing` with the word `fish` beside it.
 *
 * **AND A PENGUIN'S WING IS A FLIPPER.** `blade-06` needs no reinterpretation
 * at all to be a sea turtle's limb or a whale's pectoral; it is the one part in
 * this collection that arrives already being the thing it is asked to be.
 *
 * **So the honest count is: sixteen of sixteen have an entry, twelve of them
 * are real animals, and the four that are not are held up by a DOME, a CURVE
 * and a CLAW — none of which is a fin.**
 *
 * ===========================================================================
 * ## WHAT A FISH COSTS, MEASURED — the three tolls every member pays
 * ===========================================================================
 *
 * **1. THE LEGLESS HEIGHT TOLL.** A hull with no legs has its own bottom as its
 * lowest point and measures 1.250 against the pack's 1.43 floor. Every legless
 * species in the project pays it: the slow worm and the corn snake with a
 * `box-04` coil, the goldfish with a fin ring. Here the whale pays it with a
 * dorsal, the eel with the coil, and the turtle, clownfish, ray and starfish do
 * not pay it at all — they come in under and say so. **That is legitimate now
 * and was not in July:** Joe made the height band a norm that REPORTS on 3
 * August, and his own goldfish ships at 1.2500. Six of these sixteen are under
 * the floor deliberately, because flat and low is what the animals are.
 *
 * **2. LENGTH IS CHARGED FOR.** `pets.ts:652` sets keep-out to
 * `max(width, depth) / 2` and Woodland's header holds the ceiling at 1.6. Ocean
 * is the first collection where the binding dimension is WIDTH rather than
 * depth — the ray spends 1.477 on wingspan and the sea urchin 1.204 on spines,
 * against the fox's 1.15. Nothing here exceeds the ceiling; the ray is the
 * first species that has had to be checked against it rather than assumed past.
 *
 * **3. A HULL IS WORN AT ITS OWN SIZE.** `HullDef.stretch` is `never`, so no
 * animal here can be made LONG. That is the single biggest unfixable constraint
 * on this collection: a whale, a shark, a dolphin and an eel are all long
 * animals and all four are built on a shell between 1.125 and 1.5395 deep. The
 * ten hulls and what they cost are worth having in one place:
 *
 *       box-13   1.333 x 0.4506 x 1.3474   vol 0.8092   the crab — the ONLY flat one
 *       box-31   1.250 x 1.250  x 1.125    vol 1.7578   the lion
 *       box-03/20/33/36/39  1.250 cube     vol 1.9531   fourteen species share it
 *       box-21   1.250 x 1.5051 x 1.250    vol 2.3517   the fox — the TALLEST
 *       box-41   1.350 x 1.300  x 1.350    vol 2.3693   the tiger — the biggest
 *       box-12   1.5395 x 1.250 x 1.250    vol 2.4054   the cow — the WIDEST
 *
 * **`box-41` is a trap and the whale found it.** It is the biggest shell in the
 * bank, and its front face stands at z = 0.725 — which is 0.090 IN FRONT of
 * `EYE_CARD_Z`, the absolute 0.6350 an eye card is pinned to on all 48 of the
 * pack's own. So an eye placed low on `box-41` is BURIED INSIDE THE HULL. The
 * whale is on `box-12` for that reason and not for a reason about whales.
 *
 * **`box-13` IS NEWLY USABLE AND THAT IS ALSO JOE'S 3 AUGUST RULING.** The
 * tortoise and the terrapin both reached for the crab's flat plate and both
 * were refused by arithmetic — 0.4506 plus a 0.30625 leg is 0.7568 against a
 * floor of 1.43, and at the time that floor FAILED rather than reported. The
 * ray and the starfish are the first two species in the project to wear it, and
 * they are the two the shape was always right for.
 *
 * ===========================================================================
 * ## THE THREE MISSING SHAPES — priced, and every one a commission for Joe
 * ===========================================================================
 *
 * Four of the sixteen below are PLACEHOLDERS. Joe, 5 August: *"put something in
 * for the unbuildable ones anyway so i can do it manually. if there is no entry
 * at all, i cant do that."* So each one is a full entry — file, index line,
 * record, `MOVES`, both ledger rows — carrying the nearest honest approximation
 * and a header that says in its first line that it is a placeholder and exactly
 * what is wrong with it. What they are waiting on is three shapes:
 *
 * **A DOME. Wanted by three animals, and the clearest commission here.** All
 * ten hulls are chamfered boxes; the flattest, `box-13`, is a plate with square
 * corners. Nothing among the 100 baked shapes is a hemisphere. `animal-tortoise`
 * already asks for one in its own flag — *"a domed carapace is the one bespoke
 * part this collection would pay to author"* — and `animal-jellyfish` and
 * `animal-turtle` now ask for the same thing. **Three species and one shape.**
 * The authored route exists (`authored.ts`, and `primitiveStretched` re-cuts the
 * pack's own 0.25 chamfer at any size), so a dome is a day's work once Joe wants
 * one. It is NOT taken here: `authored.ts` §1 is explicit that the three base
 * shapes were scoped `PRIMITIVES ONLY` and that anything else is a fresh ruling.
 *
 * **A CURVE. Wanted by the seahorse, and there is not one in the bank at all.**
 * All 100 shapes are straight or tapered along a single axis. Rule 4 as amended
 * bakes a ROTATION into a copy's vertices — it turns a part and it cannot bend
 * one. `collections/birds.ts` priced the flamingo's downcurved bill against this
 * same wall and got the same answer, so this is now the second collection to
 * name it. A seahorse is an S and a spiral and nothing else, so unlike the dome
 * this one does not have a near miss.
 *
 * **A CLAW, AND THIS ONE IS DIFFERENT — THE PACK HAS IT AND THE BANK HAS NOT.**
 * §7 censuses **claw: 10 instances, 10 distinct shapes, donors crab, lion, tiger
 * and polar — BAKED: no.** Verified against the 100 records rather than the
 * table: the roles actually present are band, card, ear, eye, hull, leg, nose,
 * oddment, tail, tooth and wing. **The crab's own pincer is sitting in a GLB in
 * this repo and has never been baked.** So the lobster is not blocked on
 * authoring anything — it is blocked on one line in the generator.
 *
 * **THAT LINE IS JOE'S AND NOT A BUILDER'S, AND THE REASON IS THE WHOLE POINT.**
 * Baking a role RENUMBERS THE WHOLE BANK. Adding `wing` on 2 August moved
 * `box-31` from the lion's hull to its mane band, moved `blade-03` from the
 * dog's nose to the bee's wing, and turned the newt's crest into bee wings —
 * and **nothing failed to compile**. `NUMBERING_FROZEN_BY` pins the order and
 * new roles may only APPEND, so appending `claw` is plausibly safe, and
 * "plausibly safe" is not a builder's call to make on a file that silently
 * rewrites every other animal. It is written down here and left alone.
 *
 * ===========================================================================
 * ## ROSTER §4 — this collection is full of twins and here is where each falls
 * ===========================================================================
 *
 * Ocean carries more confusable pairs than any collection since Woodland, and
 * three of them are internal:
 *
 *   - **shark / dolphin.** Both legless, grey, on a cube, with a dorsal and
 *     pectorals. Separated by the BEAK (`tube-03`, which the shark has not
 *     got), by a HORIZONTAL fluke against a VERTICAL fin, and by six gill cards
 *     the dolphin does not wear.
 *   - **octopus / squid.** Both wear `box-18` as limbs. Separated by the HULL
 *     (`box-21`, the tallest in the bank, against the cube), by arms bunched
 *     forward against arms splayed through a full turn, and by two longer
 *     feeding tentacles.
 *   - **pufferfish / sea urchin.** Both are the hedgehog's repeat-and-sink on
 *     five facings. Separated by the PART — `cone-01` at 0.400 against `box-06`,
 *     the bunny's ear, at 0.913, because `RidgeDef` carries no `stretch` and a
 *     longer spine has to be a longer shape — and by subtraction: the urchin has
 *     no fins, no tail and no mouth.
 *
 * And two reach outside the collection, which is worse:
 *
 *   - **turtle against `animal-tortoise` and `animal-terrapin`**, both built,
 *     the tortoise signed off. Three shells, and the sea turtle is the only one
 *     of the three with no `box-01` leg anywhere on it.
 *   - **eel against `animal-corn-snake`**, both legless on a cube paying the
 *     height toll with the same `box-04` coil. Separated by a dorsal RUN along
 *     the top where the snake wears the same `wedge-04` on the chamfer as
 *     saddles — §3.1 exactly: one shape, two animals, told apart by placement.
 *
 * ## WHY THERE ARE NO `threat` RECORDS
 *
 * Roster §5 wants statuses "true, checkable", and `Threat.checkedDate` exists so
 * a status is a dated reading of the Red List rather than a memory. Writing
 * categories here from recall would produce records that LOOK checked. Absent
 * means "not recorded yet", which is honest — and it matters more in this
 * collection than most, because several of these animals genuinely are listed.
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
 * ALL SIXTEEN, and the two lists are kept separate on purpose.
 *
 * TWELVE ARE REAL ANIMALS. FOUR ARE PLACEHOLDERS — the jellyfish, the seahorse,
 * the starfish and the lobster — put in so Joe can finish them by hand, each
 * saying so in the first line of its own file header and in its `flag`. A
 * placeholder is not promoted into the built count to make the number look
 * better; the survey above prices all four.
 *
 * IN ROSTER ORDER, which is the order `roster.ts:117-127` lists them and the
 * order the album shows them. A member arriving later is INSERTED at its
 * rostered place, never appended.
 *
 * Every record below is one line. The reasoning for a species' SHAPE lives in
 * its own `parts/assembled/animal-<id>.ts`, beside the number it justifies —
 * and for a placeholder, so does the price of finishing it, because that is
 * where the person doing it by hand will be reading.
 */
export const OCEAN_SPECIES: readonly Species[] = [

  /* The species that proves the collection: the pack's own fish fins on the
   * pack's own fish hull, with the parrot's wing stood up as a dorsal. */
  defineSpecies('animal-shark', 'bespoke'),

  /* The widest hull in the bank, and the parrot's fan spun FLAT as a fluke —
   * the one tail in nature wider than it is tall. */
  defineSpecies('animal-whale', 'bespoke'),

  /* The shark's twin, held apart by a beak the shark has not got. */
  defineSpecies('animal-dolphin', 'bespoke'),

  /* Eight elephant trunks, re-axised to hang: the bank has no tentacle and a
   * trunk is the only boneless tapering limb in it. */
  defineSpecies('animal-octopus', 'bespoke'),

  /* PLACEHOLDER — no dome anywhere in the bank, and no alpha anywhere in the
   * texture route either. The bell is a stand-in and says so. */
  defineSpecies('animal-jellyfish', 'bespoke'),

  /* The easiest animal here, and easy for a reason nobody planned: a ball of
   * spikes is the hedgehog, and §8's idiom was built for it. */
  defineSpecies('animal-pufferfish', 'bespoke'),

  /* The first species in the project to wear one shape three times as a
   * MARKING rather than as anatomy. */
  defineSpecies('animal-clownfish', 'bespoke'),

  /* PLACEHOLDER — the bank holds no curve of any kind, and a seahorse is an
   * S-curve and a spiral and nothing else. */
  defineSpecies('animal-seahorse', 'bespoke'),

  /* PLACEHOLDER — five-fold symmetry against an engine that mirrors in twos.
   * The five arms are the only parts in this project placed by naked
   * trigonometry rather than by a donor transfer. */
  defineSpecies('animal-starfish', 'bespoke'),

  /* The third shelled animal, and the only one of the three with no box-01 leg
   * anywhere on it — four penguin wings instead, which already are flippers. */
  defineSpecies('animal-turtle', 'bespoke'),

  /* The animal box-13 was always right for: the crab's flat plate, unusable
   * until the height band became a norm that reports. */
  defineSpecies('animal-ray', 'bespoke'),

  /* PLACEHOLDER — the `claw` role has never been baked. The crab's own pincer
   * is in a GLB in this repo; baking it renumbers the bank, so it is Joe's. */
  defineSpecies('animal-lobster', 'bespoke'),

  /* The octopus's twin, on the tallest hull in the bank, with its arms bunched
   * forward and two longer feeding tentacles. */
  defineSpecies('animal-squid', 'bespoke'),

  /* The corn snake's twin, separated by a dorsal RUN where the snake wears the
   * same shape on the chamfer as saddles. */
  defineSpecies('animal-eel', 'bespoke'),

  /* The goose's neck idiom put to a completely different job: a stalk off the
   * crown with a light anchored to its own built tip. */
  defineSpecies('animal-anglerfish', 'bespoke'),

  /* The pufferfish's twin, separated by a longer SHAPE rather than a dial —
   * RidgeDef carries no stretch. */
  defineSpecies('animal-sea-urchin', 'bespoke'),
]
