/**
 * Near Threatened — roster row 16, `ship: 16`, name band `long`.
 *
 * NEW FILE, 5 August 2026. There has never been a `collections/near-threatened.ts`;
 * this one was written on the assembly route from the first line, like Ocean,
 * Birds and Ice, and unlike Woodland, Farm and Africa, which are rebuilds
 * carrying kit-era headers.
 *
 * ===========================================================================
 * ## THE STATUS IS THIS COLLECTION'S PREMISE AND NOTHING HERE CLAIMS TO BE
 * ## CHECKED
 * ===========================================================================
 *
 * This is the only collection in the roster NAMED for an IUCN category, so the
 * usual paragraph about `threat` records has to be said more carefully rather
 * than copied.
 *
 * Roster §5 requires a threat status to be "true, checkable", and
 * `Threat.checkedDate` exists precisely so that a status is a DATED READING of
 * the Red List rather than a memory. **No such reading has been taken.** Nobody
 * opened the Red List for any of these twelve while this collection was built,
 * so not one of them carries a `threat` record — writing categories here from
 * recall would produce records that LOOK checked, and a record that looks
 * checked and is not is worse than none at all. `registry.ts:55-76` holds
 * exactly that line for the base 24's seven badges and every collection built
 * since has held it.
 *
 * So: the collection's NAME is the premise a builder was given, and the
 * collection's DATA makes no claim. `Species.threat` being optional already
 * means "not recorded yet", which is honest. What unblocks it is the same
 * ten-minute job `registry.ts` describes — somebody with a browser reads the
 * current Red List entry for each of these twelve, stamps the real date, and
 * adds the records. Until that happens the twelve animals below are just
 * animals, and the album says nothing about them that has not been checked.
 *
 * ===========================================================================
 * ## SEPARATION: THESE TWELVE COME FROM TWELVE HABITATS AND EVERY ONE HAS A
 * ## TWIN SOMEWHERE ELSE IN THE REGISTER
 * ===========================================================================
 *
 * Every other collection is held together by a place — Ice is cold, Africa is
 * hot, Ocean is wet — and the members collide mostly with each other. This one
 * is held together by a CATEGORY, so it collides with nothing internally and
 * with almost everything externally. The register now holds over two hundred
 * species; counted against them, all twelve have a nearest neighbour:
 *
 *   - **white rhino** against the FROZEN `animal-elephant` and Africa's
 *     `animal-hippo`. The only nose horn in the project.
 *   - **European bison** against Africa's `animal-buffalo`, Farm's `animal-ox`
 *     and `animal-water-buffalo`, and Ice's `animal-musk-ox`. Five bovids now.
 *   - **maned wolf** against the FROZEN `animal-fox`, Night Time's `animal-wolf`
 *     and Ice's `animal-arctic-fox`.
 *   - **yak** against `animal-musk-ox` above all, and it is the closest call in
 *     the collection — see below.
 *   - **jerboa** against six small cube rodents and Outback's `animal-bilby`.
 *   - **agouti** against Jungle's `animal-capybara` and Woodland's
 *     `animal-coypu`.
 *   - **harbour porpoise** against `animal-dolphin`, `animal-beluga`,
 *     `animal-orca` and `animal-whale`.
 *   - **guanaco** against Farm's `animal-llama` and `animal-alpaca`.
 *   - **markhor** against Farm's `animal-goat` and Ice's `animal-dall-sheep`.
 *   - **jaguarundi** against seven other cats, two of them frozen.
 *   - **emperor penguin** against the FROZEN `animal-penguin` — the hardest
 *     version of roster §4 there is, because the twin can never be edited.
 *   - **striped hyena** against Africa's `animal-hyena`, which is the spotted
 *     one.
 *
 * Twelve of twelve. Each separation is written at the species it belongs to,
 * beside the number that justifies it. **The three worth looking at first are
 * the yak, the emperor penguin and the striped hyena**, because in each case the
 * twin is a specific built animal rather than a family resemblance.
 *
 * **THE YAK AND THE MUSK OX WEAR THE SAME SKIRT AND THAT IS DELIBERATE.**
 * `box-29`, the lion's mane ring, is the only one of the bank's five shell-rings
 * `animal-sheep.ts` found readable on a stocky hull, and a curtain of guard hair
 * hanging to the ground is genuinely what BOTH animals have. Inventing a shape
 * difference would be a lie, which is `animal-ermine.ts`'s and `animal-mink.ts`'s
 * own argument. The four separations are all real: `box-12` against `box-41`,
 * horns out and UP against horns falling 35 degrees, the fox's brush against NO
 * TAIL AT ALL, and a white muzzle against a black pad.
 *
 * ===========================================================================
 * ## WHAT THE BANK GAVE, AND WHAT IT DID NOT
 * ===========================================================================
 *
 * **TWO SHAPES DID A JOB NOBODY HAD ASKED THEM FOR, and both are §3.1 paying
 * out.** `box-35`, the panda's rump-shell, is worn by `animal-agouti` as an
 * ORANGE RUMP — the only way this project can express a FORE-AND-AFT colour
 * boundary at all, since `Paint.patch` takes one height and `byBand` cuts only
 * where Kenney already cut. And `wedge-04`, filed as the bunny's tooth and the
 * chick's, monkey's and penguin's ear, is `animal-european-bison`'s HORN: the
 * bank's four long horn shapes are all spent on sweeps, and a wisent's horns are
 * short, so for once the small tapered wedge is the right size rather than a
 * compromise.
 *
 * **A CURVE IS WANTED AGAIN, AND THIS IS THE SIXTH COLLECTION TO PRICE IT.**
 * Ocean priced it for the seahorse's S and the flamingo's bill, Birds for the
 * bill, Outback for the frilled lizard, Critters for the snail's shell and Ice
 * for the Dall ram's spiral. `animal-markhor` wants a HELIX, which is the same
 * absence at one more dimension, and it is the collection's clearest commission.
 * `animal-yak`'s horn and `animal-emperor-penguin`'s bill each want the same
 * thing more mildly and ship straight, because both read straight at tablet
 * distance and a markhor does not.
 *
 * **NO DOME WAS NEEDED HERE**, which is worth recording because four species
 * across Ocean and Ice have now asked for one: the jellyfish, the tortoise, the
 * sea turtle and the beluga's melon. Nothing in this collection wants a
 * hemisphere.
 *
 * **THE LEG IS THE OTHER COMMISSION AND IT IS BIGGER THAN THE CURVE.** Two of
 * this collection's three placeholders wait on it. The bank holds ONE leg shape,
 * `box-01`, 0.30625 tall, on ONE absolute row at y = 0.18125 — and
 * `animal-llama.ts` measured that the row cannot be LOWERED either, because
 * `LEG_ROW.sink` buries the leg exactly 0.125000, which is rule 3's
 * nothing-floats floor to six decimals with no slack. Legginess also cannot come
 * from a smaller body, since the hull is never scaled and all ten shells are
 * within 0.29 of each other. `animal-kangaroo.ts` and `animal-ostrich.ts` priced
 * it as a long HIND leg; counted across the whole register today, **one leg
 * shape would finish eight animals**: the kangaroo, the ostrich, the quokka, the
 * emu, Birds' heron, stork and flamingo, and this collection's maned wolf and
 * jerboa. That is the highest-value single commission on the board.
 *
 * ===========================================================================
 * ## THREE PLACEHOLDERS, AND WHY THREE
 * ===========================================================================
 *
 * Joe, 5 August: *"put something in for the unbuildable ones anyway so i can do
 * it manually. if there is no entry at all, i cant do that."* So every one of
 * the twelve is a full entry — file, index line, record, `MOVES`, both ledger
 * rows. **Nine are real animals.** `animal-maned-wolf`, `animal-jerboa` and
 * `animal-markhor` are placeholders, each says so in the first line of its own
 * file and in its `flag`, and each names the missing shape, the measurement that
 * proves it, what is standing in and what to try first.
 *
 * A placeholder is not promoted into the built count to make the number look
 * better. Nine of twelve is the honest figure.
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
 * ALL TWELVE. Nine are real animals and three — the maned wolf, the jerboa and
 * the markhor — are PLACEHOLDERS that say so in the first line of their own
 * files and in their `flag`.
 *
 * IN ROSTER ORDER, which is the order `roster.ts:292-297` lists them and the
 * order the album shows them. A collection whose file order disagrees with its
 * roster order is a trap `species-garden.test.ts:149` already exists to catch,
 * so a member arriving later is INSERTED at its rostered place, never appended.
 *
 * Every record below is one line. The reasoning for a species' SHAPE lives in
 * its own `parts/assembled/animal-<id>.ts`, beside the number it justifies —
 * and for the three placeholders, so does the price of finishing them, because
 * that is where the person doing it by hand will be reading.
 */
