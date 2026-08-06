/**
 * The Legendary collection — roster row 16, `ship: 20`, name band `long`.
 *
 * NEW FILE, 6 August 2026. There has never been a `collections/legendary.ts`;
 * this one was written on the assembly route from the first line.
 *
 * ===========================================================================
 * ## §14 CALLS THIS COLLECTION A "NEAR-TOTAL FAILURE". IT IS ELEVEN OF TWELVE.
 * ===========================================================================
 *
 * `docs/how-the-animals-are-made.md` §14 has said since 29 July:
 *
 * > **Legendary (12)** and **Outback (16)** are near-total failures for the same
 * > reason.
 *
 * Outback came out **thirteen of sixteen** on 5 August. This came out **eleven
 * built and one priced placeholder**, and — the part worth knowing — **not one
 * of the eleven needed a shape the bank has not got.** The sentence was not
 * nearly right; it was wrong in the same way it was wrong about Ocean and about
 * Critters, and for the same reason both times: it counts a part by the name
 * Kenney gave it rather than by the shape.
 *
 * Every part this collection reached for was already in the bank and already in
 * use somewhere else:
 *
 *       a unicorn's horn      cone-01, the BEE'S ANTENNA, stretched 2.6x
 *       a dragon's back ridge cone-04, the HOG'S EAR — §3.1's own example
 *       a dragon's wings      blade-06, the BEE'S WING
 *       a griffin's tail      wedge-15, the LION'S TAIL, on a lion-bodied animal
 *       a hippogriff's tail   box-38, the PARROT'S FAN, upside down as a dock
 *       a yeti's arms         box-18, the ELEPHANT'S TRUNK, re-axised to hang
 *       a kraken's tentacles  box-18 again, eight of them
 *       Nessie's neck         box-18 again, stood on END — the goose's idiom
 *       Nessie's humps        box-25, the KOALA'S EAR, sunk 0.53 of itself
 *       a jackalope's antlers cone-01 again, two per side, forked with `on`
 *       a thunderbird's crest cone-01 again, three in a ridge row
 *
 * **`cone-01` and `box-18` between them carry six of the twelve.** One is a
 * bee's antenna and one is an elephant's tail, and neither was drawn for
 * anything either is doing here. That is §3.1 — *"a part's identity comes from
 * where it is placed, how many there are, and how deep it is sunk"* — paying out
 * harder in this collection than in any other, because a mythical animal has no
 * ground truth to be wrong about.
 *
 * ===========================================================================
 * ## THE THING THIS COLLECTION LEARNED, AND THE NEXT ONE SHOULD HAVE
 * ===========================================================================
 *
 * **A LEGENDARY CREATURE CANNOT BE WRONG, SO THE WHOLE COST MOVES SOMEWHERE
 * ELSE.** Nobody can say a unicorn's proportions are off the way they can say a
 * stoat's are. A horse with one horn IS a unicorn. So the separation work that
 * dominates every other collection — this animal against that animal, measured
 * hull by hull — has nothing internal to bite on.
 *
 * **What it does bite on is the ANIMALS THAT ALREADY EXIST, and that turned out
 * to be the real bill.** Eight of these twelve are one lifted part away from a
 * species already built, and every one of those eight had to be held apart from
 * it rather than from its neighbours here:
 *
 *   - **unicorn** against `animal-horse` and `animal-pony`. It is the horse part
 *     for part; the horn and the white are the whole difference.
 *   - **griffin** and **thunderbird** against `animal-golden-eagle`, which is
 *     Raptors' exemplar and shares the two-part hooked bill with both.
 *   - **hippogriff** against the **griffin** — the one genuinely internal pair,
 *     and the hardest, since they share a head. Five separations, in that file.
 *   - **yeti** against `animal-gorilla` and four other apes.
 *   - **kraken** against `animal-octopus` and `animal-squid`, both of which wear
 *     the same `box-18` arm.
 *   - **jackalope** and **moon rabbit** against `animal-hare`,
 *     `animal-arctic-hare` and the frozen `animal-bunny` — and against each
 *     other, which makes four rabbits.
 *   - **sphinx** against `animal-lion`, which is frozen.
 *
 * So the useful sentence for the next builder is: **in a mythical collection the
 * roster §4 problem is external, not internal, and it is bigger rather than
 * smaller.** Budget for it the same way.
 *
 * ===========================================================================
 * ## FIVE MEASUREMENTS THIS COLLECTION MADE
 * ===========================================================================
 *
 * **1. `box-31`, THE LION'S SHELL, HAS NO FRONT FACE — measured here, off its
 * own points.** Its maximum z is 0.500, **zero triangles lie in that plane**, and
 * the points there form a ring spanning x -0.500 to 0.500 by y 0.306 to 1.306: a
 * **1.000 x 1.000 hole** in the front of the head, which exists because the
 * lion's `box-29` mane ring is what covers it. `animal-goose.ts:70` records the
 * same finding as PB-075 and refuses the shell on it; this is the independent
 * confirmation, and it is why both the griffin and the sphinx are on other
 * hulls. **`animal-hare` and `animal-stoat` both wear `box-31` today** — that is
 * Joe's to look at in the editor, not a doc fix and not this collection's.
 *
 * **2. §8'S 45 DEGREES IS ABOUT WHERE A PART JOINS, NOT WHERE IT POINTS.** The
 * chamfer idiom prescribes the chamfer's own normal, and the unicorn's horn built
 * that way measured **1.7129 against ear tips at 1.707** — six thousandths of
 * clearance, because at 45 degrees two thirds of a horn's length goes forwards.
 * At 30 it stands at 1.8605. An explicit `at` buys the freedom to differ;
 * `creature.ts:709` only refuses a diagonal facing when it is SOLVING the join.
 *
 * **3. A SUNK `box-25` IS THE CHEAP HALF OF THE DOME COMMISSION.** Ocean opened
 * a commission for a dome on behalf of the jellyfish, the sea turtle and the
 * tortoise. Loch Ness wanted three humps and did **not** need it: `box-25`, the
 * koala's ear, is 0.743 radial and the pack itself buries it 0.53 of its own
 * extent, so three in a `ridge` row present as low rounded mounds. **A dome is
 * still wanted for a BELL and a CARAPACE — shapes with a hollow underside — and
 * is not wanted for a MOUND.** That is worth splitting before anybody authors
 * one.
 *
 * **4. THE HEIGHT CEILING IS A BUDGET AND A LEGLESS ANIMAL HAS 0.18125 MORE OF
 * IT.** `buildAssembly` grounds on the lowest point, so with no leg row a hull's
 * own bottom becomes the floor and everything above drops by `LEG_ROW.y`.
 * `animal-goose.ts` had to lean its neck 60 degrees because the ceiling admitted
 * nothing else; Loch Ness spends that 0.18125 on a **25-degree** lean instead and
 * still lands at 1.9646. The same arithmetic bounded the jackalope's antlers: at
 * -45 the rack put it at 2.0305, over the pack's 2.02, and -60 brings it back to
 * 2.0100 with the ears tallest again.
 *
 * **5. A HANGING PART IS A FLOOR, AND TWO SPECIES HERE ARE BOUNDED BY IT.** The
 * yeti's arms and the moon rabbit's raised forepaws both hang, and both are
 * placed so their lowest point stops ABOVE zero — 0.303 and 0.269, measured.
 * Past zero the whole animal lifts, the legs stop touching the ground, and
 * `assembly-assert.ts:765` fails it as a BUILDER fault, which is the most
 * misleading possible symptom for what is really a placement choice.
 *
 * ===========================================================================
 * ## THE ONE PLACEHOLDER, AND THE COMMISSION BOARD
 * ===========================================================================
 *
 * **`animal-sphinx` IS A PLACEHOLDER and it is the only one.** A sphinx is a
 * lion's body with a HUMAN FACE, and Kenney drew twenty-four animals and no
 * people. Measured: of the bank's 100 records the `nose` role holds **28
 * distinct shapes** and every one is an animal's muzzle, beak, nose-tip or
 * nostril card. There is no forehead, no brow, no chin, no cheek, no hair and no
 * human ear in the 100. It is also precisely where §3.2 says the multiplier stops
 * paying — *"a tongue, a beak, a horn, a claw, an eye ... no measured axis will
 * ever catch it, because the confusion is semantic"* — and a face is the
 * strongest member of that list.
 *
 * What ships is the nearest approximation: the lion body, `wedge-15` (the lion's
 * own tail), the Great Sphinx's **nemes headdress** out of JT-041's sanctioned
 * square, and a **deliberately blank front** — every muzzle in the bank was
 * available and each turns it into a big cat, so the absence of a snout is the
 * strongest statement about a human face this kit can make. **What to try first
 * is in that file**, and it is one authored FLAT CARD, not a parts-bank role.
 *
 * **THE COMMISSION BOARD — this collection's additions to the tally, and it adds
 * no new line.**
 *
 *   - **CLAW, never baked. +2 species: `animal-griffin`, `animal-thunderbird`.**
 *     The griffin's talons were CUT — 76 triangles it has not got at 918 of 951 —
 *     and the thunderbird wears `wedge-11`, the elephant's TUSK, which is
 *     `animal-golden-eagle.ts`'s stand-in. The pack drew ten distinct claws and
 *     the role has never been baked — after Ocean's lobster and Dinosaurs'
 *     velociraptor, that is four species behind one line. **One line in
 *     `tools/pets/parts-bank.ts`,
 *     and it renumbers the whole bank**, which is why no builder has taken it.
 *   - **CURVE. +1 species: `animal-kraken`.** A kraken's arms should curl and all
 *     100 shapes are straight or tapered along a single axis. That is now four
 *     species in four collections with `animal-snail` (Critters),
 *     `animal-seahorse` (Ocean) and the flamingo's downcurved bill (Birds).
 *   - **DOME. +0, and a REFINEMENT** — see measurement 3 above. Loch Ness wanted
 *     a mound and got one out of the koala's ear; the commission is for a hollow
 *     BELL and a CARAPACE, and should say so.
 *   - **LONG HIND LEG, HINGED LIMB. +0.** Nothing here jumps or folds.
 *
 * **NOTHING NEW IS PROPOSED.** The two shapes this collection would take if it
 * could — a human face card and a branched antler — are both **authored flat or
 * jointed geometry for ONE species each**, which is the escape clause rather than
 * a commission, and each is priced in its own file where the person doing it by
 * hand will be reading.
 *
 * ===========================================================================
 * ## ALL TWELVE, MEASURED — `npm run pets:creature`, 6 August 2026
 * ===========================================================================
 *
 *       species        height  keep-out  verts  tris   fingerprint
 *       unicorn        1.8605  1.038      426    560   991b383f3f10a281
 *       dragon         1.8950  0.911      647    904   e9172687442e4135
 *       phoenix        1.7066  1.055      407    522   62bee341a3ef9177
 *       griffin        1.7458  1.094      603    918   e410766f178692bd
 *       hippogriff     1.7066  1.070      479    668   67076e60ede1f85e
 *       yeti           1.5687  0.715      392    564   083b397da369a5d7
 *       kraken         1.8606  0.915      571    908   e0c2d189f13290af
 *       loch ness      1.9646  0.654      317    510   f459ee7f62968d1d
 *       jackalope      2.0100  0.963      534    672   646d86e4aab7f2a2
 *       thunderbird    1.7067  1.120      602    892   4239f0061d559808
 *       sphinx         1.7458  0.838      448    696   bc8e2bc92ef36447
 *       moon rabbit    2.0100  0.963      460    556   b90b633f051f9299
 *
 * **All twelve are inside the pack's height band and inside rule 9's 422-951
 * triangles, and not one declares a RULE 9 overrun** — the closest are the
 * griffin at 918 and the kraken at 908, both of which lost a part to the ceiling
 * rather than declaring one. **Two are under the pack's 405 VERTEX floor, which
 * is a norm that reports**: the yeti at 392 and Loch Ness at 317, both of which
 * are few large parts rather than many small ones (`animal-snail` shipped at 282
 * and `animal-goldfish` at 342). **Nothing exceeds the keep-out the fox pays** —
 * the widest is the thunderbird at 1.120 against the fox's 1.15, and it is a bird
 * with its wings up.
 *
 * ## WHY THERE ARE NO `threat` RECORDS, AND IT IS NOT THE USUAL REASON
 *
 * Everywhere else in this project the reason is that a status has to be a dated
 * reading of the Red List rather than a memory. Here it is simpler and harder: a
 * conservation status for a creature that does not exist would be **nonsense**,
 * and it would be nonsense presented to a six-year-old as a fact. Not absent
 * pending a check. Absent because there is nothing to check.
 *
 * ## AND WHY EVERY FACT IN THIS COLLECTION IS ABOUT THE STORY
 *
 * Roster §5's discipline is that a fact must be true and checkable. **A fact
 * about a mythical creature must therefore not assert that it exists.** Every
 * row this collection adds to `joe/species-facts.json` is written about the
 * LEGEND — who tells it, where it comes from, what it is carved or drawn on —
 * so that nothing in that file states a falsehood to a child. "The Great Sphinx
 * in Egypt is a huge stone statue" is true; "a sphinx has a lion's body" would
 * not be. All twelve are `check: 'flagged'` with an empty `source` and a
 * `sourceNote` saying the builder wrote them from general knowledge and nothing
 * checked them. **None is `verified` and none may be** until somebody sources it.
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
 * ALL TWELVE, and the two lists are kept separate on purpose.
 *
 * ELEVEN ARE REAL ANIMALS. ONE IS A PLACEHOLDER — `animal-sphinx` — put in so
 * Joe can finish it by hand, saying so in the first line of its own file header
 * and in its `flag`. A placeholder is not promoted into the built count to make
 * the number look better; the survey above prices it.
 *
 * IN ROSTER ORDER, which is the order `roster.ts:281-285` lists them and the
 * order the album shows them. A member arriving later is INSERTED at its
 * rostered place, never appended.
 *
 * Every record below is one line. The reasoning for a species' SHAPE lives in
 * its own `parts/assembled/animal-<id>.ts`, beside the number it justifies —
 * and for the placeholder, so does the price of finishing it, because that is
 * where the person doing it by hand will be reading.
 */
