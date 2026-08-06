/**
 * The species records — the roster turned into things the game can build.
 *
 * PB-036, phase 1. `roster.ts` says WHICH species exist and which collection
 * each belongs to; this file says what each one IS. The split is deliberate and
 * it is the shipping unit: the roster is transcribed once, in full, from Joe's
 * ratified brief, whereas the registry grows **one collection at a time**, which
 * is what the roster's own header demands — "Not a build order — collections
 * ship one at a time, on the existing 85% unlock cadence."
 *
 * SO THE REGISTRY IS DELIBERATELY INCOMPLETE. Today it holds the live 24 and
 * nothing else. A species in the roster with no record here is a species that
 * has not shipped, and `tests/island/species-roster.test.ts` asserts exactly
 * that rather than demanding the registry be full. Do not "finish" this file.
 *
 * ADDING A COLLECTION (phase 2, one agent per collection):
 *   1. Write a `Species` record per member, with a `build` its kit understands.
 *   2. `defineSpecies` pulls the printed name out of the roster, so the two can
 *      never disagree and a typo is a thrown error at module load, not a pet
 *      called "Hedghog" forever.
 *   3. The collection is not playable until its kit exists — `buildSpecies`
 *      throws by name for the five kits that are declared but unbuilt
 *      (`kit.ts`), which is the loud failure HANDOFF §6 (line 565) asks for.
 */
import { defineSpecies } from './define'
import { GARDEN_SPECIES } from './collections/garden'
import { HOME_PETS_SPECIES } from './collections/home-pets'
import { WOODLAND_SPECIES } from './collections/woodland'
import { AFRICA_SPECIES } from './collections/africa'
import { FARM_SPECIES } from './collections/farm'
import { NIGHT_TIME_SPECIES } from './collections/night-time'
import { BIRDS_SPECIES } from './collections/birds'
import { OCEAN_SPECIES } from './collections/ocean'
import { JUNGLE_SPECIES } from './collections/jungle'
import { OUTBACK_SPECIES } from './collections/outback'
import { CRITTERS_SPECIES } from './collections/critters'
import { ICE_SPECIES } from './collections/ice'
import { NEAR_THREATENED_SPECIES } from './collections/near-threatened'
import { RAPTORS_SPECIES } from './collections/raptors'
import { VULNERABLE_SPECIES } from './collections/vulnerable'
import { CRITICALLY_ENDANGERED_SPECIES } from './collections/critically-endangered'
import { ENDANGERED_SPECIES } from './collections/endangered'
import { PREHISTORIC_SPECIES } from './collections/prehistoric'
import { DINOSAURS_SPECIES } from './collections/dinosaurs'
import { LEGENDARY_SPECIES } from './collections/legendary'
import type { Species } from './types'

/**
 * The invention guard now lives in `./define` so `collections/*.ts` can import
 * it without a cycle back through this file. Re-exported because callers and
 * tests import it from here and there is no reason to move them.
 */
export { defineSpecies } from './define'

/**
 * THE LIVE 24, FROZEN.
 *
 * Roster §1: "The live 24 are frozen (`animal-beaver … animal-tiger`). Never
 * rebuilt, never restyled." `kit: 'kenney'` is how that is said in code — it
 * means "an authored GLB exists for this; `pets.ts:554` loads it and no kit may
 * touch it". None of them carries a `build`, and `buildSpecies` throws if asked
 * to construct one, so there is no path by which a future kit quietly restyles
 * an animal Juno already owns. Brief §19.
 *
 * The order is `SPECIES` order from `pets.ts:19-26`, which a test pins.
 */
export const BASE_SPECIES: readonly Species[] = [
  'animal-beaver', 'animal-bee', 'animal-bunny', 'animal-cat', 'animal-caterpillar',
  'animal-chick', 'animal-cow', 'animal-crab', 'animal-deer', 'animal-dog',
  'animal-elephant', 'animal-fish', 'animal-fox', 'animal-giraffe', 'animal-hog',
  'animal-koala', 'animal-lion', 'animal-monkey', 'animal-panda', 'animal-parrot',
  'animal-penguin', 'animal-pig', 'animal-polar', 'animal-tiger',
].map(id => defineSpecies(id, 'kenney'))

/**
 * >>> NOT YET RECORDED: the seven base-24 threat badges.
 *
 * Roster §5 names them exactly — "any base-24 species that is threatened in
 * reality (tiger, elephant, giraffe, lion, koala, polar bear, panda) carries a
 * small status badge in the album wherever it lives". So WHICH seven is settled
 * and is transcribed below. What is NOT settled is each one's IUCN category, and
 * it is deliberately absent rather than guessed.
 *
 * Two reasons, and they are the same reason twice. Roster §5 requires the facts
 * be "true, checkable"; and `Threat.checkedDate` exists precisely so a status is
 * a dated reading of the Red List rather than a memory. Writing a category here
 * from recall would produce a record that LOOKS checked and is not, which is
 * worse than an absent one — `Species.threat` being optional already means "not
 * recorded yet", and that is an honest state.
 *
 * WHAT UNBLOCKS IT: someone reads the current Red List entry for each of these
 * seven, stamps the real date, and adds `threat` to the records above. That is a
 * ten-minute job for whoever has a browser, and it must happen before any badge
 * is shown. It is not blocked on Joe — but note roster §6 asks whether the badge
 * prints the IUCN category name or a softer child-facing phrase, and THAT is his.
 */
