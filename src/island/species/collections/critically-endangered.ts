/**
 * The Critically Endangered collection — roster row 19, `ship: 19`, name band
 * `long`.
 *
 * NEW FILE, 5 August 2026. There has never been a
 * `collections/critically-endangered.ts`; this one was written on the assembly
 * route from the first line, like Ice, Ocean and Birds and unlike Woodland,
 * Farm and Africa, which are rebuilds carrying kit-era headers.
 *
 * ===========================================================================
 * ## WHY THERE ARE NO `threat` RECORDS, IN THE ONE COLLECTION NAMED FOR ONE
 * ===========================================================================
 *
 * **This collection is NAMED for an IUCN category and it does not record one for
 * a single member. That is deliberate and it is the most important line in this
 * file.**
 *
 * Roster §5 requires a threat status to be "true, checkable", and
 * `Threat.checkedDate` exists precisely so that a status is a **dated reading of
 * the Red List** rather than a memory. Writing twelve categories here from
 * recall would produce twelve records that LOOK checked and are not, which is
 * worse than none at all — and the collection's own name would be doing the
 * vouching. `registry.ts:55-76` holds exactly this line for the seven badged
 * base-24 species, and every collection built tonight has held it too.
 *
 * So: **the status is this collection's PREMISE, not a claim it makes.** These
 * twelve are here because the roster put them here. No dated reading has been
 * taken for any of them by anybody, `Species.threat` is absent on all twelve,
 * and absent means "not recorded yet", which is the honest state.
 *
 * **WHAT UNBLOCKS IT:** somebody opens the current Red List entry for each of
 * the twelve, stamps the real date, and adds `threat` to the records below. It
 * is a short job for whoever has a browser and it must happen before any badge
 * is shown anywhere. Note that roster §6 asks whether a badge prints the IUCN
 * category name or a softer child-facing phrase, and THAT one is Joe's.
 *
 * ===========================================================================
 * ## WHAT THIS COLLECTION IS, AS A DESIGN PROBLEM: TWELVE ANIMALS FROM TWELVE
 * ## HABITATS, AND EVERY ONE OF THEM HAS A COUSIN ALREADY BUILT
 * ===========================================================================
 *
 * Ice was hard because every member was white and every member had a twin.
 * Jungle was hard because it collided with more built animals than any other.
 * **This collection has Jungle's problem without Jungle's compensation:** its
 * members come from a rainforest, a gulf, a snow forest, a swamp, a New Zealand
 * hillside, a Mexican lake, a Philippine canopy, an Annamite forest, an African
 * savanna, an Indian river, a Sumatran jungle and a Brazilian caatinga, so
 * nothing about the collection holds it together and every separation has to be
 * made against a DIFFERENT already-built animal.
 *
 * Counted, twelve of twelve collide:
 *
 *   - **black rhino** and **sumatran rhino** against each other, and both
 *     against `animal-white-rhino`, which landed in a sibling collection while
 *     this one was being built. Three rhinos is the tightest cluster in the
 *     project after the spotted cats.
 *   - **vaquita** against `animal-dolphin`, `animal-beluga`, `animal-narwhal`,
 *     `animal-orca`, `animal-whale`, `animal-shark` and the
 *     `animal-harbour-porpoise` that arrived beside it.
 *   - **amur leopard** against `animal-jaguar`, `animal-ocelot`,
 *     `animal-cheetah`, `animal-lynx`, `animal-wildcat` and the FROZEN lion and
 *     tiger. Six cats before it and it is the seventh.
 *   - **sumatran orangutan** against the FROZEN `animal-monkey` and against
 *     seven built primates, six of which share one shell.
 *   - **kakapo** and **spix's macaw** against the FROZEN `animal-parrot`,
 *     `animal-cockatoo`, `animal-cockatiel`, `animal-budgie`,
 *     `animal-lovebird` and `animal-hyacinth-macaw`.
 *   - **philippine eagle** against `animal-vulture`, `animal-owlet`,
 *     `animal-snowy-owl` and a whole Raptors collection landing alongside.
 *   - **axolotl** against `animal-newt`, `animal-salamander` and two frogs.
 *   - **saola** against nine built horned animals.
 *   - **pangolin** against `animal-hedgehog`, `animal-porcupine`,
 *     `animal-echidna` and `animal-armadillo`'s absence.
 *   - **gharial** against `animal-crocodile`.
 *
 * Every separation is argued in the species file, beside the number it
 * justifies. The five worth reading first are named at the bottom.
 *
 * ===========================================================================
 * ## WHAT THE BANK GAVE THIS COLLECTION, AND WHAT IT DID NOT
 * ===========================================================================
 *
 * **A FACIAL DISC EXISTS AND NOBODY HAD FOUND IT.** `blade-05` is the lion's
 * muzzle plate — 1.000 x 1.000 x 0.125, the only broad flat SOLID sheet in the
 * bank — and it has been unusable as a face for one measured reason: on any of
 * the seven usual hulls a pure donor transfer puts its front at 0.750, which is
 * in front of `EYE_CARD_Z` at 0.6350, so it buries the eyes it is meant to
 * surround. **`box-31` fixes it exactly.** The lion's shallow shell has its
 * front face at 0.500 rather than 0.625, so the transfer lands the plate's front
 * at 0.6250 and the eye cards float **0.010 proud of the disc** — which is
 * `CARD_STANDOFF`, the pack's own daylight for a card, recovered rather than
 * chosen. `animal-kakapo.ts` is the first species to wear it and any owl,
 * harrier or disc-faced animal built after this should take the same shell.
 *
 * **A RIDGE ON A HEAD IS A CREST.** §8's repeat-and-sink has run down five
 * spines (hedgehog, porcupine, echidna, warthog, crocodile) and never over a
 * crown. Rule 3 fuses head and body into one mass, so a row across the top of
 * the shell IS a crest: `animal-philippine-eagle.ts` leans nine `cone-01` back
 * twenty degrees over the flat top and both chamfers, and
 * `animal-axolotl.ts` pushes a chamfer-only row forward with `place` so six
 * splayed points sit over the head rather than down the back.
 *
 * **THE KOALA'S EAR IS A CHEEK FLANGE.** `box-25` is the only large RADIAL shape
 * in the bank and it attaches `x +1`, so a mirrored pair lands on the sides of a
 * head with no spin, no stretch and its own recorded burial.
 * `animal-beluga.ts` turns it up onto the crown as a melon; left alone it is a
 * flanged male orangutan's cheek pad, and it costs nothing.
 *
 * **THE BANK STILL HAS NO CURVE, AND THIS IS THE SIXTH COLLECTION TO SAY SO.**
 * All 100 baked shapes are straight or tapered along a single axis. Ocean priced
 * it for the seahorse's S, Birds for the flamingo's bill, Ice for the Dall ram's
 * spiral and the narwhal's helix, Outback for the lyrebird and Critters for the
 * snail. `animal-black-rhino` wants it for a front horn that sweeps forward and
 * up, and `animal-sumatran-rhino` wants a weaker version of the same. **Both
 * ship anyway**, because a rhino with two straight spikes on its nose is still a
 * rhino, where Ice's Dall ram without its curl is a white goat.
 *
 * **A DOME IS WANTED FOR THE FIFTH TIME.** Ocean's jellyfish and sea turtle,
 * Ice's beluga, and now `animal-gharial`'s ghara — the bulb on the tip of a male
 * gharial's snout, which is a hemisphere and is standing in as `box-24`, a flat
 * disc. It ships, because a disc on the end of a very long snout still reads.
 *
 * **AND ONE COMMISSION NOBODY HAS ASKED FOR BEFORE: A BRANCHED FROND.** Every
 * one of the 100 shapes is a single solid mass. Not one forks. `animal-axolotl`
 * is the collection's only placeholder and that is what it waits on.
 *
 * ===========================================================================
 * ## ELEVEN REAL ANIMALS AND ONE PLACEHOLDER
 * ===========================================================================
 *
 * Joe, 5 August: *"put something in for the unbuildable ones anyway so i can do
 * it manually. if there is no entry at all, i cant do that."* So every one of
 * the twelve is a full entry — the species file, the index line, the record
 * below, a `MOVES` row and a row in both ledgers.
 *
 * **`animal-axolotl` is the placeholder** and its own first header line says so.
 * It names the missing shape (a branched, feathery frond), gives the measurement
 * that proves it (all 100 baked shapes are single solid masses, straight or
 * tapered along one axis — not one branches), says what is standing in (six
 * `cone-01`, the bank's one true point, on the chamfer row of §8's idiom) and
 * says what to try first by hand (fork each frond twice with `on:`, which is
 * `animal-lynx.ts`'s ear-tuft anchor run to three levels, at 612 triangles and a
 * declared RULE 9).
 *
 * Three others strain something without being placeholders and all three are
 * flagged where Joe reads: **`animal-black-rhino`** wants the curve;
 * **`animal-philippine-eagle`** wants the hooked beak that §14 named as clearly
 * absent and never retired, and it runs `animal-vulture.ts`'s own written-down
 * untried experiment for it; **`animal-amur-leopard`** is the seventh spotted
 * cat and its whole flag is roster §4.
 *
 * ===========================================================================
 * ## THE FIVE SEPARATIONS TO LOOK AT FIRST
 * ===========================================================================
 *
 *   1. **black rhino against sumatran rhino against white rhino.** Three
 *      rhinos, three shells and three horn treatments: `box-41` with one long
 *      spike and a hooked lip, the plain cube with two stubs and hair, and (in
 *      the sibling collection) `box-41` with a square lip. The two here are
 *      deliberately different SIZES of body, which is the one honest difference
 *      between the animals.
 *   2. **amur leopard against jaguar.** `box-41` against `box-12`, four rosettes
 *      a side against eight, and the cat's own `wedge-07` tail against the fox's
 *      brush. If they still twin, the dial is the palette — this coat is the
 *      palest of the seven cats.
 *   3. **spix's macaw against hyacinth macaw.** Two blue macaws, built in
 *      parallel by two agents. Different shells, different tails (`wedge-07`
 *      against `wedge-15`), a pale head against one flat cobalt, and grey face
 *      cards against yellow ones. Worth putting side by side.
 *   4. **kakapo against cockatoo.** The cockatoo wears four parrot parts and
 *      flies; this one wears two, has NO WINGS AT ALL, and has a face.
 *   5. **gharial against crocodile.** The same shape of jaw stretched the
 *      opposite way — 3/16 square and 1.8x long against 10/16 by 5/16 — on a
 *      different shell, with knobs instead of keels.
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
 * ALL TWELVE. Eleven are real animals and one — the axolotl — is a PLACEHOLDER
 * that says so in the first line of its own file and in its `flag`. A
 * placeholder is not promoted into the built count to make the number look
 * better; the survey above prices it.
 *
 * IN ROSTER ORDER, which is the order `roster.ts:328-333` lists them and the
 * order the album shows them. A collection whose file order disagrees with its
 * roster order is a trap `species-garden.test.ts:149` already exists to catch,
 * so a member arriving later is INSERTED at its rostered place, never appended.
 *
 * **NO RECORD BELOW CARRIES A `threat`.** See the top of this file: the status
 * is the collection's premise and no dated Red List reading has been taken.
 *
 * Every record below is one line. The reasoning for a species' SHAPE lives in
 * its own `parts/assembled/animal-<id>.ts`, beside the number it justifies —
 * and for the placeholder, so does the price of finishing it, because that is
 * where the person doing it by hand will be reading.
 */