export const LEGENDARY_SPECIES: readonly Species[] = [

  /* The species that proves the collection: `animal-horse` part for part plus
   * ONE stretched bee's antenna. A horse with one horn IS a unicorn. */
  defineSpecies('animal-unicorn', 'bespoke'),

  /* The animal §3.1 specified in Joe's own words on 29 July and nobody built:
   * the hog's EAR, four along the spine, as a back ridge. */
  defineSpecies('animal-dragon', 'bespoke'),

  /* The one species here whose problem is colour rather than shape — a plain
   * bird, a raised crest, and a palette doing all the work. */
  defineSpecies('animal-phoenix', 'bespoke'),

  /* The lion's own tail and Raptors' own hooked bill on the biggest shell in
   * the bank, because the lion's own shell has no front face. */
  defineSpecies('animal-griffin', 'bespoke'),

  /* The hardest internal pair in the collection: the griffin's head on a
   * horse's back half, separated from it five measured ways. */
  defineSpecies('animal-hippogriff', 'bespoke'),

  /* The only animal in the project with ARMS, and the only two-legged ape —
   * both of which exist to keep it off `animal-gorilla`. */
  defineSpecies('animal-yeti', 'bespoke'),

  /* The third species to wear the elephant's trunk as a tentacle, on the widest
   * shell in the bank, with a beak neither of the other two has. */
  defineSpecies('animal-kraken', 'bespoke'),

  /* The goose's neck idiom on a LEGLESS animal, which is worth 0.18125 of
   * headroom and buys a neck that is held up rather than carried forward. */
  defineSpecies('animal-loch-ness', 'bespoke'),

  /* A hare with a forked rack: two cone-01 per side, the second hung on the
   * first's own built tip, because the bank holds no branch and no curve. */
  defineSpecies('animal-jackalope', 'bespoke'),

  /* The only big bird in the project with its wings UP — blade-06 attaches
   * `y +1`, so a spread wing was always a placement and never a shape. */
  defineSpecies('animal-thunderbird', 'bespoke'),

  /* PLACEHOLDER — a human face, and the pack holds 28 distinct nose shapes of
   * which every one is an animal's. The nemes headdress stands in. */
  defineSpecies('animal-sphinx', 'bespoke'),

  /* The fourth rabbit, and the only animal in the project that SITS UP: two
   * `box-01` pairs at two heights instead of the leg row. */
  defineSpecies('animal-moon-rabbit', 'bespoke'),
]
