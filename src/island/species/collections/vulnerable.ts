/**
 * The Vulnerable collection — roster row 17, `ship: 17`, name band `long`.
 *
 * NEW FILE, 5 August 2026. There has never been a `collections/vulnerable.ts`;
 * this one was written on the assembly route from the first line, like Ocean,
 * Birds and Ice and unlike Woodland, Farm and Africa, which are rebuilds
 * carrying kit-era headers.
 *
 * ===========================================================================
 * ## THE STATUS IS THE PREMISE, AND NO DATED READING HAS BEEN TAKEN
 * ===========================================================================
 *
 * **This collection is named for an IUCN Red List category and NOT ONE RECORD
 * HERE CARRIES A `threat`.** That is deliberate and it is the same line
 * `registry.ts:55-76` holds for the base 24 and every collection built this
 * week, and it needs saying loudly precisely because the collection's NAME
 * appears to make the claim.
 *
 * Roster §5 wants statuses *"true, checkable"*, and `Threat.checkedDate` exists
 * so that a status is a dated reading of the Red List rather than a memory.
 * Writing a category on twelve records from recall would produce twelve records
 * that LOOK checked and are not, which is worse than none — and it would be
 * worse HERE than anywhere, because a reader would take the collection's own
 * name as corroboration. **Absent means "not recorded yet", which is honest.**
 * The collection's membership is a design premise: these twelve are grouped
 * because somebody once thought of them together, and nothing in this file is
 * evidence about any animal's real conservation status.
 *
 * WHAT UNBLOCKS IT is what unblocks the base 24: somebody reads the current Red
 * List entry for each of the twelve, stamps the real date, and adds `threat` to
 * the records below. It is a ten-minute job for whoever has a browser.
 *
 * ===========================================================================
 * ## WHAT THIS COLLECTION IS, AS A DESIGN PROBLEM: TWELVE ANIMALS FROM TWELVE
 * ## HABITATS, AND EVERY ONE OF THEM HAS A SIBLING ALREADY BUILT
 * ===========================================================================
 *
 * Ice's difficulty was that everything in it was white. Jungle's was that it
 * collided with more built animals than any other collection. **This one has
 * Jungle's problem without Jungle's compensation**: its members are drawn from
 * every habitat in the roster, so there is no shared palette, no shared
 * silhouette and no collection-level idiom to lean on — each of the twelve is
 * alone against whatever it resembles. Counted:
 *
 *   - **snow leopard** against the FROZEN `animal-lion` and `animal-tiger`, and
 *     against `animal-cheetah`, `animal-jaguar`, `animal-ocelot`, `animal-lynx`
 *     and `animal-wildcat` — six built cats before it.
 *   - **dugong** and **manatee** against each other, and both against
 *     `animal-whale`, `animal-dolphin`, `animal-beluga`, `animal-narwhal`,
 *     `animal-seal` and `animal-turtle`.
 *   - **sun bear**, **moon bear** and **sloth bear** against each other, against
 *     Woodland's `animal-bear`, and against the FROZEN `animal-polar` and
 *     `animal-panda`. Six bears, three of them black.
 *   - **hyacinth macaw** against the FROZEN `animal-parrot` and against Birds'
 *     `animal-cockatoo`, `animal-cockatiel`, `animal-lovebird` and
 *     `animal-budgie`.
 *   - **mandrill** against `animal-baboon`, the FROZEN `animal-monkey`,
 *     `animal-gorilla`, `animal-howler-monkey`, `animal-gibbon` and
 *     `animal-lemur`.
 *   - **cassowary** against `animal-ostrich`, `animal-emu` and `animal-kiwi`.
 *   - **fossa** against `animal-mongoose`, `animal-civet`, `animal-meerkat`,
 *     `animal-ferret`, `animal-pine-marten`, `animal-stoat`, `animal-mink` and
 *     `animal-kinkajou` — the most crowded ground in the project.
 *   - **takin** and **gaur** against each other and against nine built bovids:
 *     `animal-buffalo`, `animal-water-buffalo`, `animal-ox`, `animal-sheep`,
 *     `animal-goat`, `animal-antelope`, `animal-wildebeest`, `animal-musk-ox`
 *     and `animal-dall-sheep`.
 *
 * Twelve of twelve. The separations are made in the species files, where the
 * number they justify lives, and the four worth reading first are named at the
 * bottom of this header.
 *
 * ===========================================================================
 * ## THREE INTERNAL PAIRS AND A TRIPLE, WHICH IS THE REAL WORK
 * ===========================================================================
 *
 * Most collections separate outwards. This one has to separate INWARDS four
 * times, and each was solved by finding a single measured fact and spending it.
 *
 * **THE DUGONG AND THE MANATEE ARE ONE BUILD TWICE OVER, AND THE BANK HAPPENS
 * TO CONTAIN THE ONE PART THAT DIFFERS.** `collections/ice.ts` shipped the
 * beluga and the narwhal on that argument — *"because in life that is the whole
 * difference"* — and this pair is a better case than theirs, because the
 * difference between the two sirenian families is exactly one part and both
 * shapes are already baked: a dugong's tail is a whale's **fluke** (`box-38`
 * spun flat, `animal-whale.ts`'s find, worn by four cetaceans) and a manatee's
 * is a rounded **paddle** — and `wedge-03` is the BEAVER'S OWN PADDLE. Nothing
 * was invented to tell them apart. The second difference is the muzzle: the
 * dugong's is tilted thirty degrees DOWN at the seabed and the manatee's points
 * forward, which is also true and is also the whole of it.
 *
 * **THE THREE BLACK BEARS SPLIT ON A CHEST MARK, AND THERE IS ONLY ONE GOOD WAY
 * TO SAY ONE.** `box-39` carries band 3, **the one forward-facing band in any of
 * the pack's ten hulls** — real geometry, a hard edge, no cards, and
 * `animal-toucan.ts` and `animal-robin.ts` already spend it. There is exactly
 * one of it and three bears want it. It went to `animal-moon-bear`, whose
 * crescent has the hardest edge of the three; `animal-sun-bear` and
 * `animal-sloth-bear` wear a marking CARD turned to face forward instead, which
 * is a placement no card in this project had before. The three files are meant
 * to be read together and the comparison is the deliverable.
 *
 * They also share ONE MUZZLE AT FOUR LENGTHS, which is the cleanest family this
 * collection produced: `tube-07`, the giraffe's, the deepest nose in the bank,
 * at **0.7** on the sun bear, **0.85** on the moon bear, **1.0** on Woodland's
 * `animal-bear` and **1.5** on the sloth bear. §3 measured the pack's own
 * snouts varying 2.90x naturally, so all four sit inside what Kenney drew, and
 * the four bears differ by a number that came off the animals rather than off
 * anybody's taste.
 *
 * **THE TAKIN AND THE GAUR REFUSED TO SEPARATE ON HORNS, BECAUSE THAT GROUND IS
 * GONE.** Nine bovids are built and every one of them separates on its horns —
 * the ox and the wildebeest share a horn line verbatim, the water buffalo chains
 * three segments into a crescent, the buffalo and the musk ox each spend theirs
 * on the same missing curve. So the takin is built around its FACE (the only
 * muzzle in the project stretched on its own HEIGHT, `tube-07` at 1.7x, which is
 * a Roman nose) and the gaur around its BACK (`box-24` with its axis overridden
 * to `y`, cut to 0.35 and run 3x along the spine — a dorsal ridge out of a nose
 * pad, which is `animal-musk-ox.ts`'s boss trick moved from brow to spine).
 *
 * ===========================================================================
 * ## THE MEASURED SURVEY — what the bank gave this collection
 * ===========================================================================
 *
 * **`box-21` WAS THE LEAST-USED HULL IN THE BANK AND IT IS WHY THIS COLLECTION
 * HAS NO BURIED EYES.** Before this run the fox's tall shell had exactly one
 * wearer, `animal-gibbon`, while `box-41` had ten and `box-12` seven. That
 * matters for a reason nobody had written down: **`box-41`'s front face stands
 * at z = 0.725 and `EYE_CARD_Z` is an absolute 0.6350**, so an eye card on the
 * tiger's shell sits 0.09 INSIDE the head. Ten built species carry that today
 * and `animal-whale.ts` is the only file that names it. **No member of this
 * collection is on `box-41`**, which was a deliberate choice made once for
 * twelve animals rather than argued twelve times, and it cost nothing: `box-21`
 * took the snow leopard and the gaur, and both wanted "tall" anyway.
 *
 * **THE CURVE IS ASKED FOR AGAIN, BY A HOOKED BILL.**
 * `docs/how-the-animals-are-made.md` §14 names the hooked beak as the one of its
 * four headline gaps still clearly absent, and `animal-hyacinth-macaw` is what
 * that costs: all 100 baked shapes are straight or tapered along a single axis,
 * and rule 4 as amended bakes a ROTATION into a copy's vertices — it turns a
 * part and cannot bend one. Ocean priced this for the seahorse, Birds for the
 * flamingo's bill, Outback for the frilled lizard, Critters for the snail and
 * Ice three times over for the Dall ram, the musk ox and the narwhal. **This is
 * the sixth collection to price the same commission.** The macaw ships anyway,
 * on the narwhal's reasoning: a deep straight bill reads as a macaw's at tablet
 * distance where a straight spiral does not read as a ram's.
 *
 * **NO DOME IS WANTED HERE**, which is worth recording because four collections
 * now want one: the sirenians take a flat rostrum rather than a melon, so this
 * collection adds nothing to that tally.
 *
 * **THE ONE-MASS RATIO AND THE TRIANGLE CEILING BOTH BIT, AND THE CEILING BIT
 * HARDER.** `assembly-assert.ts` wants the hull's bounding volume over 3x the
 * next mesh and nothing here came near it. `MODEL_TRIS_MAX` is 951 and
 * `creatureSpec` THROWS on it at module load without a `RULE 9` flag, and it is
 * what cost `animal-sloth-bear` its tail: `box-18` is 80 triangles and would
 * have taken that animal from 903 to 983. The claws are the second thing anybody
 * says about a sloth bear and the tail is a tuft nobody looks at, so the claws
 * won. `animal-gaur` is the collection's other tight one at 906.
 *
 * **THE TWELVE, MEASURED ON THE BUILT MODEL.** Height, keep-out and triangles;
 * every one of them stands with its feet exactly on y = 0.
 *
 *     snow leopard    1.8371   1.0914   727      macaw         1.7458  1.0980  610
 *     dugong          1.2578   0.9947   404      mandrill      1.5504  1.0553  587
 *     sun bear        1.5012   0.9652   648      cassowary     1.9681  0.7565  526
 *     moon bear       1.4312   1.0001   627      fossa         1.7100  0.9910  624
 *     sloth bear      1.7066   0.8415   903      takin         1.5844  0.9754  692
 *                                               gaur           1.8066  0.9643  906
 *                                               manatee        1.2778  0.9202  448
 *
 * Ten of the twelve are inside the pack's 1.43–2.02 height band. **The two that
 * are not are the sirenians**, at 1.2578 and 1.2778, and it is the same fact
 * `collections/ocean.ts` recorded: a legless hull measures 1.250 before anything
 * is added and there is no headroom under `PACK_HEIGHT_MIN` at all. Those two
 * also sit under the 422-triangle and 405-vertex floors, which is subtraction
 * showing up in the budget rather than a fault — `animal-emu.ts` said the same
 * of a bird with no wing and no tail. All of it REPORTS since Joe's ruling of 3
 * August. **`animal-cassowary` at 1.9681 is the tallest**, 0.05 under the
 * ceiling, and that margin is what its neck's 0.9 and its casque's 1.7 were
 * solved against in that order.
 *
 * **KEEP-OUT.** `pets.ts:652` charges `max(width, depth) / 2` and Woodland's
 * header holds the ceiling at 1.6. The widest here is `animal-hyacinth-macaw` at
 * **1.0980** — its bill and its 1.0824 tail are both charged as depth and its
 * spread wings as width — and nothing comes close to the limit.
 *
 * ===========================================================================
 * ## WHAT IS NEW IN THE VOCABULARY, so the next collection can reach for it
 * ===========================================================================
 *
 *   - **A MARKING CARD TURNED TO FACE FORWARD.** `{ y, -90 }` takes an `x +1`
 *     card to `z +1`, so `plate-10` and `plate-11` can be hung on a CHEST.
 *     Every marking card in this project sat on a flank or a spine until now.
 *     `animal-sun-bear` and `animal-sloth-bear` both do it.
 *   - **A MARKING CARD ON A FEATURE RATHER THAN ON THE HULL.**
 *     `animal-mandrill` lays three `plate-10` on its own MUZZLE — a pair on its
 *     flanks and one turned onto its top — and every station is the muzzle's own
 *     solve plus the pack's 0.010 of daylight, not a number anybody eyeballed.
 *     That is how a face marking gets said on an animal whose head is fused into
 *     its body.
 *   - **`box-25` IS AN EAR AGAIN.** The koala's, 0.743 x 0.743, the biggest in
 *     the ear bank by a factor of two, and `animal-beluga` had spun it onto a
 *     crown as a melon stand-in. `animal-moon-bear` wears it as Kenney drew it,
 *     on the donor transfer alone, and the solve recovers the bank's recorded
 *     x = 0.600 exactly.
 *   - **`box-27` EXISTS.** The koala's inner ear, recorded `z +1` sunk 0.933187
 *     because it was drawn to be buried in a face. `animal-fossa` overrides it
 *     to `y +1` at sink 0.45 and it is a small round high-set ear. First use
 *     anywhere.
 *   - **A NECK STRETCHED SHORTER THAN THE PACK DREW IT.** The ostrich runs
 *     `box-18` at 1.5x and the emu at 1.25x; `animal-cassowary` runs it at
 *     **0.9x** and takes the fifth it loses back across and through. A thick
 *     short column rather than a mast.
 *   - **A THIRD SPIN ON A HORN.** `animal-takin`'s sweeps BACK —
 *     `{ y, 90 } { z, 20 } { x, -40 }` — where every other horned animal in the
 *     project stops after two and goes out-and-up or out-and-down.
 *   - **`wedge-07` CHOSEN FOR ITS SINGLE BAND.** `animal-civet.ts` measured that
 *     `wedge-07` and `wedge-18` are the same shape and differ only in banding,
 *     and three species take `wedge-18` for its ready-made dark tip.
 *     `animal-fossa` is the first to want the one WITHOUT a second band, because
 *     the whole animal is that it has no markings.
 *
 * ===========================================================================
 * ## NO PLACEHOLDERS, AND THAT CLAIM IS NARROWER THAN IT SOUNDS
 * ===========================================================================
 *
 * Joe, 5 August: *"put something in for the unbuildable ones anyway so i can do
 * it manually. if there is no entry at all, i cant do that."* Every one of the
 * twelve is a full entry — file, index line, record, `MOVES`, both ledger rows —
 * and **all twelve are real animals rather than priced stand-ins.** No member of
 * this collection is held up by a shape the bank does not contain.
 *
 * That is a claim about BUILDABILITY and not about quality, and five members
 * carry a flag naming what they strained:
 *
 *   - **`animal-hyacinth-macaw`** — the hook is a curve and cannot be had; the
 *     bill is straight and stretched [1.3, 1.5, 1.5], and the yellow eye ring is
 *     a patch beside the eye because a ring closes on itself and nothing here
 *     can say one.
 *   - **`animal-mandrill`** — the ribs are zero-thickness cards where a
 *     mandrill's are relief in bone, and the bare rump is unsayable for the
 *     reason five other files carry: `Paint.patch` takes a HEIGHT and has no z
 *     term.
 *   - **`animal-sun-bear`** and **`animal-sloth-bear`** — a horseshoe and a Y,
 *     both said as one rectangular card.
 *   - **`animal-fossa`** — separated entirely by SUBTRACTION, which is either
 *     the right answer or a blank animal, and that is a judgement rather than a
 *     measurement.
 *
 * ===========================================================================
 * ## THE FOUR SEPARATIONS TO LOOK AT FIRST
 * ===========================================================================
 *
 *   1. **The three bears' chest marks.** One is Kenney's own hull band and two
 *      are turned cards. If the cards read as stickers, the allocation is wrong
 *      and the fix is to trade hulls, which is a one-line change per file.
 *   2. **The mandrill against the baboon.** Deliberately the same hull and the
 *      same muzzle shape, because a mandrill IS a baboon. Everything rests on
 *      three cards and a stub tail.
 *   3. **The fossa.** The only animal in the project whose entire design is that
 *      it has no markings. Plain, or blank?
 *   4. **The dugong against the manatee.** One build twice, with a fluke against
 *      a paddle. That is genuinely the whole difference in life; the question is
 *      whether it is enough on a tablet.
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
 * ALL TWELVE, and all twelve are real animals. See the header's last section
 * for the five that carry a flag and for what each of them strained.
 *
 * IN ROSTER ORDER, which is the order `roster.ts:304-309` lists them and the
 * order the album shows them. A collection whose file order disagrees with its
 * roster order is a trap `species-garden.test.ts:149` already exists to catch,
 * so a member arriving later is INSERTED at its rostered place, never appended.
 *
 * Every record below is one line. The reasoning for a species' SHAPE — which
 * hull, which part stands in for the shape the bank has not got, what was
 * refused and why — lives in its own `parts/assembled/animal-<id>.ts`, beside
 * the number it justifies. What belongs here is what is true of the COLLECTION:
 * the header's separation work, and one line per species saying which field
 * holds it apart from its nearest neighbour.
 *
 * NO RECORD HERE CARRIES A `threat`, and the header's first section says why at
 * length. The collection's name is its premise, not a reading.
 */