export const BADGED_BASE_SPECIES: readonly string[] = [
  'animal-tiger', 'animal-elephant', 'animal-giraffe', 'animal-lion',
  'animal-koala', 'animal-polar', 'animal-panda',
]

/**
 * The collections built in PB-036 phase 2, one file each.
 *
 * Each was written by its own agent against the finished quadruped kit and is
 * DELIBERATELY PARTIAL — every one of them has members waiting on a kit that
 * does not exist yet, and each collection's own test names those members and
 * asserts they are absent, so the gap is a tripwire rather than an oversight.
 * `SHIPPED_SPECIES` is the honest total; `roster.ts` is the ambition.
 *
 * Phase 2 measured that NO collection in the roster is 100% quadruped — the
 * closest is Garden at 13 of 14 — which is why JT-030 asks Joe whether a
 * collection may unlock with a hole in it. Until he rules, nothing here is
 * wired to a child.
 */
export const PHASE2_SPECIES: readonly Species[] = [
  ...GARDEN_SPECIES, ...HOME_PETS_SPECIES, ...WOODLAND_SPECIES, ...AFRICA_SPECIES,
]

/**
 * The collections built in PB-036 phase 3, on the songbird kit and the
 * quadruped kit together.
 *
 * FARM SHIPS COMPLETE — sixteen of sixteen, nine quadrupeds and seven
 * songbirds, with no member waiting on an unbuilt kit. It is the first
 * collection written that way, and its own test asserts it outright rather than
 * counting. That is the reason `species-registry.test.ts`'s "still has no
 * collection that is 100% shipped" check stops holding: that test's own comment
 * says it goes red the day a second kit lands and JT-030 (may a collection
 * unlock with a hole in it?) becomes live. The songbird kit landed; this is that
 * day. Woodland's two game birds went in on the same kit in the same run, so
 * expect that check to name more than one collection.
 */
export const PHASE3_SPECIES: readonly Species[] = [...FARM_SPECIES]

/**
 * NIGHT TIME — the first collection built end to end on the ASSEMBLY route, and
 * the first with no kit build anywhere in it.
 *
 * It gets its own export rather than joining `PHASE3_SPECIES` because it is not
 * the same kind of thing. Every record above this line came out of a kit and
 * carries a `build` object of proportions; every record in this one carries an
 * `assembly` picked up by id off `parts/assembled/register.ts` and no `build` at
 * all. Joe ruled on 2 August that the kit route is finished — *"the old blocky
 * ones that can be deleted to be honest. do not build any more of them"* — so
 * this constant is where every collection from here on lands, and the three
 * above it are the ones awaiting his deletion.
 *
 * THIRTEEN OF SIXTEEN, and the shortfall is measured rather than pending:
 * `animal-bat` and `animal-sugar-glider` want a membrane and `animal-scorpion`
 * wants a pincer, and the `wing`, `horn` and `claw` roles occur zero times in
 * the bank. `collections/night-time.ts` carries the ruling and
 * `tests/island/species-night-time.test.ts` measures the absence every run.
 */
export const NIGHT_TIME_COLLECTION: readonly Species[] = [...NIGHT_TIME_SPECIES]

/**
 * BIRDS — the first collection to arrive with NO kit era behind it at all.
 *
 * Every other constant above this line names a collection the kit route built
 * once and Joe then had deleted, so each of them is a REBUILD and its file
 * carries a header written for a mechanism that no longer exists. There has
 * never been a `collections/birds.ts`; this one was written on the assembly
 * route from the first line.
 *
 * FIVE OF EIGHTEEN, and the shortfall is measured rather than pending. The five
 * are passerines and they are one shape in five palettes, which is what those
 * birds are. The thirteen missing split two ways and `collections/birds.ts`
 * surveys both: some want a bill the pack does not contain — a spatulate, a
 * spear, a pouch, a filter, an outsized hook — and four of them (swan, heron,
 * stork, flamingo) want a NECK, which rule 3 forbids outright, because head and
 * body are one mass and there is no seam at the neck on any of the 24.
 */
export const BIRDS_COLLECTION: readonly Species[] = [...BIRDS_SPECIES]

