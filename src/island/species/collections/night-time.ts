/**
 * Night Time — roster row 6, ship 8, name band `medium`.
 *
 * PB-036. `roster.ts` says which sixteen species this collection holds; this
 * file says what THIRTEEN of them are. The other three are not here and that is
 * a measurement, not an oversight — see NOT BUILT below.
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
 * ## NOT BUILT — three species, each with the exact shape it needed
 *
 * The `wing`, `horn` and `claw` roles are declared in `bank.generated.ts`'s
 * `PartRole` union and occur **zero times** across all 94 records. Measured, not
 * assumed, and `tests/island/species-night-time.test.ts` measures it again on
 * every run, so the day somebody banks one of those shapes the test says the
 * absence has changed.
 *
 *   - `animal-bat` — wants a **membranous wing**. Everything else about a bat is
 *     in the bank: `box-06`/`box-07`, the bunny's 0.913-tall upright ears, are
 *     the biggest in the pack and are exactly a bat's. But a bat's wings are the
 *     animal, and the pack has no membrane, no spread wing and no folded one.
 *     Without them this is a mouse with big ears, which the collection already
 *     has three of.
 *   - `animal-sugar-glider` — wants a **patagium**, the gliding membrane between
 *     wrist and ankle. Same absence, and here it bites twice: without the
 *     membrane a sugar glider is indistinguishable from `animal-opossum`, which
 *     is in this same collection. Two records for one silhouette is worse than
 *     one honest gap.
 *   - `animal-scorpion` — wants a **pincer** and a segmented tail. The `claw`
 *     role is empty and the pack's one true claw, the crab's, was never banked;
 *     there is no segmented limb either. A sting could be found among the tusks,
 *     but a scorpion without pincers is not a scorpion, and brief §19's "bright,
 *     never scary" is a second reason not to improvise one.
 *
 * **None of the three is to be filled in by improvising a shape.** That is the
 * exact failure roster §1's "kits before species" exists to stop, and it is the
 * same ruling `africa.ts` carries for the ostrich and the vulture. How these
 * three should read is a LOOK decision and it belongs to Joe.
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
 * ## EVERY PALETTE IN THIS COLLECTION IS UNREVIEWED, FLAG OR NO FLAG
 *
 * Said here once rather than thirteen times, because `flag` is not the right
 * channel for it and using it that way would break the channel. §9.3 is explicit
 * that a `flag` says which RULE a build strained, and that "an animal with a flag
 * is one he is being asked to rule on" — so if all thirteen carried one for a
 * reason all thirteen share, the field would stop telling Joe which animals are
 * the difficult ones.
 *
 * The fact still needs stating, because it is easy to read the other way round:
 * **no species in this collection has ever had a record anywhere to carry a
 * colour**, so every palette in `parts/assembled/animal-<id>.ts` is a first
 * proposal and every colour in every one of them is marked `UNREVIEWED:` at the
 * line. An unflagged member here has unreviewed colours exactly as much as a
 * flagged one does. Six of the thirteen also carry a flag, and those six strained
 * a rule as well.
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
   * ROSTER order for `night-time`, with the three unbuilt members simply
   * absent — `bat` would be first, `sugar-glider` sixth and `scorpion` tenth,
   * and the header says what each of them needed.
   *
   * Every record is one line and carries no geometry, because `defineSpecies`
   * picks each species' assembly up by id off `parts/assembled/register.ts`.
   * That is what makes adding a species a change to this file of exactly one
   * line, and what keeps this file reviewable prose rather than a table of
   * numbers. The numbers, and the measurement behind every one of them, live in
   * `parts/assembled/animal-<id>.ts`.
   */
  defineSpecies('animal-raccoon', 'bespoke'),
  defineSpecies('animal-wolf', 'bespoke'),
  defineSpecies('animal-firefly', 'bespoke'),
  defineSpecies('animal-opossum', 'bespoke'),
  defineSpecies('animal-nightjar', 'bespoke'),
  defineSpecies('animal-tarsier', 'bespoke'),
  defineSpecies('animal-bushbaby', 'bespoke'),
  defineSpecies('animal-fennec-fox', 'bespoke'),
  defineSpecies('animal-civet', 'bespoke'),
  defineSpecies('animal-aye-aye', 'bespoke'),
  defineSpecies('animal-kiwi', 'bespoke'),
  defineSpecies('animal-kinkajou', 'bespoke'),
  defineSpecies('animal-glow-worm', 'bespoke'),
]
