/**
 * The Critters collection — roster row 6, `ship: 6`, name band `short`.
 *
 * NEW FILE, 5 August 2026. There has never been a `collections/critters.ts`;
 * this one was written on the assembly route from the first line.
 *
 * ===========================================================================
 * ## §14 SAYS THIS COLLECTION IS IMPOSSIBLE. HALF OF THAT SENTENCE IS FALSE,
 * ## AND IT IS FALSE FOR THE SAME REASON OCEAN'S WAS.
 * ===========================================================================
 *
 * `docs/how-the-animals-are-made.md` §14 has said since 29 July:
 *
 * > **Critters (16)** — no membranous insect wing, no segmented leg.
 *
 * and §5 counts all sixteen among the "64 impossible". **The first half is
 * wrong.** Measured off `PARTS_BANK` today, 100 records, the `wing` role occurs
 * six times:
 *
 *       blade-06 / -07   0.693 x 0.200 x 0.600   provenance `bee:wing, penguin:wing`
 *       wedge-19 / -20   0.573 x 0.200 x 0.600   provenance `chick:wing, parrot:wing`
 *       box-42  / -43    0.362 x 0.450 x 0.362   provenance `fish:wing`
 *
 * **`blade-06` AND `blade-07` ARE THE PACK'S OWN BEE'S WINGS.** The bee is the
 * FIRST donor listed, which the bank's own header says is the one that donated
 * the geometry — so those vertices came out of `animal-bee.glb`, and a bee's
 * wing is a membranous insect wing by definition. They were baked on the morning
 * of 4 August for the budgie, and `docs/building-animals-from-parts.md` §3.1
 * already recorded, on 29 July, that *"the bee's are true insect wings"* and
 * that they were censused and simply not baked.
 *
 * **Nobody had ever worn one as an insect wing.** Three species reach for
 * `blade-06` today — `animal-ray`, `animal-turtle`, `animal-whale` — and all
 * three call it *the penguin's wing, which already is a flipper*, because Ocean
 * got to it first and the penguin's copy is bit-identical to the bee's. That is
 * §7's cross-role dedup paying twice over: **one shape is both the pack's insect
 * wing and the pack's flipper**, and which of the two it is depends entirely on
 * what you place it on. Seven species below wear it as a wing.
 *
 * §14's own Ocean entry already carries the lesson in bold — *"a claim about
 * what the bank does not hold expires the moment a role is baked; date it, or it
 * outlives its own truth."* It expired for Critters on the same morning and for
 * the same bake, and nobody came back.
 *
 * **THE SECOND HALF IS TRUE.** The bank holds exactly ONE leg shape: `box-01`,
 * 0.375 x 0.306 x 0.375, taper 1.000, a plain stub, used 86 times across 23
 * donors. Nothing in the other 99 records has a joint or a bend. But it is not
 * what stops this collection either, because **Kenney drew two insects — the bee
 * and the caterpillar — and gave each of them four `box-01` stubs.** An
 * unsegmented leg is the pack's own answer for an insect. Where it genuinely
 * bites is on three species, and it is priced below.
 *
 * ===========================================================================
 * ## WHAT ACTUALLY STOPS THINGS HERE — three shapes, priced
 * ===========================================================================
 *
 * Two of the sixteen are PLACEHOLDERS. Joe, 5 August: *"put something in for the
 * unbuildable ones anyway so i can do it manually. if there is no entry at all,
 * i cant do that."* So each is a full entry — file, index line, record, `MOVES`,
 * both ledger rows — carrying the nearest honest approximation with a header
 * whose first line says it is a placeholder and exactly what is missing.
 *
 * **1. A HINGED LIMB. Three species, and the biggest commission this collection
 * produces.** `animal-spider` wants a knee, `animal-grasshopper` wants a tibia
 * folded back against its femur, and `animal-mantis` wants a forearm that closes.
 * All three are BUILT and all three carry one straight length where the animal
 * has two at an angle. Measured: the bank's longest narrow shape is `box-18` at
 * 0.623 long and 0.345 across, and `PartDef.on` can chain a second copy — but it
 * joins the first one's TIP along its own facing, which makes a spear and not an
 * elbow. `Feature.spin` bakes a rotation into a copy's vertices; it turns a part
 * and cannot bend one. **One authored hinged limb finishes three species.**
 *
 * **2. AN ELONGATED HULL. Three species, and it is a RULING rather than a
 * commission.** `animal-stick-insect` is a placeholder for this alone;
 * `animal-worm` and `animal-centipede` are built and both say it in their flags.
 * Measured: the pack drew ten shells and every one is within 0.90 to 1.23 of
 * cubic, running 1.125 to 1.5395 on its long axis, and `HullDef.stretch` is
 * `never` — Joe's own ruling, given twice ("the body/cube should always be the
 * standard size, its often bigger") and quoted in `hulls.ts`. That rule is right
 * for 295 of the 296 species and it makes these three unbuildable by
 * construction. **The cheapest fix is not a dial and not an exception: it is one
 * more hull SHAPE, authored long, taking its place beside the pack's ten.**
 * `primitiveStretched` already re-cuts the pack's own 0.25 chamfer at any size,
 * so the machinery exists; what does not exist is a ruling, `authored.ts` §1
 * having scoped authoring to the three base shapes by name.
 *
 * **3. A CURVE. One species here and two elsewhere.** `animal-snail` is a
 * placeholder because a snail is its spiral shell and **all 100 records in the
 * bank are straight or tapered along a single axis** — there is no curve of any
 * kind. `animal-seahorse` (Ocean) and the flamingo's downcurved bill
 * (`collections/birds.ts`) already name the same gap, so this is the THIRD
 * collection to price it and **one coiled shape would finish three species in
 * three collections.**
 *
 * Nothing here needs a `claw`, which is the one commission Ocean left open.
 *
 * ===========================================================================
 * ## THREE MEASUREMENTS THIS COLLECTION MADE THAT THE NEXT ONE SHOULD HAVE
 * ===========================================================================
 *
 * **A WING IS SUNK 0.625 OF ITSELF, AND THE NUMBER IS FORCED.** All six wing
 * shapes in the bank are **0.200 thick**, and §3's measured floor — *"every
 * eared species embeds its ear by at least 0.125"* — is an ABSOLUTE distance,
 * not a fraction. 0.125 / 0.200 = 0.625, so that is the shallowest a wing can
 * sit and still meet the pack's own minimum. Anything less and
 * `npm run pets:creature` prints THIN. Every wing in this collection is at
 * exactly that depth, and a wing shows its plan area rather than its thickness,
 * so it costs the read nothing.
 *
 * **A RADIAL HOOP SUNK 0.5 PUTS ITS CENTRE ON ITS `at`, EXACTLY.** The shift
 * `creature.ts` applies is `-lo - sink x extent`, and for a symmetric shape
 * `lo = -extent/2`, so at `sink: 0.5` the shift is zero. Six species here place
 * bands that way, and it turns a hoop from something joined to a face into
 * something standing at a station on a body — which is what a segment is.
 *
 * **EVERY HOOP IN THE BANK HAS TO BE THINNED, EXCEPT ONE, AND HERE ARE ALL
 * FIVE.** A hoop's bounding box is mostly hole, so rule 3's ratio of 3 refuses
 * most of them at their own thickness. Against the 1.250 cube's 1.9531:
 *
 *       box-11   1.4445 x 0.8769 x 0.4458   ratio 3.46   the ONLY one that passes
 *       box-04   1.3350 x 1.3350 x 0.4560   ratio 2.40
 *       box-35   1.3433 x 1.3433 x 0.4975   ratio 2.18
 *       box-19   1.4040 x 1.4040 x 0.5200   ratio 1.91
 *       box-29   1.6500 x 1.6500 x 0.5000   ratio 1.43
 *
 * `animal-tortoise.ts:149` established the halving and `animal-firefly.ts`,
 * `animal-goldfish.ts` and `animal-slow-worm.ts` each re-derived it; here it is
 * in one place. **Thin, never shrink** — `animal-slow-worm.ts` measured that a
 * uniform shrink big enough to satisfy rule 3 takes a ring INSIDE the 1.250 hull
 * where nothing can see it.
 *
 * **AND TWO THINGS THAT ONLY TURNED UP BY BUILDING.**
 *
 * `plate-04`/`plate-05`, THE CAT'S EYE CARD, CANNOT BE WORN BY ANY SPECIES.
 * Measured off its own `bands` field, **every one of its 34 triangles is band
 * 15** — it is all pupil and carries no sclera at all, where the other four eye
 * families carry both 3 and 15. `assembly-assert.ts` requires an eye card to
 * read TWO palette slots, so the cat's fails the harness on any animal. It was
 * `animal-moth`'s first choice, on the argument that it is the pack's only eye
 * drawn for something awake at night, and it had to be given up.
 *
 * A NON-QUARTER SPIN OF A MANY-VERTEX PART CAN FAIL THE HARNESS WITH THE
 * GEOMETRY CORRECT. `animal-spider`'s legs were `box-18` at `{ axis: 'z', deg:
 * 45 }`; every one failed *"is a copy of box-18"* while PASSING the rigid
 * fingerprint beside it, which is the pair of results that says the shape is
 * right and the comparison is confused. The check un-spins the mesh and sorts
 * both point sets on x, then y, then z, and compares element-wise; `box-18` has
 * many vertices sharing an exact x, a rotation perturbs those in the sixteenth
 * decimal, and the two sets sort into different orders. Small cards and
 * `cone-01` (the hedgehog's chamfer rows) never trip it; a 42-point part does.
 * **It is written down rather than worked around** — the spider's legs hang
 * straight for an unrelated and better reason, §8's 0.625-square bottom face —
 * because a fix belongs in the harness and not in an animal.
 *
 * ===========================================================================
 * ## SIX LEGS, AND THIS COLLECTION OVERRULES TWO SHIPPED FILES TO GET THEM
 * ===========================================================================
 *
 * `animal-firefly.ts` and `animal-glow-worm.ts` both argue, in writing, that
 * four is the pack's own answer for an insect: *"Kenney drew two insects — the
 * bee and the caterpillar — and each is a fused hull plus four `box-01` legs.
 * Six was available to him and he did not use it."* That is correct about the
 * pack and it is overruled here, deliberately, for one reason:
 *
 * > **In this collection the number of legs IS the diagnosis.** A child sorting
 * > a critters album separates an insect (six) from a spider (eight) from a
 * > centipede (many) by counting, and it is the only album where that is true.
 *
 * So nine species carry six, `animal-spider` carries eight, `animal-centipede`
 * carries fourteen — the most in the project — and three carry four for reasons
 * of their own, each stated in its file: the dragonfly (rule 9, and it cannot
 * walk), the woodlouse (rule 9, and the plates won) and the grasshopper (four
 * walking legs plus two great femora, which IS six limbs).
 *
 * Nothing about the mechanism changed: a row is `Placement.pair` at a station,
 * which is what `defineCreature` already gives every animal four of.
 *
 * ===========================================================================
 * ## ROSTER §4 — the look-alikes, and where each is held apart
 * ===========================================================================
 *
 * Three pairs are internal and three reach outside, which is worse:
 *
 *   - **butterfly / moth.** The cube against `box-12`, the cow's WIDER shell;
 *     four wings of two shapes against two wings of one, which is the resting
 *     pose of each animal rather than a saving; `cone-01` against `cone-04`, the
 *     hog's ear as a plumed antenna; and `plate-08` against `plate-04`, the
 *     cat's — the pack's only eye drawn for something awake at night.
 *   - **ladybird / beetle.** Both are hard-shelled boxes. Separated by SPOTS
 *     against JAWS: seven `plate-16` cards against `wedge-13`, the hog's tusks.
 *   - **snail / slug.** The same animal minus a shell, on purpose. The slug's
 *     mantle is `box-11` where the snail's shell is `box-19`.
 *   - **wasp against `animal-bee`, which is FROZEN** and cannot move. Four
 *     measured separations and none of them the yellow: the shallower `box-31`
 *     hull, two abdominal rings against one, a `box-18` sting, and six legs
 *     against four.
 *   - **worm and centipede against `animal-glow-worm`**, which is five `box-11`
 *     hoops on a cube. The worm is seven `box-04` ones and no legs; the
 *     centipede has no rings at all and fourteen legs. Three ringed tubes would
 *     have been one animal three times.
 *   - **grasshopper / mantis**, the two green insects. Upright `box-21` against
 *     the cube, forelegs raised in front against femora folded behind, and the
 *     darker green against the lighter.
 *   - **spider against Jungle's `animal-tarantula`**, and the two collections
 *     were built the same night and reached OPPOSITE verdicts on the same
 *     animal: `collections/jungle.ts` ships the tarantula as a PLACEHOLDER on
 *     three grounds — one leg shape, two masses, eight eyes — and every one of
 *     those is true here too. The spider is built anyway because on the judgement
 *     `animal-firefly.ts` set for a missing part (*"if the missing part IS the
 *     animal the species is blocked; if the animal is recognisable without it it
 *     is built and the absence is flagged"*) a spider is recognisable from eight
 *     legs alone, and eight legs are sayable. **That difference is a judgement
 *     and it is Joe's to settle either way**; if the two should agree, the cheap
 *     direction is to build the tarantula on this file's arrangement, since the
 *     hinged limb they both want is one commission.
 *
 * ===========================================================================
 * ## ALL SIXTEEN, MEASURED — `npm run pets:creature`, 5 August 2026
 * ===========================================================================
 *
 *       species          height  keep-out  verts  tris   fingerprint
 *       butterfly        1.7066  0.767      538    784   913a1a8261c1ed7c
 *       ladybird         1.6632  0.647      380    500   525419826683f35c
 *       dragonfly        1.5062  1.055      556    868   055733b49fb65ed6
 *       ant              1.7066  0.668      470    658   7066cc9c94496d96
 *       beetle           1.6632  0.730      464    666   c416c5ad672b0213
 *       spider           1.7640  0.672      580    892   558e29812c48ed4b
 *       worm             1.3350  0.668      426    754   ca409a951d9cbb5f
 *       grasshopper      1.7066  0.661      578    720   48e0a34bdb5db70d
 *       moth             1.5158  0.787      612    878   0afb26a616437930
 *       woodlouse        0.8548  0.702      530    878   375c01aaf28b4b54
 *       snail            1.5618  0.784      282    430   f311d3282f561e02
 *       centipede        1.7066  0.688      630    826   47cf15692c24dccf
 *       mantis           1.9616  0.811      642    840   b6adc8a338f7e76d
 *       stick insect     1.7066  1.055      440    614   37172f396e75ded3
 *       wasp             1.7066  0.843      590    902   3911e9f7b848b9d5
 *       slug             1.5464  0.784      278    422   627b8e9c2fdc380e
 *
 * **Every one is inside rule 9's triangle band of 422-951 and none declares a
 * RULE 9 overrun** — the closest are the wasp at 902 and the spider at 892, and
 * the dragonfly and the woodlouse each lost legs to the ceiling rather than
 * declaring one. Two are under the pack's 405 VERTEX floor, which is a norm that
 * reports: the snail at 282 and the slug at 278, both legless with four features
 * apiece, against `animal-goldfish`'s shipped 342 and the wren's 345. Two are
 * under the 1.43 HEIGHT floor, also a norm that reports: the worm at 1.3350
 * (Ocean's legless toll) and the woodlouse at 0.8548 (the crab shell, and
 * `animal-ray` shipped at 0.8670 on it). Nothing here exceeds the keep-out the
 * fox pays.
 *
 * ## WHY THERE ARE NO `threat` RECORDS
 *
 * Roster §5 wants statuses "true, checkable", and `Threat.checkedDate` exists so
 * a status is a dated reading of the Red List rather than a memory. Writing
 * categories here from recall would produce records that only LOOK checked.
 * Absent means "not recorded yet", which is honest.
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
 * FOURTEEN ARE REAL ANIMALS. TWO ARE PLACEHOLDERS — the snail and the stick
 * insect — put in so Joe can finish them by hand, each saying so in the first
 * line of its own file header and in its `flag`. A placeholder is not promoted
 * into the built count to make the number look better; the survey above prices
 * both, and it prices the three BUILT species (spider, grasshopper, mantis) that
 * are waiting on the same hinged limb.
 *
 * IN ROSTER ORDER, which is the order `roster.ts:145-150` lists them and the
 * order the album shows them. A member arriving later is INSERTED at its
 * rostered place, never appended.
 *
 * Every record below is one line. The reasoning for a species' SHAPE lives in
 * its own `parts/assembled/animal-<id>.ts`, beside the number it justifies —
 * and for a placeholder, so does the price of finishing it, because that is
 * where the person doing it by hand will be reading.
 */