/**
 * OCEAN — roster row 4, and the first collection here that is COMPLETE at
 * sixteen of sixteen while being honest that four of them are not finished.
 *
 * `collections/ocean.ts` carries the survey and it corrects a claim this repo
 * has repeated since 29 July: `docs/how-the-animals-are-made.md` §14 says the
 * pack has "no fin, flipper or fluke" and counts Ocean among the 64 impossible.
 * The `wing` role baked on 4 August put `box-42`/`box-43` — provenance
 * `fish:wing`, a handed mirrored pair — into `PARTS_BANK`. Those are the fish's
 * own fins, and a penguin's `blade-06` is a flipper needing no reinterpretation
 * at all. The collection was never blocked on a fin.
 *
 * FOUR ARE PLACEHOLDERS and are marked as such in their own files rather than
 * quietly counted as built: the jellyfish and the sea turtle want a DOME, the
 * seahorse wants a CURVE the bank does not contain in any of its 100 shapes,
 * and the lobster wants a CLAW — which the pack HAS and the generator has
 * simply never baked. All three are commissions for Joe; the last one is one
 * line in `tools/pets/parts-bank.ts` and is left alone because baking a role
 * renumbers the whole bank silently.
 */
export const OCEAN_COLLECTION: readonly Species[] = [...OCEAN_SPECIES]

/**
 * JUNGLE — roster row 12, and the collection that collides with more built
 * animals than any other.
 *
 * It is the primate-and-big-cat row: three primates against the FROZEN
 * `animal-monkey`, Africa's `animal-gorilla` and `animal-baboon`, and Night
 * Time's four small ones; two spotted cats against the frozen lion and tiger,
 * Africa's cheetah and Woodland's lynx and wildcat; an anteater against Africa's
 * aardvark, a capybara against Woodland's coypu, a coati against Night Time's
 * raccoon, and a snake against two other legless animals plus Ocean's eel.
 * `collections/jungle.ts` carries the measured separation for every one of them,
 * hull by hull and card by card, and the two internal pairs (jaguar/ocelot,
 * chameleon/iguana) are measured there too.
 *
 * SIXTEEN OF SIXTEEN HAVE AN ENTRY AND FIFTEEN ARE REAL ANIMALS. The one
 * placeholder is `animal-tarantula`, and it is held up by three things: the bank
 * holds ONE leg shape and a spider's bends twice; a spider is two masses joined
 * at a waist, which is rule 3's exact fault; and eight eyes against rule 6's
 * mirrored pair. Only the segmented leg is a commission. The collection also
 * hits the project's oldest wall five times over — a PATTERN cannot be painted,
 * because colour is a lookup with no positional information — which costs the
 * jaguar's rosettes, the ocelot's chains, the lemur's and the coati's tail rings
 * and the snake's net. Every one of those five files says so in its own flag.
 */
export const JUNGLE_COLLECTION: readonly Species[] = [...JUNGLE_SPECIES]

/**
 * OUTBACK — roster row 11, and the second collection to retire a sentence in
 * `docs/how-the-animals-are-made.md` §14 by measuring it.
 *
 * That section has said since 29 July that *"Legendary (12) and Outback (16) are
 * near-total failures"*, grouped with the four collections it called impossible.
 * `collections/outback.ts` re-censuses the bank against these sixteen and finds
 * the sentence wrong in the same way Ocean's was: it counts a part by the name
 * Kenney gave it rather than by its shape. The platypus's bill is the LION's
 * flat muzzle plate and its tail is the BEAVER's own paddle; the echidna and the
 * thorny devil are the hedgehog's repeat-and-sink; the emu is the goose's neck
 * idiom; and the four birds are the galliform and kingfisher idioms already
 * built. **A claim about what the bank cannot do expires the moment an idiom
 * lands — date it, or it outlives its own truth.**
 *
 * SIXTEEN OF SIXTEEN HAVE AN ENTRY AND THIRTEEN ARE REAL ANIMALS. The three
 * placeholders are `animal-kangaroo`, `animal-frilled-lizard` and
 * `animal-lyrebird`, and between them they wait on four things: a LONG HIND LEG
 * (one shape at one absolute height — one commission that would also improve the
 * quokka, the emu and the ostrich); a HULL THAT CAN BE STOOD UP, which is a
 * builder-side gap rather than a missing shape; a DISC, where the authored
 * `bespoke-circle-01` was considered and refused because JT-041 names a FRILL by
 * name as a thing the three base shapes are not for; and a CURVE, which this is
 * now the THIRD collection to price after Ocean's seahorse and Birds' flamingo.
 * Every one of the three says so in its own header and its own `flag`.
 */
export const OUTBACK_COLLECTION: readonly Species[] = [...OUTBACK_SPECIES]

