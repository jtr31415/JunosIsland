/**
 * The Jungle collection — roster row 12, `ship: 12`, name band `medium`.
 *
 * NEW FILE, 5 August 2026. There has never been a `collections/jungle.ts`; this
 * one was written on the assembly route from the first line, and all sixteen
 * members are built in the same run.
 *
 * `roster.ts:214-224` says which sixteen this collection holds; this file says
 * what is true of the COLLECTION. Nothing here builds geometry — every record
 * below is one line and the reasoning for a species' SHAPE lives in its own
 * `parts/assembled/animal-<id>.ts`, beside the number it justifies.
 *
 * ===========================================================================
 * ## SEPARATION IS ALMOST THE WHOLE JOB HERE, AND THIS IS THE MEASURE
 * ===========================================================================
 *
 * Jungle is the primate-and-big-cat collection, which means it collides harder
 * than any collection since Woodland — with the FROZEN base 24, with Africa,
 * with Woodland, with Night Time, and with itself. The live 24 can never be
 * edited, so every one of these separations is made on this side.
 *
 * **THE SHELLS, which is the first thing a child reads.** Ten hulls exist and
 * seven are spent here:
 *
 *       box-12  the widest (1.5395 across)          jaguar
 *       box-21  the tallest (1.5051)                gibbon
 *       box-31  the shallowest (1.125 deep)         sloth
 *       box-33  the monkey's own                    howler monkey, snake
 *       box-36  the panda's, and its BAND CUT       lemur
 *       box-39  the penguin's, and its BAND CUT     hummingbird
 *       box-20  the fish's cube                     tree frog
 *       box-03  the plain cube    chameleon, tapir, tarantula, anteater,
 *                                 capybara, ocelot, iguana, coati
 *
 * Two of those need saying out loud. **`box-41` IS DELIBERATELY UNSPENT and the
 * reason is measured**: its front face stands at z = 0.725, which is 0.090 IN
 * FRONT of `EYE_CARD_Z`, the absolute 0.6350 an eye card is pinned to on all 48
 * of the pack's own — so an eye placed on `box-41` is buried inside the hull.
 * `collections/ocean.ts` found that on the whale and it cost the jaguar the
 * obvious shell. **And `box-33` is worn twice for opposite reasons**: the howler
 * monkey wears the monkey's own hull because a howler IS a monkey
 * (`animal-baboon.ts`'s argument), and the snake wears it purely for its 114
 * triangles against the cube's 60, because a legless animal loses 176 with its
 * legs and rule 9's budget is a FLOOR as well as a ceiling.
 *
 * **THE CATS — three built collections and two frozen animals deep.**
 * `animal-lion` and `animal-tiger` cannot be edited; `animal-cheetah` (Africa),
 * `animal-lynx` and `animal-wildcat` (Woodland) are all on the plain cube, and
 * `collections/africa.ts` already spent the cheetah's separation on MARKINGS
 * rather than silhouette, which closes that route for anybody after it. So:
 *
 *   - **jaguar** separates FIRST on the shell — `box-12` at 1.5395 across, the
 *     widest in the bank, and no other cat in the project is on it — and then on
 *     the tail, `box-23` at 0.744, the thickest in the bank against three thin
 *     ropes and a stub.
 *   - **ocelot** deliberately does NOT separate on the shell: it takes the same
 *     cube as the cheetah, the lynx and the wildcat, because an ocelot IS a small
 *     cat. It separates on COUNT (twelve chained `plate-10` against the cheetah's
 *     eight scattered), on the EAR (`box-30`, the lion's own, which only
 *     `animal-otter` had ever spent, against the cheetah's smallest-in-the-bank
 *     `box-05`) and on the eye card.
 *   - **jaguar against ocelot**, which is the internal pair and the one a child
 *     sees on one page: 1.5395 against 1.250 across, `plate-11` against
 *     `plate-10` (a 1.7x gap in the marking card), and 0.744 against 0.200 in the
 *     tail — which is §7's own thickness split at its widest.
 *
 * **THE PRIMATES — five of them now, and each on a different axis.** The FROZEN
 * `animal-monkey` is Kenney's own cube; `animal-baboon` takes that cube with a
 * long `box-18` muzzle and an arched tail; `animal-gorilla` takes `box-41` and
 * has no tail. This collection adds three:
 *
 *   - **gibbon** — `box-21`, the only shell in the bank taller than it is wide,
 *     with a narrow wheelbase under it. No tail and no ears, which is what an ape
 *     is. The pale brow ring is two `plate-03` above the eye cards.
 *   - **howler monkey** — the monkey's own shell on purpose, separated by the
 *     THROAT (`box-24` cut to 0.600 x 0.320 and hung under the jaw, the only
 *     thing in the project worn under a chin) and by a tail carried UP.
 *   - **lemur** — a prosimian, and the only animal in the project that wears
 *     `box-36`'s own band cut as its coat. `animal-kinkajou.ts` refused that cut
 *     as "a black-and-white bear's"; a ring-tailed lemur is grey over cream with
 *     a hard edge, so this is the species it was drawn for.
 *
 * **THE RAISED TAILS, which is where three of these could have collapsed into
 * one.** The bank holds two thin ropes, `wedge-07` and `wedge-18`, identical to
 * six decimals, plus the lion's slightly thicker `wedge-15`. Four species here
 * want a tail that is not trailed and each takes a different answer:
 *
 *       howler monkey   wedge-07, chamfer: true    45 deg off the +y/-z chamfer
 *       lemur           wedge-15, chamfer: true    the same, on the thicker rope
 *       coati           wedge-18 at y = 1.11875    the top edge of the flat REAR
 *                                                  face — a solved bound, higher
 *                                                  and steeper than the chamfer
 *       chameleon       box-04 stood on edge       a coil, not a tail at all
 *
 * **AGAINST THE OTHER COLLECTIONS, one line each:**
 *
 *   - **anteater** against Africa's `animal-aardvark`, which is the same animal
 *     to a five-year-old. Separated on three measurements: a CONE (`cone-06`,
 *     taper 0) against a TUBE (`tube-07`, taper 1); the bank's smallest ear
 *     (`box-05`, 0.232) against its tallest (`box-06`, 0.913), a 3.9x gap; and
 *     the parrot's broad flat fan against the beaver's tapering paddle.
 *   - **capybara** against Woodland's `animal-coypu`, `animal-guinea-pig` and the
 *     FROZEN `animal-beaver`. It is the only rodent in the project with NO TAIL,
 *     and its eyes and ears are set high and BACK — the ear at z = -0.05, behind
 *     the crown's midpoint, where every other species places one in front of it.
 *   - **coati** against Night Time's `animal-raccoon`. Both are ringed-tailed
 *     procyonids and both separations are placements: the only SPUN snout in the
 *     project (18 degrees up) against the raccoon's level `tube-06`, and the
 *     highest-rooted tail in the project against a brush trailed at the centre.
 *   - **snake** against `animal-corn-snake`, `animal-slow-worm` and Ocean's
 *     `animal-eel`. All four pay the legless height toll with the same `box-04`
 *     coil — that is the kit's ANSWER to leglessness, not a decoration any of
 *     them chose — and the other three all carry a RIDGE. This is the only
 *     smooth-backed snake in the project; its markings are twelve flat cards.
 *   - **tree frog** against Garden's `animal-frog` and `animal-toad`. All three
 *     lack ears, tail, snout and nose, so the separation is the eye (`plate-14`
 *     painted red), JT-044's two-tone leg as toe discs, four flank bars, and the
 *     absence of the frog's eardrum cards.
 *   - **iguana** and **chameleon** against Africa's `animal-crocodile` and Home
 *     Pets' `animal-gecko`. The iguana shares `wedge-06` with the crocodile
 *     because it is the tallest keeled plate the bank can stand on a back and
 *     there is no second candidate; the separation is the COUNT and SPAN (six at
 *     3/16 against five at 1/2) plus the dewlap. The chameleon takes none of it —
 *     a casque, two flank turrets and a coil.
 *   - **tapir** against the FROZEN `animal-pig` and `animal-hog` and Africa's
 *     `animal-warthog`. The trunk is `box-18` at half the crocodile's reach and
 *     the white saddle is `box-35`, the panda's own rump shell, which no other
 *     species wears as a marking.
 *   - **sloth** against everything, and it needs nothing: it is the only animal
 *     in the project wearing `blade-05`, the lion's 1.000-square face mask, and
 *     the only one on `box-31` with no ears and no tail.
 *
 * ===========================================================================
 * ## WHAT IS STANDING IN FOR A SHAPE THE BANK HAS NOT GOT
 * ===========================================================================
 *
 * Joe, 5 August: *"put something in for the unbuildable ones anyway so i can do
 * it manually."* All sixteen have an entry. **ONE is a placeholder** and says so
 * in the first line of its own header and in its `flag`, which is what he reads
 * in the workbench:
 *
 *   - **tarantula** — and it is held up by three separate things, only one of
 *     which is a shape. (1) **A SEGMENTED LEG.** The bank holds exactly ONE leg,
 *     `box-01`, a straight tapered frustum used 86 times across 23 of the 24; a
 *     spider's bends twice and reaches past its own body. `docs/how-the-animals-
 *     are-made.md` §14 names this gap for Critters and it is still true.
 *     (2) **A TWO-PART BODY, WHICH RULE 3 FORBIDS OUTRIGHT** — a spider is a
 *     cephalothorax and an abdomen at a waist, and one mass is the rule whose
 *     violation scrapped 72 animals. The abdomen is a `box-35` BAND instead.
 *     (3) **EIGHT EYES**, against rule 6's mirrored pair and rule 5's single
 *     absolute plane. Only the first is a commission.
 *
 * **Three more absences are recorded at the species rather than here, because
 * they are mechanism and not shape:** the **arms** of the gibbon and the howler
 * monkey (the leg row is four copies of one shape at one height, so a front pair
 * cannot be longer — `animal-gorilla.ts` recorded it first); the **claws** of the
 * sloth and the anteater (the `claw` role has never been baked, and the crab's
 * own pincer is sitting in a GLB in this repo — one line in the generator, and
 * that line is Joe's because baking a role RENUMBERS THE WHOLE BANK); and the
 * chameleon's **eyes**, which are on the sides of a real animal's head and are
 * pinned to the front by rule 5.
 *
 * **AND ONE ABSENCE THIS COLLECTION HITS FIVE TIMES, WHICH IS MORE THAN ANY
 * OTHER: A PATTERN.** Colour is a texture LOOKUP with no positional information
 * at all — `Paint.patch` takes ONE number and that number is a HEIGHT, and
 * `byBand` can only recolour where Kenney already cut. So the jaguar's rosettes,
 * the ocelot's chains, the lemur's thirteen tail rings, the coati's eight and the
 * snake's joined net are all flat cards or one band, and every one of those five
 * files says so in its own flag. It is the same wall `animal-gecko.ts` hit for
 * the leopard gecko's spots and `animal-zebra.ts` for its stripes; this is simply
 * the collection where it costs the most.
 *
 * ## WHY THERE ARE NO `threat` RECORDS
 *
 * Roster §5 wants statuses "true, checkable", and `Threat.checkedDate` exists so
 * a status is a dated reading of the Red List rather than a memory. Several of
 * these sixteen genuinely are listed — which is exactly why writing categories
 * here from recall would produce records that only LOOK checked. Absent means
 * "not recorded yet", which is the honest state.
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
 * ALL SIXTEEN. Fifteen are real animals and ONE is a placeholder — the
 * tarantula — put in so Joe can finish it by hand, saying so in the first line
 * of its own file header and in its `flag`. A placeholder is not promoted into
 * the built count to make the number look better; the survey above prices it.
 *
 * IN ROSTER ORDER, which is the order `roster.ts:214-224` lists them and the
 * order the album shows them. A collection whose file order disagrees with its
 * roster order is a trap `species-garden.test.ts:149` already exists to catch,
 * so a member arriving later is INSERTED at its rostered place, never appended.
 */
