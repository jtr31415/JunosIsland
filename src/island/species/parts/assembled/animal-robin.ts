/**
 * The robin — Birds' first animal, and the RED BREAST is a hull band.
 *
 * `collections/birds.ts` sets out the passerine idiom and this file is where it
 * is settled, so the other four small birds inherit it and argue only about
 * their markings:
 *
 *   - **`box-39`, the penguin's cut of the shared 1.250 cube.**
 *     `animal-canary.ts` measured all four cuts of that solid against the pack's
 *     own floors and found only this one clears them — 405 vertices and 424
 *     triangles against 405 and 422. A small bird has nothing else on it, so
 *     this is the hull that lets one exist at all.
 *   - **Two legs, not four**: one mirrored `box-01` pair on `LEG_ROW`.
 *   - **`cone-06`, the parrot's bill** — the only shape in the bank with form
 *     `cone` out of 28 noses, taper 0, a true point, reaching 0.183 against
 *     `tube-02`'s 0.100. It is what a bird that takes insects has, where
 *     `tube-02` is a blunt ground-picking bar.
 *   - **`wedge-19`, the chick's and the parrot's own WING**, by pure donor
 *     transfer: it attaches `x +1`, so the builder joins it at this hull's own
 *     side face and the two coordinates the join does not move recover the
 *     bank's recorded 0.64375 and 0.0125. It carries the `wing` role, so
 *     `withDefaultFlap` gives it a wingbeat with no `motion` line at all.
 *   - **`plate-08`, the pack's one round card**, as the eye.
 *
 * **AND BAND 3 IS THE ANIMAL.** `box-39` arrives cut into two bands and band 3
 * is 22 triangles of Kenney's own white FRONT — x +/-0.500, local y -0.625 to
 * 0.426, z -0.313 to 0.625 — the only band in any of the pack's ten hulls that
 * faces forward rather than up or sideways. Painted orange-red that is a
 * robin's breast, in the right place, for no geometry. `animal-canary.ts` names
 * that band and refuses it, correctly, because a canary has no colour break at
 * all; this is the bird it was being kept for.
 */
import { defineCreature } from '../creature'
import { LEG_ROW } from '../hulls'
import { PACK_PUPIL } from '../texture'

/**
 * The rear plate's own centre, and every one of the pack's ten hulls presents
 * the same one: world z = -0.625, x +/-0.3125, y 0.49375 to 1.11875.
 */
const REAR_PLATE_Y = 0.80625
const REAR_PLATE_Z = -0.625

export const ROBIN_ASSEMBLY = defineCreature('animal-robin', {
  palette: {
    coat: 0x8a7a5c,
    breast: 0xd4562a,
    flight: 0x6f6247,
    limb: 0x6b5a44,
    eye: 0x1a1611,
    pupil: PACK_PUPIL,
  },

  /* THE BREAST. Band 3 is Kenney's own white FRONT on this shell — the one
   * forward-facing band in any of the pack's hulls — painted orange-red. */
  hull: { part: 'box-39', paint: { base: 'coat', byBand: { 3: 'breast' } } },

  eyes: { part: 'plate-08', paint: 'eye' },

  /* The parrot's own bill, a true point. */
  snout: { part: 'cone-06', paint: 'limb' },

  /* The parrot's fan, lying back off the rump at the rear plate's own centre —
   * a short square passerine tail rather than the carried fan the cage birds
   * wear. Sunk the parrot's own 0.269738, so only the height is this bird's. */
  tail: { part: 'box-38', paint: 'flight', at: [0, REAR_PLATE_Y, REAR_PLATE_Z] },

  legs: false,
  extras: [
    {
      name: 'leg-front',
      part: 'box-01',
      paint: 'limb',
      kind: 'pair',
      sink: LEG_ROW.sink,
      at: [0.25, LEG_ROW.y, 0],
    },

    /* The chick's and the parrot's real wing, placed entirely by donor transfer
     * — no `at`, no `spin`, no `sink`. It carries the `wing` role, so it flaps
     * without this species asking. */
    {
      name: 'wing',
      part: 'wedge-19',
      paint: 'flight',
      kind: 'pair',
    },
  ],

  flag: 'THE RED BREAST IS A HULL BAND AND IT COSTS NOTHING, which is the whole reason this '
    + 'bird is the collection\'s first. box-39 — the penguin\'s cut of the shared 1.250 cube — '
    + 'arrives split into two bands, and band 3 is 22 triangles of Kenney\'s own white FRONT '
    + 'running x +/-0.500, local y -0.625 to 0.426 and z -0.313 to 0.625. It is the ONLY band in '
    + 'any of the pack\'s ten hulls that faces forward rather than up or sideways, and painting '
    + 'it orange-red puts a robin\'s breast exactly where a robin wears it for zero triangles. '
    + 'animal-canary.ts names that band and REFUSES it, rightly, because a canary has no colour '
    + 'break anywhere on it — so this is the bird that band was being kept for. If the breast '
    + 'reads too big or sits too low that is Kenney\'s own boundary and there is no dial on it. '
    + 'THE SHAPE IS THE PASSERINE IDIOM AND FOUR MORE BIRDS WILL SHARE IT: box-39 (the only cut '
    + 'of that solid that clears the pack\'s 405-vertex floor, measured four ways in '
    + 'animal-canary.ts), two legs on LEG_ROW, cone-06 as the pointed insect bill, plate-08 as '
    + 'the round eye, and wedge-19 — the chick\'s and the parrot\'s REAL wing — placed by pure '
    + 'donor transfer with no at, no spin and no sink, which also means it flaps without this '
    + 'species asking, because withDefaultFlap triggers on the wing ROLE. A robin and a wren and '
    + 'a blackbird really are one shape in five colours, and pretending otherwise would be '
    + 'inventing differences rather than finding them. NEW PALETTE, UNREVIEWED, all six slots.',
})