/**
 * CRITTERS — roster row 6, and the THIRD collection to retire a sentence in
 * `docs/how-the-animals-are-made.md` §14 by measuring it rather than reading it.
 *
 * That section has said since 29 July that Critters *"cannot be built from these
 * parts at all — no membranous insect wing, no segmented leg"*, and half of that
 * is false for exactly the reason Ocean's was. `blade-06`/`blade-07` sit in
 * `PARTS_BANK` with `roles: ["wing"]` and **`bee:wing-left` as the FIRST
 * provenance entry**, which the bank's own header says is the donor that gave
 * the geometry — so those vertices came out of the pack's bee and a bee's wing
 * is a membranous insect wing. They were baked on 4 August for the budgie, and
 * §3.1 had already recorded on 29 July that the bee's *"are true insect wings"*.
 * The three species that wear the shape today all call it the penguin's flipper,
 * because the two donors are bit-identical and Ocean got there first; seven
 * species here wear it as a wing.
 *
 * The OTHER half is true and is not what stops anything: the bank holds one leg
 * shape, `box-01`, a 0.375 taper-1.000 stub, and Kenney gave his own two insects
 * four of them each.
 *
 * SIXTEEN OF SIXTEEN HAVE AN ENTRY AND FOURTEEN ARE REAL ANIMALS. The two
 * placeholders are `animal-snail`, which wants a CURVE — the fourth collection
 * to price it after Ocean's seahorse, Birds' flamingo and Outback's — and
 * `animal-stick-insect`, which wants an ELONGATED HULL and is a RULING rather
 * than a commission, `HullDef.stretch` being `never` by Joe's own instruction.
 * `collections/critters.ts` also prices a HINGED LIMB, which no placeholder
 * waits on but three BUILT species do (spider, grasshopper, mantis) — the same
 * shape Jungle's `animal-tarantula` and Outback's `animal-kangaroo` each name.
 */
export const CRITTERS_COLLECTION: readonly Species[] = [...CRITTERS_SPECIES]

/**
 * ICE — roster row 3, and the collection where EVERY member has a twin and
 * almost every member is white.
 *
 * Earlier collections had one of those problems. Woodland had to tell three
 * mustelids and two cats apart from each other; Ocean had a whale, a shark and a
 * dolphin that are all grey legless things on a cube. Ice has both at once, and
 * on top of them **eight of its sixteen are white or near-white animals**, so
 * palette carries almost none of the separation and it has to be made in shape.
 * `collections/ice.ts` counts the collisions — sixteen of sixteen, against the
 * frozen fox, bunny, deer and cat, against Woodland's stoat, mink, hare and elk,
 * against Ocean's whale, dolphin and shark, against Africa's buffalo, Farm's ox,
 * sheep, goat and five galliforms, and against Birds' owlet, seagull and puffin
 * — and every separation is written at the species it belongs to.
 *
 * FIFTEEN OF THE SIXTEEN ARE REAL ANIMALS. The one placeholder is
 * `animal-dall-sheep`, and what it waits on is a CURVE: all 100 baked shapes are
 * straight or tapered along a single axis, rule 4 bakes a rotation into a copy
 * and cannot bend one, and a Dall ram's spiral horn IS the animal. Ocean priced
 * that same gap for the seahorse and Birds for the flamingo's bill. Ice asks for
 * it three times over — the ram's spiral, a musk ox's hooked horn and a
 * narwhal's helical tusk — and only the ram is held up by it, because the other
 * two read straight at tablet distance.
 *
 * TWO THINGS THIS COLLECTION ADDS TO THE VOCABULARY, both argued in `ice.ts`:
 * `box-06`, the bunny's ear, LEFT UNSPUN AS A DORSAL FIN on the orca — 0.913 of
 * reach against the `wedge-19` every other cetacean stands on its crown — and
 * `box-29`, the lion's mane, worn as a musk ox's SKIRT reaching the ground,
 * which is the vulture's ruff moved down the body and cut on DEPTH ONLY, because
 * `assembly-assert.ts`'s one-mass ratio is what pays for the reach.
 */
export const ICE_COLLECTION: readonly Species[] = [...ICE_SPECIES]

/**
 * NEAR THREATENED — roster row 16, and the only collection in the roster NAMED
 * for an IUCN category.
 *
 * That makes the standing rule about `threat` records sharper rather than
 * softer, and `collections/near-threatened.ts` says it at length: the status is
 * the collection's PREMISE and **no dated reading of the Red List was taken**,
 * so not one of the twelve carries a `threat` record. Writing categories from
 * recall would produce records that LOOK checked, which is the exact line this
 * file holds for the base 24's seven badges at :67-88. The collection's name is
 * what a builder was given; the collection's data claims nothing.
 *
 * TWELVE OF TWELVE HAVE AN ENTRY AND NINE ARE REAL ANIMALS. Held together by a
 * category rather than a place, these twelve collide with nothing internally and
 * with almost everything externally — five bovids, eight cats, five cetaceans,
 * three camelids, two hyenas and a FROZEN penguin are all already built — and
 * every one of the twelve separations is written at the species.
 *
 * The three placeholders are `animal-maned-wolf`, `animal-jerboa` and
 * `animal-markhor`, and between them they want two things. The markhor wants a
 * HELIX, which is a CURVE at one more dimension and the sixth time a collection
 * has priced that absence after Ocean, Birds, Outback, Critters and Ice. The
 * other two want a LONG LEG — the same shape `animal-kangaroo.ts` and
 * `animal-ostrich.ts` priced as a long hind leg, and counted across the whole
 * register today one leg would finish EIGHT animals, which is the highest-value
 * single commission on the board.
 */
