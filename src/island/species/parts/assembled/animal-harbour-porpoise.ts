/**
 * The harbour porpoise — the cetacean whose design is that it has NO BEAK, and
 * the first one in the project whose dorsal fin is not a wing.
 *
 * ONE SPECIES, ONE FILE. `register.ts` says why the one appended line in
 * `index.ts` is the whole of the wiring.
 *
 * **The separation from `animal-dolphin` is one absent feature.** That animal's
 * flag says its beak — `tube-03`, the longest snout in the bank — is the dial to
 * turn if it twins with the shark, because it is the only thing that changes the
 * silhouette from the front as well as the side. A porpoise's head is BLUNT; it
 * has no beak at all, and that is the single field mark anyone uses to tell the
 * two families apart. So this species has no `snout` entry, and the absence is
 * the design rather than an omission.
 *
 * **The dorsal is `wedge-06`, the cat's ear, and it is chosen for what it is
 * NOT.** Every other cetacean here stands a `wing`-role blade on its back —
 * `wedge-19` on the shark, the dolphin and the whale, `box-06` on the orca — and
 * `creature.ts`'s `withDefaultFlap` gives any wing-role part a wingbeat unless
 * the species names it. A porpoise's dorsal is a low blunt triangle rather than
 * a blade, so it takes an EAR: cut 0.65 wide and 1.9 long, sunk 0.45, showing
 * 0.199 of a 0.362 shape. Low, wide, and still.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/** The flat crown of the 1.250 cube. A legless hull grounds on its own bottom. */
const CROWN_Y = 1.43125
/** The card shell — where the pack puts every flat forward marking, 0.010 proud. */
const CARD_Z = 0.635

export const HARBOUR_PORPOISE_ASSEMBLY = defineCreature('animal-harbour-porpoise', {
  palette: {
    coat: 0x4e535a,    // UNREVIEWED: dark slate — a porpoise is much darker than a dolphin
    belly: 0xf2f0ea,   // UNREVIEWED: the sharply divided white underside, and the sclera
    fin: 0x3d424a,     // UNREVIEWED: fluke, flippers and dorsal, a shade under the coat
    mouth: 0x2b2f34,   // UNREVIEWED: the short straight mouth line
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  hull: { part: 'box-03' },
  /* 8/16 — the tiger's own mammal line made exact, and this cube's own equator.
   * A porpoise's white runs high and the boundary is hard, not smudged. */
  belly: 0.5,
  legs: false,

  /* The bank's smallest eye card, low and just behind the mouth line, which is
   * where a porpoise's is and nearly the only mark on its head. */
  eyes: { part: 'plate-06', y: 0.98 },

  /* Horizontal, like the whale's, the dolphin's, the orca's and the beluga's: a
   * mammal's fluke, not a fish's fin. The shared cetacean idiom, unchanged. */
  tail: { part: 'box-38', paint: 'fin', spin: [{ axis: 'z', deg: 90 }], sink: 0.3 },

  extras: [
    /* THE DORSAL — see the header for why it is an ear rather than a wing. */
    {
      name: 'dorsal',
      part: 'wedge-06',
      paint: 'fin',
      stretch: [0.65, 1, 1.9],
      sink: 0.45,
      at: [0, CROWN_Y, -0.0625],
    },

    /* Short rounded flippers: the penguin's wing, which already IS a flipper and
     * needed no reinterpretation — `collections/ocean.ts` carried that correction
     * back and every cetacean since has taken it without argument. */
    {
      name: 'flipper',
      part: 'blade-06',
      paint: 'fin',
      kind: 'pair',
      spin: [{ axis: 'z', deg: -90 }, { axis: 'y', deg: -25 }],
      sink: 0.6,
      at: [0.625, 0.54, 0.1875],
    },

    /* The mouth line, short and straight. The beluga's is stretched 1.8 wide for
     * a smile; a porpoise's is a small dark dash and this is 1.2. */
    { name: 'mouth', part: 'plate-13', paint: 'mouth', stretch: [1.2, 1, 1], at: [0, 0.76, CARD_Z] },
  ],
})
