/**
 * Night Time — roster row 6, ship 8, name band `medium`.
 *
 * PB-036. `roster.ts` says which sixteen species this collection holds; this
 * file says what all SIXTEEN of them are. It said thirteen until 6 August 2026 —
 * see THE THREE THAT WERE MISSING below, which is the one section of this header
 * that has been rewritten and the only thing about the original thirteen that
 * changed.
 *
 * ## THIS COLLECTION IS ENTIRELY ASSEMBLED, AND THAT IS THE POINT
 *
 * Every record below is `defineSpecies(id, 'bespoke')` and carries no `build`
 * object at all. Not one member goes through a kit. That is Joe's ruling of
 * 2 August 2026, in his own words:
 *
 * > only the garden animals have been built to spec. the ones i can see in
 * > outline in the album for africa and home pets are the old blocky ones that
 * > can be deleted to be honest. do not build any more of them. all the rest
 * > must be built in the same way as the garden animals. which should be pretty
 * > much deterministic and quick.
 *
 * So Night Time is the first collection built end to end on the parts-bank
 * assembly route, against the Garden fourteen as the only exemplars. Every
 * number in every member lives in `parts/assembled/animal-<id>.ts` with the
 * measurement that produced it beside it, and this file carries no geometry.
 *
 * ## THE THREE THAT WERE MISSING — built 6 August 2026, and here is what changed
 *
 * This section used to say that the bat, the sugar glider and the scorpion were
 * held out because the `wing`, `horn` and `claw` roles occurred **zero times**
 * across the baked records, and that *"none of the three is to be filled in by
 * improvising a shape."* Two things overturned that, and neither was a decision
 * this file was entitled to make on its own.
 *
 * **1. The bank moved.** `wing` was baked on 4 August for the budgie and is six
 * shapes where it was zero: `blade-06`/`blade-07` carry `bee:wing-left` as their
 * FIRST provenance and are bit-identical to the penguin's flipper, and
 * `wedge-19`/`wedge-20` are the pack's real spread wing. §14 of
 * `docs/how-the-animals-are-made.md` has now been wrong four times in exactly
 * this way, and its own lesson is the one that applies here: **a claim about what
 * the bank does not hold expires the moment a role is baked.** `claw` is still
 * unbaked, and that half of the old sentence is still true.
 *
 * **2. Joe ruled, on 5 August**: *"put something in for the unbuildable ones
 * anyway so i can do it manually. if there is no entry at all, i cant do that."*
 * That is the whole reason the scorpion is here despite the claw still being
 * absent. Ocean, Critters, Birds, Jungle and Raptors each shipped one to four
 * entries on it.
 *
 *   - `animal-bat` — built, and **the wing is a declared stand-in**. `blade-06`
 *     re-axised to run along its 0.693, stretched 1.5, is one membrane on one
 *     spar, which is `animal-pterodactyl.ts`'s reading of the same shape. A bat's
 *     wing is a HAND and nothing in the bank has fingers; the file says so in its
 *     first line, names the measurement and names what to try instead.
 *   - `animal-sugar-glider` — built, and **not on a wing at all**. The patagium is
 *     `blade-05`, the lion's flat muzzle plate, 1.000 x 1.000 x 0.125 for 18
 *     triangles, laid horizontal and joined to the flank. That shape was
 *     invisible to three censuses because it is filed under the `nose` role; it
 *     is the same slab Dinosaurs found as a frill, a plate row and a sail. The
 *     old objection — that without a membrane this animal is `animal-opossum` —
 *     is answered by the membrane and by four other measured separations.
 *   - `animal-scorpion` — built as a **PLACEHOLDER**, and the old sentence about
 *     it is preserved rather than overturned: the `claw` role is still empty,
 *     the crab's own pincer is still only in a `.glb`, and two opposed
 *     `wedge-11` tusks with 0.0345 of daylight between them are an improvisation
 *     and are labelled one. What ships it anyway is the TAIL, which is not an
 *     improvisation at all — three tusks chained `on` one another's built tips
 *     arch the metasoma up and forward, and a scorpion is recognisable from that
 *     alone. Baking `claw` is PB-096 and is Joe's, not a builder's: adding a role
 *     renumbers the bank silently.
 *
 * How all three READ is still a look decision and still belongs to Joe. What
 * changed is that he now has three entries to edit instead of three absences.
 *
 * ## Two birds and two insects that ARE here, and why that is not a contradiction
 *
 * The nightjar, the kiwi, the firefly and the glow-worm are all animals whose
 * relatives elsewhere in the roster are blocked on the same missing wing. They
 * are here because the pack's own answer to "what is a bird" is a fused hull, a
 * beak, two legs and eye cards — parrot, chick and penguin donated no wing
 * between them — and its answer to "what is an insect" is a hull, a torso band,
 * antennae, four legs and a face card. Both of those are sayable.
 *
 * The line this collection draws, and it is worth stating because it decided six
 * species: **if the missing part IS the animal, the species is blocked; if the
 * animal is recognisable without it, the species is built and the absence is
 * flagged.** A bat's wings are the animal. A kiwi is famously wingless, a
 * nightjar is only ever seen perched with its wings folded flat, a firefly
 * signals at rest with its elytra closed, and a glow-worm is a larva.
 *
 * >>> THAT TEST STILL DECIDES, AND ITS SECOND CLAUSE IS WHAT THE THREE ABOVE ARE
 * >>> BUILT ON. Joe's 5 August ruling replaced "blocked" with "entered and
 * >>> labelled", so the test now sorts a member into BUILT or PLACEHOLDER rather
 * >>> than into present or absent — and the sorting is unchanged. A bat's wings
 * >>> are still the animal, which is why `animal-bat.ts` opens by saying its wing
 * >>> is a stand-in instead of quietly wearing one. A scorpion's pincers are
 * >>> still the animal, which is why it is the one PLACEHOLDER here. The sugar
 * >>> glider is the case that turned out not to be a gap at all.
 *
 * ## EVERY PALETTE IN THIS COLLECTION IS UNREVIEWED, FLAG OR NO FLAG
 *
 * Said here once rather than sixteen times, because `flag` is not the right
 * channel for it and using it that way would break the channel. §9.3 is explicit
 * that a `flag` says which RULE a build strained, and that "an animal with a flag
 * is one he is being asked to rule on" — so if all sixteen carried one for a
 * reason all sixteen share, the field would stop telling Joe which animals are
 * the difficult ones.
 *
 * The fact still needs stating, because it is easy to read the other way round:
 * **no species in this collection has ever had a record anywhere to carry a
 * colour**, so every palette in `parts/assembled/animal-<id>.ts` is a first
 * proposal and every colour in every one of them is marked `UNREVIEWED:` at the
 * line. An unflagged member here has unreviewed colours exactly as much as a
 * flagged one does. Nine of the sixteen also carry a flag — the original six, and
 * all three of the arrivals above — and those nine strained a rule as well.
 *
 * ## NO `threat` IS RECORDED
 *
 * Several of these are genuinely threatened — the aye-aye most of all — but
 * `Threat.checkedDate` exists so a status is a dated reading of the Red List
 * rather than a memory. `registry.ts` makes that argument in full. Writing
 * categories here from recall would produce records that LOOK checked. Absent is
 * the honest state.
 */
