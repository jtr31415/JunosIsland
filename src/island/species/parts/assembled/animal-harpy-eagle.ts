/**
 * >>> **PLACEHOLDER. TWO THINGS ARE MISSING AND ONE OF THEM IS SIZE.**
 * >>>
 * >>> *Missing 1 — the SPLIT CREST.* A harpy eagle raises a double fan of grey
 * >>> feathers, in two halves with a parting. There are exactly two ways to say
 * >>> a crest here and both read as another animal. Two `cone-01` on the crown
 * >>> are `animal-owlet.ts`'s ear TUFTS, measured — that bird's own header says
 * >>> the tufts are what stop it being a round brown bird — so a harpy wearing
 * >>> them is an owl. One `box-38` upright is `animal-turkey.ts`'s move, and a
 * >>> second copy is geometrically impossible: `collections/birds.ts` measured
 * >>> the part at 0.625879 across the hull's 0.625000 flat plate, so there is no
 * >>> x at which a second fan has anything under it. **This file takes the
 * >>> single fan**, spun 30 degrees back off the crown at z = -0.100, standing
 * >>> to y 1.9742 — under `PACK_HEIGHT_MAX` 2.02 by 0.046. It reads as a crest.
 * >>> It does not read as a SPLIT crest. *What to try first by hand:* drop the
 * >>> fan's spin to 15 degrees and paint its band 3 dark, so the parting is a
 * >>> painted line rather than a shape.
 * >>>
 * >>> *Missing 2 — SIZE, and this one is a ruling rather than a commission.* The
 * >>> harpy is the most massive eagle alive, roughly twice a golden eagle. The
 * >>> hull is never scaled (`HullDef.stretch` is `never`, Joe's own instruction,
 * >>> given twice), so the whole size vocabulary is the ten real shells, and
 * >>> across them the volume runs 1.7578 (`box-31`) to 2.4054 (`box-12`) — a
 * >>> **1.37x spread against a life ratio near 2x**, and `box-41`, the only
 * >>> bigger one, buries the eye card (its front face is z 0.725 against
 * >>> `EYE_CARD_Z` 0.6350). So this bird wears `box-12`, the widest shell there
 * >>> is, and it is 1.37x a sparrowhawk when it should be twenty.
 */
import { defineCreature } from '../creature'
import { LEG_ROW } from '../hulls'
import { PACK_PUPIL } from '../texture'

const TALON_Z = 0.1875
const TALON_Y = 0.15345
/** `box-12`'s own flat crown, and the fan's station back from the brow. */
const CROWN_Y = 1.43125
const CREST_Z = -0.1

export const HARPY_EAGLE_ASSEMBLY = defineCreature('animal-harpy-eagle', {
  palette: {
    coat: 0x6d7076,    // UNREVIEWED: slate grey — the back and the crest
    belly: 0xece9e2,   // UNREVIEWED: the white underside, up to 10/16
    flight: 0x3d4147,  // UNREVIEWED: near-black wings and tail
    limb: 0xd9d3c4,    // UNREVIEWED: the pale grey foot and the enormous talon
    bill: 0x2f3237,    // UNREVIEWED: black
    hook: 0x18191c,    // UNREVIEWED: blacker
    eye: 0x8d6f3f,     // UNREVIEWED: dark amber
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* The cow's shell — 1.5395 across, the WIDEST in the bank, and the whole of
   * what this pack can do about a very large bird. See the header. */
  hull: { part: 'box-12' },
  belly: 0.625,

  /* The panda's card, the biggest in the bank, because a harpy's face is its
   * other half — and it separates this eagle from the two on `box-21`. */
  eyes: { part: 'plate-14', paint: 'eye' },
  snout: { part: 'cone-06', paint: 'bill' },
  tail: { part: 'box-38', paint: 'flight' },

  legs: false,
  extras: [
    /* Legs at 0.31, which is 0.27 scaled by this shell's own extra width. */
    { name: 'leg', part: 'box-01', paint: 'limb', kind: 'pair' as const, sink: LEG_ROW.sink, at: [0.31, LEG_ROW.y, 0] },
    { name: 'hook', part: 'box-24', paint: 'hook', on: 'snout', spin: [{ axis: 'x' as const, deg: 55 }] },
    { name: 'talon', part: 'wedge-11', paint: 'limb', kind: 'pair' as const, at: [0.31, TALON_Y, TALON_Z], axis: 'z' as const, dir: 1 },
    /* Sunk 0.4 rather than the donor's 0.175: a harpy is short-winged for its
     * bulk — it flies inside a forest — so the widest hull takes the shortest
     * wing and the bird still measures 2.2270 across, the widest here. */
    { name: 'wing', part: 'wedge-19', paint: 'flight', kind: 'pair' as const, sink: 0.4 },
    /* THE STAND-IN CREST. One fan, not two. See the header. */
    { name: 'crest', part: 'box-38', paint: 'coat', spin: [{ axis: 'x' as const, deg: 30 }], at: [0, CROWN_Y, CREST_Z] },
  ],

  flag: 'PLACEHOLDER — THE SPLIT CREST AND THE SIZE. A harpy raises a DOUBLE fan with a '
    + 'parting, and the bank has two ways to say crest, both of which read as another animal: '
    + 'two cone-01 are animal-owlet.ts\'s ear tufts, and one box-38 is animal-turkey.ts\'s fan. '
    + 'A SECOND box-38 is geometrically impossible — collections/birds.ts measured it at '
    + '0.625879 across a 0.625000 plate, so nothing is under it. This file takes the single '
    + 'fan, spun 30 degrees back, standing to 1.9742 against the pack\'s 2.02 ceiling. TRY '
    + 'FIRST: 15 degrees of spin and band 3 painted dark, so the parting is paint. THE SIZE IS '
    + 'A RULING, NOT A COMMISSION: the hull is never scaled, so the whole size vocabulary is '
    + 'the ten real shells, volume 1.7578 to 2.4054 — 1.37x, and box-41 (the only bigger one) '
    + 'buries the eye card at front face 0.725 against EYE_CARD_Z 0.6350. This is the widest '
    + 'shell in the bank and it is still only 1.37x a sparrowhawk. NEW PALETTE, UNREVIEWED.',
})
