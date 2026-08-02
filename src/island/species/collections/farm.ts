/**
 * The Farm collection — roster row 12, `ship: 5`, name band `short`.
 *
 * PB-036 phase 3. `roster.ts` says which species exist; this file says what all
 * SIXTEEN of Farm's sixteen ARE, as build data. Nothing here builds geometry —
 * every number is a multiplier off the one reference silhouette in its kit, so
 * retuning the whole collection is an edit to a `REF` and not to this file.
 *
 * SHIPS COMPLETE — 16 OF 16, WITH NO HOLE IN IT. Every collection built before
 * this run ships partial: Garden waits on `bespoke`, Home Pets on songbird and
 * swim, Woodland on two game birds, Africa on a raptor. Farm is the first
 * collection whose ENTIRE membership was buildable the moment the songbird kit
 * landed — nine quadrupeds and seven songbirds — which is why it was written as
 * one piece, and `tests/island/species-farm.test.ts` asserts 16 of 16 outright
 * rather than counting.
 *
 * Not necessarily the only complete one by the time you read this: PB-036 phase
 * 3 ran three agents in parallel and Woodland's two game birds were being built
 * on the same new kit while this file was written. The claim made here is Farm's
 * own completeness, not primacy. Either way it is the moment
 * `species-registry.test.ts`'s "no collection is 100% shipped" claim stops being
 * true — that test's own comment says it goes red the day a second kit lands —
 * and JT-030 (may a collection unlock with a hole in it?) stops being the
 * blocking question for at least one collection.
 *
 * WHY THE NUMBERS ARE STOCKIER THAN THE ANIMALS. Same reason the other three
 * collections give: all 24 live GLBs were measured (the `REF` comment in
 * `kits/quadruped.ts`) and the pack is 1.43–2.02 tall, mean 1.65, mean
 * width/height 0.97. A shire horse at true anatomical proportions beside
 * `animal-fox` is a stranger, which roster §1 forbids. So this collection's
 * horse and its quail differ by far less than reality — 2.30 against 1.30 — and
 * that is correct for this pack.
 *
 * THE COROLLARY THAT COST THREE COLLECTIONS A RETUNE, and which bites Farm
 * harder than it bit Woodland. The quadruped kit's `>>> <<<` block states it:
 * the fit is UNIFORM and solves for `height`, so dropping `legs` lowers the raw
 * silhouette, RAISES the fit scale, and stretches the body in world units.
 * "Long and low is free" is false. Farm's heavy animals are also its tall ones —
 * an ox and a water buffalo are wide AND big — and height multiplies the whole
 * rig, so the keep-out (`pets.ts:652`, `max(width, depth) / 2`) is charged twice
 * over. Every number below is tuned against the MEASURED keep-out, and the
 * collection's worst is the water buffalo at 1.379 with the horse just behind it
 * at 1.371, inside the 1.6 ceiling with real room to spare. Those two are what
 * Farm's ratchet is set from, at 1.38.
 *
 * The single most expensive thing measured while tuning this file: `snout` on a
 * big-headed animal. A water buffalo wearing one measured 1.59 against 1.38
 * without — the snout is a two-box taper standing forward of the
 * muzzle and every unit of it is depth the keep-out charges for. That is why the
 * buffalo has no snout and the goat, whose head is 0.86, can afford one.
 *
 * The second half of the kit's block bites the equids: `ears: 'long'` inflates
 * the pre-fit height, so the donkey and the mule silently measure SLIM. Both
 * were checked against the W/H floor of 0.5 rather than assumed; the donkey is
 * the narrowest quadruped here at 0.60 and the mule at 0.70.
 *
 * WHY THERE ARE NO `threat` RECORDS. Roster §5 wants statuses "true,
 * checkable", and `Threat.checkedDate` exists so a status is a dated reading of
 * the Red List rather than a memory. Writing categories here from recall would
 * produce records that LOOK checked. Absent means "not recorded yet", which is
 * honest; `registry.ts` holds the same line for the base 24.
 *
 * ROSTER §4 IS THE WHOLE JOB HERE. Farm is the densest collection in the roster
 * for look-alikes, and four of its groups reach OUTSIDE this file into species
 * that cannot be edited:
 *
 *   - FOUR EQUIDS. horse / donkey / mule here, plus `animal-pony`, already built
 *     in `home-pets.ts` (1.95, `legs: 1.55`, pointed ears, tuft tail, mane and
 *     snout, chestnut). Plus `animal-zebra` in Africa (2.10, mane, chalk-white).
 *   - THREE BOVINES. ox / water buffalo here, plus `animal-cow`, one of the
 *     FROZEN base 24 — and, discovered while writing this file, `animal-buffalo`
 *     in Africa (2.15, horns, round ears, tuft tail, near-black 0x413a36), which
 *     is the Cape buffalo and is a fifth animal in the same shape. See the water
 *     buffalo's own note: that pair is the one I would put in front of Joe first.
 *   - TWO CAMELIDS. llama / alpaca, separated on height, leg, face and fleece.
 *   - THREE GALLIFORMS. rooster / chicken here, plus `animal-chick`, frozen.
 *     Turkey, guinea fowl and quail are galliforms too and are held apart from
 *     the pair on size and marking rather than on anything the pair does.
 *   - ONE ANATID WITH A GHOST. The goose has to leave room for `animal-duck`,
 *     which is rostered in Birds and is NOT built yet. A goose that reads as a
 *     large duck today becomes a duplicate the day Birds ships, so it is built
 *     deliberately big (2.20, the tallest bird here) and long-necked (1.30),
 *     which is the separation a duck cannot later take away.
 *
 * Each separation is written down at the species it belongs to.
 */
