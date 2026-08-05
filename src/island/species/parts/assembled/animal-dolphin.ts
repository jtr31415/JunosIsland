/**
 * The dolphin — the beak is what holds it apart from the shark, and it is the
 * one separation on this animal that a five-year-old will actually read.
 *
 * `animal-shark` is grey, legless, on a cube, with a dorsal and pectorals, and
 * without care this is that animal in blue. Three measured differences carry it:
 *
 *   - a BEAK. `tube-03`, the deer's muzzle, the longest snout in the bank at
 *     0.532 — a shark has no snout geometry at all, only a mouth card.
 *   - a HORIZONTAL fluke (`box-38` spun flat, the whale's own idiom) against the
 *     shark's VERTICAL `wedge-15`. That is the real-world difference between a
 *     fish and a mammal and it happens to be the one this bank can say cleanly.
 *   - no gills. The shark wears six `plate-10` slits; this wears none.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

export const DOLPHIN_ASSEMBLY = defineCreature('animal-dolphin', {
  palette: {
    coat: 0x7f93a6,
    belly: 0xf4f6f7,
    fin: 0x6b8093,
    mouth: 0x2f3a44,
    pupil: PACK_PUPIL,  // the pack's own measured pupil; see texture.ts
  },

  hull: 'box-03',
  belly: 0.4375,
  legs: false,
  eyes: { part: 'plate-01', x: 0.2625, y: 1.0125 },

  /* The beak — the longest snout the bank owns, at its own donor transfer. */
  snout: { part: 'tube-03', paint: 'coat' },

  /* Horizontal, like the whale's: a mammal's fluke, not a fish's fin. */
  tail: { part: 'box-38', paint: 'fin', spin: [{ axis: 'z', deg: 90 }], sink: 0.3 },

  extras: [
    /* A dolphin's dorsal sits further BACK than a shark's, which stands over
     * the shoulder. It was going to LEAN back as well, with a second
     * `{ x: -25 }`, and that spin is not available: the harness cannot recover
     * `wedge-19` through it (`assembly-assert.ts:562`), so the separation is
     * carried by position alone — z = -0.25 against the shark's -0.0625. */
    {
      name: 'dorsal',
      part: 'wedge-19',
      paint: 'fin',
      spin: [{ axis: 'z', deg: 90 }],
      sink: 0.25,
      at: [0, 1.43125, -0.25],
    },
    {
      name: 'pectoral',
      part: 'box-43',
      paint: 'fin',
      kind: 'pair',
      spin: [{ axis: 'y', deg: 25 }],
      sink: 0.4,
      at: [0.625, 0.5625, 0.1875],
    },
    /* The smile, on the beak rather than the hull. */
    { name: 'mouth', part: 'plate-13', paint: 'mouth', stretch: [1.5, 1, 1], on: 'snout' },
  ],

  flag: 'NEW PALETTE, UNREVIEWED — the first dolphin ever built and the first colours '
    + 'ever proposed for it. ROSTER §4 IS THE RISK: this is a legless grey animal on a '
    + 'cube with a dorsal and pectorals, and so is animal-shark. The three things meant '
    + 'to separate them are the BEAK (tube-03, which the shark has not got), the '
    + 'HORIZONTAL fluke against the shark\'s vertical fin, and the absence of gills. '
    + 'Look at the two side by side; if they still twin, the beak is the dial to turn, '
    + 'because it is the only one of the three that changes the silhouette from the '
    + 'front as well as from the side.',
})
