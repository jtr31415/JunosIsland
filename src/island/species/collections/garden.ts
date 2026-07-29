/**
 * The Garden collection — roster row 1, ship 1, name band `short`.
 *
 * PB-036 phase 2. `roster.ts` says WHICH species exist; `registry.ts` says what
 * has shipped; this file says what each Garden species IS, as `QuadrupedBuild`
 * data. Nothing here builds geometry and nothing here knows three.js — the kit
 * (`kits/quadruped.ts`) owns every millimetre, and every number below is a
 * MULTIPLIER off its one reference silhouette.
 *
 * This is the first collection a child ever sees after the base 24, so it is the
 * one where "must sit beside `animal-fox` without looking like a guest" (roster
 * §1) is not a slogan. Two measured facts drove nearly every number here:
 *
 *   1. THE PACK IS STOCKY. All 24 GLBs were walked and measured (see the REF
 *      note in `kits/quadruped.ts`): heights 1.43-2.02, mean 1.65, and mean
 *      width/height 0.97. A garden shrew at true anatomical proportions is a
 *      correct animal and a total stranger in that line-up. Every species below
 *      is built chunky on purpose; the W/H of each is asserted in
 *      `tests/island/species-garden.test.ts` rather than hoped for.
 *   2. LENGTH IS CHARGED FOR. `pets.ts:652` takes the obstacle keep-out from
 *      `max(width, depth) / 2`, so a long animal expressed by pushing `body`
 *      buys itself a keep-out circle it cannot walk between two trees with. The
 *      long low creatures here — mole, newt, shrew, salamander — are made long
 *      and low by DROPPING `legs` and `height`, with `body` nudged only as far
 *      as it honestly needs to go. Nothing here goes near the 1.55 ceiling.
 *
 * WHY THIS COLLECTION IS THIRTEEN AND NOT FOURTEEN. The roster lists
 * `animal-slow-worm` as a Garden member and it is deliberately absent. A slow
 * worm is a legless lizard; `legs` is structural in this kit (four boxes, always
 * built) and clamps at a 0.25 minimum, so the quadruped kit cannot express it
 * without lying about the animal. It needs the `bespoke` kit, which is declared
 * in `types.ts:159` and not built. `buildSpecies` throws by name for it today,
 * which is the loud failure that is wanted — a species missing from a collection
 * is an honest gap, and a lizard with four legs is not.
 *
 * NO THREAT STATUSES. Same reason `registry.ts:56-76` gives for the base 24:
 * `Threat.checkedDate` exists so a status is a dated reading of the Red List
 * rather than a memory, and a remembered category only LOOKS checked. Absent is
 * an honest state; guessed is not.
 *
 * DIFFERENTIATION IS THE JOB HERE, not a nicety. Roster §4 flags toad/frog by
 * name, and this collection quietly contains three more confusable groups the
 * roster does not list: newt/salamander, and the four small brown ground
 * creatures — mouse, shrew, dormouse, vole — which palette alone will never
 * separate at 0.16 scale. Each is separated below on ears, tail, an extra and
 * proportion, in that order of legibility, and the test asserts every pair in
 * the collection is separated rather than trusting these comments.
 */
import { defineSpecies } from '../define'
import { HEDGEHOG_ASSEMBLY, SQUIRREL_ASSEMBLY } from '../parts/assembled'
import type { Species } from '../types'

