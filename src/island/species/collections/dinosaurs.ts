/**
 * The Dinosaurs collection — roster row 14, `ship: 14`, name band `medium`.
 *
 * NEW FILE, 6 August 2026. There has never been a `collections/dinosaurs.ts`;
 * this one was written on the assembly route from the first line.
 *
 * ===========================================================================
 * ## §14 SAID THIS COLLECTION WAS IMPOSSIBLE. ALL THREE OF ITS WORDS ARE WRONG
 * ## AND ONE PART ANSWERS EVERY ONE OF THEM
 * ===========================================================================
 *
 * `docs/how-the-animals-are-made.md` §14 has said since 29 July:
 *
 * > **Dinosaurs (16)** — no frill, no plate, no spine.
 *
 * That line prevented a collection for eight days, exactly as it prevented Ocean
 * and Critters before it. **It was re-measured against all 100 records of
 * `PARTS_BANK` before a line of this collection was written, and every one of its
 * three claims failed against the SAME SHAPE.**
 *
 *       blade-05   1.000 x 1.000 x 0.125   18 tris   16 welded points
 *                  roles ["nose"]   provenance `lion:muzzle/snout`
 *                  attachment z +1, sunkFraction 0.000, bands {15, 5}
 *
 * `blade-05` is the lion's muzzle plate: **an octagonal slab as wide and as tall
 * as four fifths of a hull and one eighth as thick, for eighteen triangles.** It
 * is the only large flat plate the pack drew, it has been in the bank since the
 * first bake, and in 250 built species nothing had ever stood it on its edge.
 *
 *   - **THE FRILL** is `blade-05` upright and leaned back 45 degrees, on
 *     `animal-triceratops`. A 1.000 x 1.050 shield behind the head.
 *   - **THE PLATE** is `blade-05` turned a quarter about y, narrowed to 0.300
 *     fore-aft and repeated four times, on `animal-stegosaurus`. Four dorsal
 *     plates for 72 triangles between them.
 *   - **THE SPINE** is `blade-05` given the SAME quarter turn and left whole, on
 *     `animal-spinosaurus`. One part 0.125 thick, 1.000 tall and 1.000 long
 *     covering 80% of a 1.250 back — an entire sail for 18 triangles.
 *
 * A fourth species, `animal-dilophosaurus`, mirrors it into a pair of head
 * crests. **One shape, four animals, told apart by nothing but placement and a
 * stretch — which is §3.1 of `building-animals-from-parts.md` in Joe's own
 * words, working exactly as he said it would.**
 *
 * **THE PATTERN IS NOW THREE FOR THREE AND IT IS WORTH NAMING.** Ocean's fins
 * were in the bank under the word `wing` with the word `fish` beside them.
 * Critters' insect wing was `blade-06`, with `bee:wing-left` as its FIRST
 * provenance entry. Dinosaurs' frill, plate and spine were one record under the
 * word `nose` with the word `lion` beside it. **In all three cases the shape was
 * present and the ROLE LABEL hid it** — which is the precise failure §3.1 warned
 * about on 29 July: *"the 64 was counted under the assumption that a part's role
 * is fixed by its label, and that assumption is wrong."* §14 is that assumption
 * written down as a fact. The remaining entry on its list, **Raptors**, should be
 * measured and not read.
 *
 * ===========================================================================
 * ## THE FIVE MEASUREMENTS THAT DECIDED SIXTEEN ANIMALS
 * ===========================================================================
 *
 * **1. THERE IS NO LONG HIND LEG AND TEN OF THE SIXTEEN WANT ONE.** `box-01`
 * occurs 86 times across 23 of the 24 originals and it is **one shape at one
 * size — 0.375 x 0.30625 x 0.375** — and `LEG_ROW.y` is an absolute 0.18125,
 * which is what puts feet on zero on nine of the pack's ten hulls. `legs` takes
 * stations and a paint and nothing else. So every bipedal dinosaur here stands on
 * `animal-chicken.ts`'s and `animal-goose.ts`'s biped station — `legs: false`
 * plus one mirrored `box-01` pair at the shape's own recorded x = 0.25 on the
 * hull's midline — and is a theropod on a chicken's legs.
 *
 * **THE COMMISSION REGISTER NOW STANDS AT EIGHTEEN SPECIES BEHIND THAT ONE
 * PART**: the kangaroo, ostrich, quokka, emu, heron, stork, flamingo, maned wolf
 * and jerboa already counted, plus this collection's t-rex, velociraptor,
 * spinosaurus, allosaurus, dilophosaurus, gallimimus, carnotaurus,
 * pachycephalosaurus and pterodactyl. **The gallimimus wants it most** — an
 * ornithomimid IS its legs — and `animal-tree-kangaroo` remains the only species
 * in the project that has looked at it and declined.
 *
 * **2. A SECOND `box-01` PAIR IS AN ARM, AND THE NAME IS LOAD-BEARING.**
 * `assembly-assert.ts` asserts that every mesh called `leg` or `leg-*` has its
 * bottom on y = 0, and never waives it, because `buildAssembly` grounds the
 * animal on its LOWEST point. Four theropods here carry forelimbs and every one
 * of them is a `box-01` stretched and named `arm`. Called `leg-front` it would
 * fail the suite by name; hung below the feet it would lift the legs off the
 * floor and fail it the other way. **The same floor is what caps
 * `animal-iguanodon`'s thumb spike at y = 0.62.**
 *
 * **3. THE NECK IS `box-18` AND THE LEAN IS THE CURRENCY.** There is no neck in
 * the bank. `animal-terrapin.ts` wore the elephant's trunk forwards as one,
 * `animal-goose.ts` stood it on end (`axis: 'y', dir: 1`, so it runs along its
 * 0.623004 of HEIGHT rather than its 0.425211 of depth) and measured the wall:
 * *"a goose that stands its neck up cannot be built in this pack"*, because
 * `PACK_HEIGHT_MAX` is 2.02. The useful half of that table is that **leaning
 * converts vertical headroom into ground reach**, and this collection spends it in
 * both directions on purpose:
 *
 *       animal-brachiosaurus   lean 25   stretch 2.0   height 2.2870   OVER
 *       animal-gallimimus      lean 45   stretch 1.5   height 1.9945
 *       animal-diplodocus      lean 72   stretch 2.4   height 1.8933
 *
 * The brachiosaur is **the first species in the project to spend the height norm
 * UPWARDS.** Ocean spent it downwards, six of sixteen under the floor; since Joe's
 * 3 August ruling the band REPORTS rather than fails, and a sauropod is what that
 * ruling is for. It is one number if he disagrees.
 *
 * **4. THE SINK OF A LEANED NECK IS SOLVED AND `animal-diplodocus` IS THE
 * TIGHTEST IN THE PROJECT.** A leaned root face rides up as it leans, so
 * `sink * L >= (0.425211 / 2) * tan(lean)`. At 72 degrees that wants 0.654168 and
 * 7/16 of 1.495210 gives 0.654154 — short by **1.4e-5**, four orders below the
 * pack's own 1/16 grid. At 6/16 the neck's rear corner stands 0.093 proud of the
 * crown it is joined to, which is §3's "nothing floats" failing at a root rather
 * than at a tip.
 *
 * **5. A `belly` LINE SPLITS THE SLOT'S CELL, NOT THE HULL'S.** `animal-stoat.ts`
 * shipped with cream ears and a cream tail because both said `coat` and `coat` was
 * split at 10/16. **Every one of the sixteen here sets `belly`, and not one of
 * them paints a feature from the coat slot** — six species carry a `hide` slot
 * holding the coat's own colour under a second name for exactly that reason. It is
 * the cheapest bug in this project to write and the hardest to see.
 *
 * ===========================================================================
 * ## WHAT THIS COLLECTION STILL WANTS, PRICED
 * ===========================================================================
 *
 * Sixteen of sixteen are real animals and none is a placeholder. Three shapes
 * would each improve several of them and every one is a commission for Joe:
 *
 * **A LONG HIND LEG — nine more species behind it, eighteen in all.** See §1. It
 * is the largest single commission in the register and this collection nearly
 * doubles it.
 *
 * **A DOME — `animal-pachycephalosaurus`, and the fourth species in the project
 * to ask.** Ocean's jellyfish and sea turtle and Garden's `animal-tortoise` are
 * the other three. There is no hemisphere in the bank: all ten hulls are
 * chamfered boxes and all 100 shapes are straight or tapered along one axis. The
 * nearest is `box-25`, the koala's dish, whose aspect goes from 1 : 1 : 0.469 to
 * 1 : 1 : 0.843 when it is swollen 1.8x on its own thickness — the roundest solid
 * this bank can be made to hold. **`bespoke-circle-01` is refused here and the
 * refusal is JT-041's**, which scopes the three base shapes as PRIMITIVES ONLY.
 *
 * **A CLAW — `animal-velociraptor`, and it is A BAKE AND NOT AN AUTHORING JOB.**
 * §7 censuses **claw: 10 instances, 10 distinct shapes, donors crab, lion, tiger
 * and polar — BAKED: no.** The roles actually in `PARTS_BANK` are band, card,
 * ear, eye, hull, leg, nose, oddment, tail, tooth and wing. Ocean's lobster
 * priced the same absence; this is the second species behind it. **The line is
 * Joe's**, because baking a role renumbers the whole bank silently and once
 * turned the newt's crest into bee wings.
 *
 * **THE CURVE IS NOT WANTED HERE, WHICH IS WORTH SAYING**, because it is priced
 * by six collections and this is the second (after Endangered) to check all
 * sixteen members against it and add none. Nothing in this row bends.
 *
 * ===========================================================================
 * ## THE SEPARATIONS, AND THIS ROW HAS MORE INTERNAL COLLISION THAN ANY OTHER
 * ===========================================================================
 *
 * Eleven of the sixteen are bipedal or facultatively bipedal reptiles on the same
 * leg row. Each group was separated on a MEASURED axis, never on colour:
 *
 *   - **The three big theropods** — t-rex, allosaurus, carnotaurus — are held
 *     apart by the SHELL and the JAW BLOCK. `box-21`, the tallest hull in the
 *     bank at 1.5051, is the t-rex's and nothing else here takes it; the jaws are
 *     `box-18` at 10/16 x 10/16 full depth, `tube-03` (taper 1.000, the same
 *     section all the way out) and `box-18` at 10/16 x 9/16 by 0.7 depth. The
 *     brow ornaments are the blunt `wedge-16` on the FLAT TOP face against the
 *     pointed `cone-04` on the CHAMFER.
 *   - **The two sauropods** — brachiosaurus, diplodocus — are one number: 25
 *     degrees off vertical against 72. See §3.
 *   - **The two hadrosaur-adjacent quadrupeds** — parasaurolophus, iguanodon —
 *     are separated twice: a CREST (the trunk swept BACK, the sign of the lean
 *     reversed) against THUMB SPIKES, and a broad `tube-07` bill (1.7733
 *     wide-over-tall, `animal-goose.ts`'s measurement) against the bunny's narrow
 *     muzzle. The iguanodon also takes the widest shell where the hadrosaur is on
 *     the cube.
 *   - **The two small bipeds** — velociraptor, dilophosaurus — are the SHELL
 *     again: `box-31`, the lion's shallow 1.125, is the velociraptor's and is the
 *     only one in the collection.
 *
 * And two reach OUTSIDE the collection, which is worse:
 *
 *   - **`animal-gallimimus` against `animal-ostrich`**, which is built and in the
 *     tree and which this animal is literally named for resembling. Separated by
 *     NO WINGS (the ostrich wears the nine-bird `box-06` folded flank wing), by a
 *     long stiff `wedge-18` counterweight tail, and by the cube against `box-12`.
 *   - **`animal-ankylosaurus` against `animal-crocodile`**, both scute-backed
 *     reptiles. Separated by the ROW COUNT and the SHAPE: the crocodile takes
 *     `wedge-06` on `rows: ['top']` only — one line down the spine, five copies,
 *     deliberately NOT round-backed — where this takes `wedge-04` on top AND both
 *     chamfers, twelve copies, which is §8's idiom doing the opposite job.
 *
 * ## WHY THERE ARE NO `threat` RECORDS
 *
 * The obvious joke is available and it is not the reason. Roster §5 wants statuses
 * "true, checkable" and `Threat.checkedDate` exists so a status is a dated reading
 * of the Red List rather than a memory. Absent means "not recorded yet", exactly
 * as it does for the base 24's seven badged species and for every collection since
 * Ocean.
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
 * ALL SIXTEEN, AND ALL SIXTEEN ARE REAL ANIMALS.
 *
 * No placeholder. That is a first for a collection §14 had ruled impossible —
 * Ocean shipped twelve and four, Critters fourteen and two — and it is the
 * measurement in the header rather than any new capability that bought it.
 *
 * IN ROSTER ORDER, which is the order `roster.ts:251-265` lists them and the
 * order the album shows them. A member arriving later is INSERTED at its
 * rostered place, never appended.
 *
 * Every record below is one line. The reasoning for a species' SHAPE lives in its
 * own `parts/assembled/animal-<id>.ts`, beside the number it justifies.
 */