export const CRITICALLY_ENDANGERED_SPECIES: readonly Species[] = [

  /* Two horns in a line down the NOSE, which nothing else in the project has,
   * and the hooked lip the animal is really named for. */
  defineSpecies('animal-black-rhino', 'bespoke'),

  /* The panda's eye card painted charcoal, so the dark ring and the eye are one
   * card. No beak at all, which is what a porpoise is. */
  defineSpecies('animal-vaquita', 'bespoke'),

  /* The seventh spotted cat, and the only one on the biggest shell — with four
   * rosettes a side against the jaguar's eight and the CAT's own rope tail. */
  defineSpecies('animal-amur-leopard', 'bespoke'),

  /* The koala's ear worn as a cheek FLANGE on the widest shell in the bank,
   * because on a one-mass animal the shell is the face. */
  defineSpecies('animal-sumatran-orangutan', 'bespoke'),

  /* The project's first FACIAL DISC, which falls out of one hull choice and no
   * numbers at all — and the only parrot here with no wings. */
  defineSpecies('animal-kakapo', 'bespoke'),

  /* PLACEHOLDER — the gills are branched fronds and not one of the 100 baked
   * shapes forks. Six splayed points stand in and the file prices the fix. */
  defineSpecies('animal-axolotl', 'bespoke'),

  /* A ridge run over the CROWN instead of the spine, which makes it a crest —
   * plus animal-vulture.ts's own untried hook experiment, run. */
  defineSpecies('animal-philippine-eagle', 'bespoke'),

  /* The one horned animal in the project that the missing curve does not cost
   * anything: a saola's horns really are straight and parallel. */
  defineSpecies('animal-saola', 'bespoke'),

  /* Repeat-and-sink with a PLATE instead of a point — taper 0.605 against
   * cone-01's 0 — which is what keeps it off the hedgehog's silhouette. */
  defineSpecies('animal-pangolin', 'bespoke'),

  /* animal-crocodile.ts's own jaw stretch run backwards: square in section and
   * 1.8x long, on a shallower shell, with knobs instead of keels. */
  defineSpecies('animal-gharial', 'bespoke'),

  /* The smallest rhino in the world on the smallest body the pack has, with two
   * stubs, a hairy spine and the caterpillar's ring worn as a skin fold. */
  defineSpecies('animal-sumatran-rhino', 'bespoke'),

  /* A tail no bird in the project wears, and a pale head painted with the belly
   * line run backwards — animal-skunk.ts's trick, worn upside down. */
  defineSpecies('animal-spixs-macaw', 'bespoke'),
]