export const GARDEN_SPECIES: readonly Species[] = [
  /*
   * THE HEDGEHOG IS THE FIRST ANIMAL BUILT THE NEW WAY, and it carries BOTH
   * builds. `docs/building-animals-from-parts.md` §0 scrapped the 72 kit builds
   * and §6 says the scrapped build stays on the record beside the assembled one
   * "so ... nothing he can see today disappears" until Joe rules on JT-034. So
   * the `build` below is untouched — every number in it is as it shipped — and
   * `assembly` is added alongside. `parts/assembled.ts` holds the new one and
   * explains every measurement in it.
   *
   * The hedgehog. `spines` is what this animal IS — the kit's ridge of
   * 45-degree boxes down the back — and `snout` gives it the long face that
   * stops it reading as a spiky mouse. Legs at 0.40 because a hedgehog is a
   * ball that walks; the body stays under 1 so the spine ridge sits on
   * something round rather than something long.
   */
  defineSpecies('animal-hedgehog', 'quadruped', {
    build: {
      kit: 'quadruped',
      height: 1.52,
      body: 0.9,
      head: 0.9,
      legs: 0.4,
      ears: 'round',
      tail: 'stub',
      extras: ['spines', 'snout'],
      // Buff face, dark spines: the spine ridge is drawn in `accent`, so accent
      // has to be the darkest thing on the animal or the ridge disappears.
      palette: { coat: 0xb2946c, belly: 0xf4e6cc, detail: 0x6b533a, accent: 0x53412c },
    },
    assembly: HEDGEHOG_ASSEMBLY,
  }),

  /*
   * THE SQUIRREL IS THE SECOND ANIMAL BUILT THE NEW WAY, and it carries BOTH
   * builds for the same reason the hedgehog does — §6, until Joe rules on
   * JT-034. The `build` below is untouched, byte for byte as it shipped.
   *
   * It is second because it carries the half of the risk the hedgehog did not
   * (§6): a lifted TAIL, which is a separate node with its own transform, and a
   * two-tone coat whose boundary is PAINTED into the texture rather than cut
   * into geometry. `parts/assembled.ts` shows every measurement behind it. The
   * two comments below now describe two different animals — the kit one and the
   * assembled one — and they agree on the character: tufted ears, a bushy tail,
   * and the tallest thing in the collection (the assembly measures 1.976).
   *
   * The squirrel. The tallest thing in the collection and the only `tufted` ear
   * in it — red squirrel ear tufts are the whole read, and the kit draws the
   * tuft in `accent` precisely so it survives being 0.16 scale. Legs at 0.85 is
   * high for this collection on purpose: a squirrel sits UP, and the daylight
   * under it is what separates it from every ground creature here.
   */
  defineSpecies('animal-squirrel', 'quadruped', {
    build: {
      kit: 'quadruped',
      height: 1.72,
      body: 0.85,
      head: 1.05,
      legs: 0.85,
      ears: 'tufted',
      tail: 'bushy',
      palette: { coat: 0xc4692f, belly: 0xfbf1e2, detail: 0x9c4a1e, accent: 0x6e3413 },
    },
    assembly: SQUIRREL_ASSEMBLY,
  }),

  /* ---- the four small ground creatures ------------------------------------
   *
   * Mouse, shrew, dormouse and vole are four small brown animals and are the
   * hardest job in this collection. They are separated on the two things that
   * read at pet scale — EARS and TAIL — before palette is allowed to help:
   *
   *   mouse     round ears, thin tail, big head       the default small rodent
   *   shrew     NO ears,    thin tail, `snout`        pointed, tiny, earless
   *   dormouse  round ears, BUSHY tail                the furry-tailed one
   *   vole      NO ears,    STUB tail, blunt head     the chubby short-tailed one
   *
   * No two of the four share an ears/tail pair, so no two can collapse into
   * each other however a set recolours them.
   */

  /*
   * The mouse. The reference against which the other three are read: the
   * biggest head of the four (1.10 — a mouse is mostly eyes and ears), the
   * longest legs (0.50), and `whiskers`, which it gets and the vole does not
   * because a mouse's face is its whole character.
   */
  defineSpecies('animal-mouse', 'quadruped', {
    build: {
      kit: 'quadruped',
      height: 1.44,
      body: 1,
      head: 1.1,
      legs: 0.5,
      ears: 'round',
      tail: 'thin',
      extras: ['whiskers'],
      // `detail` paints the ears, so it is pink here rather than a darker coat:
      // pink ears on a grey-brown mouse is the marking a child will name.
      palette: { coat: 0xa08a76, belly: 0xf7ede0, detail: 0xe0a49c, accent: 0x54453a },
    },
  }),

  /*
   * The mole. Lowest thing in the collection — legs 0.30, and it is the lowest
   * by clearance, not merely by the number. `none` ears and a `stub` tail leave
   * the silhouette a smooth tube, which is exactly right and is why the `snout`
   * has to do all the front-end work.
   *
   * THE BODY IS 0.80, WHICH LOOKS BACKWARDS FOR A LONG ANIMAL AND IS NOT.
   * Measured: a mole at `body: 1.15, legs: 0.25` builds a keep-out radius of
   * 1.47, against the measured pack's worst of 1.17 (the fox, tail included) —
   * the SMALLEST animal in the garden asking every tree for more room than a
   * fox. The mechanism is the kit's height-fit (`quadruped.ts:588-597`): short
   * legs make the raw creature SHORT, the fit then scales it up to reach
   * `height`, and depth scales with it. Long-and-low is therefore charged twice
   * over, and the kit header's advice — drop `legs`, do not push `body` — has to
   * be taken further than it reads. A real mole is a stubby 14cm cylinder
   * anyway; the low, deep-chested read comes from the leg drop, and `body` under
   * 1 buys back the girth (the kit holds volume roughly constant,
   * `quadruped.ts:193-195`), which is what makes it a fat tube rather than a
   * flattened one.
   */
  defineSpecies('animal-mole', 'quadruped', {
    build: {
      kit: 'quadruped',
      height: 1.42,
      body: 0.8,
      head: 0.8,
      legs: 0.3,
      ears: 'none',
      tail: 'stub',
      extras: ['snout'],
      // Near-black velvet with pink extremities: `detail` is the paws (a mole's
      // spade hands) and `accent` is the nose and snout tip.
      palette: { coat: 0x3d3d47, belly: 0x6b6b78, detail: 0xd79a86, accent: 0xe8ac96 },
    },
  }),

  /*
   * The badger. The biggest animal in the collection and the only one that has
   * to feel heavy, so it takes the tallest `height` here and a body just under
   * 1 — deep-chested rather than long.
   *
   * IT CARRIES NO EXTRA, AND `snout` IS THE ONE IT WANTED. Measured: a badger
   * at this height with a snout builds a keep-out radius of 1.63 against the
   * pack's worst of 1.17, and no honest reshaping rescues it — the snout adds
   * about 0.59 of a head-width forward of the skull, and at 1.78 tall the
   * height-fit multiplies that straight into the obstacle circle. Dropping the
   * height to buy it back would make the badger smaller than the squirrel,
   * which is a worse lie than a short muzzle. So the face is carried by the
   * palette, which on a badger is the marking anyway: white head, black stripe.
   * The rule this collection ended up with is that `snout` belongs to the SMALL
   * species (hedgehog, mole, shrew) and a big low animal cannot afford one.
   */
  defineSpecies('animal-badger', 'quadruped', {
    build: {
      kit: 'quadruped',
      height: 1.78,
      body: 0.88,
      head: 0.95,
      legs: 0.45,
      ears: 'round',
      tail: 'stub',
      // Grey coat, white underside, black face and paws. The badger is the one
      // Garden species whose marking IS its colour scheme.
      palette: { coat: 0x9aa0a8, belly: 0xf8f6f0, detail: 0x2a2b30, accent: 0x1c1d21 },
    },
  }),

  /* ---- frog and toad ------------------------------------------------------
   *
   * Roster §4 names these two by name as species that "will read as duplicates
   * unless size, palette and marking are deliberately separated". They share
   * `none` ears and `none` tail — a frog with an ear or a tail would be a lie —
   * so ALL of the separation is carried by proportion and palette, and it is
   * carried hard rather than subtly:
   *
   *   frog  taller, slimmer, LONG-legged (1.15), big-mouthed, bright green
   *   toad  lower, squatter, SHORT-legged (0.40), smaller-headed, drab olive
   *
   * The leg multiplier alone is a factor of nearly three, which at pet scale is
   * the difference between an animal that is about to jump and one that is sat
   * in the mud. That is the read a child gets, so that is where the margin went.
   */
  defineSpecies('animal-frog', 'quadruped', {
    build: {
      kit: 'quadruped',
      height: 1.62,
      body: 0.85,
      head: 1.35,
      legs: 1.15,
      ears: 'none',
      tail: 'none',
      // Head at 1.35 is the widest in the collection: a frog is a mouth with an
      // animal behind it, and the head is `types.ts:118`'s "single strongest
      // read of what animal this is".
      palette: { coat: 0x5fae33, belly: 0xf0f2cf, detail: 0x3f7c1f, accent: 0x2c5b16 },
    },
  }),

  defineSpecies('animal-toad', 'quadruped', {
    build: {
      kit: 'quadruped',
      height: 1.46,
      body: 1.1,
      head: 1.1,
      legs: 0.4,
      ears: 'none',
      tail: 'none',
      // No extra. `spines` was considered for the warty back and rejected: the
      // kit draws spines as a ridge of spikes, which is the hedgehog's signature
      // in this very collection, and borrowing it would cost more separation
      // than it bought.
      palette: { coat: 0x8e7c4c, belly: 0xd8ca9f, detail: 0x6a5b33, accent: 0x4c4023 },
    },
  }),

  /*
   * The tortoise. `shell` is the animal. Everything else is tuned to get out of
   * its way: the smallest head in the collection (0.85), short legs, no ears.
   *
   * Legs are 0.42 and the body is under 1 for the same measured reason the mole
   * and the badger carry theirs — the shell dome is 1.14 body-widths across and
   * the kit fits to height, so a tortoise on truly stumpy legs gets scaled up
   * until its keep-out is a fox's. At 0.42 it is still the second-lowest thing
   * in the collection and it walks between two trees.
   */
  defineSpecies('animal-tortoise', 'quadruped', {
    build: {
      kit: 'quadruped',
      height: 1.55,
      body: 0.92,
      head: 0.85,
      legs: 0.42,
      ears: 'none',
      tail: 'stub',
      extras: ['shell'],
      // `accent` is the shell dome and `detail` its rim, so those two carry the
      // brown-and-horn shell while `coat` stays the olive skin.
      palette: { coat: 0x86924f, belly: 0xcbd196, detail: 0xb98c3a, accent: 0x8a5c26 },
    },
  }),

  /* ---- newt and salamander ------------------------------------------------
   *
   * Not in roster §4, and they are the same problem as frog/toad: two small
   * long-bodied amphibians with thin tails and no ears. Separated on purpose:
   *
   *   newt        SMALLER, longer, lower (measured clearance 0.12 of its own
   *               height), `crest`, dark with an orange belly
   *   salamander  bigger, shorter-bodied, standing higher off the ground
   *               (clearance 0.17), no crest, black with bright yellow limbs
   *
   * The `crest` is not decoration chosen to break a tie — the great crested
   * newt wears exactly that, and the kit's crest is a fan of blades on the
   * crown, which is the honest part for it.
   */
  defineSpecies('animal-newt', 'quadruped', {
    build: {
      kit: 'quadruped',
      height: 1.42,
      body: 1,
      head: 0.8,
      legs: 0.35,
      ears: 'none',
      tail: 'thin',
      extras: ['crest'],
      // `belly` is the loud one here: a newt seen from the island's
      // three-quarter camera shows its underside strip, and on a newt that
      // strip is orange. The kit stands the belly proud of the torso
      // (`quadruped.ts:253-263`) precisely so this is visible.
      palette: { coat: 0x4b4636, belly: 0xe8992c, detail: 0x35322a, accent: 0xe0b23f },
    },
  }),

  /*
   * The shrew. Separated from the mouse by having NO ears (a shrew's are buried
   * in fur), a smaller head, and the `snout` that gives it the pointed face it
   * is actually known for. Smallest height in the collection, which is true.
   *
   * `body` is 0.80 — the shortest here alongside the mole's — and again that is
   * the keep-out, not the anatomy: a thin tail behind a snout is the most
   * expensive combination this kit sells, and at 1.15 the shrew measured a
   * bigger obstacle circle than a fox. Short body plus the kit's constant-volume
   * rule gives it back its girth, and the pointed face survives intact.
   */
  defineSpecies('animal-shrew', 'quadruped', {
    build: {
      kit: 'quadruped',
      height: 1.4,
      body: 0.8,
      head: 0.85,
      legs: 0.42,
      ears: 'none',
      tail: 'thin',
      extras: ['snout', 'whiskers'],
      palette: { coat: 0x6d5b4a, belly: 0xc0ae9a, detail: 0x4a3d31, accent: 0x2e251d },
    },
  }),

  /*
   * The dormouse. The one member of the four small ground creatures with a
   * BUSHY tail, which is both true (a hazel dormouse's tail is furred) and the
   * single cheapest way to keep it off the mouse. Golden coat, big head, and a
   * short round body — it is the plumpest of the four.
   */
  defineSpecies('animal-dormouse', 'quadruped', {
    build: {
      kit: 'quadruped',
      height: 1.5,
      body: 0.9,
      head: 1.15,
      legs: 0.45,
      ears: 'round',
      tail: 'bushy',
      palette: { coat: 0xd9a44e, belly: 0xf9edd3, detail: 0xbf8535, accent: 0x8a5e22 },
    },
  }),

  /*
   * The vole. The blunt one: no ears showing, a STUB tail where the mouse and
   * shrew have thin ones, and a rounder body. Chestnut rather than grey-brown,
   * which is the bank vole and is also the only warm coat among the four.
   */
  defineSpecies('animal-vole', 'quadruped', {
    build: {
      kit: 'quadruped',
      height: 1.5,
      body: 0.95,
      head: 0.95,
      legs: 0.34,
      ears: 'none',
      tail: 'stub',
      palette: { coat: 0x9a6a3c, belly: 0xdcc7a6, detail: 0x74502c, accent: 0x4e361d },
    },
  }),

  /*
   * The salamander. The fire salamander: black with bright yellow, which is the
   * loudest palette in the collection and is real. It carries no extra at all —
   * that absence is what holds it apart from the newt's crest — so the whole
   * animal has to be legible from proportion and colour, and it is: bigger,
   * chunkier and higher off the ground than the newt.
   */
  defineSpecies('animal-salamander', 'quadruped', {
    build: {
      kit: 'quadruped',
      height: 1.6,
      body: 0.9,
      head: 1,
      legs: 0.5,
      ears: 'none',
      tail: 'thin',
      // `detail` is the paws, so the yellow lands on the feet where a fire
      // salamander's blotches actually are, against a black coat.
      palette: { coat: 0x2c2c32, belly: 0x53535d, detail: 0xf5c518, accent: 0xdba90f },
    },
  }),
]