export const DINOSAURS_SPECIES: readonly Species[] = [

  /* The tallest shell in the bank, and the crocodile's jaw idiom at the opposite
   * proportion: as deep as it is wide. */
  defineSpecies('animal-t-rex', 'bespoke'),

  /* THE FRILL. blade-05 stood upright and leaned 45 degrees back, which is the
   * first of §14's three words to fall. */
  defineSpecies('animal-triceratops', 'bespoke'),

  /* THE PLATE. The same shape turned a quarter about y, narrowed and repeated
   * four times — four dorsal plates for 72 triangles between them. */
  defineSpecies('animal-stegosaurus', 'bespoke'),

  /* The goose's neck at a lean of 25 degrees, and the first species in the
   * project to spend the pack's height norm UPWARDS. */
  defineSpecies('animal-brachiosaurus', 'bespoke'),

  /* The bee's wing, the penguin's flipper and now a pterosaur's membrane — one
   * shape's third job, re-axised so it runs along its long extent. */
  defineSpecies('animal-pterodactyl', 'bespoke'),

  /* The `claw` role has never been baked. The hog's tusk stands in as a HAND
   * claw, because a foot claw would lift the feet off the floor. */
  defineSpecies('animal-velociraptor', 'bespoke'),

  /* Twelve scutes on the top and both chamfers — §8's idiom used to make a cube
   * read as a carapace, against the crocodile's deliberate single row. */
  defineSpecies('animal-ankylosaurus', 'bespoke'),

  /* The brachiosaur's twin, and the whole separation is one number: 72 degrees
   * off vertical against 25, length bought where the other bought height. */
  defineSpecies('animal-diplodocus', 'bespoke'),

  /* THE SPINE. blade-05 given the stegosaur's turn and left WHOLE — an entire
   * sail for 18 triangles, and the last of §14's three words. */
  defineSpecies('animal-spinosaurus', 'bespoke'),

  /* The middle theropod, held apart by TAPER: the bank's one straight rigid tube
   * as a jaw, where its two siblings wear a stretched box. */
  defineSpecies('animal-allosaurus', 'bespoke'),

  /* The elephant's trunk's fifth job, swept up and BACK — the neck idiom with the
   * sign of the lean reversed, which is the whole feature. */
  defineSpecies('animal-parasaurolophus', 'bespoke'),

  /* The thumb spike, and the first time cone-01 has been placed anywhere but a
   * back or a face. Its height is bounded by the floor, not by taste. */
  defineSpecies('animal-iguanodon', 'bespoke'),

  /* The collection's one commission: a DOME, wanted by four species across two
   * collections, with the koala's dish swollen 1.8x standing in. */
  defineSpecies('animal-pachycephalosaurus', 'bespoke'),

  /* blade-05's fourth job — a mirrored PAIR, with the gap between the two crests
   * falling out of the donor transfer rather than being chosen. */
  defineSpecies('animal-dilophosaurus', 'bespoke'),

  /* Built against animal-ostrich, which is already in the tree and which this
   * animal is named for resembling. No wings, a long tail, the cheaper shell. */
  defineSpecies('animal-gallimimus', 'bespoke'),

  /* Bull horns on the front-top chamfers at 30 degrees rather than the idiom's
   * 45, because at the bisector the crown is still the highest point. */
  defineSpecies('animal-carnotaurus', 'bespoke'),
]
