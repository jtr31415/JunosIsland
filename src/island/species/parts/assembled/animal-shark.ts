/**
 * The shark — Ocean's first, and the species that proves the collection is
 * buildable at all.
 *
 * It wears the pack's OWN FISH throughout: `box-20` is the fish's hull, and the
 * pectorals are `box-42`/`box-43`, the fish's own `wing` nodes — which are fins,
 * and which `collections/ocean.ts` explains were baked into the bank on 4 August
 * and are the reason this collection stopped being impossible.
 *
 * The dorsal is `wedge-19`, the chick's and the parrot's wing, spun a quarter
 * turn so its facing runs UP instead of sideways: a tapering blade standing on
 * the back is a dorsal fin, and it is the same shape nine birds wear folded on
 * the flank. The caudal is `wedge-15`, the lion's tail — thin, tall and tapering
 * to a half, the one tail in the bank that stands as a vertical fin.
 *
 * Nothing is authored and nothing is stretched.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

export const SHARK_ASSEMBLY = defineCreature('animal-shark', {
  palette: {
    coat: 0x6f7d8c,
    belly: 0xf1f3f2,
    fin: 0x5b6774,
    mouth: 0x2b2f33,
    pupil: PACK_PUPIL,  // the pack's own measured pupil; see texture.ts
  },

  hull: 'box-20',
  belly: 0.4375,
  legs: false,
  eyes: { part: 'plate-01', x: 0.2625, y: 1.05 },

  /* The lion's tail, unspun, at its own donor burial: a vertical caudal fin. */
  tail: { part: 'wedge-15', paint: 'fin', sink: 0.25 },

  extras: [
    /* The dorsal: the parrot's wing turned to face UP off the crown. */
    {
      name: 'dorsal',
      part: 'wedge-19',
      paint: 'fin',
      spin: [{ axis: 'z', deg: 90 }],
      sink: 0.25,
      at: [0, 1.43125, -0.0625],
    },
    /* The pectorals: the pack's own fish fin, at its own donor burial. */
    {
      name: 'pectoral',
      part: 'box-43',
      paint: 'fin',
      kind: 'pair',
      sink: 0.4,
      at: [0.625, 0.5625, 0.1875],
    },
    /* Three gill slits a side, on the pack's own card shell. */
    { name: 'gill', part: 'plate-10', paint: 'mouth', kind: 'pair', stretch: [1, 1, 0.25], at: [0.635, 0.9375, 0.3125] },
    { name: 'gill-2', part: 'plate-10', paint: 'mouth', kind: 'pair', stretch: [1, 1, 0.25], at: [0.635, 0.9375, 0.1875] },
    { name: 'gill-3', part: 'plate-10', paint: 'mouth', kind: 'pair', stretch: [1, 1, 0.25], at: [0.635, 0.9375, 0.0625] },
    /* The mouth, low and wide — a shark's is under the snout, not on it. */
    { name: 'mouth', part: 'plate-13', paint: 'mouth', stretch: [2, 1, 1], at: [0, 0.6875, 0.635] },
  ],

  flag: 'NEW PALETTE, UNREVIEWED — the first shark ever built and the first colours '
    + 'ever proposed for it. THE ONE THING TO LOOK AT is whether the DORSAL reads: it '
    + 'is wedge-19, the chick\'s and the parrot\'s real wing, spun 90 so its facing runs '
    + 'up off the crown rather than sideways along a flank. Nine birds in this project '
    + 'wear that shape folded; this is the first time it stands. A shark is its dorsal '
    + 'at tablet distance, so if that blade does not read, nothing else about the '
    + 'animal will save it.',
})
