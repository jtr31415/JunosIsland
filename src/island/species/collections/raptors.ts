/**
 * The Raptors collection — roster row 13, `ship: 13`, name band `medium`.
 *
 * NEW FILE, 5 August 2026. There has never been a `collections/raptors.ts`.
 *
 * ===========================================================================
 * ## §14 SAID THIS COLLECTION WAS IMPOSSIBLE. IT MADE THREE CLAIMS AND ALL
 * ## THREE WERE MEASURED. ONE IS FLATLY FALSE, ONE IS FALSE IN OCEAN'S EXACT
 * ## WAY, AND ONE IS TRUE OF A CURVE RATHER THAN OF A HOOK.
 * ===========================================================================
 *
 * `docs/how-the-animals-are-made.md` §14 has said since 29 July:
 *
 * > **Raptors (16)** — no hooked beak, no talon, no spread wing.
 *
 * That paragraph has already been wrong once. It said the same of Ocean for
 * want of a fin while `box-42`/`box-43` — provenance `fish:wing`, the pack's own
 * fish's fins — were sitting in the bank under the word `wing`, and nobody
 * carried the correction back for a week because the line had already ruled the
 * collection out. §14 now ends: *"A claim about what the bank does not hold
 * expires the moment a role is baked; date it, or it outlives its own truth."*
 *
 * So the bank was measured before anything was built. **100 shapes, and the
 * baked roles are: band, card, ear, eye, hull, leg, nose, oddment, tail, tooth,
 * wing.** Not censused from §7's table — counted off `PARTS_BANK` today.
 *
 * **CLAIM 3, "NO SPREAD WING" — FLATLY FALSE, AND IT WAS FALSE BEFORE THIS
 * COLLECTION STARTED.** The `wing` role holds six shapes across three families,
 * and `wedge-19`/`wedge-20` (the chick's and the parrot's) attach `x +1` at
 * `sunkFractionMean` 0.175, which is to say they are already placed ON A FLANK.
 * At pure donor transfer one stands **0.4727 clear of a 1.250 cube's side**, so
 * a bird wearing the pair measures **2.1960 across with a keep-out of 1.0980 —
 * under the fox's own 1.15**. `animal-vulture.ts` has shipped exactly that since
 * the night before this file was written. Nine of the sixteen below wear it.
 *
 * **CLAIM 2, "NO TALON" — FALSE IN OCEAN'S EXACT WAY, AND THIS IS THE ONE
 * COMMISSION IN THE COLLECTION.** §7 censuses **claw: 10 instances, 10 distinct
 * shapes, donors crab, lion, tiger and polar — BAKED: no**, and the role list
 * above confirms it: `claw` occurs zero times in the bank. **The pack drew ten
 * claws and every one of them is in a `.glb` in this repo.** So a talon is not a
 * missing shape; it is an unbaked one, which is the lobster's position in
 * `collections/ocean.ts` word for word. **Baking a role RENUMBERS THE BANK** —
 * adding `wing` on 2 August moved `box-31` from the lion's hull to its mane band
 * and turned the newt's crest into bee wings, and nothing failed to compile — so
 * `claw` is Joe's line and not a builder's. Written down, left alone. Meanwhile
 * every bird here wears a stand-in from the `tooth` role, and the stand-in is
 * §3.1 doing what §3.1 is for (below).
 *
 * **CLAIM 1, "NO HOOKED BEAK" — TRUE OF A CURVE, FALSE OF A HOOK.** The bank
 * holds no curve at all: all 100 shapes are straight or tapered along a single
 * axis, and rule 4 as amended bakes a ROTATION into a copy's vertices, which
 * turns a part and cannot bend one. Ocean priced that same wall for the
 * seahorse, Birds for the flamingo's bill, Ice for the Dall ram's horn. **But a
 * hook is not a curve, it is a TIP THAT TURNS DOWN, and two straight parts
 * meeting at an angle say that.** See below; it is the collection's own idiom.
 *
 * ===========================================================================
 * ## THE FIVE IDIOMS, MEASURED ONCE HERE AND SPENT SIXTEEN TIMES
 * ===========================================================================
 *
 * **1. THE HOOK IS TWO PARTS.** `cone-06`, the parrot's beak — the bank's
 * longest bill at 0.1833 of reach — points forward at the donor transfer. A
 * second shape is then joined with `on: 'snout'`, which anchors it to the bill's
 * OWN BUILT TIP (solved off its vertices, not off a number), and spun about x so
 * it points down and forward. Both stand-ins are `nose`-role shapes at sink
 * 0.000, so they overlap the bill rather than floating off it. Two sizes:
 *
 *       box-24 @ 55 deg   the hog's nose pad, 0.400 x 0.400 x 0.200, 44 tris.
 *                         Spans z 0.682-1.073 and y 0.822 down to 0.455 against
 *                         a bill whose tip is z 0.808 and whose base is y 0.517:
 *                         it continues 0.265 past the bill and drops below it.
 *                         Full 0.400 wide on a 0.400 bill, so it reads as one
 *                         mass. THE EAGLES' BILL. Seven birds.
 *       blade-02 @ 70     the bunny's nose-tip, 0.4017 x 0.270 x 0.050, 28 tris.
 *                         A 0.132-tall lip hanging steeply at z 0.681-0.935.
 *                         THE FALCONS' AND OWLS' BILL. Nine birds.
 *
 * `animal-vulture.ts` (Africa, built the night before) solved this with ONE part
 * and a painted band — `cone-06`'s band 15 stands 0.041900 proud of its band 13,
 * and it painted the overhang dark. That is a real measurement and a weaker
 * answer, and its own header calls the bird a placeholder for it. **The two-part
 * hook is what that file was asking for and it can take it in one line.**
 *
 * **2. THE TALON IS A `tooth` AT THE FOOT.** `wedge-13` (the hog's tusk, taper
 * 0.59) or `wedge-11` (the elephant's, taper 0.39) placed as a `pair` at
 * `[legX, halfItsOwnHeight, 0.1875]` with `axis: 'z', dir: 1` — joined at
 * `box-01`'s own front face and standing on the ground the leg row already
 * defines, so nothing refloors. `wedge-13` reaches z 0.438 against a foot that
 * ends at 0.188. **The hog's tusk is already the hedgehog's spike; this is its
 * third job**, and §3.1 is explicit that a part's identity is its placement.
 * It is still a stand-in and the commission above is what would retire it.
 *
 * **3. THE BELLY PATCH UPSIDE DOWN IS A HEAD.** `Paint.patch` paints everything
 * BELOW a fraction of the hull's height from the pale slot. Every animal in the
 * project uses it the obvious way round. Put the WHITE in `coat` and the brown
 * in `belly` and the pale slot becomes the BODY and the coat becomes the CROWN.
 * `animal-bald-eagle.ts` gets a white head out of 13/16 and `animal-kestrel.ts`
 * a blue-grey cap out of 12/16, with no card and no geometry. Both
 * `animal-owlet.ts` and `animal-vulture.ts` record that a pale head cannot be
 * painted "because the patch has no z term" — which is true, and a cap does not
 * need one. What is still unsayable is a patch that is not a horizontal band: a
 * bare face, a nape, a hobby's red thighs.
 *
 * **4. A FLANK CARD SPUN FORWARD IS A FACE MARK — AND THE FACIAL DISC EXISTS.**
 * `plate-10` (0.244 x 0.253) and `plate-11` (0.400 x 0.433) attach `x +1`; spun
 * `{y, -90}` they turn forward, and placed at z = 0.630 they sit 0.005 in front
 * of a cube's face and 0.005 behind the eye cards, which stay at the pack's
 * absolute `EYE_CARD_Z` = 0.6350. Four birds spend it and they are four
 * different animals: a white brow (goshawk, y 1.090), an eye-stripe (osprey,
 * 0.900), a moustache (`plate-13` at 0.640, peregrine and hobby) and **a facial
 * disc** (barn owl and tawny owl, y 0.930, the two copies meeting on the midline
 * to give one pale panel 0.852 across the head). `animal-owlet.ts` says the disc
 * *"IS NOT and cannot be"*. It is a panel and not a heart, and it exists.
 * Spinning `{y, +90}` instead turns the card to the REAR: `animal-harrier.ts`'s
 * white rump is the first backward-facing marking in the project.
 *
 * **5. `sink` IS A WINGSPAN DIAL AND `kind: 'pair'` IS A FORKED TAIL.** The same
 * `wedge-19` at sink 0.175 / 0.35 / 0.55 gives 2.1960 / 1.9949 / 1.7657 across,
 * with nothing stretched — the join simply buries more of the part. And a tail
 * has always had `kind`; nothing had ever asked for two. `animal-red-kite.ts`
 * spins `wedge-18` `{x,90}` to lay its 1.0466 long axis along z and `{y,-14}` to
 * splay it, then mirrors: the tips finish 0.650 apart. It is the first forked
 * tail in the project and it costs 424 of that bird's 900 triangles.
 *
 * ===========================================================================
 * ## SIXTEEN BIRDS, ONE SILHOUETTE — HOW THEY ARE HELD APART, MEASURED
 * ===========================================================================
 *
 * Roster §4 is the binding constraint here more than in any collection since
 * Ice. These are sixteen brown birds with hooked bills, and the levers are:
 *
 *       HULL       box-31 1.7578 vol (sparrowhawk, merlin) < box-03/20/33/36/39
 *                  1.9531 < box-21 2.3517, TALLEST at 1.5051 (both eagles, eagle
 *                  owl) < box-12 2.4054, WIDEST at 1.5395 (harpy, goshawk).
 *                  box-41 is bigger and UNUSABLE: its front face is z 0.725,
 *                  0.090 in front of EYE_CARD_Z, so the eye buries. Ocean's whale
 *                  found that trap; it is the same one here.
 *       WINGSPAN   1.2875 (blade-06 over the back) < 1.8835 (box-43, the fish
 *                  fin) < 1.9949 (wedge-19 sunk 0.35) < 2.1960 (wedge-19 at the
 *                  donor's own) < 2.2270 (on box-12).
 *       HEIGHT     1.4312 (eight birds) / 1.5486-1.5560 (five) / 1.6863 (the two
 *                  eagles) / 1.9617 (eagle owl) / 1.9742 (harpy).
 *       TAIL       box-18 stub < box-38 fan < wedge-18 laid flat < wedge-18 pair.
 *       EYE        plate-08 round 0.400 (eleven) vs plate-14, the pack's biggest
 *                  at 0.435 x 0.443 (harpy and the three owls) — and the COLOUR,
 *                  which is real: hawks yellow, goshawk orange, falcons and
 *                  tawny owl near-black, eagle owl orange, barn owl black.
 *
 * **THE FOUR GUILDS ARE THE WING, and that is the collection's spine.** The four
 * falcons lay `blade-06` — the bee's and the penguin's, attaching `y +1` — over
 * the BACK by pure donor transfer, so they measure 1.2875 across where every
 * other member is 1.8835 to 2.2270. A perched falcon really does cross its long
 * wings over its tail. The exception is `animal-hobby.ts`, which takes the long
 * flank wing because a hobby looks like a giant swift, and that exception is what
 * stops four small grey falcons being one animal in four palettes.
 *
 * **WHERE SEPARATION IS THIN, AND IT IS THIN IN THREE PLACES.** Sparrowhawk and
 * goshawk are one hawk at a fifth of the mass in life, and the hull is never
 * scaled, so the entire size vocabulary is the ten real shells — **a 1.37x volume
 * range against a life ratio near five**. Merlin and peregrine are the same
 * problem again. Eagle owl and Birds' `animal-owlet` are both `plate-14` with
 * `cone-01` tufts, held apart by 0.530 of height and by orange against amber.
 * Every one of those is written at the species, with the number.
 *
 * ===========================================================================
 * ## WHAT IS STILL MISSING — priced, and one of them is a placeholder
 * ===========================================================================
 *
 * **A CURVE.** Fifth collection to name it after Ocean's seahorse, Birds'
 * flamingo, Outback's and Ice's Dall ram. It costs the hook its curve, the barn
 * owl its heart-shaped disc, and nothing else here.
 *
 * **THE `claw` ROLE, UNBAKED.** One line in `tools/pets/parts-bank.ts`, ten real
 * shapes waiting, sixteen birds wearing a tusk instead. Joe's line, because
 * baking renumbers the bank. **This is the collection's commission.**
 *
 * **SIZE, WHICH IS A RULING RATHER THAN A COMMISSION.** `HullDef.stretch` is
 * `never` by Joe's own instruction given twice, so a bird cannot be made smaller
 * or larger than a real shell. Three of the sixteen are weakened by it and
 * `animal-harpy-eagle.ts` is stopped by it.
 *
 * **A SPLIT CREST.** Only `animal-harpy-eagle` wants one, and it is the
 * collection's **one placeholder**: two `cone-01` on the crown are
 * `animal-owlet.ts`'s ear tufts and read as an owl, one `box-38` upright is
 * `animal-turkey.ts`'s fan and reads as a turkey, and a SECOND `box-38` is
 * geometrically impossible — `collections/birds.ts` measured the part at
 * 0.625879 across the hull's 0.625000 flat plate. It ships with the single fan
 * and says so in its own first line.
 *
 * **A HINGE, WHICH WORKS AND IS NOT SPENT.** `PartDef.on` will anchor a second
 * `wedge-19` to the first one's built tip and spin it, giving a kinked wing —
 * `animal-osprey.ts` wants exactly that. Measured, it builds and it puts the bird
 * at **3.0956 across, keep-out 1.5478 against the fox's 1.15**, and `pets.ts:652`
 * charges keep-out for walking between trees. Recorded and deliberately unspent.
 * `collections/critters.ts` names a HINGED LIMB that three built species want;
 * this is that mechanism, and the answer is that it exists and costs width.
 *
 * ## WHY THERE ARE NO `threat` RECORDS
 *
 * Roster §5 wants statuses "true, checkable", and `Threat.checkedDate` exists so
 * a status is a dated reading of the Red List rather than a memory. Writing
 * categories here from recall would produce records that LOOK checked. Absent
 * means "not recorded yet", which is honest — and it matters in this collection,
 * because several of these birds have real and interesting listings.
 *
 * ## AND A NOTE ON THE FACTS
 *
 * Brief §19 forbids predation, killing and frightening framing, and sixteen of
 * these animals eat other animals for a living. Every fact drafted for
 * `joe/species-facts.json` is therefore about flight, eyesight, hearing, nesting
 * or size — never about hunting — which is a real constraint on what a raptor's
 * fact can say and is the reason none of them mentions food.
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
 * ALL SIXTEEN. FIFTEEN ARE REAL ANIMALS; ONE IS A PLACEHOLDER.
 *
 * The placeholder is `animal-harpy-eagle`, and it is a placeholder for a SPLIT
 * CREST and for SIZE — the survey above prices both. It is not promoted into the
 * built count to make the number look better, and it says what is wrong with it
 * in the first line of its own file header and in its `flag`.
 *
 * IN ROSTER ORDER, which is the order `roster.ts:242-248` lists them and the
 * order the album shows them. A member arriving later is INSERTED at its
 * rostered place, never appended.
 *
 * Every record below is one line. The reasoning for a species' SHAPE lives in
 * its own `parts/assembled/animal-<id>.ts`, beside the number it justifies. What
 * belongs here is what is true of the COLLECTION — the survey above — and one
 * line per species saying which lever holds it apart from its neighbours.
 */
