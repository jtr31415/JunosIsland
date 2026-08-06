/**
 * The Prehistoric collection — roster row 20, `ship: 15`, name band `long`.
 *
 * NEW FILE, 6 August 2026. There has never been a `collections/prehistoric.ts`;
 * this one was written on the assembly route from the first line, like Ocean,
 * Birds, Ice and Endangered, and unlike Woodland, Farm and Africa, which are
 * rebuilds carrying kit-era headers.
 *
 * ===========================================================================
 * ## WHAT THIS COLLECTION IS, AS A DESIGN PROBLEM: TWELVE ANIMALS THAT ARE ALL
 * ## SOMETHING ELSE, PLUS A COAT
 * ===========================================================================
 *
 * Ice's problem was that every member was white. Endangered's was that twelve
 * habitats share no idiom. This one is different again and it is the easiest
 * ground in the project so far, which is worth saying plainly rather than
 * hedging: **eight of these twelve are a living animal at different proportions
 * with a coat on**, and the living animal is already built. A mammoth is an
 * elephant, a sabre-tooth is a cat, a dire wolf is a wolf, a cave bear is a
 * bear, a woolly rhino is a rhino, a quagga is a zebra, an Irish elk is an elk,
 * a megalodon is a shark. That makes the design question uniform and sharp:
 * **what one measured thing separates each of them from the animal it is a
 * version of?** Counted, against the built tree:
 *
 *   - **mammoth** against the FROZEN `animal-elephant`. Separated on COAT
 *     (`box-29` as a skirt), EAR SIZE (`box-05`, the smallest in the bank,
 *     against the elephant's own flap) and TUSK SWEEP (two chained segments).
 *     Deliberately NOT on the hull — the two animals are the same shape and
 *     pretending otherwise would be a lie about both.
 *   - **sabre-tooth** against the FROZEN `animal-tiger` and `animal-lion`, and
 *     against seven built cats. Separated on the TEETH and on `box-12`, the one
 *     shell wider than it is tall, which no cat here wears.
 *   - **dire wolf** against `animal-wolf`, `animal-red-wolf`, `animal-dingo`,
 *     `animal-african-wild-dog`, `animal-maned-wolf` and the FROZEN
 *     `animal-fox`. Four swaps, every one of them for a measured BIGGER shape.
 *   - **cave bear** against `animal-bear`, `animal-moon-bear`, `animal-sun-bear`,
 *     `animal-sloth-bear` and the FROZEN `animal-polar`. Separated on the one
 *     feature palaeontologists use — a domed forehead — where the other four are
 *     told apart by chest marks.
 *   - **woolly rhino** against `animal-white-rhino`, `animal-black-rhino` and
 *     `animal-sumatran-rhino`. All four wear `cone-01`; this is the only one
 *     that cuts it FLAT.
 *   - **quagga** against `animal-zebra`, `animal-horse`, `animal-donkey`,
 *     `animal-mule` and `animal-pony`. It IS the zebra build, with the stripes
 *     stopped — see below, because that is the one interesting thing here.
 *   - **irish elk** against `animal-elk`, `animal-reindeer` and the FROZEN
 *     `animal-deer`. A PALMATE rack against two BEAM racks.
 *   - **megalodon** against `animal-shark` and six other legless grey things.
 *   - **giant sloth** against `animal-sloth`, `animal-anteater` and
 *     `animal-pangolin`.
 *   - **terror bird** against `animal-ostrich`, `animal-emu`, `animal-cassowary`
 *     and `animal-kiwi`.
 *   - **dodo** against `animal-pigeon`, `animal-turkey` and `animal-kakapo`.
 *   - **glyptodon** against `animal-tortoise`, `animal-terrapin`,
 *     `animal-turtle`, `animal-armadillo`'s absence and `animal-pangolin`.
 *
 * Twelve of twelve. Every separation is argued in the species file, beside the
 * number it justifies.
 *
 * ===========================================================================
 * ## THE MEASURED SURVEY — what the bank gave this collection
 * ===========================================================================
 *
 * **THE COAT PROBLEM IS SOLVED AND IT WAS SOLVED IN ICE.** Three of these twelve
 * are named for their fur. `animal-musk-ox.ts` had already found the only shape
 * in the bank that reaches the ground — `box-29`, the lion's mane ring, cut to
 * 0.52 on DEPTH ONLY because `assembly-assert.ts` wants the hull's bounding
 * volume over 3x the next mesh and at full size the ring is a second mass at a
 * ratio of 1.74. `animal-mammoth` wears it unchanged, with `animal-sheep.ts`'s
 * measurement and `animal-vulture.ts`'s precedent both carried over. **The
 * lesson generalised again: read the last collection's header before measuring
 * the bank yourself.**
 *
 * **AND IT IS ONLY SOLVED ONCE.** `animal-woolly-rhino` wants the same skirt and
 * does not get it, because two animals in one collection wearing `box-29` to the
 * ground would be twins — so its wool is four `cone-01` on the top row only
 * (`animal-warthog.ts`'s bristle idiom) and its file says outright that this is
 * the weaker half of the truth and what the trade costs.
 *
 * **THE BANK STILL HAS NO CURVE. THIS IS THE SEVENTH AND EIGHTH ASKING.** All
 * 100 baked shapes are straight or tapered along a single axis and rule 4 as
 * amended bakes a ROTATION into a copy's vertices — it turns a part and cannot
 * bend one. Ocean priced it for the seahorse, Birds for the flamingo's bill,
 * Outback for the frilled lizard, Critters for the snail, Ice three times, Near
 * Threatened for the markhor's helix and Vulnerable for a macaw's beak. Two more
 * here: a **mammoth's tusk**, which curls right round, and a **terror bird's
 * bill**, which hooks in one bend. **Neither is a placeholder**, because two
 * chords meeting at an angle reads as a bend at tablet distance where a Dall
 * ram's missing spiral does not — but both are on the tally.
 *
 * **THE DOME IS NOW WANTED BY SIX SPECIES.** Ocean's jellyfish and sea turtle,
 * Ice's beluga melon, Outback's frilled disc, and now `animal-cave-bear`'s brow
 * and `animal-glyptodon`'s carapace. Both stand-ins are already-known readings
 * of the same two shapes: `box-25`, the koala's ear and the only RADIAL shape of
 * any size in the bank, and `box-19` turned flat and halved, which is
 * `animal-tortoise.ts`'s answer to "the pack has no shell". **`animal-glyptodon`
 * is the first animal built where the dome IS the whole silhouette question**,
 * so it is the honest test of §8's chamfer idiom and of whether a real dome
 * primitive would earn its place.
 *
 * **THE LONG HIND LEG, for the ninth and tenth time.** `animal-terror-bird` and
 * `animal-giant-sloth` both want it — the terror bird to stand like a ratite,
 * the ground sloth to rear. It is still the highest-value commission on the
 * board: one shape at one absolute height would finish or improve the kangaroo,
 * the quokka, the emu, the ostrich, the maned wolf, the jerboa and both of these.
 *
 * **THE `claw` ROLE HAS STILL NEVER BEEN BAKED.** §7 censuses ten distinct claw
 * shapes with the crab, lion, tiger and polar as donors, and `claw` occurs ZERO
 * times in `PARTS_BANK`. `animal-giant-sloth` is the fourth species to reach for
 * a tooth instead (after `animal-sloth`, Ocean's lobster and Night Time's
 * scorpion) and the second whose whole read depends on it. **Nothing here bakes
 * it**: baking a role renumbers the bank silently and once turned the newt's
 * crest into bee wings.
 *
 * **WHAT IS ACTUALLY NEW HERE IS A HULL SIZE PROBLEM, AND IT IS A RULING.** Two
 * of these animals are famous for being enormous. The hull is NEVER scaled
 * (`HullDef.stretch` is `never`, Joe's instruction of 2 August), so the whole
 * size vocabulary is the pack's ten real shells and their volume range is 1.21x
 * from `box-20` to `box-41`. `animal-megalodon` is therefore a fifth bigger than
 * `animal-shark` where it should be three times, and `animal-mammoth` a fifth
 * bigger than every quadruped in the album. `collections/endangered.ts` records
 * the identical wall for the blue whale and `collections/critters.ts` for the
 * stick insect; this collection is the third to hit it and the first to hit it
 * twice.
 *
 * **THE HEIGHT BAND, BOTH ENDS.** Measured on the built models: the shortest is
 * `animal-sabre-tooth` at exactly **1.4312**, the bare cube on standard legs and
 * 0.00125 above the pack's own floor; the tallest is `animal-terror-bird` at
 * **1.9587**, and its `NECK_STRETCH` is 1.1 against the ostrich's 1.5 for that
 * reason and no other — at the ostrich's own numbers this bird measures 2.0747
 * and is over the 2.02 ceiling.
 *
 * **KEEP-OUT.** `pets.ts:652` charges `max(width, depth) / 2` and Woodland's
 * header holds the ceiling at 1.6. The widest three are `animal-terror-bird` at
 * **1.142** (its bill is charged as depth), `animal-cave-bear` at **1.030** and
 * `animal-woolly-rhino` at **1.027** (its horn, likewise). All twelve are inside.
 *
 * ===========================================================================
 * ## WHAT IS NEW IN THE VOCABULARY, so the next collection can reach for it
 * ===========================================================================
 *
 *   - **`blade-05` IS A PALMATE ANTLER.** The lion's flat muzzle plate — 1.000 x
 *     1.000 x 0.125, the largest flat shape in the bank — has been worn three
 *     times and always as a FACE (`animal-sloth`'s mask, `animal-frog`'s,
 *     `animal-platypus`'s bill). `animal-irish-elk` lays it horizontal with
 *     `{ x, -90 }` and tilts it out with `{ z, -35 }`, and the two copies meet
 *     across the midline so they read as one sheet. Eighteen triangles a copy is
 *     why two of the biggest shapes in the bank can sit on one head at all.
 *   - **A MARKING THAT IS SAID BY NOT PLACING A CARD.** Every pattern this
 *     project has wanted has been refused because colour is a lookup with no
 *     positional information. `animal-quagga` is the one case where the missing
 *     marking is *absence*: two flank bars instead of the zebra's four, both
 *     forward of centre, and the stripes simply stop. A card you do not place
 *     costs nothing and says exactly the right thing.
 *   - **A THREE-DEEP `on` CHAIN.** `animal-terror-bird` runs neck -> head ->
 *     bill -> hook, each joined to the built outer face of the one before it, so
 *     not one of those four positions is a number the file carries. Nothing had
 *     used `PartDef.on` more than two deep.
 *   - **`plate-09` IS SPENT, AND `plate-04` NEVER CAN BE.** Both eye cards had
 *     gone unused by all 200-odd built species, which is the kind of gap
 *     `collections/endangered.ts` says to search for rather than assume away.
 *     `animal-megalodon` takes the radial `plate-09` for a shark's black button.
 *     `animal-terror-bird` tried `plate-04` and could not: **it carries band 15
 *     ONLY**, and `creatureSpec` paints a card `{ base: sclera, byBand: { 15:
 *     pupil } }`, so the whole card comes out pupil grey and the eye reads one
 *     slot where the harness demands two. `plate-04` and `plate-05` are the
 *     CAT's, they are the only two eye cards in the bank without Kenney's own
 *     sclera cut, and that is why nobody had ever spent them. Recorded so the
 *     next builder does not spend an afternoon finding out.
 *   - **A TWO-SEGMENT TUSK, SECOND USE.** `animal-dall-sheep` ran
 *     `animal-buffalo.ts`'s chained-`on` experiment and reported that two chords
 *     at 70 degrees is a bent line and not a spiral. `animal-mammoth` is the
 *     second use and the first where the bend is the point rather than the
 *     compromise, because a mammoth's tusk genuinely does change direction once.
 *
 * ===========================================================================
 * ## TWELVE OF TWELVE ARE REAL ANIMALS. NONE IS A PLACEHOLDER, AND WHY
 * ===========================================================================
 *
 * Joe, 5 August: *"put something in for the unbuildable ones anyway so i can do
 * it manually. if there is no entry at all, i cant do that."* Every member here
 * is a full entry — file, index line, record, `MOVES`, both ledger rows — and
 * **none of the twelve is marked a placeholder**, which is a claim worth
 * defending rather than asserting, because the last six collections each shipped
 * one to four.
 *
 * The test a placeholder has to pass is `animal-dall-sheep`'s: *"a ram without
 * the curl is a white goat"* — the missing shape has to be the thing that makes
 * the animal identifiable at all. Every one of these twelve survives it. The
 * mammoth keeps its coat, trunk, tiny ears and long tusks without the curl; the
 * terror bird keeps a hatchet head on a ratite body without a one-piece hook;
 * the glyptodon keeps a domed armoured back without a dome primitive; the giant
 * sloth keeps its bulk and its claws without the rearing pose. **Seven of the
 * twelve carry a `flag` naming what they strained**, which is the escape clause
 * working rather than the escape clause unused.
 *
 * ===========================================================================
 * ## THE FOUR SEPARATIONS TO LOOK AT FIRST
 * ===========================================================================
 *
 *   1. **mammoth against the FROZEN elephant.** The whole animal is a coat, two
 *      small ears and a tusk sweep on the elephant's own proportions. If it
 *      still reads as a hairy elephant, the dial is the skirt.
 *   2. **cave bear against `animal-bear`.** Same shell, and the difference is a
 *      disc across the brow plus a shorter muzzle. This is the thinnest
 *      separation in the collection and it is deliberately thin, because that is
 *      how thin it is in life.
 *   3. **dire wolf against `animal-wolf`.** Four size swaps and no new shape. If
 *      a bigger wolf does not read as a different animal, that is a real finding
 *      about how far the ten hulls stretch.
 *   4. **glyptodon's back.** §8's chamfer idiom exists to make a cube read
 *      ROUND, and its stated acceptance test is Joe's own intent rather than
 *      arithmetic. This is the first animal whose entire silhouette question is
 *      that, so it is the honest verdict on the idiom.
 *
 * ## WHY THERE ARE NO `threat` RECORDS
 *
 * Every animal in this collection is EXTINCT. A `Threat` category on any of them
 * would be nonsense before it was unchecked: the Red List's categories describe
 * living populations, `Threat.checkedDate` exists so a status is a dated reading
 * rather than a memory, and there is no reading to take. `registry.ts:67-88`
 * holds the same line for the base 24's seven badges and four collections named
 * for IUCN categories hold it for theirs. Absent means "not recorded"; here it
 * also means "not applicable", and that is the stronger reason of the two.
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
 * ALL TWELVE, and all twelve are real animals.
 *
 * IN ROSTER ORDER, which is the order `roster.ts:269-274` lists them and the
 * order the album shows them. A collection whose file order disagrees with its
 * roster order is a trap `species-garden.test.ts:149` already exists to catch,
 * so a member arriving later is INSERTED at its rostered place, never appended.
 *
 * Every record below is one line. The reasoning for a species' SHAPE lives in
 * its own `parts/assembled/animal-<id>.ts`, beside the number it justifies.
 */