import { defineSpecies } from '../define'
/*
 * Evaluated for its SIDE EFFECT, not for a name: each species module under
 * `parts/assembled/` registers its own build as it defines it, and
 * `defineSpecies` picks that up by id. Without this line all sixteen below would
 * find no assembly and would build as bare hulls.
 * `tests/island/assembly-constants.test.ts` fails loudly if it is ever dropped.
 */
import '../parts/assembled'
import type { Species } from '../types'

/**
 * SIXTEEN OF SIXTEEN, hand-assembled, on the parts route (PB-074).
 *
 * This array was EMPTY between 2 and 3 August 2026 and the reason is worth two
 * sentences, because it is why every record below says `'bespoke'`. All sixteen
 * were once kit-built, and Joe retired that route — *"only the garden animals
 * have been built to spec… do not build any more of them"*, then *"remove all
 * the blocky ones from the game completely, including the album."* Deleting
 * rather than replacing was safe because he confirmed the state that made it
 * safe: *"she has not collected any of them yet"*, so no save pointed at a Farm
 * species. The header above SURVIVED that deletion on purpose — it is the
 * measured separation work for all sixteen, and it was kept for whoever rebuilt
 * these on the assembly route. This run is that rebuild, and it was worth every
 * line: roster §4's four look-alike groups are the whole design problem here and
 * the header had already solved them.
 *
 * IN ROSTER ORDER, which is the order `roster.ts:592-608` lists them and the
 * order the album shows them. A collection whose file order disagrees with its
 * roster order is a trap `species-garden.test.ts:149` already exists to catch.
 *
 * Every record below is one line, deliberately. The reasoning for a species'
 * SHAPE — which hull, which part stands in for the horn or the beak the bank
 * does not have, what was refused and why — lives in its own
 * `parts/assembled/animal-<name>.ts`, where the number it justifies is on the
 * next line. Repeating any of it here would be a second copy to fall out of
 * date. What belongs here is what is true of the COLLECTION: the four
 * look-alike groups in the header, and one line per species saying which field
 * separates it from its nearest neighbour.
 */
export const FARM_SPECIES: readonly Species[] = [

  /* The woolly one, and the exemplar the other three fleece animals are cut
   * from. Fleece is carried by PALETTE, not by geometry — the bank has no
   * bumped or relief shape and JT-041 forbids authoring one. */
  defineSpecies('animal-sheep', 'bespoke'),

  /* The sheep's horned, un-woolly sibling. Horns are the separation and they
   * are a repurposed tusk; a goat that reads as a small sheep has failed. */
  defineSpecies('animal-goat', 'bespoke'),

  /* The big equid, and the exemplar for all five hooved quadrupeds. Two-tone
   * legs (JT-044) start here: the hoof is a painted patch, never a part. */
  defineSpecies('animal-horse', 'bespoke'),

  /* The horse's small grey sibling. Separated on EARS — the long droopy pair
   * the pony explicitly refused for reading as "a donkey's silhouette". */
  defineSpecies('animal-donkey', 'bespoke'),

  /* Built deliberately big and long-necked, because `animal-duck` is rostered
   * in Birds and is not built yet. A goose that reads as a large duck today
   * becomes a duplicate the day Birds ships; size is the separation a duck
   * cannot later take away. */
  defineSpecies('animal-goose', 'bespoke'),

  /* The biggest, darkest galliform, and the only one with a fanned tail. */
  defineSpecies('animal-turkey', 'bespoke'),

  /* The tall camelid. Separated from the alpaca on height, neck and ear — the
   * two are one animal to a child unless the difference is structural. */
  defineSpecies('animal-llama', 'bespoke'),

  /* The short, woollier camelid. Paler, blunter-faced, no upright ear. */
  defineSpecies('animal-alpaca', 'bespoke'),

  /* The chicken's showy male. Comb, wattle and a dark arched tail carry it;
   * the two share a body deliberately, because that is what they are. */
  defineSpecies('animal-rooster', 'bespoke'),

  /* The heavy bovine. Held apart from the FROZEN `animal-cow` and from
   * Africa's `animal-buffalo` — see the water buffalo's note, that pair is the
   * one to put in front of Joe first. */
  defineSpecies('animal-ox', 'bespoke'),

  /* Between the horse and the donkey on purpose, which is what a mule is: the
   * donkey's ears on something closer to the horse's build. */
  defineSpecies('animal-mule', 'bespoke'),

  /* The exemplar for all five galliforms, and the one that must stay clear of
   * the frozen `animal-chick`. Buff, combed, short-tailed. */
  defineSpecies('animal-chicken', 'bespoke'),

  /* The spotted one. Its markings are the separation and they are painted by
   * band, not built — the cheapest distinct galliform in the group. */
  defineSpecies('animal-guinea-fowl', 'bespoke'),

  /* The small round mottled one. Smallest bird in the collection, and the
   * only galliform here with no comb at all. */
  defineSpecies('animal-quail', 'bespoke'),

  /* The darkest, heaviest bovine, with the swept horns. The pair it makes with
   * Africa's near-black `animal-buffalo` is a genuine open question and is
   * written up in this species' own file for Joe. */
  defineSpecies('animal-water-buffalo', 'bespoke'),

  /* The only town bird here, and the only blue-grey one. Separated from every
   * galliform by colour before shape, which is what a child reads first. */
  defineSpecies('animal-pigeon', 'bespoke'),
]
