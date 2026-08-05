/**
 * The hyena — the biggest ears in the bank, and the sloping back is unsayable.
 *
 * Two canids are already built — the FROZEN `animal-dog` and `animal-wolf` — and
 * the hyena has to not be either at a glance. Three things do it, and all three
 * are things a hyena genuinely has:
 *
 *   - **THE EARS ARE `box-25`**, the koala's dish, 0.743 across and the largest
 *     ear shape in the bank by a margin: the next is `box-06`'s 0.482. It stands
 *     0.346 clear on each side at its own burial. Nothing canid in the project
 *     wears an ear at all — the wolf has none — so this is the whole silhouette.
 *   - **THE SPOTS.** Three pairs of `plate-10` on the pack's own card shell,
 *     `animal-civet.ts`'s idiom.
 *   - **THE MANE.** One `bespoke-square-01` cut almost flat along the spine, half
 *     buried: `animal-donkey.ts`'s dorsal stripe at a different aspect. It is one
 *     of the three base shapes JT-041 sanctioned for everybody, so it needs no
 *     rule-1 flag, and one copy is 60 triangles where a row of cones would be
 *     four times that.
 *
 * **THE SLOPING BACK IS NOT HERE AND CANNOT BE.** A hyena's line drops from
 * shoulder to rump; a hull is never scaled and the leg row is one height for all
 * four, so there is no way to raise a front end. `box-12`, the widest shell, is
 * the nearest the bank gets to heavy forequarters and that is what it is doing.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/** The cube's crown, shared by `box-12`. */
const CROWN_Y = 1.43125
/** The pack's own card shell. */
const CARD_X = 0.635

/** Three stations on the flank, on the pack's 1/16 grid. */
const SPOT: readonly [number, number][] = [
  [1.0, 0.25], [0.875, 0], [1.0, -0.25],
]

export const HYENA_ASSEMBLY = defineCreature('animal-hyena', {
  palette: {
    coat: 0xb59a6c,    // UNREVIEWED: dull sandy buff
    mark: 0x453423,    // UNREVIEWED: the spots and the dorsal mane
    pale: 0xe8dcc2,    // UNREVIEWED: named for the sclera — there is no belly line
    limb: 0x8f7648,    // UNREVIEWED: the legs, a shade under the coat
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  hull: { part: 'box-12' },
  /* No belly line: a spotted hyena is one dull buff from throat to vent, and the
   * pale slot exists only so the sclera is not the coat. */
  under: 'pale',

  /* THE EARS, and they are the animal. */
  ears: { part: 'box-25', paint: { base: 'coat', byBand: { 13: 'mark' } } },

  /* Short and bushy: the parrot's fan is the only tail in the bank that is
   * wider than it is long, which is what a hyena's stub of a brush reads as. */
  tail: { part: 'box-38', paint: 'mark' },

  /* The giraffe's nose as a heavy blunt muzzle, and the polar bear's big black
   * nose on the end of it. */
  snout: { part: 'tube-07', paint: 'coat' },
  nose: { part: 'box-40', paint: 'mark' },

  extras: [
    ...SPOT.map(([y, z], i) => ({
      name: `spot-${i}`,
      part: 'plate-10',
      kind: 'pair' as const,
      paint: 'mark',
      at: [CARD_X, y, z] as [number, number, number],
    })),

    /* THE MANE. animal-donkey.ts's dorsal stripe, cut broader and shorter: 0.20
     * x 0.075 x 0.55, half buried, standing 0.047 proud along the spine. */
    {
      name: 'mane',
      part: 'bespoke-square-01',
      paint: 'mark',
      stretch: [0.16, 0.06, 0.45] as [number, number, number],
      at: [0, CROWN_Y, 0.05] as [number, number, number],
    },
  ],
})