export const PREHISTORIC_SPECIES: readonly Species[] = [

  /* The elephant's own shape wearing the musk ox's skirt, the bank's smallest
   * ear, and a tusk in two chained segments. Separated on coat, not on hull. */
  defineSpecies('animal-mammoth', 'bespoke'),

  /* Two elephant tusks hung DOWN off the front plate, on `box-12` — the one
   * shell wider than it is tall, whose ear lugs mean this cat needs no ears. */
  defineSpecies('animal-sabre-tooth', 'bespoke'),

  /* A barrel with the raptors' two-part hook on the front of it, stretched 1.8x,
   * and wings folded because a dodo's really were. */
  defineSpecies('animal-dodo', 'bespoke'),

  /* `animal-shark` on the biggest shell, with six of the caterpillar's teeth
   * along the gape and the bank's last unspent radial eye card. */
  defineSpecies('animal-megalodon', 'bespoke'),

  /* Four swaps and no new shape: a bigger shell, a bigger ear, a deeper muzzle
   * and a longer tail. The fox's brush is refused for animal-wolf.ts's reasons. */
  defineSpecies('animal-dire-wolf', 'bespoke'),

  /* No face mask, the deer's muzzle, four claws at two angles out of the chest,
   * and the rearing pose that the one leg shape at one height cannot give it. */
  defineSpecies('animal-giant-sloth', 'bespoke'),

  /* The project's first three-deep `on` chain — neck, head, bill, hook — and the
   * bill is a hatchet where every other ratite here carries a pea. */
  defineSpecies('animal-terror-bird', 'bespoke'),

  /* The fourth rhino, and the only one whose `cone-01` is cut FLAT. Its wool is
   * four bristles rather than the mammoth's skirt, so the two are not twins. */
  defineSpecies('animal-woolly-rhino', 'bespoke'),

  /* `animal-zebra` with the stripes STOPPED — the one marking in this project
   * that is said by not placing a card. */
  defineSpecies('animal-quagga', 'bespoke'),

  /* The tortoise's flat ring plus nine scutes stepped around the chamfer, and
   * the first animal whose whole silhouette question is whether that is a dome. */
  defineSpecies('animal-glyptodon', 'bespoke'),

  /* The fifth bear, separated on a domed brow instead of a chest mark — which is
   * the one feature that separates it in life. */
  defineSpecies('animal-cave-bear', 'bespoke'),

  /* The first PALMATE rack in the project: the lion's flat muzzle plate laid
   * horizontal, two copies meeting across the midline. */
  defineSpecies('animal-irish-elk', 'bespoke'),
]
