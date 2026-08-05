/**
 * The narwhal — one tooth, and everything else is a beluga.
 *
 * These two are the only members of their family and they look it, so this file
 * and `animal-beluga.ts` are deliberately the same animal twice with two
 * differences, in the same way `animal-mink.ts` and `animal-stoat.ts` are: the
 * shapes agree because the animals agree, and the separation is made where it
 * really is. Both are legless on the shared cube, both have NO DORSAL FIN and a
 * knuckled ridge instead, both wear `box-38` flat as a fluke and `blade-06` as
 * flippers. What differs:
 *
 *   - **THE TUSK.** `wedge-11`, the elephant's, on the midline, unspun — its own
 *     `z +1` attachment already points forward — and stretched 3.2x along its
 *     own length to 1.424 with its cross-section cut to 0.45. That is a large,
 *     deliberate, single-axis stretch and it is the strained thing on this
 *     animal; it is in the flag.
 *   - **THE COLOUR.** A narwhal is mottled slate over a pale belly where a
 *     beluga is white all through, and the mottling is two `plate-10` flank
 *     cards, which is the same trick `animal-nightjar.ts` established.
 *
 * **The tusk is straight, and a narwhal's is a left-handed SPIRAL.** There is no
 * curve or twist anywhere in the bank's 100 shapes — `collections/ocean.ts`
 * priced that for the seahorse and `collections/birds.ts` for the flamingo's
 * bill — so the spiral is unsayable and the straight spike is what a straight
 * bank can say. At tablet distance a narwhal's tusk reads as a straight spike
 * anyway, which is why this species is built rather than shelved.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/** `box-03`'s flat crown, +/-0.3125 in x and z. */
const CROWN_Y = 1.43125

/**
 * The tusk, 3.2x its own length and 0.45 of its own section. `wedge-11` is
 * 0.309 x 0.307 x 0.445 and attaches `z +1`; this takes it to
 * 0.139 x 0.138 x 1.424, which is a spike rather than the peg the elephant
 * wears. Single-axis on the long side, uniform on the cross-section.
 */
const TUSK_STRETCH: [number, number, number] = [0.45, 0.45, 3.2]

export const NARWHAL_ASSEMBLY = defineCreature('animal-narwhal', {
  palette: {
    coat: 0x9aa3ac,    // UNREVIEWED: slate, the mottled back
    belly: 0xe8ecef,   // UNREVIEWED: the pale underside and the sclera
    fin: 0x848d96,     // UNREVIEWED: flippers and fluke
    mark: 0x4b5259,    // UNREVIEWED: the mottle cards
    tusk: 0xf0e9da,    // UNREVIEWED: old ivory
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  hull: { part: 'box-03' },
  belly: 0.5,
  legs: false,

  eyes: { part: 'plate-06', x: 0.2625, y: 0.95 },

  /* Horizontal, like every other cetacean in the project. */
  tail: { part: 'box-38', paint: 'fin', spin: [{ axis: 'z', deg: 90 }], sink: 0.3 },

  extras: [
    /* THE TUSK. Unspun, because `wedge-11`'s own attachment is `z +1` and a
     * narwhal's tusk points straight ahead; the donor transfer joins it at this
     * hull's front face and sinks it the elephant's own share. Nothing about
     * its position is chosen — only its length. */
    {
      name: 'tusk',
      part: 'wedge-11',
      paint: 'tusk',
      stretch: TUSK_STRETCH,
      at: [0, 1.05, 0.625],
    },

    /* The same ridge the beluga has, at the same five stations, and for the
     * same reason: these two are the only whales with no dorsal fin. */
    { name: 'knuckle-1', part: 'cone-01', paint: 'coat', sink: 0.85, at: [0, CROWN_Y, -0.0625] },
    { name: 'knuckle-2', part: 'cone-01', paint: 'coat', sink: 0.85, at: [0, CROWN_Y, -0.1875] },
    { name: 'knuckle-3', part: 'cone-01', paint: 'coat', sink: 0.85, at: [0, CROWN_Y, -0.3125] },
    { name: 'knuckle-4', part: 'cone-01', paint: 'coat', sink: 0.85, at: [0, CROWN_Y, -0.4375] },
    { name: 'knuckle-5', part: 'cone-01', paint: 'coat', sink: 0.85, at: [0, CROWN_Y, -0.5625] },

    {
      name: 'flipper',
      part: 'blade-06',
      paint: 'fin',
      kind: 'pair',
      spin: [{ axis: 'z', deg: -90 }, { axis: 'y', deg: -30 }],
      sink: 0.6,
      at: [0.625, 0.52, 0.1875],
    },

    /* THE MOTTLE — `animal-nightjar.ts`'s own two cards, taken at their own
     * recorded flank stations by pure donor transfer. A narwhal's back is
     * blotched and this is the cheapest true thing that says so. */
    { name: 'mottle-fore', part: 'plate-11', paint: 'mark', kind: 'pair' },
    { name: 'mottle-aft', part: 'plate-10', paint: 'mark', kind: 'pair' },
  ],

  flag: 'THE TUSK IS STRETCHED 3.2x AND IT IS STRAIGHT, AND BOTH ARE STRAINS. wedge-11 is the '
    + 'elephant\'s tusk at 0.445 of reach — a peg — and a narwhal\'s tusk is half the length of '
    + 'the animal, so it is cut to 0.45 of its own cross-section and run out 3.2x along its own '
    + 'z. Rule 1 calls a stretch measured-safe for ears and snouts and asks you to think twice '
    + 'elsewhere; this is the largest stretch in the collection and is named rather than '
    + 'hidden. THE SPIRAL IS UNSAYABLE: a narwhal\'s tusk is a left-handed helix and there is '
    + 'no curve or twist among the bank\'s 100 shapes, which collections/ocean.ts priced for '
    + 'the seahorse and collections/birds.ts for the flamingo\'s bill. A straight spike is what '
    + 'a straight bank can say and at tablet distance it is most of the read. THIS ANIMAL AND '
    + 'animal-beluga ARE DELIBERATELY THE SAME BUILD TWICE, the way the mink and the stoat are: '
    + 'same cube, same absent dorsal, same knuckled ridge, same flat fluke, same flippers. The '
    + 'tusk and the mottling are the whole difference, because in life they are. NEW PALETTE, '
    + 'UNREVIEWED. It pays the legless height toll at 1.250 against the 1.43 floor, which '
    + 'reports rather than fails.',
})