export const CRITTERS_SPECIES: readonly Species[] = [

  /* The species that proves the collection: the pack's own BEE'S WING, worn as
   * an insect wing for the first time, twice over in two real wing shapes. */
  defineSpecies('animal-butterfly', 'bespoke'),

  /* Seven spots out of the pig's nostril card, four on the flat top and the
   * rest on the chamfer — §8's idiom carrying a marking instead of a spike. */
  defineSpecies('animal-ladybird', 'bespoke'),

  /* Four wings of one shape and a two-link abdomen, on the slenderest shell the
   * pack drew. The one insect here that genuinely cannot walk. */
  defineSpecies('animal-dragonfly', 'bespoke'),

  /* Three body sections drawn on one mass with two of the bee's own rings, and
   * the caterpillar's own mouthparts as jaws. */
  defineSpecies('animal-ant', 'bespoke'),

  /* The ladybird's twin, held apart by the hog's tusks worn as a stag beetle's
   * mandibles — one shape, filed by geometry, doing a job nobody drew it for. */
  defineSpecies('animal-beetle', 'bespoke'),

  /* Eight legs, and the count is the animal — the elephant's stub splayed 45
   * degrees, because the bank's one leg is a 0.375 nub. */
  defineSpecies('animal-spider', 'bespoke'),

  /* Seven rings and no face. The clitellum is the one thing that tells an
   * earthworm from every other pink tube, including the slug below. */
  defineSpecies('animal-worm', 'bespoke'),

  /* The bunny's ear at 35 degrees off the rear flank: the biggest ear in the
   * pack worn as the only thing a child reads a grasshopper by. */
  defineSpecies('animal-grasshopper', 'bespoke'),

  /* The butterfly's twin, separated on four measured axes and no palette: a
   * wider shell, two wings, plumed antennae and the cat's night eye. */
  defineSpecies('animal-moth', 'bespoke'),

  /* The only species here on the CRAB'S shell, and the argument is lineage — a
   * woodlouse is a crustacean — rather than that it is flat. */
  defineSpecies('animal-woodlouse', 'bespoke'),

  /* PLACEHOLDER — a snail is its spiral and all 100 shapes in the bank are
   * straight or tapered along one axis. The disc on its back says so. */
  defineSpecies('animal-snail', 'bespoke'),

  /* Fourteen legs, which is the most in this project, and no rings at all so it
   * cannot be read as the glow-worm. */
  defineSpecies('animal-centipede', 'bespoke'),

  /* The elephant's ear raised in front as a raptorial foreleg, on the tallest
   * shell the pack drew — the only upright animal in the collection. */
  defineSpecies('animal-mantis', 'bespoke'),

  /* PLACEHOLDER — the animal is elongation and elongation is unsayable: ten
   * hulls, all within 0.90-1.23 of cubic, and `HullDef.stretch` is `never`. */
  defineSpecies('animal-stick-insect', 'bespoke'),

  /* The sharpest roster §4 case here: `animal-bee` is frozen and this is the
   * same insect. Four separations, none of them the yellow. */
  defineSpecies('animal-wasp', 'bespoke'),

  /* The snail minus its shell, which is what a slug is. `box-11` is the one
   * hoop in the bank that passes rule 3 untouched, and this is its mantle. */
  defineSpecies('animal-slug', 'bespoke'),
]
