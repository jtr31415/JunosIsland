/**
 * The cockatoo — `animal-cockatiel.ts`'s bird with the crest it could not have.
 *
 * A cockatiel IS a small cockatoo, so the two share a family on purpose and the
 * separation has to be measured rather than asserted. It is spent in one place:
 * **the CREST, and the number is `animal-chicken.ts`'s own measured headroom.**
 *
 * That file solved a serrated row of `cone-01` and then wrote down what it had
 * left over: *"Five points at the same 2/16 step run from 0.148215 back to
 * -0.351785, and at `cone-01`'s own 5/16 burial the bound is 0.4375, so five
 * taller points fit on the identical solve."* It reserved that for the rooster's
 * comb. This bird spends it as a CREST, which is a different animal and a
 * different job for the same arithmetic:
 *
 *   - **FIVE points against the cockatiel's three**, at the shape's own 5/16
 *     burial rather than the hen's 8/16 — so each one stands its full 0.275356
 *     proud, which is the cockatiel's own crest height, five times over.
 *   - **The leading edge is `COMB_FRONT_Z`** — the flat top face's own front
 *     reach (0.3125, measured off the shell rather than assumed) less
 *     `cone-01`'s own half-depth — so the front point's leading edge lands
 *     exactly on the flat top's front edge, and the row runs BACK from it at
 *     2/16, which is the largest grid step at which the points still MEET.
 *   - **All five bases lie wholly on the flat top face.** Footprint z 0.3125
 *     back to -0.3782 against a §3 bound of `topFlatZ + depth` = 0.4375.
 *
 * The rest is the parrot, unargued: `cone-06` — the pack's own parrot beak, and
 * a cockatoo genuinely has that hook — `plate-08`, the one round card, the
 * parrot's own `wedge-19` wing on a pure donor transfer, and `box-38`, the
 * parrot's fan. This is the one bird in the project wearing four parrot parts,
 * because it is a parrot.
 */
import { defineCreature } from '../creature'
import { LEG_ROW } from '../hulls'
import { PACK_PUPIL } from '../texture'

/** `box-03`'s own top face, and how far its flat part reaches in z. */
const HULL_TOP_Y = 1.43125
const HULL_FLAT = 0.3125

/**
 * `animal-cockatiel.ts`'s `CREST_Z` and `animal-chicken.ts`'s `COMB_FRONT_Z`,
 * which are the same number solved twice: the flat top's front reach less
 * `cone-01`'s own half-depth, so the leading point's front edge lands exactly on
 * the flat top's front edge.
 */
const CREST_FRONT_Z = HULL_FLAT - 0.328570 / 2

/**
 * 2/16 — the largest step on the pack's grid at which adjacent points still
 * MEET, derived in full at `animal-chicken.ts`: `cone-01` is 0.328570 across at
 * its base and half that at the crown, so at 2/16 the bases overlap and read as
 * one blade and at 3/16 they stand apart and read as separate spikes.
 */
const CREST_STEP = 0.125

export const COCKATOO_ASSEMBLY = defineCreature('animal-cockatoo', {
  palette: {
    coat: 0xf2eee6,    // UNREVIEWED: the white bird, and nearly all of it
    crest: 0xe8c447,   // UNREVIEWED: the sulphur crest, and the only strong colour
    flight: 0xe4dccd,  // UNREVIEWED: the white one shade down — wings and tail
    limb: 0x8f8a80,    // UNREVIEWED: the grey feet and the heavy black-grey bill
    eye: 0x241d18,     // UNREVIEWED: the dark bead
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* The builder's default cube, and the parrot's own shell. */
  hull: { part: 'box-03', paint: 'coat' },

  /* The pack's one ROUND card — the parrot's, the chick's and the penguin's. */
  eyes: { part: 'plate-08', paint: 'eye' },

  /* The parrot's own beak, hook and all. `animal-canary.ts` measured band 15
   * standing 0.041900 proud of band 13 and REFUSED the shape for a hen on
   * exactly that overhang; on a cockatoo the overhang is the point. */
  snout: { part: 'cone-06', paint: 'limb' },

  /* The parrot's fan, on a pure donor transfer — no `at`, no `sink`, no spin. */
  tail: { part: 'box-38', paint: 'flight' },

  legs: false,
  extras: [
    /* Two legs on the pack's own row at `box-01`'s recorded x and the hull's
     * midline — the only station a biped's legs can be at. */
    {
      name: 'leg',
      part: 'box-01',
      paint: 'limb',
      kind: 'pair',
      sink: LEG_ROW.sink,
      at: [0.25, LEG_ROW.y, 0],
    },

    /* THE WING, SPREAD rather than folded, and a pure donor transfer: the
     * parrot's own wing on the parrot's own shell, so nothing needs a number.
     * `wedge-19` carries the `wing` role, so it flaps with no motion line —
     * `withDefaultFlap` in creature.ts. */
    { name: 'wing', part: 'wedge-19', paint: 'flight', kind: 'pair' },

    /* THE CREST — five points, animal-chicken.ts's own measured headroom, at
     * cone-01's own 5/16 burial so each stands its full 0.275356 proud. */
    { name: 'crest-1', part: 'cone-01', paint: 'crest', at: [0, HULL_TOP_Y, CREST_FRONT_Z] },
    {
      name: 'crest-2', part: 'cone-01', paint: 'crest',
      at: [0, HULL_TOP_Y, CREST_FRONT_Z - CREST_STEP],
    },
    {
      name: 'crest-3', part: 'cone-01', paint: 'crest',
      at: [0, HULL_TOP_Y, CREST_FRONT_Z - 2 * CREST_STEP],
    },
    {
      name: 'crest-4', part: 'cone-01', paint: 'crest',
      at: [0, HULL_TOP_Y, CREST_FRONT_Z - 3 * CREST_STEP],
    },
    {
      name: 'crest-5', part: 'cone-01', paint: 'crest',
      at: [0, HULL_TOP_Y, CREST_FRONT_Z - 4 * CREST_STEP],
    },
  ],

  flag: 'THE CREST IS THE SEPARATION FROM animal-cockatiel AND IT IS SPENT HEADROOM RATHER '
    + 'THAN A NEW IDEA. animal-chicken.ts solved a serrated row of cone-01 and wrote down what '
    + 'it had left: five points at a 2/16 step run from z 0.148215 back to -0.351785, and at '
    + 'cone-01\'s own 5/16 burial the §3 bound is 0.4375, so five FULL-HEIGHT points fit on the '
    + 'identical solve with all five bases wholly on the flat top face. That was reserved for '
    + 'the rooster\'s comb; this bird spends it as a crest, which is the same arithmetic doing '
    + 'a different job. Against the cockatiel that is five points at 0.275356 proud each '
    + 'against three, on a WHITE bird with a sulphur crest rather than a grey one with a '
    + 'yellow face — and if that is not enough separation between two birds that really are '
    + 'the same family, the fix is the palette rather than the parts. FOUR PARROT PARTS on one '
    + 'animal, deliberately: cone-06 the beak (animal-canary.ts REFUSED it for a hen because '
    + 'its band 15 stands 0.041900 proud of band 13 — that overhang is where a hook begins, and '
    + 'a cockatoo has one), box-38 the fan, wedge-19 the wing and plate-08 the round eye. A '
    + 'cockatoo is a parrot and inventing differences would be inventing. IT FLAPS with no '
    + 'motion line, because wedge-19 carries the pack\'s own wing role. NEW PALETTE, UNREVIEWED.',
})