export const NEAR_THREATENED_COLLECTION: readonly Species[] = [...NEAR_THREATENED_SPECIES]

/**
 * RAPTORS — the collection `docs/how-the-animals-are-made.md` §14 declared
 * impossible in three words, all three of which were measured before a line was
 * written, because that paragraph has already been wrong once.
 *
 * *"No spread wing"* is flatly false and was false before this collection
 * started: the `wing` role holds six shapes, `wedge-19` attaches `x +1` at a
 * measured sink of 0.175 and therefore stands 0.4727 clear of a cube's flank,
 * and `animal-vulture.ts` had already shipped a bird 2.1960 across on it. *"No
 * talon"* is false in Ocean's exact way — §7 censuses ten distinct claw shapes
 * with the crab, lion, tiger and polar as donors, and `claw` occurs ZERO times
 * in the baked bank, so the shape is in a `.glb` in this repo and not in the
 * module. That is one line in the generator and it is Joe's, because baking a
 * role renumbers the bank. *"No hooked beak"* is the one that survives, and only
 * halfway: there is no CURVE in any of the 100 shapes, but a hook is a tip that
 * turns down, and `cone-06` plus a second `nose` shape anchored `on: 'snout'`
 * and spun about x says that in two straight parts.
 *
 * FIFTEEN OF THE SIXTEEN ARE REAL ANIMALS. The one placeholder is
 * `animal-harpy-eagle`, held up by a SPLIT crest — both ways of saying a crest
 * here read as another animal — and by SIZE, which is a ruling rather than a
 * commission: the hull is never scaled, so the whole size vocabulary is the ten
 * real shells and their volume range is 1.37x.
 *
 * FOUR THINGS THIS COLLECTION ADDS TO THE VOCABULARY, all argued in `raptors.ts`:
 * the two-part HOOK; the BELLY PATCH INVERTED, which turns a pale underside into
 * a white head and which two existing files say is impossible; a FLANK CARD SPUN
 * FORWARD as a brow, a moustache, an eye-stripe and a FACIAL DISC, which
 * `animal-owlet.ts` also says cannot be built; and the first FORKED TAIL in the
 * project, which is nothing more than `kind: 'pair'` on a tail.
 */
export const RAPTORS_COLLECTION: readonly Species[] = [...RAPTORS_SPECIES]

/**
 * VULNERABLE — roster row 17, and the collection whose NAME makes a claim this
 * file refuses to let it make.
 *
 * It is named for an IUCN Red List category and **not one of its twelve records
 * carries a `threat`**. That is the same line the block at the top of this file
 * holds for the base 24 and it matters more here than anywhere: roster §5 wants
 * statuses *"true, checkable"*, `Threat.checkedDate` exists so a status is a
 * dated reading rather than a memory, and writing twelve categories from recall
 * would produce twelve records that LOOK checked — with the collection's own
 * name standing in for the corroboration. Absent means "not recorded yet".
 * `collections/vulnerable.ts` opens on that and says what would unblock it.
 *
 * TWELVE OF TWELVE HAVE AN ENTRY AND ALL TWELVE ARE REAL ANIMALS — no member is
 * held up by a shape the bank does not contain, which is the first collection
 * since Woodland to be able to say so. Five carry a flag naming what they
 * strained; the macaw's is this project's SIXTH pricing of the CURVE, after
 * Ocean's seahorse, Birds' flamingo, Outback's frilled lizard, Critters' snail
 * and Ice's Dall ram, and it is the hooked beak `docs/how-the-animals-are-made.md`
 * §14 still correctly names as absent.
 *
 * ITS MEMBERS COME FROM EVERY HABITAT IN THE ROSTER, so unlike Ice or Jungle it
 * has no shared palette and no collection-level idiom, and it had to separate
 * INWARDS four times as well as outwards: three black bears, two sirenians and
 * two bovids. Each was solved by finding one measured fact and spending it — the
 * pack's ONE forward-facing hull band (`box-39`'s band 3) went to the moon bear
 * and the other two bears wear a marking card TURNED TO FACE FORWARD, which is a
 * placement no card in this project had before; the dugong takes a fluke and the
 * manatee the BEAVER'S OWN PADDLE, which is genuinely the whole difference
 * between the two families; and the takin and the gaur refused to argue about
 * horn angles, one being built around a muzzle stretched on its own HEIGHT and
 * the other around a dorsal ridge made from the hog's nose pad.
 *
 * IT IS ALSO THE FIRST COLLECTION WITH NO BURIED EYES. `box-41`'s front face
 * stands at z = 0.725 and `EYE_CARD_Z` is an absolute 0.6350, so an eye card on
 * the tiger's shell sits 0.09 inside the head — ten built species carry that and
 * only `animal-whale.ts` names it. No member here is on `box-41`, which was one
 * decision taken once instead of twelve arguments.
 */
