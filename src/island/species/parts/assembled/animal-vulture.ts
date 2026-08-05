/**
 * The vulture — the RUFF is real and the HOOK is a stand-in.
 *
 * >>> **PLACEHOLDER ON THE BILL.** A hooked beak is the one shape
 * >>> `docs/how-the-animals-are-made.md` §14 named as clearly absent and never
 * >>> retired: the bank's longest reaching bill is `cone-06`, the parrot's, at
 * >>> 0.1833, and it is a straight point. What makes it usable at all is a
 * >>> measurement `animal-canary.ts` took for the opposite reason — **its band
 * >>> 15 stands 0.041900 proud of its band 13, 14.6% of the shape's depth, and
 * >>> "that overhang is where a hook begins"**. That file refused `cone-06` for
 * >>> a hen because of it. This animal wants exactly it, so band 15 is painted
 * >>> dark and the overhang is doing the whole job. **What to try first by
 * >>> hand:** stretch it 1.6x on z and drop it 1/16, so the dark lip hangs over
 * >>> the pale base. It is a shallow hook and Joe should judge whether it reads.
 *
 * **THE RUFF IS `box-29`, THE LION'S MANE, AND IT IS THE BEST PART OF THIS
 * ANIMAL.** `z +1`, buried its own 1.000 — a collar that stands proud of the
 * body all round because the shape is bigger than the hull. Nothing in the
 * project had spent it. A vulture's neck ruff is literally called a ruff and it
 * is the same collar. It is cut to 0.88 / 0.88 / 0.50 and that number is a
 * builder invariant rather than a preference: see `RUFF_STRETCH`.
 *
 * The bald head is unsayable and that is the second gap: `Paint.patch` takes a
 * HEIGHT, `box-36` carries two bands and they are the panda's patches, and rule
 * 3 makes head and body one mass. The ruff is what separates them instead.
 */
import { defineCreature } from '../creature'
import { LEG_ROW } from '../hulls'
import { PACK_PUPIL } from '../texture'

/** `box-29`'s own recorded placement — the lion's mane, where the lion wore it. */
const RUFF_AT: [number, number, number] = [0, 0.906, 0.25]

/**
 * The mane cut DOWN, and the number is a builder invariant rather than a taste.
 *
 * `box-29` is 1.650 x 1.650 x 0.500 — the lion wears it on `box-31` and it is
 * enormous. `assembly-assert.ts`'s one-mass check requires the hull's bounding
 * volume to be at least 3x the next mesh's, and at full size this ring is 1.361
 * against this shell's 1.953, a ratio of 1.43: the ruff would BE a second mass,
 * which is the exact fault that scrapped 72 animals. At 0.88 / 0.88 / 0.50 it is
 * 0.527 and the ratio is 3.71. It still stands 0.101 clear of the hull all round
 * — the lion's own stands 0.200 — so it reads as a collar and not as a body.
 */
const RUFF_STRETCH: [number, number, number] = [0.88, 0.88, 0.5]

export const VULTURE_ASSEMBLY = defineCreature('animal-vulture', {
  palette: {
    coat: 0x4a4038,    // UNREVIEWED: dusty brown-black, the body plumage
    ruff: 0xe6dfcd,    // UNREVIEWED: the pale collar, and the sclera
    skin: 0xc99a86,    // UNREVIEWED: the bare head and neck, and the legs
    bill: 0xd8bc74,    // UNREVIEWED: the horn-coloured base of the bill
    hook: 0x3a2f26,    // UNREVIEWED: Kenney's own band 15 — the overhang, see the header
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* The panda's cube, painted one flat slot. Deliberately not `box-41`: the
   * ostrich takes the wider shell and being the SMALLER of this collection's two
   * birds is how these two stay apart at album scale. */
  hull: { part: 'box-36', paint: 'coat' },
  under: 'ruff',

  /* The pack's own round bird eye. */
  eyes: { part: 'plate-08', paint: 'skin' },

  /* THE BILL. cone-06 with Kenney's own upper band painted dark — see the
   * header for the 0.0419 of overhang that is standing in for a hook. */
  snout: { part: 'cone-06', paint: { base: 'bill', byBand: { 15: 'hook' } } },

  /* The parrot's fan: a perched vulture's tail is short, square and held flat. */
  tail: { part: 'box-38', paint: 'coat' },

  legs: false,
  extras: [
    /* TWO legs on the pack's own row, at `box-01`'s own recorded x. */
    {
      name: 'leg',
      part: 'box-01',
      paint: 'skin',
      kind: 'pair' as const,
      sink: LEG_ROW.sink,
      at: [0.25, LEG_ROW.y, 0] as [number, number, number],
    },

    /* THE RUFF. The lion's mane at the lion's own placement, unspent until now,
     * cut down to 0.88 / 0.88 / 0.50 — see RUFF_STRETCH, which is the one-mass
     * invariant and not a preference. */
    { name: 'ruff', part: 'box-29', paint: 'ruff', stretch: RUFF_STRETCH, at: RUFF_AT },

    /* THE REAL WING — the chick's and the parrot's, by pure donor transfer. It
     * carries the `wing` role, so the wingbeat attaches with nothing declared. */
    { name: 'wing', part: 'wedge-19', paint: 'coat', kind: 'pair' as const },
  ],

  flag: 'THE HOOKED BILL IS THE ONE THING THE PACK HAS NOT GOT and this is the nearest it '
    + 'comes. cone-06, the parrot\'s beak, is the bank\'s longest bill at 0.1833 of reach and '
    + 'it is a STRAIGHT point — but animal-canary.ts measured that its band 15 stands 0.041900 '
    + 'proud of its band 13, 14.6% of the shape\'s own depth, and called that "where a hook '
    + 'begins" while REFUSING the shape for a hen for exactly that reason. So the overhang is '
    + 'painted dark here and it is doing the whole job. WHAT TO TRY BY HAND: stretch it 1.6x '
    + 'on z and drop it a 16th so the dark lip hangs over the pale base. THE BALD HEAD IS ALSO '
    + 'ABSENT: Paint.patch takes a height with no z term, box-36\'s two bands are the panda\'s '
    + 'own patches, and rule 3 makes head and body one mass — so there is nothing to paint a '
    + 'bare head onto and the RUFF is what separates head from body instead. That ruff is '
    + 'box-29, the LION\'S MANE, 1.650 across a 1.250 shell at its own recorded placement, and '
    + 'nothing in the project had spent it. NEW PALETTE, UNREVIEWED.',
})