export const RAPTORS_SPECIES: readonly Species[] = [

  /* The exemplar the other fifteen are cut from: the two-part hook, the tusk
   * talon and the spread wing were all measured on this bird. */
  defineSpecies('animal-golden-eagle', 'bespoke'),

  /* The golden eagle in another palette, on purpose — and the bird that found
   * the belly patch upside down, which is a white head for nothing. */
  defineSpecies('animal-bald-eagle', 'bespoke'),

  /* PLACEHOLDER — a SPLIT crest and a shell the bank has not got. Both ways of
   * saying crest here read as another animal; the survey prices them. */
  defineSpecies('animal-harpy-eagle', 'bespoke'),

  /* The only bird in the project a child can name from behind: the first forked
   * tail, and 424 of its 900 triangles are the fork. */
  defineSpecies('animal-red-kite', 'bespoke'),

  /* Deliberately the plain one — no card, no crest, no fork, no tuft — and the
   * bird that spends `sink` as a wingspan dial. */
  defineSpecies('animal-buzzard', 'bespoke'),

  /* The smallest shell in the bank and the pack's own fish fin as a short round
   * wing. Half of a pair the pack can only spend 1.37x on. */
  defineSpecies('animal-sparrowhawk', 'bespoke'),

  /* The other half, on the widest shell, with the white brow doing the work
   * that size cannot. */
  defineSpecies('animal-goshawk', 'bespoke'),

  /* The falcon idiom settled: blade-06 laid over the back at 1.2875 across, and
   * the moustache that is the one thing a child could pick it out by. */
  defineSpecies('animal-peregrine-falcon', 'bespoke'),

  /* The second inverted belly — a grey cap over a chestnut back — and the one
   * bird here whose famous behaviour the game has no word for. */
  defineSpecies('animal-kestrel', 'bespoke'),

  /* As small as this pack goes: keep-out 0.9302, out of three part choices and
   * no scaling at all. Still 0.86 of a peregrine. */
  defineSpecies('animal-merlin', 'bespoke'),

  /* The falcon that is NOT on the falcon wing — long wings, short tail, and the
   * exception that stops the other three being one bird. */
  defineSpecies('animal-hobby', 'bespoke'),

  /* White, with the eye-stripe that is the same card the goshawk wears 0.200
   * higher — and the bird the hinged wing was measured for and refused. */
  defineSpecies('animal-osprey', 'bespoke'),

  /* THE FACIAL DISC, which animal-owlet.ts says cannot be built: two flank cards
   * spun forward, meeting on the midline. A panel, not a heart. */
  defineSpecies('animal-barn-owl', 'bespoke'),

  /* The plainest owl in the game and the only untufted brown one — the disc in
   * a colour two steps off its own coat. */
  defineSpecies('animal-tawny-owl', 'bespoke'),

  /* The tallest owl the bank can build at 1.9617, which is the whole of what
   * holds it off Birds' owlet — that, and orange against amber. */
  defineSpecies('animal-eagle-owl', 'bespoke'),

  /* The first backward-facing marking card in the project, and the only member
   * carrying both a full wing and a full tail. */
  defineSpecies('animal-harrier', 'bespoke'),
]
