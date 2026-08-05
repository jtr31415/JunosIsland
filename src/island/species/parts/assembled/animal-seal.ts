/**
 * The seal — four flippers and no legs, and the whole animal is the flipper.
 *
 * `blade-06` is the penguin's wing, which `animal-whale.ts` already established
 * "already is a flipper" and needs no reinterpretation. This species spends it
 * FOUR times, which nothing else in the project does, and the two pairs are
 * placed at right angles to each other because that is the difference between a
 * seal and a whale: the fore pair sticks out of the flank, the hind pair trails
 * off the rear plate and is the shape a seal is drawn by.
 *
 * `plate-08`, the round card, painted near-black to the rim. A seal's eye reads
 * as all pupil, and rule 5 forbids scaling one, so "big dark eyes" is a part
 * choice and a paint and nothing else.
 *
 * Against `animal-walrus` beside it: no tusk, no whisker pad, and the plain
 * 1.250 cube against that animal's `box-41`. The walrus is the big one here.
 *
 * It pays the legless height toll — 1.250 against the pack's 1.43 floor — which
 * is a norm that REPORTS since Joe's ruling of 3 August, and is what every
 * legless animal in Ocean does.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/** `box-03`'s own flat rear plate and its own side. */
const REAR_Z = -0.625
const SIDE_X = 0.625

export const SEAL_ASSEMBLY = defineCreature('animal-seal', {
  palette: {
    coat: 0x8d95a1,    // UNREVIEWED: wet slate grey
    belly: 0xe7ebef,   // UNREVIEWED: the pale underside and the sclera
    flipper: 0x6a727d, // UNREVIEWED: a shade under the coat
    mark: 0x2a2e34,    // UNREVIEWED: the nose and the eye, near-black
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  hull: 'box-03',
  belly: 0.5,
  legs: false,

  /* The round card, painted dark to the rim — a seal's eye is all pupil. */
  eyes: { part: 'plate-08', paint: 'mark', y: 0.95 },

  /* Short and blunt. `tube-01` is the pack's own barrel muzzle and a seal's
   * face is a muzzle with whiskers on it, not a snout. */
  snout: { part: 'tube-01', paint: 'coat' },
  nose: { part: 'box-10', paint: 'mark' },

  extras: [
    /* THE FORE FLIPPERS, out of the flank. `{ z, -90 }` takes blade-06's own
     * `y +1` to `x +1`, then `{ y, -35 }` sweeps them back. */
    {
      name: 'flipper-fore',
      part: 'blade-06',
      paint: 'flipper',
      kind: 'pair',
      spin: [{ axis: 'z', deg: -90 }, { axis: 'y', deg: -35 }],
      sink: 0.55,
      at: [SIDE_X, 0.5, 0.1875],
    },

    /* THE HIND FLIPPERS, off the rear plate. `{ x, -90 }` takes `y +1` to
     * `z -1`, so the pair trails straight back — the silhouette a seal on ice
     * is drawn with, and the one thing that cannot be mistaken for a whale. */
    {
      name: 'flipper-hind',
      part: 'blade-06',
      paint: 'flipper',
      kind: 'pair',
      spin: [{ axis: 'x', deg: -90 }],
      sink: 0.35,
      at: [0.1875, 0.45, REAR_Z],
    },

    /* THE WHISKERS. `animal-nightjar.ts` established this exact idiom — a
     * `cone-01` spun on x so its own `y +1` facing leans forward — for rictal
     * bristles, and a seal's vibrissae are the same thing on a bigger face.
     * `{ x, 75 }` takes the facing to (0, 0.259, 0.966), nearly straight ahead,
     * and `{ y, 30 }` splays each pair outward off the muzzle. */
    {
      name: 'whisker',
      part: 'cone-01',
      paint: 'belly',
      kind: 'pair',
      spin: [{ axis: 'x', deg: 75 }, { axis: 'y', deg: 30 }],
      sink: 0.4,
      at: [0.14, 0.78, 0.68],
    },

    /* A SECOND ROW, lower and wider. A seal's vibrissae grow in rows across the
     * whole muzzle pad rather than as one pair, and two rows is the fewest that
     * reads as a row rather than as two spikes. */
    {
      name: 'whisker-low',
      part: 'cone-01',
      paint: 'belly',
      kind: 'pair',
      spin: [{ axis: 'x', deg: 82 }, { axis: 'y', deg: 45 }],
      sink: 0.4,
      at: [0.19, 0.70, 0.66],
    },
  ],

  flag: 'NEW PALETTE, UNREVIEWED — the first seal ever built. FOUR blade-06, which no other '
    + 'species spends, and the two pairs are at RIGHT ANGLES on purpose: fore out of the '
    + 'flank, hind trailing off the rear plate. That second pair is the whole separation from '
    + 'animal-whale, which wears the same shape only on its flanks. IT PAYS THE LEGLESS '
    + 'HEIGHT TOLL at 1.250 against the pack\'s 1.43 floor, which is a norm that reports '
    + 'rather than fails and is what every legless animal in Ocean does. AGAINST THE WALRUS '
    + 'beside it: no tusk, no whisker pad, and the plain cube against that animal\'s box-41.',
})
