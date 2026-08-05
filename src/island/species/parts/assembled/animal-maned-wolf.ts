/**
 * PLACEHOLDER, NOT A FINISHED ANIMAL — put in so you can do it by hand. What is
 * missing is THE LEG, and it is the whole animal: a maned wolf is a fox on
 * stilts, roughly half its standing height being leg. The bank holds ONE leg
 * shape, `box-01`, 0.30625 tall, at ONE absolute row height of 0.18125, because
 * that is what puts feet on y = 0 — and `animal-llama.ts` measured that the row
 * cannot be LOWERED either: `LEG_ROW.sink` buries the leg exactly 0.125000,
 * which is rule 3's nothing-floats floor to six decimals with no slack at all,
 * so one 1/16 step down leaves half the floor and one 1/32 step leaves 0.09375.
 * There is no dial. What stands in is the pack's own row, unchanged, and
 * everything else about the animal built properly. WHAT TO TRY FIRST: this is
 * the same commission `animal-kangaroo.ts` and `animal-ostrich.ts` priced as a
 * LONG HIND LEG — a long leg would finish those two, this one, the quokka, the
 * emu, and Birds' heron, stork and flamingo, which is eight animals for one
 * shape.
 *
 * Everything else here is real. The MANE is `bespoke-square-01` — one of
 * JT-041's three sanctioned base solids, so no rule 1 flag — cut tall and thin
 * along the spine, which is `animal-hyena.ts`'s dorsal bar stood up: a maned
 * wolf's is erectile black hair and standing it up is the only difference. The
 * ears are the bank's tallest, `box-06`; the tail is `animal-stoat.ts`'s whip
 * with its end band painted the other way round — WHITE tip, not black.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/** The flat crown of the 1.250 cube, and `HEIGHT_FLOOR`. */
const CROWN_Y = 1.43125

export const MANED_WOLF_ASSEMBLY = defineCreature('animal-maned-wolf', {
  palette: {
    coat: 0xc06a2e,    // UNREVIEWED: the foxy red-orange, and it paints the HULL only
    belly: 0xf0dfc4,   // UNREVIEWED: the pale throat bib and the underside, and the sclera
    /* The coat's own red under a second name. `animal-stoat.ts` found the fault
     * it exists for: a `patch` is a property of the SLOT, not of the part that
     * declared it, so every part painted `coat` would read the belly split this
     * species sets and nobody could see it in the numbers. The muzzle and the
     * tail take a slot of their own instead. */
    fur: 0xc06a2e,     // UNREVIEWED: the same red — the muzzle and the tail
    mark: 0x241d18,    // UNREVIEWED: the mane, the ears and the nose
    pale: 0xf4efe4,    // UNREVIEWED: the white tail tip
    limb: 0x241d18,    // UNREVIEWED: the legs. Black to well above the hock, entire
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* The plain cube. NOT `box-21`: `animal-wolf.ts` measured that shell as the
   * standard cube with TWO EARS FUSED ON, and this animal's ears are the point
   * of it, so a pair added there would be four. */
  hull: { part: 'box-03' },
  /* 5/16, low — a maned wolf's pale is a throat bib and a belly, not a flank. */
  belly: 0.3125,

  /* THE BANK'S TALLEST EAR, 0.913 of reach, unstretched and painted dark on the
   * back. It is the hare's own ear and the kangaroo's, which is stated rather
   * than hidden: those two are the only other species tall-eared enough to want
   * it, and neither is a red canid. */
  ears: { part: 'box-06', paint: 'mark' },

  /* The deer's nose, the longest plain tube in the bank at 0.532 of reach. */
  snout: { part: 'tube-03', paint: 'fur' },
  nose: { part: 'box-09', paint: 'mark' },

  /* `animal-stoat.ts`'s whip, INVERTED. Band 3 is Kenney's own cut on the third
   * of the tail furthest from the join, so the tip is paint rather than a second
   * part and cannot come adrift — and where the stoat paints it black, a maned
   * wolf's is white. */
  tail: { part: 'wedge-18', paint: { base: 'fur', byBand: { 3: 'pale' } } },

  extras: [
    /* THE MANE. `animal-hyena.ts` wears the same bar flat along the spine as a
     * dorsal stripe, 0.06 tall; this one is 0.18, which stands 0.135 clear of the
     * crown and reads as raised hair from the side. */
    {
      name: 'mane',
      part: 'bespoke-square-01',
      paint: 'mark',
      stretch: [0.14, 0.18, 0.52],
      at: [0, CROWN_Y, 0.0],
    },
  ],

  motion: [{ kind: 'twitch', parts: ['ear'] }],

  flag: 'PLACEHOLDER, NOT A FINISHED ANIMAL — put in so you can do it by hand, and what is '
    + 'missing is THE LEG. A maned wolf is a fox on stilts and about half its standing height '
    + 'is leg; the bank holds ONE leg shape, box-01, 0.30625 tall, on ONE absolute row at '
    + 'y = 0.18125, because that is what puts feet on zero. animal-llama.ts measured that the '
    + 'row cannot be lowered to fake it either: LEG_ROW.sink buries the leg exactly 0.125000, '
    + 'which is rule 3\'s nothing-floats floor to six decimals with no slack, so one 1/16 step '
    + 'down leaves 0.0625 inside the body and even 1/32 leaves 0.09375. Legginess also cannot '
    + 'come from a smaller body, because the hull is never scaled and all ten shells are '
    + 'within 0.29 of each other. So this animal stands on the same legs as a badger and there '
    + 'is no dial. WHAT TO TRY FIRST: a LONG LEG is the commission, and it is the one '
    + 'animal-kangaroo.ts and animal-ostrich.ts already priced as a long HIND leg — one shape '
    + 'would finish those two, this animal, the quokka, the emu, and Birds\' heron, stork and '
    + 'flamingo. EVERYTHING ELSE IS REAL: the bank\'s tallest ear (box-06, shared with the '
    + 'hare and the kangaroo and stated rather than hidden), the deer\'s long muzzle, black '
    + 'legs painted entire rather than JT-044\'s patch because a maned wolf\'s are dark to '
    + 'above the hock, animal-stoat.ts\'s whip with band 3 painted WHITE instead of black, and '
    + 'an erect MANE — animal-hyena.ts\'s dorsal bar stood up from 0.06 tall to 0.18, which is '
    + 'the only difference between a stripe and erectile hair. NEW PALETTE, UNREVIEWED.',
})
