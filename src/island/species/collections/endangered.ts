/**
 * The Endangered collection — roster row 18, `ship: 18`, name band `long`.
 *
 * NEW FILE, 5 August 2026. There has never been a `collections/endangered.ts`;
 * this one was written on the assembly route from the first line, like Ocean,
 * Birds and Ice and unlike Woodland, Farm and Africa, which are rebuilds
 * carrying kit-era headers.
 *
 * ===========================================================================
 * ## THE COLLECTION'S OWN PREMISE IS A CLAIM NOBODY HAS CHECKED
 * ===========================================================================
 *
 * This collection is NAMED for a conservation status, and **not one of the
 * twelve records below carries a `Threat`.** That is deliberate and it is the
 * first thing to read about this file.
 *
 * Roster §5 requires threat statuses to be *"true, checkable"*, and
 * `Threat.checkedDate` exists precisely so a status is a **dated reading of the
 * IUCN Red List** rather than a memory. Writing categories here from recall
 * would produce twelve records that LOOK checked and are not — which is worse
 * than twelve absent ones, because an absent `threat` already means "not
 * recorded yet" and reads honestly. `registry.ts:67-88` holds exactly this line
 * for the seven badged base-24 species, `collections/ice.ts` holds it for its
 * sixteen, and every collection built tonight has held it.
 *
 * **So: the status is this collection's PREMISE, and no dated reading has been
 * taken.** The animals are real, the row name is Joe's brief transcribed, and
 * the conservation claim behind the word "Endangered" is unverified here. What
 * unblocks it is somebody with a browser reading the current Red List entry for
 * each of the twelve and stamping the real date — the same ten-minute job
 * `registry.ts` describes for the base seven, and it must happen before any
 * badge is shown. Roster §6 also asks whether a badge prints the IUCN category
 * name or a softer child-facing phrase, and THAT is Joe's.
 *
 * ===========================================================================
 * ## WHAT THIS COLLECTION IS, AS A DESIGN PROBLEM: TWELVE ANIMALS FROM TWELVE
 * ## HABITATS, EVERY ONE OF THEM A NEAR-TWIN OF SOMETHING ALREADY BUILT
 * ===========================================================================
 *
 * Ice's problem was that all sixteen of its members were white. This one is the
 * opposite and is harder in a different way: the twelve share no habitat, no
 * palette and no body plan, so there is no collection-wide idiom to lean on —
 * and because the register now holds **200+ species**, every one of them lands
 * next to something already finished. Counted, against the built tree:
 *
 *   - **red panda** against the FROZEN `animal-panda`, and against
 *     `animal-raccoon`, `animal-coati`, `animal-kinkajou` and `animal-lemur`.
 *   - **chimpanzee** and **bonobo** against each other, against the FROZEN
 *     `animal-monkey`, and against `animal-gorilla`, `animal-gibbon`,
 *     `animal-baboon` and `animal-howler-monkey`.
 *   - **blue whale** against `animal-whale`, `animal-orca`, `animal-beluga`,
 *     `animal-narwhal`, `animal-dolphin` and `animal-shark`.
 *   - **african wild dog** against `animal-hyena` — which is the worst collision
 *     in the collection — and against `animal-dingo` and `animal-wolf`.
 *   - **okapi** against the FROZEN `animal-giraffe`, and against `animal-zebra`
 *     and `animal-tapir`.
 *   - **giant otter** against Woodland's `animal-otter` and the FROZEN
 *     `animal-beaver`.
 *   - **komodo dragon** against `animal-crocodile` and `animal-iguana`.
 *   - **whooping crane** against `animal-heron`, `animal-stork` and
 *     `animal-flamingo`, all three of which are PLACEHOLDERS.
 *   - **red wolf** against `animal-wolf`, `animal-dingo` and the FROZEN
 *     `animal-fox` and `animal-dog`.
 *   - **galapagos penguin** against the FROZEN `animal-penguin` and against
 *     `animal-puffin`.
 *   - **tree kangaroo** against `animal-kangaroo` and `animal-quokka`.
 *
 * That is twelve of twelve. Every separation is argued in the species file where
 * the number it justifies lives, and the four worth opening first are named at
 * the bottom.
 *
 * ===========================================================================
 * ## THE MEASURED SURVEY — what the bank gave this collection
 * ===========================================================================
 *
 * **`box-42`/`box-43` WERE UNSPENT BY ALL 190 BUILT SPECIES AND ARE NOT NOW.**
 * The fish's own pectoral fins were baked on 4 August for the budgie's `wing`
 * role. `collections/ocean.ts` corrected `docs/how-the-animals-are-made.md` §14's
 * *"no fin, flipper or fluke"* using `blade-06`, the penguin's, and
 * `collections/critters.ts` corrected the insect-wing half using the same shape's
 * bee provenance — **but nothing had ever reached for the fish's pair itself.**
 * `animal-blue-whale` wears it. A shape sitting unused in the bank for a day is
 * a shape the next collection should search for rather than assume away.
 *
 * **THE BANK HAS NO CURVE, AND THIS COLLECTION DOES NOT NEED ONE.** Ocean priced
 * it for the seahorse, Birds for the flamingo's bill, Outback three times,
 * Critters for the snail and Ice three times more. Twelve animals were checked
 * against it here and **none is held up by it**, which is worth recording where
 * the standing commission is being tallied: the Galápagos penguin's bill hooks
 * slightly at the tip and reads straight at tablet distance, and nothing else in
 * the twelve wants a bend at all. **No DOME either, and no LONG HIND LEG** — see
 * `animal-tree-kangaroo.ts` for why the last of those is a genuine subtraction
 * from that commission's count rather than an oversight.
 *
 * **WHAT IT DOES WANT IS AN ELONGATED HULL, AND THAT IS A RULING AND NOT A
 * COMMISSION.** `HullDef.stretch` is `never` on Joe's own instruction of 2
 * August. All ten shells the pack drew are within 25% of a cube, and the biggest
 * is `box-41` at 1.350 x 1.300 x 1.350. A blue whale is about 4.5 times longer
 * than it is deep, so **the longest animal that has ever lived is a box** — the
 * one placeholder here, and `collections/critters.ts` already records the same
 * wall for `animal-stick-insect` in the same words.
 *
 * **THE PATTERN WALL, FOR THE SIXTH AND SEVENTH TIME.** Colour is a lookup with
 * no positional information, so `Paint.patch` takes one HEIGHT and `byBand` can
 * only recolour where Kenney already cut. That costs the **African wild dog its
 * blotches** (which are the animal — no two carry the same pattern), the **red
 * panda five of its six tail rings**, the **blue whale its mottle** and the
 * **Galápagos penguin its white horseshoe**. `collections/jungle.ts` counts five
 * more. Each of the four says so in its own flag.
 *
 * **THE HEIGHT BAND, BOTH ENDS, AND NOTHING OUTSIDE IT.** Measured on the built
 * models: the shortest three — `animal-komodo-dragon`, `animal-bonobo` and
 * `animal-galapagos-penguin` — all sit at exactly **1.4312**, which is the bare
 * 1.250 cube on standard legs and 0.00125 above the pack's own floor, and the
 * tallest is `animal-whooping-crane` at **1.9695** against the 2.02 ceiling.
 * The crane's `NECK_LEAN` is what holds it there.
 *
 * **KEEP-OUT.** `pets.ts:652` charges `max(width, depth) / 2` and Woodland's
 * header holds the ceiling at 1.6. The three widest here are
 * `animal-blue-whale` at **1.213** (its flippers), `animal-komodo-dragon` at
 * **1.149** (its tail and its tongue together) and `animal-red-panda` at
 * **1.125** (the fox's brush, which is the fox's own number). All inside.
 *
 * ===========================================================================
 * ## WHAT IS NEW IN THE VOCABULARY, so the next collection can reach for it
 * ===========================================================================
 *
 *   - **A PRIMATE WITH EARS.** Six apes and monkeys were already built and not
 *     one has an ear part — `animal-gibbon.ts` says no ears and no tail is what
 *     holds it apart from the lemur. `animal-chimpanzee` wears `tube-04`, the
 *     elephant's outer ear, sunk 0.40 on the side of the head.
 *   - **A FORKED TONGUE.** `animal-komodo-dragon` mirrors `wedge-08` — the
 *     caterpillar's tooth, the smallest solid shape in the bank at 16 triangles
 *     — splays it 18 degrees and draws it out along its own facing. Two prongs
 *     out of a jaw tip for 32 triangles.
 *   - **THE MASK CARD MOVED ONE NUMBER.** `animal-raccoon.ts` places its
 *     mirrored `plate-11` pair at 0.2165, half the card's own width, where the
 *     two meet exactly and build ONE bar. `animal-red-panda` places them at
 *     0.28, where they stop short and leave the muzzle stripe between them. Same
 *     shape, same spin, opposite animal.
 *   - **A FLUKE AS TWO LOBES.** `animal-whale.ts` spins the parrot's fan a
 *     quarter turn and gets one flat blade; `animal-blue-whale` mirrors
 *     `wedge-19` inside the tail stock and gets a pair, which is what a fluke is.
 *   - **A HULL'S FUSED LUGS USED AS AN ABSENCE.** `animal-badger.ts` measured
 *     `box-12` as the 1.250 cube with two lugs on its SIDES and treats that as a
 *     warning — a species on it must not add ears or it has four.
 *     `animal-komodo-dragon` is the first to want that: a monitor lizard has no
 *     external ear, so the hull's own geometry says the right thing for free.
 *
 * ===========================================================================
 * ## ONE PLACEHOLDER, AND WHY ONLY ONE
 * ===========================================================================
 *
 * Joe, 5 August: *"put something in for the unbuildable ones anyway so i can do
 * it manually. if there is no entry at all, i cant do that."* So every one of the
 * twelve is a full entry — file, index line, record, `MOVES`, both ledger rows.
 * **Eleven are real animals. `animal-blue-whale` is a placeholder** and its own
 * first header line says so, names what is missing (the length), gives the
 * measurement that proves it (all ten hulls within 25% of a cube, `box-41` the
 * biggest at 1.350 x 1.300 x 1.350), says what is standing in (the fish's unspent
 * fin, a two-lobe fluke, paired blowholes) and what to try first
 * (`RidgeDef.place` overriding a `side` row down onto the flank for the pleats).
 *
 * Two others strain a rule without being placeholders and both are flagged where
 * Joe reads. **`animal-chimpanzee`** and **`animal-bonobo`** stretch `plate-13`
 * 3.5x for a brow ridge, which is `animal-zebra.ts`'s strain on a face card
 * rather than an ear or a snout. **`animal-komodo-dragon`** draws `wedge-08` out
 * 3.2x for its tongue, which is the same strain on a tooth — at 1.0 the tongue
 * is 0.05 long and invisible, which is why it was taken.
 *
 * ===========================================================================
 * ## THE FOUR SEPARATIONS TO LOOK AT FIRST
 * ===========================================================================
 *
 *   1. **african wild dog against hyena.** They wear THE SAME EAR, deliberately:
 *      `box-25` is 0.743 across where the next biggest ear shape is 0.482, and
 *      two African carnivores are genuinely defined by a round dish. Everything
 *      else is where they are told apart, and if they still twin, the ear
 *      station and the hull are the dials.
 *   2. **chimpanzee against bonobo.** The ermine-and-stoat case: the same build
 *      twice, with a black face, a smaller ear and a white tail tuft as the whole
 *      difference — because in life that is very nearly the whole difference.
 *   3. **giant otter against otter.** This animal takes `wedge-03`, the beaver's
 *      paddle, which `animal-otter.ts` refuses by name — and the refusal and the
 *      taking are the same measurement read twice, because a giant otter's tail
 *      genuinely is flattened.
 *   4. **red wolf against wolf.** One shared `box-38`, joined a quarter of a body
 *      lower so it trails instead of being carried, plus a hull change that buys
 *      this wolf the ears `box-21` makes impossible.
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
 * ALL TWELVE. Eleven are real animals and one — the blue whale — is a
 * PLACEHOLDER that says so in the first line of its own file and in its `flag`.
 * A placeholder is not promoted into the built count to make the number look
 * better; the survey above prices it.
 *
 * IN ROSTER ORDER, which is the order `roster.ts:316-321` lists them and the
 * order the album shows them. A collection whose file order disagrees with its
 * roster order is a trap `species-garden.test.ts:149` already exists to catch,
 * so a member arriving later is INSERTED at its rostered place, never appended.
 *
 * NO RECORD CARRIES A `threat`, and the header says why at length: the status is
 * this collection's premise and no dated Red List reading has been taken.
 *
 * Every record below is one line. The reasoning for a species' SHAPE lives in
 * its own `parts/assembled/animal-<id>.ts`, beside the number it justifies —
 * and for the placeholder, so does the price of finishing it, because that is
 * where the person doing it by hand will be reading.
 */