export const VULNERABLE_SPECIES: readonly Species[] = [

  /* The seventh cat, and the first on a TALL shell — box-21, which no cat in
   * the project wears. Its rosettes go on the spine as well as the flank. */
  defineSpecies('animal-snow-leopard', 'bespoke'),

  /* The first sirenian, and its tail is a whale's FLUKE. The rostrum tilted
   * thirty degrees down is what it has that the beluga and narwhal have not. */
  defineSpecies('animal-dugong', 'bespoke'),

  /* The smallest bear, and the first of two chest marks said as a turned CARD
   * because there is only one hull band in the pack and the moon bear got it. */
  defineSpecies('animal-sun-bear', 'bespoke'),

  /* The biggest ears of any bear — box-25 worn as Kenney drew it for the first
   * time since he drew it — and Kenney's own forward band as the crescent. */
  defineSpecies('animal-moon-bear', 'bespoke'),

  /* The shaggy one: one row of the hedgehog's repeat-and-sink swept back over
   * the shoulder, and the only bear here with no tail, for 80 triangles. */
  defineSpecies('animal-sloth-bear', 'bespoke'),

  /* The first bird tail in the project that is not a FAN — the lion's 1.0824,
   * the longest reach in the tail bank, trailing off a parrot. */
  defineSpecies('animal-hyacinth-macaw', 'bespoke'),

  /* Deliberately animal-baboon on the same hull with the same muzzle shape,
   * because a mandrill is a baboon. Three cards on the muzzle are the animal. */
  defineSpecies('animal-mandrill', 'bespoke'),

  /* The third ratite, and the first separated by what it HAS: a casque out of
   * the parrot's beak stood on end, on the only neck stretched SHORTER. */
  defineSpecies('animal-cassowary', 'bespoke'),

  /* Eight built carnivores look like this one, so it is separated by having
   * NOTHING — no mask, no spots, no rings, no belly line, no tail tip. */
  defineSpecies('animal-fossa', 'bespoke'),

  /* The tenth bovid, and the first not to argue about horn angles: the whole
   * animal is a muzzle stretched 1.7x on its own HEIGHT. */
  defineSpecies('animal-takin', 'bespoke'),

  /* The eleventh, and the only bovid on a tall shell. Its dorsal ridge is the
   * hog's nose pad turned on its side and run down the spine. */
  defineSpecies('animal-gaur', 'bespoke'),

  /* The dugong again, on purpose, with the one part that differs: the BEAVER'S
   * OWN PADDLE, stretched on its height and laid flat. */
  defineSpecies('animal-manatee', 'bespoke'),
]