export const VULNERABLE_COLLECTION: readonly Species[] = [...VULNERABLE_SPECIES]

/**
 * CRITICALLY ENDANGERED — roster row 19, and the collection NAMED for a status
 * that it deliberately does not record.
 *
 * `collections/critically-endangered.ts` opens on that, because it is the thing
 * a reader will otherwise assume the other way round. Roster §5 wants a threat
 * status "true, checkable" and `Threat.checkedDate` exists so a status is a
 * DATED reading of the Red List rather than a memory. Twelve categories written
 * from recall would be twelve records that LOOK checked, with the collection's
 * own name doing the vouching — which is worse than none. So **not one of the
 * twelve carries a `threat`**, the status is the collection's PREMISE, and the
 * absence means "not recorded yet", exactly as it does for the seven badged
 * base-24 species sixty lines above this one.
 *
 * TWELVE OF TWELVE HAVE AN ENTRY AND ELEVEN ARE REAL ANIMALS. The one
 * placeholder is `animal-axolotl`, and what it waits on is a shape nobody has
 * asked for before: a BRANCHED FROND. All 100 baked shapes are single solid
 * masses, straight or tapered along one axis, and not one of them forks — rule 4
 * as amended bakes a rotation into a copy's vertices and cannot fork one. Six
 * `cone-01` on the chamfer row stand in and read as a crown of spikes.
 *
 * ITS MEMBERS COME FROM TWELVE DIFFERENT HABITATS, which is the design problem:
 * nothing holds the collection together and every separation is made against a
 * different already-built animal — three rhinos in the tree at once, a seventh
 * spotted cat, a sixth parrot, an eighth primate, a second crocodilian and a
 * porpoise among six cetaceans.
 *
 * THREE THINGS IT ADDS TO THE VOCABULARY, all argued in the collection file:
 * `blade-05` as a FACIAL DISC, which only works on `box-31` — the lion's shallow
 * shell puts the plate's front at 0.6250 so the eye cards float the pack's own
 * 0.010 proud of it, where on any usual hull the disc would bury the eyes;
 * §8's repeat-and-sink run over a CROWN rather than a spine, which on a one-mass
 * animal is a crest; and `box-25`, the koala's ear, left on its own `x +1`
 * attachment as an orangutan's cheek FLANGE.
 */
export const CRITICALLY_ENDANGERED_COLLECTION: readonly Species[] =
  [...CRITICALLY_ENDANGERED_SPECIES]

/**
 * ENDANGERED — roster row 18, and the third collection in a row whose NAME makes
 * a claim its data deliberately does not.
 *
 * **Not one of its twelve records carries a `threat`**, for the reason the block
 * at :67-88 gives for the base 24's seven badges and `NEAR_THREATENED_COLLECTION`
 * and `VULNERABLE_COLLECTION` each give for theirs: roster §5 wants statuses
 * *"true, checkable"*, `Threat.checkedDate` exists so a status is a DATED reading
 * of the Red List rather than a memory, and twelve categories written from recall
 * would produce twelve records that LOOK checked — with the row's own name
 * standing in for the corroboration. `collections/endangered.ts` opens on that
 * and says what would unblock it: somebody with a browser, twelve Red List
 * entries and a real date.
 *
 * TWELVE OF TWELVE HAVE AN ENTRY AND ELEVEN ARE REAL ANIMALS. Its members come
 * from every habitat in the roster, so like Vulnerable it has no shared palette
 * and no collection-level idiom — and because the register now holds 200+
 * species, **all twelve collide outwards**: six primates, four canids, six
 * cetaceans, five procyonids, three lizards and three long-necked birds are
 * already built. Every separation is written at the species.
 *
 * The one placeholder is `animal-blue-whale`, and what it waits on is an
 * ELONGATED HULL, which is a RULING and not a commission: `HullDef.stretch` is
 * `never` on Joe's own instruction of 2 August, all ten shells the pack drew are
 * within 25% of a cube, and the biggest is `box-41` at 1.350 x 1.300 x 1.350
 * against a real blue whale's 4.5:1 — so the longest animal that has ever lived
 * is a box. `collections/critters.ts` records the identical wall for
 * `animal-stick-insect`.
 *
 * NOTHING HERE WANTS THE CURVE, THE DOME OR THE LONG HIND LEG, which is worth
 * saying because those three are the standing commissions and this is the first
 * collection to check all twelve of its members against them and add none.
 * `animal-tree-kangaroo` goes further and SUBTRACTS from the last of them: a
 * tree kangaroo walks on four limbs of nearly equal length, so the long hind leg
 * that would finish the kangaroo, the quokka, the emu and the ostrich buys it
 * nothing at all.
 *
 * FIVE THINGS IT ADDS TO THE VOCABULARY, all argued in the collection file: the
 * first PRIMATE WITH EARS in a project that has built six without one; the first
 * FORKED TONGUE, out of the caterpillar's 16-triangle tooth; `animal-raccoon.ts`'s
 * mask card moved ONE NUMBER so the mirrored pair stops short of the midline
 * instead of meeting on it; a FLUKE AS TWO LOBES where `animal-whale.ts` spins
 * one flat blade; and `box-42`/`box-43`, the FISH's own pectoral fins, which no
 * one of the 190 species built before this collection had ever reached for.
 */