import { defineSpecies } from '../define'
/*
 * Evaluated for its SIDE EFFECT, not for a name: each species module under
 * `parts/assembled/` registers its own build as it defines it, and
 * `defineSpecies` picks that up by id. Without this line every member below
 * would find no assembly and would build as a bare hull.
 * `tests/island/assembly-constants.test.ts` fails loudly if it is ever dropped.
 */
import '../parts/assembled'
import type { Species } from '../types'

export const NIGHT_TIME_SPECIES: readonly Species[] = [
  /*
   * ROSTER order for `night-time`, all sixteen. The three that arrived on
   * 6 August are INSERTED at their rostered places — `bat` first,
   * `sugar-glider` sixth, `scorpion` tenth — never appended, because a
   * collection whose file order disagrees with its roster order is a trap
   * `species-garden.test.ts:149` already exists to catch.
   *
   * Every record is one line and carries no geometry, because `defineSpecies`
   * picks each species' assembly up by id off `parts/assembled/register.ts`.
   * That is what makes adding a species a change to this file of exactly one
   * line, and what keeps this file reviewable prose rather than a table of
   * numbers. The numbers, and the measurement behind every one of them, live in
   * `parts/assembled/animal-<id>.ts`.
   */
  /* The wing is a declared STAND-IN: `blade-06` re-axised along its 0.693 is one
   * membrane on one spar, where a bat's wing is a hand with fingers in it. */
  defineSpecies('animal-bat', 'bespoke'),

  defineSpecies('animal-raccoon', 'bespoke'),
  defineSpecies('animal-wolf', 'bespoke'),
  defineSpecies('animal-firefly', 'bespoke'),
  defineSpecies('animal-opossum', 'bespoke'),

  /* The patagium is `blade-05`, the lion's flat muzzle plate laid horizontal —
   * not a wing at all, and the one shape in the bank that IS a flat sheet. */
  defineSpecies('animal-sugar-glider', 'bespoke'),

  defineSpecies('animal-nightjar', 'bespoke'),
  defineSpecies('animal-tarsier', 'bespoke'),
  defineSpecies('animal-bushbaby', 'bespoke'),

  /* PLACEHOLDER — the `claw` role is still unbaked, so the pincers are two
   * opposed elephant tusks. The arched metasoma is what ships it anyway. */
  defineSpecies('animal-scorpion', 'bespoke'),

  defineSpecies('animal-fennec-fox', 'bespoke'),
  defineSpecies('animal-civet', 'bespoke'),
  defineSpecies('animal-aye-aye', 'bespoke'),
  defineSpecies('animal-kiwi', 'bespoke'),
  defineSpecies('animal-kinkajou', 'bespoke'),
  defineSpecies('animal-glow-worm', 'bespoke'),
]
