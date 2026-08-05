/**
 * The kookaburra — `animal-kingfisher.ts`'s bird, grown up.
 *
 * A kookaburra IS a kingfisher — the largest one there is — so this file takes
 * that species' shell, bill and wing unchanged and separates on the two things
 * that are genuinely different about it. `animal-baboon.ts` took the frozen
 * monkey's own shell on the same argument.
 *
 *   - **SHARED, and deliberately not re-litigated:** `box-39`, the penguin's
 *     cube with its forward band; `cone-06`, the pack's only true point, painted
 *     with Kenney's own two-tone cut (band 15 the upper mandible, band 13 the
 *     lower); `wedge-19`, the parrot's wing on a pure donor transfer; `plate-08`,
 *     the one round card; two legs on the pack's own row.
 *   - **THE TAIL IS THE SEPARATION.** The kingfisher takes `box-18`, the bank's
 *     only STUB, and its own file says *"a kingfisher has the shortest tail
 *     here"*. A kookaburra's is long, rufous and barred, so this bird takes
 *     `box-38` — the parrot's fan, second-thickest tail in the bank at 0.626,
 *     with 0.773 of reach against the stub's 0.425. That is a 1.8x difference in
 *     silhouette from behind, which is where a child looks.
 *   - **AND THE COLOUR IS THE OTHER HALF.** The kingfisher's own flag calls its
 *     palette *"the most saturated in the project"*. This one is the opposite: a
 *     cream head with a brown eye-mask, a buff-brown back and a pale breast. The
 *     forward band `box-39` gives free is spent on the breast rather than on a
 *     chestnut front.
 *
 * **The bill is short and it is the same wall the kingfisher hit.** `cone-06`
 * reaches 0.183 and there is nothing longer in the bank; a kookaburra's is if
 * anything heavier than a kingfisher's relative to its head. That file asked for
 * a spear to be commissioned and put the heron and the stork behind it; this
 * bird joins that queue rather than restating the case.
 */
import { defineCreature } from '../creature'
import { LEG_ROW } from '../hulls'
import { PACK_PUPIL } from '../texture'

export const KOOKABURRA_ASSEMBLY = defineCreature('animal-kookaburra', {
  palette: {
    coat: 0x8a7455,    // UNREVIEWED: the buff-brown back and wings
    breast: 0xefe6d2,   // UNREVIEWED: the cream head and breast — box-39's forward band
    flight: 0x5c6f86,  // UNREVIEWED: the blue-grey wing flash a kookaburra really has
    bill: 0x2b2620,    // UNREVIEWED: the heavy dark upper mandible
    lower: 0xd9c9a4,   // UNREVIEWED: the pale lower mandible — Kenney's own band cut
    limb: 0x9a8a6e,    // UNREVIEWED: the short grey feet
    eye: 0x241c14,     // UNREVIEWED: the dark bead
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* The kingfisher's own shell, with its forward band as a cream breast rather
   * than a chestnut one. */
  hull: { part: 'box-39', paint: { base: 'coat', byBand: { 3: 'breast' } } },

  eyes: { part: 'plate-08', paint: 'eye' },

  /* THE TWO-TONE BILL, the kingfisher's own line: band 15 is the upper mandible
   * and band 13 the lower — Kenney's own cut, measured in `animal-canary.ts`. */
  snout: { part: 'cone-06', paint: { base: 'bill', byBand: { 13: 'lower' } } },

  /* THE SEPARATION. The parrot's fan — 0.773 of reach against the kingfisher
   * stub's 0.425 — on a pure donor transfer. */
  tail: { part: 'box-38', paint: 'coat' },

  legs: false,
  extras: [
    {
      name: 'leg',
      part: 'box-01',
      paint: 'limb',
      kind: 'pair',
      sink: LEG_ROW.sink,
      at: [0.25, LEG_ROW.y, 0],
    },

    /* The kingfisher's own wing, unchanged and unargued: a pure donor transfer
     * of the parrot's `wedge-19`. It carries the pack's `wing` role, so it flaps
     * with no motion line. */
    { name: 'wing', part: 'wedge-19', paint: 'flight', kind: 'pair' },
  ],

  flag: 'THIS IS animal-kingfisher WITH TWO THINGS CHANGED, and the sharing is deliberate — a '
    + 'kookaburra is a kingfisher, the biggest one there is, and animal-baboon.ts took the '
    + 'frozen monkey\'s own shell on the same argument. WHAT IS SHARED: box-39 and its forward '
    + 'band, cone-06 with Kenney\'s own two-tone mandible cut, wedge-19 on a pure donor '
    + 'transfer, plate-08, and the two-leg row. WHAT SEPARATES: the TAIL, where the kingfisher '
    + 'takes box-18, the bank\'s only stub at 0.425211 of reach and the shortest tail in the '
    + 'project, and this takes box-38, the parrot\'s fan at 0.773 — 1.8x the reach, which is '
    + 'the whole silhouette from behind; and the COLOUR, the kingfisher\'s own flag calling its '
    + 'palette the most saturated in the project and this one being a cream head, a buff back '
    + 'and a pale breast. THE BILL IS TOO SHORT and it is the kingfisher\'s own wall, not a new '
    + 'one: cone-06 reaches 0.183 and nothing in the bank is longer. That file asked for a '
    + 'spear to be commissioned with the heron and the stork behind it; this bird joins the '
    + 'queue rather than restating the case. IT IS A LIGHT MODEL — 364 vertices against a floor '
    + 'of 405, which is the kingfisher family\'s own shape: eight meshes and no ears, no nose '
    + 'and no belly line. NEW PALETTE, UNREVIEWED.',
})