export const ENDANGERED_COLLECTION: readonly Species[] = [...ENDANGERED_SPECIES]

/**
 * PREHISTORIC — roster row 20, and the first collection in this project where
 * the whole of every member is EXTINCT.
 *
 * That settles the `threat` question harder than any of the four IUCN-named rows
 * did. Those collections leave `threat` absent because no dated Red List reading
 * was taken; this one leaves it absent because **a conservation category on an
 * extinct animal is nonsense before it is unchecked** — the categories describe
 * living populations and there is no reading to take. Not one of the twelve
 * carries a `Threat`, and here "absent" means "not applicable" as well as "not
 * recorded".
 *
 * TWELVE OF TWELVE ARE REAL ANIMALS AND NONE IS A PLACEHOLDER, which is the
 * first collection since Vulnerable able to say so and is a claim
 * `collections/prehistoric.ts` defends rather than asserts. The reason it is
 * true is structural: **eight of the twelve are a living animal at different
 * proportions with a coat on, and the living animal is already built.** A
 * mammoth is an elephant, a sabre-tooth a cat, a dire wolf a wolf, a cave bear a
 * bear, a woolly rhino a rhino, a quagga a zebra, an Irish elk an elk, a
 * megalodon a shark — so the design question is uniform and sharp, and every
 * separation is one measured swap argued at the species.
 *
 * WHAT IT ADDS TO THE VOCABULARY, all argued in the collection file: `blade-05`
 * — the lion's flat muzzle plate, worn three times before and always as a FACE —
 * laid horizontal as the project's first PALMATE ANTLER; a marking said by NOT
 * placing a card, which is the quagga and is the only pattern this project has
 * ever been able to express; the first THREE-DEEP `on` chain, neck to head to
 * bill to hook on the terror bird; and the two eye cards `plate-04` and
 * `plate-09`, which no one of the 200-odd built species had ever spent.
 *
 * WHAT IT PRICES: the CURVE twice more (a mammoth's tusk, a terror bird's bill),
 * the DOME twice more (a cave bear's brow, a glyptodon's carapace — the fifth
 * and sixth askings), the LONG HIND LEG twice more, and the `claw` role, which
 * §7 censuses as ten shapes and which has still never been baked. It also hits
 * the ELONGATED-HULL wall twice, which is a RULING and not a commission: the
 * hull is never scaled, the ten shells span 1.21x by volume, and a megalodon is
 * therefore a fifth bigger than a great white rather than three times.
 */
export const PREHISTORIC_COLLECTION: readonly Species[] = [...PREHISTORIC_SPECIES]

/**
 * DINOSAURS — roster row 14, and the THIRD collection to retire a sentence in
 * `docs/how-the-animals-are-made.md` §14 by measuring instead of reading.
 *
 * That line said *"no frill, no plate, no spine"* and it prevented this
 * collection for eight days, exactly as it prevented Ocean and Critters. **All
 * three of its words are answered by ONE record.** `blade-05` — the lion's
 * muzzle plate, `roles: ["nose"]`, measured 1.000 x 1.000 x 0.125 at eighteen
 * triangles — is the only large flat slab the pack drew, has been in the bank
 * since the first bake, and had never been stood on its edge in 250 species. It
 * is the triceratops's leaned frill, the stegosaur's four dorsal plates, the
 * spinosaur's whole sail and the dilophosaur's paired crests.
 *
 * **The pattern is now three for three: in every case the shape was present and
 * the ROLE LABEL hid it** — Ocean's fins under `wing`, Critters' insect wing
 * under `wing`, these three under `nose`. §3.1 named that failure on 29 July.
 * The one entry left on §14's list is RAPTORS and it should be measured.
 *
 * SIXTEEN OF SIXTEEN ARE REAL ANIMALS AND NONE IS A PLACEHOLDER, which no
 * collection §14 had ruled impossible has managed before — Ocean shipped twelve
 * and four, Critters fourteen and two.
 *
 * WHAT IT ADDS TO THE COMMISSION BOARD is mostly the LONG HIND LEG: ten of its
 * sixteen are bipedal theropods standing on `animal-chicken.ts`'s biped station,
 * which takes the register from nine species behind that one part to eighteen.
 * It also puts a FOURTH species behind the DOME (`animal-pachycephalosaurus`,
 * after Ocean's jellyfish and turtle and Garden's tortoise) and a SECOND behind
 * the never-baked CLAW (`animal-velociraptor`, after Ocean's lobster). It wants
 * no CURVE at all, which makes it the second collection after Endangered to
 * check every member against that one and add none.
 */
