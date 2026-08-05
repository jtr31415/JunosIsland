/**
 * The earthworm — seven rings and no face, and both of those are the animal.
 *
 * *Annelid* means "little rings", so the rings ARE the species: **seven copies
 * of `box-04`, the bee's own abdomen shell-ring**, worn concentric at the
 * body's own centre exactly as its donor wears it. Six are thinned to a quarter
 * (0.114 thick) and read as annuli; the seventh is thinned only to 0.6 (0.274)
 * and painted pale, and it is the **clitellum** — the raised saddle a third of
 * the way back that is the one thing telling an earthworm from every other pink
 * tube, including the slug two rows down this collection.
 *
 * **A radial ring sunk 0.5 puts its centre on its `at`, exactly.** The shift
 * `creature.ts` applies is `-lo - sink x extent`, and for a symmetric shape
 * `lo = -extent/2`, so at `sink: 0.5` the shift is zero. Every station below is
 * therefore a place on the body rather than a face to join.
 *
 * **`legs: false` and no antennae, no mouth, no tail.** It pays Ocean's legless
 * height toll — a hull with no legs has its own bottom as its lowest point and
 * measures 1.250 against the pack's 1.43 floor — and that is correct here
 * rather than a shortfall.
 *
 * **The eyes are the harness's, not the worm's.** An earthworm is blind and has
 * no eyes at all; `assembly-assert.ts` requires at least one eye card on every
 * species, so `eyes: false` is unsayable, and `animal-starfish.ts` hit the same
 * wall. The smallest card in the pack is the least face available.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/** `box-03`'s own recorded centre, and where every ring below is centred. */
const HULL_MID_Y = 0.80625

/**
 * The annuli are a quarter of `box-04`'s own thickness, the clitellum 0.6.
 *
 * Rule 3, measured: at its own 0.456 the ring is 1.335 x 1.335 x 0.456 = 0.8128
 * against the hull's 1.9531, a **ratio of 2.40**, under the 3 `assertAssembly`
 * demands. At 0.114 it is 0.2032 and the ratio is 9.6; at 0.274 it is 0.4882 and
 * the ratio is 4.0. The x and y are untouched — 1.335 across a 1.250 hull is
 * 0.0425 of proud ring on every side and it is the entire read.
 */
const ANNULUS = 0.25
const CLITELLUM = 0.6

/** Six annuli on the pack's own 1/16 grid, and the saddle at 4/16. */
const ANNULUS_Z = [0.5, 0.125, -0.0625, -0.25, -0.4375, -0.5625] as const

export const WORM_ASSEMBLY = defineCreature('animal-worm', {
  /* NEW AND UNREVIEWED — the first earthworm ever built here. Brief §19 is
   * "bright, never scary": a soft pink rather than a mud brown, because the
   * animal a child digs up in a garden is pink. */
  palette: {
    coat: 0xc98b86,     // UNREVIEWED: the body, a soft earthworm pink
    belly: 0xefcfc6,    // UNREVIEWED: the paler underside, and the sclera
    ring: 0xa96f6a,     // UNREVIEWED: the six annuli, a shade under the coat
    saddle: 0xe8b9a4,   // UNREVIEWED: THE CLITELLUM — the pale raised saddle
    pupil: PACK_PUPIL,  // measured off 544 real eye texels; see texture.ts
  },

  belly: 0.5,

  /* Ocean's legless height toll, paid deliberately: nothing lifts this animal
   * off its own 1.250 and an earthworm has nothing to lift it with. */
  legs: false,

  /* The caterpillar's own card, the SMALLEST in the pack. See the header — an
   * earthworm has no eyes and the harness will not let a species have none. */
  eyes: { part: 'plate-06', y: 0.86 },

  extras: [
    /* THE SIX ANNULI, all one shape at one thickness and one colour, which is
     * what makes them read as a repeat rather than as six features. */
    ...ANNULUS_Z.map((z, i) => ({
      name: `ring-${i}`,
      part: 'box-04',
      paint: 'ring',
      stretch: [1, 1, ANNULUS] as [number, number, number],
      sink: 0.5,
      at: [0, HULL_MID_Y, z] as [number, number, number],
    })),
    /* THE CLITELLUM. Twice as thick as an annulus and the only pale part of the
     * animal — the saddle, a third of the way back, which is the one feature an
     * earthworm has and a slug has not. */
    { name: 'clitellum', part: 'box-04', paint: 'saddle', stretch: [1, 1, CLITELLUM], sink: 0.5, at: [0, HULL_MID_Y, 0.3125] },
  ],

  flag: 'A WORM IS LONG AND THIS ONE IS A CUBE. `HullDef.stretch` is `never` — your own '
    + 'ruling, twice, quoted in `hulls.ts` — so the only way to change a body proportion '
    + 'is to take a different real shell, and the pack drew ten of which the longest is '
    + '1.5395. An earthworm is twenty times its own width. The rings are what carries the '
    + 'read instead: seven of them across one shell, which is what an annelid is named for. '
    + 'The same wall makes `animal-stick-insect.ts` and `animal-centipede.ts` what they are '
    + 'and it is the single biggest constraint on this collection. ALSO: IT HAS EYES AND IT '
    + 'SHOULD NOT. An earthworm is blind; `assembly-assert.ts` requires at least one eye '
    + 'card on every species so `eyes: false` is unsayable, and the pack\'s smallest card is '
    + 'the least face available. `animal-starfish.ts` says the same thing about the same '
    + 'line. ALSO: IT IS 1.3350 TALL AGAINST THE PACK\'S 1.43 FLOOR — a legless hull is '
    + '1.2500 and the rings lift it the 0.0850 they stand proud — which is the legless toll '
    + 'every legless species in this project pays and is deliberate. ALSO: NEW '
    + 'PALETTE, UNREVIEWED.',
})