export const JUNGLE_SPECIES: readonly Species[] = [

  /* The only animal in the project wearing the lion's 1.000-square face mask,
   * and the only hull it fits on. No ears, no tail. */
  defineSpecies('animal-sloth', 'bespoke'),

  /* The heaviest cat: the widest shell in the bank, which no other cat wears,
   * and the thickest tail in it. */
  defineSpecies('animal-jaguar', 'bespoke'),

  /* The pack's biggest eye card painted red, and JT-044's two-tone leg spent on
   * toe discs rather than hooves. */
  defineSpecies('animal-tree-frog', 'bespoke'),

  /* A casque out of the koala's ear, two turrets on the flanks of the head, and
   * a coil where the bank has no curve. Flagged. */
  defineSpecies('animal-chameleon', 'bespoke'),

  /* The only primate on the tallest shell in the bank, and the second ape in the
   * project with no tail. */
  defineSpecies('animal-gibbon', 'bespoke'),

  /* The elephant's trunk at half the crocodile's reach, and the panda's rump
   * shell worn as a white saddle. */
  defineSpecies('animal-tapir', 'bespoke'),

  /* The fourth legless animal, and the only smooth-backed one: twelve flat
   * blotches where the other three all carry a ridge. */
  defineSpecies('animal-snake', 'bespoke'),

  /* PLACEHOLDER — no segmented leg in the bank, and a spider's two-part body is
   * rule 3's exact fault. Eight legs, one mass, two eyes. */
  defineSpecies('animal-tarantula', 'bespoke'),

  /* The parrot's beak cut to a 0.140 needle, and a ruby gorget that is one
   * `byBand` entry on the penguin's own cut. */
  defineSpecies('animal-hummingbird', 'bespoke'),

  /* The one animal in the project that `box-36`'s band cut was drawn for, with
   * the lion's rope carried vertically. */
  defineSpecies('animal-lemur', 'bespoke'),

  /* A cone where the aardvark has a tube, the bank's smallest ear against its
   * tallest, and the broadest flat tail in it. */
  defineSpecies('animal-anteater', 'bespoke'),

  /* The only rodent in the project with no tail at all, and the only species
   * anywhere with its ears set BEHIND the crown's midpoint. */
  defineSpecies('animal-capybara', 'bespoke'),

  /* Deliberately on the same cube as the cheetah, the lynx and the wildcat: it
   * separates on count, ear and eye, never on silhouette. */
  defineSpecies('animal-ocelot', 'bespoke'),

  /* The frozen monkey's own shell, with the only thing in the project worn under
   * a chin and a prehensile tail carried up. */
  defineSpecies('animal-howler-monkey', 'bespoke'),

  /* Six scutes against the crocodile's five, and the first card in the project
   * hung downward as a dewlap. */
  defineSpecies('animal-iguana', 'bespoke'),

  /* The only spun snout in the project and the highest-rooted tail in it — both
   * placements, both against `animal-raccoon`. */
  defineSpecies('animal-coati', 'bespoke'),
]