export const DINOSAURS_COLLECTION: readonly Species[] = [...DINOSAURS_SPECIES]

/**
 * LEGENDARY — roster row 16, and the third collection to retire a sentence in
 * `docs/how-the-animals-are-made.md` §14 by measuring it instead of reading it.
 *
 * That section has said since 29 July that *"Legendary (12) and Outback (16) are
 * near-total failures"*. Outback came out thirteen of sixteen; this comes out
 * **ELEVEN BUILT AND ONE PRICED PLACEHOLDER**, and not one of the eleven needed
 * a shape the bank has not got. `collections/legendary.ts` lists every part it
 * reached for beside the animal Kenney drew it on: a unicorn's horn is the BEE'S
 * ANTENNA stretched, a dragon's back ridge is the HOG'S EAR (§3.1's own worked
 * example, specified by Joe on 29 July and never built until now), a griffin's
 * tail is the LION'S TAIL, Nessie's neck is the ELEPHANT'S TRUNK stood on end
 * and her humps are the KOALA'S EAR sunk 0.53 of itself. **`cone-01` and
 * `box-18` between them carry six of the twelve.**
 *
 * THE ONE PLACEHOLDER IS `animal-sphinx`, and what stops it is a HUMAN FACE:
 * Kenney drew twenty-four animals and no people, and of the bank's 100 records
 * the `nose` role holds 28 distinct shapes of which every one is an animal's
 * muzzle, beak, nose-tip or nostril card. It is also exactly where §3.2 says the
 * repurposing multiplier stops paying, because a face carries a read that
 * survives being moved. It ships as the lion body with the Great Sphinx's nemes
 * headdress and a deliberately blank front, and the cheapest thing that would
 * finish it — one authored flat FACE CARD — is priced in its own file.
 *
 * WHAT IT ADDS TO THE COMMISSION BOARD: two more species behind the never-baked
 * CLAW (the griffin, whose talons were cut for rule 9 at 918 of 951, and the
 * thunderbird, which wears the elephant's tusk as `animal-golden-eagle.ts` does)
 * and one more behind the CURVE (the kraken's arms, which should curl). It adds
 * NO new line. It also REFINES the dome: Loch Ness wanted three humps and got
 * them out of a sunk `box-25`, so that commission is for a hollow BELL and a
 * CARAPACE and not for a mound.
 *
 * AND IT IS THE ONE COLLECTION WHERE A `threat` RECORD WOULD BE NONSENSE RATHER
 * THAN MERELY UNCHECKED — a conservation status for a creature that does not
 * exist. For the same reason every fact row it adds is written about the LEGEND
 * rather than about the animal, so that nothing in `joe/species-facts.json`
 * states a falsehood to a child; all twelve are `flagged` and none is `verified`.
 */
export const LEGENDARY_COLLECTION: readonly Species[] = [...LEGENDARY_SPECIES]

/** Everything that has actually shipped: the frozen 24 plus the built collections. */
export const SHIPPED_SPECIES: readonly Species[] = [
  ...BASE_SPECIES, ...PHASE2_SPECIES, ...PHASE3_SPECIES, ...NIGHT_TIME_COLLECTION,
  ...BIRDS_COLLECTION, ...OCEAN_COLLECTION, ...JUNGLE_COLLECTION, ...OUTBACK_COLLECTION,
  ...CRITTERS_COLLECTION, ...ICE_COLLECTION, ...NEAR_THREATENED_COLLECTION,
  ...RAPTORS_COLLECTION, ...VULNERABLE_COLLECTION, ...CRITICALLY_ENDANGERED_COLLECTION,
  ...ENDANGERED_COLLECTION, ...PREHISTORIC_COLLECTION, ...DINOSAURS_COLLECTION,
  ...LEGENDARY_COLLECTION,
]

/** Every species that has actually shipped, by id. */
export const REGISTRY: ReadonlyMap<string, Species> = new Map(
  SHIPPED_SPECIES.map(s => [s.id, s]),
)

/** The record, or undefined if the species is in the roster but has not shipped. */
export function speciesRecord(id: string): Species | undefined {
  return REGISTRY.get(id)
}

/**
 * The species of one collection that have actually shipped.
 *
 * Returns fewer members than the roster lists while a collection is mid-build,
 * which is the normal state of every collection except `base`. The collection
 * deck (`collection.ts:87`) must be primed from THIS, never from the roster, or
 * a child is dealt an egg containing a creature that cannot be built.
 */
export function shippedIn(collectionId: string): readonly Species[] {
  return SHIPPED_SPECIES.filter(s => s.collection === collectionId)
}
