/**
 * The vaquita — the smallest whale in the world, and the one with a face.
 *
 * Seven cetaceans are built now (whale, dolphin, shark's neighbours, orca,
 * beluga, narwhal) and every one is a grey legless thing on a cube. A vaquita's
 * separation is not its shape at all, it is its **markings**, which is lucky,
 * because they are the one thing this bank can say exactly:
 *
 *   - **THE EYE IS THE PATCH.** `plate-14`, the panda's card and the biggest in
 *     the pack, painted charcoal instead of pale — so the dark ring round the
 *     eye and the eye itself are ONE card and cannot come apart. Fishermen call
 *     this animal the little sea cow with the panda's face; the panda's own eye
 *     card doing it is not a joke, it is the shortest true answer.
 *   - **DARK LIPS.** `plate-13` stretched 2.2x wide, the mouth line every
 *     cetaceans here wears, painted the same charcoal.
 *   - **NO BEAK.** `animal-dolphin.ts` says the beak is the one separation a
 *     five-year-old actually reads. A porpoise has no beak, so this animal has
 *     no `snout` at all, and that absence is the design.
 *
 * The dorsal is stretched 1.25x tall on purpose: a vaquita's is proportionally
 * the largest of any porpoise. It stops at 1.25x because `animal-orca.ts` found
 * the pack's height CEILING with the same shape.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/** `box-03`'s flat crown. */
const CROWN_Y = 1.43125

/**
 * The dorsal, taller than the shape's own and capped by the height ceiling.
 *
 * `wedge-19` spun `{ z, 90 }` reaches 0.572994 up. At 1.25x that is 0.7162, and
 * at its own 0.25 burial the tip lands at 1.43125 + 0.1791 + 0.3581 = 1.9685
 * against `PACK_HEIGHT_MAX` of 2.02. `animal-orca.ts` records the same
 * arithmetic for `box-06` at 2.026; this one is inside it, and 1.4x would not
 * be. That is why the number is 1.25 and not a rounder one.
 */
const DORSAL_TALL: [number, number, number] = [1.25, 1, 1]

export const VAQUITA_ASSEMBLY = defineCreature('animal-vaquita', {
  palette: {
    coat: 0x8f959c,    // UNREVIEWED: a soft grey, warmer than the dolphin's blue-grey
    belly: 0xf2f4f5,   // UNREVIEWED: the pale underside
    patch: 0x2b2f34,   // UNREVIEWED: the eye rings and the lips — the whole animal
    fin: 0x7b8188,     // UNREVIEWED: flippers, fluke and dorsal, a shade under the coat
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  hull: { part: 'box-03' },
  belly: 0.4375,
  legs: false,

  /* THE PANDA'S CARD, PAINTED DARK. The pupil still lands on Kenney's own band
   * 15, so the eye reads as a bead inside a black ring rather than as a blank
   * patch — which is what a vaquita's face is. */
  eyes: { part: 'plate-14', paint: 'patch' },

  /* Horizontal, like every other cetacean in the project: a mammal's fluke. */
  tail: { part: 'box-38', paint: 'fin', spin: [{ axis: 'z', deg: 90 }], sink: 0.3 },

  extras: [
    /* THE DORSAL, tall and set forward — see DORSAL_TALL for why 1.25 and not
     * more. Forward of the dolphin's -0.25 and the shark's -0.0625, because a
     * porpoise's fin stands over the shoulder. */
    {
      name: 'dorsal',
      part: 'wedge-19',
      paint: 'fin',
      stretch: DORSAL_TALL,
      spin: [{ axis: 'z', deg: 90 }],
      sink: 0.25,
      at: [0, CROWN_Y, 0.0625],
    },

    /* Short round flippers — the penguin's wing, which already is a flipper.
     * animal-beluga.ts's own placement, unchanged, because a small cetacean's
     * flipper does not want re-deriving per animal. */
    {
      name: 'flipper',
      part: 'blade-06',
      paint: 'fin',
      kind: 'pair',
      spin: [{ axis: 'z', deg: -90 }, { axis: 'y', deg: -30 }],
      sink: 0.6,
      at: [0.625, 0.52, 0.1875],
    },

    /* THE LIPS. Wider than the beluga's 1.8x smile and painted charcoal rather
     * than soft grey, because on this animal the mouth line is a marking. */
    { name: 'mouth', part: 'plate-13', paint: 'patch', stretch: [2.2, 1, 1], at: [0, 0.72, 0.635] },
  ],

  flag: 'THE MARKINGS ARE THE WHOLE ANIMAL AND ONE OF THEM IS DOING A SECOND JOB. plate-14 — '
    + 'the panda\'s eye card, the biggest in the pack — is painted CHARCOAL rather than pale, '
    + 'so the dark ring round a vaquita\'s eye and the eye inside it are one card and cannot '
    + 'come apart. If that reads as a blank black hole to you rather than as a ringed eye, the '
    + 'dial is the pupil: Kenney\'s own band 15 is the only thing lighter on it. THERE IS NO '
    + 'BEAK, DELIBERATELY: animal-dolphin.ts argues the beak is the one separation from a '
    + 'shark that a five-year-old reads, and a porpoise has not got one, so the absence is how '
    + 'this animal stays apart from the dolphin. THE DORSAL IS STRETCHED 1.25x AND THAT NUMBER '
    + 'IS A CEILING, NOT A TASTE — animal-orca.ts measured the pack\'s 2.02 height maximum with '
    + 'the same idiom and this lands at 1.9685; 1.4x goes over. THE NEAREST TWIN IS NOT THE '
    + 'DOLPHIN: animal-harbour-porpoise landed in a sibling collection while this was being '
    + 'built, on the same cube with the same fluke and the same flippers. The two separations '
    + 'are the EYE CARD — plate-14 painted charcoal here against a plain plate-06 there — and '
    + 'the DORSAL, wedge-19 stretched tall here against wedge-06 there. Put them side by side; '
    + 'if they still twin, the eye patch is the dial, because it is the only one of the two '
    + 'that reads from the front. NEW PALETTE, UNREVIEWED.',
})