export const ENDANGERED_SPECIES: readonly Species[] = [

  /* The belly line run BACKWARDS so the underside is black, and the raccoon's
   * mask card moved one number so the two cheeks stop short of the midline. */
  defineSpecies('animal-red-panda', 'bespoke'),

  /* The first primate in the project with EARS — six were built without one. */
  defineSpecies('animal-chimpanzee', 'bespoke'),

  /* The chimpanzee twice over, on purpose: a black face, a smaller ear and the
   * white tail tuft a bonobo keeps and a chimpanzee loses. */
  defineSpecies('animal-bonobo', 'bespoke'),

  /* PLACEHOLDER — the longest animal that has ever lived, built as a box,
   * because a hull is never scaled and all ten of them are nearly cubic. */
  defineSpecies('animal-blue-whale', 'bespoke'),

  /* The hyena's own dish ear, worn deliberately, with everything else moved. */
  defineSpecies('animal-african-wild-dog', 'bespoke'),

  /* The giraffe's own muzzle on the giraffe's only living relative, and the
   * zebra's stripe mechanism at two a side on the rump instead of four. */
  defineSpecies('animal-okapi', 'bespoke'),

  /* The beaver's paddle, taken where `animal-otter` refuses it by name — and
   * the refusal and the taking are the same measurement read twice. */
  defineSpecies('animal-giant-otter', 'bespoke'),

  /* No scute row and no ears, and both absences are true of a monitor lizard.
   * The forked tongue is the first in the project. */
  defineSpecies('animal-komodo-dragon', 'bespoke'),

  /* The first long-necked bird here that is NOT a placeholder, and the reason is
   * that a crane's bill is inside the bank's reach where a heron's is not. */
  defineSpecies('animal-whooping-crane', 'bespoke'),

  /* The grey wolf's own tail hung a quarter of a body lower, on a hull small
   * enough to let this wolf have the ears `box-21` makes impossible. */
  defineSpecies('animal-red-wolf', 'bespoke'),

  /* A penguin, so it takes the pack's own penguin flipper — and the longest real
   * nose in the bank, because this species has the longest bill of any penguin. */
  defineSpecies('animal-galapagos-penguin', 'bespoke'),

  /* The macropod the LONG HIND LEG commission buys nothing, because a tree
   * kangaroo walks on four limbs of nearly equal length. */
  defineSpecies('animal-tree-kangaroo', 'bespoke'),
]