export const NEAR_THREATENED_SPECIES: readonly Species[] = [

  /* The only nose horn in the project: `cone-01`, the bank's one taper-0.000
   * shape, stood on the crown's front edge at 45 degrees, twice. */
  defineSpecies('animal-white-rhino', 'bespoke'),

  /* The fifth bovid, and the first whose horn is SHORT — `wedge-04`, a shape
   * three species already wear as an ear, at last the right size for a horn. */
  defineSpecies('animal-european-bison', 'bespoke'),

  /* PLACEHOLDER — a fox on stilts, and the bank has one leg at one height. The
   * mane, the ears and the white-tipped tail are all real. */
  defineSpecies('animal-maned-wolf', 'bespoke'),

  /* The musk ox's own skirt on the wider shell, told apart by a tail the musk
   * ox has not got and horns that go the other way. */
  defineSpecies('animal-yak', 'bespoke'),

  /* PLACEHOLDER — a hopper with no hind leg. What is real is the lion's tail
   * with Kenney's own tuft band painted white. */
  defineSpecies('animal-jerboa', 'bespoke'),

  /* The panda's rump-shell worn as an orange haunch: the project's only
   * fore-and-aft colour boundary, and no tail at all. */
  defineSpecies('animal-agouti', 'bespoke'),

  /* The cetacean defined by an ABSENCE — no beak, which is the field mark, and
   * the first dorsal here that is an ear rather than a wing. */
  defineSpecies('animal-harbour-porpoise', 'bespoke'),

  /* `animal-llama.ts`'s neck, unchanged, under the two things no other camelid
   * has: a hard belly line and a grey head. */
  defineSpecies('animal-guanaco', 'bespoke'),

  /* PLACEHOLDER — a corkscrew, which is a curve at one more dimension. It runs
   * `animal-water-buffalo.ts`'s roll idiom with the roll ADVANCED. */
  defineSpecies('animal-markhor', 'bespoke'),

  /* The eighth cat, and the only one with nothing on it: no pattern, no tuft,
   * no belly line, on the one shell lower than it is wide. */
  defineSpecies('animal-jaguarundi', 'bespoke'),

  /* Built beside a FROZEN penguin. The biggest shell in the pack, an orange ear
   * patch nothing else carries, and a bill cut 2.2 long. */
  defineSpecies('animal-emperor-penguin', 'bespoke'),

  /* The two extremes of the ear bank on the two hyenas: the tallest and
   * pointed here, the widest and round in Africa. */
  defineSpecies('animal-striped-hyena', 'bespoke'),
]
